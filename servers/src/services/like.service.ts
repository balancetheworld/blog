import { LikeModel } from '../models/like.model'

export const LikeService = {
  toggleLike: (userId: number, articleType: 'post' | 'note', articleId: number): { liked: boolean; count: number } => {
    const liked = LikeModel.toggle(userId, articleType, articleId)
    const count = LikeModel.countByArticle(articleType, articleId)
    return { liked, count }
  },

  getLikeStatus: (userId: number, articleType: 'post' | 'note', articleId: number): { liked: boolean; count: number } => {
    const like = LikeModel.findByUserAndArticle(userId, articleType, articleId)
    const count = LikeModel.countByArticle(articleType, articleId)
    return {
      liked: !!like,
      count,
    }
  },

  getLikeCount: (articleType: 'post' | 'note', articleId: number): number => {
    return LikeModel.countByArticle(articleType, articleId)
  },
}
