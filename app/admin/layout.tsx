/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2026-01-27 20:54:34
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2026-01-27 20:54:43
 * @FilePath: /blog/my-next-app/app/admin/layout.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { store } from "@/lib/store"
import { AdminHeader } from "@/components/admin-header"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token || !store.validateSession(token)) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  )
}
