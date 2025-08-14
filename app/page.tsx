// app/page.tsx
'use client'

import PlotSidebar from '@/components/dashboard/PlotSidebar'
import MapViewer from '@/components/dashboard/MapViewer'

export default function Page() {
  return (
    <div className="grid h-[calc(100vh-88px)] grid-cols-1 gap-4 md:grid-cols-[340px_1fr]">
      <aside className="rounded-3xl border border-zinc-800/80 bg-zinc-950/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]">
        <PlotSidebar />
      </aside>
      <section className="rounded-3xl border border-zinc-800/80 bg-zinc-950/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]">
        <div className="flex h-full flex-col">
          <div className="border-b border-zinc-800/70 px-4 py-3 text-sm text-zinc-400">GeoTIFF Viewer</div>
          <div className="flex-1 p-3">
            <MapViewer />
          </div>
        </div>
      </section>
    </div>
  )
}
