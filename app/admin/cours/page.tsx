// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  BookOpen, Plus, Pencil, Trash2, Eye, EyeOff,
  ArrowLeft, Search, Shield
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AdminCours() {
  const router = useRouter()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    title: '', 
    description: '', 
    category: '', 
    thumbnail_url: '', 
    is_published: false
  })
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth')
    if (!auth) { 
      router.push('/admin')
      return 
    }
    fetchCourses()
  }, [router])

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setCourses(data || [])
    } catch (err) {
      console.error("Erreur fetch:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    if (e) e.preventDefault()
    setSaving(true)
    
    try {
      if (editing) {
        await supabase.from('courses').update(form).eq('id', editing)
      } else {
        await supabase.from('courses').insert([form])
      }
      
      setShowForm(false)
      setEditing(null)
      setForm({ title: '', description: '', category: '', thumbnail_url: '', is_published: false })
      await fetchCourses()
    } catch (err) {
      console.error("Erreur save:", err)
      alert("Erreur lors de l'enregistrement")
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (course: any) => {
    setEditing(course.id)
    setForm({
      title: course.title,
      description: course.description || '',
      category: course.category || '',
      thumbnail_url: course.thumbnail_url || '',
      is_published: course.is_published
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: any) => {
    await supabase.from('courses').delete().eq('id', id)
    setDeleteConfirm(null)
    fetchCourses()
  }

  const togglePublish = async (id: any, current: boolean) => {
    await supabase.from('courses').update({ is_published: !current }).eq('id', id)
    fetchCourses()
  }

  const filtered = courses.filter((c: any) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  )

  const categories = [
    'dev', 'marketing', 'design', 'data', 'ecommerce', 'media', 'business', 'cyber'
  ]

  const categoryLabels: any = {
    dev: 'Développement Web',
    marketing: 'Marketing Digital',
    design: 'Design Graphique',
    data: 'Data & IA',
    ecommerce: 'E-commerce',
    media: 'Photo & Vidéo',
    business: 'Entrepreneuriat',
    cyber: 'Cybersécurité'
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
          <Link href="/admin/dashboard" className="text-sm font-medium" style={{color: '#94a3b8'}}>Tableau de bord</Link>
          <Link href="/admin/cours" className="text-sm font-semibold" style={{color: '#22c55e'}}>Formations</Link>
          <Link href="/admin/utilisateurs" className="text-sm font-medium" style={{color: '#94a3b8'}}>Utilisateurs</Link>
        </div>
        <Link href="/admin/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{color: '#94a3b8', border: '1px solid #334155'}}>
          <ArrowLeft size={16} /> Retour
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Gestion des formations</h1>
            <p style={{color: '#94a3b8'}}>Créez, modifiez et publiez vos formations.</p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ title: '', description: '', category: '', thumbnail_url: '', is_published: false }) }}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{background: '#14532d'}}
          >
            <Plus size={18} /> Nouvelle formation
          </button>
        </div>

        {showForm && (
          <div className="rounded-2xl p-8 mb-8" style={{background: '#1e293b', border: '1px solid #334155'}}>
            <h2 className="text-xl font-bold text-white mb-6">
              {editing ? 'Modifier la formation' : 'Créer une nouvelle formation'}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{color: '#cbd5e1'}}>Titre *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({...form, title: e.target.value})}
                    required
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none text-white"
                    style={{background: '#0f172a', border: '1.5px solid #334155'}}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{color: '#cbd5e1'}}>Catégorie</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({...form, category: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none text-white"
                    style={{background: '#0f172a', border: '1.5px solid #334155'}}
                  >
                    <option value="">Sélectionner</option>
                    {categories.map(cat => <option key={cat} value={cat}>{categoryLabels[cat]}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{color: '#cbd5e1'}}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none text-white resize-none"
                  style={{background: '#0f172a', border: '1.5px solid #334155'}}
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm({...form, is_published: !form.is_published})}
                  className="relative w-12 h-6 rounded-full transition-colors"
                  style={{background: form.is_published ? '#14532d' : '#334155'}}
                >
                  <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all" style={{left: form.is_published ? '26px' : '4px'}} />
                </button>
                <span className="text-sm font-medium" style={{color: '#cbd5e1'}}>
                  {form.is_published ? 'Publié' : 'Brouillon'}
                </span>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="px-8 py-3 rounded-xl text-sm font-bold text-white" style={{background: '#14532d', opacity: saving ? 0.7 : 1}}>
                  {saving ? 'Patientez...' : editing ? 'Mettre à jour' : 'Créer'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-8 py-3 rounded-xl text-sm font-bold" style={{background: '#334155', color: '#cbd5e1'}}>Annuler</button>
              </div>
            </form>
          </div>
        )}

        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{color: '#64748b'}} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none text-white"
            style={{background: '#1e293b', border: '1px solid #334155'}}
          />
        </div>

        <div className="rounded-2xl overflow-hidden" style={{background: '#1e293b', border: '1px solid #334155'}}>
          {loading ? (
            <div className="p-12 text-center text-gray-400">Chargement...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400">Aucune formation trouvée.</div>
          ) : (
            filtered.map((course: any, i: number) => (
              <div key={course.id} className="px-6 py-5 flex items-center justify-between gap-4" style={{borderBottom: i < filtered.length - 1 ? '1px solid #334155' : 'none'}}>
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-900/30">
                    <BookOpen size={20} className="text-green-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-white truncate">{course.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{categoryLabels[course.category] || 'Général'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => togglePublish(course.id, course.is_published)} className="p-2 rounded-lg" style={{background: '#334155', color: course.is_published ? '#22c55e' : '#94a3b8'}}>
                    {course.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button onClick={() => handleEdit(course)} className="p-2 rounded-lg bg-blue-500/10 text-blue-400"><Pencil size={16} /></button>
                  {deleteConfirm === course.id ? (
                    <button onClick={() => handleDelete(course.id)} className="px-3 py-1 bg-red-500 text-white rounded text-xs">Confirmer</button>
                  ) : (
                    <button onClick={() => setDeleteConfirm(course.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400"><Trash2 size={16} /></button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}