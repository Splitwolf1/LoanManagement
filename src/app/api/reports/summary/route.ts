import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculatePortfolioStats, calculateLoanDetails } from '@/lib/loan-utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build date filter
    const dateFilter: any = {}
    if (startDate) {
      dateFilter.issuedAt = { gte: new Date(startDate) }
    }
    if (endDate) {
      dateFilter.issuedAt = { 
        ...dateFilter.issuedAt, 
        lte: new Date(endDate) 
      }
    }

    // Get all loans with payments
    const loans = await prisma.loan.findMany({
      where: dateFilter,
      include: {
        payments: true,
        borrower: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Calculate portfolio statistics
    const portfolioStats = calculatePortfolioStats(loans)

    // Get recent activity
    const recentPayments = await prisma.payment.findMany({
      take: 10,
      orderBy: { paidAt: 'desc' },
      include: {
        loan: {
          include: {
            borrower: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    const recentLoans = await prisma.loan.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        borrower: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Calculate monthly trends (last 12 months)
    const monthlyTrends = []
    const now = new Date()
    
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      
      const monthLoans = await prisma.loan.count({
        where: {
          issuedAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      })

      const monthPayments = await prisma.payment.aggregate({
        where: {
          paidAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: {
          amount: true,
        },
      })

      monthlyTrends.push({
        month: monthStart.toISOString().slice(0, 7), // YYYY-MM format
        loansIssued: monthLoans,
        paymentsReceived: monthPayments._sum.amount || 0,
      })
    }

    // Risk analysis
    const riskAnalysis = {
      lowRisk: 0,
      mediumRisk: 0,
      highRisk: 0,
    }

    loans.forEach(loan => {
      const calculation = calculateLoanDetails(loan)
      if (calculation.isOverdue) {
        const daysOverdue = Math.abs(
          Math.floor((new Date().getTime() - loan.dueDate.getTime()) / (1000 * 60 * 60 * 24))
        )
        
        if (daysOverdue <= 30) {
          riskAnalysis.lowRisk++
        } else if (daysOverdue <= 90) {
          riskAnalysis.mediumRisk++
        } else {
          riskAnalysis.highRisk++
        }
      }
    })

    return NextResponse.json({
      portfolioStats,
      recentActivity: {
        payments: recentPayments,
        loans: recentLoans,
      },
      monthlyTrends,
      riskAnalysis,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error generating summary report:', error)
    return NextResponse.json(
      { error: 'Failed to generate summary report' },
      { status: 500 }
    )
  }
}