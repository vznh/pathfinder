// pages/_app.tsx
import type { AppProps } from "next/app";
import Head from "next/head";
import React, { type FC, useRef } from "react";
require("../styles/globals.css");

const App: FC<AppProps> = ({ Component, pageProps }) => {
  const mapRef = useRef<mapboxgl.Map>(null);

  return (
    <>
      <div data-theme="black" className="pathfinder-app flex h-screen">
        <Head>
          <title>Pathfinder</title>
          <meta name="description" content="Navigating campus should be easy." />
          <meta name="author" content="Jason Son" />
          <link rel="canonical" href="https://pathfinder-weld.vercel.app" />

          {/* Open Graph / Facebook */}
          <meta property="og:title" content="Pathfinder" />
          <meta
            property="og:description"
            content="Navigating campus should be easy."
          />
          <meta property="og:image" content="/cover.png" />
          <meta property="og:url" content="https://pathfinder-weld.vercel.app" />
          <meta property="og:type" content="website" />

          {/* Twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@vivivinh" />
          <meta name="twitter:creator" content="@vivivinh" />
          <meta name="twitter:image" content="/cover.png" />

          {/* Theme Color */}
          <meta name="theme-color" content="#000000" />

          {/* Favicon */}
          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" href="/apple-icon.png" />
        </Head>
        <Component {...pageProps} />
      </div>
    </>
  );
};

export default App;
