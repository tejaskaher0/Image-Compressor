import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Image Compressor',
  description: 'Compress and enhance your images easily',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="/new.ico?v=2" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
