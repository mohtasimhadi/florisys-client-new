'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type SettingsState = {
  dashboardBaseUrl: string
  roverBaseUrl: string
  setDashboardBaseUrl: (v: string) => void
  setRoverBaseUrl: (v: string) => void
  resetDefaults: () => void
}

const defaults = {
  dashboardBaseUrl: 'http://localhost:8000',
  roverBaseUrl: 'http://localhost:8000'
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaults,
      setDashboardBaseUrl: (v) => set({ dashboardBaseUrl: v }),
      setRoverBaseUrl: (v) => set({ roverBaseUrl: v }),
      resetDefaults: () => set({ ...defaults })
    }),
    { name: 'florisys-settings' }
  )
)
