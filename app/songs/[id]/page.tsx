'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import LyricsTab from './LyricsTab'
import RecordingsTab from './RecordingsTab'
import SheetMusicTab from './SheetMusicTab'

type Song = { id: string; title: string; composer: string }

const S: Record<string, React.CSSProperties> = {
  sectionLabel: {
    fontSize: '0.62rem',
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: 'var(--ink-muted)',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  rule: { height: '1px', flex: 1, backgroundColor: 'var(--rule)' },
  divider: { height: '1px', backgroundColor: 'var(--rule)', margin: '2.5rem 0' },
}

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

  if (!song) return (
    <p className="font-display" style={{ textAlign: 'center', color: 'var(--ink-muted)', fontStyle: 'italic', padding: '4rem 0' }}>
      加载中…
    </p>
  )

  return (
    <div className="animate-fadeUp" style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>

      {/* Back + Title */}
      <div style={{ marginBottom: '2.5rem' }}>
        <button
          onClick={() => router.push('/')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', fontSize: '0.75rem', letterSpacing: '0.1em', padding: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          ← 返回曲库
        </button>
        <h2 className="font-display" style={{ fontSize: '2.2rem', fontWeight: 300, fontStyle: 'italic', color: 'var(--ink)', margin: 0, lineHeight: 1.1 }}>
          {song.title}
        </h2>
        {song.composer && (
          <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginTop: '0.4rem', letterSpacing: '0.05em' }}>
            {song.composer}
          </p>
        )}
        <div style={{ height: '1px', backgroundColor: 'var(--gold)', width: '3rem', marginTop: '1rem', opacity: 0.7 }} />
      </div>

      {/* Lyrics Section */}
      <section>
        <div style={S.sectionLabel}>
          <span className="font-display" style={{ fontStyle: 'italic' }}>歌词</span>
          <div style={S.rule} />
        </div>
        <LyricsTab songId={id} />
      </section>

      <div style={S.divider} />

      {/* Videos Section */}
      <section>
        <div style={S.sectionLabel}>
          <span className="font-display" style={{ fontStyle: 'italic' }}>视频</span>
          <div style={S.rule} />
        </div>
        <RecordingsTab songId={id} title={song.title} composer={song.composer} />
      </section>

      <div style={S.divider} />

      {/* Sheet Music */}
      <section>
        <button
          onClick={() => setShowSheetMusic(v => !v)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', width: '100%',
            ...S.sectionLabel, marginBottom: showSheetMusic ? '1rem' : 0,
          }}
        >
          <span className="font-display" style={{ fontStyle: 'italic' }}>乐谱标注</span>
          <div style={S.rule} />
          <span style={{ fontSize: '0.7rem' }}>{showSheetMusic ? '↑' : '↓'}</span>
        </button>
        {/* 始终挂载，避免 unmount 导致标注状态丢失 */}
        <div style={{ display: showSheetMusic ? 'block' : 'none', marginTop: showSheetMusic ? '1rem' : 0 }}>
          <SheetMusicTab songId={id} />
        </div>
      </section>

    </div>
  )
}
