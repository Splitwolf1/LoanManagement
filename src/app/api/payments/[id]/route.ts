import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const UpdatePaymentSchema = z.object({
  amount: z.number().positive('Amount must be positive').optional(),
  paidAt: z.string().transform((str) => new Date(str)).optional(),
  notes: z.string().optional(),
  method: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: id },
      include: {
        loan: {
          include: {
            borrower: true,
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(payment)
  } catch (error) {
    console.error('Error fetching payment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json()
    const validatedData = UpdatePaymentSchema.parse(body)

    // Get current payment to check loan status
    const currentPayment = await prisma.payment.findUnique({
      where: { id: id },
      include: {
        loan: {
          include: {
            payments: true,
          },
        },
      },
    })

    if (!currentPayment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // If amount is being changed, recalculate loan status
    if (validatedData.amount && validatedData.amount !== currentPayment.amount) {
      const otherPayments = currentPayment.loan.payments.filter(p => p.id !== id)
      const otherPaymentsTotal = otherPayments.reduce((sum, p) => sum + p.amount, 0)
      const newTotalPaid = otherPaymentsTotal + validatedData.amount
      
      const interestAmount = currentPayment.loan.amount * (currentPayment.loan.interestRate || 0) / 100
      const totalOwed = currentPayment.loan.amount + interestAmount

      if (newTotalPaid > totalOwed) {
        return NextResponse.json(
          { error: 'Updated payment amount would exceed total owed' },
          { status: 400 }
        )
      }

      // Update loan status if needed
      const shouldBePaid = newTotalPaid >= totalOwed
      if (shouldBePaid !== (currentPayment.loan.status === 'PAID')) {
        await prisma.loan.update({
          where: { id: currentPayment.loanId },
          data: { status: shouldBePaid ? 'PAID' : 'ACTIVE' },
        })
      }
    }

    const payment = await prisma.payment.update({
      where: { id: id },
      data: validatedData,
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

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'PAYMENT_UPDATED',
        payload: JSON.stringify({
          paymentId: payment.id,
          loanId: payment.loanId,
          changes: validatedData,
        }),
      },
    })

    return NextResponse.json(payment)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating payment:', error)
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Get payment details before deletion
    const payment = await prisma.payment.findUnique({
      where: { id: id },
      include: {
        loan: {
          include: {
            payments: true,
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Delete the payment
    await prisma.payment.delete({
      where: { id: id },
    })

    // Recalculate loan status
    const remainingPayments = payment.loan.payments.filter(p => p.id !== id)
    const totalPaid = remainingPayments.reduce((sum, p) => sum + p.amount, 0)
    const interestAmount = payment.loan.amount * (payment.loan.interestRate || 0) / 100
    const totalOwed = payment.loan.amount + interestAmount

    const shouldBePaid = totalPaid >= totalOwed
    await prisma.loan.update({
      where: { id: payment.loanId },
      data: { status: shouldBePaid ? 'PAID' : 'ACTIVE' },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'PAYMENT_DELETED',
        payload: JSON.stringify({
          paymentId: id,
          loanId: payment.loanId,
          amount: payment.amount,
        }),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting payment:', error)
    return NextResponse.json(
      { error: 'Failed to delete payment' },
      { status: 500 }
    )
  }
}