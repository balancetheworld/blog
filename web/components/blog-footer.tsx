export function BlogFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} 我的博客. 保留所有权利.
          </p>
          <p className="text-sm text-muted-foreground">
            使用 Next.js 构建
          </p>
        </div>
      </div>
    </footer>
  )
}
