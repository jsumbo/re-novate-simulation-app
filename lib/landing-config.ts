import { Briefcase, Bot, TrendingUp } from "lucide-react"
import { LucideIcon } from "lucide-react"

export interface FeatureData {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  variant: 'primary' | 'secondary' | 'accent';
}

export interface LandingPageConfig {
  hero: {
    title: string;
    subtitle: string;
    backgroundImage: string;
  };
  features: FeatureData[];
  actions: {
    studentButton: {
      text: string;
      href: string;
    };
    facilitatorButton: {
      text: string;
      href: string;
    };
  };
}

export const landingPageConfig: LandingPageConfig = {
  hero: {
    title: "Welcome to RE-Novate",
    subtitle: "Entrepreneurial decision driven simulator for Liberian secondary students.",
    backgroundImage: "/referrals-landing.jpg"
  },
  features: [
    {
      id: "career-focused",
      icon: Briefcase,
      title: "Career-Focused",
      description: "Tailored scenarios for you.",
      variant: "primary"
    },
    {
      id: "ai-feedback", 
      icon: Bot,
      title: "AI Feedback",
      description: "Personalized guidance and insights.",
      variant: "secondary"
    },
    {
      id: "progress-tracking",
      icon: TrendingUp,
      title: "Progress Tracking", 
      description: "Visual skill growth and analytics.",
      variant: "accent"
    }
  ],
  actions: {
    studentButton: {
      text: "Get Started as Student",
      href: "/login"
    },
    facilitatorButton: {
      text: "Facilitator Dashboard",
      href: "/teacher/dashboard"
    }
  }
}