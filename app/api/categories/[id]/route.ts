import { NextResponse } from 'next/server'
import { categoryService } from '@/server/services/category.service'
import { getAuthUser } from '@/server/middleware/auth.middleware'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const category = await categoryService.getById(id)

  if (!category) {
    return NextResponse.json({ error: '分类不存在' }, { status: 404 })
  }

  const postCount = await categoryService.getPostCount(category.id)

  return NextResponse.json({
    ...category,
    postCount
  })
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const category = await categoryService.update({ id, ...body })
    if (!category) {
      return NextResponse.json({ error: '分类不存在' }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Update category error:', error)
    return NextResponse.json({ error: '更新分类失败' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { id } = await params
    await categoryService.delete(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete category error:', error)
    return NextResponse.json({ error: '删除分类失败' }, { status: 500 })
  }
}
