import { cookies } from "next/headers"
import { getDB } from "./sqlite"

const SESSION_COOKIE = "blog_session"

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export async function createSession(userId: number): Promise<string> {
  const db = await getDB()
  const token = generateToken()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days

  db.run(
    "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)",
    [token, userId, expiresAt]
  )

  return token
}

export async function verifySession(): Promise<{
  authenticated: boolean
  userId?: number
  username?: string
  displayName?: string
  role?: string
}> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE)?.value
    if (!token) return { authenticated: false }

    const db = await getDB()

    // Clean expired sessions
    db.run("DELETE FROM sessions WHERE expires_at < ?", [new Date().toISOString()])

    const result = db.exec(
      `SELECT s.user_id, u.username, u.display_name, u.role
       FROM sessions s
       JOIN admin_users u ON s.user_id = u.id
       WHERE s.token = ? AND s.expires_at > ?`,
      [token, new Date().toISOString()]
    )

    if (!result[0]?.values?.length) return { authenticated: false }

    const row = result[0].values[0]
    return {
      authenticated: true,
      userId: row[0] as number,
      username: row[1] as string,
      displayName: row[2] as string,
      role: row[3] as string,
    }
  } catch {
    return { authenticated: false }
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return

  const db = await getDB()
  db.run("DELETE FROM sessions WHERE token = ?", [token])
}

export { SESSION_COOKIE }
