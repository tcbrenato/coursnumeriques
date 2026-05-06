import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Les options 'eslint' et 'typescript' directes sont obsolètes 
     dans les dernières versions de next.config.ts. 
     On les simplifie pour éviter les erreurs de build. */
  
  // Cette option permet à Turbopack (ton moteur de build) de compiler plus vite
  experimental: {
    // Tu peux ajouter des options expérimentales ici si besoin
  },

  // On garde une configuration propre sans les clés qui font rouspéter Netlify
};

export default nextConfig;