import { NewLoginForm } from "@/components/auth/new-login-form"
import Image from "next/image"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left side - Image */}
        <div className="hidden lg:block relative bg-black">
          <Image
            src="/referrals-landing.jpg"
            alt="Students collaborating"
            fill
            className="object-cover"
            priority
            sizes="50vw"
          />
        </div>

        {/* Right side - Login Form */}
        <div className="flex items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-12">
          <div className="w-full max-w-md lg:max-w-lg">
            {/* Mobile header - only shown on small screens */}
            <div className="lg:hidden text-center mb-6 sm:mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2">RE-Novate</h1>
              <p className="text-sm sm:text-base text-gray-600">Entrepreneurship Simulator</p>
            </div>
            
            <NewLoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}
