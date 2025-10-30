'use client'

import { useOfflineSync } from '@/hooks/use-offline-sync'
import { useEffect } from 'react'

export default function PWAWrapper({ children }: { children: React.ReactNode }) {
  const {
    isOnline,
    isServiceWorkerRegistered,
    updateAvailable,
    updateServiceWorker,
    installPrompt,
    installApp,
  } = useOfflineSync()

  // Log PWA status for debugging
  useEffect(() => {
    console.log('PWA Status:', {
      isOnline,
      isServiceWorkerRegistered,
      updateAvailable,
      installPrompt,
    })
  }, [isOnline, isServiceWorkerRegistered, updateAvailable, installPrompt])

  return (
    <>
      {children}
      
      {/* Status indicator for offline mode */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 z-50 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Offline Mode</span>
        </div>
      )}
      
      {/* Update available indicator */}
      {updateAvailable && (
        <div className="fixed bottom-4 right-4 z-50 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium">Update available</span>
            <button
              onClick={updateServiceWorker}
              className="bg-white text-blue-500 px-3 py-1 rounded text-xs font-semibold hover:bg-gray-100 transition-colors"
            >
              Update
            </button>
          </div>
        </div>
      )}
    </>
  )
}