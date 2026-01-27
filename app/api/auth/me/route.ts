import { NextResponse } from 'next/server'
import { authService } from '@/server/services/auth.service'

export async function GET(request: Request) {
  try {
    const token = request.headers.get('cookie')?.match(/auth_token=([^;]+)/)?.[1]

    if (!token) {
      return NextResponse.json({ user: null })
    }

    const user = await authService.getCurrentUser(token)

    if (!user) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Get current user error:', error)
    return NextResponse.json({ user: null })
  }
}
