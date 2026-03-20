'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Song = { id: string; title: string; composer: string; createdAt: string }

export default function HomePage() {
  const [songs, setSongs] = useState<Song[]>([])
  const [title, setTitle] = useState('')
  const [composer, setComposer] = useState('')
  const [adding, setAdding] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function load() {
    const res = await fetch('/api/songs')
    setSongs(await res.json())
  }

  useEffect(() => { load() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setAdding(true)
    await fetch('/api/songs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, composer }),
    })
    setTitle('')
    setComposer('')
    setAdding(false)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('确认删除？')) return
    setDeleting(id)
    await fetch(`/api/songs/${id}`, { method: 'DELETE' })
    setDeleting(null)
    load()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

      {/* Add form */}
      <form onSubmit={handleAdd} style={{
        border: '1px solid var(--rule)',
        borderRadius: '2px',
        padding: '1.5rem',
        backgroundColor: 'var(--white)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
          <div style={{ height: '1px', flex: 1, backgroundColor: 'var(--rule)' }} />
          <span className="font-display" style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
            添加新曲目
          </span>
          <div style={{ height: '1px', flex: 1, backgroundColor: 'var(--rule)' }} />
        </div>
        <input
          style={{
            border: 'none', borderBottom: '1px solid var(--rule)', background: 'transparent',
            padding: '0.5rem 0', fontSize: '1rem', outline: 'none', color: 'var(--ink)',
            fontFamily: 'inherit', width: '100%',
          }}
          placeholder="曲名"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <input
          style={{
            border: 'none', borderBottom: '1px solid var(--rule)', background: 'transparent',
            padding: '0.5rem 0', fontSize: '0.9rem', outline: 'none', color: 'var(--ink-muted)',
            fontFamily: 'inherit', width: '100%',
          }}
          placeholder="作曲家"
          value={composer}
          onChange={e => setComposer(e.target.value)}
        />
        <button
          type="submit"
          disabled={adding || !title.trim()}
          style={{
            marginTop: '0.25rem',
            padding: '0.6rem 1.5rem',
            backgroundColor: adding || !title.trim() ? 'var(--rule)' : 'var(--ink)',
            color: 'var(--white)',
            border: 'none',
            borderRadius: '1px',
            fontSize: '0.75rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            cursor: adding || !title.trim() ? 'default' : 'pointer',
            alignSelf: 'flex-start',
            transition: 'background-color 0.2s',
          }}
        >
          {adding ? '…' : '加入曲库'}
        </button>
      </form>

      {/* Song list */}
      {songs.length === 0 ? (
        <p className="font-display" style={{ textAlign: 'center', color: 'var(--ink-muted)', fontStyle: 'italic', padding: '3rem 0', fontSize: '1.1rem' }}>
          曲库尚空，添加第一首吧
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          <div style={{ height: '1px', backgroundColor: 'var(--rule)' }} />
          {songs.map((song, idx) => (
            <div key={song.id} style={{
              borderBottom: '1px solid var(--rule)',
              display: 'flex',
              alignItems: 'center',
              padding: '0.9rem 0',
              gap: '1rem',
              animationDelay: `${idx * 0.05}s`,
            }} className="animate-fadeUp">
              <span className="font-display" style={{ color: 'var(--ink-muted)', fontSize: '0.75rem', minWidth: '1.5rem', textAlign: 'right' }}>
                {String(idx + 1).padStart(2, '0')}
              </span>
              <Link href={`/songs/${song.id}`} style={{ flex: 1, textDecoration: 'none', minWidth: 0 }}>
                <span className="font-display" style={{ fontSize: '1.15rem', fontWeight: 400, color: 'var(--ink)', display: 'block' }}>
                  {song.title}
                </span>
                {song.composer && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
                    {song.composer}
                  </span>
                )}
              </Link>
              <button
                onClick={() => handleDelete(song.id)}
                disabled={deleting === song.id}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--rule)', fontSize: '1.1rem', lineHeight: 1,
                  transition: 'color 0.15s', padding: '0.25rem',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#c0392b')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--rule)')}
              >
                {deleting === song.id ? '…' : '×'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
