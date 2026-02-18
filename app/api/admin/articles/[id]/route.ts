import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/sqlite"
import { verifySession } from "@/lib/auth"

// PUT update article
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifySession()
  if (!session.authenticated) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const db = await getDB()
  const body = await request.json()
  const { type, slug, category, cover_image, title_en, summary_en, content_en, title_zh, summary_zh, content_zh, tags } = body
  const now = new Date().toISOString()

  if (type === "note") {
    // Update note translations
    db.run("DELETE FROM note_translations WHERE note_id = ?", [Number(id)])
    if (title_en) {
      db.run("INSERT INTO note_translations (note_id, lang, title, content) VALUES (?, 'en', ?, ?)",
        [Number(id), title_en, content_en || ""])
    }
    if (title_zh) {
      db.run("INSERT INTO note_translations (note_id, lang, title, content) VALUES (?, 'zh', ?, ?)",
        [Number(id), title_zh, content_zh || ""])
    }
    return NextResponse.json({ success: true })
  }

  // Post type
  db.run("UPDATE posts SET slug = ?, category = ?, cover_image = ?, updated_at = ? WHERE id = ?",
    [slug, category || "default", cover_image || null, now, Number(id)])

  db.run("DELETE FROM post_translations WHERE post_id = ?", [Number(id)])
  if (title_en) {
    db.run("INSERT INTO post_translations (post_id, lang, title, summary, content) VALUES (?, 'en', ?, ?, ?)",
      [Number(id), title_en, summary_en || "", content_en || ""])
  }
  if (title_zh) {
    db.run("INSERT INTO post_translations (post_id, lang, title, summary, content) VALUES (?, 'zh', ?, ?, ?)",
      [Number(id), title_zh, summary_zh || "", content_zh || ""])
  }

  // Update tags
  if (Array.isArray(tags)) {
    db.run("DELETE FROM post_tags WHERE post_id = ?", [Number(id)])
    for (const tagName of tags) {
      const t = (tagName as string).trim()
      if (!t) continue
      db.run("INSERT OR IGNORE INTO tags (name) VALUES (?)", [t])
      const tagResult = db.exec("SELECT id FROM tags WHERE name = ?", [t])
      const tagId = tagResult[0]?.values[0]?.[0] as number
      if (tagId) db.run("INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)", [Number(id), tagId])
    }
  }

  return NextResponse.json({ success: true })
}

// DELETE article
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifySession()
  if (!session.authenticated) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const db = await getDB()
  const { type } = Object.fromEntries(new URL(_request.url).searchParams)

  if (type === "note") {
    db.run("DELETE FROM note_translations WHERE note_id = ?", [Number(id)])
    db.run("DELETE FROM notes WHERE id = ?", [Number(id)])
  } else {
    db.run("DELETE FROM post_tags WHERE post_id = ?", [Number(id)])
    db.run("DELETE FROM post_translations WHERE post_id = ?", [Number(id)])
    db.run("DELETE FROM posts WHERE id = ?", [Number(id)])
  }

  return NextResponse.json({ success: true })
}
