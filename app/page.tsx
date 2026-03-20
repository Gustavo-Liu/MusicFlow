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
    if (!confirm('确认删除这首歌曲及其所有数据？')) return
    setDeleting(id)
    await fetch(`/api/songs/${id}`, { method: 'DELETE' })
    setDeleting(null)
    load()
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="bg-white rounded-xl border border-neutral-200 p-4 space-y-3">
        <h2 className="font-medium">添加歌曲</h2>
        <input
          className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900"
          placeholder="曲名（必填）"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <input
          className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900"
          placeholder="作曲家"
          value={composer}
          onChange={e => setComposer(e.target.value)}
        />
        <button
          type="submit"
          disabled={adding || !title.trim()}
          className="w-full bg-neutral-900 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-40"
        >
          {adding ? '添加中…' : '添加'}
        </button>
      </form>

      {songs.length === 0 ? (
        <p className="text-center text-neutral-400 text-sm py-12">还没有歌曲，添加第一首吧</p>
      ) : (
        <ul className="space-y-2">
          {songs.map(song => (
            <li key={song.id} className="bg-white rounded-xl border border-neutral-200 px-4 py-3 flex items-center justify-between">
              <Link href={`/songs/${song.id}`} className="flex-1 min-w-0">
                <p className="font-medium truncate">{song.title}</p>
                {song.composer && <p className="text-sm text-neutral-500 truncate">{song.composer}</p>}
              </Link>
              <button
                onClick={() => handleDelete(song.id)}
                disabled={deleting === song.id}
                className="ml-4 text-neutral-400 hover:text-red-500 text-sm shrink-0"
              >
                {deleting === song.id ? '…' : '删除'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
