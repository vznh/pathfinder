// views/type/desktop.tsx
import DesktopView from "./desktop";
import { Database } from "@/models/supabase_types";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  FaSearch,
  FaBell,
  FaPlus,
  FaFilter,
  FaUndo,
} from "react-icons/fa";

interface MapViewProps {
  events_v0: Database["public"]["Tables"]["events_v0"]["Row"][];
}

function MobileBottomNav() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="fixed bottom-0 w-full z-50 pointer-events-none">
      <motion.div
        className={`bg-white w-full px-4 pt-3 pb-4 rounded-t-2xl shadow-2xl pointer-events-auto ${
          isExpanded ? "h-[200px]" : "h-[100px]"
        } transition-all duration-300`}
        initial={false}
        animate={{ height: isExpanded ? 200 : 100 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        onDragEnd={(e, info) => {
          if (info.offset.y > 30) {
            setIsExpanded(false); // collapse
          } else if (info.offset.y < -30) {
            setIsExpanded(true); // expand
          }
        }}
      >
        {/* drag handle */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3" />

        {/* icon row (always visible) */}
        <div className="flex justify-around mb-2 text-lg text-gray-600">
          <FaPlus />
          <FaFilter />
          <FaUndo />
          <FaBell />
        </div>

        {/* expandable content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {/* search input */}
              <div className="flex items-center bg-gray-100 px-4 py-2 rounded-full">
                <FaSearch className="text-gray-500 mr-2" />
                <input
                  className="bg-transparent outline-none w-full"
                  placeholder="Navigate"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

const MobileView: React.FC<MapViewProps> = ({ events_v0 }) => {
  return (
    <>
      <DesktopView events={events_v0} />
      <MobileBottomNav />
    </>
  );
};

export default MobileView;
