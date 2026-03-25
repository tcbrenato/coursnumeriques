'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import {
  BookOpen, Plus, Pencil, Trash2, ArrowLeft,
  Shield, ChevronDown, ChevronUp, Video, FileText
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AdminCoursDetail() {
  const router = useRouter()
  const { id } = useParams()
  const [course, setCourse] = useState(null)
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [openModule, setOpenModule] = useState(null)

  const [showModuleForm, setShowModuleForm] = useState(false)
  const [editingModule, setEditingModule] = useState(null)
  const [moduleForm, setModuleForm] = useState({ title: '', order_index: 0 })
  const [savingModule, setSavingModule] = useState(false)

  const [showLessonForm, setShowLessonForm] = useState(null)
  const [editingLesson, setEditingLesson] = useState(null)
  const [lessonForm, setLessonForm] = useState({ title: '', content: '', video_url: '', pdf_url: '', order_index: 0 })
  const [savingLesson, setSavingLesson] = useState(false)

  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth')
    if (!auth) { router.push('/admin'); return }
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: courseData } = await supabase.from('courses').select('*').eq('id', id).single()
    setCourse(courseData)
    const { data: modulesData } = await supabase
      .from('modules')
      .select('*, lessons(*)')
      .eq('course_id', id)
      .order('order_index')
    setModules(modulesData || [])
    setLoading(false)
  }

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingModule(true)
    if (editingModule) {
      await supabase.from('modules').update(moduleForm).eq('id', editingModule)
    } else {
      await supabase.from('modules').insert([{ ...moduleForm, course_id: id }])
    }
    setSavingModule(false)
    setShowModuleForm(false)
    setEditingModule(null)
    setModuleForm({ title: '', order_index: 0 })
    fetchData()
  }

  const handleDeleteModule = async (moduleId) => {
    await supabase.from('modules').delete().eq('id', moduleId)
    setDeleteConfirm(null)
    fetchData()
  }

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingLesson(true)
    if (editingLesson) {
      await supabase.from('lessons').update(lessonForm).eq('id', editingLesson)
    } else {
      await supabase.from('lessons').insert([{ ...lessonForm, module_id: showLessonForm }])
    }
    setSavingLesson(false)
    setShowLessonForm(null)
    setEditingLesson(null)
    setLessonForm({ title: '', content: '', video_url: '', pdf_url: '', order_index: 0 })
    fetchData()
  }

  const handleDeleteLesson = async (lessonId) => {
    await supabase.from('lessons').delete().eq('id', lessonId)
    setDeleteConfirm(null)
    fetchData()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: '#0f172a'}}>
        <p style={{color: '#94a3b8'}}>Chargement...</p>
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
        <Link href="/admin/cours" className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{color: '#94a3b8', border: '1px solid #334155'}}>
          <ArrowLeft size={16} /> Retour aux formations
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-10">

        {/* HEADER */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">{course?.title}</h1>
            <p style={{color: '#94a3b8'}}>Gérez les modules et leçons de cette formation.</p>
          </div>
          <button
            onClick={() => { setShowModuleForm(true); setEditingModule(null); setModuleForm({ title: '', order_index: modules.length + 1 }) }}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white"
            style={{background: '#14532d'}}
          >
            <Plus size={18} /> Ajouter un module
          </button>
        </div>

        {/* MODULE FORM */}
        {showModuleForm && (
          <div className="rounded-2xl p-6 mb-6" style={{background: '#1e293b', border: '1px solid #334155'}}>
            <h2 className="text-lg font-bold text-white mb-4">
              {editingModule ? 'Modifier le module' : 'Nouveau module'}
            </h2>
            <form onSubmit={handleSaveModule} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{color: '#cbd5e1'}}>Titre du module *</label>
                <input
                  type="text"
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({...moduleForm, title: e.target.value})}
                  placeholder="Ex: Introduction au HTML"
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none text-white"
                  style={{background: '#0f172a', border: '1.5px solid #334155'}}
                  onFocus={(e) => e.target.style.borderColor = '#14532d'}
                  onBlur={(e) => e.target.style.borderColor = '#334155'}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{color: '#cbd5e1'}}>Ordre</label>
                <input
                  type="number"
                  value={moduleForm.order_index}
                  onChange={(e) => setModuleForm({...moduleForm, order_index: parseInt(e.target.value)})}
                  className="w-32 px-4 py-3 rounded-xl text-sm outline-none text-white"
                  style={{background: '#0f172a', border: '1.5px solid #334155'}}
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={savingModule} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white" style={{background: '#14532d'}}>
                  {savingModule ? 'Enregistrement...' : editingModule ? 'Mettre à jour' : 'Créer le module'}
                </button>
                <button type="button" onClick={() => setShowModuleForm(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold" style={{background: '#334155', color: '#cbd5e1'}}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MODULES LIST */}
        {modules.length === 0 ? (
          <div className="rounded-2xl p-12 text-center" style={{background: '#1e293b', border: '1px solid #334155'}}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{background: 'rgba(34,197,94,0.1)'}}>
              <BookOpen size={26} style={{color: '#22c55e'}} />
            </div>
            <p className="font-bold text-white mb-2">Aucun module</p>
            <p className="text-sm" style={{color: '#64748b'}}>Créez votre premier module pour commencer.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {modules.map((module, idx) => (
              <div key={module.id} className="rounded-2xl overflow-hidden" style={{background: '#1e293b', border: '1px solid #334155'}}>

                {/* MODULE HEADER */}
                <div className="px-6 py-4 flex items-center justify-between">
                  <button onClick={() => setOpenModule(openModule === module.id ? null : module.id)} className="flex items-center gap-3 flex-1 text-left">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{background: 'rgba(34,197,94,0.1)', color: '#22c55e'}}>
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-white">{module.title}</div>
                      <div className="text-xs" style={{color: '#64748b'}}>{module.lessons?.length || 0} leçon{(module.lessons?.length || 0) !== 1 ? 's' : ''}</div>
                    </div>
                    {openModule === module.id ? <ChevronUp size={16} style={{color: '#64748b'}} className="ml-2" /> : <ChevronDown size={16} style={{color: '#64748b'}} className="ml-2" />}
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setEditingModule(module.id); setModuleForm({ title: module.title, order_index: module.order_index }); setShowModuleForm(true) }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{background: 'rgba(96,165,250,0.1)', color: '#60a5fa'}}
                    >
                      <Pencil size={14} />
                    </button>
                    {deleteConfirm === module.id ? (
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleDeleteModule(module.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{background: 'rgba(220,38,38,0.1)', color: '#f87171', border: '1px solid rgba(220,38,38,0.2)'}}>
                          Confirmer
                        </button>
                        <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{background: '#334155', color: '#94a3b8'}}>
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(module.id)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background: 'rgba(220,38,38,0.1)', color: '#f87171'}}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* LESSONS */}
                {openModule === module.id && (
                  <div style={{borderTop: '1px solid #334155'}}>
                    {module.lessons?.map((lesson, lIdx) => (
                      <div key={lesson.id} className="px-6 py-4 flex items-center justify-between" style={{borderBottom: '1px solid #1e293b', background: '#0f172a'}}>
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold" style={{background: '#1e293b', color: '#64748b'}}>
                            {lIdx + 1}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white">{lesson.title}</div>
                            <div className="flex items-center gap-3 mt-0.5">
                              {lesson.video_url && <span className="flex items-center gap-1 text-xs" style={{color: '#64748b'}}><Video size={10} /> Vidéo</span>}
                              {lesson.pdf_url && <span className="flex items-center gap-1 text-xs" style={{color: '#64748b'}}><FileText size={10} /> PDF</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingLesson(lesson.id)
                              setLessonForm({ title: lesson.title, content: lesson.content || '', video_url: lesson.video_url || '', pdf_url: lesson.pdf_url || '', order_index: lesson.order_index || 0 })
                              setShowLessonForm(module.id)
                            }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{background: 'rgba(96,165,250,0.1)', color: '#60a5fa'}}
                          >
                            <Pencil size={14} />
                          </button>
                          {deleteConfirm === lesson.id ? (
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleDeleteLesson(lesson.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{background: 'rgba(220,38,38,0.1)', color: '#f87171', border: '1px solid rgba(220,38,38,0.2)'}}>
                                Confirmer
                              </button>
                              <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{background: '#334155', color: '#94a3b8'}}>
                                Annuler
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => setDeleteConfirm(lesson.id)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background: 'rgba(220,38,38,0.1)', color: '#f87171'}}>
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* LESSON FORM */}
                    {showLessonForm === module.id && (
                      <div className="p-6" style={{background: '#0f172a', borderTop: '1px solid #334155'}}>
                        <h3 className="text-base font-bold text-white mb-4">
                          {editingLesson ? 'Modifier la leçon' : 'Nouvelle leçon'}
                        </h3>
                        <form onSubmit={handleSaveLesson} className="flex flex-col gap-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold mb-2" style={{color: '#cbd5e1'}}>Titre *</label>
                              <input
                                type="text"
                                value={lessonForm.title}
                                onChange={(e) => setLessonForm({...lessonForm, title: e.target.value})}
                                placeholder="Titre de la leçon"
                                required
                                className="w-full px-4 py-3 rounded-xl text-sm outline-none text-white"
                                style={{background: '#1e293b', border: '1.5px solid #334155'}}
                                onFocus={(e) => e.target.style.borderColor = '#14532d'}
                                onBlur={(e) => e.target.style.borderColor = '#334155'}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold mb-2" style={{color: '#cbd5e1'}}>Ordre</label>
                              <input
                                type="number"
                                value={lessonForm.order_index}
                                onChange={(e) => setLessonForm({...lessonForm, order_index: parseInt(e.target.value)})}
                                className="w-full px-4 py-3 rounded-xl text-sm outline-none text-white"
                                style={{background: '#1e293b', border: '1.5px solid #334155'}}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-2" style={{color: '#cbd5e1'}}>Contenu texte</label>
                            <textarea
                              value={lessonForm.content}
                              onChange={(e) => setLessonForm({...lessonForm, content: e.target.value})}
                              placeholder="Contenu de la leçon..."
                              rows={5}
                              className="w-full px-4 py-3 rounded-xl text-sm outline-none text-white resize-none"
                              style={{background: '#1e293b', border: '1.5px solid #334155'}}
                              onFocus={(e) => e.target.style.borderColor = '#14532d'}
                              onBlur={(e) => e.target.style.borderColor = '#334155'}
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold mb-2" style={{color: '#cbd5e1'}}>
                                <Video size={14} className="inline mr-1" /> URL Vidéo YouTube
                              </label>
                              <input
                                type="url"
                                value={lessonForm.video_url}
                                onChange={(e) => setLessonForm({...lessonForm, video_url: e.target.value})}
                                placeholder="https://youtube.com/watch?v=..."
                                className="w-full px-4 py-3 rounded-xl text-sm outline-none text-white"
                                style={{background: '#1e293b', border: '1.5px solid #334155'}}
                                onFocus={(e) => e.target.style.borderColor = '#14532d'}
                                onBlur={(e) => e.target.style.borderColor = '#334155'}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold mb-2" style={{color: '#cbd5e1'}}>
                                <FileText size={14} className="inline mr-1" /> URL PDF
                              </label>
                              <input
                                type="url"
                                value={lessonForm.pdf_url}
                                onChange={(e) => setLessonForm({...lessonForm, pdf_url: e.target.value})}
                                placeholder="https://example.com/doc.pdf"
                                className="w-full px-4 py-3 rounded-xl text-sm outline-none text-white"
                                style={{background: '#1e293b', border: '1.5px solid #334155'}}
                                onFocus={(e) => e.target.style.borderColor = '#14532d'}
                                onBlur={(e) => e.target.style.borderColor = '#334155'}
                              />
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button type="submit" disabled={savingLesson} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white" style={{background: '#14532d'}}>
                              {savingLesson ? 'Enregistrement...' : editingLesson ? 'Mettre à jour' : 'Créer la leçon'}
                            </button>
                            <button type="button" onClick={() => { setShowLessonForm(null); setEditingLesson(null) }} className="px-6 py-2.5 rounded-xl text-sm font-bold" style={{background: '#334155', color: '#cbd5e1'}}>
                              Annuler
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* ADD LESSON BUTTON */}
                    {showLessonForm !== module.id && (
                      <div className="px-6 py-4" style={{background: '#0f172a'}}>
                        <button
                          onClick={() => { setShowLessonForm(module.id); setEditingLesson(null); setLessonForm({ title: '', content: '', video_url: '', pdf_url: '', order_index: (module.lessons?.length || 0) + 1 }) }}
                          className="flex items-center gap-2 text-sm font-semibold"
                          style={{color: '#22c55e'}}
                        >
                          <Plus size={16} /> Ajouter une leçon
                        </button>
                      </div>
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