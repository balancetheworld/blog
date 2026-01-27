/**
 * 将文本转换为 URL-friendly 的 slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD') // 分离重音字符
    .replace(/[\u0300-\u036f]/g, '') // 移除重音
    .replace(/\s+/g, '-') // 空格替换为连字符
    .replace(/[^\w\-]+/g, '') // 移除非单词字符
    .replace(/\-\-+/g, '-') // 移除多个连字符
    .replace(/^-+/, '') // 移除开头的连字符
    .replace(/-+$/, '') // 移除结尾的连字符
}

/**
 * 从标题生成 slug
 */
export function generateSlugFromTitle(title: string): string {
  return slugify(title)
}
