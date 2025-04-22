import Head from "next/head";
import { NextPage } from "next";
import type { User } from '@supabase/supabase-js'
import type { GetServerSidePropsContext } from 'next'
import { createClient } from '@/supabase/server-props'
import MapView from "@/views";

const Homepage: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>⌘</title>
      </Head>
      { /* Main view will go here */}
      <MapView data={props["events_v0"]} />
    </div>
  )
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createClient(context)
  const { data: events_v0 } = await supabase.from("events_v0").select();
  console.log(events_v0);
  return {
    props: {
      events_v0: events_v0,
    },
  }
}

export default Homepage;
