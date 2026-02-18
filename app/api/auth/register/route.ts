import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/sqlite"
import { hashPassword, createSession, SESSION_COOKIE } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password, displayName } = body

    if (!username || !password || !displayName) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      )
    }

    if (username.length < 3 || username.length > 20) {
      return NextResponse.json(
        { success: false, error: "Username must be 3-20 characters" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    const db = await getDB()

    // Check if username exists
    const existing = db.exec("SELECT id FROM admin_users WHERE username = ?", [username])
    if (existing[0]?.values?.length) {
      return NextResponse.json(
        { success: false, error: "Username already taken" },
        { status: 409 }
      )
    }

    const passwordHash = await hashPassword(password)
    const now = new Date().toISOString()

    db.run(
      "INSERT INTO admin_users (username, password_hash, display_name, role, created_at) VALUES (?, ?, ?, ?, ?)",
      [username, passwordHash, displayName, "user", now]
    )

    const result = db.exec("SELECT last_insert_rowid() as id")
    const userId = result[0]?.values[0]?.[0] as number
    const token = await createSession(userId)

    const response = NextResponse.json({
      success: true,
      user: {
        id: userId,
        username,
        displayName,
        role: "user",
      },
    })

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
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
