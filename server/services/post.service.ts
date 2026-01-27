import { eq, desc, and, sql } from 'drizzle-orm'
import { db, posts, categories, tags, postTags, comments, likes, type Post, type NewPost } from '@/server/db'

export type SortBy = 'latest' | 'popular'

export interface CreatePostInput {
  title: string
  slug: string
  content: string
  excerpt: string
  coverImage?: string
  published: boolean
  categoryId?: string
  tags?: string[]
}

export interface UpdatePostInput extends Partial<CreatePostInput> {
  id: string
}

class PostService {
  /**
   * 获取所有文章（前台）
   */
  async getAll(sortBy: SortBy = 'latest', categoryId?: string): Promise<Post[]> {
    let query = db.select().from(posts)

    const conditions = [
      eq(posts.published, true)
    ]

    if (categoryId) {
      conditions.push(eq(posts.categoryId, categoryId))
    }

    const where = conditions.length > 1 ? and(...conditions) : conditions[0]

    if (sortBy === 'popular') {
      return await db.select()
        .from(posts)
        .where(where)
        .orderBy(desc(posts.views))
    }

    return await db.select()
      .from(posts)
      .where(where)
      .orderBy(desc(posts.createdAt))
  }

  /**
   * 获取所有文章（管理后台）
   */
  async getAllAdmin(): Promise<Post[]> {
    return await db.select()
      .from(posts)
      .orderBy(desc(posts.createdAt))
  }

  /**
   * 通过 slug 获取文章
   */
  async getBySlug(slug: string): Promise<Post | null> {
    const [post] = await db.select()
      .from(posts)
      .where(and(eq(posts.slug, slug), eq(posts.published, true)))
      .limit(1)

    return post || null
  }

  /**
   * 通过 ID 获取文章
   */
  async getById(id: string): Promise<Post | null> {
    const [post] = await db.select()
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1)

    return post || null
  }

  /**
   * 创建文章
   */
  async create(input: CreatePostInput): Promise<Post> {
    const postId = this.generateId()
    const now = new Date()

    await db.insert(posts).values({
      id: postId,
      title: input.title,
      slug: input.slug,
      content: input.content,
      excerpt: input.excerpt,
      coverImage: input.coverImage,
      published: input.published ? true : false,
      categoryId: input.categoryId,
      createdAt: now,
      updatedAt: now,
      views: 0,
      likes: 0
    } as any)

    // 处理标签
    if (input.tags && input.tags.length > 0) {
      await this.attachTags(postId, input.tags)
    }

    return (await this.getById(postId))!
  }

  /**
   * 更新文章
   */
  async update(input: UpdatePostInput): Promise<Post | null> {
    const { id, tags, ...updateData } = input

    const post = await this.getById(id)
    if (!post) {
      return null
    }

    const updates: any = {
      ...updateData,
      updatedAt: new Date()
    }

    if (updateData.published !== undefined) {
      updates.published = updateData.published ? 1 : 0
    }

    await db.update(posts)
      .set(updates)
      .where(eq(posts.id, id))

    // 更新标签
    if (tags !== undefined) {
      await db.delete(postTags).where(eq(postTags.postId, id))
      await this.attachTags(id, tags)
    }

    return await this.getById(id)
  }

  /**
   * 删除文章
   */
  async delete(id: string): Promise<boolean> {
    const result = await db.delete(posts).where(eq(posts.id, id))
    return true
  }

  /**
   * 增加浏览量
   */
  async incrementViews(postId: string): Promise<number> {
    await db.update(posts)
      .set({
        views: sql`${posts.views} + 1`
      })
      .where(eq(posts.id, postId))

    const post = await this.getById(postId)
    return post?.views || 0
  }

  /**
   * 切换点赞
   */
  async toggleLike(postId: string, visitorId: string): Promise<{ liked: boolean; likes: number }> {
    const existing = await db.query.likes.findFirst({
      where: and(
        eq(likes.postId, postId),
        eq(likes.visitorId, visitorId)
      )
    })

    if (existing) {
      // 取消点赞
      await db.delete(likes).where(eq(likes.id, existing.id))
      await db.update(posts)
        .set({
          likes: sql`${posts.likes} - 1`
        })
        .where(eq(posts.id, postId))

      const post = await this.getById(postId)
      return { liked: false, likes: Math.max(0, post?.likes || 0) }
    } else {
      // 添加点赞
      await db.insert(likes).values({
        id: this.generateId(),
        postId,
        visitorId,
        createdAt: new Date()
      } as any)

      await db.update(posts)
        .set({
          likes: sql`${posts.likes} + 1`
        })
        .where(eq(posts.id, postId))

      const post = await this.getById(postId)
      return { liked: true, likes: post?.likes || 0 }
    }
  }

  /**
   * 检查是否已点赞
   */
  async hasLiked(postId: string, visitorId: string): Promise<boolean> {
    const like = await db.query.likes.findFirst({
      where: and(
        eq(likes.postId, postId),
        eq(likes.visitorId, visitorId)
      )
    })

    return !!like
  }

  /**
   * 获取归档数据（按年份分组）
   */
  async getArchive(): Promise<Record<string, Post[]>> {
    const allPosts = await db.select()
      .from(posts)
      .where(eq(posts.published, true))
      .orderBy(desc(posts.createdAt))

    const grouped: Record<string, Post[]> = {}

    allPosts.forEach(post => {
      const year = new Date(post.createdAt).getFullYear().toString()
      if (!grouped[year]) {
        grouped[year] = []
      }
      grouped[year].push(post)
    })

    return grouped
  }

  /**
   * 附加标签到文章
   */
  private async attachTags(postId: string, tagNames: string[]): Promise<void> {
    for (const tagName of tagNames) {
      // 检查标签是否存在
      let tag = await db.query.tags.findFirst({
        where: eq(tags.name, tagName)
      })

      if (!tag) {
        // 创建新标签
        const tagId = this.generateId()
        const slug = this.slugify(tagName)
        await db.insert(tags).values({
          id: tagId,
          name: tagName,
          slug,
          createdAt: new Date()
        } as any)
        tag = { id: tagId, name: tagName, slug, createdAt: new Date() } as any
      }

      // 关联标签
      await db.insert(postTags).values({
        postId,
        tagId: tag!.id
      })
    }
  }

  /**
   * 生成 slug
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '')
  }

  /**
   * 生成随机 ID
   */
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substring(2)
  }
}

export const postService = new PostService()
