// pathfinder/src/stores/allEventsStore.ts
import { Database } from '@/models/supabase_types';
import { create } from "zustand";

type DBEvent = Database['public']['Tables']['events_v0']['Row'];

export interface EventsState {
  events: DBEvent[];
  loading: boolean;
  error: string | null;
}

export interface EventsActions {
  setEvents: (events: DBEvent[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  // add an action to fetch events if they weren't from SSR, e.g.:
  // fetchEvents: () => Promise<void>;
}

export type EventsStore = EventsState & EventsActions;

export const useEventsStore = create<EventsStore>((set) => ({
  // initial state
  events: [],
  loading: true,
  error: null,

  // possible actions
  setEvents: (events) => set((state) => ({
    ...state,
    events: events,
    loading: false,
    error: null
  })),

  setLoading: (status) => set((state) => ({
    ...state,
    loading: status,
  })),

  setError: (error) => set((state) => ({
    ...state,
    error: error,
    loading: false,
  })),
}));
