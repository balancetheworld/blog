import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/sqlite"
import { verifySession } from "@/lib/auth"

// GET: get like count and whether current user liked
export async function GET(request: NextRequest) {
  const db = await getDB()
  const type = request.nextUrl.searchParams.get("type") || "post"
  const articleId = request.nextUrl.searchParams.get("articleId")

  if (!articleId) {
    return NextResponse.json({ success: false, error: "articleId required" }, { status: 400 })
  }

  const countResult = db.exec(
    "SELECT COUNT(*) as count FROM likes WHERE article_type = ? AND article_id = ?",
    [type, Number(articleId)]
  )
  const count = (countResult[0]?.values[0]?.[0] as number) || 0

  // Check if current user liked (optional)
  let liked = false
  const session = await verifySession()
  if (session.authenticated) {
    const userResult = db.exec(
      "SELECT id FROM likes WHERE article_type = ? AND article_id = ? AND user_id = ?",
      [type, Number(articleId), session.userId]
    )
    liked = (userResult[0]?.values?.length || 0) > 0
  }

  return NextResponse.json({ success: true, count, liked })
}

// POST: toggle like (auth required)
export async function POST(request: NextRequest) {
  const session = await verifySession()
  if (!session.authenticated) {
    return NextResponse.json({ success: false, error: "Login required" }, { status: 401 })
  }

  const body = await request.json()
  const { type, articleId } = body

  if (!type || !articleId) {
    return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 })
  }

  const db = await getDB()

  // Check if already liked
  const existing = db.exec(
    "SELECT id FROM likes WHERE article_type = ? AND article_id = ? AND user_id = ?",
    [type, Number(articleId), session.userId]
  )

  if (existing[0]?.values?.length) {
    // Unlike
    db.run(
      "DELETE FROM likes WHERE article_type = ? AND article_id = ? AND user_id = ?",
      [type, Number(articleId), session.userId]
    )
    return NextResponse.json({ success: true, action: "unliked" })
  } else {
    // Like
    db.run(
      "INSERT INTO likes (article_type, article_id, user_id, created_at) VALUES (?, ?, ?, ?)",
      [type, Number(articleId), session.userId, new Date().toISOString()]
    )
    return NextResponse.json({ success: true, action: "liked" })
  }
}
