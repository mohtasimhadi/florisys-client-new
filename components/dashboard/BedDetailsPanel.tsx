'use client'

import { Bed } from '@/types/bed'

export default function BedDetailsPanel({
  bed,
  onClose,
  onStartEdit,
  onDelete
}: {
  bed: Bed
  onClose: () => void
  onStartEdit: (bedId: string) => void
  onDelete: (bedId: string) => void
}) {
  return (
    <div className="absolute inset-0 z-40 bg-zinc-950/95">
      <div className="mx-auto max-w-3xl px-4 py-4">
        <div className="mb-4 flex items-center gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-zinc-800 px-3 py-1.5 text-sm hover:bg-zinc-900"
          >
            ← Go back
          </button>
          <div className="ml-2 text-lg font-semibold tracking-wide">{bed.name}</div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => onStartEdit(bed.id)}
              className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
            >
              Edit (pick 4 points)
            </button>
            <button
              onClick={() => onDelete(bed.id)}
              className="rounded-lg border border-red-500/60 px-3 py-2 text-sm text-red-300 hover:bg-red-500/10"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="grid gap-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-500">Bed ID</div>
              <div className="font-mono text-xs text-zinc-300">{bed.id}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-500">Vertices</div>
              <div className="max-h-40 overflow-auto rounded-lg border border-zinc-800 bg-zinc-950 p-2 font-mono text-xs text-zinc-300">
                {bed.coordinates?.[0]?.map(([lon, lat], i) => (
                  <div key={i}>{lon.toFixed(6)}, {lat.toFixed(6)}</div>
                ))}
              </div>
            </div>
          </div>
          {bed.createdAt && (
            <div className="text-xs text-zinc-500">
              Created: {new Date(bed.createdAt).toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
