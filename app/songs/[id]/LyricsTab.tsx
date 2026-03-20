'use client'

import { useEffect, useState } from 'react'

type WordEntry = { word: string; translation: string }

export default function LyricsTab({ songId }: { songId: string }) {
  const [lyrics, setLyrics] = useState<string | null>(null)
  const [translation, setTranslation] = useState<WordEntry[][] | null>(null)
  const [manualInput, setManualInput] = useState('')
  const [showManual, setShowManual] = useState(false)
  const [loadingLyrics, setLoadingLyrics] = useState(false)
  const [loadingTranslation, setLoadingTranslation] = useState(false)

  useEffect(() => { loadData() }, [songId])

  async function loadData() {
    const r = await fetch(`/api/lyrics?songId=${songId}`)
    if (r.ok) {
      const d = await r.json()
      if (d.lyric) setLyrics(d.lyric.content)
      if (d.translation) setTranslation(JSON.parse(d.translation.content))
    }
  }

  async function searchLyrics() {
    setLoadingLyrics(true)
    const r = await fetch('/api/lyrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songId }),
    })
    const d = await r.json()
    if (r.ok) setLyrics(d.content)
    else alert(d.error || '搜索失败，请手动输入歌词')
    setLoadingLyrics(false)
  }

  async function saveLyrics() {
    if (!manualInput.trim()) return
    const r = await fetch('/api/lyrics', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songId, content: manualInput.trim() }),
    })
    if (r.ok) {
      setLyrics(manualInput.trim())
      setShowManual(false)
      setManualInput('')
    }
  }

  async function getTranslation() {
    setLoadingTranslation(true)
    const r = await fetch('/api/translation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songId }),
    })
    const d = await r.json()
    if (r.ok) {
      const data = d.translation
      if (!data || data.length === 0) {
        alert('翻译结果为空，请重试')
      } else {
        setTranslation(data)
      }
    } else {
      alert(d.error || '翻译失败')
    }
    setLoadingTranslation(false)
  }

  return (
    <div className="space-y-4">
      {!lyrics ? (
        <div className="space-y-3">
          <button
            onClick={searchLyrics}
            disabled={loadingLyrics}
            className="w-full bg-neutral-900 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-40"
          >
            {loadingLyrics ? '搜索中，请稍候（约15秒）…' : '搜索歌词'}
          </button>
          <button
            onClick={() => setShowManual(!showManual)}
            className="w-full border border-neutral-200 rounded-lg py-2.5 text-sm text-neutral-600"
          >
            手动输入歌词
          </button>
          {showManual && (
            <div className="space-y-2">
              <textarea
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm h-40 outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
                placeholder="粘贴歌词…"
                value={manualInput}
                onChange={e => setManualInput(e.target.value)}
              />
              <button
                onClick={saveLyrics}
                disabled={!manualInput.trim()}
                className="w-full bg-neutral-900 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-40"
              >
                保存
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Lyrics display */}
          {!translation ? (
            <div className="bg-white rounded-xl border border-neutral-200 p-4">
              <pre className="text-sm whitespace-pre-wrap font-sans leading-7">{lyrics}</pre>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-3">
              {translation.map((line, i) => (
                <div key={i} className="flex flex-wrap gap-x-3 gap-y-1">
                  {line.map((entry, j) => (
                    <span key={j} className="flex flex-col items-center">
                      <span className="text-sm font-medium">{entry.word}</span>
                      <span className="text-xs text-neutral-400">{entry.translation}</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          )}

          {!translation && (
            <button
              onClick={getTranslation}
              disabled={loadingTranslation}
              className="w-full bg-neutral-900 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-40"
            >
              {loadingTranslation ? '翻译中…' : '获取逐词翻译'}
            </button>
          )}

          <button
            onClick={() => { setLyrics(null); setTranslation(null) }}
            className="w-full border border-neutral-200 rounded-lg py-2 text-sm text-neutral-400"
          >
            重新搜索歌词
          </button>
        </div>
      )}
    </div>
  )
}
