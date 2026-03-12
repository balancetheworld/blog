"use client"

import Link from "next/link"
import { ChevronRight, type LucideIcon } from "lucide-react"
import type { SectionHeaderProps } from "@/types/components"

export function SectionHeader({ title, icon: Icon, linkText, linkHref }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h2>
      </div>
      {linkText && linkHref && (
        <Link
          href={linkHref}
          className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          {linkText}
          <ChevronRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  )
}
