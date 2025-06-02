import { useState, useMemo } from "react";
import { MagnifyingGlassIcon, ChevronRightIcon} from "@radix-ui/react-icons";
import clsx from "clsx";

export interface Org {
  org_id: string;
  org_name: string;
  userIsPartOf: boolean;
  userIsSubscribed: boolean;
}
export interface OrgSearchPanelProps {
  isOpen: boolean;
  onClose(): void;
  orgs: Org[];
  onToggleSubscribe(org_id: string, newState: boolean): void;
}

export default function OrgSearchPanel({
  isOpen,
  onClose,
  orgs,
  onToggleSubscribe,
}: OrgSearchPanelProps) {
  const [q, setQ] = useState("");

  /* search filter */
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return orgs;
    const tokens = needle.split(/\s+/);

    return orgs.filter(o => {
      const hay = o.org_name.toLowerCase();
      return tokens.every(t => hay.includes(t));
    });
  }, [orgs, q]);
  /* ---------------- */

  return (
    /* slide-in container */
    <aside
      className={clsx(
        "fixed top-0 right-0 h-full w-[340px] max-w-full bg-white shadow-lg",
        "transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full",
        "pointer-events-auto z-[55] flex flex-col"
      )}
    >
      {/* close arrow */}
      {isOpen && (
        <button
          className="absolute -left-3 top-0
                    w-7 h-8 bg-white border border-gray-300 rounded-md
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
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search…"
            className="flex-grow outline-none"
          />
        </div>
      </div>

      <h2 className="px-4 text-2xl font-bold">Organizations</h2>

      {/* list */}
      <ul className="mt-4 flex-grow overflow-y-auto divide-y">
        {filtered.map((org) => (
          <li key={org.org_id} className="flex items-center justify-between px-6 py-4">
            <span className="text-lg">{org.org_name}</span>

            {/* Subscribe / Unsubscribe button */}
            <button
              onClick={() => onToggleSubscribe(org.org_id, !org.userIsSubscribed)}
              className={clsx(
                "px-3 py-1 rounded text-sm font-medium transition",
                org.userIsSubscribed
                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                  : "bg-blue-50 text-blue-600 hover:bg-blue-100"
              )}
            >
              {org.userIsSubscribed ? "Unsubscribe" : "Subscribe"}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
