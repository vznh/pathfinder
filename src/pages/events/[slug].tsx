import { NextPage } from "next";
import MapView from "@/views";
import type { GetServerSidePropsContext } from "next";
import type {EventRow, OrgRow } from "@/models/types"
import { serverGetEventsAndOrgs } from "@/utils";

const EventPage: NextPage<{
  events: EventRow[], orgs: OrgRow[]; event_id: string
}> = ({ events, orgs, event_id }) => {
  return (
    <div>
      {/* Main view will go here */}
      <MapView events={events} orgs={orgs} event_id={event_id} />
    </div>
  );
};


export async function getServerSideProps(context: GetServerSidePropsContext) {
  const event_id = context?.params?.slug;
  const events_and_orgs = await serverGetEventsAndOrgs(context)
  return {props: { ...events_and_orgs, event_id: event_id }}
}

export default EventPage;