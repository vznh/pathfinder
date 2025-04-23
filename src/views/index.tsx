import Map from "@/components/Map";
// views/
import { Button } from "@/components/reusable/Button";
import mapboxClient from "@/services/MapboxClient";
import {
  CaretUpIcon,
  Cross2Icon,
  PaperPlaneIcon,
  PinTopIcon,
  PlusCircledIcon,
  SewingPinFilledIcon,
  ThickArrowUpIcon,
  ClockIcon,
  MixerHorizontalIcon,
  DimensionsIcon,
  DotsVerticalIcon,
} from "@radix-ui/react-icons";
import { useEffect, useState } from "react";

const MapView: React.FC = () => {
  // modes
  const [waypointMode, setWaypointMode] = useState(false);
  const [selectedWaypoint, setSelectedWaypoint] = useState<
    [number, number] | null
  >(null);

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
    // perform api call here, will just print to console for now
    console.log("* Attempted to create event");
  };

  return (
    <div>
      <div className="absolute inset-0">
        <Map />
      </div>

      <div className="overlay-wrapper inset-0 z-10">
        {/*
        <Button
          icon={<SewingPinFilledIcon className="w-5 h-5" />}
          position="bottom-right"
          onClick={() =>
            mapboxClient.camera.zoomTo(
              [-122.06441040634448, 36.99225113910849],
              20,
              true
            )
          }
        />
        */}
        {/*
        <Button
          icon={<ThickArrowUpIcon className="w-5 h-5" />}
          position="top-right"
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
        */}
        <Button
          icon={
            <PaperPlaneIcon
              className="w-5 h-5"
              style={{ transform: "rotate(270deg)" }}
            />
          }
          position="bottom-right"
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

        {/* Button column with functionality */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
          <Button
            icon={<ClockIcon className="w-5 h-5" />}
            position="top-left"
            onClick={() => {}}
          />
          <Button
            icon={<MixerHorizontalIcon className="w-5 h-5" />}
            position="top-left"
            onClick={() => {}}
          />
          <Button
            icon={<PlusCircledIcon className="w-5 h-5" />}
            position="top-left"
            onClick={() => {}}
          />
          <Button
            icon={<SewingPinFilledIcon className="w-5 h-5" />}
            position="top-left"
            onClick={() => {}}
          />
          <Button
            icon={<DotsVerticalIcon className="w-5 h-5" />}
            position="top-left"
            onClick={() => {}}
          />
        </div>

		{/* Change one of these to the 2d symbol*/}
        <Button
          icon={<PlusCircledIcon className="w-5 h-5" />}
          position="bottom-left"
          className={waypointMode ? "bg-blue-200" : ""}
          onClick={() => setWaypointMode(!waypointMode)}
        />

        <Button
          icon={<PlusCircledIcon className="w-5 h-5" />}
          position="bottom-left"
          className={waypointMode ? "bg-blue-200" : ""}
          onClick={() => setWaypointMode(!waypointMode)}
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
      </div>
    </div>
  );
};

export default MapView;
