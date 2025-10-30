'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  FileText, CheckCircle, XCircle, Clock, Eye, Mail, Phone, MapPin,
  DollarSign, Briefcase, ArrowLeft, Filter, FileCheck, Banknote, AlertCircle
} from 'lucide-react'
import { gsap } from 'gsap'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { format } from 'date-fns'

type ApplicationStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'CONDITIONALLY_APPROVED' | 'DOCUMENTS_SIGNED' | 'APPROVED' | 'DISBURSED' | 'REJECTED'

interface LoanApplication {
  id: string
  fullName: string
  email: string
  phone: string
  address: string
  employmentStatus: string
  monthlyIncome: number
  loanAmount: number
  loanPurpose: string
  documents: string | null
  status: ApplicationStatus
  reviewedBy: string | null
  reviewedAt: string | null
  reviewNotes: string | null
  conditionalApprovalNotes: string | null
  requiredDocuments: string | null
  signedDocuments: string | null
  documentsSignedAt: string | null
  finalApprovedBy: string | null
  finalApprovedAt: string | null
  disbursedBy: string | null
  disbursedAt: string | null
  disbursementAmount: number | null
  disbursementMethod: string | null
  disbursementReference: string | null
  loanId: string | null
  createdAt: string
  updatedAt: string
}

export default function LoanRequestsPage() {
  const [applications, setApplications] = useState<LoanApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | ApplicationStatus>('SUBMITTED')
  const [selectedApp, setSelectedApp] = useState<LoanApplication | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Form states
  const [reviewNotes, setReviewNotes] = useState('')
  const [conditionalNotes, setConditionalNotes] = useState('')
  const [requiredDocs, setRequiredDocs] = useState<string[]>(['Proof of Income', 'Government ID'])
  const [newDoc, setNewDoc] = useState('')
  const [disbursementAmount, setDisbursementAmount] = useState('')
  const [disbursementMethod, setDisbursementMethod] = useState('bank_transfer')
  const [disbursementReference, setDisbursementReference] = useState('')

  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchApplications()
  }, [filter])

  useEffect(() => {
    if (!isLoading && applications.length > 0) {
      gsap.fromTo(
        '.application-card',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
      )
    }
  }, [isLoading, applications])

  const fetchApplications = async () => {
    setIsLoading(true)
    try {
      const statusParam = filter === 'ALL' ? '' : `?status=${filter}`
      const response = await fetch(`/api/loan-applications${statusParam}`)
      const data = await response.json()
      setApplications(data.applications || [])
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = async (applicationId: string, action: any) => {
    setIsProcessing(true)
    try {
      const response = await fetch(`/api/loan-applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to process action')
      }

      await fetchApplications()
      setSelectedApp(null)
      resetForms()
      alert('Action completed successfully!')
    } catch (error) {
      console.error('Error processing action:', error)
      alert(error instanceof Error ? error.message : 'Failed to process action')
    } finally {
      setIsProcessing(false)
    }
  }

  const resetForms = () => {
    setReviewNotes('')
    setConditionalNotes('')
    setRequiredDocs(['Proof of Income', 'Government ID'])
    setNewDoc('')
    setDisbursementAmount('')
    setDisbursementMethod('bank_transfer')
    setDisbursementReference('')
  }

  const getStatusBadge = (status: ApplicationStatus) => {
    const badges = {
      SUBMITTED: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: Clock, label: 'Submitted' },
      UNDER_REVIEW: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', icon: Eye, label: 'Under Review' },
      CONDITIONALLY_APPROVED: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: AlertCircle, label: 'Conditionally Approved' },
      DOCUMENTS_SIGNED: { color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200', icon: FileCheck, label: 'Documents Signed' },
      APPROVED: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle, label: 'Approved' },
      DISBURSED: { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200', icon: Banknote, label: 'Disbursed' },
      REJECTED: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: XCircle, label: 'Rejected' },
    }
    const badge = badges[status]
    const Icon = badge.icon
    return (
      <Badge className={badge.color}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.label}
      </Badge>
    )
  }

  const getAvailableActions = (app: LoanApplication) => {
    const actions = []
    if (app.status === 'SUBMITTED') {
      actions.push({ label: 'Start Review', action: 'start_review', variant: 'default' })
      actions.push({ label: 'Reject', action: 'reject', variant: 'destructive' })
    } else if (app.status === 'UNDER_REVIEW') {
      actions.push({ label: 'Conditionally Approve', action: 'conditional_approve', variant: 'default' })
      actions.push({ label: 'Reject', action: 'reject', variant: 'destructive' })
    } else if (app.status === 'DOCUMENTS_SIGNED') {
      actions.push({ label: 'Final Approve', action: 'final_approve', variant: 'default' })
      actions.push({ label: 'Reject', action: 'reject', variant: 'destructive' })
    } else if (app.status === 'APPROVED') {
      actions.push({ label: 'Disburse Funds', action: 'disburse', variant: 'default' })
    }
    return actions
  }

  const renderActionDialog = () => {
    if (!selectedApp) return null

    const action = (selectedApp as any)._dialogAction

    if (action === 'start_review') {
      return (
        <>
          <DialogHeader>
            <DialogTitle>Start Review</DialogTitle>
            <DialogDescription>Begin reviewing {selectedApp.fullName}'s application</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Review Notes (Optional)</Label>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add any initial notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedApp(null)}>Cancel</Button>
            <Button onClick={() => handleAction(selectedApp.id, {
              action: 'start_review',
              reviewedBy: 'Admin',
              reviewNotes,
            })} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Start Review'}
            </Button>
          </DialogFooter>
        </>
      )
    }

    if (action === 'conditional_approve') {
      return (
        <>
          <DialogHeader>
            <DialogTitle>Conditional Approval</DialogTitle>
            <DialogDescription>Approve with conditions for {selectedApp.fullName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Conditions / Notes *</Label>
              <Textarea
                value={conditionalNotes}
                onChange={(e) => setConditionalNotes(e.target.value)}
                placeholder="Specify conditions for approval..."
                required
              />
            </div>
            <div>
              <Label>Required Documents *</Label>
              <div className="space-y-2">
                {requiredDocs.map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input value={doc} readOnly className="flex-1" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setRequiredDocs(requiredDocs.filter((_, i) => i !== idx))}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    value={newDoc}
                    onChange={(e) => setNewDoc(e.target.value)}
                    placeholder="Add document requirement"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (newDoc.trim()) {
                        setRequiredDocs([...requiredDocs, newDoc.trim()])
                        setNewDoc('')
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedApp(null)}>Cancel</Button>
            <Button onClick={() => handleAction(selectedApp.id, {
              action: 'conditional_approve',
              reviewedBy: 'Admin',
              conditionalApprovalNotes: conditionalNotes,
              requiredDocuments: requiredDocs,
            })} disabled={isProcessing || !conditionalNotes || requiredDocs.length === 0}>
              {isProcessing ? 'Processing...' : 'Approve Conditionally'}
            </Button>
          </DialogFooter>
        </>
      )
    }

    if (action === 'reject') {
      return (
        <>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>Reject {selectedApp.fullName}'s application</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rejection Reason *</Label>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Explain why this application is being rejected..."
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedApp(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => handleAction(selectedApp.id, {
              action: 'reject',
              reviewedBy: 'Admin',
              reviewNotes,
            })} disabled={isProcessing || !reviewNotes}>
              {isProcessing ? 'Processing...' : 'Reject Application'}
            </Button>
          </DialogFooter>
        </>
      )
    }

    if (action === 'final_approve') {
      return (
        <>
          <DialogHeader>
            <DialogTitle>Final Approval</DialogTitle>
            <DialogDescription>Give final approval and create loan for {selectedApp.fullName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                This will create a borrower record and active loan for ${selectedApp.loanAmount.toLocaleString()}.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedApp(null)}>Cancel</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleAction(selectedApp.id, {
              action: 'final_approve',
              finalApprovedBy: 'Admin',
            })} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Final Approve'}
            </Button>
          </DialogFooter>
        </>
      )
    }

    if (action === 'disburse') {
      return (
        <>
          <DialogHeader>
            <DialogTitle>Disburse Funds</DialogTitle>
            <DialogDescription>Process disbursement to {selectedApp.fullName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Disbursement Amount *</Label>
              <Input
                type="number"
                step="0.01"
                value={disbursementAmount}
                onChange={(e) => setDisbursementAmount(e.target.value)}
                placeholder={selectedApp.loanAmount.toString()}
              />
            </div>
            <div>
              <Label>Disbursement Method *</Label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={disbursementMethod}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDisbursementMethod(e.target.value)}
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="check">Check</option>
                <option value="cash">Cash</option>
                <option value="wire">Wire Transfer</option>
              </select>
            </div>
            <div>
              <Label>Reference Number (Optional)</Label>
              <Input
                value={disbursementReference}
                onChange={(e) => setDisbursementReference(e.target.value)}
                placeholder="Transaction reference..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedApp(null)}>Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleAction(selectedApp.id, {
              action: 'disburse',
              disbursedBy: 'Admin',
              disbursementAmount: parseFloat(disbursementAmount),
              disbursementMethod,
              disbursementReference,
            })} disabled={isProcessing || !disbursementAmount}>
              {isProcessing ? 'Processing...' : 'Disburse Funds'}
            </Button>
          </DialogFooter>
        </>
      )
    }

    return null
  }

  const statusOptions: Array<'ALL' | ApplicationStatus> = [
    'ALL', 'SUBMITTED', 'UNDER_REVIEW', 'CONDITIONALLY_APPROVED',
    'DOCUMENTS_SIGNED', 'APPROVED', 'DISBURSED', 'REJECTED'
  ]

  const pendingCount = applications.filter(app =>
    ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_SIGNED'].includes(app.status)
  ).length

  return (
    <div ref={pageRef} className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-sm border-b border-blue-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard">
                <Button variant="ghost" size="sm" className="hover:bg-blue-50 dark:hover:bg-gray-700">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Loan Applications</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage application workflow</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              {pendingCount > 0 && (
                <Badge className="bg-yellow-500 text-white px-3 py-1">
                  {pendingCount} Needs Action
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6 border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-xl">
              <Filter className="h-5 w-5 mr-2 text-blue-600" />
              Filter by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((status) => (
                <Button
                  key={status}
                  variant={filter === status ? 'default' : 'outline'}
                  onClick={() => setFilter(status)}
                  className={filter === status ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  size="sm"
                >
                  {status.replace(/_/g, ' ')}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Applications */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
            </div>
          </div>
        ) : applications.length === 0 ? (
          <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-lg">
            <CardContent className="text-center py-16">
              <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No applications</h3>
              <p className="text-gray-600 dark:text-gray-400">No {filter.toLowerCase().replace(/_/g, ' ')} applications found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {applications.map((app) => (
              <Card key={app.id} className="application-card border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {app.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{app.fullName}</CardTitle>
                        <CardDescription>Applied {format(new Date(app.createdAt), 'MMM dd, yyyy')}</CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm"><Mail className="h-4 w-4 mr-2 text-blue-500" />{app.email}</div>
                      <div className="flex items-center text-sm"><Phone className="h-4 w-4 mr-2 text-green-500" />{app.phone}</div>
                      <div className="flex items-center text-sm"><MapPin className="h-4 w-4 mr-2 text-purple-500" />{app.address}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm"><Briefcase className="h-4 w-4 mr-2 text-orange-500" />{app.employmentStatus}</div>
                      <div className="flex items-center text-sm"><DollarSign className="h-4 w-4 mr-2 text-green-600" />Monthly: ${app.monthlyIncome.toLocaleString()}</div>
                      <div className="flex items-center text-sm font-semibold text-blue-600"><DollarSign className="h-4 w-4 mr-2" />Loan: ${app.loanAmount.toLocaleString()}</div>
                    </div>
                  </div>

                  {app.conditionalApprovalNotes && (
                    <div className="mb-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <h4 className="text-sm font-semibold mb-1">Conditions:</h4>
                      <p className="text-sm">{app.conditionalApprovalNotes}</p>
                      {app.requiredDocuments && (
                        <div className="mt-2">
                          <p className="text-xs font-semibold">Required:</p>
                          <ul className="text-xs list-disc list-inside">
                            {JSON.parse(app.requiredDocuments).map((doc: string, i: number) => (
                              <li key={i}>{doc}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 flex-wrap">
                    {getAvailableActions(app).map((action) => (
                      <Button
                        key={action.action}
                        variant={action.variant as any}
                        size="sm"
                        onClick={() => {
                          setSelectedApp({ ...app, _dialogAction: action.action } as any)
                          resetForms()
                          if (action.action === 'disburse') {
                            setDisbursementAmount(app.loanAmount.toString())
                          }
                        }}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-800">
          {renderActionDialog()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
