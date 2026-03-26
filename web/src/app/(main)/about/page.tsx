"use client"

import { useI18n } from "@/lib/i18n-context"
import { Mail, Globe } from "lucide-react"
import GithubIcon from "@/components/icons/github"
import TwitterIcon from "@/components/icons/twitter"

export default function AboutPage() {
  const { t } = useI18n()
  const name = t("hero.name")
  const introduce = t("about.content")
  const username = "caitria"

  return (
    <main className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 pb-12">
      <h1 className="mb-8 text-2xl font-bold tracking-tight text-foreground">
        {t("about.title")}
      </h1>

      <div className="glass-card-static p-6 md:p-8">
        {/* Avatar & Name */}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary ring-2 ring-primary/20">
            <img src="/avatar.png" alt="Avatar" className="h-full w-full rounded-full object-cover" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{name}</h2>
            <p className="text-sm text-muted-foreground">
              @balancetheworld
            </p>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-6 border-t border-border pt-6">
          <p className="text-sm leading-relaxed text-foreground/95">
            你好👋，这里是 Caitria
          </p>
          <p className="text-sm leading-relaxed text-foreground/95">
            重庆邮电大学软件工程专业24级学生，正在努力成为厉害的前端工程师。<br/>
            2005年12月14号出生的射手座<br/>
            是非常纯血的ENTJ<br/>
            喜欢画画，打羽毛球，桌游，以及switch游戏（尤其是塞尔达）,喜欢猫猫，喜欢收集好看的明信片
          </p>
        </div>

        {/* Social Links */}
        <div className="mt-6 flex items-center gap-3 border-t border-border pt-6">
          <a
            href="https://github.com/balancetheworld"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <GithubIcon className="h-4 w-4" />
            GitHub
          </a>
          <a
            href="https://x.com/Caitria1123"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <TwitterIcon className="h-4 w-4" />
            Twitter
          </a>
          <a
            href="mailto:2539888062@qq.com"
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Mail className="h-4 w-4" />
            Email
          </a>
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
