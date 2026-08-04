import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge conditional class names and de-duplicate conflicting Tailwind
 * utilities (the last one wins). This is the standard shadcn/ui helper
 * that every component in components/ui imports as `cn`.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
