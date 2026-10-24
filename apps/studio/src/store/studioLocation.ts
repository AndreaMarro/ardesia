/** Build configuration is allowlisted by Vite; query parameters never choose an origin or base. */
export function studioHref(suffix = ""): string {
  return `${import.meta.env.BASE_URL}${suffix.replace(/^\//, "")}`
}
