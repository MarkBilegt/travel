'use client'

import { createContext, useContext, useState } from 'react'

interface AdminContextValue {
  isCollapsed: boolean
  tourSearch: string
  toggle: () => void
  setTourSearch: (value: string) => void
}

const AdminContext = createContext<AdminContextValue>({
  isCollapsed: false,
  tourSearch: '',
  toggle: () => {},
  setTourSearch: () => {},
})

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [tourSearch, setTourSearch] = useState('')

  return (
    <AdminContext.Provider
      value={{
        isCollapsed,
        tourSearch,
        toggle: () => setIsCollapsed((p) => !p),
        setTourSearch,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export const useAdmin = () => useContext(AdminContext)
