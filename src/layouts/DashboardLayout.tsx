// layouts/DashboardLayout.tsx
import type React from "react";
import { useState, useEffect } from "react";
import EmailModalButton from "@/components/specific/EmailModal";
import DropdownMenu from "@/components/reusable/DropDownMenu";
import { Button } from "@/components/reusable/Button"
import { createClient } from "@/supabase/component";
import { GoogleSignInModal } from "@/components/specific/SignInOverlay";
import FilteringMenu from "@/components/specific/FilteringMenu"; // Import FilteringMenu
import {
  DotsVerticalIcon,
  MixerHorizontalIcon,
  PlusCircledIcon,
  SewingPinFilledIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  Link2Icon,
  LinkBreak2Icon
} from "@radix-ui/react-icons";

interface DashboardLayoutProps {
  development?: boolean;
  onWaypointModeToggle?: () => void;
  searchInput: string;
  onSearchInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filteredSuggestions: { name: string; coordinates: [number, number]; source: "local" | "mapbox" }[];
  onSuggestionSelect: (s: {name: string; coordinates: [number, number]; source: "local" | "mapbox" }) => void;
  onFilterChange: (filters: {
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    useTimeFilter: boolean;
  }) => void;
  currentFilters: {
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    useTimeFilter: boolean;
  };
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  development = false,
  onWaypointModeToggle,
  searchInput,
  onSearchInputChange,
  filteredSuggestions,
  onSuggestionSelect,
  onFilterChange,
  currentFilters
}) => {
  const supabase = createClient(); // Initialize Supabase client
  const [isAuthenticated, setIsAuthenticated] = useState(false); // State for authentication status
  const [isSignInOverlayOpen, setIsSignInOverlayOpen] = useState(false); // State for sign-in overlay visibility
  const [signInError, setSignInError] = useState<string | null>(null); // State for sign-in errors
  // Add state for filtering menu visibility
  const [isFilteringMenuOpen, setIsFilteringMenuOpen] = useState(false);

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
        setIsSignInOverlayOpen(false);
        setSignInError(null);
      }
    });

    // Clean up the listener
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleOpenSignInOverlay = () => {
    setIsSignInOverlayOpen(true);
  };

  const handleCloseSignInOverlay = () => {
    setIsSignInOverlayOpen(false);
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

  // Add handlers for filtering menu visibility
  const handleOpenFilteringMenu = () => {
    setIsFilteringMenuOpen(true);
  };

  const handleCloseFilteringMenu = () => {
    setIsFilteringMenuOpen(false);
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
            {/* "Filters" button to open the FilteringMenu */}
            <button
              className="flex items-center justify-center p-2 rounded-lg bg-white hover:bg-gray-100 text-gray-800 transition"
              aria-label="Filters"
              onClick={handleOpenFilteringMenu} // Add onClick handler
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
        className={`pointer-events-auto flex items-end justify-start p-4 ${borderClasses}`}
      >
        <Button
          icon={ isAuthenticated ? <Link2Icon className="w-4 h-4"/> : <LinkBreak2Icon className="w-4 h-4"/> }
          position={ "bottom-left" }
          onClick={isAuthenticated ? undefined : handleOpenSignInOverlay} // Open overlay only if not authenticated
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
        isOpen={isSignInOverlayOpen}
        onClose={handleCloseSignInOverlay}
        onSignInClick={handleGoogleSignIn}
        signInError={signInError}
      />

      {/* FilteringMenu component */}
      {/* Pass visibility state, close handler, filter change handler, and current filters */}
      <FilteringMenu
        isOpen={isFilteringMenuOpen}
        onClose={handleCloseFilteringMenu}
        onApplyFilters={onFilterChange}
        initialFilters={currentFilters}
      />
    </div>
  );
};

export default DashboardLayout;
