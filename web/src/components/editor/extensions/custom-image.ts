import { Image as TiptapImage } from '@tiptap/extension-image'
import { mergeAttributes } from '@tiptap/core'

// 自定义图片扩展，默认 50% 宽度
export const CustomImage = TiptapImage.extend({
  name: 'image',

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '50%',
        parseHTML: (element) => {
          return (element as HTMLElement).style.width || '50%'
        },
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {}
          }
          return {
            style: `width: ${attributes.width}`,
          }
        },
      },
    }
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes, {
      class: 'rounded-lg h-auto',
    })]
  },
})
