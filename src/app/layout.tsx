import '../../styles/global.css'

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>Meditation App</title>
        <meta name="description" content="Local-first meditation session feature" />
      </head>
      <body>{children}</body>
    </html>
  )
}
