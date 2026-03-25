import './globals.css'

export const metadata = {
  title: 'CoursNumeriques - Formations digitales',
  description: 'Plateforme e-learning de compétences digitales',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}