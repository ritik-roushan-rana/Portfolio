import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import PointerFX from '@/components/interactive/PointerFX'
import ScrollProgress from '@/components/interactive/ScrollProgress'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ritik Roushan Rana | Cybersecurity Analyst & CSE Student',
  description:
    'Portfolio of Ritik Roushan Rana, a Computer Science student at VIT Vellore and IBM Cyber Security Analyst intern, building mobile and frontend applications.',
  keywords: [
    'Ritik Roushan Rana',
    'cybersecurity',
    'portfolio',
    'Flutter',
    'Next.js',
    'VIT Vellore',
  ],
  authors: [{ name: 'Ritik Roushan Rana' }],
  metadataBase: new URL('https://ritikrana-me.vercel.app'),
  openGraph: {
    title: 'Ritik Roushan Rana | Cybersecurity Analyst & CSE Student',
    description:
      'Portfolio of Ritik Roushan Rana, a Computer Science student at VIT Vellore and IBM Cyber Security Analyst intern.',
    url: 'https://ritikrana-me.vercel.app/',
    siteName: 'Ritik Roushan Rana',
    images: ['/preview.png'],
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body>
        <ScrollProgress />
        <PointerFX />
        {children}
      </body>
    </html>
  )
}
