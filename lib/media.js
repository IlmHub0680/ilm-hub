// Shared display metadata for the Media feature (admin + public).
// Keep this in sync with the MediaCategory enum in prisma/schema.prisma.
//
// These 7 categories replaced the feature's original set (KHUTBAH,
// MUTOON, POEMS, LECTURES, EDUCATIONAL_PROGRAMS, QURAN_RECITATION,
// NASHEED, OTHER) when Media was split out from the old combined
// "Media Library" feature. Existing MediaItem rows were recategorized
// by the migration that introduced this list (see
// prisma/migrations/*_split_media_and_library) — no content was lost,
// only relabeled: EDUCATIONAL_PROGRAMS -> VIDEO_LESSONS,
// QURAN_RECITATION/NASHEED -> AUDIO_RECORDINGS, OTHER -> SCHOLARLY_TALKS.
export const MEDIA_CATEGORIES = [
  { value: 'SCHOLARLY_TALKS', label: 'Scholarly Talks' },
  { value: 'VIDEO_LESSONS', label: 'Video Lessons' },
  { value: 'AUDIO_RECORDINGS', label: 'Audio Recordings' },
  { value: 'KHUTBAH', label: 'Khutbah (Sermon)' },
  { value: 'POEMS', label: 'Poems (Mandhumat)' },
  { value: 'MUTOON', label: 'Scientific Texts (Mutoon)' },
  { value: 'LECTURES', label: 'Lectures' },
];

const CATEGORY_MAP = Object.fromEntries(MEDIA_CATEGORIES.map((c) => [c.value, c.label]));

export function categoryLabel(value) {
  return CATEGORY_MAP[value] || value;
}

export function formatDuration(sec) {
  const n = Number(sec) || 0;
  const h = Math.floor(n / 3600);
  const m = Math.floor((n % 3600) / 60);
  const s = n % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}
