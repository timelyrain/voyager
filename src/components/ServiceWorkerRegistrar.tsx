'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    // Register the kill-switch SW, then unregister once it has cleared all caches
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      reg.update()
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        reg.unregister()
      })
    }).catch(() => {})
  }, [])
  return null
}
