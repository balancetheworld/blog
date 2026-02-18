import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/sqlite"
import { verifySession } from "@/lib/auth"

function requireAdmin(session: Awaited<ReturnType<typeof verifySession>>) {
  if (!session.authenticated || session.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }
  return null
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifySession()
  const denied = requireAdmin(session)
  if (denied) return denied

  const { id } = await params
  const db = await getDB()
  const { slug, name_en, name_zh, sort_order } = await request.json()

  db.run(
    "UPDATE categories SET slug = ?, name_en = ?, name_zh = ?, sort_order = ? WHERE id = ?",
    [slug, name_en, name_zh, sort_order || 0, Number(id)]
  )
  return NextResponse.json({ success: true })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifySession()
  const denied = requireAdmin(session)
  if (denied) return denied

  const { id } = await params
  const db = await getDB()
  db.run("DELETE FROM categories WHERE id = ?", [Number(id)])
  return NextResponse.json({ success: true })
}
