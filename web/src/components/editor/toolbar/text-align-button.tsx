'use client'

import { useState, useEffect } from 'react'
import { Editor } from '@tiptap/react'
import { Button } from '@/components/ui/button'
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TextAlignButtonProps } from '@/types/editor'

const alignments = [
  { value: 'left', icon: <AlignLeft className="h-4 w-4" />, label: 'Align Left' },
  { value: 'center', icon: <AlignCenter className="h-4 w-4" />, label: 'Align Center' },
  { value: 'right', icon: <AlignRight className="h-4 w-4" />, label: 'Align Right' },
  { value: 'justify', icon: <AlignJustify className="h-4 w-4" />, label: 'Justify' },
]

function AlignButton({
  editor,
  value,
  icon,
  label,
  currentAlignment,
  onAlignmentChange,
}: {
  editor: Editor | null
  value: string
  icon: React.ReactNode
  label: string
  currentAlignment: string
  onAlignmentChange: (value: string) => void
}) {
  const isActive = currentAlignment === value

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onAlignmentChange(value)
  }

  if (!editor) return null

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      aria-label={label}
      className={cn(
        'h-8 w-8 p-0',
        isActive && 'bg-primary/10 text-primary'
      )}
    >
      {icon}
    </Button>
  )
}

export function TextAlignButton({ editor }: TextAlignButtonProps) {
  const [currentAlignment, setCurrentAlignment] = useState('left')

  useEffect(() => {
    if (!editor) return

    // 检查初始状态
    const checkAlignment = () => {
      const active = alignments.find(a => editor.isActive({ textAlign: a.value }))?.value || 'left'
      setCurrentAlignment(active)
    }
    checkAlignment()

    // 监听编辑器事务变化来更新按钮状态
    const handleUpdate = () => {
      const active = alignments.find(a => editor.isActive({ textAlign: a.value }))?.value || 'left'
      setCurrentAlignment(active)
    }

    editor.on('selectionUpdate', handleUpdate)
    editor.on('transaction', handleUpdate)

    return () => {
      editor.off('selectionUpdate', handleUpdate)
      editor.off('transaction', handleUpdate)
    }
  }, [editor])

  const handleAlignmentChange = (value: string) => {
    if (!editor) return
    editor.chain().focus().setTextAlign(value).run()
    // 立即更新状态
    setCurrentAlignment(value)
  }

  if (!editor) return null

  return (
    <div className="flex items-center gap-0.5">
      {alignments.map((alignment) => (
        <AlignButton
          key={alignment.value}
          editor={editor}
          value={alignment.value}
          icon={alignment.icon}
          label={alignment.label}
          currentAlignment={currentAlignment}
          onAlignmentChange={handleAlignmentChange}
        />
      ))}
    </div>
  )
}
