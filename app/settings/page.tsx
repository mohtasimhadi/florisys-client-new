'use client'

import { useSettings } from '@/lib/settingsStore'
import { useEffect, useState } from 'react'

export default function Page() {
  const { dashboardBaseUrl, roverBaseUrl, setDashboardBaseUrl, setRoverBaseUrl, resetDefaults } = useSettings()
  const [db, setDb] = useState(dashboardBaseUrl)
  const [rv, setRv] = useState(roverBaseUrl)

  useEffect(() => setDb(dashboardBaseUrl), [dashboardBaseUrl])
  useEffect(() => setRv(roverBaseUrl), [roverBaseUrl])

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <div className="text-sm font-medium">Dashboard backend</div>
          <div className="mt-3 space-y-3">
            <input
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-sm outline-none ring-0 focus:border-zinc-700"
              value={db}
              onChange={(e) => setDb(e.target.value)}
              placeholder="http://localhost:8000"
              inputMode="url"
            />
            <button
              onClick={() => setDashboardBaseUrl(db)}
              className="inline-flex items-center justify-center rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-white"
            >
              Save
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <div className="text-sm font-medium">Rover Navigation backend</div>
          <div className="mt-3 space-y-3">
            <input
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-sm outline-none ring-0 focus:border-zinc-700"
              value={rv}
              onChange={(e) => setRv(e.target.value)}
              placeholder="http://localhost:8000"
              inputMode="url"
            />
            <button
              onClick={() => setRoverBaseUrl(rv)}
              className="inline-flex items-center justify-center rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-white"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={resetDefaults}
        className="rounded-lg border border-zinc-800 px-3 py-2 text-sm hover:bg-zinc-900"
      >
        Reset to defaults
      </button>

      <div className="text-xs text-zinc-400">Values persist in localStorage.</div>
    </div>
  )
}
