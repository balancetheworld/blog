import { NextResponse } from 'next/server'
import { postService } from '@/server/services/post.service'
import { getAuthUser } from '@/server/middleware/auth.middleware'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const post = await postService.getById(id)

  if (!post) {
    return NextResponse.json({ error: '文章不存在' }, { status: 404 })
  }

  return NextResponse.json(post)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const post = await postService.update({ id, ...body })
    if (!post) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Update post error:', error)
    return NextResponse.json(
      { error: '更新文章失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { id } = await params
    await postService.delete(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete post error:', error)
    return NextResponse.json(
      { error: '删除文章失败' },
      { status: 500 }
    )
  }
}
