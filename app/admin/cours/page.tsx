'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  BookOpen, Plus, Pencil, Trash2, Eye, EyeOff,
  ArrowLeft, Search, ChevronRight, Shield
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AdminCours() {
  const router = useRouter()
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    title: '', description: '', category: '', thumbnail_url: '', is_published: false
  })
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth')
    if (!auth) { router.push('/admin'); return }
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    const { data } = await supabase.from('courses').select('*').order('created_at', { ascending: false })
    setCourses(data || [])
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    if (editing) {
      await supabase.from('courses').update(form).eq('id', editing)
    } else {
      await supabase.from('courses').insert([form])
    }
    setSaving(false)
    setShowForm(false)
    setEditing(null)
    setForm({ title: '', description: '', category: '', thumbnail_url: '', is_published: false })
    fetchCourses()
  }

  const handleEdit = (course) => {
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

  const handleDelete = async (id) => {
    await supabase.from('courses').delete().eq('id', id)
    setDeleteConfirm(null)
    fetchCourses()
  }

  const togglePublish = async (id, current) => {
    await supabase.from('courses').update({ is_published: !current }).eq('id', id)
    fetchCourses()
  }

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  )

  const categories = [
    'dev', 'marketing', 'design', 'data', 'ecommerce', 'media', 'business', 'cyber'
  ]

  const categoryLabels = {
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
          <Link href="/admin/dashboard" className="text-sm font-medium" style={{color: '#94a3b8'}}>
            Tableau de bord
          </Link>
          <Link href="/admin/cours" className="text-sm font-semibold" style={{color: '#22c55e'}}>
            Formations
          </Link>
          <Link href="/admin/utilisateurs" className="text-sm font-medium" style={{color: '#94a3b8'}}>
            Utilisateurs
          </Link>
        </div>
        <Link href="/admin/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{color: '#94a3b8', border: '1px solid #334155'}}>
          <ArrowLeft size={16} /> Retour
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">

        {/* HEADER */}
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

        {/* FORM */}
        {showForm && (
          <div className="rounded-2xl p-8 mb-8" style={{background: '#1e293b', border: '1px solid #334155'}}>
            <h2 className="text-xl font-bold text-white mb-6">
              {editing ? 'Modifier la formation' : 'Créer une nouvelle formation'}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{color: '#cbd5e1'}}>
                    Titre de la formation *
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({...form, title: e.target.value})}
                    placeholder="Ex: Introduction au Marketing Digital"
                    required
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none text-white"
                    style={{background: '#0f172a', border: '1.5px solid #334155'}}
                    onFocus={(e) => e.target.style.borderColor = '#14532d'}
                    onBlur={(e) => e.target.style.borderColor = '#334155'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{color: '#cbd5e1'}}>
                    Catégorie
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({...form, category: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none text-white"
                    style={{background: '#0f172a', border: '1.5px solid #334155'}}
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{categoryLabels[cat]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{color: '#cbd5e1'}}>
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  placeholder="Décrivez le contenu et les objectifs de cette formation..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none text-white resize-none"
                  style={{background: '#0f172a', border: '1.5px solid #334155'}}
                  onFocus={(e) => e.target.style.borderColor = '#14532d'}
                  onBlur={(e) => e.target.style.borderColor = '#334155'}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{color: '#cbd5e1'}}>
                  URL de l'image de couverture
                </label>
                <input
                  type="url"
                  value={form.thumbnail_url}
                  onChange={(e) => setForm({...form, thumbnail_url: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none text-white"
                  style={{background: '#0f172a', border: '1.5px solid #334155'}}
                  onFocus={(e) => e.target.style.borderColor = '#14532d'}
                  onBlur={(e) => e.target.style.borderColor = '#334155'}
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm({...form, is_published: !form.is_published})}
                  className="relative w-12 h-6 rounded-full transition-colors"
                  style={{background: form.is_published ? '#14532d' : '#334155'}}
                >
                  <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                    style={{left: form.is_published ? '26px' : '4px'}}
                  />
                </button>
                <span className="text-sm font-medium" style={{color: '#cbd5e1'}}>
                  {form.is_published ? 'Publier immédiatement' : 'Enregistrer comme brouillon'}
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 rounded-xl text-sm font-bold text-white transition-opacity"
                  style={{background: '#14532d', opacity: saving ? 0.7 : 1}}
                >
                  {saving ? 'Enregistrement...' : editing ? 'Mettre à jour' : 'Créer la formation'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditing(null) }}
                  className="px-8 py-3 rounded-xl text-sm font-bold transition-opacity"
                  style={{background: '#334155', color: '#cbd5e1'}}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SEARCH */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{color: '#64748b'}} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une formation..."
            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none text-white"
            style={{background: '#1e293b', border: '1px solid #334155'}}
          />
        </div>

        {/* LIST */}
        <div className="rounded-2xl overflow-hidden" style={{background: '#1e293b', border: '1px solid #334155'}}>
          <div className="px-6 py-4" style={{borderBottom: '1px solid #334155'}}>
            <span className="text-sm font-semibold text-white">{filtered.length} formation{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <p style={{color: '#64748b'}}>Chargement...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{background: 'rgba(34,197,94,0.1)'}}>
                <BookOpen size={26} style={{color: '#22c55e'}} />
              </div>
              <p className="font-bold text-white mb-2">Aucune formation</p>
              <p className="text-sm" style={{color: '#64748b'}}>Créez votre première formation en cliquant sur "Nouvelle formation".</p>
            </div>
          ) : (
            filtered.map((course, i) => (
              <div key={course.id} className="px-6 py-5 flex items-center justify-between gap-4" style={{borderBottom: i < filtered.length - 1 ? '1px solid #334155' : 'none'}}>
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{background: '#14532d'}}>
                    <BookOpen size={20} color="white" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-white truncate">{course.title}</div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{background: 'rgba(34,197,94,0.1)', color: '#22c55e'}}>
                        {categoryLabels[course.category] || 'Général'}
                      </span>
                      <span className="text-xs" style={{color: '#64748b'}}>
                        {new Date(course.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => togglePublish(course.id, course.is_published)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{
                      background: course.is_published ? 'rgba(34,197,94,0.1)' : 'rgba(100,116,139,0.1)',
                      color: course.is_published ? '#22c55e' : '#64748b',
                      border: course.is_published ? '1px solid rgba(34,197,94,0.2)' : '1px solid #334155'
                    }}
                  >
                    {course.is_published ? <><Eye size={12} /> Publié</> : <><EyeOff size={12} /> Brouillon</>}
                  </button>

                  <button
                    onClick={() => handleEdit(course)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{background: 'rgba(96,165,250,0.1)', color: '#60a5fa'}}
                  >
                    <Pencil size={14} />
                  </button>

                  {deleteConfirm === course.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold"
                        style={{background: 'rgba(220,38,38,0.1)', color: '#f87171', border: '1px solid rgba(220,38,38,0.2)'}}
                      >
                        Confirmer
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold"
                        style={{background: '#334155', color: '#94a3b8'}}
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(course.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{background: 'rgba(220,38,38,0.1)', color: '#f87171'}}
                    >
                      <Trash2 size={14} />
                    </button>
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