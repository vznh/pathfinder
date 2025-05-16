// layouts/DashboardLayout.tsx
import React from "react";
import EmailModalButton from "@/components/specific/EmailModal";
import DropdownMenu from "@/components/reusable/DropDownMenu";
import { Button } from "@/components/reusable/Button"
import mapboxClient from "@/services/MapboxClient";
import {
  DotsVerticalIcon,
  PersonIcon,
  GearIcon,
  InfoCircledIcon,
  LayersIcon,
  MixerHorizontalIcon,
  ReaderIcon,
  ExitIcon,
  PlusCircledIcon,
  SewingPinFilledIcon,
  ClockIcon,
  PaperPlaneIcon,
  MagnifyingGlassIcon
} from "@radix-ui/react-icons";

interface DashboardLayoutProps {
  development?: boolean;
  onWaypointModeToggle?: () => void;
  searchInput: string;
  onSearchInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filteredSuggestions: { name: string; coordinates: [number, number]; source: "local" | "mapbox" }[];
  onSuggestionSelect: (s: {name: string; coordinates: [number, number]; source: "local" | "mapbox" }) => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  development = false,
  onWaypointModeToggle,
  searchInput,
  onSearchInputChange,
  filteredSuggestions,
  onSuggestionSelect,
}) => {
  const borderClasses = development
    ? "border border-dashed border-gray-300"
    : "";
  const middleCellBgClasses = development ? "bg-gray-100/20" : "";

  return (
    <div className="pointer-events-none absolute inset-0 z-10 grid h-full w-full grid-cols-3 grid-rows-3">
      {/* Top row */}
      <div
        className={`pointer-events-none flex items-start justify-start p-4 ${borderClasses}`}
      >
        {/* Top left */}
        <DropdownMenu
          toggleIcon={<DotsVerticalIcon className="w-5 h-5 pointer-events-auto" />}
          position="top-left"
          theme="light"
          label="Quick actions"
          buttonClassName="bg-white w-12 h-12 flex items-center justify-center"
        >
          <div className="flex flex-col gap-2 pointer-events-auto">
            <button
              className="flex items-center justify-center p-2 rounded-lg bg-white hover:bg-gray-100 text-gray-800 transition"
              aria-label="Clock"
            >
              <ClockIcon className="w-5 h-5" />
            </button>
            <button
              className="flex items-center justify-center p-2 rounded-lg bg-white hover:bg-gray-100 text-gray-800 transition"
              aria-label="Filters"
            >
              <MixerHorizontalIcon className="w-5 h-5" />
            </button>
            <button
              className="flex items-center justify-center p-2 rounded-lg bg-white hover:bg-gray-100 text-gray-800 transition"
              aria-label="Add"
              onClick={onWaypointModeToggle}
            >
              <PlusCircledIcon className="w-5 h-5" />
            </button>
            <button
              className="flex items-center justify-center p-2 rounded-lg bg-white hover:bg-gray-100 text-gray-800 transition"
              aria-label="Pin"
            >
              <SewingPinFilledIcon className="w-5 h-5" />
            </button>
          </div>
        </DropdownMenu>
      </div>

      <div
        className={`pointer-events-none flex items-start justify-center p-4 ${borderClasses}`}
      >
        {/* Top center */}
        <div className="pointer-events-auto relative w-72">
          <div className="flex items-center space-x-2 bg-white rounded-full px-3 py-2 shadow-md font-sans text-sm">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-600" />
            <input
              type="text"
              placeholder="Search…"
              className="flex-grow bg-transparent outline-none placeholder:text-gray-400"
              value={searchInput}
              onChange={onSearchInputChange}
            />
          </div>
          {filteredSuggestions.length > 0 && (
            <ul className="absolute top-full left-0 mt-1 w-full bg-white rounded-md shadow-md z-40 max-h-60 overflow-y-auto">
              {filteredSuggestions.map((s, i) => (
                <li
                  key={i}
                  className="flex justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => onSuggestionSelect(s)}
                >
                  <span>{s.name}</span>
                  {s.source === "local" && (
                    <span className="ml-2 text-xs text-gray-500">(UCSC)</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div
        className={`pointer-events-none flex items-start justify-end p-4 ${borderClasses}`}
      >
        {/* Top right */}
  
      </div>

      {/* Middle row */}
      <div
        className={`pointer-events-none flex items-center justify-start p-4 ${borderClasses}`}
      >
        {/* Middle left */}
      </div>
      <div className={middleCellBgClasses} />
      <div
        className={`pointer-events-none flex items-center justify-end p-4 ${borderClasses}`}
      >
        {/* Middle right */}
      </div>

      {/* Bottom row */}
      <div
        className={`pointer-events-none flex items-end justify-start p-4 ${borderClasses}`}
      >
        {/* Bottom left */}
      </div>
      <div
        className={`pointer-events-none flex items-end justify-center p-4 ${borderClasses}`}
      >
        {/* Bottom center */}
      </div>
      <div
        className={`pointer-events-none flex items-end justify-end p-4 ${borderClasses}`}
      >
        {/* Bottom right */}
        <EmailModalButton></EmailModalButton>
      </div>
    </div>
  );
};

export default DashboardLayout;