'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  BookOpen, Award, ArrowLeft, Shield,
  Search, CheckCircle, Clock, User, Download
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AdminCertificats() {
  const router = useRouter()
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth')
    if (!auth) { router.push('/admin'); return }
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    const { data } = await supabase
      .from('certificates')
      .select('*, users(full_name, email), courses(title)')
      .order('issued_at', { ascending: false })
    setCertificates(data || [])
    setLoading(false)
  }

  const validatePayment = async (id) => {
    await supabase
      .from('certificates')
      .update({ is_paid: true })
      .eq('id', id)
    fetchCertificates()
  }

  const filtered = certificates.filter(c =>
    c.users?.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.users?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.courses?.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.certificate_number?.toLowerCase().includes(search.toLowerCase())
  )

  const paid = certificates.filter(c => c.is_paid).length
  const pending = certificates.filter(c => !c.is_paid).length

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
          <Link href="/admin/cours" className="text-sm font-medium" style={{color: '#94a3b8'}}>Formations</Link>
          <Link href="/admin/utilisateurs" className="text-sm font-medium" style={{color: '#94a3b8'}}>Utilisateurs</Link>
          <Link href="/admin/certificats" className="text-sm font-semibold" style={{color: '#22c55e'}}>Certificats</Link>
        </div>
        <Link href="/admin/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{color: '#94a3b8', border: '1px solid #334155'}}>
          <ArrowLeft size={16} /> Retour
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">

        {/* HEADER */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Certificats</h1>
            <p style={{color: '#94a3b8'}}>Gérez et validez les certificats de la plateforme.</p>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Award, label: 'Total certificats', value: certificates.length, color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
            { icon: CheckCircle, label: 'Validés & payés', value: paid, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
            { icon: Clock, label: 'En attente', value: pending, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
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
            placeholder="Rechercher par nom, email, formation..."
            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none text-white"
            style={{background: '#1e293b', border: '1px solid #334155'}}
          />
        </div>

        {/* TABLE */}
        <div className="rounded-2xl overflow-hidden" style={{background: '#1e293b', border: '1px solid #334155'}}>
          <div className="px-6 py-4 grid grid-cols-4 text-xs font-bold uppercase tracking-wide" style={{color: '#64748b', borderBottom: '1px solid #334155'}}>
            <span>Apprenant</span>
            <span>Formation</span>
            <span>Numéro</span>
            <span>Statut</span>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <p style={{color: '#64748b'}}>Chargement...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{background: 'rgba(167,139,250,0.1)'}}>
                <Award size={26} style={{color: '#a78bfa'}} />
              </div>
              <p className="font-bold text-white mb-2">Aucun certificat</p>
              <p className="text-sm" style={{color: '#64748b'}}>
                {search ? 'Aucun résultat pour cette recherche.' : 'Aucun certificat généré pour le moment.'}
              </p>
            </div>
          ) : (
            filtered.map((cert, i) => (
              <div key={cert.id} className="px-6 py-4 grid grid-cols-4 items-center gap-4" style={{borderBottom: i < filtered.length - 1 ? '1px solid #334155' : 'none'}}>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0" style={{background: '#14532d', color: 'white'}}>
                    {(cert.users?.full_name || cert.users?.email || 'U')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-white text-sm truncate">{cert.users?.full_name || 'Sans nom'}</div>
                    <div className="text-xs truncate" style={{color: '#64748b'}}>{cert.users?.email}</div>
                  </div>
                </div>

                <div className="text-sm truncate" style={{color: '#94a3b8'}}>
                  {cert.courses?.title || 'Formation inconnue'}
                </div>

                <div className="text-xs font-mono" style={{color: '#64748b'}}>
                  {cert.certificate_number || '—'}
                </div>

                <div className="flex items-center gap-2">
                  {cert.is_paid ? (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)'}}>
                      <CheckCircle size={12} /> Validé
                    </span>
                  ) : (
                    <button
                      onClick={() => validatePayment(cert.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
                      style={{background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)'}}
                    >
                      <Clock size={12} /> Valider paiement
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
