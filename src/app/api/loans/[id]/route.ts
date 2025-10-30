import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { LoanStatus } from '@prisma/client'

const UpdateLoanSchema = z.object({
  amount: z.number().positive('Amount must be positive').optional(),
  interestRate: z.number().min(0, 'Interest rate cannot be negative').optional(),
  dueDate: z.string().transform((str) => new Date(str)).optional(),
  status: z.nativeEnum(LoanStatus).optional(),
  notes: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const loan = await prisma.loan.findUnique({
      where: { id: params.id },
      include: {
        borrower: true,
        payments: {
          orderBy: { paidAt: 'desc' },
        },
      },
    })

    if (!loan) {
      return NextResponse.json(
        { error: 'Loan not found' },
        { status: 404 }
      )
    }

    // Calculate loan details
    const totalPaid = loan.payments.reduce((sum, payment) => sum + payment.amount, 0)
    const interestAmount = loan.amount * (loan.interestRate || 0) / 100
    const totalOwed = loan.amount + interestAmount
    const balance = totalOwed - totalPaid
    const isOverdue = new Date() > loan.dueDate && loan.status === LoanStatus.ACTIVE

    return NextResponse.json({
      ...loan,
      totalPaid,
      interestAmount,
      totalOwed,
      balance,
      isOverdue,
    })
  } catch (error) {
    console.error('Error fetching loan:', error)
    return NextResponse.json(
      { error: 'Failed to fetch loan' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = UpdateLoanSchema.parse(body)

    const loan = await prisma.loan.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        borrower: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        payments: {
          orderBy: { paidAt: 'desc' },
        },
      },
    })

    // Create audit log for status changes
    if (validatedData.status) {
      await prisma.auditLog.create({
        data: {
          action: 'LOAN_STATUS_UPDATED',
          payload: JSON.stringify({
            loanId: loan.id,
            newStatus: validatedData.status,
          }),
        },
      })
    }

    return NextResponse.json(loan)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating loan:', error)
    return NextResponse.json(
      { error: 'Failed to update loan' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if loan has payments
    const paymentCount = await prisma.payment.count({
      where: { loanId: params.id },
    })

    if (paymentCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete loan with existing payments' },
        { status: 400 }
      )
    }

    await prisma.loan.delete({
      where: { id: params.id },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'LOAN_DELETED',
        payload: JSON.stringify({ loanId: params.id }),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting loan:', error)
    return NextResponse.json(
      { error: 'Failed to delete loan' },
      { status: 500 }
    )
  }
}