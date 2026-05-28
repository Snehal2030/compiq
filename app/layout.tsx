import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CompIQ — Compensation Intelligence for Indian Tech',
  description: 'Compare real compensation data by level, role, and company across Indian tech industry.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
