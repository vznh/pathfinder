import Map from "@/components/Map";
import mapboxClient from "@/services/MapboxClient";
import { EventData } from "@/components/specific/RSVP";
import { useEffect, useState } from "react";
import { createClient } from "@/supabase/component";
import DashboardLayout from "@/layouts/DashboardLayout";
import WaypointPopup from "@/components/specific/WaypointPopup";

import PersonalEventForm from "@/components/specific/PersonalEventForm";
import type { PersonalEventFormProps } from "@/components/specific/PersonalEventForm";
import OrganizationEventForm from "@/components/specific/OrganizationEventForm";
import type { OrganizationEventFormProps } from "@/components/specific/OrganizationEventForm";
import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";

const geocodingClient = mbxGeocoding({
  accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!,
});

const UCSC_BBOX: [number, number, number, number] = [
  -122.0700, 36.9840, -122.0300, 37.0080,
];

const ucscLocations = [
  { name: "Cowell College", latitude: 36.9955, longitude: -122.0527 },
  { name: "Crown College", latitude: 36.9990, longitude: -122.0544 },
  { name: "Merrill College", latitude: 36.9997, longitude: -122.0536 },
  { name: "College Nine", latitude: 36.9997, longitude: -122.0580 },
  { name: "College Ten", latitude: 36.9992, longitude: -122.0585 },
  { name: "Rachel Carson College", latitude: 36.9912, longitude: -122.0650 },
  { name: "Oakes College", latitude: 36.9893, longitude: -122.0643 },
  { name: "Porter College", latitude: 36.9942, longitude: -122.0656 },
  { name: "Stevenson College", latitude: 36.9983, longitude: -122.0530 },
  { name: "Kresge College", latitude: 36.9992, longitude: -122.0650 },
  { name: "Science Hill", latitude: 36.9995, longitude: -122.0600 },
  { name: "East Field", latitude: 36.9975, longitude: -122.0535 },
  { name: "Quarry Amphitheater", latitude: 36.9990, longitude: -122.0580 },
  { name: "Science and Engineering Library", latitude: 36.9991, longitude: -122.0608 },
  { name: "McHenry Library", latitude: 36.9970, longitude: -122.0590 },
  { name: "University Center", latitude: 36.9994, longitude: -122.0575 },
  { name: "Bay Tree Bookstore", latitude: 36.9980, longitude: -122.0555 },
  { name: "Humanities Lecture Hall", latitude: 36.9978, longitude: -122.0532 },
  { name: "Cafe Iveta", latitude: 36.9985, longitude: -122.0560 },
  { name: "Pogonip", latitude: 36.9990, longitude: -122.0300 },
  { name: "Oakes Meadow", latitude: 36.9880, longitude: -122.0650 },
];import { useEventsStore } from "@/stores/useEventsStore";


const DesktopView: React.FC = () => {
  const [waypointMode, setWaypointMode] = useState(false);
  const [selectedWaypoint, setSelectedWaypoint] = useState<[number, number] | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [formType, setFormType] = useState<'personal' | 'org'>('personal');

  const supabase = createClient();
  // search bar state
  const [searchInput, setSearchInput] = useState<string>("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<
    { name: string; coordinates: [number, number]; source: "local" | "mapbox" }[]
  >([]);

  // handler for typing in the search box
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);

    if (!value) {
      setFilteredSuggestions([]);
      return;
    }

    // 1. local UCSC matches
    const localMatches = ucscLocations
      .filter(loc => loc.name.toLowerCase().includes(value.toLowerCase()))
      .map(loc => ({
        name: loc.name,
        coordinates: [loc.longitude, loc.latitude] as [number, number],
        source: "local" as const,
      }));

    // 2. mapbox fallback
    const resp = await geocodingClient
      .forwardGeocode({
        query: value,
        limit: 5,
        types: ["poi", "place", "address"],
        bbox: UCSC_BBOX,
      })
      .send();

    const mapboxMatches = resp.body.features.map((feat: any) => ({
      name: feat.place_name,
      coordinates: feat.geometry.coordinates as [number, number],
      source: "mapbox" as const,
    }));

    setFilteredSuggestions([...localMatches, ...mapboxMatches]);
  };

  // handler for choosing one suggestion
  const handleSuggestionSelect = (s: {
    name: string;
    coordinates: [number, number];
    source: "local" | "mapbox";
  }) => {
    setSearchInput(s.name);
    setFilteredSuggestions([]);
    mapboxClient.camera.zoomTo(s.coordinates, 18, true);
  };

  const events = useEventsStore(state => state.events);

  useEffect(() => {
    if (!events || events.length === 0) return;
    for (const row of events) {
      if (
        row &&
        typeof row.longitude === "number" &&
        typeof row.latitude === "number"
      ) {
        const eventData: EventData = {
          id: row.id || "ERROR",
          name: row.event || "",
          type: row.type || "personal",
          description: row.description || "",
          date: row.date || new Date().toISOString().split('T')[0],
          startTime: row.start_time || "00:00",
          endTime: row.end_time || "23:59",
          rsvp_count: row.rsvp_count,
          creator: {
            name: row.user_email || row.organization_name || 'ERROR',
            isClub: row.type === "club"
          }
        };
        mapboxClient.events.addEventMarker([row.longitude, row.latitude], eventData);
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

  const handleWaypointModeToggle = () => {
    setWaypointMode(!waypointMode);
    if (selectedWaypoint) {
      setSelectedWaypoint(null);
      setShowEventForm(false);
    }
  };

  const handleCreateEvent = async (
    formData: Parameters<PersonalEventFormProps["onSubmit"]>[0]
  ) => {
    setSelectedWaypoint(null);
    setShowEventForm(false);

    if (selectedWaypoint) {
      const [lng, lat] = selectedWaypoint;
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("User not found or error:", userError);
      } else {
        const { error: insertError } = await supabase.from("events_v0").insert({
          user_id: user.id,
          event: formData.name,
          latitude: lat,
          longitude: lng,
          type: formData.tags,
          description: formData.description,
          date: formData.date,
          start_time: formData.startTime,
          end_time: formData.endTime,
        });

        if (insertError) {
          console.error("Insert error:", insertError);
        } else {
          console.log("Row inserted successfully");
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
        formType === "personal" ? (
          <PersonalEventForm
            coordinates={selectedWaypoint}
            onSubmit={handleCreateEvent}
            onCancel={handleClosePopup}
          />
        ) : (
          <OrganizationEventForm
            coordinates={selectedWaypoint}
            onSubmit={handleCreateEvent}
            onCancel={handleClosePopup}
          />
        )
      )}

      <DashboardLayout
        development={false}
        onWaypointModeToggle={handleWaypointModeToggle}
        searchInput={searchInput}
        onSearchInputChange={handleSearchChange}
        filteredSuggestions={filteredSuggestions}
        onSuggestionSelect={handleSuggestionSelect}
        {...(showEventForm && {
          formType,
          onFormTypeToggle: () =>
            setFormType(formType === "personal" ? "org" : "personal"),
        })}
      />
    </div>
  );
};

export default DesktopView;