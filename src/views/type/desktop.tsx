// views/type/desktop.tsx
import Map from "@/components/Map";
import { Button } from "@/components/reusable/Button";
import mapboxClient from "@/services/MapboxClient";
import {
  Cross2Icon,
  PaperPlaneIcon,
  PlusCircledIcon,
  SewingPinFilledIcon,
  ClockIcon,
  MixerHorizontalIcon,
  DotsVerticalIcon,
  PersonIcon
} from "@radix-ui/react-icons";
import { useEffect, useState, useRef } from "react";
import { Database } from "@/models/supabase_types";

interface MapViewProps {
  events: Database["public"]["Tables"]["events_v0"]["Row"][];
}

const DesktopView: React.FC<MapViewProps> = ({ events }) => {
  const [waypointMode, setWaypointMode] = useState(false);
  const [selectedWaypoint, setSelectedWaypoint] = useState<[number, number] | null>(null);
  const [showAuthTest, setShowAuthTest] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // refs for click-away
  const toggleWrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // add markers for existing events
  useEffect(() => {
    if (!events?.length) return;
    for (const row of events) {
      if (typeof row.longitude === "number" && typeof row.latitude === "number") {
        mapboxClient.events.addEventMarker([row.longitude, row.latitude]);
      }
    }
  }, [events]);

  // waypoint click handler
  useEffect(() => {
    if (!waypointMode) {
      document.body.style.cursor = "";
      return;
    }
    document.body.style.cursor = "crosshair";
    const handleClick = (e: mapboxgl.MapMouseEvent) => {
      const coords = e.lngLat.toArray() as [number, number];
      setSelectedWaypoint(coords);
      mapboxClient.camera.zoomTo(coords, 18, true);
      mapboxClient.events.addBaseMarker(coords);
      setWaypointMode(false);
    };
    mapboxClient.getMap().once("click", handleClick);
    return () => {
      document.body.style.cursor = "";
      mapboxClient.getMap().off("click", handleClick);
    };
  }, [waypointMode]);

  // close dropdown on outside clicks
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      const tgt = e.target as Node;
      if (
        isDropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(tgt) &&
        toggleWrapperRef.current &&
        !toggleWrapperRef.current.contains(tgt)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [isDropdownOpen]);

  const openInGoogleMaps = () => {
    if (!selectedWaypoint) return;
    const [lng, lat] = selectedWaypoint;
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      "_blank"
    );
  };

  const openInAppleMaps = () => {
    if (!selectedWaypoint) return;
    const [lng, lat] = selectedWaypoint;
    window.open(`https://maps.apple.com/?q=${lat},${lng}`, "_blank");
  };

  const createEvent = () => {
    console.log("* Attempted to create event");
  };

  const toggleDropdown = () => setIsDropdownOpen((v) => !v);

  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0">
        <Map />
      </div>

      <div className="overlay-wrapper">
        <Button
          icon={
            <PaperPlaneIcon
              className="w-5 h-5"
              style={{ transform: "rotate(270deg)" }}
            />
          }
          position="bottom-right"
          onClick={() =>
            mapboxClient.geolocation.getUserLocation((coords) => {
              mapboxClient.camera.zoomTo(
                [coords.longitude, coords.latitude],
                20,
                false
              );
            })
          }
        />

        {/* Dropdown toggle + menu */}
        <div className="absolute top-2 left-2">
          {/* wrap the Button so we can attach a ref here */}
          <div ref={toggleWrapperRef}>
            <Button
              icon={<DotsVerticalIcon className="w-5 h-5" />}
              position="top-left"
              onClick={toggleDropdown}
            />
          </div>

          <div
            ref={dropdownRef}
            className="absolute top-4 left-4 dropdown-container"
          >
            {isDropdownOpen && (
              <div className="relative top-4 left-4 bottom-24 bg-transparent">
                <Button
                  icon={<ClockIcon className="w-5 h-5" />}
                  isStatic
                  onClick={() => console.log("History clicked")}
                  className="bg-white shadow-md hover:bg-gray-50"
                />
                <Button
                  icon={<MixerHorizontalIcon className="w-5 h-5" />}
                  isStatic
                  onClick={() => console.log("Filters clicked")}
                  className="bg-white shadow-md hover:bg-gray-50"
                />
                <Button
                  icon={<PlusCircledIcon className="w-5 h-5" />}
                  isStatic
                  onClick={() =>
                    mapboxClient.geolocation.getUserLocation((coords) =>
                      mapboxClient.camera.zoomTo(
                        [coords.longitude, coords.latitude],
                        20,
                        false
                      )
                    )
                  }
                  className="bg-white shadow-md hover:bg-gray-50"
                />
                <Button
                  icon={<SewingPinFilledIcon className="w-5 h-5" />}
                  isStatic
                  onClick={() => console.log("Pins clicked")}
                  className="bg-white shadow-md hover:bg-gray-50"
                />
              </div>
            )}
          </div>
        </div>

        <Button
          icon={<PersonIcon className="w-5 h-5" />}
          position="top-right"
          onClick={() => setShowAuthTest((v) => !v)}
        />

        {/* Waypoint details */}
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

        {/* Auth Test */}
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
