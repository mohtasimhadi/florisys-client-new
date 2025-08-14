'use client'

import { Bed } from '@/types/bed'
import { MdOutlineEditLocationAlt, MdOutlineDelete, MdArrowBack } from 'react-icons/md'

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
      <div className="w-[min(420px,92vw)] rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50 p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-lg font-semibold text-slate-700">{bed.name}</div>
          <button
            className="flex items-center gap-1 rounded-md border border-sky-300 bg-white/80 px-3 py-1.5 text-sm text-sky-700 hover:bg-white"
            onClick={onClose}
          >
            <MdArrowBack className="w-4 h-4" />
            Go back
          </button>
        </div>
        <div className="grid gap-3">
          <button
            onClick={() => onEdit(bed.id)}
            className="flex items-center justify-center gap-2 rounded-lg bg-sky-500 px-3 py-2 text-sm font-medium text-white shadow hover:bg-sky-600"
          >
            <MdOutlineEditLocationAlt className="w-5 h-5" />
            Edit coordinates
          </button>
          <button
            onClick={() => onDelete(bed.id)}
            className="flex items-center justify-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 shadow hover:bg-red-100"
          >
            <MdOutlineDelete className="w-5 h-5" />
            Delete this bed
          </button>
        </div>
      </div>
    </div>
  )
}
