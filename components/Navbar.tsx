'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()
  const tab = (href: string, label: string) => {
    const active = pathname === href
    return (
      <Link
        href={href}
        className={[
          'rounded-lg px-3 py-2 text-sm transition',
          active ? 'bg-zinc-800/70 ring-1 ring-zinc-700' : 'hover:bg-zinc-800/40'
        ].join(' ')}
      >
        {label}
      </Link>
    )
  }

  return (
    <div className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-900/70 backdrop-blur">
      <div className="flex w-full items-center justify-between px-4 py-3">
        <div className="text-base font-semibold tracking-wide">Florisys</div>
        <div className="flex items-center gap-1">
          {tab('/', 'Dashboard')}
          {tab('/rover', 'Rover Navigation')}
          {tab('/settings', 'Settings')}
        </div>
      </div>
    </div>
  )
}
