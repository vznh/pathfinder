// views/type/desktop.tsx
import Map from "@/components/Map";
import { Button } from "@/components/reusable/Button";
import mapboxClient from "@/services/MapboxClient";
import {
  Cross2Icon,
  PlusCircledIcon,
  ThickArrowUpIcon,
  PersonIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { Database } from "@/models/supabase_types";
import EmailModalButton from "@/components/specific/EmailModal";
import { createClient } from "@/supabase/component";

interface MapViewProps {
  events: Database["public"]["Tables"]["events_v0"]["Row"][];
}

const DesktopView: React.FC<MapViewProps> = ({ events }) => {
  // modes
  const [waypointMode, setWaypointMode] = useState(false);
  const [selectedWaypoint, setSelectedWaypoint] = useState<
    [number, number] | null
  >(null);
  const [showAuthTest, setShowAuthTest] = useState(false);
  const supabase = createClient();
  const [searchInput, setSearchInput] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  const ucscLocations = [
    "Cowell College",
    "Crown College",
    "College Nine",
    "College Ten",
    "Rachel Carson College",
    "Oakes College",
    "Porter College",
    "Stevenson College",
    "Kresge College",
    "Science Hill",
    "East Field",
    "Quarry Amphitheater",
    "Science and Engineering Library",
    "McHenry Library",
    "University Center",
    "Cultural Center",
    "Bay Tree Bookstore",
    "Cowell & Stevenson Dining Hall",
    "Crown & Merrill Dining Hall",
    "College Nine & Ten Dining Hall",
    "Rachel Carson & Oakes Dining Hall",
    "Porter & Kresge Dining Hall",
  ];
  

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

  useEffect(() => {
    if (waypointMode) {
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
      document.body.style.cursor = "";
    }
  }, [waypointMode]);

  const openInGoogleMaps = () => {
    if (selectedWaypoint) {
      const [lng, lat] = selectedWaypoint;
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
        "_blank",
      );
    }
  };

  const openInAppleMaps = () => {
    if (selectedWaypoint) {
      const [lng, lat] = selectedWaypoint;
      window.open(`https://maps.apple.com/?q=${lat},${lng}`, "_blank");
    }
  };

  const createEvent = async () => {
    // perform api call here, will just print to cosnole for now
    if (selectedWaypoint) {
      const [lng, lat] = selectedWaypoint;
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        console.error('User not found or error:', userError)
      }
      
      else {
        const { error: insertError } = await supabase
          .from('events_v0')
          .insert({
            user_id: user.id,
            event: 'Clicked Event', // add event name's here later
            latitude: lat,
            longitude: lng,
          })

        if (insertError) {
          console.error('Insert error:', insertError)
        } else {
          console.log('Row inserted successfully')
        }
      }
    }
  };

  return (
    <div>
      <div className="absolute inset-0">
        <Map />
      </div>

      <div className="overlay-wrapper inset-0 z-10 relative">
        <div className="absolute bottom-4 right-4 z-10">
          <EmailModalButton />
        </div>
        <Button
          icon={<ThickArrowUpIcon className="w-5 h-5" />}
          position={"top-right"}
          onClick={() => {
            mapboxClient.geolocation.getUserLocation((coords) => {
              mapboxClient.camera.zoomTo(
                [coords.longitude, coords.latitude],
                20,
                false,
              );
            });
          }}
        />
        <Button
          icon={<PlusCircledIcon className="w-5 h-5" />}
          position={"bottom-left"}
          className={waypointMode ? "bg-blue-200" : ""}
          onClick={() => setWaypointMode(!waypointMode)}
        />
        <Button
          icon={<PersonIcon className="w-5 h-5" />}
          position={"top-left"}
          onClick={() => setShowAuthTest(!showAuthTest)}
        />
        <div className="absolute top-4 left-[120px] z-20 w-[360px]">
          <div className="relative">
            <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-md space-x-2">
              <MagnifyingGlassIcon className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full outline-none bg-transparent text-sm"
                value={searchInput}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchInput(value);
                  setFilteredSuggestions(
                    value.length === 0
                      ? []
                      : ucscLocations
                          .filter((loc) =>
                            loc.toLowerCase().startsWith(value.toLowerCase())
                          )
                          .sort((a, b) => a.localeCompare(b))
                  );                  
                }}
              />
            </div>
            {/* ⬇️ Dropdown suggestion list goes here */}
            {filteredSuggestions.length > 0 && (
              <ul className="absolute top-full left-0 mt-1 w-full bg-white rounded-md shadow-md z-50 max-h-60 overflow-y-auto">
                {filteredSuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    onClick={() => {
                      setSearchInput(suggestion);
                      setFilteredSuggestions([]);
                    }}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {/* this needs to go */}
        {selectedWaypoint && (
          <div className="absolute bottom-20 left-4 bg-white p-4 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Waypoint Selected</h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setSelectedWaypoint(null);
                  mapboxClient.events.removeAnyMarkers();
                }}
              >
                <Cross2Icon className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm mb-3">
              Coordinates: {selectedWaypoint[1].toFixed(6)},{" "}
              {selectedWaypoint[0].toFixed(6)}
            </p>
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
                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
              >
                Create Event
              </button>
            </div>
          </div>
        )}

        {/* Auth Test Overlay */}
        {showAuthTest && (
          <div className="absolute top-20 left-4 bg-white p-4 rounded-lg shadow-lg max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Authentication Test</h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowAuthTest(false)}
              >
                <Cross2Icon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesktopView;
