"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CMSPanel from "@/components/cms-panel"
import MobileApp from "@/components/mobile-app"

export default function Home() {
  const [qrDatabase, setQrDatabase] = useState<any[]>([])
  const [quizDatabase, setQuizDatabase] = useState<any[]>([])

  return (
    <div className="min-h-screen bg-background">
      <Tabs defaultValue="cms" className="w-full">
        <TabsList className="w-full justify-center rounded-none border-b h-14 bg-background">
          <TabsTrigger
            value="cms"
            className="text-base font-semibold px-12 data-[state=active]:border-b-2 data-[state=active]:border-purple-600"
          >
            CMS Admin Panel
          </TabsTrigger>
          <TabsTrigger
            value="app"
            className="text-base font-semibold px-12 data-[state=active]:border-b-2 data-[state=active]:border-purple-600"
          >
            Mobile App
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cms" className="m-0">
          <CMSPanel
            qrDatabase={qrDatabase}
            setQrDatabase={setQrDatabase}
            quizDatabase={quizDatabase}
            setQuizDatabase={setQuizDatabase}
          />
        </TabsContent>

        <TabsContent value="app" className="m-0">
          <MobileApp qrDatabase={qrDatabase} quizDatabase={quizDatabase} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
