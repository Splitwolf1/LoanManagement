'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DollarSign, Calendar, Clock, CheckCircle2, AlertCircle, FileText,
  CreditCard, User, LogOut, Eye, ArrowRight
} from 'lucide-react'
import { gsap } from 'gsap'
import Link from 'next/link'
import { format } from 'date-fns'
import { ThemeToggle } from '@/components/ui/theme-toggle'

type ApplicationStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'CONDITIONALLY_APPROVED' | 'DOCUMENTS_SIGNED' | 'APPROVED' | 'DISBURSED' | 'REJECTED'

interface LoanApplication {
  id: string
  fullName: string
  loanAmount: number
  loanPurpose: string
  status: ApplicationStatus
  createdAt: string
  conditionalApprovalNotes: string | null
}

// Mock borrower data
const mockBorrowerData = {
  name: 'John Doe',
  email: 'john.doe@email.com',
  activeLoans: 1,
  totalBorrowed: 5000,
  totalPaid: 2000,
  nextPaymentDate: new Date('2024-12-15'),
  nextPaymentAmount: 1000,
}

export default function BorrowerDashboard() {
  const router = useRouter()
  const [applications, setApplications] = useState<LoanApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchApplications()
  }, [])

  useEffect(() => {
    if (!isLoading) {
      const ctx = gsap.context(() => {
        gsap.from('.stat-card', {
          y: 30,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'back.out(1.7)'
        })
        gsap.from('.application-card', {
          y: 40,
          opacity: 0,
          duration: 0.8,
          delay: 0.3,
          stagger: 0.1
        })
      }, containerRef)

      return () => ctx.revert()
    }
  }, [isLoading])

  const fetchApplications = async () => {
    try {
      // In production, filter by user email
      const response = await fetch('/api/loan-applications')
      const data = await response.json()
      setApplications(data.applications || [])
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: ApplicationStatus) => {
    const badges = {
      SUBMITTED: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', label: 'Submitted' },
      UNDER_REVIEW: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', label: 'Under Review' },
      CONDITIONALLY_APPROVED: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', label: 'Action Required' },
      DOCUMENTS_SIGNED: { color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200', label: 'Pending Final Approval' },
      APPROVED: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', label: 'Approved' },
      DISBURSED: { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200', label: 'Funds Disbursed' },
      REJECTED: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', label: 'Rejected' },
    }
    return <Badge className={badges[status].color}>{badges[status].label}</Badge>
  }

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
              <div className="text-2xl font-bold">${mockBorrowerData.nextPaymentAmount.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground mt-1">
                Due {format(mockBorrowerData.nextPaymentDate, 'MMM dd')}
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                Active Loans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{mockBorrowerData.activeLoans}</div>
            </CardContent>
          </Card>
        </div>

        {/* Loan Applications */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-accent" />
                  My Loan Applications
                </CardTitle>
                <CardDescription>Track the status of your loan applications</CardDescription>
              </div>
              <Link href="/borrower/apply">
                <Button className="bg-gradient-to-r from-accent to-success text-white gap-2">
                  <FileText className="w-4 h-4" />
                  New Application
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-accent border-t-transparent"></div>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Start your loan journey by applying today!</p>
                <Link href="/borrower/apply">
                  <Button className="bg-gradient-to-r from-accent to-success text-white">
                    Apply for a Loan
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <Card
                    key={app.id}
                    className="application-card border-border/50 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => router.push(`/borrower/applications/${app.id}`)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">${app.loanAmount.toLocaleString()}</h3>
                            {getStatusBadge(app.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Applied on {format(new Date(app.createdAt), 'MMM dd, yyyy')}
                          </p>
                          <p className="text-sm line-clamp-1">{app.loanPurpose}</p>

                          {app.status === 'CONDITIONALLY_APPROVED' && (
                            <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                                <div>
                                  <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">Action Required</p>
                                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                                    Please upload the required documents to proceed
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Eye className="w-4 h-4" />
                          View Details
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Loan Details - only show if they have active loans */}
        {mockBorrowerData.activeLoans > 0 && (
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-accent" />
                Current Loan
              </CardTitle>
              <CardDescription>Track your active loan and payment history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Loan Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Repayment Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {((mockBorrowerData.totalPaid / mockBorrowerData.totalBorrowed) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent to-success transition-all duration-1000"
                    style={{ width: `${(mockBorrowerData.totalPaid / mockBorrowerData.totalBorrowed) * 100}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between mt-2 text-sm">
                  <span className="text-success">Paid: ${mockBorrowerData.totalPaid.toLocaleString()}</span>
                  <span className="text-muted-foreground">
                    Remaining: ${(mockBorrowerData.totalBorrowed - mockBorrowerData.totalPaid).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Next Payment */}
              <div className="p-4 bg-gradient-to-r from-accent/10 to-success/10 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Next Payment Due</p>
                    <p className="text-2xl font-bold mt-1">${mockBorrowerData.nextPaymentAmount.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {format(mockBorrowerData.nextPaymentDate, 'MMMM dd, yyyy')}
                    </p>
                  </div>
                  <Button className="bg-gradient-to-r from-accent to-success text-white">
                    Make Payment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
