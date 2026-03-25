// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  BookOpen, Plus, Trash2, Save, ArrowLeft, 
  ChevronRight, HelpCircle, CheckCircle2, Shield 
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function AdminQuiz() {
  const router = useRouter()
  const [courses, setCourses] = useState([])
  const [modules, setModules] = useState([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [selectedModule, setSelectedModule] = useState('')
  const [loading, setLoading] = useState(true)
  
  // State du Quiz
  const [questions, setQuestions] = useState([
    { question_text: '', options: ['', '', ''], correct_option_index: 0 }
  ])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth')
    if (!auth) { router.push('/admin'); return }
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    const { data } = await supabase.from('courses').select('id, title')
    setCourses(data || [])
    setLoading(false)
  }

  const fetchModules = async (courseId) => {
    setSelectedCourse(courseId)
    setLoading(true)
    const { data } = await supabase.from('modules').select('id, title').eq('course_id', courseId)
    setModules(data || [])
    setLoading(false)
  }

  const addQuestion = () => {
    setQuestions([...questions, { question_text: '', options: ['', '', ''], correct_option_index: 0 }])
  }

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions]
    newQuestions[index][field] = value
    setQuestions(newQuestions)
  }

  const updateOption = (qIndex, oIndex, value) => {
    const newQuestions = [...questions]
    newQuestions[qIndex].options[oIndex] = value
    setQuestions(newQuestions)
  }

  const handleSaveQuiz = async () => {
    if (!selectedModule) return alert("Sélectionnez un module")
    setSaving(true)

    try {
      // 1. Créer ou récupérer le Quiz pour ce module
      const { data: quiz, error: qError } = await supabase
        .from('quizzes')
        .upsert({ module_id: selectedModule, title: `Quiz du module` }, { onConflict: 'module_id' })
        .select()
        .single()

      if (qError) throw qError

      // 2. Supprimer les anciennes questions pour remplacer
      await supabase.from('questions').delete().eq('quiz_id', quiz.id)

      // 3. Insérer les nouvelles questions
      const finalQuestions = questions.map(q => ({
        quiz_id: quiz.id,
        ...q
      }))

      const { error: insError } = await supabase.from('questions').insert(finalQuestions)
      if (insError) throw insError

      alert("Quiz enregistré avec succès !")
    } catch (err) {
      console.error(err)
      alert("Erreur lors de l'enregistrement")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen" style={{background: '#0f172a'}}>
      {/* NAVBAR */}
      <nav className="px-8 py-4 flex justify-between items-center sticky top-0 z-50" style={{background: '#1e293b', borderBottom: '1px solid #334155'}}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{background: '#14532d'}}>
            <BookOpen size={18} color="white" />
          </div>
          <div>
            <span className="text-white font-bold">CoursNumeriques</span>
            <div className="flex items-center gap-1">
              <Shield size={10} style={{color: '#22c55e'}} />
              <span className="text-xs" style={{color: '#22c55e'}}>Admin</span>
            </div>
          </div>
        </div>
        <Link href="/admin/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{color: '#94a3b8', border: '1px solid #334155'}}>
          <ArrowLeft size={16} /> Retour
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-10">
        <h1 className="text-3xl font-bold text-white mb-8">Concepteur de Quiz</h1>

        {/* SELECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Choisir une formation</label>
            <select 
              onChange={(e) => fetchModules(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#1e293b] text-white border border-[#334155] outline-none"
            >
              <option value="">Sélectionner...</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Choisir le module</label>
            <select 
              disabled={!selectedCourse}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#1e293b] text-white border border-[#334155] outline-none disabled:opacity-50"
            >
              <option value="">Sélectionner...</option>
              {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
          </div>
        </div>

        {/* QUESTIONS LIST */}
        {selectedModule && (
          <div className="space-y-8">
            {questions.map((q, qIndex) => (
              <div key={qIndex} className="p-6 rounded-2xl bg-[#1e293b] border border-[#334155] relative">
                <button 
                  onClick={() => removeQuestion(qIndex)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-red-400"
                >
                  <Trash2 size={18} />
                </button>

                <div className="mb-6">
                  <label className="block text-sm font-bold text-green-500 mb-2 uppercase tracking-wider">Question {qIndex + 1}</label>
                  <input 
                    type="text"
                    value={q.question_text}
                    onChange={(e) => updateQuestion(qIndex, 'question_text', e.target.value)}
                    placeholder="Quelle est la capitale du digital ?"
                    className="w-full p-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white outline-none focus:border-green-500"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-gray-400">Options de réponse (Cochez la bonne)</label>
                  {q.options.map((opt, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name={`correct-${qIndex}`}
                        checked={q.correct_option_index === oIndex}
                        onChange={() => updateQuestion(qIndex, 'correct_option_index', oIndex)}
                        className="w-4 h-4 accent-green-500"
                      />
                      <input 
                        type="text"
                        value={opt}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        placeholder={`Option ${oIndex + 1}`}
                        className="flex-1 p-2 bg-[#0f172a] border border-[#334155] rounded text-sm text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button 
              onClick={addQuestion}
              className="w-full py-4 border-2 border-dashed border-[#334155] rounded-2xl text-gray-500 hover:text-green-500 hover:border-green-500 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={20} /> Ajouter une question
            </button>

            <div className="pt-10">
              <button 
                onClick={handleSaveQuiz}
                disabled={saving}
                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-lg shadow-green-900/20 flex items-center justify-center gap-2 transition-all"
              >
                <Save size={20} /> {saving ? 'Enregistrement...' : 'Enregistrer le Quiz'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}