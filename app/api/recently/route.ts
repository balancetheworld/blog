import { NextResponse } from "next/server"
import { getDB } from "@/lib/sqlite"

export async function GET() {
  const db = await getDB()

  const results = db.exec(
    "SELECT id, content, image_url, created_at FROM recently ORDER BY created_at DESC"
  )

  const columns = results[0]?.columns || []
  const items = (results[0]?.values || []).map((row) => {
    const obj: Record<string, unknown> = {}
    columns.forEach((col, i) => { obj[col] = row[i] })
    return obj
  })

  return NextResponse.json({ success: true, data: items })
}
