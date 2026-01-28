/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2026-01-27 21:10:20
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2026-01-27 21:10:27
 * @FilePath: /blog/my-next-app/lib/format.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export function formatDate(date: string | number | Date): string {
  const dateObj = typeof date === 'number' ? new Date(date) : (typeof date === 'string' ? new Date(date) : date)
  return dateObj.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatDateShort(date: string | number | Date): string {
  const dateObj = typeof date === 'number' ? new Date(date) : (typeof date === 'string' ? new Date(date) : date)
  return dateObj.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  })
}
