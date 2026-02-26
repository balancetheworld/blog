"use client"

import { useI18n } from "@/lib/i18n-context"

export function BlogFooter() {
  const { t } = useI18n()
  const year = new Date().getFullYear()

  return (
    <footer className="pb-24 pt-12 md:pb-12">
      <div className="mx-auto max-w-2xl px-6">
        <div className="border-t border-border pt-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-xs text-muted-foreground">
              {"© "}{year}{" "}{t("hero.name")}{" · "}{t("footer.copyright")}
            </p>
            <p className="text-xs text-muted-foreground/60">
              {t("footer.powered")}{" "}
              <span className="text-muted-foreground">Next.js</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
