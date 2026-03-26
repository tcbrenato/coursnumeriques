'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  BookOpen, Search, Filter, ChevronRight, Clock,
  Users, Star, ArrowLeft, Monitor, TrendingUp,
  Palette, Database, ShoppingCart, Camera, Briefcase, Shield
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Course {
  id: string
  title: string
  description?: string
  category?: string
  is_published: boolean
}

const categories = [
  { label: 'Tous', value: '' },
  { label: 'Développement Web', value: 'dev', icon: Monitor },
  { label: 'Marketing Digital', value: 'marketing', icon: TrendingUp },
  { label: 'Design', value: 'design', icon: Palette },
  { label: 'Data & IA', value: 'data', icon: Database },
  { label: 'E-commerce', value: 'ecommerce', icon: ShoppingCart },
  { label: 'Photo & Vidéo', value: 'media', icon: Camera },
  { label: 'Entrepreneuriat', value: 'business', icon: Briefcase },
  { label: 'Cybersécurité', value: 'cyber', icon: Shield },
]

export default function Cours() {
  const [courses, setCourses] = useState<Course[]>([])
  const [filtered, setFiltered] = useState<Course[]>([])
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      const { data } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
      setCourses(data || [])
      setFiltered(data || [])
      setLoading(false)
    }
    fetchCourses()
  }, [])

  useEffect(() => {
    let result = courses
    if (activeCategory) {
      result = result.filter(c => c.category === activeCategory)
    }
    if (search) {
      result = result.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase())
      )
    }
    setFiltered(result)
  }, [search, activeCategory, courses])

  return (
    <div className="min-h-screen" style={{background: '#f9fafb'}}>

      {/* NAVBAR */}
      <nav className="bg-white sticky top-0 z-50 px-8 py-4 flex justify-between items-center" style={{borderBottom: '1px solid #e5e7eb'}}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{background: '#14532d'}}>
            <BookOpen size={18} color="white" />
          </div>
          <span className="text-xl font-bold" style={{color: '#14532d'}}>CoursNumeriques</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900">Accueil</Link>
          <Link href="/cours" className="text-sm font-semibold" style={{color: '#14532d'}}>Formations</Link>
          <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900">Mon espace</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="px-4 py-2 rounded-lg text-sm font-semibold" style={{color: '#14532d', border: '1.5px solid #14532d'}}>
            Connexion
          </Link>
          <Link href="/register" className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{background: '#14532d'}}>
            S'inscrire
          </Link>
        </div>
      </nav>

      {/* HEADER */}
      <div style={{background: 'linear-gradient(135deg, #14532d 0%, #166534 60%, #15803d 100%)'}}>
        <div className="max-w-6xl mx-auto px-8 py-16 text-white">
          <Link href="/" className="inline-flex items-center gap-2 text-sm mb-6 hover:opacity-80" style={{color: '#bbf7d0'}}>
            <ArrowLeft size={16} /> Retour à l'accueil
          </Link>
          <h1 className="text-4xl font-bold mb-4">Catalogue de formations</h1>
          <p style={{color: '#dcfce7'}} className="text-lg mb-8">
            Découvrez nos formations gratuites pour développer vos compétences digitales.
          </p>

          {/* SEARCH */}
          <div className="relative max-w-xl">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{color: '#9ca3af'}} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une formation..."
              className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none text-gray-900"
              style={{background: 'white', border: 'none'}}
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-10">

        {/* CATEGORIES */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: activeCategory === cat.value ? '#14532d' : 'white',
                color: activeCategory === cat.value ? 'white' : '#374151',
                border: activeCategory === cat.value ? '1.5px solid #14532d' : '1.5px solid #e5e7eb',
              }}
            >
              {cat.icon && <cat.icon size={14} />}
              {cat.label}
            </button>
          ))}
        </div>

        {/* RESULTS COUNT */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500 text-sm">
            <span className="font-bold text-gray-900">{filtered.length}</span> formation{filtered.length !== 1 ? 's' : ''} trouvée{filtered.length !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter size={14} />
            <span>Trier par pertinence</span>
          </div>
        </div>

        {/* COURSES GRID */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse" style={{border: '1px solid #e5e7eb'}}>
                <div className="h-40" style={{background: '#f3f4f6'}}></div>
                <div className="p-5">
                  <div className="h-3 rounded-full w-20 mb-3" style={{background: '#f3f4f6'}}></div>
                  <div className="h-4 rounded-full w-full mb-2" style={{background: '#f3f4f6'}}></div>
                  <div className="h-4 rounded-full w-3/4" style={{background: '#f3f4f6'}}></div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center" style={{border: '1px solid #e5e7eb'}}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{background: '#f0fdf4'}}>
              <BookOpen size={28} style={{color: '#14532d'}} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune formation trouvée</h3>
            <p className="text-gray-500 mb-6">Essayez une autre recherche ou catégorie.</p>
            <button
              onClick={() => { setSearch(''); setActiveCategory('') }}
              className="px-6 py-3 rounded-xl text-sm font-bold text-white"
              style={{background: '#14532d'}}
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course) => (
              <Link
                href={`/cours/${course.id}`}
                key={course.id}
                className="bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all group"
                style={{border: '1px solid #e5e7eb'}}
              >
                <div className="h-40 flex items-center justify-center relative" style={{background: 'linear-gradient(135deg, #14532d, #15803d)'}}>
                  <BookOpen size={44} color="rgba(255,255,255,0.5)" />
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold" style={{background: 'rgba(255,255,255,0.2)', color: 'white'}}>
                    Gratuit
                  </div>
                </div>
                <div className="p-5">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{background: '#f0fdf4', color: '#14532d'}}>
                    {course.category || 'Général'}
                  </span>
                  <h3 className="font-bold text-gray-900 mt-3 mb-2 group-hover:text-green-800 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                    {course.description || 'Aucune description disponible.'}
                  </p>
                  <div className="flex items-center justify-between mt-4 pt-4" style={{borderTop: '1px solid #f3f4f6'}}>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Clock size={12} /> Libre accès</span>
                      <span className="flex items-center gap-1"><Users size={12} /> Ouvert à tous</span>
                    </div>
                    <ChevronRight size={16} style={{color: '#14532d'}} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>

      {/* FOOTER */}
      <footer className="mt-16 py-8 px-8 text-center" style={{background: '#111827', borderTop: '1px solid #1f2937'}}>
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background: '#14532d'}}>
            <BookOpen size={14} color="white" />
          </div>
          <span className="font-bold text-white">CoursNumeriques</span>
        </div>
        <p style={{color: '#6b7280'}} className="text-sm">© 2025 CoursNumeriques — Tous droits réservés</p>
      </footer>

    </div>
  )
}