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
					<title>⌘</title>
				</Head>
				<Component {...pageProps} />
			</div>
		</>
	);
};

export default App;
