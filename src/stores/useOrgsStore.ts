// stores/useOrgsStore
import { create } from "zustand";
import { OrgRow } from "@/models/types";
import { createClient } from "@/supabase/component";

export interface OrgsState {
  orgs: OrgRow[];
  loading: boolean;
  error: string | null;
}

export interface OrgsActions {
  setOrgs: (orgs: OrgRow[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  // add an action to fetch orgs if they weren't from SSR, e.g.:
  fetchOrgs: () => Promise<void>;
}

export type OrgsStore = OrgsState & OrgsActions;

export const useOrgsStore = create<OrgsStore>((set) => ({
  // initial state
  orgs: [],
  loading: true,
  error: null,

  // possible actions
  setOrgs: (orgs) => set((state) => ({
    ...state,
    orgs: orgs,
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

  fetchOrgs: async () => {
    set({ loading: true, error: null });
    const supabase = createClient();
    const { data, error } = await supabase.from("organizations").select("*");
    if (error) {
      set({ error: error.message, loading: false });
    } else {
      set({ orgs: data || [], loading: false, error: null });
    }
  },
}));
