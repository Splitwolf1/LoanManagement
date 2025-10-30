'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  FileText, CheckCircle, Upload, ArrowLeft, AlertCircle, Clock, Eye, FileCheck, Banknote
} from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { format } from 'date-fns'

type ApplicationStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'CONDITIONALLY_APPROVED' | 'DOCUMENTS_SIGNED' | 'APPROVED' | 'DISBURSED' | 'REJECTED'

interface LoanApplication {
  id: string
  fullName: string
  email: string
  loanAmount: number
  loanPurpose: string
  status: ApplicationStatus
  reviewNotes: string | null
  conditionalApprovalNotes: string | null
  requiredDocuments: string | null
  signedDocuments: string | null
  documentsSignedAt: string | null
  finalApprovedAt: string | null
  disbursedAt: string | null
  disbursementAmount: number | null
  createdAt: string
}

export default function ApplicationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [application, setApplication] = useState<LoanApplication | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedDocs, setUploadedDocs] = useState<File[]>([])

  useEffect(() => {
    fetchApplication()
  }, [])

  const fetchApplication = async () => {
    try {
      const response = await fetch(`/api/loan-applications/${params.id}`)
      if (!response.ok) throw new Error('Application not found')
      const data = await response.json()
      setApplication(data)
    } catch (error) {
      console.error('Error fetching application:', error)
      alert('Failed to load application')
      router.push('/borrower/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignDocuments = async () => {
    if (uploadedDocs.length === 0) {
      alert('Please upload all required documents')
      return
    }

    setIsSubmitting(true)
    try {
      const documentNames = uploadedDocs.map(doc => doc.name)
      const response = await fetch(`/api/loan-applications/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sign_documents',
          signedDocuments: documentNames,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit documents')
      }

      alert('Documents submitted successfully! Your application is now being reviewed for final approval.')
      router.push('/borrower/dashboard')
    } catch (error) {
      console.error('Error submitting documents:', error)
      alert(error instanceof Error ? error.message : 'Failed to submit documents')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: ApplicationStatus) => {
    const badges = {
      SUBMITTED: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Submitted' },
      UNDER_REVIEW: { color: 'bg-purple-100 text-purple-800', icon: Eye, label: 'Under Review' },
      CONDITIONALLY_APPROVED: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, label: 'Action Required' },
      DOCUMENTS_SIGNED: { color: 'bg-indigo-100 text-indigo-800', icon: FileCheck, label: 'Pending Final Approval' },
      APPROVED: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approved' },
      DISBURSED: { color: 'bg-emerald-100 text-emerald-800', icon: Banknote, label: 'Funds Disbursed' },
      REJECTED: { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Rejected' },
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent"></div>
      </div>
    )
  }

  if (!application) {
    return null
  }

  const requiredDocs = application.requiredDocuments ? JSON.parse(application.requiredDocuments) : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-success/10">
      {/* Header */}
      <div className="bg-card/50 backdrop-blur-lg border-b border-border/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-accent to-success">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Loan Application</h1>
                <p className="text-muted-foreground">Application #{application.id.slice(0, 8)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link href="/borrower/dashboard">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Card */}
        <Card className="mb-6 border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Application Status</CardTitle>
              {getStatusBadge(application.status)}
            </div>
            <CardDescription>
              Applied on {format(new Date(application.createdAt), 'MMMM dd, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <span className="font-semibold">Loan Amount:</span>
                <span className="text-2xl font-bold text-accent">${application.loanAmount.toLocaleString()}</span>
              </div>
              <div>
                <Label className="font-semibold">Purpose:</Label>
                <p className="text-sm mt-1">{application.loanPurpose}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Timeline */}
        <Card className="mb-6 border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Application Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-semibold">Submitted</p>
                  <p className="text-sm text-muted-foreground">{format(new Date(application.createdAt), 'MMM dd, yyyy')}</p>
                </div>
              </div>

              {['UNDER_REVIEW', 'CONDITIONALLY_APPROVED', 'DOCUMENTS_SIGNED', 'APPROVED', 'DISBURSED'].includes(application.status) && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold">Under Review</p>
                    <p className="text-sm text-muted-foreground">Application is being reviewed</p>
                  </div>
                </div>
              )}

              {['CONDITIONALLY_APPROVED', 'DOCUMENTS_SIGNED', 'APPROVED', 'DISBURSED'].includes(application.status) && (
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    application.status === 'CONDITIONALLY_APPROVED' ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-green-100 dark:bg-green-900'
                  }`}>
                    <AlertCircle className={`w-5 h-5 ${
                      application.status === 'CONDITIONALLY_APPROVED' ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
                    }`} />
                  </div>
                  <div>
                    <p className="font-semibold">Conditionally Approved</p>
                    <p className="text-sm text-muted-foreground">
                      {application.status === 'CONDITIONALLY_APPROVED' ? 'Action required' : 'Completed'}
                    </p>
                  </div>
                </div>
              )}

              {['DOCUMENTS_SIGNED', 'APPROVED', 'DISBURSED'].includes(application.status) && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold">Documents Signed</p>
                    <p className="text-sm text-muted-foreground">
                      {application.documentsSignedAt && format(new Date(application.documentsSignedAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              )}

              {['APPROVED', 'DISBURSED'].includes(application.status) && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold">Final Approval</p>
                    <p className="text-sm text-muted-foreground">
                      {application.finalApprovedAt && format(new Date(application.finalApprovedAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              )}

              {application.status === 'DISBURSED' && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                    <Banknote className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold">Funds Disbursed</p>
                    <p className="text-sm text-muted-foreground">
                      {application.disbursedAt && format(new Date(application.disbursedAt), 'MMM dd, yyyy')}
                    </p>
                    <p className="text-sm font-semibold text-emerald-600">
                      ${application.disbursementAmount?.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {application.status === 'REJECTED' && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="font-semibold">Rejected</p>
                    {application.reviewNotes && (
                      <p className="text-sm text-muted-foreground">{application.reviewNotes}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Conditional Approval - Document Signing */}
        {application.status === 'CONDITIONALLY_APPROVED' && (
          <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                Action Required: Sign Documents
              </CardTitle>
              <CardDescription>
                Your application has been conditionally approved! Please upload the following documents to proceed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {application.conditionalApprovalNotes && (
                <div className="p-4 bg-card rounded-lg">
                  <Label className="font-semibold">Conditions:</Label>
                  <p className="text-sm mt-2">{application.conditionalApprovalNotes}</p>
                </div>
              )}

              <div>
                <Label className="font-semibold mb-3 block">Required Documents:</Label>
                <ul className="list-disc list-inside space-y-2 mb-4">
                  {requiredDocs.map((doc: string, i: number) => (
                    <li key={i} className="text-sm">{doc}</li>
                  ))}
                </ul>
              </div>

              <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center hover:border-accent transition-colors">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <Label htmlFor="documents" className="cursor-pointer">
                  <div className="text-lg font-semibold mb-2">Upload Signed Documents</div>
                  <p className="text-sm text-muted-foreground mb-4">
                    PDF, JPG, or PNG files
                  </p>
                  <Button type="button" variant="outline" className="gap-2">
                    <Upload className="w-4 h-4" />
                    Choose Files
                  </Button>
                </Label>
                <Input
                  id="documents"
                  type="file"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      setUploadedDocs(Array.from(e.target.files))
                    }
                  }}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>

              {uploadedDocs.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Uploaded Files:</h4>
                  {uploadedDocs.map((file, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                      <FileText className="w-4 h-4 text-accent" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                  ))}
                </div>
              )}

              <Button
                className="w-full bg-gradient-to-r from-accent to-success text-white"
                onClick={handleSignDocuments}
                disabled={isSubmitting || uploadedDocs.length === 0}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Documents'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Approved - Waiting for Disbursement */}
        {application.status === 'DOCUMENTS_SIGNED' && (
          <Card className="border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <FileCheck className="w-16 h-16 mx-auto mb-4 text-indigo-600" />
                <h3 className="text-lg font-semibold mb-2">Documents Submitted Successfully</h3>
                <p className="text-sm text-muted-foreground">
                  Your signed documents have been received and are being reviewed for final approval.
                  We'll notify you once the review is complete.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {application.status === 'APPROVED' && (
          <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
                <h3 className="text-lg font-semibold mb-2">Loan Approved!</h3>
                <p className="text-sm text-muted-foreground">
                  Congratulations! Your loan has been approved. The disbursement is being processed and
                  you will receive the funds shortly.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
