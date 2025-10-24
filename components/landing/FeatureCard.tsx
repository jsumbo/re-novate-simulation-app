import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  variant?: 'primary' | 'secondary' | 'accent';
}

export function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  variant = 'primary' 
}: FeatureCardProps) {
  const variantStyles = {
    primary: "bg-white/10 border-white/20 backdrop-blur-sm",
    secondary: "bg-white/10 border-white/20 backdrop-blur-sm", 
    accent: "bg-white/10 border-white/20 backdrop-blur-sm"
  }

  const iconStyles = {
    primary: "text-white",
    secondary: "text-white",
    accent: "text-white"
  }

  return (
    <div 
      className={cn(
        "rounded-lg p-6 shadow-lg border text-center transition-all duration-300 hover:shadow-xl hover:scale-105 hover:bg-white/20",
        variantStyles[variant]
      )}
      role="listitem"
    >
      <div className="flex justify-center mb-4">
        <Icon 
          className={cn("h-12 w-12", iconStyles[variant])} 
          aria-hidden="true"
        />
      </div>
      <h3 className="text-xl font-semibold text-white mb-3">
        {title}
      </h3>
      <p className="text-gray-300 leading-relaxed">
        {description}
      </p>
    </div>
  )
}