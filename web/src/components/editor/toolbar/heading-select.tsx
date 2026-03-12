'use client'

import { Editor } from '@tiptap/react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Heading1, Heading2, Heading3, Heading4, Pilcrow } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HeadingSelectProps, HeadingOption } from '@/types/editor'

const headingOptions: HeadingOption[] = [
  { value: 'p', label: 'Paragraph', icon: <Pilcrow className="h-4 w-4" /> },
  { value: 'h1', label: 'Heading 1', icon: <Heading1 className="h-4 w-4" />, level: 1 },
  { value: 'h2', label: 'Heading 2', icon: <Heading2 className="h-4 w-4" />, level: 2 },
  { value: 'h3', label: 'Heading 3', icon: <Heading3 className="h-4 w-4" />, level: 3 },
  { value: 'h4', label: 'Heading 4', icon: <Heading4 className="h-4 w-4" />, level: 4 },
]

export function HeadingSelect({ editor }: HeadingSelectProps) {
  if (!editor) return null

  const getCurrentHeading = () => {
    if (editor.isActive('heading', { level: 1 })) return 'h1'
    if (editor.isActive('heading', { level: 2 })) return 'h2'
    if (editor.isActive('heading', { level: 3 })) return 'h3'
    if (editor.isActive('heading', { level: 4 })) return 'h4'
    return 'p'
  }

  const handleHeadingChange = (value: string) => {
    if (value === 'p') {
      editor.chain().focus().setParagraph().run()
    } else {
      const level = parseInt(value.replace('h', '')) as 1 | 2 | 3 | 4
      editor.chain().focus().toggleHeading({ level }).run()
    }
  }

  const currentHeading = getCurrentHeading()
  const currentOption = headingOptions.find(opt => opt.value === currentHeading)

  return (
    <Select value={currentHeading} onValueChange={handleHeadingChange}>
      <SelectTrigger
        className={cn(
          "w-[140px] h-8 text-xs",
          currentHeading !== 'p' && "text-primary"
        )}
      >
        <div className="flex items-center gap-2">
          {currentOption?.icon}
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent align="start">
        {headingOptions.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="text-xs"
          >
            <div className="flex items-center gap-2">
              {option.icon}
              {option.label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
