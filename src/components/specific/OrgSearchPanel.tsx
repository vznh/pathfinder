import { useState, useMemo } from "react";
import { MagnifyingGlassIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import clsx from "clsx";

export interface OrgSearchPanelProps {
  isOpen: boolean;
  onClose(): void;
}

/* mock orgs */
const MOCK_ORGS = Array.from({ length: 10 }, (_, i) => `Test Org ${i + 1}`)
  .sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
  );

const OrgSearchPanel: React.FC<OrgSearchPanelProps> = ({ isOpen, onClose }) => {
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () => MOCK_ORGS.filter(name =>
      name.toLowerCase().startsWith(q.toLowerCase())
    ),
    [q]
  );

  return (
    <aside
      className={clsx(
        "fixed top-0 right-0 h-full w-[340px] max-w-full bg-white shadow-xl",
        "transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full",
        "z-50 flex flex-col"
      )}
    >
      {/* ───────── close tab ───────── */}
      {isOpen && (
        <button
          /* 28 × 32 px -- small rounded-rectangle that hugs the panel’s edge  */
          className="absolute -left-3 top-0
                    w-6 h-7 bg-white border border-gray-300 rounded-md
                    flex items-center justify-center shadow
                    transition-transform duration-200"
          onClick={onClose}
          aria-label="Close organization panel"
        >
          <ChevronRightIcon className="w-4 h-4 text-gray-600" />
        </button>
      )}

      {/* search bar */}
      <div className="p-4">
        <div className="flex items-center gap-2 rounded-full border px-3 py-2">
          <MagnifyingGlassIcon className="h-4 w-4 text-gray-500" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search…"
            className="flex-grow outline-none"
          />
        </div>
      </div>

      <h2 className="px-4 text-2xl font-semibold font-sans">Organizations</h2>

      {/* list */}
      <ul className="mt-4 flex-grow overflow-y-auto divide-y">
        {filtered.map(name => (
          <li
            key={name}
            className="px-6 py-4 text-lg cursor-pointer hover:bg-gray-50"
          >
            {name}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default OrgSearchPanel;
