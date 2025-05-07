// components/VariableNotch
// This could potentially be used for most actions, but for now it's just authentication.

// Modified to disappear after authentication after fading out for 5s.
"use client"

import type React from "react"

import { useState, useEffect } from "react" // Added useEffect
import { motion, AnimatePresence } from "framer-motion"
import { MagnifyingGlassIcon, ClockIcon, MixerHorizontalIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import { cn } from "@/utils/";
import { GoogleSignInModal } from "@/components/specific/SignInOverlay"; // Import the sign-in modal
import { createClient } from "@/supabase/component"; // Import Supabase client

type IconType = "search" | "recent" | "filters" | "plus" | null
type AuthState = "unauthenticated" | "authenticated" | "main"

// SVG for the loading state
const LoadingIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.5 4.625C6.12132 4.625 6.625 4.12132 6.625 3.5C6.625 2.87868 6.12132 2.375 5.5 2.375C4.87868 2.375 4.375 2.87868 4.375 3.5C4.375 4.12132 4.87868 4.625 5.5 4.625ZM9.5 4.625C10.1213 4.625 10.625 4.12132 10.625 3.5C10.625 2.87868 10.1213 2.375 9.5 2.375C8.87868 2.375 8.375 2.87868 8.375 3.5C8.375 4.12132 8.87868 4.625 9.5 4.625ZM10.625 7.5C10.625 8.12132 10.1213 8.625 9.5 8.625C8.87868 8.625 8.375 8.12132 8.375 7.5C8.375 6.87868 8.87868 6.375 9.5 6.375C10.1213 6.375 10.625 6.87868 10.625 7.5ZM5.5 8.625C6.12132 8.625 6.625 8.12132 6.625 7.5C6.625 6.87868 6.12132 6.375 5.5 6.375C4.87868 6.375 4.375 6.87868 4.375 7.5C4.375 8.12132 4.87868 8.625 5.5 8.625ZM10.625 11.5C10.625 12.1213 10.1213 12.625 9.5 12.625C8.87868 12.625 8.375 12.1213 8.375 11.5C8.375 10.8787 8.87868 10.375 9.5 10.375C10.1213 10.375 10.625 10.8787 10.625 11.5ZM5.5 12.625C6.12132 12.625 6.625 12.1213 6.625 11.5C6.625 10.8787 6.12132 10.375 5.5 10.375C4.87868 10.375 4.375 10.8787 4.375 11.5C4.375 12.1213 4.87868 12.625 5.5 12.625Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
  </svg>
);

export function VariableNotchDialog() {
  const [activeIcon, setActiveIcon] = useState<IconType>(null)
  const [authState, setAuthState] = useState<AuthState>("unauthenticated")
  const [isSignInOverlayOpen, setIsSignInOverlayOpen] = useState(false);
  const [isSignInInitiated, setIsSignInInitiated] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setAuthState("authenticated");
        setIsSignInOverlayOpen(false);
        setIsSignInInitiated(false);
        setSignInError(null);
      } else if (event === 'SIGNED_OUT') {
        setAuthState("unauthenticated");
        setIsSignInOverlayOpen(false); // Ensure overlay is closed on sign out
        setIsSignInInitiated(false);
      }
    });
    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  useEffect(() => {
    if (authState === "authenticated") {
      const timer = setTimeout(() => {
        setAuthState("main");
      }, 2000); // Duration for "Authenticated" message
      return () => clearTimeout(timer);
    }
  }, [authState]);

  const handleIconClick = (icon: IconType) => {
    setActiveIcon(activeIcon === icon ? null : icon)
  }

  const handleUnauthenticatedClick = () => {
    setIsSignInInitiated(true);
    setIsSignInOverlayOpen(true);
    setSignInError(null); // Clear previous errors
  };

  const handleSignInModalClose = () => {
    setIsSignInOverlayOpen(false);
    // If modal is closed without signing in, reset initiated state
    if (authState === "unauthenticated") {
      setIsSignInInitiated(false);
    }
  };

  const handleActualSignIn = async () => {
    setSignInError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.href, // Or your desired redirect path
      },
    });
    if (error) {
      setSignInError(error.message);
      setIsSignInInitiated(false); // Reset if OAuth initiation fails
    }
    // On success, Supabase redirects and onAuthStateChange will handle it upon return.
  };

  // If not authenticated, show auth dialog or loading state
  if (authState === "unauthenticated") {
    return (
      <>
        <motion.div className="flex items-center justify-center w-full" layout>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-neutral-100 rounded-md border border-neutral-800/20 px-3 py-1 cursor-pointer"
            onClick={handleUnauthenticatedClick}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center space-x-2">
              {isSignInInitiated ? (
                <>
                  <LoadingIcon />
                  <span className="text-neutral-900">Loading</span>
                </>
              ) : (
                <>
                  <span className="text-red-500 text-lg">✱</span>
                  <span className="text-neutral-900">Not logged in</span>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
        <GoogleSignInModal
          isOpen={isSignInOverlayOpen}
          onClose={handleSignInModalClose}
          onSignInClick={handleActualSignIn}
          signInError={signInError}
          appName="pathfinder" // You can customize this if needed
        />
      </>
    )
  }

  // If in authenticated state, show the authenticated message
  if (authState === "authenticated") {
    return (
      <motion.div className="flex items-center justify-center w-full" layout>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-neutral-100 rounded-md border border-neutral-800/20 px-3 py-1"
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center space-x-2">
            <span className="text-green-500 text-lg">✚</span>
            <span className="text-neutral-900">Authenticated</span>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // Main dialog with icons or expanded content
  return (
    <div className="flex items-center justify-center w-full">
      <motion.div
        layout
        className={cn(
          "relative rounded-md border border-neutral-800/20 overflow-hidden",
          activeIcon === "plus"
            ? "bg-neutral-100 p-4"
            : activeIcon
            ? "bg-neutral-100 p-4"
            : "bg-neutral-100 p-2",
        )}
        initial={false}
        animate={{
          width: activeIcon ? "auto" : "auto",
          height: activeIcon ? "auto" : "auto",
        }}
        transition={{
          duration: 0.3,
          ease: [0.25, 0.1, 0.25, 1],
          layout: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
          backgroundColor: { duration: 0.5 },
        }}
      >
        {/* Icons Bar or Content Area */}
        <AnimatePresence mode="wait">
          {!activeIcon ? (
            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <IconButton
                icon={<MagnifyingGlassIcon className="w-5 h-5" />}
                onClick={() => handleIconClick("search")}
                label="Search"
              />
              <IconButton
                icon={<ClockIcon className="w-5 h-5" />}
                onClick={() => handleIconClick("recent")}
                label="Recent"
              />
              <IconButton
                icon={<MixerHorizontalIcon className="w-5 h-5" />}
                onClick={() => handleIconClick("filters")}
                label="Filters"
              />
              <IconButton
              icon={<PlusCircledIcon className="w-5 h-5" />}
                onClick={() => handleIconClick("plus")}
                label="Add"
              />
            </motion.div>
          ) : (
            <motion.div
              className="w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeIcon === "search" && <SearchContent />}
              {activeIcon === "plus" && <WaypointContent />}
              {/* Other content components would go here */}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back Bar */}
        {activeIcon && (
          <div className="absolute bottom-1 left-0 right-0 flex justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn(
                "w-24 h-1 rounded-full cursor-pointer transition-colors",
                "bg-neutral-400/40 hover:bg-neutral-400/60",
              )}
              onClick={() => setActiveIcon(null)}
              role="button"
              aria-label="Return to menu"
              transition={{ duration: 0.2 }}
            />
          </div>
        )}
      </motion.div>
    </div>
  )
}

interface IconButtonProps {
  icon: React.ReactNode
  onClick: () => void
  label: string
}

function IconButton({ icon, onClick, label }: IconButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="relative flex items-center justify-center p-2 rounded-full transition-colors text-neutral-600 hover:bg-neutral-200/50"
      onClick={onClick}
      aria-label={label}
      transition={{ duration: 0.2 }}
    >
      {icon}
    </motion.button>
  )
}

function SearchContent() {
  return (
    <div className="w-64">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full pl-10 pr-4 py-2 bg-neutral-200/50 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-400"
          autoFocus
        />
      </div>
    </div>
  )
}

function WaypointContent() {
  return (
    <motion.div className="flex items-center justify-center w-full" layout>
      <motion.div
        className="bg-neutral-100 rounded-md border border-dashed border-neutral-800/20 px-3 py-2"
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center space-x-2">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.9 0.499976C13.9 0.279062 13.7209 0.0999756 13.5 0.0999756C13.2791 0.0999756 13.1 0.279062 13.1 0.499976V1.09998H12.5C12.2791 1.09998 12.1 1.27906 12.1 1.49998C12.1 1.72089 12.2791 1.89998 12.5 1.89998H13.1V2.49998C13.1 2.72089 13.2791 2.89998 13.5 2.89998C13.7209 2.89998 13.9 2.72089 13.9 2.49998V1.89998H14.5C14.7209 1.89998 14.9 1.72089 14.9 1.49998C14.9 1.27906 14.7209 1.09998 14.5 1.09998H13.9V0.499976ZM11.8536 3.14642C12.0488 3.34168 12.0488 3.65826 11.8536 3.85353L10.8536 4.85353C10.6583 5.04879 10.3417 5.04879 10.1465 4.85353C9.9512 4.65827 9.9512 4.34169 10.1465 4.14642L11.1464 3.14643C11.3417 2.95116 11.6583 2.95116 11.8536 3.14642ZM9.85357 5.14642C10.0488 5.34168 10.0488 5.65827 9.85357 5.85353L2.85355 12.8535C2.65829 13.0488 2.34171 13.0488 2.14645 12.8535C1.95118 12.6583 1.95118 12.3417 2.14645 12.1464L9.14646 5.14642C9.34172 4.95116 9.65831 4.95116 9.85357 5.14642ZM13.5 5.09998C13.7209 5.09998 13.9 5.27906 13.9 5.49998V6.09998H14.5C14.7209 6.09998 14.9 6.27906 14.9 6.49998C14.9 6.72089 14.7209 6.89998 14.5 6.89998H13.9V7.49998C13.9 7.72089 13.7209 7.89998 13.5 7.89998C13.2791 7.89998 13.1 7.72089 13.1 7.49998V6.89998H12.5C12.2791 6.89998 12.1 6.72089 12.1 6.49998C12.1 6.27906 12.2791 6.09998 12.5 6.09998H13.1V5.49998C13.1 5.27906 13.2791 5.09998 13.5 5.09998ZM8.90002 0.499976C8.90002 0.279062 8.72093 0.0999756 8.50002 0.0999756C8.2791 0.0999756 8.10002 0.279062 8.10002 0.499976V1.09998H7.50002C7.2791 1.09998 7.10002 1.27906 7.10002 1.49998C7.10002 1.72089 7.2791 1.89998 7.50002 1.89998H8.10002V2.49998C8.10002 2.72089 8.2791 2.89998 8.50002 2.89998C8.72093 2.89998 8.90002 2.72089 8.90002 2.49998V1.89998H9.50002C9.72093 1.89998 9.90002 1.72089 9.90002 1.49998C9.90002 1.27906 9.72093 1.09998 9.50002 1.09998H8.90002V0.499976Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
          <span className="text-neutral-900">Place a waypoint</span>
        </div>
      </motion.div>
    </motion.div>
  )
}
