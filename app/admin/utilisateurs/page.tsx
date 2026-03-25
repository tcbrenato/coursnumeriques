'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  BookOpen, Users, ArrowLeft, Shield,
  Search, Mail, Calendar, Award
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AdminUtilisateurs() {
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth')
    if (!auth) { router.push('/admin'); return }
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  )

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
          <Link href="/admin/cours" className="text-sm font-medium" style={{color: '#94a3b8'}}>
            Formations
          </Link>
          <Link href="/admin/utilisateurs" className="text-sm font-semibold" style={{color: '#22c55e'}}>
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
            <h1 className="text-3xl font-bold text-white mb-1">Utilisateurs</h1>
            <p style={{color: '#94a3b8'}}>Liste de tous les apprenants inscrits sur la plateforme.</p>
          </div>
          <div className="px-4 py-2 rounded-xl text-sm font-bold" style={{background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)'}}>
            {users.length} inscrit{users.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Users, label: 'Total inscrits', value: users.length, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
            { icon: Calendar, label: 'Ce mois-ci', value: users.filter(u => new Date(u.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length, color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
            { icon: Award, label: 'Avec certificat', value: 0, color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl p-6" style={{background: '#1e293b', border: '1px solid #334155'}}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{background: stat.bg}}>
                <stat.icon size={20} style={{color: stat.color}} />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-xs" style={{color: '#64748b'}}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* SEARCH */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{color: '#64748b'}} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un utilisateur..."
            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none text-white"
            style={{background: '#1e293b', border: '1px solid #334155'}}
          />
        </div>

        {/* TABLE */}
        <div className="rounded-2xl overflow-hidden" style={{background: '#1e293b', border: '1px solid #334155'}}>
          <div className="px-6 py-4 grid grid-cols-3 text-xs font-bold uppercase tracking-wide" style={{color: '#64748b', borderBottom: '1px solid #334155'}}>
            <span>Utilisateur</span>
            <span>Email</span>
            <span>Inscrit le</span>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <p style={{color: '#64748b'}}>Chargement...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{background: 'rgba(96,165,250,0.1)'}}>
                <Users size={26} style={{color: '#60a5fa'}} />
              </div>
              <p className="font-bold text-white mb-2">Aucun utilisateur</p>
              <p className="text-sm" style={{color: '#64748b'}}>
                {search ? 'Aucun résultat pour cette recherche.' : 'Aucun utilisateur inscrit pour le moment.'}
              </p>
            </div>
          ) : (
            filtered.map((user, i) => (
              <div key={user.id} className="px-6 py-4 grid grid-cols-3 items-center" style={{borderBottom: i < filtered.length - 1 ? '1px solid #334155' : 'none'}}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm" style={{background: '#14532d', color: 'white'}}>
                    {(user.full_name || user.email || 'U')[0].toUpperCase()}
                  </div>
                  <span className="font-semibold text-white text-sm">
                    {user.full_name || 'Sans nom'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} style={{color: '#64748b'}} />
                  <span className="text-sm" style={{color: '#94a3b8'}}>{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} style={{color: '#64748b'}} />
                  <span className="text-sm" style={{color: '#94a3b8'}}>
                    {new Date(user.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}