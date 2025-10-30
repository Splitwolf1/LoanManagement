import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const API_BASE = '/api'

// API client helper
async function apiClient(endpoint: string, options?: RequestInit) {
  const url = `${API_BASE}${endpoint}`
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }))
    throw new Error(error.error || 'API request failed')
  }

  return response.json()
}

// Summary data hook
export function useSummaryData() {
  return useQuery({
    queryKey: ['summary'],
    queryFn: () => apiClient('/reports/summary'),
  })
}

// Borrowers hooks
export function useBorrowers(params?: { page?: number; limit?: number; search?: string }) {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set('page', params.page.toString())
  if (params?.limit) searchParams.set('limit', params.limit.toString())
  if (params?.search) searchParams.set('search', params.search)

  return useQuery({
    queryKey: ['borrowers', params],
    queryFn: () => apiClient(`/borrowers?${searchParams}`),
  })
}

export function useBorrower(id: string) {
  return useQuery({
    queryKey: ['borrower', id],
    queryFn: () => apiClient(`/borrowers/${id}`),
    enabled: !!id,
  })
}

export function useCreateBorrower() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: any) => apiClient('/borrowers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borrowers'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
    },
  })
}

export function useUpdateBorrower(id: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: any) => apiClient(`/borrowers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borrowers'] })
      queryClient.invalidateQueries({ queryKey: ['borrower', id] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
    },
  })
}

export function useDeleteBorrower() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => apiClient(`/borrowers/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borrowers'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
    },
  })
}

// Loans hooks
export function useLoans(params?: { 
  page?: number; 
  limit?: number; 
  status?: string;
  borrowerId?: string;
}) {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set('page', params.page.toString())
  if (params?.limit) searchParams.set('limit', params.limit.toString())
  if (params?.status) searchParams.set('status', params.status)
  if (params?.borrowerId) searchParams.set('borrowerId', params.borrowerId)

  return useQuery({
    queryKey: ['loans', params],
    queryFn: () => apiClient(`/loans?${searchParams}`),
  })
}

export function useLoan(id: string) {
  return useQuery({
    queryKey: ['loan', id],
    queryFn: () => apiClient(`/loans/${id}`),
    enabled: !!id,
  })
}

export function useCreateLoan() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: any) => apiClient('/loans', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] })
      queryClient.invalidateQueries({ queryKey: ['borrowers'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
    },
  })
}

export function useUpdateLoan(id: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: any) => apiClient(`/loans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] })
      queryClient.invalidateQueries({ queryKey: ['loan', id] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
    },
  })
}

export function useDeleteLoan() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => apiClient(`/loans/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] })
      queryClient.invalidateQueries({ queryKey: ['borrowers'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
    },
  })
}

// Payments hooks
export function usePayments(params?: { 
  page?: number; 
  limit?: number; 
  loanId?: string;
}) {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set('page', params.page.toString())
  if (params?.limit) searchParams.set('limit', params.limit.toString())
  if (params?.loanId) searchParams.set('loanId', params.loanId)

  return useQuery({
    queryKey: ['payments', params],
    queryFn: () => apiClient(`/payments?${searchParams}`),
  })
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: ['payment', id],
    queryFn: () => apiClient(`/payments/${id}`),
    enabled: !!id,
  })
}

export function useCreatePayment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: any) => apiClient('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['loans'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
    },
  })
}

export function useUpdatePayment(id: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: any) => apiClient(`/payments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['payment', id] })
      queryClient.invalidateQueries({ queryKey: ['loans'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
    },
  })
}

export function useDeletePayment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => apiClient(`/payments/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['loans'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
    },
  })
}