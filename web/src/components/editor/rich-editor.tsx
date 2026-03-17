'use client'

import { useEditor, EditorContent, type AnyExtension } from '@tiptap/react'
import { useEffect, useState } from 'react'
import { Toolbar } from './toolbar'
import { getExtensions } from './extensions'
import type { RichEditorProps } from '@/types/editor'

interface UploadResponse {
  success: boolean
  data?: {
    url: string
    filename: string
  }
  error?: string
}

export function RichEditor({
  content,
  onChange,
  placeholder = '开始写作...',
  editable = true,
  className = '',
}: RichEditorProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)

  // 处理文件上传
  const handleFileUpload = async (file: File): Promise<string | null> => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return null
    }

    if (file.size > 5 * 1024 * 1024) {
      return null
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
        return data.data.url
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }

    return null
  }

  // 处理拖拽事件
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const hasFiles = e.dataTransfer.types.includes('Files')
    if (hasFiles) {
      setDragActive(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // 检查是否真的离开了编辑器区域
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setDragActive(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const url = await handleFileUpload(file)
      if (url && editor) {
        editor.chain().focus().setImage({ src: url }).run()
      }
    }
  }

  const editor = useEditor({
    immediatelyRender: false,
    editable,
    extensions: getExtensions({ placeholder }) as AnyExtension[],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML(), editor.getText())
    },
    editorProps: {
      attributes: {
        class: 'prose-blog max-w-none focus:outline-none min-h-[300px]',
      },
      handleDrop: (view, event, slice, moved) => {
        // 处理图片拖拽
        if (!moved && event.dataTransfer?.files?.[0]) {
          const file = event.dataTransfer.files[0]
          if (file.type.startsWith('image/')) {
            event.preventDefault()
            handleFileUpload(file).then((url) => {
              if (url && editor) {
                const { schema } = view.state
                const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY })
                if (coordinates) {
                  const node = schema.nodes.image.create({ src: url })
                  const transaction = view.state.tr.insert(coordinates.pos, node)
                  view.dispatch(transaction)
                }
              }
            })
            return true
          }
        }
        return false
      },
    },
  })

  // 外部内容变化时同步到编辑器
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      // 只有当内容确实不同时才更新，避免光标跳动
      const currentHtml = editor.getHTML()
      if (content !== currentHtml) {
        editor.commands.setContent(content)
      }
    }
  }, [content, editor])

  // 暴露编辑器方法给父组件（通过 ref）
  useEffect(() => {
    if (!editor) return

    // 将编辑器实例挂载到 window 上方便调试（生产环境可移除）
    if (typeof window !== 'undefined') {
      ;(window as any).__editor = editor
    }
  }, [editor])

  if (!editor) return null

  return (
    <div className={className}>
      <Toolbar editor={editor} />
      <div
        className={`
          relative rounded-lg transition-colors
          ${dragActive ? 'ring-2 ring-primary bg-primary/5' : ''}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <EditorContent editor={editor} />
        {dragActive && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-primary/10">
            <div className="flex flex-col items-center gap-2">
              <svg className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-medium text-primary">松开以上传图片</p>
              {uploading && (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <p className="text-xs text-primary">上传中...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RichEditor
