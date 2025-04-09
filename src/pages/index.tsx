import Head from "next/head";
import { NextPage } from "next";
import HomeLayout from "@/layouts/HomeLayout";

const Homepage: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>⌘</title>
      </Head>
      { /* Main view will go here */}
      <HomeLayout
        leftChild={<></>}
        rightChild={<></>}
      />

    </div>
  )
};

export default Homepage;
