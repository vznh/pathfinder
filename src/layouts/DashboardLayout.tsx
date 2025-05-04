// layouts/DashboardLayout.tsx
import type React from "react";
import EmailModalButton from "@/components/specific/EmailModal";
import DropdownMenu from "@/components/specific/DropdownMenu";
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

const DashboardLayout: React.FC<{ development?: boolean }> = ({
  development = false,
}) => {
  const borderClasses = development
    ? "border border-dashed border-gray-300"
    : "";
  const middleCellBgClasses = development ? "bg-gray-100/20" : "";

  return (
    <div className="pointer-events-none absolute inset-0 z-10 grid h-full w-full grid-cols-3 grid-rows-3">
      {/* Top row */}
      <div
        className={`pointer-events-auto flex items-start justify-start p-4 ${borderClasses}`}
      >
        {/* Top left */}
        <DropdownMenu
          toggleIcon={<DotsVerticalIcon className="w-5 h-5" />}
          position="top-left"
          theme="light"
          label="Quick actions"
          buttonClassName="bg-white w-12 h-12 flex items-center justify-center"
        >
          <div className="flex flex-col gap-2">
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
        className={`pointer-events-auto flex items-start justify-center p-4 ${borderClasses}`}
      >
        {/* Top center */}
        <EmailModalButton />
      </div>

      <div
        className={`pointer-events-auto flex items-start justify-end p-4 ${borderClasses}`}
      >
        {/* Top right */}
        <Button
          icon={<PersonIcon className="w-5 h-5" />}
          position="top-right"
          // TODO: implement onClick handler to toggle auth test
          // onClick={() => setShowAuthTest(v => !v)}
        />
      </div>

      {/* Middle row */}
      <div
        className={`pointer-events-auto flex items-center justify-start p-4 ${borderClasses}`}
      >
        {/* Middle left */}
        <EmailModalButton />
      </div>
      <div className={middleCellBgClasses} />
      <div
        className={`pointer-events-auto flex items-center justify-end p-4 ${borderClasses}`}
      >
        {/* Middle right */}
        <EmailModalButton />
      </div>

      {/* Bottom row */}
      <div
        className={`pointer-events-auto flex items-end justify-start p-4 ${borderClasses}`}
      >
        {/* Bottom left */}
        <DropdownMenu
          toggleIcon={<PlusCircledIcon className="w-5 h-5" />}
          position="bottom-left"
          theme="light"
          label="Add new"
          buttonClassName="bg-white"
        >
          <div className="flex flex-col gap-2">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white hover:bg-gray-100 text-gray-800">
              <PlusCircledIcon className="w-4 h-4" />
              <span>Add Waypoint</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white hover:bg-gray-100 text-gray-800">
              <PlusCircledIcon className="w-4 h-4" />
              <span>Create Event</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white hover:bg-gray-100 text-gray-800">
              <PlusCircledIcon className="w-4 h-4" />
              <span>Add Route</span>
            </button>
          </div>
        </DropdownMenu>
      </div>
      <div
        className={`pointer-events-auto flex items-end justify-center p-4 ${borderClasses}`}
      >
        {/* Bottom center */}
        <EmailModalButton />
      </div>
      <div
        className={`pointer-events-auto flex items-end justify-end p-4 ${borderClasses}`}
      >
        {/* Bottom right */}
        <Button
          icon={
            <PaperPlaneIcon
              className="w-5 h-5"
              style={{ transform: "rotate(270deg)" }}
            />
          }
          position="bottom-right"
          onClick={() =>
            mapboxClient.geolocation.getUserLocation((coords) => {
              mapboxClient.camera.zoomTo(
                [coords.longitude, coords.latitude],
                20,
                false
              );
            })
          }
        />
        );
      </div>
    </div>
  );
};

export default DashboardLayout;
