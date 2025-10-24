"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { SuccessModal } from "./successModal"

interface ModalConfig {
  title: string
  message?: string
  icon?: "check" | "gift"
}

interface SuccessModalContextType {
  showModal: (config: ModalConfig) => void
}

const SuccessModalContext = createContext<SuccessModalContextType | undefined>(undefined)

export function SuccessModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalConfig | null>(null)

  const showModal = useCallback((config: ModalConfig) => {
    setModal(config)
  }, [])

  const closeModal = useCallback(() => {
    setModal(null)
  }, [])

  return (
    <SuccessModalContext.Provider value={{ showModal }}>
      {children}
      {modal && <SuccessModal {...modal} onClose={closeModal} />}
    </SuccessModalContext.Provider>
  )
}

export function useSuccessModal() {
  const context = useContext(SuccessModalContext)
  if (!context) {
    throw new Error("useSuccessModal must be used within SuccessModalProvider")
  }
  return context
}
