'use client'

import { useRef, useState } from 'react'
import useSWR from 'swr'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Star, ChevronLeft, ChevronRight, Quote, Pencil } from 'lucide-react'
import { useLocale } from 'next-intl'
import { Link } from '@/i18n/routing'

interface Review {
  _id: string
  customerName: string
  rating: number
  comment: string
  createdAt: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-4 w-4 ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/25'}`}
        />
      ))}
    </div>
  )
}

export function ReviewCarousel() {
  const locale = useLocale()
  const { data: reviews } = useSWR<Review[]>('/api/reviews', fetcher)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  if (!reviews?.length) return null

  function updateScrollState() {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  function scroll(dir: 'left' | 'right') {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' })
    setTimeout(updateScrollState, 350)
  }

  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length

  return (
    <section className="bg-muted/50 py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground lg:text-4xl">
              {locale === 'th' ? 'รีวิวจากลูกค้า' : 'Customer Reviews'}
            </h2>
            <div className="mt-2 flex items-center gap-2">
              <StarDisplay rating={Math.round(avgRating)} />
              <span className="text-sm text-muted-foreground">
                {avgRating.toFixed(1)} {locale === 'th' ? `จาก ${reviews.length} รีวิว` : `from ${reviews.length} reviews`}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="hidden sm:flex gap-1.5">
              <Link href="/reviews">
                <Pencil className="h-3.5 w-3.5" />
                {locale === 'th' ? 'เขียนรีวิว' : 'Write a Review'}
              </Link>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="mt-8 flex gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {reviews.map((review) => (
            <Card
              key={review._id}
              className="w-72 shrink-0 transition-shadow hover:shadow-lg hover:shadow-primary/5 md:w-80"
            >
              <CardContent className="p-6">
                <Quote className="h-7 w-7 text-primary/20 mb-3" />
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                  {review.comment}
                </p>
                <div className="mt-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{review.customerName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(review.createdAt).toLocaleDateString(
                        locale === 'th' ? 'th-TH' : 'en-US',
                        { year: 'numeric', month: 'short', day: 'numeric' }
                      )}
                    </p>
                  </div>
                  <StarDisplay rating={review.rating} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
