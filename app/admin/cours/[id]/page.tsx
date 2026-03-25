// @ts-nocheck
'use client'
import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  Plus, Trash2, ArrowLeft, ChevronDown, ChevronUp, 
  Video, FileText, Layout, AlignLeft, Save, X 
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function DetailCours() {
  const { id } = useParams()
  const [course, setCourse] = useState(null)
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [openModule, setOpenModule] = useState(null)

  // Formulaire Module
  const [showModuleForm, setShowModuleForm] = useState(false)
  const [moduleTitle, setModuleTitle] = useState('')
  
  // Formulaire Leçon
  const [activeModForLesson, setActiveModForLesson] = useState(null)
  const [lessonForm, setLessonForm] = useState({ 
    title: '', 
    content: '', 
    video_url: '', 
    pdf_url: '' 
  })

  useEffect(() => { 
    fetchData() 
  }, [id])

  async function fetchData() {
    setLoading(true)
    // Récupérer le cours
    const { data: c } = await supabase.from('courses').select('*').eq('id', id).single()
    setCourse(c)
    
    // Récupérer les modules et leurs leçons (ordonnés)
    const { data: m, error } = await supabase
      .from('modules')
      .select('*, lessons(*)')
      .eq('course_id', id)
      .order('created_at', { ascending: true })

    if (!error) {
      // On s'assure que les leçons dans chaque module sont aussi triées
      const sortedModules = m.map(mod => ({
        ...mod,
        lessons: mod.lessons.sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
      }))
      setModules(sortedModules)
    }
    setLoading(false)
  }

  // AJOUTER UN MODULE (CHAPITRE)
  async function addModule(e) {
    e.preventDefault()
    const { error } = await supabase.from('modules').insert([
      { title: moduleTitle, course_id: id, order_index: modules.length }
    ])
    if (!error) {
      setModuleTitle('')
      setShowModuleForm(false)
      fetchData()
    }
  }

  // SUPPRIMER UN MODULE
  async function deleteModule(modId) {
    if(confirm('Supprimer ce chapitre et TOUTES ses leçons ?')) {
      await supabase.from('modules').delete().eq('id', modId)
      fetchData()
    }
  }

  // AJOUTER UNE LEÇON
  async function addLesson(e) {
    e.preventDefault()
    const { error } = await supabase.from('lessons').insert([
      { 
        ...lessonForm, 
        module_id: activeModForLesson, 
        order_index: 0 
      }
    ])
    if (!error) {
      setLessonForm({ title: '', content: '', video_url: '', pdf_url: '' })
      setActiveModForLesson(null)
      fetchData()
    }
  }

  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-slate-400 italic font-bold">Chargement de la structure...</div>

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pb-20">
      {/* Header PRO */}
      <div className="bg-[#1e293b] border-b border-slate-700 sticky top-0 z-10 px-8 py-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Link href="/admin/cours" className="text-slate-400 flex items-center gap-2 mb-2 hover:text-white transition-colors text-sm">
              <ArrowLeft size={16}/> Retour au catalogue
            </Link>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <span className="text-green-500">Structure :</span> {course?.title}
            </h1>
          </div>
          <button 
            onClick={() => setShowModuleForm(true)} 
            className="bg-green-600 hover:bg-green-500 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-green-900/20 transition-all"
          >
            <Plus size={20}/> Nouveau Chapitre
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-8">
        {/* Formulaire de création de Module */}
        {showModuleForm && (
          <div className="bg-slate-800 p-6 rounded-2xl border border-green-900/30 mb-10 animate-in fade-in slide-in-from-top-4">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-green-400"><Layout size={18}/> Créer un nouveau chapitre</h3>
            <form onSubmit={addModule} className="flex gap-4">
              <input 
                className="flex-1 bg-slate-900 border border-slate-700 p-4 rounded-xl outline-none focus:border-green-500 transition-all" 
                placeholder="Ex: Introduction aux fondamentaux..." 
                value={moduleTitle} 
                onChange={e => setModuleTitle(e.target.value)} 
                required 
              />
              <button className="bg-green-600 px-8 rounded-xl font-bold hover:bg-green-500 transition-all">Créer</button>
              <button type="button" onClick={() => setShowModuleForm(false)} className="text-slate-400 hover:text-white px-2"><X/></button>
            </form>
          </div>
        )}

        {/* Accordéon des Modules */}
        <div className="space-y-6">
          {modules.length === 0 && !showModuleForm && (
            <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-dashed border-slate-700 text-slate-500">
              Aucun chapitre pour le moment. Commencez par en créer un !
            </div>
          )}

          {modules.map((mod) => (
            <div key={mod.id} className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl transition-all">
              {/* Entête du Module */}
              <div 
                className={`p-5 flex justify-between items-center cursor-pointer transition-colors ${openModule === mod.id ? 'bg-slate-700/50' : 'hover:bg-slate-700/30'}`} 
                onClick={() => setOpenModule(openModule === mod.id ? null : mod.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-green-500 font-bold text-sm">
                    {modules.indexOf(mod) + 1}
                  </div>
                  <span className="font-bold text-lg">{mod.title}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="bg-slate-900 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {mod.lessons?.length || 0} LEÇONS
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteModule(mod.id); }} 
                    className="text-slate-500 hover:text-red-500 p-2 transition-colors"
                  >
                    <Trash2 size={18}/>
                  </button>
                  {openModule === mod.id ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                </div>
              </div>

              {/* Contenu du Module (Leçons) */}
              {openModule === mod.id && (
                <div className="bg-slate-900/40 p-6 border-t border-slate-700 space-y-6">
                  {/* Liste des leçons existantes */}
                  <div className="space-y-3">
                    {mod.lessons?.map(les => (
                      <div key={les.id} className="group flex justify-between items-center bg-slate-800/80 p-4 rounded-xl border border-slate-700/50 hover:border-blue-500/50 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="flex gap-2 text-blue-400">
                            {les.video_url && <Video size={16} />}
                            {les.pdf_url && <FileText size={16} />}
                            {!les.video_url && !les.pdf_url && <AlignLeft size={16} />}
                          </div>
                          <span className="text-sm font-medium">{les.title}</span>
                        </div>
                        <button 
                          onClick={async () => { if(confirm('Supprimer cette leçon ?')) { await supabase.from('lessons').delete().eq('id', les.id); fetchData() } }} 
                          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-500 transition-all"
                        >
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Formulaire pour ajouter une leçon */}
                  {activeModForLesson === mod.id ? (
                    <div className="bg-slate-800 p-6 rounded-2xl border border-blue-900/30 animate-in zoom-in-95 duration-200">
                      <h4 className="text-sm font-bold text-blue-400 mb-4 flex items-center gap-2"><Plus size={14}/> Ajouter une leçon</h4>
                      <form onSubmit={addLesson} className="space-y-4">
                        <input 
                          className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-sm outline-none focus:border-blue-500 transition-all" 
                          placeholder="Titre de la leçon (ex: 1. Les bases de la couleur)" 
                          value={lessonForm.title} 
                          onChange={e => setLessonForm({...lessonForm, title: e.target.value})} 
                          required 
                        />
                        <textarea 
                          className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-sm outline-none focus:border-blue-500 transition-all" 
                          placeholder="Contenu textuel de la leçon..." 
                          rows={3}
                          value={lessonForm.content} 
                          onChange={e => setLessonForm({...lessonForm, content: e.target.value})} 
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="relative">
                            <Video className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16}/>
                            <input 
                              className="w-full bg-slate-900 border border-slate-700 pl-10 pr-3 py-3 rounded-xl text-xs outline-none focus:border-blue-500 transition-all" 
                              placeholder="Lien Vidéo (YouTube/Drive)" 
                              value={lessonForm.video_url} 
                              onChange={e => setLessonForm({...lessonForm, video_url: e.target.value})} 
                            />
                          </div>
                          <div className="relative">
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16}/>
                            <input 
                              className="w-full bg-slate-900 border border-slate-700 pl-10 pr-3 py-3 rounded-xl text-xs outline-none focus:border-blue-500 transition-all" 
                              placeholder="Lien PDF/Ressource" 
                              value={lessonForm.pdf_url} 
                              onChange={e => setLessonForm({...lessonForm, pdf_url: e.target.value})} 
                            />
                          </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                          <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all">
                            <Save size={16}/> Enregistrer la leçon
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setActiveModForLesson(null)} 
                            className="px-6 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-bold transition-all"
                          >
                            Annuler
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setActiveModForLesson(mod.id)} 
                      className="w-full py-4 border-2 border-dashed border-slate-700 rounded-2xl text-sm text-slate-500 hover:border-blue-500/50 hover:text-blue-400 hover:bg-blue-500/5 transition-all font-bold flex items-center justify-center gap-2"
                    >
                      <Plus size={18}/> Ajouter une leçon dans ce chapitre
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}