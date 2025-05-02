// views/type/desktop.tsx
import Map from "@/components/Map";
import { Button } from "@/components/reusable/Button";
import mapboxClient from "@/services/MapboxClient";
import {
  Cross2Icon,
  PlusCircledIcon,
  ThickArrowUpIcon,
  PersonIcon,
} from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { Database } from "@/models/supabase_types";
import EmailModalButton from "@/components/specific/EmailModal";

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

  const createEvent = () => {
    // perform api call here, will just print to cosnole for now
    // const supabase = createClient();
    console.log("* Attempted to create event");
  };

  return (
    <div>
      <div className="absolute inset-0">
        <Map />
      </div>

      <div className="overlay-wrapper inset-0 z-10">
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
