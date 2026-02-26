"use client"

import { ProfileHeader } from "@/components/profile-header"
import { ArticlesSection } from "@/components/article-list"

export default function HomePage() {
  return (
    <main className="mx-auto max-w-2xl px-6">
      <ProfileHeader />
      <ArticlesSection />
    </main>
  )
}
