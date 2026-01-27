import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { authService } from '@/server/services/auth.service'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (token) {
      await authService.logout(token)
    }

    cookieStore.delete('auth_token')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: '登出失败' },
      { status: 500 }
    )
  }
}
