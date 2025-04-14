import Head from "next/head";
import { NextPage } from "next";
import MapView from "@/views";

const Homepage: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>⌘</title>
      </Head>
      { /* Main view will go here */}
      <MapView />
    </div>
  )
};

export default Homepage;
