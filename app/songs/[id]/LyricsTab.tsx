'use client'

import { useEffect, useState } from 'react'

type LineEntry = { original: string; translation: string }

const btn = (primary: boolean, disabled?: boolean): React.CSSProperties => ({
  padding: '0.55rem 1.25rem',
  border: primary ? 'none' : '1px solid var(--rule)',
  borderRadius: '1px',
  backgroundColor: primary ? (disabled ? 'var(--rule)' : 'var(--ink)') : 'transparent',
  color: primary ? 'var(--white)' : 'var(--ink-muted)',
  fontSize: '0.7rem',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  cursor: disabled ? 'default' : 'pointer',
  fontFamily: 'inherit',
  transition: 'all 0.15s',
})

export default function LyricsTab({ songId }: { songId: string }) {
  const [lyrics, setLyrics] = useState<string | null>(null)
  const [translation, setTranslation] = useState<LineEntry[] | null>(null)
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
      if (!data || data.length === 0) alert('翻译结果为空，请重试')
      else setTranslation(data)
    } else {
      alert(d.error || '翻译失败')
    }
    setLoadingTranslation(false)
  }

  if (!lyrics) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <button onClick={searchLyrics} disabled={loadingLyrics} style={btn(true, loadingLyrics)}>
          {loadingLyrics ? '搜索中…' : '搜索歌词'}
        </button>
        <button onClick={() => setShowManual(!showManual)} style={btn(false)}>
          手动输入
        </button>
        {showManual && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <textarea
              style={{
                border: '1px solid var(--rule)', borderRadius: '1px', padding: '0.75rem',
                fontSize: '0.9rem', fontFamily: 'inherit', height: '10rem', resize: 'vertical',
                outline: 'none', backgroundColor: 'var(--white)', color: 'var(--ink)',
              }}
              placeholder="粘贴歌词…"
              value={manualInput}
              onChange={e => setManualInput(e.target.value)}
            />
            <button onClick={saveLyrics} disabled={!manualInput.trim()} style={btn(true, !manualInput.trim())}>
              保存
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{
        border: '1px solid var(--rule)',
        borderRadius: '1px',
        padding: '1.5rem',
        backgroundColor: 'var(--white)',
        lineHeight: 1.9,
      }}>
        {!translation ? (
          <pre className="font-display" style={{
            fontSize: '1rem', fontWeight: 300, whiteSpace: 'pre-wrap', fontFamily: "'Cormorant Garamond', serif",
            color: 'var(--ink)', margin: 0,
          }}>
            {lyrics}
          </pre>
        ) : (
          <div style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {translation.map((line, i) =>
              line.original.trim() === '' ? (
                <div key={i} style={{ height: '0.8rem' }} />
              ) : (
                <div key={i} style={{ marginBottom: '0.1rem' }}>
                  <p style={{ margin: 0, fontSize: '1rem', fontWeight: 400, color: 'var(--ink)' }}>
                    {line.original}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--gold)', fontStyle: 'italic', marginBottom: '0.35rem', fontFamily: 'Lato, sans-serif', fontWeight: 300 }}>
                    {line.translation}
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {!translation && (
          <button onClick={getTranslation} disabled={loadingTranslation} style={btn(true, loadingTranslation)}>
            {loadingTranslation ? '翻译中…' : '获取译文'}
          </button>
        )}
        <button onClick={() => { setLyrics(null); setTranslation(null) }} style={btn(false)}>
          重新搜索
        </button>
      </div>
    </div>
  )
}
