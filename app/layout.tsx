import type { Metadata } from 'next'
import { Noto_Sans_Thai, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/components/shared/auth-provider'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai', 'latin'],
  variable: '--font-noto-sans-thai',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'บริการดูแลผู้สูงอายุ | Elderly Care Services',
  description: 'บริการดูแลผู้สูงอายุอย่างครบวงจร ด้วยทีมงานที่มีความเชี่ยวชาญและใส่ใจในทุกรายละเอียด',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`${notoSansThai.variable} ${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </AuthProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
