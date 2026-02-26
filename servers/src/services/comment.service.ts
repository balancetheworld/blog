import { CommentModel } from '../models/comment.model'

export const CommentService = {
  getCommentsByArticle: (articleType: 'post' | 'note', articleId: number) => {
    return CommentModel.findByArticle(articleType, articleId)
  },

  createComment: (userId: number, articleType: 'post' | 'note', articleId: number, content: string) => {
    return CommentModel.create({
      article_type: articleType,
      article_id: articleId,
      user_id: userId,
      content,
    })
  },

  deleteComment: (commentId: number, userId: number) => {
    const comment = CommentModel.findById(commentId)
    if (!comment) {
      throw new Error('Comment not found')
    }

    // Only the comment author can delete
    if (comment.user_id !== userId) {
      throw new Error('Forbidden: You can only delete your own comments')
    }

    CommentModel.delete(commentId)
  },
}
