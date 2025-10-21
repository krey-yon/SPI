"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Crown, Zap, ArrowLeft } from "lucide-react"

const MERCHANT_WALLET = "merchant.sol" // Replace with actual merchant wallet

export default function PrimeMembershipPage() {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly")

  const plans = {
    monthly: {
      name: "Monthly Prime",
      price: 0.1,
      duration: "month",
      savings: null,
    },
    yearly: {
      name: "Yearly Prime",
      price: 1.0,
      duration: "year",
      savings: "Save 17%",
    },
  }

  const benefits = [
    "Free shipping on all orders",
    "Exclusive member-only deals",
    "Early access to new products",
    "Priority customer support",
    "Special birthday rewards",
    "Access to premium content",
  ]

  const handlePurchase = () => {
    const plan = plans[selectedPlan]
    const paymentUrl = `/payment?recipient=${MERCHANT_WALLET}&amount=${plan.price}&label=Prime Membership - ${plan.name}&message=Prime membership subscription for ${plan.duration}`
    window.location.href = paymentUrl
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

        {/* Plan Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Choose Your Plan</CardTitle>
            <CardDescription>Select the membership duration that works best for you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Monthly Plan */}
              <button
                onClick={() => setSelectedPlan("monthly")}
                className={`relative p-6 rounded-lg border-2 transition-all text-left ${
                  selectedPlan === "monthly"
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold">Monthly</h3>
                    <p className="text-sm text-muted-foreground">Flexible billing</p>
                  </div>
                  {selectedPlan === "monthly" && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-bold">{plans.monthly.price}</span>
                  <span className="text-lg text-muted-foreground">SOL</span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </div>
              </button>

              {/* Yearly Plan */}
              <button
                onClick={() => setSelectedPlan("yearly")}
                className={`relative p-6 rounded-lg border-2 transition-all text-left ${
                  selectedPlan === "yearly"
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {plans.yearly.savings && (
                  <Badge className="absolute -top-3 right-4 bg-secondary text-secondary-foreground">
                    {plans.yearly.savings}
                  </Badge>
                )}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold">Yearly</h3>
                    <p className="text-sm text-muted-foreground">Best value</p>
                  </div>
                  {selectedPlan === "yearly" && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-bold">{plans.yearly.price}</span>
                  <span className="text-lg text-muted-foreground">SOL</span>
                  <span className="text-sm text-muted-foreground">/year</span>
                </div>
              </button>
            </div>

            <Button onClick={handlePurchase} size="lg" className="w-full mt-6">
              <Zap className="w-5 h-5 mr-2" />
              Continue to Payment
            </Button>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Membership Benefits</CardTitle>
            <CardDescription>Everything included with Prime membership</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-secondary" />
                  </div>
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
          <p className="text-sm text-muted-foreground text-center">
            Payment is processed securely through Solana Pay. Your membership activates immediately after payment
            confirmation.
          </p>
        </div>
      </div>
    </div>
  )
}
