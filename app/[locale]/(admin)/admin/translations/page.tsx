'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import useSWR, { mutate } from 'swr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
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
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Translation {
  _id: string
  key: string
  th: string
  en: string
  section: string
  updatedAt: string
}

const sections = [
  { value: 'hero', label: 'หน้าแรก (Hero)' },
  { value: 'nav', label: 'เมนูนำทาง' },
  { value: 'services', label: 'บริการ' },
  { value: 'booking', label: 'การจอง' },
  { value: 'tracking', label: 'ติดตามสถานะ' },
  { value: 'footer', label: 'ส่วนท้าย' },
  { value: 'common', label: 'ทั่วไป' },
  { value: 'admin', label: 'แอดมิน' },
]

export default function TranslationsPage() {
  const t = useTranslations('admin')
  const tc = useTranslations('common')
  const { data: translations, isLoading } = useSWR<Translation[]>('/api/translations', fetcher)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSection, setFilterSection] = useState<string>('all')

  const handleDelete = async (id: string) => {
    if (!confirm('คุณต้องการลบคำแปลนี้หรือไม่?')) return
    
    await fetch(`/api/translations/${id}`, { method: 'DELETE' })
    mutate('/api/translations')
  }

  const handleEdit = (translation: Translation) => {
    setEditingTranslation(translation)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingTranslation(null)
  }

  const filteredTranslations = translations?.filter((t) => {
    const matchesSearch =
      t.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.th.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.en.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSection = filterSection === 'all' || t.section === filterSection
    return matchesSearch && matchesSection
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('translations')}</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingTranslation(null)}>
              <Plus className="mr-2 h-4 w-4" />
              {tc('add')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTranslation ? tc('edit') : tc('add')} คำแปล
              </DialogTitle>
            </DialogHeader>
            <TranslationForm
              translation={editingTranslation}
              onClose={handleCloseDialog}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>จัดการคำแปล (CMS)</CardTitle>
          <p className="text-sm text-muted-foreground">
            แก้ไขข้อความที่แสดงบนเว็บไซต์ได้ที่นี่
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ค้นหา key หรือข้อความ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterSection} onValueChange={setFilterSection}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="กรองตาม Section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                {sections.map((section) => (
                  <SelectItem key={section.value} value={section.value}>
                    {section.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
                  <TableHead>Key</TableHead>
                  <TableHead>ภาษาไทย</TableHead>
                  <TableHead>English</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTranslations?.map((translation) => (
                  <TableRow key={translation._id}>
                    <TableCell className="font-mono text-sm">
                      {translation.key}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {translation.th}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {translation.en}
                    </TableCell>
                    <TableCell>
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                        {sections.find((s) => s.value === translation.section)?.label ||
                          translation.section}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(translation)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(translation._id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {filteredTranslations?.length === 0 && !isLoading && (
            <div className="py-8 text-center text-muted-foreground">
              ไม่พบคำแปล
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function TranslationForm({
  translation,
  onClose,
}: {
  translation: Translation | null
  onClose: () => void
}) {
  const tc = useTranslations('common')
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    key: translation?.key || '',
    th: translation?.th || '',
    en: translation?.en || '',
    section: translation?.section || 'common',
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    if (!formData.key.trim()) newErrors.key = 'กรุณากรอก Key'
    if (!formData.th.trim()) newErrors.th = 'กรุณากรอกข้อความภาษาไทย'
    if (!formData.en.trim()) newErrors.en = 'Please enter English Text'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsLoading(true)

    try {
      const url = translation
        ? `/api/translations/${translation._id}`
        : '/api/translations'
      const method = translation ? 'PUT' : 'POST'

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      mutate('/api/translations')
      onClose()
    } catch (error) {
      console.error('Error saving translation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <FieldGroup>
          <Field>
            <FieldLabel>Key <span className="text-destructive">*</span></FieldLabel>
            <Input
              value={formData.key}
              onChange={(e) => {
                setFormData({ ...formData, key: e.target.value })
                if (errors.key) setErrors({ ...errors, key: '' })
              }}
              placeholder="เช่น hero.title, nav.home"
              disabled={!!translation}
              className={errors.key ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.key && <p className="text-xs text-destructive mt-1">{errors.key}</p>}
          </Field>
        </FieldGroup>

        <FieldGroup>
          <Field>
            <FieldLabel>Section</FieldLabel>
            <Select
              value={formData.section}
              onValueChange={(value) => setFormData({ ...formData, section: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sections.map((section) => (
                  <SelectItem key={section.value} value={section.value}>
                    {section.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>
      </div>

      <FieldGroup>
        <Field>
          <FieldLabel>ข้อความภาษาไทย <span className="text-destructive">*</span></FieldLabel>
          <Textarea
            value={formData.th}
            onChange={(e) => {
              setFormData({ ...formData, th: e.target.value })
              if (errors.th) setErrors({ ...errors, th: '' })
            }}
            rows={3}
            className={errors.th ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {errors.th && <p className="text-xs text-destructive mt-1">{errors.th}</p>}
        </Field>
      </FieldGroup>

      <FieldGroup>
        <Field>
          <FieldLabel>English Text <span className="text-destructive">*</span></FieldLabel>
          <Textarea
            value={formData.en}
            onChange={(e) => {
              setFormData({ ...formData, en: e.target.value })
              if (errors.en) setErrors({ ...errors, en: '' })
            }}
            rows={3}
            className={errors.en ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {errors.en && <p className="text-xs text-destructive mt-1">{errors.en}</p>}
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
