import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { createClient } from "@/supabase/component";
import { EventRsvp, EventData } from "@/components/specific/RSVP";
import type { GetServerSidePropsContext } from "next";

const EventPage: NextPage = () => {
  const router = useRouter();
  const { eventId } = router.query;
  const [event, setEvent] = useState<EventData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;

      const supabase = createClient();
      
      // Check if user is authenticated
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setError("Please sign in to view this event");
        setIsLoading(false);
        return;
      }

      // Fetch event data
      const { data: eventData, error: eventError } = await supabase
        .from("events_v0")
        .select(`
          id,
          event,
          type,
          description,
          date,
          start_time,
          end_time,
          latitude,
          longitude,
          user_email,
          organization_name,
          rsvp_count
        `)
        .eq("id", eventId)
        .single();

      if (eventError) {
        setError("Event not found");
        setIsLoading(false);
        return;
      }

      // Transform the data to match EventData interface
      const transformedEvent: EventData = {
        id: eventData.id,
        name: eventData.event,
        type: eventData.type,
        description: eventData.description || "",
        date: eventData.date,
        startTime: eventData.start_time,
        endTime: eventData.end_time,
        latitude: eventData.latitude,
        longitude: eventData.longitude,
        rsvp_count: eventData.rsvp_count,
        organization_name: eventData.organization_name,
        user_email: eventData.user_email,
        creator: {
          name: eventData.organization_name || eventData.user_email || "Unknown",
          isClub: eventData.type === "club"
        }
      };

      setEvent(transformedEvent);
      setIsLoading(false);
    };

    fetchEvent();
  }, [eventId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">{error}</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Event not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <EventRsvp event={event} />
    </div>
  );
};

export default EventPage; 