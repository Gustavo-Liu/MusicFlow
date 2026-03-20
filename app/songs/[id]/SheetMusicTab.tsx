'use client'

import { useEffect, useRef, useState } from 'react'

type AnnotationType = 'comment' | 'breath'
type Annotation = { id: string; type: AnnotationType; x: number; y: number; pageIndex: number; content?: string }
type SheetMusic = { id: string; pages: string[] }

export default function SheetMusicTab({ songId }: { songId: string }) {
  const [sheets, setSheets] = useState<SheetMusic[]>([])
  const [uploading, setUploading] = useState(false)
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [pendingPos, setPendingPos] = useState<{ x: number; y: number; pageIndex: number } | null>(null)
  const [commentText, setCommentText] = useState('')
  const [activeAnnotation, setActiveAnnotation] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { loadSheets() }, [songId])

  async function loadSheets() {
    const r = await fetch(`/api/sheet-music?songId=${songId}`)
    if (r.ok) {
      const d = await r.json()
      setSheets(d)
      if (d.length > 0) loadAnnotations(d[0].id)
    }
  }

  async function loadAnnotations(sheetMusicId: string) {
    const r = await fetch(`/api/annotations?sheetMusicId=${sheetMusicId}`)
    if (r.ok) setAnnotations(await r.json())
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    const form = new FormData()
    form.append('songId', songId)
    Array.from(files).forEach(f => form.append('files', f))
    const r = await fetch('/api/sheet-music', { method: 'POST', body: form })
    if (r.ok) await loadSheets()
    setUploading(false)
    e.target.value = ''
  }

  async function addAnnotation(type: AnnotationType) {
    if (!pendingPos || !sheets[0]) return
    const body: Record<string, unknown> = {
      sheetMusicId: sheets[0].id,
      type,
      x: pendingPos.x,
      y: pendingPos.y,
      pageIndex: pendingPos.pageIndex,
    }
    if (type === 'comment') body.content = commentText
    const r = await fetch('/api/annotations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (r.ok) {
      const a = await r.json()
      setAnnotations(prev => [...prev, a])
    }
    setPendingPos(null)
    setCommentText('')
  }

  async function deleteAnnotation(id: string) {
    await fetch(`/api/annotations/${id}`, { method: 'DELETE' })
    setAnnotations(prev => prev.filter(a => a.id !== id))
    setActiveAnnotation(null)
  }

  function handleImageClick(e: React.MouseEvent<HTMLDivElement>, pageIndex: number) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setPendingPos({ x, y, pageIndex })
    setCommentText('')
  }

  if (sheets.length === 0) {
    return (
      <div className="space-y-3">
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-full bg-neutral-900 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-40"
        >
          {uploading ? '上传中…' : '拍照 / 选择乐谱图片'}
        </button>
      </div>
    )
  }

  const sheet = sheets[0]
  const pages: string[] = typeof sheet.pages === 'string' ? JSON.parse(sheet.pages) : sheet.pages

  return (
    <div className="space-y-4">
      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="w-full border border-neutral-200 rounded-lg py-2 text-sm text-neutral-600 disabled:opacity-40"
      >
        {uploading ? '上传中…' : '添加更多页'}
      </button>

      {pages.map((src, pageIndex) => (
        <div key={pageIndex} className="relative rounded-xl overflow-hidden border border-neutral-200">
          <div
            className="relative cursor-crosshair"
            onClick={e => handleImageClick(e, pageIndex)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`第${pageIndex + 1}页`} className="w-full" draggable={false} />

            {annotations
              .filter(a => a.pageIndex === pageIndex)
              .map(a => (
                <button
                  key={a.id}
                  onClick={e => { e.stopPropagation(); setActiveAnnotation(activeAnnotation === a.id ? null : a.id) }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 text-base leading-none"
                  style={{ left: `${a.x}%`, top: `${a.y}%` }}
                  title={a.content ?? '换气点'}
                >
                  {a.type === 'breath' ? (
                    <span className="text-blue-500 font-bold">✓</span>
                  ) : (
                    <span className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-white shadow">!</span>
                  )}

                  {activeAnnotation === a.id && (
                    <div
                      onClick={e => e.stopPropagation()}
                      className="absolute left-6 top-0 z-10 bg-white border border-neutral-200 rounded-lg shadow-lg p-3 text-left min-w-40 space-y-2"
                    >
                      {a.content && <p className="text-xs text-neutral-700">{a.content}</p>}
                      <button
                        onClick={() => deleteAnnotation(a.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        删除
                      </button>
                    </div>
                  )}
                </button>
              ))}
          </div>

          {pendingPos?.pageIndex === pageIndex && (
            <div className="p-3 bg-neutral-50 border-t border-neutral-200 space-y-2">
              <p className="text-xs text-neutral-500">选择标注类型：</p>
              <div className="flex gap-2">
                <button
                  onClick={() => addAnnotation('breath')}
                  className="flex-1 border border-blue-300 text-blue-600 rounded-lg py-1.5 text-xs font-medium"
                >
                  ✓ 换气点
                </button>
                <button
                  onClick={() => { if (commentText.trim()) addAnnotation('comment') }}
                  disabled={!commentText.trim()}
                  className="flex-1 bg-yellow-400 text-white rounded-lg py-1.5 text-xs font-medium disabled:opacity-40"
                >
                  ! 添加评论
                </button>
              </div>
              <input
                className="w-full border border-neutral-200 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-neutral-900"
                placeholder="评论内容…"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
              />
              <button onClick={() => setPendingPos(null)} className="text-xs text-neutral-400">取消</button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
