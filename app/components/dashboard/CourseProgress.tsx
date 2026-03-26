// @ts-nocheck
import Link from 'next/link'
import { BookOpen, ChevronRight } from 'lucide-react'

interface Course {
  id: string
  title: string
  progress: number
  total_lessons: number
  completed_lessons: number
  category: string
}

export default function CourseProgress({ courses, loading }: { courses: Course[], loading?: boolean }) {
  if (loading) return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="font-semibold text-gray-800 mb-4">Mes formations en cours</h2>
      <div className="space-y-4">
        {[1,2,3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-2 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  )

  if (!courses.length) return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="font-semibold text-gray-800 mb-4">Mes formations en cours</h2>
      <div className="text-center py-8">
        <BookOpen className="mx-auto text-gray-300 mb-3" size={40} />
        <p className="text-gray-500 text-sm">Aucune formation commencée</p>
        <Link href="/cours" className="inline-block mt-3 text-sm text-green-600 font-medium hover:underline">
          Parcourir le catalogue →
        </Link>
      </div>
    </div>
  )

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-800">Mes formations en cours</h2>
        <Link href="/cours" className="text-xs text-green-600 hover:underline">Voir tout</Link>
      </div>
      <div className="space-y-5">
        {courses.map(course => (
          <Link key={course.id} href={`/cours/${course.id}`} className="block group">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p className="text-sm font-medium text-gray-800 group-hover:text-green-700 transition-colors">
                  {course.title}
                </p>
                <p className="text-xs text-gray-400">{course.category}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                <span>{course.completed_lessons}/{course.total_lessons} leçons</span>
                <ChevronRight size={12} />
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${course.progress}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1">{course.progress}% complété</p>
          </Link>
        ))}
      </div>
    </div>
  )
}