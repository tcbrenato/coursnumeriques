'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BookOpen, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email ou mot de passe incorrect.')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex" style={{background: '#f9fafb'}}>

      {/* LEFT - Branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 text-white" style={{background: 'linear-gradient(135deg, #14532d 0%, #166534 60%, #15803d 100%)'}}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{background: 'rgba(255,255,255,0.2)'}}>
            <BookOpen size={18} color="white" />
          </div>
          <span className="text-xl font-bold">CoursNumeriques</span>
        </div>
        <div>
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Bienvenue sur<br />votre espace<br />d'apprentissage
          </h2>
          <p style={{color: '#bbf7d0'}} className="text-lg">
            Continuez votre parcours et développez vos compétences digitales.
          </p>
        </div>
        <p style={{color: '#86efac'}} className="text-sm">© 2025 CoursNumeriques</p>
      </div>

      {/* RIGHT - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{background: '#14532d'}}>
              <BookOpen size={18} color="white" />
            </div>
            <span className="text-xl font-bold" style={{color: '#14532d'}}>CoursNumeriques</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Connexion</h1>
          <p className="text-gray-500 mb-8">Entrez vos identifiants pour accéder à votre compte.</p>

          {error && (
            <div className="mb-6 p-4 rounded-xl text-sm font-medium" style={{background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca'}}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-5">

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Adresse email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{color: '#9ca3af'}} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{border: '1.5px solid #e5e7eb', background: 'white'}}
                  onFocus={(e) => e.target.style.borderColor = '#14532d'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mot de passe</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{color: '#9ca3af'}} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-11 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{border: '1.5px solid #e5e7eb', background: 'white'}}
                  onFocus={(e) => e.target.style.borderColor = '#14532d'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{color: '#9ca3af'}}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-opacity"
              style={{background: '#14532d', opacity: loading ? 0.7 : 1}}
            >
              {loading ? 'Connexion...' : <><span>Se connecter</span><ArrowRight size={18} /></>}
            </button>

          </form>

          <p className="text-center text-gray-500 text-sm mt-8">
            Pas encore de compte ?{' '}
            <Link href="/register" className="font-semibold" style={{color: '#14532d'}}>
              S'inscrire gratuitement
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}