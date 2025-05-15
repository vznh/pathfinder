import type React from "react";
import { useState, useEffect } from "react"; // Import useState and useEffect
import EmailModalButton from "@/components/specific/EmailModal";
import DropdownMenu from "@/components/reusable/DropDownMenu";
import { Button } from "@/components/reusable/Button"
import { createClient } from "@/supabase/component";
import mapboxClient from "@/services/MapboxClient";
import { GoogleSignInModal } from "@/components/specific/SignInOverlay"; // Import the SignInOverlay component
import {
  DotsVerticalIcon,
  PersonIcon,
  GearIcon,
  InfoCircledIcon,
  LayersIcon,
  MixerHorizontalIcon,
  ReaderIcon,
  ExitIcon,
  PlusCircledIcon,
  SewingPinFilledIcon,
  ClockIcon,
  PaperPlaneIcon,
  Link2Icon,
  LinkBreak2Icon,
} from "@radix-ui/react-icons";

interface DashboardLayoutProps {
  development?: boolean;
  onWaypointModeToggle?: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  development = false,
  onWaypointModeToggle,
}) => {
  const supabase = createClient(); // Initialize Supabase client
  const [isAuthenticated, setIsAuthenticated] = useState(false); // State for authentication status
  const [isOverlayOpen, setIsOverlayOpen] = useState(false); // State for overlay visibility
  const [signInError, setSignInError] = useState<string | null>(null); // State for sign-in errors

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getUser()
      .then(({ data: { user } }) => {
        setIsAuthenticated(!!user);
      })
      .catch(console.error);

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
      // Close overlay and clear error on successful sign in
      if (event === 'SIGNED_IN') {
        setIsOverlayOpen(false);
        setSignInError(null);
      }
    });

    // Clean up the listener
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleOpenOverlay = () => {
    setIsOverlayOpen(true);
  };

  const handleCloseOverlay = () => {
    setIsOverlayOpen(false);
    setSignInError(null); // Clear error when closing
  };

  const handleGoogleSignIn = async () => {
    setSignInError(null); // Clear previous errors
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: '/', // Redirect back to the root path
      },
    });

    if (error) {
      console.error('Error signing in with Google:', error.message);
      setSignInError('Failed to sign in with Google. Please try again.'); // Set a user-friendly error message
    }
    // Supabase listener handles closing overlay and setting auth state on success
  };


  const borderClasses = development
    ? "border border-dashed border-gray-300"
    : "";
  const middleCellBgClasses = development ? "bg-gray-100/20" : "";

  return (
    <div className="pointer-events-none absolute inset-0 z-10 grid h-full w-full grid-cols-3 grid-rows-3">
      {/* Top row */}
      <div
        className={`pointer-events-none flex items-start justify-start p-4 ${borderClasses}`}
      >
        {/* Top left */}
        <DropdownMenu
          toggleIcon={<DotsVerticalIcon className="w-5 h-5 pointer-events-auto" />}
          position="top-left"
          theme="light"
          label="Quick actions"
          buttonClassName="bg-white w-12 h-12 flex items-center justify-center"
        >
          <div className="flex flex-col gap-2 pointer-events-auto">
            <button
              className="flex items-center justify-center p-2 rounded-lg bg-white hover:bg-gray-100 text-gray-800 transition"
              aria-label="Clock"
            >
              <ClockIcon className="w-5 h-5" />
            </button>
            <button
              className="flex items-center justify-center p-2 rounded-lg bg-white hover:bg-gray-100 text-gray-800 transition"
              aria-label="Filters"
            >
              <MixerHorizontalIcon className="w-5 h-5" />
            </button>
            <button
              className="flex items-center justify-center p-2 rounded-lg bg-white hover:bg-gray-100 text-gray-800 transition"
              aria-label="Add"
              onClick={onWaypointModeToggle}
            >
              <PlusCircledIcon className="w-5 h-5" />
            </button>
            <button
              className="flex items-center justify-center p-2 rounded-lg bg-white hover:bg-gray-100 text-gray-800 transition"
              aria-label="Pin"
            >
              <SewingPinFilledIcon className="w-5 h-5" />
            </button>
          </div>
        </DropdownMenu>
      </div>

      <div
        className={`pointer-events-none flex items-start justify-center p-4 ${borderClasses}`}
      >
        {/* Top center */}
      </div>

      <div
        className={`pointer-events-none flex items-start justify-end p-4 ${borderClasses}`}
      >
        {/* Top right */}

      </div>

      {/* Middle row */}
      <div
        className={`pointer-events-none flex items-center justify-start p-4 ${borderClasses}`}
      >
        {/* Middle left */}
      </div>
      <div className={middleCellBgClasses} />
      <div
        className={`pointer-events-none flex items-center justify-end p-4 ${borderClasses}`}
      >
        {/* Middle right */}
      </div>

      {/* Bottom row */}

       {/* Bottom left */}
      <div
        className={`pointer-events-auto flex items-end justify-start p-4 ${borderClasses}`}
      >
        <Button
          icon={ isAuthenticated ? <Link2Icon className="w-4 h-4"/> : <LinkBreak2Icon className="w-4 h-4"/> }
          position={ "bottom-left" }
          onClick={isAuthenticated ? undefined : handleOpenOverlay} // Open overlay only if not authenticated
        />
      </div>
      <div
        className={`pointer-events-none flex items-end justify-center p-4 ${borderClasses}`}
      >
        {/* Bottom center */}
      </div>
      <div
        className={`pointer-events-none flex items-end justify-end p-4 ${borderClasses}`}
      >
        {/* Bottom right */}
        <EmailModalButton></EmailModalButton>
      </div>

      {/* SignInOverlay component */}
      <GoogleSignInModal
        isOpen={isOverlayOpen}
        onClose={handleCloseOverlay}
        onSignInClick={handleGoogleSignIn}
        signInError={signInError}
      />
    </div>
  );
};

export default DashboardLayout;
