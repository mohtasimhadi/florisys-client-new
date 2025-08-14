// components/dashboard/BedDetailsPanel.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import { Bed, SpatialMap } from '@/types/bed'
import { MdOutlineEditLocationAlt, MdOutlineDelete, MdArrowBack, MdOutlineUploadFile, MdOutlineSensors } from 'react-icons/md'
import PlyViewer from '@/components/ply/PlyViewer'

export default function BedDetailsPanel({
  bed,
  apiBase,                  // ✅ add apiBase to build URLs when server doesn't return absolute url
  onClose,
  onStartEdit,
  onDelete,
  onUploadSpatialMap,
  onCollectRoverData
}: {
  bed: Bed
  apiBase: string
  onClose: () => void
  onStartEdit: (bedId: string) => void
  onDelete: (bedId: string) => void
  onUploadSpatialMap: (bedId: string, file: File) => void
  onCollectRoverData: (bedId: string) => void
}) {
  const sortedMaps = useMemo(() => {
    const arr = (bed.spatialMaps || []).slice()
    arr.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return arr
  }, [bed.spatialMaps])

  const [selectedMap, setSelectedMap] = useState<SpatialMap | null>(sortedMaps[0] || null)
  useEffect(() => {
    setSelectedMap(sortedMaps[0] || null)
  }, [sortedMaps])

  const mapUrl = useMemo(() => {
    if (!selectedMap) return null
    // prefer server-provided absolute url; otherwise build from filename
    return selectedMap.url || (selectedMap.filename
      ? `${apiBase.replace(/\/$/, '')}/files/${selectedMap.filename}`
      : null)
  }, [selectedMap, apiBase])

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-sky-200 bg-white/60 px-4 py-3 shadow-sm">
        <button onClick={onClose} className="flex items-center gap-1 rounded-md border border-sky-300 bg-white px-3 py-1.5 text-sm font-medium text-sky-700 hover:bg-sky-50">
          <MdArrowBack className="h-4 w-4" /> Go back
        </button>
        <div className="ml-2 text-lg font-semibold tracking-wide text-slate-700">{bed.name}</div>
        <div className="ml-auto flex items-center gap-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-sky-300 bg-white px-3 py-2 text-sm font-medium text-sky-700 shadow hover:bg-sky-50">
            <MdOutlineUploadFile className="h-5 w-5" />
            Upload PLY
            <input
              type="file"
              accept=".ply"
              className="hidden"
              onChange={(e) => e.target.files && onUploadSpatialMap(bed.id, e.target.files[0])}
            />
          </label>
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
        <div className="mx-auto max-w-5xl space-y-6 rounded-xl border border-sky-200 bg-white/70 p-4 shadow-md">
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_320px]">
            <div>
              <div className="mb-2 text-xs uppercase tracking-wide text-sky-600">Spatial Map Preview</div>
              {mapUrl ? (
                <PlyViewer src={mapUrl} />
              ) : (
                <div className="grid h-72 place-items-center rounded-lg border border-sky-200 bg-sky-50 text-sm text-slate-600">
                  No PLY selected
                </div>
              )}
            </div>

            <div>
              <div className="mb-2 text-xs uppercase tracking-wide text-sky-600">Available PLYs</div>
              {sortedMaps.length === 0 ? (
                <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-slate-600">
                  No spatial maps uploaded yet.
                </div>
              ) : (
                <>
                  <select
                    className="w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm"
                    value={selectedMap?.id || ''}
                    onChange={(e) => setSelectedMap(sortedMaps.find(m => m.id === e.target.value) || null)}
                  >
                    {sortedMaps.map(m => (
                      <option key={m.id} value={m.id}>
                        {new Date(m.date).toLocaleString()} — {m.fileName}
                      </option>
                    ))}
                  </select>

                  <ul className="mt-3 space-y-2">
                    {sortedMaps.map(m => (
                      <li key={m.id}>
                        <button
                          className={[
                            'w-full rounded-lg border px-3 py-2 text-left text-sm shadow-sm transition',
                            selectedMap?.id === m.id
                              ? 'border-sky-300 bg-sky-50 text-slate-800'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          ].join(' ')}
                          onClick={() => setSelectedMap(m)}
                        >
                          <div className="font-medium">{m.fileName}</div>
                          <div className="text-xs text-slate-500">{new Date(m.date).toLocaleString()}</div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* Rover Data */}
              <div className="mt-4">
                <button
                  onClick={() => onCollectRoverData(bed.id)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white shadow hover:bg-teal-600"
                >
                  <MdOutlineSensors className="h-5 w-5" /> Collect Data Using Rover
                </button>
              </div>
            </div>
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
