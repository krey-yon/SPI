"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  ArrowRight,
  Package,
  // CreditCard,
  Minus,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Keypair, PublicKey } from "@solana/web3.js";
import { createReferenceKey } from "@/actions/db";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { readUserAsaPdaData } from "@/utils/parsePda";

export default function CheckoutDashboard() {
  const router = useRouter();

  const initialItems = [
    { id: 1, name: "Premium Subscription", quantity: 1, price: 49.99 },
    { id: 2, name: "API Credits (1000)", quantity: 2, price: 19.99 },
    { id: 3, name: "Custom Domain", quantity: 1, price: 12.99 },
  ];

  const [orderItems, setOrderItems] = useState(initialItems);
  const [discount, setDiscount] = useState(0);

  const handleQuantityChange = (id: number, delta: number) => {
    setOrderItems(
      orderItems.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      )
    );
  };

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const taxRate = 0.08; // 8% tax
  const tax = subtotal * taxRate;
  const platformFee = 2.5;
  const initialTotal = subtotal + tax + platformFee;
  const discountedTotal = initialTotal - (initialTotal * discount) / 100;

  const handleProceedToPayment = async () => {
    const reference = Keypair.generate().publicKey.toString();
    await createReferenceKey(reference);
    router.push(`/v1/payment/${reference}-${Math.floor(initialTotal)}-${Math.floor(discount)}`);
  };

  const discountOptions = [0, 25, 50, 75, 100];

  async function handlefindasadata() {
    const res = await readUserAsaPdaData(new PublicKey("2J9K8kF4BrpAeseRAYZN2HzFaFy5P5pCyFwEQeoY1rAZ"))
    console.log(res);
  }
  
  return (
    <div className="min-h-screen bg-background">
      <button onClick={handlefindasadata} >click me</button>
      {/*<header className="border-b border-border bg-card">
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
      </header>*/}

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
                  Review and adjust your items before payment
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
                        <div className="flex items-center gap-2 mt-1">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-6 w-6"
                            onClick={() => handleQuantityChange(item.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium w-4 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-6 w-6"
                            onClick={() => handleQuantityChange(item.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
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

            {/* New Discount Card */}
            <Card>
              <CardHeader>
                <CardTitle>Special Offers</CardTitle>
                <CardDescription>
                  Use your loyalty coins for a discount on your order.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-foreground">
                      Apply Discount
                    </Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Select a percentage to apply from your coin balance.
                    </p>
                    <div className="flex gap-2">
                      {discountOptions.map((option) => (
                        <Button
                          key={option}
                          variant={discount === option ? "default" : "outline"}
                          onClick={() => setDiscount(option)}
                        >
                          {option}%
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                  {discount > 0 && (
                    <div className="flex items-center justify-between text-sm text-green-600">
                      <span className="text-muted-foreground">
                        Discount ({discount}%)
                      </span>
                      <span className="font-medium">
                        -${(initialTotal - discountedTotal).toFixed(2)}
                      </span>
                    </div>
                  )}
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
                    ${discountedTotal.toFixed(2)}
                  </span>
                </div>

                <div className="pt-2 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Estimated in SOL</span>
                    <span className="font-mono">
                      ~{(discountedTotal / 140).toFixed(4)} SOL
                    </span>
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
