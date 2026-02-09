import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generatePortfolioInsights } from '@/lib/ai'

export async function GET() {
    try {
        // Get portfolio statistics
        const [
            totalLoans,
            activeLoans,
            overdueLoans,
            loanStats,
            paymentStats,
        ] = await Promise.all([
            prisma.loan.count(),
            prisma.loan.count({ where: { status: 'ACTIVE' } }),
            prisma.loan.count({ where: { status: 'OVERDUE' } }),
            prisma.loan.aggregate({
                _sum: { amount: true },
                _avg: { amount: true },
            }),
            prisma.payment.aggregate({
                _sum: { amount: true },
            }),
        ])

        const portfolioData = {
            totalLoans,
            activeLoans,
            overdueLoans,
            totalDisbursed: loanStats._sum.amount || 0,
            totalRepaid: paymentStats._sum.amount || 0,
            averageLoanAmount: loanStats._avg.amount || 0,
            overdueRate: totalLoans > 0 ? overdueLoans / totalLoans : 0,
        }

        const insights = await generatePortfolioInsights(portfolioData)

        return NextResponse.json({
            portfolio: portfolioData,
            insights,
        })
    } catch (error) {
        console.error('Error generating portfolio insights:', error)
        return NextResponse.json(
            { error: 'Failed to generate portfolio insights' },
            { status: 500 }
        )
    }
}
