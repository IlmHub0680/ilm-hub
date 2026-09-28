// Greeting detection for the rule-based institute assistant.
//
// Goal: recognize a plain "hello", an Islamic greeting (Latin-transliterated
// or Arabic script), or an ordinary Arabic greeting, and answer it as a
// greeting — never as an information request. A greeting attached to a real
// question ("assalamu alaikum, what are the fees?") should NOT be swallowed
// by the greeting branch — only a message that is *just* a greeting (plus
// ordinary pleasantries like "how are you") short-circuits here; anything
// with real content falls through to normal intent/knowledge handling.

const ENGLISH_GREETING_WORDS = [
  'hello', 'hallo', 'helo',
  'hi', 'hiya', 'hey', 'heyy', 'heya',
  'yo', 'howdy',
  'greetings',
  'morning', 'afternoon', 'evening',
];

// Common Latin-script transliterations of "as-salamu alaykum" and short
// forms of it. Built from prefix x suffix combinations so we don't have to
// hand-enumerate every spelling variant.
const ISLAMIC_PREFIXES = ['assalamu', 'assalaamu', 'asalamu', 'asalaamu', 'salam', 'salaam', 'salamun', 'salaamun'];
const ISLAMIC_SUFFIXES = ['alaikum', 'alaykum', 'alaikom', 'alaykom'];
const ISLAMIC_COMBOS = ISLAMIC_PREFIXES.flatMap((p) => ISLAMIC_SUFFIXES.map((s) => `${p}${s}`));
// A person replying to a greeting rather than opening with one ("wa alaikum
// salaam") is rare from a visitor talking to the assistant, but harmless to
// also recognize as an Islamic greeting.
const ISLAMIC_REPLY_FORMS = ['waalaikumsalam', 'walaikumsalam', 'waalaikumussalam', 'walaikumassalam', 'waalaikumsalaam'];

function stripToLetters(text) {
  return text
    .toLowerCase()
    .replace(/[’'-]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function compact(text) {
  return text.replace(/\s+/g, '');
}

const ARABIC_ISLAMIC_MARKERS = ['سلام', 'عليكم']; // both present, any order/spacing → Islamic greeting
const ARABIC_ORDINARY_GREETINGS = ['مرحبا', 'مرحبآ', 'أهلا', 'اهلا', 'اهلين', 'أهلين', 'صباح الخير', 'مساء الخير'];

function detectArabic(rawText) {
  if (ARABIC_ISLAMIC_MARKERS.every((m) => rawText.includes(m))) {
    return 'arabic-islamic';
  }
  if (ARABIC_ORDINARY_GREETINGS.some((g) => rawText.includes(g))) {
    return 'arabic';
  }
  return null;
}

function detectLatin(rawText) {
  const normalized = stripToLetters(rawText);
  const compacted = compact(normalized);

  if (
    ISLAMIC_COMBOS.some((c) => compacted.includes(c)) ||
    ISLAMIC_REPLY_FORMS.some((c) => compacted.includes(c))
  ) {
    return 'islamic';
  }

  // Short standalone forms — require a real word boundary so we don't
  // match "salam" as a stray substring of an unrelated word.
  const words = normalized.split(' ');
  if (words.includes('salam') || words.includes('salaam')) {
    return 'islamic';
  }

  const englishHit = ENGLISH_GREETING_WORDS.some((w) => words.includes(w));
  if (englishHit) return 'english';

  return null;
}

// Returns null, or one of: 'english' | 'islamic' | 'arabic-islamic' | 'arabic'
export function detectGreeting(rawMessage) {
  if (!rawMessage) return null;
  const arabic = detectArabic(rawMessage);
  if (arabic) return arabic;
  return detectLatin(rawMessage);
}

const GREETING_STOPWORDS_LATIN = new Set([
  ...ENGLISH_GREETING_WORDS,
  ...ISLAMIC_COMBOS, // merged forms like "assalamualaikum" typed as one word
  ...ISLAMIC_REPLY_FORMS,
  'good', 'day',
  'salam', 'salaam', 'assalamu', 'assalaamu', 'asalamu', 'asalaamu',
  'alaikum', 'alaykum', 'alaikom', 'alaykom',
  'warahmatullah', 'warahmatullahi', 'wabarakatuh', 'wabarakatu', 'wabarakaatuh', 'wabarakatuhu',
  'as', 'wa', 'walaikum', 'waalaikum', 'waalaikumsalam', 'walaikumsalam',
  'there', 'everyone', 'all', 'team', 'friend', 'friends', 'brother', 'brothers', 'sister', 'sisters',
  'how', 'are', 'you', 'u', 'r', 'doing', 'going', 'today', 'im', "i'm", 'i', 'and',
]);

const ARABIC_GREETING_STOPWORDS = new Set([
  'السلام', 'سلام', 'عليكم', 'وعليكم', 'ورحمة', 'الله', 'وبركاته', 'وبركاتة',
  'مرحبا', 'مرحبآ', 'أهلا', 'اهلا', 'اهلين', 'أهلين',
  'صباح', 'مساء', 'الخير',
  'كيف', 'حالك', 'حالكم', 'اخبارك',
]);

// True when, after discounting the greeting itself and ordinary pleasantries
// ("...how are you"), there is no further substantive content — i.e. this
// message is *just* a greeting and should get a greeting reply, not be
// treated as (or funnelled into) an information request.
export function isPureGreeting(rawMessage) {
  if (!rawMessage) return false;

  const hasArabicLetters = /\p{Script=Arabic}/u.test(rawMessage);

  if (hasArabicLetters) {
    const words = rawMessage
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter(Boolean);
    if (words.length === 0) return false;
    const leftover = words.filter((w) => !ARABIC_GREETING_STOPWORDS.has(w));
    return leftover.length === 0;
  }

  const words = rawMessage
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return false;

  const leftover = words.filter((w) => !GREETING_STOPWORDS_LATIN.has(w) && w.length > 2);
  return leftover.length === 0;
}

// A short, natural reply for a pure greeting — Islamic response to an
// Islamic greeting, a friendly reply to an ordinary one, and Arabic for an
// Arabic greeting, per the greeting type detected above.
export function greetingReply(type, firstName) {
  const name = firstName ? `, ${firstName}` : '';

  switch (type) {
    case 'islamic':
      return `Wa alaikumu s-salaam wa rahmatullahi wa barakatuh${name}! How can I help you today?`;
    case 'arabic-islamic':
      return `وعليكم السلام ورحمة الله وبركاته${firstName ? ` ${firstName}` : ''}! كيف يمكنني مساعدتك اليوم؟`;
    case 'arabic':
      return `أهلاً وسهلاً${firstName ? ` ${firstName}` : ''}! كيف يمكنني مساعدتك اليوم؟`;
    case 'english':
    default:
      return `Hello${name}! How can I help you today?`;
  }
}
