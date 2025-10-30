'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, Users, AlertTriangle, Activity } from 'lucide-react'
import { gsap } from 'gsap'

interface PortfolioChartsProps {
  portfolioStats: any
  recentActivity?: any
}

const COLORS = {
  active: '#3B82F6',    // Blue
  paid: '#10B981',      // Green
  overdue: '#EF4444',   // Red
  defaulted: '#6B7280', // Gray
}

const CHART_COLORS = ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899']

export default function PortfolioCharts({ portfolioStats, recentActivity }: PortfolioChartsProps) {
  const chartsRef = useRef<HTMLDivElement>(null)
  const [animationKey, setAnimationKey] = useState(0)

  useEffect(() => {
    if (chartsRef.current && portfolioStats) {
      // Trigger chart animations
      const cards = chartsRef.current.querySelectorAll('.chart-card')
      gsap.fromTo(cards, 
        { opacity: 0, y: 30, scale: 0.95 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.8, 
          stagger: 0.2,
          ease: "back.out(1.7)"
        }
      )
      
      // Animate chart elements after a delay
      setTimeout(() => {
        setAnimationKey(prev => prev + 1)
      }, 500)
    }
  }, [portfolioStats])

  // Prepare data for charts
  const loanStatusData = [
    { name: 'Active', value: portfolioStats?.activeLoans || 0, color: COLORS.active },
    { name: 'Paid', value: portfolioStats?.paidLoans || 0, color: COLORS.paid },
    { name: 'Overdue', value: portfolioStats?.overdueLoans || 0, color: COLORS.overdue },
    { name: 'Defaulted', value: portfolioStats?.defaultedLoans || 0, color: COLORS.defaulted },
  ].filter(item => item.value > 0)

  const monthlyTrends = [
    { month: 'Jan', disbursed: 15000, repaid: 12000, newLoans: 8 },
    { month: 'Feb', disbursed: 18000, repaid: 15000, newLoans: 12 },
    { month: 'Mar', disbursed: 22000, repaid: 18000, newLoans: 15 },
    { month: 'Apr', disbursed: 25000, repaid: 21000, newLoans: 18 },
    { month: 'May', disbursed: 28000, repaid: 24000, newLoans: 20 },
    { month: 'Jun', disbursed: portfolioStats?.totalDisbursed || 30000, repaid: portfolioStats?.totalRepaid || 25000, newLoans: portfolioStats?.totalLoans || 22 },
  ]

  const riskAnalysis = [
    { category: 'Low Risk', loans: portfolioStats?.activeLoans - (portfolioStats?.overdueLoans || 0) || 0, percentage: 75 },
    { category: 'Medium Risk', loans: Math.floor((portfolioStats?.overdueLoans || 0) * 0.6), percentage: 20 },
    { category: 'High Risk', loans: Math.floor((portfolioStats?.overdueLoans || 0) * 0.4), percentage: 5 },
  ]

  const performanceMetrics = [
    { metric: 'Repayment Rate', value: 92, target: 90, trend: 'up' },
    { metric: 'Default Rate', value: 3, target: 5, trend: 'down' },
    { metric: 'Portfolio Growth', value: 15, target: 12, trend: 'up' },
    { metric: 'Avg. Loan Size', value: portfolioStats?.averageLoanSize || 2500, target: 2000, trend: 'up' },
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' && entry.name.includes('$') 
                ? `$${entry.value.toLocaleString()}` 
                : entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, name }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    if (value === 0) return null

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-sm font-semibold"
      >
        {value}
      </text>
    )
  }

  return (
    <div ref={chartsRef} className="space-y-8">
      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {performanceMetrics.map((metric, index) => (
          <Card key={metric.metric} className="chart-card border-0 bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700 flex items-center justify-between">
                {metric.metric}
                {metric.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-2xl font-bold text-gray-900">
                  {metric.metric.includes('Rate') || metric.metric.includes('Growth') 
                    ? `${metric.value}%` 
                    : metric.metric.includes('Size')
                    ? `$${metric.value.toLocaleString()}`
                    : metric.value.toLocaleString()}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Target: {metric.metric.includes('Rate') || metric.metric.includes('Growth') ? `${metric.target}%` : `$${metric.target.toLocaleString()}`}</span>
                  <span className={`font-medium ${metric.value >= metric.target ? 'text-green-600' : 'text-orange-600'}`}>
                    {metric.value >= metric.target ? '✓ On Track' : '△ Below Target'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                      metric.value >= metric.target ? 'bg-green-500' : 'bg-orange-500'
                    }`}
                    style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Loan Status Pie Chart */}
        <Card className="chart-card border-0 bg-white/70 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Activity className="h-6 w-6 mr-3 text-blue-600" />
              Loan Status Distribution
            </CardTitle>
            <CardDescription>Current portfolio breakdown by loan status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart key={animationKey}>
                  <Pie
                    data={loanStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1200}
                  >
                    {loanStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              {loanStatusData.map((item, index) => (
                <div key={item.name} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  <span className="text-sm text-gray-500">({item.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trends Chart */}
        <Card className="chart-card border-0 bg-white/70 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <TrendingUp className="h-6 w-6 mr-3 text-green-600" />
              Monthly Trends
            </CardTitle>
            <CardDescription>Disbursements and repayments over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart key={animationKey} data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="month" 
                    className="text-sm"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    className="text-sm"
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="disbursed"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.3}
                    strokeWidth={3}
                    animationDuration={1500}
                  />
                  <Area
                    type="monotone"
                    dataKey="repaid"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.3}
                    strokeWidth={3}
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm font-medium text-gray-700">Disbursed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium text-gray-700">Repaid</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Analysis and Performance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Risk Analysis */}
        <Card className="chart-card border-0 bg-white/70 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <AlertTriangle className="h-6 w-6 mr-3 text-orange-600" />
              Risk Analysis
            </CardTitle>
            <CardDescription>Portfolio risk distribution and assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskAnalysis.map((risk, index) => (
                <div key={risk.category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{risk.category}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">{risk.loans} loans</span>
                      <span className="text-sm font-semibold text-gray-900">{risk.percentage}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                        index === 0 ? 'bg-green-500' : index === 1 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ 
                        width: `${risk.percentage}%`,
                        transitionDelay: `${index * 200}ms`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Portfolio Health Score</h4>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-blue-600">87/100</div>
                <div className="text-sm text-blue-700">
                  <div>✓ Low default rate</div>
                  <div>✓ Strong repayment history</div>
                  <div>△ Monitor overdue loans</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Timeline */}
        <Card className="chart-card border-0 bg-white/70 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <DollarSign className="h-6 w-6 mr-3 text-green-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest loan and payment activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {recentActivity?.payments?.slice(0, 8).map((payment: any, index: number) => (
                <div 
                  key={payment.id} 
                  className="flex items-center space-x-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100 hover:shadow-md transition-all duration-200"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      Payment from {payment.loan.borrower.name}
                    </div>
                    <div className="text-xs text-gray-600">
                      {new Date(payment.paidAt).toLocaleDateString()} • Loan #{payment.loan.id.slice(-6)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-green-600">
                      ${payment.amount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {payment.notes && payment.notes.slice(0, 20)}
                    </div>
                  </div>
                </div>
              ))}
              
              {(!recentActivity?.payments?.length) && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}