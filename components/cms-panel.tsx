"use client"

import { useState } from "react"
import { Plus, Pencil, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import QRFormSheet from "@/components/qr-form-sheet"
import QRSuccessDialog from "@/components/qr-success-dialog"
import QRQuizBuilder from "@/components/qr-quiz-builder"

interface QRMapping {
  classVal: string
  program: string
  subject: string
  phase: string
  chapterId: string
  chapterName?: string
  isContentReady: boolean
  fallbackProgram?: string
  fallbackPhase?: string
  fallbackChapterId?: string
}

interface QRData {
  id: string
  name: string
  url: string
  qrType?: "chapter" | "quiz"
  quizId?: string
  // New multi-mapping structure
  mappings?: QRMapping[]
  // Backward-compat single-target fields
  class?: string
  program?: string
  subject?: string
  phase?: string
  chapterId?: string
  chapterName?: string
  isContentReady?: boolean
}

interface CMSPanelProps {
  qrDatabase: QRData[]
  setQrDatabase: (data: QRData[]) => void
  quizDatabase: any[]
  setQuizDatabase: (data: any[]) => void
}

export default function CMSPanel({ qrDatabase, setQrDatabase, quizDatabase, setQuizDatabase }: CMSPanelProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [editingQR, setEditingQR] = useState<QRData | null>(null)
  const [currentQR, setCurrentQR] = useState<QRData | null>(null)
  const [activeMenu, setActiveMenu] = useState<"generate" | "quiz">("generate")
  const [search, setSearch] = useState("")

  const handleAddNew = () => {
    setEditingQR(null)
    setIsFormOpen(true)
  }

  const handleEdit = (qr: QRData) => {
    setEditingQR(qr)
    setIsFormOpen(true)
  }

  const handleSubmit = (qrData: QRData) => {
    if (editingQR) {
      setQrDatabase(qrDatabase.map((qr) => (qr.id === editingQR.id ? qrData : qr)))
    } else {
      setQrDatabase([...qrDatabase, qrData])
      setCurrentQR(qrData)
      setIsSuccessOpen(true)
    }
    setIsFormOpen(false)
  }

  const handleDownload = (qr: QRData) => {
    // Generate QR code and download (client-only)
    ;(async () => {
      try {
        const mod = await import("qrious")
        const QRCode = (mod as any).default || (mod as any)
        const qrCode = new QRCode({
          value: qr.url,
          size: 400,
        })

        const link = document.createElement("a")
        link.href = qrCode.toDataURL()
        link.download = `${qr.id}.png`
        link.click()
      } catch (err) {
        console.error("Failed to generate QR for download:", err)
      }
    })()
  }

  return (
    <div className="flex h-[calc(100vh-57px)]">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card">
        <div className="p-5 border-b">
          <h1 className="text-2xl font-bold text-purple-600">Shikho</h1>
        </div>
        <nav className="p-4">
          <div className="px-4 py-3 rounded-md bg-purple-50 text-purple-600 font-medium cursor-pointer">
            <span className="mr-3">📊</span>
            Dashboard
          </div>
          <div className="px-4 py-3 rounded-md font-medium cursor-pointer mt-1">
            <span className="mr-3">🔲</span>
            QR Management
          </div>
          <div className="ml-8 mt-1 space-y-1">
            <button
              onClick={() => setActiveMenu("generate")}
              className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                activeMenu === "generate" ? "bg-purple-100 text-purple-700" : "hover:bg-muted"
              }`}
            >
              Generate QR
            </button>
            <button
              onClick={() => setActiveMenu("quiz")}
              className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                activeMenu === "quiz" ? "bg-purple-100 text-purple-700" : "hover:bg-muted"
              }`}
            >
              QR Quiz
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="text-sm text-muted-foreground mb-4">
          DASHBOARD / <span className="font-semibold text-foreground">QR MANAGEMENT</span>
          <span className="text-muted-foreground"> / {activeMenu === "generate" ? "Generate QR" : "QR Quiz"}</span>
        </div>
        {activeMenu === "generate" ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>QR Codes Table</CardTitle>
              <div className="flex items-center gap-3">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or ID"
                  className="border rounded px-3 py-2 text-sm w-64"
                />
                <Button onClick={handleAddNew} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New QR
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>QR ID</TableHead>
                    <TableHead>Target Destination</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {qrDatabase.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No QR codes yet. Create one to get started!
                      </TableCell>
                    </TableRow>
                  ) : (
                    qrDatabase
                      .filter((qr) =>
                        `${qr.name} ${qr.id}`.toLowerCase().includes(search.toLowerCase())
                      )
                      .map((qr) => (
                      <TableRow key={qr.id}>
                        <TableCell className="font-medium">{qr.name}</TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">{qr.id}</code>
                        </TableCell>
                        <TableCell className="text-sm">
                          {qr.qrType === "quiz" ? (
                            <span>QR Quiz</span>
                          ) : Array.isArray(qr.mappings) && qr.mappings.length > 0 ? (
                            <div>
                              <div>
                                {qr.mappings[0].program} &gt; {qr.mappings[0].subject} &gt; {(qr.mappings[0].chapterName || "").substring(0, 30)}
                              </div>
                              {qr.mappings.length > 1 && (
                                <div className="text-xs text-muted-foreground">+ {qr.mappings.length - 1} more mapping{qr.mappings.length - 1 > 1 ? "s" : ""}</div>
                              )}
                            </div>
                          ) : (
                            <span>
                              {qr.program} &gt; {qr.subject} &gt; {(qr.chapterName || "").substring(0, 30)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {qr.qrType === "quiz" ? (
                            <Badge className="bg-green-500">
                              <span className="mr-2">●</span>
                              Live
                            </Badge>
                          ) : Array.isArray(qr.mappings) && qr.mappings.length > 0 ? (
                            (() => {
                              const allReady = qr.mappings?.every((m) => m.isContentReady)
                              return (
                                <Badge
                                  variant={allReady ? "default" : "secondary"}
                                  className={allReady ? "bg-green-500" : "bg-yellow-500"}
                                >
                                  <span className="mr-2">●</span>
                                  {allReady ? "Live" : "Fallback Active"}
                                </Badge>
                              )
                            })()
                          ) : (
                            <Badge
                              variant={qr.isContentReady ? "default" : "secondary"}
                              className={qr.isContentReady ? "bg-green-500" : "bg-yellow-500"}
                            >
                              <span className="mr-2">●</span>
                              {qr.isContentReady ? "Live" : "Fallback Active"}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-3">
                            <Pencil
                              className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-purple-600"
                              onClick={() => handleEdit(qr)}
                            />
                            <Download
                              className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-purple-600"
                              onClick={() => handleDownload(qr)}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-0">
            <QRQuizBuilder quizDatabase={quizDatabase} setQuizDatabase={setQuizDatabase} />
          </div>
        )}
      </main>

      {activeMenu === "generate" && (
        <QRFormSheet
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSubmit={handleSubmit}
          editingQR={editingQR}
          quizDatabase={quizDatabase}
        />
      )}

      <QRSuccessDialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen} qrData={currentQR} />
    </div>
  )
}
