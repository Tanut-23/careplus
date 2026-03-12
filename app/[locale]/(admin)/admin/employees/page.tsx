'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import useSWR, { mutate } from 'swr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
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
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
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

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Employee {
  _id: string
  name: string
  email: string
  phone: string
  role: string
  isAvailable: boolean
}

export default function EmployeesPage() {
  const t = useTranslations('admin')
  const tc = useTranslations('common')
  const { data: employees, isLoading } = useSWR<Employee[]>('/api/employees', fetcher)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/employees/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete employee')
      
      mutate('/api/employees')
      toast({
        title: 'ลบสำเร็จ',
        description: 'ข้อมูลพนักงานถูกลบออกจากระบบแล้ว',
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

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingEmployee(null)
  }

  const toggleAvailability = async (employee: Employee) => {
    await fetch(`/api/employees/${employee._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailable: !employee.isAvailable }),
    })
    mutate('/api/employees')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('employees')}</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingEmployee(null)}>
              <Plus className="mr-2 h-4 w-4" />
              {tc('add')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingEmployee ? tc('edit') : tc('add')} พนักงาน
              </DialogTitle>
            </DialogHeader>
            <EmployeeForm
              employee={editingEmployee}
              onClose={handleCloseDialog}
            />
          </DialogContent>
        </Dialog>
      </div>

      <AlertDialog open={!!isDeleting} onOpenChange={(open) => !open && setIsDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>คุณแน่ใจหรือไม่?</AlertDialogTitle>
            <AlertDialogDescription>
              การดำเนินการนี้ไม่สามารถย้อนกลับได้ ข้อมูลพนักงานจะถูกลบออกจากระบบถาวร
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tc('cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => isDeleting && handleDelete(isDeleting)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {tc('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader>
          <CardTitle>รายชื่อพนักงานทั้งหมด</CardTitle>
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
                  <TableHead>ตำแหน่ง</TableHead>
                  <TableHead>พร้อมให้บริการ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees?.map((employee) => (
                  <TableRow key={employee._id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.phone}</TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell>
                      <Switch
                        checked={employee.isAvailable}
                        onCheckedChange={() => toggleAvailability(employee)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(employee)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsDeleting(employee._id)}
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
    </div>
  )
}

function EmployeeForm({
  employee,
  onClose,
}: {
  employee: Employee | null
  onClose: () => void
}) {
  const tc = useTranslations('common')
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: employee?.name || '',
    email: employee?.email || '',
    phone: employee?.phone || '',
    role: employee?.role || '',
    isAvailable: employee?.isAvailable ?? true,
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    if (!formData.name.trim()) newErrors.name = 'กรุณากรอกชื่อ-นามสกุล'
    if (!formData.email.trim()) newErrors.email = 'กรุณากรอกอีเมล'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง'
    if (!formData.phone.trim()) newErrors.phone = 'กรุณากรอกเบอร์โทรศัพท์'
    if (!formData.role.trim()) newErrors.role = 'กรุณากรอกตำแหน่ง'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsLoading(true)

    try {
      const url = employee ? `/api/employees/${employee._id}` : '/api/employees'
      const method = employee ? 'PUT' : 'POST'

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      mutate('/api/employees')
      onClose()
    } catch (error) {
      console.error('Error saving employee:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FieldGroup>
        <Field>
          <FieldLabel>ชื่อ-นามสกุล *</FieldLabel>
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
          <FieldLabel>อีเมล *</FieldLabel>
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
          <FieldLabel>เบอร์โทรศัพท์ *</FieldLabel>
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
          <FieldLabel>ตำแหน่ง *</FieldLabel>
          <Input
            value={formData.role}
            onChange={(e) => {
              setFormData({ ...formData, role: e.target.value })
              if (errors.role) setErrors({ ...errors, role: '' })
            }}
            placeholder="เช่น พยาบาล, ผู้ดูแล, นักกายภาพบำบัด"
            className={errors.role ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {errors.role && <p className="text-xs text-destructive mt-1">{errors.role}</p>}
        </Field>
      </FieldGroup>

      <div className="flex items-center gap-2">
        <Switch
          checked={formData.isAvailable}
          onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
        />
        <span>พร้อมให้บริการ</span>
      </div>

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
