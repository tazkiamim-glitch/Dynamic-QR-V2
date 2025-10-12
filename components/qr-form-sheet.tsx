"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

const data = {
  phases: ["Quarter 1", "Quarter 2", "Quarter 3", "Quarter 4"],
  academicPrograms: {
    c9: ["SSC - AP 2026", "SSC - AP 2025"],
    c10: ["SSC - AP 2025"],
  },
  subjects: {
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
      ],
      "Quarter 2": [
        { id: "ch1", name: "অধ্যায় ০৩ - বল ও নিউটনের সূত্র" },
        { id: "ch2", name: "অধ্যায় ০৪ - কাজ ও শক্তি" },
      ],
      "Quarter 3": [
        { id: "ch1", name: "অধ্যায় ০৫ - তাপ ও তাপগতিবিদ্যা" },
        { id: "ch2", name: "অধ্যায় ০৬ - তরঙ্গ ও শব্দ" },
      ],
      "Quarter 4": [
        { id: "ch1", name: "অধ্যায় ০৭ - আলোকবিজ্ঞান" },
        { id: "ch2", name: "অধ্যায় ০৮ - বিদ্যুৎ ও চৌম্বকত্ব" },
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
}

interface QRFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
  editingQR: any
  quizDatabase?: any[]
}

export default function QRFormSheet({ open, onOpenChange, onSubmit, editingQR, quizDatabase = [] }: QRFormSheetProps) {
  const [qrType, setQrType] = useState<"chapter" | "quiz">("chapter")
  const [classVal, setClassVal] = useState("")
  const [phase, setPhase] = useState("")
  const [program, setProgram] = useState("")
  const [subject, setSubject] = useState("")
  const [chapterId, setChapterId] = useState("")
  const [quizId, setQuizId] = useState("")
  const [isContentReady, setIsContentReady] = useState(false)

  // Fallback mapping (visible when content is NOT ready)
  const [fallbackClass, setFallbackClass] = useState("")
  const [fallbackPhase, setFallbackPhase] = useState("")
  const [fallbackProgram, setFallbackProgram] = useState("")
  const [fallbackSubject, setFallbackSubject] = useState("")
  const [fallbackChapterId, setFallbackChapterId] = useState("")

  useEffect(() => {
    if (editingQR) {
      // Maintain backwards compatibility with existing records
      setClassVal(editingQR.class)
      setPhase(editingQR.phase || "")
      setProgram(editingQR.program)
      setSubject(editingQR.subject)
      setQrType(editingQR.qrType === "quiz" ? "quiz" : "chapter")
      setChapterId(editingQR.chapterId || "")
      setQuizId(editingQR.quizId || "")
      setIsContentReady(!!editingQR.isContentReady)
      // Prefill fallback mapping when present
      if (editingQR.fallback) {
        setFallbackClass(editingQR.fallback.class || "")
        setFallbackPhase(editingQR.fallback.phase || "")
        setFallbackProgram(editingQR.fallback.program || "")
        setFallbackSubject(editingQR.fallback.subject || "")
        setFallbackChapterId(editingQR.fallback.chapterId || "")
      } else {
        setFallbackClass("")
        setFallbackPhase("")
        setFallbackProgram("")
        setFallbackSubject("")
        setFallbackChapterId("")
      }
    } else {
      setClassVal("")
      setPhase("")
      setProgram("")
      setSubject("")
      setChapterId("")
      setQuizId("")
      setIsContentReady(false)
    }
  }, [editingQR, open])

  // QR type supports only Chapter and QR Quiz

  const handleSubmit = () => {
    if (qrType === "chapter") {
      if (!classVal || !program || !subject || !chapterId) {
        alert("Please fill all required fields")
        return
      }
    } else {
      if (!quizId) {
        alert("Please select a QR Quiz")
        return
      }
    }

    const qrId = editingQR?.id || `qrid_${Math.random().toString(36).substring(2, 11)}`

    let chapterNameStr = ""
    let chapterIdToSave = ""
    if (qrType === "chapter") {
      const chapter = (data.chapters as any)[subject]?.[phase]?.find((c: any) => c.id === chapterId)
      chapterNameStr = chapter?.name || ""
      chapterIdToSave = chapterId
    } else {
      const q = quizDatabase.find((qq: any) => qq.id === quizId)
      chapterNameStr = q?.chapterName || ""
      chapterIdToSave = q?.chapterId || ""
    }

    const qrData = {
      id: qrId,
      name:
        qrType === "chapter"
          ? `[${classVal.toUpperCase()}] ${subject} - ${chapterNameStr.substring(0, 20)}...`
          : `QR Quiz - ${quizDatabase.find((qq: any) => qq.id === quizId)?.name || "Untitled"}`,
      qrType,
      phase,
      class: classVal,
      program: program,
      subject: subject,
      chapterId: chapterIdToSave,
      chapterName: chapterNameStr,
      isContentReady: qrType === "chapter" ? isContentReady : true,
      url: `https://shikho.com/qr?id=${qrId}`,
      fallback:
        qrType === "chapter" && !isContentReady
          ? {
              class: fallbackClass,
              phase: fallbackPhase,
              program: fallbackProgram,
              subject: fallbackSubject,
              chapterId: fallbackChapterId,
            }
          : undefined,
      quizId: qrType === "quiz" ? quizId : undefined,
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
            <Label htmlFor="qrType">
              QR Type <span className="text-red-500">*</span>
            </Label>
            <Select value={qrType} onValueChange={(v: "chapter" | "quiz") => {
              setQrType(v)
              // Reset downstream choices when switching type
              setQuizId("")
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chapter">Chapter</SelectItem>
                <SelectItem value="quiz">QR Quiz</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <h4 className="font-semibold">Target Destination</h4>

          <div className="space-y-2">
            <Label htmlFor="class">
              Class <span className="text-red-500">*</span>
            </Label>
            <Select
              value={classVal}
              onValueChange={(val) => {
                setClassVal(val)
                setPhase("")
                setProgram("")
                setSubject("")
                setChapterId("")
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="c9">Class 9</SelectItem>
                <SelectItem value="c10">Class 10</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Academic Program moved before Phase */}
          <div className="space-y-2">
            <Label htmlFor="program">
              Academic Program <span className="text-red-500">*</span>
            </Label>
            <Select
              value={program}
              onValueChange={(val) => {
                setProgram(val)
                setSubject("")
                setChapterId("")
              }}
              disabled={!classVal}
            >
              <SelectTrigger>
                <SelectValue placeholder={classVal ? "Select Program" : "Select Class first"} />
              </SelectTrigger>
              <SelectContent>
                {classVal &&
                  data.academicPrograms[classVal as keyof typeof data.academicPrograms]?.map((prog) => (
                    <SelectItem key={prog} value={prog}>
                      {prog}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phase">
              Phase <span className="text-red-500">*</span>
            </Label>
            <Select
              value={phase}
              onValueChange={(val) => {
                setPhase(val)
                setChapterId("")
                setRelatedChapterId("")
                setExamName("")
              }}
              disabled={!classVal}
            >
              <SelectTrigger>
                <SelectValue placeholder={classVal ? "Select Phase" : "Select Class first"} />
              </SelectTrigger>
              <SelectContent>
                {classVal &&
                  data.phases.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">
              Subject <span className="text-red-500">*</span>
            </Label>
            <Select
              value={subject}
              onValueChange={(val) => {
                setSubject(val)
                setChapterId("")
              }}
              disabled={!program}
            >
              <SelectTrigger>
                <SelectValue placeholder={program ? "Select Subject" : "Select Program first"} />
              </SelectTrigger>
              <SelectContent>
                {program &&
                  data.subjects[program as keyof typeof data.subjects]?.map((subj) => (
                    <SelectItem key={subj} value={subj}>
                      {subj}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {qrType === "chapter" && (
            <div className="space-y-2">
              <Label htmlFor="chapter">
                Chapter <span className="text-red-500">*</span>
              </Label>
              <Select value={chapterId} onValueChange={setChapterId} disabled={!subject || !phase}>
                <SelectTrigger>
                  <SelectValue placeholder={subject && phase ? "Select Chapter" : "Select Subject & Phase first"} />
                </SelectTrigger>
                <SelectContent>
                  {subject && phase &&
                    (data.chapters as any)[subject]?.[phase]?.map((ch: any) => (
                      <SelectItem key={ch.id} value={ch.id}>
                        {ch.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Exam type removed */}

          {qrType === "quiz" && (
            <div className="space-y-2">
              <Label htmlFor="quiz">
                Select QR Quiz <span className="text-red-500">*</span>
              </Label>
              <Select value={quizId} onValueChange={setQuizId}>
                <SelectTrigger>
                  <SelectValue placeholder={quizDatabase.length ? "Search & select quiz" : "No quizzes yet. Create in QR Quiz Builder"} />
                </SelectTrigger>
                <SelectContent>
                  {quizDatabase.map((q: any) => (
                    <SelectItem key={q.id} value={q.id}>
                      {q.name} — {q.program} › {q.subject} › {q.chapterName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {qrType === "chapter" && (
            <>
              <Separator />

              <div className="space-y-2">
                <Label>Content Ready Status</Label>
                <div className="flex items-center space-x-3">
                  <Switch checked={isContentReady} onCheckedChange={setIsContentReady} />
                  <span className="text-sm">Is Target Content Ready?</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  When OFF, scans will redirect to fallback content (SSC - AP 2025 Complimentary)
                </p>
              </div>
            </>
          )}

          {qrType === "chapter" && !isContentReady && (
            <div className="space-y-6">
              <Separator />
              <h4 className="font-semibold">Fallback Destination Mapping</h4>

              <div className="space-y-2">
                <Label htmlFor="fallbackClass">
                  Class <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={fallbackClass}
                  onValueChange={(v) => {
                    setFallbackClass(v)
                    setFallbackPhase("")
                    setFallbackProgram("")
                    setFallbackSubject("")
                    setFallbackChapterId("")
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="c9">Class 9</SelectItem>
                    <SelectItem value="c10">Class 10</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fallbackPhase">
                  Phase <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={fallbackPhase}
                  onValueChange={(v) => {
                    setFallbackPhase(v)
                    setFallbackChapterId("")
                  }}
                  disabled={!fallbackClass}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={fallbackClass ? "Select Phase" : "Select Class first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {fallbackClass &&
                      data.phases.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fallbackProgram">
                  Fallback Program <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={fallbackProgram}
                  onValueChange={(v) => {
                    setFallbackProgram(v)
                    setFallbackSubject("")
                    setFallbackChapterId("")
                  }}
                  disabled={!fallbackClass}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={fallbackClass ? "Select Program" : "Select Class first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {fallbackClass &&
                      data.academicPrograms[fallbackClass as keyof typeof data.academicPrograms]?.map((prog) => (
                        <SelectItem key={prog} value={prog}>
                          {prog}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fallbackSubject">
                  Fallback Subject <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={fallbackSubject}
                  onValueChange={(v) => {
                    setFallbackSubject(v)
                    setFallbackChapterId("")
                  }}
                  disabled={!fallbackProgram}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={fallbackProgram ? "Select Subject" : "Select Program first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {fallbackProgram &&
                      data.subjects[fallbackProgram as keyof typeof data.subjects]?.map((subj) => (
                        <SelectItem key={subj} value={subj}>
                          {subj}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {qrType === "chapter" && (
                <div className="space-y-2">
                  <Label htmlFor="fallbackChapter">
                    Fallback Chapter <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={fallbackChapterId}
                    onValueChange={setFallbackChapterId}
                    disabled={!fallbackSubject || !fallbackPhase}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={fallbackSubject && fallbackPhase ? "Select Chapter" : "Select Subject & Phase first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {fallbackSubject && fallbackPhase &&
                        (data.chapters as any)[fallbackSubject]?.[fallbackPhase]?.map((ch: any) => (
                          <SelectItem key={ch.id} value={ch.id}>
                            {ch.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
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
