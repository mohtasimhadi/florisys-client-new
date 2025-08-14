// components/ui/Spinner.tsx
'use client'

export default function Spinner({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" d="M4 12a8 8 0 0 1 8-8v4" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}
