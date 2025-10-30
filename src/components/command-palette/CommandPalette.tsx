'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { 
  Search, 
  Plus, 
  Users, 
  CreditCard, 
  FileText, 
  DollarSign, 
  Settings, 
  Home,
  Calculator,
  TrendingUp,
  AlertTriangle,
  Download
} from 'lucide-react'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')

  // Close palette on escape key
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open, onOpenChange])

  const handleCommand = (command: string) => {
    onOpenChange(false)
    setSearch('')
    
    switch (command) {
      case 'dashboard':
        router.push('/dashboard')
        break
      case 'borrowers':
        router.push('/borrowers')
        break
      case 'loans':
        router.push('/loans')
        break
      case 'reports':
        router.push('/reports')
        break
      case 'new-borrower':
        router.push('/borrowers?action=new')
        break
      case 'new-loan':
        router.push('/loans?action=new')
        break
      case 'search-borrowers':
        router.push('/borrowers')
        // TODO: Focus search input when implemented
        break
      case 'search-loans':
        router.push('/loans')
        // TODO: Focus search input when implemented
        break
      case 'export-pdf':
        // TODO: Trigger PDF export when implemented
        console.log('PDF Export triggered')
        break
      case 'export-csv':
        // TODO: Trigger CSV export when implemented
        console.log('CSV Export triggered')
        break
      default:
        console.log('Unknown command:', command)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden max-w-2xl">
        <Command className="rounded-lg border shadow-md">
          <div className="border-b border-gray-200 bg-white">
            <div className="flex items-center px-4 py-3">
              <Search className="h-5 w-5 text-gray-400 mr-3" />
              <Command.Input
                placeholder="Type a command or search..."
                value={search}
                onValueChange={setSearch}
                className="flex-1 border-0 bg-transparent outline-none placeholder:text-gray-400"
              />
              <div className="hidden sm:flex items-center space-x-2 text-xs text-gray-500">
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">⌘</kbd>
                <span>+</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">K</kbd>
              </div>
            </div>
          </div>

          <Command.List className="max-h-96 overflow-y-auto bg-white">
            <Command.Empty className="py-8 text-center text-gray-500">
              No results found for "{search}"
            </Command.Empty>

            <Command.Group heading="Navigation" className="px-2 py-2">
              <Command.Item 
                onSelect={() => handleCommand('dashboard')}
                className="flex items-center px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <Home className="h-4 w-4 mr-3 text-blue-500" />
                <span>Dashboard</span>
                <div className="ml-auto text-xs text-gray-400">Go to dashboard</div>
              </Command.Item>
              
              <Command.Item 
                onSelect={() => handleCommand('borrowers')}
                className="flex items-center px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <Users className="h-4 w-4 mr-3 text-green-500" />
                <span>Borrowers</span>
                <div className="ml-auto text-xs text-gray-400">Manage borrowers</div>
              </Command.Item>
              
              <Command.Item 
                onSelect={() => handleCommand('loans')}
                className="flex items-center px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <CreditCard className="h-4 w-4 mr-3 text-purple-500" />
                <span>Loans</span>
                <div className="ml-auto text-xs text-gray-400">View all loans</div>
              </Command.Item>
              
              <Command.Item 
                onSelect={() => handleCommand('reports')}
                className="flex items-center px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <FileText className="h-4 w-4 mr-3 text-orange-500" />
                <span>Reports</span>
                <div className="ml-auto text-xs text-gray-400">Generate reports</div>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Quick Actions" className="px-2 py-2">
              <Command.Item 
                onSelect={() => handleCommand('new-borrower')}
                className="flex items-center px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <Plus className="h-4 w-4 mr-3 text-blue-500" />
                <span>Add New Borrower</span>
                <div className="ml-auto text-xs text-gray-400">Ctrl+Shift+B</div>
              </Command.Item>
              
              <Command.Item 
                onSelect={() => handleCommand('new-loan')}
                className="flex items-center px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <DollarSign className="h-4 w-4 mr-3 text-green-500" />
                <span>Create New Loan</span>
                <div className="ml-auto text-xs text-gray-400">Ctrl+Shift+L</div>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Search" className="px-2 py-2">
              <Command.Item 
                onSelect={() => handleCommand('search-borrowers')}
                className="flex items-center px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <Search className="h-4 w-4 mr-3 text-gray-500" />
                <span>Search Borrowers</span>
                <div className="ml-auto text-xs text-gray-400">Find borrowers</div>
              </Command.Item>
              
              <Command.Item 
                onSelect={() => handleCommand('search-loans')}
                className="flex items-center px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <Search className="h-4 w-4 mr-3 text-gray-500" />
                <span>Search Loans</span>
                <div className="ml-auto text-xs text-gray-400">Find loans</div>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Export" className="px-2 py-2">
              <Command.Item 
                onSelect={() => handleCommand('export-pdf')}
                className="flex items-center px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <Download className="h-4 w-4 mr-3 text-red-500" />
                <span>Export to PDF</span>
                <div className="ml-auto text-xs text-gray-400">Generate PDF report</div>
              </Command.Item>
              
              <Command.Item 
                onSelect={() => handleCommand('export-csv')}
                className="flex items-center px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <Download className="h-4 w-4 mr-3 text-green-500" />
                <span>Export to CSV</span>
                <div className="ml-auto text-xs text-gray-400">Download CSV data</div>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  )
}