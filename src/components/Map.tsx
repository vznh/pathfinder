import React, { useEffect, useRef } from "react";
import mapboxClient from "@/services/MapboxClient";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

const Map: React.FC = () => {
  const mapContainer = useRef(null);

  useEffect(() => {
    if (mapContainer.current) {
      mapboxClient.initialize({
        container: mapContainer.current,
        style: "mapbox://styles/jvson/cm9p1p5yz00db01rmguae0rj3",
        center: [-122.05886, 36.99558],
        zoom: 9,
        maxBounds: [
          [-122.10174, 36.96634],
          [-122.01639, 37.0263],
        ],
      });
    }
    return () => {
      mapboxClient.destroy();
    };
  }, []);

  return (
    <div>
      <div ref={mapContainer} className="w-screen h-screen" />
    </div>
  );
};

export default Map;
