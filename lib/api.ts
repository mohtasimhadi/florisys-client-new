'use client'

import { Plot } from '@/types/plots'
import { useSettings } from '@/lib/settingsStore'

const pickBase = () => useSettings.getState().dashboardBaseUrl.replace(/\/+$/,'')
const headers = { }

export async function listPlots(): Promise<Plot[]> {
  const base = pickBase()
  const r = await fetch(`${base}/plots`, { headers, cache: 'no-store' })
  if (!r.ok) throw new Error('Failed to fetch plots')
  return r.json()
}

export async function addPlot(file: File): Promise<Plot> {
  const base = pickBase()
  const fd = new FormData()
  fd.append('file', file)
  const r = await fetch(`${base}/plots`, { method: 'POST', body: fd })
  if (!r.ok) throw new Error('Failed to add plot')
  return r.json()
}

export async function removePlot(id: string): Promise<void> {
  const base = pickBase()
  const r = await fetch(`${base}/plots/${id}`, { method: 'DELETE' })
  if (!r.ok) throw new Error('Failed to remove plot')
}
