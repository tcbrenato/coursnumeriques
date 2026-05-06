// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import { Award, Download, CreditCard, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function MesCertificats() {
  const [certs, setCerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) { setLoading(false); return }
      setUser(authUser)
      fetchCerts(authUser.id)
    }
    init()

    const handleKkiapaySuccess = async (response) => {
      const certId = response.data
      const { error } = await supabase.from('certificates').update({ is_paid: true }).eq('id', certId)
      if (!error) { alert("Félicitations ! Certificat débloqué."); window.location.reload() }
    }
    window.addEventListener('kkiapay:success', handleKkiapaySuccess)
    return () => window.removeEventListener('kkiapay:success', handleKkiapaySuccess)
  }, [])

  const fetchCerts = async (userId) => {
    const { data } = await supabase
      .from('certificates')
      .select('*, courses:course_id(title)') // Jointure pour récupérer le titre du cours
      .eq('user_id', userId)
    setCerts(data || [])
    setLoading(false)
  }

  const handlePayment = async (cert) => {
    const { openKkiapayWidget } = await import('kkiapay')
    openKkiapayWidget({
      amount: 2000,
      position: 'center',
      data: cert.id,
      sandbox: true,
      key: 'ecbb3953667eba4309668d63ded4c07da007127e',
      theme: '#14532d'
    })
  }

  const generatePDF = async (cert) => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ orientation: 'landscape' })
    doc.setFillColor(20, 83, 45).rect(0, 0, 297, 210, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(40).text("CERTIFICAT DE RÉUSSITE", 148, 60, { align: 'center' })
    doc.setFontSize(20).text("Décerné à :", 148, 90, { align: 'center' })
    doc.setFontSize(30).text(user?.user_metadata?.full_name || user?.email, 148, 110, { align: 'center' })
    doc.setFontSize(18).text(`Formation : ${cert.courses?.title || 'Formation'}`, 148, 140, { align: 'center' })
    doc.setFontSize(10).text(`ID : ${cert.certificate_number}`, 148, 180, { align: 'center' })
    doc.save(`Certificat_${cert.certificate_number}.pdf`)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0f172a]"><Loader2 className="animate-spin text-green-500" size={40} /></div>

  return (
    <div className="min-h-screen bg-[#0f172a] p-8 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-black flex items-center gap-3"><Award className="text-green-500" /> MES CERTIFICATS</h1>
          <Link href="/dashboard" className="text-slate-400 flex items-center gap-2 hover:text-white"><ArrowLeft size={18} /> Retour</Link>
        </div>

        {certs.length === 0 ? (
          <div className="bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-[40px] p-20 text-center">
            <Award size={60} className="mx-auto mb-6 text-slate-700" />
            <p className="text-slate-400">Aucun certificat disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certs.map((cert) => (
              <div key={cert.id} className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 relative">
                <span className={`absolute top-4 right-4 text-[10px] font-black px-3 py-1 rounded-full ${cert.is_paid ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>{cert.is_paid ? 'PAYÉ' : 'À RÉGLER'}</span>
                <Award className="text-slate-700 mb-6" size={40} />
                <h3 className="text-xl font-bold mb-1">{cert.courses?.title || "Chargement..."}</h3>
                <p className="text-xs text-slate-500 mb-8 font-mono">{cert.certificate_number}</p>
                {cert.is_paid ? (
                  <button onClick={() => generatePDF(cert)} className="w-full bg-green-600 py-4 rounded-2xl font-black flex items-center justify-center gap-3"><Download size={20} /> TÉLÉCHARGER</button>
                ) : (
                  <button onClick={() => handlePayment(cert)} className="w-full bg-white text-black py-4 rounded-2xl font-black flex items-center justify-center gap-3"><CreditCard size={20} /> PAYER 2000 FCFA</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}