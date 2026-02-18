import { NextResponse } from "next/server"
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
  _request: Request,
  { params }: { params: Promise<{ nid: string }> }
) {
  const db = await getDB()
  const { nid } = await params

  const noteResults = db.exec("SELECT * FROM notes WHERE nid = ?", [parseInt(nid)])
  const notes = rowsToObjects(noteResults)

  if (notes.length === 0) {
    return NextResponse.json({ success: false, message: "Note not found" }, { status: 404 })
  }

  const note = notes[0]

  // Increment view count
  db.run("UPDATE notes SET view_count = view_count + 1 WHERE id = ?", [note.id])

  const translationResults = db.exec(
    "SELECT * FROM note_translations WHERE note_id = ?",
    [note.id]
  )
  const translations = rowsToObjects(translationResults)

  // Get like count
  const likeResult = db.exec(
    "SELECT COUNT(*) as count FROM likes WHERE article_type = 'note' AND article_id = ?",
    [note.id]
  )
  const likeCount = likeResult[0]?.values[0]?.[0] as number || 0

  const updatedNote = rowsToObjects(db.exec("SELECT * FROM notes WHERE id = ?", [note.id]))[0]

  return NextResponse.json({
    success: true,
    data: { ...updatedNote, translations, like_count: likeCount },
  })
}
