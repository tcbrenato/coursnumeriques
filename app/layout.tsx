// @ts-nocheck
import './globals.css'
import Script from 'next/script' // Importation du moteur de scripts de Next.js
import { ReactNode } from 'react'

export const metadata = {
  title: 'CoursNumeriques - Formations digitales',
  description: 'Plateforme e-learning de compétences digitales',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        {children}

        {/* On charge le script Kkiapay ici. 
          'afterInteractive' signifie qu'il se charge juste après 
          que la page soit devenue utilisable, pour garder ton site rapide.
        */}
        <Script 
          src="https://cdn.kkiapay.me/k.js" 
          strategy="afterInteractive" 
        />
      </body>
    </html>
  )
}