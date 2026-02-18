import { NextResponse } from "next/server"
import { verifySession } from "@/lib/auth"

export async function GET() {
  const session = await verifySession()

  if (!session.authenticated) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.userId,
      username: session.username,
      displayName: session.displayName,
      role: session.role,
    },
  })
}
