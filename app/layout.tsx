import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CampusFind — Lost & Found Registry',
  description: 'Centralized digital bulletin board for reporting lost items and posting found ones.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
