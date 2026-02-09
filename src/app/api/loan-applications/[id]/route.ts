import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { sendApplicationApprovedEmail, sendApplicationRejectedEmail } from '@/lib/email'

const UnderReviewSchema = z.object({
  action: z.literal('start_review'),
  reviewedBy: z.string().min(1, 'Reviewer name is required'),
  reviewNotes: z.string().optional(),
})

const ConditionalApprovalSchema = z.object({
  action: z.literal('conditional_approve'),
  reviewedBy: z.string().min(1, 'Reviewer name is required'),
  conditionalApprovalNotes: z.string().min(1, 'Please specify conditions'),
  requiredDocuments: z.array(z.string()).min(1, 'At least one document is required'),
})

const RejectSchema = z.object({
  action: z.literal('reject'),
  reviewedBy: z.string().min(1, 'Reviewer name is required'),
  reviewNotes: z.string().min(1, 'Please provide rejection reason'),
})

const SignDocumentsSchema = z.object({
  action: z.literal('sign_documents'),
  signedDocuments: z.array(z.string()).min(1, 'At least one document must be signed'),
})

const FinalApprovalSchema = z.object({
  action: z.literal('final_approve'),
  finalApprovedBy: z.string().min(1, 'Approver name is required'),
})

const DisburseSchema = z.object({
  action: z.literal('disburse'),
  disbursedBy: z.string().min(1, 'Disbursement officer name is required'),
  disbursementAmount: z.number().positive('Disbursement amount must be positive'),
  disbursementMethod: z.string().min(1, 'Disbursement method is required'),
  disbursementReference: z.string().optional(),
})

const ActionSchema = z.discriminatedUnion('action', [
  UnderReviewSchema,
  ConditionalApprovalSchema,
  RejectSchema,
  SignDocumentsSchema,
  FinalApprovalSchema,
  DisburseSchema,
])

// GET /api/loan-applications/[id] - Get single application
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const application = await prisma.loanApplication.findUnique({
      where: { id: params.id },
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error('Error fetching loan application:', error)
    return NextResponse.json(
      { error: 'Failed to fetch loan application' },
      { status: 500 }
    )
  }
}

// PATCH /api/loan-applications/[id] - Update application status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = ActionSchema.parse(body)

    const application = await prisma.loanApplication.findUnique({
      where: { id: params.id },
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    let updatedApplication

    switch (validatedData.action) {
      case 'start_review':
        if (application.status !== 'SUBMITTED') {
          return NextResponse.json(
            { error: 'Application must be in SUBMITTED status' },
            { status: 400 }
          )
        }
        updatedApplication = await prisma.loanApplication.update({
          where: { id: params.id },
          data: {
            status: 'UNDER_REVIEW',
            reviewedBy: validatedData.reviewedBy,
            reviewedAt: new Date(),
            reviewNotes: validatedData.reviewNotes,
          },
        })
        await prisma.auditLog.create({
          data: {
            action: 'LOAN_APPLICATION_UNDER_REVIEW',
            actorId: validatedData.reviewedBy,
            payload: JSON.stringify({ applicationId: params.id }),
          },
        })
        break

      case 'conditional_approve':
        if (application.status !== 'UNDER_REVIEW') {
          return NextResponse.json(
            { error: 'Application must be under review' },
            { status: 400 }
          )
        }
        updatedApplication = await prisma.loanApplication.update({
          where: { id: params.id },
          data: {
            status: 'CONDITIONALLY_APPROVED',
            reviewedBy: validatedData.reviewedBy,
            reviewedAt: new Date(),
            conditionalApprovalNotes: validatedData.conditionalApprovalNotes,
            requiredDocuments: JSON.stringify(validatedData.requiredDocuments),
          },
        })
        await prisma.auditLog.create({
          data: {
            action: 'LOAN_APPLICATION_CONDITIONALLY_APPROVED',
            actorId: validatedData.reviewedBy,
            payload: JSON.stringify({
              applicationId: params.id,
              requiredDocuments: validatedData.requiredDocuments,
            }),
          },
        })

        // Send conditional approval email
        sendApplicationApprovedEmail(
          application.email,
          application.fullName,
          application.loanAmount,
          validatedData.conditionalApprovalNotes
        ).catch((err) => console.error('Failed to send conditional approval email:', err))
        break

      case 'reject':
        if (!['SUBMITTED', 'UNDER_REVIEW', 'CONDITIONALLY_APPROVED', 'DOCUMENTS_SIGNED'].includes(application.status)) {
          return NextResponse.json(
            { error: 'Cannot reject application in current status' },
            { status: 400 }
          )
        }
        updatedApplication = await prisma.loanApplication.update({
          where: { id: params.id },
          data: {
            status: 'REJECTED',
            reviewedBy: validatedData.reviewedBy,
            reviewedAt: new Date(),
            reviewNotes: validatedData.reviewNotes,
          },
        })
        await prisma.auditLog.create({
          data: {
            action: 'LOAN_APPLICATION_REJECTED',
            actorId: validatedData.reviewedBy,
            payload: JSON.stringify({
              applicationId: params.id,
              reason: validatedData.reviewNotes,
            }),
          },
        })

        // Send rejection email
        sendApplicationRejectedEmail(
          application.email,
          application.fullName,
          validatedData.reviewNotes
        ).catch((err) => console.error('Failed to send rejection email:', err))
        break

      case 'sign_documents':
        if (application.status !== 'CONDITIONALLY_APPROVED') {
          return NextResponse.json(
            { error: 'Application must be conditionally approved' },
            { status: 400 }
          )
        }
        updatedApplication = await prisma.loanApplication.update({
          where: { id: params.id },
          data: {
            status: 'DOCUMENTS_SIGNED',
            signedDocuments: JSON.stringify(validatedData.signedDocuments),
            documentsSignedAt: new Date(),
          },
        })
        await prisma.auditLog.create({
          data: {
            action: 'LOAN_APPLICATION_DOCUMENTS_SIGNED',
            payload: JSON.stringify({
              applicationId: params.id,
              documents: validatedData.signedDocuments,
            }),
          },
        })
        break

      case 'final_approve':
        if (application.status !== 'DOCUMENTS_SIGNED') {
          return NextResponse.json(
            { error: 'Documents must be signed before final approval' },
            { status: 400 }
          )
        }

        // Create or find borrower
        let borrower = await prisma.borrower.findFirst({
          where: { email: application.email },
        })

        if (!borrower) {
          borrower = await prisma.borrower.create({
            data: {
              name: application.fullName,
              email: application.email,
              phone: application.phone,
              address: application.address,
              notes: `Employment: ${application.employmentStatus}, Monthly Income: $${application.monthlyIncome}`,
            },
          })
        }

        // Create loan
        const dueDate = new Date()
        dueDate.setMonth(dueDate.getMonth() + 12)

        const loan = await prisma.loan.create({
          data: {
            borrowerId: borrower.id,
            amount: application.loanAmount,
            interestRate: 0,
            issuedAt: new Date(),
            dueDate,
            status: 'ACTIVE',
            notes: application.loanPurpose,
          },
        })

        updatedApplication = await prisma.loanApplication.update({
          where: { id: params.id },
          data: {
            status: 'APPROVED',
            finalApprovedBy: validatedData.finalApprovedBy,
            finalApprovedAt: new Date(),
            loanId: loan.id,
          },
        })

        await prisma.auditLog.create({
          data: {
            action: 'LOAN_APPLICATION_FINAL_APPROVED',
            actorId: validatedData.finalApprovedBy,
            payload: JSON.stringify({
              applicationId: params.id,
              loanId: loan.id,
              borrowerId: borrower.id,
            }),
          },
        })

        // Send final approval email
        sendApplicationApprovedEmail(
          application.email,
          application.fullName,
          application.loanAmount
        ).catch((err) => console.error('Failed to send approval email:', err))
        break

      case 'disburse':
        if (application.status !== 'APPROVED') {
          return NextResponse.json(
            { error: 'Application must be approved before disbursement' },
            { status: 400 }
          )
        }

        updatedApplication = await prisma.loanApplication.update({
          where: { id: params.id },
          data: {
            status: 'DISBURSED',
            disbursedBy: validatedData.disbursedBy,
            disbursedAt: new Date(),
            disbursementAmount: validatedData.disbursementAmount,
            disbursementMethod: validatedData.disbursementMethod,
            disbursementReference: validatedData.disbursementReference,
          },
        })

        await prisma.auditLog.create({
          data: {
            action: 'LOAN_APPLICATION_DISBURSED',
            actorId: validatedData.disbursedBy,
            payload: JSON.stringify({
              applicationId: params.id,
              amount: validatedData.disbursementAmount,
              method: validatedData.disbursementMethod,
              reference: validatedData.disbursementReference,
            }),
          },
        })
        break
    }

    return NextResponse.json(updatedApplication)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating loan application:', error)
    return NextResponse.json(
      { error: 'Failed to update loan application' },
      { status: 500 }
    )
  }
}
