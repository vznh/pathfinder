// pathfinder/src/views/index.tsx
import { useState, useEffect, Fragment } from 'react';
import DesktopView from "./type/desktop";
import MobileView from "./type/mobile";
import { type Database } from "@/models/supabase_types";

import { useEventsStore } from '@/stores/useEventsStore';

interface MapViewProps {
  events_v0: Database['public']['Tables']['events_v0']['Row'][]
}

const MapView = ({ events_v0 }: MapViewProps) => {
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
    if (!events_v0) {
      console.error("ERROR: No events were loaded.");
    } else {
      setEvents(events_v0);
    }
  }, [events_v0, setEvents]);

  const isDesktop = windowSize && windowSize.width >= 768;

  return (
    <Fragment>
      {isDesktop ? (
        <DesktopView />
      ) : (
        <MobileView />
      )}
    </Fragment>
  );
};

export default MapView;
