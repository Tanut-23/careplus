'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import useSWR, { mutate } from 'swr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { Plus, Pencil, Trash2, GripVertical, Save, Trash } from 'lucide-react'
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

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Service {
  _id: string
  name: { th: string; en: string }
  description: { th: string; en: string }
  price: number
  duration: string
  isActive: boolean
  order: number
}

function SortableRow({ 
  service, 
  locale, 
  handleEdit, 
  onDeleteRequest 
}: { 
  service: Service; 
  locale: string; 
  handleEdit: (s: Service) => void; 
  onDeleteRequest: (id: string) => void 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: service._id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="w-[50px]">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </TableCell>
      <TableCell className="font-medium">
        {locale === 'th' ? service.name.th : service.name.en}
      </TableCell>
      <TableCell>{service.price.toLocaleString()} บาท</TableCell>
      <TableCell>{service.duration}</TableCell>
      <TableCell>
        <span
          className={`rounded-full px-2 py-1 text-xs ${
            service.isActive
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          {service.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleEdit(service)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDeleteRequest(service._id)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </TableCell>
    </TableRow>
  )
}

export default function ServicesPage() {
  const t = useTranslations('admin')
  const tc = useTranslations('common')
  const locale = useLocale()
  const { data: services = [], isLoading, mutate: revalidate } = useSWR<Service[]>('/api/services?active=false', fetcher)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [isSavingOrder, setIsSavingOrder] = useState(false)
  const [hasOrderChanged, setHasOrderChanged] = useState(false)

  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = services.findIndex((i) => i._id === active.id)
      const newIndex = services.findIndex((i) => i._id === over?.id)
      const newItems = arrayMove(services, oldIndex, newIndex)
      
      // Update SWR cache immediately (optimistic update)
      // This ensures the UI stays in this order and doesn't bounce back
      await revalidate(newItems, false)
      setHasOrderChanged(true)
    }
  }

  const saveOrder = async () => {
    if (!services.length) return
    setIsSavingOrder(true)
    try {
      const reorderedItems = services.map((s, index) => ({
        _id: s._id,
        order: index,
      }))
      
      const response = await fetch('/api/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ services: reorderedItems }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to save order')

      setHasOrderChanged(false)
      
      // Clear cache and re-fetch to synchronize with server
      await revalidate ()
    } catch (error: any) {
      console.error('Error saving order:', error)
      toast({
        title: locale === 'th' ? 'เกิดข้อผิดพลาด' : 'Error',
        description: error.message,
        variant: 'destructive',
      })
      // Re-fetch to revert to server state
      await revalidate()
    } finally {
      setIsSavingOrder(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/services/${id}`, { method: 'DELETE' })
      const data = await response.json()

      if (!response.ok) {
        const errorMsg = locale === 'th' ? (data.errorTh || data.error) : data.error
        throw new Error(errorMsg || 'Failed to delete service')
      }
      
      revalidate()
      toast({
        title: locale === 'th' ? 'ลบสำเร็จ' : 'Deleted successfully',
        description: locale === 'th' ? 'บริการถูกลบออกจากระบบแล้ว' : 'Service has been deleted.',
      })
    } catch (error: any) {
      toast({
        title: locale === 'th' ? 'เกิดข้อผิดพลาด' : 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingService(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('services')}</h1>
        <div className="flex gap-2">
          {hasOrderChanged && (
            <Button variant="outline" onClick={saveOrder} disabled={isSavingOrder}>
              {isSavingOrder ? <Spinner className="mr-2" /> : <Save className="mr-2 h-4 w-4" />}
              บันทึกลำดับ
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingService(null)}>
                <Plus className="mr-2 h-4 w-4" />
                {tc('add')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingService ? tc('edit') : tc('add')} {t('services')}
                </DialogTitle>
              </DialogHeader>
              <ServiceForm
                service={editingService}
                onClose={handleCloseDialog}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <AlertDialog open={!!isDeleting} onOpenChange={(open) => !open && setIsDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{locale === 'th' ? 'คุณแน่ใจหรือไม่?' : 'Are you sure?'}</AlertDialogTitle>
            <AlertDialogDescription>
              {locale === 'th' 
                ? 'การดำเนินการนี้ไม่สามารถย้อนกลับได้ บริการนี้จะถูกลบออกจากระบบถาวร' 
                : 'This action cannot be undone. This service will be permanently deleted.'}
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
          <CardTitle>รายการบริการทั้งหมด (ลากเพื่อเรียงลำดับ)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>ชื่อบริการ</TableHead>
                    <TableHead>ราคา</TableHead>
                    <TableHead>ระยะเวลา</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead className="text-right">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SortableContext
                    items={services.map(s => s._id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {services.map((service) => (
                      <SortableRow
                        key={service._id}
                        service={service}
                        locale={locale}
                        handleEdit={handleEdit}
                        onDeleteRequest={(id) => setIsDeleting(id)}
                      />
                    ))}
                  </SortableContext>
                </TableBody>
              </Table>
            </DndContext>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ServiceForm({
  service,
  onClose,
}: {
  service: Service | null
  onClose: () => void
}) {
  const tc = useTranslations('common')
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: { th: service?.name.th || '', en: service?.name.en || '' },
    description: { th: service?.description.th || '', en: service?.description.en || '' },
    price: service?.price || 0,
    duration: service?.duration || '',
    isActive: service?.isActive ?? true,
    order: service?.order || 0,
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    if (!formData.name.th.trim()) newErrors['name.th'] = 'กรุณากรอกชื่อบริการ (ไทย)'
    if (!formData.name.en.trim()) newErrors['name.en'] = 'Please enter Service Name (English)'
    if (!formData.description.th.trim()) newErrors['description.th'] = 'กรุณากรอกรายละเอียด (ไทย)'
    if (!formData.description.en.trim()) newErrors['description.en'] = 'Please enter Description (English)'
    if (formData.price < 0 || formData.price === null || formData.price === undefined || formData.price.toString() === '') newErrors.price = 'กรุณากรอกราคาให้ถูกต้อง'
    if (!formData.duration.trim()) newErrors.duration = 'กรุณากรอกระยะเวลา'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsLoading(true)

    try {
      const url = service ? `/api/services/${service._id}` : '/api/services'
      const method = service ? 'PUT' : 'POST'

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      mutate('/api/services?active=false')
      onClose()
    } catch (error) {
      console.error('Error saving service:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <FieldGroup>
          <Field>
            <FieldLabel>ชื่อบริการ (ไทย) <span className="text-destructive">*</span></FieldLabel>
            <Input
              value={formData.name.th}
              onChange={(e) => {
                setFormData({ ...formData, name: { ...formData.name, th: e.target.value } })
                if (errors['name.th']) setErrors({ ...errors, 'name.th': '' })
              }}
              className={errors['name.th'] ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors['name.th'] && <p className="text-xs text-destructive mt-1">{errors['name.th']}</p>}
          </Field>
        </FieldGroup>
        <FieldGroup>
          <Field>
            <FieldLabel>Service Name (English) <span className="text-destructive">*</span></FieldLabel>
            <Input
              value={formData.name.en}
              onChange={(e) => {
                setFormData({ ...formData, name: { ...formData.name, en: e.target.value } })
                if (errors['name.en']) setErrors({ ...errors, 'name.en': '' })
              }}
              className={errors['name.en'] ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors['name.en'] && <p className="text-xs text-destructive mt-1">{errors['name.en']}</p>}
          </Field>
        </FieldGroup>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FieldGroup>
          <Field>
            <FieldLabel>รายละเอียด (ไทย) <span className="text-destructive">*</span></FieldLabel>
            <Textarea
              value={formData.description.th}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  description: { ...formData.description, th: e.target.value },
                })
                if (errors['description.th']) setErrors({ ...errors, 'description.th': '' })
              }}
              rows={3}
              className={errors['description.th'] ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors['description.th'] && <p className="text-xs text-destructive mt-1">{errors['description.th']}</p>}
          </Field>
        </FieldGroup>
        <FieldGroup>
          <Field>
            <FieldLabel>Description (English) <span className="text-destructive">*</span></FieldLabel>
            <Textarea
              value={formData.description.en}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  description: { ...formData.description, en: e.target.value },
                })
                if (errors['description.en']) setErrors({ ...errors, 'description.en': '' })
              }}
              rows={3}
              className={errors['description.en'] ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors['description.en'] && <p className="text-xs text-destructive mt-1">{errors['description.en']}</p>}
          </Field>
        </FieldGroup>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FieldGroup>
          <Field>
            <FieldLabel>ราคา (บาท) <span className="text-destructive">*</span></FieldLabel>
            <Input
              type="number"
              value={formData.price === 0 && !service ? '' : formData.price}
              onChange={(e) => {
                setFormData({ ...formData, price: e.target.value ? Number(e.target.value) : 0 })
                if (errors.price) setErrors({ ...errors, price: '' })
              }}
              className={errors.price ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.price && <p className="text-xs text-destructive mt-1">{errors.price}</p>}
          </Field>
        </FieldGroup>
        <FieldGroup>
          <Field>
            <FieldLabel>ระยะเวลา <span className="text-destructive">*</span></FieldLabel>
            <Input
              value={formData.duration}
              onChange={(e) => {
                setFormData({ ...formData, duration: e.target.value })
                if (errors.duration) setErrors({ ...errors, duration: '' })
              }}
              placeholder="เช่น 1 ชั่วโมง, 8 ชั่วโมง"
              className={errors.duration ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.duration && <p className="text-xs text-destructive mt-1">{errors.duration}</p>}
          </Field>
        </FieldGroup>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
        />
        <span>เปิดใช้งาน</span>
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
