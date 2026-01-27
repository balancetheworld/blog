import { eq, and, desc } from 'drizzle-orm'
import { db, comments, type Comment, type NewComment } from '@/server/db'

export interface CreateCommentInput {
  postId: string
  author: string
  content: string
}

class CommentService {
  /**
   * 获取文章的所有评论
   */
  async getByPostId(postId: string): Promise<Comment[]> {
    return await db.query.comments.findMany({
      where: eq(comments.postId, postId),
      orderBy: [desc(comments.createdAt)]
    })
  }

  /**
   * 获取评论数量
   */
  async getCount(postId: string): Promise<number> {
    const result = await db.query.comments.findMany({
      where: eq(comments.postId, postId)
    })

    return result.length
  }

  /**
   * 创建评论
   */
  async create(input: CreateCommentInput): Promise<Comment> {
    const commentId = this.generateId()

    await db.insert(comments).values({
      id: commentId,
      postId: input.postId,
      author: input.author,
      content: input.content,
      createdAt: new Date()
    } as any)

    return (await db.query.comments.findFirst({
      where: eq(comments.id, commentId)
    }))!
  }

  /**
   * 删除评论
   */
  async delete(id: string): Promise<boolean> {
    await db.delete(comments).where(eq(comments.id, id))
    return true
  }

  /**
   * 生成随机 ID
   */
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substring(2)
  }
}

export const commentService = new CommentService()
