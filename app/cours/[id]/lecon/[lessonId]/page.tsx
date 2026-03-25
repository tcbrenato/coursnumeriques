'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  BookOpen, ArrowLeft, ArrowRight, CheckCircle,
  Play, FileText, ExternalLink, ChevronRight,
  Menu, X, Download
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function LessonPage() {
  const { id, lessonId } = useParams()
  const router = useRouter()
  const [lesson, setLesson] = useState<any>(null)
  const [course, setCourse] = useState<any>(null)
  const [modules, setModules] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [marking, setMarking] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const { data: lessonData } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single()
      setLesson(lessonData)

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

      const { data: progressData } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .single()
      setCompleted(progressData?.completed || false)

      setLoading(false)
    }
    fetchData()
  }, [lessonId, id, router])

  const markComplete = async () => {
    if (!user || completed) return
    setMarking(true)
    await supabase.from('progress').upsert({
      user_id: user.id,
      lesson_id: lessonId,
      completed: true,
      completed_at: new Date().toISOString()
    }, { onConflict: 'user_id,lesson_id' })
    setCompleted(true)
    setMarking(false)
  }

  const getYoutubeId = (url: string) => {
    if (!url) return null
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    return match ? match[1] : null
  }

  const getAllLessons = () => {
    return modules.flatMap(m => m.lessons || [])
  }

  const getCurrentIndex = () => {
    return getAllLessons().findIndex(l => l.id === lessonId)
  }

  const getNextLesson = () => {
    const all = getAllLessons()
    const idx = getCurrentIndex()
    return idx < all.length - 1 ? all[idx + 1] : null
  }

  const getPrevLesson = () => {
    const all = getAllLessons()
    const idx = getCurrentIndex()
    return idx > 0 ? all[idx - 1] : null
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

  const youtubeId = getYoutubeId(lesson?.video_url)
  const nextLesson = getNextLesson()
  const prevLesson = getPrevLesson()

  return (
    <div className="min-h-screen flex flex-col" style={{background: '#f9fafb'}}>

      {/* NAVBAR */}
      <nav className="bg-white sticky top-0 z-50 px-6 py-3 flex items-center gap-4" style={{borderBottom: '1px solid #e5e7eb'}}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-9 h-9 rounded-lg flex items-center justify-center md:hidden" style={{background: '#f3f4f6'}}>
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background: '#14532d'}}>
            <BookOpen size={16} color="white" />
          </div>
          <div className="hidden md:block">
            <Link href={`/cours/${id}`} className="text-sm font-semibold" style={{color: '#14532d'}}>
              {course?.title}
            </Link>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <ChevronRight size={12} />
              <span>{lesson?.title}</span>
            </div>
          </div>
        </div>
        <Link href={`/cours/${id}`} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900">
          <ArrowLeft size={16} /> Retour au cours
        </Link>
      </nav>

      <div className="flex flex-1">

        {/* SIDEBAR */}
        <aside className={`${sidebarOpen ? 'flex' : 'hidden'} md:flex flex-col w-72 bg-white fixed md:sticky top-16 h-screen overflow-y-auto z-40`} style={{borderRight: '1px solid #e5e7eb'}}>
          <div className="p-4" style={{borderBottom: '1px solid #f3f4f6'}}>
            <h3 className="font-bold text-gray-900 text-sm">Contenu du cours</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {modules.map((module, idx) => (
              <div key={module.id} className="mb-2">
                <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Module {idx + 1} — {module.title}
                </div>
                {module.lessons?.map((l: any) => (
                  <Link
                    key={l.id}
                    href={`/cours/${id}/lecon/${l.id}`}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
                    style={{
                      background: l.id === lessonId ? '#f0fdf4' : 'transparent',
                      color: l.id === lessonId ? '#14532d' : '#374151',
                      fontWeight: l.id === lessonId ? '600' : '400'
                    }}
                  >
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{background: l.id === lessonId ? '#14532d' : '#f3f4f6'}}>
                      <CheckCircle size={12} color={l.id === lessonId ? 'white' : '#9ca3af'} />
                    </div>
                    <span className="truncate">{l.title}</span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 max-w-4xl mx-auto px-6 py-8 w-full">

          {/* LESSON HEADER */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{lesson?.title}</h1>
            {completed && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold" style={{background: '#f0fdf4', color: '#14532d'}}>
                <CheckCircle size={14} /> Leçon terminée
              </div>
            )}
          </div>

          {/* VIDEO */}
          {youtubeId && (
            <div className="mb-8 rounded-2xl overflow-hidden" style={{border: '1px solid #e5e7eb'}}>
              <div className="relative" style={{paddingBottom: '56.25%'}}>
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  className="absolute inset-0 w-full h-full"
                  allowFullScreen
                  title={lesson?.title}
                />
              </div>
            </div>
          )}

          {/* TEXT CONTENT */}
          {lesson?.content && (
            <div className="bg-white rounded-2xl p-8 mb-6" style={{border: '1px solid #e5e7eb'}}>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText size={18} style={{color: '#14532d'}} /> Contenu de la leçon
              </h2>
              <div className="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm">
                {lesson.content}
              </div>
            </div>
          )}

          {/* PDF */}
          {lesson?.pdf_url && (
            <div className="bg-white rounded-2xl p-6 mb-6 flex items-center justify-between" style={{border: '1px solid #e5e7eb'}}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background: '#f0fdf4'}}>
                  <FileText size={22} style={{color: '#14532d'}} />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Ressource PDF</div>
                  <div className="text-sm text-gray-500">Document téléchargeable</div>
                </div>
              </div>
              
              <a 
                href={lesson.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{background: '#14532d'}}
              >
                <Download size={16} /> Télécharger
              </a>
            </div>
          )}

          {/* MARK COMPLETE + NAVIGATION */}
          <div className="bg-white rounded-2xl p-6" style={{border: '1px solid #e5e7eb'}}>
            {!completed && (
              <button
                onClick={markComplete}
                disabled={marking}
                className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 mb-6 transition-opacity"
                style={{background: '#14532d', opacity: marking ? 0.7 : 1}}
              >
                <CheckCircle size={18} />
                {marking ? 'Enregistrement...' : 'Marquer comme terminé'}
              </button>
            )}

            <div className="flex justify-between gap-4">
              {prevLesson ? (
                <Link
                  href={`/cours/${id}/lecon/${prevLesson.id}`}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-colors"
                  style={{background: '#f3f4f6', color: '#374151'}}
                >
                  <ArrowLeft size={16} /> Leçon précédente
                </Link>
              ) : <div />}

              {nextLesson && (
                <Link
                  href={`/cours/${id}/lecon/${nextLesson.id}`}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-opacity"
                  style={{background: '#14532d'}}
                >
                  Leçon suivante <ArrowRight size={16} />
                </Link>
              )}
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}