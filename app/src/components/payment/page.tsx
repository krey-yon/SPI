"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "react-toastify";
import { createQR, findReference } from "@solana/pay";
import { Connection, PublicKey } from "@solana/web3.js";
import { mintSPI } from "@/actions/reward";

type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "expired"
  | "failed";

const connection = new Connection("https://solana-devnet.g.alchemy.com/v2/s-2PSwB8NlPzdjTKg1a1a", "confirmed");

export default function PaymentPage() {
  const searchParams = useSearchParams();

  // Payment details from URL params
  const recipient = searchParams.get("recipient") || "merchant.sol";
  // const amount = searchParams.get("amount") || "0.5";
  const amount = 0.5;
  const label = searchParams.get("label") || "Merchant Store";
  const message = searchParams.get("message") || "Payment for order #12345";

  const [status, setStatus] = useState<PaymentStatus>("pending");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [reference, setReference] = useState<string>("");
  const [pdaAddress, setPdaAddress] = useState<string>("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const qrContainerRef = useRef<HTMLDivElement>(null);

  const params = useParams();
  const referencemain = params.url?.toString();

  // Generate reference and PDA on mount
  useEffect(() => {
    const generateReference = () => {
      const ref = `REF${Date.now()}${Math.random()
        .toString(36)
        .substring(2, 9)
        .toUpperCase()}`;
      setReference(ref);
      return ref;
    };

    const generatePDA = () => {
      // Simulated PDA address (in real implementation, derive from program)
      const pda = `${Math.random().toString(36).substring(2, 15)}${Math.random()
        .toString(36)
        .substring(2, 15)}`.toUpperCase();
      setPdaAddress(pda);
    };

    generateReference();
    generatePDA();
  }, []);

  // Generate QR code
  // useEffect(() => {
  //   if (!reference) return;

  //   const generateQR = () => {
  //     const url = "solana:https://7d0338b412f4.ngrok-free.app/api/create-transfer"
  //     const qrCodeFromSpay = createQR(url)
  //     console.log(qrCodeFromSpay)
  //     // qrContainerRef.current(qrCodeFromSpay)
  //     qrCodeFromSpay.append(qrContainerRef.current)
  //   }

  //   generateQR();
  // }, [reference, recipient, amount, label, message, toast]);

  // Check for payment with proper error handling
  const checkForPayment = async () => {
    if (!referencemain) {
      console.log("No reference available yet");
      return;
    }

    try {
      setStatus("processing");
      const referencePubKey = new PublicKey(referencemain);

      console.log(
        "Checking for payment with reference:",
        referencePubKey.toString()
      );

      // findReference throws an error if no transaction is found
      const signatureInfo = await findReference(connection, referencePubKey, {
        finality: "confirmed",
      }).then((ctx) => {
        console.log("Transaction found issuing rewards spi");
        console.log(ctx.signature)
        console.log(amount)
        // mintSPI(amount, referencemain)
      });

      console.log("Transaction found:", signatureInfo);
      toast(signatureInfo!)

      // Optional: Validate the transaction amount and recipient
      // const recipientPubKey = new PublicKey(recipient);
      // const amountInLamports = parseFloat(amount) * 1e9;
      // await validateTransfer(connection, signatureInfo.signature, {
      //   recipient: recipientPubKey,
      //   amount: BigInt(amountInLamports),
      //   reference: referencePubKey,
      // });

      setStatus("completed");
      toast.success("Payment confirmed on blockchain!");
    } catch (error: any) {
      console.log("Payment check error:", error.message);

      // FindReferenceError means no transaction found yet - this is normal
      if (
        error.name === "FindReferenceError" ||
        error.message?.includes("not found")
      ) {
        console.log("Transaction not found yet, will retry...");
        setStatus("pending");
      } else {
        // Other errors might be actual problems
        console.error("Error checking payment:", error);
        setStatus("pending");
        toast.error("Error checking payment status");
      }
    }
  };

  // Poll for payment status
  useEffect(() => {
    if (status !== "pending" && status !== "processing") return;
    if (!referencemain) return;

    // Check immediately
    checkForPayment();

    // Then poll every 5 seconds
    const interval = setInterval(() => {
      checkForPayment();
    }, 2500);

    return () => clearInterval(interval);
  }, [referencemain, status]);

  // Generate QR code
  useEffect(() => {
    if (!reference || !qrContainerRef.current) return;

    const generateQR = async () => {
      try {
        const url =
          `solana:https://839c0e76fe5c.ngrok-free.app/api/create-transaction/${referencemain}`;
        const qrCode = createQR(url, 350, "white");

        // Clear existing QR code first
        if (qrContainerRef.current) {
          qrContainerRef.current.innerHTML = "";
          qrCode.append(qrContainerRef.current);
        }
      } catch (error) {
        console.error("Error generating QR code:", error);
        toast.error("Failed to generate QR code");
      }
    };

    generateQR();
    checkForPayment();
  }, [reference, recipient, amount, label, message]);

  // Timer countdown
  useEffect(() => {
    if (status !== "pending" && status !== "processing") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setStatus("expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Check payment status
  const checkStatus = async () => {
    setStatus("processing");

    // Simulate API call to check transaction status
    setTimeout(() => {
      // In real implementation, check Solana blockchain for transaction with reference
      const isSuccess = Math.random() > 0.3; // 70% success rate for demo

      if (isSuccess) {
        setStatus("completed");
        toast("Your payment has been confirmed on the blockchain.");
      } else {
        setStatus("pending");
        toast("Transaction not found yet. Please try again.");
      }
    }, 2000);
  };

  // Copy to clipboard
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast(`${field} copied to clipboard`);
  };

  // Status badge
  const getStatusBadge = () => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Awaiting Payment
          </Badge>
        );
      case "processing":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Checking Status
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Payment Successful
          </Badge>
        );
      case "expired":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Payment Expired
          </Badge>
        );
      case "failed":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Payment Failed
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-4 pb-4">
          {/* Header with logo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  SP
                </span>
              </div>
              <div>
                <h1 className="font-bold text-lg">SolPay</h1>
                <p className="text-xs text-muted-foreground">Solana Payment</p>
              </div>
            </div>
            {getStatusBadge()}
          </div>

          <Separator />

          {/* Payment details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Paying to</span>
              <span className="font-semibold text-sm">{label}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Amount</span>
              <span className="text-2xl font-bold text-primary">
                {amount} SOL
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Message</span>
              <span className="text-sm text-right max-w-[200px] truncate">
                {message}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* QR Code */}
          {status !== "completed" && status !== "failed" && (
            <div className="space-y-3">
              <div
                ref={qrContainerRef}
                className="bg-white p-6 rounded-xl border-2 border-border flex items-center justify-center min-h-[280px]"
              >
                {!reference && (
                  <div className="w-[280px] h-[280px] flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Scan this QR code with your Solana wallet
              </p>
            </div>
          )}

          {/* Success/Failure state */}
          {status === "completed" && (
            <div className="text-center space-y-4 py-8">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-700">
                  Payment Successful!
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Your transaction has been confirmed on the Solana blockchain
                </p>
              </div>
            </div>
          )}

          {status === "expired" && (
            <div className="text-center space-y-4 py-8">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-red-700">
                  Payment Expired
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  This payment request has expired. Please request a new payment
                  link.
                </p>
              </div>
            </div>
          )}

          {/* Timer */}
          {(status === "pending" || status === "processing") && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">
                Time remaining:{" "}
                <span className="text-foreground font-bold">
                  {formatTime(timeLeft)}
                </span>
              </span>
            </div>
          )}

          {/* Transaction details */}
          <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold text-sm">Transaction Details</h3>

            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs text-muted-foreground">
                  Reference No.
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-mono text-right break-all">
                    {reference}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => copyToClipboard(reference, "Reference")}
                  >
                    {copiedField === "Reference" ? (
                      <Check className="w-3 h-3 text-green-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-start justify-between gap-2">
                <span className="text-xs text-muted-foreground">
                  PDA Address
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-mono text-right break-all max-w-[180px]">
                    {pdaAddress}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => copyToClipboard(pdaAddress, "PDA Address")}
                  >
                    {copiedField === "PDA Address" ? (
                      <Check className="w-3 h-3 text-green-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-start justify-between gap-2">
                <span className="text-xs text-muted-foreground">Recipient</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-mono text-right break-all max-w-[180px]">
                    {recipient}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => copyToClipboard(recipient, "Recipient")}
                  >
                    {copiedField === "Recipient" ? (
                      <Check className="w-3 h-3 text-green-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          {status === "pending" && (
            <Button onClick={checkStatus} className="w-full" size="lg">
              Check Payment Status
            </Button>
          )}

          {status === "processing" && (
            <Button disabled className="w-full" size="lg">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Checking Status...
            </Button>
          )}

          {(status === "completed" || status === "expired") && (
            <Button
              onClick={() => (window.location.href = "/")}
              className="w-full"
              size="lg"
              variant="outline"
            >
              Back to Home
            </Button>
          )}

          {/* Security note */}
          <p className="text-xs text-center text-muted-foreground">
            🔒 Secured by Solana blockchain. Never share your private keys.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
