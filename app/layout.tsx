import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'MusicFlow',
  description: '我的音乐练习笔记本',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body>
        <header style={{
          borderBottom: '1px solid var(--rule)',
          backgroundColor: 'rgba(245,240,232,0.92)',
          backdropFilter: 'blur(8px)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
        }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span className="font-display" style={{ fontSize: '1.6rem', fontStyle: 'italic', fontWeight: 300, color: 'var(--ink)', letterSpacing: '0.02em', cursor: 'pointer' }}>
              MusicFlow
            </span>
          </Link>
          <span style={{ fontSize: '0.65rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
            练习笔记本
          </span>
        </header>
        <main style={{ maxWidth: '680px', margin: '0 auto', padding: '2rem 1.25rem' }} className="animate-fadeUp">
          {children}
        </main>
      </body>
    </html>
  )
}
