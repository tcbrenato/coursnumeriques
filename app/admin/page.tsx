'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Lock, ArrowRight, Shield } from 'lucide-react'

const ADMIN_PASSWORD = 'TCB69024349TCB'

export default function AdminLogin() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        localStorage.setItem('admin_auth', 'true')
        router.push('/admin/dashboard')
      } else {
        setError('Mot de passe incorrect.')
        setLoading(false)
      }
    }, 800)
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{background: '#0f172a'}}>
      <div className="w-full max-w-md px-8">

        {/* LOGO */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{background: '#14532d'}}>
            <BookOpen size={28} color="white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">CoursNumeriques</h1>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold" style={{background: 'rgba(255,255,255,0.1)', color: '#94a3b8'}}>
            <Shield size={12} />
            Espace Administrateur
          </div>
        </div>

        {/* CARD */}
        <div className="rounded-2xl p-8" style={{background: '#1e293b', border: '1px solid #334155'}}>
          <h2 className="text-xl font-bold text-white mb-2">Connexion Admin</h2>
          <p className="text-sm mb-8" style={{color: '#94a3b8'}}>Accès réservé aux administrateurs de la plateforme.</p>

          {error && (
            <div className="mb-6 p-4 rounded-xl text-sm font-medium" style={{background: 'rgba(220,38,38,0.1)', color: '#f87171', border: '1px solid rgba(220,38,38,0.2)'}}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{color: '#cbd5e1'}}>
                Mot de passe administrateur
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{color: '#64748b'}} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none text-white"
                  style={{background: '#0f172a', border: '1.5px solid #334155'}}
                  onFocus={(e) => e.target.style.borderColor = '#14532d'}
                  onBlur={(e) => e.target.style.borderColor = '#334155'}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-opacity"
              style={{background: '#14532d', opacity: loading ? 0.7 : 1}}
            >
              {loading ? 'Vérification...' : <><span>Accéder au panel</span><ArrowRight size={18} /></>}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{color: '#475569'}}>
          Accès non autorisé — Usage strictement réservé
        </p>
      </div>
    </div>
  )
}