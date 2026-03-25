'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  BookOpen, Users, Award, TrendingUp, Plus,
  LogOut, Shield, BarChart2, Settings, ChevronRight,
  FileText, Video, CheckCircle
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({
    courses: 0, users: 0, certificates: 0, lessons: 0
  })
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth')
    if (!auth) {
      router.push('/admin')
      return
    }
    fetchData()
  }, [])

  const fetchData = async () => {
    const [
      { count: coursesCount },
      { count: usersCount },
      { count: certsCount },
      { count: lessonsCount },
      { data: coursesData }
    ] = await Promise.all([
      supabase.from('courses').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('certificates').select('*', { count: 'exact', head: true }),
      supabase.from('lessons').select('*', { count: 'exact', head: true }),
      supabase.from('courses').select('*').order('created_at', { ascending: false }).limit(5)
    ])
    setStats({
      courses: coursesCount || 0,
      users: usersCount || 0,
      certificates: certsCount || 0,
      lessons: lessonsCount || 0
    })
    setCourses(coursesData || [])
    setLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_auth')
    router.push('/admin')
  }

  const togglePublish = async (id, current) => {
    await supabase.from('courses').update({ is_published: !current }).eq('id', id)
    fetchData()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: '#0f172a'}}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{background: '#14532d'}}>
            <BookOpen size={24} color="white" />
          </div>
          <p className="text-sm" style={{color: '#94a3b8'}}>Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{background: '#0f172a'}}>

      {/* NAVBAR */}
      <nav className="px-8 py-4 flex justify-between items-center sticky top-0 z-50" style={{background: '#1e293b', borderBottom: '1px solid #334155'}}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{background: '#14532d'}}>
            <BookOpen size={18} color="white" />
          </div>
          <div>
            <span className="text-white font-bold">CoursNumeriques</span>
            <div className="flex items-center gap-1">
              <Shield size={10} style={{color: '#22c55e'}} />
              <span className="text-xs" style={{color: '#22c55e'}}>Admin</span>
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <Link href="/admin/dashboard" className="text-sm font-semibold" style={{color: '#22c55e'}}>
            Tableau de bord
          </Link>
          <Link href="/admin/cours" className="text-sm font-medium" style={{color: '#94a3b8'}}>
            Formations
          </Link>
          <Link href="/admin/utilisateurs" className="text-sm font-medium" style={{color: '#94a3b8'}}>
            Utilisateurs
          </Link>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{color: '#94a3b8', border: '1px solid #334155'}}
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-1">Tableau de bord</h1>
          <p style={{color: '#94a3b8'}}>Vue d'ensemble de la plateforme CoursNumeriques.</p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: BookOpen, label: 'Formations', value: stats.courses, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
            { icon: Users, label: 'Utilisateurs', value: stats.users, color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
            { icon: FileText, label: 'Leçons', value: stats.lessons, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
            { icon: Award, label: 'Certificats', value: stats.certificates, color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl p-6" style={{background: '#1e293b', border: '1px solid #334155'}}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{background: stat.bg}}>
                <stat.icon size={20} style={{color: stat.color}} />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-xs" style={{color: '#64748b'}}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ACTIONS RAPIDES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <Link href="/admin/cours" className="rounded-2xl p-6 flex items-center gap-4 hover:opacity-90 transition-opacity" style={{background: '#14532d'}}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background: 'rgba(255,255,255,0.15)'}}>
              <Plus size={22} color="white" />
            </div>
            <div>
              <div className="font-bold text-white">Ajouter une formation</div>
              <div className="text-xs" style={{color: '#bbf7d0'}}>Créer un nouveau cours</div>
            </div>
            <ChevronRight size={18} color="white" className="ml-auto" />
          </Link>

          <Link href="/admin/utilisateurs" className="rounded-2xl p-6 flex items-center gap-4 hover:opacity-90 transition-opacity" style={{background: '#1e293b', border: '1px solid #334155'}}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background: 'rgba(96,165,250,0.1)'}}>
              <Users size={22} style={{color: '#60a5fa'}} />
            </div>
            <div>
              <div className="font-bold text-white">Gérer les utilisateurs</div>
              <div className="text-xs" style={{color: '#64748b'}}>Voir tous les comptes</div>
            </div>
            <ChevronRight size={18} style={{color: '#64748b'}} className="ml-auto" />
          </Link>

          <Link href="/admin/certificats" className="rounded-2xl p-6 flex items-center gap-4 hover:opacity-90 transition-opacity" style={{background: '#1e293b', border: '1px solid #334155'}}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background: 'rgba(167,139,250,0.1)'}}>
              <Award size={22} style={{color: '#a78bfa'}} />
            </div>
            <div>
              <div className="font-bold text-white">Certificats</div>
              <div className="text-xs" style={{color: '#64748b'}}>Gérer les certifications</div>
            </div>
            <ChevronRight size={18} style={{color: '#64748b'}} className="ml-auto" />
          </Link>
        </div>

        {/* DERNIÈRES FORMATIONS */}
        <div className="rounded-2xl overflow-hidden" style={{background: '#1e293b', border: '1px solid #334155'}}>
          <div className="px-6 py-4 flex justify-between items-center" style={{borderBottom: '1px solid #334155'}}>
            <h2 className="font-bold text-white">Dernières formations</h2>
            <Link href="/admin/cours" className="text-sm font-semibold flex items-center gap-1" style={{color: '#22c55e'}}>
              Gérer <ChevronRight size={14} />
            </Link>
          </div>

          {courses.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{background: 'rgba(34,197,94,0.1)'}}>
                <BookOpen size={26} style={{color: '#22c55e'}} />
              </div>
              <p className="font-bold text-white mb-2">Aucune formation créée</p>
              <p className="text-sm mb-6" style={{color: '#64748b'}}>Commencez par ajouter votre première formation.</p>
              <Link href="/admin/cours" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white" style={{background: '#14532d'}}>
                <Plus size={16} /> Créer une formation
              </Link>
            </div>
          ) : (
            <div>
              {courses.map((course, i) => (
                <div key={course.id} className="px-6 py-4 flex items-center justify-between" style={{borderBottom: i < courses.length - 1 ? '1px solid #334155' : 'none'}}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: '#14532d'}}>
                      <BookOpen size={18} color="white" />
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">{course.title}</div>
                      <div className="text-xs" style={{color: '#64748b'}}>{course.category || 'Général'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => togglePublish(course.id, course.is_published)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: course.is_published ? 'rgba(34,197,94,0.1)' : 'rgba(100,116,139,0.1)',
                        color: course.is_published ? '#22c55e' : '#64748b',
                        border: course.is_published ? '1px solid rgba(34,197,94,0.2)' : '1px solid #334155'
                      }}
                    >
                      {course.is_published ? 'Publié' : 'Brouillon'}
                    </button>
                    <Link href={`/admin/cours/${course.id}`} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{background: '#334155', color: '#cbd5e1'}}>
                      Modifier
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}