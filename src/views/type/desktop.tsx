// views/type/desktop.tsx
'use client'
import Map from "@/components/Map";
import mapboxClient from "@/services/MapboxClient";
import { EventData } from "@/components/specific/RSVP";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/supabase/component";
import DashboardLayout from "@/layouts/DashboardLayout";
import { fetchEventsAndOrgs } from "@/utils/fetchEventsAndOrgs";
import WaypointPopup from "@/components/specific/WaypointPopup";
import PersonalEventForm from "@/components/specific/PersonalEventForm";
import type { PersonalEventFormProps } from "@/components/specific/PersonalEventForm";
import OrganizationEventForm from "@/components/specific/OrganizationEventForm";
import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";
import { useEventsStore } from "@/stores/useEventsStore";
import { useOrgsStore } from "@/stores/useOrgsStore";
import { changeMapEnvOnTime } from "@/utils";
import OrgSearchPanel from "@/components/specific/OrgSearchPanel";
import { DateRange } from "@/components/reusable/DateRangeFilter";

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
]

interface ViewProps {
  event_id: string | null
}

const DesktopView = ({event_id}: ViewProps) => {
  const [waypointMode, setWaypointMode] = useState(false);
  const [selectedWaypoint, setSelectedWaypoint] = useState<[number, number] | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [formType, setFormType] = useState<'personal' | 'org'>('personal');
  const [orgSearchOpen, setOrgSearchOpen] = useState(false);
  const handleOrgSearchToggle = () => setOrgSearchOpen(prev => !prev);
  const events = useEventsStore(state => state.events);
  const setEvents = useEventsStore(state => state.setEvents);
  const setRawOrgs = useOrgsStore(state => state.setOrgs);
  // Handler to re-fetch events and orgs after login
  const handleAuthChange = async (isAuthenticated: boolean) => {
    if (isAuthenticated) {
      try {
        const { events, orgs } = await fetchEventsAndOrgs();
        setEvents(events);
        setRawOrgs(orgs);
      } catch (err) {
        console.error("Failed to fetch events/orgs after login:", err);
      }
    }
  };
  const [user, setUser] = useState<any>(null);

  const supabase = createClient();
  interface Org {
    org_id: string;
    org_name: string;
    userIsPartOf: boolean;
    userIsSubscribed: boolean;
  }


  const rawOrgs = useOrgsStore(state => state.orgs);
  const [orgs, setOrgs] = useState<Org[]>([]);

  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    const formatted = rawOrgs.flatMap((x) =>
      (x.name !== null && x.id !== null && x.user_is_part_of_org !== null
        && x.user_is_subscribed_to_org !== null
        ? {
            org_name: x.name,
            org_id: x.id,
            userIsPartOf: x.user_is_part_of_org,
            userIsSubscribed: x.user_is_subscribed_to_org,
          }
        : [])
    );
    setOrgs(formatted);
  }, [rawOrgs]);

  useEffect(() => {
    mapboxClient.events.removeAnyMarkers();

    // Only pass onUpdate to the RSVP popup for the selected event (event_id)
    function handleRefreshEventsAndOrgs() {
      fetchEventsAndOrgs().then(({ events, orgs }) => {
        setEvents(events);
        setRawOrgs(orgs);
      });
    }

    for (const row of events) {
      if (
        row &&
        typeof row.longitude === "number" &&
        typeof row.latitude === "number"
      ) {
        const eventDate = row.date;
        if (eventDate === null) continue;

        // Check if event matches date filter
        const matchesDateFilter =
          (!dateRange.startDate || eventDate >= dateRange.startDate) &&
          (!dateRange.endDate || eventDate <= dateRange.endDate);

        const isUserOrgEvent = orgs.some(org => org.org_name === row.organization_name && org.userIsPartOf === true);
        const eventData: EventData = {
          id: row.id || "ERROR",
          name: row.event || "",
          type: row.type || "personal",
          description: row.description || "",
          date: row.date || new Date().toISOString().split('T')[0],
          startTime: row.start_time || "00:00",
          endTime: row.end_time || "23:59",
          rsvp_count: row.rsvp_count,
          user_email: row.user_email,
          organization_name: row.organization_name,
          longitude: row.longitude,
          latitude: row.latitude,
          creator: {
            name: row.user_email || row.organization_name || 'ERROR',
            isClub: row.type === "club",
            isUserOrg: isUserOrgEvent
          }
        };
        if (matchesDateFilter) {
          // Only pass onUpdate for the RSVP popup of the selected event
          if (event_id && row.id === event_id) {
            mapboxClient.events.addEventMarker(
              [row.longitude, row.latitude],
              eventData,
              user,
              handleRefreshEventsAndOrgs
            );
          } else {
            mapboxClient.events.addEventMarker(
              [row.longitude, row.latitude],
              eventData,
              user
            );
          }
        }
      }
    }

    // After all markers are rendered, show the RSVP tab if event_id is present
    if (event_id) {
      // Wait a tick to ensure markers are rendered
      setTimeout(() => {
        mapboxClient.events.showEventMarker(event_id);
      }, 0);
    }
  }, [events, orgs, user, dateRange, event_id]);

  const handleToggleSubscribe = async (id: string, next: boolean) => {
    console.log(`Tried to ${next ? "subscribe to" : "unsubscribe from"} org ${id}`);
    const { data: { session }, error: userError } = await supabase.auth.getSession();
    if (next) {
      const { error } = await supabase
        .from('subscriptions_v0')
        .insert({ organization_id: id, user_id: session?.user.id})
      if (error) {
        console.log(error)
      }
      else {
        setOrgs(prev =>
          prev.map(o => (o.org_id === id ? { ...o, userIsSubscribed: true } : o))
        );
      }
    }
    else {
      const { error } = await supabase
        .from('subscriptions_v0')
        .delete()
        .eq('user_id', session?.user.id)
        .eq('organization_id', id)
      if (error) {
        console.log(error)
      }
      else {
        setOrgs(prev =>
          prev.map(o => (o.org_id === id ? { ...o, userIsSubscribed: false } : o))
        );
      }
    }
  };



  // search bar state
  const [searchInput, setSearchInput] = useState<string>("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<
    { name: string; coordinates: [number, number]; source: "local" | "mapbox" }[]
  >([]);

  
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null); // Ref to store interval ID
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null); // Ref to store timeout ID

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error fetching user:", error);
      } else {
        setUser(session?.user);
      }
    };

    fetchUser();
  }, [supabase]);

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

  useEffect(() => {
    const executeMapLogic = () => {
      const map = mapboxClient.getMap();
      const preset = changeMapEnvOnTime();
      if (map) {
        (map as any).setConfigProperty('basemap', 'lightPreset', preset);
      }
      console.log(`changed to ${preset}`);
    };

    console.log("mounted");

    let intervalId: NodeJS.Timeout | undefined;

    const initialTimeoutId = setTimeout(() => {
      executeMapLogic();

      // Repeats logic every 5 minutes
      intervalId = setInterval(() => {
        executeMapLogic();
      }, 1000 * 60 * 5); // 5

    }, 1000 * 2); // 1

    // Cleanup function to clear the timeout and interval when the component unmounts
    return () => {
      clearTimeout(initialTimeoutId);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);



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
      const { data: { session }, error: userError } = await supabase.auth.getSession();
      const user = session?.user;

      if (userError || !user) {
        console.error("User not found or error:", userError);
      } else {
        const insertData: any = {
          event: formData.name,
          latitude: lat,
          longitude: lng,
          description: formData.description,
          date: formData.date,
          start_time: formData.startTime,
          end_time: formData.endTime,
        };

        // Dynamically add either user_id or organization_id
        if (formType === 'personal') {
          insertData.user_id = user.id;
        } else if (formType === 'org') {
          // You may want to select org by another means now that tags are removed
          // insertData.organization_id = selectedOrgId; // Replace with actual organization ID
        }

        const { error: insertError } = await supabase.from("events_v0").insert(insertData);

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
    mapboxClient.events.removeBaseMarker();
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
          isAuthenticated={!!user}
        />
      )}

      {selectedWaypoint && showEventForm && (
        formType === "personal" ? (
          <PersonalEventForm
            coordinates={selectedWaypoint}
            onSubmit={handleCreateEvent}
            onCancel={handleClosePopup}
            formType={formType}
            onFormTypeToggle={orgs.some(o => o.userIsPartOf) ? () =>
              setFormType((prev) =>
                prev === "personal" ? "org" : "personal"
              ) : undefined}
          />
        ) : (
          <OrganizationEventForm
            coordinates={selectedWaypoint}
            onSubmit={handleCreateEvent}
            onCancel={handleClosePopup}
            formType={formType}
            // No switch for org form
          />
        )
      )}

      <OrgSearchPanel
        isOpen={orgSearchOpen}
        onClose={handleOrgSearchToggle}
        orgs={orgs}
        onToggleSubscribe={handleToggleSubscribe}
      />

      <DashboardLayout
        development={false}
        onWaypointModeToggle={handleWaypointModeToggle}
        waypointMode={waypointMode}  
        searchInput={searchInput}
        onSearchInputChange={handleSearchChange}
        filteredSuggestions={filteredSuggestions}
        onSuggestionSelect={handleSuggestionSelect}
        onOrgSearchToggle={handleOrgSearchToggle}
        event_id={event_id}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onAuthChange={handleAuthChange}
      />
    </div>
  );
};

export default DesktopView;
