'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  AlertTriangle,
  Download,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Sparkles
} from 'lucide-react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { format } from 'date-fns'
import { gsap } from 'gsap'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/theme-toggle'

interface PortfolioStats {
  totalLoans: number
  totalDisbursed: number
  totalRepaid: number
  totalOutstanding: number
  activeLoans: number
  overdueLoans: number
}

interface MonthlyTrend {
  month: string
  loansIssued: number
  paymentsReceived: number
}

interface RiskAnalysis {
  lowRisk: number
  mediumRisk: number
  highRisk: number
}

interface ReportData {
  portfolioStats: PortfolioStats
  monthlyTrends: MonthlyTrend[]
  riskAnalysis: RiskAnalysis
  recentActivity: {
    payments: any[]
    loans: any[]
  }
  generatedAt: string
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  const { data: reportData, isLoading } = useQuery<ReportData>({
    queryKey: ['reports-summary', dateRange],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (dateRange?.start) params.append('startDate', dateRange.start)
      if (dateRange?.end) params.append('endDate', dateRange.end)

      const res = await fetch(`/api/reports/summary?${params}`)
      if (!res.ok) throw new Error('Failed to fetch report')
      return res.json()
    },
  })

  useEffect(() => {
    if (!reportData) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.from(headerRef.current, {
        y: -50,
        opacity: 0,
        duration: 0.6,
      })
      .from('.stat-card', {
        y: 30,
        opacity: 0,
        scale: 0.95,
        duration: 0.5,
        stagger: 0.1,
        ease: 'back.out(1.7)'
      }, '-=0.3')
      .from('.chart-card', {
        y: 40,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
      }, '-=0.4')
    }, containerRef)

    return () => ctx.revert()
  }, [reportData])

  const riskChartData = reportData ? [
    { name: 'Low Risk', value: reportData.riskAnalysis.lowRisk, color: 'var(--color-success)' },
    { name: 'Medium Risk', value: reportData.riskAnalysis.mediumRisk, color: 'var(--color-warning)' },
    { name: 'High Risk', value: reportData.riskAnalysis.highRisk, color: 'var(--color-destructive)' },
  ] : []

  const COLORS = ['#10b981', '#f59e0b', '#ef4444']

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/10">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <div ref={headerRef} className="relative bg-card/50 backdrop-blur-lg border-b border-border/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-accent">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gradient-primary">Analytics & Reports</h1>
                <p className="text-muted-foreground">Comprehensive loan portfolio insights</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link href="/admin/dashboard">
                <Button variant="outline" className="gap-2 hover:bg-blue-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">
                  <Activity className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
              <Button className="gap-2 bg-gradient-to-r from-primary to-accent text-white hover:opacity-90">
                <Download className="w-4 h-4" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="stat-card border-border/50 bg-card/80 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Disbursed</CardTitle>
              <DollarSign className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gradient-primary">
                ${reportData?.portfolioStats.totalDisbursed.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Across {reportData?.portfolioStats.totalLoans} loans
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card border-border/50 bg-card/80 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Repaid</CardTitle>
              <TrendingUp className="w-5 h-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: 'var(--color-success)' }}>
                ${reportData?.portfolioStats.totalRepaid.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {reportData ? ((reportData.portfolioStats.totalRepaid / reportData.portfolioStats.totalDisbursed) * 100).toFixed(1) : 0}% recovery rate
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card border-border/50 bg-card/80 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding</CardTitle>
              <TrendingDown className="w-5 h-5 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: 'var(--color-warning)' }}>
                ${reportData?.portfolioStats.totalOutstanding.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {reportData?.portfolioStats.activeLoans} active loans
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card border-border/50 bg-card/80 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overdue Loans</CardTitle>
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: 'var(--color-destructive)' }}>
                {reportData?.portfolioStats.overdueLoans}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Requires immediate attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trends */}
          <Card className="chart-card border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Monthly Trends
              </CardTitle>
              <CardDescription>Loans issued and payments received over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={reportData?.monthlyTrends}>
                  <defs>
                    <linearGradient id="colorLoans" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPayments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" tick={{ fill: 'var(--color-muted-foreground)' }} />
                  <YAxis tick={{ fill: 'var(--color-muted-foreground)' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="loansIssued"
                    stroke="var(--color-primary)"
                    fillOpacity={1}
                    fill="url(#colorLoans)"
                    name="Loans Issued"
                  />
                  <Area
                    type="monotone"
                    dataKey="paymentsReceived"
                    stroke="var(--color-accent)"
                    fillOpacity={1}
                    fill="url(#colorPayments)"
                    name="Payments ($)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Risk Analysis */}
          <Card className="chart-card border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-primary" />
                Risk Distribution
              </CardTitle>
              <CardDescription>Loan portfolio risk assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={riskChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: any) => `${props.name}: ${(((props.percent ?? 0) * 100) as number).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {riskChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '0.5rem'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="chart-card border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest payments and loans</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase">Recent Payments</h3>
                <div className="space-y-3">
                  {reportData?.recentActivity.payments.slice(0, 5).map((payment: any) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div>
                        <p className="font-medium text-sm">{payment.loan.borrower.name}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(payment.paidAt), 'MMM dd, yyyy')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold" style={{ color: 'var(--color-success)' }}>${payment.amount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground capitalize">{payment.method}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase">Recent Loans</h3>
                <div className="space-y-3">
                  {reportData?.recentActivity.loans.slice(0, 5).map((loan: any) => (
                    <div key={loan.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div>
                        <p className="font-medium text-sm">{loan.borrower.name}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(loan.issuedAt), 'MMM dd, yyyy')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">${loan.amount.toLocaleString()}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          loan.status === 'PAID' ? 'bg-success/10 text-success' :
                          loan.status === 'OVERDUE' ? 'bg-destructive/10 text-destructive' :
                          'bg-primary/10 text-primary'
                        }`}>
                          {loan.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pb-8">
          <p>Report generated on {reportData && format(new Date(reportData.generatedAt), 'PPpp')}</p>
        </div>
      </div>
    </div>
  )
}
