// layouts/DashboardLayout.tsx
'use client'
import type React from "react";
import { useState, useEffect } from "react"; // Import useState and useEffect
import { Button } from "@/components/reusable/Button"
import { createClient } from "@/supabase/component";
import { GoogleSignInModal } from "@/components/specific/SignInOverlay"; // Import the SignInOverlay component
import {
  PlusCircledIcon,
  MagnifyingGlassIcon,
  Link2Icon,
  LinkBreak2Icon,
  LayersIcon
} from "@radix-ui/react-icons";
import Legend from "@/components/specific/Legend";
import DateRangeFilter, { DateRange } from "@/components/reusable/DateRangeFilter";

interface DashboardLayoutProps {
  development?: boolean;
  onWaypointModeToggle?: () => void;
  waypointMode?: boolean;
  searchInput: string;
  onSearchInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filteredSuggestions: { name: string; coordinates: [number, number]; source: "local" | "mapbox" }[];
  onSuggestionSelect: (s: {name: string; coordinates: [number, number]; source: "local" | "mapbox" }) => void;
  onOrgSearchToggle?: () => void;
  event_id: string | null;
  dateRange: DateRange;
  onDateRangeChange: (r: DateRange) => void;
  onAuthChange?: (isAuthenticated: boolean) => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  development = false,
  onWaypointModeToggle,
  waypointMode = false,
  searchInput,
  onSearchInputChange,
  filteredSuggestions,
  onSuggestionSelect,
  onOrgSearchToggle,
  event_id,
  dateRange,
  onDateRangeChange,
  onAuthChange,
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
        if (typeof onAuthChange === 'function') {
          onAuthChange(!!user);
        }
      })

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
      if (typeof onAuthChange === 'function') {
        onAuthChange(!!session?.user);
      }
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
  }, [supabase, onAuthChange]);

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
        redirectTo: event_id == null ? '/' : '/events/' + event_id, // Redirect back to the root path
      },
    });

    if (error) {
      console.error('Error signing in with Google:', error.message);
      setSignInError('Failed to sign in with Google. Please try again.'); // Set a user-friendly error message
    }
    // Supabase listener handles closing overlay and setting auth state on success
  };

  // useEffect(() => {
  //   supabase.auth.getUser()
  //     .then(({data: {user}}) => {
  //       if (event_id && user == null) {
  //         handleGoogleSignIn()
  //       }
  //     })
  // }, [supabase, event_id, handleGoogleSignIn])

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
        <button
          className={`pointer-events-auto p-2 rounded-lg w-12 h-12 flex
                      items-center justify-center transition
                      ${waypointMode
                        ? 'bg-blue-500 text-white'          // active colour
                        : 'bg-white text-gray-800 hover:bg-gray-100'}`}
          aria-pressed={waypointMode}
          aria-label="Add waypoint"
          onClick={onWaypointModeToggle}
        >
          <PlusCircledIcon className="w-5 h-5" />
        </button>
      </div>

      <div
        className={`pointer-events-none flex items-start justify-center p-4 ${borderClasses}`}
      >
        {/* Top center */}
        <div className="pointer-events-auto relative w-72">
          <div className="flex items-center space-x-2 bg-white rounded-full px-3 py-2 shadow-md font-sans text-sm">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-600" />
            <input
              type="text"
              placeholder="Search…"
              className="flex-grow bg-transparent outline-none placeholder:text-gray-400"
              value={searchInput}
              onChange={onSearchInputChange}
            />
          </div>
          {filteredSuggestions.length > 0 && (
            <ul className="absolute top-full left-0 mt-1 w-full bg-white rounded-md shadow-md z-40 max-h-60 overflow-y-auto">
              {filteredSuggestions.map((s, i) => (
                <li
                  key={i}
                  className="flex justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => onSuggestionSelect(s)}
                >
                  <span>{s.name}</span>
                  {s.source === "local" && (
                    <span className="ml-2 text-xs text-gray-500">(UCSC)</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div
        className={`pointer-events-none flex items-start justify-end p-4 ${borderClasses}`}
      >
        {/* Top right */}
        {isAuthenticated && onOrgSearchToggle && (
          <button
            onClick={onOrgSearchToggle}
            className="pointer-events-auto bg-white hover:bg-gray-100 text-gray-800 rounded-lg p-2 transition mr-2"
            aria-label="Search Organizations"
          >
            <LayersIcon className="w-7 h-7" />
          </button>
        )}
      </div>

      {/* Middle row */}
      <div
        className={`pointer-events-none flex items-center justify-start p-4 ${borderClasses}`}
      >
        {/* Middle left */}
      </div>
      <div className={middleCellBgClasses}/>
      <div
        className={`pointer-events-none flex items-center justify-end p-4 ${borderClasses}`}
      >
        {/* Middle right */}
      </div>

      {/* Bottom row */}

      {/* Bottom left */}
      <div
        className={`pointer-events-auto flex flex-col items-start justify-end p-4 ${borderClasses}`}
      >
        {/* Show login button only if not authenticated */}
        {!isAuthenticated && (
          <button
            className="pointer-events-auto flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-800 px-4 py-2 rounded-lg shadow transition border border-gray-300"
            onClick={handleOpenOverlay}
          >
            <LinkBreak2Icon className="w-4 h-4" />
            Sign in with Google
          </button>
        )}
        {isAuthenticated && (
          <DateRangeFilter
            range={dateRange}
            onChange={onDateRangeChange}
            className="pointer-events-auto mt-4"
          />
        )}
      </div>
      <div className="pointer-events-none" />
      <div
        className={`pointer-events-none flex items-end justify-end p-4 ${borderClasses}`}
      >
        {/* Bottom right */}
        {isAuthenticated && <Legend />}
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
