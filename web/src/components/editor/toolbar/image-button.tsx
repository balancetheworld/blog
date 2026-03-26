'use client'

import { useState, useRef, useCallback } from 'react'
import { Editor } from '@tiptap/react'
import { Image as ImageIcon, Upload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import type { ImageButtonProps } from '@/types/editor'

interface UploadResponse {
  success: boolean
  data?: {
    url: string
    filename: string
  }
  error?: string
}

export function ImageButton({ editor }: ImageButtonProps) {
  const [open, setOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!editor) return null

  // 处理文件上传
  const handleUpload = useCallback(async (file: File) => {
    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      alert('只支持上传图片文件 (JPEG, PNG, GIF, WebP, SVG)')
      return
    }

    // 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      const data: UploadResponse = await response.json()

      if (response.ok && data.success && data.data?.url) {
        // 插入图片到编辑器
        editor.chain().focus().setImage({ src: data.data.url, width: '50%' }).run()
        setOpen(false)
        setPreviewUrl(null)
      } else {
        alert(data.error || '上传失败，请重试')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('上传失败，请检查网络连接')
    } finally {
      setUploading(false)
    }
  }, [editor])

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
    // 重置 input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 处理拖拽事件
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  // 处理拖拽放下
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }, [handleUpload])

  // 点击上传区域
  const handleClick = () => {
    fileInputRef.current?.click()
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
      <PopoverContent className="w-80 p-3" align="start">
        <div className="flex flex-col gap-3">
          {/* 上传区域 */}
          <div
            className={`
              relative flex min-h-[120px] cursor-pointer flex-col items-center justify-center
              rounded-lg border-2 border-dashed transition-colors
              ${dragActive
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }
              ${uploading ? 'pointer-events-none opacity-50' : ''}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />

            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground">上传中...</p>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-xs font-medium text-foreground">
                    点击或拖拽图片到此处
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    支持 JPEG, PNG, GIF, WebP, SVG
                  </p>
                  <p className="text-xs text-muted-foreground">
                    最大 5MB
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
