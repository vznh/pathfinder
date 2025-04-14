// pages/_app.tsx
import { AppProps } from "next/app";
import Head from "next/head";
import React, { FC, useRef } from "react";
require("../styles/globals.css");

const App: FC<AppProps> = ({ Component, pageProps }) => {
  const mapRef = useRef<mapboxgl.Map>(null);

  return (
    <>
      <div data-theme="black" className="cruzmaps-app flex h-screen">
        <Head>
          <title>CruzMaps</title>
        </Head>
        <Component {...pageProps} />
      </div>
    </>
  );
};

export default App;
