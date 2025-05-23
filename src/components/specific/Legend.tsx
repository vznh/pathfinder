import React from "react";

const legendItems = [
  { color: "#4dabf7", label: "Your personal events" },
  { color: "#f39c12", label: "Other personal events" },
  { color: "#9b59b6", label: "Organization events" },
];

const Legend: React.FC = () => {
  return (
    <div className="bg-white bg-opacity-90 p-3 rounded-md shadow-md text-xs space-y-2">
      {legendItems.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default Legend;
