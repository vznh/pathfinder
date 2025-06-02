// utils/index.tsx
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
