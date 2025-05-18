// models/types.ts
/*
 *
 *
 */

/* */
import type { Database } from '@/models/supabase_types'

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

export type EventRow = Database['authenticated']['Views']['events']['Row']
export type OrgRow = Pick<Database['authenticated']['Tables']['organizations_v0']['Row'], 'id' | 'name'>