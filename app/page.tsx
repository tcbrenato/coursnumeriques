import Link from 'next/link'
import {
  BookOpen, Award, Users, ChevronRight, Monitor, TrendingUp,
  Palette, Database, ShoppingCart, Camera, Briefcase, Shield,
  CheckCircle, ArrowRight, Globe, Clock, Star
} from 'lucide-react'

const categories = [
  { icon: Monitor, title: 'Développement Web' },
  { icon: TrendingUp, title: 'Marketing Digital' },
  { icon: Palette, title: 'Design Graphique' },
  { icon: Database, title: 'Data & Intelligence Artificielle' },
  { icon: ShoppingCart, title: 'E-commerce' },
  { icon: Camera, title: 'Photo & Vidéo' },
  { icon: Briefcase, title: 'Entrepreneuriat' },
  { icon: Shield, title: 'Cybersécurité' },
]

const features = [
  { icon: BookOpen, title: 'Cours 100% gratuits', desc: 'Accédez à tous les contenus sans frais. Apprenez à votre rythme.' },
  { icon: Award, title: 'Certification reconnue', desc: 'Obtenez un certificat officiel après validation de votre parcours.' },
  { icon: Globe, title: 'Accessible partout', desc: 'Depuis votre téléphone, tablette ou ordinateur, où que vous soyez.' },
  { icon: Clock, title: 'Flexible', desc: "Apprenez quand vous voulez, sans contrainte d'horaire." },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-white">

      {/* NAVBAR */}
      <nav style={{ borderBottom: '1px solid #e5e7eb', height: '65px' }} className="bg-white px-8 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div style={{ background: '#14532d' }} className="w-9 h-9 rounded-lg flex items-center justify-center">
            <BookOpen size={18} color="white" />
          </div>
          <span style={{ color: '#14532d' }} className="text-xl font-bold tracking-tight">CoursNumeriques</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/cours" style={{ color: '#374151' }} className="text-sm font-medium hover:opacity-70 transition-opacity">
            Formations
          </Link>
          <Link href="/cours" style={{ color: '#374151' }} className="text-sm font-medium hover:opacity-70 transition-opacity">
            Catégories
          </Link>
          <Link href="/cours" style={{ color: '#374151' }} className="text-sm font-medium hover:opacity-70 transition-opacity">
            Certifications
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" style={{ color: '#14532d', border: '1.5px solid #14532d' }} className="px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-80 transition-opacity">
            Connexion
          </Link>
          <Link href="/register" style={{ background: '#14532d', color: 'white' }} className="px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2">
            S'inscrire <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section
        style={{
          background: 'linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)',
          minHeight: 'calc(100vh - 65px)',
          display: 'flex',
          alignItems: 'center',
        }}
        className="text-white px-8"
      >
        <div className="max-w-6xl mx-auto w-full flex flex-col lg:flex-row items-center gap-10 py-10">

          {/* COLONNE GAUCHE — texte + boutons */}
          <div className="flex-1">
            <div
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
            >
              <Star size={14} />
              La plateforme e-learning dédiée à l'Afrique
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
              Maîtrisez les<br />
              <span style={{ color: '#86efac' }}>compétences digitales</span><br />
              de demain
            </h1>

            <p style={{ color: '#dcfce7' }} className="text-lg mb-8 max-w-xl leading-relaxed">
              Des formations pratiques et accessibles pour étudiants, jeunes professionnels et entrepreneurs.
              Certifiez vos compétences et boostez votre carrière.
            </p>

            <div className="flex gap-4 flex-wrap mb-10">
              <Link
                href="/cours"
                style={{ background: 'white', color: '#14532d' }}
                className="px-7 py-3.5 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                Découvrir les formations <ChevronRight size={16} />
              </Link>
              <Link
                href="/register"
                style={{ border: '2px solid rgba(255,255,255,0.5)', color: 'white' }}
                className="px-7 py-3.5 rounded-xl font-bold text-sm hover:opacity-80 transition-opacity"
              >
                Créer un compte gratuit
              </Link>
            </div>

            {/* STATS */}
            <div className="flex gap-10 flex-wrap">
              {[
                { value: '50+', label: 'Formations disponibles' },
                { value: '100%', label: 'Contenu gratuit' },
                { value: '5000+', label: 'Apprenants actifs' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div style={{ color: '#bbf7d0' }} className="text-xs mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* COLONNE DROITE — image */}
          <div className="flex-1 flex justify-center lg:justify-end">
            <div
              style={{
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 30px 80px rgba(0,0,0,0.35)',
                maxWidth: '480px',
                width: '100%',
              }}
            >
              <img
                src="/heroimage.png"
                alt="Apprenant CoursNumeriques"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          </div>

        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Pourquoi choisir CoursNumeriques ?</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">Une plateforme conçue pour répondre aux besoins réels du marché africain</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} style={{ border: '1px solid #e5e7eb' }} className="p-6 rounded-2xl hover:shadow-lg transition-shadow">
                <div style={{ background: '#f0fdf4', color: '#14532d' }} className="w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <f.icon size={22} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section style={{ background: '#f9fafb' }} className="py-20 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos domaines de formation</h2>
            <p className="text-gray-500 text-lg">Choisissez parmi nos parcours structurés par domaine</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                href="/cours"
                key={cat.title}
                style={{ border: '1px solid #e5e7eb', background: 'white' }}
                className="p-6 rounded-2xl text-center hover:shadow-md hover:border-green-300 transition-all group cursor-pointer block"
              >
                <div
                  style={{ background: '#f0fdf4', color: '#14532d' }}
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:bg-green-800 group-hover:text-white transition-colors"
                >
                  <cat.icon size={22} />
                </div>
                <div className="font-semibold text-gray-700 text-sm">{cat.title}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#14532d' }} className="py-20 px-8 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Prêt à développer vos compétences ?</h2>
          <p style={{ color: '#bbf7d0' }} className="text-lg mb-8">Rejoignez des milliers d'apprenants et commencez votre parcours dès aujourd'hui.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/register"
              style={{ background: 'white', color: '#14532d' }}
              className="px-8 py-4 rounded-xl font-bold text-base hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              Commencer gratuitement <ArrowRight size={18} />
            </Link>
            <Link
              href="/cours"
              style={{ border: '2px solid rgba(255,255,255,0.4)', color: 'white' }}
              className="px-8 py-4 rounded-xl font-bold text-base hover:opacity-80 transition-opacity flex items-center gap-2"
            >
              <BookOpen size={18} /> Voir les formations
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#111827', borderTop: '1px solid #1f2937' }} className="py-10 px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div style={{ background: '#14532d' }} className="w-8 h-8 rounded-lg flex items-center justify-center">
              <BookOpen size={16} color="white" />
            </div>
            <span style={{ color: '#f9fafb' }} className="font-bold">CoursNumeriques</span>
          </div>
          <div className="flex gap-6">
            <Link href="/cours" style={{ color: '#9ca3af' }} className="text-sm hover:text-white transition-colors">Formations</Link>
            <Link href="/login" style={{ color: '#9ca3af' }} className="text-sm hover:text-white transition-colors">Connexion</Link>
            <Link href="/register" style={{ color: '#9ca3af' }} className="text-sm hover:text-white transition-colors">S'inscrire</Link>
          </div>
          <p style={{ color: '#6b7280' }} className="text-sm">© 2025 CoursNumeriques</p>
        </div>
      </footer>

    </main>
  )
}