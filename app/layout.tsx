import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MusicFlow',
  description: '我的音乐练习笔记本',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" className="h-full">
      <body className={`${geist.className} min-h-full bg-neutral-50 text-neutral-900`}>
        <header className="sticky top-0 z-10 bg-white border-b border-neutral-200 px-4 py-3">
          <h1 className="text-lg font-semibold tracking-tight">MusicFlow</h1>
        </header>
        <main className="max-w-2xl mx-auto w-full px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  )
}
