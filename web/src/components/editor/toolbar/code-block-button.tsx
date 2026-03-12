'use client'

import { useState } from 'react'
import { Editor } from '@tiptap/react'
import { Code2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { CodeBlockButtonProps } from '@/types/editor'

const languages = [
  { value: 'plaintext', label: 'Plain Text' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'scss', label: 'SCSS' },
  { value: 'json', label: 'JSON' },
  { value: 'bash', label: 'Bash' },
  { value: 'sql', label: 'SQL' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'yaml', label: 'YAML' },
  { value: 'xml', label: 'XML' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
]

export function CodeBlockButton({ editor }: CodeBlockButtonProps) {
  const [open, setOpen] = useState(false)
  const [selectedLang, setSelectedLang] = useState('plaintext')

  if (!editor) return null

  const isCodeBlockActive = editor.isActive('codeBlock')

  const insertCodeBlock = () => {
    editor.chain().focus().toggleCodeBlock().run()
    if (selectedLang && selectedLang !== 'plaintext') {
      editor.chain().focus().updateAttributes('codeBlock', { language: selectedLang }).run()
    }
    setOpen(false)
    setSelectedLang('plaintext')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-8 w-8 p-0',
            isCodeBlockActive && 'bg-primary/10 text-primary'
          )}
          aria-label="Insert code block"
        >
          <Code2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3" align="start">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-muted-foreground">
            Programming Language
          </label>
          <Select value={selectedLang} onValueChange={setSelectedLang}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select language..." />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value} className="text-xs">
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            onClick={insertCodeBlock}
            className="h-7 text-xs"
          >
            {isCodeBlockActive ? 'Update Language' : 'Insert Code Block'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
