'use client'

import { useEffect } from 'react'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'

export default function KeyboardShortcutsInitializer() {
  useKeyboardShortcuts()
  return null
}
