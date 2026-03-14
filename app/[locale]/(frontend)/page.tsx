'use client'

import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/routing'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Heart,
  Shield,
  Clock,
  Users,
  // Clock kept for Features section
  Star,
  ArrowRight,
  CheckCircle,
} from 'lucide-react'
import { useEffect } from 'react'
import { ReviewCarousel } from '@/components/frontend/review-carousel'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function HomePage() {
  const t = useTranslations('hero')
  const tServices = useTranslations('services')
  const locale = useLocale()

  const { data: bookingCount } = useSWR<{ total: number }>('/api/bookings/count', fetcher)
  const { data: reviews } = useSWR<{ rating: number }[]>('/api/reviews', fetcher)
  const { data: employees } = useSWR<{ isAvailable: boolean }[]>('/api/employees?available=true', fetcher)

  const avgRating = reviews?.length
    ? parseFloat((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)).toString()
    : null

  // Seed data on first load
  useEffect(() => {
    fetch('/api/seed', { method: 'POST' })
  }, [])

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8">
              <div className="inline-flex items-center rounded-full border bg-card px-4 py-2 text-sm">
                <Heart className="mr-2 h-4 w-4 text-secondary" />
                <span className="text-muted-foreground">{t('subtitle')}</span>
              </div>

              <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground lg:text-6xl">
                {t('title')}
              </h1>

              <p className="text-pretty text-lg text-muted-foreground lg:text-xl">
                {t('description')}
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/booking">
                    {t('cta')}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/services">{t('learnMore')}</Link>
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">บริการ 24 ชั่วโมง</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">ทีมงานมืออาชีพ</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">ราคาเป็นธรรม</span>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute -top-4 -right-4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute -bottom-4 -left-4 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />
              <div className="relative grid grid-cols-2 gap-4">
                <Card className="col-span-2 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                        <Users className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold">
                          {bookingCount ? bookingCount.total.toLocaleString() : '—'}
                        </p>
                        <p className="text-sm opacity-90">
                          {locale === 'th' ? 'ยอดการจองทั้งหมด' : 'Total Bookings'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/20">
                      <Star className="h-6 w-6 text-secondary" />
                    </div>
                    <p className="mt-3 text-2xl font-bold">{avgRating ? `${avgRating}/5` : '—'}</p>
                    <p className="text-sm text-muted-foreground">คะแนนรีวิว</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <p className="mt-3 text-2xl font-bold">
                      {employees ? employees.length : '—'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {locale === 'th' ? 'พนักงานพร้อมทำงาน' : 'Available Staff'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground lg:text-4xl">
            ทำไมต้องเลือกเรา
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            เราให้บริการดูแลผู้สูงอายุด้วยมาตรฐานระดับสากล
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Heart,
              title: 'ดูแลด้วยใจ',
              description: 'ทีมงานที่มีความเอาใจใส่และใส่ใจในทุกรายละเอียด',
              color: 'text-secondary bg-secondary/10',
            },
            {
              icon: Shield,
              title: 'ปลอดภัย',
              description: 'มาตรฐานความปลอดภัยระดับสูง ผ่านการรับรอง',
              color: 'text-primary bg-primary/10',
            },
            {
              icon: Clock,
              title: '24/7',
              description: 'พร้อมให้บริการตลอด 24 ชั่วโมง ทุกวัน',
              color: 'text-secondary bg-secondary/10',
            },
            {
              icon: Users,
              title: 'ทีมมืออาชีพ',
              description: 'พยาบาลและผู้ดูแลที่ผ่านการฝึกอบรมอย่างเข้มข้น',
              color: 'text-primary bg-primary/10',
            },
          ].map((feature, index) => (
            <Card key={index} className="text-center">
              <CardContent >
                <div
                  className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${feature.color}`}
                >
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground lg:text-4xl">
                {tServices('title')}
              </h2>
              <p className="mt-2 text-muted-foreground">{tServices('subtitle')}</p>
            </div>
            <Button asChild variant="outline" className="hidden sm:flex">
              <Link href="/services">{tServices('viewAll')}</Link>
            </Button>
          </div>

          <ServicesGrid locale={locale} />

          <div className="mt-8 text-center sm:hidden">
            <Button asChild variant="outline">
              <Link href="/services">{tServices('viewAll')}</Link>
            </Button>
          </div>
        </div>
      </section>

      <ReviewCarousel />

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="overflow-hidden bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <CardContent className="p-8 lg:p-12">
            <div className="grid items-center gap-8 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold lg:text-4xl">
                  พร้อมให้บริการดูแลคนที่คุณรัก
                </h2>
                <p className="mt-4 text-primary-foreground/90">
                  ติดต่อเราวันนี้เพื่อรับคำปรึกษาฟรี และให้เราช่วยดูแลผู้สูงอายุในครอบครัวของคุณ
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row lg:justify-end">
                <Button asChild size="lg" variant="secondary">
                  <Link href="/booking">{t('cta')}</Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/contact">ติดต่อเรา</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function ServicesGrid({ locale }: { locale: string }) {
  const tServices = useTranslations('services')
  const { data: services, isLoading } = useSWR('/api/services?active=true', fetcher)

  if (isLoading) {
    return (
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {services?.slice(0, 4).map((service: {
        _id: string
        name: { th: string; en: string }
        description: { th: string; en: string }
        price: number
        duration: string
      }) => (
        <Card key={service._id} className="flex h-full flex-col group transition-shadow hover:shadow-lg">
          <CardHeader className="flex-1">
            <CardTitle className="text-lg">
              {locale === 'th' ? service.name.th : service.name.en}
            </CardTitle>
            <CardDescription className="line-clamp-2">
              {locale === 'th' ? service.description.th : service.description.en}
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-primary">
                {service.price.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">บาท/{service.duration}</span>
            </div>
            <Button asChild className="mt-4 w-full" variant="outline">
              <Link href={`/booking?service=${service._id}`}>
                {tServices('bookNow')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
