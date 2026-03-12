'use client'

import { useTranslations, useLocale } from 'next-intl'
import useSWR from 'swr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Clock, DollarSign, Users } from 'lucide-react'
import Link from 'next/link'

interface Service {
  _id: string
  name: { th: string; en: string }
  description: { th: string; en: string }
  price: number
  duration: number
  category: string
  isActive: boolean
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function ServicesPage() {
  const t = useTranslations('services')
  const locale = useLocale() as 'th' | 'en'
  const { data: services, isLoading } = useSWR<Service[]>('/api/services', fetcher)

  const activeServices = services?.filter((s) => s.isActive) || []

  const categoryLabels: Record<string, { th: string; en: string }> = {
    daily: { th: 'ดูแลรายวัน', en: 'Daily Care' },
    medical: { th: 'ดูแลทางการแพทย์', en: 'Medical Care' },
    physical: { th: 'กายภาพบำบัด', en: 'Physical Therapy' },
    companion: { th: 'เพื่อนคู่ใจ', en: 'Companion' },
    general: { th: 'บริการทั่วไป', en: 'General Services' },
  }

  const groupedServices = activeServices.reduce(
    (acc, service) => {
      const cat = service.category || 'general'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(service)
      return acc
    },
    {} as Record<string, Service[]>
  )

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              {t('title')}
            </h1>
            <p className="text-lg text-muted-foreground">{t('subtitle')}</p>
          </div>
        </div>
      </section>

      {/* Services List */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner className="h-8 w-8" />
            </div>
          ) : activeServices.length === 0 ? (
            <div className="py-20 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                {locale === 'th' ? 'ยังไม่มีบริการในขณะนี้' : 'No services available at the moment'}
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {Object.entries(groupedServices).map(([category, categoryServices]) => (
                <div key={category}>
                  <h2 className="mb-6 text-2xl font-semibold text-foreground">
                    {categoryLabels[category]?.[locale] || category}
                  </h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {categoryServices.map((service) => (
                      <Card
                        key={service._id}
                        className="group transition-all hover:shadow-lg hover:shadow-primary/5"
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-xl">{service.name[locale]}</CardTitle>
                            <Badge variant="secondary" className="bg-primary/10 text-primary">
                              {categoryLabels[service.category]?.[locale] || service.category}
                            </Badge>
                          </div>
                          <CardDescription className="line-clamp-2">
                            {service.description[locale]}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              <span>
                                {service.price.toLocaleString()} {locale === 'th' ? 'บาท' : 'THB'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                {service.duration} {locale === 'th' ? 'ชั่วโมง' : 'hours'}
                              </span>
                            </div>
                          </div>
                          <Button asChild className="w-full">
                            <Link href={`/booking?service=${service._id}`}>{t('bookNow')}</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold text-foreground">
            {locale === 'th' ? 'ไม่แน่ใจว่าบริการไหนเหมาะกับคุณ?' : 'Not sure which service is right for you?'}
          </h2>
          <p className="mb-6 text-muted-foreground">
            {locale === 'th'
              ? 'ติดต่อเราเพื่อรับคำปรึกษาฟรี ทีมงานของเราพร้อมช่วยเหลือคุณ'
              : 'Contact us for a free consultation. Our team is ready to help you.'}
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/contact">
              {locale === 'th' ? 'ติดต่อเรา' : 'Contact Us'}
            </Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
