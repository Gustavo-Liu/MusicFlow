import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const songId = searchParams.get('songId')
  if (!songId) return NextResponse.json({ error: 'songId required' }, { status: 400 })

  const recording = await db.recording.findUnique({ where: { songId } })
  if (!recording) return NextResponse.json({})

  const age = Date.now() - new Date(recording.cachedAt).getTime()
  if (age < 24 * 60 * 60 * 1000) return NextResponse.json(recording)

  return NextResponse.json({})
}

export async function POST(req: Request) {
  try {
    const { songId, title, composer, keywords } = await req.json()
    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'YouTube API key 未配置' }, { status: 500 })

    const base = `${title} ${composer}`.trim()
    const suffix = keywords?.trim() ? keywords.trim() : 'art song vocal'
    const query = encodeURIComponent(`${base} ${suffix}`)
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=8&key=${apiKey}`

    const res = await fetch(url)
    if (!res.ok) {
      const err = await res.text()
      console.error('YouTube API error:', err)
      return NextResponse.json({ error: 'YouTube 搜索失败' }, { status: 500 })
    }

    const data = await res.json()
    const videos = (data.items ?? []).map((item: {
      id: { videoId: string }
      snippet: { title: string; channelTitle: string; description: string; thumbnails: { medium: { url: string } } }
    }) => ({
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      videoId: item.id.videoId,
      channel: item.snippet.channelTitle,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails?.medium?.url ?? '',
    }))

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
