import './globals.css'

export const metadata = {
  title: 'Ilm Hub - Islamic Educational Platform',
  description: 'Access Islamic knowledge, books, courses, and lectures',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
