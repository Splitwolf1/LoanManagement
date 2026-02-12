import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

        // Gather all statistics
        const [
            totalLoans,
            activeLoans,
            overdueLoans,
            paidLoans,
            totalBorrowers,
            monthlyPayments,
            monthlyDisbursements,
            recentLoans,
        ] = await Promise.all([
            // Total loans count
            prisma.loan.count(),

            // Active loans
            prisma.loan.count({ where: { status: 'ACTIVE' } }),

            // Overdue loans
            prisma.loan.count({
                where: {
                    status: 'ACTIVE',
                    dueDate: { lt: now },
                },
            }),

            // Paid loans
            prisma.loan.count({ where: { status: 'PAID' } }),

            // Total borrowers
            prisma.borrower.count(),

            // Payments this month
            prisma.payment.aggregate({
                _sum: { amount: true },
                _count: true,
                where: {
                    paidAt: {
                        gte: startOfMonth,
                        lte: endOfMonth,
                    },
                },
            }),

            // Disbursements this month
            prisma.loan.aggregate({
                _sum: { amount: true },
                _count: true,
                where: {
                    issuedAt: {
                        gte: startOfMonth,
                        lte: endOfMonth,
                    },
                },
            }),

            // Recent loans for activity
            prisma.loan.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { borrower: true },
            }),
        ])

        // Calculate totals
        const totalLoanAmounts = await prisma.loan.aggregate({
            _sum: { amount: true },
        })

        const totalPaymentAmounts = await prisma.payment.aggregate({
            _sum: { amount: true },
        })

        const totalDisbursed = totalLoanAmounts._sum.amount || 0
        const totalCollected = totalPaymentAmounts._sum.amount || 0
        const outstandingBalance = totalDisbursed - totalCollected

        // Generate HTML report
        const reportHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Monthly Report - ${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #1e293b; }
    .header { background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); padding: 30px; border-radius: 12px; color: white; margin-bottom: 30px; }
    .header h1 { margin: 0 0 10px 0; font-size: 28px; }
    .header p { margin: 0; opacity: 0.9; }
    .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }
    .stat-card { background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
    .stat-card h3 { margin: 0 0 5px 0; font-size: 14px; color: #64748b; font-weight: 500; }
    .stat-card .value { font-size: 32px; font-weight: 700; color: #1e293b; }
    .stat-card .subtext { font-size: 12px; color: #94a3b8; margin-top: 5px; }
    .section { margin-bottom: 30px; }
    .section h2 { font-size: 18px; margin-bottom: 15px; color: #334155; }
    table { width: 100%; border-collapse: collapse; background: #f8fafc; border-radius: 8px; overflow: hidden; }
    th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f1f5f9; font-weight: 600; color: #475569; }
    .success { color: #059669; }
    .warning { color: #d97706; }
    .danger { color: #dc2626; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Monthly Summary Report</h1>
    <p>Toronto Impact Initiative - ${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <h3>Total Loans</h3>
      <div class="value">${totalLoans}</div>
      <div class="subtext">${activeLoans} active, ${paidLoans} paid off</div>
    </div>
    <div class="stat-card">
      <h3>Total Borrowers</h3>
      <div class="value">${totalBorrowers}</div>
    </div>
    <div class="stat-card">
      <h3>Outstanding Balance</h3>
      <div class="value">$${outstandingBalance.toLocaleString()}</div>
      <div class="subtext">From $${totalDisbursed.toLocaleString()} disbursed</div>
    </div>
    <div class="stat-card">
      <h3>Overdue Loans</h3>
      <div class="value ${overdueLoans > 0 ? 'danger' : 'success'}">${overdueLoans}</div>
      <div class="subtext">${overdueLoans > 0 ? 'Require attention' : 'All loans current'}</div>
    </div>
  </div>

  <div class="section">
    <h2>📅 This Month's Activity</h2>
    <table>
      <tr>
        <th>Metric</th>
        <th>Count</th>
        <th>Amount</th>
      </tr>
      <tr>
        <td>Payments Received</td>
        <td>${monthlyPayments._count}</td>
        <td class="success">$${(monthlyPayments._sum.amount || 0).toLocaleString()}</td>
      </tr>
      <tr>
        <td>New Loans Issued</td>
        <td>${monthlyDisbursements._count}</td>
        <td>$${(monthlyDisbursements._sum.amount || 0).toLocaleString()}</td>
      </tr>
      <tr>
        <td>Total Collected (All Time)</td>
        <td>-</td>
        <td class="success">$${totalCollected.toLocaleString()}</td>
      </tr>
    </table>
  </div>

  <div class="section">
    <h2>🕐 Recent Activity</h2>
    <table>
      <tr>
        <th>Borrower</th>
        <th>Amount</th>
        <th>Status</th>
        <th>Date</th>
      </tr>
      ${recentLoans.map(loan => `
      <tr>
        <td>${loan.borrower.name}</td>
        <td>$${loan.amount.toLocaleString()}</td>
        <td class="${loan.status === 'PAID' ? 'success' : loan.status === 'OVERDUE' ? 'danger' : ''}">${loan.status}</td>
        <td>${loan.createdAt.toLocaleDateString()}</td>
      </tr>
      `).join('')}
    </table>
  </div>

  <div class="footer">
    <p>Generated on ${now.toLocaleString()}</p>
    <p>Toronto Impact Initiative - Loan Management System</p>
  </div>
</body>
</html>
    `

        // Return the report data and HTML
        return NextResponse.json({
            generatedAt: now.toISOString(),
            period: {
                month: now.toLocaleDateString('en-US', { month: 'long' }),
                year: now.getFullYear(),
            },
            summary: {
                totalLoans,
                activeLoans,
                overdueLoans,
                paidLoans,
                totalBorrowers,
                totalDisbursed,
                totalCollected,
                outstandingBalance,
            },
            thisMonth: {
                paymentsCount: monthlyPayments._count,
                paymentsAmount: monthlyPayments._sum.amount || 0,
                loansCount: monthlyDisbursements._count,
                loansAmount: monthlyDisbursements._sum.amount || 0,
            },
            html: reportHtml,
        })
    } catch (error) {
        console.error('Report generation error:', error)
        return NextResponse.json(
            { error: 'Failed to generate report' },
            { status: 500 }
        )
    }
}
