import { Header } from '@/components/frontend/header'
import { Footer } from '@/components/frontend/footer'

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
