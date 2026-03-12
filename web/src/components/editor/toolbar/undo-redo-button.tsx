'use client'

import { Editor } from '@tiptap/react'
import { Button } from '@/components/ui/button'
import { Undo, Redo } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UndoRedoButtonProps } from '@/types/editor'

export function UndoRedoButton({ editor }: UndoRedoButtonProps) {
  if (!editor) return null

  const canUndo = editor.can().undo()
  const canRedo = editor.can().redo()

  return (
    <div className="flex items-center gap-0.5">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!canUndo}
        className={cn(
          'h-8 w-8 p-0',
          !canUndo && 'opacity-50'
        )}
        aria-label="Undo"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!canRedo}
        className={cn(
          'h-8 w-8 p-0',
          !canRedo && 'opacity-50'
        )}
        aria-label="Redo"
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  )
}
