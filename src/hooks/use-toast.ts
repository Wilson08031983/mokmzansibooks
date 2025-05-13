
import * as React from "react"
import { toast as sonnerToast, Toaster as Sonner } from "sonner"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 1000000

type ToastActionElement = React.ReactElement<any, string | React.JSXElementConstructor<any>>

type ToastProps = React.ComponentPropsWithoutRef<typeof Sonner>

type ToastActionProps = {
  altText: string
  onClick: () => void
  children?: React.ReactNode
}

type ToastVariants = "default" | "destructive" | "outline" | "secondary" | "client" | "credit" | "overdue" | "outstanding" | "bank" | "success"

const actionClassName = "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive"

const toastVariants = {
  default: {
    title: "text-foreground",
    description: "text-muted-foreground",
    container: "bg-background border",
  },
  destructive: {
    title: "text-destructive-foreground",
    description: "text-destructive-foreground/90",
    container: "bg-destructive border-destructive border text-white",
  },
  outline: {
    title: "text-foreground",
    description: "text-muted-foreground",
    container: "bg-transparent border",
  },
  secondary: {
    title: "text-secondary-foreground",
    description: "text-secondary-foreground/90",
    container: "bg-secondary border-secondary border",
  },
  client: {
    title: "text-blue-800",
    description: "text-blue-700",
    container: "bg-blue-50 border-blue-200 border",
  },
  credit: {
    title: "text-green-800",
    description: "text-green-700",
    container: "bg-green-50 border-green-200 border",
  },
  overdue: {
    title: "text-red-800",
    description: "text-red-700",
    container: "bg-red-50 border-red-200 border",
  },
  outstanding: {
    title: "text-orange-800",
    description: "text-orange-700",
    container: "bg-orange-50 border-orange-200 border",
  },
  bank: {
    title: "text-emerald-800",
    description: "text-emerald-700",
    container: "bg-emerald-50 border-emerald-200 border",
  },
  success: {
    title: "text-green-800",
    description: "text-green-700",
    container: "bg-green-50 border-green-200 border",
  },
}

export type ToastActionType = React.FC<ToastActionProps>

export type ToastT = Sonner

type ToastOptions = {
  title?: string
  description?: React.ReactNode
  variant?: ToastVariants
  action?: ToastActionElement
}

const Toast: React.FC<ToastProps> = ({
  className,
  ...props
}) => {
  return (
    <Sonner
      className={className}
      toastOptions={{
        classNames: {
          toast: "group flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
          title: "text-sm font-semibold",
          description: "text-sm opacity-90",
          actionButton: actionClassName,
          cancelButton: actionClassName,
        },
      }}
      {...props}
    />
  )
}

export const useToast = () => {
  const [toasts, setToasts] = React.useState<ToastOptions[]>([])

  const toast = (options: ToastOptions) => {
    const { title, description, variant = "default", action } = options
    const titleClass = toastVariants[variant]?.title
    const descriptionClass = toastVariants[variant]?.description
    const containerClass = toastVariants[variant]?.container

    sonnerToast(title, {
      description,
      action,
      className: containerClass,
      classNames: {
        title: titleClass,
        description: descriptionClass,
      },
    })

    setToasts((prevToasts) => [...prevToasts, options])
  }

  return { toast, toasts, setToasts, dismiss: sonnerToast.dismiss }
}

export { Toast, toast as sonnerToast }

export const toast = (options: ToastOptions) => {
  const { title, description, variant = "default", action } = options
  const titleClass = toastVariants[variant]?.title
  const descriptionClass = toastVariants[variant]?.description
  const containerClass = toastVariants[variant]?.container

  sonnerToast(title, {
    description,
    action,
    className: containerClass,
    classNames: {
      title: titleClass,
      description: descriptionClass,
    },
  })
}
