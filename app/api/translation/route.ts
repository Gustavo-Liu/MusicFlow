import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { songId } = await req.json()

    const lyric = await db.lyric.findUnique({ where: { songId } })
    if (!lyric) return NextResponse.json({ error: '请先搜索并保存歌词' }, { status: 400 })

    const lines = lyric.content.split('\n')

    // Send all lines in one request using \n separator (free Google Translate endpoint)
    const joined = lines.join('\n')
    const url =
      'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=zh-CN&dt=t&q=' +
      encodeURIComponent(joined)

    const res = await fetch(url)
    if (!res.ok) {
      console.error('Google Translate free endpoint error:', res.status)
      return NextResponse.json({ error: '翻译服务请求失败' }, { status: 500 })
    }

    const data = await res.json()
    // data[0] is array of [translatedSegment, originalSegment, ...]
    const translatedJoined: string = data[0].map((seg: [string]) => seg[0]).join('')
    const translatedLines = translatedJoined.split('\n')

    if (!translatedLines.length) {
      return NextResponse.json({ error: '翻译结果为空，请重试' }, { status: 500 })
    }

    const translation = lines.map((original, i) => ({
      original,
      translation: translatedLines[i] ?? '',
    }))

    const content = JSON.stringify(translation)

    await db.translation.upsert({
      where: { songId },
      create: { songId, content },
      update: { content },
    })

    return NextResponse.json({ translation })
  } catch (err) {
    console.error('Translation error:', err)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
