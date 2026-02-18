import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/sqlite"

function rowsToObjects(results: { columns: string[]; values: unknown[][] }[]) {
  if (!results[0]) return []
  const columns = results[0].columns
  return results[0].values.map((row) => {
    const obj: Record<string, unknown> = {}
    columns.forEach((col, i) => { obj[col] = row[i] })
    return obj
  })
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const db = await getDB()
  const { slug } = await params

  const postResults = db.exec("SELECT * FROM posts WHERE slug = ?", [slug])
  const posts = rowsToObjects(postResults)

  if (posts.length === 0) {
    return NextResponse.json(
      { success: false, message: "Post not found" },
      { status: 404 }
    )
  }

  const post = posts[0]

  // Increment view count
  db.run("UPDATE posts SET view_count = view_count + 1 WHERE id = ?", [post.id])

  const translationResults = db.exec(
    "SELECT * FROM post_translations WHERE post_id = ?",
    [post.id]
  )
  const translations = rowsToObjects(translationResults)

  // Get like count
  const likeResult = db.exec(
    "SELECT COUNT(*) as count FROM likes WHERE article_type = 'post' AND article_id = ?",
    [post.id]
  )
  const likeCount = likeResult[0]?.values[0]?.[0] as number || 0

  // Re-read updated view count
  const updatedPost = rowsToObjects(db.exec("SELECT * FROM posts WHERE id = ?", [post.id]))[0]

  // Get tags
  const tagResult = db.exec(
    "SELECT t.name FROM tags t JOIN post_tags pt ON t.id = pt.tag_id WHERE pt.post_id = ? ORDER BY t.name",
    [post.id]
  )
  const tags = (tagResult[0]?.values || []).map((r) => r[0] as string)

  return NextResponse.json({
    success: true,
    data: { ...updatedPost, translations, like_count: likeCount, tags },
  })
}
