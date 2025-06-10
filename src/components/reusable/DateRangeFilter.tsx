// components/reusable/DateRangeFilter.tsx
'use client'
import React from "react";

export interface DateRange {
  startDate: string;   // yyyy-mm-dd
  endDate: string;     // yyyy-mm-dd
}

interface DateRangeFilterProps {
  range: DateRange;
  /** Fires on *every* change so the parent can react in a useEffect */
  onChange: (r: DateRange) => void;
  className?: string;  // optional for extra styling
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  range,
  onChange,
  className = "",
}) => {
  const update = (key: keyof DateRange, value: string) => {
    const next = { ...range, [key]: value };

    // keep the two inputs logically consistent
    if (key === "startDate" && next.endDate && value > next.endDate) {
      next.endDate = value;
    }
    if (key === "endDate" && next.startDate && value < next.startDate) {
      next.startDate = value;
    }
    onChange(next);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label className="text-xs font-medium text-gray-600">From</label>
      <input
        type="date"
        value={range.startDate}
        onChange={(e) => update("startDate", e.target.value)}
        className="px-2 py-1 rounded border text-black w-36"
      />
      <label className="text-xs font-medium text-gray-600">To</label>
      <input
        type="date"
        value={range.endDate}
        onChange={(e) => update("endDate", e.target.value)}
        className="px-2 py-1 rounded border text-black w-36"
      />
    </div>
  );
};

export default DateRangeFilter;
