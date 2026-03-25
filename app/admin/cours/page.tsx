// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Plus, Trash2, Settings, Shield, ArrowLeft, 
  Search, BookOpen, Layout 
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AdminCours() {
  // On ajoute <any[]> et <any> pour éviter les erreurs de type pendant le build
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  
  const [form, setForm] = useState<any>({ 
    title: '', 
    description: '', 
    category: '', 
    is_published: false 
  })
  
  // ... reste du code identique
  
  // Formulaire complet avec catégories
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    category: '', 
    is_published: false 
  })

  const categories = [
    'Marketing Digital', 
    'Développement Web', 
    'Design Graphique', 
    'E-commerce', 
    'Data & IA'
  ]

  useEffect(() => { 
    fetchCourses() 
  }, [])

  async function fetchCourses() {
    setLoading(true)
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!error) setCourses(data || [])
    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const { error } = await supabase.from('courses').insert([form])
    
    if (!error) {
      setForm({ title: '', description: '', category: '', is_published: false })
      setShowForm(false)
      fetchCourses()
    } else {
      alert("Erreur lors de la création")
    }
  }

  // Filtrage pour la barre de recherche
  const filtered = courses.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Barre de navigation */}
      <nav className="px-8 py-4 flex justify-between items-center bg-[#1e293b] border-b border-slate-700 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
            <BookOpen size={20} />
          </div>
          <div>
            <span className="font-bold block">Administration</span>
            <span className="text-xs text-green-500 flex items-center gap-1"><Shield size={10}/> Mode Editeur</span>
          </div>
        </div>
        <Link href="/admin/dashboard" className="text-sm text-slate-400 hover:text-white flex items-center gap-2 transition-all">
          <ArrowLeft size={16}/> Retour au Dashboard
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold">Catalogue de Formations</h1>
            <p className="text-slate-400 mt-1">Créez et gérez vos programmes d'apprentissage.</p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="bg-green-600 hover:bg-green-500 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-green-900/20"
          >
            <Plus size={20}/> Nouveau Cours
          </button>
        </div>

        {/* Formulaire de création */}
        {showForm && (
          <div className="bg-[#1e293b] p-8 rounded-2xl mb-10 border border-slate-700 shadow-2xl animate-in fade-in slide-in-from-top-4">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Layout className="text-green-500" size={20}/> Détails de la formation
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Titre de la formation *</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Masterclass UI/UX Design" 
                    className="w-full bg-[#0f172a] border border-slate-700 p-4 rounded-xl text-white outline-none focus:border-green-500 transition-all" 
                    value={form.title} 
                    onChange={e => setForm({...form, title: e.target.value})} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Catégorie</label>
                  <select 
                    className="w-full bg-[#0f172a] border border-slate-700 p-4 rounded-xl text-white outline-none focus:border-green-500 transition-all"
                    value={form.category}
                    onChange={e => setForm({...form, category: e.target.value})}
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Description</label>
                <textarea 
                  placeholder="De quoi parle cette formation ?" 
                  rows={3}
                  className="w-full bg-[#0f172a] border border-slate-700 p-4 rounded-xl text-white outline-none focus:border-green-500 transition-all" 
                  value={form.description} 
                  onChange={e => setForm({...form, description: e.target.value})} 
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button type="submit" className="flex-1 bg-green-600 hover:bg-green-500 py-4 rounded-xl font-bold transition-all">
                  Enregistrer et Créer
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)} 
                  className="px-8 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition-all"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Barre de recherche */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher une formation par son nom..." 
            className="w-full bg-[#1e293b] border border-slate-700 pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-blue-500 transition-all"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Liste des cours */}
        <div className="grid gap-4">
          {loading ? (
            <div className="py-20 text-center text-slate-500 italic">Chargement du catalogue...</div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-slate-500 bg-[#1e293b] rounded-2xl border border-dashed border-slate-700">
              Aucune formation trouvée.
            </div>
          ) : (
            filtered.map(course => (
              <div key={course.id} className="group bg-[#1e293b] p-6 rounded-2xl border border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-500 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-white">{course.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-400/10 px-2 py-1 rounded">
                        {course.category || 'Général'}
                      </span>
                      <span className="text-xs text-slate-500">
                        Ajouté le {new Date(course.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <Link 
                    href={`/admin/cours/${course.id}`} 
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 px-5 py-3 rounded-xl transition-colors font-bold"
                  >
                    <Settings size={18} /> Gérer le contenu
                  </Link>
                  <button 
                    onClick={async () => { 
                      if(confirm('🚨 ATTENTION : Voulez-vous vraiment supprimer cette formation ainsi que tous ses modules et leçons ?')) { 
                        await supabase.from('courses').delete().eq('id', course.id); 
                        fetchCourses(); 
                      } 
                    }} 
                    className="bg-red-600/10 text-red-500 p-3 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                    title="Supprimer"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}