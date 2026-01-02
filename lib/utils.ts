/**
 * Utility function to merge class names
 * Filters out falsy values and joins class names with a space
 */
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ')
}
