'use client'

import { createContext, useEffect } from 'react'
import { toast } from 'sonner'
import { usePathname, useRouter } from 'next/navigation'
import { useIdle } from '@/hooks/use-idle'

const LockScreenContext = createContext<boolean | null>(null)

type LockScreenProviderProps = {
  children: React.ReactNode
}

export function LockScreenProvider({ children }: LockScreenProviderProps) {
  const router = useRouter()
  const pathname = usePathname()
  // 30 minutes = 30 * 60 * 1000 ms
  const idle = useIdle(30 * 60 * 1000)

  // For more Secrity We Can Add A a Locked Value To LocalStorage so we can prevent the user from accessing others pages if he is locked
  // Maybe Add it in the Future ?

  useEffect(() => {
    if (idle && pathname !== '/lock-screen') {
      toast.warning('Locked due to inactivity!', { position: 'top-center' })
      router.push('/lock-screen')
    }
  }, [idle, pathname, router])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'l' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault()
        e.stopPropagation()
        router.push('/lock-screen')
      }
    }
    window.addEventListener('keydown', down, true)
    return () => window.removeEventListener('keydown', down, true)
  }, [router])

  return (
    <LockScreenContext.Provider value={true}>
      {children}
    </LockScreenContext.Provider>
  )
}