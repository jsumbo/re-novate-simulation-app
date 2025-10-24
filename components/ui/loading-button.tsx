import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { ButtonProps } from "@/components/ui/button"
import { ReactNode } from "react"

interface LoadingButtonProps extends Omit<ButtonProps, 'children'> {
  loading?: boolean
  loadingText?: string
  children: ReactNode
}

export function LoadingButton({ 
  loading = false, 
  loadingText = "Loading...", 
  children, 
  disabled,
  ...props 
}: LoadingButtonProps) {
  return (
    <Button 
      disabled={loading || disabled} 
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {loading ? loadingText : children}
    </Button>
  )
}