import { FeatureCard } from "./FeatureCard"
import { FeatureData } from "@/lib/landing-config"

interface FeaturesSectionProps {
  features: FeatureData[];
}

export function FeaturesSection({ features }: FeaturesSectionProps) {
  return (
    <section className="py-16 px-4 bg-gray-50" aria-label="Platform features">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto" role="list">
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
      </div>
    </section>
  )
}