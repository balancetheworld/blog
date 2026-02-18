import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/sqlite"

export async function POST(request: NextRequest) {
  const db = await getDB()
  const { type, id } = await request.json()

  if (!type || !id) {
    return NextResponse.json({ success: false, error: "Missing type or id" }, { status: 400 })
  }

  if (type === "post") {
    db.run("UPDATE posts SET view_count = view_count + 1 WHERE id = ?", [id])
  } else if (type === "note") {
    db.run("UPDATE notes SET view_count = view_count + 1 WHERE id = ?", [id])
  }

  return NextResponse.json({ success: true })
}
