"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"

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

const topicsByChapter: Record<string, string[]> = {
  ch1: ["Topic 1", "Topic 2"],
  ch2: ["Topic A", "Topic B"],
  ch3: ["Topic X", "Topic Y"],
}

type OptionKey = "A" | "B" | "C" | "D"
type Question = {
  id: string
  number: string
  title?: string
  options: Record<OptionKey, { text?: string }>
  correct: OptionKey
  solution?: string
  allocateTime?: string
  allocateMark?: string
  questionType?: string
  difficulty?: string
  mathEquation?: "0" | "1"
  isActive?: boolean
  topic?: string
  markdownVersion?: string
}

export default function QRQuizBuilder({ quizDatabase, setQuizDatabase }: QRQuizBuilderProps) {
  // Two-step flow state
  const [openMeta, setOpenMeta] = useState(false)
  const [openQuestions, setOpenQuestions] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null)

  // Meta fields (based on screenshots)
  const [name, setName] = useState("")
  const [classVal, setClassVal] = useState("")
  const [program, setProgram] = useState("")
  const [phase, setPhase] = useState("")
  const [subject, setSubject] = useState("")
  const [chapterId, setChapterId] = useState("")
  const [examType, setExamType] = useState("MCQ")
  const [schedulingMethod, setSchedulingMethod] = useState("Time Slot")
  const [startAt, setStartAt] = useState("")
  const [status, setStatus] = useState("Active")
  const [markdownVersion, setMarkdownVersion] = useState("")

  const [questions, setQuestions] = useState<Question[]>([])

  const chapterName = useMemo(() => {
    const list = (catalog.chapters as any)[subject] as { id: string; name: string }[] | undefined
    return list?.find((c) => c.id === chapterId)?.name || ""
  }, [subject, chapterId])

  const clearMeta = () => {
    setEditingId(null)
    setName("")
    setClassVal("")
    setProgram("")
    setPhase("")
    setSubject("")
    setChapterId("")
    setExamType("MCQ")
    setSchedulingMethod("Time Slot")
    setStartAt("")
    setStatus("Active")
    setMarkdownVersion("")
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
    setExamType(q.examType || "MCQ")
    setSchedulingMethod(q.schedulingMethod || "Time Slot")
    setStartAt(q.startAt || "")
    setStatus(q.status || "Active")
    setMarkdownVersion(q.markdownVersion || "")
    setOpenMeta(true)
  }

  const openQuestionsEditor = (quizId: string) => {
    const q = quizDatabase.find((qq) => qq.id === quizId)
    if (!q) return
    // Ensure dependent dropdowns (subject/chapter) have data
    setClassVal(q.classVal || "")
    setProgram(q.program || "")
    setPhase(q.phase || "")
    setSubject(q.subject || "")
    setChapterId(q.chapterId || "")
    setActiveQuizId(quizId)
    setQuestions(q.questions || [])
    setOpenQuestions(true)
  }

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
        title: "",
        options: { A: {}, B: {}, C: {}, D: {} },
        correct: "A",
        allocateTime: "",
        allocateMark: "",
        questionType: "MCQ",
        difficulty: "Easy",
        mathEquation: "0",
        isActive: true,
        topic: "",
        markdownVersion: "default",
      },
    ])
  }

  const saveMeta = () => {
    if (!name || !classVal || !program || !phase || !subject || !chapterId) {
      alert("Fill all required fields.")
      return
    }
    const quizId = `quiz_${Math.random().toString(36).slice(2, 10)}`
    const meta = {
      name,
      classVal,
      program,
      phase,
      subject,
      chapterId,
      chapterName,
      examType,
      schedulingMethod,
      startAt,
      status,
      markdownVersion,
    }
    if (editingId) {
      setQuizDatabase(
        quizDatabase.map((q) => (q.id === editingId ? { ...q, ...meta } : q))
      )
    } else {
      setQuizDatabase([...quizDatabase, { id: quizId, ...meta, questions: [] }])
    }
    setOpenMeta(false)
    clearMeta()
  }

  const saveQuestions = () => {
    if (!activeQuizId) return
    setQuizDatabase(
      quizDatabase.map((q) => (q.id === activeQuizId ? { ...q, questions } : q))
    )
    setOpenQuestions(false)
    setActiveQuizId(null)
    setQuestions([])
  }

  const deleteQuiz = (quizId: string) => {
    if (!confirm("Delete this quiz?")) return
    setQuizDatabase(quizDatabase.filter((q) => q.id !== quizId))
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
                      <button className="underline underline-offset-2" onClick={() => openQuestionsEditor(q.id)}>
                        {q.name}
                      </button>
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

      {/* Meta Sheet */}
      <Sheet open={openMeta} onOpenChange={setOpenMeta}>
        <SheetContent className="w-[900px] sm:max-w-[900px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingId ? "Edit QR Quiz" : "Create QR Quiz"}</SheetTitle>
            <SheetDescription>General information and scheduling.</SheetDescription>
          </SheetHeader>

          <div className="space-y-6 px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Exam Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter Model Test Exam Name" />
              </div>
              <div className="space-y-2">
                <Label>Class</Label>
                <Select value={classVal} onValueChange={(v) => { setClassVal(v); setProgram(""); setSubject(""); setChapterId("") }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="c9">Class 9</SelectItem>
                    <SelectItem value="c10">Class 10</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Academic Program</Label>
                <Select value={program} onValueChange={(v) => { setProgram(v); setSubject(""); setChapterId("") }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {catalog.programs.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quarter</Label>
                <Select value={phase} onValueChange={setPhase}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {catalog.phases.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Select value={subject} onValueChange={(v) => { setSubject(v); setChapterId("") }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {program && (catalog.subjects as any)[program]?.map((s: string) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Chapter(s)</Label>
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
              <div className="space-y-2">
                <Label>Exam Type</Label>
                <Select value={examType} onValueChange={setExamType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MCQ">MCQ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Scheduling Details */}
              <div className="space-y-2">
                <Label>Scheduling Method</Label>
                <Select value={schedulingMethod} onValueChange={setSchedulingMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Time Slot">Time Slot</SelectItem>
                    <SelectItem value="Flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Exam Start Date & Time</Label>
                <Input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
              </div>

              {/* Session/Status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Additional Settings */}
              <div className="space-y-2">
                <Label>Markdown Version</Label>
                <Select value={markdownVersion} onValueChange={setMarkdownVersion}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="v1">Markdown v1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={() => { setOpenMeta(false); clearMeta() }}>Cancel</Button>
            <Button onClick={saveMeta} className="bg-purple-600 hover:bg-purple-700">{editingId ? "Save Changes" : "Create Quiz"}</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Questions Sheet */}
      <Sheet open={openQuestions} onOpenChange={setOpenQuestions}>
        <SheetContent className="w-[900px] sm:max-w-[900px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Manage Questions</SheetTitle>
            <SheetDescription>Add or edit questions for this quiz.</SheetDescription>
          </SheetHeader>

          <div className="space-y-6 px-2 py-6">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Questions</div>
              {questions.length === 0 && (
                <Button onClick={addQuestion} className="bg-purple-600 hover:bg-purple-700">Add First Question</Button>
              )}
            </div>

            <div className="space-y-4">
              {questions.length === 0 && (
                <div className="text-sm text-muted-foreground">No questions added yet.</div>
              )}
              {questions.map((q) => (
                <Card key={q.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">Question {q.number}</div>
                    <Button variant="destructive" size="sm" onClick={() => removeQuestion(q.id)}>Delete</Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Chapter</Label>
                      <Select value={chapterId} onValueChange={(v) => { setChapterId(v); setQuestions((prev) => prev.map((qq) => qq.id === q.id ? { ...qq, topic: "" } : qq)) }}>
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
                    <div className="space-y-2">
                      <Label>Topics</Label>
                      <Select value={q.topic || ""} onValueChange={(v) => setQuestions((prev) => prev.map((qq) => qq.id === q.id ? { ...qq, topic: v } : qq))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(topicsByChapter[chapterId] || []).map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Is Active</Label>
                      <Select value={(q.isActive ? "Active" : "Inactive")} onValueChange={(v) => setQuestions((prev) => prev.map((qq) => qq.id === q.id ? { ...qq, isActive: v === "Active" } : qq))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Markdown Version</Label>
                      <Select value={q.markdownVersion || "default"} onValueChange={(v) => setQuestions((prev) => prev.map((qq) => qq.id === q.id ? { ...qq, markdownVersion: v } : qq))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default</SelectItem>
                          <SelectItem value="v1">Markdown v1</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Math Equation</Label>
                      <Select value={q.mathEquation || "0"} onValueChange={(v) => {
                        setQuestions((prev) => prev.map((qq) => qq.id === q.id ? { ...qq, mathEquation: (v as "0"|"1") } : qq))
                      }}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Allocate Time</Label>
                      <Input value={q.allocateTime || ""} onChange={(e) => {
                        const v = e.target.value
                        setQuestions((prev) => prev.map((qq) => qq.id === q.id ? { ...qq, allocateTime: v } : qq))
                      }} placeholder="e.g., 60s" />
                    </div>
                    <div className="space-y-2">
                      <Label>Allocate Mark</Label>
                      <Input value={q.allocateMark || ""} onChange={(e) => {
                        const v = e.target.value
                        setQuestions((prev) => prev.map((qq) => qq.id === q.id ? { ...qq, allocateMark: v } : qq))
                      }} placeholder="e.g., 1" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Question type</Label>
                      <Select value={q.questionType || "MCQ"} onValueChange={(v) => {
                        setQuestions((prev) => prev.map((qq) => qq.id === q.id ? { ...qq, questionType: v } : qq))
                      }}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MCQ">MCQ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Correct Option</Label>
                      <Select value={q.correct} onValueChange={(v) => setQuestions((prev) => prev.map((qq) => qq.id === q.id ? { ...qq, correct: v as OptionKey } : qq))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["A","B","C","D"].map((k) => (
                            <SelectItem key={k} value={k}>Option {k}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Difficulty Level</Label>
                      <Select value={q.difficulty || "Easy"} onValueChange={(v) => {
                        setQuestions((prev) => prev.map((qq) => qq.id === q.id ? { ...qq, difficulty: v } : qq))
                      }}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Easy">Easy</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Question Title</Label>
                      <Textarea
                        rows={8}
                        value={q.title || ""}
                        onChange={(e) => {
                          const v = e.target.value
                          setQuestions((prev) => prev.map((qq) => qq.id === q.id ? { ...qq, title: v } : qq))
                        }}
                        placeholder="Question Title"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Latex Preview</Label>
                        <div className="text-xs text-muted-foreground">Drag edges and resize (width: 400px, height:200px)</div>
                      </div>
                      <div className="border rounded-md p-2 resize overflow-auto w-[400px] h-[200px] md:w-full">
                        <div className="whitespace-pre-wrap text-sm">{q.title || ""}</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {["A","B","C","D"].map((optKey) => (
                      <div key={optKey} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Option {optKey}</Label>
                          <div className="text-xs text-muted-foreground">LaTeX Preview</div>
                        </div>
                        <Textarea
                          rows={6}
                          value={q.options[optKey as "A"|"B"|"C"|"D"]?.text || ""}
                          onChange={(e) => {
                            const v = e.target.value
                            setQuestions((prev) => prev.map((qq) => qq.id === q.id ? { ...qq, options: { ...qq.options, [optKey]: { text: v } } } : qq))
                          }}
                          placeholder="Type text, image URL or LaTeX"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label>Solution (optional)</Label>
                      <Textarea
                        rows={6}
                        value={q.solution || ""}
                        onChange={(e) => {
                          const v = e.target.value
                          setQuestions((prev) => prev.map((qq) => qq.id === q.id ? { ...qq, solution: v } : qq))
                        }}
                        placeholder="Explain the answer"
                      />
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

          <SheetFooter>
            <Button variant="outline" onClick={() => { setOpenQuestions(false); setActiveQuizId(null) }}>Close</Button>
            <Button onClick={saveQuestions} className="bg-purple-600 hover:bg-purple-700">Save Questions</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}


