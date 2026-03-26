// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import {
  BookOpen, ArrowLeft, Play, FileText, Link as LinkIcon,
  ChevronDown, ChevronUp, CheckCircle, Lock, Clock,
  Users, Award, Download
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Lesson {
  id: string
  title: string
  type: string
  content?: string
  video_url?: string
  pdf_url?: string
  order_index: number
}

interface Module {
  id: string
  title: string
  description?: string
  order_index: number
  lessons: Lesson[]
}

interface Course {
  id: string
  title: string
  description: string
  category: string
  level: string
  duration: number
  instructor?: string
  thumbnail_url?: string
}

interface Progress {
  id: string
  user_id: string
  lesson_id: string
  completed: boolean
  completed_at?: string
}

export default function CourseDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [progress, setProgress] = useState<Progress[]>([])
  const [openModule, setOpenModule] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      // ✅ Renommé en "authUser" pour éviter le conflit avec le state "user"
      const { data: { user: authUser } } = await supabase.auth.getUser()
      setUser(authUser)

      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single()
      setCourse(courseData)

      const { data: modulesData } = await supabase
        .from('modules')
        .select('*, lessons(*)')
        .eq('course_id', id)
        .order('order_index')
      setModules(modulesData || [])

      if (authUser) {
        const { data: progressData } = await supabase
          .from('progress')
          .select('*')
          .eq('user_id', authUser.id)
        setProgress(progressData || [])
      }

      setLoading(false)
      if (modulesData && modulesData.length > 0) {
        setOpenModule(modulesData[0].id)
      }
    }
    fetchData()
  }, [id])

  const isCompleted = (lessonId: string) => {
    return progress.some(p => p.lesson_id === lessonId && p.completed)
  }

  const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)
  const completedLessons = modules.reduce((acc, m) => {
    return acc + (m.lessons?.filter(l => isCompleted(l.id)).length || 0)
  }, 0)
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

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

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: '#f9fafb'}}>
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Formation introuvable</h2>
          <Link href="/cours" className="text-sm font-semibold" style={{color: '#14532d'}}>
            Retour au catalogue
          </Link>
        </div>
      </div>
    )
  }

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
        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/dashboard" className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{background: '#14532d'}}>
              Mon espace
            </Link>
          ) : (
            <>
              <Link href="/login" className="px-4 py-2 rounded-lg text-sm font-semibold" style={{color: '#14532d', border: '1.5px solid #14532d'}}>
                Connexion
              </Link>
              <Link href="/register" className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{background: '#14532d'}}>
                S'inscrire
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <div style={{background: 'linear-gradient(135deg, #14532d 0%, #166534 60%, #15803d 100%)'}}>
        <div className="max-w-6xl mx-auto px-8 py-12 text-white">
          <Link href="/cours" className="inline-flex items-center gap-2 text-sm mb-6 hover:opacity-80" style={{color: '#bbf7d0'}}>
            <ArrowLeft size={16} /> Retour au catalogue
          </Link>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4" style={{background: 'rgba(255,255,255,0.15)'}}>
                {course.category || 'Général'}
              </span>
              <h1 className="text-4xl font-bold mb-4 leading-tight">{course.title}</h1>
              <p style={{color: '#dcfce7'}} className="text-lg mb-6 leading-relaxed">
                {course.description}
              </p>
              <div className="flex gap-6 flex-wrap">
                <div className="flex items-center gap-2 text-sm" style={{color: '#bbf7d0'}}>
                  <BookOpen size={16} /> {modules.length} module{modules.length !== 1 ? 's' : ''}
                </div>
                <div className="flex items-center gap-2 text-sm" style={{color: '#bbf7d0'}}>
                  <FileText size={16} /> {totalLessons} leçon{totalLessons !== 1 ? 's' : ''}
                </div>
                <div className="flex items-center gap-2 text-sm" style={{color: '#bbf7d0'}}>
                  <Clock size={16} /> Accès libre
                </div>
                <div className="flex items-center gap-2 text-sm" style={{color: '#bbf7d0'}}>
                  <Award size={16} /> Certificat disponible
                </div>
              </div>
            </div>

            {/* PROGRESS CARD */}
            <div className="w-full md:w-80 rounded-2xl p-6" style={{background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)'}}>
              <div className="text-lg font-bold mb-4">Votre progression</div>
              <div className="flex justify-between text-sm mb-2" style={{color: '#dcfce7'}}>
                <span>{completedLessons}/{totalLessons} leçons</span>
                <span className="font-bold">{progressPercent}%</span>
              </div>
              <div className="h-2 rounded-full mb-6" style={{background: 'rgba(255,255,255,0.2)'}}>
                <div className="h-2 rounded-full transition-all" style={{width: `${progressPercent}%`, background: '#86efac'}}></div>
              </div>
              {user ? (
                progressPercent === 100 ? (
                  <button className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2" style={{background: 'white', color: '#14532d'}}>
                    <Download size={18} /> Obtenir le certificat
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const firstModule = modules[0]
                      const firstLesson = firstModule?.lessons?.[0]
                      if (firstLesson) router.push(`/cours/${id}/lecon/${firstLesson.id}`)
                    }}
                    className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2" style={{background: 'white', color: '#14532d'}}>
                    <Play size={18} /> {completedLessons > 0 ? 'Continuer' : 'Commencer'}
                  </button>
                )
              ) : (
                <Link href="/register" className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 block text-center" style={{background: 'white', color: '#14532d'}}>
                  S'inscrire gratuitement
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-8 py-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Contenu de la formation</h2>

        {modules.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center" style={{border: '1px solid #e5e7eb'}}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{background: '#f0fdf4'}}>
              <BookOpen size={26} style={{color: '#14532d'}} />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Contenu en cours de préparation</h3>
            <p className="text-gray-500 text-sm">Les modules et leçons seront bientôt disponibles.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {modules.map((module, idx) => (
              <div key={module.id} className="bg-white rounded-2xl overflow-hidden" style={{border: '1px solid #e5e7eb'}}>
                <button
                  onClick={() => setOpenModule(openModule === module.id ? null : module.id)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{background: '#f0fdf4', color: '#14532d'}}>
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{module.title}</div>
                      <div className="text-sm text-gray-500 mt-0.5">
                        {module.lessons?.length || 0} leçon{(module.lessons?.length || 0) !== 1 ? 's' : ''}
                        {user && ` · ${module.lessons?.filter(l => isCompleted(l.id)).length || 0} terminée${(module.lessons?.filter(l => isCompleted(l.id)).length || 0) !== 1 ? 's' : ''}`}
                      </div>
                    </div>
                  </div>
                  {openModule === module.id ? <ChevronUp size={20} style={{color: '#14532d'}} /> : <ChevronDown size={20} style={{color: '#9ca3af'}} />}
                </button>

                {openModule === module.id && module.lessons && module.lessons.length > 0 && (
                  <div style={{borderTop: '1px solid #f3f4f6'}}>
                    {module.lessons.map((lesson, lIdx) => (
                      <Link
                        href={user ? `/cours/${id}/lecon/${lesson.id}` : '/register'}
                        key={lesson.id}
                        className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                        style={{borderBottom: lIdx < module.lessons.length - 1 ? '1px solid #f3f4f6' : 'none'}}
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{background: isCompleted(lesson.id) ? '#f0fdf4' : '#f9fafb'}}>
                          {isCompleted(lesson.id)
                            ? <CheckCircle size={16} style={{color: '#14532d'}} />
                            : user
                              ? <Play size={14} style={{color: '#9ca3af'}} />
                              : <Lock size={14} style={{color: '#9ca3af'}} />
                          }
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-800">{lesson.title}</div>
                          <div className="flex items-center gap-3 mt-0.5">
                            {lesson.video_url && <span className="flex items-center gap-1 text-xs text-gray-400"><Play size={10} /> Vidéo</span>}
                            {lesson.pdf_url && <span className="flex items-center gap-1 text-xs text-gray-400"><FileText size={10} /> PDF</span>}
                          </div>
                        </div>
                        {isCompleted(lesson.id) && (
                          <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{background: '#f0fdf4', color: '#14532d'}}>
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
      </div>

      {/* FOOTER */}
      <footer className="mt-8 py-8 px-8 text-center" style={{background: '#111827'}}>
        <p style={{color: '#6b7280'}} className="text-sm">© 2025 CoursNumeriques — Tous droits réservés</p>
      </footer>

    </div>
  )
}