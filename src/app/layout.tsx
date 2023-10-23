import type { Metadata } from 'next';
import '#/styles/globals.scss';

export const metadata: Metadata = {
  title: 'Ask my book: The minimalist entrepeneur',
  description: 'Ask questions about my book',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
