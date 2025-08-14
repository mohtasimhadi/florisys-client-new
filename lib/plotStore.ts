// lib/plotStore.ts
'use client'

import { create } from 'zustand'
import { Plot } from '@/types/plots'
import { addPlot, listPlots, removePlot } from '@/lib/api'

type State = {
  plots: Plot[]
  selectedId: string | null
  loading: boolean
  uploading: boolean
  error: string | null
  load: () => Promise<void>
  select: (id: string | null) => void
  add: (file: File) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const usePlotStore = create<State>((set, get) => ({
  plots: [],
  selectedId: null,
  loading: false,
  uploading: false,
  error: null,
  load: async () => {
    set({ loading: true, error: null })
    try {
      const data = await listPlots()
      set((s) => ({
        plots: data,
        selectedId: s.selectedId && data.find(p => p.id === s.selectedId) ? s.selectedId : null,
        loading: false
      }))
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? 'Error' })
    }
  },
  select: (id) => set({ selectedId: id }),
  add: async (file) => {
    set({ error: null, uploading: true })
    try {
      const created = await addPlot(file)
      set((s) => ({
        plots: [created, ...s.plots],
        selectedId: created.id,
        uploading: false
      }))
    } catch (e: any) {
      set({ uploading: false, error: e?.message ?? 'Error' })
      throw e
    }
  },
  remove: async (id) => {
    await removePlot(id)
    set((s) => {
      const next = s.plots.filter(p => p.id !== id)
      const selectedId = s.selectedId === id ? null : s.selectedId
      return { plots: next, selectedId }
    })
  }
}))
