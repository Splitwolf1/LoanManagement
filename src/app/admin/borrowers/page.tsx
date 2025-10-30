'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { 
  PlusCircle, Search, Edit, Trash2, Eye, ArrowLeft, Phone, Mail, MapPin, 
  Users, Filter, SortAsc, Grid, List, UserCheck, UserX, Building2,
  Sparkles, Star, Activity, TrendingUp
} from 'lucide-react'
import { useBorrowers, useCreateBorrower, useUpdateBorrower, useDeleteBorrower } from '@/hooks/use-api'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { gsap } from 'gsap'
import { ThemeToggle } from '@/components/ui/theme-toggle'

const BorrowerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
})

type BorrowerFormData = z.infer<typeof BorrowerSchema>

export default function BorrowersPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingBorrower, setEditingBorrower] = useState<any>(null)
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')

  const pageRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const filtersRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLDivElement>(null)

  const { data: borrowersData, isLoading } = useBorrowers({
    page,
    limit: 10,
    search: searchQuery,
  })

  const createBorrower = useCreateBorrower()
  const updateBorrower = useUpdateBorrower(editingBorrower?.id)
  const deleteBorrower = useDeleteBorrower()

  const form = useForm<BorrowerFormData>({
    resolver: zodResolver(BorrowerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
    },
  })

  useEffect(() => {
    if (!isLoading && borrowersData && pageRef.current) {
      const tl = gsap.timeline()
      
      tl.fromTo(headerRef.current, 
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      )
      .fromTo(filtersRef.current, 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 },
        "-=0.3"
      )
      .fromTo(tableRef.current, 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6 },
        "-=0.2"
      )
    }
  }, [isLoading, borrowersData])

  const onSubmit = async (data: BorrowerFormData) => {
    try {
      if (editingBorrower) {
        await updateBorrower.mutateAsync(data)
        setEditingBorrower(null)
      } else {
        await createBorrower.mutateAsync(data)
        setIsCreateDialogOpen(false)
      }
      form.reset()
    } catch (error) {
      console.error('Error saving borrower:', error)
    }
  }

  const handleEdit = (borrower: any) => {
    setEditingBorrower(borrower)
    form.reset({
      name: borrower.name,
      email: borrower.email || '',
      phone: borrower.phone || '',
      address: borrower.address || '',
      notes: borrower.notes || '',
    })
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this borrower?')) {
      try {
        await deleteBorrower.mutateAsync(id)
      } catch (error) {
        console.error('Error deleting borrower:', error)
      }
    }
  }

  const handleCardHover = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, { 
      y: -8, 
      boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
      duration: 0.3,
      ease: "power2.out"
    })
  }

  const handleCardLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, { 
      y: 0, 
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      duration: 0.3,
      ease: "power2.out"
    })
  }

  const borrowers = borrowersData?.borrowers || []
  const pagination = borrowersData?.pagination

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
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Borrowers
                  </h1>
                  <p className="text-sm text-gray-600">Loading borrower information...</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 opacity-20 animate-pulse"></div>
              </div>
              <p className="mt-4 text-gray-600">Loading borrowers...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div ref={pageRef} className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="h-full w-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e0e7ff' fill-opacity='0.4'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>
      
      {/* Header */}
      <header ref={headerRef} className="relative bg-white/80 backdrop-blur-lg shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard">
                <Button variant="ghost" size="sm" className="hover:bg-blue-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 transition-all duration-200">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Borrowers
                  </h1>
                  <p className="text-sm text-gray-600">Manage borrower information</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <div className="flex items-center bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg border border-white/20 dark:border-gray-700/20 shadow-sm">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="rounded-r-none"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-l-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>

              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Borrower
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md bg-white/95 backdrop-blur-sm">
                  <DialogHeader>
                    <DialogTitle className="flex items-center text-xl">
                      <UserCheck className="h-5 w-5 mr-2 text-blue-600" />
                      Add New Borrower
                    </DialogTitle>
                    <DialogDescription>
                      Enter the borrower&apos;s information below to create their profile.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name *</Label>
                      <Input
                        id="name"
                        {...form.register('name')}
                        placeholder="Enter full name"
                        className="mt-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                      {form.formState.errors.name && (
                        <p className="text-sm text-red-600 mt-1 flex items-center">
                          <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                          {form.formState.errors.name.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        {...form.register('email')}
                        placeholder="Enter email address"
                        className="mt-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                      {form.formState.errors.email && (
                        <p className="text-sm text-red-600 mt-1 flex items-center">
                          <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                          {form.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone</Label>
                      <Input
                        id="phone"
                        {...form.register('phone')}
                        placeholder="Enter phone number"
                        className="mt-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address" className="text-sm font-medium text-gray-700">Address</Label>
                      <Input
                        id="address"
                        {...form.register('address')}
                        placeholder="Enter address"
                        className="mt-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes" className="text-sm font-medium text-gray-700">Notes</Label>
                      <Input
                        id="notes"
                        {...form.register('notes')}
                        placeholder="Additional notes"
                        className="mt-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <DialogFooter className="pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                        className="hover:bg-gray-50"
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createBorrower.isPending} className="bg-blue-600 hover:bg-blue-700">
                        {createBorrower.isPending ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                            Creating...
                          </div>
                        ) : (
                          'Create Borrower'
                        )}
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
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <Card ref={filtersRef} className="mb-8 border-0 bg-white/70 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-xl">
              <Search className="h-5 w-5 mr-2 text-blue-600" />
              Search & Filter
            </CardTitle>
            <CardDescription>Find borrowers by name, email, or phone number</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search borrowers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white/80"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-300">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-300">
                  <SortAsc className="h-4 w-4 mr-2" />
                  Sort
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Borrowers Table/Grid */}
        <Card ref={tableRef} className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                All Borrowers ({pagination?.total || 0})
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  <span>{borrowers.filter((b: any) => b.loans?.some((l: any) => l.status === 'ACTIVE')).length} active</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-1"></div>
                  <span>{borrowers.filter((b: any) => !b.loans?.length).length} no loans</span>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {borrowers.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No borrowers found</h3>
                <p className="text-gray-600 mb-6">Get started by adding your first borrower to the system.</p>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Your First Borrower
                </Button>
              </div>
            ) : viewMode === 'table' ? (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <Table>
                  <TableHeader className="bg-gray-50/80">
                    <TableRow>
                      <TableHead className="font-semibold text-gray-700">Name</TableHead>
                      <TableHead className="font-semibold text-gray-700">Contact</TableHead>
                      <TableHead className="font-semibold text-gray-700">Loans</TableHead>
                      <TableHead className="font-semibold text-gray-700">Status</TableHead>
                      <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {borrowers.map((borrower: any) => (
                      <TableRow key={borrower.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-medium shadow-md">
                              {borrower.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{borrower.name}</div>
                              {borrower.notes && (
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {borrower.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {borrower.email && (
                              <div className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors">
                                <Mail className="h-3 w-3 mr-2" />
                                {borrower.email}
                              </div>
                            )}
                            {borrower.phone && (
                              <div className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors">
                                <Phone className="h-3 w-3 mr-2" />
                                {borrower.phone}
                              </div>
                            )}
                            {borrower.address && (
                              <div className="flex items-center text-sm text-gray-500">
                                <MapPin className="h-3 w-3 mr-2" />
                                {borrower.address}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{borrower.loans?.length || 0} loans</span>
                              {borrower.loans?.length > 0 && (
                                <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                  {borrower.loans.filter((l: any) => l.status === 'ACTIVE').length} active
                                </div>
                              )}
                            </div>
                            {borrower.loans?.length > 0 && (
                              <div className="text-gray-500 mt-1">
                                Last activity: {new Date(borrower.loans[0].createdAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {borrower.loans?.some((l: any) => l.status === 'ACTIVE') ? (
                              <div className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                <Activity className="h-3 w-3 mr-1" />
                                Active
                              </div>
                            ) : borrower.loans?.length > 0 ? (
                              <div className="flex items-center px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                                <Star className="h-3 w-3 mr-1" />
                                Completed
                              </div>
                            ) : (
                              <div className="flex items-center px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                                <UserCheck className="h-3 w-3 mr-1" />
                                New
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/borrowers/${borrower.id}`)}
                              className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(borrower)}
                              className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(borrower.id)}
                              className="hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              // Grid View
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {borrowers.map((borrower: any) => (
                  <Card 
                    key={borrower.id} 
                    className="relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
                    onMouseEnter={handleCardHover}
                    onMouseLeave={handleCardLeave}
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-bl-full"></div>
                    <CardHeader className="relative pb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {borrower.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg text-gray-900">{borrower.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {borrower.loans?.length || 0} loans • {borrower.loans?.filter((l: any) => l.status === 'ACTIVE').length || 0} active
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="space-y-2 mb-4">
                        {borrower.email && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-3 w-3 mr-2 text-blue-500" />
                            {borrower.email}
                          </div>
                        )}
                        {borrower.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-3 w-3 mr-2 text-green-500" />
                            {borrower.phone}
                          </div>
                        )}
                        {borrower.address && (
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="h-3 w-3 mr-2 text-purple-500" />
                            <span className="truncate">{borrower.address}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                          {borrower.loans?.some((l: any) => l.status === 'ACTIVE') ? (
                            <div className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              Active
                            </div>
                          ) : borrower.loans?.length > 0 ? (
                            <div className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                              Completed
                            </div>
                          ) : (
                            <div className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                              New
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/borrowers/${borrower.id}`)}
                            className="hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(borrower)}
                            className="hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} borrowers
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="hover:bg-blue-50 hover:border-blue-300"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.pages}
                    className="hover:bg-blue-50 hover:border-blue-300"
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
      <Dialog open={!!editingBorrower} onOpenChange={() => setEditingBorrower(null)}>
        <DialogContent className="max-w-md bg-white/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl">
              <Edit className="h-5 w-5 mr-2 text-blue-600" />
              Edit Borrower
            </DialogTitle>
            <DialogDescription>
              Update borrower information below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name *</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="Enter full name"
                className="mt-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                placeholder="Enter email address"
                className="mt-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone</Label>
              <Input
                id="phone"
                {...form.register('phone')}
                placeholder="Enter phone number"
                className="mt-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="address" className="text-sm font-medium text-gray-700">Address</Label>
              <Input
                id="address"
                {...form.register('address')}
                placeholder="Enter address"
                className="mt-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="notes" className="text-sm font-medium text-gray-700">Notes</Label>
              <Input
                id="notes"
                {...form.register('notes')}
                placeholder="Additional notes"
                className="mt-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingBorrower(null)}
                className="hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateBorrower.isPending} className="bg-blue-600 hover:bg-blue-700">
                {updateBorrower.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Updating...
                  </div>
                ) : (
                  'Update Borrower'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}