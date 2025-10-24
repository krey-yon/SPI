"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { CheckCircle2, Gift, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SuccessModalProps {
  title: string
  message?: string
  icon?: "check" | "gift"
  onClose: () => void
}

export function SuccessModal({ title, message, icon = "check", onClose }: SuccessModalProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger animation on mount
    setTimeout(() => setIsVisible(true), 10)

    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 200)
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const IconComponent = icon === "gift" ? Gift : CheckCircle2

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        isVisible ? "bg-black/50 backdrop-blur-sm" : "bg-black/0"
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-background rounded-lg shadow-2xl max-w-md w-full p-6 relative transition-all duration-500 ${
          isVisible ? "scale-100 opacity-100 rotate-0" : "scale-50 opacity-0 -rotate-12"
        }`}
        style={{
          transformOrigin: "center center",
          animation: isVisible ? "graffitiSpray 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)" : "none",
        }}
      >
        {/* Spray paint splatter effects */}
        {isVisible && (
          <>
            <div
              className="absolute -top-2 -left-2 w-4 h-4 bg-emerald-500/30 rounded-full blur-sm"
              style={{ animation: "splatter1 0.4s ease-out" }}
            />
            <div
              className="absolute -top-1 -right-3 w-3 h-3 bg-emerald-400/20 rounded-full blur-sm"
              style={{ animation: "splatter2 0.5s ease-out" }}
            />
            <div
              className="absolute -bottom-2 -left-3 w-5 h-5 bg-emerald-600/20 rounded-full blur-sm"
              style={{ animation: "splatter3 0.45s ease-out" }}
            />
            <div
              className="absolute -bottom-1 -right-2 w-3 h-3 bg-emerald-500/25 rounded-full blur-sm"
              style={{ animation: "splatter4 0.55s ease-out" }}
            />
          </>
        )}

        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 h-8 w-8 text-muted-foreground hover:text-foreground z-10"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Icon with staggered animation */}
        <div
          className={`flex justify-center mb-4 transition-all duration-300 delay-100 ${
            isVisible ? "scale-100 opacity-100 rotate-0" : "scale-0 opacity-0 rotate-180"
          }`}
        >
          <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-full p-3">
            <IconComponent className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        {/* Content with staggered animation */}
        <div
          className={`text-center space-y-2 transition-all duration-300 delay-200 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <h2 className="text-2xl font-bold text-balance">{title}</h2>
          {message && <p className="text-muted-foreground text-pretty">{message}</p>}
        </div>

        {/* Action button with staggered animation */}
        <div
          className={`mt-6 transition-all duration-300 delay-300 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <Button onClick={handleClose} className="w-full" size="lg">
            Continue
          </Button>
        </div>
      </div>

      <style jsx>{`
        @keyframes graffitiSpray {
          0% {
            transform: scale(0.5) rotate(-12deg);
            opacity: 0;
            filter: blur(4px);
          }
          50% {
            transform: scale(1.05) rotate(2deg);
            filter: blur(0px);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
            filter: blur(0px);
          }
        }

        @keyframes splatter1 {
          0% {
            transform: scale(0) translate(0, 0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: scale(1) translate(-8px, -8px);
            opacity: 0.3;
          }
        }

        @keyframes splatter2 {
          0% {
            transform: scale(0) translate(0, 0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: scale(1) translate(12px, -6px);
            opacity: 0.2;
          }
        }

        @keyframes splatter3 {
          0% {
            transform: scale(0) translate(0, 0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: scale(1) translate(-10px, 10px);
            opacity: 0.2;
          }
        }

        @keyframes splatter4 {
          0% {
            transform: scale(0) translate(0, 0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: scale(1) translate(8px, 8px);
            opacity: 0.25;
          }
        }
      `}</style>
    </div>
  )
}
