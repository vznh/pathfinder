import Head from "next/head";
import { NextPage } from "next";
import type { GetServerSidePropsContext } from "next";
import { createClient } from "@/supabase/server-props";
import { type Database } from "@/models/supabase_types";
import MapView from "@/views";

const Homepage: NextPage<{
  events: Database["public"]["Views"]["events"]["Row"][];
}> = ({ events }) => {
  return (
    <div>
      <Head>
        <title>⌘</title>
      </Head>
      {/* Main view will go here */}
      <MapView events={events} />
    </div>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createClient(context);
  const { data: events, error } = await supabase.from("events").select()
  if (error) throw error
  console.log(events)
  return {
    props: {
      events: events,
    },
  };
}

export default Homepage;
