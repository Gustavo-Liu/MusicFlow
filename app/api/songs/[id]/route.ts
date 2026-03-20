import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const song = await db.song.findUnique({ where: { id } })
  if (!song) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(song)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await db.song.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
