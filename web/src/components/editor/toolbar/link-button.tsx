'use client'

import { useState } from 'react'
import { Editor } from '@tiptap/react'
import { Link, Link2Off, Unlink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { LinkButtonProps } from '@/types/editor'

export function LinkButton({ editor }: LinkButtonProps) {
  const [url, setUrl] = useState('')
  const [open, setOpen] = useState(false)

  if (!editor) return null

  const isLinkActive = editor.isActive('link')

  const setLink = () => {
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
      setUrl('')
      setOpen(false)
    }
  }

  const unsetLink = () => {
    editor.chain().focus().unsetLink().run()
  }

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      setLink()
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-8 w-8 p-0',
            isLinkActive && 'bg-primary/10 text-primary'
          )}
          aria-label="Add link"
        >
          {isLinkActive ? <Link className="h-4 w-4" /> : <Link className="h-4 w-4" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <div className="flex flex-col gap-2">
          <Input
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleInputKeyDown}
            className="h-8 text-xs"
          />
          <div className="flex gap-1">
            <Button
              size="sm"
              onClick={setLink}
              disabled={!url}
              className="flex-1 h-7 text-xs"
            >
              {isLinkActive ? 'Update' : 'Add'}
            </Button>
            {isLinkActive && (
              <Button
                size="sm"
                variant="outline"
                onClick={unsetLink}
                className="flex-1 h-7 text-xs"
              >
                <Unlink className="h-3 w-3 mr-1" />
                Remove
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
