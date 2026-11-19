'use client'

import { usePathname } from 'next/navigation'
import { AdminProvider } from '@/lib/admin-context'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLogin = pathname === '/admin/login'

  if (isLogin) return <>{children}</>

  return (
    <AdminProvider>
      <div className="flex h-screen bg-admin-bg overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </AdminProvider>
  )
}
