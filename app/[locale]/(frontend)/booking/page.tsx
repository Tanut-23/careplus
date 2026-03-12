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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Calendar, CheckCircle, Clock, User } from 'lucide-react'
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
                        <Label htmlFor="customerName">{t('name')} *</Label>
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
                        <Label htmlFor="customerPhone">{t('phone')} *</Label>
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
                      <Label htmlFor="address">{t('address')} *</Label>
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
                      <Label htmlFor="service">{t('service')} *</Label>
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
                      <Label htmlFor="employee">{t('employee')}</Label>
                      {employeesLoading ? (
                        <div className="flex items-center gap-2">
                          <Spinner className="h-4 w-4" />
                          <span className="text-sm text-muted-foreground">Loading...</span>
                        </div>
                      ) : (
                        <Select
                          value={formData.employeeId}
                          onValueChange={(value) => setFormData({ ...formData, employeeId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={locale === 'th' ? 'ไม่ระบุ (ให้ระบบเลือก)' : 'No preference'} />
                          </SelectTrigger>
                          <SelectContent>
                            {availableEmployees.length > 0 ? (
                              availableEmployees.map((employee) => (
                                <SelectItem key={employee._id} value={employee._id}>
                                  {employee.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="none" disabled>
                                {locale === 'th' ? 'ไม่มีพนักงานที่พร้อมให้บริการ' : 'No available employees'}
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">
                      {locale === 'th' ? 'กำหนดวันเวลา' : 'Schedule'}
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="date">{t('date')} *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.scheduledDate}
                          onChange={(e) => {
                            setFormData({ ...formData, scheduledDate: e.target.value })
                            if (errors.scheduledDate) setErrors({ ...errors, scheduledDate: '' })
                          }}
                          min={new Date().toISOString().split('T')[0]}
                          className={errors.scheduledDate ? "border-destructive focus-visible:ring-destructive" : ""}
                        />
                        {errors.scheduledDate && <p className="text-xs text-destructive mt-1">{errors.scheduledDate}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time">{t('time')} *</Label>
                        <Input
                          id="time"
                          type="time"
                          value={formData.scheduledTime}
                          onChange={(e) => {
                            setFormData({ ...formData, scheduledTime: e.target.value })
                            if (errors.scheduledTime) setErrors({ ...errors, scheduledTime: '' })
                          }}
                          className={errors.scheduledTime ? "border-destructive focus-visible:ring-destructive" : ""}
                        />
                        {errors.scheduledTime && <p className="text-xs text-destructive mt-1">{errors.scheduledTime}</p>}
                      </div>
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
                <CardContent className="pt-6">
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
    </main>
  )
}
