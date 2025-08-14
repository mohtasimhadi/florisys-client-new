// components/dashboard/ConfirmShapeModal.tsx
'use client'

import { useEffect, useRef, useState } from 'react'

export default function ConfirmShapeModal({
  kind,                 // 'add' | 'edit'
  ringLL,               // [lon,lat][] closed ring
  onCancel,
  onSave,               // for add: (name: string) => void ; for edit: () => void
}: {
  kind: 'add' | 'edit'
  ringLL: [number, number][]
  onCancel: () => void
  onSave: (name?: string) => void
}) {
  const [name, setName] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (kind === 'add') inputRef.current?.focus()
  }, [kind])

  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm">
      <div className="w-[min(520px,92vw)] rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-xl">
        <div className="mb-3 text-base font-semibold">
          {kind === 'add' ? 'Add bed' : 'Update bed'}
        </div>
        {kind === 'add' && (
          <div className="mb-3">
            <label className="mb-1 block text-xs text-zinc-400">Name</label>
            <input
              ref={inputRef}
              value={name}
              onChange={(e)=>setName(e.target.value)}
              placeholder="e.g. South-4"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm outline-none"
            />
          </div>
        )}
        <div className="mb-3">
          <div className="mb-1 text-xs text-zinc-400">Vertices (lon, lat)</div>
          <div className="max-h-40 overflow-auto rounded-lg border border-zinc-800 bg-zinc-950 p-2 font-mono text-xs text-zinc-300">
            {ringLL.map(([lon,lat], i) => (
              <div key={i}>{lon.toFixed(6)}, {lat.toFixed(6)}</div>
            ))}
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-zinc-800 px-3 py-1.5 text-sm hover:bg-zinc-900"
          >
            Cancel
          </button>
          <button
            onClick={() => kind === 'add' ? (name.trim() && onSave(name.trim())) : onSave()}
            disabled={kind === 'add' && !name.trim()}
            className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-100 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
