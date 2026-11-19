'use client'

import { SITE_CONFIG } from '@/lib/constants'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      router.push('/admin/dashboard')
    } else {
      setError('Нууц үг буруу байна')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-admin-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="rounded-2xl overflow-hidden mx-auto mb-5 w-48">
            <Image
              src="/brand/logo-white.svg"
              alt={SITE_CONFIG.name}
              width={400}
              height={80}
              className="w-full h-auto object-contain"
              priority
            />
          </div>
          <p className="text-gray-400 text-sm">Админ самбарт нэвтрэх</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-admin-card border border-admin-border rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider block mb-2">Нууц үг</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-admin-bg border border-admin-border rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-admin-accent transition-colors pr-10"
                required
              />
              <button type="button" onClick={() => setShowPw((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-admin-accent hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Нэвтэрч байна...</> : 'Нэвтрэх'}
          </button>
        </form>
      </div>
    </div>
  )
}
