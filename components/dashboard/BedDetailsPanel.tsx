// components/dashboard/BedDetailsPanel.tsx
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Bed, SpatialMap } from '@/types/bed'
import {
  MdOutlineEditLocationAlt,
  MdOutlineDelete,
  MdArrowBack,
  MdOutlineUploadFile,
  MdOutlineSensors,
  MdMap,
  MdInsertDriveFile,
} from 'react-icons/md'
import PlyViewer from '@/components/ply/PlyViewer'
import BedMiniMap from '@/components/bed/BedMiniMap'

type Grade = 'A' | 'B' | 'C' | 'D'

/** --- Dummy analytics helpers (deterministic from file name/id) --- */
function hashish(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}
function deriveMetrics(sm: SpatialMap) {
  const key = sm.fileName || sm.filename || sm.id || 'x'
  const h = hashish(key)
  const count = 80 + (h % 420)            // 80..499
  const avgVolume = 8 + ((h >> 3) % 220) / 10 // 8.0..29.9
  const grade: Grade = (['A', 'B', 'C', 'D'] as Grade[])[(h >> 7) % 4]
  return { count, avgVolume, grade }
}
function gradeToScore(g: Grade) {
  // higher is better for line chart
  return g === 'A' ? 4 : g === 'B' ? 3 : g === 'C' ? 2 : 1
}
function scoreToGrade(s: number): Grade {
  return s >= 3.5 ? 'A' : s >= 2.5 ? 'B' : s >= 1.5 ? 'C' : 'D'
}

/** --- Tiny inline charts (SVG) --- */
function TinyLine({ data, label }: { data: number[]; label: string }) {
  const w = 260
  const h = 90
  const pad = 10
  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = Math.max(1e-6, max - min)
  const stepX = data.length > 1 ? (w - pad * 2) / (data.length - 1) : 0
  const pts = data.map((v, i) => {
    const x = pad + i * stepX
    const y = h - pad - ((v - min) / span) * (h - pad * 2)
    return `${x},${y}`
  }).join(' ')
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-1 text-xs font-medium text-slate-600">{label}</div>
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`}>
        <rect x="0" y="0" width={w} height={h} fill="white" />
        <polyline points={pts} fill="none" stroke="#0ea5e9" strokeWidth="2" />
      </svg>
    </div>
  )
}
function TinyBars({ data, label }: { data: number[]; label: string }) {
  const w = 260
  const h = 90
  const pad = 10
  const max = Math.max(...data, 1)
  const barW = (w - pad * 2) / Math.max(1, data.length)
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-1 text-xs font-medium text-slate-600">{label}</div>
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`}>
        <rect x="0" y="0" width={w} height={h} fill="white" />
        {data.map((v, i) => {
          const x = pad + i * barW
          const bh = ((v / max) * (h - pad * 2))
          const y = h - pad - bh
          return <rect key={i} x={x + 2} y={y} width={barW - 4} height={bh} fill="#10b981" />
        })}
      </svg>
    </div>
  )
}
function TinyGrades({ data, label }: { data: Grade[]; label: string }) {
  const scores = data.map(gradeToScore)
  return <TinyLine data={scores} label={`${label} (A=4 … D=1)`} />
}

export default function BedDetailsPanel({
  bed,
  apiBase,
  plotUrl, // optional: GeoTIFF url for mini map baselayer
  onClose,
  onStartEdit,
  onDelete,
  onUploadSpatialMap,
  onCollectRoverData
}: {
  bed: Bed
  apiBase: string
  plotUrl?: string | null
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

  // derive metrics for each map
  const metrics = useMemo(() => {
    const m = new Map<string, ReturnType<typeof deriveMetrics>>()
    for (const sm of sortedMaps) m.set(sm.id, deriveMetrics(sm))
    return m
  }, [sortedMaps])

  const [selectedMap, setSelectedMap] = useState<SpatialMap | null>(sortedMaps[0] || null)
  useEffect(() => {
    setSelectedMap(sortedMaps[0] || null)
  }, [sortedMaps])

  const mapUrl = useMemo(() => {
    if (!selectedMap) return null
    return selectedMap.url || (selectedMap.filename
      ? `${apiBase.replace(/\/$/, '')}/files/${selectedMap.filename}`
      : null)
  }, [selectedMap, apiBase])

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // series for charts (only when we have >=2 maps)
  const series = useMemo(() => {
    const vols = sortedMaps.map(sm => metrics.get(sm.id)!.avgVolume)
    const counts = sortedMaps.map(sm => metrics.get(sm.id)!.count)
    const grades = sortedMaps.map(sm => metrics.get(sm.id)!.grade)
    return { vols, counts, grades }
  }, [sortedMaps, metrics])

  const selectedMetrics = selectedMap ? metrics.get(selectedMap.id)! : null

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-sky-200/70 bg-white/70 backdrop-blur">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1 rounded-lg border border-sky-300 bg-white px-3 py-1.5 text-sm font-medium text-sky-700 shadow-sm hover:bg-sky-50"
          >
            <MdArrowBack className="h-4 w-4" />
            Go back
          </button>

          <div className="ml-1 flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-sky-600">
              <MdMap className="h-4 w-4" />
            </span>
            <div className="text-lg font-semibold tracking-wide text-slate-800">{bed.name}</div>
            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-medium text-sky-700">
              Bed
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-sky-300 bg-white px-3 py-2 text-sm font-medium text-sky-700 shadow-sm hover:bg-sky-50">
              <MdOutlineUploadFile className="h-5 w-5" />
              Upload
              <input
                ref={fileInputRef}
                type="file"
                accept=".ply"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) {
                    onUploadSpatialMap(bed.id, f)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }
                }}
              />
            </label>

            <button
              onClick={() => onStartEdit(bed.id)}
              className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-3 py-2 text-sm font-medium text-white shadow hover:bg-sky-600"
            >
              <MdOutlineEditLocationAlt className="h-5 w-5" />
              Edit
            </button>

            <button
              onClick={() => onDelete(bed.id)}
              className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 shadow hover:bg-red-100"
            >
              <MdOutlineDelete className="h-5 w-5" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto px-4 py-5">
        <div className="mx-auto grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column: info + mini map + rover */}
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-xl border border-sky-200 bg-white/75 p-4 shadow-sm">
              <div className="mb-2 text-xs uppercase tracking-wide text-sky-600">Bed ID</div>
              <div className="break-all font-mono text-sm text-slate-700">{bed.id}</div>

              {bed.createdAt && (
                <div className="mt-3 text-xs text-slate-500">
                  Created: {new Date(bed.createdAt).toLocaleString()}
                </div>
              )}
              {bed.updatedAt && (
                <div className="text-xs text-slate-500">
                  Updated: {new Date(bed.updatedAt).toLocaleString()}
                </div>
              )}

              <button
                onClick={() => onCollectRoverData(bed.id)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-500 px-4 py-2 mt-3 text-sm font-medium text-white shadow hover:bg-teal-600"
              >
                <MdOutlineSensors className="h-5 w-5" />
                Download XLSX Report
              </button>

              <div className="mb-2 mt-4 text-xs uppercase tracking-wide text-sky-600">Area Preview</div>
              {bed.coordinates?.[0]?.length ? (
                <BedMiniMap ringLL={bed.coordinates[0] as [number, number][]} plotUrl={plotUrl} />
              ) : (
                <div className="grid h-48 place-items-center rounded-lg border border-sky-200 bg-sky-50 text-sm text-slate-600">
                  No polygon defined
                </div>
              )}

              <div className="mb-2 mt-4 text-xs uppercase tracking-wide text-teal-600">Rover</div>
              <button
                onClick={() => onCollectRoverData(bed.id)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white shadow hover:bg-teal-600"
              >
                <MdOutlineSensors className="h-5 w-5" />
                Collect Data Using Rover
              </button>

              <div className="mb-2 mt-5 text-xs uppercase tracking-wide text-slate-600">Available PLYs</div>
              {sortedMaps.length === 0 ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                  No spatial maps uploaded yet.
                </div>
              ) : (
                <>
                  <select
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    value={selectedMap?.id || ''}
                    onChange={(e) =>
                      setSelectedMap(sortedMaps.find((m) => m.id === e.target.value) || null)
                    }
                  >
                    {sortedMaps.map((m, i) => (
                      <option key={m.id} value={m.id}>
                        {new Date(m.date).toLocaleString()} — {m.fileName} {i === 0 ? '(Latest)' : ''}
                      </option>
                    ))}
                  </select>

                  <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                    {sortedMaps.map((m) => {
                      const isActive = selectedMap?.id === m.id
                      return (
                        <li key={m.id}>
                          <button
                            onClick={() => setSelectedMap(m)}
                            className={[
                              'flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm shadow-sm transition',
                              isActive
                                ? 'border-sky-300 bg-sky-50 text-slate-800'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            ].join(' ')}
                          >
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-sky-100 text-sky-600">
                              <MdInsertDriveFile className="h-5 w-5" />
                            </span>
                            <div className="min-w-0">
                              <div className="truncate font-medium">{m.fileName}</div>
                              <div className="text-xs text-slate-500">
                                {new Date(m.date).toLocaleString()}
                              </div>
                            </div>
                            {isActive && (
                              <span className="ml-auto rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
                                Selected
                              </span>
                            )}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </>
              )}
            </div>
          </div>

          {/* Right column: PLY preview + list + analytics */}
          <div className="space-y-6 lg:col-span-2">

            {/* Analytics */}
            <div className="rounded-xl border border-sky-200 bg-white/75 p-4 shadow-sm">
              <div className="mb-2 text-xs uppercase tracking-wide text-slate-600">Analysis</div>
              {sortedMaps.length < 2 ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                  Time-series analysis is not available — upload at least two PLY scans.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <TinyLine data={series.vols} label="Volume (avg cm³)" />
                  <TinyBars data={series.counts} label="Count" />
                  <TinyGrades data={series.grades} label="Grade (A–D)" />
                </div>
              )}
            </div>

            {/* PLY list */}
            <div className="rounded-xl border border-sky-200 bg-white/75 p-4 pt-0 shadow-sm">
              <div className="mb-3 mt-4 flex items-center justify-between">
                <div className="text-xs uppercase tracking-wide text-sky-600">Spatial Map Preview</div>
                {selectedMap ? (
                  <div className="rounded-full bg-sky-100 px-2 py-1 text-[11px] font-medium text-sky-700">
                    {selectedMap.date}
                  </div>
                ) : null}
              </div>

              {mapUrl ? (
                <div className="overflow-hidden rounded-lg border border-sky-200">
                  <PlyViewer src={mapUrl} />
                </div>
              ) : (
                <div className="grid h-72 place-items-center rounded-lg border border-sky-200 bg-sky-50 text-sm text-slate-600">
                  No PLY selected
                </div>
              )}

              {/* Selected PLY quick metrics */}
              {selectedMetrics && (
                <div className="bg-white/75 p-4">
                  <div className="mb-2 text-xs uppercase tracking-wide text-slate-600">
                    Selected PLY Metrics
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg border border-slate-200 bg-white p-3 text-center">
                      <div className="text-xs text-slate-500">Count</div>
                      <div className="text-lg font-semibold text-slate-800">
                        {selectedMetrics.count.toLocaleString()}
                      </div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-3 text-center">
                      <div className="text-xs text-slate-500">Avg Volume</div>
                      <div className="text-lg font-semibold text-slate-800">
                        {selectedMetrics.avgVolume.toFixed(1)} cm³
                      </div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-3 text-center">
                      <div className="text-xs text-slate-500">Grade</div>
                      <div className={[
                        'mx-auto inline-flex items-center rounded-full px-3 py-0.5 text-sm font-semibold',
                        selectedMetrics.grade === 'A' ? 'bg-emerald-100 text-emerald-700' :
                          selectedMetrics.grade === 'B' ? 'bg-sky-100 text-sky-700' :
                            selectedMetrics.grade === 'C' ? 'bg-amber-100 text-amber-700' :
                              'bg-rose-100 text-rose-700'
                      ].join(' ')}>
                        {selectedMetrics.grade}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>


          </div>
        </div>
      </div>
    </div>
  )
}
