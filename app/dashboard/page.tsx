// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import {
  BookOpen, Award, TrendingUp, Users,
  ChevronRight, Play, CheckCircle, Clock
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import StatsCard from '@/app/components/dashboard/StatsCard'
import CourseProgress from '@/app/components/dashboard/CourseProgress'
import RecentActivity from '@/app/components/dashboard/RecentActivity'

interface Course {
  id: string
  title: string
  progress: number
  total_lessons: number
  completed_lessons: number
  category: string
}

interface Activity {
  id: string
  type: 'lesson_completed' | 'course_started' | 'certificate_earned'
  label: string
  date: string
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [stats, setStats] = useState({
    coursesEnrolled: 0,
    coursesCompleted: 0,
    certificates: 0,
    totalHours: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        router.push('/login')
        return
      }
      setUser(authUser)

      // Mock data for now - replace with real API calls
      setCourses([
        {
          id: '1',
          title: 'Introduction au Marketing Digital',
          progress: 75,
          total_lessons: 12,
          completed_lessons: 9,
          category: 'Marketing Digital'
        },
        {
          id: '2',
          title: 'Développement Web avec React',
          progress: 30,
          total_lessons: 20,
          completed_lessons: 6,
          category: 'Développement Web'
        }
      ])

      setActivities([
        {
          id: '1',
          type: 'lesson_completed',
          label: 'Leçon "SEO Basics" terminée',
          date: new Date().toISOString()
        },
        {
          id: '2',
          type: 'course_started',
          label: 'Cours "React Avancé" commencé',
          date: new Date(Date.now() - 86400000).toISOString()
        }
      ])

      setStats({
        coursesEnrolled: 5,
        coursesCompleted: 2,
        certificates: 2,
        totalHours: 24
      })

      setLoading(false)
    }

    fetchData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: '#f9fafb'}}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{background: '#14532d'}}>
            <BookOpen size={24} color="white" />
          </div>
          <p className="text-sm" style={{color: '#6b7280'}}>Chargement de votre tableau de bord...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{background: '#f9fafb'}}>
      {/* HEADER */}
      <div style={{background: 'linear-gradient(135deg, #14532d 0%, #166534 60%, #15803d 100%)'}}>
        <div className="max-w-6xl mx-auto px-8 py-16 text-white">
          <h1 className="text-4xl font-bold mb-4">Bienvenue, {user?.user_metadata?.full_name || 'Apprenant'} !</h1>
          <p style={{color: '#dcfce7'}} className="text-lg mb-8">
            Continuez votre parcours d'apprentissage et développez vos compétences.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link href="/cours" className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap" style={{background: 'white', color: '#14532d'}}>
              Voir les formations <ChevronRight size={16} />
            </Link>
            <Link href="/certificats" className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap" style={{background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)'}}>
              Mes certificats <Award size={16} />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-10">

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatsCard
            title="Cours inscrits"
            value={stats.coursesEnrolled}
            icon={BookOpen}
            color="green"
          />
          <StatsCard
            title="Cours terminés"
            value={stats.coursesCompleted}
            icon={CheckCircle}
            color="blue"
          />
          <StatsCard
            title="Certificats"
            value={stats.certificates}
            icon={Award}
            color="orange"
          />
          <StatsCard
            title="Heures apprises"
            value={`${stats.totalHours}h`}
            icon={Clock}
            color="purple"
          />
        </div>

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-8">
            <CourseProgress courses={courses} loading={loading} />

            {/* CONTINUE LEARNING */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Continuer l'apprentissage</h2>
              {courses.length > 0 ? (
                <div className="space-y-4">
                  {courses.slice(0, 2).map((course) => (
                    <Link
                      key={course.id}
                      href={`/cours/${course.id}`}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{background: '#f0fdf4'}}>
                          <BookOpen size={20} style={{color: '#14532d'}} />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 group-hover:text-green-800">
                            {course.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {course.completed_lessons} / {course.total_lessons} leçons terminées
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right mr-3">
                          <div className="text-sm font-medium text-gray-900">{course.progress}%</div>
                          <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                            <div
                              className="h-2 rounded-full transition-all"
                              style={{
                                width: `${course.progress}%`,
                                background: '#14532d'
                              }}
                            />
                          </div>
                        </div>
                        <ChevronRight size={16} style={{color: '#14532d'}} />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun cours en cours</h3>
                  <p className="text-gray-500 mb-4">Commencez votre apprentissage en vous inscrivant à une formation.</p>
                  <Link
                    href="/cours"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white"
                    style={{background: '#14532d'}}
                  >
                    <BookOpen size={16} />
                    Explorer les formations
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-8">
            <RecentActivity activities={activities} loading={loading} />

            {/* QUICK ACTIONS */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Actions rapides</h2>
              <div className="space-y-3">
                <Link
                  href="/cours"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{background: '#f0fdf4'}}>
                    <BookOpen size={18} style={{color: '#14532d'}} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-green-800">Parcourir les formations</div>
                    <div className="text-sm text-gray-500">Découvrez de nouveaux cours</div>
                  </div>
                </Link>

                <Link
                  href="/certificats"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{background: '#fef3c7'}}>
                    <Award size={18} style={{color: '#d97706'}} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-orange-800">Mes certificats</div>
                    <div className="text-sm text-gray-500">Téléchargez vos attestations</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
