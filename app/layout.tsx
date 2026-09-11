import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Instrument_Serif } from 'next/font/google'
import Progress from '@/components/site/Progress'
import SmoothScroll from '@/components/site/SmoothScroll'
import FrameIntro from '@/components/site/FrameIntro'
import Cursor from '@/components/site/Cursor'
import Grain from '@/components/site/Grain'
import './globals.css'

/**
 * The display face. Geist carries the interface and the mono micro-labels; this
 * serif carries every oversized headline and the italic accents, and the
 * contrast between the two is most of the site's visual identity.
 */
const display = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Ritik Roushan Rana | Machine Learning Engineer',
  description:
    'Portfolio of Ritik Roushan Rana, a machine learning engineer working on deep reinforcement learning and computer vision, with an information security specialisation at VIT Vellore.',
  keywords: [
    'Ritik Roushan Rana',
    'machine learning engineer',
    'deep reinforcement learning',
    'computer vision',
    'PyTorch',
    'portfolio',
    'VIT Vellore',
  ],
  authors: [{ name: 'Ritik Roushan Rana' }],
  metadataBase: new URL('https://ritikrana-me.vercel.app'),
  openGraph: {
    title: 'Ritik Roushan Rana | Machine Learning Engineer',
    description:
      'Machine learning engineer working on deep reinforcement learning and computer vision, specialising in information security at VIT Vellore.',
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
      className={`${GeistSans.variable} ${GeistMono.variable} ${display.variable}`}
    >
      <body>
        {/* Chrome that belongs to the whole document rather than any one
            section: the scroll driver, the opening title card, the pointer,
            the grain plate and the read-progress hairline. */}
        <SmoothScroll />
        <FrameIntro />
        <Cursor />
        <Grain />
        <Progress />
        {children}
      </body>
    </html>
  )
}
