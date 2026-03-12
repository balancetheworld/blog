'use client'

import { useState, useEffect } from 'react'
import { Editor } from '@tiptap/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Bold, Italic, Strikethrough, Code } from 'lucide-react'
import type { MarkButtonProps } from '@/types/editor'

export function MarkButton({ editor, type, icon, label }: MarkButtonProps) {
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (!editor) return

    // 检查初始状态
    setIsActive(editor.isActive(type))

    // 监听编辑器事务变化来更新按钮状态
    const handleUpdate = () => {
      setIsActive(editor.isActive(type))
    }

    editor.on('selectionUpdate', handleUpdate)
    editor.on('transaction', handleUpdate)

    return () => {
      editor.off('selectionUpdate', handleUpdate)
      editor.off('transaction', handleUpdate)
    }
  }, [editor, type])

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!editor) return

    editor.chain().focus().toggleMark(type).run()

    // 立即更新状态
    setIsActive(!isActive)
  }

  if (!editor) return null

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      aria-label={label || type}
      className={cn(
        'h-8 w-8 p-0',
        isActive && 'bg-primary/10 text-primary'
      )}
    >
      {icon}
    </Button>
  )
}

export function MarkButtonGroup({ editor }: { editor: Editor | null }) {
  if (!editor) return null

  return (
    <div className="flex items-center gap-0.5">
      <MarkButton editor={editor} type="bold" icon={<Bold className="h-4 w-4" />} label="Bold" />
      <MarkButton editor={editor} type="italic" icon={<Italic className="h-4 w-4" />} label="Italic" />
      <MarkButton editor={editor} type="strike" icon={<Strikethrough className="h-4 w-4" />} label="Strikethrough" />
      <MarkButton editor={editor} type="code" icon={<Code className="h-4 w-4" />} label="Code" />
    </div>
  )
}
