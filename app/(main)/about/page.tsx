"use client"

import useSWR from "swr"
import { useI18n } from "@/lib/i18n-context"
import { Github, Twitter, Mail, Globe } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Profile {
  name: string
  username: string
  avatar: string | null
  introduce: string
  github: string | null
  twitter: string | null
  email: string | null
}

export default function AboutPage() {
  const { t } = useI18n()
  const { data } = useSWR("/api/profile", fetcher)
  const profile: Profile | null = data?.data || null

  const name = profile?.name || t("hero.name")
  const introduce = profile?.introduce || t("about.content")

  return (
    <main className="mx-auto max-w-2xl px-6 pb-12">
      <h1 className="mb-8 text-2xl font-bold tracking-tight text-foreground">
        {t("about.title")}
      </h1>

      <div className="glass-card p-6 md:p-8">
        {/* Avatar & Name */}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary ring-2 ring-primary/20">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{name}</h2>
            <p className="text-sm text-muted-foreground">
              {"@"}{profile?.username || "alexchen"}
            </p>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-6 border-t border-border pt-6">
          <p className="text-sm leading-relaxed text-foreground/85">
            {introduce}
          </p>
        </div>

        {/* Social Links */}
        <div className="mt-6 flex items-center gap-3 border-t border-border pt-6">
          {profile?.github && (
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          )}
          {profile?.twitter && (
            <a
              href={profile.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Twitter className="h-4 w-4" />
              Twitter
            </a>
          )}
          {profile?.email && (
            <a
              href={`mailto:${profile.email}`}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Mail className="h-4 w-4" />
              Email
            </a>
          )}
          <a
            href="/"
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Globe className="h-4 w-4" />
            Blog
          </a>
        </div>
      </div>
    </main>
  )
}
