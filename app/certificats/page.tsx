// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Award, Download, ArrowLeft, CheckCircle,
  BookOpen, CreditCard, Calendar, ExternalLink
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function MesCertificats() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [certificates, setCertificates] = useState([])
  const [completedCourses, setCompletedCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) { router.push('/login'); return }
    setUser(authUser)

    // Certificats déjà obtenus
    const { data: certsData } = await supabase
      .from('certificates')
      .select('*, courses(id, title, category)')
      .eq('user_id', authUser.id)
      .order('issued_at', { ascending: false })

    setCertificates(certsData || [])

    // Cours terminés (100% progression) qui n'ont pas encore de certificat
    const { data: progressData } = await supabase
      .from('lesson_progress')
      .select('course_id')
      .eq('user_id', authUser.id)
      .eq('completed', true)

    const completedByCourse: { [key: string]: number } = {}
    progressData?.forEach(p => {
      completedByCourse[p.course_id] = (completedByCourse[p.course_id] || 0) + 1
    })

    const courseIds = Object.keys(completedByCourse)
    if (courseIds.length > 0) {
      const coursesWithCompletion = await Promise.all(
        courseIds.map(async (courseId) => {
          const { data: courseData } = await supabase
            .from('courses')
            .select('id, title, category')
            .eq('id', courseId)
            .single()

          const { count } = await supabase
            .from('lessons')
            .select('id', { count: 'exact', head: true })
            .eq('course_id', courseId)

          const totalLessons = count || 0
          const completed = completedByCourse[courseId] || 0
          const is_completed = totalLessons > 0 && completed >= totalLessons

          // Vérifier si certificat déjà obtenu
          const hasCert = certsData?.some(c => c.course_id === courseId)

          return is_completed && !hasCert ? courseData : null
        })
      )

      setCompletedCourses(coursesWithCompletion.filter(Boolean))
    }

    setLoading(false)
  }

  async function requestCertificate(courseId: string) {
    if (!user) return

    const certNumber = `CERT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    const { error } = await supabase.from('certificates').insert([{
      user_id: user.id,
      course_id: courseId,
      certificate_number: certNumber,
      is_paid: false,
      issued_at: new Date().toISOString()
    }])

    if (!error) {
      alert('Certificat créé ! Procédez au paiement pour le débloquer.')
      fetchData()
    }
  }

  async function handlePayment(cert: any) {
    // Intégration KKiaPay
    const { openKkiapayWidget } = await import('kkiapay')
    openKkiapayWidget({
      amount: 2000,
      position: 'center',
      data: cert.id,
      sandbox: true, // Mettre false en production
      key: 'ecbb3953667eba4309668d63ded4c07da007127e', // Remplacer par ta vraie clé
      theme: '#14532d',
      callback: async (response: any) => {
        if (response.status === 'success') {
          await supabase.from('certificates').update({ is_paid: true }).eq('id', cert.id)
          alert('✅ Paiement confirmé ! Certificat débloqué.')
          fetchData()
        }
      }
    })
  }

  async function downloadCertificate(cert: any) {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

    // Background
    doc.setFillColor(20, 83, 45)
    doc.rect(0, 0, 297, 210, 'F')

    // Border
    doc.setDrawColor(134, 239, 172)
    doc.setLineWidth(2)
    doc.rect(10, 10, 277, 190)

    // Title
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(36)
    doc.setFont('helvetica', 'bold')
    doc.text('CERTIFICAT DE RÉUSSITE', 148.5, 50, { align: 'center' })

    // Line
    doc.setDrawColor(134, 239, 172)
    doc.setLineWidth(0.5)
    doc.line(60, 60, 237, 60)

    // Body
    doc.setFontSize(16)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(220, 252, 231)
    doc.text('Ce certificat est décerné à', 148.5, 80, { align: 'center' })

    doc.setFontSize(28)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text(user?.user_metadata?.full_name || user?.email || 'Apprenant', 148.5, 100, { align: 'center' })

    doc.setFontSize(16)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(220, 252, 231)
    doc.text('pour avoir complété avec succès la formation', 148.5, 115, { align: 'center' })

    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(134, 239, 172)
    doc.text(cert.courses?.title || 'Formation', 148.5, 130, { align: 'center' })

    // Footer
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(187, 247, 208)
    doc.text(`N° ${cert.certificate_number}`, 148.5, 170, { align: 'center' })
    doc.text(`Délivré le ${new Date(cert.issued_at).toLocaleDateString('fr-FR')}`, 148.5, 178, { align: 'center' })
    doc.text('CoursNumeriques — Cellule Numérique × CRF Perfection', 148.5, 186, { align: 'center' })

    doc.save(`Certificat_${cert.certificate_number}.pdf`)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f9fafb' }}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: '#14532d' }}>
          <Award size={24} color="white" />
        </div>
        <p className="text-sm text-gray-500">Chargement...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: '#f9fafb' }}>

      {/* NAVBAR */}
      <nav className="bg-white sticky top-0 z-50 px-8 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid #e5e7eb' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#14532d' }}>
            <BookOpen size={18} color="white" />
          </div>
          <span className="text-xl font-bold" style={{ color: '#14532d' }}>CoursNumeriques</span>
        </div>
        <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900">
          <ArrowLeft size={16} /> Retour au dashboard
        </Link>
      </nav>

      {/* HEADER */}
      <div style={{ background: 'linear-gradient(135deg, #14532d 0%, #166534 60%, #15803d 100%)' }}>
        <div className="max-w-4xl mx-auto px-8 py-14 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Award size={36} />
            <h1 className="text-4xl font-bold">Mes certificats</h1>
          </div>
          <p style={{ color: '#dcfce7' }} className="text-lg">
            Téléchargez vos attestations de réussite et valorisez vos compétences.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-10">

        {/* COURS COMPLETES SANS CERTIFICAT */}
        {completedCourses.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🎉 Formations terminées — Demandez votre certification</h2>
            <div className="space-y-4">
              {completedCourses.map((course) => (
                <div key={course.id} className="bg-white rounded-2xl p-6 flex items-center justify-between" style={{ border: '1px solid #e5e7eb' }}>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: '#f0fdf4' }}>
                      <CheckCircle size={26} style={{ color: '#14532d' }} />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{course.title}</div>
                      <div className="text-sm text-gray-500 mt-0.5">{course.category}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => requestCertificate(course.id)}
                    className="px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2"
                    style={{ background: '#14532d' }}
                  >
                    <Award size={16} /> Demander ma certification
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CERTIFICATS OBTENUS */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {certificates.length > 0 ? 'Mes certificats obtenus' : 'Aucun certificat pour le moment'}
          </h2>

          {certificates.length === 0 && completedCourses.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center" style={{ border: '2px dashed #e5e7eb' }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: '#f0fdf4' }}>
                <Award size={36} style={{ color: '#14532d' }} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun certificat disponible</h3>
              <p className="text-gray-500 mb-6">
                Terminez une formation pour obtenir votre certification officielle.
              </p>
              <Link href="/cours" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white" style={{ background: '#14532d' }}>
                <BookOpen size={18} /> Parcourir les formations
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-white rounded-2xl overflow-hidden"
                  style={{ border: '1px solid #e5e7eb' }}
                >
                  {/* HEADER */}
                  <div className="p-6" style={{ background: cert.is_paid ? '#f0fdf4' : '#fef3c7', borderBottom: '1px solid #e5e7eb' }}>
                    <div className="flex items-start justify-between mb-3">
                      <Award size={32} style={{ color: cert.is_paid ? '#14532d' : '#d97706' }} />
                      <span
                        className="text-xs font-bold px-3 py-1 rounded-full"
                        style={{
                          background: cert.is_paid ? 'rgba(34,197,94,0.2)' : 'rgba(217,119,6,0.2)',
                          color: cert.is_paid ? '#16a34a' : '#d97706'
                        }}
                      >
                        {cert.is_paid ? '✓ Payé' : 'En attente'}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{cert.courses?.title}</h3>
                    <p className="text-sm text-gray-500">{cert.courses?.category}</p>
                  </div>

                  {/* BODY */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <Calendar size={14} />
                      Délivré le {formatDate(cert.issued_at)}
                    </div>
                    <div className="text-xs text-gray-400 font-mono mb-6">N° {cert.certificate_number}</div>

                    {cert.is_paid ? (
                      <button
                        onClick={() => downloadCertificate(cert)}
                        className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2"
                        style={{ background: '#14532d' }}
                      >
                        <Download size={18} /> Télécharger le certificat
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <div className="p-4 rounded-xl text-sm" style={{ background: '#fef3c7', border: '1px solid #fde68a' }}>
                          <div className="font-bold text-gray-900 mb-1">💳 Certification payante</div>
                          <p className="text-gray-600 text-xs">
                            Réglez <span className="font-bold">2 000 FCFA</span> pour débloquer votre certificat officiel.
                          </p>
                        </div>
                        <button
                          onClick={() => handlePayment(cert)}
                          className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                          style={{ background: '#d97706', color: 'white' }}
                        >
                          <CreditCard size={18} /> Payer 2 000 FCFA
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* INFO BANNER */}
        <div className="mt-10 rounded-2xl p-6" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#3b82f6', color: 'white' }}>
              ℹ️
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">À propos de la certification</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Votre certificat officiel atteste de vos compétences acquises. Il est reconnu et valorisable sur votre CV, LinkedIn et auprès des employeurs. Le paiement couvre les frais administratifs et la validation par nos formateurs.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <footer className="mt-10 py-6 px-8 text-center" style={{ borderTop: '1px solid #e5e7eb' }}>
        <p className="text-sm text-gray-400">© 2025 CoursNumeriques — Cellule Numérique × CRF Perfection</p>
      </footer>

    </div>
  )
}