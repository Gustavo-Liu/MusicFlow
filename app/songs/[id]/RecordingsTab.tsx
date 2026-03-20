'use client'

import { useEffect, useState } from 'react'

type Video = { title: string; url: string; videoId?: string; channel: string; description?: string; thumbnail?: string }

export default function RecordingsTab({ songId, title, composer }: {
  songId: string; title: string; composer: string
}) {
  const [videos, setVideos] = useState<Video[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [playing, setPlaying] = useState<string | null>(null)
  const [keywords, setKeywords] = useState('')

  useEffect(() => { loadCached() }, [songId])

  async function loadCached() {
    const r = await fetch(`/api/recordings?songId=${songId}`)
    if (r.ok) {
      const d = await r.json()
      if (d.results) setVideos(JSON.parse(d.results))
    }
  }

  async function search() {
    setLoading(true)
    const r = await fetch('/api/recordings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songId, title, composer, keywords: keywords.trim() }),
    })
    const d = await r.json()
    if (r.ok) setVideos(d.videos)
    else alert(d.error || '搜索失败')
    setLoading(false)
  }

  function getVideoId(v: Video) {
    if (v.videoId) return v.videoId
    const m = v.url.match(/(?:v=|youtu\.be\/)([^&\s]+)/)
    return m ? m[1] : null
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Search bar */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          style={{
            flex: 1, border: 'none', borderBottom: '1px solid var(--rule)', background: 'transparent',
            padding: '0.45rem 0', fontSize: '0.85rem', outline: 'none', color: 'var(--ink)',
            fontFamily: 'inherit',
          }}
          placeholder="追加关键词（如 soprano、diction、masterclass）"
          value={keywords}
          onChange={e => setKeywords(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !loading && search()}
        />
        <button
          onClick={search}
          disabled={loading}
          style={{
            padding: '0.45rem 1rem',
            backgroundColor: loading ? 'var(--rule)' : 'var(--ink)',
            color: 'var(--white)',
            border: 'none',
            borderRadius: '1px',
            fontSize: '0.7rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            cursor: loading ? 'default' : 'pointer',
            fontFamily: 'inherit',
            whiteSpace: 'nowrap',
          }}
        >
          {loading ? '…' : videos ? '重搜' : '搜索'}
        </button>
      </div>

      {videos && videos.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--ink-muted)', fontStyle: 'italic', padding: '2rem 0', fontSize: '0.9rem' }}
           className="font-display">
          未找到相关视频
        </p>
      )}

      {videos && videos.map((v, i) => {
        const vid = getVideoId(v)
        return (
          <div key={i} style={{ border: '1px solid var(--rule)', borderRadius: '1px', overflow: 'hidden', backgroundColor: 'var(--white)' }}>
            {playing === v.url && vid ? (
              <iframe
                src={`https://www.youtube.com/embed/${vid}?autoplay=1`}
                style={{ width: '100%', aspectRatio: '16/9', display: 'block', border: 'none' }}
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (
              <button
                onClick={() => setPlaying(v.url)}
                style={{
                  display: 'flex', gap: '0.75rem', padding: '0.75rem',
                  background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
                  transition: 'background-color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--parchment)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {v.thumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v.thumbnail} alt="" style={{ width: '5.5rem', height: '3.5rem', objectFit: 'cover', borderRadius: '1px', flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ink)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {v.title}
                  </p>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.72rem', color: 'var(--ink-muted)' }}>{v.channel}</p>
                </div>
                <span style={{ color: 'var(--gold)', fontSize: '0.7rem', letterSpacing: '0.1em', flexShrink: 0, alignSelf: 'center', marginRight: '0.25rem' }}>▶</span>
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
