'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Search, Bell, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin-context'

const PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard': 'Хяналтын самбар',
  '/admin/inquiries': 'Хүсэлтүүд',
  '/admin/tours': 'Аяллууд',
  '/admin/departures': 'Бүлгийн аялал',
  '/admin/articles': 'Нийтлэл, блог',
  '/admin/photos': 'Зургийн сан',
  '/admin/testimonials': 'Сэтгэгдэл',
  '/admin/partners': 'Хамтрагчид',
  '/admin/texts': 'Вэбсайтын текст',
  '/admin/settings': 'Холбоо барих мэдээлэл',
}

async function fetchUnreadInquiries(): Promise<number> {
  const res = await fetch('/api/admin/notifications')
  if (!res.ok) throw new Error('Мэдэгдэл ачаалж чадсангүй')
  const json = await res.json()
  return json.data?.unreadInquiries ?? 0
}

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { tourSearch, setTourSearch } = useAdmin()
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const title = PAGE_TITLES[pathname] ?? 'Админ'
  const isToursPage = pathname === '/admin/tours'

  const { data: unread = 0 } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: fetchUnreadInquiries,
    refetchInterval: 60_000,
  })

  return (
    <header className="h-14 bg-admin-card border-b border-admin-border flex items-center px-6 gap-4 sticky top-0 z-30">
      <h1 className="text-white font-bold text-base flex-shrink-0">{title}</h1>

      <div className="flex-1" />

      {isToursPage && (
        <div className="relative">
          {searchOpen ? (
            <div className="flex items-center gap-2 bg-admin-bg border border-admin-border rounded-lg px-3 py-1.5">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                autoFocus
                value={tourSearch}
                onChange={(e) => setTourSearch(e.target.value)}
                placeholder="Аяллын нэрээр хайх..."
                className="bg-transparent text-white text-sm outline-none w-56 placeholder:text-gray-500"
              />
              <button
                onClick={() => {
                  setTourSearch('')
                  setSearchOpen(false)
                }}
              >
                <X className="w-4 h-4 text-gray-400 hover:text-white" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Аялал хайх"
            >
              <Search className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      <div className="relative">
        <button
          onClick={() => setNotificationsOpen((p) => !p)}
          className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Мэдэгдэл"
        >
          <Bell className="w-4 h-4" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-black leading-4 text-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {notificationsOpen && (
          <div className="absolute right-0 top-full mt-1 w-72 bg-admin-card border border-admin-border rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-3 border-b border-admin-border">
              <p className="text-white text-sm font-semibold">Мэдэгдэл</p>
              <p className="text-gray-500 text-xs">{unread > 0 ? `${unread} уншаагүй` : 'Шинэ зүйл алга'}</p>
            </div>
            <div className="p-1">
              <button
                onClick={() => {
                  setNotificationsOpen(false)
                  router.push('/admin/inquiries')
                }}
                className="w-full flex items-center justify-between gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <span>Уншаагүй хүсэлт</span>
                <span className="text-admin-accent font-bold">{unread}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => setUserOpen((p) => !p)}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 hover:bg-white/5 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-admin-accent flex items-center justify-center">
            <span className="text-white text-xs font-black">A</span>
          </div>
          <span className="text-white text-sm font-medium">Админ</span>
          <ChevronDown className={cn('w-3.5 h-3.5 text-gray-400 transition-transform', userOpen && 'rotate-180')} />
        </button>

        {userOpen && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-admin-card border border-admin-border rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-3 border-b border-admin-border">
              <p className="text-white text-sm font-semibold">Админ</p>
              <p className="text-gray-400 text-xs">үндсэн админ</p>
            </div>
            <div className="p-1">
              <button
                onClick={async () => {
                  try {
                    await fetch('/api/admin/logout', { method: 'POST' })
                  } finally {
                    window.location.href = '/admin/login'
                  }
                }}
                className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 rounded-lg transition-colors"
              >
                Гарах
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
