// @ts-nocheck
'use client'
import Link from 'next/link'
import { useEffect } from 'react'
import {
  BookOpen, Award, ChevronRight, Monitor, TrendingUp,
  Palette, ShoppingCart, Camera,
  ArrowRight, Globe, Clock, Star, Code2, Search, Settings,
  MessageSquare, Cpu, LayoutGrid
} from 'lucide-react'

const categories = [
  { icon: TrendingUp,    title: 'Stratégie Digitale & Marketing',         code: 'F01', duration: '5 mois' },
  { icon: Palette,       title: 'Design & Création Visuelle',              code: 'F02', duration: '3 mois' },
  { icon: Code2,         title: 'Développement Web',                       code: 'F03', duration: '5 mois' },
  { icon: ShoppingCart,  title: 'E-commerce & Business Digital',           code: 'F04', duration: '3 mois' },
  { icon: Settings,      title: 'No-code & Automatisation',                code: 'F05', duration: '3 mois' },
  { icon: Search,        title: 'SEO & Analyse Web',                       code: 'F06', duration: '3 mois' },
  { icon: LayoutGrid,    title: 'Gestion de Projet Numérique',             code: 'F07', duration: '3 mois' },
  { icon: Camera,        title: 'Création de Contenu',                     code: 'F08', duration: '3 mois' },
  { icon: MessageSquare, title: 'Communication & Rédaction Pro',           code: 'F09', duration: '3 mois' },
  { icon: Globe,         title: "Gestion de l'Expérience Digitale",       code: 'F10', duration: '5 mois' },
  { icon: Cpu,           title: 'Vibe Coding & Intelligence Artificielle', code: 'F11', duration: '5 mois' },
  { icon: Monitor,       title: 'Informatique & Bureautique',              code: 'F12', duration: '3 mois' },
]

const features = [
  { icon: BookOpen, title: 'Formations certifiantes',  desc: 'Obtenez une certification officielle valorisable sur votre CV et LinkedIn.' },
  { icon: Award,    title: 'Stage inclus',              desc: 'Un stage professionnel est inclus à la fin de chaque parcours de formation.' },
  { icon: Globe,    title: 'En ligne & Présentiel',     desc: 'Cours en visio, ressources en ligne et sessions en salle à Cotonou.' },
  { icon: Clock,    title: '100% Pratique',             desc: 'Projets réels, exercices concrets et livrables professionnels à chaque module.' },
]

export default function Home() {

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('cta-visible')
          }
        })
      },
      { threshold: 0.15 }
    )
    const els = document.querySelectorAll('.cta-animate')
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <main className="min-h-screen bg-white">
      <style>{`
        .cta-animate {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.55s ease, transform 0.55s ease;
        }
        .cta-animate.cta-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .cta-animate:nth-child(2) { transition-delay: 0.12s; }
        .cta-animate:nth-child(3) { transition-delay: 0.24s; }

        .btn-hover {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          display: inline-flex;
          align-items: center;
        }
        .btn-hover:hover {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 8px 28px rgba(0,0,0,0.2);
        }
        .btn-hover:active {
          transform: translateY(0) scale(0.98);
        }

        .cat-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .cat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 14px 30px rgba(20,83,45,0.13);
          border-color: #86efac !important;
        }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ borderBottom: '1px solid #e5e7eb', height: '65px' }} className="bg-white px-8 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div style={{ background: '#14532d' }} className="w-9 h-9 rounded-lg flex items-center justify-center">
            <BookOpen size={18} color="white" />
          </div>
          <span style={{ color: '#14532d' }} className="text-xl font-bold tracking-tight">CoursNumeriques</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/cours" style={{ color: '#374151' }} className="text-sm font-medium hover:opacity-70 transition-opacity">Formations</Link>
          <Link href="/cours" style={{ color: '#374151' }} className="text-sm font-medium hover:opacity-70 transition-opacity">Catégories</Link>
          <Link href="/cours" style={{ color: '#374151' }} className="text-sm font-medium hover:opacity-70 transition-opacity">Certifications</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" style={{ color: '#14532d', border: '1.5px solid #14532d' }} className="btn-hover px-4 py-2 rounded-lg text-sm font-semibold">
            Connexion
          </Link>
          <Link href="/register" style={{ background: '#14532d', color: 'white' }} className="btn-hover px-4 py-2 rounded-lg text-sm font-semibold gap-2">
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
              Des formations pratiques, certifiantes et orientées terrain pour étudiants,
              jeunes professionnels et entrepreneurs. En ligne & en présentiel à Cotonou.
            </p>

            <div className="flex gap-4 flex-wrap mb-10">
              <Link href="/cours" style={{ background: 'white', color: '#14532d' }} className="btn-hover px-7 py-3.5 rounded-xl font-bold text-sm gap-2">
                Découvrir les formations <ChevronRight size={16} />
              </Link>
              <Link href="/register" style={{ border: '2px solid rgba(255,255,255,0.5)', color: 'white' }} className="btn-hover px-7 py-3.5 rounded-xl font-bold text-sm">
                Créer un compte gratuit
              </Link>
            </div>

            {/* STATS */}
            <div className="flex gap-10 flex-wrap">
              {[
                { value: '12',   label: 'Formations disponibles' },
                { value: '60+',  label: 'Compétences couvertes' },
                { value: '100%', label: 'Certifié & Stage inclus' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div style={{ color: '#bbf7d0' }} className="text-xs mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 flex justify-center lg:justify-end">
            <div style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.35)', maxWidth: '480px', width: '100%' }}>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos 12 domaines de formation</h2>
            <p className="text-gray-500 text-lg">Formations pratiques, certifiantes — en ligne & en présentiel à Cotonou</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                href="/cours"
                key={cat.code}
                style={{ border: '1px solid #e5e7eb', background: 'white' }}
                className="cat-card p-5 rounded-2xl text-center block"
              >
                <div
                  style={{ background: '#f0fdf4', color: '#14532d' }}
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 mx-auto"
                >
                  <cat.icon size={20} />
                </div>
                <div className="font-semibold text-gray-700 text-xs leading-snug mb-1">{cat.title}</div>
                <div className="text-xs font-medium" style={{ color: '#14532d' }}>{cat.duration}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#14532d' }} className="py-20 px-8 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 cta-animate">Prêt à développer vos compétences ?</h2>
          <p style={{ color: '#bbf7d0' }} className="text-lg mb-8 cta-animate">
            Rejoignez nos apprenants et commencez votre parcours dès aujourd'hui. Certification officielle + stage inclus.
          </p>
          <div className="flex gap-4 justify-center flex-wrap cta-animate">
            <Link
              href="/register"
              style={{ background: 'white', color: '#14532d' }}
              className="btn-hover px-8 py-4 rounded-xl font-bold text-base gap-2"
            >
              Commencer maintenant <ArrowRight size={18} />
            </Link>
            <Link
              href="/cours"
              style={{ border: '2px solid rgba(255,255,255,0.4)', color: 'white' }}
              className="btn-hover px-8 py-4 rounded-xl font-bold text-base gap-2"
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
            <Link href="/cours"    style={{ color: '#9ca3af' }} className="text-sm hover:text-white transition-colors">Formations</Link>
            <Link href="/login"    style={{ color: '#9ca3af' }} className="text-sm hover:text-white transition-colors">Connexion</Link>
            <Link href="/register" style={{ color: '#9ca3af' }} className="text-sm hover:text-white transition-colors">S'inscrire</Link>
          </div>
          <p style={{ color: '#6b7280' }} className="text-sm">© 2025 CoursNumeriques — Cellule Numérique × CRF Perfection</p>
        </div>
      </footer>

    </main>
  )
}