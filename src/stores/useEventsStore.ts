// stores/useEventsStore
import { create } from "zustand";
import { EventRow } from "@/models/types";
import { createClient } from "@/supabase/component";

export interface EventsState {
  events: EventRow[];
  loading: boolean;
  error: string | null;
}

export interface EventsActions {
  setEvents: (events: EventRow[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  // add an action to fetch events if they weren't from SSR, e.g.:
  fetchEvents: () => Promise<void>;
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

  fetchEvents: async () => {
    set({ loading: true, error: null });
    const supabase = createClient();
    const { data, error } = await supabase.from("events").select();
    if (error) {
      set({ error: error.message, loading: false });
    } else {
      set({ events: data || [], loading: false, error: null });
    }
  },
}));
