import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { authService } from '@/server/services/auth.service'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: '请输入用户名和密码' },
        { status: 400 }
      )
    }

    const result = await authService.login({ username, password })

    if (!result) {
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      )
    }

    const cookieStore = await cookies()
    cookieStore.set('auth_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return NextResponse.json({
      user: result.user
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: '登录失败' },
      { status: 500 }
    )
  }
}
