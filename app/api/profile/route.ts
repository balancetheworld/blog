import { NextResponse } from "next/server"
import { getDB } from "@/lib/sqlite"

export async function GET() {
  const db = await getDB()

  const results = db.exec("SELECT * FROM profile WHERE id = 1")

  if (!results[0] || results[0].values.length === 0) {
    return NextResponse.json({ success: false, message: "Profile not found" }, { status: 404 })
  }

  const columns = results[0].columns
  const row = results[0].values[0]
  const profile: Record<string, unknown> = {}
  columns.forEach((col, i) => { profile[col] = row[i] })

  return NextResponse.json({ success: true, data: profile })
}
