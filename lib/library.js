// Shared display metadata for the Library feature (admin + public).
// Keep this in sync with the LibraryCategory enum in prisma/schema.prisma.
//
// The Library is written/reference content — separate from the Media
// feature (video/audio, see lib/media.js). Library items are never
// gated by a Media subscription; access follows only isPublished.
export const LIBRARY_CATEGORIES = [
  { value: 'ARTICLES', label: 'Articles' },
  { value: 'FATWAS', label: 'Fatwas / Reference Materials' },
  { value: 'RESEARCH_PAPERS', label: 'Research Papers' },
  { value: 'HISTORICAL_MATERIALS', label: 'Historical Materials' },
  { value: 'MANUSCRIPTS', label: 'Manuscripts' },
  { value: 'EDUCATIONAL_RESOURCES', label: 'Educational Resources' },
  { value: 'CLASSICAL_TEXTS', label: 'Classical Texts' },
];

const CATEGORY_MAP = Object.fromEntries(LIBRARY_CATEGORIES.map((c) => [c.value, c.label]));

export function categoryLabel(value) {
  return CATEGORY_MAP[value] || value;
}
