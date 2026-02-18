import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/sqlite"
import { hashPassword, createSession, SESSION_COOKIE } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Username and password are required" },
        { status: 400 }
      )
    }

    const db = await getDB()
    const passwordHash = await hashPassword(password)

    const result = db.exec(
      "SELECT id, username, display_name, role FROM admin_users WHERE username = ? AND password_hash = ?",
      [username, passwordHash]
    )

    if (!result[0]?.values?.length) {
      return NextResponse.json(
        { success: false, error: "Invalid username or password" },
        { status: 401 }
      )
    }

    const row = result[0].values[0]
    const userId = row[0] as number
    const token = await createSession(userId)

    const response = NextResponse.json({
      success: true,
      user: {
        id: userId,
        username: row[1],
        displayName: row[2],
        role: row[3],
      },
    })

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    return response
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
