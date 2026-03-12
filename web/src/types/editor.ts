// 编辑器相关类型定义

import { type Editor } from '@tiptap/react'
import { type ReactNode } from 'react'

// ============================================================================
// 编辑器主体
// ============================================================================

/** RichEditor 组件 Props */
export interface RichEditorProps {
  content: string
  onChange: (content: string, text?: string) => void
  placeholder?: string
  editable?: boolean
  className?: string
}

/** Toolbar 组件 Props */
export interface ToolbarProps {
  editor: Editor | null
}

// ============================================================================
// 工具栏按钮 Props
// ============================================================================

/** TextAlignButton 组件 Props */
export interface TextAlignButtonProps {
  editor: Editor | null
}

/** MarkButton 组件 Props */
export interface MarkButtonProps {
  editor: Editor | null
  type: 'bold' | 'italic' | 'strike' | 'code'
  icon: ReactNode
  label?: string
}

/** ListButton 组件 Props */
export interface ListButtonProps {
  editor: Editor | null
  type: 'bulletList' | 'orderedList' | 'taskList'
  icon: ReactNode
  label?: string
}

/** CodeBlockButton 组件 Props */
export interface CodeBlockButtonProps {
  editor: Editor | null
}

/** HeadingSelect 组件 Props */
export interface HeadingSelectProps {
  editor: Editor | null
}

/** UndoRedoButton 组件 Props */
export interface UndoRedoButtonProps {
  editor: Editor | null
}

/** ImageButton 组件 Props */
export interface ImageButtonProps {
  editor: Editor | null
}

/** LinkButton 组件 Props */
export interface LinkButtonProps {
  editor: Editor | null
}

// ============================================================================
// 编辑器辅助类型
// ============================================================================

/** 标题选项（HeadingSelect 组件使用） */
export interface HeadingOption {
  value: string
  label: string
  icon: ReactNode
  level?: number
}

/** 编程语言选项（CodeBlockButton 组件使用） */
export interface LanguageOption {
  value: string
  label: string
}
