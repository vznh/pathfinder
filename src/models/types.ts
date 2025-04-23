// models/types.ts
/*
 *
 *
 */

/* */
export type ButtonLayoutPosition =
	| "top-left"
	| "top-right"
	| "bottom-left"
	| "bottom-right";

export interface GeolocationResult {
	success: boolean;
	coordinates?: {
		longitude: number;
		latitude: number;
	};
	error?: string;
}

interface Point {
	type: "Point";
	coordinates: [number, number]; // [long, lat]
}

/* */
interface FeatureProperties {
	location: string;
	boro_name: string;
	street: string;
	neighborhood: string;
}

interface Feature {
	type: "Feature";
	properties: FeatureProperties;
	geometry: Point;
}

interface GeoJSON {
	type: "FeatureCollection";
	features: Feature[];
}

export interface EventDataObject {
  id: string;
  created_at: string;
  event: string;
  latitude: number;
  longitude: number;
  user_id: string | null;
}

export type EventDataArray = EventDataObject[];
