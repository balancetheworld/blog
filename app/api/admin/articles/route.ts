import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/sqlite"
import { verifySession } from "@/lib/auth"

function requireAuth(session: Awaited<ReturnType<typeof verifySession>>) {
  if (!session.authenticated) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }
  return null
}

// GET all articles for admin (both posts and notes with all translations)
export async function GET() {
  const session = await verifySession()
  const denied = requireAuth(session)
  if (denied) return denied

  const db = await getDB()

  const posts = db.exec(`
    SELECT p.id, p.slug, p.category, p.cover_image, p.created_at, p.updated_at,
           pt_en.title as title_en, pt_en.summary as summary_en, pt_en.content as content_en,
           pt_zh.title as title_zh, pt_zh.summary as summary_zh, pt_zh.content as content_zh
    FROM posts p
    LEFT JOIN post_translations pt_en ON p.id = pt_en.post_id AND pt_en.lang = 'en'
    LEFT JOIN post_translations pt_zh ON p.id = pt_zh.post_id AND pt_zh.lang = 'zh'
    ORDER BY p.created_at DESC
  `)

  const cols = posts[0]?.columns || []
  const items = (posts[0]?.values || []).map((row) => {
    const obj: Record<string, unknown> = {}
    cols.forEach((col, i) => { obj[col] = row[i] })
    obj.type = "post"
    // Fetch tags for this post
    const tagResult = db.exec(
      "SELECT t.name FROM tags t JOIN post_tags pt ON t.id = pt.tag_id WHERE pt.post_id = ? ORDER BY t.name",
      [obj.id as number]
    )
    obj.tags = (tagResult[0]?.values || []).map((r) => r[0] as string)
    return obj
  })

  const notes = db.exec(`
    SELECT n.id, n.nid, n.created_at,
           nt_en.title as title_en, nt_en.content as content_en,
           nt_zh.title as title_zh, nt_zh.content as content_zh
    FROM notes n
    LEFT JOIN note_translations nt_en ON n.id = nt_en.note_id AND nt_en.lang = 'en'
    LEFT JOIN note_translations nt_zh ON n.id = nt_zh.note_id AND nt_zh.lang = 'zh'
    ORDER BY n.created_at DESC
  `)

  const noteCols = notes[0]?.columns || []
  const noteItems = (notes[0]?.values || []).map((row) => {
    const obj: Record<string, unknown> = {}
    noteCols.forEach((col, i) => { obj[col] = row[i] })
    obj.type = "note"
    return obj
  })

  return NextResponse.json({ success: true, data: [...items, ...noteItems] })
}

// POST create a new article (post or note)
export async function POST(request: NextRequest) {
  const session = await verifySession()
  const denied = requireAuth(session)
  if (denied) return denied

  const db = await getDB()
  const body = await request.json()
  const { type, slug, category, cover_image, title_en, summary_en, content_en, title_zh, summary_zh, content_zh, tags } = body

  const now = new Date().toISOString()

  if (type === "note") {
    // Get next nid
    const maxNid = db.exec("SELECT COALESCE(MAX(nid), 0) + 1 FROM notes")
    const nid = (maxNid[0]?.values[0]?.[0] as number) || 1
    db.run("INSERT INTO notes (nid, created_at) VALUES (?, ?)", [nid, now])
    const result = db.exec("SELECT last_insert_rowid()")
    const noteId = result[0]?.values[0]?.[0] as number

    // Always insert both translations (use title from the other lang as fallback)
    db.run("INSERT INTO note_translations (note_id, lang, title, content) VALUES (?, 'en', ?, ?)",
      [noteId, title_en || title_zh || "", content_en || content_zh || ""])
    db.run("INSERT INTO note_translations (note_id, lang, title, content) VALUES (?, 'zh', ?, ?)",
      [noteId, title_zh || title_en || "", content_zh || content_en || ""])

    return NextResponse.json({ success: true, id: noteId, nid, type: "note" })
  }

  // Post type
  if (!slug) {
    return NextResponse.json({ success: false, error: "Slug is required for posts" }, { status: 400 })
  }

  db.run("INSERT INTO posts (slug, category, cover_image, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
    [slug, category || "default", cover_image || null, now, now])
  const result = db.exec("SELECT last_insert_rowid()")
  const postId = result[0]?.values[0]?.[0] as number

  // Always insert both translations (use other lang as fallback)
  db.run("INSERT INTO post_translations (post_id, lang, title, summary, content) VALUES (?, 'en', ?, ?, ?)",
    [postId, title_en || title_zh || "", summary_en || summary_zh || "", content_en || content_zh || ""])
  db.run("INSERT INTO post_translations (post_id, lang, title, summary, content) VALUES (?, 'zh', ?, ?, ?)",
    [postId, title_zh || title_en || "", summary_zh || summary_en || "", content_zh || content_en || ""])

  // Save tags
  if (Array.isArray(tags)) {
    for (const tagName of tags) {
      const t = (tagName as string).trim()
      if (!t) continue
      db.run("INSERT OR IGNORE INTO tags (name) VALUES (?)", [t])
      const tagResult = db.exec("SELECT id FROM tags WHERE name = ?", [t])
      const tagId = tagResult[0]?.values[0]?.[0] as number
      if (tagId) db.run("INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)", [postId, tagId])
    }
  }

  return NextResponse.json({ success: true, id: postId, slug, type: "post" })
}
