"use client"

import { Github, Globe, Twitter, User, Heart } from "lucide-react"

export function ProfileHeader() {
  return (
    <section className="flex flex-col items-center gap-5 py-12 md:py-16">
      {/* Avatar */}
      <div className="relative">
        <div className="flex h-30 w-30 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary ring-2 ring-primary/20">
          <img src="/avatar.png" alt="Avatar" className="h-full w-full rounded-full object-cover" />
        </div>
      </div>

      {/* Name & Username */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Caitria
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          @balancetheworld
        </p>
      </div>

      {/* Introduce */}
      <p className="max-w-md text-center text-sm leading-relaxed text-muted-foreground text-balance">
        young and free will climb the hill
      </p>

      {/* Social Links */}
      <div className="flex items-center gap-3">
        <a
          href="https://github.com/balancetheworld"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="GitHub"
        >
          <Github className="h-4 w-4" />
        </a>
        <a
          href="https://x.com/Caitria1123"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Twitter"
        >
          <Twitter className="h-4 w-4" />
        </a>
        <a
          href="https://www.smob.cc"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Personal Website"
        >
          <User className="h-4 w-4" />
        </a>
        <a
          href="https://sfkm.me"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Partner's Website"
        >
          <Heart className="h-4 w-4" />
        </a>
      </div>
    </section>
  )
}
