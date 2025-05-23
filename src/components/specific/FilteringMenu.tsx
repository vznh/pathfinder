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
    useTimeFilter: boolean;
  }) => void;
  initialFilters?: {
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    useTimeFilter: boolean;
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
  const [startTime, setStartTime] = useState(initialFilters?.startTime || "");
  const [endTime, setEndTime] = useState(initialFilters?.endTime || "");
  const [useTimeFilter, setUseTimeFilter] = useState(initialFilters?.useTimeFilter || false);

  useEffect(() => {
    if (initialFilters) {
      setStartDate(initialFilters.startDate || "");
      setEndDate(initialFilters.endDate || "");
      setStartTime(initialFilters.startTime || "");
      setEndTime(initialFilters.endTime || "");
      setUseTimeFilter(initialFilters.useTimeFilter || false);
    }
  }, [initialFilters]);

  const handleApplyClick = () => {
    onApplyFilters({ 
      startDate, 
      endDate, 
      startTime: useTimeFilter ? startTime : "", 
      endTime: useTimeFilter ? endTime : "",
      useTimeFilter 
    });
    onClose();
  };

  const handleClearClick = () => {
    setStartDate("");
    setEndDate("");
    setStartTime("");
    setEndTime("");
    setUseTimeFilter(false);
    onApplyFilters({ 
      startDate: "", 
      endDate: "", 
      startTime: "", 
      endTime: "",
      useTimeFilter: false 
    });
    onClose();
  };

  const handleDateChange = (date: string, isStart: boolean) => {
    if (isStart) {
      setStartDate(date);
      // If end date is before start date, update it
      if (endDate && date > endDate) {
        setEndDate(date);
      }
    } else {
      setEndDate(date);
      // If start date is after end date, update it
      if (startDate && date < startDate) {
        setStartDate(date);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white">
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
              onChange={(e) => handleDateChange(e.target.value, true)}
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
              onChange={(e) => handleDateChange(e.target.value, false)}
              className="col-span-3 px-2 py-1 border rounded-md text-black"
            />
          </div>

          {/* Time Filter Toggle */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="useTimeFilter" className="text-right text-sm">
              Filter by Time
            </label>
            <div className="col-span-3">
              <input
                id="useTimeFilter"
                type="checkbox"
                checked={useTimeFilter}
                onChange={(e) => setUseTimeFilter(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-600">
                {useTimeFilter ? "Time filter enabled" : "Time filter disabled"}
              </span>
            </div>
          </div>

          {/* Time Inputs - Only show if time filter is enabled */}
          {useTimeFilter && (
            <>
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
            </>
          )}
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
