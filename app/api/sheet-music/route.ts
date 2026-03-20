import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const songId = searchParams.get('songId')
  if (!songId) return NextResponse.json({ error: 'songId required' }, { status: 400 })

  const sheets = await db.sheetMusic.findMany({ where: { songId } })
  return NextResponse.json(sheets.map(s => ({ ...s, pages: JSON.parse(s.pages) })))
}

export async function POST(req: Request) {
  const form = await req.formData()
  const songId = form.get('songId') as string
  const files = form.getAll('files') as File[]

  if (!songId || files.length === 0) {
    return NextResponse.json({ error: '参数缺失' }, { status: 400 })
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', songId)
  await mkdir(uploadDir, { recursive: true })

  const pages: string[] = []
  for (const file of files) {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const bytes = await file.arrayBuffer()
    await writeFile(path.join(uploadDir, filename), Buffer.from(bytes))
    pages.push(`/uploads/${songId}/${filename}`)
  }

  // Append to existing sheet or create new
  const existing = await db.sheetMusic.findFirst({ where: { songId } })
  let sheet
  if (existing) {
    const existingPages: string[] = JSON.parse(existing.pages)
    sheet = await db.sheetMusic.update({
      where: { id: existing.id },
      data: { pages: JSON.stringify([...existingPages, ...pages]) },
    })
  } else {
    sheet = await db.sheetMusic.create({ data: { songId, pages: JSON.stringify(pages) } })
  }

  return NextResponse.json({ ...sheet, pages: JSON.parse(sheet.pages) }, { status: 201 })
}
