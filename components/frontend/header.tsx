'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/routing'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/shared/language-switcher'
import { Menu, X, Sun, Moon, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Header() {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { href: '/', label: t('home') },
    { href: '/services', label: t('services') },
    { href: '/booking', label: t('booking') },
    { href: '/tracking', label: t('tracking') },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">
            <span className="text-primary">Care</span>
            <span className="text-secondary">Plus</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                isActive(item.href) ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t bg-card lg:hidden">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                    isActive(item.href)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
