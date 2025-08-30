import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DuckSecure Auditor',
  description: 'Decentralized smart contract auditing on DuckChain using ChainGPT AI',
  keywords: 'blockchain, duckchain, smart contract, audit, security, chaingpt',
  manifest: '/manifest.json',
  other: {
    'msapplication-config': '/browserconfig.xml',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.svg', sizes: '32x32', type: 'image/svg+xml' },
      { url: '/favicon-16x16.svg', sizes: '16x16', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: '/apple-touch-icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
