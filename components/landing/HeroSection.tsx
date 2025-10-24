import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"
import { FeatureCard } from "./FeatureCard"
import { FeatureData } from "@/lib/landing-config"

interface HeroSectionProps {
  backgroundImage: string;
  title: string;
  subtitle: string;
  features: FeatureData[];
  onStudentClick: () => void;
  onFacilitatorClick: () => void;
}

export function HeroSection({
  backgroundImage,
  title,
  subtitle,
  features,
  onStudentClick,
  onFacilitatorClick,
}: HeroSectionProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    const img = new Image()
    img.onload = () => setImageLoaded(true)
    img.src = backgroundImage
  }, [backgroundImage])

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat bg-black transition-all duration-500"
      style={{
        backgroundImage: imageLoaded 
          ? `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${backgroundImage})`
          : 'linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8))',
      }}
      aria-label="Hero section with main call-to-action"
    >
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-6xl mx-auto animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight animate-slide-up">
            {title}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed animate-slide-up animation-delay-200" role="banner">
            {subtitle}
          </p>
          
          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-slide-up animation-delay-300">
            {features.map((feature) => (
              <FeatureCard
                key={feature.id}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                variant={feature.variant}
              />
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto animate-slide-up animation-delay-400">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-gray-200 text-lg px-8 py-6 w-full sm:w-auto min-w-[200px] transition-all duration-300 focus:ring-4 focus:ring-gray-300"
              onClick={onStudentClick}
              aria-label="Get started as a student user"
            >
              Get Started as Student
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white hover:text-black text-lg px-8 py-6 w-full sm:w-auto min-w-[200px] transition-all duration-300 focus:ring-4 focus:ring-white/30"
              onClick={onFacilitatorClick}
              aria-label="Access facilitator dashboard"
            >
              Facilitator Dashboard
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}