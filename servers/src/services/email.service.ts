import { Resend } from 'resend'
import fs from 'fs'
import path from 'path'

// 从环境变量获取配置
const RESEND_API_KEY = process.env.RESEND_API_KEY || ''
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com'
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'

// 调试：打印环境变量
console.log('[Email Service] RESEND_API_KEY:', RESEND_API_KEY ? `${RESEND_API_KEY.slice(0, 10)}...` : 'NOT SET')
console.log('[Email Service] FROM_EMAIL:', FROM_EMAIL)

// 初始化 Resend 客户端
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null

// 邮件模板类型
type EmailTemplate = 'verification' | 'password-reset' | 'email-change'

/**
 * 读取邮件模板
 */
function loadTemplate(templateName: EmailTemplate, params: Record<string, string>): string {
  const templatePath = path.join(__dirname, '../templates/email', `${templateName}.html`)

  try {
    let template = fs.readFileSync(templatePath, 'utf-8')

    // 替换模板变量
    Object.entries(params).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      template = template.replace(regex, value)
    })

    return template
  } catch (error) {
    console.error(`Failed to load email template: ${templateName}`, error)
    return ''
  }
}

/**
 * 验证邮箱配置
 */
function isEmailConfigured(): boolean {
  if (!resend) {
    console.warn('Resend is not configured. Please set RESEND_API_KEY environment variable.')
    return false
  }
  return true
}

/**
 * 发送邮箱验证邮件
 */
export async function sendVerificationEmail(email: string, token: string): Promise<{ success: boolean; error?: string }> {
  if (!isEmailConfigured()) {
    console.log(`[Email Mock] Verification email would be sent to ${email}`)
    console.log(`[Email Mock] Verification link: ${FRONTEND_URL}/verify-email?token=${token}`)
    return { success: true }
  }

  try {
    const verifyUrl = `${FRONTEND_URL}/verify-email?token=${token}`
    const html = loadTemplate('verification', {
      verifyUrl,
      email,
      expiryDays: '7',
    })

    await resend!.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Verify your email address',
      html,
    })

    console.log(`Verification email sent to ${email}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to send verification email:', error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * 发送数字验证码邮件（用于注册）
 */
export async function sendCodeEmail(email: string, code: string): Promise<{ success: boolean; error?: string }> {
  if (!isEmailConfigured()) {
    console.log(`[Email Mock] Verification code would be sent to ${email}`)
    console.log(`[Email Mock] Verification code: ${code}`)
    return { success: true }
  }

  try {
    // 简洁的纯文本验证码邮件
    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>邮箱验证码</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 20px;">
    <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">📧 邮箱验证码</h1>
      </div>
      <div style="padding: 40px 30px;">
        <h2 style="color: #333; margin: 0 0 10px 0; font-size: 18px;">您好！</h2>
        <p style="color: #555; margin: 0 0 20px 0; font-size: 15px; line-height: 1.6;">感谢您注册我们的博客！您的邮箱验证码是：</p>
        <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 4px;">${code}</span>
        </div>
        <p style="color: #888; margin: 0; font-size: 13px;">验证码有效期为 <strong>5分钟</strong>，请及时输入。</p>
        <p style="color: #888; margin: 10px 0 0 0; font-size: 13px;">如果这不是您的操作，请忽略此邮件。</p>
      </div>
      <div style="background: #f9f9f9; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
        <p style="color: #888; margin: 0; font-size: 13px;">&copy; 2026 Blog. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
`

    await resend!.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: '邮箱验证码',
      html,
    })

    console.log(`Verification code sent to ${email}: ${code}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to send verification code email:', error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * 发送密码重置邮件
 */
export async function sendPasswordResetEmail(email: string, token: string): Promise<{ success: boolean; error?: string }> {
  if (!isEmailConfigured()) {
    console.log(`[Email Mock] Password reset email would be sent to ${email}`)
    console.log(`[Email Mock] Reset link: ${FRONTEND_URL}/reset-password?token=${token}`)
    return { success: true }
  }

  try {
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`
    const html = loadTemplate('password-reset', {
      resetUrl,
      email,
      expiryHours: '1',
    })

    await resend!.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Reset your password',
      html,
    })

    console.log(`Password reset email sent to ${email}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to send password reset email:', error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * 发送邮箱更换验证邮件
 */
export async function sendEmailChangeVerification(newEmail: string, token: string): Promise<{ success: boolean; error?: string }> {
  if (!isEmailConfigured()) {
    console.log(`[Email Mock] Email change verification would be sent to ${newEmail}`)
    console.log(`[Email Mock] Verification link: ${FRONTEND_URL}/verify-email-change?token=${token}`)
    return { success: true }
  }

  try {
    const verifyUrl = `${FRONTEND_URL}/verify-email-change?token=${token}`
    const html = loadTemplate('email-change', {
      verifyUrl,
      newEmail,
      expiryDays: '7',
    })

    await resend!.emails.send({
      from: FROM_EMAIL,
      to: newEmail,
      subject: 'Verify your new email address',
      html,
    })

    console.log(`Email change verification sent to ${newEmail}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to send email change verification:', error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * 获取模拟邮件验证链接（仅用于开发环境）
 */
export function getMockVerificationLink(type: 'verification' | 'password-reset' | 'email-change', token: string): string {
  switch (type) {
    case 'verification':
      return `${FRONTEND_URL}/verify-email?token=${token}`
    case 'password-reset':
      return `${FRONTEND_URL}/reset-password?token=${token}`
    case 'email-change':
      return `${FRONTEND_URL}/verify-email-change?token=${token}`
  }
}
