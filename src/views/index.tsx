// pathfinder/src/views/index.tsx
import { useState, useEffect } from 'react';
import DesktopView from "./type/desktop";
import type {EventRow, OrgRow} from "@/models/types"

import { useEventsStore } from '@/stores/useEventsStore';
import { OrgsStore, useOrgsStore } from '@/stores/useOrgsStore';


interface MapViewProps {
  events: EventRow[],
  orgs: OrgRow[],
  event_id: string | null
}

const MapView = ({ events, orgs, event_id }: MapViewProps) => {
  const [windowSize, setWindowSize] = useState<{ width: number; height: number } | null>(null);
  const setEvents = useEventsStore(state => state.setEvents);
  const setOrgs = useOrgsStore((state: OrgsStore) => state.setOrgs);

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

  useEffect(() => {
    if (!orgs) {
      console.error("ERROR: No orgs were loaded.");
    } else {
      console.log(orgs)
      setOrgs(orgs);
    }
  }, [orgs, setOrgs]);

  // const isDesktop = windowSize && windowSize.width >= 768;
  // const ViewComponent = isDesktop ? DesktopView : MobileView;

  return <DesktopView event_id={event_id}/>
};

export default MapView;
