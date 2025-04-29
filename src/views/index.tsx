// pathfinder/src/views/index.tsx
import { useState, useEffect, Fragment } from 'react';
import DesktopView from "./type/desktop";
import MobileView from "./type/mobile";
import { type Database } from "@/models/supabase_types";

interface MapViewProps {
  events_v0: Database['public']['Tables']['events_v0']['Row'][]
}

const MapView = ({ events_v0 }: MapViewProps) => {
  const [windowSize, setWindowSize] = useState<{ width: number; height: number } | null>(null);

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

  const isDesktop = windowSize && windowSize.width >= 768;

  return (
    <Fragment>
      {isDesktop ? (
        <DesktopView events={events_v0} />
      ) : (
        <MobileView events={events_v0}/>
      )}
    </Fragment>
  );
};

export default MapView;
