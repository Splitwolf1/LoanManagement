import { Loan, Payment, LoanStatus } from '@prisma/client'

export interface LoanWithPayments extends Loan {
  payments: Payment[]
}

export interface LoanCalculation {
  principal: number
  interestRate: number
  interestAmount: number
  totalOwed: number
  totalPaid: number
  balance: number
  isOverdue: boolean
  isFullyPaid: boolean
  paymentProgress: number
}

/**
 * Calculate comprehensive loan details including balances and status
 */
export function calculateLoanDetails(loan: LoanWithPayments): LoanCalculation {
  const principal = loan.amount
  const interestRate = loan.interestRate || 0
  const interestAmount = principal * (interestRate / 100)
  const totalOwed = principal + interestAmount

  const totalPaid = loan.payments.reduce((sum, payment) => sum + payment.amount, 0)
  const balance = totalOwed - totalPaid

  const isOverdue = new Date() > loan.dueDate && loan.status === LoanStatus.ACTIVE && balance > 0
  const isFullyPaid = balance <= 0 || loan.status === LoanStatus.PAID
  const paymentProgress = totalOwed > 0 ? (totalPaid / totalOwed) * 100 : 0

  return {
    principal,
    interestRate,
    interestAmount,
    totalOwed,
    totalPaid,
    balance,
    isOverdue,
    isFullyPaid,
    paymentProgress,
  }
}

/**
 * Calculate monthly payment amount for a loan
 */
export function calculateMonthlyPayment(
  principal: number,
  annualInterestRate: number,
  termInMonths: number
): number {
  if (annualInterestRate === 0) {
    return principal / termInMonths
  }

  const monthlyRate = annualInterestRate / 100 / 12
  const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, termInMonths)
  const denominator = Math.pow(1 + monthlyRate, termInMonths) - 1

  return numerator / denominator
}

/**
 * Calculate remaining days until loan due date
 */
export function getDaysUntilDue(dueDate: Date): number {
  const today = new Date()
  const timeDiff = dueDate.getTime() - today.getTime()
  return Math.ceil(timeDiff / (1000 * 3600 * 24))
}

/**
 * Calculate loan age in days
 */
export function getLoanAgeInDays(issuedAt: Date): number {
  const today = new Date()
  const timeDiff = today.getTime() - issuedAt.getTime()
  return Math.floor(timeDiff / (1000 * 3600 * 24))
}

/**
 * Generate payment schedule for a loan
 */
export function generatePaymentSchedule(
  principal: number,
  annualInterestRate: number,
  termInMonths: number,
  startDate: Date
): Array<{
  paymentNumber: number
  dueDate: Date
  paymentAmount: number
  principalAmount: number
  interestAmount: number
  remainingBalance: number
}> {
  const monthlyPayment = calculateMonthlyPayment(principal, annualInterestRate, termInMonths)
  const monthlyRate = annualInterestRate / 100 / 12
  const schedule = []

  let remainingBalance = principal

  for (let i = 1; i <= termInMonths; i++) {
    const interestAmount = remainingBalance * monthlyRate
    const principalAmount = monthlyPayment - interestAmount
    remainingBalance -= principalAmount

    const dueDate = new Date(startDate)
    dueDate.setMonth(dueDate.getMonth() + i)

    schedule.push({
      paymentNumber: i,
      dueDate,
      paymentAmount: monthlyPayment,
      principalAmount,
      interestAmount,
      remainingBalance: Math.max(0, remainingBalance),
    })
  }

  return schedule
}

/**
 * Calculate portfolio statistics
 */
export function calculatePortfolioStats(loans: LoanWithPayments[]) {
  const stats = {
    totalLoans: loans.length,
    activeLoans: 0,
    paidLoans: 0,
    overdueLoans: 0,
    defaultedLoans: 0,
    totalPrincipal: 0,
    totalDisbursed: 0,
    totalRepaid: 0,
    totalOutstanding: 0,
    totalOverdue: 0,
    averageLoanSize: 0,
    portfolioAtRisk: 0,
    defaultRate: 0,
    repaymentRate: 0,
    portfolioGrowth: 0,
  }

  let totalOverdueAmount = 0

  loans.forEach(loan => {
    const calculation = calculateLoanDetails(loan)

    stats.totalPrincipal += calculation.principal
    stats.totalDisbursed += calculation.principal
    stats.totalRepaid += calculation.totalPaid
    stats.totalOutstanding += calculation.balance

    switch (loan.status) {
      case LoanStatus.ACTIVE:
        stats.activeLoans++
        if (calculation.isOverdue) {
          stats.overdueLoans++
          totalOverdueAmount += calculation.balance
        }
        break
      case LoanStatus.PAID:
        stats.paidLoans++
        break
      case LoanStatus.DEFAULTED:
        stats.defaultedLoans++
        break
    }
  })

  stats.totalOverdue = totalOverdueAmount
  stats.averageLoanSize = stats.totalLoans > 0 ? stats.totalPrincipal / stats.totalLoans : 0
  stats.portfolioAtRisk = stats.totalOutstanding > 0 ? (stats.totalOverdue / stats.totalOutstanding) * 100 : 0

  // New metrics
  stats.defaultRate = stats.totalLoans > 0 ? (stats.defaultedLoans / stats.totalLoans) * 100 : 0
  stats.repaymentRate = stats.totalDisbursed > 0 ? (stats.totalRepaid / stats.totalDisbursed) * 100 : 0

  // Initialize portfolioGrowth (calculated in API with historical data)
  stats.portfolioGrowth = 0

  return stats
}

/**
 * Determine risk level based on loan characteristics
 */
export function assessLoanRisk(loan: LoanWithPayments): {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  riskFactors: string[]
  riskScore: number
} {
  const calculation = calculateLoanDetails(loan)
  const riskFactors: string[] = []
  let riskScore = 0

  // Age-based risk
  const loanAge = getLoanAgeInDays(loan.issuedAt)
  if (loanAge > 365) {
    riskFactors.push('Loan is over 1 year old')
    riskScore += 20
  }

  // Overdue risk
  if (calculation.isOverdue) {
    const daysOverdue = Math.abs(getDaysUntilDue(loan.dueDate))
    riskFactors.push(`${daysOverdue} days overdue`)
    riskScore += Math.min(daysOverdue * 2, 40)
  }

  // Payment progress risk
  if (calculation.paymentProgress < 25 && loanAge > 90) {
    riskFactors.push('Low payment progress for loan age')
    riskScore += 15
  }

  // Amount-based risk
  if (loan.amount > 10000) {
    riskFactors.push('High loan amount')
    riskScore += 10
  }

  // No recent payments
  const recentPayments = loan.payments.filter(
    p => new Date(p.paidAt) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  )
  if (recentPayments.length === 0 && loan.payments.length > 0 && !calculation.isFullyPaid) {
    riskFactors.push('No payments in last 90 days')
    riskScore += 25
  }

  // Determine risk level
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  if (riskScore <= 20) {
    riskLevel = 'LOW'
  } else if (riskScore <= 50) {
    riskLevel = 'MEDIUM'
  } else {
    riskLevel = 'HIGH'
  }

  return {
    riskLevel,
    riskFactors,
    riskScore: Math.min(riskScore, 100),
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(amount)
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}