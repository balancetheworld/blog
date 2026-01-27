import { NextResponse } from 'next/server'
import { postService } from '@/server/services/post.service'
import { categoryService } from '@/server/services/category.service'
import { commentService } from '@/server/services/comment.service'
import { getAuthUser } from '@/server/middleware/auth.middleware'

type SortBy = 'latest' | 'popular'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const admin = searchParams.get('admin') === 'true'
  const sortBy = (searchParams.get('sortBy') as SortBy) || 'latest'
  const categoryId = searchParams.get('categoryId') || undefined

  if (admin) {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }
    const posts = await postService.getAllAdmin()
    return NextResponse.json(posts)
  }

  const posts = await postService.getAll(sortBy, categoryId)

  // 添加评论数量和分类信息
  const postsWithExtra = await Promise.all(
    posts.map(async (post) => ({
      ...post,
      commentsCount: await commentService.getCount(post.id),
      category: post.categoryId ? await categoryService.getById(post.categoryId) : undefined
    }))
  )

  return NextResponse.json(postsWithExtra)
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, excerpt, tags, published, coverImage, categoryId } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: '标题和内容不能为空' },
        { status: 400 }
      )
    }

    // 生成 slug
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now()

    const post = await postService.create({
      title,
      slug,
      content,
      excerpt: excerpt || content.substring(0, 100) + '...',
      tags: tags || [],
      published: published ?? false,
      coverImage,
      categoryId
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error('Create post error:', error)
    return NextResponse.json(
      { error: '创建文章失败' },
      { status: 500 }
    )
  }
}
