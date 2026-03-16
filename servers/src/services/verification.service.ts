import { randomBytes } from 'crypto'
import { sendCodeEmail } from './email.service'

// 验证码存储：Map<email, { code: string; expires: number }>
const verificationCodes = new Map<string, { code: string; expires: number }>()

// 清理过期验证码（每5分钟）
setInterval(() => {
  const now = Date.now()
  for (const [email, data] of verificationCodes.entries()) {
    if (data.expires < now) {
      verificationCodes.delete(email)
    }
  }
}, 5 * 60 * 1000)

/**
 * 生成6位数字验证码
 */
export function generateVerificationCode(): string {
  // 生成6位随机数字验证码
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  return code
}

/**
 * 发送邮箱验证码
 * @param email 邮箱地址
 * @returns 是否发送成功
 */
export async function sendEmailVerificationCode(email: string): Promise<{ success: boolean; error?: string }> {
  // 检查是否频繁请求（60秒内只能发送一次）
  const existing = verificationCodes.get(email)
  if (existing && existing.expires > Date.now() + 4 * 60 * 1000) {
    return { success: false, error: '请等待60秒后再试' }
  }

  // 生成6位验证码
  const code = generateVerificationCode()

  // 5分钟过期
  const expires = Date.now() + 5 * 60 * 1000

  // 存储验证码
  verificationCodes.set(email, { code, expires })

  // 发送邮件（使用数字验证码邮件）
  const result = await sendCodeEmail(email, code)

  return result
}

/**
 * 验证邮箱验证码
 * @param email 邮箱地址
 * @param code 用户输入的验证码
 * @returns 是否验证成功
 */
export function verifyEmailCode(email: string, code: string): { success: boolean; error?: string } {
  const stored = verificationCodes.get(email)

  if (!stored) {
    return { success: false, error: '验证码不存在或已过期' }
  }

  // 检查是否过期
  if (stored.expires < Date.now()) {
    verificationCodes.delete(email)
    return { success: false, error: '验证码已过期' }
  }

  // 验证码比对
  if (stored.code !== code) {
    return { success: false, error: '验证码错误' }
  }

  // 验证成功，删除验证码
  verificationCodes.delete(email)

  return { success: true }
}
