import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'cumaa App',
  description: 'Created with cumaa',
  generator: 'cumaa.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
