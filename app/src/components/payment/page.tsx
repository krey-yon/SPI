"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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
import { useSuccessModal } from "../successModalProvider";

type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "expired"
  | "failed";

// Move connection outside component to avoid recreation
const connection = new Connection(
  process.env.RPC_ENDPOINT || 
  "https://api.devnet.solana.com",
  "confirmed"
);

// Constants
const PAYMENT_TIMEOUT = 300; // 5 minutes
const POLL_INTERVAL = 2500; // 2.5 seconds
const DEFAULT_AMOUNT = 0.5;

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const { showModal } = useSuccessModal();

  // console.log(params.url)
  const [referenceKey, amountStr, percentageStr] = (params.url as string)?.split("-") || [];

  // Extract payment details
  // const recipient = searchParams.get("recipient") || "merchant.sol";
  const amount = Number(searchParams.get("amount")) || DEFAULT_AMOUNT;
  const label = searchParams.get("label") || "Merchant Store";
  const message = searchParams.get("message") || "Payment for order #12345";
  const discount = searchParams.get("discount") || "0";
  const reference = referenceKey?.toString() || "";

  // State
  const [status, setStatus] = useState<PaymentStatus>("pending");
  const [timeLeft, setTimeLeft] = useState(PAYMENT_TIMEOUT);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check for payment with proper error handling
  const checkForPayment = useCallback(async () => {
    if (!reference) {
      console.log("No reference available yet");
      return;
    }

    try {
      setStatus("processing");
      const referencePubKey = new PublicKey(reference);

      console.log("Checking for payment with reference:", referencePubKey.toString());

      const signatureInfo = await findReference(connection, referencePubKey, {
        finality: "confirmed",
      });

      console.log("Transaction found:", signatureInfo.signature);

      showModal({
        title: "Purchase Completed!",
        message: "Your order has been successfully placed and will be delivered soon.",
        icon: "check",
      });

      setStatus("completed");

      // Clear polling interval on success
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log("Payment check error:", error?.message || "Unknown error");

      // Check if it's a "transaction not found" error
      if (
        error?.name === "FindReferenceError" ||
        error?.message?.toLowerCase().includes("not found")
      ) {
        console.log("Transaction not found yet, will retry...");
        setStatus("pending");
      } else {
        console.error("Unexpected error checking payment:", error);
        setStatus("pending");
      }
    }
  }, [reference, showModal]);

  // Poll for payment status
  useEffect(() => {
    if (status !== "pending" && status !== "processing") return;
    if (!reference) return;

    // Check immediately
    checkForPayment();

    // Then poll every 2.5 seconds
    pollIntervalRef.current = setInterval(() => {
      checkForPayment();
    }, POLL_INTERVAL);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [reference, status, checkForPayment]);

  // Generate QR code
  useEffect(() => {
    if (!reference || !qrContainerRef.current) return;

    const generateQR = async () => {
      try {
        const url = `solana:https://spi.kreyon.in/api/create-transaction/${referenceKey}-${Math.floor(parseInt(amountStr))}-${Math.floor(parseInt(percentageStr))}`;
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
  }, [reference, amount, discount]);

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
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Copy to clipboard
  const copyToClipboard = useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast.success(`${field} copied to clipboard`);
  }, []);

  // Status badge component
  const StatusBadge = () => {
    const badgeConfig = {
      pending: {
        className: "bg-blue-50 text-blue-700 border-blue-200",
        label: "Awaiting Payment"
      },
      processing: {
        className: "bg-yellow-50 text-yellow-700 border-yellow-200",
        label: "Checking Status"
      },
      completed: {
        className: "bg-green-50 text-green-700 border-green-200",
        label: "Payment Successful"
      },
      expired: {
        className: "bg-red-50 text-red-700 border-red-200",
        label: "Payment Expired"
      },
      failed: {
        className: "bg-red-50 text-red-700 border-red-200",
        label: "Payment Failed"
      }
    };

    const config = badgeConfig[status];
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  // Copy button component
  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6 shrink-0"
      onClick={() => copyToClipboard(text, field)}
    >
      {copiedField === field ? (
        <Check className="w-3 h-3 text-green-600" />
      ) : (
        <Copy className="w-3 h-3" />
      )}
    </Button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-4 pb-4">
          {/* Header with logo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">SP</span>
              </div>
              <div>
                <h1 className="font-bold text-lg">SolPay</h1>
                <p className="text-xs text-muted-foreground">Solana Payment</p>
              </div>
            </div>
            <StatusBadge />
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
              <span className="text-2xl font-bold text-primary">{amount} SOL</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Message</span>
              <span className="text-sm text-right max-w-[200px] truncate">{message}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* QR Code */}
          {status !== "completed" && status !== "failed" && status !== "expired" && (
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

          {/* Success state */}
          {status === "completed" && (
            <div className="text-center space-y-4 py-8">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-700">Payment Successful!</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Your transaction has been confirmed on the Solana blockchain
                </p>
              </div>
            </div>
          )}

          {/* Expired state */}
          {status === "expired" && (
            <div className="text-center space-y-4 py-8">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-red-700">Payment Expired</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  This payment request has expired. Please request a new payment link.
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
                <span className="text-foreground font-bold">{formatTime(timeLeft)}</span>
              </span>
            </div>
          )}

          {/* Action buttons */}
          {status === "pending" && (
            <Button onClick={checkForPayment} className="w-full" size="lg">
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