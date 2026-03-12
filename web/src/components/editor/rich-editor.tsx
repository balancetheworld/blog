'use client'

import { useEditor, EditorContent, type AnyExtension } from '@tiptap/react'
import { useEffect } from 'react'
import { Toolbar } from './toolbar'
import { getExtensions } from './extensions'
import type { RichEditorProps } from '@/types/editor'

export function RichEditor({
  content,
  onChange,
  placeholder = '开始写作...',
  editable = true,
  className = '',
}: RichEditorProps) {
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
      <EditorContent editor={editor} />
    </div>
  )
}

export default RichEditor
