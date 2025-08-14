'use client'

import { useEffect, useRef, useState } from 'react'

export default function ConfirmShapeModal({
  kind,
  ringLL,
  onCancel,
  onSave
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
    <div className="absolute inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm">
      <div className="w-[min(520px,92vw)] rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50 p-5 shadow-xl">
        
        <div className="mb-4 text-lg font-semibold text-slate-700">
          {kind === 'add' ? 'Add Bed' : 'Update Bed'}
        </div>

        {kind === 'add' && (
          <div className="mb-4">
            <label className="mb-1 block text-xs font-medium text-slate-600">Name</label>
            <input
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. South-4"
              className="w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-sky-300"
            />
          </div>
        )}

        <div className="mb-4">
          <div className="mb-1 text-xs font-medium text-slate-600">Vertices (lon, lat)</div>
          <div className="max-h-40 overflow-auto rounded-lg border border-sky-200 bg-white p-2 font-mono text-xs text-slate-700 shadow-inner">
            {ringLL.map(([lon, lat], i) => (
              <div key={i}>
                {lon.toFixed(6)}, {lat.toFixed(6)}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              kind === 'add' ? (name.trim() && onSave(name.trim())) : onSave()
            }
            disabled={kind === 'add' && !name.trim()}
            className="rounded-lg bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 px-3 py-1.5 text-sm font-medium text-white shadow hover:brightness-105 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
