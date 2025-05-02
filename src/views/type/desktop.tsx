// pathfinder/src/views/type/desktop.tsx
import Map from "@/components/Map";
import { Button } from "@/components/reusable/Button";
import mapboxClient from "@/services/MapboxClient";
import {
  Cross2Icon,
  PlusCircledIcon,
  ThickArrowUpIcon,
  PersonIcon,
  CheckIcon, // Import CheckIcon
} from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { Database } from "@/models/supabase_types";
import type { User } from "@supabase/supabase-js"; // Import User type
import EmailModalButton from "@/components/specific/EmailModal";
import { GoogleSignInModal } from "@/components/specific/SignInOverlay"; // Import the modal
import { createClient } from "@/supabase/component"; // Import Supabase client

interface MapViewProps {
  events: Database["public"]["Tables"]["events_v0"]["Row"][];
}

const DesktopView: React.FC<MapViewProps> = ({ events }) => {
  // Supabase client
  const supabase = createClient();

  // Modes & UI State
  const [waypointMode, setWaypointMode] = useState(false);
  const [selectedWaypoint, setSelectedWaypoint] = useState<
    [number, number] | null
  >(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); // State for modal
  const [authError, setAuthError] = useState<string | null>(null); // State for auth errors

  // Authentication State
  const [user, setUser] = useState<User | null>(null); // Store user object
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false); // Track auth status

  // Effect to check initial auth state and listen for changes
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session?.user);
    };

    checkUser(); // Check on initial load

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session?.user);
        // Close modal on successful login/logout
        if (session?.user) {
          setIsAuthModalOpen(false);
          setAuthError(null); // Clear errors on successful auth change
        }
      },
    );

    // Cleanup listener on component unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  // Effect to load event markers (unchanged)
  useEffect(() => {
    if (!events || events.length === 0) return;

    for (const row of events) {
      if (
        row &&
        typeof row.longitude === "number" &&
        typeof row.latitude === "number"
      ) {
        mapboxClient.events.addEventMarker([row.longitude, row.latitude]);
      }
    }
  }, [events]);

  // Effect for waypoint mode (disable if not authenticated)
  useEffect(() => {
    if (waypointMode && isAuthenticated) {
      // Only enable if authenticated
      document.body.style.cursor = "crosshair";
      const handleClick = (e: mapboxgl.MapMouseEvent) => {
        const coordinates = e.lngLat.toArray() as [number, number];
        setSelectedWaypoint(coordinates);

        mapboxClient.camera.zoomTo(coordinates, 18, true);
        mapboxClient.events.addBaseMarker(coordinates);
        setWaypointMode(false);
      };

      mapboxClient.getMap().once("click", handleClick);

      return () => {
        document.body.style.cursor = "";
        mapboxClient.getMap().off("click", handleClick);
      };
    } else {
      // Ensure cursor is reset if waypointMode is toggled off or user logs out
      document.body.style.cursor = "";
      // Also turn off waypoint mode if user logs out while it's active
      if (!isAuthenticated && waypointMode) {
        setWaypointMode(false);
      }
    }
  }, [waypointMode, isAuthenticated]); // Add isAuthenticated dependency

  // --- Map Interaction Functions (Disable if not authenticated) ---

  const openInGoogleMaps = () => {
    if (selectedWaypoint && isAuthenticated) {
      // Check auth
      const [lng, lat] = selectedWaypoint;
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
        "_blank",
      );
    }
  };

  const openInAppleMaps = () => {
    if (selectedWaypoint && isAuthenticated) {
      // Check auth
      const [lng, lat] = selectedWaypoint;
      window.open(`https://maps.apple.com/?q=${lat},${lng}`, "_blank");
    }
  };

  const createEvent = () => {
    if (selectedWaypoint && isAuthenticated) {
      // Check auth
      // Perform API call here, will just print to console for now
      console.log(
        `* Attempted to create event at ${selectedWaypoint} by user ${user?.email}`,
      );
      // TODO: Implement actual API call to Supabase function/edge function
    } else {
      console.log("* User must be authenticated to create an event.");
    }
  };

  // --- Authentication Functions ---

  const handleGoogleSignIn = async () => {
    setAuthError(null); // Clear previous errors
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // Redirect to the same page after login
        redirectTo: window.location.origin,
        // Restrict to UCSC emails
        queryParams: {
          hd: "ucsc.edu",
        },
      },
    });
    if (error) {
      console.error("Google Sign-In Error:", error);
      // Provide a more specific error if possible, otherwise generic
      if (error.message.includes("hd parameter mismatch")) {
        // Check if Supabase returns a hint
        setAuthError(
          "You require a @ucsc.edu email to sign in. Please use your student email.",
        );
      } else {
        setAuthError(`Sign-in failed: ${error.message}`);
      }
    }
    // No need to close modal here, onAuthStateChange handles it on success
  };

  const handleSignOut = async () => {
    setAuthError(null);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign Out Error:", error);
      setAuthError(`Sign-out failed: ${error.message}`);
    } else {
      // Clear waypoint selection on sign out
      setSelectedWaypoint(null);
      mapboxClient.events.removeAnyMarkers();
    }
  };

  const handleAuthButtonClick = () => {
    if (isAuthenticated) {
      handleSignOut();
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div>
      {/*
       * Reference: src/components/Map.tsx
       * This map is overlaid in the background.
       * This should stay at this level.
       */}
      <div className="absolute inset-0">
        <Map />
      </div>

      {/* Overlay Wrapper */}
      <div className="overlay-wrapper inset-0 z-10">
        {/* Email Modal Button - Keep as is, potentially disable/hide if not needed */}
        <div className="absolute bottom-4 right-4 z-10">
          <EmailModalButton />
        </div>

        {/* Top-Right Button (Geolocation) - Disable if not authenticated */}
        <Button
          icon={<ThickArrowUpIcon className="w-5 h-5" />}
          position={"top-right"}
          onClick={() => {
            if (!isAuthenticated) return; // Prevent action if not authenticated
            mapboxClient.geolocation.getUserLocation((coords) => {
              mapboxClient.camera.zoomTo(
                [coords.longitude, coords.latitude],
                20,
                false,
              );
            });
          }}
          disabled={!isAuthenticated} // Disable button
        />

        {/* Bottom-Left Button (Waypoint Mode) - Disable if not authenticated */}
        <Button
          icon={<PlusCircledIcon className="w-5 h-5" />}
          position={"bottom-left"}
          className={`${waypointMode ? "bg-blue-200" : ""}`}
          onClick={() => {
            if (!isAuthenticated) return; // Prevent action if not authenticated
            setWaypointMode(!waypointMode);
          }}
          disabled={!isAuthenticated} // Disable button
        />

        {/* Top-Left Button (Auth) - Toggles Modal or Signs Out - Disabled when logged in */}
        <Button
          // Use CheckIcon when logged in, PersonIcon when logged out
          icon={
            isAuthenticated ? (
              <CheckIcon className="w-5 h-5 text-green-600" />
            ) : (
              <PersonIcon className="w-5 h-5" />
            )
          }
          position={"top-left"}
          onClick={handleAuthButtonClick} // Use the combined handler
          disabled={isAuthenticated} // Disable this button when authenticated
        />

        {/* Waypoint Info Panel - Conditionally render only if a waypoint is selected */}
        {selectedWaypoint &&
          isAuthenticated && ( // Also check authentication
            <div className="absolute bottom-20 left-4 bg-white p-4 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Waypoint Selected</h3>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => {
                    setSelectedWaypoint(null);
                    mapboxClient.events.removeAnyMarkers();
                    setWaypointMode(false); // Ensure waypoint mode is off
                  }}
                  // No need to disable this specific button, it's inside the conditional render
                >
                  <Cross2Icon className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm mb-3">
                Coordinates: {selectedWaypoint[1].toFixed(6)},{" "}
                {selectedWaypoint[0].toFixed(6)}
              </p>
              {/* Action buttons - Disable is handled implicitly by the parent conditional render */}
              <div className="flex space-x-2">
                <button
                  onClick={openInGoogleMaps}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                >
                  Google Maps
                </button>
                <button
                  onClick={openInAppleMaps}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                >
                  Apple Maps
                </button>
                <button
                  onClick={createEvent}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm" // Changed color for distinction
                >
                  Create Event
                </button>
              </div>
            </div>
          )}

        {/* Render the Google Sign-In Modal */}
        <GoogleSignInModal
          isOpen={isAuthModalOpen && !isAuthenticated} // Only open if needed and user is not logged in
          onClose={() => {
            setIsAuthModalOpen(false);
            setAuthError(null); // Clear error when closing manually
          }}
          onSignInClick={handleGoogleSignIn}
          signInError={authError} // Pass error message
        />
      </div>
    </div>
  );
};

export default DesktopView;
