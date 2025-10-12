"use client"

import { useEffect, useRef, useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface QRSuccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  qrData: any
}

export default function QRSuccessDialog({ open, onOpenChange, qrData }: QRSuccessDialogProps) {
  const [imgSrc, setImgSrc] = useState<string>("")

  useEffect(() => {
    let isCancelled = false
    async function renderQR() {
      if (!open || !qrData) return
      try {
        const mod = await import("qrious")
        if (isCancelled) return
        const QRCode = (mod as any).default || (mod as any)
        const instance = new QRCode({
          value: qrData.url,
          size: 200,
        })
        const dataUrl = instance.toDataURL()
        if (!isCancelled) setImgSrc(dataUrl)
      } catch (err) {
        // Swallow import/render errors to avoid crashing the dialog
        console.error("Failed to render QR:", err)
      }
    }
    renderQR()
    return () => {
      isCancelled = true
    }
  }, [open, qrData])

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = imgSrc
    link.download = `${qrData.id}.png`
    link.click()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">QR Code Created Successfully!</DialogTitle>
          <DialogDescription className="text-center">
            Download the image to provide it to the print team.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {imgSrc ? (
            <img src={imgSrc} alt="QR Code" className="border rounded-lg w-[200px] h-[200px]" />
          ) : (
            <div className="border rounded-lg w-[200px] h-[200px] bg-muted" />
          )}
          <div className="text-sm">
            <strong>QR ID:</strong> <code className="bg-muted px-2 py-1 rounded text-xs">{qrData?.id}</code>
          </div>
          <Button onClick={handleDownload} className="bg-purple-600 hover:bg-purple-700">
            <Download className="mr-2 h-4 w-4" />
            Download PNG
          </Button>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Back to Dashboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
