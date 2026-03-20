import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sheetMusicId = searchParams.get('sheetMusicId')
  if (!sheetMusicId) return NextResponse.json({ error: 'sheetMusicId required' }, { status: 400 })

  const annotations = await db.annotation.findMany({ where: { sheetMusicId } })
  return NextResponse.json(annotations)
}

export async function POST(req: Request) {
  const { sheetMusicId, type, x, y, pageIndex, content } = await req.json()

  const annotation = await db.annotation.create({
    data: { sheetMusicId, type, x, y, pageIndex, content: content ?? null },
  })

  return NextResponse.json(annotation, { status: 201 })
}
