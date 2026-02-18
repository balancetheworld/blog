import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/sqlite"
import { verifySession } from "@/lib/auth"

export async function GET() {
  const session = await verifySession()
  if (!session.authenticated) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  const db = await getDB()
  const results = db.exec("SELECT id, content, image_url, created_at FROM recently ORDER BY created_at DESC")
  const cols = results[0]?.columns || []
  const items = (results[0]?.values || []).map((row) => {
    const obj: Record<string, unknown> = {}
    cols.forEach((col, i) => { obj[col] = row[i] })
    return obj
  })

  return NextResponse.json({ success: true, data: items })
}

export async function POST(request: NextRequest) {
  const session = await verifySession()
  if (!session.authenticated) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  const db = await getDB()
  const { content, image_url } = await request.json()

  if (!content?.trim()) {
    return NextResponse.json({ success: false, error: "Content is required" }, { status: 400 })
  }

  db.run("INSERT INTO recently (content, image_url, created_at) VALUES (?, ?, ?)",
    [content.trim(), image_url || null, new Date().toISOString()])

  return NextResponse.json({ success: true })
}
