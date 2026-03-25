import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  color?: 'green' | 'blue' | 'orange' | 'purple'
}

const colorMap = {
  green:  { bg: 'bg-green-50',  text: 'text-green-700',  icon: 'text-green-500'  },
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   icon: 'text-blue-500'   },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', icon: 'text-orange-500' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', icon: 'text-purple-500' },
}

export default function StatsCard({ title, value, subtitle, icon: Icon, color = 'green' }: StatsCardProps) {
  const c = colorMap[color]
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
      <div className={`${c.bg} p-3 rounded-lg`}>
        <Icon size={20} className={c.icon} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500">{title}</p>
        <p className={`text-2xl font-bold mt-0.5 ${c.text}`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  )
}