import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'StockSight — AI-Powered Stock Analysis',
    template: '%s | StockSight',
  },
  description:
    'Analyze stocks, explore market trends, view historical performance, and see data-driven forecasts. For informational purposes only — not financial advice.',
  keywords: ['stock analysis', 'market data', 'stock prediction', 'portfolio tracking', 'financial dashboard'],
  authors: [{ name: 'StockSight' }],
  openGraph: {
    title: 'StockSight — AI-Powered Stock Analysis',
    description: 'A professional stock analysis and market intelligence platform.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
