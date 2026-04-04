import type { Metadata } from 'next'
import { Sora, DM_Sans } from 'next/font/google'
import './globals.css'

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'FinanceAI — Smart Money Manager',
  description: 'Track expenses, manage budgets, and get AI-powered insights for your personal finances.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${dmSans.variable} font-body bg-[#090e1a] text-white antialiased`}>
        {children}
      </body>
    </html>
  )
}
