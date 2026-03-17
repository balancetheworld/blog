import Router from 'koa-router'
import { authController } from '../controllers/auth.controller'
import { articleController } from '../controllers/article.controller'
import { noteController } from '../controllers/note.controller'
import { commentController } from '../controllers/comment.controller'
import { likeController } from '../controllers/like.controller'
import { recentlyController } from '../controllers/recently.controller'
import { categoryController } from '../controllers/category.controller'
import { profileController } from '../controllers/profile.controller'
import { userController } from '../controllers/user.controller'
// import { uploadController } from '../controllers/upload.controller'
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware'

export const router = new Router({
  prefix: '/api',
})

// Auth routes
const authRouter = new Router()
authRouter.post('/register', authController.register)
authRouter.post('/login', authController.login)
authRouter.post('/logout', authController.logout)
authRouter.get('/me', authMiddleware, authController.me)
// 邮箱认证相关路由
authRouter.post('/register-email', authController.registerWithEmail)
authRouter.post('/login-email', authController.loginWithEmail)
authRouter.post('/verify-email', authController.verifyEmail)
authRouter.post('/resend-verification', authController.resendVerification)
authRouter.post('/forgot-password', authController.forgotPassword)
authRouter.post('/reset-password', authController.resetPassword)
authRouter.post('/request-email-change', authMiddleware, authController.requestEmailChange)
authRouter.post('/verify-email-change', authController.verifyEmailChange)
authRouter.post('/cancel-email-change', authMiddleware, authController.cancelEmailChange)
// 邮箱验证码相关路由
authRouter.post('/send-verification-code', authController.sendVerificationCode)
authRouter.post('/verify-email-code', authController.verifyEmailCode)
router.use('/auth', authRouter.routes())

// Article routes (public)
router.get('/articles', articleController.getArticles)
router.get('/article/:slug', articleController.getArticle)

// Notes routes (public)
router.get('/notes', noteController.getNotes)
router.get('/notes/:nid', noteController.getNote)

// Comments routes
router.get('/comments', commentController.getComments)  // 支持查询参数 ?type=...&articleId=...
router.get('/comments/:articleType/:articleId', commentController.getComments)  // 保留路径参数支持
router.post('/comments', authMiddleware, commentController.createComment)
router.delete('/comments/:id', authMiddleware, commentController.deleteComment)

// Likes routes
router.get('/likes', likeController.getLikeCount)  // 获取点赞数（公开）
router.get('/likes/:articleType/:articleId', likeController.getLikeCount)  // 获取点赞数（公开）
router.post('/likes', authMiddleware, likeController.toggleLike)  // 切换点赞（需要登录）
router.get('/likes/status/:articleType/:articleId', authMiddleware, likeController.getLikeStatus)  // 获取用户点赞状态（需要登录）

// Recently routes (public)
router.get('/recently', recentlyController.getAll)

// Categories routes (public)
router.get('/categories', categoryController.getAll)

// Profile routes (public)
router.get('/profile', profileController.get)

// Admin routes (require authentication)
const adminRouter = new Router()
adminRouter.use(authMiddleware)
adminRouter.use(adminMiddleware)

// Articles
adminRouter.get('/articles', articleController.getAllForAdmin)  // 管理页面：获取 posts + notes
adminRouter.post('/articles', articleController.createArticle)
adminRouter.put('/articles/:id', articleController.updateArticle)
adminRouter.delete('/articles/:id', articleController.deleteArticle)
adminRouter.patch('/articles/:id/pin', articleController.togglePin)  // 置顶/取消置顶

// Notes
adminRouter.get('/notes', noteController.getNotes)  // 添加这个
adminRouter.post('/notes', noteController.createNote)
adminRouter.put('/notes/:id', noteController.updateNote)
adminRouter.delete('/notes/:id', noteController.deleteNote)

// Recently
adminRouter.get('/recently', recentlyController.getAll)  // 添加这个
adminRouter.post('/recently', recentlyController.create)
adminRouter.put('/recently/:id', recentlyController.update)
adminRouter.delete('/recently/:id', recentlyController.delete)

// Categories
adminRouter.get('/categories', categoryController.getAll)  // 添加这个：获取分类列表
adminRouter.post('/categories', categoryController.create)
adminRouter.put('/categories/:id', categoryController.update)
adminRouter.delete('/categories/:id', categoryController.delete)

// Profile
adminRouter.put('/profile', profileController.update)

// Users management
adminRouter.get('/users', userController.getAllUsers)
adminRouter.get('/users/:id', userController.getUserById)
adminRouter.post('/users', userController.createUser)
adminRouter.put('/users/:id', userController.updateUser)
adminRouter.delete('/users/:id', userController.deleteUser)
adminRouter.post('/users/:id/reset-password', userController.resetUserPassword)
adminRouter.post('/users/:id/resend-verification', userController.resendUserVerification)

// Upload routes (require authentication)
// TODO: Fix multer import issue
// const uploadRouter = new Router()
// uploadRouter.use(authMiddleware)
// uploadRouter.post('/image', uploadController.uploadImage)
// router.use('/upload', uploadRouter.routes())

router.use('/admin', adminRouter.routes())
