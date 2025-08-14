// components/dashboard/BedActionPanel.tsx
'use client'

import { Bed } from '@/types/bed'

export default function BedActionPanel({
  bed,
  onClose,
  onEdit,
  onDelete
}: {
  bed: Bed
  onClose: () => void
  onEdit: (bedId: string) => void
  onDelete: (bedId: string) => void
}) {
  return (
    <div className="absolute inset-0 z-30 grid place-items-center bg-black/40 backdrop-blur-sm">
      <div className="w-[min(420px,92vw)] rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-lg font-semibold">{bed.name}</div>
          <button
            className="rounded-md border border-zinc-800 px-3 py-1.5 text-sm hover:bg-zinc-900"
            onClick={onClose}
          >
            Go back
          </button>
        </div>
        <div className="grid gap-4">
          <button
            onClick={()=>onEdit(bed.id)}
            className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
          >
            Edit coordinates
          </button>
          <button
            onClick={()=>onDelete(bed.id)}
            className="rounded-lg border border-red-500/60 px-3 py-2 text-sm text-red-300 hover:bg-red-500/10"
          >
            Delete this bed
          </button>
        </div>
      </div>
    </div>
  )
}
