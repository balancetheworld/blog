"use client"

import { useState } from "react"
import useSWR from "swr"
import { useI18n } from "@/lib/i18n-context"
import { fetcher } from "@/lib/fetcher"
import { ImageLightbox } from "@/components/image-lightbox"

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

export default function RecentlyPage() {
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

  // Get all images for an item (both legacy image_url and new images array)
  const getItemImages = (item: RecentlyItem): string[] => {
    const images: string[] = []
    // Add new images first (in sort order)
    if (item.images && item.images.length > 0) {
      images.push(...item.images.map((img) => img.image_url))
    }
    // Add legacy image_url if not already included
    if (item.image_url && !images.includes(item.image_url)) {
      images.push(item.image_url)
    }
    return images
  }

  return (
    <main className="mx-auto max-w-2xl px-6 pb-12">
      <h1 className="mb-8 text-2xl font-bold tracking-tight text-foreground">
        {t("section.recently")}
      </h1>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />

        <div className="flex flex-col gap-6">
          {isLoading && (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse pl-9">
                  <div className="glass-card-static p-4">
                    <div className="h-4 w-full rounded bg-muted" />
                    <div className="mt-2 h-3 w-24 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </>
          )}
          {items.map((item) => {
            const itemImages = getItemImages(item)

            return (
              <div key={item.id} className="relative pl-9">
                {/* Timeline dot */}
                <div className="absolute left-1.5 top-4 h-3 w-3 rounded-full border-2 border-primary bg-background" />

                <div className="glass-card p-4 transition-all hover:shadow-md overflow-hidden">
                  {/* Images grid */}
                  {itemImages.length > 0 && (
                    <div className="mb-3 -mx-1 -mt-1">
                      {itemImages.length === 1 ? (
                        // Single image - full width
                        <div
                          className="overflow-hidden rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => openLightbox(itemImages, 0)}
                        >
                          <img
                            src={itemImages[0]}
                            alt=""
                            className="w-full object-cover aspect-auto max-h-64"
                          />
                        </div>
                      ) : (
                        // Multiple images - square grid
                        <div
                          className={`grid gap-1 ${
                            itemImages.length === 2
                              ? "grid-cols-2"
                              : itemImages.length === 3
                                ? "grid-cols-3"
                                : "grid-cols-2"
                          }`}
                        >
                          {itemImages.map((img, index) => (
                            <div
                              key={index}
                              className="aspect-square overflow-hidden rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => openLightbox(itemImages, index)}
                            >
                              <img
                                src={img}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <p className="text-[15px] font-medium leading-relaxed text-foreground/95 whitespace-pre-wrap">
                    {item.content}
                  </p>

                  {/* Timestamp */}
                  <time className="mt-2 block text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString(
                      locale === "zh" ? "zh-CN" : "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </time>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Lightbox */}
      <ImageLightbox
        images={lightboxImages}
        initialIndex={lightboxInitialIndex}
        isOpen={lightboxOpen}
        onClose={closeLightbox}
      />
    </main>
  )
}
