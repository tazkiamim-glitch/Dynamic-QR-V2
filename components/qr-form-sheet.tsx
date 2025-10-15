"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
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
  const [name, setName] = useState("")
  const [status, setStatus] = useState<"Published" | "Unpublished">("Published")
  const [manualQrId, setManualQrId] = useState("")
  const [quizId, setQuizId] = useState("")

  // Multiple destination mappings
  const [mappings, setMappings] = useState<any[]>([
    {
      classVal: "",
      phase: "",
      program: "",
      subject: "",
      chapterId: "",
      isContentReady: false,
      fallbackProgram: "",
      fallbackPhase: "",
      fallbackChapterId: "",
    },
  ])

  // Mappings for QR Quiz workflow (filters quiz list by selected destination)
  const [quizMappings, setQuizMappings] = useState<any[]>([
    { classVal: "", program: "", phase: "", subject: "", chapterId: "", quizId: "" },
  ])

  useEffect(() => {
    if (editingQR) {
      setQrType(editingQR.qrType === "quiz" ? "quiz" : "chapter")
      setQuizId(editingQR.quizId || "")
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
            isContentReady: !!m.isContentReady,
            fallbackProgram: m.fallbackProgram || m.fallback?.program || "",
            fallbackPhase: m.fallbackPhase || m.fallback?.phase || "",
            fallbackChapterId: m.fallbackChapterId || m.fallback?.chapterId || "",
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
            isContentReady: !!editingQR.isContentReady,
            fallbackProgram: editingQR.fallback?.program || "",
            fallbackPhase: editingQR.fallback?.phase || "",
            fallbackChapterId: editingQR.fallback?.chapterId || "",
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
            phase: m.phase || "",
            subject: m.subject || "",
            chapterId: m.chapterId || "",
            quizId: m.quizId || "",
          })))
        }
      }
    } else {
      setQrType("chapter")
      setQuizId("")
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
          isContentReady: false,
          fallbackProgram: "",
          fallbackPhase: "",
          fallbackChapterId: "",
        },
      ])
      setQuizMappings([{ classVal: "", program: "", phase: "", subject: "", chapterId: "", quizId: "" }])
    }
  }, [editingQR, open])

  // QR type supports only Chapter and QR Quiz

  const handleSubmit = () => {
    if (qrType === "quiz") {
      // Validate quiz mappings
      if (!quizMappings.length) {
        alert("Please add at least one destination mapping")
        return
      }
      for (const [idx, m] of quizMappings.entries()) {
        if (!m.classVal || !m.program || !m.phase || !m.subject || !m.chapterId || !m.quizId) {
          alert(`Please complete all fields in Mapping #${idx + 1}`)
          return
        }
      }
      const qrId = editingQR?.id || (manualQrId?.trim() || `qrid_${Math.random().toString(36).substring(2, 11)}`)
      const mappingsWithNames = quizMappings.map((m) => {
        const chapter = (data.chapters as any)[m.subject]?.[m.phase]?.find((c: any) => c.id === m.chapterId)
        const chapterName = chapter?.name || ""
        const quizName = quizDatabase.find((qq: any) => qq.id === m.quizId)?.name || ""
        return { ...m, chapterName, quizName }
      })
      const first = mappingsWithNames[0]
      const defaultName = `[${(first.classVal || "").toUpperCase()}] ${first.program} ${first.subject} - ${first.chapterName} - ${first.quizName}`
      const qrData = {
        id: qrId,
        name: name || defaultName,
        qrType: "quiz" as const,
        url: `https://shikho.com/qr?id=${qrId}`,
        quizId: mappingsWithNames[0].quizId,
        quizMappings: mappingsWithNames,
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
        if (!m.fallbackProgram || !m.fallbackPhase || !m.fallbackChapterId) {
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
            <Label htmlFor="qrid">QR ID (optional)</Label>
            <Input id="qrid" value={manualQrId} onChange={(e) => setManualQrId(e.target.value)} placeholder="e.g., qrid_8f3b2a9c (leave blank to auto-generate)" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="qrType">
              QR Type <span className="text-red-500">*</span>
            </Label>
            <Select value={qrType} onValueChange={(v: "chapter" | "quiz") => {
              setQrType(v)
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

          <div className="space-y-2">
            <Label htmlFor="name">Internal Name / Description</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., General Math - Ch. 1 Intro" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
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
                    <Label>Class <span className="text-red-500">*</span></Label>
                    <Select value={m.classVal} onValueChange={(val) => setQuizMappings((prev) => prev.map((pm, i) => i === idx ? { ...pm, classVal: val, program: "", subject: "", phase: "", chapterId: "", quizId: "" } : pm))}>
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
                    <Label>Academic Program <span className="text-red-500">*</span></Label>
                    <Select value={m.program} onValueChange={(val) => setQuizMappings((prev) => prev.map((pm, i) => i === idx ? { ...pm, program: val, subject: "", quizId: "" } : pm))} disabled={!m.classVal}>
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
                  <div className="space-y-2">
                    <Label>Phase <span className="text-red-500">*</span></Label>
                    <Select value={m.phase} onValueChange={(val) => setQuizMappings((prev) => prev.map((pm, i) => i === idx ? { ...pm, phase: val, chapterId: "", quizId: "" } : pm))} disabled={!m.classVal}>
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
                    <Select value={m.subject} onValueChange={(val) => setQuizMappings((prev) => prev.map((pm, i) => i === idx ? { ...pm, subject: val, chapterId: "", quizId: "" } : pm))} disabled={!m.program}>
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
                    <Label>Related Chapter <span className="text-red-500">*</span></Label>
                    <Select value={m.chapterId} onValueChange={(val) => setQuizMappings((prev) => prev.map((pm, i) => i === idx ? { ...pm, chapterId: val, quizId: "" } : pm))} disabled={!m.subject || !m.phase}>
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
                    <Label>QR Quiz <span className="text-red-500">*</span></Label>
                    <Select value={m.quizId} onValueChange={(val) => setQuizMappings((prev) => prev.map((pm, i) => i === idx ? { ...pm, quizId: val } : pm))} disabled={!m.chapterId}>
                      <SelectTrigger>
                        <SelectValue placeholder={m.chapterId ? "Select QR Quiz" : "Select Chapter first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {quizDatabase
                          .filter((q: any) => q.subject === m.subject && q.phase === m.phase && q.chapterId === m.chapterId)
                          .map((q: any) => (
                            <SelectItem key={q.id} value={q.id}>{q.name}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
              <div>
                <Button variant="outline" onClick={() => setQuizMappings((prev) => [...prev, { classVal: "", program: "", phase: "", subject: "", chapterId: "", quizId: "" }])}>+ Add Another Mapping</Button>
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
                    <Label>Class <span className="text-red-500">*</span></Label>
                    <Select
                      value={m.classVal}
                      onValueChange={(val) => {
                        setMappings((prev) => prev.map((pm, i) => i === idx ? { ...pm, classVal: val, program: "", subject: "", phase: "", chapterId: "", fallbackProgram: "", fallbackPhase: "", fallbackChapterId: "" } : pm))
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
                    <Label>Academic Program <span className="text-red-500">*</span></Label>
                    <Select
                      value={m.program}
                      onValueChange={(val) => {
                        setMappings((prev) => prev.map((pm, i) => i === idx ? { ...pm, program: val, subject: "", chapterId: "" } : pm))
                      }}
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
                      <Label>Fallback Program <span className="text-red-500">*</span></Label>
                      <Select
                        value={m.fallbackProgram}
                        onValueChange={(val) => setMappings((prev) => prev.map((pm, i) => i === idx ? { ...pm, fallbackProgram: val, fallbackPhase: "", fallbackChapterId: "" } : pm))}
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

                      <div className="space-y-2 mt-2">
                        <Label>Fallback Phase <span className="text-red-500">*</span></Label>
                        <Select
                          value={m.fallbackPhase}
                          onValueChange={(val) => setMappings((prev) => prev.map((pm, i) => i === idx ? { ...pm, fallbackPhase: val, fallbackChapterId: "" } : pm))}
                          disabled={!m.fallbackProgram}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={m.fallbackProgram ? "Select Phase" : "Select Program first"} />
                          </SelectTrigger>
                          <SelectContent>
                            {m.fallbackProgram && data.phases.map((p) => (
                              <SelectItem key={p} value={p}>{p}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 mt-2">
                        <Label>Fallback Chapter <span className="text-red-500">*</span></Label>
                        <Select
                          value={m.fallbackChapterId}
                          onValueChange={(val) => setMappings((prev) => prev.map((pm, i) => i === idx ? { ...pm, fallbackChapterId: val } : pm))}
                          disabled={!m.subject || !m.fallbackPhase}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={m.subject && m.fallbackPhase ? "Select Chapter" : "Select Subject & Phase first"} />
                          </SelectTrigger>
                          <SelectContent>
                            {m.subject && m.fallbackPhase && (data.chapters as any)[m.subject]?.[m.fallbackPhase]?.map((ch: any) => (
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
                          isContentReady: false,
                          fallbackProgram: "",
                          fallbackPhase: "",
                          fallbackChapterId: "",
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
