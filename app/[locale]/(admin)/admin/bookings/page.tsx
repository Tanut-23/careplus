'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import useSWR, { mutate } from 'swr'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Eye, Trash2 } from 'lucide-react'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Booking {
  _id: string
  trackingCode: string
  customerId: { _id: string; name: string; email: string; phone: string }
  serviceId: { _id: string; name: { th: string; en: string }; price: number }
  employeeId?: { _id: string; name: string }
  date: string
  time: string
  status: string
  notes: string
  createdAt: string
}

interface Employee {
  _id: string
  name: string
  isAvailable: boolean
}

const statusOptions = [
  { value: 'pending', label: 'รอดำเนินการ', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  { value: 'confirmed', label: 'ยืนยันแล้ว', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  { value: 'in-progress', label: 'กำลังดำเนินการ', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  { value: 'completed', label: 'เสร็จสิ้น', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  { value: 'cancelled', label: 'ยกเลิก', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
]

export default function BookingsPage() {
  const t = useTranslations('admin')
  const locale = useLocale()
  const { data: bookings, isLoading } = useSWR<Booking[]>('/api/bookings', fetcher)
  const { data: employees } = useSWR<Employee[]>('/api/employees', fetcher)
  const availableEmployees = employees?.filter(e => e.isAvailable) || []
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/bookings/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete booking')
      
      mutate('/api/bookings')
      toast({
        title: 'ลบสำเร็จ',
        description: 'ข้อมูลการจองถูกลบออกจากระบบแล้ว',
      })
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    await fetch(`/api/bookings/${bookingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    mutate('/api/bookings')
  }

  const handleAssignEmployee = async (bookingId: string, employeeId: string) => {
    await fetch(`/api/bookings/${bookingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId }),
    })
    mutate('/api/bookings')
  }

  const filteredBookings = bookings?.filter(
    (booking) => filterStatus === 'all' || booking.status === filterStatus
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('bookings')}</h1>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="กรองตามสถานะ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทั้งหมด</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <AlertDialog open={!!isDeleting} onOpenChange={(open) => !open && setIsDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>คุณแน่ใจหรือไม่?</AlertDialogTitle>
            <AlertDialogDescription>
              การดำเนินการนี้ไม่สามารถย้อนกลับได้ ข้อมูลการจองนี้จะถูกลบออกจากระบบถาวร
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => isDeleting && handleDelete(isDeleting)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              ลบข้อมูล
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader>
          <CardTitle>รายการจองทั้งหมด</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รหัสติดตาม</TableHead>
                  <TableHead>ลูกค้า</TableHead>
                  <TableHead>บริการ</TableHead>
                  <TableHead>วันที่</TableHead>
                  <TableHead>เวลา</TableHead>
                  <TableHead>พนักงาน</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings?.map((booking) => (
                  <TableRow key={booking._id}>
                    <TableCell className="font-mono text-xs text-primary">{booking.trackingCode || '-'}</TableCell>
                    <TableCell className="font-medium">
                      {booking.customerId?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {locale === 'th'
                        ? booking.serviceId?.name.th
                        : booking.serviceId?.name.en || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {new Date(booking.date).toLocaleDateString('th-TH')}
                    </TableCell>
                    <TableCell>{booking.time}</TableCell>
                    <TableCell>
                      <Select
                        value={booking.employeeId?._id || ''}
                        onValueChange={(value) => handleAssignEmployee(booking._id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="เลือก" />
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
                              ไม่มีพนักงานที่พร้อมให้บริการ
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={booking.status}
                        onValueChange={(value) => handleStatusChange(booking._id, value)}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsDeleting(booking._id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>รายละเอียดการจอง</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <BookingDetails booking={selectedBooking} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function BookingDetails({ booking }: { booking: Booking }) {
  const locale = useLocale()

  return (
    <div className="space-y-4">
      <FieldGroup>
        <Field className="col-span-full mb-2">
          <FieldLabel>รหัสติดตามการจอง</FieldLabel>
          <div className="rounded-md bg-muted p-2 font-mono text-lg font-bold text-primary w-fit">
            {booking.trackingCode || 'ไม่มีรหัส'}
          </div>
        </Field>
      </FieldGroup>
      
      <FieldGroup>
        <Field>
          <FieldLabel>ชื่อลูกค้า</FieldLabel>
          <p>{booking.customerId?.name || 'N/A'}</p>
        </Field>
        <Field>
          <FieldLabel>อีเมล</FieldLabel>
          <p>{booking.customerId?.email || 'N/A'}</p>
        </Field>
        <Field>
          <FieldLabel>เบอร์โทร</FieldLabel>
          <p>{booking.customerId?.phone || 'N/A'}</p>
        </Field>
      </FieldGroup>

      <FieldGroup>
        <Field>
          <FieldLabel>บริการ</FieldLabel>
          <p>
            {locale === 'th'
              ? booking.serviceId?.name.th
              : booking.serviceId?.name.en || 'N/A'}
          </p>
        </Field>
        <Field>
          <FieldLabel>ราคา</FieldLabel>
          <p>{booking.serviceId?.price?.toLocaleString() || 0} บาท</p>
        </Field>
      </FieldGroup>

      <FieldGroup>
        <Field>
          <FieldLabel>วันที่จอง</FieldLabel>
          <p>{new Date(booking.date).toLocaleDateString('th-TH')}</p>
        </Field>
        <Field>
          <FieldLabel>เวลา</FieldLabel>
          <p>{booking.time}</p>
        </Field>
      </FieldGroup>

      {booking.notes && (
        <FieldGroup>
          <Field>
            <FieldLabel>หมายเหตุ</FieldLabel>
            <p>{booking.notes}</p>
          </Field>
        </FieldGroup>
      )}

      <FieldGroup>
        <Field>
          <FieldLabel>สร้างเมื่อ</FieldLabel>
          <p>{new Date(booking.createdAt).toLocaleString('th-TH')}</p>
        </Field>
      </FieldGroup>
    </div>
  )
}
