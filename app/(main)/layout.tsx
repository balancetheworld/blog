import { FloatingNav } from "@/components/floating-nav"
import { BlogFooter } from "@/components/blog-footer"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <FloatingNav />
      <div className="flex-1 pt-16 md:pt-20">{children}</div>
      <BlogFooter />
    </div>
  )
}
