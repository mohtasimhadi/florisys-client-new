'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { usePlotStore } from '@/lib/plotStore'
import Spinner from '@/components/ui/Spinner'

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function PlotSidebar() {
  const { plots, selectedId, select, load, add, remove, loading, error, uploading } = usePlotStore()
  const [q, setQ] = useState('')
  const fileRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return plots
    return plots.filter(p => p.name.toLowerCase().includes(t))
  }, [plots, q])

  return (
    <div className="relative flex h-full w-full flex-col gap-3 p-3 bg-gradient-to-b from-sky-100 via-cyan-100 to-teal-100">
      
      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <input
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-gray-500 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition disabled:opacity-60"
          placeholder="Search plots..."
          value={q}
          onChange={(e)=>setQ(e.target.value)}
          disabled={uploading}
        />
      </div>

      <div className="text-xs text-slate-600 font-medium">
        {uploading
          ? 'Uploading…'
          : loading
          ? 'Loading…'
          : error
          ? error
          : `${filtered.length} plot${filtered.length===1?'':'s'}`}
      </div>

      {/* Plot List */}
      <div className="relative flex-1 overflow-auto">
        {filtered.length === 0 && !loading && !uploading ? (
          <div className="grid h-full place-items-center text-sm text-gray-500">No plots</div>
        ) : (
          <ul className="space-y-1 p-2">
            {filtered.map(p => {
              const active = selectedId === p.id
              const created = p.createdAt ? new Date(p.createdAt) : null
              return (
                <li key={p.id}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => select(p.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') select(p.id) }}
                    className={[
                      'group grid grid-cols-[1fr_auto] items-center gap-2 rounded-lg px-3 py-2 transition',
                      active
                        ? 'bg-gradient-to-r from-sky-200 via-cyan-200 to-teal-200 text-slate-900 font-medium shadow'
                        : 'bg-white hover:bg-sky-50 border border-gray-200 text-slate-800'
                    ].join(' ')}
                  >
                    <div className="min-w-0">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className={`h-2 w-2 shrink-0 rounded-full ${active ? 'bg-slate-900' : 'bg-sky-400 group-hover:bg-sky-500'}`} />
                        <span className="truncate text-sm">{p.name}</span>
                      </div>
                      {created && (
                        <div className={`mt-1 text-[11px] leading-none ${active ? 'text-slate-800' : 'text-gray-500'}`}>
                          {created.toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); remove(p.id) }}
                      className={`rounded-md px-2 py-1 text-xs font-medium transition ${
                        active
                          ? 'bg-white/50 text-slate-900 hover:bg-white/70 border border-white/40'
                          : 'bg-red-100 text-red-600 hover:bg-red-200 border border-red-300'
                      }`}
                      disabled={uploading}
                      aria-label={`Remove ${p.name}`}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
        {(loading || uploading) && (
          <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center rounded-xl bg-white/50">
            <Spinner className="h-5 w-5 text-sky-500" />
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <input
        ref={fileRef}
        type="file"
        accept=".tif,.tiff"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0]
          if (f) {
            try { await add(f) } finally { e.currentTarget.value = '' }
          }
        }}
      />
      <button
        onClick={() => fileRef.current?.click()}
        className="absolute bottom-4 right-4 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-sky-300 via-cyan-300 to-teal-300 text-slate-900 shadow-lg hover:brightness-110 active:scale-95 transition"
        disabled={uploading}
        title="Add new plot"
      >
        {uploading ? <Spinner className="h-5 w-5" /> : <PlusIcon className="h-6 w-6" />}
      </button>
    </div>
  )
}
