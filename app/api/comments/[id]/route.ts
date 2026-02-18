import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/sqlite"
import { verifySession } from "@/lib/auth"

// DELETE: delete own comment (or admin can delete any)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifySession()
  if (!session.authenticated) {
    return NextResponse.json({ success: false, error: "Login required" }, { status: 401 })
  }

  const { id } = await params
  const db = await getDB()

  // Check ownership or admin
  const result = db.exec("SELECT user_id FROM comments WHERE id = ?", [Number(id)])
  if (!result[0]?.values?.length) {
    return NextResponse.json({ success: false, error: "Comment not found" }, { status: 404 })
  }

  const ownerId = result[0].values[0][0] as number
  if (ownerId !== session.userId && session.role !== "admin") {
    return NextResponse.json({ success: false, error: "Permission denied" }, { status: 403 })
  }

  db.run("DELETE FROM comments WHERE id = ?", [Number(id)])
  return NextResponse.json({ success: true })
}
