import React from "react";

interface WaypointPopupProps {
  coordinates: [number, number];
  onCreateEvent: () => void;
  onClose: () => void;
  
}