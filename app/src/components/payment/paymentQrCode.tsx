"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Copy, Download, RefreshCw } from "lucide-react"
import { createQR} from "@solana/pay"

interface PaymentQRCodeProps {
  recipient: string
  amount: string
  label?: string
  message?: string
  reference?: string
  onReset: () => void
}

export function PaymentQRCode({ recipient, amount, label, message, reference, onReset }: PaymentQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [solanaPayUrl, setSolanaPayUrl] = useState("")
  const [copied, setCopied] = useState(false)
  // const { toast } = useToast()
  console.log("mounted")
  const qrcode2 = createQR("solana:https://7d0338b412f4.ngrok-free.app/api/create-transfer")
  // log(qrcode)
  console.log(qrcode2)
  
  useEffect(() => {
    // Generate Solana Pay URL
    const params = new URLSearchParams()
    params.append("amount", amount)
    if (label) params.append("label", label)
    if (message) params.append("message", message)
    if (reference) params.append("reference", reference)

    const url = `solana:${recipient}?${params.toString()}`
    setSolanaPayUrl(url)

    const qrcode2 = createQR("solana:https://7d0338b412f4.ngrok-free.app/api/create-transfer")
    // log(qrcode)
    console.log(qrcode2)
    // Generate QR Code
  }, [recipient, amount, label, message, reference])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(solanaPayUrl)
      setCopied(true)
 
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.log(error)
    }
  }

  const handleDownload = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL("image/png")
      const link = document.createElement("a")
      link.download = `solpay-qr-${reference || Date.now()}.png`
      link.href = url
      link.click()
 
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Payment QR Code</CardTitle>
            <CardDescription>Share this QR code with your customer</CardDescription>
          </div>
          <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-secondary" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* QR Code Display */}
        <div className="flex justify-center p-8 bg-card rounded-lg border-2 border-dashed">
          <canvas ref={canvasRef} className="rounded-lg" />
        </div>

        {/* Payment Details */}
        <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Amount</span>
            <span className="text-2xl font-bold text-primary">{amount} SOL</span>
          </div>
          {label && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Label</span>
              <span className="text-sm font-medium">{label}</span>
            </div>
          )}
          {message && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Message</span>
              <span className="text-sm font-medium">{message}</span>
            </div>
          )}
          {reference && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Reference</span>
              <span className="text-sm font-mono">{reference}</span>
            </div>
          )}
        </div>

        {/* Payment URL */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Payment URL</label>
          <div className="flex gap-2">
            <div className="flex-1 p-3 bg-muted rounded-lg text-xs font-mono break-all">{solanaPayUrl}</div>
            <Button variant="outline" size="icon" onClick={handleCopy}>
              {copied ? <CheckCircle2 className="w-4 h-4 text-secondary" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={handleDownload} variant="outline" className="flex-1 bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            Download QR
          </Button>
          <Button onClick={onReset} variant="outline" className="flex-1 bg-transparent">
            <RefreshCw className="w-4 h-4 mr-2" />
            New Request
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Customer can scan this QR code with any Solana Pay compatible wallet
        </p>
      </CardContent>
    </Card>
  )
}
