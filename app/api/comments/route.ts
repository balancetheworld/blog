import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/sqlite"
import { verifySession } from "@/lib/auth"

function rowsToObjects(results: { columns: string[]; values: unknown[][] }[]) {
  if (!results[0]) return []
  return results[0].values.map((row) => {
    const obj: Record<string, unknown> = {}
    results[0].columns.forEach((col, i) => { obj[col] = row[i] })
    return obj
  })
}

// GET: fetch comments for an article
export async function GET(request: NextRequest) {
  const db = await getDB()
  const type = request.nextUrl.searchParams.get("type") || "post"
  const articleId = request.nextUrl.searchParams.get("articleId")

  if (!articleId) {
    return NextResponse.json({ success: false, error: "articleId required" }, { status: 400 })
  }

  const results = db.exec(
    `SELECT c.id, c.content, c.created_at, c.user_id,
            u.username, u.display_name
     FROM comments c
     JOIN admin_users u ON c.user_id = u.id
     WHERE c.article_type = ? AND c.article_id = ?
     ORDER BY c.created_at DESC`,
    [type, Number(articleId)]
  )

  return NextResponse.json({ success: true, data: rowsToObjects(results) })
}

// POST: create a new comment (auth required)
export async function POST(request: NextRequest) {
  const session = await verifySession()
  if (!session.authenticated) {
    return NextResponse.json({ success: false, error: "Login required" }, { status: 401 })
  }

  const body = await request.json()
  const { type, articleId, content } = body

  if (!type || !articleId || !content?.trim()) {
    return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 })
  }

  const db = await getDB()
  db.run(
    "INSERT INTO comments (article_type, article_id, user_id, content, created_at) VALUES (?, ?, ?, ?, ?)",
    [type, Number(articleId), session.userId, content.trim(), new Date().toISOString()]
  )

  return NextResponse.json({ success: true })
}
