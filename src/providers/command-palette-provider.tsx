'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import CommandPalette from '@/components/command-palette/CommandPalette'
import KeyboardShortcutsHelp from '@/components/command-palette/KeyboardShortcutsHelp'
import KeyboardShortcutsInitializer from '@/components/command-palette/KeyboardShortcutsInitializer'

interface CommandPaletteContextType {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
  showHelp: boolean
  setShowHelp: (show: boolean) => void
  toggleHelp: () => void
}

const CommandPaletteContext = createContext<CommandPaletteContextType | undefined>(undefined)

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  const toggle = () => setOpen(prev => !prev)
  const toggleHelp = () => setShowHelp(prev => !prev)

  return (
    <CommandPaletteContext.Provider value={{ open, setOpen, toggle, showHelp, setShowHelp, toggleHelp }}>
      <KeyboardShortcutsInitializer />
      {children}
      <CommandPalette open={open} onOpenChange={setOpen} />
      <KeyboardShortcutsHelp open={showHelp} onOpenChange={setShowHelp} />
    </CommandPaletteContext.Provider>
  )
}

export function useCommandPalette() {
  const context = useContext(CommandPaletteContext)
  if (context === undefined) {
    throw new Error('useCommandPalette must be used within a CommandPaletteProvider')
  }
  return context
}