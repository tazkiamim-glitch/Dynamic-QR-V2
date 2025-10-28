"use client"

import { useMemo, useState } from "react"
import { Copy, Check, ChevronRight, ChevronDown, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"

interface QRQuizBuilderProps {
  quizDatabase: any[]
  setQuizDatabase: (data: any[]) => void
}

const catalog = {
  programs: ["SSC - AP 2026", "SSC - AP 2025"],
  subjects: {
    "SSC - AP 2026": ["Physics", "Chemistry"],
    "SSC - AP 2025": ["Physics", "Chemistry"],
  },
  phases: ["Quarter 1", "Quarter 2", "Quarter 3", "Quarter 4"],
  chapters: {
    Physics: [
      { id: "ch1", name: "অধ্যায় ০১ - ভৌত রাশি" },
      { id: "ch2", name: "অধ্যায় ০২ - গতি" },
    ],
    Chemistry: [
      { id: "ch3", name: "অধ্যায় ০১ - রসায়নের ধারণা" },
    ],
  },
}

type OptionKey = "A" | "B" | "C" | "D"
type Question = {
  id: string
  number: string
  correct: OptionKey
}

export default function QRQuizBuilder({ quizDatabase, setQuizDatabase }: QRQuizBuilderProps) {
  // Two-step flow state
  const [openMeta, setOpenMeta] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  // Meta fields (refactored to requested set)
  const [name, setName] = useState("")
  const [classVal, setClassVal] = useState("")
  const [program, setProgram] = useState("")
  const [phase, setPhase] = useState("")
  const [subject, setSubject] = useState("")
  const [chapterId, setChapterId] = useState("")
  const [solutionPdfUrl, setSolutionPdfUrl] = useState("")
  const [solutionPdfName, setSolutionPdfName] = useState("")

  const [questions, setQuestions] = useState<Question[]>([])

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
    return (
      <Select value={value as any} onValueChange={(v: any) => onChange(v)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {classGroups.topSingles.map((c) => (
            <SelectItem key={c.value} value={c.value as any}>{c.label}</SelectItem>
          ))}
          {/* SSC group row (selectable) with inline toggle */}
          <SelectItem value={"ssc" as any} className="pl-2">
            <button
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setSscOpen((o) => !o) }}
              className="mr-2 inline-flex items-center justify-center w-4 h-4"
              aria-label={sscOpen ? "Collapse SSC" : "Expand SSC"}
            >
              {sscOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
            <span>SSC</span>
          </SelectItem>
          {sscOpen && (
            <>
              {classGroups.ssc.map((c) => (
                <SelectItem key={c.value} value={c.value as any} className="pl-8">{c.label}</SelectItem>
              ))}
            </>
          )}
          {/* HSC group row (selectable) with inline toggle */}
          <SelectItem value={"hsc" as any} className="pl-2">
            <button
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setHscOpen((o) => !o) }}
              className="mr-2 inline-flex items-center justify-center w-4 h-4"
              aria-label={hscOpen ? "Collapse HSC" : "Expand HSC"}
            >
              {hscOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
            <span>HSC</span>
          </SelectItem>
          {hscOpen && (
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

  const chapterName = useMemo(() => {
    const list = (catalog.chapters as any)[subject] as { id: string; name: string }[] | undefined
    return list?.find((c) => c.id === chapterId)?.name || ""
  }, [subject, chapterId])

  const allSubjects = useMemo(() => {
    const unique = new Set<string>()
    Object.values(catalog.subjects).forEach((arr: any) => {
      ;(arr as string[]).forEach((s) => unique.add(s))
    })
    return Array.from(unique)
  }, [])

  const clearMeta = () => {
    setEditingId(null)
    setName("")
    setClassVal("")
    setProgram("")
    setPhase("")
    setSubject("")
    setChapterId("")
    setSolutionPdfUrl("")
    setSolutionPdfName("")
  }

  const startCreate = () => {
    clearMeta()
    setQuestions([])
    setOpenMeta(true)
  }

  const startEdit = (quizId: string) => {
    const q = quizDatabase.find((qq) => qq.id === quizId)
    if (!q) return
    setEditingId(q.id)
    setName(q.name || "")
    setClassVal(q.classVal || "")
    setProgram(q.program || "")
    setPhase(q.phase || "")
    setSubject(q.subject || "")
    setChapterId(q.chapterId || "")
    setSolutionPdfUrl(q.solutionPdfUrl || "")
    setSolutionPdfName(q.solutionPdfName || "")
    setQuestions(q.questions || [])
    setOpenMeta(true)
  }

  // Inline questions editor only (no separate sheet)

  const removeQuestion = (questionId: string) => {
    setQuestions((prev) =>
      prev
        .filter((q) => q.id !== questionId)
        .map((q, idx) => ({ ...q, number: String(idx + 1) }))
    )
  }

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: `qq_${Math.random().toString(36).slice(2, 9)}`,
        number: String(prev.length + 1),
        correct: "A",
      },
    ])
  }

  const saveMeta = () => {
    // AP (program) and Phase are not required anymore
    if (!name || !classVal || !subject || !chapterId) {
      alert("Fill all required fields.")
      return
    }
    const meta = {
      name,
      classVal, // can be a single class (c6..c12) or a group token ('ssc' | 'hsc')
      program,
      phase,
      subject,
      chapterId,
      chapterName,
      solutionPdfUrl,
      solutionPdfName,
    }
    if (editingId) {
      setQuizDatabase(
        quizDatabase.map((q) => (q.id === editingId ? { ...q, ...meta, questions } : q))
      )
    } else {
      const quizId = `quiz_${Math.random().toString(36).slice(2, 10)}`
      setQuizDatabase([...quizDatabase, { id: quizId, ...meta, questions }])
    }
    setOpenMeta(false)
    clearMeta()
  }

  // Questions are saved together with meta in saveMeta

  const deleteQuiz = (quizId: string) => {
    if (!confirm("Delete this quiz?")) return
    setQuizDatabase(quizDatabase.filter((q) => q.id !== quizId))
  }

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey((prev) => (prev === key ? null : prev)), 1200)
    } catch (e) {
      console.error("Copy failed", e)
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>QR Quiz</CardTitle>
          <Button onClick={startCreate} className="bg-purple-600 hover:bg-purple-700">
            Create QR Quiz
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Chapter</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quizDatabase.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">No quizzes yet.</TableCell>
                </TableRow>
              ) : (
                quizDatabase.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <button className="underline underline-offset-2" onClick={() => startEdit(q.id)}>
                          {q.name}
                        </button>
                        <button
                          className="text-xs border rounded px-2 py-0.5 text-muted-foreground hover:text-foreground"
                          onClick={() => handleCopy(q.name, `name-${q.id}`)}
                          title="Copy name"
                        >
                          {copiedKey === `name-${q.id}` ? (
                            <span className="inline-flex items-center gap-1"><Check className="w-3 h-3" />Copied</span>
                          ) : (
                            <span className="inline-flex items-center gap-1"><Copy className="w-3 h-3" />Copy</span>
                          )}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">{q.id}</code>
                        <button
                          className="text-xs border rounded px-2 py-0.5 text-muted-foreground hover:text-foreground"
                          onClick={() => handleCopy(q.id, `id-${q.id}`)}
                          title="Copy ID"
                        >
                          {copiedKey === `id-${q.id}` ? (
                            <span className="inline-flex items-center gap-1"><Check className="w-3 h-3" />Copied</span>
                          ) : (
                            <span className="inline-flex items-center gap-1"><Copy className="w-3 h-3" />Copy</span>
                          )}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>{q.program}</TableCell>
                    <TableCell>{q.subject}</TableCell>
                    <TableCell>{q.chapterName}</TableCell>
                    <TableCell>{q.questions?.length || 0}</TableCell>
                    <TableCell>{q.status || "Active"}</TableCell>
                    <TableCell>
                      <div className="flex gap-3">
                        <Button variant="outline" size="sm" onClick={() => startEdit(q.id)}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteQuiz(q.id)}>Delete</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Sheet (Meta + Questions) */}
      <Sheet open={openMeta} onOpenChange={setOpenMeta}>
        <SheetContent className="w-[900px] sm:max-w-[900px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingId ? "Edit QR Quiz" : "Create QR Quiz"}</SheetTitle>
          <SheetDescription>Set quiz details and upload a solution PDF.</SheetDescription>
          </SheetHeader>

          <div className="space-y-6 px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
              <Label>QR Quiz Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter QR Quiz Name" />
              </div>
              <div className="space-y-2">
                <Label>Program Class</Label>
                <ProgramClassSelect value={classVal} onChange={(v) => { setClassVal(v); setProgram(""); setSubject(""); setChapterId("") }} />
              </div>
              
              <div className="space-y-2">
                <Label>Subject</Label>
                <Select value={subject} onValueChange={(v) => { setSubject(v); setChapterId("") }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allSubjects.map((s) => (
                      <SelectItem key={s} value={s as string}>{s as string}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
              <Label>Chapter</Label>
                <Select value={chapterId} onValueChange={setChapterId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {subject && (catalog.chapters as any)[subject]?.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Solution PDF (optional)</Label>
              <Input
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  const file = (e.target as HTMLInputElement).files?.[0]
                  if (file) {
                    setSolutionPdfName(file.name)
                    const url = URL.createObjectURL(file)
                    setSolutionPdfUrl(url)
                  }
                }}
              />
              {solutionPdfUrl && (
                <div className="flex items-center gap-3 text-sm">
                  <a href={solutionPdfUrl} target="_blank" rel="noreferrer" className="underline">
                    View uploaded PDF ({solutionPdfName})
                  </a>
                  <Button variant="outline" size="sm" onClick={() => { setSolutionPdfUrl(""); setSolutionPdfName("") }}>Remove</Button>
              </div>
              )}
            </div>
          </div>

            {/* Questions inline */}
            <div className="space-y-4 mt-8">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Questions</div>
              {questions.length === 0 && (
                <Button onClick={addQuestion} className="bg-purple-600 hover:bg-purple-700">Add First Question</Button>
              )}
            </div>

              {questions.length === 0 && (
                <div className="text-sm text-muted-foreground">No questions added yet.</div>
              )}

              <div className="space-y-4">
              {questions.map((q) => (
                <Card key={q.id} className="p-4">
                    <div className="flex items-center justify-between">
                    <div className="font-medium">Question {q.number}</div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Label className="whitespace-nowrap">Correct Option</Label>
                      <Select value={q.correct} onValueChange={(v) => setQuestions((prev) => prev.map((qq) => qq.id === q.id ? { ...qq, correct: v as OptionKey } : qq))}>
                            <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["A","B","C","D"].map((k) => (
                            <SelectItem key={k} value={k}>Option {k}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                        {q.id === (questions[questions.length - 1]?.id) && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeQuestion(q.id)}
                            title="Delete last question"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                    ))}
                  </div>

            {questions.length > 0 && (
              <div className="flex justify-end">
                <Button onClick={addQuestion} className="bg-purple-600 hover:bg-purple-700">Add Another Question</Button>
              </div>
            )}
            </div>
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={() => { setOpenMeta(false); clearMeta() }}>Cancel</Button>
            <Button onClick={saveMeta} className="bg-purple-600 hover:bg-purple-700">{editingId ? "Save Changes" : "Create Quiz"}</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}


