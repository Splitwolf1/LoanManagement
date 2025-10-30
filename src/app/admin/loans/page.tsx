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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { PlusCircle, Edit, Trash2, Eye, ArrowLeft, AlertTriangle, User } from 'lucide-react'
import { useLoans, useCreateLoan, useUpdateLoan, useDeleteLoan, useBorrowers } from '@/hooks/use-api'
import { formatCurrency, formatPercentage } from '@/lib/loan-utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ThemeToggle } from '@/components/ui/theme-toggle'

const LoanSchema = z.object({
  borrowerId: z.string().min(1, 'Borrower is required'),
  amount: z.string().min(1, 'Amount is required').transform(val => parseFloat(val)),
  interestRate: z.string().transform(val => val === '' ? 0 : parseFloat(val)),
  issuedAt: z.string().min(1, 'Issue date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  notes: z.string().optional(),
})

type LoanFormInput = z.input<typeof LoanSchema>
type LoanFormData = z.output<typeof LoanSchema>

interface Loan {
  id: string
  borrowerId: string
  amount: number
  interestRate: number
  issuedAt: string
  dueDate: string
  status: string
  notes?: string
  balance: number
  totalPaid: number
  totalOwed: number
  isOverdue: boolean
  borrower: {
    id: string
    name: string
  }
}

interface Borrower {
  id: string
  name: string
  email?: string
}

export default function LoansPage() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null)
  const [page, setPage] = useState(1)

  const { data: loansData, isLoading } = useLoans({
    page,
    limit: 10,
    status: statusFilter || undefined,
  })

  const { data: borrowersData } = useBorrowers({ limit: 100 })

  const createLoan = useCreateLoan()
  const updateLoan = useUpdateLoan(editingLoan?.id ?? '')
  const deleteLoan = useDeleteLoan()

  const form = useForm<LoanFormInput, unknown, LoanFormData>({
    resolver: zodResolver(LoanSchema),
    defaultValues: {
      borrowerId: '',
      amount: '',
      interestRate: '',
      issuedAt: new Date().toISOString().split('T')[0],
      dueDate: '',
      notes: '',
    },
  })

  const onSubmit = async (data: LoanFormData) => {
    try {
      if (editingLoan) {
        await updateLoan.mutateAsync(data)
        setEditingLoan(null)
      } else {
        await createLoan.mutateAsync(data)
        setIsCreateDialogOpen(false)
      }
      form.reset()
    } catch (error) {
      console.error('Error saving loan:', error)
    }
  }

  const handleEdit = (loan: Loan) => {
    setEditingLoan(loan)
    form.reset({
      borrowerId: loan.borrowerId,
      amount: loan.amount.toString(),
      interestRate: loan.interestRate?.toString() || '0',
      issuedAt: loan.issuedAt.split('T')[0],
      dueDate: loan.dueDate.split('T')[0],
      notes: loan.notes || '',
    })
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this loan?')) {
      try {
        await deleteLoan.mutateAsync(id)
      } catch (error) {
        console.error('Error deleting loan:', error)
      }
    }
  }

  const getStatusBadge = (loan: Loan) => {
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

  const loans = loansData?.loans || []
  const pagination = loansData?.pagination
  const borrowers = borrowersData?.borrowers || []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard">
                <Button variant="ghost" size="sm" className="hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Loans</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage loan accounts and payments</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Loan
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Loan</DialogTitle>
                  <DialogDescription>
                    Enter the loan details below.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="borrowerId">Borrower *</Label>
                    <Select 
                      value={form.watch('borrowerId')} 
                      onValueChange={(value) => form.setValue('borrowerId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a borrower" />
                      </SelectTrigger>
                      <SelectContent>
                        {borrowers.map((borrower: Borrower) => (
                          <SelectItem key={borrower.id} value={borrower.id}>
                            {borrower.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.borrowerId && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.borrowerId.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount (CAD) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      {...form.register('amount')}
                      placeholder="5000.00"
                    />
                    {form.formState.errors.amount && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.amount.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="interestRate">Interest Rate (%)</Label>
                    <Input
                      id="interestRate"
                      type="number"
                      step="0.1"
                      {...form.register('interestRate')}
                      placeholder="3.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="issuedAt">Issue Date *</Label>
                    <Input
                      id="issuedAt"
                      type="date"
                      {...form.register('issuedAt')}
                    />
                    {form.formState.errors.issuedAt && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.issuedAt.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date *</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      {...form.register('dueDate')}
                    />
                    {form.formState.errors.dueDate && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.dueDate.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      {...form.register('notes')}
                      placeholder="Purpose of loan"
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createLoan.isPending}>
                      {createLoan.isPending ? 'Creating...' : 'Create Loan'}
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
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter Loans</CardTitle>
            <CardDescription>Filter by loan status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Select value={statusFilter || "ALL"} onValueChange={(value) => setStatusFilter(value === "ALL" ? "" : value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                  <SelectItem value="DEFAULTED">Defaulted</SelectItem>
                </SelectContent>
              </Select>
              {statusFilter && (
                <Button variant="outline" onClick={() => setStatusFilter('')}>
                  Clear Filter
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Loans Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              All Loans ({pagination?.total || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : loans.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No loans found</p>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="mt-4"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Your First Loan
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Borrower</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans.map((loan: Loan) => (
                    <TableRow key={loan.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {loan.borrower.name}
                          </div>
                          {loan.notes && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {loan.notes}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{formatCurrency(loan.amount)}</div>
                          {loan.interestRate > 0 && (
                            <div className="text-sm text-gray-500">
                              {loan.interestRate}% interest
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{formatCurrency(loan.balance)}</div>
                          <div className="text-sm text-gray-500">
                            Paid: {formatCurrency(loan.totalPaid)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${Math.min((loan.totalPaid / loan.totalOwed) * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {formatPercentage((loan.totalPaid / loan.totalOwed) * 100)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(loan)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(loan.dueDate).toLocaleDateString()}
                          {loan.isOverdue && (
                            <div className="text-red-600 text-xs">
                              <AlertTriangle className="h-3 w-3 inline mr-1" />
                              Overdue
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/loans/${loan.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(loan)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(loan.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-600">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} loans
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Edit Dialog */}
      <Dialog open={!!editingLoan} onOpenChange={() => setEditingLoan(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Loan</DialogTitle>
            <DialogDescription>
              Update loan information below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="borrowerId">Borrower *</Label>
              <Select 
                value={form.watch('borrowerId')} 
                onValueChange={(value) => form.setValue('borrowerId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a borrower" />
                </SelectTrigger>
                <SelectContent>
                  {borrowers.map((borrower: Borrower) => (
                    <SelectItem key={borrower.id} value={borrower.id}>
                      {borrower.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">Amount (CAD) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...form.register('amount')}
                placeholder="5000.00"
              />
            </div>
            <div>
              <Label htmlFor="interestRate">Interest Rate (%)</Label>
              <Input
                id="interestRate"
                type="number"
                step="0.1"
                {...form.register('interestRate')}
                placeholder="3.5"
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                {...form.register('dueDate')}
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                {...form.register('notes')}
                placeholder="Purpose of loan"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingLoan(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateLoan.isPending}>
                {updateLoan.isPending ? 'Updating...' : 'Update Loan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}