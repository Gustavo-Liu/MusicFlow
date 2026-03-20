import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const songs = await db.song.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(songs)
}

export async function POST(req: Request) {
  const { title, composer } = await req.json()
  if (!title?.trim()) {
    return NextResponse.json({ error: '曲名不能为空' }, { status: 400 })
  }
  const song = await db.song.create({ data: { title: title.trim(), composer: composer?.trim() ?? '' } })
  return NextResponse.json(song, { status: 201 })
}
