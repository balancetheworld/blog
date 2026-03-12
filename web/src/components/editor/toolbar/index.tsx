'use client'

import { Editor } from '@tiptap/react'
import { Separator } from '@/components/ui/separator'
import { HeadingSelect } from './heading-select'
import { MarkButtonGroup } from './mark-button'
import { ListButtonGroup } from './list-button'
import { TextAlignButton } from './text-align-button'
import { LinkButton } from './link-button'
import { CodeBlockButton } from './code-block-button'
import { ImageButton } from './image-button'
import { UndoRedoButton } from './undo-redo-button'
import { Minus } from 'lucide-react'
import type { ToolbarProps } from '@/types/editor'

export function Toolbar({ editor }: ToolbarProps) {
  if (!editor) return null

  const insertHorizontalRule = () => {
    editor.chain().focus().setHorizontalRule().run()
  }

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-border bg-background/80 px-2 py-1.5 backdrop-blur-sm">
      <UndoRedoButton editor={editor} />

      <Separator orientation="vertical" className="mx-1 h-6" />

      <HeadingSelect editor={editor} />

      <Separator orientation="vertical" className="mx-1 h-6" />

      <MarkButtonGroup editor={editor} />

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ListButtonGroup editor={editor} />

      <Separator orientation="vertical" className="mx-1 h-6" />

      <TextAlignButton editor={editor} />

      <Separator orientation="vertical" className="mx-1 h-6" />

      <LinkButton editor={editor} />
      <CodeBlockButton editor={editor} />
      <ImageButton editor={editor} />

      <button
        onClick={insertHorizontalRule}
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Insert horizontal rule"
      >
        <Minus className="h-4 w-4" />
      </button>
    </div>
  )
}

export default Toolbar
