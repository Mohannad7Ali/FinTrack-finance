import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes conditionally.
 * Combines clsx for conditional class handling
 * and tailwind-merge to resolve conflicting Tailwind classes.
 *
 * @param inputs - List of class values (strings, arrays, objects)
 * @returns A merged and optimized className string
 *
 * @example
 * cn("p-2", isActive && "bg-blue-500", "p-4")
 * // Output: "bg-blue-500 p-4"
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
