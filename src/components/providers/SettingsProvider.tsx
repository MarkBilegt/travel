'use client'

import { createContext, useContext } from 'react'
import { SETTINGS_DEFAULTS, type SiteSettings } from '@/lib/site-settings'

const SettingsContext = createContext<SiteSettings>(SETTINGS_DEFAULTS)

/** Gives client components the contact details saved in the admin panel. */
export function SettingsProvider({ value, children }: { value: SiteSettings; children: React.ReactNode }) {
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export const useSettings = () => useContext(SettingsContext)
