// layouts/DashboardLayout.tsx
import type React from "react";
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
  PaperPlaneIcon
} from "@radix-ui/react-icons";

interface DashboardLayoutProps {
  development?: boolean;
  onWaypointModeToggle?: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  development = false,
  onWaypointModeToggle,
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

            { /* FILTERS -- START */}
            <button
              className="flex items-center justify-center p-2 rounded-lg bg-white hover:bg-gray-100 text-gray-800 transition"
              aria-label="Filters"
              onClick={() => {}}
            >
              <MixerHorizontalIcon className="w-5 h-5" />
            </button>
            { /* FILTERS -- END */}

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
