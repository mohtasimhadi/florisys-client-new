'use client'

import { Bed, SpatialMap } from '@/types/bed'
import { MdOutlineEditLocationAlt, MdOutlineDelete, MdArrowBack, MdOutlineUploadFile, MdOutlineSensors } from 'react-icons/md'
import { useState } from 'react'

export default function BedDetailsPanel({
  bed,
  onClose,
  onStartEdit,
  onDelete,
  onUploadSpatialMap,
  onCollectRoverData
}: {
  bed: Bed
  onClose: () => void
  onStartEdit: (bedId: string) => void
  onDelete: (bedId: string) => void
  onUploadSpatialMap: (bedId: string, file: File) => void
  onCollectRoverData: (bedId: string) => void
}) {
  const [selectedMap, setSelectedMap] = useState<SpatialMap | null>(bed.spatialMaps?.[0] || null)

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-sky-200 bg-white/60 px-4 py-3 shadow-sm">
        <button onClick={onClose} className="flex items-center gap-1 rounded-md border border-sky-300 bg-white px-3 py-1.5 text-sm font-medium text-sky-700 hover:bg-sky-50">
          <MdArrowBack className="h-4 w-4" /> Go back
        </button>
        <div className="ml-2 text-lg font-semibold tracking-wide text-slate-700">{bed.name}</div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => onStartEdit(bed.id)} className="flex items-center gap-2 rounded-lg bg-sky-500 px-3 py-2 text-sm font-medium text-white shadow hover:bg-sky-600">
            <MdOutlineEditLocationAlt className="h-5 w-5" /> Edit
          </button>
          <button onClick={() => onDelete(bed.id)} className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 shadow hover:bg-red-100">
            <MdOutlineDelete className="h-5 w-5" /> Delete
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 py-5">
        <div className="mx-auto max-w-4xl space-y-6 rounded-xl border border-sky-200 bg-white/70 p-4 shadow-md">
          
          {/* Bed Info */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <div className="text-xs uppercase tracking-wide text-sky-600">Bed ID</div>
              <div className="mt-1 font-mono text-sm text-slate-700">{bed.id}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-sky-600">Vertices</div>
              <div className="mt-1 max-h-40 overflow-auto rounded-lg border border-sky-100 bg-sky-50 p-2 font-mono text-xs text-slate-700">
                {bed.coordinates?.[0]?.map(([lon, lat], i) => (
                  <div key={i}>{lon.toFixed(6)}, {lat.toFixed(6)}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Spatial Maps */}
          <div>
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wide text-sky-600">Spatial Maps</div>
              <label className="flex items-center gap-1 cursor-pointer text-sm text-sky-600 hover:underline">
                <MdOutlineUploadFile className="h-4 w-4" /> Upload
                <input type="file" accept=".ply" className="hidden" onChange={(e) => e.target.files && onUploadSpatialMap(bed.id, e.target.files[0])} />
              </label>
            </div>
            <select
              className="mt-2 w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm"
              value={selectedMap?.id || ''}
              onChange={(e) => setSelectedMap(bed.spatialMaps?.find(m => m.id === e.target.value) || null)}
            >
              {bed.spatialMaps?.map(m => (
                <option key={m.id} value={m.id}>
                  {new Date(m.date).toLocaleString()}
                </option>
              ))}
            </select>
            {selectedMap && (
              <div className="mt-3 text-sm text-slate-700">Latest Map: {selectedMap.fileName}</div>
            )}
          </div>

          {/* Rover Data Collection */}
          <div>
            <button onClick={() => onCollectRoverData(bed.id)} className="flex items-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white shadow hover:bg-teal-600">
              <MdOutlineSensors className="h-5 w-5" /> Collect Data Using Rover
            </button>
          </div>

          {bed.createdAt && (
            <div className="text-xs text-slate-500">
              Created: {new Date(bed.createdAt).toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
