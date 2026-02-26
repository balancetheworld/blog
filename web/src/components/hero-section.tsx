"use client"

import { useI18n } from "@/lib/i18n-context"

export function HeroSection() {
  const { t } = useI18n()

  return (
    <section className="pb-10 pt-16">
      <p className="text-sm text-muted-foreground">{t("hero.greeting")}</p>
      <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-foreground">
        {t("hero.name")}
      </h1>
      <p className="mt-3 max-w-lg text-base leading-relaxed text-muted-foreground">
        {t("hero.tagline")}
      </p>
    </section>
  )
}
