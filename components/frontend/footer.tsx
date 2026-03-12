'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { Heart, Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react'

export function Footer() {
  const t = useTranslations('footer')
  const tNav = useTranslations('nav')

  const quickLinks = [
    { href: '/', label: tNav('home') },
    { href: '/services', label: tNav('services') },
    { href: '/booking', label: tNav('booking') },
    { href: '/tracking', label: tNav('tracking') },
  ]

  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">
                <span className="text-primary">Care</span>
                <span className="text-secondary">Plus</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">{t('description')}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-semibold text-foreground">{t('quickLinks')}</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 font-semibold text-foreground">{t('contactUs')}</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <span>02-xxx-xxxx</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <span>contact@careplus.co.th</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <span>123 ถนนสุขุมวิท กรุงเทพฯ 10110</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="mb-4 font-semibold text-foreground">{t('followUs')}</h3>
            <div className="flex gap-4">
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
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>
            &copy; {currentYear} CarePlus. {t('copyright')}.
          </p>
        </div>
      </div>
    </footer>
  )
}
