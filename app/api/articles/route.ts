import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/sqlite"

export async function GET(request: NextRequest) {
  const db = await getDB()
  const lang = request.nextUrl.searchParams.get("lang") || "en"
  const categoryFilter = request.nextUrl.searchParams.get("category") || ""
  const sort = request.nextUrl.searchParams.get("sort") || "latest"
  const q = request.nextUrl.searchParams.get("q")?.trim() || ""

  // Build post query with optional category + search filters
  const postWhere = ["pt.lang = ?"]
  const postParams: (string | number)[] = [lang]

  if (categoryFilter) {
    postWhere.push("p.category = ?")
    postParams.push(categoryFilter)
  }
  if (q) {
    postWhere.push("pt.title LIKE ?")
    postParams.push(`%${q}%`)
  }

  const postQuery = `SELECT p.id, p.slug, p.category, p.cover_image, p.view_count, p.created_at,
            pt.title, pt.summary,
            (SELECT COUNT(*) FROM likes l WHERE l.article_type = 'post' AND l.article_id = p.id) as like_count
     FROM posts p
     JOIN post_translations pt ON p.id = pt.post_id
     WHERE ${postWhere.join(" AND ")}
     ORDER BY p.created_at DESC`

  const postResults = db.exec(postQuery, postParams)
  const postCols = postResults[0]?.columns || []
  const posts = (postResults[0]?.values || []).map((row) => {
    const obj: Record<string, unknown> = {}
    postCols.forEach((col, i) => { obj[col] = row[i] })
    // Fetch tags
    const tagResult = db.exec(
      "SELECT t.name FROM tags t JOIN post_tags pt ON t.id = pt.tag_id WHERE pt.post_id = ? ORDER BY t.name",
      [obj.id as number]
    )
    const tags = (tagResult[0]?.values || []).map((r) => r[0] as string)
    return { ...obj, type: "post", href: `/article/${obj.slug}`, tags }
  })

  // Fetch notes (only when no category filter, or category is "note")
  let notes: Record<string, unknown>[] = []
  if (!categoryFilter || categoryFilter === "note") {
    const noteWhere = ["nt.lang = ?"]
    const noteParams: (string | number)[] = [lang]
    if (q) {
      noteWhere.push("nt.title LIKE ?")
      noteParams.push(`%${q}%`)
    }
    const noteResults = db.exec(
      `SELECT n.id, n.nid, n.view_count, n.created_at, nt.title, nt.content as summary,
              (SELECT COUNT(*) FROM likes l WHERE l.article_type = 'note' AND l.article_id = n.id) as like_count
       FROM notes n
       JOIN note_translations nt ON n.id = nt.note_id
       WHERE ${noteWhere.join(" AND ")}
       ORDER BY n.created_at DESC`,
      noteParams
    )
    const noteCols = noteResults[0]?.columns || []
    notes = (noteResults[0]?.values || []).map((row) => {
      const obj: Record<string, unknown> = {}
      noteCols.forEach((col, i) => { obj[col] = row[i] })
      return { ...obj, type: "note", href: `/notes/${obj.nid}`, category: "note" }
    })
  }

  // Merge and sort
  const all = [...posts, ...notes].sort((a, b) => {
    if (sort === "popular") {
      return (b.view_count as number || 0) - (a.view_count as number || 0)
    }
    const da = new Date(a.created_at as string).getTime()
    const db2 = new Date(b.created_at as string).getTime()
    return db2 - da
  })

  return NextResponse.json({ success: true, data: all })
}
