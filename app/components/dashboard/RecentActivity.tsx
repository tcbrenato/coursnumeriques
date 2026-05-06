// @ts-nocheck
import { CheckCircle, BookOpen, Award } from 'lucide-react'

interface Activity {
  id: string
  type: 'lesson_completed' | 'course_started' | 'certificate_earned'
  label: string
  date: string
}

const iconMap = {
  lesson_completed:   { Icon: CheckCircle, color: 'text-green-500',  bg: 'bg-green-50'  },
  course_started:     { Icon: BookOpen,    color: 'text-blue-500',   bg: 'bg-blue-50'   },
  certificate_earned: { Icon: Award,       color: 'text-orange-500', bg: 'bg-orange-50' },
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export default function RecentActivity({ activities, loading }: { activities: Activity[], loading?: boolean }) {
  if (loading) return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="font-semibold text-gray-800 mb-4">Activité récente</h2>
      <div className="space-y-3">
        {[1,2,3].map(i => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 bg-gray-200 rounded-lg shrink-0" />
            <div className="flex-1">
              <div className="h-3 bg-gray-200 rounded w-4/5 mb-1.5" />
              <div className="h-2.5 bg-gray-100 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  if (!activities.length) return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="font-semibold text-gray-800 mb-4">Activité récente</h2>
      <p className="text-sm text-gray-400 text-center py-6">Aucune activité pour le moment</p>
    </div>
  )

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="font-semibold text-gray-800 mb-4">Activité récente</h2>
      <div className="space-y-4">
        {activities.map(activity => {
          const { Icon, color, bg } = iconMap[activity.type]
          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={`${bg} p-2 rounded-lg shrink-0`}>
                <Icon size={16} className={color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700">{activity.label}</p>
                <p className="text-xs text-gray-400">{formatDate(activity.date)}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}