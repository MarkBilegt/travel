import { SITE_CONFIG, SITE_URL } from '@/lib/constants'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { QueryProvider } from '@/providers/QueryProvider'
import { AdminShell } from '@/components/admin/AdminShell'
import { Toaster } from 'sonner'
import '../globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: `Admin | ${SITE_CONFIG.name}`,
  metadataBase: new URL(SITE_URL),
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased" suppressHydrationWarning>
        <QueryProvider>
          <AdminShell>{children}</AdminShell>
          <Toaster richColors position="top-right" />
        </QueryProvider>
      </body>
    </html>
  )
}
