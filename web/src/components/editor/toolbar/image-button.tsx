'use client'

import { useState } from 'react'
import { Editor } from '@tiptap/react'
import { Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import type { ImageButtonProps } from '@/types/editor'

export function ImageButton({ editor }: ImageButtonProps) {
  const [url, setUrl] = useState('')
  const [open, setOpen] = useState(false)

  if (!editor) return null

  const addImage = () => {
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
      setUrl('')
      setOpen(false)
    }
  }

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addImage()
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          aria-label="Insert image"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-muted-foreground">
            Image URL
          </label>
          <Input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleInputKeyDown}
            className="h-8 text-xs"
          />
          {url && (
            <div className="relative mt-2 overflow-hidden rounded-lg border border-border">
              <img
                src={url}
                alt="Preview"
                className="max-h-32 w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>
          )}
          <Button
            size="sm"
            onClick={addImage}
            disabled={!url}
            className="h-7 text-xs w-full"
          >
            Insert Image
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
