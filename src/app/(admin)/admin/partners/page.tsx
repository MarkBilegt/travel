'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, GripVertical, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fetchPartners } from '@/lib/api-client'
import type { Partner, PartnerType } from '@/types'
import { messageMn } from '@/lib/admin-fetch'

const PARTNER_TYPE_LABELS: Record<string, string> = {
  accommodation: 'Байршил', transport: 'Тээвэр', activity: 'Үйл ажиллагаа', other: 'Бусад',
}
// ─── Modal state ─────────────────────────────────────────────────────────────

type ModalMode = 'add-partner' | 'edit-partner'

interface PartnerForm {
  name: string
  logoUrl: string
  website: string
  type: PartnerType
}

function emptyPartnerForm(): PartnerForm {
  return { name: '', logoUrl: '', website: '', type: 'other' }
}

// ─── API helpers ─────────────────────────────────────────────────────────────

async function apiCall(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', Cookie: document.cookie },
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(messageMn(json.error ?? 'Алдаа гарлаа'))
  return json
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function PartnersPage() {
  const queryClient = useQueryClient()

  const [modalMode, setModalMode] = useState<ModalMode | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [partnerForm, setPartnerForm] = useState<PartnerForm>(emptyPartnerForm())
  const [saving, setSaving] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { data, isLoading, error: fetchError, refetch } = useQuery({
    queryKey: ['partners'],
    queryFn: fetchPartners,
  })

  const partners = (data?.partners ?? []).filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i)

  function openAddPartner() {
    setPartnerForm(emptyPartnerForm())
    setEditId(null)
    setError(null)
    setModalMode('add-partner')
  }

  function openEditPartner(p: Partner) {
    setPartnerForm({ name: p.name, logoUrl: p.logoUrl, website: p.website ?? '', type: p.type })
    setEditId(p.id)
    setError(null)
    setModalMode('edit-partner')
  }

  function closeModal() {
    setModalMode(null)
    setEditId(null)
    setError(null)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      if (modalMode === 'add-partner') {
        await apiCall('/api/partners', 'POST', {
          name: partnerForm.name,
          logoUrl: partnerForm.logoUrl,
          website: partnerForm.website || null,
          type: partnerForm.type,
        })
      } else if (modalMode === 'edit-partner' && editId) {
        await apiCall(`/api/partners/${editId}`, 'PATCH', {
          name: partnerForm.name,
          logoUrl: partnerForm.logoUrl,
          website: partnerForm.website || null,
          type: partnerForm.type,
        })
      }
      await queryClient.invalidateQueries({ queryKey: ['partners'] })
      closeModal()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Алдаа гарлаа')
    } finally {
      setSaving(false)
    }
  }

  async function handleTogglePartner(p: Partner) {
    setTogglingId(p.id)
    try {
      await apiCall(`/api/partners/${p.id}`, 'PATCH', { isVisible: !p.active })
      await queryClient.invalidateQueries({ queryKey: ['partners'] })
    } catch {
      // silently ignore — data unchanged
    } finally {
      setTogglingId(null)
    }
  }

  async function handleDeletePartner(p: Partner) {
    if (!window.confirm(`Хамтрагчийг устгах "${p.name}"?`)) return
    setDeletingId(p.id)
    try {
      await apiCall(`/api/partners/${p.id}`, 'DELETE')
      await queryClient.invalidateQueries({ queryKey: ['partners'] })
    } catch {
      window.alert('Устгахад алдаа гарлаа.')
    } finally {
      setDeletingId(null)
    }
  }

  if (fetchError) return (
    <div className="text-red-500 text-sm p-4">
      Алдаа гарлаа. <button onClick={() => refetch()} className="underline">Дахин оролдох</button>
    </div>
  )

  const isEditing = modalMode === 'edit-partner'

  return (
    <div className="space-y-8">
      {/* Partners table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-white font-bold text-base">Хамтрагч байгууллагууд</h2>
            <p className="text-gray-500 text-xs mt-0.5">{partners.length} partner</p>
          </div>
          <button onClick={openAddPartner} className="flex items-center gap-2 bg-admin-accent hover:bg-blue-500 text-white text-sm font-semibold rounded-xl px-4 py-2 transition-colors">
            <Plus className="w-4 h-4" />Хамтрагч Нэмэх
          </button>
        </div>
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 bg-admin-card border border-admin-border rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="bg-admin-card border border-admin-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border bg-[#141820]">
                  <th className="px-4 py-3 w-8" />
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Байгууллага</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Төрөл</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Вебсайт</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-400">Харуулах</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Үйлдэл</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((partner) => (
                  <tr key={partner.id} className="border-b border-admin-border last:border-0 hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3"><GripVertical className="w-4 h-4 text-gray-600 cursor-grab" /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-8 bg-admin-bg rounded-lg overflow-hidden flex-shrink-0 border border-admin-border">
                          <Image src={partner.logoUrl} alt={partner.name} fill className="object-contain p-1" />
                        </div>
                        <p className="text-white text-sm font-medium">{partner.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-admin-bg text-gray-400 text-xs px-2.5 py-1 rounded-full">{PARTNER_TYPE_LABELS[partner.type]}</span>
                    </td>
                    <td className="px-4 py-3">
                      {partner.website ? (
                        <a href={partner.website} target="_blank" rel="noopener noreferrer" className="text-admin-accent text-xs hover:underline truncate block max-w-[160px]">
                          {partner.website.replace('https://', '')}
                        </a>
                      ) : <span className="text-gray-600 text-xs">-</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <button
                          disabled={togglingId === partner.id}
                          onClick={() => handleTogglePartner(partner)}
                          className={cn('transition-colors disabled:opacity-50', partner.active ? 'text-green-400' : 'text-gray-600')}
                        >
                          {partner.active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditPartner(partner)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={deletingId === partner.id}
                          onClick={() => handleDeletePartner(partner)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {partners.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-600 text-sm">Хамтрагч байгууллага байхгүй байна</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-admin-card border border-admin-border rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-base">
                {modalMode === 'add-partner' && 'Хамтрагч Нэмэх'}
                {modalMode === 'edit-partner' && 'Хамтрагч Засах'}
              </h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
                  <Field label="Нэр">
                    <input
                      value={partnerForm.name}
                      onChange={(e) => setPartnerForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full bg-admin-bg border border-admin-border rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-admin-accent"
                    />
                  </Field>
                  <Field label="Лого (холбоос)">
                    <input
                      value={partnerForm.logoUrl}
                      onChange={(e) => setPartnerForm((f) => ({ ...f, logoUrl: e.target.value }))}
                      placeholder="https://img.logo.dev/..."
                      className="w-full bg-admin-bg border border-admin-border rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-admin-accent"
                    />
                  </Field>
                  <Field label="Вебсайт">
                    <input
                      value={partnerForm.website}
                      onChange={(e) => setPartnerForm((f) => ({ ...f, website: e.target.value }))}
                      placeholder="https://"
                      className="w-full bg-admin-bg border border-admin-border rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-admin-accent"
                    />
                  </Field>
                  <Field label="Төрөл">
                    <select
                      value={partnerForm.type}
                      onChange={(e) => setPartnerForm((f) => ({ ...f, type: e.target.value as PartnerType }))}
                      className="w-full bg-admin-bg border border-admin-border rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-admin-accent"
                    >
                      {Object.entries(PARTNER_TYPE_LABELS).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </Field>
            </div>

            {error && <p className="mt-3 text-red-400 text-xs">{error}</p>}

            <div className="flex gap-3 mt-5">
              <button onClick={closeModal} className="flex-1 py-2.5 border border-admin-border rounded-xl text-gray-400 hover:text-white text-sm transition-colors">
                Цуцлах
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 bg-admin-accent hover:bg-blue-500 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving...' : isEditing ? 'Хадгалах' : 'Нэмэх'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider block mb-1">{label}</label>
      {children}
    </div>
  )
}
