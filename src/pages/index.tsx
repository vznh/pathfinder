import { NextPage } from "next";
import type { GetServerSidePropsContext } from "next";
import { createClient } from "@/supabase/server-props";
import MapView from "@/views";
import type {EventRow, OrgRow } from "@/models/types"

const Homepage: NextPage<{
  events: EventRow[], orgs: OrgRow[];
}> = ({ events, orgs }) => {
  return (
    <div>
      {/* Main view will go here */}
      <MapView events={events} orgs={orgs} />
    </div>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createClient(context);

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error("User not found or error:", userError);
    return {
      props: {
        events: [],
        orgs: []
      }
    }
  }

  const { data: events , error: error_events} = await supabase.from("events").select();
  if (error_events) throw error_events;

  const { data: orgs, error: error_orgs } = await supabase
    .from('organizations')
    .select()
  if (error_orgs) throw error_orgs;
  console.log(orgs)
  return {
    props: {
      events: events,
      orgs: orgs
    },
  };
}

export default Homepage;
