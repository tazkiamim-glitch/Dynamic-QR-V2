"use client"

import type React from "react"

import { useState, useRef } from "react"
import { QrCode, Home, Book, User, Upload, X, ChevronLeft } from "lucide-react"
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
  const [activeQuizIndex, setActiveQuizIndex] = useState<number>(0)
  const [activeQuizAnswers, setActiveQuizAnswers] = useState<Record<string, string>>({})

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

    if (qrData.qrType === "quiz" && qrData.quizId) {
      const quiz = quizDatabase.find((q) => q.id === qrData.quizId)
      if (!quiz) {
        alert("Linked quiz not found.")
        return
      }
      setActiveQuiz(quiz)
      setActiveQuizIndex(0)
      setActiveQuizAnswers({})
      setActiveTab("courses")
      return
    }

    const targetPhase = qrData.isContentReady ? qrData.phase : qrData?.fallback?.phase || qrData.phase
    const targetSubject = qrData.isContentReady ? qrData.subject : qrData?.fallback?.subject || qrData.subject
    const targetChapter = qrData.isContentReady ? qrData.chapterId : qrData?.fallback?.chapterId || qrData.chapterId

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
              <Card className="p-5 mb-5 bg-purple-600 text-white rounded-2xl">
                <div className="text-sm opacity-90 mb-2">এই টার্ম তুমি কেমন করছ?</div>
                <div className="font-semibold text-lg mb-3">চলো দেখি →</div>
                <div className="text-xs opacity-80">তোমার স্টাডির রুটিন দেখে নাও</div>
              </Card>
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
              {/* Subject header like the reference screen */}
              <div className="flex items-center gap-2 mb-2">
                <button onClick={() => setActiveTab("home")} className="p-1">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold flex-1 text-center -ml-6">{selectedSubject}</h2>
              </div>

              {/* Active QR Quiz */}
              {activeQuiz && (
                <Card className="p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold">QR Quiz: {activeQuiz.name}</div>
                    <button className="text-xs text-muted-foreground" onClick={() => setActiveQuiz(null)}>Exit</button>
                  </div>
                  <div className="text-sm mb-3">
                    Question {activeQuizIndex + 1} of {activeQuiz.questions.length}
                  </div>
                  {(() => {
                    const q = activeQuiz.questions[activeQuizIndex]
                    if (!q) return null
                    const selected = activeQuizAnswers[q.id]
                    return (
                      <div className="space-y-3">
                        <div className="text-sm">Book Question #{q.number}</div>
                        <div className="grid grid-cols-2 gap-2">
                          {(["A","B","C","D"] as const).map((optKey) => (
                            <button
                              key={optKey}
                              onClick={() => setActiveQuizAnswers((prev) => ({ ...prev, [q.id]: optKey }))}
                              className={`border rounded p-3 text-left text-sm ${selected === optKey ? "border-purple-600" : "border-muted"}`}
                            >
                              <div className="font-medium">Option {optKey}</div>
                              <div className="text-xs text-muted-foreground truncate">{q.options[optKey]?.text || "(image/formula)"}</div>
                            </button>
                          ))}
                        </div>
                        <div className="flex justify-between pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveQuizIndex((i) => Math.max(0, i - 1))}
                            disabled={activeQuizIndex === 0}
                          >
                            Previous
                          </Button>
                          {activeQuizIndex < activeQuiz.questions.length - 1 ? (
                            <Button
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700"
                              onClick={() => setActiveQuizIndex((i) => Math.min(activeQuiz.questions.length - 1, i + 1))}
                              disabled={!selected}
                            >
                              Next
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700"
                              onClick={() => {
                                const total = activeQuiz.questions.length
                                const correct = activeQuiz.questions.reduce((acc: number, q: any) => acc + (activeQuizAnswers[q.id] === q.correct ? 1 : 0), 0)
                                alert(`You scored ${correct}/${total}`)
                              }}
                              disabled={Object.keys(activeQuizAnswers).length !== activeQuiz.questions.length}
                            >
                              Submit
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })()}
                </Card>
              )}

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
                      </AccordionContent>
                    </AccordionItem>
                  ))}
              </Accordion>
            </>
          )}
        </div>

        {/* FAB Button */}
        <button
          onClick={() => setScannerOpen(true)}
          className="absolute bottom-[90px] left-1/2 -translate-x-1/2 w-[60px] h-[60px] bg-purple-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10"
        >
          <QrCode className="w-6 h-6 text-white" />
        </button>

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
      </div>
    </div>
  )
}
