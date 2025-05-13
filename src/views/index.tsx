// pathfinder/src/views/index.tsx
import { useState, useEffect, Fragment } from 'react';
import DesktopView from "./type/desktop";
import MobileView from "./type/mobile";
import { type Database } from "@/models/supabase_types";

interface MapViewProps {
  events: Database["public"]["Views"]["events"]["Row"][]
}

const MapView = ({ events }: MapViewProps) => {
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
        <DesktopView events={events} />
      ) : (
        <MobileView events={events}/>
      )}
    </Fragment>
  );
};

export default MapView;
