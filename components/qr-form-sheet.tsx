"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectLabel, SelectSeparator, SelectGroup } from "@/components/ui/select"
import { ChevronRight, ChevronDown } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

const data = {
  phases: ["Quarter 1", "Quarter 2", "Quarter 3", "Quarter 4"],
  academicPrograms: {
    c6: [],
    c7: [],
    c8: ["SSC - AP 2026", "SSC - AP 2025"],
    c9: ["SSC - AP 2027", "SSC - AP 2026", "SSC - AP 2025"],
    c10: ["SSC - AP 2026", "SSC - AP 2025"],
    c11: [],
    c12: [],
  },
  subjects: {
    "SSC - AP 2027": ["Physics", "Chemistry"],
    "SSC - AP 2026": ["Physics", "Chemistry"],
    "SSC - AP 2025": ["Physics", "Chemistry"],
    // Optional extra program if needed in future: "Test Complimentary Program": ["Physics", "Chemistry"],
  },
  // Chapters are now per Subject per Phase
  chapters: {
    Physics: {
      "Quarter 1": [
        { id: "ch1", name: "অধ্যায় ০১ - ভৌত রাশি" },
        { id: "ch2", name: "অধ্যায় ০২ - গতি" },
        { id: "ph3", name: "অধ্যায় ০৩ - একক ও মাত্রা" },
        { id: "ph4", name: "অধ্যায় ০৪ - ভেক্টর ও স্কেলার" },
      ],
      "Quarter 2": [
        { id: "ch1", name: "অধ্যায় ০৩ - বল ও নিউটনের সূত্র" },
        { id: "ch2", name: "অধ্যায় ০৪ - কাজ ও শক্তি" },
        { id: "ph5", name: "অতিরিক্ত অধ্যায় - মহাকর্ষ" },
        { id: "ph6", name: "অতিরিক্ত অধ্যায় - সরল কম্পন" },
      ],
      "Quarter 3": [
        { id: "ch1", name: "অধ্যায় ০৫ - তাপ ও তাপগতিবিদ্যা" },
        { id: "ch2", name: "অধ্যায় ০৬ - তরঙ্গ ও শব্দ" },
        { id: "ph7", name: "অতিরিক্ত অধ্যায় - ঘনত্ব ও ভাসমানতা" },
        { id: "ph8", name: "অতিরিক্ত অধ্যায় - তাপ ধারকতা" },
      ],
      "Quarter 4": [
        { id: "ch1", name: "অধ্যায় ০৭ - আলোকবিজ্ঞান" },
        { id: "ch2", name: "অধ্যায় ০৮ - বিদ্যুৎ ও চৌম্বকত্ব" },
        { id: "ph9", name: "অতিরিক্ত অধ্যায় - ইলেকট্রনিক্স" },
        { id: "ph10", name: "অতিরিক্ত অধ্যায় - আধুনিক পদার্থবিজ্ঞান" },
      ],
    },
    Chemistry: {
      "Quarter 1": [
        { id: "ch3", name: "অধ্যায় ০১ - রসায়নের ধারণা" },
      ],
      "Quarter 2": [
        { id: "ch3", name: "অধ্যায় ০২ - পারমাণবিক গঠন" },
      ],
      "Quarter 3": [
        { id: "ch3", name: "অধ্যায় ০৩ - রাসায়নিক বন্ধন" },
      ],
      "Quarter 4": [
        { id: "ch3", name: "অধ্যায় ০৪ - অম্ল-ক্ষারক" },
      ],
    },
  },
  exams: {
    "অধ্যায় ০১ - ভৌত রাশি": ["Ch. 1 - MCQ Set A"],
  },
  lectureClasses: {
    Physics: {
      "Quarter 1": {
        "ch1": [
          { id: "lec1", name: "Lecture 1 - Introduction to Physical Quantities" },
          { id: "lec2", name: "Lecture 2 - Measurement Systems" },
        ],
        "ch2": [
          { id: "lec3", name: "Lecture 1 - Motion Basics" },
        ],
      },
      "Quarter 2": {
        "ch1": [
          { id: "lec4", name: "Lecture 1 - Newton's Laws" },
        ],
      },
    },
    Chemistry: {
      "Quarter 1": {
        "ch3": [
          { id: "lec5", name: "Lecture 1 - Chemistry Concepts" },
        ],
      },
    },
  },
}

interface QRFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
  editingQR: any
  quizDatabase?: any[]
}

export default function QRFormSheet({ open, onOpenChange, onSubmit, editingQR, quizDatabase = [] }: QRFormSheetProps) {
  const [qrType, setQrType] = useState<"chapter" | "quiz" | "lecture_class" | "live_exam" | "animated_video" | "shikho_ai" | "">("")
  const [name, setName] = useState("")
  const [status, setStatus] = useState<"Published" | "Unpublished">("Published")
  const [manualQrId, setManualQrId] = useState("")
  const [quizId, setQuizId] = useState("")
  const [selectedQuizId, setSelectedQuizId] = useState("")

  // Multiple destination mappings
  const [mappings, setMappings] = useState<any[]>([
    {
      classVal: "",
      phase: "",
      program: "",
      subject: "",
      chapterId: "",
      lectureClassId: "",
      liveExamId: "",
      isContentReady: false,
      fallbackClassVal: "",
      fallbackProgram: "",
      fallbackPhase: "",
      fallbackSubject: "",
      fallbackChapterId: "",
      fallbackLectureClassId: "",
      fallbackLiveExamId: "",
    },
  ])

  // Mappings for QR Quiz workflow: only "who" (class/program), supports group selection like SSC/HSC
  const [quizMappings, setQuizMappings] = useState<any[]>([
    { classVal: "", program: "" },
  ])
  const classGroups = {
    topSingles: [
      { value: "c6", label: "Class 6" },
      { value: "c7", label: "Class 7" },
      { value: "c8", label: "Class 8" },
    ],
    ssc: [
      { value: "c9", label: "Class 9" },
      { value: "c10", label: "Class 10" },
    ],
    hsc: [
      { value: "c11", label: "Class 11" },
      { value: "c12", label: "Class 12" },
    ],
  }

  function ProgramClassSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [sscOpen, setSscOpen] = useState(false)
    const [hscOpen, setHscOpen] = useState(false)
    
    // Find the label for the selected value to display in SelectValue
    const allClasses = [...classGroups.topSingles, ...classGroups.ssc, ...classGroups.hsc]
    const selectedLabel = allClasses.find(c => c.value === value)?.label
    
    // Auto-expand sections if value is selected from them
    useEffect(() => {
      if (value === "c9" || value === "c10") {
        setSscOpen(true)
      } else if (value === "c11" || value === "c12") {
        setHscOpen(true)
      }
    }, [value])
    
    return (
      <Select value={(value || undefined) as any} onValueChange={(v: any) => onChange(v)}>
        <SelectTrigger>
          <SelectValue placeholder="Select Class" />
        </SelectTrigger>
        <SelectContent>
          {classGroups.topSingles.map((c) => (
            <SelectItem key={c.value} value={c.value as any}>{c.label}</SelectItem>
          ))}
          <SelectSeparator />
          {/* SSC expandable row (non-selectable) */}
          <div
            className="pl-2 py-1.5 text-sm flex items-center gap-2 cursor-pointer hover:bg-accent rounded-sm"
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setSscOpen((o) => !o) }}
            role="button"
            aria-label={sscOpen ? "Collapse SSC" : "Expand SSC"}
          >
            {sscOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            <span>SSC</span>
          </div>
          {(sscOpen || value === "c9" || value === "c10") && (
            <>
              {classGroups.ssc.map((c) => (
                <SelectItem key={c.value} value={c.value as any} className="pl-8">{c.label}</SelectItem>
              ))}
            </>
          )}
          <SelectSeparator />
          {/* HSC expandable row (non-selectable) */}
          <div
            className="pl-2 py-1.5 text-sm flex items-center gap-2 cursor-pointer hover:bg-accent rounded-sm"
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setHscOpen((o) => !o) }}
            role="button"
            aria-label={hscOpen ? "Collapse HSC" : "Expand HSC"}
          >
            {hscOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            <span>HSC</span>
          </div>
          {(hscOpen || value === "c11" || value === "c12") && (
            <>
              {classGroups.hsc.map((c) => (
                <SelectItem key={c.value} value={c.value as any} className="pl-8">{c.label}</SelectItem>
              ))}
            </>
          )}
        </SelectContent>
      </Select>
    )
  }

  useEffect(() => {
    if (editingQR) {
      setQrType(editingQR.qrType || "chapter")
      setQuizId(editingQR.quizId || "")
      setSelectedQuizId(editingQR.quizId || "")
      setName(editingQR.name || "")
      setStatus((editingQR.status as any) || "Published")
      setManualQrId(editingQR.id || "")

      if (Array.isArray(editingQR.mappings) && editingQR.mappings.length > 0) {
        setMappings(
          editingQR.mappings.map((m: any) => ({
            classVal: m.classVal || m.class || "",
            phase: m.phase || "",
            program: m.program || "",
            subject: m.subject || "",
            chapterId: m.chapterId || "",
            lectureClassId: m.lectureClassId || "",
            liveExamId: m.liveExamId || "",
            isContentReady: !!m.isContentReady,
            fallbackClassVal: m.fallbackClassVal || m.fallback?.classVal || "",
            fallbackProgram: m.fallbackProgram || m.fallback?.program || "",
            fallbackPhase: m.fallbackPhase || m.fallback?.phase || "",
            fallbackSubject: m.fallbackSubject || m.fallback?.subject || "",
            fallbackChapterId: m.fallbackChapterId || m.fallback?.chapterId || "",
            fallbackLectureClassId: m.fallbackLectureClassId || m.fallback?.lectureClassId || "",
            fallbackLiveExamId: m.fallbackLiveExamId || m.fallback?.liveExamId || "",
          }))
        )
      } else {
        // Backwards compatibility: convert single-target QR to a single mapping
        setMappings([
          {
            classVal: editingQR.class || "",
            phase: editingQR.phase || "",
            program: editingQR.program || "",
            subject: editingQR.subject || "",
            chapterId: editingQR.chapterId || "",
            lectureClassId: (editingQR as any).lectureClassId || "",
            liveExamId: (editingQR as any).liveExamId || "",
            isContentReady: !!editingQR.isContentReady,
            fallbackClassVal: editingQR.fallback?.classVal || "",
            fallbackProgram: editingQR.fallback?.program || "",
            fallbackPhase: editingQR.fallback?.phase || "",
            fallbackSubject: editingQR.fallback?.subject || "",
            fallbackChapterId: editingQR.fallback?.chapterId || "",
            fallbackLectureClassId: editingQR.fallback?.lectureClassId || "",
            fallbackLiveExamId: editingQR.fallback?.liveExamId || "",
          },
        ])
      }

      if (editingQR.qrType === "quiz") {
        // Populate quiz mapping if present
        const qm = (editingQR as any).quizMappings
        if (Array.isArray(qm) && qm.length) {
          setQuizMappings(qm.map((m: any) => ({
            classVal: m.classVal || "",
            program: m.program || "",
          })))
        }
      }
    } else {
      setQrType("")
      setQuizId("")
      setSelectedQuizId("")
      setName("")
      setStatus("Published")
      setManualQrId("")
      setMappings([
        {
          classVal: "",
          phase: "",
          program: "",
          subject: "",
          chapterId: "",
          lectureClassId: "",
          liveExamId: "",
          isContentReady: false,
          fallbackClassVal: "",
          fallbackProgram: "",
          fallbackPhase: "",
          fallbackSubject: "",
          fallbackChapterId: "",
          fallbackLectureClassId: "",
          fallbackLiveExamId: "",
        },
      ])
      setQuizMappings([{ classVal: "", program: "" }])
    }
  }, [editingQR, open])

  // QR type supports only Chapter and QR Quiz

  const handleSubmit = () => {
    if (!qrType) {
      alert("Please select QR Type")
      return
    }
    if (!editingQR && !manualQrId.trim()) {
      alert("Please provide a QR ID")
      return
    }
    if (!name.trim()) {
      alert("Please provide a Name/Description")
      return
    }
    if (qrType === "quiz") {
      // Validate quiz mappings
      if (!selectedQuizId) {
        alert("Please select a QR Quiz")
        return
      }
      if (!quizMappings.length) {
        alert("Please add at least one destination mapping")
        return
      }
      for (const [idx, m] of quizMappings.entries()) {
        if (!m.classVal || !m.program) {
          alert(`Please complete Class and Program in Mapping #${idx + 1}`)
          return
        }
      }
      const qrId = editingQR?.id || (manualQrId?.trim() || `qrid_${Math.random().toString(36).substring(2, 11)}`)
      const selectedQuiz = quizDatabase.find((qq: any) => qq.id === selectedQuizId)
      const quizName = selectedQuiz?.name || "QR Quiz"
      const defaultName = `[QR QUIZ] ${quizName}`
      // Expand grouped classes into per-class mappings
      const expandedQuizMappings = quizMappings.flatMap((m) => {
        if (m.classVal === 'ssc') return classGroups.ssc.map((c) => ({ classVal: c.value, program: m.program }))
        if (m.classVal === 'hsc') return classGroups.hsc.map((c) => ({ classVal: c.value, program: m.program }))
        return [{ classVal: m.classVal, program: m.program }]
      })
      const qrData = {
        id: qrId,
        name: name || defaultName,
        qrType: "quiz" as const,
        url: `https://shikho.com/qr?id=${qrId}`,
        quizId: selectedQuizId,
        quizMappings: expandedQuizMappings,
        status,
      }
      onSubmit(qrData)
      return
    }

    // Shikho AI type - no destination mapping needed
    if (qrType === "shikho_ai") {
      const qrId = editingQR?.id || (manualQrId?.trim() || `qrid_${Math.random().toString(36).substring(2, 11)}`)
      const qrData = {
        id: qrId,
        name: name || "[Shikho AI]",
        qrType: "shikho_ai" as const,
        url: `https://shikho.com/qr?id=${qrId}`,
        status,
      }
      onSubmit(qrData)
      return
    }

    // Animated Video Lesson type - no isContentReady/fallback needed, chapter is optional, no program/phase
    if (qrType === "animated_video") {
      if (!mappings.length) {
        alert("Please add at least one destination mapping")
        return
      }
      for (const [idx, m] of mappings.entries()) {
        if (!m.classVal || !m.subject) {
          alert(`Please fill all required fields in Mapping #${idx + 1}`)
          return
        }
      }
      const qrId = editingQR?.id || (manualQrId?.trim() || `qrid_${Math.random().toString(36).substring(2, 11)}`)
      const mappingsWithNames = mappings.map((m) => {
        // Find chapter name from any phase (since chapters exist per phase)
        let chapterName = ""
        if (m.chapterId && m.chapterId !== "__none__") {
          for (const phase of data.phases) {
            const chapter = (data.chapters as any)[m.subject]?.[phase]?.find((c: any) => c.id === m.chapterId)
            if (chapter) {
              chapterName = chapter.name
              break
            }
          }
        }
        return {
          ...m,
          chapterName,
        }
      })
      const first = mappingsWithNames[0]
      const defaultName = first.chapterName 
        ? `[Animated Video] ${first.subject} - ${first.chapterName.substring(0, 30)}`
        : `[Animated Video] ${first.subject}`
      const qrData = {
        id: qrId,
        name: name || defaultName,
        qrType: "animated_video" as const,
        url: `https://shikho.com/qr?id=${qrId}`,
        mappings: mappingsWithNames,
        status,
      }
      onSubmit(qrData)
      return
    }

    // Lecture Class and Live Exam types with destination mappings
    if (qrType === "lecture_class" || qrType === "live_exam") {
      if (!mappings.length) {
        alert("Please add at least one destination mapping")
        return
      }
      for (const [idx, m] of mappings.entries()) {
        if (!m.classVal || !m.program || !m.phase || !m.subject || !m.chapterId) {
          alert(`Please fill all required fields in Mapping #${idx + 1}`)
          return
        }
        if (qrType === "lecture_class" && !m.lectureClassId) {
          alert(`Please select a Lecture Class in Mapping #${idx + 1}`)
          return
        }
        if (qrType === "live_exam" && !m.liveExamId) {
          alert(`Please provide a Live Exam ID in Mapping #${idx + 1}`)
          return
        }
        if (!m.isContentReady) {
          if (!m.fallbackClassVal || !m.fallbackProgram || !m.fallbackPhase || !m.fallbackChapterId) {
            alert(`Please complete fallback fields in Mapping #${idx + 1}`)
            return
          }
        }
      }
      const qrId = editingQR?.id || (manualQrId?.trim() || `qrid_${Math.random().toString(36).substring(2, 11)}`)
      const mappingsWithNames = mappings.map((m) => {
        const chapter = (data.chapters as any)[m.subject]?.[m.phase]?.find((c: any) => c.id === m.chapterId)
        const chapterName = chapter?.name || ""
        return {
          ...m,
          chapterName,
        }
      })
      const first = mappingsWithNames[0]
      const typeLabel = qrType === "lecture_class" ? "Lecture Class" : "Live Exam"
      const defaultName = `[${typeLabel}] ${first.subject} - ${first.chapterName.substring(0, 20)}...`
      const qrData = {
        id: qrId,
        name: name || defaultName,
        qrType: qrType as const,
        url: `https://shikho.com/qr?id=${qrId}`,
        lectureClassId: qrType === "lecture_class" ? mappingsWithNames[0].lectureClassId : undefined,
        liveExamId: qrType === "live_exam" ? mappingsWithNames[0].liveExamId : undefined,
        mappings: mappingsWithNames,
        status,
      }
      onSubmit(qrData)
      return
    }

    // Chapter type with multiple destination mappings
    if (!mappings.length) {
      alert("Please add at least one destination mapping")
      return
    }

    for (const [idx, m] of mappings.entries()) {
      if (!m.classVal || !m.program || !m.phase || !m.subject || !m.chapterId) {
        alert(`Please fill all required fields in Mapping #${idx + 1}`)
        return
      }
        if (!m.isContentReady) {
          if (!m.fallbackClassVal || !m.fallbackProgram || !m.fallbackPhase || !m.fallbackSubject || !m.fallbackChapterId) {
            alert(`Please complete all fallback fields in Mapping #${idx + 1}`)
            return
          }
          if (qrType === "lecture_class" && !m.fallbackLectureClassId) {
            alert(`Please select a Fallback Lecture Class in Mapping #${idx + 1}`)
            return
          }
          if (qrType === "live_exam" && !m.fallbackLiveExamId) {
            alert(`Please provide a Fallback Live Exam ID in Mapping #${idx + 1}`)
            return
          }
        }
      }

      const qrId = editingQR?.id || (manualQrId?.trim() || `qrid_${Math.random().toString(36).substring(2, 11)}`)

    const mappingsWithNames = mappings.map((m) => {
      const chapter = (data.chapters as any)[m.subject]?.[m.phase]?.find((c: any) => c.id === m.chapterId)
      const chapterName = chapter?.name || ""
      return {
        ...m,
        chapterName,
      }
    })

    const first = mappingsWithNames[0]
    const defaultName = `[${(first.classVal || "").toUpperCase()}] ${first.subject} - ${first.chapterName.substring(0, 20)}...`

    const qrData = {
      id: qrId,
      name: name || defaultName,
      qrType: "chapter" as const,
      url: `https://shikho.com/qr?id=${qrId}`,
      mappings: mappingsWithNames,
      status,
    }

    onSubmit(qrData)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{editingQR ? "Edit QR Code" : "Add New QR Code"}</SheetTitle>
          <SheetDescription>Configure the QR code destination and settings</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="qrid">QR ID <span className="text-red-500">*</span></Label>
            <Input id="qrid" value={manualQrId} onChange={(e) => setManualQrId(e.target.value)} placeholder="e.g., qrid_8f3b2a9c" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="qrType">QR Type <span className="text-red-500">*</span></Label>
            <Select value={qrType} onValueChange={(v: any) => {
              setQrType(v)
              setQuizId("")
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select QR Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chapter">Chapter</SelectItem>
                <SelectItem value="quiz">QR Quiz</SelectItem>
                <SelectItem value="lecture_class">Lecture Class</SelectItem>
                <SelectItem value="live_exam">Live Exam</SelectItem>
                <SelectItem value="animated_video">Animated Video Lesson</SelectItem>
                <SelectItem value="shikho_ai">Shikho AI</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Internal Name / Description <span className="text-red-500">*</span></Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., General Math - Ch. 1 Intro" />
          </div>
          {qrType === "quiz" && (
            <div className="space-y-2">
              <Label>QR Quiz <span className="text-red-500">*</span></Label>
              <Select value={selectedQuizId} onValueChange={(val) => setSelectedQuizId(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Search & Select QR Quiz" />
                </SelectTrigger>
                <SelectContent>
                  {quizDatabase.map((q: any) => (
                    <SelectItem key={q.id} value={q.id}>{q.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
            <Select value={status} onValueChange={(v: any) => setStatus(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Published">Published</SelectItem>
                <SelectItem value="Unpublished">Unpublished</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {qrType === "quiz" && (
            <div className="space-y-6">
              <Separator />
              

              <h4 className="font-semibold">Destination Mappings</h4>
              {quizMappings.map((m, idx) => (
                <div key={idx} className="space-y-4 border rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Mapping #{idx + 1}</div>
                    {quizMappings.length > 1 && (
                      <Button variant="outline" size="sm" onClick={() => setQuizMappings((prev) => prev.filter((_, i) => i !== idx))}>Remove</Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Program Class <span className="text-red-500">*</span></Label>
                    <ProgramClassSelect value={m.classVal} onChange={(val) => setQuizMappings((prev) => prev.map((pm, i) => (i === idx ? { ...pm, classVal: val } : pm)))} />
                  </div>

                  <div className="space-y-2">
                    <Label>Academic Program <span className="text-red-500">*</span></Label>
                    <Select
                      value={m.program}
                      onValueChange={(val) => setQuizMappings((prev) => prev.map((pm, i) => i === idx ? { ...pm, program: val } : pm))}
                      disabled={!m.classVal}
                    >
                      <SelectTrigger>
                    <SelectValue placeholder={m.classVal ? "Select Program" : "Select Class first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {m.classVal && data.academicPrograms[m.classVal as keyof typeof data.academicPrograms]?.map((prog) => (
                          <SelectItem key={prog} value={prog}>{prog}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
              <div>
                <Button variant="outline" onClick={() => setQuizMappings((prev) => [...prev, { classVal: "", program: "" }])}>+ Add Another Mapping</Button>
              </div>
            </div>
          )}
          {qrType === "chapter" && (
            <div className="space-y-6">
              <Separator />
              <h4 className="font-semibold">Destination Mappings</h4>

              {mappings.map((m, idx) => (
                <div key={idx} className="space-y-4 border rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Mapping #{idx + 1}</div>
                    {mappings.length > 1 && (
                      <Button variant="outline" size="sm" onClick={() => setMappings((prev) => prev.filter((_, i) => i !== idx))}>Remove</Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Program Class <span className="text-red-500">*</span></Label>
                    <ProgramClassSelect value={m.classVal} onChange={(val) => setMappings((prev) => prev.map((pm, i) => i === idx ? { ...pm, classVal: val, program: "", subject: "", phase: "", chapterId: "", fallbackClassVal: "", fallbackProgram: "", fallbackPhase: "", fallbackSubject: "", fallbackChapterId: "", fallbackLectureClassId: "", fallbackLiveExamId: "" } : pm))} />
                  </div>

                  <div className="space-y-2">
                    <Label>Academic Program <span className="text-red-500">*</span></Label>
                    <Select
                      value={m.program}
                      onValueChange={(val) => {
                        setMappings((prev) => prev.map((pm, i) => i === idx ? { ...pm, program: val, subject: "", chapterId: "" } : pm))
                      }}
                      disabled={!m.classVal || m.classVal === 'ssc' || m.classVal === 'hsc'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={m.classVal ? "Select Program" : "Select Class first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {m.classVal && m.classVal !== 'ssc' && m.classVal !== 'hsc' && data.academicPrograms[m.classVal as keyof typeof data.academicPrograms]?.map((prog) => (
                          <SelectItem key={prog} value={prog}>{prog}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Phase <span className="text-red-500">*</span></Label>
                    <Select
                      value={m.phase}
                      onValueChange={(val) => {
                        setMappings((prev) => prev.map((pm, i) => i === idx ? { ...pm, phase: val, chapterId: "" } : pm))
                      }}
                      disabled={!m.classVal}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={m.classVal ? "Select Phase" : "Select Class first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {m.classVal && data.phases.map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Subject <span className="text-red-500">*</span></Label>
                    <Select
                      value={m.subject}
                      onValueChange={(val) => {
                        setMappings((prev) => prev.map((pm, i) => i === idx ? { ...pm, subject: val, chapterId: "" } : pm))
                      }}
                      disabled={!m.program}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={m.program ? "Select Subject" : "Select Program first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {m.program && data.subjects[m.program as keyof typeof data.subjects]?.map((subj) => (
                          <SelectItem key={subj} value={subj}>{subj}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Chapter <span className="text-red-500">*</span></Label>
                    <Select
                      value={m.chapterId}
                      onValueChange={(val) => setMappings((prev) => prev.map((pm, i) => i === idx ? { ...pm, chapterId: val } : pm))}
                      disabled={!m.subject || !m.phase}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={m.subject && m.phase ? "Select Chapter" : "Select Subject & Phase first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {m.subject && m.phase && (data.chapters as any)[m.subject]?.[m.phase]?.map((ch: any) => (
                          <SelectItem key={ch.id} value={ch.id}>{ch.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Content Ready Status</Label>
                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={!!m.isContentReady}
                        onCheckedChange={(val) => setMappings((prev) => prev.map((pm, i) => i === idx ? { ...pm, isContentReady: val } : pm))}
                      />
                      <span className="text-sm">Is Target Content Ready?</span>
                    </div>
                    <p className="text-xs text-muted-foreground">When OFF, scans will redirect to fallback content</p>
                  </div>

                  {!m.isContentReady && (
                    <div className="space-y-2">
                      <Label className="font-semibold">Fallback Destination</Label>
                      
                      <Label>Fallback Class <span className="text-red-500">*</span></Label>
                      <ProgramClassSelect 
                        value={m.fallbackClassVal} 
                        onChange={(val) => setMappings((prev) => prev.map((pm, i) => i === idx ? { 
                          ...pm, 
                          fallbackClassVal: val, 
                          fallbackProgram: "", 
                          fallbackPhase: "", 
                          fallbackSubject: "",
                          fallbackChapterId: "",
                          fallbackLectureClassId: "",
                          fallbackLiveExamId: ""
                        } : pm))} 
                      />

                      <Label>Fallback Program <span className="text-red-500">*</span></Label>
                      <Select
                        value={m.fallbackProgram}
                        onValueChange={(val) => setMappings((prev) => prev.map((pm, i) => i === idx ? { 
                          ...pm, 
                          fallbackProgram: val, 
                          fallbackPhase: "", 
                          fallbackSubject: "",
                          fallbackChapterId: "",
                          fallbackLectureClassId: "",
                          fallbackLiveExamId: ""
                        } : pm))}
                        disabled={!m.fallbackClassVal || m.fallbackClassVal === 'ssc' || m.fallbackClassVal === 'hsc'}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={m.fallbackClassVal ? "Select Program" : "Select Class first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {m.fallbackClassVal && m.fallbackClassVal !== 'ssc' && m.fallbackClassVal !== 'hsc' && data.academicPrograms[m.fallbackClassVal as keyof typeof data.academicPrograms]?.map((prog) => (
                            <SelectItem key={prog} value={prog}>{prog}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="space-y-2 mt-2">
                        <Label>Fallback Phase <span className="text-red-500">*</span></Label>
                        <Select
                          value={m.fallbackPhase}
                          onValueChange={(val) => setMappings((prev) => prev.map((pm, i) => i === idx ? { 
                            ...pm, 
                            fallbackPhase: val, 
                            fallbackSubject: "",
                            fallbackChapterId: "",
                            fallbackLectureClassId: "",
                            fallbackLiveExamId: ""
                          } : pm))}
                          disabled={!m.fallbackClassVal}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={m.fallbackClassVal ? "Select Phase" : "Select Class first"} />
                          </SelectTrigger>
                          <SelectContent>
                            {m.fallbackClassVal && data.phases.map((p) => (
                              <SelectItem key={p} value={p}>{p}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 mt-2">
                        <Label>Fallback Subject <span className="text-red-500">*</span></Label>
                        <Select
                          value={m.fallbackSubject}
                          onValueChange={(val) => setMappings((prev) => prev.map((pm, i) => i === idx ? { 
                            ...pm, 
                            fallbackSubject: val, 
                            fallbackChapterId: "",
                            fallbackLectureClassId: "",
                            fallbackLiveExamId: ""
                          } : pm))}
                          disabled={!m.fallbackProgram}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={m.fallbackProgram ? "Select Subject" : "Select Program first"} />
                          </SelectTrigger>
                          <SelectContent>
                            {m.fallbackProgram && data.subjects[m.fallbackProgram as keyof typeof data.subjects]?.map((subj) => (
                              <SelectItem key={subj} value={subj}>{subj}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 mt-2">
                        <Label>Fallback Chapter <span className="text-red-500">*</span></Label>
                        <Select
                          value={m.fallbackChapterId}
                          onValueChange={(val) => setMappings((prev) => prev.map((pm, i) => i === idx ? { 
                            ...pm, 
                            fallbackChapterId: val,
                            fallbackLectureClassId: "",
                            fallbackLiveExamId: ""
                          } : pm))}
                          disabled={!m.fallbackSubject || !m.fallbackPhase}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={m.fallbackSubject && m.fallbackPhase ? "Select Chapter" : "Select Subject & Phase first"} />
                          </SelectTrigger>
                          <SelectContent>
                            {m.fallbackSubject && m.fallbackPhase && (data.chapters as any)[m.fallbackSubject]?.[m.fallbackPhase]?.map((ch: any) => (
                              <SelectItem key={ch.id} value={ch.id}>{ch.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setMappings((prev) => {
                      const last = prev[prev.length - 1]
                      return [
                        ...prev,
                        {
                          classVal: "",
                          phase: last?.phase || "",
                          program: last?.program || "",
                          subject: last?.subject || "",
                          chapterId: "",
                          lectureClassId: "",
                          liveExamId: "",
                          isContentReady: false,
                          fallbackClassVal: "",
                          fallbackProgram: "",
                          fallbackPhase: "",
                          fallbackSubject: "",
                          fallbackChapterId: "",
                          fallbackLectureClassId: "",
                          fallbackLiveExamId: "",
                        },
                      ]
                    })
                  }}
                >
                  + Add Another Mapping
                </Button>
              </div>
            </div>
          )}

          {/* Shikho AI - No destination mapping needed */}
          {qrType === "shikho_ai" && (
            <div className="space-y-4">
              <Separator />
              <p className="text-sm text-muted-foreground">
                This QR code will redirect users to the Shikho AI main screen. No destination mapping is required.
              </p>
            </div>
          )}

          {/* Animated Video Lesson - Class, Subject, Chapter (Optional) - No Program/Phase */}
          {(qrType === "animated_video") && (
            <div className="space-y-6">
              <Separator />
              <h4 className="font-semibold">Destination Mappings</h4>

              {mappings.map((m, idx) => (
                <div key={idx} className="space-y-4 border rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Mapping #{idx + 1}</div>
                    {mappings.length > 1 && (
                      <Button variant="outline" size="sm" onClick={() => setMappings((prev) => prev.filter((_, i) => i !== idx))}>Remove</Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Program Class <span className="text-red-500">*</span></Label>
                    <ProgramClassSelect value={m.classVal} onChange={(val) => setMappings((prev) => prev.map((pm, i) => i === idx ? { ...pm, classVal: val, subject: "", chapterId: "" } : pm))} />
                  </div>

                  <div className="space-y-2">
                    <Label>Subject <span className="text-red-500">*</span></Label>
                    <Select
                      value={m.subject}
                      onValueChange={(val) => {
                        setMappings((prev) => prev.map((pm, i) => i === idx ? { ...pm, subject: val, chapterId: "" } : pm))
                      }}
                      disabled={!m.classVal}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={m.classVal ? "Select Subject" : "Select Class first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Show all subjects regardless of program */}
                        {m.classVal && Array.from(new Set(Object.values(data.subjects).flat())).map((subj) => (
                          <SelectItem key={subj} value={subj}>{subj}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Chapter (Optional)</Label>
                    <Select
                      value={m.chapterId || "__none__"}
                      onValueChange={(val) => setMappings((prev) => prev.map((pm, i) => i === idx ? { ...pm, chapterId: val === "__none__" ? "" : val } : pm))}
                      disabled={!m.subject}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={m.subject ? "Select Chapter (optional)" : "Select Subject first"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">None (Redirect to Subject)</SelectItem>
                        {m.subject && (() => {
                          // Collect all chapters from all phases for this subject
                          const allChapters: Array<{id: string, name: string}> = []
                          data.phases.forEach((phase) => {
                            const phaseChapters = (data.chapters as any)[m.subject]?.[phase] || []
                            phaseChapters.forEach((ch: any) => {
                              if (!allChapters.find(c => c.id === ch.id)) {
                                allChapters.push(ch)
                              }
                            })
                          })
                          return allChapters.map((ch) => (
                            <SelectItem key={ch.id} value={ch.id}>{ch.name}</SelectItem>
                          ))
                        })()}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Lecture Class - Class, Program, Phase, Subject, Chapter, Lecture Class */}
          {(qrType === "lecture_class") && (
            <div className="space-y-6">
              <Separator />
              <h4 className="font-semibold">Destination Mappings</h4>

              {mappings.map((m, idx) => (
                <div key={idx} className="space-y-4 border rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Mapping #{idx + 1}</div>
                    {mappings.length > 1 && (
                      <Button variant="outline" size="sm" onClick={() => setMappings((prev) => prev.filter((_, i) => i !== idx))}>Remove</Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Program Class <span className="text-red-500">*</span></Label>
                    <ProgramClassSelect value={m.classVal} onChange={(val) => setMappings((prev) => prev.map((pm, i) => i === idx ? { ...pm, classVal: val, program: "", subject: "", phase: "", chapterId: "", lectureClassId: "", fallbackProgram: "", fallbackPhase: "", fallbackChapterId: "" } : pm))} />
                  </div>

                  <div className="space-y-2">
                    <Label>Academic Program <span className="text-red-500">*</span></Label>
                    <Select
                      value={m.program}
                      onValueChange={(val) => {
                        setMappings((prev) => prev.map((pm, i) => i === idx ? { ...pm, program: val, subject: "", chapterId: "", lectureClassId: "" } : pm))
                      }}
                      disabled={!m.classVal || m.classVal === 'ssc' || m.classVal === 'hsc'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={m.classVal ? "Select Program" : "Select Class first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {m.classVal && m.classVal !== 'ssc' && m.classVal !== 'hsc' && data.academicPrograms[m.classVal as keyof typeof data.academicPrograms]?.map((prog) => (
                          <SelectItem key={prog} value={prog}>{prog}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Phase <span className="text-red-500">*</span></Label>
                    <Select
                      value={m.phase}
                      onValueChange={(val) => {
                        setMappings((prev) => prev.map((pm, i) => i === idx ? { ...pm, phase: val, chapterId: "", lectureClassId: "" } : pm))
                      }}
                      disabled={!m.classVal}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={m.classVal ? "Select Phase" : "Select Class first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {m.classVal && data.phases.map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Subject <span className="text-red-500">*</span></Label>
                    <Select
                      value={m.subject}
                      onValueChange={(val) => {
                        setMappings((prev) => prev.map((pm, i) => i === idx ? { ...pm, subject: val, chapterId: "", lectureClassId: "" } : pm))
                      }}
                      disabled={!m.program}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={m.program ? "Select Subject" : "Select Program first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {m.program && data.subjects[m.program as keyof typeof data.subjects]?.map((subj) => (
                          <SelectItem key={subj} value={subj}>{subj}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Chapter <span className="text-red-500">*</span></Label>
                    <Select
                      value={m.chapterId}
                      onValueChange={(val) => setMappings((prev) => prev.map((pm, i) => i === idx ? { ...pm, chapterId: val, lectureClassId: "" } : pm))}
                      disabled={!m.subject || !m.phase}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={m.subject && m.phase ? "Select Chapter" : "Select Subject & Phase first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {m.subject && m.phase && (data.chapters as any)[m.subject]?.[m.phase]?.map((ch: any) => (
                          <SelectItem key={ch.id} value={ch.id}>{ch.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Lecture Class <span className="text-red-500">*</span></Label>
                    <Select
                      value={m.lectureClassId}
                      onValueChange={(val) => setMappings((prev) => prev.map((pm, i) => i === idx ? { ...pm, lectureClassId: val } : pm))}
                      disabled={!m.subject || !m.phase || !m.chapterId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={m.subject && m.phase && m.chapterId ? "Select Lecture Class" : "Select Chapter first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {m.subject && m.phase && m.chapterId && (data.lectureClasses as any)[m.subject]?.[m.phase]?.[m.chapterId]?.map((lec: any) => (
                          <SelectItem key={lec.id} value={lec.id}>{lec.name}</SelectItem>
                        ))}
                        {m.subject && m.phase && m.chapterId && (!(data.lectureClasses as any)[m.subject]?.[m.phase]?.[m.chapterId] || (data.lectureClasses as any)[m.subject]?.[m.phase]?.[m.chapterId]?.length === 0) && (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">No lecture classes available</div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Content Ready Status</Label>
                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={!!m.isContentReady}
                        onCheckedChange={(val) => setMappings((prev) => prev.map((pm, i) => i === idx ? { ...pm, isContentReady: val } : pm))}
                      />
                      <span className="text-sm">Is Target Content Ready?</span>
                    </div>
                    <p className="text-xs text-muted-foreground">When OFF, scans will redirect to fallback content</p>
                  </div>

                  {!m.isContentReady && (
                    <div className="space-y-2">
                      <Label className="font-semibold">Fallback Destination</Label>
                      
                      <Label>Fallback Class <span className="text-red-500">*</span></Label>
                      <ProgramClassSelect 
                        value={m.fallbackClassVal} 
                        onChange={(val) => setMappings((prev) => prev.map((pm, i) => i === idx ? { 
                          ...pm, 
                          fallbackClassVal: val, 
                          fallbackProgram: "", 
                          fallbackPhase: "", 
                          fallbackSubject: "",
                          fallbackChapterId: "",
                          fallbackLectureClassId: "",
                          fallbackLiveExamId: ""
                        } : pm))} 
                      />

                      <Label>Fallback Program <span className="text-red-500">*</span></Label>
                      <Select
                        value={m.fallbackProgram}
                        onValueChange={(val) => setMappings((prev) => prev.map((pm, i) => i === idx ? { 
                          ...pm, 
                          fallbackProgram: val, 
                          fallbackPhase: "", 
                          fallbackSubject: "",
                          fallbackChapterId: "",
                          fallbackLectureClassId: "",
                          fallbackLiveExamId: ""
                        } : pm))}
                        disabled={!m.fallbackClassVal || m.fallbackClassVal === 'ssc' || m.fallbackClassVal === 'hsc'}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={m.fallbackClassVal ? "Select Program" : "Select Class first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {m.fallbackClassVal && m.fallbackClassVal !== 'ssc' && m.fallbackClassVal !== 'hsc' && data.academicPrograms[m.fallbackClassVal as keyof typeof data.academicPrograms]?.map((prog) => (
                            <SelectItem key={prog} value={prog}>{prog}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="space-y-2 mt-2">
                        <Label>Fallback Phase <span className="text-red-500">*</span></Label>
                        <Select
                          value={m.fallbackPhase}
                          onValueChange={(val) => setMappings((prev) => prev.map((pm, i) => i === idx ? { 
                            ...pm, 
                            fallbackPhase: val, 
                            fallbackSubject: "",
                            fallbackChapterId: "",
                            fallbackLectureClassId: "",
                            fallbackLiveExamId: ""
                          } : pm))}
                          disabled={!m.fallbackClassVal}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={m.fallbackClassVal ? "Select Phase" : "Select Class first"} />
                          </SelectTrigger>
                          <SelectContent>
                            {m.fallbackClassVal && data.phases.map((p) => (
                              <SelectItem key={p} value={p}>{p}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 mt-2">
                        <Label>Fallback Subject <span className="text-red-500">*</span></Label>
                        <Select
                          value={m.fallbackSubject}
                          onValueChange={(val) => setMappings((prev) => prev.map((pm, i) => i === idx ? { 
                            ...pm, 
                            fallbackSubject: val, 
                            fallbackChapterId: "",
                            fallbackLectureClassId: "",
                            fallbackLiveExamId: ""
                          } : pm))}
                          disabled={!m.fallbackProgram}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={m.fallbackProgram ? "Select Subject" : "Select Program first"} />
                          </SelectTrigger>
                          <SelectContent>
                            {m.fallbackProgram && data.subjects[m.fallbackProgram as keyof typeof data.subjects]?.map((subj) => (
                              <SelectItem key={subj} value={subj}>{subj}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 mt-2">
                        <Label>Fallback Chapter <span className="text-red-500">*</span></Label>
                        <Select
                          value={m.fallbackChapterId}
                          onValueChange={(val) => setMappings((prev) => prev.map((pm, i) => i === idx ? { 
                            ...pm, 
                            fallbackChapterId: val,
                            fallbackLectureClassId: "",
                            fallbackLiveExamId: ""
                          } : pm))}
                          disabled={!m.fallbackSubject || !m.fallbackPhase}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={m.fallbackSubject && m.fallbackPhase ? "Select Chapter" : "Select Subject & Phase first"} />
                          </SelectTrigger>
                          <SelectContent>
                            {m.fallbackSubject && m.fallbackPhase && (data.chapters as any)[m.fallbackSubject]?.[m.fallbackPhase]?.map((ch: any) => (
                              <SelectItem key={ch.id} value={ch.id}>{ch.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Fallback Lecture Class (for Lecture Class QR type) */}
                      {qrType === "lecture_class" && (
                        <div className="space-y-2 mt-2">
                          <Label>Fallback Lecture Class <span className="text-red-500">*</span></Label>
                          <Select
                            value={m.fallbackLectureClassId}
                            onValueChange={(val) => setMappings((prev) => prev.map((pm, i) => i === idx ? { ...pm, fallbackLectureClassId: val } : pm))}
                            disabled={!m.fallbackSubject || !m.fallbackPhase || !m.fallbackChapterId}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={m.fallbackSubject && m.fallbackPhase && m.fallbackChapterId ? "Select Lecture Class" : "Select Chapter first"} />
                            </SelectTrigger>
                            <SelectContent>
                              {m.fallbackSubject && m.fallbackPhase && m.fallbackChapterId && (data.lectureClasses as any)[m.fallbackSubject]?.[m.fallbackPhase]?.[m.fallbackChapterId]?.map((lec: any) => (
                                <SelectItem key={lec.id} value={lec.id}>{lec.name}</SelectItem>
                              ))}
                              {m.fallbackSubject && m.fallbackPhase && m.fallbackChapterId && (!(data.lectureClasses as any)[m.fallbackSubject]?.[m.fallbackPhase]?.[m.fallbackChapterId] || (data.lectureClasses as any)[m.fallbackSubject]?.[m.fallbackPhase]?.[m.fallbackChapterId]?.length === 0) && (
                                <div className="px-2 py-1.5 text-sm text-muted-foreground">No lecture classes available</div>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              <div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setMappings((prev) => {
                      const last = prev[prev.length - 1]
                      return [
                        ...prev,
                        {
                          classVal: "",
                          phase: last?.phase || "",
                          program: last?.program || "",
                          subject: last?.subject || "",
                          chapterId: "",
                          lectureClassId: "",
                          isContentReady: false,
                          fallbackClassVal: "",
                          fallbackProgram: "",
                          fallbackPhase: "",
                          fallbackSubject: "",
                          fallbackChapterId: "",
                          fallbackLectureClassId: "",
                          fallbackLiveExamId: "",
                        },
                      ]
                    })
                  }}
                >
                  + Add Another Mapping
                </Button>
              </div>
            </div>
          )}

          {/* Live Exam - Class, Program, Phase, Subject, Chapter, Live Exam ID */}
          {(qrType === "live_exam") && (
            <div className="space-y-6">
              <Separator />
              <h4 className="font-semibold">Destination Mappings</h4>

              {mappings.map((m, idx) => (
                <div key={idx} className="space-y-4 border rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Mapping #{idx + 1}</div>
                    {mappings.length > 1 && (
                      <Button variant="outline" size="sm" onClick={() => setMappings((prev) => prev.filter((_, i) => i !== idx))}>Remove</Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Program Class <span className="text-red-500">*</span></Label>
                    <ProgramClassSelect value={m.classVal} onChange={(val) => setMappings((prev) => prev.map((pm, i) => i === idx ? { ...pm, classVal: val, program: "", subject: "", phase: "", chapterId: "", liveExamId: "", fallbackClassVal: "", fallbackProgram: "", fallbackPhase: "", fallbackSubject: "", fallbackChapterId: "", fallbackLectureClassId: "", fallbackLiveExamId: "" } : pm))} />
                  </div>

                  <div className="space-y-2">
                    <Label>Academic Program <span className="text-red-500">*</span></Label>
                    <Select
                      value={m.program}
                      onValueChange={(val) => {
                        setMappings((prev) => prev.map((pm, i) => i === idx ? { ...pm, program: val, subject: "", chapterId: "", liveExamId: "" } : pm))
                      }}
                      disabled={!m.classVal || m.classVal === 'ssc' || m.classVal === 'hsc'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={m.classVal ? "Select Program" : "Select Class first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {m.classVal && m.classVal !== 'ssc' && m.classVal !== 'hsc' && data.academicPrograms[m.classVal as keyof typeof data.academicPrograms]?.map((prog) => (
                          <SelectItem key={prog} value={prog}>{prog}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Phase <span className="text-red-500">*</span></Label>
                    <Select
                      value={m.phase}
                      onValueChange={(val) => {
                        setMappings((prev) => prev.map((pm, i) => i === idx ? { ...pm, phase: val, chapterId: "", liveExamId: "" } : pm))
                      }}
                      disabled={!m.classVal}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={m.classVal ? "Select Phase" : "Select Class first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {m.classVal && data.phases.map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Subject <span className="text-red-500">*</span></Label>
                    <Select
                      value={m.subject}
                      onValueChange={(val) => {
                        setMappings((prev) => prev.map((pm, i) => i === idx ? { ...pm, subject: val, chapterId: "", liveExamId: "" } : pm))
                      }}
                      disabled={!m.program}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={m.program ? "Select Subject" : "Select Program first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {m.program && data.subjects[m.program as keyof typeof data.subjects]?.map((subj) => (
                          <SelectItem key={subj} value={subj}>{subj}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Chapter <span className="text-red-500">*</span></Label>
                    <Select
                      value={m.chapterId}
                      onValueChange={(val) => setMappings((prev) => prev.map((pm, i) => i === idx ? { ...pm, chapterId: val, liveExamId: "" } : pm))}
                      disabled={!m.subject || !m.phase}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={m.subject && m.phase ? "Select Chapter" : "Select Subject & Phase first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {m.subject && m.phase && (data.chapters as any)[m.subject]?.[m.phase]?.map((ch: any) => (
                          <SelectItem key={ch.id} value={ch.id}>{ch.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Live Exam ID <span className="text-red-500">*</span></Label>
                    <Input
                      value={m.liveExamId}
                      onChange={(e) => setMappings((prev) => prev.map((pm, i) => i === idx ? { ...pm, liveExamId: e.target.value } : pm))}
                      placeholder="e.g., exam_12345"
                      disabled={!m.chapterId}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Content Ready Status</Label>
                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={!!m.isContentReady}
                        onCheckedChange={(val) => setMappings((prev) => prev.map((pm, i) => i === idx ? { ...pm, isContentReady: val } : pm))}
                      />
                      <span className="text-sm">Is Target Content Ready?</span>
                    </div>
                    <p className="text-xs text-muted-foreground">When OFF, scans will redirect to fallback content</p>
                  </div>

                  {!m.isContentReady && (
                    <div className="space-y-2">
                      <Label className="font-semibold">Fallback Destination</Label>
                      
                      <Label>Fallback Class <span className="text-red-500">*</span></Label>
                      <ProgramClassSelect 
                        value={m.fallbackClassVal} 
                        onChange={(val) => setMappings((prev) => prev.map((pm, i) => i === idx ? { 
                          ...pm, 
                          fallbackClassVal: val, 
                          fallbackProgram: "", 
                          fallbackPhase: "", 
                          fallbackSubject: "",
                          fallbackChapterId: "",
                          fallbackLectureClassId: "",
                          fallbackLiveExamId: ""
                        } : pm))} 
                      />

                      <Label>Fallback Program <span className="text-red-500">*</span></Label>
                      <Select
                        value={m.fallbackProgram}
                        onValueChange={(val) => setMappings((prev) => prev.map((pm, i) => i === idx ? { 
                          ...pm, 
                          fallbackProgram: val, 
                          fallbackPhase: "", 
                          fallbackSubject: "",
                          fallbackChapterId: "",
                          fallbackLectureClassId: "",
                          fallbackLiveExamId: ""
                        } : pm))}
                        disabled={!m.fallbackClassVal || m.fallbackClassVal === 'ssc' || m.fallbackClassVal === 'hsc'}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={m.fallbackClassVal ? "Select Program" : "Select Class first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {m.fallbackClassVal && m.fallbackClassVal !== 'ssc' && m.fallbackClassVal !== 'hsc' && data.academicPrograms[m.fallbackClassVal as keyof typeof data.academicPrograms]?.map((prog) => (
                            <SelectItem key={prog} value={prog}>{prog}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="space-y-2 mt-2">
                        <Label>Fallback Phase <span className="text-red-500">*</span></Label>
                        <Select
                          value={m.fallbackPhase}
                          onValueChange={(val) => setMappings((prev) => prev.map((pm, i) => i === idx ? { 
                            ...pm, 
                            fallbackPhase: val, 
                            fallbackSubject: "",
                            fallbackChapterId: "",
                            fallbackLectureClassId: "",
                            fallbackLiveExamId: ""
                          } : pm))}
                          disabled={!m.fallbackClassVal}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={m.fallbackClassVal ? "Select Phase" : "Select Class first"} />
                          </SelectTrigger>
                          <SelectContent>
                            {m.fallbackClassVal && data.phases.map((p) => (
                              <SelectItem key={p} value={p}>{p}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 mt-2">
                        <Label>Fallback Subject <span className="text-red-500">*</span></Label>
                        <Select
                          value={m.fallbackSubject}
                          onValueChange={(val) => setMappings((prev) => prev.map((pm, i) => i === idx ? { 
                            ...pm, 
                            fallbackSubject: val, 
                            fallbackChapterId: "",
                            fallbackLectureClassId: "",
                            fallbackLiveExamId: ""
                          } : pm))}
                          disabled={!m.fallbackProgram}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={m.fallbackProgram ? "Select Subject" : "Select Program first"} />
                          </SelectTrigger>
                          <SelectContent>
                            {m.fallbackProgram && data.subjects[m.fallbackProgram as keyof typeof data.subjects]?.map((subj) => (
                              <SelectItem key={subj} value={subj}>{subj}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 mt-2">
                        <Label>Fallback Chapter <span className="text-red-500">*</span></Label>
                        <Select
                          value={m.fallbackChapterId}
                          onValueChange={(val) => setMappings((prev) => prev.map((pm, i) => i === idx ? { 
                            ...pm, 
                            fallbackChapterId: val,
                            fallbackLectureClassId: "",
                            fallbackLiveExamId: ""
                          } : pm))}
                          disabled={!m.fallbackSubject || !m.fallbackPhase}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={m.fallbackSubject && m.fallbackPhase ? "Select Chapter" : "Select Subject & Phase first"} />
                          </SelectTrigger>
                          <SelectContent>
                            {m.fallbackSubject && m.fallbackPhase && (data.chapters as any)[m.fallbackSubject]?.[m.fallbackPhase]?.map((ch: any) => (
                              <SelectItem key={ch.id} value={ch.id}>{ch.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Fallback Live Exam ID (for Live Exam QR type) */}
                      {qrType === "live_exam" && (
                        <div className="space-y-2 mt-2">
                          <Label>Fallback Live Exam ID <span className="text-red-500">*</span></Label>
                          <Input
                            value={m.fallbackLiveExamId}
                            onChange={(e) => setMappings((prev) => prev.map((pm, i) => i === idx ? { ...pm, fallbackLiveExamId: e.target.value } : pm))}
                            placeholder="e.g., exam_12345"
                            disabled={!m.fallbackChapterId}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              <div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setMappings((prev) => {
                      const last = prev[prev.length - 1]
                      return [
                        ...prev,
                        {
                          classVal: "",
                          phase: last?.phase || "",
                          program: last?.program || "",
                          subject: last?.subject || "",
                          chapterId: "",
                          liveExamId: "",
                          isContentReady: false,
                          fallbackClassVal: "",
                          fallbackProgram: "",
                          fallbackPhase: "",
                          fallbackSubject: "",
                          fallbackChapterId: "",
                          fallbackLectureClassId: "",
                          fallbackLiveExamId: "",
                        },
                      ]
                    })
                  }}
                >
                  + Add Another Mapping
                </Button>
              </div>
            </div>
          )}
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-purple-600 hover:bg-purple-700">
            {editingQR ? "Save" : "Save & Generate QR"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
