import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ai } from '@/lib/ai'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const songId = searchParams.get('songId')
  if (!songId) return NextResponse.json({ error: 'songId required' }, { status: 400 })

  const recording = await db.recording.findUnique({ where: { songId } })
  if (!recording) return NextResponse.json({})

  // Check 24h cache
  const age = Date.now() - new Date(recording.cachedAt).getTime()
  if (age < 24 * 60 * 60 * 1000) return NextResponse.json(recording)

  return NextResponse.json({})
}

export async function POST(req: Request) {
  try {
    const { songId, title, composer } = await req.json()

    const prompt = `Search YouTube for videos related to the art song "${title}"${composer ? ` by ${composer}` : ''} that would help a singer practice and learn this piece.

Find 5-8 relevant YouTube videos. Include a mix of:
- Vocal performances (singers performing this piece)
- Piano accompaniment or instrumental versions
- Diction guides or pronunciation tutorials
- Analysis or masterclass videos

When you have found the videos, output the exact line:
===OUTPUT===
Then immediately provide ONLY a JSON array with this structure, no markdown, no explanation:
[{"title": "video title", "url": "https://www.youtube.com/watch?v=VIDEO_ID", "channel": "channel name", "description": "brief description"}]`

    const response = await ai.chat.completions.create({
      model: 'supermind-agent-v1',
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = response.choices[0]?.message?.content?.trim()
    if (!raw) return NextResponse.json({ error: '搜索失败：AI 无响应' }, { status: 500 })

    const MARKER = '===OUTPUT==='
    const markerIdx = raw.indexOf(MARKER)
    const extracted = markerIdx >= 0
      ? raw.slice(markerIdx + MARKER.length).trim()
      : raw  // fallback

    const match = extracted.match(/\[[\s\S]*\]/)
    if (!match) {
      console.error('Recordings extracted:', extracted.slice(0, 300))
      return NextResponse.json({ error: '搜索结果格式错误' }, { status: 500 })
    }

    let videos
    try {
      videos = JSON.parse(match[0])
    } catch {
      return NextResponse.json({ error: '搜索结果 JSON 解析失败' }, { status: 500 })
    }

    await db.recording.upsert({
      where: { songId },
      create: { songId, results: JSON.stringify(videos) },
      update: { results: JSON.stringify(videos), cachedAt: new Date() },
    })

    return NextResponse.json({ videos })
  } catch (err) {
    console.error('Recordings search error:', err)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
