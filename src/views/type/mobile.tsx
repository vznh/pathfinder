// views/type/desktop.tsx
import DesktopView from "./desktop";
import { Database } from "@/models/supabase_types";

interface MapViewProps {
  events_v0: Database["public"]["Tables"]["events_v0"]["Row"][];
}

const MobileView: React.FC<MapViewProps> = ({ events_v0 }) => {
  return <DesktopView events={events_v0} />
};

export default MobileView;
