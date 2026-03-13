'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import { Link } from '@/i18n/routing'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Star, CheckCircle, MessageSquare } from 'lucide-react'

export default function ReviewPage() {
  const locale = useLocale() as 'th' | 'en'
  const { toast } = useToast()
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({ customerName: '', comment: '' })

  const t = {
    hero: {
      title: locale === 'th' ? 'แสดงความคิดเห็น' : 'Leave a Review',
      subtitle: locale === 'th'
        ? 'ความคิดเห็นของคุณช่วยให้เราพัฒนาการบริการให้ดียิ่งขึ้น'
        : 'Your feedback helps us improve our services',
    },
    form: {
      title: locale === 'th' ? 'เขียนรีวิว' : 'Write a Review',
      name: locale === 'th' ? 'ชื่อ-นามสกุล' : 'Full Name',
      namePlaceholder: locale === 'th' ? 'กรอกชื่อของคุณ' : 'Enter your name',
      rating: locale === 'th' ? 'คะแนน' : 'Rating',
      comment: locale === 'th' ? 'ความคิดเห็น' : 'Comment',
      commentPlaceholder: locale === 'th'
        ? 'แชร์ประสบการณ์การใช้บริการของคุณ...'
        : 'Share your experience with our service...',
      submit: locale === 'th' ? 'ส่งรีวิว' : 'Submit Review',
      submitting: locale === 'th' ? 'กำลังส่ง...' : 'Submitting...',
    },
    success: {
      title: locale === 'th' ? 'ขอบคุณสำหรับรีวิว!' : 'Thank you for your review!',
      desc: locale === 'th'
        ? 'รีวิวของคุณได้รับการบันทึกแล้ว และจะแสดงบนเว็บไซต์หลังจากผ่านการตรวจสอบ'
        : 'Your review has been saved and will appear on the website after review.',
      back: locale === 'th' ? 'กลับหน้าแรก' : 'Back to Home',
    },
    ratingLabels: locale === 'th'
      ? ['', 'แย่มาก', 'พอใช้', 'ดี', 'ดีมาก', 'ยอดเยี่ยม']
      : ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'],
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.customerName || !rating || !formData.comment) {
      toast({
        title: locale === 'th' ? 'กรุณากรอกข้อมูลให้ครบถ้วนและให้คะแนน' : 'Please fill all fields and select a rating',
        variant: 'destructive',
      })
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, rating }),
      })
      if (!res.ok) throw new Error()
      setIsSubmitted(true)
    } catch {
      toast({
        title: locale === 'th' ? 'เกิดข้อผิดพลาด กรุณาลองใหม่' : 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center rounded-full border bg-card px-4 py-2 text-sm mb-6">
              <MessageSquare className="mr-2 h-4 w-4 text-secondary" />
              <span className="text-muted-foreground">
                {locale === 'th' ? 'เสียงจากลูกค้า' : 'Customer Voices'}
              </span>
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              {t.hero.title}
            </h1>
            <p className="text-lg text-muted-foreground">{t.hero.subtitle}</p>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{t.form.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {isSubmitted ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
                    <CheckCircle className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">{t.success.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-sm">{t.success.desc}</p>
                  <Button asChild className="mt-8">
                    <Link href="/">{t.success.back}</Link>
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="customerName">
                      {t.form.name} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      placeholder={t.form.namePlaceholder}
                      required
                    />
                  </div>

                  {/* Star Rating */}
                  <div className="space-y-2">
                    <Label>
                      {t.form.rating} <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setRating(s)}
                            onMouseEnter={() => setHovered(s)}
                            onMouseLeave={() => setHovered(0)}
                            className="transition-transform hover:scale-110 focus:outline-none"
                          >
                            <Star
                              className={`h-8 w-8 transition-colors ${
                                s <= (hovered || rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-muted-foreground/30 hover:text-yellow-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      {(hovered || rating) > 0 && (
                        <span className="text-sm font-medium text-foreground">
                          {t.ratingLabels[hovered || rating]}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="space-y-2">
                    <Label htmlFor="comment">
                      {t.form.comment} <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="comment"
                      value={formData.comment}
                      onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                      placeholder={t.form.commentPlaceholder}
                      rows={4}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? t.form.submitting : t.form.submit}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
