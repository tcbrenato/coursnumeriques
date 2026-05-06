// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import {
  BookOpen, Award, ChevronRight, CheckCircle,
  Clock, LogOut, Play
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([])
  const [certificates, setCertificates] = useState<any[]>([])
  const [recentLessons, setRecentLessons] = useState<any[]>([])
  const [stats, setStats] = useState({
    coursesEnrolled: 0,
    coursesCompleted: 0,
    certificates: 0,
    lessonsCompleted: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) { router.push('/login'); return }
    setUser(authUser)

    // Toutes les leçons terminées par l'apprenant
    const { data: progressData } = await supabase
      .from('lesson_progress')
      .select('lesson_id, course_id, completed_at')
      .eq('user_id', authUser.id)
      .eq('completed', true)
      .order('completed_at', { ascending: false })

    const completedLessonIds = progressData?.map(p => p.lesson_id) || []
    const completedByCourse: { [key: string]: number } = {}
    progressData?.forEach(p => {
      completedByCourse[p.course_id] = (completedByCourse[p.course_id] || 0) + 1
    })

    // Cours dans lesquels l'apprenant a de la progression
    const courseIds = [...new Set(progressData?.map(p => p.course_id) || [])]

    let coursesWithProgress: any[] = []
    if (courseIds.length > 0) {
      const { data: coursesData } = await supabase
        .from('courses')
        .select('id, title, category, duration')
        .in('id', courseIds)

      // Pour chaque cours, compter le total de leçons
      if (coursesData) {
        const coursesWithLessons = await Promise.all(
          coursesData.map(async (course) => {
            const { count } = await supabase
              .from('lessons')
              .select('id', { count: 'exact', head: true })
              .eq('course_id', course.id)

            const totalLessons = count || 0
            const completed = completedByCourse[course.id] || 0
            const progress = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0

            return {
              ...course,
              total_lessons: totalLessons,
              completed_lessons: completed,
              progress,
              is_completed: totalLessons > 0 && completed >= totalLessons,
            }
          })
        )
        coursesWithProgress = coursesWithLessons.sort((a, b) => b.progress - a.progress)
      }
    }

    setEnrolledCourses(coursesWithProgress)

    // Certificats
    const { data: certsData } = await supabase
      .from('certificates')
      .select('*, courses(title)')
      .eq('user_id', authUser.id)
      .order('issued_at', { ascending: false })
    setCertificates(certsData || [])

    // Activité récente — dernières leçons terminées avec leur titre
    if (completedLessonIds.length > 0) {
      const recentIds = completedLessonIds.slice(0, 5)
      const { data: recentLessonsData } = await supabase
        .from('lessons')
        .select('id, title, course_id, courses(title)')
        .in('id', recentIds)

      // Reorder by completed_at
      const ordered = progressData?.slice(0, 5).map(p => {
        const lesson = recentLessonsData?.find(l => l.id === p.lesson_id)
        return lesson ? { ...lesson, completed_at: p.completed_at } : null
      }).filter(Boolean) || []

      setRecentLessons(ordered)
    }

    // Stats
    setStats({
      coursesEnrolled: courseIds.length,
      coursesCompleted: coursesWithProgress.filter(c => c.is_completed).length,
      certificates: certsData?.length || 0,
      lessonsCompleted: completedLessonIds.length,
    })

    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Apprenant'

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f9fafb' }}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: '#14532d' }}>
          <BookOpen size={24} color="white" />
        </div>
        <p className="text-sm text-gray-500">Chargement de votre tableau de bord...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: '#f9fafb' }}>

      {/* NAVBAR */}
      <nav className="bg-white sticky top-0 z-50 px-8 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid #e5e7eb' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#14532d' }}>
            <BookOpen size={18} color="white" />
          </div>
          <span className="text-xl font-bold" style={{ color: '#14532d' }}>CoursNumeriques</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <Link href="/cours" className="text-sm font-medium text-gray-600 hover:text-gray-900">Formations</Link>
          <Link href="/dashboard" className="text-sm font-semibold" style={{ color: '#14532d' }}>Mon espace</Link>
          <Link href="/certificats" className="text-sm font-medium text-gray-600 hover:text-gray-900">Certificats</Link>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={16} /> Déconnexion
        </button>
      </nav>

      {/* HEADER */}
      <div style={{ background: 'linear-gradient(135deg, #14532d 0%, #166534 60%, #15803d 100%)' }}>
        <div className="max-w-6xl mx-auto px-8 py-14 text-white">
          <h1 className="text-4xl font-bold mb-3">Bienvenue, {fullName} ! 👋</h1>
          <p style={{ color: '#dcfce7' }} className="text-lg mb-8">
            Continuez votre parcours d'apprentissage et développez vos compétences.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link href="/cours" className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm" style={{ background: 'white', color: '#14532d' }}>
              Voir les formations <ChevronRight size={16} />
            </Link>
            <Link href="/certificats" className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
              Mes certificats <Award size={16} />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-10">

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Formations suivies',  value: stats.coursesEnrolled,  icon: BookOpen,      bg: '#f0fdf4', color: '#14532d' },
            { label: 'Formations terminées', value: stats.coursesCompleted, icon: CheckCircle,  bg: '#eff6ff', color: '#2563eb' },
            { label: 'Certificats',          value: stats.certificates,     icon: Award,        bg: '#fef3c7', color: '#d97706' },
            { label: 'Leçons terminées',     value: stats.lessonsCompleted, icon: Clock,        bg: '#f5f3ff', color: '#7c3aed' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-6" style={{ border: '1px solid #e5e7eb' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT — Mes formations */}
          <div className="lg:col-span-2 space-y-6">

            {/* FORMATIONS EN COURS */}
            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #e5e7eb' }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-gray-900">Mes formations en cours</h2>
                <Link href="/cours" className="text-sm font-semibold" style={{ color: '#14532d' }}>Voir tout</Link>
              </div>

              {enrolledCourses.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#f0fdf4' }}>
                    <BookOpen size={26} style={{ color: '#14532d' }} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Aucune formation commencée</h3>
                  <p className="text-gray-500 text-sm mb-5">Commencez par choisir une formation dans le catalogue.</p>
                  <Link href="/cours" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white" style={{ background: '#14532d' }}>
                    Explorer les formations
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {enrolledCourses.map((course) => (
                    <Link
                      key={course.id}
                      href={`/cours/${course.id}`}
                      className="block p-4 rounded-xl hover:shadow-sm transition-all group"
                      style={{ border: '1px solid #f3f4f6', background: '#fafafa' }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-semibold text-gray-900 group-hover:text-green-800 text-sm transition-colors">
                            {course.title}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">{course.category}</div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          {course.completed_lessons}/{course.total_lessons} leçons
                          <ChevronRight size={14} style={{ color: '#14532d' }} />
                        </div>
                      </div>
                      <div className="w-full h-1.5 rounded-full" style={{ background: '#e5e7eb' }}>
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{ width: `${course.progress}%`, background: course.is_completed ? '#22c55e' : '#14532d' }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-xs text-gray-400">{course.progress}% complété</span>
                        {course.is_completed && (
                          <span className="text-xs font-semibold" style={{ color: '#22c55e' }}>✓ Terminé</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* CONTINUER L'APPRENTISSAGE */}
            {enrolledCourses.filter(c => !c.is_completed).length > 0 && (
              <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #e5e7eb' }}>
                <h2 className="font-bold text-gray-900 mb-4">Continuer l'apprentissage</h2>
                <div className="space-y-3">
                  {enrolledCourses.filter(c => !c.is_completed).slice(0, 3).map((course) => (
                    <Link
                      key={course.id}
                      href={`/cours/${course.id}`}
                      className="flex items-center gap-4 p-4 rounded-xl hover:shadow-sm transition-all group"
                      style={{ border: '1px solid #f3f4f6' }}
                    >
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#f0fdf4' }}>
                        <Play size={18} style={{ color: '#14532d' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-gray-900 group-hover:text-green-800 truncate">{course.title}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{course.completed_lessons} / {course.total_lessons} leçons terminées</div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="text-sm font-bold" style={{ color: '#14532d' }}>{course.progress}%</div>
                        <div className="w-16 h-1.5 rounded-full" style={{ background: '#e5e7eb' }}>
                          <div className="h-1.5 rounded-full" style={{ width: `${course.progress}%`, background: '#14532d' }} />
                        </div>
                        <ChevronRight size={15} style={{ color: '#14532d' }} />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="space-y-6">

            {/* ACTIVITE RECENTE */}
            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #e5e7eb' }}>
              <h2 className="font-bold text-gray-900 mb-4">Activité récente</h2>
              {recentLessons.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Aucune activité pour le moment.</p>
              ) : (
                <div className="space-y-4">
                  {recentLessons.map((lesson, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: '#f0fdf4' }}>
                        <CheckCircle size={14} style={{ color: '#14532d' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800 leading-snug">
                          Leçon terminée : <span className="text-gray-600">"{lesson.title}"</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {lesson.courses?.title} · {formatDate(lesson.completed_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CERTIFICATS */}
            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #e5e7eb' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Mes certificats</h2>
                <Link href="/certificats" className="text-xs font-semibold" style={{ color: '#14532d' }}>Voir tout</Link>
              </div>
              {certificates.length === 0 ? (
                <div className="text-center py-4">
                  <Award size={32} className="mx-auto mb-2" style={{ color: '#d1d5db' }} />
                  <p className="text-sm text-gray-400">Terminez une formation pour obtenir votre certification.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {certificates.slice(0, 3).map((cert, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#fef3c7', border: '1px solid #fde68a' }}>
                      <Award size={18} style={{ color: '#d97706' }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">{cert.courses?.title}</div>
                        <div className="text-xs text-gray-500">{formatDate(cert.issued_at)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ACTIONS RAPIDES */}
            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #e5e7eb' }}>
              <h2 className="font-bold text-gray-900 mb-4">Actions rapides</h2>
              <div className="space-y-2">
                <Link href="/cours" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#f0fdf4' }}>
                    <BookOpen size={16} style={{ color: '#14532d' }} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-gray-900 group-hover:text-green-800">Parcourir les formations</div>
                    <div className="text-xs text-gray-400">Découvrez de nouveaux cours</div>
                  </div>
                </Link>
                <Link href="/certificats" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#fef3c7' }}>
                    <Award size={16} style={{ color: '#d97706' }} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-gray-900 group-hover:text-orange-800">Mes certificats</div>
                    <div className="text-xs text-gray-400">Téléchargez vos attestations</div>
                  </div>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="mt-10 py-6 px-8 text-center" style={{ borderTop: '1px solid #e5e7eb' }}>
        <p className="text-sm text-gray-400">© 2025 CoursNumeriques — Cellule Numérique × CRF Perfection</p>
      </footer>

    </div>
  )
}