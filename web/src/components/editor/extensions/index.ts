import StarterKit from '@tiptap/starter-kit'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import { CustomImage } from './custom-image'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Typography from '@tiptap/extension-typography'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
// @ts-ignore - lowlight ESM/CJS interop issue
import * as lowlightLib from 'lowlight'

const lowlight = lowlightLib.createLowlight(lowlightLib.common)

export interface ExtensionOptions {
  placeholder?: string
  editable?: boolean
}

export const getExtensions = (options: ExtensionOptions = {}) => {
  const { placeholder = '输入内容...', editable = true } = options

  return [
    StarterKit.configure({
      codeBlock: false,
      heading: {
        levels: [1, 2, 3, 4] as const,
      },
      bulletList: {
        keepMarks: true,
        keepAttributes: false,
      },
      orderedList: {
        keepMarks: true,
        keepAttributes: false,
      },
    }),
    Placeholder.configure({
      placeholder,
      emptyEditorClass: 'is-editor-empty',
    }),
    Color.configure({ types: ['textStyle'] }),
    TextStyle,
    Highlight.configure({ multicolor: true }),
    HorizontalRule.configure(),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-primary underline underline-offset-4',
      },
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    CustomImage.configure({
      inline: true,
      allowBase64: true,
    }),
    Typography.configure(),
    TaskList.configure({
      HTMLAttributes: {
        class: 'not-prose pl-2',
      },
    }),
    TaskItem.configure({
      HTMLAttributes: {
        class: 'flex items-start my-1',
      },
      nested: true,
    }),
    CodeBlockLowlight.configure({
      lowlight,
      HTMLAttributes: {
        class: 'mac-code-block',
      },
    }),
  ]
}

export default getExtensions
