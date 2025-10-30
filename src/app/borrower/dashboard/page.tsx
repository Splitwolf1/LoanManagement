'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DollarSign,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  CreditCard,
  User,
  LogOut
} from 'lucide-react'
import { gsap } from 'gsap'
import Link from 'next/link'
import { format } from 'date-fns'
import { ThemeToggle } from '@/components/ui/theme-toggle'

// Mock data - would come from API in real app
const mockBorrowerData = {
  name: 'John Doe',
  email: 'john.doe@email.com',
  activeLoans: 1,
  totalBorrowed: 5000,
  totalPaid: 2000,
  nextPaymentDate: new Date('2024-12-15'),
  nextPaymentAmount: 1000,
  loans: [
    {
      id: '1',
      amount: 5000,
      interestRate: 3.5,
      issuedAt: new Date('2024-01-15'),
      dueDate: new Date('2025-01-15'),
      status: 'ACTIVE',
      totalPaid: 2000,
      remaining: 3000,
      payments: [
        { id: '1', amount: 1000, paidAt: new Date('2024-02-15'), method: 'bank_transfer' },
        { id: '2', amount: 1000, paidAt: new Date('2024-05-15'), method: 'bank_transfer' },
      ]
    }
  ]
}

export default function BorrowerDashboard() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.stat-card', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'back.out(1.7)'
      })
      gsap.from('.loan-card', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        delay: 0.3
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  const loan = mockBorrowerData.loans[0]
  const progress = ((loan.totalPaid / loan.amount) * 100).toFixed(1)

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-success/10">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-success/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <div className="relative bg-card/50 backdrop-blur-lg border-b border-border/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-accent to-success">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Welcome back, {mockBorrowerData.name}!</h1>
                <p className="text-sm text-muted-foreground">{mockBorrowerData.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link href="/borrower/apply">
                <Button className="bg-gradient-to-r from-accent to-success text-white">Apply for Loan</Button>
              </Link>
              <Link href="/admin/login">
                <Button variant="outline" className="gap-2">
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="stat-card border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-accent" />
                Total Borrowed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">${mockBorrowerData.totalBorrowed.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="stat-card border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                Total Paid
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: 'var(--color-success)' }}>
                ${mockBorrowerData.totalPaid.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-warning" />
                Next Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: 'var(--color-warning)' }}>
                ${mockBorrowerData.nextPaymentAmount.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Due {format(mockBorrowerData.nextPaymentDate, 'MMM dd, yyyy')}
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Active Loans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{mockBorrowerData.activeLoans}</div>
            </CardContent>
          </Card>
        </div>

        {/* Loan Details */}
        <Card className="loan-card border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Your Loan</CardTitle>
            <CardDescription>Loan ID: {loan.id} • Issued {format(loan.issuedAt, 'MMM dd, yyyy')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Repayment Progress</span>
                <span className="text-muted-foreground">{progress}% Complete</span>
              </div>
              <div className="h-4 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent to-success transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Loan Amount</p>
                <p className="text-2xl font-bold">${loan.amount.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Amount Paid</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-success)' }}>
                  ${loan.totalPaid.toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-warning)' }}>
                  ${loan.remaining.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Payment History */}
            <div>
              <h3 className="font-semibold mb-3">Payment History</h3>
              <div className="space-y-3">
                {loan.payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--color-success)' }} />
                      <div>
                        <p className="font-medium text-sm">${payment.amount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{format(payment.paidAt, 'MMM dd, yyyy')}</p>
                      </div>
                    </div>
                    <span className="text-xs bg-success/10 px-2 py-1 rounded-full" style={{ color: 'var(--color-success)' }}>
                      {payment.method.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1 bg-gradient-to-r from-accent to-success text-white gap-2">
                <CreditCard className="w-4 h-4" />
                Make Payment
              </Button>
              <Link href="/borrower/documents" className="flex-1">
                <Button variant="outline" className="w-full gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Documents
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
