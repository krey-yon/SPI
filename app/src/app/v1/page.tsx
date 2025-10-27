"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, ArrowRight, Package, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { Keypair } from "@solana/web3.js";
import { createReferenceKey } from "@/actions/db";

export default function CheckoutDashboard() {
  const router = useRouter();

  const orderItems = [
    { id: 1, name: "Premium Subscription", quantity: 1, price: 49.99 },
    { id: 2, name: "API Credits (1000)", quantity: 2, price: 19.99 },
    { id: 3, name: "Custom Domain", quantity: 1, price: 12.99 },
  ];

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const taxRate = 0.08; // 8% tax
  const tax = subtotal * taxRate;
  const platformFee = 2.5;
  const total = subtotal + tax + platformFee;
  //add error handling here
  const handleProceedToPayment = async () => {
    const reference = Keypair.generate().publicKey.toString();
    await createReferenceKey(reference);
    router.push(`/raw/payment/${reference}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                SolPay Checkout
              </h1>
              <p className="text-xs text-muted-foreground">
                Secure Payment Gateway
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            Secure Connection
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground mb-2">Checkout</h2>
          <p className="text-muted-foreground">
            Review your order and complete payment
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Order Summary
                </CardTitle>
                <CardDescription>
                  Review your items before payment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                        <Package className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {item.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Payment Method Selection */}
            {/*<Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Choose how you want to pay on Solana</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                  <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary transition-colors cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <RadioGroupItem value="wallet" id="wallet" className="mt-1" />
                    <Label htmlFor="wallet" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3 mb-2">
                        <Wallet className="w-5 h-5 text-primary" />
                        <span className="font-semibold text-foreground">Direct Wallet Payment</span>
                        <Badge variant="secondary" className="ml-auto">
                          Recommended
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Connect your Solana wallet (Phantom, Solflare, Backpack) for instant payment
                      </p>
                      <div className="mt-2 flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          Instant
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Lowest Fees
                        </Badge>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary transition-colors cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <RadioGroupItem value="qr" id="qr" className="mt-1" />
                    <Label htmlFor="qr" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3 mb-2">
                        <QrCode className="w-5 h-5 text-secondary" />
                        <span className="font-semibold text-foreground">QR Code Payment</span>
                        <Badge variant="outline" className="ml-auto">
                          Mobile
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Scan QR code with your mobile Solana wallet for quick checkout
                      </p>
                      <div className="mt-2 flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          Mobile Friendly
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          No Extension
                        </Badge>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>*/}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>Order breakdown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium text-foreground">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tax (8%)</span>
                    <span className="font-medium text-foreground">
                      ${tax.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Platform Fee</span>
                    <span className="font-medium text-foreground">
                      ${platformFee.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Solana Network Fee
                    </span>
                    <span className="font-medium text-green-600">$0.00025</span>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-foreground">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-foreground">
                    ${total.toFixed(2)}
                  </span>
                </div>

                <div className="pt-2 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Estimated in SOL</span>
                    <span className="font-mono">~0.45 SOL</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Transaction Speed</span>
                    <span>~400ms</span>
                  </div>
                </div>

                <Separator />

                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={handleProceedToPayment}
                >
                  Proceed to Payment
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <div className="pt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    </div>
                    <span>Secured by Solana blockchain</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    </div>
                    <span>Decentralized & trustless</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
