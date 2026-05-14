"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"

export interface ToastProps {
  id: string
  message: string
  type?: "success" | "error" | "info"
  duration?: number
}

interface ToastContextType {
  toasts: ToastProps[]
  addToast: (message: string, type?: "success" | "error" | "info", duration?: number) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const addToast = React.useCallback((message: string, type: "success" | "error" | "info" = "info", duration = 3000) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { id, message, type, duration }])

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

function ToastContainer({ toasts, onRemove }: { toasts: ToastProps[]; onRemove: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg border animate-in slide-in-from-right-5 duration-300",
            toast.type === "success" && "bg-emerald-50 border-emerald-200 text-emerald-800",
            toast.type === "error" && "bg-red-50 border-red-200 text-red-800",
            toast.type === "info" && "bg-white border-primary/10 text-foreground"
          )}
        >
          {toast.type === "success" && <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />}
          {toast.type === "error" && <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />}
          {toast.type === "info" && <Info className="h-5 w-5 text-primary shrink-0" />}
          <p className="text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => onRemove(toast.id)}
            className="ml-2 p-1 rounded-full hover:bg-black/5 transition-colors shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}