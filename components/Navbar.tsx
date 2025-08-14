'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const tab = (href: string, label: string) => {
    const active = mounted && pathname === href
    return (
      <Link
        href={href}
        className={[
          'rounded-lg px-3 py-2 text-sm font-medium transition',
          active
            ? 'bg-gradient-to-r from-sky-200 via-cyan-200 to-teal-200 text-slate-900 shadow-sm'
            : 'text-slate-700 hover:bg-sky-50 hover:text-slate-900'
        ].join(' ')}
      >
        {label}
      </Link>
    )
  }

  return (
    <div className="sticky top-0 z-40 w-full border-b border-sky-100 bg-gradient-to-r from-sky-100 via-cyan-100 to-teal-100 backdrop-blur">
      <div className="flex w-full items-center justify-between px-4 py-3">
        <div className="text-base font-semibold tracking-wide text-slate-800">
          Florisys
        </div>
        <div className="flex items-center gap-1">
          {tab('/', 'Dashboard')}
          {tab('/rover', 'Rover Navigation')}
          {tab('/settings', 'Settings')}
        </div>
      </div>
    </div>
  )
}
