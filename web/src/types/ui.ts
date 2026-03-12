// UI 相关类型定义

import { type ReactNode } from 'react'
import { type ToastActionElement, type ToastProps } from '@/components/ui/toast'

// ============================================================================
// Toast 相关类型
// ============================================================================

/** Toast 类型（用于 useToast hook） */
export type ToasterToast = ToastProps & {
  id: string
  title?: ReactNode
  description?: ReactNode
  action?: ToastActionElement
}

/** Toast State 类型（用于 useToast hook） */
export interface ToastState {
  toasts: ToasterToast[]
}

/** Toast 创建参数类型（用于 useToast hook） */
export type Toast = Omit<ToasterToast, 'id'>

// ============================================================================
// Toast Action 类型（内部使用）
// ============================================================================

/** Toast Action 类型联合 */
export type ActionType = {
  ADD_TOAST: 'ADD_TOAST'
  UPDATE_TOAST: 'UPDATE_TOAST'
  DISMISS_TOAST: 'DISMISS_TOAST'
  REMOVE_TOAST: 'REMOVE_TOAST'
}

/** Toast Action 对象类型 */
export type ToastAction =
  | { type: ActionType['ADD_TOAST']; toast: ToasterToast }
  | { type: ActionType['UPDATE_TOAST']; toast: Partial<ToasterToast> }
  | { type: ActionType['DISMISS_TOAST']; toastId?: ToasterToast['id'] }
  | { type: ActionType['REMOVE_TOAST']; toastId?: ToasterToast['id'] }
