'use client'

import { useState, useEffect, Suspense } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select' // used for service selection
import { Spinner } from '@/components/ui/spinner'
import { Calendar, CheckCircle, Clock, User, UserCircle, ChevronRight, X, ZoomIn, CheckCircle2, ChevronLeft } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Service {
  _id: string
  name: { th: string; en: string }
  description: { th: string; en: string }
  price: number
  duration: number
  isActive?: boolean
}

interface Employee {
  _id: string
  name: string
  role: string
  image: string
  specialization: string[]
  isAvailable?: boolean
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    }>
      <BookingForm />
    </Suspense>
  )
}

function BookingForm() {
  const t = useTranslations('booking')
  const locale = useLocale() as 'th' | 'en'
  const searchParams = useSearchParams()
  const preselectedService = searchParams.get('service')

  const { data: services, isLoading: servicesLoading } = useSWR<Service[]>('/api/services', fetcher)
  const { data: employees, isLoading: employeesLoading } = useSWR<Employee[]>('/api/employees', fetcher)

  const availableEmployees = employees?.filter((e) => e.isAvailable !== false) || []
  const activeServices = services?.filter((s) => s.isActive !== false) || []

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    serviceId: preselectedService || '',
    employeeId: '',
    scheduledDate: '',
    scheduledTime: '',
    address: '',
    notes: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [bookingId, setBookingId] = useState('')
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [showEmployeeModal, setShowEmployeeModal] = useState(false)
  const [zoomImage, setZoomImage] = useState<string | null>(null)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [customTime, setCustomTime] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date(); d.setDate(1); return d
  })

  const { toast } = useToast()

  useEffect(() => {
    if (preselectedService) {
      setFormData((prev) => ({ ...prev, serviceId: preselectedService }))
    }
  }, [preselectedService])

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '').substring(0, 10)

    // Format as 0XX-XXX-XXXX
    let formatted = digits
    if (digits.length > 3 && digits.length <= 6) {
      formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`
    } else if (digits.length > 6) {
      formatted = `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
    }
    return formatted
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    if (!formData.customerName.trim()) newErrors.customerName = locale === 'th' ? 'กรุณากรอกชื่อ-นามสกุล' : 'Name is required'
    if (!formData.customerPhone.trim()) newErrors.customerPhone = locale === 'th' ? 'กรุณากรอกเบอร์โทรศัพท์' : 'Phone is required'
    if (!formData.address.trim()) newErrors.address = locale === 'th' ? 'กรุณากรอกสถานที่รับบริการ' : 'Address is required'
    if (!formData.serviceId) newErrors.serviceId = locale === 'th' ? 'กรุณาเลือกบริการ' : 'Service is required'
    if (!formData.scheduledDate) newErrors.scheduledDate = locale === 'th' ? 'กรุณาเลือกวันที่' : 'Date is required'
    if (!formData.scheduledTime) newErrors.scheduledTime = locale === 'th' ? 'กรุณาเลือกเวลา' : 'Time is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const selectedService = services?.find((s) => s._id === formData.serviceId)
  const selectedEmployee = availableEmployees.find((e) => e._id === formData.employeeId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsSubmitting(true)

    try {
      // First, create or find customer
      const customerRes = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.customerName,
          phone: formData.customerPhone,
          email: formData.customerEmail,
          address: formData.address,
        }),
      })

      const customerData = await customerRes.json()

      // If customer creation fails (e.g. email exists), we might need to handle it.
      // For now, let's assume if it fails it might return the error or we might need to fetch the existing one.
      // But based on current API, if it fails, customerData._id will be missing.

      if (!customerRes.ok && !customerData._id) {
        throw new Error(customerData.error || 'Failed to process customer information')
      }

      // Then create booking
      const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`)
      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customerData._id,
          serviceId: formData.serviceId,
          employeeId: formData.employeeId || undefined,
          scheduledDate: scheduledDateTime.toISOString(),
          address: formData.address,
          notes: formData.notes,
        }),
      })

      const bookingData = await bookingRes.json()

      if (!bookingRes.ok) {
        throw new Error(bookingData.error || 'Failed to create booking')
      }

      console.log('Booking successful:', bookingData)

      if (bookingData.trackingCode) {
        setBookingId(bookingData.trackingCode)
        setIsSuccess(true)
      } else {
        throw new Error('Tracking code was not generated. Please contact support.')
      }
    } catch (error: any) {
      console.error('Booking error:', error)
      toast({
        title: locale === 'th' ? 'เกิดข้อผิดพลาด' : 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-background py-20">
        <div className="container mx-auto px-4">
          <Card className="mx-auto max-w-lg">
            <CardContent className="pt-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-foreground">{t('success')}</h2>
              <p className="mb-4 text-muted-foreground">{t('successMessage')}</p>
              <div className="relative my-6 rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 p-6 transition-all hover:bg-primary/10">
                <p className="mb-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {locale === 'th' ? 'รหัสติดตามการจองของคุณ' : 'Your Tracking Code'}
                </p>
                <p className="text-4xl font-extrabold text-primary animate-in fade-in zoom-in duration-500">
                  {bookingId}
                </p>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                {locale === 'th'
                  ? 'กรุณาเก็บรหัสนี้ไว้สำหรับติดตามสถานะการจอง'
                  : 'Please keep this code to track your booking status'}
              </p>
              <Button className="mt-6" onClick={() => window.location.href = `/${locale}/tracking?code=${bookingId}`}>
                {locale === 'th' ? 'ติดตามการจอง' : 'Track Booking'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

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

      {/* Booking Form */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-3">
            {/* Form */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{locale === 'th' ? 'ข้อมูลการจอง' : 'Booking Information'}</CardTitle>
                <CardDescription>
                  {locale === 'th' ? 'กรุณากรอกข้อมูลให้ครบถ้วน' : 'Please fill in all required information'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Customer Info */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">
                      {locale === 'th' ? 'ข้อมูลผู้จอง' : 'Customer Information'}
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="customerName">{t('name')} <span className="text-destructive">*</span></Label>
                        <Input
                          id="customerName"
                          value={formData.customerName}
                          onChange={(e) => {
                            setFormData({ ...formData, customerName: e.target.value })
                            if (errors.customerName) setErrors({ ...errors, customerName: '' })
                          }}
                          className={errors.customerName ? "border-destructive focus-visible:ring-destructive" : ""}
                        />
                        {errors.customerName && <p className="text-xs text-destructive mt-1">{errors.customerName}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customerPhone">{t('phone')} <span className="text-destructive">*</span></Label>
                        <Input
                          id="customerPhone"
                          type="tel"
                          value={formData.customerPhone}
                          onChange={(e) => {
                            const formatted = formatPhoneNumber(e.target.value)
                            setFormData({ ...formData, customerPhone: formatted })
                            if (errors.customerPhone) setErrors({ ...errors, customerPhone: '' })
                          }}
                          placeholder="08X-XXX-XXXX"
                          className={errors.customerPhone ? "border-destructive focus-visible:ring-destructive" : ""}
                        />
                        {errors.customerPhone && <p className="text-xs text-destructive mt-1">{errors.customerPhone}</p>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerEmail">{t('email')}</Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">{t('address')} <span className="text-destructive">*</span></Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => {
                          setFormData({ ...formData, address: e.target.value })
                          if (errors.address) setErrors({ ...errors, address: '' })
                        }}
                        className={errors.address ? "border-destructive focus-visible:ring-destructive" : ""}
                      />
                      {errors.address && <p className="text-xs text-destructive mt-1">{errors.address}</p>}
                    </div>
                  </div>

                  {/* Service Selection */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">
                      {locale === 'th' ? 'เลือกบริการ' : 'Select Service'}
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="service">{t('service')} <span className="text-destructive">*</span></Label>
                      {servicesLoading ? (
                        <div className="flex items-center gap-2">
                          <Spinner className="h-4 w-4" />
                          <span className="text-sm text-muted-foreground">Loading...</span>
                        </div>
                      ) : (
                        <Select
                          value={formData.serviceId}
                          onValueChange={(value) => {
                            setFormData({ ...formData, serviceId: value })
                            if (errors.serviceId) setErrors({ ...errors, serviceId: '' })
                          }}
                        >
                          <SelectTrigger className={errors.serviceId ? "border-destructive focus:ring-destructive" : ""}>
                            <SelectValue placeholder={locale === 'th' ? 'เลือกบริการ' : 'Select a service'} />
                          </SelectTrigger>
                          <SelectContent>
                            {activeServices.length > 0 ? (
                              activeServices.map((service) => (
                                <SelectItem key={service._id} value={service._id}>
                                  {service.name[locale]} - {service.price.toLocaleString()} {locale === 'th' ? 'บาท' : 'THB'}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="none" disabled>
                                {locale === 'th' ? 'ไม่มีบริการที่เปิดใช้งานในขณะนี้' : 'No services available at the moment'}
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>{t('employee')}</Label>
                      {employeesLoading ? (
                        <div className="flex items-center gap-2">
                          <Spinner className="h-4 w-4" />
                          <span className="text-sm text-muted-foreground">Loading...</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowEmployeeModal(true)}
                          className="flex w-full items-center justify-between rounded-lg border border-input bg-background px-4 py-3 text-left shadow-sm transition-colors hover:bg-accent"
                        >
                          <div className="flex items-center gap-3">
                            {selectedEmployee ? (
                              <>
                                {selectedEmployee.image ? (
                                  <img src={selectedEmployee.image} alt={selectedEmployee.name} className="h-9 w-9 rounded-full object-cover" />
                                ) : (
                                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                                    <UserCircle className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm font-medium">{selectedEmployee.name}</p>
                                  {selectedEmployee.role && <p className="text-xs text-muted-foreground">{selectedEmployee.role}</p>}
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                                  <UserCircle className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {locale === 'th' ? 'ไม่ระบุ (ให้ระบบเลือก)' : 'No preference'}
                                </span>
                              </>
                            )}
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">
                      {locale === 'th' ? 'กำหนดวันเวลา' : 'Schedule'}
                    </h3>

                    {/* Date Picker */}
                    <div className="space-y-2">
                      <Label>{t('date')} <span className="text-destructive">*</span></Label>
                      <button
                        type="button"
                        onClick={() => setCalendarOpen(!calendarOpen)}
                        className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left shadow-sm transition-colors hover:bg-accent ${errors.scheduledDate ? 'border-destructive' : 'border-input'}`}
                      >
                        <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className={formData.scheduledDate ? 'text-foreground' : 'text-muted-foreground'}>
                          {formData.scheduledDate
                            ? new Date(formData.scheduledDate + 'T00:00:00').toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                            : locale === 'th' ? 'เลือกวันที่' : 'Select date'}
                        </span>
                      </button>
                      {errors.scheduledDate && <p className="text-xs text-destructive">{errors.scheduledDate}</p>}

                      {calendarOpen && (() => {
                        const today = new Date(); today.setHours(0,0,0,0)
                        const year = calendarMonth.getFullYear()
                        const month = calendarMonth.getMonth()
                        const firstDay = new Date(year, month, 1).getDay()
                        const daysInMonth = new Date(year, month + 1, 0).getDate()
                        const monthNames = locale === 'th'
                          ? ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม']
                          : ['January','February','March','April','May','June','July','August','September','October','November','December']
                        const dayNames = locale === 'th' ? ['อา','จ','อ','พ','พฤ','ศ','ส'] : ['Su','Mo','Tu','We','Th','Fr','Sa']
                        return (
                          <div className="rounded-xl border bg-card p-4 shadow-md">
                            <div className="mb-3 flex items-center justify-between">
                              <button type="button" onClick={() => setCalendarMonth(new Date(year, month - 1, 1))} className="rounded-lg p-1.5 hover:bg-accent">
                                <ChevronLeft className="h-4 w-4" />
                              </button>
                              <span className="font-semibold">{monthNames[month]} {locale === 'th' ? year + 543 : year}</span>
                              <button type="button" onClick={() => setCalendarMonth(new Date(year, month + 1, 1))} className="rounded-lg p-1.5 hover:bg-accent">
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-center">
                              {dayNames.map((d) => (
                                <div key={d} className="py-1 text-xs font-medium text-muted-foreground">{d}</div>
                              ))}
                              {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
                              {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1
                                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                                const dateObj = new Date(year, month, day)
                                const isPast = dateObj < today
                                const isSelected = formData.scheduledDate === dateStr
                                const isToday = dateObj.getTime() === today.getTime()
                                return (
                                  <button
                                    key={day}
                                    type="button"
                                    disabled={isPast}
                                    onClick={() => {
                                      setFormData({ ...formData, scheduledDate: dateStr })
                                      if (errors.scheduledDate) setErrors({ ...errors, scheduledDate: '' })
                                      setCalendarOpen(false)
                                    }}
                                    className={`rounded-lg py-1.5 text-sm font-medium transition-colors
                                      ${isPast ? 'cursor-not-allowed text-muted-foreground/40' : ''}
                                      ${isSelected ? 'bg-primary text-primary-foreground' : ''}
                                      ${!isSelected && isToday ? 'border border-primary text-primary' : ''}
                                      ${!isSelected && !isPast ? 'hover:bg-accent' : ''}
                                    `}
                                  >
                                    {day}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })()}
                    </div>

                    {/* Time Slots */}
                    <div className="space-y-2">
                      <Label>{t('time')} <span className="text-destructive">*</span></Label>
                      {errors.scheduledTime && <p className="text-xs text-destructive">{errors.scheduledTime}</p>}
                      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                        {Array.from({ length: 29 }).map((_, i) => {
                          const hour = Math.floor(i / 2) + 6
                          const min = i % 2 === 0 ? '00' : '30'
                          if (hour > 20 || (hour === 20 && min === '30')) return null
                          const val = `${String(hour).padStart(2, '0')}:${min}`
                          const isSelected = !customTime && formData.scheduledTime === val
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => {
                                setCustomTime(false)
                                setFormData({ ...formData, scheduledTime: val })
                                if (errors.scheduledTime) setErrors({ ...errors, scheduledTime: '' })
                              }}
                              className={`rounded-lg border py-2 text-sm font-medium transition-colors
                                ${isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary/50 hover:bg-accent'}
                              `}
                            >
                              {val}
                            </button>
                          )
                        })}

                        {/* Custom time */}
                        <button
                          type="button"
                          onClick={() => {
                            setCustomTime(true)
                            setFormData({ ...formData, scheduledTime: '' })
                          }}
                          className={`col-span-2 rounded-lg border py-2 text-sm font-medium transition-colors
                            ${customTime ? 'border-primary bg-primary text-primary-foreground' : 'border-dashed border-border hover:border-primary/50 hover:bg-accent'}
                          `}
                        >
                          {locale === 'th' ? '+ กำหนดเอง' : '+ Custom'}
                        </button>
                      </div>

                      {customTime && (
                        <input
                          type="time"
                          autoFocus
                          value={formData.scheduledTime}
                          onChange={(e) => {
                            setFormData({ ...formData, scheduledTime: e.target.value })
                            if (errors.scheduledTime) setErrors({ ...errors, scheduledTime: '' })
                          }}
                          className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">{t('notes')}</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder={locale === 'th' ? 'ข้อมูลเพิ่มเติม เช่น อาการของผู้ป่วย สิ่งที่ต้องการเป็นพิเศษ' : 'Additional information, special requirements, etc.'}
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" />
                        {locale === 'th' ? 'กำลังดำเนินการ...' : 'Processing...'}
                      </>
                    ) : (
                      t('submit')
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Summary */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {locale === 'th' ? 'สรุปการจอง' : 'Booking Summary'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedService ? (
                    <>
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-primary/10 p-2">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{selectedService.name[locale]}</p>
                          <p className="text-sm text-muted-foreground">{selectedService.description[locale]}</p>
                        </div>
                      </div>

                      {selectedEmployee && (
                        <div className="flex items-center gap-3">
                          {selectedEmployee.image ? (
                            <img
                              src={selectedEmployee.image}
                              alt={selectedEmployee.name}
                              className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/20"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted ring-2 ring-border">
                              <UserCircle className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm text-muted-foreground">{locale === 'th' ? 'พนักงาน' : 'Staff'}</p>
                            <p className="font-medium">{selectedEmployee.name}</p>
                            {selectedEmployee.role && (
                              <p className="text-xs text-muted-foreground">{selectedEmployee.role}</p>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-secondary/50 p-2">
                          <Clock className="h-5 w-5 text-secondary-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{locale === 'th' ? 'ระยะเวลา' : 'Duration'}</p>
                          <p className="font-medium">
                            {selectedService.duration} {locale === 'th' ? 'ชั่วโมง' : 'hours'}
                          </p>
                        </div>
                      </div>
                      {formData.scheduledDate && formData.scheduledTime && (
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-accent p-2">
                            <Calendar className="h-5 w-5 text-accent-foreground" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">{locale === 'th' ? 'วันเวลา' : 'Schedule'}</p>
                            <p className="font-medium">
                              {new Date(formData.scheduledDate).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                            <p className="text-sm">{formData.scheduledTime}</p>
                          </div>
                        </div>
                      )}
                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">{locale === 'th' ? 'ราคา' : 'Price'}</span>
                          <span className="text-2xl font-bold text-primary">
                            {selectedService.price.toLocaleString()} {locale === 'th' ? 'บาท' : 'THB'}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-center text-muted-foreground">
                      {locale === 'th' ? 'กรุณาเลือกบริการ' : 'Please select a service'}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-primary/5">
                <CardContent>
                  <h3 className="mb-2 font-semibold">
                    {locale === 'th' ? 'ต้องการความช่วยเหลือ?' : 'Need help?'}
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {locale === 'th'
                      ? 'ติดต่อเราได้ทุกวัน 8:00 - 20:00 น.'
                      : 'Contact us daily 8:00 AM - 8:00 PM'}
                  </p>
                  <p className="font-medium text-primary">02-XXX-XXXX</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Employee Picker Modal */}
      {showEmployeeModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center" onClick={() => setShowEmployeeModal(false)}>
          <div
            className="w-full max-w-lg rounded-t-2xl bg-background p-6 shadow-xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {locale === 'th' ? 'เลือกพนักงาน' : 'Select Staff'}
              </h2>
              <button type="button" onClick={() => setShowEmployeeModal(false)} className="rounded-full p-1 hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-1">
              {/* No preference */}
              <button
                type="button"
                onClick={() => { setFormData({ ...formData, employeeId: '' }); setShowEmployeeModal(false) }}
                className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all ${
                  formData.employeeId === '' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                }`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted">
                  <UserCircle className="h-7 w-7 text-muted-foreground" />
                </div>
                <span className="font-medium">{locale === 'th' ? 'ไม่ระบุ (ให้ระบบเลือก)' : 'No preference'}</span>
                {formData.employeeId === '' && <CheckCircle2 className="ml-auto h-5 w-5 text-primary" />}
              </button>

              {availableEmployees.map((employee) => (
                <div
                  key={employee._id}
                  className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 transition-all ${
                    formData.employeeId === employee._id ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  {/* Avatar — click to zoom */}
                  <button
                    type="button"
                    className="relative shrink-0 group"
                    onClick={() => employee.image && setZoomImage(employee.image)}
                    disabled={!employee.image}
                  >
                    {employee.image ? (
                      <>
                        <img src={employee.image} alt={employee.name} className="h-12 w-12 rounded-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-all group-hover:bg-black/30">
                          <ZoomIn className="h-4 w-4 text-white opacity-0 group-hover:opacity-100" />
                        </div>
                      </>
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <UserCircle className="h-7 w-7 text-muted-foreground" />
                      </div>
                    )}
                  </button>

                  {/* Info — click to select */}
                  <button
                    type="button"
                    className="flex flex-1 flex-col text-left"
                    onClick={() => { setFormData({ ...formData, employeeId: employee._id }); setShowEmployeeModal(false) }}
                  >
                    <span className="font-medium">{employee.name}</span>
                    {employee.role && <span className="text-sm text-muted-foreground">{employee.role}</span>}
                  </button>

                  {formData.employeeId === employee._id && <CheckCircle2 className="ml-auto shrink-0 h-5 w-5 text-primary" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Zoom Image Modal */}
      {zoomImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80" onClick={() => setZoomImage(null)}>
          <button type="button" className="absolute right-4 top-4 rounded-full bg-white/10 p-2 hover:bg-white/20" onClick={() => setZoomImage(null)}>
            <X className="h-6 w-6 text-white" />
          </button>
          <img
            src={zoomImage}
            alt="employee"
            className="max-h-[80vh] max-w-[80vw] rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </main>
  )
}
