'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  BookOpen, Award, TrendingUp, Clock, LogOut, User,
  ChevronRight, Play, CheckCircle, BarChart2, Bell
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      const { data } = await supabase.from('courses').select('*').eq('is_published', true).limit(6)
      setCourses(data || [])
      setLoading(false)
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: '#f9fafb'}}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{background: '#14532d'}}>
            <BookOpen size={24} color="white" />
          </div>
          <p className="text-gray-500 text-sm">Chargement...</p>
        </div>
      </div>
    )
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Apprenant'

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
          <Link href="/cours" className="text-sm font-medium text-gray-600 hover:text-gray-900">Formations</Link>
          <Link href="/dashboard" className="text-sm font-semibold" style={{color: '#14532d'}}>Tableau de bord</Link>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-9 h-9 rounded-lg flex items-center justify-center" style={{background: '#f3f4f6'}}>
            <Bell size={16} style={{color: '#6b7280'}} />
          </button>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{background: '#f3f4f6'}}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{background: '#14532d'}}>
              <User size={12} color="white" />
            </div>
            <span className="text-sm font-medium text-gray-700 hidden md:block">{userName}</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
            <LogOut size={16} />
            <span className="hidden md:block">Déconnexion</span>
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">

        {/* WELCOME */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Bonjour, {userName} 👋</h1>
          <p className="text-gray-500">Continuez votre apprentissage là où vous vous êtes arrêté.</p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: BookOpen, label: 'Formations inscrites', value: '0', color: '#14532d', bg: '#f0fdf4' },
            { icon: CheckCircle, label: 'Leçons terminées', value: '0', color: '#0369a1', bg: '#f0f9ff' },
            { icon: Award, label: 'Certificats obtenus', value: '0', color: '#b45309', bg: '#fffbeb' },
            { icon: TrendingUp, label: 'Progression moyenne', value: '0%', color: '#7c3aed', bg: '#faf5ff' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-6" style={{border: '1px solid #e5e7eb'}}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{background: stat.bg}}>
                <stat.icon size={20} style={{color: stat.color}} />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* COURSES */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Formations disponibles</h2>
            <Link href="/cours" className="flex items-center gap-1 text-sm font-semibold" style={{color: '#14532d'}}>
              Voir tout <ChevronRight size={16} />
            </Link>
          </div>

          {courses.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center" style={{border: '1px solid #e5e7eb'}}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{background: '#f0fdf4'}}>
                <BookOpen size={26} style={{color: '#14532d'}} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Aucune formation disponible</h3>
              <p className="text-gray-500 text-sm mb-6">Les formations seront bientôt ajoutées par l'administrateur.</p>
              <Link href="/cours" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white" style={{background: '#14532d'}}>
                Explorer le catalogue <ChevronRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.map((course) => (
                <Link href={`/cours/${course.id}`} key={course.id} className="bg-white rounded-2xl overflow-hidden hover:shadow-md transition-shadow" style={{border: '1px solid #e5e7eb'}}>
                  <div className="h-36 flex items-center justify-center" style={{background: 'linear-gradient(135deg, #14532d, #15803d)'}}>
                    <BookOpen size={40} color="rgba(255,255,255,0.6)" />
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{background: '#f0fdf4', color: '#14532d'}}>
                      {course.category || 'Général'}
                    </span>
                    <h3 className="font-bold text-gray-900 mt-3 mb-2">{course.title}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2">{course.description}</p>
                    <div className="flex items-center gap-2 mt-4 pt-4" style={{borderTop: '1px solid #f3f4f6'}}>
                      <div className="flex-1 h-1.5 rounded-full" style={{background: '#f3f4f6'}}>
                        <div className="h-1.5 rounded-full w-0" style={{background: '#14532d'}}></div>
                      </div>
                      <span className="text-xs text-gray-400">0%</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* CTA CERTIFICATION */}
        <div className="rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6" style={{background: 'linear-gradient(135deg, #14532d, #166534)', color: 'white'}}>
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{background: 'rgba(255,255,255,0.15)'}}>
              <Award size={28} color="white" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">Obtenez votre certification</h3>
              <p style={{color: '#bbf7d0'}} className="text-sm">Validez vos compétences avec un certificat officiel reconnu.</p>
            </div>
          </div>
          <Link href="/cours" className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap" style={{background: 'white', color: '#14532d'}}>
            Voir les formations <ChevronRight size={16} />
          </Link>
        </div>

      </div>
    </div>
  )
}