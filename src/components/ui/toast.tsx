"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastProps {
  id: string
  title?: string
  description?: string
  message?: string
  variant?: "success" | "error" | "warning" | "info"
  type?: "success" | "error" | "warning" | "info"
  duration?: number
  action?: ToastAction
}

interface ToastContextType {
  toasts: ToastProps[]
  addToast: (toast: {
    title?: string
    description?: string
    message?: string
    variant?: "success" | "error" | "warning" | "info"
    type?: "success" | "error" | "warning" | "info"
    duration?: number
    action?: ToastAction
  }) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const addToast = React.useCallback((toast: {
    title?: string
    description?: string
    message?: string
    variant?: "success" | "error" | "warning" | "info"
    type?: "success" | "error" | "warning" | "info"
    duration?: number
    action?: ToastAction
  }) => {
    const id = Math.random().toString(36).substr(2, 9)
    const finalToast = { id, ...toast }
    setToasts(prev => [...prev, finalToast])

    const duration = toast.duration || 4000
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
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100] flex flex-col gap-3 pointer-events-none max-w-[calc(100vw-2rem)] sm:max-w-md">
      {toasts.map(toast => {
        const type = toast.type || toast.variant || "info"
        const message = toast.message || toast.description
        const title = toast.title

        return (
          <Toast
            key={toast.id}
            id={toast.id}
            type={type}
            title={title}
            message={message}
            action={toast.action}
            onRemove={onRemove}
          />
        )
      })}
    </div>
  )
}

function Toast({
  id,
  type,
  title,
  message,
  action,
  onRemove,
}: {
  id: string
  type: "success" | "error" | "warning" | "info"
  title?: string
  message?: string
  action?: ToastAction
  onRemove: (id: string) => void
}) {
  return (
    <div
      className={cn(
        "pointer-events-auto flex flex-col sm:flex-row items-start gap-3 px-4 py-4 rounded-2xl shadow-xl border transition-all duration-300",
        "animate-in slide-in-from-bottom-4 sm:slide-in-from-right-4 fade-in duration-300",
        type === "success" && "bg-emerald-50 border-emerald-200 text-emerald-900",
        type === "error" && "bg-red-50 border-red-200 text-red-900",
        type === "warning" && "bg-amber-50 border-amber-200 text-amber-900",
        type === "info" && "bg-white border-primary/10 text-foreground"
      )}
    >
      <div className="flex items-start gap-3 flex-1">
        {type === "success" && <CheckCircle className="h-6 w-6 text-emerald-500 shrink-0 mt-0.5" />}
        {type === "error" && <AlertCircle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />}
        {type === "warning" && <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />}
        {type === "info" && <Info className="h-6 w-6 text-primary shrink-0 mt-0.5" />}
        
        <div className="flex-1 min-w-0">
          {title && <p className="text-sm font-black tracking-wide">{title}</p>}
          {message && <p className="text-sm font-medium mt-1 text-foreground/80">{message}</p>}
          
          {action && (
            <button
              onClick={() => {
                action.onClick()
                onRemove(id)
              }}
              className={cn(
                "mt-3 inline-flex items-center text-sm font-bold transition-colors",
                type === "success" && "text-emerald-700 hover:text-emerald-900",
                type === "error" && "text-red-700 hover:text-red-900",
                type === "warning" && "text-amber-700 hover:text-amber-900",
                type === "info" && "text-primary hover:text-primary/80"
              )}
            >
              {action.label}
            </button>
          )}
        </div>
      </div>
      
      <button
        onClick={() => onRemove(id)}
        className="p-1.5 rounded-full hover:bg-black/5 transition-colors shrink-0"
        aria-label="Zamknij powiadomienie"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
