// @ts-nocheck
'use client'
import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  CheckCircle2, ArrowRight, 
  Loader2, Award, RefreshCcw
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

// On sépare la logique du Quiz dans un composant interne
function QuizInterface() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const moduleId = searchParams.get('moduleId')
  
  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [score, setScore] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (moduleId) fetchQuizData()
  }, [moduleId])

  const fetchQuizData = async () => {
    try {
      const { data: quizData } = await supabase
        .from('quizzes')
        .select('*')
        .eq('module_id', moduleId)
        .single()

      if (quizData) {
        setQuiz(quizData)
        const { data: questionsData } = await supabase
          .from('questions')
          .select('*')
          .eq('quiz_id', quizData.id)
        setQuestions(questionsData || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleNext = async () => {
    const isCorrect = selectedOption === questions[currentStep].correct_option_index
    const newScore = isCorrect ? score + 1 : score
    setScore(newScore)

    if (currentStep + 1 < questions.length) {
      setCurrentStep(currentStep + 1)
      setSelectedOption(null)
    } else {
      finishQuiz(newScore)
    }
  }

  const finishQuiz = async (finalScore) => {
    setIsFinished(true)
    const percentage = Math.round((finalScore / questions.length) * 100)
    const passed = percentage >= (quiz?.passing_score || 80)

    const userData = JSON.parse(localStorage.getItem('user_session') || '{}')
    if (userData.id) {
      await supabase.from('quiz_attempts').insert([{
        user_id: userData.id,
        quiz_id: quiz.id,
        score: percentage,
        passed: passed
      }])

      if (passed) {
        const { data: modData } = await supabase.from('modules').select('course_id').eq('id', moduleId).single()
        await supabase.from('certificates').upsert([{
          user_id: userData.id,
          course_id: modData.course_id,
          certificate_number: `CERT-${Math.random().toString(36).toUpperCase().substring(2, 10)}`,
          is_paid: false
        }], { onConflict: 'user_id,course_id' })
      }
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <Loader2 className="animate-spin text-green-500" size={40} />
    </div>
  )

  if (isFinished) {
    const finalPercentage = Math.round((score / questions.length) * 100)
    const isPassed = finalPercentage >= (quiz?.passing_score || 80)

    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-6 text-white">
        <div className="max-w-md w-full bg-[#1e293b] border border-[#334155] rounded-3xl p-10 text-center shadow-2xl">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isPassed ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
            {isPassed ? <Award size={40} /> : <RefreshCcw size={40} />}
          </div>
          <h2 className="text-3xl font-bold mb-2">{isPassed ? 'Félicitations !' : 'Essaye encore !'}</h2>
          <p className="text-gray-400 mb-8">
            Score : <span className="text-white font-bold">{finalPercentage}%</span>. 
            {isPassed ? ' Module validé !' : ' Il faut 80% pour réussir.'}
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={() => window.location.reload()} className="w-full py-4 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-500 transition-all">Recommencer</button>
            <button onClick={() => router.push('/dashboard')} className="w-full py-4 border border-[#334155] text-white font-bold rounded-2xl hover:bg-slate-700 transition-all">Retour au tableau de bord</button>
          </div>
        </div>
      </div>
    )
  }

  const currentQ = questions[currentStep]

  return (
    <div className="min-h-screen bg-[#0f172a] py-12 px-6 text-white">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-end mb-4">
          <span className="text-xs font-bold text-green-500 uppercase tracking-widest">Question {currentStep + 1} / {questions.length}</span>
          <span className="text-xs text-gray-500">{Math.round(((currentStep + 1) / questions.length) * 100)}% complété</span>
        </div>
        <div className="h-2 w-full bg-[#1e293b] rounded-full mb-12 overflow-hidden">
          <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }} />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-10 leading-tight">{currentQ?.question_text}</h1>

        <div className="space-y-4 mb-12">
          {currentQ?.options.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedOption(index)}
              className={`w-full p-5 rounded-2xl text-left border-2 transition-all flex items-center justify-between group ${
                selectedOption === index 
                ? 'border-green-500 bg-green-500/5 text-white' 
                : 'border-[#334155] bg-[#1e293b] text-gray-400 hover:border-gray-500'
              }`}
            >
              <span className="font-medium">{option}</span>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedOption === index ? 'border-green-500 bg-green-500' : 'border-[#334155]'}`}>
                {selectedOption === index && <CheckCircle2 size={14} color="white" />}
              </div>
            </button>
          ))}
        </div>

        <button
          disabled={selectedOption === null}
          onClick={handleNext}
          className="w-full py-5 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-xl shadow-green-900/20 flex items-center justify-center gap-2 transition-all"
        >
          {currentStep + 1 === questions.length ? 'Terminer le quiz' : 'Question suivante'} <ArrowRight size={20} />
        </button>
      </div>
    </div>
  )
}

// Le composant principal qui exporte avec Suspense
export default function QuizPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white italic">Chargement du quiz...</div>}>
      <QuizInterface />
    </Suspense>
  )
}