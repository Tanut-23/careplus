'use client'

import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Star, Eye, EyeOff, Trash2, MessageSquare } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Review {
  _id: string
  customerName: string
  rating: number
  comment: string
  isVisible: boolean
  createdAt: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-4 w-4 ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
        />
      ))}
    </div>
  )
}

export default function AdminReviewsPage() {
  const { data: reviews, isLoading } = useSWR<Review[]>('/api/reviews?all=true', fetcher)
  const { toast } = useToast()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function toggleVisibility(review: Review) {
    setLoadingId(review._id)
    try {
      const res = await fetch(`/api/reviews/${review._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: !review.isVisible }),
      })
      if (!res.ok) throw new Error()
      mutate('/api/reviews?all=true')
      toast({
        title: !review.isVisible ? 'เปิดแสดงรีวิวแล้ว' : 'ซ่อนรีวิวแล้ว',
      })
    } catch {
      toast({ title: 'เกิดข้อผิดพลาด', variant: 'destructive' })
    } finally {
      setLoadingId(null)
    }
  }

  async function deleteReview(id: string) {
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      mutate('/api/reviews?all=true')
      toast({ title: 'ลบรีวิวสำเร็จ' })
    } catch {
      toast({ title: 'เกิดข้อผิดพลาด', variant: 'destructive' })
    }
  }

  const visible = reviews?.filter((r) => r.isVisible).length ?? 0
  const hidden = reviews?.filter((r) => !r.isVisible).length ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">จัดการรีวิว</h1>
        <p className="text-muted-foreground">เปิด/ปิดการแสดงผลรีวิวบนหน้าเว็บไซต์</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reviews?.length ?? '—'}</p>
                <p className="text-sm text-muted-foreground">รีวิวทั้งหมด</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                <Eye className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{visible}</p>
                <p className="text-sm text-muted-foreground">กำลังแสดง</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <EyeOff className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{hidden}</p>
                <p className="text-sm text-muted-foreground">ซ่อนอยู่</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>รายการรีวิว</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : !reviews?.length ? (
            <div className="py-12 text-center text-muted-foreground">
              <MessageSquare className="mx-auto mb-3 h-10 w-10 opacity-30" />
              <p>ยังไม่มีรีวิว</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อผู้รีวิว</TableHead>
                  <TableHead>คะแนน</TableHead>
                  <TableHead>ความคิดเห็น</TableHead>
                  <TableHead>วันที่</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review._id}>
                    <TableCell className="font-medium">{review.customerName}</TableCell>
                    <TableCell>
                      <StarDisplay rating={review.rating} />
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="line-clamp-2 text-sm text-muted-foreground">{review.comment}</p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(review.createdAt).toLocaleDateString('th-TH')}
                    </TableCell>
                    <TableCell>
                      {review.isVisible ? (
                        <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20">
                          แสดงอยู่
                        </Badge>
                      ) : (
                        <Badge variant="secondary">ซ่อนอยู่</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleVisibility(review)}
                          disabled={loadingId === review._id}
                        >
                          {review.isVisible ? (
                            <><EyeOff className="mr-1 h-3.5 w-3.5" /> ซ่อน</>
                          ) : (
                            <><Eye className="mr-1 h-3.5 w-3.5" /> เปิด</>
                          )}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>ลบรีวิวนี้?</AlertDialogTitle>
                              <AlertDialogDescription>
                                รีวิวของ <strong>{review.customerName}</strong> จะถูกลบถาวร ไม่สามารถกู้คืนได้
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive hover:bg-destructive/90"
                                onClick={() => deleteReview(review._id)}
                              >
                                ลบ
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
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
