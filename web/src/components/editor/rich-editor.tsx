'use client'

import { useEditor, EditorContent, type AnyExtension } from '@tiptap/react'
import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Toolbar } from './toolbar'
import { getExtensions } from './extensions'
import type { RichEditorProps } from '@/types/editor'
import {
  Undo,
  Redo,
  Heading1,
  Heading2,
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Image as ImageIcon,
  Minus,
} from 'lucide-react'

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
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false)
  const [mounted, setMounted] = useState(false)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 确保组件在客户端挂载后才使用 Portal
  useEffect(() => {
    setMounted(true)
  }, [])

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
    // 立即重置拖拽状态
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const url = await handleFileUpload(file)
      if (url && editor) {
        editor.chain().focus().setImage({ src: url, width: 400 }).run()
      }
    }
    // 确保上传完成后状态已重置（防止上传失败时状态卡住）
    setDragActive(false)
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
            // 重置拖拽状态
            setDragActive(false)
            handleFileUpload(file).then((url) => {
              // 无论上传成功与否，确保状态已重置
              setDragActive(false)
              if (url && editor) {
                const { schema } = view.state
                const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY })
                if (coordinates) {
                  const node = schema.nodes.image.create({ src: url, width: 400 })
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

  // 检测工具栏是否在视口内，控制浮动工具栏的显示/隐藏
  useEffect(() => {
    const handleScroll = () => {
      if (!toolbarRef.current) return

      const rect = toolbarRef.current.getBoundingClientRect()
      // 当工具栏底部离开视口顶部时显示浮动工具栏
      const isToolbarOutOfView = rect.bottom < 80
      setShowFloatingToolbar(isToolbarOutOfView)
    }

    // 找到滚动容器（向上查找有 overflow 的父元素）
    const findScrollContainer = (element: HTMLElement | null): HTMLElement | null => {
      if (!element) return null
      const style = window.getComputedStyle(element)
      if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
        return element
      }
      return findScrollContainer(element.parentElement)
    }

    // 等待组件挂载后找到滚动容器
    const timer = setTimeout(() => {
      const scrollContainer = findScrollContainer(toolbarRef.current)
      if (scrollContainer) {
        scrollContainer.addEventListener('scroll', handleScroll, true)
        // 初始检查
        handleScroll()
      }
    }, 100)

    // 同时也监听 window 的 scroll（以防滚动发生在 window 上）
    window.addEventListener('scroll', handleScroll, true)
    handleScroll()

    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', handleScroll, true)
      const scrollContainer = findScrollContainer(toolbarRef.current)
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll, true)
      }
    }
  }, [])

  // 浮动工具栏按钮组件
  const FloatingToolbarButton = ({
    onClick,
    isActive = false,
    disabled = false,
    children,
    title,
  }: {
    onClick: () => void
    isActive?: boolean
    disabled?: boolean
    children: React.ReactNode
    title: string
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        flex h-9 w-9 items-center justify-center rounded-md text-sm
        transition-colors
        ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
        ${disabled ? 'cursor-not-allowed opacity-50' : ''}
      `}
    >
      {children}
    </button>
  )

  // 渲染右侧浮动工具栏
  const FloatingToolbar = () => {
    if (!editor) return null

    return (
      <div className="fixed right-36 top-1/2 -translate-y-1/2 z-[100] hidden md:flex flex-col items-center gap-1 rounded-lg border border-border bg-background/95 p-2 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col gap-1">
          <FloatingToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="撤销"
          >
            <Undo className="h-4 w-4" />
          </FloatingToolbarButton>
          <FloatingToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="重做"
          >
            <Redo className="h-4 w-4" />
          </FloatingToolbarButton>
        </div>

        <div className="h-px w-full bg-border my-1" />

        <div className="flex flex-col gap-1">
          <FloatingToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="一级标题"
          >
            <Heading1 className="h-4 w-4" />
          </FloatingToolbarButton>
          <FloatingToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="二级标题"
          >
            <Heading2 className="h-4 w-4" />
          </FloatingToolbarButton>
        </div>

        <div className="h-px w-full bg-border my-1" />

        <div className="flex flex-col gap-1">
          <FloatingToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="加粗"
          >
            <Bold className="h-4 w-4" />
          </FloatingToolbarButton>
          <FloatingToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="斜体"
          >
            <Italic className="h-4 w-4" />
          </FloatingToolbarButton>
          <FloatingToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="删除线"
          >
            <Strikethrough className="h-4 w-4" />
          </FloatingToolbarButton>
          <FloatingToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            title="行内代码"
          >
            <Code className="h-4 w-4" />
          </FloatingToolbarButton>
        </div>

        <div className="h-px w-full bg-border my-1" />

        <div className="flex flex-col gap-1">
          <FloatingToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="无序列表"
          >
            <List className="h-4 w-4" />
          </FloatingToolbarButton>
          <FloatingToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="有序列表"
          >
            <ListOrdered className="h-4 w-4" />
          </FloatingToolbarButton>
        </div>

        <div className="h-px w-full bg-border my-1" />

        <div className="flex flex-col gap-1">
          <FloatingToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            title="左对齐"
          >
            <AlignLeft className="h-4 w-4" />
          </FloatingToolbarButton>
          <FloatingToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            title="居中对齐"
          >
            <AlignCenter className="h-4 w-4" />
          </FloatingToolbarButton>
          <FloatingToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            title="右对齐"
          >
            <AlignRight className="h-4 w-4" />
          </FloatingToolbarButton>
        </div>

        <div className="h-px w-full bg-border my-1" />

        <div className="flex flex-col gap-1">
          <FloatingToolbarButton
            onClick={() => {
              const url = window.prompt('输入链接地址:')
              if (url) {
                editor.chain().focus().setLink({ href: url }).run()
              }
            }}
            isActive={editor.isActive('link')}
            title="插入链接"
          >
            <Link className="h-4 w-4" />
          </FloatingToolbarButton>
          <FloatingToolbarButton
            onClick={() => {
              const url = window.prompt('输入图片地址:')
              if (url) {
                editor.chain().focus().setImage({ src: url, width: 400 }).run()
              }
            }}
            title="插入图片"
          >
            <ImageIcon className="h-4 w-4" />
          </FloatingToolbarButton>
        </div>

        <div className="h-px w-full bg-border my-1" />

        <div className="flex flex-col gap-1">
          <FloatingToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="分割线"
          >
            <Minus className="h-4 w-4" />
          </FloatingToolbarButton>
        </div>
      </div>
    )
  }

  if (!editor) return null

  return (
    <>
      {mounted && showFloatingToolbar && createPortal(<FloatingToolbar />, document.body)}
      <div ref={containerRef} className={className}>
        <div ref={toolbarRef}>
          <Toolbar editor={editor} />
        </div>
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
    </>
  )
}

export default RichEditor
