'use client'

import { useTranslations } from 'next-intl'
import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Users, UserCog, TrendingUp } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AdminDashboard() {
  const t = useTranslations('admin')
  const { data: stats, isLoading } = useSWR('/api/stats', fetcher)

  const statCards = [
    {
      title: t('stats.totalBookings'),
      value: stats?.totalBookings ?? 0,
      icon: Calendar,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: t('stats.pendingBookings'),
      value: stats?.pendingBookings ?? 0,
      icon: TrendingUp,
      color: 'text-secondary',
      bgColor: 'bg-secondary/20',
    },
    {
      title: t('stats.totalCustomers'),
      value: stats?.totalCustomers ?? 0,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: t('stats.totalEmployees'),
      value: stats?.totalEmployees ?? 0,
      icon: UserCog,
      color: 'text-secondary',
      bgColor: 'bg-secondary/20',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t('dashboard')}</h1>
        <p className="text-muted-foreground">
          {new Date().toLocaleDateString('th-TH', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>การจองล่าสุด</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentBookings />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>บริการยอดนิยม</CardTitle>
          </CardHeader>
          <CardContent>
            <PopularServices />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function RecentBookings() {
  const { data: bookings, isLoading } = useSWR('/api/bookings?limit=5', fetcher)

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (!bookings || bookings.length === 0) {
    return <p className="text-muted-foreground">ยังไม่มีการจอง</p>
  }

  return (
    <div className="space-y-3">
      {bookings.slice(0, 5).map((booking: {
        _id: string
        customerId?: { name: string }
        serviceId?: { name: { th: string } }
        status: string
        date: string
      }) => (
        <div
          key={booking._id}
          className="flex items-center justify-between rounded-lg border p-3"
        >
          <div>
            <p className="font-medium">{booking.customerId?.name || 'N/A'}</p>
            <p className="text-sm text-muted-foreground">
              {booking.serviceId?.name?.th || 'N/A'}
            </p>
          </div>
          <div className="text-right">
            <StatusBadge status={booking.status} />
            <p className="text-xs text-muted-foreground">
              {new Date(booking.date).toLocaleDateString('th-TH')}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

function PopularServices() {
  const { data: services, isLoading } = useSWR('/api/services?active=true', fetcher)

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (!services || services.length === 0) {
    return <p className="text-muted-foreground">ยังไม่มีบริการ</p>
  }

  return (
    <div className="space-y-3">
      {services.slice(0, 4).map((service: {
        _id: string
        name: { th: string }
        price: number
        isActive: boolean
      }) => (
        <div
          key={service._id}
          className="flex items-center justify-between rounded-lg border p-3"
        >
          <div>
            <p className="font-medium">{service.name.th}</p>
            <p className="text-sm text-muted-foreground">
              {service.price.toLocaleString()} บาท
            </p>
          </div>
          <div
            className={`rounded-full px-2 py-1 text-xs ${
              service.isActive
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
            }`}
          >
            {service.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
          </div>
        </div>
      ))}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'in-progress': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }

  const statusLabels: Record<string, string> = {
    pending: 'รอดำเนินการ',
    confirmed: 'ยืนยันแล้ว',
    'in-progress': 'กำลังดำเนินการ',
    completed: 'เสร็จสิ้น',
    cancelled: 'ยกเลิก',
  }

  return (
    <span className={`rounded-full px-2 py-1 text-xs ${statusColors[status] || ''}`}>
      {statusLabels[status] || status}
    </span>
  )
}
