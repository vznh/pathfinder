// src/components/MapboxClient.tsx
import mapboxgl from "mapbox-gl";
import { EventData, EventRsvp } from "@/components/specific/RSVP";
import { createRoot } from "react-dom/client";
import React from "react";

export interface mapboxClientResponse {
  data?: Array<any>;
  success?: boolean;
  error?: string;
}

export interface GeoCoordinates {
  longitude: number;
  latitude: number;
}

interface MapboxClient {
  initialize(options: mapboxgl.MapOptions): void;
  destroy(): void;
  getMap(): mapboxgl.Map;
}

interface NavigationService {}

interface EventService {
  addBaseMarker(coords: [number, number]): void;
  addEventMarker(coords: [number, number], eventData: EventData): void;
  removeAnyMarkers(): void;
}

interface GeolocationService {
  getUserLocation(callback: (coords: GeoCoordinates) => void): void;
  startTrackingUserLocation(callback: (coords: GeoCoordinates) => void): void;
  stopTrackingUserLocation(): void;
}

interface CameraService {
  zoomTo(coords: [number, number], zoomLevel: number, is3D: boolean): void;
  snapTo(coords: [number, number], zoomLevel: number): void;
}

/* */
class MapboxClientImpl implements MapboxClient {
  private static instance: MapboxClientImpl;
  private key: string;
  private map?: mapboxgl.Map | null;

  private navigationService: NavigationService;
  private eventService: EventService;
  private geolocationService: GeolocationService;
  private cameraService: CameraService;

  private constructor(key: string) {
    this.key = key;
    mapboxgl.accessToken = this.key;

    this.navigationService = new NavigationServiceImpl(this);
    this.eventService = new EventServiceImpl(this);
    this.geolocationService = new GeolocationServiceImpl(this);
    this.cameraService = new CameraServiceImpl(this);
  }

  public static getInstance(key?: string): MapboxClientImpl {
    if (!MapboxClientImpl.instance) {
      if (!key) throw new Error("DEV: API key wasn't provided");
      MapboxClientImpl.instance = new MapboxClientImpl(key);
    }

    return MapboxClientImpl.instance;
  }

  public getMap(): mapboxgl.Map {
    if (!this.map) throw new Error("DEV: Map isn't initialized yet");
    return this.map;
  }

  initialize(options: mapboxgl.MapOptions): void {
    this.map = new mapboxgl.Map({ ...options });
    this.map.on("load", () => {
      // Verify that map is loaded to store
      console.log("DEV: Map was successfully loaded.");
    });
  }

  destroy(): void {
    this.map?.remove();
    this.map = null;
  }

  get navigation(): NavigationService {
    return this.navigationService;
  }

  get events(): EventService {
    return this.eventService;
  }

  get geolocation(): GeolocationService {
    return this.geolocationService;
  }

  get camera(): CameraService {
    return this.cameraService;
  }
}

class NavigationServiceImpl implements NavigationService {
  private client: MapboxClient;

  constructor(client: MapboxClient) {
    this.client = client;
  }
}

class EventServiceImpl implements EventService {
  private client: MapboxClient;
  private marker: mapboxgl.Marker | null = null;
  private eventMarkers: Map<string, mapboxgl.Marker> = new Map();

  constructor(client: MapboxClient) {
    this.client = client;
  }

  addBaseMarker(coords: [number, number]): void {
    if (!this.client.getMap())
      throw new Error(
        "Map instance isn't initialized. Caught from func addBaseMarker",
      );

    // Clear any existing instance of markers
    this.removeAnyMarkers();

    // TODO: Make this marker into a 3D renderage of a sewing pin
    this.marker = new mapboxgl.Marker({
      color: "#FFFFFF",
      draggable: false,
      anchor: "bottom", // places icon above the coordinate like a pin
    })
      .setLngLat(coords)
      .addTo(this.client.getMap());
  }

  addEventMarker(coordinates: [number, number], eventData: EventData): void {
    if (!this.client.getMap())
      throw new Error(
        "Map instance isn't initialized. Caught from func addEventMarker"
      );
    
    const markerEl = createDynamicMarker(eventData.user_email);
    
    // Create hover popup
    const hoverPopup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: [0, -8],
      className: 'hover-popup'
    });

    // Create hover content
    const hoverContent = document.createElement('div');
    hoverContent.style.padding = '4px 8px';
    hoverContent.style.textAlign = 'center';

    const nameDiv = document.createElement('div');
    nameDiv.textContent = eventData.name;
    nameDiv.style.fontWeight = '500';
    nameDiv.style.fontSize = '12px';
    hoverContent.appendChild(nameDiv);

    const countDiv = document.createElement('div');
    countDiv.textContent = `${eventData.rsvp_count || 0} attending`;
    countDiv.style.fontSize = '11px';
    countDiv.style.opacity = '0.8';
    countDiv.style.marginTop = '2px';
    hoverContent.appendChild(countDiv);

    // Create RSVP popup
    const rsvpPopup = new mapboxgl.Popup({
      offset: [0, -12],
      closeButton: false,
      closeOnClick: false,
      maxWidth: '300px',
      className: 'custom-popup'
    });

    // Create a container for the RSVP component
    const popupContent = document.createElement('div');
    popupContent.className = 'rsvp-popup-content';
    
    const marker = new mapboxgl.Marker({
      element: markerEl,
      draggable: false,
      anchor: "bottom"
    })
      .setLngLat(coordinates)
      .addTo(this.client.getMap());

    // Add hover events
    markerEl.addEventListener('mouseenter', () => {
      hoverPopup
        .setLngLat(coordinates)
        .setDOMContent(hoverContent)
        .addTo(this.client.getMap());
    });

    markerEl.addEventListener('mouseleave', () => {
      hoverPopup.remove();
    });

    // Add click handler to marker element
    markerEl.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent map click
      hoverPopup.remove(); // Remove hover popup when clicking

      // Remove any existing popups
      const existingPopups = document.getElementsByClassName('mapboxgl-popup');
      Array.from(existingPopups).forEach(popup => popup.remove());

      // Set popup content and add to map
      rsvpPopup.setDOMContent(popupContent);
      marker.setPopup(rsvpPopup);
      rsvpPopup.addTo(this.client.getMap());

      // Create React root and render RSVP component
      const root = createRoot(popupContent);
      root.render(
        React.createElement(EventRsvp, {
          event: eventData,
          onClose: () => {
            rsvpPopup.remove();
            root.unmount();
          }
        })
      );
    });

    // Store marker reference
    this.eventMarkers.set(eventData.id, marker);
  }

  removeAnyMarkers(): void {
    if (this.marker) {
      this.marker.remove();
      this.marker = null;
    }
    // Remove all event markers
    this.eventMarkers.forEach(marker => marker.remove());
    this.eventMarkers.clear();
  }
}

class GeolocationServiceImpl implements GeolocationService {
  private client: MapboxClient;
  private watchID?: number;

  constructor(client: MapboxClient) {
    this.client = client;
  }

  getUserLocation(callback: (coords: GeoCoordinates) => void): void {
    if (!navigator.geolocation) {
      console.error("USER + DEV: Geolocation isn't supported by this browser");
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: GeoCoordinates = {
          longitude: position.coords.longitude,
          latitude: position.coords.latitude
        };
        callback(coords);
      },
      (error) => {
        console.error(
          "DEV: There was an error obtaining user geolocation. Message: ",
          error.message,
        );
      },
      { enableHighAccuracy: true }
    );
  }

  startTrackingUserLocation(callback: (coords: GeoCoordinates) => void) {
    // if tracking alr, stop
    this.stopTrackingUserLocation();

    if (!navigator.geolocation) {
      console.error("USER + DEV: Geolocation isn't supported by this browser");
    }

    this.watchID = navigator.geolocation.watchPosition(
      (position) => {
        const coords: GeoCoordinates = {
          longitude: position.coords.longitude,
          latitude: position.coords.latitude
        };
        callback(coords);
      },
      (error) => {
        console.error(
          "DEV: There was an error attempting to track user position. Message: ",
          error.message
        );
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000
      }
    );

    console.log("Location tracking started with ID: ", this.watchID);
  }

  stopTrackingUserLocation() {
    if (this.watchID !== undefined) {
      navigator.geolocation.clearWatch(this.watchID);
      console.log("DEV: Location stopped tracking for ID: ", this.watchID);
      this.watchID = undefined;
    }
  }
}

class CameraServiceImpl implements CameraService {
  private client: MapboxClient;

  constructor(client: MapboxClient) {
    this.client = client;
  }

  zoomTo(coordinates: [number, number], zoomLevel: number, is3D: boolean) {
    const map = this.client.getMap();
    if (!map) {
      throw new Error(
        "USER: Map wasn't initialized properly. Thrown from zoomTo function.",
      );
    }

    const options = {
      center: coordinates,
      zoom: zoomLevel,
      pitch: 0,
      bearing: 0,
      duration: 2000,
      essential: true,
      easing: (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2),
    };
    if (is3D) {
      options.pitch = 60;
      options.bearing = 30;
    }

    map.flyTo(options);
  }

  snapTo(coordinates: [number, number], zoomLevel: number) {
    const map = this.client.getMap();
    if (!map) {
      throw new Error(
        "USER: Map wasn't initialized properly. Thrown from snapTo function.",
      );
    }

    const options = {
      center: coordinates,
      zoom: zoomLevel,
      pitch: 0,
      bearing: 0,
      duration: 2000,
      essential: true,
      easing: (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2),
    };

    map.jumpTo(options);
  }
}

// Create a singleton instance of the Mapbox client
const mapboxClient = MapboxClientImpl.getInstance(
  process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "",
);

function createDynamicMarker(event_user_email: string | null, isSelected: boolean = false): HTMLElement {
  const el = document.createElement("div");
  el.className = "custom-marker";

  // Size adjustments
  el.style.width = isSelected ? "32px" : "24px";
  el.style.height = isSelected ? "32px" : "24px";

  // Dynamic icon or color logic
  el.style.backgroundImage = 'url("/pins.svg")';
  if (event_user_email) {
    el.style.backgroundColor = "#ff6b6b"; // orange
  } else {
    el.style.backgroundColor = "#4dabf7"; // blue
  }

  // Style formatting
  el.style.backgroundSize = "contain";
  el.style.backgroundRepeat = "no-repeat";
  el.style.backgroundPosition = "center";
  el.style.borderRadius = "50%";
  el.style.cursor = "pointer";

  return el;
}


export default mapboxClient;
