import { eq } from 'drizzle-orm'
import { db, categories, posts, type Category, type NewCategory } from '@/server/db'

export interface CreateCategoryInput {
  name: string
  slug: string
  description?: string
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  id: string
}

class CategoryService {
  /**
   * 获取所有分类
   */
  async getAll(): Promise<Category[]> {
    return await db.query.categories.findMany({
      orderBy: (categories, { asc }) => [asc(categories.createdAt)]
    })
  }

  /**
   * 通过 ID 获取分类
   */
  async getById(id: string): Promise<Category | null> {
    const [category] = await db.select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1)

    return category || null
  }

  /**
   * 通过 slug 获取分类
   */
  async getBySlug(slug: string): Promise<Category | null> {
    const [category] = await db.select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1)

    return category || null
  }

  /**
   * 创建分类
   */
  async create(input: CreateCategoryInput): Promise<Category> {
    const categoryId = this.generateId()

    await db.insert(categories).values({
      id: categoryId,
      name: input.name,
      slug: input.slug,
      description: input.description,
      createdAt: new Date()
    } as any)

    return (await this.getById(categoryId))!
  }

  /**
   * 更新分类
   */
  async update(input: UpdateCategoryInput): Promise<Category | null> {
    const { id, ...updateData } = input

    const category = await this.getById(id)
    if (!category) {
      return null
    }

    await db.update(categories)
      .set(updateData)
      .where(eq(categories.id, id))

    return await this.getById(id)
  }

  /**
   * 删除分类
   */
  async delete(id: string): Promise<boolean> {
    // 将该分类下的文章分类设为空
    await db.update(posts)
      .set({ categoryId: null })
      .where(eq(posts.categoryId, id))

    await db.delete(categories).where(eq(categories.id, id))

    return true
  }

  /**
   * 获取分类下的文章数量
   */
  async getPostCount(categoryId: string): Promise<number> {
    const result = await db.select()
      .from(posts)
      .where(eq(posts.categoryId, categoryId))

    return result.length
  }

  /**
   * 生成随机 ID
   */
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substring(2)
  }
}

export const categoryService = new CategoryService()
