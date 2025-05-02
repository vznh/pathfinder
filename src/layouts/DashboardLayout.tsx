// layouts/DashboardLayout.tsx
import type React from "react";
import EmailModalButton from "@/components/specific/EmailModal";
import { Button } from "@/components/reusable/Button";

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
        <EmailModalButton />
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
        <EmailModalButton />
      </div>

      {/* Middle row */}
      <div
        className={`pointer-events-auto flex items-center justify-start p-4 ${borderClasses}`}
      >
        {/* Middle left */}
        <EmailModalButton />
      </div>
      {/* Middle cell intentionally left empty */}
      <div className={`${middleCellBgClasses}`}></div>
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
        <EmailModalButton />
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
        <EmailModalButton />
      </div>
    </div>
  );
};

export default DashboardLayout;
