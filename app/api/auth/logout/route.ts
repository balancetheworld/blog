import { NextResponse } from "next/server"
import { deleteSession, SESSION_COOKIE } from "@/lib/auth"

export async function POST() {
  await deleteSession()

  const response = NextResponse.json({ success: true })
  response.cookies.delete(SESSION_COOKIE)
  return response
}
