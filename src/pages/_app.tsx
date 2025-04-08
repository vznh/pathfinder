import { AppProps } from "next/app";
import Head from "next/head";
import React, { FC } from "react";
require("../styles/globals.css");

const App: FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <div data-theme="black" className="pathfinder flex h-screen">
      <Head>
      </Head>
      <Component {...pageProps} />
    </div>
  )
}
