import { Router } from 'express'
import { commentService } from '../services/comment.service'

const router = Router()

// 获取文章的所有评论
router.get('/post/:postId', async (req, res) => {
  try {
    const comments = await commentService.getByPostId(req.params.postId)
    res.json(comments)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// 创建评论
router.post('/', async (req, res) => {
  try {
    const comment = await commentService.create(req.body)
    res.json(comment)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// 删除评论
router.delete('/:id', async (req, res) => {
  try {
    await commentService.delete(req.params.id)
    res.json({ success: true })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// 获取评论数量
router.get('/post/:postId/count', async (req, res) => {
  try {
    const count = await commentService.getCount(req.params.postId)
    res.json({ count })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router
