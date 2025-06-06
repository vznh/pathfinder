// utils/index.tsx
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { createClient } from "@/supabase/server-props";
import type { GetServerSidePropsContext } from "next"; 

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function changeMapEnvOnTime() {
  const currentTime = new Date();
  const currentHour = currentTime.getHours();

  if (currentHour >= 6 && currentHour < 10) {
    return "dawn";
  } else if (currentHour >= 10 && currentHour < 18) {
    return "day";
  } else if (currentHour >= 18 && currentHour < 20) {
    return "dusk";
  } else {
    return "night";
  }
}

export async function serverGetEventsAndOrgs(context: GetServerSidePropsContext) {
  const supabase = createClient(context);

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error("User not found or error:", userError);
    return {
      props: {
        events: [],
        orgs: []
      }
    }
  }

  const { data: events , error: error_events} = await supabase.from("events").select();
  if (error_events) throw error_events;

  const { data: orgs, error: error_orgs } = await supabase
    .from('organizations')
    .select()
  if (error_orgs) throw error_orgs;
  console.log(orgs)
  return {
      events: events,
      orgs: orgs
  };
}