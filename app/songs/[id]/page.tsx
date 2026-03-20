'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import LyricsTab from './LyricsTab'
import RecordingsTab from './RecordingsTab'
import SheetMusicTab from './SheetMusicTab'

type Song = { id: string; title: string; composer: string }

export default function SongPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [song, setSong] = useState<Song | null>(null)
  const [showSheetMusic, setShowSheetMusic] = useState(false)

  useEffect(() => {
    fetch(`/api/songs/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (!data) router.push('/'); else setSong(data) })
  }, [id, router])

  if (!song) return <p className="text-center text-neutral-400 text-sm py-12">加载中…</p>

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => router.push('/')} className="text-sm text-neutral-400 hover:text-neutral-600 mb-2">← 返回</button>
        <h2 className="text-xl font-semibold">{song.title}</h2>
        {song.composer && <p className="text-sm text-neutral-500">{song.composer}</p>}
      </div>

      {/* 歌词 + 视频：始终保持挂载，滚动式双 section */}
      <section>
        <h3 className="text-sm font-medium text-neutral-500 mb-3">歌词</h3>
        <LyricsTab songId={id} />
      </section>

      <div className="border-t border-neutral-100" />

      <section>
        <h3 className="text-sm font-medium text-neutral-500 mb-3">视频</h3>
        <RecordingsTab songId={id} title={song.title} composer={song.composer} />
      </section>

      <div className="border-t border-neutral-100" />

      {/* 乐谱：独立切换入口 */}
      <section>
        <button
          onClick={() => setShowSheetMusic(v => !v)}
          className="w-full flex items-center justify-between text-sm font-medium text-neutral-500 hover:text-neutral-800"
        >
          <span>乐谱标注</span>
          <span>{showSheetMusic ? '收起 ↑' : '展开 ↓'}</span>
        </button>
        {showSheetMusic && (
          <div className="mt-3">
            <SheetMusicTab songId={id} />
          </div>
        )}
      </section>
    </div>
  )
}
