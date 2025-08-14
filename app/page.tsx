// app/page.tsx
'use client'

import PlotSidebar from '@/components/dashboard/PlotSidebar'
import MapViewer from '@/components/dashboard/MapViewer'

export default function Page() {
  return (
    <div className="flex h-[calc(100vh-88px)]">
      <aside className="w-[320px] shrink-0 border-r border-zinc-800/80 bg-zinc-950/60">
        <PlotSidebar />
      </aside>
      <section className="relative flex-1 min-w-0">
        <div className="h-full">
          <MapViewer />
        </div>
      </section>
    </div>
  )
}
