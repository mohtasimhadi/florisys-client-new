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
    <div className="flex h-full w-full flex-col gap-3 p-3">
      <div className="flex items-center gap-2">
        <input
          className="w-full rounded-xl border border-zinc-800/80 bg-zinc-950/60 px-3 py-2 text-sm outline-none ring-1 ring-transparent transition focus:border-zinc-700 focus:ring-zinc-700 disabled:opacity-60"
          placeholder="Search plots"
          value={q}
          onChange={(e)=>setQ(e.target.value)}
          disabled={uploading}
        />

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
          className="inline-flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-white disabled:opacity-60"
          disabled={uploading}
        >
          {uploading ? (<><Spinner className="h-4 w-4" /><span>Uploading…</span></>) : (<><PlusIcon className="h-4 w-4" /><span>Add</span></>)}
        </button>
      </div>

      <div className="text-xs text-zinc-400">
        {uploading ? 'Uploading…' : loading ? 'Loading…' : error ? error : `${filtered.length} plot${filtered.length===1?'':'s'}`}
      </div>

      <div className="relative flex-1 overflow-auto rounded-2xl border border-zinc-800/80 bg-zinc-950/40">
        {filtered.length === 0 && !loading && !uploading ? (
          <div className="grid h-full place-items-center text-sm text-zinc-500">No plots</div>
        ) : (
          <ul className="space-y-1 p-2">
            {filtered.map(p => {
              const active = selectedId === p.id
              const created = p.createdAt ? new Date(p.createdAt) : null
              return (
                <li key={p.id}>
                  {/* Entire row is clickable */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => select(p.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') select(p.id) }}
                    className={[
                      'group grid grid-cols-[1fr_auto] items-center gap-2 rounded-xl px-3 py-2 transition',
                      active ? 'bg-zinc-900/70 ring-1 ring-zinc-800' : 'hover:bg-zinc-900/40'
                    ].join(' ')}
                  >
                    <div className="min-w-0">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="h-2 w-2 shrink-0 rounded-full bg-zinc-500 group-hover:bg-zinc-300" />
                        <span className="truncate text-sm">{p.name}</span>
                      </div>
                      {created && (
                        <div className="mt-1 text-[11px] leading-none text-zinc-500">
                          {created.toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {/* Remove button — stops propagation so row doesn’t “select” */}
                    <button
                      onClick={(e) => { e.stopPropagation(); remove(p.id) }}
                      className="rounded-md border border-zinc-800 px-2 py-1 text-xs text-zinc-300 transition hover:bg-zinc-900/60 disabled:opacity-60"
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
          <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center rounded-2xl bg-zinc-950/40">
            <Spinner className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  )
}
