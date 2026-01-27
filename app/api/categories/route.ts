import { NextResponse } from 'next/server'
import { categoryService } from '@/server/services/category.service'
import { getAuthUser } from '@/server/middleware/auth.middleware'

export async function GET() {
  const categories = await categoryService.getAll()

  // 添加每个分类下的文章数量
  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => ({
      ...category,
      postCount: await categoryService.getPostCount(category.id)
    }))
  )

  return NextResponse.json(categoriesWithCount)
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json(
        { error: '分类名称不能为空' },
        { status: 400 }
      )
    }

    // 生成 slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now()

    const category = await categoryService.create({
      name,
      slug,
      description
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Create category error:', error)
    return NextResponse.json(
      { error: '创建分类失败' },
      { status: 500 }
    )
  }
}
