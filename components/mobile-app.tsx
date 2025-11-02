"use client"

import type React from "react"

import { useState, useRef } from "react"
import { QrCode, Home, Book, User, Upload, X, ChevronLeft, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface MobileAppProps {
  qrDatabase: any[]
  quizDatabase: any[]
}

interface Chapter {
  id: string
  name: string
  subject: string
  phase: string
}

export default function MobileApp({ qrDatabase, quizDatabase }: MobileAppProps) {
  const [scannerOpen, setScannerOpen] = useState(false)
  const [highlightedChapter, setHighlightedChapter] = useState<string | null>(null)
  const [selectedPhase, setSelectedPhase] = useState<string>("Quarter 1")
  const [selectedSubject, setSelectedSubject] = useState<string>("Physics")
  const [openChapterId, setOpenChapterId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"home" | "courses" | "profile">("home")
  const [userClass, setUserClass] = useState<"c9" | "c10">("c9")
  const [activeProgram, setActiveProgram] = useState<string>("SSC - AP 2026")
  const entitlements: Record<string, "full" | "none"> = {
    "SSC - AP 2026": "full",
    "SSC - AP 2025": "full",
  }
  const showFab = entitlements[activeProgram] === "full"
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Phases/quarters
  const phases = ["Quarter 1", "Quarter 2", "Quarter 3", "Quarter 4"]

  // Per-quarter chapter lists (ids align with CMS demo ids for scan compatibility)
  const chapters: Chapter[] = [
    // Physics
    { id: "ch1", name: "অধ্যায় ০১ - ভৌত রাশি", subject: "Physics", phase: "Quarter 1" },
    { id: "ch2", name: "অধ্যায় ০২ - গতি", subject: "Physics", phase: "Quarter 1" },
    { id: "ch1", name: "অধ্যায় ০৩ - বল ও নিউটনের সূত্র", subject: "Physics", phase: "Quarter 2" },
    { id: "ch2", name: "অধ্যায় ০৪ - কাজ ও শক্তি", subject: "Physics", phase: "Quarter 2" },
    { id: "ch1", name: "অধ্যায় ০৫ - তাপ ও তাপগতিবিদ্যা", subject: "Physics", phase: "Quarter 3" },
    { id: "ch2", name: "অধ্যায় ০৬ - তরঙ্গ ও শব্দ", subject: "Physics", phase: "Quarter 3" },
    { id: "ch1", name: "অধ্যায় ০৭ - আলোকবিজ্ঞান", subject: "Physics", phase: "Quarter 4" },
    { id: "ch2", name: "অধ্যায় ০৮ - বিদ্যুৎ ও চৌম্বকত্ব", subject: "Physics", phase: "Quarter 4" },
    // Chemistry
    { id: "ch3", name: "অধ্যায় ০১ - রসায়নের ধারণা", subject: "Chemistry", phase: "Quarter 1" },
    { id: "ch3", name: "অধ্যায় ০২ - পারমাণবিক গঠন", subject: "Chemistry", phase: "Quarter 2" },
    { id: "ch3", name: "অধ্যায় ০৩ - রাসায়নিক বন্ধন", subject: "Chemistry", phase: "Quarter 3" },
    { id: "ch3", name: "অধ্যায় ০৪ - অম্ল-ক্ষারক", subject: "Chemistry", phase: "Quarter 4" },
  ]
  const subjects = ["Physics", "Chemistry"]

  // Animated Video Topics/Lessons data structure
  const animatedVideoTopics: Record<string, Record<string, Array<{ id: string; name: string; thumbnail?: string }>>> = {
    Physics: {
      "ch1": [
        { id: "topic1", name: "ভৌত রাশির ধারণা", thumbnail: "📐" },
        { id: "topic2", name: "পরিমাপ পদ্ধতি", thumbnail: "📏" },
        { id: "topic3", name: "একক ও মাত্রা", thumbnail: "🔢" },
      ],
      "ch2": [
        { id: "topic4", name: "গতির প্রকার", thumbnail: "🏃" },
        { id: "topic5", name: "বেগ ও ত্বরণ", thumbnail: "⚡" },
      ],
    },
    Chemistry: {
      "ch3": [
        { id: "topic6", name: "রসায়নের ভূমিকা", thumbnail: "🧪" },
        { id: "topic7", name: "রাসায়নিক পদার্থ", thumbnail: "⚗️" },
      ],
    },
  }

  const handleQRUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        // Use jsQR to decode
        const jsQR = require("jsqr")
        const code = jsQR(imageData.data, imageData.width, imageData.height)

        if (code) {
          processQRScan(code.data)
        } else {
          alert("Could not read QR code. Please try again.")
        }
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const [activeQuiz, setActiveQuiz] = useState<any | null>(null)
  const [activeQuizAnswers, setActiveQuizAnswers] = useState<Record<string, string>>({})
  const [quizSubmitted, setQuizSubmitted] = useState<{ score: number; total: number } | null>(null)
  const [quizResultsByChapter, setQuizResultsByChapter] = useState<Record<string, { score: number; total: number; solutionUrl?: string }>>({})
  const [programSwitch, setProgramSwitch] = useState<{ targetProgram: string; next: { phase: string; subject: string; chapterId?: string; quiz?: any; animatedVideo?: boolean; liveExam?: boolean; liveExamId?: string; lectureClass?: boolean; lectureClassId?: string } } | null>(null)
  const [paywall, setPaywall] = useState<{ requiredProgram: string } | null>(null)
  
  // Animated Video screens
  const [animatedVideoScreen, setAnimatedVideoScreen] = useState<"subject" | "chapter" | null>(null)
  const [animatedVideoSubject, setAnimatedVideoSubject] = useState<string | null>(null)
  const [animatedVideoChapter, setAnimatedVideoChapter] = useState<string | null>(null)
  
  // Live Exam screen
  const [liveExamData, setLiveExamData] = useState<{
    examId: string
    examName: string
    subject: string
    chapterName: string
    program?: string
    hasParticipated: boolean
    score?: number
    total?: number
    solutionPdfUrl?: string
  } | null>(null)

  // Lecture Class screen
  const [lectureClassData, setLectureClassData] = useState<{
    classId: string
    className: string
    subject: string
    chapterName: string
    program?: string
    classVal?: string
    mentor: string
    date: string
    time: string
    isLive: boolean
    videoUrl?: string
    topics: Array<{ name: string }>
  } | null>(null)

  // Shikho AI screen
  const [showShikhoAI, setShowShikhoAI] = useState(false)

  const processQRScan = (url: string) => {
    setScannerOpen(false)

    const qrIdMatch = url.match(/id=([^&]+)/)
    if (!qrIdMatch) {
      alert("Invalid QR code format")
      return
    }

    const qrId = qrIdMatch[1]
    const qrData = qrDatabase.find((q) => q.id === qrId)

    if (!qrData) {
      alert("QR code not found in database. Please create it in CMS first.")
      return
    }

    // Handle Shikho AI QR type
    if (qrData.qrType === "shikho_ai") {
      if (entitlements[activeProgram] !== "full") {
        setPaywall({ requiredProgram: activeProgram })
        return
      }
      setShowShikhoAI(true)
      setActiveTab("courses")
      return
    }

    if (qrData.qrType === "quiz" && qrData.quizId) {
      const quiz = quizDatabase.find((q) => q.id === qrData.quizId)
      if (!quiz) {
        alert("Linked quiz not found.")
        return
      }
      const targetProgram = quiz.program || activeProgram
      if (targetProgram !== activeProgram) {
        setProgramSwitch({ targetProgram, next: { phase: quiz.phase, subject: quiz.subject, chapterId: quiz.chapterId, quiz } })
        return
      }
      if (entitlements[targetProgram] !== "full") {
        setPaywall({ requiredProgram: targetProgram })
        return
      }
      setActiveQuiz(quiz)
      setActiveQuizAnswers({})
      setQuizSubmitted(null)
      setActiveTab("courses")
      return
    }

    // Handle Animated Video QR type - No program/phase needed, only class/subject/chapter
    if (qrData.qrType === "animated_video") {
      let targetSubject = ""
      let targetChapter = ""

      if (Array.isArray(qrData.mappings) && qrData.mappings.length) {
        const forUser = qrData.mappings.find((m: any) => m.classVal === userClass) || qrData.mappings[0]
        if (forUser) {
          targetSubject = forUser.subject
          targetChapter = forUser.chapterId || ""
        }
      }

      if (!targetSubject) {
        alert("Invalid animated video QR mapping.")
        return
      }

      // No program check needed for animated videos - they're class-wise
      setAnimatedVideoSubject(targetSubject)
      if (targetChapter && targetChapter !== "__none__") {
        setAnimatedVideoChapter(targetChapter)
        setAnimatedVideoScreen("chapter")
      } else {
        setAnimatedVideoChapter(null)
        setAnimatedVideoScreen("subject")
      }
      setActiveTab("courses")
      return
    }

    // Handle Live Exam QR type
    if (qrData.qrType === "live_exam") {
      let targetPhase = ""
      let targetSubject = ""
      let targetChapter = ""
      let liveExamId = ""
      let resolvedProgram = activeProgram

      if (Array.isArray(qrData.mappings) && qrData.mappings.length) {
        const forUser = qrData.mappings.find((m: any) => m.classVal === userClass) || qrData.mappings[0]
        if (forUser) {
          if (forUser.isContentReady) {
            targetPhase = forUser.phase
            targetSubject = forUser.subject
            targetChapter = forUser.chapterId
            liveExamId = forUser.liveExamId || ""
            resolvedProgram = forUser.program
          } else {
            targetPhase = forUser.fallbackPhase || forUser.phase
            targetSubject = forUser.fallbackSubject || forUser.subject
            targetChapter = forUser.fallbackChapterId || forUser.chapterId
            liveExamId = forUser.fallbackLiveExamId || ""
            resolvedProgram = forUser.fallbackProgram || forUser.program
          }
        }
      } else {
        targetPhase = qrData.phase || ""
        targetSubject = qrData.subject || ""
        targetChapter = qrData.chapterId || ""
        liveExamId = (qrData as any).liveExamId || ""
        resolvedProgram = qrData.program || activeProgram
      }

      if (!targetSubject || !liveExamId) {
        alert("Invalid live exam QR mapping.")
        return
      }

      if (resolvedProgram && resolvedProgram !== activeProgram) {
        setProgramSwitch({ 
          targetProgram: resolvedProgram, 
          next: { 
            phase: targetPhase, 
            subject: targetSubject, 
            chapterId: targetChapter,
            liveExam: true,
            liveExamId: liveExamId
          } 
        })
        return
      }

      if (resolvedProgram && entitlements[resolvedProgram] !== "full") {
        setPaywall({ requiredProgram: resolvedProgram })
        return
      }

      // Find chapter name
      const chapter = chapters.find((ch) => ch.id === targetChapter && ch.subject === targetSubject)
      const chapterName = chapter?.name || targetChapter

      // Set live exam data (simulate - in real app, this would come from API)
      setLiveExamData({
        examId: liveExamId,
        examName: `Live Exam ${liveExamId}`,
        subject: targetSubject,
        chapterName: chapterName,
        program: resolvedProgram,
        hasParticipated: false, // In real app, check user's participation from API
        solutionPdfUrl: `https://example.com/solutions/${liveExamId}.pdf`, // In real app, get from API
      })
      setActiveTab("courses")
      return
    }

    // Handle Lecture Class QR type
    if (qrData.qrType === "lecture_class") {
      let targetPhase = ""
      let targetSubject = ""
      let targetChapter = ""
      let lectureClassId = ""
      let resolvedProgram = activeProgram

      if (Array.isArray(qrData.mappings) && qrData.mappings.length) {
        const forUser = qrData.mappings.find((m: any) => m.classVal === userClass) || qrData.mappings[0]
        if (forUser) {
          if (forUser.isContentReady) {
            targetPhase = forUser.phase
            targetSubject = forUser.subject
            targetChapter = forUser.chapterId
            lectureClassId = forUser.lectureClassId || ""
            resolvedProgram = forUser.program
          } else {
            targetPhase = forUser.fallbackPhase || forUser.phase
            targetSubject = forUser.fallbackSubject || forUser.subject
            targetChapter = forUser.fallbackChapterId || forUser.chapterId
            lectureClassId = forUser.fallbackLectureClassId || ""
            resolvedProgram = forUser.fallbackProgram || forUser.program
          }
        }
      } else {
        targetPhase = qrData.phase || ""
        targetSubject = qrData.subject || ""
        targetChapter = qrData.chapterId || ""
        lectureClassId = (qrData as any).lectureClassId || ""
        resolvedProgram = qrData.program || activeProgram
      }

      if (!targetSubject || !lectureClassId) {
        alert("Invalid lecture class QR mapping.")
        return
      }

      if (resolvedProgram && resolvedProgram !== activeProgram) {
        setProgramSwitch({ 
          targetProgram: resolvedProgram, 
          next: { 
            phase: targetPhase, 
            subject: targetSubject, 
            chapterId: targetChapter,
            lectureClass: true,
            lectureClassId: lectureClassId
          } 
        })
        return
      }

      if (resolvedProgram && entitlements[resolvedProgram] !== "full") {
        setPaywall({ requiredProgram: resolvedProgram })
        return
      }

      // Find chapter name and lecture class details
      const chapter = chapters.find((ch) => ch.id === targetChapter && ch.subject === targetSubject)
      const chapterName = chapter?.name || targetChapter

      // Get lecture class details (simulate - in real app, from API)
      // For now, use the lectureClassId to find it
      const lectureClass = { id: lectureClassId, name: `Lecture Class ${lectureClassId}` }

      // Get class value from mapping
      let targetClassVal = ""
      if (Array.isArray(qrData.mappings) && qrData.mappings.length) {
        const forUser = qrData.mappings.find((m: any) => m.classVal === userClass) || qrData.mappings[0]
        targetClassVal = forUser?.classVal || userClass
      } else {
        targetClassVal = userClass
      }

      // Set lecture class data
      setLectureClassData({
        classId: lectureClassId,
        className: lectureClass?.name || `Lecture Class ${lectureClassId}`,
        subject: targetSubject,
        chapterName: chapterName,
        program: resolvedProgram,
        classVal: targetClassVal,
        mentor: "Moriom", // In real app, get from API
        date: "18-05-25, Sunday", // In real app, get from API
        time: "04.13 PM - 04.14 PM", // In real app, get from API
        isLive: true, // In real app, check from API
        videoUrl: `https://example.com/videos/${lectureClassId}.mp4`, // In real app, get from API
        topics: [{ name: "Comprehension 1" }], // In real app, get from API
      })
      setActiveTab("courses")
      return
    }

    // Resolve mapping by user's class; fallback to legacy fields if needed
    let targetPhase = qrData.phase
    let targetSubject = qrData.subject
    let targetChapter = qrData.chapterId

    let resolvedProgram = qrData.program
    if (Array.isArray(qrData.mappings) && qrData.mappings.length) {
      const forUser = qrData.mappings.find((m: any) => m.classVal === userClass) || qrData.mappings[0]
      if (forUser) {
        if (forUser.isContentReady) {
          targetPhase = forUser.phase
          targetSubject = forUser.subject
          targetChapter = forUser.chapterId
          resolvedProgram = forUser.program
        } else {
          targetPhase = forUser.fallbackPhase || forUser.phase
          targetSubject = forUser.fallbackSubject || forUser.subject
          targetChapter = forUser.fallbackChapterId || forUser.chapterId
          resolvedProgram = forUser.fallbackProgram || forUser.program
        }
      }
    } else {
      // Legacy single mapping with optional fallback
      // @ts-ignore legacy
      const isContentReady = (qrData as any).isContentReady
      // @ts-ignore legacy
      const fallback = (qrData as any).fallback
      targetPhase = isContentReady ? qrData.phase : fallback?.phase || qrData.phase
      targetSubject = isContentReady ? qrData.subject : fallback?.subject || qrData.subject
      targetChapter = isContentReady ? qrData.chapterId : fallback?.chapterId || qrData.chapterId
      resolvedProgram = isContentReady ? qrData.program : fallback?.program || qrData.program
    }

    if (resolvedProgram && resolvedProgram !== activeProgram) {
      setProgramSwitch({ 
        targetProgram: resolvedProgram, 
        next: { 
          phase: targetPhase || "Quarter 1", 
          subject: targetSubject, 
          chapterId: targetChapter,
          animatedVideo: false 
        } 
      })
      return
    }

    if (resolvedProgram && entitlements[resolvedProgram] !== "full") {
      setPaywall({ requiredProgram: resolvedProgram })
      return
    }

    setActiveTab("courses")
    setSelectedPhase(targetPhase || "Quarter 1")
    setSelectedSubject(targetSubject)
    setOpenChapterId(targetChapter)

    setTimeout(() => {
      const el = document.getElementById(`chapter-${targetChapter}`)
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" })
      }
      setHighlightedChapter(targetChapter)
      setTimeout(() => setHighlightedChapter(null), 3000)
    }, 400)
  }

  return (
    <div className="min-h-[calc(100vh-57px)] bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center p-10">
      <div className="relative w-[375px] h-[667px] bg-white rounded-[40px] shadow-2xl overflow-hidden">
        {/* Phone Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[30px] bg-black rounded-b-[20px] z-10" />

        {/* App Screen */}
        <div className="w-full h-full pt-10 pb-20 px-5 overflow-y-auto">
          {activeTab === "home" && (
            <>
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-purple-600 mb-2">Shikho</h1>
                <p className="text-sm text-muted-foreground">Your Learning Companion</p>
              </div>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-xs text-muted-foreground">I am in</span>
                <button
                  className={`px-3 py-1 rounded-full text-xs border ${userClass === "c9" ? "bg-purple-600 text-white border-purple-600" : "border-muted"}`}
                  onClick={() => setUserClass("c9")}
                >
                  Class 9
                </button>
                <button
                  className={`px-3 py-1 rounded-full text-xs border ${userClass === "c10" ? "bg-purple-600 text-white border-purple-600" : "border-muted"}`}
                  onClick={() => setUserClass("c10")}
                >
                  Class 10
                </button>
              </div>
              <Card className="p-5 mb-5 bg-purple-600 text-white rounded-2xl">
                <div className="text-sm opacity-90 mb-2">এই টার্ম তুমি কেমন করছ?</div>
                <div className="font-semibold text-lg mb-3">চলো দেখি →</div>
                <div className="text-xs opacity-80">তোমার স্টাডির রুটিন দেখে নাও</div>
              </Card>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-xs text-muted-foreground">Program</span>
                {["SSC - AP 2026","SSC - AP 2025"].map((p) => (
                  <button
                    key={p}
                    className={`px-3 py-1 rounded-full text-xs border ${activeProgram === p ? "bg-purple-600 text-white border-purple-600" : "border-muted"}`}
                    onClick={() => setActiveProgram(p)}
                  >
                    {p.replace("SSC - ", "")}
                  </button>
                ))}
                <span className={`text-[10px] ml-2 ${showFab ? "text-green-600" : "text-amber-600"}`}>
                  {showFab ? "Full access" : "No full-course access"}
                </span>
              </div>
              <div className="mb-3 font-semibold">আজকের রুটিন</div>
              <Card className="p-4 mb-6"> 
                <div className="text-sm text-muted-foreground">তোমার প্ল্যানড রুটিন এখানে দেখাবে</div>
              </Card>
              <div className="mb-3 font-semibold">ফেভারিট</div>
              <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="h-24 bg-muted rounded-lg" />
                <div className="h-24 bg-muted rounded-lg" />
                <div className="h-24 bg-muted rounded-lg" />
              </div>
              <div className="space-y-3">
                <Card className="p-4">Additional Content Card 1</Card>
                <Card className="p-4">Additional Content Card 2</Card>
                <Card className="p-4">Additional Content Card 3</Card>
              </div>
            </>
          )}

          {activeTab === "courses" && (
            <>
              {/* Shikho AI Screen */}
              {showShikhoAI && (
                <>
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-4">
                    <button 
                      onClick={() => setShowShikhoAI(false)} 
                      className="p-1"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold flex-1 text-center -ml-6">Shikho AI</h1>
                  </div>

                  {/* Main Screen Content */}
                  <Card className="p-8 text-center">
                    <div className="text-4xl mb-4">🤖</div>
                    <h2 className="text-xl font-bold mb-2">Shikho AI's main screen</h2>
                    <p className="text-sm text-muted-foreground">AI-powered learning assistant</p>
                  </Card>
                </>
              )}

              {/* Lecture Class Screen */}
              {lectureClassData && (
                <>
                  {/* Header */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <button 
                        onClick={() => setLectureClassData(null)} 
                        className="p-1"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <div className="flex-1 text-center -ml-6">
                        <h1 className="text-lg font-bold">
                          {lectureClassData.subject} · {lectureClassData.program?.replace("SSC - ", "") || ""} · {lectureClassData.classVal === "c9" ? "Class 9" : lectureClassData.classVal === "c10" ? "Class 10" : lectureClassData.classVal ? `Class ${lectureClassData.classVal.replace("c", "")}` : ""}
                        </h1>
                        <div className="text-xs text-muted-foreground mt-0.5">ক্লাসের বিস্তারিত</div>
                      </div>
                      <div className="text-xs text-gray-500">2:22</div>
                    </div>
                  </div>

                  {/* Video Player */}
                  <div className="relative w-full aspect-video bg-gradient-to-br from-amber-100 via-purple-100 to-pink-100 rounded-lg mb-4 overflow-hidden">
                    {/* Pattern Background */}
                    <div className="absolute inset-0 opacity-20" style={{
                      backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(139,69,19,0.1) 10px, rgba(139,69,19,0.1) 20px),
                                      repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(147,51,234,0.1) 10px, rgba(147,51,234,0.1) 20px)`
                    }} />
                    
                    {/* Video Controls */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {/* Settings Icon */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <div className="w-8 h-8 bg-pink-500/80 rounded-full flex items-center justify-center text-white text-xs">⚙️</div>
                        <div className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center text-gray-700 text-xs">📶</div>
                      </div>
                      
                      {/* Download Icon */}
                      <div className="absolute top-3 right-3">
                        <div className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center text-gray-700">⬇️</div>
                      </div>

                      {/* Play Button */}
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <div className="w-0 h-0 border-l-[12px] border-l-gray-900 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1" />
                      </div>

                      {/* Skip Buttons */}
                      <div className="absolute left-4 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                        <div className="text-white text-xl">⏪</div>
                      </div>
                      <div className="absolute right-4 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                        <div className="text-white text-xl">⏩</div>
                      </div>

                      {/* Progress Bar */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/50 to-transparent">
                        <div className="relative h-1 bg-white/30 rounded-full mb-2">
                          <div className="absolute left-0 top-0 h-full w-[5%] bg-red-500 rounded-full">
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-white text-xs">
                          <span>00:00 / 01:08</span>
                          <div className="w-5 h-5">⛶</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Class Details */}
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <h2 className="text-xl font-bold mb-1">
                      {lectureClassData.subject} · {lectureClassData.program?.replace("SSC - ", "") || ""} · {lectureClassData.classVal === "c9" ? "Class 9" : lectureClassData.classVal === "c10" ? "Class 10" : lectureClassData.classVal ? `Class ${lectureClassData.classVal.replace("c", "")}` : ""}
                    </h2>
                    <div className="text-sm text-gray-600 mb-1">১ম পত্র</div>
                    {lectureClassData.isLive && (
                      <span className="text-sm text-red-500 mb-3 inline-block">live</span>
                    )}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">মেন্টরঃ</span>
                        <span>{lectureClassData.mentor}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>{lectureClassData.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>🕐</span>
                        <span>{lectureClassData.time}</span>
                      </div>
                    </div>

                    {/* Class Content */}
                    <div className="mt-4">
                      <h3 className="font-semibold mb-2">ক্লাসের বিষয়বস্তুঃ</h3>
                      <div className="space-y-2">
                        {lectureClassData.topics.map((topic, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <span className="text-pink-500">⭐</span>
                            <span>{topic.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Live Exam Screen */}
              {liveExamData && (
                <>
                  {/* Header */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <button 
                        onClick={() => setLiveExamData(null)} 
                        className="p-1"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <div className="flex-1 text-center -ml-6">
                        <div className="text-xs text-muted-foreground mb-0.5">
                          {liveExamData.subject} · {liveExamData.program?.replace("SSC - ", "") || ""}
                        </div>
                        <h1 className="text-lg font-bold">লাইভ টেস্টের পারফরমেন্স</h1>
                      </div>
                    </div>
                  </div>

                  {/* PDF Scroll Hint */}
                  <Card className="bg-gray-100 p-2.5 mb-4 flex items-center gap-2">
                    <div className="text-2xl">📁</div>
                    <div className="flex-1 text-xs text-gray-700">পিডিএফ দেখতে নিচে স্ক্রল করো</div>
                    <ChevronLeft className="w-3 h-3 text-gray-500 rotate-90" />
                  </Card>

                  {/* No Participation Message */}
                  {!liveExamData.hasParticipated && (
                    <Card className="p-4 mb-4 text-center">
                      <div className="text-5xl mb-3">🎒</div>
                      <h2 className="text-lg font-bold mb-1.5">দুঃখিত!</h2>
                      <p className="text-sm mb-1.5">তুমি এই টেস্টে অংশগ্রহণ করোনি!</p>
                      <p className="text-xs text-gray-600">তুমি টেস্ট দাওনি বলে এখানে কোনো রেজাল্ট নেই, পরবর্তী টেস্টের প্রস্তুতি নাও</p>
                    </Card>
                  )}

                  {/* Results (if participated) */}
                  {liveExamData.hasParticipated && liveExamData.score !== undefined && (
                    <Card className="p-4 mb-4 text-center">
                      <h2 className="text-lg font-bold mb-1.5">তোমার ফলাফল</h2>
                      <div className="text-2xl font-bold text-purple-600 mb-1.5">
                        {liveExamData.score}/{liveExamData.total}
                      </div>
                      <p className="text-xs text-gray-600">তুমি {liveExamData.score} নম্বর পেয়েছো</p>
                    </Card>
                  )}

                  {/* Solution Section */}
                  {liveExamData.solutionPdfUrl && (
                    <>
                      <h3 className="text-sm font-semibold mb-2">টেস্টের বিস্তারিত সমাধান দেখে নাও</h3>
                      <Card className="p-3 mb-4 cursor-pointer hover:bg-gray-50" onClick={() => window.open(liveExamData.solutionPdfUrl, "_blank")}>
                        <div className="flex items-center gap-2">
                          <div className="text-2xl">📄</div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">{liveExamData.examName} Solution ({liveExamData.subject})</div>
                            <div className="text-xs text-gray-600">{liveExamData.examName} Solution ({liveExamData.subject})</div>
                          </div>
                          <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
                        </div>
                      </Card>
                    </>
                  )}

                  {/* Bottom See Solution Button */}
                  {liveExamData.solutionPdfUrl && (
                    <div className="sticky bottom-0 bg-white pt-3 pb-2 -mx-5 px-5 border-t">
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 text-sm font-medium"
                        onClick={() => window.open(liveExamData.solutionPdfUrl, "_blank")}
                      >
                        সমাধান দেখো
                      </Button>
                    </div>
                  )}
                </>
              )}

              {/* Animated Video Screens */}
              {animatedVideoScreen === "subject" && animatedVideoSubject && (
                <>
                  {/* Subject Screen Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <button 
                      onClick={() => {
                        setAnimatedVideoScreen(null)
                        setAnimatedVideoSubject(null)
                        setAnimatedVideoChapter(null)
                      }} 
                      className="p-1"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                      <h1 className="text-xl font-bold text-[#1a237e]">{animatedVideoSubject} - এনিমেটেড ভিডিও</h1>
                      <p className="text-sm text-[#424242] mt-1">
                        সর্বমোট {chapters.filter((ch) => ch.subject === animatedVideoSubject).length} টি অধ্যায়
                      </p>
                    </div>
                    <div className="text-2xl">অ</div>
                  </div>

                  {/* Chapter List */}
                  <div className="space-y-2">
                    {chapters
                      .filter((ch) => ch.subject === animatedVideoSubject)
                      .map((chapter, idx) => (
                        <Card
                          key={`${chapter.id}-${chapter.phase}`}
                          className="p-4 cursor-pointer hover:bg-muted/50 transition-colors bg-gray-50"
                          onClick={() => {
                            setAnimatedVideoChapter(chapter.id)
                            setAnimatedVideoScreen("chapter")
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="text-xs text-gray-500 mb-1">অধ্যায় {idx === 0 ? "০" : idx.toString()}</div>
                              <div className="text-base font-semibold text-[#1a237e]">{chapter.name}</div>
                            </div>
                            <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
                          </div>
                        </Card>
                      ))}
                  </div>
                </>
              )}

              {animatedVideoScreen === "chapter" && animatedVideoSubject && animatedVideoChapter && (
                <>
                  {/* Chapter Screen Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <button 
                      onClick={() => {
                        setAnimatedVideoScreen("subject")
                        setAnimatedVideoChapter(null)
                      }} 
                      className="p-1"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                      {(() => {
                        const chapter = chapters.find((ch) => ch.id === animatedVideoChapter && ch.subject === animatedVideoSubject)
                        const topicCount = animatedVideoTopics[animatedVideoSubject]?.[animatedVideoChapter]?.length || 0
                        return (
                          <>
                            <h1 className="text-xl font-bold text-[#1a237e]">{chapter?.name || "Chapter"}</h1>
                            <p className="text-sm text-[#424242] mt-1">
                              {topicCount} টি টপিক
                            </p>
                          </>
                        )
                      })()}
                    </div>
                    <div className="text-2xl">অ</div>
                  </div>

                  {/* Topic/Lesson List */}
                  <div className="space-y-3">
                    {animatedVideoTopics[animatedVideoSubject]?.[animatedVideoChapter]?.map((topic, idx) => (
                      <Card key={topic.id} className="overflow-hidden border border-gray-200 rounded-lg shadow-sm">
                        <div className="flex">
                          {/* Thumbnail */}
                          <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center text-4xl flex-shrink-0 border-r border-gray-200">
                            {topic.thumbnail || "📚"}
                          </div>
                          {/* Content */}
                          <div className="flex-1 p-4 flex flex-col justify-center">
                            <div className="text-xs text-gray-500 mb-1">টপিক {(() => {
                              const chapterIdx = chapters.filter((ch) => ch.subject === animatedVideoSubject).findIndex((ch) => ch.id === animatedVideoChapter)
                              return chapterIdx >= 0 ? `${chapterIdx + 1}.${idx + 1}` : `${idx + 1}`
                            })()}</div>
                            <div className="text-base font-semibold text-[#1a237e]">{topic.name}</div>
                          </div>
                        </div>
                      </Card>
                    ))}
                    {(!animatedVideoTopics[animatedVideoSubject]?.[animatedVideoChapter] || animatedVideoTopics[animatedVideoSubject]?.[animatedVideoChapter]?.length === 0) && (
                      <Card className="p-6 text-center text-muted-foreground">
                        <div>এই অধ্যায়ে এখনও কোন টপিক নেই</div>
                      </Card>
                    )}
                  </div>
                </>
              )}

              {/* Regular Courses Content */}
              {!animatedVideoScreen && !liveExamData && !lectureClassData && (
                <>
                  {/* Subject header like the reference screen */}
                  <div className="flex items-center gap-2 mb-2">
                    <button onClick={() => setActiveTab("home")} className="p-1">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-bold flex-1 text-center -ml-6">
                      {selectedSubject}
                      <span className="ml-2 text-sm font-medium text-muted-foreground">
                        {activeProgram.replace("SSC - ", "")} · {userClass === "c9" ? "Class 9" : "Class 10"}
                      </span>
                    </h2>
                  </div>

                  {/* Active QR Quiz (answers-only) */}
              {activeQuiz && (
                <Card className="p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold">QR Quiz: {activeQuiz.name}</div>
                    <button className="text-xs text-muted-foreground" onClick={() => { setActiveQuiz(null); setQuizSubmitted(null); setActiveQuizAnswers({}) }}>Exit</button>
                  </div>
                  {!quizSubmitted ? (
                    <div className="space-y-3">
                      {activeQuiz.questions.map((q: any) => {
                        const selected = activeQuizAnswers[q.id]
                        return (
                          <div key={q.id} className="flex items-center justify-between border rounded p-3">
                            <div className="text-sm">Question {q.number}</div>
                            <div className="flex gap-2">
                              {["A","B","C","D"].map((optKey) => (
                                <button
                                  key={optKey}
                                  onClick={() => setActiveQuizAnswers((prev) => ({ ...prev, [q.id]: optKey }))}
                                  className={`px-2 py-1 text-xs rounded border ${selected === optKey ? "border-purple-600" : "border-muted"}`}
                                >
                                  {optKey}
                                </button>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700"
                          onClick={() => {
                            const total = activeQuiz.questions.length
                            const correct = activeQuiz.questions.reduce((acc: number, q: any) => acc + (activeQuizAnswers[q.id] === q.correct ? 1 : 0), 0)
                            setQuizSubmitted({ score: correct, total })
                            setQuizResultsByChapter((prev) => ({
                              ...prev,
                              [activeQuiz.chapterId]: { score: correct, total, solutionUrl: activeQuiz.solutionPdfUrl },
                            }))
                          }}
                          disabled={Object.keys(activeQuizAnswers).length !== activeQuiz.questions.length}
                        >
                          Submit
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-sm">You scored {quizSubmitted.score}/{quizSubmitted.total}!</div>
                      {activeQuiz.solutionPdfUrl ? (
                        <Button size="sm" variant="outline" onClick={() => window.open(activeQuiz.solutionPdfUrl, "_blank")}>View Solutions</Button>
                      ) : (
                        <div className="text-xs text-muted-foreground">No solution PDF provided.</div>
                      )}
                    </div>
                  )}
                </Card>
              )}

              {!activeQuiz && !liveExamData && !lectureClassData && !showShikhoAI && (
                <>
                  {/* Quarter tabs */}
                  <div className="flex justify-around border-b mb-4">
                    {phases.map((p) => (
                      <button
                        key={p}
                        onClick={() => {
                          setSelectedPhase(p)
                          setOpenChapterId(null)
                        }}
                        className={`tab px-2 py-3 text-sm font-medium border-b-2 ${
                          selectedPhase === p ? "text-pink-600 border-pink-600" : "text-muted-foreground border-transparent"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  {/* Chapters accordion within the subject screen */}
                  <Accordion type="single" collapsible value={openChapterId || undefined} onValueChange={(v) => setOpenChapterId(v)}>
                    {chapters
                      .filter((ch) => ch.subject === selectedSubject && ch.phase === selectedPhase)
                      .map((chapter) => (
                        <AccordionItem value={chapter.id} key={chapter.id}>
                          <AccordionTrigger
                            id={`chapter-${chapter.id}`}
                            className={`text-sm ${
                              highlightedChapter === chapter.id ? "border-2 border-purple-600 rounded-md" : ""
                            }`}
                          >
                            {chapter.name}
                          </AccordionTrigger>
                          <AccordionContent>
                            <Card className="p-4 mb-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-medium">পড়াশোনা শুরু</div>
                                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">Start</Button>
                              </div>
                              <div className="text-sm text-muted-foreground">Resources for this chapter will appear here...</div>
                            </Card>
                            {quizResultsByChapter[chapter.id] && (
                              <Card className="p-4 mb-3">
                                <div className="flex items-center justify-between">
                                  <div className="text-sm">QR Quiz Result: {quizResultsByChapter[chapter.id].score}/{quizResultsByChapter[chapter.id].total}</div>
                                  {quizResultsByChapter[chapter.id].solutionUrl && (
                                    <Button size="sm" variant="outline" onClick={() => window.open(quizResultsByChapter[chapter.id].solutionUrl!, "_blank")}>View Solutions</Button>
                                  )}
                                </div>
                              </Card>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                  </Accordion>
                </>
              )}
                </>
              )}
            </>
          )}
        </div>

        {/* FAB Button (entitlement gated) */}
        {showFab && !lectureClassData && !showShikhoAI && (
          <button
            onClick={() => setScannerOpen(true)}
            className="absolute bottom-[90px] left-1/2 -translate-x-1/2 w-[60px] h-[60px] bg-purple-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10"
          >
            <QrCode className="w-6 h-6 text-white" />
          </button>
        )}

        {/* Bottom Navigation */}
        <div className="absolute bottom-0 w-full h-[70px] bg-white border-t flex justify-around items-center">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center gap-1 ${
              activeTab === "home" ? "text-purple-600" : "text-muted-foreground"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </button>
          <button
            onClick={() => setActiveTab("courses")}
            className={`flex flex-col items-center gap-1 ${
              activeTab === "courses" ? "text-purple-600" : "text-muted-foreground"
            }`}
          >
            <Book className="w-5 h-5" />
            <span className="text-xs">Courses</span>
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex flex-col items-center gap-1 ${
              activeTab === "profile" ? "text-purple-600" : "text-muted-foreground"
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </button>
        </div>

        {/* Scanner Overlay */}
        {scannerOpen && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-20">
            <button onClick={() => setScannerOpen(false)} className="absolute top-12 right-5 text-white text-4xl">
              <X />
            </button>

            <div className="relative w-[250px] h-[250px] border-3 border-white rounded-[20px] mb-5">
              <div className="absolute -top-1 -left-1 w-[30px] h-[30px] border-4 border-purple-600 border-r-0 border-b-0" />
              <div className="absolute -top-1 -right-1 w-[30px] h-[30px] border-4 border-purple-600 border-l-0 border-b-0" />
              <div className="absolute -bottom-1 -left-1 w-[30px] h-[30px] border-4 border-purple-600 border-r-0 border-t-0" />
              <div className="absolute -bottom-1 -right-1 w-[30px] h-[30px] border-4 border-purple-600 border-l-0 border-t-0" />
              <div className="absolute top-0 w-full h-[3px] bg-purple-600 animate-scan" />
            </div>

            <p className="text-white text-center mb-5">Point camera at QR code</p>

            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleQRUpload} />
            <Button onClick={() => fileInputRef.current?.click()} className="bg-purple-600 hover:bg-purple-700">
              <Upload className="mr-2 h-4 w-4" />
              Upload QR Image
            </Button>
          </div>
        )}
        {/* Program switch prompt */}
        {programSwitch && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-30 px-6">
            <Card className="p-5 w-full">
              <div className="flex items-start gap-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <div className="font-semibold">Switch Program?</div>
                  <div className="text-sm text-muted-foreground">This content belongs to '{programSwitch.targetProgram}'. Switch to view it?</div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setProgramSwitch(null)}>Cancel</Button>
                <Button
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => {
                    const next = programSwitch.next
                    setActiveProgram(programSwitch.targetProgram)
                    setProgramSwitch(null)
                    if (next.quiz) {
                      if (entitlements[programSwitch.targetProgram] !== "full") { setPaywall({ requiredProgram: programSwitch.targetProgram }); return }
                      setActiveQuiz(next.quiz)
                      setActiveQuizAnswers({})
                      setQuizSubmitted(null)
                      setActiveTab("courses")
                    } else if (next.animatedVideo) {
                      // Animated videos don't require program switch - they're class-wise
                      setAnimatedVideoSubject(next.subject)
                      if (next.chapterId && next.chapterId !== "__none__") {
                        setAnimatedVideoChapter(next.chapterId)
                        setAnimatedVideoScreen("chapter")
                      } else {
                        setAnimatedVideoChapter(null)
                        setAnimatedVideoScreen("subject")
                      }
                      setActiveTab("courses")
                    } else if (next.liveExam) {
                      if (entitlements[programSwitch.targetProgram] !== "full") { setPaywall({ requiredProgram: programSwitch.targetProgram }); return }
                      const chapter = chapters.find((ch) => ch.id === next.chapterId && ch.subject === next.subject)
                      setLiveExamData({
                        examId: next.liveExamId || "",
                        examName: `Live Exam ${next.liveExamId}`,
                        subject: next.subject,
                        chapterName: chapter?.name || next.chapterId || "",
                        program: programSwitch.targetProgram,
                        hasParticipated: false,
                        solutionPdfUrl: `https://example.com/solutions/${next.liveExamId}.pdf`,
                      })
                      setActiveTab("courses")
                    } else if (next.lectureClass) {
                      if (entitlements[programSwitch.targetProgram] !== "full") { setPaywall({ requiredProgram: programSwitch.targetProgram }); return }
                      const chapter = chapters.find((ch) => ch.id === next.chapterId && ch.subject === next.subject)
                      setLectureClassData({
                        classId: next.lectureClassId || "",
                        className: `Lecture Class ${next.lectureClassId}`,
                        subject: next.subject,
                        chapterName: chapter?.name || next.chapterId || "",
                        program: programSwitch.targetProgram,
                        classVal: userClass,
                        mentor: "Moriom",
                        date: "18-05-25, Sunday",
                        time: "04.13 PM - 04.14 PM",
                        isLive: true,
                        videoUrl: `https://example.com/videos/${next.lectureClassId}.mp4`,
                        topics: [{ name: "Comprehension 1" }],
                      })
                      setActiveTab("courses")
                    } else {
                      if (entitlements[programSwitch.targetProgram] !== "full") { setPaywall({ requiredProgram: programSwitch.targetProgram }); return }
                      setActiveTab("courses")
                      setSelectedPhase(next.phase || "Quarter 1")
                      setSelectedSubject(next.subject)
                      setOpenChapterId(next.chapterId || null)
                      setTimeout(() => {
                        const el = document.getElementById(`chapter-${next.chapterId}`)
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" })
                        setHighlightedChapter(next.chapterId || null)
                        setTimeout(() => setHighlightedChapter(null), 3000)
                      }, 400)
                    }
                  }}
                >
                  Switch & View
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Paywall overlay */}
        {paywall && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-30 px-6">
            <Card className="p-5 w-full">
              <div className="font-semibold mb-2">Purchase Required</div>
              <div className="text-sm text-muted-foreground mb-4">You need the full course for '{paywall.requiredProgram}' to access this content.</div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setPaywall(null)}>Close</Button>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => { setPaywall(null); alert("Redirecting to payment screen...") }}>Go to Payment</Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
