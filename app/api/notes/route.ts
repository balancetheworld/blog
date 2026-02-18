import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/sqlite"

export async function GET(request: NextRequest) {
  const db = await getDB()
  const lang = request.nextUrl.searchParams.get("lang") || "en"

  const results = db.exec(
    `SELECT n.id, n.nid, n.created_at, nt.title, nt.content, nt.lang
     FROM notes n
     JOIN note_translations nt ON n.id = nt.note_id
     WHERE nt.lang = ?
     ORDER BY n.created_at DESC`,
    [lang]
  )

  const columns = results[0]?.columns || []
  const notes = (results[0]?.values || []).map((row) => {
    const obj: Record<string, unknown> = {}
    columns.forEach((col, i) => { obj[col] = row[i] })
    return obj
  })

  return NextResponse.json({ success: true, data: notes })
}
