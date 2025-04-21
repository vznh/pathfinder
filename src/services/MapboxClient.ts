import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
// src/components/MapboxClient.tsx
import mapboxgl from "mapbox-gl";

export interface mapboxClientResponse {
	data?: Array<any>;
	success?: boolean;
	error?: string;
}

export interface GeoCoordinates {
	longitude: number;
	latitude: number;
}

interface mapboxClient {
	initialize(options: mapboxgl.MapOptions): void;
	destroy(): void;
	get(): mapboxgl.Map;

	zoomTo(coordinates: [number, number], zoomLevel: number, is3D: boolean): void;

	getUserLocation(callback: (coords: GeoCoordinates) => void): void;
	addMarker(coordinates: [number, number]): void;
	removeMarker(): void;
}

class mapboxClientImpl implements mapboxClient {
	private readonly apiKey: string;
	private baseURL: string;
	private map?: mapboxgl.Map | null;
	private geocoder?: MapboxGeocoder;
	private watchID?: number;
	private currMarker: mapboxgl.Marker | null = null;
	// TODO:
	// rate limiter
	// query options

	constructor(apiKey: string, baseURL: string) {
		if (!apiKey) throw new Error("missing mapbox api key");
		this.apiKey = apiKey;
		this.baseURL = baseURL;
	}

	initialize(options: mapboxgl.MapOptions): void {
		mapboxgl.accessToken = this.apiKey;
		this.map = new mapboxgl.Map({
			...options,
		});

		this.map.on("load", async () => {
			try {
				// await this.createDefaultMarkers();
				console.log("default markers loadded");
			} catch (err) {
				console.log("failed to load default markers", err);
			}
		});

		this.geocoder = new MapboxGeocoder({
			accessToken: this.apiKey,
			mapboxgl: mapboxgl as any,
			autocomplete: true,
			bbox: [-122.07238, 36.98053, -122.04699, 37.00577],
			countries: "US",
		});
	}

	destroy() {
		if (this.map) {
			this.map.remove();
			this.map = null;
		}
	}

	get(): mapboxgl.Map {
		if (!this.map) throw new Error("map not found");
		return this.map;
	}

	/*
	 * Zooms to a specific location with optional 3D view and snap behavior.
	 */
	zoomTo(
		coordinates: [number, number],
		zoomLevel: number,
		is3D: boolean,
		snap = false,
	): void {
		if (!this.map)
			throw new Error(
				"Map instance isn't initialized. Caught from func zoomTo",
			);

		const options = {
			center: coordinates,
			zoom: zoomLevel,
			pitch: 0,
			bearing: 0,
			duration: 2000,
			essential: true,
			easing: (t: number) =>
				t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2,
		};
		if (is3D) {
			options.pitch = 60;
			options.bearing = 30;
		}

		if (snap) {
			this.map.jumpTo(options);
		} else {
			this.map.flyTo(options);
		}
		// console.log("attempting to zoom");
	}

	getUserLocation(callback: (coords: GeoCoordinates) => void): void {
		if (this.watchID !== undefined) {
			navigator.geolocation.clearWatch(this.watchID);
			this.watchID = undefined;
		}

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const coordinates: GeoCoordinates = {
						longitude: position.coords.longitude,
						latitude: position.coords.latitude,
					};
					callback(coordinates);
				},
				(error) => {
					// Handle not being able to get user permission
					console.error(
						"There was an error obtaining user geolocation: ",
						error.message,
					);
				},
				{ enableHighAccuracy: true },
			);
		} else {
			// Handle here also being able to not get user perms
			console.error("Geolocation isn't set-up for this platform yet.");
		}
	}

	addMarker(coordinates: [number, number]): void {
		if (!this.map)
			throw new Error(
				"Map instance isn't initialized. Caught from func addMarker",
			);

		this.removeMarker();

		this.currMarker = new mapboxgl.Marker({
			color: "#FFFFFF",
			draggable: false,
		})
			.setLngLat(coordinates)
			.addTo(this.map);
	}

	removeMarker(): void {
		if (this.currMarker) {
			this.currMarker.remove();
			this.currMarker = null;
		}
	}
}

// Create a singleton instance of the Mapbox client
const mapboxClient = new mapboxClientImpl(
	process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "",
	"https://api.mapbox.com/geocoding/v5/mapbox.places/",
);

export default mapboxClient;
