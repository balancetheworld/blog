import { Router } from 'express'
import { categoryService } from '../services/category.service'

const router = Router()

// 获取所有分类
router.get('/', async (req, res) => {
  try {
    const categories = await categoryService.getAll()
    res.json(categories)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// 获取单个分类
router.get('/:id', async (req, res) => {
  try {
    const category = await categoryService.getById(req.params.id)
    if (!category) {
      return res.status(404).json({ error: 'Category not found' })
    }
    res.json(category)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// 创建分类
router.post('/', async (req, res) => {
  try {
    const category = await categoryService.create(req.body)
    res.json(category)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// 更新分类
router.put('/:id', async (req, res) => {
  try {
    const category = await categoryService.update({
      id: req.params.id,
      ...req.body
    })
    if (!category) {
      return res.status(404).json({ error: 'Category not found' })
    }
    res.json(category)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// 删除分类
router.delete('/:id', async (req, res) => {
  try {
    await categoryService.delete(req.params.id)
    res.json({ success: true })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// 获取分类的文章数量
router.get('/:id/post-count', async (req, res) => {
  try {
    const count = await categoryService.getPostCount(req.params.id)
    res.json({ count })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router
