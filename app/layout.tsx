import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'
import { ProductProvider } from '@/context/ProductContext'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Smart Retail Intelligence',
  description: 'Device Launch Operations',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} bg-zinc-50 text-zinc-900 antialiased`}>
        <ProductProvider>
          <Sidebar />
          <main className="ml-0 md:ml-56 min-h-screen">
            {children}
          </main>
        </ProductProvider>
      </body>
    </html>
  )
}
