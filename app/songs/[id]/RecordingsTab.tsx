'use client'

import { useEffect, useState } from 'react'

type Video = { title: string; url: string; channel: string; description?: string }

export default function RecordingsTab({ songId, title, composer }: {
  songId: string; title: string; composer: string
}) {
  const [videos, setVideos] = useState<Video[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [playing, setPlaying] = useState<string | null>(null)

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
      body: JSON.stringify({ songId, title, composer }),
    })
    const d = await r.json()
    if (r.ok) setVideos(d.videos)
    else alert(d.error || '搜索失败')
    setLoading(false)
  }

  function getVideoId(url: string) {
    const m = url.match(/(?:v=|youtu\.be\/)([^&\s]+)/)
    return m ? m[1] : null
  }

  return (
    <div className="space-y-3">
      <button
        onClick={search}
        disabled={loading}
        className="w-full bg-neutral-900 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-40"
      >
        {loading ? '搜索中，请稍候（约15秒）…' : videos ? '重新搜索视频' : '搜索视频'}
      </button>

      {videos && videos.length === 0 && (
        <p className="text-center text-neutral-400 text-sm py-6">未找到相关视频</p>
      )}

      {videos && videos.map((v, i) => {
        const vid = getVideoId(v.url)
        return (
          <div key={i} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            {playing === v.url && vid ? (
              <iframe
                src={`https://www.youtube.com/embed/${vid}?autoplay=1`}
                className="w-full aspect-video"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (
              <button
                onClick={() => setPlaying(v.url)}
                className="w-full p-4 text-left hover:bg-neutral-50 transition-colors"
              >
                <p className="text-sm font-medium line-clamp-2">{v.title}</p>
                <p className="text-xs text-neutral-400 mt-1">{v.channel}</p>
                {v.description && (
                  <p className="text-xs text-neutral-400 mt-1 line-clamp-2">{v.description}</p>
                )}
                <p className="text-xs text-blue-500 mt-2">▶ 点击播放</p>
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
