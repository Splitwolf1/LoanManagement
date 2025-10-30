'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileText, Upload, CheckCircle2, ArrowRight, User, Building2, DollarSign, Loader2 } from 'lucide-react'
import { gsap } from 'gsap'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default function ApplyForLoanPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    employmentStatus: '',
    monthlyIncome: '',
    loanAmount: '',
    loanPurpose: '',
    documents: [] as File[]
  })

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.from('.form-card', {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    })
  }, [step])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (step < 3) {
      setStep(step + 1)
    } else {
      // Submit application to API
      setIsSubmitting(true)
      try {
        const documentNames = formData.documents.map(doc => doc.name)

        const response = await fetch('/api/loan-applications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            employmentStatus: formData.employmentStatus,
            monthlyIncome: parseFloat(formData.monthlyIncome),
            loanAmount: parseFloat(formData.loanAmount),
            loanPurpose: formData.loanPurpose,
            documents: documentNames,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to submit application')
        }

        // Success! Show success message and redirect
        alert('Application submitted successfully! Our team will review it and get back to you soon.')
        router.push('/borrower/dashboard')
      } catch (err) {
        console.error('Error submitting application:', err)
        setError(err instanceof Error ? err.message : 'Failed to submit application. Please try again.')
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, documents: Array.from(e.target.files) })
    }
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-success/10">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-success/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative bg-card/50 backdrop-blur-lg border-b border-border/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-accent to-success">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gradient-success">Apply for a Loan</h1>
                <p className="text-muted-foreground">Complete the application in 3 easy steps</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link href="/borrower/dashboard">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                step >= s ? 'bg-gradient-to-br from-accent to-success border-accent text-white' : 'border-border bg-card'
              }`}>
                {step > s ? <CheckCircle2 className="w-6 h-6" /> : s}
              </div>
              {s < 3 && (
                <div className={`w-24 h-1 mx-2 transition-all duration-300 ${
                  step > s ? 'bg-gradient-to-r from-accent to-success' : 'bg-border'
                }`} />
              )}
            </div>
          ))}
        </div>

        <Card className="form-card border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">
              {step === 1 && 'Personal Information'}
              {step === 2 && 'Loan Details'}
              {step === 3 && 'Upload Documents'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Tell us about yourself'}
              {step === 2 && 'Specify your loan requirements'}
              {step === 3 && 'Upload supporting documents'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="flex items-center gap-2">
                        <User className="w-4 h-4 text-accent" />
                        Full Name
                      </Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (416) 555-0123"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employmentStatus" className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-accent" />
                        Employment Status
                      </Label>
                      <Input
                        id="employmentStatus"
                        value={formData.employmentStatus}
                        onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                        placeholder="Self-employed"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="123 Main St, Toronto, ON"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthlyIncome">Monthly Income</Label>
                    <Input
                      id="monthlyIncome"
                      type="number"
                      value={formData.monthlyIncome}
                      onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                      placeholder="5000"
                      required
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="loanAmount" className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-accent" />
                      Loan Amount Requested
                    </Label>
                    <Input
                      id="loanAmount"
                      type="number"
                      value={formData.loanAmount}
                      onChange={(e) => setFormData({ ...formData, loanAmount: e.target.value })}
                      placeholder="10000"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loanPurpose">Purpose of Loan</Label>
                    <textarea
                      id="loanPurpose"
                      value={formData.loanPurpose}
                      onChange={(e) => setFormData({ ...formData, loanPurpose: e.target.value })}
                      placeholder="Describe what you'll use the loan for..."
                      className="w-full min-h-32 px-3 py-2 rounded-lg border border-border/50 bg-background focus:border-accent outline-none resize-none"
                      required
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center hover:border-accent transition-colors">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <Label htmlFor="documents" className="cursor-pointer">
                      <div className="text-lg font-semibold mb-2">Upload Documents</div>
                      <p className="text-sm text-muted-foreground mb-4">
                        ID, proof of income, utility bills, etc.
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
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                  </div>
                  {formData.documents.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-semibold">Uploaded Files:</h3>
                      {formData.documents.map((file, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                          <FileText className="w-4 h-4 text-accent" />
                          <span className="text-sm">{file.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    disabled={isSubmitting}
                  >
                    Back
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-accent to-success text-white gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      {step === 3 ? 'Submit Application' : 'Continue'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
