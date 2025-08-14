import '@/app/globals.css'
import { ReactNode } from 'react'
import Navbar from '@/components/Navbar'

export const metadata = { title: 'Florisys', description: 'Florisys UI' }

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-zinc-950 text-zinc-100 antialiased">
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  )
}
