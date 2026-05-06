// @ts-nocheck
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BookOpen, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function Register() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: '#f9fafb'}}>
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-sm" style={{border: '1px solid #e5e7eb'}}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{background: '#f0fdf4'}}>
            <BookOpen size={28} style={{color: '#14532d'}} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Compte créé !</h2>
          <p className="text-gray-500 mb-6">Vérifiez votre email pour confirmer votre inscription, puis connectez-vous.</p>
          <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white" style={{background: '#14532d'}}>
            Se connecter <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    )
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
            Rejoignez des<br />milliers d'apprenants<br />en Afrique
          </h2>
          <p style={{color: '#bbf7d0'}} className="text-lg">
            Inscription gratuite. Accès immédiat à toutes les formations.
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

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Créer un compte</h1>
          <p className="text-gray-500 mb-8">Inscription gratuite. Commencez à apprendre dès aujourd'hui.</p>

          {error && (
            <div className="mb-6 p-4 rounded-xl text-sm font-medium" style={{background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca'}}>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="flex flex-col gap-5">

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nom complet</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{color: '#9ca3af'}} />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Prénom Nom"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{border: '1.5px solid #e5e7eb', background: 'white'}}
                  onFocus={(e) => e.target.style.borderColor = '#14532d'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

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
                  placeholder="Minimum 6 caractères"
                  required
                  minLength={6}
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
              {loading ? 'Création...' : <><span>Créer mon compte</span><ArrowRight size={18} /></>}
            </button>

          </form>

          <p className="text-center text-gray-500 text-sm mt-8">
            Déjà un compte ?{' '}
            <Link href="/login" className="font-semibold" style={{color: '#14532d'}}>
              Se connecter
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}