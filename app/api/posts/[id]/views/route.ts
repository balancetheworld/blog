import { NextResponse } from 'next/server'
import { postService } from '@/server/services/post.service'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const views = await postService.incrementViews(id)
    return NextResponse.json({ views })
  } catch (error) {
    console.error('Increment views error:', error)
    return NextResponse.json(
      { error: '操作失败' },
      { status: 500 }
    )
  }
}
