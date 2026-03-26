// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import { Award, Download, CreditCard, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Certificate {
  id: string
  user_id: string
  course_id: string
  course_title: string
  issued_at: string
  certificate_url?: string
  is_paid: boolean
  courses?: { title: string }
  certificate_number?: string
}

export default function MesCertificats() {
  const [certs, setCerts] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    const init = async () => {
      try {
        // Utiliser Supabase Auth au lieu de localStorage
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setLoading(false)
          return
        }

        setUserData(user)
        await fetchMyCertificates(user.id)
      } catch (err) {
        console.error(err)
        setLoading(false)
      }
    }
    init()
  }, [])

  const fetchMyCertificates = async (userId) => {
    try {
      const { data } = await supabase
        .from('certificates')
        .select('*, courses(title)')
        .eq('user_id', userId)
      setCerts(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async (cert) => {
    try {
      const { openKkiapayWidget } = await import('kkiapay')
      openKkiapayWidget({
        amount: 2000,
        position: 'center',
        callback: '',
        data: cert.id,
        theme: '#22c55e',
        key: 'ecbb3953667eba4309668d63ded4c07da007127e',
        sandbox: true
      })
    } catch (err) {
      alert("Erreur lors de l'ouverture du paiement.")
    }
  }

  const generatePDF = async (cert) => {
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      doc.setFillColor(15, 23, 42).rect(0, 0, 297, 210, 'F')
      doc.setDrawColor(20, 83, 45).setLineWidth(5).rect(10, 10, 277, 190)
      doc.setTextColor(255, 255, 255).setFontSize(40).text('CERTIFICAT DE RÉUSSITE', 148, 60, { align: 'center' })
      doc.setFontSize(20).setTextColor(148, 163, 184).text('Décerné à', 148, 85, { align: 'center' })
      doc.setFontSize(30).setTextColor(34, 197, 94).text(userData?.user_metadata?.full_name || userData?.email || 'Apprenant', 148, 105, { align: 'center' })
      doc.setFontSize(18).setTextColor(255, 255, 255).text('Pour avoir complété avec succès la formation :', 148, 130, { align: 'center' })
      doc.setFontSize(22).text(cert.courses?.title || '', 148, 145, { align: 'center' })
      doc.save(`Certificat-${cert.courses?.title || 'formation'}.pdf`)
    } catch (err) {
      alert("Erreur lors de la génération du PDF.")
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <Loader2 className="animate-spin text-green-500" size={40} />
    </div>
  )

  if (!userData) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">
      <div className="text-center">
        <p className="mb-4 text-slate-400">Vous devez être connecté pour voir vos certificats.</p>
        <Link href="/login" className="bg-green-600 px-6 py-3 rounded-xl font-bold hover:bg-green-500 transition-all">
          Se connecter
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0f172a] p-8 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Award className="text-green-500" /> Mes Certificats
          </h1>
          <Link href="/dashboard" className="text-gray-400 flex items-center gap-2 hover:text-white transition-colors">
            <ArrowLeft size={18} /> Retour
          </Link>
        </div>

        {certs.length === 0 ? (
          <div className="bg-[#1e293b] p-10 rounded-3xl text-center border border-dashed border-slate-700">
            <Award size={40} className="text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Vous n'avez pas encore de certificats disponibles.</p>
            <p className="text-slate-500 text-sm mt-2">Complétez une formation pour obtenir votre certificat.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certs.map((cert) => (
              <div key={cert.id} className="bg-[#1e293b] border border-[#334155] rounded-3xl p-6 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-green-500/10 rounded-2xl text-green-500"><Award size={24} /></div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${cert.is_paid ? 'text-green-500 bg-green-500/10' : 'text-orange-500 bg-orange-500/10'}`}>
                      {cert.is_paid ? 'Payé' : 'Non payé'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{cert.courses?.title}</h3>
                  <p className="text-sm text-gray-500 mb-6">Numéro : {cert.certificate_number}</p>
                </div>

                {cert.is_paid ? (
                  <button onClick={() => generatePDF(cert)} className="w-full py-4 bg-green-600 hover:bg-green-700 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg">
                    <Download size={18} /> Télécharger le PDF
                  </button>
                ) : (
                  <button onClick={() => handlePayment(cert)} className="w-full py-4 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-all shadow-lg">
                    <CreditCard size={18} /> Payer 2000 FCFA
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}