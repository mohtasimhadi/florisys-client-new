'use client'

import { Plus, X, MousePointer2, Pencil } from 'lucide-react'

export default function BedToolbar({
  adding,
  onToggleAdd,
  editingName,
  onCancelEdit,
  disabled
}: {
  adding: boolean
  onToggleAdd: () => void
  editingName: string | null
  onCancelEdit: () => void
  disabled?: boolean
}) {
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50">
      {/* Editing Info */}
      {editingName && (
        <div className="pointer-events-auto mb-3 max-w-[80vw] rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-400/90 via-cyan-400/90 to-teal-400/90 px-3 py-2 text-xs text-white shadow-xl backdrop-blur">
          <div className="flex items-center gap-2">
            <Pencil className="h-4 w-4 opacity-95" />
            <span className="font-medium">Editing:</span>
            <span className="truncate opacity-95">{editingName}</span>
            <span className="hidden sm:inline opacity-90">• click 4 points</span>
            <button
              onClick={onCancelEdit}
              className="ml-auto inline-flex items-center gap-1 rounded-md border border-white/30 bg-white/15 px-2 py-1 text-[11px] hover:bg-white/25"
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={onToggleAdd}
        disabled={disabled}
        aria-label={adding ? 'Finish adding bed' : 'Add bed'}
        title={adding ? 'Finish adding bed' : 'Add bed (click 4 points)'}
        className={[
          'pointer-events-auto relative flex h-16 w-16 items-center justify-center rounded-full',
          'bg-gradient-to-br from-sky-400 via-cyan-400 to-teal-400 text-white',
          'shadow-lg ring-2 ring-sky-200/60 transition-all duration-200 hover:brightness-105 active:brightness-95',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
          adding ? 'animate-pulse' : ''
        ].join(' ')}
      >
        {/* Soft glow halo */}
        <span
          aria-hidden
          className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-sky-400 via-cyan-400 to-teal-400 blur-xl opacity-50"
        />

        {/* Inner light reflection */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-white/10"
          style={{
            maskImage:
              'radial-gradient(circle at 30% 30%, rgba(255,255,255,.9), rgba(255,255,255,0) 60%)'
          }}
        />

        {/* Icon swap: Plus ↔ X */}
        <Plus
          className={[
            'h-7 w-7 drop-shadow-sm transition-all duration-200',
            adding ? 'scale-0 opacity-0 rotate-90' : 'scale-100 opacity-100'
          ].join(' ')}
        />
        <X
          className={[
            'absolute h-7 w-7 drop-shadow-sm transition-all duration-200',
            adding ? 'scale-100 opacity-100 rotate-90' : 'scale-0 opacity-0'
          ].join(' ')}
        />

        {/* Helper chip */}
        <span
          className={[
            'absolute -top-8 right-0 hidden items-center gap-1 rounded-full bg-sky-900/85 px-2 py-1 text-[10px] text-white/90 ring-1 ring-sky-200/40 backdrop-blur sm:flex',
            adding ? 'opacity-100' : 'opacity-0'
          ].join(' ')}
        >
          <MousePointer2 className="h-3 w-3" />
          click 4 points
        </span>
      </button>
    </div>
  )
}
