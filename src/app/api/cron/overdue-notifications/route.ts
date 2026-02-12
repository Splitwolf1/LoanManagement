import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPaymentReminderEmail } from '@/lib/email'

// Verify cron job secret to prevent unauthorized access
const verifyCronSecret = (request: NextRequest): boolean => {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    // If no CRON_SECRET is set, allow in development
    if (!cronSecret && process.env.NODE_ENV === 'development') {
        return true
    }

    return authHeader === `Bearer ${cronSecret}`
}

export async function GET(request: NextRequest) {
    // Verify authorization
    if (!verifyCronSecret(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Find all overdue loans with borrower info
        const today = new Date()
        const overdueLoans = await prisma.loan.findMany({
            where: {
                status: 'ACTIVE',
                dueDate: {
                    lt: today,
                },
            },
            include: {
                borrower: true,
                payments: {
                    orderBy: { paidAt: 'desc' },
                    take: 1,
                },
            },
        })

        if (overdueLoans.length === 0) {
            return NextResponse.json({
                message: 'No overdue loans found',
                emailsSent: 0,
            })
        }

        let emailsSent = 0
        const errors: string[] = []

        // Send reminder emails for each overdue loan
        for (const loan of overdueLoans) {
            if (!loan.borrower.email) {
                errors.push(`Loan ${loan.id}: Borrower has no email`)
                continue
            }

            // Calculate amount due (remaining balance)
            const totalPaid = loan.payments.reduce((sum, p) => sum + p.amount, 0)
            const amountDue = loan.amount - totalPaid

            if (amountDue <= 0) {
                continue // Loan is fully paid, skip
            }

            try {
                await sendPaymentReminderEmail(
                    loan.borrower.email,
                    loan.borrower.name,
                    loan.amount,
                    loan.dueDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    }),
                    amountDue
                )
                emailsSent++
            } catch (error) {
                errors.push(`Loan ${loan.id}: Failed to send email - ${error}`)
            }
        }

        // Log the cron job execution
        await prisma.auditLog.create({
            data: {
                action: 'CRON_OVERDUE_NOTIFICATIONS',
                payload: JSON.stringify({
                    overdueLoansCount: overdueLoans.length,
                    emailsSent,
                    errors,
                }),
            },
        })

        return NextResponse.json({
            message: 'Overdue notification cron job completed',
            overdueLoansCount: overdueLoans.length,
            emailsSent,
            errors: errors.length > 0 ? errors : undefined,
        })
    } catch (error) {
        console.error('Cron job error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
