import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const CreatePaymentSchema = z.object({
  loanId: z.string().min(1, 'Loan ID is required'),
  amount: z.number().positive('Amount must be positive'),
  paidAt: z.string().transform((str) => new Date(str)).optional(),
  notes: z.string().optional(),
  method: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const loanId = searchParams.get('loanId')

    const skip = (page - 1) * limit

    const where = loanId ? { loanId } : {}

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        include: {
          loan: {
            include: {
              borrower: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { paidAt: 'desc' },
      }),
      prisma.payment.count({ where }),
    ])

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CreatePaymentSchema.parse(body)

    // Verify loan exists and is active
    const loan = await prisma.loan.findUnique({
      where: { id: validatedData.loanId },
      include: {
        payments: true,
      },
    })

    if (!loan) {
      return NextResponse.json(
        { error: 'Loan not found' },
        { status: 404 }
      )
    }

    if (loan.status === 'PAID') {
      return NextResponse.json(
        { error: 'Cannot add payment to a paid loan' },
        { status: 400 }
      )
    }

    // Calculate current balance
    const totalPaid = loan.payments.reduce((sum, payment) => sum + payment.amount, 0)
    const interestAmount = loan.amount * (loan.interestRate || 0) / 100
    const totalOwed = loan.amount + interestAmount
    const currentBalance = totalOwed - totalPaid

    if (validatedData.amount > currentBalance) {
      return NextResponse.json(
        { error: 'Payment amount exceeds remaining balance' },
        { status: 400 }
      )
    }

    const payment = await prisma.payment.create({
      data: {
        ...validatedData,
        paidAt: validatedData.paidAt || new Date(),
      },
      include: {
        loan: {
          include: {
            borrower: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    // Check if loan is now fully paid
    const newTotalPaid = totalPaid + validatedData.amount
    if (newTotalPaid >= totalOwed) {
      await prisma.loan.update({
        where: { id: validatedData.loanId },
        data: { status: 'PAID' },
      })
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'PAYMENT_RECEIVED',
        payload: JSON.stringify({
          paymentId: payment.id,
          loanId: payment.loanId,
          amount: payment.amount,
        }),
      },
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}