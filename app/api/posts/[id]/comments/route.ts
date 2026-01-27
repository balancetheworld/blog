import { NextResponse } from 'next/server'
import { commentService } from '@/server/services/comment.service'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params
  const comments = await commentService.getByPostId(id)
  return NextResponse.json(comments)
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const { author, content } = body

    if (!author || !content) {
      return NextResponse.json(
        { error: '昵称和评论内容不能为空' },
        { status: 400 }
      )
    }

    if (author.length > 50) {
      return NextResponse.json(
        { error: '昵称不能超过50个字符' },
        { status: 400 }
      )
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: '评论内容不能超过1000个字符' },
        { status: 400 }
      )
    }

    const comment = await commentService.create({
      postId: id,
      author: author.trim(),
      content: content.trim()
    })
    return NextResponse.json(comment)
  } catch (error) {
    console.error('Create comment error:', error)
    return NextResponse.json(
      { error: '添加评论失败' },
      { status: 500 }
    )
  }
}
