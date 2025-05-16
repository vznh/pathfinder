"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogOverlay } from "@/components/prebuilt/Dialog";

interface GoogleSignInModalProps {
  isOpen: boolean
  onClose: () => void
  onSignInClick: () => void // Function to trigger the sign-in process
  signInError: string | null // Error message to display, if any
  appName?: string
}

export function GoogleSignInModal({
  isOpen,
  onClose,
  onSignInClick,
  signInError,
  appName = "pathfinder"
}: GoogleSignInModalProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Don't render server-side or during hydration mismatch
  if (!isMounted) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Rely on prebuilt DialogOverlay for background styling */}
      <DialogOverlay className="bg-black/1 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 transition-all ease-in-out duration-300" />
      {/* Make Content background transparent, style inner div */}
      <DialogContent className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 transform rounded-xl border border-gray-700 bg-transparent p-0 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
        {/* Apply dark bg and white text to this inner container */}
        <div className="flex flex-col items-start justify-center rounded-xl bg-gray-900 p-8 pt-12 w-full text-white">
          {/* Logo */}
          <div className="mb-4 text-5xl font-bold">⌘</div>

          {/* Title */}
          <h2 className="text-2xl mb-2">Sign in to continue</h2>

          {/* Text - Changes based on sign-in error */}
          {signInError ? (
            <p className="text-left text-red-400 mb-8 text-lg">
              {signInError} {/* Display the error passed via props */}
            </p>
          ) : (
            <p className="text-left text-gray-300 mb-8 text-lg"> {/* Lighter gray for dark bg */}
              Student authentication with your @ucsc.edu email is needed in order to access{" "}
              <strong>{appName}</strong>
            </p>
          )}

          {/* Google Sign In Button - Adjusted for dark bg */}
          <button
            className="w-full py-3 px-4 bg-white border border-gray-300 rounded-md shadow-sm flex items-center justify-center gap-3 hover:bg-gray-200 text-gray-700 transition-colors duration-200 ease-in-out"
            onClick={onSignInClick} // Use the passed-in function
          >
            {/* Google Logo */}
            <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>
            <span className="font-medium">Sign in with Google</span> {/* Text color comes from button */}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
