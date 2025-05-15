// pathfinder/src/views/index.tsx
import { useState, useEffect } from 'react';
import DesktopView from "./type/desktop";
import MobileView from "./type/mobile";
import { type Database } from "@/models/supabase_types";

import { useEventsStore } from '@/stores/useEventsStore';

interface MapViewProps {
  events: Database['public']['Views']['events']['Row'][]
}

const MapView = ({ events }: MapViewProps) => {
  const [windowSize, setWindowSize] = useState<{ width: number; height: number } | null>(null);
  const setEvents = useEventsStore(state => state.setEvents);

  useEffect(() => {
    const updateSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateSize();

    window.addEventListener('resize', updateSize);

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    if (!events) {
      console.error("ERROR: No events were loaded.");
    } else {
      setEvents(events);
    }
  }, [events, setEvents]);

  const isDesktop = windowSize && windowSize.width >= 768;
  const ViewComponent = isDesktop ? DesktopView : MobileView;

  return <ViewComponent />
};

export default MapView;
