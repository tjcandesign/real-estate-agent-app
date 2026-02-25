'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'

interface GalleryImage {
  _key?: string
  asset?: { _ref: string }
  alt?: string
  caption?: string
}

interface Props {
  images: GalleryImage[]
  title: string
}

export default function GalleryLightbox({ images, title }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const touchStartX = useRef<number | null>(null)
  const isOpen = activeIndex !== null

  const open = (i: number) => setActiveIndex(i)
  const close = () => setActiveIndex(null)

  const prev = useCallback(() => {
    setActiveIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length))
  }, [images.length])

  const next = useCallback(() => {
    setActiveIndex((i) => (i === null ? null : (i + 1) % images.length))
  }, [images.length])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, prev, next])

  // Lock body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Touch swipe handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev()
    touchStartX.current = null
  }

  return (
    <>
      {/* ── Gallery grid ─────────────────────────────────────────── */}
      <section className="pb-24 space-y-2 md:space-y-3">
        {Array.from({ length: Math.ceil(images.length / 3) }).map((_, groupIndex) => {
          const [full, left, right] = images.slice(groupIndex * 3, groupIndex * 3 + 3)
          const fullIdx = groupIndex * 3
          const leftIdx = groupIndex * 3 + 1
          const rightIdx = groupIndex * 3 + 2

          return (
            <div key={groupIndex} className="space-y-2 md:space-y-3">
              {/* Full-width image */}
              {full && (
                <button
                  onClick={() => open(fullIdx)}
                  className="relative w-full aspect-[16/9] bg-stone-200 overflow-hidden block group cursor-zoom-in"
                  aria-label={`View ${full.alt || `${title} image ${fullIdx + 1}`} full screen`}
                >
                  <Image
                    src={urlFor(full).width(2400).height(1350).url()}
                    alt={full.alt || `${title} — image ${fullIdx + 1}`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    sizes="100vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  {full.caption && (
                    <p className="absolute bottom-3 right-4 text-xs text-white/60">{full.caption}</p>
                  )}
                </button>
              )}

              {/* Half-width pair */}
              {(left || right) && (
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  {left && (
                    <button
                      onClick={() => open(leftIdx)}
                      className="relative aspect-[4/3] bg-stone-200 overflow-hidden group cursor-zoom-in"
                      aria-label={`View ${left.alt || `${title} image ${leftIdx + 1}`} full screen`}
                    >
                      <Image
                        src={urlFor(left).width(1200).height(900).url()}
                        alt={left.alt || `${title} — image ${leftIdx + 1}`}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                        sizes="50vw"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                      {left.caption && (
                        <p className="absolute bottom-3 right-3 text-xs text-white/60">{left.caption}</p>
                      )}
                    </button>
                  )}
                  {right && (
                    <button
                      onClick={() => open(rightIdx)}
                      className="relative aspect-[4/3] bg-stone-200 overflow-hidden group cursor-zoom-in"
                      aria-label={`View ${right.alt || `${title} image ${rightIdx + 1}`} full screen`}
                    >
                      <Image
                        src={urlFor(right).width(1200).height(900).url()}
                        alt={right.alt || `${title} — image ${rightIdx + 1}`}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                        sizes="50vw"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                      {right.caption && (
                        <p className="absolute bottom-3 right-3 text-xs text-white/60">{right.caption}</p>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </section>

      {/* ── Lightbox overlay ─────────────────────────────────────── */}
      {isOpen && activeIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/96 flex items-center justify-center"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
        >
          {/* Close */}
          <button
            onClick={close}
            className="absolute top-5 right-5 text-white/60 hover:text-white transition-colors p-2 z-10"
            aria-label="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Counter */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 text-xs tracking-widest text-white/40 select-none">
            {activeIndex + 1} / {images.length}
          </div>

          {/* Image */}
          <div
            className="relative w-full h-full px-16 py-16"
            onClick={close}
          >
            <div
              className="relative w-full h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                key={activeIndex}
                src={urlFor(images[activeIndex]).width(2400).height(1600).url()}
                alt={images[activeIndex]?.alt || `${title} — image ${activeIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
            {/* Caption */}
            {images[activeIndex]?.caption && (
              <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-white/40 tracking-wide">
                {images[activeIndex].caption}
              </p>
            )}
          </div>

          {/* Prev button */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev() }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-3"
              aria-label="Previous image"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          {/* Next button */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next() }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-3"
              aria-label="Next image"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}

          {/* Keyboard hint — fades in briefly */}
          <p className="absolute bottom-5 right-5 text-xs text-white/20 tracking-widest hidden md:block select-none">
            ← → to navigate · esc to close
          </p>
        </div>
      )}
    </>
  )
}
