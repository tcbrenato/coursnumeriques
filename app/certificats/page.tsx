// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import { jsPDF } from 'jspdf'
import { Award, Download, CreditCard, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { openKkiapayWidget, addKkiapayListener, removeKkiapayListener } from 'kkiapay'

export default function MesCertificats() {
  const [certs, setCerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('user_session') || '{}')
    setUserData(session)
    fetchMyCertificates(session.id)

    // Écouteur pour le succès du paiement
    const onSuccess = async (response) => {
      // Le 'data' contient l'ID du certificat que nous avons passé au widget
      const certId = response.data
      await supabase.from('certificates').update({ is_paid: true }).eq('id', certId)
      alert("Paiement réussi ! Votre certificat est maintenant disponible.")
      fetchMyCertificates(session.id)
    }

    addKkiapayListener('success', onSuccess)
    return () => removeKkiapayListener('success', onSuccess)
  }, [])

  const fetchMyCertificates = async (userId) => {
    if (!userId) return
    const { data } = await supabase
      .from('certificates')
      .select('*, courses(title)')
      .eq('user_id', userId)
    
    setCerts(data || [])
    setLoading(false)
  }

  const handlePayment = (cert) => {
    openKkiapayWidget({
      amount: 2000, // Prix du certificat en FCFA
      position: 'center',
      callback: '',
      data: cert.id, // On passe l'ID du certificat pour le récupérer au succès
      theme: '#22c55e',
      key: 'VOTRE_CLE_PUBLIQUE_KKIAPAY', // REMPLACE PAR TA CLÉ TEST OU PRO
      sandbox: true // Mettre à FALSE pour la production
    })
  }

  const generatePDF = (cert) => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    doc.setFillColor(15, 23, 42).rect(0, 0, 297, 210, 'F')
    doc.setDrawColor(20, 83, 45).setLineWidth(5).rect(10, 10, 277, 190)
    doc.setTextColor(255, 255, 255).setFontSize(40).text('CERTIFICAT DE RÉUSSITE', 148, 60, { align: 'center' })
    doc.setFontSize(20).setTextColor(148, 163, 184).text('Décerné à', 148, 85, { align: 'center' })
    doc.setFontSize(30).setTextColor(34, 197, 94).text(userData.full_name || 'Apprenant émérite', 148, 105, { align: 'center' })
    doc.setFontSize(18).setTextColor(255, 255, 255).text(`Pour avoir complété avec succès la formation :`, 148, 130, { align: 'center' })
    doc.setFont(undefined, 'bold').text(cert.courses.title, 148, 145, { align: 'center' })
    doc.save(`Certificat-${cert.courses.title}.pdf`)
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <Loader2 className="animate-spin text-green-500" size={40} />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0f172a] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Award className="text-green-500" /> Mes Certificats
          </h1>
          <Link href="/dashboard" className="text-gray-400 flex items-center gap-2 hover:text-white transition-colors">
            <ArrowLeft size={18} /> Retour
          </Link>
        </div>

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
                <h3 className="text-xl font-bold text-white mb-2">{cert.courses.title}</h3>
                <p className="text-sm text-gray-500 mb-6">Numéro : {cert.certificate_number}</p>
              </div>

              {cert.is_paid ? (
                <button onClick={() => generatePDF(cert)} className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-900/20">
                  <Download size={18} /> Télécharger le PDF
                </button>
              ) : (
                <button 
                  onClick={() => handlePayment(cert)} 
                  className="w-full py-4 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-all shadow-lg"
                >
                  <CreditCard size={18} /> Payer 2000 FCFA
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}