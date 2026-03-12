'use client'

import { useState, useEffect, Suspense } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react'

interface BookingDetails {
  _id: string
  trackingCode: string
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled'
  date: string
  time: string
  formData: {
    address: string
    [key: string]: any
  }
  notes?: string
  customerId: {
    name: string
    phone: string
    email?: string
  }
  serviceId: {
    name: { th: string; en: string }
    description: { th: string; en: string }
    duration: number
    price: number
  }
  employeeId?: {
    name: string
    phone: string
  }
  createdAt: string
}

const statusConfig = {
  pending: {
    label: { th: 'รอยืนยัน', en: 'Pending' },
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    icon: AlertCircle,
  },
  confirmed: {
    label: { th: 'ยืนยันแล้ว', en: 'Confirmed' },
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    icon: CheckCircle,
  },
  'in-progress': {
    label: { th: 'กำลังดำเนินการ', en: 'In Progress' },
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    icon: Loader2,
  },
  completed: {
    label: { th: 'เสร็จสิ้น', en: 'Completed' },
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    icon: CheckCircle,
  },
  cancelled: {
    label: { th: 'ยกเลิก', en: 'Cancelled' },
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    icon: XCircle,
  },
}

export default function TrackingPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    }>
      <TrackingContent />
    </Suspense>
  )
}

function TrackingContent() {
  const t = useTranslations('tracking')
  const locale = useLocale() as 'th' | 'en'
  const searchParams = useSearchParams()
  const codeFromUrl = searchParams.get('code')

  const [trackingCode, setTrackingCode] = useState(codeFromUrl || '')
  const [searchCode, setSearchCode] = useState(codeFromUrl || '')
  const [hasSearched, setHasSearched] = useState(!!codeFromUrl)

  const fetcher = (url: string) => fetch(url).then((res) => res.json())

  const { data: bookings, error: swrError, isLoading } = useSWR<BookingDetails[]>(
    hasSearched && searchCode ? `/api/bookings?trackingCode=${searchCode}` : null,
    fetcher,
    { refreshInterval: 5000 } // Poll every 5 seconds for status updates
  )

  const booking = bookings && bookings.length > 0 ? bookings[0] : null
  const error = swrError ? (locale === 'th' ? 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' : 'An error occurred. Please try again.') :
    (hasSearched && !isLoading && !booking) ? (locale === 'th' ? 'ไม่พบข้อมูลการจอง' : 'Booking not found') : ''

  useEffect(() => {
    if (codeFromUrl) {
      setSearchCode(codeFromUrl)
      setHasSearched(true)
    }
  }, [codeFromUrl])

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!trackingCode.trim()) return

    setSearchCode(trackingCode)
    setHasSearched(true)
  }

  const StatusIcon = booking ? statusConfig[booking.status].icon : AlertCircle

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground">{t('title')}</h1>
            <p className="text-lg text-muted-foreground">{t('subtitle')}</p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Card className="mx-auto max-w-xl">
            <CardHeader>
              <CardTitle>{locale === 'th' ? 'ค้นหาการจอง' : 'Search Booking'}</CardTitle>
              <CardDescription>
                {locale === 'th'
                  ? 'กรอกรหัสติดตามที่ได้รับหลังจากทำการจอง'
                  : 'Enter the tracking code you received after booking'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSearch}
                className="flex gap-2"
              >
                <div className="flex-1">
                  <Label htmlFor="trackingCode" className="sr-only">
                    {t('trackingCode')}
                  </Label>
                  <Input
                    id="trackingCode"
                    placeholder={locale === 'th' ? 'เช่น BK-ABC123' : 'e.g., BK-ABC123'}
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                  />
                </div>
                <Button type="submit" disabled={isLoading || !trackingCode.trim()}>
                  {isLoading ? <Spinner className="h-4 w-4" /> : <Search className="h-4 w-4" />}
                  <span className="ml-2">{t('search')}</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Results Section */}
      {hasSearched && (
        <section className="pb-16">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner className="h-8 w-8" />
              </div>
            ) : error ? (
              <Card className="mx-auto max-w-xl">
                <CardContent className="py-12 text-center">
                  <XCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">{error}</p>
                </CardContent>
              </Card>
            ) : booking ? (
              <div className="mx-auto max-w-3xl space-y-6">
                {/* Status Card */}
                <Card>
                  <CardContent >
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full ${statusConfig[booking.status].color}`}
                        >
                          <StatusIcon className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {locale === 'th' ? 'รหัสติดตาม' : 'Tracking Code'}
                          </p>
                          <p className="text-xl font-bold">{booking.trackingCode}</p>
                        </div>
                      </div>
                      <Badge className={statusConfig[booking.status].color}>
                        {statusConfig[booking.status].label[locale]}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Details Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Service Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {locale === 'th' ? 'รายละเอียดบริการ' : 'Service Details'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="font-medium">{booking.serviceId.name[locale]}</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.serviceId.description[locale]}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {booking.serviceId.duration} {locale === 'th' ? 'ชั่วโมง' : 'hours'}
                        </span>
                      </div>
                      <div className="border-t pt-4">
                        <p className="text-sm text-muted-foreground">
                          {locale === 'th' ? 'ราคารวม' : 'Total Price'}
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          {(booking.serviceId?.price || 0).toLocaleString()} {locale === 'th' ? 'บาท' : 'THB'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Schedule & Location */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {locale === 'th' ? 'วันเวลาและสถานที่' : 'Schedule & Location'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Calendar className="mt-0.5 h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">
                            {new Date(booking.date).toLocaleDateString(
                              locale === 'th' ? 'th-TH' : 'en-US',
                              {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              }
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {booking.time || new Date(booking.date).toLocaleTimeString(
                              locale === 'th' ? 'th-TH' : 'en-US',
                              {
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="mt-0.5 h-5 w-5 text-secondary-foreground" />
                        <p className="text-sm">{booking.formData?.address || (locale === 'th' ? 'ไม่มีข้อมูลที่อยู่' : 'No address provided')}</p>
                      </div>
                      {booking.notes && (
                        <div className="rounded-lg bg-muted p-3">
                          <p className="text-sm font-medium">
                            {locale === 'th' ? 'หมายเหตุ' : 'Notes'}
                          </p>
                          <p className="text-sm text-muted-foreground">{booking.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Customer Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {locale === 'th' ? 'ข้อมูลผู้จอง' : 'Customer Information'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <span>{booking.customerId.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <span>{booking.customerId.phone}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Employee Info */}
                  {booking.employeeId && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {locale === 'th' ? 'พนักงานผู้ดูแล' : 'Assigned Caregiver'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-muted-foreground" />
                          <span>{booking.employeeId.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-muted-foreground" />
                          <span>{booking.employeeId.phone}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Help Section */}
                <Card className="bg-primary/5">
                  <CardContent className="flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
                    <div>
                      <h3 className="font-semibold">
                        {locale === 'th' ? 'มีคำถามเกี่ยวกับการจอง?' : 'Questions about your booking?'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {locale === 'th' ? 'ติดต่อเราได้ทุกวัน 8:00 - 20:00 น.' : 'Contact us daily 8:00 AM - 8:00 PM'}
                      </p>
                    </div>
                    <Button variant="secondary">
                      <Phone className="mr-2 h-4 w-4" />
                      02-XXX-XXXX
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </div>
        </section>
      )}
    </main>
  )
}
