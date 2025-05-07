import React from "react";

interface WaypointPopupProps {
  coordinates: [number, number];
  onCreateEvent: () => void;
  onClose: () => void;
  
}

const WaypointPopup: React.FC<WaypointPopupProps> = ({ coordinates, onCreateEvent, onClose }) => {
  return (
    <div className="absolute left-[calc(50%+20px)] top-1/2 -translate-y-1/2">
      <div className="relative bg-gray-800 text-white rounded-2xl shadow-2xl p-6 w-96">
        {/* Pointer */}
        <div className="absolute left-0 top-1/2 -translate-x-2 -translate-y-1/2 w-4 h-4 overflow-hidden">
          <div className="bg-gray-800 w-4 h-4 rotate-45 transform origin-center"></div>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl">×</button>
        <div className="mb-2">
          <div className="text-2xl font-bold">Waypoint</div>
          <div className="text-gray-300 text-sm mb-4">0.2mi away</div>
        </div>
        <div className="flex gap-2 mb-4">
          <button
            onClick={onClose}
            className="flex-1 bg-white text-gray-900 rounded-lg py-2 font-semibold shadow hover:bg-gray-100 transition"
          >
            Navigate
          </button>
          <button
            onClick={onCreateEvent}
            className="flex-1 bg-white text-gray-900 rounded-lg py-2 font-semibold shadow hover:bg-gray-100 transition"
          >
            Create Event
          </button>
        </div>
        <div className="mb-2 font-semibold">Details</div>
        <div className="bg-gray-700 rounded-lg px-3 py-2 text-sm mb-4">
          Coordinates:<br />
          {coordinates[1].toFixed(6)}° N, {coordinates[0].toFixed(6)}° W
        </div>
        <div className="flex flex-col gap-2">
          <button className="flex items-center gap-2 bg-gray-700 text-gray-400 rounded-lg px-3 py-2 text-sm">
            <span className="text-lg">＋</span> Add to your saved waypoints
          </button>
          <button className="flex items-center gap-2 bg-gray-700 text-gray-400 rounded-lg px-3 py-2 text-sm">
            <span className="text-lg">⚠️</span> Report anything suspicious
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaypointPopup; 