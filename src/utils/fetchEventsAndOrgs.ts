// utils/fetchEventsAndOrgs.ts
import { createClient } from "@/supabase/component";
import type { EventRow, OrgRow } from "@/models/types";

export async function fetchEventsAndOrgs(): Promise<{ events: EventRow[]; orgs: OrgRow[] }> {
  const supabase = createClient();

  // Fetch events
  const { data: events, error: eventsError } = await supabase.from("events").select();
  if (eventsError) throw eventsError;

  // Fetch orgs
  const { data: orgs, error: orgsError } = await supabase.from("organizations").select();
  if (orgsError) throw orgsError;

  return { events, orgs };
}
