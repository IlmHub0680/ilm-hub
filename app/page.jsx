'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { useSiteBranding } from '@/components/SiteBrandingProvider';
import IslamicDateWidget from '@/components/IslamicDateWidget';
import { LanguageProvider, useLanguage } from './HomeLanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
import { ArrowUpRightIcon, ExternalLinkIcon } from '@/components/Icons';

// Lightens (positive percent) or darkens (negative percent) a "#rrggbb"
// hex color, returning an "rgb(r, g, b)" string -- used to derive the
// hero's deep/mid/light gradient stops and the image's frame color
// from a single admin-picked accent color, the same way the site's own
// fixed --brand-deepest/--brand/--brand-light triad works. Returns
// null for anything that isn't a clean 6-digit hex, so callers can
// fall back to the site's default colors.
function shadeHexColor(hex, percent) {
  if (!hex || typeof hex !== 'string') return null;
  const match = /^#([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!match) return null;

  const num = parseInt(match[1], 16);
  const amt = Math.round(2.55 * percent);

  const clamp = (value) => Math.max(0, Math.min(255, value));
  const r = clamp(((num >> 16) & 0xff) + amt);
  const g = clamp(((num >> 8) & 0xff) + amt);
  const b = clamp((num & 0xff) + amt);

  return `rgb(${r}, ${g}, ${b})`;
}

function HomeContent() {
  const { t, dir, lang, setLang } = useLanguage();
  const { heroImageUrl: brandedHeroImageUrl } = useSiteBranding();

  /* =========================================================
     DATE / TIME
  ========================================================= */

  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [islamicDate, setIslamicDate] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      setCurrentTime(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );

      setCurrentDate(
        now.toLocaleDateString([], {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );

      try {
        const hijriFormatter = new Intl.DateTimeFormat(
          'en-u-ca-islamic-umalqura',
          {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }
        );

        setIslamicDate(hijriFormatter.format(now));
      } catch (error) {
        try {
          const fallbackFormatter = new Intl.DateTimeFormat(
            'en-u-ca-islamic',
            {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }
          );

          setIslamicDate(fallbackFormatter.format(now));
        } catch (fallbackError) {
          setIslamicDate('Hijri date unavailable');
        }
      }
    };

    updateDateTime();

    const interval = setInterval(updateDateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  /* =========================================================
     HOMEPAGE CMS CONTENT
     (Hero section, social links, footer navigation columns —
     managed at /admin/homepage. Seeded with the same content
     that used to be hardcoded here, so the page renders
     identically until/unless an admin changes it, then
     overwritten with live content from the API.)
  ========================================================= */

  const [hero, setHero] = useState({
    badge: 'A DIGITAL HOME FOR ISLAMIC KNOWLEDGE',
    title: "Excellence in Islamic Studies & Qur'anic Sciences",
    subtitle:
      'A structured environment for students seeking authentic, beneficial and disciplined Islamic knowledge through qualified instruction, classical texts, modern learning resources and academic programmes.',
    primaryLabel: 'Apply Now →',
    primaryHref: '/admission',
    // Points at the narrative Academy Pathways framework page, not
    // /programs -- the ACADEMICS section further down this same
    // homepage already links to /programs ("Explore Academic
    // Departments"), and the two used to point at the same place
    // with near-identical labels. This is the hero's first-impression
    // CTA, so it orients a new visitor to how the Academy is
    // structured; /programs is for someone ready to browse the real
    // programme directory.
    secondaryLabel: 'How the Academy Works →',
    secondaryHref: '/academy-pathways',
    features: [
      'Structured curriculum',
      'Online learning',
      'Academic resources',
      'Global access',
    ],
    // Seeded from the root layout's server-side fetch (SiteBrandingProvider)
    // so the hero background image is already there on first paint; the
    // fetch below still overwrites this with the freshest CMS content.
    heroImageUrl: brandedHeroImageUrl,
  });

  // Welcome section, its four feature cards, the Academy section and
  // its eight subject icons, the Our Approach section and its three
  // steps, and the closing Bismillah banner -- all admin-editable at
  // /admin/homepage/sections. Seeded with the site's original
  // hardcoded copy so nothing changes on screen until an admin edits
  // something there.
  const [welcome, setWelcome] = useState({
    badge: 'WELCOME TO ULUL AZM',
    title: 'A place to seek knowledge with sincerity',
    subtitle:
      'Ulul Azm Institute brings together structured academic learning, classical Islamic scholarship, digital resources, and a community committed to beneficial knowledge, upright character, and lifelong learning.',
  });

  const [featureCards, setFeatureCards] = useState([
    {
      icon: '📚',
      title: 'Structured Learning',
      text: 'Progress through carefully organized academic programmes and courses designed to build knowledge systematically.',
    },
    {
      icon: '🕌',
      title: 'Islamic Scholarship',
      text: "Engage with the Qur'an, Sunnah, classical texts, and established Islamic disciplines through sound scholarly tradition.",
    },
    {
      icon: '🎓',
      title: 'Student Development',
      text: 'Develop sound knowledge, disciplined study habits, research ability, humility, and beneficial character.',
    },
    {
      icon: '🌐',
      title: 'Learning Without Borders',
      text: 'Access educational opportunities and digital resources designed to support students wherever they are.',
    },
  ]);

  const [academySection, setAcademySection] = useState({
    badge: 'ACADEMY',
    title: 'Explore Our Academic Programmes',
    subtitle:
      "Explore our academic departments, programmes, courses, and areas of Islamic study, rooted in the Qur'an and Sunnah and presented through structured and disciplined learning.",
  });

  // Model 28 follow-up: the homepage's Academy section now shows real
  // Department entities (fetched from the same /api/academic/departments
  // the standalone /departments page already uses) instead of a
  // curated icon/text marketing list. The admin-managed
  // HomepageAcademyItem CRUD tool (/admin/homepage) is left completely
  // untouched -- it's simply no longer read by this section, in case
  // it's still wanted elsewhere or the change is ever reverted.
  const [departments, setDepartments] = useState([]);
  const [departmentsLoaded, setDepartmentsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/academic/departments')
      .then((res) => res.json())
      .then((result) => {
        if (cancelled) return;
        if (result && result.success && Array.isArray(result.data)) {
          setDepartments(result.data);
        }
      })
      .catch(() => {
        /* silently ignore -- the homepage should never break because
           the departments feed is unavailable; the section below
           simply falls back to its own static copy when empty */
      })
      .finally(() => {
        if (!cancelled) setDepartmentsLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const [approachSection, setApproachSection] = useState({
    badge: 'OUR APPROACH',
    title: 'More than a website — a learning environment',
    subtitle: 'We aim to make the pursuit of Islamic knowledge organized, accessible, responsible and beneficial.',
  });

  const [approachSteps, setApproachSteps] = useState([
    {
      number: '01',
      title: 'Authentic Foundations',
      text: 'Begin with foundational disciplines before progressing into advanced studies.',
    },
    {
      number: '02',
      title: 'Structured Programmes',
      text: 'Study through clearly defined academic areas rather than disconnected lessons.',
    },
    {
      number: '03',
      title: 'Responsible Scholarship',
      text: 'Approach Islamic knowledge with sincerity, humility, discipline and respect for scholarship.',
    },
  ]);

  const [beneficialKnowledgeImage, setBeneficialKnowledgeImage] = useState('');
  // Admin-editable heading/message for the "Beneficial Knowledge" box
  // (SectionBanner.titleEn/bodyEn on the same 'homepage-beneficial-
  // knowledge' row as the image above) -- empty string means "use the
  // site's default wording" below, exactly like the image already does.
  const [beneficialKnowledgeTitle, setBeneficialKnowledgeTitle] = useState('');
  const [beneficialKnowledgeBody, setBeneficialKnowledgeBody] = useState('');

  // Admin-editable picture + heading + description for the MEDIA &
  // LIBRARY section's two cards (SectionBanner rows 'homepage-media-
  // card' / 'homepage-library-card' -- same reused model/pattern as
  // beneficial-knowledge above). Empty imageUrl means "keep the
  // default emoji icon"; empty title/body means "keep the default
  // wording" -- exactly like beneficial-knowledge's own fallback.
  const [mediaCardImage, setMediaCardImage] = useState('');
  const [mediaCardTitle, setMediaCardTitle] = useState('');
  const [mediaCardBody, setMediaCardBody] = useState('');
  const [libraryCardImage, setLibraryCardImage] = useState('');
  const [libraryCardTitle, setLibraryCardTitle] = useState('');
  const [libraryCardBody, setLibraryCardBody] = useState('');

  // Up to 5 admin-managed hero banner images (Model 25) -- filled in by
  // the /api/homepage-content fetch below, alongside hero/welcome/etc.
  // Empty array is the normal, fully supported state: the hero section
  // then falls back to hero.heroImageUrl exactly as it always has.
  const [heroBanners, setHeroBanners] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  // Pauses the 10s auto-advance while the cursor is over the banner,
  // so it never changes slide out from under someone mid-look -- a
  // small, standard carousel courtesy.
  const [heroPaused, setHeroPaused] = useState(false);
  const heroSlideCount = heroBanners.length;
  const activeSlideIndex = heroSlideCount > 0 ? ((activeSlide % heroSlideCount) + heroSlideCount) % heroSlideCount : 0;

  // The headline that types out in the hero -- when at least one
  // banner is active, each slide gets its own caption describing that
  // photo (the user's ask: "the image slides and a designated text
  // that describe the image... slides with the image since it
  // describes it"), retyping whenever the slide changes because
  // TypedHeadline's own effect re-runs on every change to its `text`
  // prop. A banner with no caption saved yet (or when there are no
  // banners at all) falls back to the Hero Section's own static
  // title, exactly as before -- the headline is never left blank.
  const activeBanner = heroSlideCount > 0 ? heroBanners[activeSlideIndex] : null;
  const activeBannerCaption = activeBanner
    ? (lang === 'ar' && activeBanner.captionAr ? activeBanner.captionAr : activeBanner.captionEn)
    : '';
  // Only a real per-slide caption types out character by character --
  // the fallback below (no caption saved yet) is shown immediately,
  // full-length, no animation. Typing a long fallback sentence as a
  // giant bold headline is exactly what looked wrong ("the text is
  // bolded and very big and goes faster with the banner... not all
  // the sentence should write, just the caption should").
  const heroHeadlineText = activeBannerCaption || (lang === 'ar' && hero.titleAr ? hero.titleAr : hero.title);
  const heroHeadlineAnimates = Boolean(activeBannerCaption);

  // The readable paragraph under the headline -- never animated,
  // always just present. While a banner is active, this is THAT
  // banner's own body message (set separately from its caption at
  // /admin/homepage/banner-slider), so each slide can describe itself
  // properly instead of every slide sharing one generic paragraph.
  // The Hero Section's own static subtitle is the fallback ONLY when
  // there are no banners configured at all -- once real banners exist,
  // a banner with no body saved yet shows no paragraph rather than
  // reviving that generic sentence under every slide regardless of
  // what it's actually showing ("we don't need it there").
  const heroBodyText = activeBanner
    ? (lang === 'ar' && activeBanner.bodyAr ? activeBanner.bodyAr : activeBanner.bodyEn) || ''
    : (lang === 'ar' && hero.subtitleAr ? hero.subtitleAr : hero.subtitle);

  // This banner's own accent color (admin-set at /admin/homepage/
  // banner-slider) tints the hero background and the image's frame
  // while it's showing, instead of the section always being the same
  // fixed green -- "the text side takes the banner's color as it
  // changes". No accent color saved for this banner (or no banners at
  // all) keeps the site's original green exactly as before.
  const activeAccentColor = activeBanner?.accentColor || '';
  const heroAccentDeep = shadeHexColor(activeAccentColor, -45);
  const heroAccentMid = activeAccentColor || null;
  const heroAccentLight = shadeHexColor(activeAccentColor, 30);
  const heroAccentFrame = shadeHexColor(activeAccentColor, 15);

  function goToSlide(index) {
    setActiveSlide(index);
  }

  function goPrevSlide() {
    setActiveSlide((prev) => (heroSlideCount > 0 ? (prev - 1 + heroSlideCount) % heroSlideCount : 0));
  }

  function goNextSlide() {
    setActiveSlide((prev) => (heroSlideCount > 0 ? (prev + 1) % heroSlideCount : 0));
  }

  // Auto-advance every 10 seconds. Re-running this effect on every
  // activeSlide change (rather than only on mount) means a manual
  // prev/next/dot click resets the 10s countdown instead of the next
  // auto-advance landing right after it.
  useEffect(() => {
    if (heroSlideCount <= 1 || heroPaused) return;

    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlideCount);
    }, 10000);

    return () => clearInterval(timer);
  }, [heroSlideCount, activeSlide, heroPaused]);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/section-banners/homepage-beneficial-knowledge')
      .then((res) => (res.ok ? res.json() : null))
      .then((result) => {
        if (cancelled || !result?.success) return;
        setBeneficialKnowledgeImage(result.data.imageUrl || '');
        setBeneficialKnowledgeTitle(result.data.titleEn || '');
        setBeneficialKnowledgeBody(result.data.bodyEn || '');
      })
      .catch(() => {
        // Keep the plain gradient background and default wording --
        // the homepage must never break because this optional content
        // couldn't be fetched.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // MEDIA & LIBRARY cards' admin-uploaded pictures + text -- same
  // "must never break the page" fallback behavior as the fetch above:
  // any failure just leaves the default emoji icons and hardcoded
  // wording in place.
  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetch('/api/section-banners/homepage-media-card').then((res) => (res.ok ? res.json() : null)),
      fetch('/api/section-banners/homepage-library-card').then((res) => (res.ok ? res.json() : null)),
    ])
      .then(([mediaResult, libraryResult]) => {
        if (cancelled) return;
        if (mediaResult?.success) {
          setMediaCardImage(mediaResult.data.imageUrl || '');
          setMediaCardTitle(mediaResult.data.titleEn || '');
          setMediaCardBody(mediaResult.data.bodyEn || '');
        }
        if (libraryResult?.success) {
          setLibraryCardImage(libraryResult.data.imageUrl || '');
          setLibraryCardTitle(libraryResult.data.titleEn || '');
          setLibraryCardBody(libraryResult.data.bodyEn || '');
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/homepage-content')
      .then((res) => (res.ok ? res.json() : null))
      .then((result) => {
        if (cancelled || !result?.success) return;

        if (result.data.hero) setHero(result.data.hero);
        if (Array.isArray(result.data.heroBanners)) setHeroBanners(result.data.heroBanners);
        if (result.data.welcome) setWelcome(result.data.welcome);
        if (Array.isArray(result.data.featureCards) && result.data.featureCards.length > 0) {
          setFeatureCards(result.data.featureCards);
        }
        if (result.data.academySection) setAcademySection(result.data.academySection);
        // academyItems is no longer consumed here -- see the
        // departments state/fetch above.
        if (result.data.approachSection) setApproachSection(result.data.approachSection);
        if (Array.isArray(result.data.approachSteps) && result.data.approachSteps.length > 0) {
          setApproachSteps(result.data.approachSteps);
        }
      })
      .catch(() => {
        // Keep the seeded defaults above — the homepage must never
        // break because the CMS content couldn't be fetched.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================================
     MOBILE MENU
  ========================================================= */

  /* =========================================================
     FOOTER MODALS
  ========================================================= */

  /* =========================================================
     FOOTER CONTENT
  ========================================================= */

  return (
    <div style={pageStyle}>

      {/* =====================================================
          TOP INFORMATION BAR
      ===================================================== */}

      <div style={topBar} className="uai-topbar">
        <div style={topBarInner} className="uai-topbar-inner">

          <div className="uai-topbar-datetime">
            <strong>{currentDate}</strong>

            <span style={topBarDivider}>
              |
            </span>

            <strong>{currentTime}</strong>
          </div>

          <div className="uai-topbar-hijri">
            <span style={{ color: '#e7d48b' }}>
              <strong>{t('Hijri:')}</strong>
            </span>{' '}

            <strong>{islamicDate}</strong>

            <span
              style={{
                marginLeft: '6px',
                opacity: 0.65,
                fontSize: '11.5px',
              }}
            >
              {t('(Umm al-Qura)')}
            </span>
          </div>

          <div style={langToggleRow}>
            <LanguageSelector lang={lang} onChange={setLang} dir={dir} />
          </div>

        </div>
      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <SiteHeader />

      {/* =====================================================
          HERO
          Redesigned from a single full-bleed photo with all copy,
          two CTA buttons and a checkmark list crowded on top of it,
          to a two-column layout: headline/copy on one side, the
          admin-managed banner photo (still the same DB-driven
          slider/crossfade logic as before, just no longer used as a
          page background) on the other. The two CTA buttons were
          removed outright -- both already exist one tap away in the
          Admission & Registration nav dropdown, so keeping them here
          too was pure duplication. The feature checkmarks moved to
          their own compact strip just below (see heroFeaturesSection)
          instead of crowding the photo.
      ===================================================== */}

      <section
        style={
          heroAccentMid
            ? {
                ...heroStyle,
                background: `radial-gradient(circle at 80% 20%,rgba(197,157,95,.22),transparent 28%),linear-gradient(135deg,${heroAccentDeep},${heroAccentMid} 55%,${heroAccentLight})`,
              }
            : heroStyle
        }
        dir={dir}
      >
        <div style={heroInner} className="uai-hero-inner">

          <div
            style={{
              ...heroTextCol,
              // Same picture-frame treatment, and the exact same ring
              // as the image side (moderated down from an earlier
              // 34/38px -- too heavy -- to 24/27px) so neither half
              // reads as more heavily bordered than the other. Uses
              // this slide's accent color, so both frames change
              // together as the slider advances.
              boxShadow: `inset 0 0 0 24px ${heroAccentFrame || 'var(--gold)'}, inset 0 0 0 27px rgba(5,46,22,.55)`,
              transition: 'box-shadow 1s ease',
            }}
            className="uai-hero-text-col"
          >

            <TypedHeadline
              text={heroHeadlineText}
              style={heroTitle}
              animate={heroHeadlineAnimates}
            />

            {heroBodyText && (
              <p style={heroText}>
                {heroBodyText}
              </p>
            )}

          </div>

          <div
            style={{
              ...heroImageCol,
              // Reaches 27px past its own grid column into the text
              // column's -- see the comment above this JSX block --
              // so its own left-edge frame covers heroTextCol's
              // right-edge frame instead of the two stacking into a
              // doubled band at the seam. Desktop (side-by-side) only;
              // cancelled back to normal in the stacked mobile layout
              // by the .uai-hero-image-col media rule below.
              marginLeft: '-27px',
              width: 'calc(100% + 27px)',
              // Same gradient formula as the section background behind
              // the text side (was a flat single color here), so the
              // margin around the photo actually fills with the same
              // color treatment on both halves instead of the image
              // side reading flat next to the text side's full gradient.
              background: heroAccentMid
                ? `radial-gradient(circle at 80% 20%,rgba(197,157,95,.22),transparent 28%),linear-gradient(135deg,${heroAccentDeep},${heroAccentMid} 55%,${heroAccentLight})`
                : heroImageCol.background,
              // A proper frame, not a thin line -- an inset ring rather
              // than an outer border, so it doesn't disturb the
              // edge-to-edge bleed on the outside. Uses this slide's own
              // accent color when set, otherwise the site's gold. Two
              // rings (a slim dark inner line, then the wider color
              // band) read as a real picture frame rather than a flat
              // border. Moderated down from an earlier 34/38px (too
              // heavy) -- matches heroTextCol's own frame exactly.
              boxShadow: `inset 0 0 0 24px ${heroAccentFrame || 'var(--gold)'}, inset 0 0 0 27px rgba(5,46,22,.55)`,
            }}
            className="uai-hero-image-col"
            onMouseEnter={() => setHeroPaused(true)}
            onMouseLeave={() => setHeroPaused(false)}
          >

            {heroSlideCount > 0 ? (
              <div style={heroSliderLayer} aria-hidden={heroSlideCount <= 1}>
                {heroBanners.map((banner, i) => (
                  <div
                    key={banner.id || i}
                    style={{
                      ...heroSlide,
                      backgroundImage: `url(${banner.imageUrl})`,
                      opacity: i === activeSlideIndex ? 1 : 0,
                    }}
                  />
                ))}
              </div>
            ) : hero.heroImageUrl ? (
              <div
                style={{
                  ...heroSlide,
                  backgroundImage: `url(${hero.heroImageUrl})`,
                  opacity: 1,
                  // Not wrapped in heroSliderLayer (which carries this
                  // inset for the real slider), so it needs its own --
                  // otherwise this single-image fallback (shown briefly
                  // on every load before the banners fetch resolves, or
                  // permanently if none are configured) crosses the
                  // frame instead of sitting inside it.
                  inset: '27px',
                }}
              />
            ) : (
              <div style={heroImagePlaceholder} aria-hidden="true">
                <span style={{ fontSize: '46px' }}>🕌</span>
              </div>
            )}

            {heroSlideCount > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrevSlide}
                  aria-label="Previous banner"
                  className="hero-slide-arrow hero-slide-arrow-prev"
                  style={heroArrow}
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={goNextSlide}
                  aria-label="Next banner"
                  className="hero-slide-arrow hero-slide-arrow-next"
                  style={heroArrow}
                >
                  ›
                </button>

                <div className="hero-slide-dots" style={heroDots}>
                  {heroBanners.map((banner, i) => (
                    <button
                      key={banner.id || i}
                      type="button"
                      onClick={() => goToSlide(i)}
                      aria-label={`Go to banner ${i + 1}`}
                      style={{
                        ...heroDot,
                        opacity: i === activeSlideIndex ? 1 : 0.45,
                        transform: i === activeSlideIndex ? 'scale(1.25)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
              </>
            )}

          </div>

        </div>
      </section>

      {/* =====================================================
          HERO FEATURE HIGHLIGHTS
          The checkmark list that used to sit inside the hero,
          crowding the photo -- now a compact chip strip of its own
          just below, so it still reads as a credibility signal
          rather than clutter on top of an image.
      ===================================================== */}

      <section style={heroFeaturesSection} dir={dir}>
        <div style={heroFeatures}>
          {hero.features.map((feature, i) => (
            <span key={feature} style={heroFeatureChip}>
              <span aria-hidden="true" style={heroFeatureCheck}>✓</span>
              {lang === 'ar' && hero.featuresAr?.[i] ? hero.featuresAr[i] : feature}
            </span>
          ))}
        </div>
      </section>

      {/* =====================================================
          WELCOME
      ===================================================== */}

      <section style={welcomeSection} dir={dir}>

        <div style={headingContainerWelcome}>

          <span style={welcomeEyebrow}>
            <span style={bookstoreEyebrowDot} aria-hidden="true" />
            {t(welcome.badge)}
          </span>

          <h2 style={sectionTitle}>
            {t(welcome.title)}
          </h2>

          <p style={sectionDescriptionWelcome}>
            {t(welcome.subtitle)}
          </p>

        </div>

        <div style={cardGrid}>

          {featureCards.map((card, i) => (
            <FeatureCard key={i} icon={card.icon} title={t(card.title)} text={t(card.text)} />
          ))}

        </div>
      </section>

      {/* =====================================================
          ACADEMICS
      ===================================================== */}

      <section style={greenSection} dir={dir}>

        <div style={academyGlow} aria-hidden="true" />

        <div style={academySectionInner}>

          <span style={academyEyebrow}>
            <span style={academyEyebrowDot} aria-hidden="true" />
            {t(academySection.badge)}
          </span>

          <h2 style={sectionTitleWhite}>
            {t(academySection.title)}
          </h2>

          <p style={whiteDescription}>
            {t(academySection.subtitle)}
          </p>

          <div style={miniFeatureGrid}>

            {departmentsLoaded && departments.length === 0 && (
              <div style={{ gridColumn: '1 / -1', color: 'rgba(255,255,255,.75)', fontSize: 14 }}>
                Academic departments will appear here once published.
              </div>
            )}

            {departments.map((dept) => (
              <DepartmentMiniCard key={dept.id} department={dept} />
            ))}

          </div>

          {/* This is the homepage's one link into the real programme
              directory (/programs). The hero's own CTA used to point
              here too, under the near-duplicate label "Explore
              Academics" -- it was changed to link to the narrative
              /academy-pathways framework page instead (see the hero
              default above), so each of the homepage's academics
              links now serves a distinct purpose:
                - Hero CTA            -> /academy-pathways (orientation)
                - This button         -> /programs (browse everything)
                - Each Tier 1-5 card  -> /programs/[id] (one programme)
                - "Read the Full ..." -> /academy-pathways (framework detail)
              Nothing here needed deleting -- the duplication was only
              in the destination, not in a whole section, so the fix
              was re-routing one link rather than removing content. */}
          <Link
            href="/programs"
            style={goldButton}
            className="uai-gold-btn"
          >
            {t('Explore Academic Departments →')}
          </Link>

        </div>

      </section>

      {/* =====================================================
          ACADEMIC PROGRAMS
          (Model 12 -- the Academy's five real pathway tiers; full
          detail lives on /academy-pathways and each programme's own
          page, not here)
      ===================================================== */}

      <AcademicProgramsSection />

      {/* =====================================================
          BOOKSTORE
      ===================================================== */}

      <section style={bookstoreSection} dir={dir}>

        <div style={splitGrid}>

          <div style={bookstoreCopyCol}>

            <span style={bookstoreEyebrow}>
              <span style={bookstoreEyebrowDot} aria-hidden="true" />
              {t('ULUL AZM BOOKSTORE')}
            </span>

            <h2
              style={{
                ...bookstoreHeading,
                textAlign: dir === 'rtl' ? 'right' : 'left',
              }}
            >
              {t('Islamic Bookstore')}
            </h2>

            <p
              style={{
                ...bookstoreLede,
                textAlign: dir === 'rtl' ? 'right' : 'left',
              }}
            >
              {t('Explore selected Islamic books, classical texts, student resources, workbooks and educational publications.')}
            </p>

            <div style={buttonRow}>

              <Link
                href="/bookstore"
                style={mainButton}
                className="uai-gold-btn"
              >
                {t('Visit Islamic Bookstore →')}
              </Link>

              <Link
                href="/author-portal/admission"
                style={outlineButton}
                className="uai-lift-card"
              >
                {t('Publish Your Book With Us →')}
              </Link>

            </div>

          </div>

          <div
            style={
              beneficialKnowledgeImage
                ? {
                    ...bookstoreFeature,
                    // A dark scrim over the admin-uploaded photo, same
                    // brand colors as the plain gradient below, so the
                    // white heading/text stay readable over any image.
                    background: `linear-gradient(135deg, rgba(20,40,32,.88), rgba(20,83,45,.82)), url(${beneficialKnowledgeImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }
                : bookstoreFeature
            }
          >

            <div style={bookstoreFeatureIconWrap}>
              <span style={{ fontSize: '30px' }}>📚</span>
            </div>

            <h3 style={featureDarkTitle}>
              {beneficialKnowledgeTitle || t('Beneficial Knowledge')}
            </h3>

            <p style={featureDarkText}>
              {beneficialKnowledgeBody || t('Quality books are companions for the serious student. Explore our dedicated bookstore for academic and Islamic publications.')}
            </p>

            <div style={bookstoreFeatureFootnote}>
              <span aria-hidden="true">✦</span>
              {t('Curated for students, scholars and lifelong learners')}
            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          LECTURES & MEDIA
      ===================================================== */}

      <section style={lightSection} dir={dir}>

        {/* Left-aligned (not centered like the other sections here) and
            capped narrower than the section's own width -- the user's
            own ask: push the whole block to the start side so the
            unused space on the other side is available for something
            new they're adding in a follow-up task, rather than
            widening the cards to fill it. */}
        <div style={{ ...sectionInner, maxWidth: '1240px', textAlign: 'start' }}>

          <span style={goldLabel}>
            {t('MEDIA & LIBRARY')}
          </span>

          <h2 style={sectionTitle}>
            {t('Learn, Listen & Read')}
          </h2>

          <p style={{ ...sectionDescription, marginInlineStart: 0 }}>
            {t('Two separate, dedicated sections: recorded lessons, Khutbahs, Mutun Al-Ilmiyyah and Manzumat live in Media; articles, fatwas, research papers and classical texts live in the Library.')}
          </p>

          {/* Two distinct cards, not one shared block with two buttons --
              the copy above says Media and Library are "two separate,
              dedicated sections," so the layout now shows that instead
              of contradicting it with a single merged block. Each
              card's picture and text are admin-editable (SectionBanner
              rows 'homepage-media-card' / 'homepage-library-card' --
              see /admin/homepage/media-card and .../library-card): an
              uploaded picture replaces the emoji icon as a banner
              across the top of the card, and a custom heading/text
              override the defaults, exactly like the Bookstore
              section's "Beneficial Knowledge" box already works. */}
          <div
            style={{
              ...mediaLibraryGrid,
              gap: '44px',
              maxWidth: '660px',
              margin: '38px 0 0',
            }}
          >

            <Link href="/media" style={mediaLibraryCard} className="uai-lift-card">
              {mediaCardImage ? (
                <div style={{ ...mediaLibraryCardBanner, backgroundImage: `url(${mediaCardImage})` }} />
              ) : (
                <div style={mediaLibraryIcon}>🎙️</div>
              )}
              <div style={mediaLibraryCardBody}>
                <h3 style={mediaLibraryCardTitle}>{mediaCardTitle || t('Media')}</h3>
                <p style={mediaLibraryCardText}>
                  {mediaCardBody || t('Recorded lessons, Khutbahs, Mutun Al-Ilmiyyah and Manzumat.')}
                </p>
                <span style={mediaLibraryCardLink}>{t('Explore Media →')}</span>
              </div>
            </Link>

            <Link href="/library" style={mediaLibraryCard} className="uai-lift-card">
              {libraryCardImage ? (
                <div style={{ ...mediaLibraryCardBanner, backgroundImage: `url(${libraryCardImage})` }} />
              ) : (
                <div style={mediaLibraryIcon}>📖</div>
              )}
              <div style={mediaLibraryCardBody}>
                <h3 style={mediaLibraryCardTitle}>{libraryCardTitle || t('Library')}</h3>
                <p style={mediaLibraryCardText}>
                  {libraryCardBody || t('Articles, fatwas, research papers and classical texts.')}
                </p>
                <span style={mediaLibraryCardLink}>{t('Browse Library →')}</span>
              </div>
            </Link>

          </div>

        </div>

      </section>

      {/* =====================================================
          WHY ULUL AZM
      ===================================================== */}

      <section style={sectionStyle} dir={dir}>

        <div style={headingContainerWide}>

          <span style={goldLabel}>
            {t(approachSection.badge)}
          </span>

          <h2 style={sectionTitle}>
            {t(approachSection.title)}
          </h2>

          <p style={sectionDescription}>
            {t(approachSection.subtitle)}
          </p>

        </div>

        {/* A connected step sequence, not three disconnected cards --
            the three steps genuinely progress from one to the next
            (foundations, then structure, then scholarship), so the
            layout now shows that relationship with a connecting line
            and large sequence numerals, rather than the generic
            InfoBox treatment shared with other, non-sequential
            sections on this page. Data shape (number/title/text) is
            unchanged, so /admin/homepage/sections still edits this
            directly. */}
        <div style={approachStepRow} className="uai-approach-row">

          {approachSteps.map((step, i) => (
            <ApproachStep
              key={i}
              number={step.number}
              title={t(step.title)}
              text={t(step.text)}
              isLast={i === approachSteps.length - 1}
            />
          ))}

        </div>

      </section>

      {/* The "Begin Your Journey of Knowledge" banner that used to
          render here as its own standalone section now lives in
          SiteFooter as that shared component's own masthead strip,
          so it renders consistently on every page that has a
          footer, not only this one -- see components/SiteFooter.jsx. */}

      {/* =====================================================
          NOTICES & ANNOUNCEMENTS (Model 30)
          Its own card, unchanged: an auto-advancing slider of
          notices. Renders nothing when there are none yet (same
          "return null when empty" convention used throughout this
          file).
      ===================================================== */}

      <AnnouncementsSection />

      {/* =====================================================
          EVENTS AND NEWS
          Its own full-width section, matching the "three cards --
          image, title, date, Read More -- with View All and paging
          arrows/dots" reference design: soonest-first upcoming
          events plus newest-first news, three at a time, tapping any
          card opens that item's own page. "View All" opens the
          standalone /updates page (search + share), which still
          lists every event and article in full. Renders nothing when
          there's no live data yet.
      ===================================================== */}

      <EventsAndNewsSection />

      {/* =====================================================
          SPONSORS & PARTNERS
          Kept as its own compact strip just above the footer --
          trust/credibility content belongs near the end of the
          page, after the institute's own academic message and
          current activity, not competing with either for attention
          higher up. Still renders nothing at all when there are no
          public sponsors, exactly as before.
      ===================================================== */}

      <div style={utilityStripWrap}>
        <SponsorsStrip />
      </div>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <SiteFooter />

      <IslamicDateWidget />

      {/* =====================================================
          FOOTER MODAL
      ===================================================== */}

      {/* =====================================================
          RESPONSIVE STYLES
      ===================================================== */}

      <style jsx>{`

        /* .uai-hero-cursor and .uai-sr-only now live as global,
           unscoped rules in app/globals.css -- TypedHeadline is a
           separate component from the one that renders this <style
           jsx> block, so a scoped copy here never actually applied
           to it. See the comment there for the full explanation. */

        @media (max-width: 860px) {
          .uai-hero-inner {
            grid-template-columns: 1fr !important;
            /* The fixed 600px desktop height (see heroInner's own
               comment) would badly compress both stacked columns on a
               phone -- back to auto, sized by content, here. */
            height: auto !important;
            /* Vertical spacing now comes from heroTextCol's own
               padding plus this row gap -- heroInner itself carries
               no padding of its own any more (edge-to-edge redesign),
               so it isn't duplicated here. */
            gap: 0 !important;
          }

          .uai-hero-image-col {
            aspect-ratio: 16 / 9 !important;
            order: -1;
            /* The desktop side-by-side overlap (see the inline
               marginLeft/width on this element) doesn't apply once
               the columns stack -- back to a normal full-width block. */
            margin-left: 0 !important;
            width: 100% !important;
          }
        }

        /* .uai-lift-card, .uai-lift-card-dark and .uai-gold-btn now
           live as global, unscoped rules in app/globals.css -- several
           of the components that use them (FeatureCard,
           DepartmentMiniCard, PathwayCard, AnnouncementsSection,
           EventsAndNewsSection) are separate from this one, so a
           scoped copy here never actually applied to their cards/
           buttons. See the comment there for the full explanation. */

        .mobile-menu-button-container {
          display: none;
          padding: 0 24px 15px;
        }

        .hero-slide-arrow {
          left: 18px;
        }

        .hero-slide-arrow-next {
          left: auto;
          right: 18px;
        }

        .hero-slide-arrow:hover {
          background: rgba(8,32,24,.7);
          border-color: rgba(255,255,255,.6);
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-slide-arrow {
            transition: none !important;
          }
        }

        @media (max-width: 640px) {

          .uai-topbar {
            padding: 10px 14px !important;
          }

          .uai-topbar-inner {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 6px !important;
          }

          .uai-topbar-datetime,
          .uai-topbar-hijri {
            max-width: 100%;
            white-space: normal;
            word-break: break-word;
            font-size: 12px;
          }
        }

        @media (max-width: 700px) {

          .hero-slide-arrow {
            width: 34px;
            height: 34px;
            font-size: 18px;
            left: 10px;
          }

          .hero-slide-arrow-next {
            left: auto;
            right: 10px;
          }

        }

        @media (max-width: 900px) {

          nav {
            display: none !important;
          }

          .mobile-menu-button-container {
            display: flex;
            justify-content: flex-end;
          }

        }

        @media (max-width: 700px) {

          .mobile-menu-button-container {
            padding-left: 16px;
            padding-right: 16px;
          }

        }

        @media (max-width: 800px) {

          .uai-approach-row {
            grid-template-columns: 1fr !important;
            gap: 34px !important;
          }

          .uai-approach-step {
            padding: 0 !important;
          }

          .uai-approach-step .uai-approach-connector {
            display: none;
          }

        }

      `}</style>

    </div>
  );
}

// Types out the hero headline character by character with a blinking
// cursor, the way the user asked for -- "the text or writing appears
// like typing with a cursor". Skips straight to the full text with no
// animation for anyone whose system asks for reduced motion (the
// same window.matchMedia('(prefers-reduced-motion: reduce)') check
// already used by AnnouncementsStrip's slider further down this
// file). The full headline is also always present for screen readers
// via a visually-hidden span, rather than only what's been "typed" so
// far -- an animated partial string is not a reliable or pleasant
// thing for assistive tech to read.
function TypedHeadline({ text, style, animate = true }) {
  const [shownLength, setShownLength] = useState(0);

  useEffect(() => {
    if (!text) {
      setShownLength(0);
      return undefined;
    }

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // `animate` is false for the "no caption saved yet" fallback text
    // -- only a real per-slide caption should type out character by
    // character; the fallback just appears, fully formed, right away.
    if (reducedMotion || !animate) {
      setShownLength(text.length);
      return undefined;
    }

    setShownLength(0);

    let charIndex = 0;
    const interval = setInterval(() => {
      charIndex += 1;
      setShownLength(charIndex);
      if (charIndex >= text.length) {
        clearInterval(interval);
      }
    }, 38);

    return () => clearInterval(interval);
  }, [text, animate]);

  return (
    <h1 style={style}>
      <span aria-hidden="true">
        {(text || '').slice(0, shownLength)}
        <span className="uai-hero-cursor">|</span>
      </span>
      <span className="uai-sr-only">{text}</span>
    </h1>
  );
}

export default function Home() {
  return (
    <LanguageProvider>
      <HomeContent />
    </LanguageProvider>
  );
}

/* ============================================================
   COMPONENTS
============================================================ */

function FooterColumn({ title, children }) {
  return (
    <div>

      <h3 style={footerHeading}>
        {title}
      </h3>

      <div style={footerColumnLinks}>
        {children}
      </div>

    </div>
  );
}

function FooterLink({ href, children }) {
  return (
    <Link href={href} style={footerLink}>
      {children}
    </Link>
  );
}

function FooterButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={footerButton}
      type="button"
    >
      {children}
    </button>
  );
}

// Real pages already on the site -- picked for what a first-time
// visitor most often needs next (how to apply, term dates, the
// library, the course catalog, common questions, how to give) --
// never a placeholder or made-up destination. Rendered by the
// Important Links card inside AnnouncementsSection below.
const IMPORTANT_LINKS = [
  { icon: '\ud83c\udf93', label: 'Admission Requirements', href: '/admission-requirements' },
  { icon: '\ud83d\udcc5', label: 'Academic Calendar', href: '/academic-calendar' },
  { icon: '\ud83d\udcd6', label: 'Digital Library', href: '/library' },
  { icon: '\ud83c\udfdb\ufe0f', label: 'Academic Programmes', href: '/programs' },
  { icon: '\u2753', label: 'Frequently Asked Questions', href: '/faq' },
  { icon: '\ud83d\udc9a', label: 'Donate to Ulul Azm', href: '/donate' },
];

// Announcements + Important Links -- a two-card row. Left: the
// institution's current notices, shown as a plain list of rows
// (megaphone icon, title, date, arrow) all at once rather than one
// slide at a time, matching the reference layout, with a "View All"
// link through to the full listing page. Right: the fixed Important
// Links card above, so a visitor can jump straight to a handful of
// genuinely useful pages without hunting through the main nav. The
// Announcements card shows an empty-state message rather than
// disappearing when nothing is published -- Important Links stays
// useful either way, so the section no longer returns null once
// loaded.
function AnnouncementsSection() {
  const { t, dir } = useLanguage();

  const [announcements, setAnnouncements] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/announcements')
      .then((res) => res.json())
      .then((result) => {
        if (cancelled) return;
        if (result?.success) {
          setAnnouncements(result.data || []);
        }
      })
      .catch(() => {
        /* homepage should never break because this feed is down */
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <section style={noticesUpdatesSection} dir={dir}>
      <div
        style={{ ...noticesUpdatesGrid, gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)' }}
        className="uai-notices-updates-grid"
      >

        <div className="ih-card uai-lift-card" style={noticesCard}>
          <div style={noticesCardHeaderRow}>
            <div>
              <span style={utilityStripLabel}>{t('NOTICES & ANNOUNCEMENTS')}</span>
              <h2 style={noticesCardTitle}>{t('Announcements')}</h2>
            </div>
            <Link href="/announcements" style={outlineButtonSmall}>
              {t('View All')}
            </Link>
          </div>

          {announcements.length === 0 ? (
            <p style={announcementsEmptyText}>
              {t('No announcements at the moment \u2014 please check back soon.')}
            </p>
          ) : (
            <div style={announcementsList}>
              {announcements.map((item, index) => (
                <Link
                  key={item.id}
                  href={`/announcements#announcement-${item.id}`}
                  className="uai-list-row"
                  style={{
                    ...announcementsListRow,
                    ...(index === announcements.length - 1 ? { borderBottom: 'none' } : {}),
                  }}
                >
                  <span aria-hidden="true" style={announcementsRowIcon}>📣</span>
                  <span style={announcementsRowBody}>
                    <span style={announcementsRowTitle}>{item.titleEn}</span>
                    <span style={announcementsRowDate}>
                      {new Date(item.publishedAt).toLocaleDateString([], {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </span>
                  <ArrowUpRightIcon size={17} style={announcementsRowArrow} />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="ih-card uai-lift-card" style={noticesCard}>
          <div style={noticesCardHeaderRow}>
            <div>
              <span style={utilityStripLabel}>{t('QUICK ACCESS')}</span>
              <h2 style={noticesCardTitle}>{t('Important Links')}</h2>
            </div>
          </div>

          <div style={importantLinksList}>
            {IMPORTANT_LINKS.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className="uai-list-row"
                style={{
                  ...importantLinksRow,
                  ...(index === IMPORTANT_LINKS.length - 1 ? { borderBottom: 'none' } : {}),
                }}
              >
                <span aria-hidden="true" style={importantLinksRowIcon}>{link.icon}</span>
                <span style={importantLinksRowLabel}>{t(link.label)}</span>
                <ExternalLinkIcon size={15} style={importantLinksRowArrow} />
              </Link>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

// How many cards show at once in EventsAndNewsSection's carousel --
// "it should be able to take three cards", matching the reference
// design (image, title, date, a solid Read More button, three across,
// with prev/next arrows and paging dots once there's more than one
// page's worth).
const EVENTS_NEWS_PAGE_SIZE = 3;

// A full-width "Events and News" showcase -- soonest-first upcoming
// events plus newest-first news articles, merged into one feed and
// paged three cards at a time. Each card is itself the link (tapping
// anywhere on it, not just "Read More", opens that event's or
// article's own page -- events open the full /updates listing
// scrolled to that event, since there's no standalone event page yet;
// news opens its own /news/[id] page). "View All" opens the same
// /updates page the homepage's old compact list already linked to.
// Renders nothing at all when there's no live data yet.
function EventsAndNewsSection() {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [page, setPage] = useState(0);

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([
      fetch('/api/events').then((res) => res.json()),
      fetch('/api/news').then((res) => res.json()),
    ]).then(([eventsResult, newsResult]) => {
      if (cancelled) return;

      const now = Date.now();

      const upcomingEvents =
        eventsResult.status === 'fulfilled' && eventsResult.value?.success
          ? (eventsResult.value.data || [])
              .filter((event) => new Date(event.eventDate).getTime() >= now)
              .slice(0, 6)
              .map((event) => ({
                kind: 'event',
                id: event.id,
                title: event.titleEn,
                image: event.thumbnailUrl,
                date: event.eventDate,
                href: `/updates#event-${event.id}`,
              }))
          : [];

      const latestNews =
        newsResult.status === 'fulfilled' && newsResult.value?.success
          ? (newsResult.value.data || [])
              .slice(0, 6)
              .map((article) => ({
                kind: 'news',
                id: article.id,
                title: article.titleEn,
                image: article.featuredImageUrl,
                date: article.publishedAt,
                href: `/news/${article.id}`,
              }))
          : [];

      // Soonest events first, then newest news -- same ordering the
      // old compact list used -- capped at 9 (three pages of three).
      setItems([...upcomingEvents, ...latestNews].slice(0, 9));
      setLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const pageCount = Math.ceil(items.length / EVENTS_NEWS_PAGE_SIZE) || 0;

  // Auto-advance through pages, same convention (6s, paused for
  // reduced motion) as the Announcements slider above -- only when
  // there's more than one page to cycle through.
  useEffect(() => {
    if (pageCount < 2) return undefined;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return undefined;
    }

    const timer = setInterval(() => {
      setPage((current) => (current + 1) % pageCount);
    }, 6000);

    return () => clearInterval(timer);
  }, [pageCount]);

  if (!loaded || items.length === 0) {
    return null;
  }

  const currentPage = pageCount > 0 ? page % pageCount : 0;
  const visibleItems = items.slice(
    currentPage * EVENTS_NEWS_PAGE_SIZE,
    currentPage * EVENTS_NEWS_PAGE_SIZE + EVENTS_NEWS_PAGE_SIZE
  );

  function goPrevPage() {
    setPage((current) => (current - 1 + pageCount) % pageCount);
  }

  function goNextPage() {
    setPage((current) => (current + 1) % pageCount);
  }

  return (
    <section style={eventsNewsSection}>
      <div style={eventsNewsHeaderRow}>
        <div>
          <h2 style={eventsNewsTitle}>Events and News</h2>
          <p style={eventsNewsSubtitle}>
            The latest events, announcements, and press coverage from Ulul Azm Institute.
          </p>
        </div>

        <Link href="/updates" style={outlineButton}>
          View All
        </Link>
      </div>

      <div style={eventsNewsGrid} className="uai-events-news-grid">
        {visibleItems.map((item) => (
          <Link
            key={`${item.kind}-${item.id}`}
            href={item.href}
            className="ih-card uai-lift-card"
            style={eventsNewsCard}
          >
            <div
              style={{
                ...eventsNewsCardImage,
                ...(item.image ? { backgroundImage: `url(${item.image})` } : {}),
              }}
            >
              {!item.image && (
                <span aria-hidden="true" style={{ fontSize: '32px' }}>
                  {item.kind === 'event' ? '📅' : '📰'}
                </span>
              )}
            </div>

            <div style={eventsNewsCardBody}>
              <h3 style={eventsNewsCardTitle}>{item.title}</h3>

              <div style={eventsNewsCardFooter}>
                <span style={eventsNewsCardDate}>
                  <span aria-hidden="true">📅</span>{' '}
                  {new Date(item.date).toLocaleDateString([], {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span style={eventsNewsReadMoreBtn}>Read More</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {pageCount > 1 && (
        <div style={eventsNewsControls}>
          <div style={eventsNewsArrows}>
            <button type="button" onClick={goPrevPage} aria-label="Previous events and news" style={eventsNewsArrowBtn}>
              ‹
            </button>
            <button type="button" onClick={goNextPage} aria-label="Next events and news" style={eventsNewsArrowBtn}>
              ›
            </button>
          </div>

          <div style={eventsNewsDots} role="tablist" aria-label="Events and News pages">
            {Array.from({ length: pageCount }).map((_, index) => (
              <button
                key={index}
                type="button"
                role="tab"
                onClick={() => setPage(index)}
                aria-label={`Show page ${index + 1} of ${pageCount}`}
                aria-selected={index === currentPage}
                style={index === currentPage ? eventsNewsDotActive : eventsNewsDot}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// Real, currently-active sponsors/partners (Sponsor.status === ACTIVE,
// isPublic === true, and within startDate/endDate when set -- the exact
// same filtering /api/sponsors already applies for the standalone
// /sponsored page, reused here rather than duplicated). Renders nothing
// when there are none yet, same convention as AnnouncementsStrip above,
// so the homepage never shows an empty "Our Sponsors" section.
function SponsorsStrip() {
  const { t, dir } = useLanguage();
  const [sponsors, setSponsors] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/sponsors')
      .then((res) => res.json())
      .then((result) => {
        if (cancelled) return;
        if (result && result.success && Array.isArray(result.sponsors)) {
          setSponsors(result.sponsors);
        }
      })
      .catch(() => {
        /* silently ignore -- the homepage should never break because
           the sponsors feed is unavailable */
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!loaded || sponsors.length === 0) {
    return null;
  }

  return (
    <section style={utilityStripSectionStyleWithRule} dir={dir}>
      <div style={utilityStripHeading}>
        <span style={utilityStripLabel}>{t('SPONSORS & PARTNERS')}</span>

        <h2 style={utilityStripTitle}>
          {t('Supported By')}
        </h2>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '18px',
          maxWidth: '1000px',
          margin: '0 auto',
        }}
      >
        {sponsors.map((sponsor) => (
          <div
            key={sponsor.id}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              textAlign: 'center',
            }}
          >
            {sponsor.logoUrl ? (
              <img
                src={sponsor.logoUrl}
                alt={sponsor.name}
                style={{ width: 64, height: 64, objectFit: 'contain' }}
              />
            ) : (
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'var(--brand-tint)',
                  color: 'var(--brand)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '20px',
                }}
              >
                {sponsor.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--ink)' }}>
              {sponsor.name}
            </div>

            {sponsor.websiteUrl && (
              <a
                href={sponsor.websiteUrl}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '12px', color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}
              >
                {t('Visit website')} →
              </a>
            )}
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '22px' }}>
        <a href="/sponsored" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brand)', textDecoration: 'none' }}>
          {t('See all sponsors & partners')} →
        </a>
      </div>
    </section>
  );
}

// Model 12 -- the Academy's five real pathway tiers (Academic Pathways
// & Qualification Framework, already approved). Content below is
// transcribed from that document's section 2 (and section 1 for the
// Specialized Certificate tier), not invented here. Foundation,
// Intermediate, Advanced and Diploma are real Program records
// (resolved to their live id via the same public programmes endpoint
// /programs uses); Specialized Certificate Programs is a real,
// approved *framework* but has no defined certificate yet -- so its
// card says so plainly and carries no "Apply" action, rather than
// linking to an application for something that does not exist.
const PATHWAY_TIERS = [
  {
    level: 'FOUNDATION',
    badge: 'Tier 1',
    name: 'Foundation Learner Programme',
    purpose:
      "Establishes the basic Islamic knowledge, Qur'an reading ability, and study habits every later pathway assumes.",
    who: 'Learners with little or no prior structured Islamic education, at any age from young learner to adult.',
    studyAreas: [
      'Aqeedah & Fiqh essentials',
      "Qur'an reading & Tajweed foundations",
      'Arabic foundations',
      'Islamic character & adab',
      'Basic study skills',
    ],
    duration: "The Academy's shortest pathway -- a small number of academic terms.",
    delivery: "Online, through instructor-led live classes and the Academy's own course portal.",
    progression: 'The normal route into Intermediate Islamic Studies.',
    admission: 'No prior study required -- placement by a short readiness assessment.',
    hasProgram: true,
    canApply: true,
    note: null,
  },
  {
    level: 'INTERMEDIATE',
    badge: 'Tier 2',
    name: 'Intermediate Learner Programme',
    purpose:
      'Moves a learner from basic knowledge to systematic, connected understanding across the core disciplines.',
    who: 'Learners who have completed Foundation Studies, or who test in with equivalent prior learning.',
    studyAreas: [
      'Systematic Aqeedah & Fiqh',
      'Seerah',
      "Applied Tajweed & Qur'an comprehension",
      'Arabic grammar',
      'Islamic history & civilization',
      'Communication & leadership',
    ],
    duration: 'Longer than Foundation, shorter than Advanced -- a multi-term sequence.',
    delivery: "Online, through instructor-led live classes and the Academy's own course portal.",
    progression: 'The normal route into Advanced Islamic Studies.',
    admission: 'Completed Foundation Studies, or a placement assessment demonstrating equivalent competence.',
    hasProgram: true,
    canApply: true,
    note: null,
  },
  {
    level: 'ADVANCED',
    badge: 'Tier 3',
    name: 'Advanced Islamic Studies',
    purpose:
      'Independent engagement with primary texts and a first taste of specialization, preparing a learner for the Diploma.',
    who: 'Learners who have completed Intermediate Islamic Studies and are ready to work with less guidance.',
    studyAreas: [
      'Independent Aqeedah reasoning',
      'Usul al-Fiqh & Hadith Sciences',
      'Tajweed mastery & introductory Tafsir',
      'Source-level Arabic',
      'Islamic thought & research preparation',
      'One specialization elective',
    ],
    duration: 'Comparable to or slightly longer than Intermediate.',
    delivery: "Online, through instructor-led live classes and the Academy's own course portal.",
    progression: 'The normal route into the Diploma -- or directly into a Specialized Certificate.',
    admission: 'Completed Intermediate Islamic Studies, or a placement assessment demonstrating equivalent competence.',
    hasProgram: true,
    canApply: true,
    note: null,
  },
  {
    level: 'DIPLOMA',
    badge: 'Tier 4',
    name: 'Diploma in Islamic Studies',  // homepage card label; see note above re: formal Program name
    purpose:
      "The Academy's flagship structured qualification, integrating all six departments into one assessed credential.",
    who: 'Learners who have completed Advanced Islamic Studies and are pursuing the Academy\'s most complete credential.',
    studyAreas: [
      'Islamic Studies',
      "Qur'anic Studies",
      'Arabic Language',
      'Islamic Education & Tarbiyah',
      'Islamic Civilization & Society',
      'Research & Learning Skills',
    ],
    duration: "The Academy's longest structured pathway.",
    delivery: "Online, through instructor-led live classes and the Academy's own course portal.",
    progression: 'The normal route into a Specialized Certificate for a teaching or research track.',
    admission: 'Completed Advanced Islamic Studies, or a comprehensive placement assessment.',
    hasProgram: true,
    canApply: true,
    note: 'An Academy-issued credential -- not an externally accredited one.',
  },
  {
    // 2026-09: real Program now exists (level CERTIFICATE) -- this
    // card's own local `level` key is set to match it exactly, since
    // AcademicProgramsSection below maps the API's real Program.level
    // to a card via this field (programIds[tier.level]).
    level: 'CERTIFICATE',
    badge: 'Tier 5',
    name: 'Specialized Certificate Programs',
    purpose:
      'Focused, single-area competence beyond the general pathway, for a learner who wants depth in one discipline.',
    who: 'Learners who have completed Advanced Islamic Studies or the Diploma and want to go deep in one area.',
    studyAreas: [
      'Tajweed', "Qur'an Recitation", 'Hifz', 'Tafsir', 'Hadith', 'Fiqh',
      'Arabic', "Qur'anic Arabic", 'Islamic Education', "Da'wah", 'Islamic History & Civilization',
    ],
    duration: 'Shorter and more focused than the Diploma -- varies by certificate area.',
    delivery: "Online, through instructor-led live classes and the Academy's own course portal.",
    progression: 'A terminal award within its area -- a learner may hold more than one certificate over time.',
    admission: 'Completed Advanced Islamic Studies or the Diploma, or a placement assessment demonstrating equivalent competence in the chosen area.',
    hasProgram: true,
    canApply: true,
    note: "Draws its initial course list from across the Academy's departments; the Department may add further certificate courses over time.",
  },
];

function AcademicProgramsSection() {
  const { t, dir } = useLanguage();
  const [programIds, setProgramIds] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/academic/programs?type=programs')
      .then((res) => res.json())
      .then((result) => {
        if (cancelled) return;
        if (result && result.success && Array.isArray(result.data)) {
          const map = {};
          for (const p of result.data) {
            if (p.level) map[p.level] = p.id;
          }
          setProgramIds(map);
        }
      })
      .catch(() => {
        /* silently ignore -- cards fall back to the programmes list link */
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section style={sectionStyle} dir={dir}>
      <div style={headingContainer}>
        <span style={goldLabel}>{t('ACADEMIC PROGRAMS')}</span>

        <h2 style={{ ...sectionTitle, whiteSpace: 'normal' }}>
          {t('Five Pathways, One Progression')}
        </h2>

        <p style={sectionDescription}>
          {t("Every learner enters at the pathway that matches their starting point and progresses in sequence -- from Foundation Studies through to the Diploma in Islamic Studies, with a Specialized Certificate reachable after Advanced or the Diploma. This is an overview of each tier; the full framework and course-by-course detail live on their own pages.")}
        </p>
      </div>

      <div style={pathwayGrid}>
        {PATHWAY_TIERS.map((tier) => (
          <PathwayCard key={tier.level} tier={tier} programId={programIds[tier.level]} loaded={loaded} />
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '34px' }}>
        <Link href="/academy-pathways" style={outlineButton}>
          {t('Read the Full Academic Pathways Framework →')}
        </Link>
      </div>
    </section>
  );
}

function PathwayCard({ tier, programId, loaded }) {
  const { t } = useLanguage();
  const detailsHref = tier.hasProgram
    ? loaded && programId
      ? `/programs/${programId}`
      : '/programs'
    : '/academy-pathways';

  return (
    <div style={pathwayCard}>
      <div style={pathwayCardHeader}>
        <span style={pathwayTierBadge}>{t(tier.badge)}</span>
        <h3 style={pathwayCardTitle}>{t(tier.name)}</h3>
      </div>

      <p style={pathwayPurpose}>{t(tier.purpose)}</p>

      <div style={pathwayCardFooter}>
        <Link href={detailsHref} style={pathwayLinkPrimary}>
          {t(tier.hasProgram ? 'Programme Details' : 'Learn About This Pathway')} →
        </Link>

        {tier.canApply && (
          <Link href="/admission" style={pathwayLinkSecondary}>
            {t('Apply')}
          </Link>
        )}
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <div style={featureCard} className="uai-lift-card">

      <div style={featureIcon}>
        {icon}
      </div>

      <h3 style={featureTitle}>
        {title}
      </h3>

      <p style={featureText}>
        {text}
      </p>

    </div>
  );
}

// Real Department entities on the homepage's Academy section --
// links straight to /departments/[id], the same destination the
// standalone /departments directory page already uses. Kept visually
// consistent with miniFeature (same dark-green-section card style)
// rather than introducing a new card treatment.
function DepartmentMiniCard({ department }) {
  return (
    <Link
      href={`/departments/${department.id}`}
      style={{ ...miniFeature, textDecoration: 'none', color: 'inherit' }}
      className="uai-lift-card-dark"
    >
      <span style={miniFeatureIconWrap}>🏛</span>

      <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <strong style={{ fontSize: '14px', lineHeight: 1.4 }}>
          {department.name}
        </strong>
        {department.programCount > 0 && (
          <span style={{ fontSize: '12px', opacity: 0.75 }}>
            {department.programCount} programme{department.programCount === 1 ? '' : 's'}
          </span>
        )}
      </span>
    </Link>
  );
}

// Used only by the OUR APPROACH section -- a sequence step, not a
// generic card: a large numeral over a short connecting line into the
// next step (hidden on the last one and stacked to a single column on
// narrow screens via the .uai-approach-step CSS below).
function ApproachStep({ number, title, text, isLast }) {
  return (
    <div style={approachStep} className="uai-approach-step">

      <div style={approachStepNumberRow}>
        <span style={approachStepNumber}>{number}</span>
        {!isLast && <span style={approachStepConnector} className="uai-approach-connector" aria-hidden="true" />}
      </div>

      <h3 style={approachStepTitle}>{title}</h3>

      <p style={approachStepText}>{text}</p>

    </div>
  );
}

/* ============================================================
   STYLES
============================================================ */

const pageStyle = {
  fontFamily: 'var(--font-body)',
  background: 'var(--paper)',
  color: 'var(--ink)',
  minHeight: '100vh',
};

const topBar = {
  background:
    'linear-gradient(90deg,var(--brand-deepest),var(--brand),var(--brand-deepest))',
  color: 'var(--on-accent)',
  padding: '11px 20px',
  fontSize: '13.5px',
};

const topBarInner = {
  maxWidth: '1200px',
  margin: '0 auto',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '15px',
  flexWrap: 'wrap',
};

const topBarDivider = {
  margin: '0 8px',
  opacity: 0.5,
};

const langToggleRow = {
  display: 'flex',
  gap: 6,
};

const langToggleBtn = {
  background: 'transparent',
  border: '1px solid rgba(255,255,255,.4)',
  color: 'var(--on-accent)',
  borderRadius: 999,
  padding: '4px 13px',
  fontSize: '12.5px',
  fontWeight: 700,
  cursor: 'pointer',
  opacity: 0.75,
};

const langToggleBtnActive = {
  ...langToggleBtn,
  background: 'rgba(255,255,255,.2)',
  opacity: 1,
};

// The Arabic toggle label is always Arabic script regardless of the
// current language, and it's a plain <button>, not an h1/h2/h3, so
// it never picks up the [dir=rtl] heading rule -- it needs its own
// explicit Amiri font, same as the CTA banner's arabic div did.
const langToggleBtnAr = {
  ...langToggleBtn,
  fontFamily: 'var(--font-arabic-display)',
  fontSize: '14px',
};

const langToggleBtnActiveAr = {
  ...langToggleBtnAr,
  background: 'rgba(255,255,255,.2)',
  opacity: 1,
};

const headerStyle = {
  position: 'sticky',
  top: 0,
  zIndex: 100,
  background: 'rgba(255,255,255,.97)',
  backdropFilter: 'blur(12px)',
  borderBottom: '1px solid var(--border)',
  boxShadow: '0 4px 20px rgba(15,23,42,.05)',
};

const headerInner = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '15px 24px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '20px',
  flexWrap: 'wrap',
};

const brandStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  textDecoration: 'none',
};

// (logoStyle/brandName/brandSubtitle/ACADEMY_DROPDOWN_ITEMS/nav*
// consts and the NavLink/NavDropdown components that used them were
// removed here (2026-09) -- dead leftovers from before the header
// moved to the shared <SiteHeader /> component above. They also
// pointed at the 10 Academy governance-document routes retired in
// this same pass.)

const mobileAccordionPanel = {
  background: 'var(--brand-tint)',
  borderBottom: '1px solid var(--border)',
};

const mobileAccordionLink = {
  display: 'block',
  color: 'var(--ink-soft)',
  textDecoration: 'none',
  padding: '11px 15px 11px 30px',
  borderTop: '1px solid var(--border-soft)',
  fontSize: '13px',
  fontWeight: '700',
};

const mobileNavLink = {
  display: 'block',
  color: 'var(--ink-soft)',
  textDecoration: 'none',
  padding: '12px 15px',
  borderBottom: '1px solid var(--border)',
  fontWeight: '700',
};

const mobileMenuButton = {
  border: '1px solid var(--border)',
  background: 'var(--paper)',
  color: 'var(--brand)',
  width: '42px',
  height: '42px',
  borderRadius: '9px',
  cursor: 'pointer',
  fontSize: '21px',
  fontWeight: '800',
};

const mobileMenuContainer = {
  borderTop: '1px solid var(--border)',
  background: 'var(--surface)',
  padding: '5px 0',
};

const headerActions = {
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
};

const loginButton = {
  padding: '10px 17px',
  borderRadius: '8px',
  textDecoration: 'none',
  color: 'var(--brand)',
  fontWeight: '800',
  border: '1px solid var(--brand)',
  fontSize: '14px',
};

const heroStyle = {
  position: 'relative',
  overflow: 'hidden',
  background:
    'radial-gradient(circle at 80% 20%,rgba(197,157,95,.22),transparent 28%),linear-gradient(135deg,var(--brand-deepest),var(--brand) 55%,var(--brand-light))',
  color: 'var(--on-accent)',
  transition: 'background 1s ease',
};

// Redesigned to a true edge-to-edge layout, matching the reference
// (Islamic University of Madinah) homepage the user pointed to: the
// headline lines up with the logo above it on the left, and the
// banner photo bleeds all the way to the browser's right edge with
// no rounded corners, border or floating-card shadow, rather than
// sitting inset inside a centered, padded container. `alignItems:
// 'stretch'` plus heroInner's own minHeight is what lets the image
// column (which has no intrinsic height of its own -- its slides are
// all position:absolute) fill the same height as the text column
// instead of needing an aspect-ratio box.
const heroInner = {
  position: 'relative',
  width: '100%',
  display: 'grid',
  gridTemplateColumns: 'minmax(0,0.9fr) minmax(0,1.1fr)',
  alignItems: 'stretch',
  // A fixed height, not minHeight -- heroImageCol has no intrinsic
  // height of its own (its slides are all position:absolute), so it
  // stretches to match whatever height this row ends up at. With
  // minHeight, the row's real height came from heroTextCol's content,
  // which grows/shrinks as TypedHeadline types the caption out
  // character by character -- so the image visibly "zoomed"/resized
  // in sync with every keystroke of the typing animation. A fixed
  // height removes that feedback loop entirely.
  height: '600px',
};

const heroTextCol = {
  textAlign: 'start',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  // Lines the headline up with the logo/nav above -- the exact same
  // "max(24px, centered-1280px-column + 24px gutter)" formula
  // components/SiteHeader.jsx's own headerInner uses.
  paddingLeft: 'max(36px, calc((100vw - 1280px) / 2 + 24px))',
  paddingRight: '48px',
  paddingTop: '56px',
  paddingBottom: '56px',
};

const heroImageCol = {
  position: 'relative',
  overflow: 'hidden',
  background: 'var(--brand-dark)',
  transition: 'background 1s ease, box-shadow 1s ease',
};

const heroImagePlaceholder = {
  position: 'absolute',
  inset: '27px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background:
    'radial-gradient(circle at 30% 30%,rgba(197,157,95,.25),transparent 45%),linear-gradient(135deg,var(--brand-dark),var(--brand-deepest))',
};

// Hero banner slider (Model 25) -- stacked absolutely-positioned
// layers crossfade via opacity, now sized to fill heroImageCol (an
// aspect-ratio box) instead of the whole section background.
const heroSliderLayer = {
  position: 'absolute',
  // Inset by the frame's own thickness (see heroImageCol's boxShadow)
  // instead of edge-to-edge -- otherwise a banner photo with little
  // letterboxing fills the whole box and paints straight over the
  // frame ring instead of sitting inside it.
  inset: '27px',
};

const heroSlide = {
  position: 'absolute',
  inset: 0,
  // 'contain' -- not 'cover' -- so the whole banner photo is always
  // visible, never cropped to fill the box ("doesn't make the full
  // picture appear"). Any letterboxing this leaves is filled by
  // heroImageCol's own background (the slide's accent color, or the
  // site's brand color by default), not an empty gap.
  backgroundSize: 'contain',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  transition: 'opacity 1.1s ease-in-out',
};

const heroArrow = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  width: '38px',
  height: '38px',
  borderRadius: '50%',
  border: '1px solid rgba(255,255,255,.35)',
  background: 'rgba(8,32,24,.55)',
  color: '#fff',
  fontSize: '20px',
  lineHeight: '1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  zIndex: 3,
};

const heroDots = {
  position: 'absolute',
  bottom: '16px',
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: '9px',
  zIndex: 3,
};

const heroDot = {
  width: '9px',
  height: '9px',
  borderRadius: '50%',
  border: '1px solid rgba(255,255,255,.6)',
  background: '#fff',
  padding: 0,
  cursor: 'pointer',
  transition: 'opacity .3s ease, transform .3s ease',
};

const heroTitle = {
  fontSize: 'clamp(21px,2.6vw,32px)',
  lineHeight: 1.16,
  margin: '0 0 20px',
  letterSpacing: '-0.5px',
};

const heroText = {
  maxWidth: '520px',
  margin: 0,
  fontSize: '17px',
  lineHeight: 1.8,
  color: '#dbeafe',
};

const heroFeaturesSection = {
  background: 'var(--surface)',
  borderBottom: '1px solid var(--border)',
};

const heroFeatures = {
  maxWidth: '1100px',
  margin: '0 auto',
  padding: '20px 24px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '12px',
  flexWrap: 'wrap',
};

const heroFeatureChip = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '7px',
  padding: '8px 16px',
  borderRadius: '999px',
  background: 'var(--brand-tint)',
  color: 'var(--brand)',
  fontWeight: '700',
  fontSize: '13px',
  border: '1px solid var(--brand-tint-2)',
};

const heroFeatureCheck = {
  color: 'var(--gold-dark)',
  fontWeight: '900',
};

const sectionStyle = {
  maxWidth: '1100px',
  margin: '0 auto',
  padding: '80px 24px',
};

// Welcome gets a very soft radial tint behind its content instead of
// a flat white block -- subtle enough not to fight the feature cards,
// but enough that the section reads as designed rather than a bare
// content dump between the hero and the green Academics band.
const welcomeSection = {
  ...sectionStyle,
  background:
    'radial-gradient(ellipse 80% 60% at 50% 0%, var(--brand-tint) 0%, transparent 70%)',
};

// Bookstore sits between the green Academics band and the light
// Media/Library band -- a thin gold hairline top and a faint paper
// tint give it its own identity instead of reading as a continuation
// of whichever section happens to be above it.
const bookstoreSection = {
  ...sectionStyle,
  borderTop: '1px solid var(--border)',
  background:
    'linear-gradient(180deg, var(--gold-tint) 0%, transparent 220px)',
};

const sectionInner = {
  maxWidth: '1100px',
  margin: '0 auto',
  padding: '80px 24px',
  textAlign: 'center',
};

const headingContainer = {
  textAlign: 'center',
  maxWidth: '720px',
  margin: '0 auto 50px',
};

/* Same as headingContainer but wide enough that the "Our Approach"
   heading (a single deliberate phrase: "More than a website — a
   learning environment") never gets split across two lines by
   sectionTitle's textWrap:balance -- the description below still
   wraps normally at 720px via sectionDescription's own maxWidth. */
const headingContainerWide = {
  ...headingContainer,
  maxWidth: '920px',
};

/* Welcome section's own heading container -- wide enough that its
   longer subtitle ("Ulul Azm Institute brings together structured
   academic learning...") wraps to two lines instead of three, and
   that the title above it ("A place to seek knowledge with
   sincerity") comfortably stays on one line at this width via
   sectionTitle's textWrap:'balance' -- no forced white-space:nowrap
   here anymore, since that broke on longer admin-edited or Arabic
   copy at 800-1400px widths; textWrap:'balance' degrades gracefully
   instead of clipping/overflowing. */
const headingContainerWelcome = {
  ...headingContainer,
  maxWidth: '1000px',
};

const welcomeEyebrow = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  color: 'var(--gold-dark)',
  fontWeight: '900',
  fontSize: '14.5px',
  letterSpacing: '1.5px',
};

const sectionTitle = {
  color: 'var(--brand)',
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(28px,4vw,42px)',
  lineHeight: 1.15,
  letterSpacing: '-0.01em',
  margin: '12px 0 16px',
  textWrap: 'balance',
};

const sectionTitleWhite = {
  ...sectionTitle,
  color: 'var(--on-accent)',
};

const sectionDescription = {
  color: 'var(--ink-soft)',
  lineHeight: 1.8,
  fontSize: '15.5px',
  maxWidth: '720px',
  margin: '0 auto',
};

/* Welcome section's longer subtitle needs a wider track than the
   720px default to land on two lines instead of three -- see
   headingContainerWelcome just above for the matching container. */
const sectionDescriptionWelcome = {
  ...sectionDescription,
  maxWidth: '820px',
};

const whiteDescription = {
  color: '#dbeafe',
  lineHeight: 1.8,
  fontSize: '15.5px',
  maxWidth: '720px',
  margin: '0 auto 30px',
};

// Shared card grid for the homepage's Events/News sections -- same
// visual language (radius/border/shadow) as the public /events and
// /news list pages' own cards, just compact enough for a 3-up preview
// row on the homepage.
const miniCardGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: 20,
  maxWidth: '1000px',
  margin: '0 auto',
};

const miniCard = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: 20,
  boxShadow: '0 1px 3px rgba(0,0,0,.06)',
};

const miniCardImage = {
  height: 120,
  borderRadius: 8,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  marginBottom: 4,
};

const miniCardEyebrow = {
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.4px',
  color: 'var(--gold-dark)',
};

const miniCardTitle = {
  fontFamily: 'var(--font-display)',
  fontSize: '16.5px',
  fontWeight: 600,
  color: 'var(--ink)',
  lineHeight: 1.35,
  // A CMS-entered event/news title has no length limit -- clamp to
  // 2 lines so a long one can't push the card taller than its
  // siblings in the 3-up grid, matching miniCardDesc's own clamp
  // just below.
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

const miniCardDesc = {
  fontSize: '13px',
  lineHeight: 1.55,
  color: 'var(--ink-soft)',
  margin: 0,
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

const goldLabel = {
  color: 'var(--gold-dark)',
  fontWeight: '900',
  fontSize: '14.5px',
  letterSpacing: '1.5px',
};

const announcementsSectionStyle = {
  maxWidth: '1100px',
  margin: '0 auto',
  padding: '56px 24px 0',
};

// Compact "utility strip" treatment for Notices/Announcements and
// Sponsors/Partners now that they sit just above the footer -- much
// less vertical padding than a primary content section (sectionStyle's
// 80px), a smaller heading, and no forced nowrap, so together the two
// strips read as a slim reference band rather than occupying a full
// screen's worth of the page the way they did stacked right under the
// hero.
const utilityStripWrap = {
  background: 'var(--surface-subtle, #f8fafc)',
  borderTop: '1px solid var(--border)',
};

const utilityStripSectionStyle = {
  maxWidth: '1100px',
  margin: '0 auto',
  padding: '40px 24px',
};

// Same as utilityStripSectionStyle, plus a top rule -- used only by
// SponsorsStrip so a divider appears between the two utility strips
// exclusively when Announcements has also actually rendered something
// above it (never a stray line when Sponsors is the only one showing).
const utilityStripSectionStyleWithRule = {
  ...utilityStripSectionStyle,
  borderTop: '1px solid var(--border)',
};

const utilityStripHeading = {
  textAlign: 'center',
  maxWidth: '1000px',
  margin: '0 auto 22px',
};

const utilityStripLabel = {
  color: 'var(--gold-dark)',
  fontWeight: '800',
  fontSize: '12.5px',
  letterSpacing: '1.3px',
};

const utilityStripTitle = {
  color: 'var(--brand)',
  fontSize: 'clamp(20px,2.6vw,26px)',
  margin: '8px 0 0',
};

// Styles for AnnouncementsSection -- now a two-card row: a live list
// of the institution's current notices on the left, and a fixed set
// of real, frequently-needed pages ("Important Links") on the right.
// Both reuse the shared .ih-card class (background/border/radius/
// shadow already defined once in globals.css) for the "elegant design
// card" look asked for, and match the hero's own maxWidth (1240px)
// for a consistent width rhythm down the page.
// Narrowed from the hero's own 1240px -- these two cards read as too
// wide at that width, per feedback after the two-card rework.
const noticesUpdatesSection = {
  maxWidth: '1080px',
  margin: '0 auto',
  padding: '56px 24px',
};

const noticesUpdatesGrid = {
  display: 'grid',
  gap: '28px',
  alignItems: 'start',
};

// A thin gold top accent plus the same hover-lift treatment as the
// Media & Library cards (.uai-lift-card) -- echoing that card
// language even though these cards hold list content rather than one
// static banner image, so the whole homepage's "card" vocabulary
// reads as one consistent system.
const noticesCard = {
  padding: '30px',
  borderTop: '4px solid var(--gold)',
};

const noticesCardHeaderRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
  gap: '12px',
  marginBottom: '10px',
};

const noticesCardTitle = {
  color: 'var(--brand)',
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(19px,2.2vw,23px)',
  margin: '8px 0 0',
};

// A smaller "View All" button sized to sit inside a card header next
// to the title, rather than the full outlineButton used below the
// wider Events & News section heading.
const outlineButtonSmall = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '9px 16px',
  background: 'var(--surface)',
  color: 'var(--brand)',
  textDecoration: 'none',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontWeight: '800',
  fontSize: '12.5px',
  whiteSpace: 'nowrap',
  transition: 'transform .2s ease, box-shadow .2s ease, border-color .2s ease',
};

const announcementsEmptyText = {
  color: 'var(--ink-soft)',
  fontSize: '14.5px',
  lineHeight: 1.6,
  margin: '8px 0 0',
};

const announcementsList = {
  display: 'flex',
  flexDirection: 'column',
  marginTop: '4px',
};

// Each notice as one tappable row -- megaphone icon, title + date
// stacked, trailing arrow -- all shown at once instead of one at a
// time, per the reference layout. Links through to the full
// announcements listing, scrolled to that specific notice.
const announcementsListRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  padding: '14px 0',
  borderBottom: '1px solid var(--border)',
  textDecoration: 'none',
  color: 'inherit',
};

const announcementsRowIcon = {
  flexShrink: 0,
  width: '38px',
  height: '38px',
  borderRadius: '10px',
  background: 'var(--gold-tint)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '16px',
};

const announcementsRowBody = {
  display: 'flex',
  flexDirection: 'column',
  gap: '3px',
  flex: '1 1 auto',
  minWidth: 0,
};

const announcementsRowTitle = {
  color: 'var(--ink)',
  fontSize: '14.5px',
  fontWeight: '700',
  lineHeight: 1.4,
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
};

const announcementsRowDate = {
  color: 'var(--ink-soft)',
  fontSize: '12px',
};

const announcementsRowArrow = {
  flexShrink: 0,
  color: 'var(--gold-dark)',
};

// Real, existing pages -- never placeholder links -- picked for what
// a first-time visitor most often needs next. See IMPORTANT_LINKS
// above AnnouncementsSection.
const importantLinksList = {
  display: 'flex',
  flexDirection: 'column',
  marginTop: '4px',
};

const importantLinksRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  padding: '14px 0',
  borderBottom: '1px solid var(--border)',
  textDecoration: 'none',
  color: 'inherit',
};

const importantLinksRowIcon = {
  flexShrink: 0,
  width: '38px',
  height: '38px',
  borderRadius: '10px',
  background: 'var(--brand-tint)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '16px',
};

const importantLinksRowLabel = {
  flex: '1 1 auto',
  color: 'var(--ink)',
  fontSize: '14.5px',
  fontWeight: '700',
  minWidth: 0,
};

const importantLinksRowArrow = {
  flexShrink: 0,
  color: 'var(--brand)',
};

// Styles for EventsAndNewsSection -- the "three cards, image, title,
// date, a solid Read More button, View All + paging arrows/dots"
// homepage showcase.
const eventsNewsSection = {
  maxWidth: '1240px',
  margin: '0 auto',
  padding: '56px 24px',
};

const eventsNewsHeaderRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
  gap: '16px',
  marginBottom: '28px',
};

const eventsNewsTitle = {
  color: 'var(--brand)',
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(22px,2.8vw,28px)',
  margin: '0 0 6px',
};

const eventsNewsSubtitle = {
  color: 'var(--ink-soft)',
  fontSize: '14.5px',
  lineHeight: 1.6,
  margin: 0,
  maxWidth: '520px',
};

const eventsNewsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
  gap: '24px',
};

// Overrides .ih-card's own padding to 0 (with its own inner padding
// added back just around the text below) so the image can sit flush
// with the card's top and side edges instead of floating inside a
// padded frame -- matching the reference design.
const eventsNewsCard = {
  display: 'flex',
  flexDirection: 'column',
  padding: 0,
  overflow: 'hidden',
  textDecoration: 'none',
  color: 'inherit',
};

const eventsNewsCardImage = {
  height: '170px',
  backgroundColor: 'var(--brand-tint)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--brand)',
  flexShrink: 0,
};

const eventsNewsCardBody = {
  padding: '20px 22px 22px',
  display: 'flex',
  flexDirection: 'column',
  flex: '1 1 auto',
  gap: '14px',
};

// Clamped to 2 lines with a fixed minHeight so every card's date/
// button row lines up along the same baseline across a row, even
// when titles differ in length.
const eventsNewsCardTitle = {
  color: 'var(--ink)',
  fontFamily: 'var(--font-display)',
  fontSize: '16.5px',
  lineHeight: 1.4,
  margin: 0,
  minHeight: '46px',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

const eventsNewsCardFooter = {
  marginTop: 'auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '10px',
  flexWrap: 'wrap',
};

const eventsNewsCardDate = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '12.5px',
  color: 'var(--ink-soft)',
};

const eventsNewsReadMoreBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '9px 16px',
  borderRadius: '8px',
  background: 'var(--brand)',
  color: 'var(--on-accent)',
  fontWeight: '700',
  fontSize: '12.5px',
  whiteSpace: 'nowrap',
};

const eventsNewsControls = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '24px',
};

const eventsNewsArrows = {
  display: 'flex',
  gap: '10px',
};

const eventsNewsArrowBtn = {
  width: '38px',
  height: '38px',
  borderRadius: '50%',
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--brand)',
  fontSize: '18px',
  lineHeight: '1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  padding: 0,
};

const eventsNewsDots = {
  display: 'flex',
  gap: '8px',
};

const eventsNewsDot = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  border: 'none',
  background: 'var(--border)',
  cursor: 'pointer',
  padding: 0,
  transition: 'width 0.2s ease, border-radius 0.2s ease, background 0.2s ease',
};

const eventsNewsDotActive = {
  ...eventsNewsDot,
  width: '22px',
  borderRadius: '5px',
  background: 'var(--gold)',
};

const cardGrid = {
  display: 'grid',
  gridTemplateColumns:
    'repeat(auto-fit,minmax(240px,1fr))',
  gap: '20px',
};

const featureCard = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '16px',
  padding: '28px 26px',
  boxShadow: '0 10px 30px rgba(15,23,42,.05)',
  transition: 'transform .22s ease, box-shadow .22s ease, border-color .22s ease',
};

const featureIcon = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '52px',
  height: '52px',
  borderRadius: '14px',
  background: 'var(--gold-tint, rgba(197,157,95,.14))',
  fontSize: '25px',
  marginBottom: '16px',
};

const featureTitle = {
  color: 'var(--brand)',
  margin: '0 0 8px',
  fontSize: '17.5px',
  fontWeight: '800',
};

const featureText = {
  margin: 0,
  color: 'var(--ink-soft)',
  lineHeight: 1.7,
  fontSize: '13.5px',
};

const greenSection = {
  background:
    'linear-gradient(135deg,var(--brand-deepest),var(--brand),var(--brand-light))',
  color: 'var(--on-accent)',
  position: 'relative',
  overflow: 'hidden',
};

// Purely decorative gold glow sitting behind the content, aria-hidden
// -- gives the flat brand gradient some depth without a texture image.
const academyGlow = {
  position: 'absolute',
  inset: 0,
  background:
    'radial-gradient(ellipse 60% 50% at 85% 0%, rgba(197,157,95,.18) 0%, transparent 60%)',
  pointerEvents: 'none',
};

// Same footprint as sectionInner, but Academy gets its own constant
// so its padding/heading-width can be tuned independently of the
// MEDIA & LIBRARY section that still uses the shared one.
const academySectionInner = {
  maxWidth: '1100px',
  margin: '0 auto',
  padding: '84px 24px',
  textAlign: 'center',
  position: 'relative',
  zIndex: 1,
};

const academyEyebrow = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  color: 'var(--gold-light, var(--gold))',
  fontWeight: '900',
  fontSize: '14.5px',
  letterSpacing: '1.8px',
};

const academyEyebrowDot = {
  width: '7px',
  height: '7px',
  borderRadius: '50%',
  background: 'var(--gold)',
  boxShadow: '0 0 0 4px rgba(197,157,95,.28)',
  flexShrink: 0,
};

const miniFeatureGrid = {
  display: 'grid',
  gridTemplateColumns:
    'repeat(auto-fit,minmax(190px,1fr))',
  gap: '14px',
  margin: '34px auto',
  maxWidth: '880px',
};

const miniFeature = {
  padding: '19px 18px',
  borderRadius: '14px',
  background: 'rgba(255,255,255,.08)',
  border: '1px solid rgba(255,255,255,.14)',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  textAlign: 'left',
  transition: 'transform .22s ease, background .22s ease, border-color .22s ease',
};

const miniFeatureIconWrap = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '40px',
  height: '40px',
  borderRadius: '11px',
  background: 'rgba(255,255,255,.12)',
  fontSize: '20px',
  flexShrink: 0,
};

const goldButton = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '14px 26px',
  borderRadius: '9px',
  background: 'var(--gold)',
  color: 'var(--brand-deepest)',
  textDecoration: 'none',
  fontWeight: '900',
  fontSize: '14.5px',
  boxShadow: '0 12px 28px rgba(0,0,0,.18)',
  transition: 'transform .2s ease, box-shadow .2s ease, filter .2s ease',
};

const splitGrid = {
  display: 'grid',
  gridTemplateColumns:
    'repeat(auto-fit,minmax(300px,1fr))',
  gap: '45px',
  alignItems: 'center',
};

const buttonRow = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
  marginTop: '25px',
};

const buttonRowCenter = {
  display: 'flex',
  justifyContent: 'center',
  gap: '10px',
  flexWrap: 'wrap',
};

const mainButton = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '13px 24px',
  background: 'var(--brand)',
  color: 'var(--on-accent)',
  textDecoration: 'none',
  borderRadius: '9px',
  fontWeight: '800',
  fontSize: '14.5px',
  boxShadow: '0 10px 24px rgba(20,83,45,.18)',
  transition: 'transform .2s ease, box-shadow .2s ease, filter .2s ease',
};

const outlineButton = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '13px 24px',
  background: 'var(--surface)',
  color: 'var(--brand)',
  textDecoration: 'none',
  border: '1px solid var(--border)',
  borderRadius: '9px',
  fontWeight: '800',
  fontSize: '14.5px',
  transition: 'transform .2s ease, box-shadow .2s ease, border-color .2s ease',
};
const pathwayGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
  gap: '20px',
  marginTop: '10px',
};

// Glossy/classical rather than a flat rectangle: a soft top-to-
// bottom gradient instead of a flat fill, a gold-tinted hairline
// border instead of the plain neutral one, and a two-layer shadow
// (a soft drop shadow plus an inset top highlight) for the glossy
// part.
const pathwayCard = {
  display: 'flex',
  flexDirection: 'column',
  background: 'linear-gradient(180deg, var(--surface) 0%, var(--surface-2, #f7f3ea) 100%)',
  border: '1px solid var(--gold-soft, rgba(191,161,74,.28))',
  borderRadius: '15px',
  padding: '26px',
  boxShadow: '0 14px 34px rgba(15,23,42,.08), inset 0 1px 0 rgba(255,255,255,.55)',
  textAlign: 'left',
};

const pathwayCardHeader = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '10px',
};

// whiteSpace:nowrap + flexShrink:0 so the badge text ('Tier 3', etc)
// can never wrap onto two lines when the flex header gets squeezed
// by a longer adjacent title -- paired with pathwayCardTitle's own
// minWidth:0 below, which is the flexbox half of this fix (without
// it, an h3 with no minWidth refuses to shrink and it's a sibling
// that gets squeezed instead). Gradient + inset highlight for the
// same glossy, not-flat look as the card.
const pathwayTierBadge = {
  display: 'inline-block',
  whiteSpace: 'nowrap',
  flexShrink: 0,
  padding: '5px 12px',
  borderRadius: '999px',
  background: 'linear-gradient(135deg, var(--gold-light, #f3dfa0) 0%, var(--gold) 55%, var(--gold-dark) 100%)',
  border: '1px solid rgba(255,255,255,.5)',
  boxShadow: '0 1px 3px rgba(15,23,42,.18), inset 0 1px 0 rgba(255,255,255,.6)',
  color: 'var(--brand-deepest)',
  fontWeight: '900',
  fontSize: '11px',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
};

const pathwayCardTitle = {
  color: 'var(--brand)',
  fontSize: '18px',
  margin: 0,
  minWidth: 0,
};

const pathwayPurpose = {
  color: 'var(--ink-soft)',
  lineHeight: 1.6,
  fontSize: '13.5px',
  margin: '0 0 16px',
};

const pathwayMetaList = {
  margin: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const pathwayMetaRow = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
};

const pathwayMetaLabel = {
  margin: 0,
  color: 'var(--gold-dark)',
  fontWeight: '800',
  fontSize: '10.5px',
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
};

const pathwayMetaValue = {
  margin: 0,
  color: 'var(--ink)',
  fontSize: '13px',
  lineHeight: 1.55,
};

const pathwayNote = {
  margin: '14px 0 0',
  padding: '10px 12px',
  borderRadius: '8px',
  background: 'var(--surface-2, rgba(15,23,42,.04))',
  color: 'var(--ink-soft)',
  fontSize: '12px',
  lineHeight: 1.5,
};

const pathwayCardFooter = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
  marginTop: '18px',
  paddingTop: '16px',
  borderTop: '1px solid var(--border)',
};

const pathwayLinkPrimary = {
  color: 'var(--brand)',
  textDecoration: 'none',
  fontWeight: '800',
  fontSize: '13.5px',
};

const pathwayLinkSecondary = {
  display: 'inline-block',
  padding: '6px 14px',
  borderRadius: '7px',
  background: 'var(--brand)',
  color: 'var(--on-accent)',
  textDecoration: 'none',
  fontWeight: '800',
  fontSize: '13px',
};

// Refined copy column for the Bookstore split layout -- a touch more
// vertical rhythm than the bare splitGrid child used to have, plus an
// eyebrow with a small gold dot marker instead of a bare label.
const bookstoreCopyCol = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const bookstoreEyebrow = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  color: 'var(--gold-dark)',
  fontWeight: '900',
  fontSize: '13px',
  letterSpacing: '1.8px',
};

const bookstoreEyebrowDot = {
  width: '7px',
  height: '7px',
  borderRadius: '50%',
  background: 'var(--gold)',
  boxShadow: '0 0 0 4px rgba(197,157,95,.18)',
  flexShrink: 0,
};

const bookstoreHeading = {
  color: 'var(--brand)',
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(28px,4vw,40px)',
  margin: '12px 0 14px',
  lineHeight: 1.15,
  letterSpacing: '-0.01em',
};

const bookstoreLede = {
  color: 'var(--ink-soft)',
  lineHeight: 1.8,
  fontSize: '15.5px',
  maxWidth: '480px',
  margin: 0,
};

const bookstoreFeature = {
  background:
    'linear-gradient(135deg,var(--brand-deepest),var(--brand))',
  borderRadius: '22px',
  padding: '42px 40px',
  color: 'var(--on-accent)',
  boxShadow:
    '0 20px 50px rgba(20,83,45,.16)',
  position: 'relative',
  overflow: 'hidden',
};

const bookstoreFeatureIconWrap = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '58px',
  height: '58px',
  borderRadius: '16px',
  background: 'rgba(255,255,255,.14)',
  border: '1px solid rgba(255,255,255,.22)',
  marginBottom: '18px',
};

const bookstoreFeatureFootnote = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginTop: '22px',
  paddingTop: '18px',
  borderTop: '1px solid rgba(255,255,255,.18)',
  color: 'rgba(219,234,254,.85)',
  fontSize: '12.5px',
  fontWeight: '700',
  letterSpacing: '0.03em',
};

const featureDarkTitle = {
  fontSize: '25px',
  margin: '0 0 12px',
  lineHeight: 1.25,
};

const featureDarkText = {
  color: '#dbeafe',
  lineHeight: 1.75,
  fontSize: '14.5px',
};

const lightSection = {
  background: '#f0fdf4',
  borderTop: '1px solid #dcfce7',
  borderBottom: '1px solid var(--border)',
};

// Two-card layout for the MEDIA & LIBRARY section -- one dedicated
// card per section instead of a single block with two inline buttons,
// so the layout itself shows what the copy already says ("two
// separate, dedicated sections").
const mediaLibraryGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))',
  gap: '24px',
  maxWidth: '800px',
  margin: '38px auto 0',
  textAlign: 'left',
};

// A card is either "icon mode" (default emoji, padded body only) or
// "picture mode" (an admin-uploaded image as a banner across the top,
// body padded underneath) -- overflow:hidden clips the banner's image
// to the card's own rounded corners in picture mode, and does nothing
// in icon mode.
const mediaLibraryCard = {
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '18px',
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  textDecoration: 'none',
  overflow: 'hidden',
  boxShadow: '0 8px 24px rgba(15,23,42,.04)',
  transition: 'transform .22s ease, box-shadow .22s ease, border-color .22s ease',
};

const mediaLibraryCardBanner = {
  width: '100%',
  height: '150px',
  // The background COLOR must come before the size/position/repeat
  // longhands below -- the `background` shorthand resets any longhand
  // it doesn't itself specify, so declaring it last would silently
  // wipe out backgroundSize/Position/Repeat.
  background: 'var(--paper)',
  // 'contain', not 'cover' -- same reasoning as the hero banner: an
  // admin-uploaded picture is shown in full rather than cropped to
  // fill the box. The paper-toned background above fills any
  // letterboxing instead of leaving a hard white gap.
  backgroundSize: 'contain',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  borderBottom: '1px solid var(--border)',
};

const mediaLibraryIcon = {
  fontSize: '28px',
  width: '54px',
  height: '54px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '14px',
  background: 'var(--gold-tint, rgba(197,157,95,.14))',
  margin: '28px 28px 0',
};

const mediaLibraryCardBody = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  padding: '18px 28px 28px',
  flex: 1,
};

const mediaLibraryCardTitle = {
  color: 'var(--brand)',
  fontSize: '20px',
  fontWeight: '800',
  margin: '0 0 8px',
};

const mediaLibraryCardText = {
  color: 'var(--ink-soft)',
  lineHeight: 1.7,
  margin: '0 0 18px',
  fontSize: '14.5px',
};

const mediaLibraryCardLink = {
  color: 'var(--gold-dark)',
  fontWeight: '800',
  fontSize: '14px',
  marginTop: 'auto',
};

// OUR APPROACH -- connected step sequence styling. Falls back to a
// stacked single column with no connector on narrow screens; see the
// .uai-approach-step / .uai-approach-connector responsive rules in
// this page's own <style jsx> block.
const approachStepRow = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3,1fr)',
  gap: '8px',
  maxWidth: '980px',
  margin: '0 auto',
};

const approachStep = {
  padding: '0 18px',
};

const approachStepNumberRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  marginBottom: '18px',
};

const approachStepNumber = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  border: '2px solid var(--gold)',
  color: 'var(--brand)',
  fontWeight: '900',
  fontSize: '16px',
};

const approachStepConnector = {
  flex: 1,
  height: '2px',
  background: 'linear-gradient(90deg, var(--gold), transparent)',
};

const approachStepTitle = {
  color: 'var(--brand)',
  fontSize: '19px',
  fontWeight: '800',
  margin: '0 0 10px',
};

const approachStepText = {
  color: 'var(--ink-soft)',
  lineHeight: 1.7,
  margin: 0,
};

const footerStyle = {
  background: '#020617',
  color: '#cbd5e1',
  borderTop: '4px solid var(--gold)',
};

const footerInner = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '65px 24px 30px',
};

const footerGrid = {
  display: 'grid',
  gridTemplateColumns:
    'minmax(250px,1.5fr) repeat(auto-fit,minmax(160px,1fr))',
  gap: '42px',
};

const footerBrand = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const footerLogo = {
  width: '42px',
  height: '42px',
  borderRadius: '10px',
  background: 'var(--brand)',
  border: '1px solid var(--gold)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--gold)',
  fontWeight: '900',
  fontSize: '22px',
};

const footerBrandName = {
  color: 'var(--on-accent)',
  fontSize: '19px',
  fontWeight: '900',
};

const footerBrandTagline = {
  fontSize: '9px',
  color: 'var(--gold)',
  letterSpacing: '1px',
};

const footerText = {
  lineHeight: 1.8,
  fontSize: '14px',
  maxWidth: '390px',
  color: 'var(--on-dark-soft)',
};

const footerTextSmall = {
  fontSize: '13px',
  lineHeight: 1.6,
  color: 'var(--on-dark-soft)',
};

const footerArabic = {
  fontFamily: 'var(--font-arabic-display)',
  color: 'var(--gold)',
  fontSize: '19px',
  marginBottom: '0',
};

const footerQuote = {
  color: 'var(--on-dark-soft)',
  fontSize: '13px',
  lineHeight: 1.7,
  margin: '8px 0 0',
  maxWidth: '390px',
};

const footerPrinciple = {
  marginTop: '16px',
  paddingTop: '16px',
  borderTop: '1px solid var(--on-dark-border)',
  maxWidth: '390px',
};

const footerPrincipleTitle = {
  color: 'var(--paper)',
  fontSize: '13px',
};

const footerPrincipleText = {
  margin: '7px 0 0',
  color: 'var(--on-dark-soft)',
  fontSize: '12px',
  lineHeight: 1.7,
};

const footerHeading = {
  margin: '0 0 17px',
  color: 'var(--paper)',
  fontSize: '14px',
  fontWeight: '900',
};

const footerColumnLinks = {
  display: 'flex',
  flexDirection: 'column',
  gap: '11px',
};

const footerLink = {
  color: 'var(--on-dark-soft)',
  textDecoration: 'none',
  fontSize: '13px',
};

const footerButton = {
  border: 'none',
  background: 'none',
  padding: 0,
  color: 'var(--on-dark-soft)',
  fontSize: '13px',
  cursor: 'pointer',
  fontFamily: 'inherit',
  textAlign: 'left',
};

const socialGrid = {
  display: 'flex',
  gap: '9px',
  flexWrap: 'wrap',
  marginTop: '18px',
};

const socialButton = {
  width: '36px',
  height: '36px',
  borderRadius: '9px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textDecoration: 'none',
  background: 'rgba(248,247,242,0.06)',
  border: '1px solid var(--on-dark-border)',
  color: 'var(--paper)',
  fontWeight: '900',
};

const footerContactStrip = {
  marginTop: '45px',
  padding: '20px',
  borderRadius: '12px',
  background: 'rgba(248,247,242,0.05)',
  border: '1px solid var(--on-dark-border)',
  display: 'flex',
  gap: '25px',
  flexWrap: 'wrap',
  justifyContent: 'space-around',
  fontSize: '12px',
  color: 'var(--on-dark-soft)',
};

const footerBottom = {
  marginTop: '30px',
  paddingTop: '22px',
  borderTop: '1px solid var(--on-dark-border)',
  display: 'flex',
  justifyContent: 'space-between',
  gap: '15px',
  flexWrap: 'wrap',
  fontSize: '12px',
  color: 'var(--on-dark-soft)',
};

const modalOverlay = {
  position: 'fixed',
  inset: 0,
  zIndex: 1000,
  background: 'rgba(2,6,23,.78)',
  backdropFilter: 'blur(6px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
};

const modalBox = {
  width: '100%',
  maxWidth: '760px',
  maxHeight: '88vh',
  overflowY: 'auto',
  background: 'var(--surface)',
  borderRadius: '18px',
  boxShadow: '0 30px 80px rgba(0,0,0,.35)',
};

const modalHeader = {
  padding: '22px 25px',
  background:
    'linear-gradient(135deg,var(--brand-deepest),var(--brand))',
  color: 'var(--on-accent)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  position: 'sticky',
  top: 0,
};

const modalTitle = {
  margin: 0,
  fontFamily: 'var(--font-display)',
  fontSize: '24px',
};

const closeButton = {
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  border: '1px solid rgba(255,255,255,.35)',
  background: 'rgba(255,255,255,.08)',
  color: 'var(--on-accent)',
  fontSize: '22px',
  cursor: 'pointer',
};

const modalContent = {
  padding: '30px',
  color: 'var(--ink-soft)',
  lineHeight: 1.8,
  fontSize: '14px',
};

const quoteBox = {
  marginTop: '20px',
  padding: '20px',
  background: '#f0fdf4',
  borderLeft: '4px solid var(--gold)',
  borderRadius: '8px',
  color: 'var(--brand)',
  lineHeight: 1.8,
};

