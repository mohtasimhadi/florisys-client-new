// lib/bedsApi.ts
'use client'

import { useSettings } from '@/lib/settingsStore'
import { Bed } from '@/types/bed'

const base = () => useSettings.getState().dashboardBaseUrl.replace(/\/+$/,'')

export async function listBeds(plotId: string): Promise<Bed[]> {
  const r = await fetch(`${base()}/plots/${plotId}/beds`, { cache: 'no-store' })
  if (!r.ok) throw new Error('Failed to fetch beds')
  return r.json()
}

export async function createBed(plotId: string, body: { name: string; coordinates: [number,number][][] }): Promise<Bed> {
  const r = await fetch(`${base()}/plots/${plotId}/beds`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  })
  if (!r.ok) throw new Error('Failed to create bed')
  return r.json()
}

export async function updateBed(plotId: string, bedId: string, body: Partial<{ name: string; coordinates: [number,number][][] }>): Promise<Bed> {
  const r = await fetch(`${base()}/plots/${plotId}/beds/${bedId}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  })
  if (!r.ok) throw new Error('Failed to update bed')
  return r.json()
}

export async function deleteBed(plotId: string, bedId: string): Promise<void> {
  const r = await fetch(`${base()}/plots/${plotId}/beds/${bedId}`, { method: 'DELETE' })
  if (!r.ok) throw new Error('Failed to delete bed')
}
