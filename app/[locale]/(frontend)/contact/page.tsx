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
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Facebook,
  Instagram,
  Twitter,
  Send,
  CheckCircle,
  MessageCircle,
  HeadphonesIcon,
} from 'lucide-react'

export default function ContactPage() {
  const locale = useLocale() as 'th' | 'en'
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const t = {
    hero: {
      title: locale === 'th' ? 'ติดต่อเรา' : 'Contact Us',
      subtitle:
        locale === 'th'
          ? 'เราพร้อมให้คำปรึกษาและตอบทุกคำถามของคุณ'
          : 'We are ready to consult and answer all your questions',
    },
    info: {
      title: locale === 'th' ? 'ข้อมูลติดต่อ' : 'Contact Information',
      phone: locale === 'th' ? 'โทรศัพท์' : 'Phone',
      email: locale === 'th' ? 'อีเมล' : 'Email',
      address: locale === 'th' ? 'ที่อยู่' : 'Address',
      hours: locale === 'th' ? 'เวลาทำการ' : 'Working Hours',
      hoursValue:
        locale === 'th'
          ? 'จันทร์ – อาทิตย์ 8:00 – 20:00 น.\nสายด่วน 24 ชั่วโมง'
          : 'Mon – Sun 8:00 AM – 8:00 PM\n24-Hour Hotline Available',
      addressValue:
        locale === 'th'
          ? '123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110'
          : '123 Sukhumvit Road, Khlong Toei, Bangkok 10110',
    },
    form: {
      title: locale === 'th' ? 'ส่งข้อความหาเรา' : 'Send Us a Message',
      name: locale === 'th' ? 'ชื่อ-นามสกุล' : 'Full Name',
      phone: locale === 'th' ? 'เบอร์โทรศัพท์' : 'Phone Number',
      email: locale === 'th' ? 'อีเมล (ไม่บังคับ)' : 'Email (Optional)',
      subject: locale === 'th' ? 'หัวข้อ' : 'Subject',
      message: locale === 'th' ? 'ข้อความ' : 'Message',
      submit: locale === 'th' ? 'ส่งข้อความ' : 'Send Message',
      submitting: locale === 'th' ? 'กำลังส่ง...' : 'Sending...',
      namePlaceholder: locale === 'th' ? 'กรอกชื่อ-นามสกุล' : 'Enter your full name',
      phonePlaceholder: locale === 'th' ? '08X-XXX-XXXX' : '08X-XXX-XXXX',
      emailPlaceholder: locale === 'th' ? 'example@email.com' : 'example@email.com',
      subjectPlaceholder:
        locale === 'th' ? 'เช่น สอบถามบริการดูแลผู้สูงอายุ' : 'e.g. Inquiry about elderly care services',
      messagePlaceholder:
        locale === 'th' ? 'กรุณาระบุรายละเอียดที่ต้องการ...' : 'Please describe your inquiry in detail...',
    },
    successTitle: locale === 'th' ? 'ส่งข้อความสำเร็จ!' : 'Message Sent!',
    successDesc:
      locale === 'th'
        ? 'ทีมงานของเราจะติดต่อกลับภายใน 24 ชั่วโมง'
        : 'Our team will get back to you within 24 hours.',
    successBack: locale === 'th' ? 'ส่งข้อความอีกครั้ง' : 'Send Another Message',
    channels: {
      title: locale === 'th' ? 'ช่องทางอื่นๆ' : 'Other Channels',
      line: {
        label: 'LINE Official',
        value: '@careplus',
        desc: locale === 'th' ? 'ตอบกลับเร็วที่สุด' : 'Fastest response',
      },
      facebook: {
        label: 'Facebook',
        value: 'CarePlus Thailand',
        desc: locale === 'th' ? 'ติดตามข่าวสาร' : 'Follow our updates',
      },
      call: {
        label: locale === 'th' ? 'โทรหาเรา' : 'Call Us',
        value: '02-xxx-xxxx',
        desc: locale === 'th' ? 'บริการ 24 ชั่วโมง' : '24-hour service',
      },
    },
    cta: {
      title:
        locale === 'th'
          ? 'ต้องการจองบริการทันที?'
          : 'Ready to Book a Service?',
      desc:
        locale === 'th'
          ? 'ไม่ต้องรอ สามารถจองบริการออนไลน์ได้เลย'
          : 'No need to wait — book a service online now.',
      button: locale === 'th' ? 'จองบริการ' : 'Book Now',
    },
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.name || !formData.phone || !formData.message) {
      toast({
        title: locale === 'th' ? 'กรุณากรอกข้อมูลให้ครบถ้วน' : 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }
    setIsSubmitting(true)
    // Simulate submission (no backend endpoint needed for contact form)
    await new Promise((r) => setTimeout(r, 1000))
    setIsSubmitting(false)
    setIsSubmitted(true)
    toast({
      title: t.successTitle,
      description: t.successDesc,
    })
  }

  const contactItems = [
    {
      icon: Phone,
      label: t.info.phone,
      value: '02-xxx-xxxx',
      href: 'tel:02-xxx-xxxx',
      color: 'text-primary bg-primary/10',
    },
    {
      icon: Mail,
      label: t.info.email,
      value: 'contact@careplus.co.th',
      href: 'mailto:contact@careplus.co.th',
      color: 'text-secondary bg-secondary/10',
    },
    {
      icon: MapPin,
      label: t.info.address,
      value: t.info.addressValue,
      href: 'https://maps.google.com',
      color: 'text-primary bg-primary/10',
    },
    {
      icon: Clock,
      label: t.info.hours,
      value: t.info.hoursValue,
      href: null,
      color: 'text-secondary bg-secondary/10',
    },
  ]

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center rounded-full border bg-card px-4 py-2 text-sm mb-6">
              <MessageCircle className="mr-2 h-4 w-4 text-secondary" />
              <span className="text-muted-foreground">
                {locale === 'th' ? 'เราพร้อมช่วยเหลือคุณ' : 'We are here to help'}
              </span>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              {t.hero.title}
            </h1>
            <p className="text-lg text-muted-foreground">{t.hero.subtitle}</p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {contactItems.map((item) => (
            <Card key={item.label} className="transition-all hover:shadow-lg hover:shadow-primary/5">
              <CardContent className="p-6">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${item.color}`}
                >
                  <item.icon className="h-6 w-6" />
                </div>
                <p className="mt-4 text-sm font-medium text-muted-foreground">{item.label}</p>
                {item.href ? (
                  <a
                    href={item.href}
                    className="mt-1 block whitespace-pre-line text-sm font-semibold text-foreground transition-colors hover:text-primary"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="mt-1 whitespace-pre-line text-sm font-semibold text-foreground">
                    {item.value}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Form + Side Info */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-10 lg:grid-cols-5">
            {/* Contact Form */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{t.form.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <div className="flex flex-col items-center py-12 text-center">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
                        <CheckCircle className="h-10 w-10 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground">{t.successTitle}</h3>
                      <p className="mt-2 text-muted-foreground">{t.successDesc}</p>
                      <Button
                        className="mt-8"
                        variant="outline"
                        onClick={() => {
                          setIsSubmitted(false)
                          setFormData({ name: '', phone: '', email: '', subject: '', message: '' })
                        }}
                      >
                        {t.successBack}
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">
                            {t.form.name} <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder={t.form.namePlaceholder}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">
                            {t.form.phone} <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder={t.form.phonePlaceholder}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{t.form.email}</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder={t.form.emailPlaceholder}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">{t.form.subject}</Label>
                        <Input
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder={t.form.subjectPlaceholder}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">
                          {t.form.message} <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder={t.form.messagePlaceholder}
                          rows={5}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                        {isSubmitting ? (
                          t.form.submitting
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            {t.form.submit}
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Side Panel */}
            <div className="space-y-6 lg:col-span-2">
              {/* Other Channels */}
              <Card>
                <CardHeader>
                  <CardTitle>{t.channels.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* LINE */}
                  <div className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-500/10">
                      <MessageCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.channels.line.label}</p>
                      <p className="text-sm text-primary">{t.channels.line.value}</p>
                      <p className="text-xs text-muted-foreground">{t.channels.line.desc}</p>
                    </div>
                  </div>
                  {/* Facebook */}
                  <div className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
                      <Facebook className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.channels.facebook.label}</p>
                      <p className="text-sm text-primary">{t.channels.facebook.value}</p>
                      <p className="text-xs text-muted-foreground">{t.channels.facebook.desc}</p>
                    </div>
                  </div>
                  {/* Call */}
                  <a href="tel:02-xxx-xxxx" className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <HeadphonesIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.channels.call.label}</p>
                      <p className="text-sm text-primary">{t.channels.call.value}</p>
                      <p className="text-xs text-muted-foreground">{t.channels.call.desc}</p>
                    </div>
                  </a>
                  {/* Social Icons */}
                  <div className="flex gap-3 pt-2">
                    <a
                      href="#"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      <Facebook className="h-5 w-5" />
                    </a>
                    <a
                      href="#"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/20 text-secondary transition-colors hover:bg-secondary hover:text-secondary-foreground"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                    <a
                      href="#"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Map placeholder */}
              <Card className="overflow-hidden">
                <div className="relative h-48 bg-muted flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
                  <div className="relative text-center">
                    <MapPin className="mx-auto h-10 w-10 text-primary/40" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      {locale === 'th' ? '123 ถนนสุขุมวิท กรุงเทพฯ' : '123 Sukhumvit Road, Bangkok'}
                    </p>
                    <a
                      href="https://maps.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-xs text-primary underline underline-offset-2"
                    >
                      {locale === 'th' ? 'เปิดใน Google Maps' : 'Open in Google Maps'}
                    </a>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="overflow-hidden bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <CardContent className="p-8 lg:p-12">
            <div className="grid items-center gap-8 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold lg:text-4xl">{t.cta.title}</h2>
                <p className="mt-4 text-primary-foreground/90">{t.cta.desc}</p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row lg:justify-end">
                <Button asChild size="lg" variant="secondary">
                  <Link href="/booking">{t.cta.button}</Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <a href="tel:02-xxx-xxxx">
                    <Phone className="mr-2 h-4 w-4" />
                    02-xxx-xxxx
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
