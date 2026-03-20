import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ai } from '@/lib/ai'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const songId = searchParams.get('songId')
  if (!songId) return NextResponse.json({ error: 'songId required' }, { status: 400 })

  const song = await db.song.findUnique({
    where: { id: songId },
    include: { lyric: true, translation: true },
  })
  return NextResponse.json(song)
}

export async function POST(req: Request) {
  try {
    const { songId } = await req.json()
    const song = await db.song.findUnique({ where: { id: songId } })
    if (!song) return NextResponse.json({ error: '歌曲不存在' }, { status: 404 })

    // Try lyrics.ovh first (fast, no key needed)
    let content: string | null = null
    try {
      const artist = encodeURIComponent(song.composer || 'unknown')
      const title = encodeURIComponent(song.title)
      const r = await fetch(`https://api.lyrics.ovh/v1/${artist}/${title}`)
      if (r.ok) {
        const d = await r.json()
        if (d.lyrics?.trim()) content = d.lyrics.trim()
      }
    } catch {
      // lyrics.ovh failed, will fallback to supermind
    }

    // Fallback: supermind web search
    if (!content) {
      const prompt = `Search for the complete original lyrics of the art song "${song.title}"${song.composer ? ` by ${song.composer}` : ''}.

When you have found the lyrics, output the exact line:
===OUTPUT===
Then immediately provide ONLY the lyrics text with no other content before or after:
- Preserve all line breaks and verse structure exactly
- Do not include title, composer name, copyright notices, source attribution, or any commentary
- If the song is not in English, return the original language text`

      const response = await ai.chat.completions.create({
        model: 'supermind-agent-v1',
        messages: [{ role: 'user', content: prompt }],
      })

      const raw = response.choices[0]?.message?.content?.trim()
      if (raw) {
        const MARKER = '===OUTPUT==='
        const idx = raw.indexOf(MARKER)
        content = idx >= 0 ? raw.slice(idx + MARKER.length).trim() : raw
      }
    }

    if (!content) return NextResponse.json({ error: '未找到歌词' }, { status: 404 })

    const lyric = await db.lyric.upsert({
      where: { songId },
      create: { songId, content },
      update: { content },
    })

    return NextResponse.json(lyric)
  } catch (err) {
    console.error('Lyrics search error:', err)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const { songId, content } = await req.json()
  if (!songId || !content?.trim()) {
    return NextResponse.json({ error: '参数缺失' }, { status: 400 })
  }

  const lyric = await db.lyric.upsert({
    where: { songId },
    create: { songId, content: content.trim() },
    update: { content: content.trim() },
  })

  return NextResponse.json(lyric)
}
