// views/type/desktop.tsx
import DesktopView from "./desktop";
import { Database } from "@/models/supabase_types";

interface MapViewProps {
  events: Database["public"]["Views"]["events"]["Row"][];
}

const MobileView: React.FC<MapViewProps> = ({ events }) => {
  return <DesktopView events={events} />
};

export default MobileView;
