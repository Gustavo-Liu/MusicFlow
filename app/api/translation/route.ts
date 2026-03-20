import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ai } from '@/lib/ai'

export async function POST(req: Request) {
  try {
    const { songId } = await req.json()

    const lyric = await db.lyric.findUnique({ where: { songId } })
    if (!lyric) return NextResponse.json({ error: '请先搜索并保存歌词' }, { status: 400 })

    const prompt = `You are a music language expert. Translate the following art song lyrics word by word into Chinese.

Return a JSON array where each element is an array of objects representing one line of the lyrics.
Format: [[{"word": "original_word", "translation": "中文"}], [...], ...]

Rules:
- Keep punctuation attached to the word it follows
- For short function words (articles, prepositions), provide the Chinese equivalent
- Preserve the line structure of the original
- Return ONLY the JSON array, no markdown, no explanation

Lyrics:
${lyric.content}`

    const response = await ai.chat.completions.create({
      model: 'gpt-5',
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = response.choices[0]?.message?.content?.trim()
    if (!raw) return NextResponse.json({ error: '翻译失败：AI 无响应' }, { status: 500 })

    // Strip markdown code fences, then extract the JSON array
    const cleaned = raw.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim()
    const match = cleaned.match(/\[[\s\S]*\]/)
    if (!match) {
      console.error('Translation raw response:', raw.slice(0, 300))
      return NextResponse.json({ error: '翻译格式错误，AI 未返回 JSON' }, { status: 500 })
    }

    let translationData
    try {
      translationData = JSON.parse(match[0])
    } catch {
      console.error('JSON parse failed. cleaned excerpt:', match[0].slice(0, 300))
      return NextResponse.json({ error: '翻译 JSON 解析失败' }, { status: 500 })
    }

    if (!Array.isArray(translationData) || translationData.length === 0) {
      console.error('Translation returned empty array, raw:', raw.slice(0, 200))
      return NextResponse.json({ error: '翻译结果为空，请重试' }, { status: 500 })
    }

    await db.translation.upsert({
      where: { songId },
      create: { songId, content: JSON.stringify(translationData) },
      update: { content: JSON.stringify(translationData) },
    })

    return NextResponse.json({ translation: translationData })
  } catch (err) {
    console.error('Translation error:', err)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
