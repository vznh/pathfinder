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
import { createClient } from "@/supabase/component";
import DashboardLayout from "@/layouts/DashboardLayout";
import WaypointPopup from "@/components/specific/WaypointPopup";
import EventForm from "@/components/specific/EventForm";

interface MapViewProps {
  events: Database["public"]["Tables"]["events_v0"]["Row"][];
}

const DesktopView: React.FC<MapViewProps> = ({ events }) => {
  // modes
  const [waypointMode, setWaypointMode] = useState(false);
  const [selectedWaypoint, setSelectedWaypoint] = useState<
    [number, number] | null
  >(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showAuthTest, setShowAuthTest] = useState(false);
  const supabase = createClient();

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

  const handleWaypointModeToggle = () => {
    setWaypointMode(!waypointMode);
    if (selectedWaypoint) {
      setSelectedWaypoint(null);
      setShowEventForm(false);
    }
  };

  const handleCreateEvent = async () => {
    console.log("created event")
  }
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


  const handleClosePopup = () => {
    setSelectedWaypoint(null);
    setShowEventForm(false);
  };

  const handleOpenEventForm = () => {
    setShowEventForm(true);
  };

  return (
    <div>
      <div className="absolute inset-0">
        <Map />
      </div>

      {selectedWaypoint && !showEventForm && (
        <WaypointPopup
          coordinates={selectedWaypoint}
          onCreateEvent={handleOpenEventForm}
          onClose={handleClosePopup}
        />
      )}

      {selectedWaypoint && showEventForm && (
        <EventForm
          coordinates={selectedWaypoint}
          onSubmit={handleCreateEvent}
          onCancel={handleClosePopup}
        />
      )}

      <DashboardLayout 
        development={true} 
        onWaypointModeToggle={handleWaypointModeToggle}
      />
    </div>
  );
};

export default DesktopView;
