'use client'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'

export default function EditCourseDetails() {
  const { id } = useParams()
  const router = useRouter()

  return (
    <div className="min-h-screen text-white p-8" style={{background: '#0f172a'}}>
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm mb-6 opacity-70 hover:opacity-100"
      >
        <ArrowLeft size={16} /> Retour à la liste
      </button>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Configuration du cours</h1>
        <p className="text-gray-400 mb-8">ID de la formation : <span className="text-green-500">{id}</span></p>
        
        <div className="bg-[#1e293b] rounded-2xl p-8 border border-[#334155]">
           <p className="text-center py-12 text-gray-400 italic">
             L'éditeur de leçons et de chapitres sera disponible ici prochainement.
           </p>
        </div>
      </div>
    </div>
  )
}