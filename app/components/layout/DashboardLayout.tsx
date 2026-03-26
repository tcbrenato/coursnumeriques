// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
// On utilise ton client local au lieu de l'helper qui pose problème
import { supabase } from '@/lib/supabase' 
import {
  LayoutDashboard, BookOpen, User, LogOut,
  Menu, X, Award, ChevronRight
} from 'lucide-react'

const navItems = [
  { href: '/dashboard',   label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/cours',       label: 'Formations',       icon: BookOpen },
  { href: '/profil',      label: 'Mon profil',        icon: User },
  { href: '/certificats', label: 'Certificats',       icon: Award },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) { 
        router.push('/login')
        return 
      }
      setUser(authUser)
    }
    getUser()
  }, [router]) // Ajout de router en dépendance pour être propre

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-30
        transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:block
      `}>
        <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
          <BookOpen className="text-green-600" size={24} />
          <span className="font-bold text-gray-800 text-lg">
            coursnum<span className="text-green-600">ériques</span>
          </span>
        </div>

        <nav className="px-3 py-4 flex flex-col gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${active
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                `}
              >
                <Icon size={18} />
                {label}
                {active && <ChevronRight size={14} className="ml-auto text-green-500" />}
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 px-4 py-4 border-t border-gray-100">
          {user && (
            <p className="text-xs text-gray-400 px-2 mb-3 truncate">{user.email}</p>
          )}
          <button onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-all">
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
          <button onClick={() => setSidebarOpen(true)} className="p-1 rounded text-gray-500">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <BookOpen className="text-green-600" size={20} />
          <span className="font-semibold text-gray-800">coursnumériques</span>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}