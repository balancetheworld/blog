"use client"

import useSWR from "swr"
import { useI18n } from "@/lib/i18n-context"
import { Github, Twitter, Mail, Globe } from "lucide-react"
import { fetcher } from "@/lib/fetcher"

interface Profile {
  name: string
  username: string
  avatar: string | null
  introduce: string
  github: string | null
  twitter: string | null
  email: string | null
}

export function ProfileHeader() {
  const { t } = useI18n()
  const { data } = useSWR("/api/profile", fetcher)
  const profile: Profile | null = data?.data || null

  const name = profile?.name || t("hero.name")
  const username = profile?.username || "alexchen"
  const introduce = profile?.introduce || t("hero.tagline")

  return (
    <section className="flex flex-col items-center gap-5 py-12 md:py-16">
      {/* Avatar */}
      <div className="relative">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary ring-2 ring-primary/20">
          {name.charAt(0).toUpperCase()}
        </div>
        {/* Online indicator */}
        <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background bg-teal-500" />
      </div>

      {/* Name & Username */}
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {"@"}{username}
        </p>
      </div>

      {/* Introduce */}
      <p className="max-w-md text-center text-sm leading-relaxed text-muted-foreground text-balance">
        {introduce}
      </p>

      {/* Social Links */}
      <div className="flex items-center gap-3">
        {profile?.github && (
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="GitHub"
          >
            <Github className="h-4 w-4" />
          </a>
        )}
        {profile?.twitter && (
          <a
            href={profile.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Twitter"
          >
            <Twitter className="h-4 w-4" />
          </a>
        )}
        {profile?.email && (
          <a
            href={`mailto:${profile.email}`}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Email"
          >
            <Mail className="h-4 w-4" />
          </a>
        )}
        <a
          href="/"
          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Website"
        >
          <Globe className="h-4 w-4" />
        </a>
      </div>
    </section>
  )
}
