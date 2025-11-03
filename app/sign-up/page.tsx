"use client";

import Link from "next/link";
import Image from "next/image";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { signInWithGoogle } from "@/lib/auth-helpers";
import { GoogleIcon } from "@/components/auth/GoogleIcon";
import { SIGN_UP_BACKGROUND_PUBLIC_ID } from "@/lib/cloudinary-backgrounds";

export default function SignUpPage() {
  const handleGoogleSignUp = async () => {
    try {
      await signInWithGoogle("/home");
    } catch (error) {
      console.error("Sign up error:", error);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Column - Image Background */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-100">
        <OptimizedImage
          src={SIGN_UP_BACKGROUND_PUBLIC_ID}
          alt="Design workspace"
          fill
          className="object-cover"
          priority
          quality="auto"
          crop="fill"
          gravity="auto"
        />
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/30 pointer-events-none z-0" />
        
        {/* Back button */}
        <Link
          href="/"
          className="absolute top-8 left-8 z-50 inline-flex items-center gap-2 px-4 py-2.5 bg-white/95 backdrop-blur-md rounded-xl text-gray-700 hover:bg-white hover:shadow-lg transition-all duration-200 shadow-md"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="font-medium">Back</span>
        </Link>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-end p-16">
          <div className="max-w-md space-y-6">
            <h2 className="text-5xl font-bold leading-tight text-white drop-shadow-lg">
              Start creating today
            </h2>
            <p className="text-xl text-white leading-relaxed drop-shadow-md">
              Join thousands of creators using Stage to build beautiful visuals. Export your designs in high quality and share with the world.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col relative">
        {/* Back button for mobile */}
        <Link
          href="/"
          className="lg:hidden absolute top-6 left-6 z-50 inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="font-medium">Back</span>
        </Link>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-8 sm:p-12">
          <div className="w-full max-w-md space-y-8">
            {/* Logo */}
            <Link href="/" className="inline-block">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="Stage"
                  width={48}
                  height={48}
                  className="w-12 h-12"
                />
                <span className="text-3xl font-bold text-gray-900">STAGE</span>
              </div>
            </Link>

            {/* Heading */}
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                Create an account
              </h1>
              <p className="text-gray-600 text-base">
                Start creating stunning visual designs today.
              </p>
            </div>

            {/* Google Sign Up Button */}
            <button
              onClick={handleGoogleSignUp}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 border-2 border-blue-600 hover:border-blue-700 shadow-sm hover:shadow-md"
            >
              <GoogleIcon className="w-5 h-5" />
              <span>Sign up with Google</span>
            </button>

            {/* Sign in link */}
            <p className="text-center text-gray-600 text-sm">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

