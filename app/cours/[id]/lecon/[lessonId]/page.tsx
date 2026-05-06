// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import {
  BookOpen, ArrowLeft, ArrowRight, CheckCircle,
  FileText, ChevronRight, Menu, X, Download,
  Award, Play, PenTool, Star
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
  module_title: string
  module_index: number
  course_id: string
}

interface GroupedModule {
  title: string
  index: number
  lessons: Lesson[]
}

export default function LessonPage() {
  const { id, lessonId } = useParams()
  const router = useRouter()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [course, setCourse] = useState<any>(null)
  const [modules, setModules] = useState<GroupedModule[]>([])
  const [allLessons, setAllLessons] = useState<Lesson[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [completed, setCompleted] = useState(false)
  const [completedIds, setCompletedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [marking, setMarking] = useState(false)
  const [showCertBanner, setShowCertBanner] = useState(false)

  useEffect(() => {
    fetchData()
  }, [lessonId, id])

  async function fetchData() {
    setLoading(true)

    // Auth
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) { router.push('/login'); return }
    setUser(authUser)

    // Lesson
    const { data: lessonData } = await supabase
      .from('lessons').select('*').eq('id', lessonId).single()
    setLesson(lessonData)

    // Course
    const { data: courseData } = await supabase
      .from('courses').select('*').eq('id', id).single()
    setCourse(courseData)

    // All lessons for sidebar (grouped by module)
    const { data: lessonsData } = await supabase
      .from('lessons').select('*').eq('course_id', id)
      .order('module_index').order('order_index')

    if (lessonsData) {
      setAllLessons(lessonsData)
      const grouped: { [key: number]: GroupedModule } = {}
      lessonsData.forEach((l: Lesson) => {
        const key = l.module_index ?? 0
        if (!grouped[key]) grouped[key] = { title: l.module_title || `Module ${key + 1}`, index: key, lessons: [] }
        grouped[key].lessons.push(l)
      })
      setModules(Object.values(grouped).sort((a, b) => a.index - b.index))
    }

    // Progress
    const { data: progressData } = await supabase
      .from('lesson_progress')
      .select('lesson_id')
      .eq('user_id', authUser.id)
      .eq('completed', true)

    const ids = progressData?.map((p: any) => p.lesson_id) || []
    setCompletedIds(ids)
    setCompleted(ids.includes(lessonId as string))

    setLoading(false)
  }

  async function markComplete() {
    if (!user || completed || marking) return
    setMarking(true)

    await supabase.from('lesson_progress').upsert({
      user_id: user.id,
      lesson_id: lessonId,
      course_id: id,
      completed: true,
      completed_at: new Date().toISOString()
    }, { onConflict: 'user_id,lesson_id' })

    const newCompleted = [...completedIds, lessonId as string]
    setCompletedIds(newCompleted)
    setCompleted(true)

    // Check if all lessons completed
    if (allLessons.length > 0 && newCompleted.length >= allLessons.length) {
      const allDone = allLessons.every(l => newCompleted.includes(l.id))
      if (allDone) {
        // Check if cert already exists
        const { data: existingCert } = await supabase
          .from('certificates')
          .select('id').eq('user_id', user.id).eq('course_id', id).single()

        if (!existingCert) {
          await supabase.from('certificates').insert([{
            user_id: user.id,
            course_id: id,
            issued_at: new Date().toISOString()
          }])
          setShowCertBanner(true)
        }
      }
    }

    setMarking(false)
  }

  const getYoutubeId = (url: string) => {
    if (!url) return null
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    return match ? match[1] : null
  }

  const getGoogleDriveEmbed = (url: string) => {
    if (!url) return null
    const match = url.match(/\/file\/d\/([^/]+)/)
    return match ? `https://drive.google.com/file/d/${match[1]}/preview` : null
  }

  const currentIndex = allLessons.findIndex(l => l.id === lessonId)
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null
  const isLastLesson = currentIndex === allLessons.length - 1

  const totalLessons = allLessons.length
  const completedCount = allLessons.filter(l => completedIds.includes(l.id)).length
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  const getLessonIcon = (type: string) => {
    if (type === 'exercise') return <PenTool size={14} style={{ color: '#f59e0b' }} />
    if (type === 'quiz') return <Star size={14} style={{ color: '#8b5cf6' }} />
    return <Play size={14} style={{ color: '#3b82f6' }} />
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f9fafb' }}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: '#14532d' }}>
          <BookOpen size={24} color="white" />
        </div>
        <p className="text-gray-500 text-sm">Chargement...</p>
      </div>
    </div>
  )

  const youtubeId = getYoutubeId(lesson?.video_url || '')
  const driveEmbed = !youtubeId ? getGoogleDriveEmbed(lesson?.video_url || '') : null

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f9fafb' }}>

      {/* CERTIFICATION BANNER */}
      {showCertBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.75)' }}>
          <div className="bg-white rounded-3xl p-10 max-w-md mx-4 text-center shadow-2xl">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: '#f0fdf4' }}>
              <Award size={40} style={{ color: '#14532d' }} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">🎉 Félicitations !</h2>
            <p className="text-gray-600 mb-1">Vous avez complété la formation</p>
            <p className="font-bold text-gray-900 mb-4">"{course?.title}"</p>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Votre parcours est terminé ! Demandez votre certification officielle et planifiez votre évaluation avec un formateur.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/certificats"
                className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2"
                style={{ background: '#14532d' }}
              >
                <Award size={18} /> Demander ma certification
              </Link>
              <button
                onClick={() => setShowCertBanner(false)}
                className="w-full py-3 rounded-xl font-bold text-gray-600"
                style={{ background: '#f3f4f6' }}
              >
                Continuer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="bg-white sticky top-0 z-40 px-6 py-3 flex items-center gap-4" style={{ borderBottom: '1px solid #e5e7eb' }}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-9 h-9 rounded-lg flex items-center justify-center md:hidden"
          style={{ background: '#f3f4f6' }}
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#14532d' }}>
            <BookOpen size={16} color="white" />
          </div>
          <div className="hidden md:flex items-center gap-1 min-w-0">
            <Link href={`/cours/${id}`} className="text-sm font-semibold truncate" style={{ color: '#14532d' }}>
              {course?.title}
            </Link>
            <ChevronRight size={14} style={{ color: '#d1d5db' }} />
            <span className="text-sm text-gray-500 truncate">{lesson?.title}</span>
          </div>
        </div>

        {/* PROGRESS */}
        <div className="hidden md:flex items-center gap-3">
          <div className="text-xs text-gray-500">{completedCount}/{totalLessons} leçons</div>
          <div className="w-24 h-1.5 rounded-full" style={{ background: '#e5e7eb' }}>
            <div className="h-1.5 rounded-full transition-all" style={{ width: `${progressPercent}%`, background: '#14532d' }} />
          </div>
          <div className="text-xs font-bold" style={{ color: '#14532d' }}>{progressPercent}%</div>
        </div>

        <Link
          href={`/cours/${id}`}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 flex-shrink-0"
        >
          <ArrowLeft size={15} /> Retour
        </Link>
      </nav>

      <div className="flex flex-1">

        {/* SIDEBAR */}
        <aside
          className={`${sidebarOpen ? 'flex' : 'hidden'} md:flex flex-col w-72 bg-white fixed md:sticky top-14 z-40`}
          style={{ borderRight: '1px solid #e5e7eb', height: 'calc(100vh - 56px)', overflowY: 'auto' }}
        >
          <div className="p-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
            <h3 className="font-bold text-gray-900 text-sm mb-2">Contenu du cours</h3>
            <div className="w-full h-1.5 rounded-full" style={{ background: '#e5e7eb' }}>
              <div className="h-1.5 rounded-full transition-all" style={{ width: `${progressPercent}%`, background: '#14532d' }} />
            </div>
            <div className="text-xs text-gray-400 mt-1">{completedCount}/{totalLessons} terminées</div>
          </div>

          <div className="flex-1 p-2">
            {modules.map((mod, idx) => (
              <div key={idx} className="mb-3">
                <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {mod.title}
                </div>
                {mod.lessons.map((l) => (
                  <Link
                    key={l.id}
                    href={`/cours/${id}/lecon/${l.id}`}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all mb-0.5"
                    style={{
                      background: l.id === lessonId ? '#f0fdf4' : 'transparent',
                      color: l.id === lessonId ? '#14532d' : '#374151',
                      fontWeight: l.id === lessonId ? '600' : '400',
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: completedIds.includes(l.id) ? '#14532d' : '#f3f4f6' }}
                    >
                      {completedIds.includes(l.id)
                        ? <CheckCircle size={12} color="white" />
                        : getLessonIcon(l.type)
                      }
                    </div>
                    <span className="truncate">{l.title}</span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 max-w-3xl mx-auto px-6 py-8 w-full">

          {/* LESSON HEADER */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{
                  background: lesson?.type === 'exercise' ? '#fef3c7' : lesson?.type === 'quiz' ? '#ede9fe' : '#eff6ff',
                  color: lesson?.type === 'exercise' ? '#d97706' : lesson?.type === 'quiz' ? '#7c3aed' : '#2563eb'
                }}
              >
                {lesson?.type === 'exercise' ? '📝 Exercice' : lesson?.type === 'quiz' ? '✅ Quiz' : '📖 Leçon'}
              </span>
              {completed && (
                <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: '#f0fdf4', color: '#14532d' }}>
                  <CheckCircle size={12} /> Terminé
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{lesson?.title}</h1>
          </div>

          {/* VIDEO */}
          {youtubeId && (
            <div className="mb-8 rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
              <div className="relative" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  className="absolute inset-0 w-full h-full"
                  allowFullScreen
                  title={lesson?.title}
                />
              </div>
            </div>
          )}

          {driveEmbed && (
            <div className="mb-8 rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
              <div className="relative" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={driveEmbed}
                  className="absolute inset-0 w-full h-full"
                  allowFullScreen
                  title={lesson?.title}
                />
              </div>
            </div>
          )}

          {/* CONTENT */}
          {lesson?.content && (
            <div className="bg-white rounded-2xl p-8 mb-6" style={{ border: '1px solid #e5e7eb' }}>
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText size={16} style={{ color: '#14532d' }} />
                {lesson.type === 'exercise' ? 'Énoncé de l\'exercice' : lesson.type === 'quiz' ? 'Questions' : 'Contenu de la leçon'}
              </h2>
              <div className="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm">
                {lesson.content}
              </div>
            </div>
          )}

          {/* PDF RESOURCE */}
          {lesson?.pdf_url && (
            <div className="bg-white rounded-2xl p-5 mb-6 flex items-center justify-between" style={{ border: '1px solid #e5e7eb' }}>
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: '#f0fdf4' }}>
                  <FileText size={20} style={{ color: '#14532d' }} />
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-sm">Ressource PDF</div>
                  <div className="text-xs text-gray-400">Document téléchargeable</div>
                </div>
              </div>
              <a
                href={lesson.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
                style={{ background: '#14532d' }}
              >
                <Download size={15} /> Télécharger
              </a>
            </div>
          )}

          {/* ACTIONS */}
          <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #e5e7eb' }}>
            {!completed && (
              <button
                onClick={markComplete}
                disabled={marking}
                className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 mb-5 transition-opacity"
                style={{ background: '#14532d', opacity: marking ? 0.7 : 1 }}
              >
                <CheckCircle size={18} />
                {marking ? 'Enregistrement...' : 'Marquer comme terminé'}
              </button>
            )}

            {completed && isLastLesson && (
              <div className="mb-5 p-4 rounded-xl text-center" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <p className="font-bold text-sm" style={{ color: '#14532d' }}>🎉 Vous avez terminé tous les modules !</p>
                <Link href="/certificats" className="text-xs underline mt-1 inline-block" style={{ color: '#14532d' }}>
                  Demander ma certification →
                </Link>
              </div>
            )}

            <div className="flex justify-between gap-4">
              {prevLesson ? (
                <Link
                  href={`/cours/${id}/lecon/${prevLesson.id}`}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold"
                  style={{ background: '#f3f4f6', color: '#374151' }}
                >
                  <ArrowLeft size={15} /> Précédente
                </Link>
              ) : <div />}

              {nextLesson && (
                <Link
                  href={`/cours/${id}/lecon/${nextLesson.id}`}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white"
                  style={{ background: '#14532d' }}
                >
                  Suivante <ArrowRight size={15} />
                </Link>
              )}
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}