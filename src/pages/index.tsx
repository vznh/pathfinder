import Head from "next/head";
import { NextPage } from "next";
import type { GetServerSidePropsContext } from "next";
import { createClient } from "@/supabase/server-props";
import { type Database } from "@/models/supabase_types";
import MapView from "@/views";

const Homepage: NextPage<{
  events_v0: Database["public"]["Tables"]["events_v0"]["Row"][];
}> = ({ events_v0 }) => {
  return (
    <div>
      <Head>
        <title>⌘</title>
      </Head>
      {/* Main view will go here */}
      <MapView events={events_v0} />
    </div>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createClient(context);
  const { data: events_v0 } = await supabase.from("events_v0").select();
  return {
    props: {
      events_v0: events_v0,
    },
  };
}

export default Homepage;
