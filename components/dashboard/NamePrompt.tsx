'use client'

import { useEffect, useRef, useState } from 'react'
import { Tag } from 'lucide-react'

export default function NamePrompt({
  onCancel,
  onSubmit,
  defaultValue = ''
}: {
  onCancel: () => void
  onSubmit: (name: string) => void
  defaultValue?: string
}) {
  const [name, setName] = useState(defaultValue)
  const inputRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => { inputRef.current?.focus() }, [])

  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm">
      <div className="w-[min(420px,92vw)] rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50 p-5 shadow-xl">
        
        <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-700">
          <Tag className="h-5 w-5 text-sky-500" />
          Name this bed
        </div>

        <input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. South-4"
          className="w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-sky-300"
        />

        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={() => name.trim() && onSubmit(name.trim())}
            disabled={!name.trim()}
            className="rounded-lg bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 px-3 py-1.5 text-sm font-medium text-white shadow hover:brightness-105 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
