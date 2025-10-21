"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2, AlertCircle, ArrowLeft } from "lucide-react"
import { toast } from "react-toastify"
import { log } from "node:console"

interface PaymentProcessorProps {
  paymentUrl: string
  onBack: () => void
}

type PaymentStatus = "pending" | "processing" | "success" | "failed"

export function PaymentProcessor({ paymentUrl, onBack }: PaymentProcessorProps) {
  const [status, setStatus] = useState<PaymentStatus>("pending")
  const [txSignature, setTxSignature] = useState("")

  // Parse payment URL
  const parsePaymentUrl = () => {
    try {
      const url = new URL(paymentUrl.replace("solana:", "https://"))
      const recipient = url.hostname || url.pathname.split("?")[0]
      const params = new URLSearchParams(url.search)

      return {
        recipient,
        amount: params.get("amount") || "0",
        label: params.get("label") || "Payment",
        message: params.get("message") || "",
        reference: params.get("reference") || "",
      }
    } catch (error) {
      console.error(error)
      return null
    }
  }

  const paymentDetails = parsePaymentUrl()

  const handlePayment = async () => {
    setStatus("processing")

    // Simulate payment processing
    setTimeout(() => {
      const success = Math.random() > 0.1 // 90% success rate for demo
      if (success) {
        const mockSignature = `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
        setTxSignature(mockSignature)
        setStatus("success")
        toast("Your transaction has been confirmed")
      } else {
        setStatus("failed")
        toast("Payment Failed")
        console.error("Payment Failed")
      }
    }, 2000)
  }

  if (!paymentDetails) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invalid Payment URL</CardTitle>
          <CardDescription>The payment URL could not be parsed</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Confirm Payment</CardTitle>
        <CardDescription>Review the payment details before confirming</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Details */}
        <div className="space-y-4 p-6 bg-muted/50 rounded-lg">
          <div className="text-center pb-4 border-b">
            <p className="text-sm text-muted-foreground mb-2">You're paying</p>
            <p className="text-4xl font-bold text-primary">{paymentDetails.amount} SOL</p>
            <p className="text-sm text-muted-foreground mt-1">
              ≈ ${(Number.parseFloat(paymentDetails.amount) * 150).toFixed(2)} USD
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">To</span>
              <span className="text-sm font-medium">{paymentDetails.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Recipient</span>
              <span className="text-xs font-mono">
                {paymentDetails.recipient.slice(0, 8)}...
                {paymentDetails.recipient.slice(-8)}
              </span>
            </div>
            {paymentDetails.message && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Message</span>
                <span className="text-sm font-medium">{paymentDetails.message}</span>
              </div>
            )}
            {paymentDetails.reference && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Reference</span>
                <span className="text-sm font-mono">{paymentDetails.reference}</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t">
              <span className="text-sm text-muted-foreground">Network Fee</span>
              <span className="text-sm font-medium">~0.000005 SOL</span>
            </div>
          </div>
        </div>

        {/* Status Display */}
        {status === "processing" && (
          <div className="flex items-center justify-center gap-3 p-6 bg-primary/5 rounded-lg">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="font-medium">Processing payment...</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 p-6 bg-secondary/10 rounded-lg">
              <CheckCircle2 className="w-8 h-8 text-secondary" />
              <div>
                <p className="font-bold text-lg">Payment Successful!</p>
                <p className="text-sm text-muted-foreground">Your transaction has been confirmed</p>
              </div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Transaction Signature</p>
              <p className="text-xs font-mono break-all">{txSignature}</p>
            </div>
          </div>
        )}

        {status === "failed" && (
          <div className="flex items-center justify-center gap-3 p-6 bg-destructive/10 rounded-lg">
            <AlertCircle className="w-6 h-6 text-destructive" />
            <div>
              <p className="font-bold">Payment Failed</p>
              <p className="text-sm text-muted-foreground">Please try again</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {status === "pending" && (
            <>
              <Button onClick={onBack} variant="outline" className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button onClick={handlePayment} className="flex-1" size="lg">
                Confirm Payment
              </Button>
            </>
          )}
          {status === "processing" && (
            <Button disabled className="w-full" size="lg">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </Button>
          )}
          {status === "success" && (
            <Button onClick={onBack} className="w-full" size="lg">
              Done
            </Button>
          )}
          {status === "failed" && (
            <>
              <Button onClick={onBack} variant="outline" className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button onClick={handlePayment} className="flex-1" size="lg">
                Try Again
              </Button>
            </>
          )}
        </div>

        {status === "success" && (
          <p className="text-xs text-center text-muted-foreground">
            View on{" "}
            <a href="#" className="text-primary hover:underline">
              Solana Explorer
            </a>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
