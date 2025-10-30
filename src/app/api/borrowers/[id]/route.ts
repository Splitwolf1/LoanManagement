import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const UpdateBorrowerSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const borrower = await prisma.borrower.findUnique({
      where: { id: params.id },
      include: {
        loans: {
          include: {
            payments: {
              select: {
                id: true,
                amount: true,
                paidAt: true,
                notes: true,
                method: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!borrower) {
      return NextResponse.json(
        { error: 'Borrower not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(borrower)
  } catch (error) {
    console.error('Error fetching borrower:', error)
    return NextResponse.json(
      { error: 'Failed to fetch borrower' },
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
    const validatedData = UpdateBorrowerSchema.parse(body)

    const borrower = await prisma.borrower.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        loans: {
          select: {
            id: true,
            amount: true,
            status: true,
            issuedAt: true,
            dueDate: true,
          },
        },
      },
    })

    return NextResponse.json(borrower)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating borrower:', error)
    return NextResponse.json(
      { error: 'Failed to update borrower' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if borrower has active loans
    const activeLoanCount = await prisma.loan.count({
      where: {
        borrowerId: params.id,
        status: { not: 'PAID' },
      },
    })

    if (activeLoanCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete borrower with active loans' },
        { status: 400 }
      )
    }

    await prisma.borrower.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting borrower:', error)
    return NextResponse.json(
      { error: 'Failed to delete borrower' },
      { status: 500 }
    )
  }
}