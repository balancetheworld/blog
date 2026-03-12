'use client'

import { useState, useEffect } from 'react'
import { Editor } from '@tiptap/react'
import { Button } from '@/components/ui/button'
import { List, ListOrdered, ListTodo } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ListButtonProps } from '@/types/editor'

export function ListButton({ editor, type, icon, label }: ListButtonProps) {
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (!editor) return

    // 检查初始状态
    const checkActive = () => {
      setIsActive(editor.isActive(type) || editor.isActive('taskList'))
    }
    checkActive()

    // 监听编辑器事务变化来更新按钮状态
    const handleUpdate = () => {
      setIsActive(editor.isActive(type) || editor.isActive('taskList'))
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

    if (type === 'taskList') {
      editor.chain().focus().toggleTaskList().run()
    } else {
      editor.chain().focus().toggleList(type).run()
    }

    // 立即更新状态（取反）
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

export function ListButtonGroup({ editor }: { editor: Editor | null }) {
  if (!editor) return null

  return (
    <div className="flex items-center gap-0.5">
      <ListButton editor={editor} type="bulletList" icon={<List className="h-4 w-4" />} label="Bullet List" />
      <ListButton editor={editor} type="orderedList" icon={<ListOrdered className="h-4 w-4" />} label="Ordered List" />
      <ListButton editor={editor} type="taskList" icon={<ListTodo className="h-4 w-4" />} label="Task List" />
    </div>
  )
}
