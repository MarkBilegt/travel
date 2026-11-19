'use client'

import { useSyncExternalStore } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const noop = () => () => {}
/** Recharts measures the DOM: render charts on the client only. */
function useIsClient() {
  return useSyncExternalStore(noop, () => true, () => false)
}

export function InquiriesChart({ data }: { data: { month: string; inquiries: number }[] }) {
  const ready = useIsClient()
  if (!ready) return <div className="h-64" />
  return (
    <ResponsiveContainer width="100%" height={256}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a3140" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip
          cursor={{ fill: 'rgba(255,255,255,0.04)' }}
          contentStyle={{ background: '#1a1f2b', border: '1px solid #2a3140', borderRadius: 12, fontSize: 12 }}
          formatter={(v) => [String(v), 'Хүсэлтүүд']}
        />
        <Bar dataKey="inquiries" fill="#4f7ef7" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function InquiryStatusChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  const ready = useIsClient()
  const total = data.reduce((s, d) => s + d.value, 0)
  if (!ready) return <div className="h-64" />
  if (total === 0) return <p className="flex h-64 items-center justify-center text-sm text-gray-500">Одоогоор хүсэлт ирээгүй байна</p>
  return (
    <ResponsiveContainer width="100%" height={256}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2} stroke="none">
          {data.map((d) => (
            <Cell key={d.name} fill={d.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ background: '#1a1f2b', border: '1px solid #2a3140', borderRadius: 12, fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
