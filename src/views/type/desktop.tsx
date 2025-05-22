// views/type/desktop.tsx
import Map from "@/components/Map";
import mapboxClient from "@/services/MapboxClient";
import { EventData } from "@/components/specific/RSVP";
import { useEffect, useState } from "react";
import { createClient } from "@/supabase/component";
import DashboardLayout from "@/layouts/DashboardLayout";
import WaypointPopup from "@/components/specific/WaypointPopup";
import EventForm from "@/components/specific/EventForm";
import type { EventFormProps } from "@/components/specific/EventForm";
import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";
import { useEventsStore } from "@/stores/useEventsStore";

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
];

const DesktopView: React.FC = () => {
  // modes
  const [waypointMode, setWaypointMode] = useState(false);
  const [selectedWaypoint, setSelectedWaypoint] = useState<
    [number, number] | null
  >(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const supabase = createClient();
  // search bar state
  const [searchInput, setSearchInput] = useState<string>("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<
    { name: string; coordinates: [number, number]; source: "local" | "mapbox" }[]
  >([]);

  // Add filter state with default values
  const [currentFilters, setCurrentFilters] = useState(() => {
    const now = new Date();

    // Calculate and format start time
    const startHour = now.getHours();
    const startMinute = now.getMinutes();
    const startTimeStr = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;

    // Calculate end time (current time + 4 hours)
    const endTime = new Date(now.getTime() + 4 * 60 * 60 * 1000);
    const endHour = endTime.getHours();
    const endMinute = endTime.getMinutes();
    const endTimeStr = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;


    // Calculate default date (today) in YYYY-MM-DD format
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const day = String(today.getDate()).padStart(2, '0');
    const defaultDate = `${year}-${month}-${day}`;


    return {
      startDate: defaultDate,
      endDate: defaultDate, // Default date range is still today
      startTime: startTimeStr,   // Default to current time
      endTime: endTimeStr      // Default to current time + 4 hours
    };
  });

  // Add filter change handler
  const handleFilterChange = (filters: {
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
  }) => {
    setCurrentFilters(filters);
    // Clear existing markers - This is now done in the useEffect that adds markers
    // mapboxClient.events.removeAnyMarkers();
  };

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

  // Effect to add event markers based on events and filter criteria
  useEffect(() => {
    if (!events || events.length === 0) {
      // If no events or events become empty, remove all markers
       mapboxClient.events.removeAnyMarkers();
       return;
    }

    // Clear existing markers before adding filtered ones
    mapboxClient.events.removeAnyMarkers();


    console.log('Current Filters:', currentFilters);
    console.log('Total Events:', events.length);

    let displayedEventsCount = 0;

    for (const row of events) {
      if (
        row &&
        typeof row.longitude === "number" &&
        typeof row.latitude === "number"
      ) {
        // Apply date and time filters
        const eventDate = row.date;
        const eventStartTime = row.start_time;
        const eventEndTime = row.end_time;

        // Only filter if eventDate is not null
        if (eventDate === null) continue;


        // Check if event matches date filter
        const matchesDateFilter =
          (!currentFilters.startDate || eventDate >= currentFilters.startDate) &&
          (!currentFilters.endDate || eventDate <= currentFilters.endDate);

        // Check if event matches time filter (strict containment or equality)
        // An event matches if:
        // - No start time filter OR event start time exists AND event start time >= filter start time
        // - No end time filter OR event end time exists AND event end time <= filter end time
        const matchesTimeFilter =
           (!currentFilters.startTime || (eventStartTime && eventStartTime >= currentFilters.startTime)) &&
           (!currentFilters.endTime || (eventEndTime && eventEndTime <= currentFilters.endTime));


        if (matchesDateFilter && matchesTimeFilter) {
          displayedEventsCount++;
          console.log('Displaying Event:', {
            name: row.event,
            date: eventDate,
            startTime: eventStartTime,
            endTime: eventEndTime,
            matchesDateFilter,
            matchesTimeFilter,
            filterStartTime: currentFilters.startTime,
            filterEndTime: currentFilters.endTime
          });

          const eventData: EventData = {
            id: row.id || "ERROR",
            name: row.event || "",
            type: row.type || "personal",
            description: row.description || "",
            date: eventDate,
            startTime: eventStartTime || "00:00",
            endTime: eventEndTime || "23:59",
            rsvp_count: row.rsvp_count,
            creator: {
              name: row.user_email || row.organization_name || 'ERROR',
              isClub: row.type === "club"
            }
          };
          mapboxClient.events.addEventMarker([row.longitude, row.latitude], eventData);
        } else {
          console.log('Filtered Out Event:', {
            name: row.event,
            date: eventDate,
            startTime: eventStartTime,
            endTime: eventEndTime,
            matchesDateFilter,
            matchesTimeFilter,
            filterStartTime: currentFilters.startTime,
            filterEndTime: currentFilters.endTime
          });
        }
      }
    }

    console.log('Events Displayed:', displayedEventsCount);
    console.log('Events Filtered Out:', events.length - displayedEventsCount);
  }, [events, currentFilters]);

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

  const handleCreateEvent = async (formData: Parameters<EventFormProps['onSubmit']>[0]) => {
    console.log(formData)
    setSelectedWaypoint(null);
    setShowEventForm(false);
    // perform api call here, will just print to console for now
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
            event: formData.name,
            latitude: lat,
            longitude: lng,
            type: formData.type,
            description: formData.description,
            date: formData.date,
            start_time: formData.startTime,
            end_time: formData.endTime
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
        development={false}
        onWaypointModeToggle={handleWaypointModeToggle}
        searchInput={searchInput}
        onSearchInputChange={handleSearchChange}
        filteredSuggestions={filteredSuggestions}
        onSuggestionSelect={handleSuggestionSelect}
        onFilterChange={handleFilterChange} // Pass filter change handler
        currentFilters={currentFilters} // Pass current filters state
      />
    </div>
  );
};

export default DesktopView;
