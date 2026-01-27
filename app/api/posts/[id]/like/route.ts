import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { postService } from '@/server/services/post.service'

interface RouteParams {
  params: Promise<{ id: string }>
}

// 获取或创建访客ID
async function getVisitorId(): Promise<string> {
  const cookieStore = await cookies()
  let visitorId = cookieStore.get('visitor_id')?.value

  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substring(7)}`
  }

  return visitorId
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params
  const visitorId = await getVisitorId()
  const liked = await postService.hasLiked(id, visitorId)
  const post = await postService.getById(id)

  return NextResponse.json({
    liked,
    likes: post?.likes ?? 0
  })
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const visitorId = await getVisitorId()

    const result = await postService.toggleLike(id, visitorId)

    const response = NextResponse.json(result)

    // 设置访客ID cookie
    response.cookies.set('visitor_id', visitorId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365 // 1年
    })

    return response
  } catch (error) {
    console.error('Toggle like error:', error)
    return NextResponse.json(
      { error: '操作失败' },
      { status: 500 }
    )
  }
}
