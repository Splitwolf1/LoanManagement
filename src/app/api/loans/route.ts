import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { LoanStatus } from '@prisma/client'

const CreateLoanSchema = z.object({
  borrowerId: z.string().min(1, 'Borrower ID is required'),
  amount: z.number().positive('Amount must be positive'),
  interestRate: z.number().min(0, 'Interest rate cannot be negative').optional(),
  issuedAt: z.string().transform((str) => new Date(str)),
  dueDate: z.string().transform((str) => new Date(str)),
  notes: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') as LoanStatus | null
    const borrowerId = searchParams.get('borrowerId')

    const skip = (page - 1) * limit

    const where: any = {}
    if (status) where.status = status
    if (borrowerId) where.borrowerId = borrowerId

    const [loans, total] = await Promise.all([
      prisma.loan.findMany({
        where,
        skip,
        take: limit,
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
            select: {
              id: true,
              amount: true,
              paidAt: true,
              method: true,
            },
            orderBy: { paidAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.loan.count({ where }),
    ])

    // Calculate loan balances
    const loansWithBalance = loans.map((loan) => {
      const totalPaid = loan.payments.reduce((sum, payment) => sum + payment.amount, 0)
      const interestAmount = loan.amount * (loan.interestRate || 0) / 100
      const totalOwed = loan.amount + interestAmount
      const balance = totalOwed - totalPaid

      return {
        ...loan,
        totalPaid,
        interestAmount,
        totalOwed,
        balance,
        isOverdue: new Date() > loan.dueDate && loan.status === LoanStatus.ACTIVE,
      }
    })

    return NextResponse.json({
      loans: loansWithBalance,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching loans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch loans' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CreateLoanSchema.parse(body)

    // Verify borrower exists
    const borrower = await prisma.borrower.findUnique({
      where: { id: validatedData.borrowerId },
    })

    if (!borrower) {
      return NextResponse.json(
        { error: 'Borrower not found' },
        { status: 404 }
      )
    }

    const loan = await prisma.loan.create({
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
        payments: true,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'LOAN_CREATED',
        payload: JSON.stringify({
          loanId: loan.id,
          borrowerId: loan.borrowerId,
          amount: loan.amount,
        }),
      },
    })

    return NextResponse.json(loan, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating loan:', error)
    return NextResponse.json(
      { error: 'Failed to create loan' },
      { status: 500 }
    )
  }
}