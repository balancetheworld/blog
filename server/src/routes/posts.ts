import { Router } from 'express'
import { postService } from '../services/post.service'

const router = Router()

// 获取所有文章（前台）
router.get('/', async (req, res) => {
  try {
    const { sortBy = 'latest', categoryId } = req.query
    const posts = await postService.getAll(sortBy as any, categoryId as string)

    // 获取完整的文章信息（包括分类和标签）
    const { db } = await import('../db')
    const postsWithExtra = await Promise.all(
      posts.map(async (post) => {
        const result: any = { ...post }

        // 获取分类信息
        if (post.categoryId) {
          const { categoryService } = await import('../services/category.service')
          const category = await categoryService.getById(post.categoryId)
          if (category) {
            result.category = category
          }
        }

        // 获取标签
        const postTagRelations = await db.query.postTags.findMany({
          where: (postTags, { eq }) => eq(postTags.postId, post.id),
          with: {
            tag: true
          }
        })
        result.tags = postTagRelations.map(pt => pt.tag.name)

        // 获取评论数量
        const { commentService } = await import('../services/comment.service')
        result.commentsCount = await commentService.getCount(post.id)

        return result
      })
    )

    res.json(postsWithExtra)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// 获取所有文章（后台）
router.get('/admin', async (req, res) => {
  try {
    const posts = await postService.getAllAdmin()
    res.json(posts)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// 通过 ID 获取文章（用于编辑）
router.get('/by-id/:id', async (req, res) => {
  try {
    const post = await postService.getById(req.params.id)
    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }

    // 获取分类和标签
    const result: any = { ...post }

    if (post.categoryId) {
      const { categoryService } = await import('../services/category.service')
      const category = await categoryService.getById(post.categoryId)
      if (category) {
        result.category = category
      }
    }

    const { db } = await import('../db')
    const postTagRelations = await db.query.postTags.findMany({
      where: (postTags, { eq }) => eq(postTags.postId, post.id),
      with: {
        tag: true
      }
    })
    result.tags = postTagRelations.map(pt => pt.tag.name)

    res.json(result)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// 获取单篇文章
router.get('/:slug', async (req, res) => {
  try {
    const post = await postService.getBySlug(req.params.slug)
    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }

    // 获取分类和标签
    const result: any = { ...post }

    if (post.categoryId) {
      const { categoryService } = await import('../services/category.service')
      const category = await categoryService.getById(post.categoryId)
      if (category) {
        result.category = category
      }
    }

    const { db } = await import('../db')
    const postTagRelations = await db.query.postTags.findMany({
      where: (postTags, { eq }) => eq(postTags.postId, post.id),
      with: {
        tag: true
      }
    })
    result.tags = postTagRelations.map(pt => pt.tag.name)

    res.json(result)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// 增加浏览量
router.post('/:id/views', async (req, res) => {
  try {
    const views = await postService.incrementViews(req.params.id)
    res.json({ views })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// 切换点赞
router.post('/:id/like', async (req, res) => {
  try {
    const { visitorId } = req.body
    if (!visitorId) {
      return res.status(400).json({ error: 'visitorId is required' })
    }

    const result = await postService.toggleLike(req.params.id, visitorId)
    res.json(result)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// 检查是否已点赞
router.get('/:id/like', async (req, res) => {
  try {
    const { visitorId } = req.query
    if (!visitorId) {
      return res.status(400).json({ error: 'visitorId is required' })
    }

    const liked = await postService.hasLiked(req.params.id, visitorId as string)
    res.json({ liked })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// 创建文章（需要认证）
router.post('/', async (req, res) => {
  try {
    console.log('[Posts] Creating post with data:', JSON.stringify(req.body, null, 2))
    const post = await postService.create(req.body)
    console.log('[Posts] Post created successfully:', post.id)
    res.json(post)
  } catch (error: any) {
    console.error('[Posts] Error creating post:', error)
    res.status(500).json({ error: error.message })
  }
})

// 更新文章（需要认证）
router.put('/:id', async (req, res) => {
  try {
    const post = await postService.update({
      id: req.params.id,
      ...req.body
    })
    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }
    res.json(post)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// 删除文章（需要认证）
router.delete('/:id', async (req, res) => {
  try {
    await postService.delete(req.params.id)
    res.json({ success: true })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router
