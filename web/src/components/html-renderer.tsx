'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import type { HtmlRendererProps } from "@/types/components"

// 动态导入 highlight.js，避免 SSR 问题
const highlightJs = typeof window !== 'undefined' ? require('highlight.js') : null

export function HtmlRenderer({ content, className }: HtmlRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const processedRef = useRef<WeakSet<HTMLPreElement>>(new WeakSet())

  useEffect(() => {
    const container = containerRef.current
    if (!container || !highlightJs) return

    // 处理所有代码块
    const processCodeBlocks = () => {
      const codeBlocks = container.querySelectorAll('pre:not([data-enhanced="true"])')

      codeBlocks.forEach((preElement) => {
        // 类型断言
        const pre = preElement as HTMLPreElement

        // 使用 WeakSet 跟踪已处理的元素
        if (processedRef.current.has(pre)) return

        const codeEl = pre.querySelector('code')
        if (!codeEl) return

        // 标记为已处理
        pre.dataset.enhanced = 'true'
        processedRef.current.add(pre)

        // 获取语言
        const langMatch = codeEl.className?.match(/(?:^|\s)language-([\w-]+)(?:\s|$)/)
        const lang = langMatch ? langMatch[1] : ''

        // 获取代码内容
        const codeContent = codeEl.textContent || ''

        // 应用语法高亮（如果还没有高亮）
        if (!codeEl.classList.contains('hljs') && lang && highlightJs.getLanguage(lang)) {
          const highlighted = highlightJs.highlight(codeContent, { language: lang }).value
          codeEl.innerHTML = highlighted
          codeEl.classList.add('hljs')
        }

        // 创建 wrapper
        const wrapper = document.createElement('div')
        wrapper.className = 'mac-code-block-wrapper'

        // 创建工具栏
        const toolbar = document.createElement('div')
        toolbar.className = 'mac-code-block-toolbar'

        // 红黄绿圆点
        const dots = document.createElement('div')
        dots.className = 'mac-code-block-dots'
        dots.innerHTML = `
          <span class="mac-code-block-dot red"></span>
          <span class="mac-code-block-dot yellow"></span>
          <span class="mac-code-block-dot green"></span>
        `
        toolbar.appendChild(dots)

        // 语言标签
        if (lang) {
          const langSpan = document.createElement('span')
          langSpan.className = 'mac-code-block-language'
          langSpan.textContent = lang
          toolbar.appendChild(langSpan)
        }

        // 创建复制按钮
        const copyBtn = document.createElement('button')
        copyBtn.className = 'mac-code-block-copy-button'
        copyBtn.setAttribute('aria-label', '复制代码')
        copyBtn.innerHTML = `
          <span class="copy-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
            </svg>
          </span>
          <span class="check-icon" style="display: none">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </span>
          <span class="copy-text">复制</span>
          <span class="copied-text" style="display: none">已复制</span>
        `

        // 复制按钮点击事件
        copyBtn.onclick = async () => {
          try {
            await navigator.clipboard.writeText(codeContent)
            const copyIcon = copyBtn.querySelector('.copy-icon') as HTMLElement
            const checkIcon = copyBtn.querySelector('.check-icon') as HTMLElement
            const copyText = copyBtn.querySelector('.copy-text') as HTMLElement
            const copiedText = copyBtn.querySelector('.copied-text') as HTMLElement

            copyIcon.style.display = 'none'
            copyText.style.display = 'none'
            checkIcon.style.display = 'inline'
            copiedText.style.display = 'inline'
            copyBtn.classList.add('copied')

            setTimeout(() => {
              copyIcon.style.display = 'inline'
              copyText.style.display = 'inline'
              checkIcon.style.display = 'none'
              copiedText.style.display = 'none'
              copyBtn.classList.remove('copied')
            }, 2000)
          } catch (err) {
            console.error('复制失败:', err)
          }
        }

        toolbar.appendChild(copyBtn)
        wrapper.appendChild(toolbar)

        // 替换 pre
        pre.parentNode?.replaceChild(wrapper, pre)
        wrapper.appendChild(pre)

        // 清理 pre 样式
        pre.style.cssText = 'margin: 0; border-radius: 0; border: none; background-color: transparent; padding: 1rem;'
        codeEl.style.cssText = 'background-color: transparent; border: none;'
      })
    }

    // 处理任务列表删除线 - 重写整个逻辑
    const processTaskLists = () => {
      const taskItems = container.querySelectorAll('ul[data-type="taskList"] li')
      taskItems.forEach((liElement) => {
        const li = liElement as HTMLElement
        const checkbox = li.querySelector('input[type="checkbox"]') as HTMLInputElement
        if (!checkbox) return

        // 先清除之前可能添加的 task-completed 类
        li.classList.remove('task-completed')

        // 正确检测 checkbox 状态
        // 1. 优先使用 JavaScript 的 checked 属性
        // 2. 其次检查 data-checked 属性是否为 "true"
        let isChecked = checkbox.checked

        // 如果 JavaScript checked 是 false，再检查 HTML 属性
        if (!isChecked) {
          const dataChecked = li.getAttribute('data-checked')
          if (dataChecked === 'true') {
            isChecked = true
          }
        }

        // 为 li 添加类名，CSS 会根据这个类名应用删除线
        if (isChecked) {
          li.classList.add('task-completed')
        }
      })
    }

    // 立即处理一次
    processCodeBlocks()
    processTaskLists()

    // 使用 MutationObserver 监听 DOM 变化
    const observer = new MutationObserver(() => {
      processCodeBlocks()
      processTaskLists()
    })

    observer.observe(container, {
      childList: true,
      subtree: true
    })

    return () => {
      observer.disconnect()
    }
  }, [content])

  return (
    <div
      ref={containerRef}
      className={cn('prose-blog', className)}
      dangerouslySetInnerHTML={{ __html: content || '' }}
    />
  )
}
