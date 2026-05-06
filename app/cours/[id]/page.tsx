// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import {
  BookOpen, ArrowLeft, Play, FileText,
  ChevronDown, ChevronUp, CheckCircle, Clock,
  Award, Users, Star, PenTool
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Lesson {
  id: string
  title: string
  type: string
  content?: string
  video_url?: string
  order_index: number
  module_title: string
  module_index: number
}

interface GroupedModule {
  title: string
  index: number
  lessons: Lesson[]
}

interface Course {
  id: string
  title: string
  description: string
  category: string
  duration: string
  level: string
  objectives: string[]
  prerequisites: string
  is_published: boolean
}

export default function CourseDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<GroupedModule[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [completedLessons, setCompletedLessons] = useState<string[]>([])
  const [openModule, setOpenModule] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      setUser(authUser)

      // Fetch course
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single()
      setCourse(courseData)

      // Fetch lessons
      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', id)
        .order('module_index')
        .order('order_index')

      // Group lessons by module
      if (lessonsData) {
        const grouped: { [key: string]: GroupedModule } = {}
        lessonsData.forEach((lesson: Lesson) => {
          const key = lesson.module_index ?? 0
          const moduleTitle = lesson.module_title || 'Module 1'
          if (!grouped[key]) {
            grouped[key] = { title: moduleTitle, index: key, lessons: [] }
          }
          grouped[key].lessons.push(lesson)
        })
        setModules(Object.values(grouped).sort((a, b) => a.index - b.index))
      }

      // Fetch progress if logged in
      if (authUser) {
        const { data: progressData } = await supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', authUser.id)
          .eq('course_id', id)
          .single()

        // Fetch individual lesson completions
        const { data: lessonProgress } = await supabase
          .from('lesson_progress')
          .select('lesson_id')
          .eq('user_id', authUser.id)
          .eq('completed', true)

        if (lessonProgress) {
          setCompletedLessons(lessonProgress.map((p: any) => p.lesson_id))
        }
      }

      setLoading(false)
    }
    fetchData()
  }, [id])

  const isCompleted = (lessonId: string) => completedLessons.includes(lessonId)

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0)
  const totalCompleted = completedLessons.length
  const progressPercent = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0

  const getFirstLesson = () => {
    return modules[0]?.lessons?.[0]
  }

  const getNextLesson = () => {
    for (const mod of modules) {
      for (const lesson of mod.lessons) {
        if (!isCompleted(lesson.id)) return lesson
      }
    }
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f9fafb' }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: '#14532d' }}>
            <BookOpen size={24} color="white" />
          </div>
          <p className="text-gray-500 text-sm">Chargement de la formation...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f9fafb' }}>
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Formation introuvable</h2>
          <Link href="/cours" className="text-sm font-semibold" style={{ color: '#14532d' }}>
            Retour au catalogue
          </Link>
        </div>
      </div>
    )
  }

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
        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/dashboard" className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: '#14532d' }}>
              Mon espace
            </Link>
          ) : (
            <>
              <Link href="/login" className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ color: '#14532d', border: '1.5px solid #14532d' }}>
                Connexion
              </Link>
              <Link href="/register" className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: '#14532d' }}>
                S'inscrire
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: 'linear-gradient(135deg, #14532d 0%, #166534 60%, #15803d 100%)' }}>
        <div className="max-w-6xl mx-auto px-8 py-12 text-white">
          <Link href="/cours" className="inline-flex items-center gap-2 text-sm mb-6 hover:opacity-80" style={{ color: '#bbf7d0' }}>
            <ArrowLeft size={16} /> Retour au catalogue
          </Link>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* INFOS */}
            <div className="flex-1">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4" style={{ background: 'rgba(255,255,255,0.15)' }}>
                {course.category} · {course.level || 'Débutant'}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{course.title}</h1>
              <p style={{ color: '#dcfce7' }} className="text-base mb-6 leading-relaxed max-w-2xl">
                {course.description}
              </p>

              <div className="flex gap-6 flex-wrap mb-6">
                <div className="flex items-center gap-2 text-sm" style={{ color: '#bbf7d0' }}>
                  <BookOpen size={15} /> {modules.length} module{modules.length !== 1 ? 's' : ''}
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: '#bbf7d0' }}>
                  <FileText size={15} /> {totalLessons} leçon{totalLessons !== 1 ? 's' : ''}
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: '#bbf7d0' }}>
                  <Clock size={15} /> {course.duration}
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: '#bbf7d0' }}>
                  <Users size={15} /> Accès 100% gratuit
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: '#bbf7d0' }}>
                  <Award size={15} /> Certification disponible
                </div>
              </div>

              {/* OBJECTIVES */}
              {course.objectives && course.objectives.length > 0 && (
                <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <div className="font-semibold mb-3 text-sm">Ce que vous allez apprendre</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {course.objectives.map((obj, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm" style={{ color: '#dcfce7' }}>
                        <CheckCircle size={14} className="mt-0.5 flex-shrink-0" style={{ color: '#86efac' }} />
                        {obj}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* PROGRESS CARD */}
            <div className="w-full lg:w-72 rounded-2xl p-6 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div className="text-lg font-bold mb-1">Votre progression</div>
              <div className="text-sm mb-3" style={{ color: '#dcfce7' }}>
                {totalCompleted}/{totalLessons} leçons terminées
              </div>
              <div className="h-2.5 rounded-full mb-2" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <div className="h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%`, background: '#86efac' }}></div>
              </div>
              <div className="text-right text-sm font-bold mb-6" style={{ color: '#86efac' }}>{progressPercent}%</div>

              {user ? (
                progressPercent === 100 ? (
                  <div className="space-y-3">
                    <div className="text-center p-3 rounded-xl text-sm font-semibold" style={{ background: 'rgba(134,239,172,0.2)', color: '#86efac', border: '1px solid rgba(134,239,172,0.3)' }}>
                      🎉 Formation terminée !
                    </div>
                    <button className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm" style={{ background: 'white', color: '#14532d' }}>
                      <Award size={16} /> Demander ma certification
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      const next = totalCompleted > 0 ? getNextLesson() : getFirstLesson()
                      if (next) router.push(`/cours/${id}/lecon/${next.id}`)
                    }}
                    className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm transition-all hover:opacity-90"
                    style={{ background: 'white', color: '#14532d' }}
                  >
                    <Play size={16} />
                    {totalCompleted > 0 ? 'Continuer la formation' : 'Commencer la formation'}
                  </button>
                )
              ) : (
                <div className="space-y-3">
                  <Link
                    href="/register"
                    className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm block text-center"
                    style={{ background: 'white', color: '#14532d' }}
                  >
                    S'inscrire gratuitement
                  </Link>
                  <p className="text-center text-xs" style={{ color: '#bbf7d0' }}>
                    Déjà inscrit ? <Link href="/login" className="underline">Connexion</Link>
                  </p>
                </div>
              )}

              {/* CERTIFICATION CTA */}
              {user && progressPercent < 100 && progressPercent > 0 && (
                <div className="mt-4 p-3 rounded-xl text-xs text-center" style={{ background: 'rgba(255,255,255,0.08)', color: '#bbf7d0' }}>
                  📜 Terminez tous les modules pour obtenir votre certification officielle
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Contenu de la formation</h2>
          <span className="text-sm text-gray-500">{modules.length} modules · {totalLessons} leçons</span>
        </div>

        {modules.length === 0 ? (
          <div className="bg-white rounded-2xl p-14 text-center" style={{ border: '1px solid #e5e7eb' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#f0fdf4' }}>
              <BookOpen size={26} style={{ color: '#14532d' }} />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Contenu en cours de préparation</h3>
            <p className="text-gray-500 text-sm">Les modules et leçons seront bientôt disponibles.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {modules.map((module, idx) => (
              <div key={idx} className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
                {/* MODULE HEADER */}
                <button
                  onClick={() => setOpenModule(openModule === idx ? -1 : idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: '#f0fdf4', color: '#14532d' }}>
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{module.title}</div>
                      <div className="text-sm text-gray-500 mt-0.5">
                        {module.lessons.length} leçon{module.lessons.length !== 1 ? 's' : ''}
                        {user && ` · ${module.lessons.filter(l => isCompleted(l.id)).length} terminée${module.lessons.filter(l => isCompleted(l.id)).length !== 1 ? 's' : ''}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {user && module.lessons.every(l => isCompleted(l.id)) && module.lessons.length > 0 && (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: '#f0fdf4', color: '#14532d' }}>
                        ✓ Terminé
                      </span>
                    )}
                    {openModule === idx
                      ? <ChevronUp size={20} style={{ color: '#14532d' }} />
                      : <ChevronDown size={20} style={{ color: '#9ca3af' }} />
                    }
                  </div>
                </button>

                {/* LESSONS */}
                {openModule === idx && (
                  <div style={{ borderTop: '1px solid #f3f4f6' }}>
                    {module.lessons.map((lesson, lIdx) => (
                      <Link
                        href={user ? `/cours/${id}/lecon/${lesson.id}` : '/register'}
                        key={lesson.id}
                        className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group"
                        style={{ borderBottom: lIdx < module.lessons.length - 1 ? '1px solid #f9fafb' : 'none' }}
                      >
                        {/* ICON */}
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: isCompleted(lesson.id) ? '#f0fdf4' : '#f9fafb' }}>
                          {isCompleted(lesson.id)
                            ? <CheckCircle size={16} style={{ color: '#14532d' }} />
                            : lesson.type === 'exercise'
                              ? <PenTool size={14} style={{ color: '#9ca3af' }} />
                              : lesson.type === 'quiz'
                                ? <Star size={14} style={{ color: '#9ca3af' }} />
                                : <Play size={14} style={{ color: '#9ca3af' }} />
                          }
                        </div>

                        {/* TITLE */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-800 group-hover:text-green-800 transition-colors">
                            {lesson.title}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5 capitalize">
                            {lesson.type === 'exercise' ? '📝 Exercice' : lesson.type === 'quiz' ? '✅ Quiz' : '📖 Leçon'}
                          </div>
                        </div>

                        {/* STATUS */}
                        {isCompleted(lesson.id) && (
                          <span className="text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0" style={{ background: '#f0fdf4', color: '#14532d' }}>
                            Terminé
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* CERTIFICATION BANNER */}
        {user && (
          <div className="mt-8 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6"
            style={{ background: 'linear-gradient(135deg, #14532d, #15803d)', color: 'white' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.15)' }}>
              <Award size={28} color="white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-bold text-lg mb-1">Obtenez votre certification officielle</h3>
              <p style={{ color: '#dcfce7' }} className="text-sm">
                Terminez tous les modules, réussissez le quiz final, puis passez votre évaluation avec un formateur.
              </p>
            </div>
            <button
              className="px-6 py-3 rounded-xl font-bold text-sm flex-shrink-0 transition-all hover:opacity-90"
              style={{ background: 'white', color: '#14532d' }}
            >
              En savoir plus
            </button>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="mt-8 py-8 px-8 text-center" style={{ background: '#111827', borderTop: '1px solid #1f2937' }}>
        <p style={{ color: '#6b7280' }} className="text-sm">© 2025 CoursNumeriques — Cellule Numérique × CRF Perfection</p>
      </footer>

    </div>
  )
}