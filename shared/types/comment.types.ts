/**
 * 评论相关类型定义
 */

export interface Comment {
  id: string
  postId: string
  author: string
  content: string
  createdAt: number
}

export interface CreateCommentInput {
  postId: string
  author: string
  content: string
}
