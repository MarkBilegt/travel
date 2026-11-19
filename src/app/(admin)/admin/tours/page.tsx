'use client'

import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import { Plus, LayoutList, LayoutGrid, Pencil, Trash2, ToggleLeft, ToggleRight, X } from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'
import { fetchTours } from '@/lib/api-client'
import { TourForm } from '@/components/admin/TourForm'
import { useAdmin } from '@/lib/admin-context'
import type { Tour } from '@/types'
import { MONGOLIA_REGIONS } from '@/lib/constants'
import { TOUR_CATEGORIES } from '@/lib/constants'

export default function AdminToursPage() {
  const [view, setView] = useState<'list' | 'grid'>('list')
  const [showForm, setShowForm] = useState(false)
  const [editingTour, setEditingTour] = useState<Tour | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Tour | null>(null)
  const [deleting, setDeleting] = useState(false)
  const queryClient = useQueryClient()
  const { tourSearch } = useAdmin()

  const { data: tours = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin-tours'],
    queryFn: () => fetchTours({ status: 'all', limit: 200 }),
  })

  const filteredTours = useMemo(() => {
    const term = tourSearch.trim().toLowerCase()
    if (!term) return tours
    return tours.filter((tour) => {
      const title = tour.title?.toLowerCase() ?? ''
      const other = Object.values(tour.translations ?? {}).map((t) => t?.title?.toLowerCase() ?? '')
      return title.includes(term) || other.some((o) => o.includes(term))
    })
  }, [tours, tourSearch])

  function openCreate() {
    setEditingTour(null)
    setShowForm(true)
  }

  function openEdit(tour: Tour) {
    setEditingTour(tour)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingTour(null)
  }

  function handleFormSuccess() {
    queryClient.invalidateQueries({ queryKey: ['admin-tours'] })
  }

  async function handleToggleActive(tour: Tour) {
    await fetch(`/api/tours/${tour.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: tour.active ? 'inactive' : 'active' }),
    })
    queryClient.invalidateQueries({ queryKey: ['admin-tours'] })
  }

  const [heroError, setHeroError] = useState('')

  async function handleToggleHero(tour: Tour) {
    const heroCount = tours.filter((t) => t.isHero).length
    if (!tour.isHero && heroCount >= 5) {
      setHeroError('Нүүр хуудасны слайдад хамгийн ихдээ 5 аялал харуулах боломжтой. Эхлээд өөр аяллыг хасна уу.')
      setTimeout(() => setHeroError(''), 4000)
      return
    }
    await fetch(`/api/tours/${tour.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_hero: !tour.isHero }),
    })
    queryClient.invalidateQueries({ queryKey: ['admin-tours'] })
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    await fetch(`/api/tours/${deleteTarget.id}`, { method: 'DELETE' })
    setDeleting(false)
    setDeleteTarget(null)
    queryClient.invalidateQueries({ queryKey: ['admin-tours'] })
  }

  if (showForm) {
    return (
      <div className="bg-admin-card border border-admin-border rounded-xl p-6">
        <h2 className="text-white font-bold text-base mb-6">
          {editingTour ? 'Аялал засах' : 'Шинэ Аялал Нэмэх'}
        </h2>
        <TourForm tour={editingTour ?? undefined} onCancel={closeForm} onSuccess={handleFormSuccess} />
      </div>
    )
  }

  if (error) return (
    <div className="text-red-500 text-sm p-4">
      Алдаа гарлаа. <button onClick={() => refetch()} className="underline">Дахин оролдох</button>
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-admin-card border border-admin-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-sm">Аяллыг устгах уу?</h3>
              <button onClick={() => setDeleteTarget(null)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-gray-400 text-sm mb-5">
              <span className="text-white font-semibold">{deleteTarget.title}</span>: deactivate this tour?
              This can be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                Цуцлах
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm bg-red-500 hover:bg-red-400 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors"
              >
                {deleting ? 'Устгаж байна...' : 'Устгах'}
              </button>
            </div>
          </div>
        </div>
      )}

      {heroError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
          {heroError}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-base">Аяллууд</h2>
          <p className="text-gray-500 text-xs mt-0.5">
            {tourSearch.trim() ? `${filteredTours.length} / ${tours.length}` : tours.length} аялал нийт
          </p>
          {(() => {
            const heroCount = tours.filter((t) => t.isHero).length
            return (
              <p className={cn(
                'text-xs mt-0.5 font-semibold',
                heroCount === 5 ? 'text-brand-gold' : heroCount > 5 ? 'text-red-400' : 'text-admin-accent',
              )}>
                Нүүр хуудасны слайд: {heroCount}/5 аялал сонгогдсон
              </p>
            )
          })()}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-admin-card border border-admin-border rounded-lg p-0.5">
            <button onClick={() => setView('list')} className={cn('p-2 rounded-md transition-colors', view === 'list' ? 'bg-admin-accent text-white' : 'text-gray-400 hover:text-white')}>
              <LayoutList className="w-4 h-4" />
            </button>
            <button onClick={() => setView('grid')} className={cn('p-2 rounded-md transition-colors', view === 'grid' ? 'bg-admin-accent text-white' : 'text-gray-400 hover:text-white')}>
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-admin-accent hover:bg-blue-500 text-white text-sm font-semibold rounded-xl px-4 py-2 transition-colors">
            <Plus className="w-4 h-4" />Шинэ Аялал Нэмэх
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 bg-admin-card border border-admin-border rounded-xl" />
          ))}
        </div>
      ) : filteredTours.length === 0 ? (
        <div className="bg-admin-card border border-admin-border rounded-xl p-12 text-center">
          <p className="text-white text-sm font-semibold">Аялал олдсонгүй</p>
          <p className="text-gray-500 text-xs mt-1">Хайлтаа өөрчлөөд дахин оролдоно уу.</p>
        </div>
      ) : view === 'list' ? (
        <div className="bg-admin-card border border-admin-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-admin-border bg-[#141820]">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Аялал</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Улс</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Хоног</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Үнэ</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-400">Идэвхтэй</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-400">Нүүр зураг</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Үйлдэл</th>
              </tr>
            </thead>
            <tbody>
              {filteredTours.map((tour) => (
                <tr key={tour.id} className="border-b border-admin-border last:border-0 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-admin-bg">
                        {tour.coverImage && (
                          <Image src={tour.coverImage} alt={tour.title} fill className="object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium truncate max-w-[160px]">{tour.title}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src="https://flagcdn.com/16x12/it.png" width={14} height={10} alt="IT" className="rounded-[2px] opacity-60" />
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src="https://flagcdn.com/16x12/gb.png" width={14} height={10} alt="EN" className={cn('rounded-[2px]', tour.translations?.en?.title ? 'opacity-100' : 'opacity-25')} />
                        </div>
                        <p className="text-gray-500 text-xs">{TOUR_CATEGORIES.find((c) => c.value === tour.category)?.label ?? tour.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{MONGOLIA_REGIONS.find((r) => r.key === tour.region)?.label ?? tour.region ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{tour.duration} хоног</td>
                  <td className="px-4 py-3 text-white font-semibold text-sm">{formatPrice(tour.price)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <button
                        onClick={() => handleToggleActive(tour)}
                        className={cn('transition-colors', tour.active ? 'text-green-400' : 'text-gray-600')}
                      >
                        {tour.active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <button
                        onClick={() => handleToggleHero(tour)}
                        title={tour.isHero ? 'Слайдаас хасах' : 'Слайдад нэмэх'}
                        className={cn('transition-colors', tour.isHero ? 'text-brand-gold' : 'text-gray-600 hover:text-gray-400')}
                      >
                        {tour.isHero ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(tour)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteTarget(tour)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredTours.map((tour) => (
            <div key={tour.id} className="bg-admin-card border border-admin-border rounded-xl overflow-hidden group hover:border-gray-600 transition-colors">
              <div className="relative aspect-video bg-admin-bg">
                {tour.coverImage && (
                  <Image src={tour.coverImage} alt={tour.title} fill className="object-cover" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => openEdit(tour)} className="p-2 bg-white/20 rounded-lg text-white"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteTarget(tour)} className="p-2 bg-red-500/30 rounded-lg text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className={cn('absolute top-2 right-2 w-2 h-2 rounded-full', tour.active ? 'bg-green-400' : 'bg-gray-600')} />
              </div>
              <div className="p-3">
                <p className="text-white text-xs font-semibold truncate">{tour.title}</p>
                <p className="text-admin-accent text-sm font-bold mt-1">{formatPrice(tour.price)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
