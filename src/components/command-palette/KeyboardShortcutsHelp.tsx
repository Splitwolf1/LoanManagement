'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { KEYBOARD_SHORTCUTS } from '@/hooks/use-keyboard-shortcuts'
import { Keyboard } from 'lucide-react'

interface KeyboardShortcutsHelpProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function KeyboardShortcutsHelp({ open, onOpenChange }: KeyboardShortcutsHelpProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <Keyboard className="h-5 w-5 text-blue-600" />
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Global</h3>
            <div className="space-y-2">
              {KEYBOARD_SHORTCUTS.global.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                  <span className="text-sm text-gray-700">{shortcut.description}</span>
                  <div className="flex items-center space-x-1">
                    {shortcut.keys.map((key, keyIndex) => (
                      <span key={keyIndex} className="flex items-center space-x-1">
                        <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">
                          {key}
                        </kbd>
                        {keyIndex < shortcut.keys.length - 1 && (
                          <span className="text-gray-400 text-xs">+</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Navigation</h3>
            <div className="space-y-2">
              {KEYBOARD_SHORTCUTS.navigation.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                  <span className="text-sm text-gray-700">{shortcut.description}</span>
                  <div className="flex items-center space-x-1">
                    {shortcut.keys.map((key, keyIndex) => (
                      <span key={keyIndex} className="flex items-center space-x-1">
                        <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">
                          {key}
                        </kbd>
                        {keyIndex < shortcut.keys.length - 1 && (
                          <span className="text-gray-400 text-xs">then</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {KEYBOARD_SHORTCUTS.actions.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                  <span className="text-sm text-gray-700">{shortcut.description}</span>
                  <div className="flex items-center space-x-1">
                    {shortcut.keys.map((key, keyIndex) => (
                      <span key={keyIndex} className="flex items-center space-x-1">
                        <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">
                          {key}
                        </kbd>
                        {keyIndex < shortcut.keys.length - 1 && (
                          <span className="text-gray-400 text-xs">
                            {shortcut.keys.includes('Ctrl') || shortcut.keys.includes('Shift') ? '+' : 'then'}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Export</h3>
            <div className="space-y-2">
              {KEYBOARD_SHORTCUTS.export.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                  <span className="text-sm text-gray-700">{shortcut.description}</span>
                  <div className="flex items-center space-x-1">
                    {shortcut.keys.map((key, keyIndex) => (
                      <span key={keyIndex} className="flex items-center space-x-1">
                        <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">
                          {key}
                        </kbd>
                        {keyIndex < shortcut.keys.length - 1 && (
                          <span className="text-gray-400 text-xs">then</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-gray-600">
              <strong>Tip:</strong> Use the command palette (Cmd+K) for fuzzy search and quick access to all features.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}