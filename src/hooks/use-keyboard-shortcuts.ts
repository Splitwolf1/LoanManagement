'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import hotkeys from 'hotkeys-js'
import { useCommandPalette } from '@/providers/command-palette-provider'

interface KeyboardShortcutsOptions {
  disabled?: boolean
}

export function useKeyboardShortcuts(options: KeyboardShortcutsOptions = {}) {
  const router = useRouter()
  const { toggle: toggleCommandPalette, toggleHelp } = useCommandPalette()
  const { disabled = false } = options

  useEffect(() => {
    if (disabled) return

    // Configure hotkeys to work in input fields for command palette
    hotkeys.filter = function(event) {
      const target = event.target as HTMLElement
      const tagName = target.tagName.toLowerCase()
      
      // Allow Cmd+K and Ctrl+K everywhere
      if (hotkeys.isPressed('cmd+k') || hotkeys.isPressed('ctrl+k')) {
        return true
      }
      
      // Disable other shortcuts in input fields
      return !(tagName === 'input' || tagName === 'textarea' || target.contentEditable === 'true')
    }

    // Command Palette
    hotkeys('cmd+k,ctrl+k', (event) => {
      event.preventDefault()
      toggleCommandPalette()
    })

    // Navigation shortcuts
    hotkeys('g d', () => {
      router.push('/dashboard')
    })

    hotkeys('g b', () => {
      router.push('/borrowers')
    })

    hotkeys('g l', () => {
      router.push('/loans')
    })

    hotkeys('g r', () => {
      router.push('/reports')
    })

    // Quick actions
    hotkeys('ctrl+shift+b', (event) => {
      event.preventDefault()
      router.push('/borrowers?action=new')
    })

    hotkeys('ctrl+shift+l', (event) => {
      event.preventDefault()
      router.push('/loans?action=new')
    })

    hotkeys('n b', () => {
      router.push('/borrowers?action=new')
    })

    hotkeys('n l', () => {
      router.push('/loans?action=new')
    })

    // Search shortcuts
    hotkeys('/', (event) => {
      event.preventDefault()
      toggleCommandPalette()
    })

    // Help shortcut
    hotkeys('shift+/', (event) => {
      event.preventDefault()
      toggleHelp()
    })

    // Export shortcuts
    hotkeys('e p', () => {
      // TODO: Trigger PDF export
      console.log('Export to PDF')
    })

    hotkeys('e c', () => {
      // TODO: Trigger CSV export
      console.log('Export to CSV')
    })

    // Refresh data
    hotkeys('ctrl+r,cmd+r', (event) => {
      // Allow default browser refresh, but could add custom refresh logic
      console.log('Refresh triggered')
    })

    return () => {
      // Clean up all hotkeys
      hotkeys.unbind('cmd+k,ctrl+k')
      hotkeys.unbind('g d')
      hotkeys.unbind('g b')
      hotkeys.unbind('g l')
      hotkeys.unbind('g r')
      hotkeys.unbind('ctrl+shift+b')
      hotkeys.unbind('ctrl+shift+l')
      hotkeys.unbind('n b')
      hotkeys.unbind('n l')
      hotkeys.unbind('/')
      hotkeys.unbind('shift+/')
      hotkeys.unbind('e p')
      hotkeys.unbind('e c')
      hotkeys.unbind('ctrl+r,cmd+r')
    }
  }, [disabled, router, toggleCommandPalette])

  return {
    // Return functions to trigger actions programmatically
    triggerCommandPalette: toggleCommandPalette,
    navigateTo: (path: string) => router.push(path),
  }
}

// Keyboard shortcuts reference
export const KEYBOARD_SHORTCUTS = {
  global: [
    { keys: ['Cmd', 'K'], description: 'Open command palette' },
    { keys: ['Ctrl', 'K'], description: 'Open command palette (Windows/Linux)' },
    { keys: ['/'], description: 'Open command palette (search)' },
    { keys: ['Shift', '?'], description: 'Show keyboard shortcuts help' },
  ],
  navigation: [
    { keys: ['G', 'D'], description: 'Go to Dashboard' },
    { keys: ['G', 'B'], description: 'Go to Borrowers' },
    { keys: ['G', 'L'], description: 'Go to Loans' },
    { keys: ['G', 'R'], description: 'Go to Reports' },
  ],
  actions: [
    { keys: ['N', 'B'], description: 'New Borrower' },
    { keys: ['N', 'L'], description: 'New Loan' },
    { keys: ['Ctrl', 'Shift', 'B'], description: 'New Borrower (alternative)' },
    { keys: ['Ctrl', 'Shift', 'L'], description: 'New Loan (alternative)' },
  ],
  export: [
    { keys: ['E', 'P'], description: 'Export to PDF' },
    { keys: ['E', 'C'], description: 'Export to CSV' },
  ],
}