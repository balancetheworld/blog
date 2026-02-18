import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/sqlite"
import { verifySession } from "@/lib/auth"

function requireAdmin(session: Awaited<ReturnType<typeof verifySession>>) {
  if (!session.authenticated || session.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }
  return null
}

export async function GET() {
  const session = await verifySession()
  const denied = requireAdmin(session)
  if (denied) return denied

  const db = await getDB()
  const result = db.exec(
    "SELECT id, slug, name_en, name_zh, sort_order, created_at FROM categories ORDER BY sort_order ASC, id ASC"
  )
  const cols = result[0]?.columns || []
  const data = (result[0]?.values || []).map((row) => {
    const obj: Record<string, unknown> = {}
    cols.forEach((col, i) => { obj[col] = row[i] })
    return obj
  })
  return NextResponse.json({ success: true, data })
}

export async function POST(request: NextRequest) {
  const session = await verifySession()
  const denied = requireAdmin(session)
  if (denied) return denied

  const db = await getDB()
  const { slug, name_en, name_zh, sort_order } = await request.json()

  if (!slug || !name_en || !name_zh) {
    return NextResponse.json({ success: false, error: "slug, name_en, name_zh are required" }, { status: 400 })
  }

  const now = new Date().toISOString()
  db.run(
    "INSERT INTO categories (slug, name_en, name_zh, sort_order, created_at) VALUES (?, ?, ?, ?, ?)",
    [slug, name_en, name_zh, sort_order || 0, now]
  )
  return NextResponse.json({ success: true })
}
