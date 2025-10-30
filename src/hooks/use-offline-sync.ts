'use client'

import { useEffect, useState } from 'react'
import { Workbox } from 'workbox-window'
import { toast } from 'sonner'

interface OfflineState {
  isOnline: boolean
  isServiceWorkerRegistered: boolean
  updateAvailable: boolean
  updateServiceWorker: () => void
  installPrompt: boolean
  installApp: () => void
}

export function useOfflineSync(): OfflineState {
  const [isOnline, setIsOnline] = useState(true)
  const [isServiceWorkerRegistered, setIsServiceWorkerRegistered] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [installPrompt, setInstallPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [workbox, setWorkbox] = useState<Workbox | null>(null)

  useEffect(() => {
    // Initialize online/offline detection
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      toast.success('Back online! Syncing data...', {
        icon: '🌐',
        duration: 3000,
      })
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast.warning('You are offline. Changes will sync when you reconnect.', {
        icon: '📴',
        duration: 5000,
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Initialize service worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const wb = new Workbox('/sw.js')
      setWorkbox(wb)

      wb.addEventListener('installed', (event) => {
        if (event.isUpdate) {
          setUpdateAvailable(true)
          toast.info('New update available!', {
            icon: '🔄',
            action: {
              label: 'Update',
              onClick: () => {
                wb.messageSkipWaiting()
                window.location.reload()
              }
            },
            duration: 10000,
          })
        } else {
          setIsServiceWorkerRegistered(true)
          toast.success('App is ready for offline use!', {
            icon: '📱',
            duration: 3000,
          })
        }
      })

      wb.addEventListener('waiting', () => {
        setUpdateAvailable(true)
      })

      wb.addEventListener('controlling', () => {
        // Service worker is now controlling the page
        toast.success('Update applied successfully!', {
          icon: '✅',
          duration: 3000,
        })
        setUpdateAvailable(false)
      })

      // Register the service worker
      wb.register().catch((error) => {
        console.error('Service worker registration failed:', error)
      })
    }

    // Handle PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setInstallPrompt(true)
      
      toast.info('Install this app for a better experience!', {
        icon: '📱',
        action: {
          label: 'Install',
          onClick: () => installApp()
        },
        duration: 8000,
      })
    }

    const handleAppInstalled = () => {
      setInstallPrompt(false)
      setDeferredPrompt(null)
      toast.success('App installed successfully!', {
        icon: '🎉',
        duration: 3000,
      })
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const updateServiceWorker = () => {
    if (workbox) {
      workbox.messageSkipWaiting()
      window.location.reload()
    }
  }

  const installApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        toast.success('Installing app...', {
          icon: '⬇️',
          duration: 3000,
        })
      }
      
      setDeferredPrompt(null)
      setInstallPrompt(false)
    }
  }

  return {
    isOnline,
    isServiceWorkerRegistered,
    updateAvailable,
    updateServiceWorker,
    installPrompt,
    installApp,
  }
}

// Function to queue requests for when back online
export function queueForSync(url: string, options: RequestInit) {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    // Store the request in IndexedDB for background sync
    const request = {
      url,
      options,
      timestamp: Date.now(),
    }
    
    // This would typically use IndexedDB to store the request
    localStorage.setItem(`pending_request_${Date.now()}`, JSON.stringify(request))
    
    // Register for background sync
    navigator.serviceWorker.ready.then((registration) => {
      return registration.sync.register('background-sync')
    }).catch((error) => {
      console.error('Background sync registration failed:', error)
    })
  } else {
    console.warn('Background sync not supported')
  }
}

// Hook for managing offline data
export function useOfflineData<T>(key: string, fallbackData: T) {
  const [data, setData] = useState<T>(fallbackData)
  const [isStale, setIsStale] = useState(false)

  useEffect(() => {
    // Load cached data from localStorage
    const cachedData = localStorage.getItem(`cache_${key}`)
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData)
        setData(parsed.data)
        
        // Check if data is stale (older than 1 hour)
        const age = Date.now() - parsed.timestamp
        setIsStale(age > 60 * 60 * 1000)
      } catch (error) {
        console.error('Failed to parse cached data:', error)
      }
    }
  }, [key])

  const updateCache = (newData: T) => {
    const cacheEntry = {
      data: newData,
      timestamp: Date.now(),
    }
    localStorage.setItem(`cache_${key}`, JSON.stringify(cacheEntry))
    setData(newData)
    setIsStale(false)
  }

  const clearCache = () => {
    localStorage.removeItem(`cache_${key}`)
    setData(fallbackData)
    setIsStale(false)
  }

  return {
    data,
    isStale,
    updateCache,
    clearCache,
  }
}