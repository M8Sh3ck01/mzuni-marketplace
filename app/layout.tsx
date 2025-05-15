import './globals.css'
import { Inter } from 'next/font/google'
import AuthLayout from '@/components/layout/AuthLayout'

export const metadata = {
  title: 'Mzuni Marketplace',
  description: 'A student marketplace for Mzuzu University',
}

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthLayout>
          {children}
        </AuthLayout>
      </body>
    </html>
  )
}
