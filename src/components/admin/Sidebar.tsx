'use client'

import { SITE_CONFIG } from '@/lib/constants'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Map, Newspaper, Images, Type, Settings, CalendarDays,
  Handshake, MessageSquareQuote, ChevronLeft, ChevronRight, Mail,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin-context'
import { useQuery } from '@tanstack/react-query'

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Хяналтын самбар', icon: LayoutDashboard },
  { href: '/admin/inquiries', label: 'Хүсэлтүүд', icon: Mail },
  { href: '/admin/tours', label: 'Аяллууд', icon: Map },
  { href: '/admin/departures', label: 'Бүлгийн аялал', icon: CalendarDays },
  { href: '/admin/articles', label: 'Нийтлэл, блог', icon: Newspaper },
  { href: '/admin/photos', label: 'Зургийн сан', icon: Images },
  { href: '/admin/testimonials', label: 'Сэтгэгдэл', icon: MessageSquareQuote },
  { href: '/admin/partners', label: 'Хамтрагчид', icon: Handshake },
  { href: '/admin/texts', label: 'Вэбсайтын текст', icon: Type },
  { href: '/admin/settings', label: 'Холбоо барих мэдээлэл', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { isCollapsed, toggle } = useAdmin()

  const { data: inquiryData } = useQuery({
    queryKey: ['inquiries-unread'],
    queryFn: async () => {
      const res = await fetch('/api/inquiries')
      if (!res.ok) return { unread: 0 }
      const json = await res.json()
      const unread = (json.data ?? []).filter((i: { isRead: boolean }) => !i.isRead).length
      return { unread }
    },
    refetchInterval: 60_000,
  })
  const unreadCount = inquiryData?.unread ?? 0

  return (
    <aside
      className={cn(
        'flex-shrink-0 h-screen sticky top-0 bg-[#141820] border-r border-admin-border flex flex-col transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-60',
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center px-4 py-4 border-b border-admin-border', isCollapsed ? 'justify-center px-2' : 'gap-3')}>
        {isCollapsed ? (
          <div className="w-8 h-8 rounded-lg bg-admin-accent flex items-center justify-center flex-shrink-0">
            <span className="text-white font-black text-sm leading-none">S</span>
          </div>
        ) : (
          <div className="flex flex-col min-w-0">
            <Image
              src="/brand/logo-white.svg"
              alt={SITE_CONFIG.name}
              width={400}
              height={80}
              className="h-8 w-auto object-contain"
            />
            <p className="text-gray-500 text-xs mt-1">Админ самбар</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-0.5 px-2">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors relative group',
                    active
                      ? 'bg-admin-accent/15 text-admin-accent font-semibold'
                      : 'text-gray-400 hover:text-white hover:bg-white/5',
                    isCollapsed && 'justify-center px-0',
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-admin-accent rounded-r-full" />
                  )}
                  <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="flex-1 flex items-center justify-between gap-2">
                      {item.label}
                      {item.href === '/admin/inquiries' && unreadCount > 0 && (
                        <span className="bg-admin-accent text-white text-xs font-black px-1.5 py-0.5 rounded-full leading-none">
                          {unreadCount}
                        </span>
                      )}
                    </span>
                  )}
                  {isCollapsed && (
                    <>
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                        {item.label}
                      </div>
                      {item.href === '/admin/inquiries' && unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-admin-accent rounded-full" />
                      )}
                    </>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User + Toggle */}
      <div className="border-t border-admin-border p-3 space-y-3">
        {/* User */}
        {!isCollapsed && (
          <div className="flex items-center gap-3 px-1">
            <div className="w-8 h-8 rounded-full bg-admin-accent flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-black">A</span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">Админ</p>
              <p className="text-gray-500 text-xs truncate">үндсэн админ</p>
            </div>
          </div>
        )}
        {/* Toggle */}
        <button
          onClick={toggle}
          className={cn(
            'w-full flex items-center gap-2 rounded-lg px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-xs',
            isCollapsed && 'justify-center px-0',
          )}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!isCollapsed && 'Хураах'}
        </button>
      </div>
    </aside>
  )
}
