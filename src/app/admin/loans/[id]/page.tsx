'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { ArrowLeft, DollarSign, Calendar, AlertTriangle, CheckCircle, User, CreditCard, Plus, Edit, Trash2 } from 'lucide-react'
import { useLoan, usePayments, useCreatePayment, useDeletePayment } from '@/hooks/use-api'
import { formatCurrency, formatPercentage } from '@/lib/loan-utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const PaymentSchema = z.object({
  amount: z.string().min(1, 'Amount is required').transform(val => parseFloat(val)),
  notes: z.string().optional(),
})

type PaymentFormData = z.infer<typeof PaymentSchema>

interface LoanDetailPageProps {
  params: { id: string }
}

export default function LoanDetailPage({ params }: LoanDetailPageProps) {
  const router = useRouter()
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)

  const { data: loan, isLoading: loanLoading } = useLoan(params.id)
  const { data: paymentsData, isLoading: paymentsLoading } = usePayments({
    loanId: params.id,
    limit: 50,
  })

  const createPayment = useCreatePayment()
  const deletePayment = useDeletePayment()

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(PaymentSchema),
    defaultValues: {
      amount: '',
      notes: '',
    },
  })

  const onSubmit = async (data: PaymentFormData) => {
    try {
      await createPayment.mutateAsync({
        loanId: params.id,
        amount: Number(data.amount),
        notes: data.notes,
      })
      setIsPaymentDialogOpen(false)
      form.reset()
    } catch (error) {
      console.error('Error creating payment:', error)
    }
  }

  const handleDeletePayment = async (paymentId: string) => {
    if (confirm('Are you sure you want to delete this payment?')) {
      try {
        await deletePayment.mutateAsync(paymentId)
      } catch (error) {
        console.error('Error deleting payment:', error)
      }
    }
  }

  const getStatusBadge = (loan: any) => {
    if (loan.status === 'PAID') {
      return <Badge variant="success">Paid</Badge>
    }
    if (loan.isOverdue) {
      return <Badge variant="danger">Overdue</Badge>
    }
    if (loan.status === 'DEFAULTED') {
      return <Badge variant="danger">Defaulted</Badge>
    }
    return <Badge variant="default">Active</Badge>
  }

  if (loanLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!loan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Loan not found</h2>
          <Link href="/loans">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Loans
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const payments = paymentsData?.payments || []
  const progressPercentage = Math.min((loan.totalPaid / loan.totalOwed) * 100, 100)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/loans">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Loans
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Loan Details</h1>
                <p className="text-sm text-gray-600">{loan.borrower.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusBadge(loan)}
              <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                <DialogTrigger asChild>
                  <Button disabled={loan.status === 'PAID'}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Record Payment</DialogTitle>
                    <DialogDescription>
                      Add a payment for this loan. Current balance: {formatCurrency(loan.balance)}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <Label htmlFor="amount">Payment Amount (CAD) *</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        {...form.register('amount')}
                        placeholder={`Max: ${loan.balance.toFixed(2)}`}
                      />
                      {form.formState.errors.amount && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.amount.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Input
                        id="notes"
                        {...form.register('notes')}
                        placeholder="Payment method, reference number, etc."
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsPaymentDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createPayment.isPending}>
                        {createPayment.isPending ? 'Recording...' : 'Record Payment'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Loan Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Loan Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Loan Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Original Amount</p>
                    <p className="text-2xl font-bold">{formatCurrency(loan.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Owed</p>
                    <p className="text-2xl font-bold">{formatCurrency(loan.totalOwed)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Paid</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(loan.totalPaid)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Balance</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(loan.balance)}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Payment Progress</span>
                    <span>{formatPercentage(progressPercentage)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loan Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Loan Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Interest Rate</p>
                    <p className="text-lg font-semibold">{loan.interestRate}%</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Issue Date</p>
                    <p className="text-lg font-semibold">
                      {new Date(loan.issuedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Due Date</p>
                    <p className="text-lg font-semibold">
                      {new Date(loan.dueDate).toLocaleDateString()}
                      {loan.isOverdue && (
                        <span className="text-red-600 text-sm ml-2">
                          <AlertTriangle className="h-4 w-4 inline mr-1" />
                          Overdue
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Days Remaining</p>
                    <p className="text-lg font-semibold">
                      {Math.ceil((new Date(loan.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                    </p>
                  </div>
                </div>
                {loan.notes && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500">Notes</p>
                    <p className="text-gray-700">{loan.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment History ({payments.length})
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {paymentsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : payments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No payments recorded yet</p>
                    <Button
                      onClick={() => setIsPaymentDialogOpen(true)}
                      className="mt-4"
                      disabled={loan.status === 'PAID'}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Record First Payment
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment: any) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            {new Date(payment.paidAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-green-600">
                              {formatCurrency(payment.amount)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {payment.notes || '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePayment(payment.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Borrower Info & Quick Stats */}
          <div className="space-y-6">
            {/* Borrower Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Borrower Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p className="font-semibold">{loan.borrower.name}</p>
                  </div>
                  {loan.borrower.email && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-blue-600">{loan.borrower.email}</p>
                    </div>
                  )}
                  {loan.borrower.phone && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p>{loan.borrower.phone}</p>
                    </div>
                  )}
                  {loan.borrower.address && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Address</p>
                      <p className="text-gray-700">{loan.borrower.address}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Loans</p>
                    <p className="font-semibold">{loan.borrower.loans?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={() => setIsPaymentDialogOpen(true)}
                  disabled={loan.status === 'PAID'}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push(`/loans/${loan.id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Loan
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push(`/borrowers/${loan.borrower.id}`)}
                >
                  <User className="h-4 w-4 mr-2" />
                  View Borrower
                </Button>
              </CardContent>
            </Card>

            {/* Loan Summary Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Payments Made</span>
                  <span className="font-medium">{payments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Average Payment</span>
                  <span className="font-medium">
                    {payments.length > 0 
                      ? formatCurrency(loan.totalPaid / payments.length)
                      : formatCurrency(0)
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Completion</span>
                  <span className="font-medium">{formatPercentage(progressPercentage)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}