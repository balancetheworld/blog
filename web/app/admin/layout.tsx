import React from "react"
import { AdminHeader } from "@/components/admin-header"
import { AdminAuthWrapper } from "@/components/admin-auth-wrapper"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAuthWrapper>
      <div className="min-h-screen bg-muted/30">
        <AdminHeader />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </div>
    </AdminAuthWrapper>
  )
}
