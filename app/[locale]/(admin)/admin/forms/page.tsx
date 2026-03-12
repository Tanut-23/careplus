'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import useSWR, { mutate } from 'swr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface FormField {
  name: string
  label: { th: string; en: string }
  type: 'text' | 'number' | 'date' | 'select' | 'textarea'
  options?: { th: string; en: string }[]
  required: boolean
}

interface Form {
  _id: string
  name: { th: string; en: string }
  fields: FormField[]
  createdAt: string
}

const fieldTypes = [
  { value: 'text', label: 'ข้อความ' },
  { value: 'number', label: 'ตัวเลข' },
  { value: 'date', label: 'วันที่' },
  { value: 'select', label: 'ตัวเลือก' },
  { value: 'textarea', label: 'ข้อความยาว' },
]

export default function FormsPage() {
  const t = useTranslations('admin')
  const tc = useTranslations('common')
  const { data: forms, isLoading } = useSWR<Form[]>('/api/forms', fetcher)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingForm, setEditingForm] = useState<Form | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('คุณต้องการลบฟอร์มนี้หรือไม่?')) return
    
    await fetch(`/api/forms/${id}`, { method: 'DELETE' })
    mutate('/api/forms')
  }

  const handleEdit = (form: Form) => {
    setEditingForm(form)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingForm(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('forms')}</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingForm(null)}>
              <Plus className="mr-2 h-4 w-4" />
              {tc('add')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingForm ? tc('edit') : tc('add')} ฟอร์ม
              </DialogTitle>
            </DialogHeader>
            <FormBuilder
              form={editingForm}
              onClose={handleCloseDialog}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการฟอร์มทั้งหมด</CardTitle>
          <p className="text-sm text-muted-foreground">
            สร้างฟอร์มแบบ Dynamic สำหรับใช้กับบริการต่างๆ
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อฟอร์ม</TableHead>
                  <TableHead>จำนวนฟิลด์</TableHead>
                  <TableHead>สร้างเมื่อ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forms?.map((form) => (
                  <TableRow key={form._id}>
                    <TableCell className="font-medium">{form.name.th}</TableCell>
                    <TableCell>{form.fields.length} ฟิลด์</TableCell>
                    <TableCell>
                      {new Date(form.createdAt).toLocaleDateString('th-TH')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(form)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(form._id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {forms?.length === 0 && !isLoading && (
            <div className="py-8 text-center text-muted-foreground">
              ยังไม่มีฟอร์ม
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function FormBuilder({
  form,
  onClose,
}: {
  form: Form | null
  onClose: () => void
}) {
  const tc = useTranslations('common')
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: { th: form?.name.th || '', en: form?.name.en || '' },
    fields: form?.fields || [] as FormField[],
  })

  const addField = () => {
    setFormData({
      ...formData,
      fields: [
        ...formData.fields,
        {
          name: `field_${formData.fields.length + 1}`,
          label: { th: '', en: '' },
          type: 'text' as const,
          required: false,
        },
      ],
    })
  }

  const removeField = (index: number) => {
    setFormData({
      ...formData,
      fields: formData.fields.filter((_, i) => i !== index),
    })
  }

  const updateField = (index: number, updates: Partial<FormField>) => {
    const newFields = [...formData.fields]
    newFields[index] = { ...newFields[index], ...updates }
    setFormData({ ...formData, fields: newFields })
  }

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    if (!formData.name.th.trim()) newErrors['name.th'] = 'กรุณากรอกชื่อฟอร์ม (ไทย)'
    if (!formData.name.en.trim()) newErrors['name.en'] = 'Please enter Form Name (English)'
    
    formData.fields.forEach((field, index) => {
      if (!field.name.trim()) newErrors[`field_${index}_name`] = 'กรุณากรอกชื่อฟิลด์'
      if (!field.label.th.trim()) newErrors[`field_${index}_label.th`] = 'กรุณากรอก Label (ไทย)'
      if (!field.label.en.trim()) newErrors[`field_${index}_label.en`] = 'Please enter Label (English)'
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsLoading(true)

    try {
      const url = form ? `/api/forms/${form._id}` : '/api/forms'
      const method = form ? 'PUT' : 'POST'

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      mutate('/api/forms')
      onClose()
    } catch (error) {
      console.error('Error saving form:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <FieldGroup>
          <Field>
            <FieldLabel>ชื่อฟอร์ม (ไทย) *</FieldLabel>
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
            <FieldLabel>Form Name (English) *</FieldLabel>
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

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">ฟิลด์</h3>
          <Button type="button" variant="outline" onClick={addField}>
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มฟิลด์
          </Button>
        </div>

        {formData.fields.map((field, index) => (
          <Card key={index}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-4">
                <div className="mt-2 cursor-move text-muted-foreground">
                  <GripVertical className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FieldGroup>
                      <Field>
                        <FieldLabel>ชื่อฟิลด์ *</FieldLabel>
                        <Input
                          value={field.name}
                          onChange={(e) => {
                            updateField(index, { name: e.target.value })
                            if (errors[`field_${index}_name`]) setErrors({ ...errors, [`field_${index}_name`]: '' })
                          }}
                          className={errors[`field_${index}_name`] ? "border-destructive focus-visible:ring-destructive" : ""}
                        />
                        {errors[`field_${index}_name`] && <p className="text-xs text-destructive mt-1">{errors[`field_${index}_name`]}</p>}
                      </Field>
                    </FieldGroup>

                    <FieldGroup>
                      <Field>
                        <FieldLabel>ประเภท</FieldLabel>
                        <Select
                          value={field.type}
                          onValueChange={(value) =>
                            updateField(index, { type: value as FormField['type'] })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fieldTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    </FieldGroup>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FieldGroup>
                      <Field>
                        <FieldLabel>Label (ไทย) *</FieldLabel>
                        <Input
                          value={field.label.th}
                          onChange={(e) => {
                            updateField(index, {
                              label: { ...field.label, th: e.target.value },
                            })
                            if (errors[`field_${index}_label.th`]) setErrors({ ...errors, [`field_${index}_label.th`]: '' })
                          }}
                          className={errors[`field_${index}_label.th`] ? "border-destructive focus-visible:ring-destructive" : ""}
                        />
                        {errors[`field_${index}_label.th`] && <p className="text-xs text-destructive mt-1">{errors[`field_${index}_label.th`]}</p>}
                      </Field>
                    </FieldGroup>

                    <FieldGroup>
                      <Field>
                        <FieldLabel>Label (English) *</FieldLabel>
                        <Input
                          value={field.label.en}
                          onChange={(e) => {
                            updateField(index, {
                              label: { ...field.label, en: e.target.value },
                            })
                            if (errors[`field_${index}_label.en`]) setErrors({ ...errors, [`field_${index}_label.en`]: '' })
                          }}
                          className={errors[`field_${index}_label.en`] ? "border-destructive focus-visible:ring-destructive" : ""}
                        />
                        {errors[`field_${index}_label.en`] && <p className="text-xs text-destructive mt-1">{errors[`field_${index}_label.en`]}</p>}
                      </Field>
                    </FieldGroup>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={field.required}
                        onCheckedChange={(checked) =>
                          updateField(index, { required: checked })
                        }
                      />
                      <span className="text-sm">จำเป็นต้องกรอก</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeField(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {formData.fields.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            ยังไม่มีฟิลด์ คลิก &quot;เพิ่มฟิลด์&quot; เพื่อเริ่มต้น
          </div>
        )}
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
