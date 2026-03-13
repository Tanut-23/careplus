'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import useSWR, { mutate } from 'swr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Customer {
  _id: string
  name: string
  email: string
  phone: string
  address: string
  bookingHistory: string[]
  createdAt: string
}

export default function CustomersPage() {
  const t = useTranslations('admin')
  const tc = useTranslations('common')
  const { data: customers, isLoading } = useSWR<Customer[]>('/api/customers', fetcher)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('คุณต้องการลบลูกค้านี้หรือไม่?')) return
    
    await fetch(`/api/customers/${id}`, { method: 'DELETE' })
    mutate('/api/customers')
  }

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingCustomer(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('customers')}</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCustomer(null)}>
              <Plus className="mr-2 h-4 w-4" />
              {tc('add')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCustomer ? tc('edit') : tc('add')} ลูกค้า
              </DialogTitle>
            </DialogHeader>
            <CustomerForm
              customer={editingCustomer}
              onClose={handleCloseDialog}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายชื่อลูกค้าทั้งหมด</CardTitle>
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
                  <TableHead>ชื่อ</TableHead>
                  <TableHead>อีเมล</TableHead>
                  <TableHead>เบอร์โทร</TableHead>
                  <TableHead>จำนวนการจอง</TableHead>
                  <TableHead>วันที่ลงทะเบียน</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers?.map((customer) => (
                  <TableRow key={customer._id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.bookingHistory?.length || 0}</TableCell>
                    <TableCell>
                      {new Date(customer.createdAt).toLocaleDateString('th-TH')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewingCustomer(customer)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(customer)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(customer._id)}
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

      <Dialog open={!!viewingCustomer} onOpenChange={() => setViewingCustomer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ข้อมูลลูกค้า</DialogTitle>
          </DialogHeader>
          {viewingCustomer && (
            <div className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel>ชื่อ-นามสกุล</FieldLabel>
                  <p>{viewingCustomer.name}</p>
                </Field>
                <Field>
                  <FieldLabel>อีเมล</FieldLabel>
                  <p>{viewingCustomer.email}</p>
                </Field>
                <Field>
                  <FieldLabel>เบอร์โทร</FieldLabel>
                  <p>{viewingCustomer.phone}</p>
                </Field>
                <Field>
                  <FieldLabel>ที่อยู่</FieldLabel>
                  <p>{viewingCustomer.address || '-'}</p>
                </Field>
                <Field>
                  <FieldLabel>จำนวนการจอง</FieldLabel>
                  <p>{viewingCustomer.bookingHistory?.length || 0} ครั้ง</p>
                </Field>
                <Field>
                  <FieldLabel>ลงทะเบียนเมื่อ</FieldLabel>
                  <p>{new Date(viewingCustomer.createdAt).toLocaleString('th-TH')}</p>
                </Field>
              </FieldGroup>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CustomerForm({
  customer,
  onClose,
}: {
  customer: Customer | null
  onClose: () => void
}) {
  const tc = useTranslations('common')
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    if (!formData.name.trim()) newErrors.name = 'กรุณากรอกชื่อ-นามสกุล'
    if (!formData.email.trim()) newErrors.email = 'กรุณากรอกอีเมล'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง'
    if (!formData.phone.trim()) newErrors.phone = 'กรุณากรอกเบอร์โทรศัพท์'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsLoading(true)

    try {
      const url = customer ? `/api/customers/${customer._id}` : '/api/customers'
      const method = customer ? 'PUT' : 'POST'

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      mutate('/api/customers')
      onClose()
    } catch (error) {
      console.error('Error saving customer:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FieldGroup>
        <Field>
          <FieldLabel>ชื่อ-นามสกุล <span className="text-destructive">*</span></FieldLabel>
          <Input
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value })
              if (errors.name) setErrors({ ...errors, name: '' })
            }}
            className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
        </Field>

        <Field>
          <FieldLabel>อีเมล <span className="text-destructive">*</span></FieldLabel>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value })
              if (errors.email) setErrors({ ...errors, email: '' })
            }}
            className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
        </Field>

        <Field>
          <FieldLabel>เบอร์โทรศัพท์ <span className="text-destructive">*</span></FieldLabel>
          <Input
            value={formData.phone}
            onChange={(e) => {
              setFormData({ ...formData, phone: e.target.value })
              if (errors.phone) setErrors({ ...errors, phone: '' })
            }}
            className={errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
        </Field>

        <Field>
          <FieldLabel>ที่อยู่</FieldLabel>
          <Textarea
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            rows={3}
          />
        </Field>
      </FieldGroup>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          {tc('cancel')}
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Spinner className="mr-2" /> : null}
          {tc('save')}
        </Button>
      </div>
    </form>
  )
}
