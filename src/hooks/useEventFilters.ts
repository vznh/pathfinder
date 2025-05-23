import { useState, useEffect } from 'react';
import { EventData } from '@/components/specific/RSVP';
import mapboxClient from '@/services/MapboxClient';

export interface EventFilters {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  useTimeFilter: boolean;
}

export const useEventFilters = (events: any[]) => {
  const [currentFilters, setCurrentFilters] = useState<EventFilters>(() => {
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
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const defaultDate = `${year}-${month}-${day}`;

    return {
      startDate: defaultDate,
      endDate: defaultDate,
      startTime: startTimeStr,
      endTime: endTimeStr,
      useTimeFilter: false
    };
  });

  const handleFilterChange = (filters: EventFilters) => {
    setCurrentFilters(filters);
  };

  useEffect(() => {
    if (!events || events.length === 0) {
      mapboxClient.events.removeAnyMarkers();
      return;
    }

    // Clear existing markers before adding filtered ones
    mapboxClient.events.removeAnyMarkers();

    let displayedEventsCount = 0;

    for (const row of events) {
      if (
        row &&
        typeof row.longitude === "number" &&
        typeof row.latitude === "number"
      ) {
        const eventDate = row.date;
        const eventStartTime = row.start_time;
        const eventEndTime = row.end_time;

        if (eventDate === null) continue;

        // Check if event matches date filter
        // An event matches if:
        // 1. No start date filter OR event date is on or after start date
        // 2. No end date filter OR event date is on or before end date
        const matchesDateFilter =
          (!currentFilters.startDate || eventDate >= currentFilters.startDate) &&
          (!currentFilters.endDate || eventDate <= currentFilters.endDate);

        // Only apply time filter if useTimeFilter is true and dates match
        let matchesTimeFilter = true;
        if (currentFilters.useTimeFilter && matchesDateFilter) {
          // For same-day events, check if times overlap
          if (eventDate === currentFilters.startDate && eventDate === currentFilters.endDate) {
            matchesTimeFilter = 
              (!currentFilters.startTime || (eventStartTime && eventStartTime >= currentFilters.startTime)) &&
              (!currentFilters.endTime || (eventEndTime && eventEndTime <= currentFilters.endTime));
          }
          // For multi-day events, check if event times fall within the filter time range
          else {
            matchesTimeFilter = 
              (!currentFilters.startTime || (eventStartTime && eventStartTime >= currentFilters.startTime)) &&
              (!currentFilters.endTime || (eventEndTime && eventEndTime <= currentFilters.endTime));
          }
        }

        if (matchesDateFilter && matchesTimeFilter) {
          displayedEventsCount++;
          const eventData: EventData = {
            id: row.id || "ERROR",
            name: row.event || "",
            type: row.type || "personal",
            description: row.description || "",
            date: eventDate,
            startTime: eventStartTime || "00:00",
            endTime: eventEndTime || "23:59",
            rsvp_count: row.rsvp_count,
            organization_name: row.organization_name,
            user_email: row.user_email,
            creator: {
              name: row.user_email || row.organization_name || 'ERROR',
              isClub: row.type === "club"
            }
          };
          mapboxClient.events.addEventMarker([row.longitude, row.latitude], eventData);
        }
      }
    }

    console.log('Filtered Events:', {
      total: events.length,
      displayed: displayedEventsCount,
      filters: currentFilters
    });
  }, [events, currentFilters]);

  return {
    currentFilters,
    handleFilterChange
  };
}; 