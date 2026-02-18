import { NextResponse } from "next/server"
import { getDB } from "@/lib/sqlite"

export async function GET() {
  const db = await getDB()
  const result = db.exec(
    "SELECT id, slug, name_en, name_zh, sort_order FROM categories ORDER BY sort_order ASC, id ASC"
  )
  const cols = result[0]?.columns || []
  const data = (result[0]?.values || []).map((row) => {
    const obj: Record<string, unknown> = {}
    cols.forEach((col, i) => { obj[col] = row[i] })
    return obj
  })
  return NextResponse.json({ success: true, data })
}
