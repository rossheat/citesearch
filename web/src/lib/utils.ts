import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const LoadingMessages = [
  "Scanning the archives...",
  "Consulting the scholars...",
  "Decoding ancient manuscripts...",
  "Interviewing time-traveling historians...",
  "Calibrating the citation compass...",
  "Summoning the spirits of academia...",
  "Traversing the knowledge multiverse...",
  "Unleashing the citation kraken...",
  "Brewing a potent citation potion...",
  "Hacking the matrix of knowledge...",
  "Translating alien research papers...",
  "Channeling the ghosts of scientists past...",
  "Decrypting the Rosetta Stone of citations...",
  "Exploring the Library of Alexandria's backup...",
  "Consulting the Oracle of Academic Wisdom...",
  "Diving into the depths of the citation ocean...",
  "Riding the waves of intellectual discovery...",
  "Assembling the Avengers of Academia...",
  "Charging up the flux capacitor of knowledge...",
  "Unleashing the citation butterfly effect..."
];
