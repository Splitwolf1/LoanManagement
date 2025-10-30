'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DollarSign, Users, AlertTriangle, TrendingUp, Plus, CreditCard, FileText,
  Target, BarChart3, PieChart, Activity, ArrowRight, Sparkles, Award,
  TrendingDown, Clock, CheckCircle2, Building2, Heart
} from 'lucide-react'
import { useSummaryData } from '@/hooks/use-api'
import { formatCurrency, formatPercentage } from '@/lib/loan-utils'
import { gsap } from 'gsap'
import PortfolioCharts from '@/components/charts/PortfolioCharts'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default function DashboardPage() {
  const { data: summary, isLoading, error } = useSummaryData()
  
  const dashboardRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const statsCardsRef = useRef<HTMLDivElement>(null)
  const chartsRef = useRef<HTMLDivElement>(null)
  const activityRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isLoading && summary && dashboardRef.current) {
      // Initial page load animation
      const tl = gsap.timeline()
      
      // Hero section fade in
      tl.fromTo(heroRef.current, 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      )
      
      // Stats cards stagger animation
      .fromTo(statsCardsRef.current?.children || [], 
        { opacity: 0, y: 40, scale: 0.95 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.6, 
          stagger: 0.1,
          ease: "back.out(1.7)"
        },
        "-=0.4"
      )
      
      // Charts and activity sections
      .fromTo([chartsRef.current, activityRef.current], 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.2 },
        "-=0.3"
      )
    }
  }, [isLoading, summary])

  // Hover animations for cards
  const handleCardHover = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, { 
      y: -5, 
      boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
      duration: 0.3,
      ease: "power2.out"
    })
  }

  const handleCardLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, { 
      y: 0, 
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      duration: 0.3,
      ease: "power2.out"
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="absolute inset-0 opacity-30">
          <div className="h-full w-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e0e7ff' fill-opacity='0.4'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        <header className="relative bg-white/80 backdrop-blur-lg shadow-sm border-b border-blue-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Toronto Impact Initiative
                  </h1>
                  <p className="text-sm text-gray-600">Loan Management Dashboard</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 opacity-20 animate-pulse"></div>
              </div>
              <div className="mt-6 space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Loading Dashboard</h3>
                <p className="text-gray-600">Fetching your loan portfolio data...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Toronto Impact Initiative</h1>
                  <p className="text-sm text-gray-600">Loan Management Dashboard</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Dashboard</h3>
            <p className="text-gray-600 mb-6">We&apos;re having trouble fetching your data. Please try again.</p>
            <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700">
              Try Again
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const stats = summary?.portfolioStats || {}

  return (
    <div ref={dashboardRef} className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="h-full w-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e0e7ff' fill-opacity='0.4'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>
      
      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-lg shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Toronto Impact Initiative
                </h1>
                <p className="text-sm text-gray-600">Loan Management Dashboard</p>
              </div>
            </div>
            
            <nav className="flex items-center space-x-2">
              <ThemeToggle />
              <Link href="/admin/borrowers">
                <Button variant="ghost" className="hover:bg-blue-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 transition-all duration-200">
                  <Users className="h-4 w-4 mr-2" />
                  Borrowers
                </Button>
              </Link>
              <Link href="/admin/loans">
                <Button variant="ghost" className="hover:bg-blue-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 transition-all duration-200">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Loans
                </Button>
              </Link>
              <Link href="/admin/reports">
                <Button variant="ghost" className="hover:bg-blue-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 transition-all duration-200">
                  <FileText className="h-4 w-4 mr-2" />
                  Reports
                </Button>
              </Link>
              <Link href="/admin/loan-requests">
                <Button variant="ghost" className="hover:bg-blue-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 transition-all duration-200">
                  <FileText className="h-4 w-4 mr-2" />
                  Loan Requests
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div ref={heroRef} className="mb-12 text-center">
          <div className="relative">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Empowering Communities
            </h2>
            <div className="absolute -top-2 -right-8 text-yellow-400 animate-bounce">
              <Sparkles className="h-8 w-8" />
            </div>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Supporting local businesses and individuals through accessible microfinance solutions
          </p>
          
          {/* Quick Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/admin/borrowers?action=new">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Plus className="h-4 w-4 mr-2" />
                Add Borrower
              </Button>
            </Link>
            <Link href="/admin/loans?action=new">
              <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <DollarSign className="h-4 w-4 mr-2" />
                Create Loan
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div ref={statsCardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card 
            className="relative overflow-hidden border-0 bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
            onMouseEnter={handleCardHover}
            onMouseLeave={handleCardLeave}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Total Loans</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-md">
                <Target className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalLoans || 0}</div>
              <div className="flex items-center space-x-2 text-sm">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                  {stats.activeLoans || 0} active
                </span>
                <span className="text-gray-500">{stats.paidLoans || 0} completed</span>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="relative overflow-hidden border-0 bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
            onMouseEnter={handleCardHover}
            onMouseLeave={handleCardLeave}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Total Disbursed</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-md">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(stats.totalDisbursed || 0)}</div>
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span>Avg: {formatCurrency(stats.averageLoanSize || 0)}</span>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="relative overflow-hidden border-0 bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
            onMouseEnter={handleCardHover}
            onMouseLeave={handleCardLeave}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Total Repaid</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(stats.totalRepaid || 0)}</div>
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Activity className="h-3 w-3 text-purple-500" />
                <span>Outstanding: {formatCurrency(stats.totalOutstanding || 0)}</span>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="relative overflow-hidden border-0 bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
            onMouseEnter={handleCardHover}
            onMouseLeave={handleCardLeave}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Overdue Loans</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center shadow-md">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-red-600 mb-1">{stats.overdueLoans || 0}</div>
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <TrendingDown className="h-3 w-3 text-red-500" />
                <span>Risk: {formatPercentage(stats.portfolioAtRisk || 0)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Charts and Data Visualization */}
        <div ref={chartsRef}>
          <PortfolioCharts 
            portfolioStats={stats} 
            recentActivity={summary?.recentActivity}
          />
        </div>

        {/* Impact Banner */}
        <Card className="border-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-2xl">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Community Impact</h3>
                  <p className="text-blue-100 max-w-2xl">
                    Together, we&apos;ve supported {stats.totalLoans || 0} community members with {formatCurrency(stats.totalDisbursed || 0)} in accessible loans, 
                    fostering economic growth and opportunity across Toronto.
                  </p>
                </div>
              </div>
              <div className="hidden lg:flex items-center space-x-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-white">{stats.totalLoans || 0}</div>
                  <div className="text-sm text-blue-200">Lives Impacted</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">{formatCurrency(stats.totalDisbursed || 0)}</div>
                  <div className="text-sm text-blue-200">Total Disbursed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">{formatPercentage(85)}</div>
                  <div className="text-sm text-blue-200">Success Rate</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}