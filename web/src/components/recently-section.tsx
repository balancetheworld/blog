"use client"

import { useState } from "react"
import useSWR from "swr"
import { MessageCircle } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"
import { SectionHeader } from "./section-header"
import { ImageLightbox } from "./image-lightbox"
import { fetcher } from "@/lib/fetcher"

interface RecentlyImage {
  id: number
  recently_id: number
  image_url: string
  sort_order: number
}

interface RecentlyItem {
  id: number
  content: string
  image_url?: string | null
  created_at: string
  images?: RecentlyImage[]
}

export function RecentlySection() {
  const { locale, t } = useI18n()
  const { data, isLoading } = useSWR("/api/recently", fetcher)
  const items: RecentlyItem[] = data?.data || []

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImages, setLightboxImages] = useState<string[]>([])
  const [lightboxInitialIndex, setLightboxInitialIndex] = useState(0)

  const openLightbox = (images: string[], index: number = 0) => {
    setLightboxImages(images)
    setLightboxInitialIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  // Get all images for an item
  const getItemImages = (item: RecentlyItem): string[] => {
    const images: string[] = []
    if (item.images && item.images.length > 0) {
      images.push(...item.images.map((img) => img.image_url))
    }
    if (item.image_url && !images.includes(item.image_url)) {
      images.push(item.image_url)
    }
    return images
  }

  return (
    <>
      <section className="glass-card p-5">
        <SectionHeader
          title={t("section.recently")}
          icon={MessageCircle}
          linkText={t("section.recently.viewAll")}
          linkHref="/recently"
        />
        <div className="mt-4 flex flex-col gap-3">
          {isLoading && (
            <div className="flex flex-col gap-3 py-2">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse rounded-lg border border-border p-3">
                  <div className="h-3 w-full rounded bg-muted" />
                  <div className="mt-2 h-3 w-16 rounded bg-muted" />
                </div>
              ))}
            </div>
          )}
          {items.slice(0, 4).map((item) => {
            const itemImages = getItemImages(item)

            return (
              <div
                key={item.id}
                className="rounded-lg border border-border/60 bg-background/50 p-3.5 transition-colors hover:border-border"
              >
                {itemImages.length > 0 && (
                  <div className="mb-2.5">
                    {itemImages.length === 1 ? (
                      <div
                        className="overflow-hidden rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => openLightbox(itemImages, 0)}
                      >
                        <img
                          src={itemImages[0]}
                          alt=""
                          className="w-full object-cover aspect-square max-h-32 rounded-md"
                        />
                      </div>
                    ) : (
                      <div
                        className="grid grid-cols-3 gap-1 cursor-pointer"
                        onClick={() => openLightbox(itemImages, 0)}
                      >
                        <div className="aspect-square overflow-hidden rounded-md">
                          <img
                            src={itemImages[0]}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="aspect-square overflow-hidden rounded-md">
                          <img
                            src={itemImages[1] || itemImages[0]}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="aspect-square overflow-hidden rounded-md relative">
                          {itemImages.length > 2 ? (
                            <>
                              <img
                                src={itemImages[2]}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                              {itemImages.length > 3 && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                  <span className="text-white text-sm font-medium">
                                    +{itemImages.length - 2}
                                  </span>
                                </div>
                              )}
                            </>
                          ) : (
                            <img
                              src={itemImages[2] || itemImages[0]}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <p className="text-[15px] font-medium leading-relaxed text-foreground/95">
                  {item.content}
                </p>
                <time className="mt-2 block text-xs text-muted-foreground">
                  {new Date(item.created_at).toLocaleDateString(
                    locale === "zh" ? "zh-CN" : "en-US",
                    { year: "numeric", month: "short", day: "numeric" }
                  )}
                </time>
              </div>
            )
          })}
        </div>
      </section>

      {/* Lightbox */}
      <ImageLightbox
        images={lightboxImages}
        initialIndex={lightboxInitialIndex}
        isOpen={lightboxOpen}
        onClose={closeLightbox}
      />
    </>
  )
}
