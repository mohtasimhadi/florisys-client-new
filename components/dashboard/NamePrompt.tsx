'use client'

import { useEffect, useRef, useState } from 'react'

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
    <div className="absolute inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm">
      <div className="w-[min(420px,92vw)] rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-xl">
        <div className="text-base font-semibold mb-2">Name this bed</div>
        <input
          ref={inputRef}
          value={name}
          onChange={(e)=>setName(e.target.value)}
          placeholder="e.g. South-4"
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm outline-none"
        />
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-zinc-800 px-3 py-1.5 text-sm hover:bg-zinc-900"
          >
            Cancel
          </button>
          <button
            onClick={()=>name.trim() && onSubmit(name.trim())}
            className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-100 disabled:opacity-50"
            disabled={!name.trim()}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
