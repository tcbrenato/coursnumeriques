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
  { icon: TrendingUp,    title: 'Stratégie Digitale & Marketing',        code: 'F01', duration: '5 mois' },
  { icon: Palette,       title: 'Design & Création Visuelle',              code: 'F02', duration: '3 mois' },
  { icon: Code2,         title: 'Développement Web',                       code: 'F03', duration: '5 mois' },
  { icon: ShoppingCart,  title: 'E-commerce & Business Digital',            code: 'F04', duration: '3 mois' },
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
    <main className="min-h-screen bg-white font-sans antialiased">
      <style>{`
        .cta-animate {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .cta-animate.cta-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .cta-animate:nth-child(2) { transition-delay: 0.1s; }
        .cta-animate:nth-child(3) { transition-delay: 0.2s; }

        .btn-hover {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .btn-hover:hover {
          transform: translateY(-2px);
          filter: brightness(1.1);
          box-shadow: 0 10px 20px -5px rgba(20, 83, 45, 0.3);
        }
        .btn-hover:active {
          transform: translateY(0) scale(0.97);
        }

        .cat-card {
          transition: all 0.3s ease;
          border: 1px solid #f1f5f9;
        }
        .cat-card:hover {
          transform: translateY(-8px);
          background: white !important;
          box-shadow: 0 20px 40px -12px rgba(20, 83, 45, 0.12);
          border-color: #86efac !important;
        }
        .hero-gradient {
          background: linear-gradient(135deg, #064e3b 0%, #14532d 50%, #166534 100%);
        }
      `}</style>

      {/* NAVBAR */}
      <nav className="bg-white/95 backdrop-blur-sm px-6 md:px-12 flex justify-between items-center sticky top-0 z-50 border-b border-gray-100 h-[70px]">
        <div className="flex items-center gap-3">
          <div className="bg-[#14532d] w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/20">
            <BookOpen size={20} color="white" />
          </div>
          <span className="text-xl font-extrabold text-[#14532d] tracking-tight italic">CoursNumeriques</span>
        </div>
        <div className="hidden md:flex items-center gap-10">
          {['Formations', 'Catégories', 'Certifications'].map((item) => (
            <Link key={item} href="/cours" className="text-sm font-bold text-gray-600 hover:text-[#14532d] transition-colors">{item}</Link>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-[#14532d] font-bold text-sm px-4 py-2 hover:opacity-70 transition-opacity">
            Connexion
          </Link>
          <Link href="/register" className="bg-[#14532d] text-white btn-hover px-6 py-2.5 rounded-full text-sm font-bold gap-2">
            S'inscrire <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero-gradient text-white px-6 md:px-12 py-16 md:py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-widest mb-8">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              E-learning nouvelle génération
            </div>

            <h1 className="text-5xl md:text-6xl font-black mb-6 leading-[1.1]">
              Maîtrisez les <br />
              <span className="text-[#86efac]">outils digitaux</span> <br />
              qui comptent.
            </h1>

            <p className="text-emerald-50/80 text-lg md:text-xl mb-10 max-w-xl leading-relaxed font-medium">
              Formations immersives et certifiantes conçues pour propulser votre carrière au Bénin et à l'international.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/cours" className="bg-white text-[#14532d] btn-hover px-8 py-4 rounded-2xl font-bold text-base shadow-xl">
                Voir le catalogue <ChevronRight size={18} />
              </Link>
              <Link href="/register" className="border-2 border-white/30 text-white btn-hover px-8 py-4 rounded-2xl font-bold text-base backdrop-blur-sm">
                Essai gratuit
              </Link>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="relative z-10 w-full max-w-[500px]">
              <div className="absolute inset-0 bg-emerald-400/20 rounded-[40px] blur-2xl transform rotate-6"></div>
              <img
                src="/heroimage.png"
                alt="CoursNumeriques"
                className="relative rounded-[32px] shadow-2xl border-4 border-white/10 w-full object-cover aspect-[4/3]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f) => (
              <div key={f.title} className="group p-8 rounded-3xl bg-gray-50 hover:bg-white border border-transparent hover:border-emerald-100 transition-all duration-300">
                <div className="bg-white group-hover:bg-emerald-600 text-emerald-900 group-hover:text-white w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:shadow-lg group-hover:shadow-emerald-200 transition-all">
                  <f.icon size={24} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-3">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-24 px-6 md:px-12 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Explorez nos pôles d'expertise</h2>
            <div className="w-20 h-1.5 bg-[#14532d] mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link
                href="/cours"
                key={cat.code}
                className="cat-card p-6 rounded-[24px] bg-white text-center flex flex-col items-center justify-center gap-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#14532d] flex items-center justify-center">
                  <cat.icon size={26} />
                </div>
                <div>
                  <div className="font-bold text-gray-800 text-xs uppercase tracking-tighter mb-1 px-2">{cat.title}</div>
                  <div className="text-[10px] font-black text-emerald-600 bg-emerald-50 inline-block px-3 py-1 rounded-full uppercase tracking-widest">{cat.duration}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-4xl mx-auto bg-[#14532d] rounded-[40px] p-12 md:p-20 relative overflow-hidden shadow-2xl shadow-emerald-900/40">
           <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-10 left-10 w-32 h-32 border-8 border-white rounded-full"></div>
              <div className="absolute bottom-10 right-10 w-48 h-48 border-8 border-white rounded-full"></div>
           </div>
           
           <h2 className="text-3xl md:text-5xl font-black text-white mb-6 cta-animate tracking-tight">Prêt à transformer votre avenir ?</h2>
           <p className="text-emerald-100 text-lg md:text-xl mb-12 cta-animate font-medium opacity-90">
             Rejoignez la communauté CoursNumeriques et obtenez des compétences concrètes validées par des professionnels.
           </p>
           <div className="flex flex-col sm:flex-row gap-4 justify-center cta-animate">
             <Link href="/register" className="bg-white text-[#14532d] btn-hover px-10 py-5 rounded-2xl font-black text-lg">
               S'inscrire maintenant
             </Link>
             <Link href="/cours" className="bg-emerald-800/50 text-white border border-white/20 btn-hover px-10 py-5 rounded-2xl font-bold text-lg">
               Nous contacter
             </Link>
           </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white py-16 px-6 md:px-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 items-center text-center md:text-left">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2">
               <div className="bg-[#14532d] w-8 h-8 rounded-lg flex items-center justify-center">
                 <BookOpen size={16} color="white" />
               </div>
               <span className="font-black text-gray-900 tracking-tighter italic">CoursNumeriques</span>
            </div>
            <p className="text-gray-400 text-xs font-medium max-w-[250px]">L'excellence pédagogique au service de la transformation digitale en Afrique.</p>
          </div>
          <div className="flex justify-center gap-8 font-bold text-sm text-gray-500">
             <Link href="/cours" className="hover:text-[#14532d] transition-colors">Formations</Link>
             <Link href="/login" className="hover:text-[#14532d] transition-colors">Connexion</Link>
             <Link href="/register" className="hover:text-[#14532d] transition-colors">Confidentialité</Link>
          </div>
          <div className="text-gray-400 text-[10px] font-bold uppercase tracking-widest md:text-right">
            © 2026 CoursNumeriques — By ASO-NUM
          </div>
        </div>
      </footer>
    </main>
  )
}