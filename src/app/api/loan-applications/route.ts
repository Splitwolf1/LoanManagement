import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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

    const where = status ? { status } : {}

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
    const body = await request.json()
    const validatedData = LoanApplicationSchema.parse(body)

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

    // Log the application creation
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

    // Send confirmation email (async, don't block response)
    sendApplicationReceivedEmail(
      application.email,
      application.fullName,
      application.loanAmount
    ).catch((err) => console.error('Failed to send confirmation email:', err))

    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating loan application:', error)
    return NextResponse.json(
      { error: 'Failed to create loan application' },
      { status: 500 }
    )
  }
}
