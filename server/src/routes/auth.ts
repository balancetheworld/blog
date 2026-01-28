import { Router } from 'express'
import { authService } from '../services/auth.service'

const router = Router()

// 登录
router.post('/login', async (req, res) => {
  try {
    console.log('[Auth] Received request body:', req.body)
    console.log('[Auth] Content-Type:', req.get('content-type'))

    const { username, password } = req.body
    console.log('[Auth] Login attempt for username:', username)

    const result = await authService.login({ username, password })

    if (!result) {
      console.log('[Auth] Login failed: Invalid credentials')
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    console.log('[Auth] Login successful for user:', result.user.username)
    res.json({ token: result.token, user: result.user })
  } catch (error: any) {
    console.error('[Auth] Login error:', error)
    res.status(500).json({ error: error.message })
  }
})

// 验证会话
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const user = await authService.verifySession(token)
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    res.json(user)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// 登出
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    await authService.logout(token)
    res.json({ success: true })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router
