import { NextResponse } from "next/server"
import { getDB } from "@/lib/sqlite"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lang: string }> }
) {
  const db = await getDB()
  const { lang } = await params

  const results = db.exec("SELECT key, value FROM i18n_labels WHERE lang = ?", [lang])
  const labels: Record<string, string> = {}

  if (results[0]) {
    for (const row of results[0].values) {
      labels[row[0] as string] = row[1] as string
    }
  }

  return NextResponse.json({ success: true, data: labels })
}
