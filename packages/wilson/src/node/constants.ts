/**
 * Maps page type identifiers (e.g. `markdown`) to a list of
 * file extensions.
 */
export const pageTypes: Readonly<Record<string, string[]>> = {
  typescript: ['.tsx'],
  markdown: ['.md'],
}
