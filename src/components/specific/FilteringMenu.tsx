// components/specific/FilteringMenu.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/prebuilt/Dialog";
import { Button } from "@/components/prebuilt/Button";

interface FilteringMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: {
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
  }) => void;
  initialFilters?: {
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
  };
}

const FilteringMenu: React.FC<FilteringMenuProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  initialFilters,
}) => {
  const [startDate, setStartDate] = useState(initialFilters?.startDate || "");
  const [endDate, setEndDate] = useState(initialFilters?.endDate || "");
  const [startTime, setStartTime] = useState(
    initialFilters?.startTime || ""
  );
  const [endTime, setEndTime] = useState(initialFilters?.endTime || "");

  useEffect(() => {
    if (initialFilters) {
      setStartDate(initialFilters.startDate || "");
      setEndDate(initialFilters.endDate || "");
      setStartTime(initialFilters.startTime || "");
      setEndTime(initialFilters.endTime || "");
    }
  }, [initialFilters]);

  const handleApplyClick = () => {
    onApplyFilters({ startDate, endDate, startTime, endTime });
    onClose(); // Close the dialog after applying
  };

  const handleClearClick = () => {
    setStartDate("");
    setEndDate("");
    setStartTime("");
    setEndTime("");
    onApplyFilters({ startDate: "", endDate: "", startTime: "", endTime: "" });
    onClose(); // Close the dialog after clearing
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filter Events</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Date Inputs */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="startDate" className="text-right text-sm">
              Start Date
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="col-span-3 px-2 py-1 border rounded-md text-black"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="endDate" className="text-right text-sm">
              End Date
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="col-span-3 px-2 py-1 border rounded-md text-black"
            />
          </div>

          {/* Time Inputs */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="startTime" className="text-right text-sm">
              Start Time
            </label>
            <input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="col-span-3 px-2 py-1 border rounded-md text-black"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="endTime" className="text-right text-sm">
              End Time
            </label>
            <input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="col-span-3 px-2 py-1 border rounded-md text-black"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClearClick}>
            Clear Filters
          </Button>
          <Button onClick={handleApplyClick}>Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FilteringMenu;
