import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { LoanApplicationStatus } from '@prisma/client'
import { z } from 'zod'
import { sendApplicationReceivedEmail } from '@/lib/email'

const LoanApplicationSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  address: z.string().min(1, 'Address is required'),
  employmentStatus: z.string().min(1, 'Employment status is required'),
  monthlyIncome: z.number().positive('Monthly income must be positive'),
  loanAmount: z.number().positive('Loan amount must be positive'),
  loanPurpose: z.string().min(10, 'Please provide more details about loan purpose'),
  documents: z.array(z.string()).optional(),
})

// GET /api/loan-applications - List all applications (with filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where = status ? { status: status as LoanApplicationStatus } : {}

    const [applications, total] = await Promise.all([
      prisma.loanApplication.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.loanApplication.count({ where }),
    ])

    return NextResponse.json({
      applications,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    })
  } catch (error) {
    console.error('Error fetching loan applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch loan applications' },
      { status: 500 }
    )
  }
}

// POST /api/loan-applications - Create new application
export async function POST(request: NextRequest) {
  try {
    console.log('=== Loan Application POST Request Started ===')

    const body = await request.json()
    console.log('Request body received:', JSON.stringify(body, null, 2))

    const validatedData = LoanApplicationSchema.parse(body)
    console.log('Data validated successfully')

    console.log('Creating loan application in database...')
    const application = await prisma.loanApplication.create({
      data: {
        fullName: validatedData.fullName,
        email: validatedData.email,
        phone: validatedData.phone,
        address: validatedData.address,
        employmentStatus: validatedData.employmentStatus,
        monthlyIncome: validatedData.monthlyIncome,
        loanAmount: validatedData.loanAmount,
        loanPurpose: validatedData.loanPurpose,
        documents: validatedData.documents ? JSON.stringify(validatedData.documents) : null,
        status: 'SUBMITTED',
      },
    })
    console.log('Application created with ID:', application.id)

    // Log the application creation
    console.log('Creating audit log...')
    await prisma.auditLog.create({
      data: {
        action: 'LOAN_APPLICATION_SUBMITTED',
        payload: JSON.stringify({
          applicationId: application.id,
          fullName: application.fullName,
          loanAmount: application.loanAmount,
        }),
      },
    })
    console.log('Audit log created')

    // Send confirmation email (async, don't block response)
    console.log('Sending confirmation email...')
    sendApplicationReceivedEmail(
      application.email,
      application.fullName,
      application.loanAmount
    ).catch((err) => console.error('Failed to send confirmation email:', err))

    console.log('=== Loan Application POST Request Completed Successfully ===')
    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    console.error('=== Loan Application POST Request Failed ===')
    console.error('Error type:', error?.constructor?.name)
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    console.error('Full error:', error)

    if (error instanceof z.ZodError) {
      console.error('Validation errors:', JSON.stringify(error.issues, null, 2))
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create loan application', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
