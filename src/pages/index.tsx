import { NextPage } from "next";
import type { GetServerSidePropsContext } from "next";
import MapView from "@/views";
import type {EventRow, OrgRow } from "@/models/types"
import { serverGetEventsAndOrgs } from "@/utils";

const Homepage: NextPage<{
  events: EventRow[], orgs: OrgRow[]
}> = ({ events, orgs }) => {
  return (
    <div>
      {/* Main view will go here */}
      <MapView events={events} orgs={orgs} event_id={null}/>
    </div>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const events_and_orgs = await serverGetEventsAndOrgs(context)
  return {props: { ...events_and_orgs, event_id: null }}
}

export default Homepage;
