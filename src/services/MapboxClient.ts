// src/components/MapboxClient.tsx
import mapboxgl, { Marker } from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";

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
}

class mapboxClientImpl implements mapboxClient {
  private readonly apiKey: string;
  private baseURL: string;
  private map?: mapboxgl.Map | null;
  private geocoder?: MapboxGeocoder;
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
    else return this.map;
  }

}

// Create a singleton instance of the Mapbox client
const mapboxClient = new mapboxClientImpl(
  process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "",
  `https://api.mapbox.com/geocoding/v5/mapbox.places/`
);

export default mapboxClient;
