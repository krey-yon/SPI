"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Crown, ArrowLeft, Loader2, CheckCircle2, Clock } from "lucide-react"
import { createQR, findReference } from "@solana/pay"
import { Connection, PublicKey, Keypair } from "@solana/web3.js"
import { toast } from "react-toastify"
import { useSuccessModal } from "../successModalProvider"

const PRIME_PRICE = 1.0 // SOL
const PRIME_DURATION = "year"
const API_BASE_URL = "https://spi.kreyon.in/" // Update with your ngrok URL

type PaymentStatus = "idle" | "pending" | "processing" | "completed" | "expired" | "failed"

const connection = new Connection(
  process.env.RPC_ENDPOINT!,
  "confirmed"
)

export default function PrimeMembershipPage() {
  const [status, setStatus] = useState<PaymentStatus>("idle")
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [reference, setReference] = useState<string>("")
  const [showQR, setShowQR] = useState(false)
  const qrContainerRef = useRef<HTMLDivElement>(null)
  const { showModal } = useSuccessModal()

  const benefits = [
    "Free shipping on all orders",
    "Exclusive member-only deals",
    "Early access to new products",
    "Priority customer support",
    "Special birthday rewards",
    "Access to premium content",
    "10% cashback on all purchases",
    "Monthly bonus SPI tokens",
  ]

  // Generate reference and show QR
  const handleSubscribe = () => {
    const ref = Keypair.generate().publicKey.toBase58()
    setReference(ref)
    setShowQR(true)
    setStatus("pending")
    toast.info("Scan QR code with your Solana wallet to complete subscription")
  }

  // Generate QR code
  useEffect(() => {
    if (!reference || !qrContainerRef.current || !showQR) return

    const generateQR = async () => {
      try {
        const url = `solana:${API_BASE_URL}/api/prime-subscription/${reference}`
        const qrCode = createQR(url, 350, "white")

        // Clear existing QR code first
        if (qrContainerRef.current) {
          qrContainerRef.current.innerHTML = ""
          qrCode.append(qrContainerRef.current)
        }
      } catch (error) {
        console.error("Error generating QR code:", error)
        toast.error("Failed to generate QR code")
      }
    }

    generateQR()
  }, [reference, showQR])

  // Check for payment
  const checkForPayment = async () => {
    if (!reference) {
      console.log("No reference available yet")
      return
    }

    try {
      setStatus("processing")
      const referencePubKey = new PublicKey(reference)

      console.log("Checking for payment with reference:", referencePubKey.toString())

      const signatureInfo = await findReference(connection, referencePubKey, {
        finality: "confirmed",
      })

      console.log("Transaction found:", signatureInfo.signature)

      setStatus("completed")
      
      showModal({
        title: "Prime Membership Activated! 🎉",
        message: "Welcome to Prime! Your exclusive benefits are now active.",
        icon: "check",
      })

      toast.success("Prime membership successfully activated!")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log("Payment check error:", error.message)
      if (error.name === "FindReferenceError" || error.message?.includes("not found")) {
        console.log("Transaction not found yet, will retry...")
        setStatus("pending")
      } else {
        console.error("Error checking payment:", error)
        setStatus("pending")
      }
    }
  }

  // Poll for payment status
  useEffect(() => {
    if (status !== "pending" && status !== "processing") return
    if (!reference) return

    // Check immediately
    checkForPayment()

    // Then poll every 2.5 seconds
    const interval = setInterval(() => {
      checkForPayment()
    }, 2500)

    return () => clearInterval(interval)
  }, [reference, status])

  // Timer countdown
  useEffect(() => {
    if (status !== "pending" && status !== "processing") return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setStatus("expired")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [status])

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Status badge
  const getStatusBadge = () => {
    switch (status) {
      case "idle":
        return null
      case "pending":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Awaiting Payment
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Checking Status
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Payment Successful
          </Badge>
        )
      case "expired":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Payment Expired
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Payment Failed
          </Badge>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
              <Crown className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-balance">Prime Membership</h1>
              <p className="text-muted-foreground">Unlock exclusive benefits and rewards</p>
            </div>
          </div>
        </div>

        {/* Benefits Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Prime Benefits</CardTitle>
            <CardDescription>Everything included with your Prime membership</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-secondary" />
                  </div>
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Price Display */}
            <div className="p-6 rounded-lg bg-gradient-to-br from-primary/5 to-secondary/5 border border-border mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Annual Subscription</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">{PRIME_PRICE}</span>
                    <span className="text-xl text-muted-foreground">SOL</span>
                    <span className="text-sm text-muted-foreground">/{PRIME_DURATION}</span>
                  </div>
                </div>
                <Badge className="bg-secondary text-secondary-foreground">Best Value</Badge>
              </div>
            </div>

            {/* Subscribe Button or QR Display */}
            {!showQR ? (
              <Button
                onClick={handleSubscribe}
                size="lg"
                className="w-full"
                disabled={status !== "idle"}
              >
                <Crown className="w-5 h-5 mr-2" />
                Subscribe to Prime
              </Button>
            ) : (
              <div className="space-y-4">
                {/* Status Badge */}
                {getStatusBadge() && (
                  <div className="flex items-center justify-between">
                    {getStatusBadge()}
                    {(status === "pending" || status === "processing") && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(timeLeft)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* QR Code Display */}
                {status !== "completed" && (
                  <Card className="border-2">
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-lg">Scan to Subscribe</CardTitle>
                      <CardDescription>
                        Use your Solana wallet to scan and complete payment
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                      <div
                        ref={qrContainerRef}
                        className="bg-white p-4 rounded-lg mb-4"
                      />
                      
                      {status === "processing" && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Checking payment status...</span>
                        </div>
                      )}

                      <div className="mt-4 text-center">
                        <p className="text-sm font-medium mb-1">{PRIME_PRICE} SOL</p>
                        <p className="text-xs text-muted-foreground">
                          Prime Membership - Annual Subscription
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Success State */}
                {status === "completed" && (
                  <Card className="border-2 border-green-200 bg-green-50/50">
                    <CardContent className="flex flex-col items-center py-8">
                      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Welcome to Prime! 🎉</h3>
                      <p className="text-sm text-muted-foreground text-center mb-4">
                        Your Prime membership is now active. Enjoy all the exclusive benefits!
                      </p>
                      <Link href="/">
                        <Button>
                          Return to Home
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}

                {/* Expired State */}
                {status === "expired" && (
                  <div className="text-center">
                    <p className="text-sm text-red-600 mb-4">
                      Payment session expired. Please try again.
                    </p>
                    <Button
                      onClick={() => {
                        setShowQR(false)
                        setStatus("idle")
                        setTimeLeft(300)
                        setReference("")
                      }}
                      variant="outline"
                    >
                      Try Again
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info */}
        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <p className="text-sm text-muted-foreground text-center">
            Payment is processed securely through Solana Pay. Your membership activates immediately
            after payment confirmation. No auto-renewal - you have full control.
          </p>
        </div>
      </div>
    </div>
  )
}
