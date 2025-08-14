'use client'

import { useSettings } from '@/lib/settingsStore'

export default function Page() {
  const { roverBaseUrl } = useSettings()
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Rover Navigation</h1>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <div className="text-xs text-zinc-400">Configured backend</div>
        <div className="mt-1 font-mono text-sm">{roverBaseUrl}</div>
      </div>
    </div>
  )
}
