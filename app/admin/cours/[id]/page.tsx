// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  BookOpen, ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp,
  Save, X, Video, FileText, PenTool, Star, GripVertical, Eye
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

interface Course {
  id: string
  title: string
  category: string
  duration: string
  level: string
  is_published: boolean
}

const LESSON_TYPES = [
  { value: 'lesson',   label: 'Leçon',    icon: BookOpen,  color: '#3b82f6' },
  { value: 'exercise', label: 'Exercice', icon: PenTool,   color: '#f59e0b' },
  { value: 'quiz',     label: 'Quiz',     icon: Star,      color: '#8b5cf6' },
]

const emptyLesson = { title: '', content: '', video_url: '', pdf_url: '', type: 'lesson' }

export default function AdminCourseDetail() {
  const { id } = useParams()
  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<GroupedModule[]>([])
  const [loading, setLoading] = useState(true)
  const [openModule, setOpenModule] = useState<number | null>(0)

  // Module form
  const [showModuleForm, setShowModuleForm] = useState(false)
  const [newModuleTitle, setNewModuleTitle] = useState('')
  const [savingModule, setSavingModule] = useState(false)

  // Lesson form
  const [activeModuleIndex, setActiveModuleIndex] = useState<number | null>(null)
  const [lessonForm, setLessonForm] = useState({ ...emptyLesson })
  const [savingLesson, setSavingLesson] = useState(false)

  // Edit lesson
  const [editLesson, setEditLesson] = useState<Lesson | null>(null)

  useEffect(() => { fetchData() }, [id])

  async function fetchData() {
    setLoading(true)

    const { data: courseData } = await supabase
      .from('courses').select('*').eq('id', id).single()
    setCourse(courseData)

    const { data: lessonsData } = await supabase
      .from('lessons').select('*').eq('course_id', id)
      .order('module_index').order('order_index')

    if (lessonsData) {
      const grouped: { [key: number]: GroupedModule } = {}
      lessonsData.forEach((lesson: Lesson) => {
        const key = lesson.module_index ?? 0
        if (!grouped[key]) {
          grouped[key] = { title: lesson.module_title || `Module ${key + 1}`, index: key, lessons: [] }
        }
        grouped[key].lessons.push(lesson)
      })
      setModules(Object.values(grouped).sort((a, b) => a.index - b.index))
    } else {
      setModules([])
    }

    setLoading(false)
  }

  // ADD MODULE
  async function addModule(e) {
    e.preventDefault()
    if (!newModuleTitle.trim()) return
    setSavingModule(true)
    const newIndex = modules.length
    // Create a placeholder lesson to establish the module
    // (modules are virtual — defined by lessons)
    // We just store the module info, real lessons added after
    setModules(prev => [...prev, { title: newModuleTitle, index: newIndex, lessons: [] }])
    setNewModuleTitle('')
    setShowModuleForm(false)
    setSavingModule(false)
  }

  // DELETE MODULE (deletes all its lessons)
  async function deleteModule(moduleIndex: number) {
    if (!confirm('Supprimer ce module et toutes ses leçons ?')) return
    const mod = modules.find(m => m.index === moduleIndex)
    if (!mod) return
    const lessonIds = mod.lessons.map(l => l.id)
    if (lessonIds.length > 0) {
      await supabase.from('lessons').delete().in('id', lessonIds)
    }
    fetchData()
  }

  // ADD LESSON
  async function addLesson(e) {
    e.preventDefault()
    if (!lessonForm.title.trim()) return
    setSavingLesson(true)
    const mod = modules.find(m => m.index === activeModuleIndex)
    const moduleTitle = mod?.title || `Module ${(activeModuleIndex ?? 0) + 1}`
    const orderIndex = mod?.lessons.length ?? 0

    const { error } = await supabase.from('lessons').insert([{
      course_id: id,
      title: lessonForm.title,
      content: lessonForm.content || null,
      video_url: lessonForm.video_url || null,
      pdf_url: lessonForm.pdf_url || null,
      type: lessonForm.type,
      module_title: moduleTitle,
      module_index: activeModuleIndex ?? 0,
      order_index: orderIndex,
    }])

    if (!error) {
      setLessonForm({ ...emptyLesson })
      setActiveModuleIndex(null)
      fetchData()
    }
    setSavingLesson(false)
  }

  // DELETE LESSON
  async function deleteLesson(lessonId: string) {
    if (!confirm('Supprimer cette leçon ?')) return
    await supabase.from('lessons').delete().eq('id', lessonId)
    fetchData()
  }

  // UPDATE LESSON
  async function updateLesson(e) {
    e.preventDefault()
    if (!editLesson) return
    setSavingLesson(true)
    const { error } = await supabase.from('lessons').update({
      title: editLesson.title,
      content: editLesson.content,
      video_url: editLesson.video_url,
      pdf_url: editLesson.pdf_url,
      type: editLesson.type,
    }).eq('id', editLesson.id)
    if (!error) {
      setEditLesson(null)
      fetchData()
    }
    setSavingLesson(false)
  }

  // TOGGLE PUBLISH
  async function togglePublish() {
    if (!course) return
    await supabase.from('courses').update({ is_published: !course.is_published }).eq('id', id)
    fetchData()
  }

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0)

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f172a' }}>
      <div className="text-center">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: '#14532d' }}>
          <BookOpen size={20} color="white" />
        </div>
        <p className="text-sm" style={{ color: '#94a3b8' }}>Chargement...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen pb-20" style={{ background: '#0f172a' }}>

      {/* NAVBAR */}
      <nav className="px-8 py-4 flex justify-between items-center sticky top-0 z-50" style={{ background: '#1e293b', borderBottom: '1px solid #334155' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#14532d' }}>
            <BookOpen size={18} color="white" />
          </div>
          <span className="text-white font-bold">CoursNumeriques</span>
          <span style={{ color: '#334155' }}>›</span>
          <span style={{ color: '#94a3b8' }} className="text-sm">Admin</span>
          <span style={{ color: '#334155' }}>›</span>
          <span style={{ color: '#22c55e' }} className="text-sm font-semibold">Éditeur de cours</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/cours/${id}`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ color: '#94a3b8', border: '1px solid #334155' }}
          >
            <Eye size={15} /> Prévisualiser
          </Link>
          <button
            onClick={togglePublish}
            className="px-4 py-2 rounded-lg text-sm font-bold"
            style={{
              background: course?.is_published ? 'rgba(34,197,94,0.1)' : 'rgba(100,116,139,0.1)',
              color: course?.is_published ? '#22c55e' : '#64748b',
              border: course?.is_published ? '1px solid rgba(34,197,94,0.3)' : '1px solid #334155'
            }}
          >
            {course?.is_published ? '✓ Publié' : 'Brouillon'}
          </button>
          <Link href="/admin/cours" className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ color: '#94a3b8', border: '1px solid #334155' }}>
            <ArrowLeft size={15} /> Retour
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-8">

        {/* COURSE HEADER */}
        <div className="rounded-2xl p-6 mb-8" style={{ background: '#1e293b', border: '1px solid #334155' }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
                  {course?.category}
                </span>
                <span className="text-xs" style={{ color: '#64748b' }}>{course?.duration} · {course?.level || 'Débutant'}</span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">{course?.title}</h1>
              <p style={{ color: '#64748b' }} className="text-sm">{modules.length} module{modules.length !== 1 ? 's' : ''} · {totalLessons} leçon{totalLessons !== 1 ? 's' : ''}</p>
            </div>
            <button
              onClick={() => setShowModuleForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white flex-shrink-0"
              style={{ background: '#14532d' }}
            >
              <Plus size={16} /> Nouveau module
            </button>
          </div>
        </div>

        {/* ADD MODULE FORM */}
        {showModuleForm && (
          <div className="rounded-2xl p-6 mb-6" style={{ background: '#1e293b', border: '1px solid #22c55e', boxShadow: '0 0 0 1px rgba(34,197,94,0.1)' }}>
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Plus size={16} style={{ color: '#22c55e' }} /> Nouveau module
            </h3>
            <form onSubmit={addModule} className="flex gap-3">
              <input
                className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: '#0f172a', border: '1px solid #334155', color: 'white' }}
                placeholder="Ex: Module 1 — HTML5 : structure et sémantique"
                value={newModuleTitle}
                onChange={e => setNewModuleTitle(e.target.value)}
                autoFocus
                required
              />
              <button
                type="submit"
                disabled={savingModule}
                className="px-6 py-3 rounded-xl text-sm font-bold text-white"
                style={{ background: '#14532d' }}
              >
                {savingModule ? '...' : 'Créer'}
              </button>
              <button
                type="button"
                onClick={() => { setShowModuleForm(false); setNewModuleTitle('') }}
                className="px-3 py-3 rounded-xl"
                style={{ background: '#334155', color: '#94a3b8' }}
              >
                <X size={16} />
              </button>
            </form>
          </div>
        )}

        {/* MODULES LIST */}
        {modules.length === 0 && !showModuleForm ? (
          <div className="rounded-2xl p-16 text-center" style={{ background: '#1e293b', border: '2px dashed #334155' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(34,197,94,0.1)' }}>
              <BookOpen size={26} style={{ color: '#22c55e' }} />
            </div>
            <p className="font-bold text-white mb-2">Aucun module pour le moment</p>
            <p className="text-sm mb-6" style={{ color: '#64748b' }}>Commencez par créer le premier module de ce cours.</p>
            <button
              onClick={() => setShowModuleForm(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: '#14532d' }}
            >
              <Plus size={16} /> Créer un module
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {modules.map((mod, idx) => (
              <div key={idx} className="rounded-2xl overflow-hidden" style={{ background: '#1e293b', border: '1px solid #334155' }}>

                {/* MODULE HEADER */}
                <div
                  className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-700/30 transition-colors"
                  onClick={() => setOpenModule(openModule === idx ? null : idx)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: '#14532d', color: 'white' }}>
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-white">{mod.title}</div>
                      <div className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                        {mod.lessons.length} leçon{mod.lessons.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={e => { e.stopPropagation(); deleteModule(mod.index) }}
                      className="p-2 rounded-lg transition-colors hover:bg-red-500/10"
                      style={{ color: '#475569' }}
                      title="Supprimer le module"
                    >
                      <Trash2 size={15} />
                    </button>
                    {openModule === idx
                      ? <ChevronUp size={18} style={{ color: '#22c55e' }} />
                      : <ChevronDown size={18} style={{ color: '#475569' }} />
                    }
                  </div>
                </div>

                {/* MODULE CONTENT */}
                {openModule === idx && (
                  <div style={{ borderTop: '1px solid #334155' }}>

                    {/* LESSONS */}
                    {mod.lessons.length > 0 && (
                      <div className="p-4 space-y-2">
                        {mod.lessons.map((lesson) => (
                          <div key={lesson.id}>
                            {editLesson?.id === lesson.id ? (
                              /* EDIT FORM */
                              <div className="rounded-xl p-4" style={{ background: '#0f172a', border: '1px solid #3b82f6' }}>
                                <form onSubmit={updateLesson} className="space-y-3">
                                  <input
                                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                                    style={{ background: '#1e293b', border: '1px solid #334155', color: 'white' }}
                                    value={editLesson.title}
                                    onChange={e => setEditLesson({ ...editLesson, title: e.target.value })}
                                    placeholder="Titre de la leçon"
                                    required
                                  />
                                  <textarea
                                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
                                    style={{ background: '#1e293b', border: '1px solid #334155', color: 'white' }}
                                    rows={4}
                                    value={editLesson.content || ''}
                                    onChange={e => setEditLesson({ ...editLesson, content: e.target.value })}
                                    placeholder="Contenu de la leçon (théorie, explications, exemples...)"
                                  />
                                  <div className="grid grid-cols-2 gap-3">
                                    <input
                                      className="px-3 py-2.5 rounded-lg text-sm outline-none"
                                      style={{ background: '#1e293b', border: '1px solid #334155', color: 'white' }}
                                      value={editLesson.video_url || ''}
                                      onChange={e => setEditLesson({ ...editLesson, video_url: e.target.value })}
                                      placeholder="🎥 Lien vidéo (YouTube/Drive)"
                                    />
                                    <input
                                      className="px-3 py-2.5 rounded-lg text-sm outline-none"
                                      style={{ background: '#1e293b', border: '1px solid #334155', color: 'white' }}
                                      value={editLesson.pdf_url || ''}
                                      onChange={e => setEditLesson({ ...editLesson, pdf_url: e.target.value })}
                                      placeholder="📄 Lien PDF/Ressource"
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    {LESSON_TYPES.map(t => (
                                      <button
                                        key={t.value}
                                        type="button"
                                        onClick={() => setEditLesson({ ...editLesson, type: t.value })}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                                        style={{
                                          background: editLesson.type === t.value ? t.color + '20' : '#1e293b',
                                          color: editLesson.type === t.value ? t.color : '#64748b',
                                          border: `1px solid ${editLesson.type === t.value ? t.color + '50' : '#334155'}`
                                        }}
                                      >
                                        <t.icon size={12} /> {t.label}
                                      </button>
                                    ))}
                                  </div>
                                  <div className="flex gap-2 pt-1">
                                    <button type="submit" disabled={savingLesson} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white" style={{ background: '#14532d' }}>
                                      <Save size={13} /> {savingLesson ? 'Enregistrement...' : 'Enregistrer'}
                                    </button>
                                    <button type="button" onClick={() => setEditLesson(null)} className="px-4 py-2 rounded-lg text-xs font-bold" style={{ background: '#334155', color: '#94a3b8' }}>
                                      Annuler
                                    </button>
                                  </div>
                                </form>
                              </div>
                            ) : (
                              /* LESSON ROW */
                              <div
                                className="flex items-center gap-3 px-4 py-3 rounded-xl group"
                                style={{ background: '#0f172a', border: '1px solid #1e293b' }}
                              >
                                <GripVertical size={14} style={{ color: '#334155' }} className="flex-shrink-0" />
                                <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                                  style={{ background: LESSON_TYPES.find(t => t.value === lesson.type)?.color + '20' || '#1e293b' }}>
                                  {(() => {
                                    const t = LESSON_TYPES.find(x => x.value === lesson.type)
                                    return t ? <t.icon size={12} style={{ color: t.color }} /> : <BookOpen size={12} style={{ color: '#3b82f6' }} />
                                  })()}
                                </div>
                                <span className="flex-1 text-sm font-medium text-white">{lesson.title}</span>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {lesson.video_url && <Video size={13} style={{ color: '#64748b' }} />}
                                  {lesson.pdf_url && <FileText size={13} style={{ color: '#64748b' }} />}
                                  <button
                                    onClick={() => setEditLesson({ ...lesson })}
                                    className="px-3 py-1 rounded-lg text-xs font-semibold"
                                    style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' }}
                                  >
                                    Modifier
                                  </button>
                                  <button
                                    onClick={() => deleteLesson(lesson.id)}
                                    className="p-1.5 rounded-lg transition-colors"
                                    style={{ color: '#475569' }}
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ADD LESSON FORM */}
                    {activeModuleIndex === mod.index ? (
                      <div className="m-4 rounded-xl p-5" style={{ background: '#0f172a', border: '1px solid #22c55e' }}>
                        <h4 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: '#22c55e' }}>
                          <Plus size={14} /> Nouvelle leçon dans "{mod.title}"
                        </h4>
                        <form onSubmit={addLesson} className="space-y-3">
                          <input
                            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                            style={{ background: '#1e293b', border: '1px solid #334155', color: 'white' }}
                            placeholder="Titre de la leçon (ex: Introduction aux balises HTML)"
                            value={lessonForm.title}
                            onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })}
                            autoFocus
                            required
                          />
                          <textarea
                            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
                            style={{ background: '#1e293b', border: '1px solid #334155', color: 'white' }}
                            rows={5}
                            placeholder="Contenu de la leçon : théorie, explications, exemples, exercices..."
                            value={lessonForm.content}
                            onChange={e => setLessonForm({ ...lessonForm, content: e.target.value })}
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <div className="relative">
                              <Video size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#475569' }} />
                              <input
                                className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none"
                                style={{ background: '#1e293b', border: '1px solid #334155', color: 'white' }}
                                placeholder="Lien vidéo (YouTube / Drive)"
                                value={lessonForm.video_url}
                                onChange={e => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                              />
                            </div>
                            <div className="relative">
                              <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#475569' }} />
                              <input
                                className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none"
                                style={{ background: '#1e293b', border: '1px solid #334155', color: 'white' }}
                                placeholder="Lien PDF / Ressource"
                                value={lessonForm.pdf_url}
                                onChange={e => setLessonForm({ ...lessonForm, pdf_url: e.target.value })}
                              />
                            </div>
                          </div>

                          {/* TYPE */}
                          <div className="flex gap-2">
                            {LESSON_TYPES.map(t => (
                              <button
                                key={t.value}
                                type="button"
                                onClick={() => setLessonForm({ ...lessonForm, type: t.value })}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                                style={{
                                  background: lessonForm.type === t.value ? t.color + '20' : '#1e293b',
                                  color: lessonForm.type === t.value ? t.color : '#64748b',
                                  border: `1px solid ${lessonForm.type === t.value ? t.color + '50' : '#334155'}`
                                }}
                              >
                                <t.icon size={12} /> {t.label}
                              </button>
                            ))}
                          </div>

                          <div className="flex gap-2 pt-1">
                            <button
                              type="submit"
                              disabled={savingLesson}
                              className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-bold text-white"
                              style={{ background: '#14532d' }}
                            >
                              <Save size={14} /> {savingLesson ? 'Enregistrement...' : 'Ajouter la leçon'}
                            </button>
                            <button
                              type="button"
                              onClick={() => { setActiveModuleIndex(null); setLessonForm({ ...emptyLesson }) }}
                              className="px-4 py-2.5 rounded-lg text-sm font-bold"
                              style={{ background: '#334155', color: '#94a3b8' }}
                            >
                              Annuler
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setActiveModuleIndex(mod.index); setOpenModule(idx) }}
                        className="w-full py-4 mx-0 text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:bg-slate-800/50"
                        style={{ color: '#475569', borderTop: mod.lessons.length > 0 ? '1px solid #1e293b' : 'none' }}
                      >
                        <Plus size={15} /> Ajouter une leçon
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}