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
      <h1 className="text-2xl font-semibold text-slate-800">Settings</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-50 p-4 shadow-sm">
          <div className="text-sm font-medium text-slate-700">Dashboard backend</div>
          <div className="mt-3 space-y-3">
            <input
              className="w-full rounded-lg border border-teal-200 bg-white px-3 py-2 font-mono text-sm text-slate-700 outline-none ring-0 focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
              value={db}
              onChange={(e) => setDb(e.target.value)}
              placeholder="http://localhost:8000"
              inputMode="url"
            />
            <button
              onClick={() => setDashboardBaseUrl(db)}
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-teal-500 to-sky-500 px-3 py-2 text-sm font-medium text-white shadow hover:brightness-105"
            >
              Save
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-50 p-4 shadow-sm">
          <div className="text-sm font-medium text-slate-700">Rover Navigation backend</div>
          <div className="mt-3 space-y-3">
            <input
              className="w-full rounded-lg border border-teal-200 bg-white px-3 py-2 font-mono text-sm text-slate-700 outline-none ring-0 focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
              value={rv}
              onChange={(e) => setRv(e.target.value)}
              placeholder="http://localhost:8000"
              inputMode="url"
            />
            <button
              onClick={() => setRoverBaseUrl(rv)}
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-teal-500 to-sky-500 px-3 py-2 text-sm font-medium text-white shadow hover:brightness-105"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={resetDefaults}
        className="rounded-lg border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 px-3 py-2 text-sm font-medium text-red-700 hover:brightness-105"
      >
        Reset to defaults
      </button>

      <div className="text-xs text-slate-500">Values persist in localStorage.</div>
    </div>
  )
}
