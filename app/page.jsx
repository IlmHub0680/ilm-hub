'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
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

        setIslamicDate(`${hijriFormatter.format(now)} AH`);
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

          setIslamicDate(`${fallbackFormatter.format(now)} AH`);
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
     MOBILE MENU
  ========================================================= */

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /* =========================================================
     FOOTER MODALS
  ========================================================= */

  const [footerModal, setFooterModal] = useState(null);

  /* =========================================================
     CART
  ========================================================= */

  const [cartCount] = useState(0);

  /* =========================================================
     FOOTER CONTENT
  ========================================================= */

  const footerContent = {
    about: {
      title: 'About Ilm-Hub Institute',
      content: (
        <>
          <p>
            <strong>Ilm-Hub Institute</strong> is an educational institution
            dedicated to the pursuit, preservation, understanding, and
            responsible transmission of beneficial Islamic knowledge.
          </p>

          <p>
            Our aim is to provide structured and disciplined learning in
            Quranic sciences, Arabic language, Hadith, Fiqh, Aqidah, Tajwid,
            Seerah, and other foundational Islamic disciplines — rooted firmly
            in the Quran and Sunnah, grounded in the rich scholarly tradition,
            and delivered through an accessible, systematic, and
            transformative academic approach.
          </p>

          <p>
            We believe that beneficial knowledge must be pursued with
            sincerity, sound methodology, humility, discipline, and respect
            for the scholarly tradition, while cultivating students who embody
            good character, live by what they learn, and use their knowledge
            in service to their communities.
          </p>

          <div style={quoteBox}>
            <strong>Our guiding principle</strong>

            <br />

            <span
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: '21px',
              }}
            >
              وَقُلْ رَبِّ زِدْنِي عِلْمًا
            </span>

            <br />

            <span style={{ fontSize: '15px' }}>
              “And say: My Lord, increase me in knowledge.”
            </span>

            <br />

            <span
              style={{
                display: 'block',
                marginTop: '10px',
                fontSize: '14px',
              }}
            >
              Knowledge is a religion. We seek to learn it sincerely, understand
              it responsibly, and share it beneficially.
            </span>
          </div>
        </>
      ),
    },

    resources: {
      title: 'Student Resources',
      content: (
        <>
          <p>
            Ilm-Hub provides resources designed to help students remain
            organized, consistent and purposeful in their pursuit of
            knowledge.
          </p>

          <div style={resourceGridStyle}>
            <ResourceCard
              icon="📚"
              title="Course Materials"
              text="Access recommended texts, course information and learning materials through your programme."
            />

            <ResourceCard
              icon="📖"
              title="Digital Library"
              text="Explore books and educational publications available through the Ilm-Hub Bookstore."
              link="/bookstore"
            />

            <ResourceCard
              icon="🎓"
              title="Student Guidance"
              text="Develop a regular study routine, attend lessons consistently and maintain good academic discipline."
            />

            <ResourceCard
              icon="📝"
              title="Academic Support"
              text="Contact the institute for questions relating to programmes, admissions or academic matters."
              action={() => setFooterModal('contact')}
            />
          </div>
        </>
      ),
    },

    faq: {
      title: 'Frequently Asked Questions',
      content: (
        <>
          <Faq
            question="What does Ilm-Hub Institute teach?"
            answer="Our academic areas include Qur'anic sciences, Arabic language, Tajwid, Hadith, Fiqh, Usul al-Fiqh, Aqidah, Seerah, Islamic methodology, and other foundational Islamic disciplines."
          />

          <Faq
            question="How can I view the academic programmes?"
            answer="Use the Academics or Programmes links to view the institute's dedicated Academic Programmes page and explore the available programmes."
          />

          <Faq
            question="Can I study online?"
            answer="Selected programmes and educational resources may be available digitally. Please check the relevant programme page or contact the institute for current availability."
          />

          <Faq
            question="How do I apply for admission?"
            answer="Use the Apply for Admission button or visit the Admissions section to begin the application process."
          />

          <Faq
            question="Can I purchase Islamic books from Ilm-Hub?"
            answer="Yes. Our Academic Bookstore provides access to selected Islamic academic texts, books, and educational publications. Some books and resources may be subject to applicable fees."
          />

          <Faq
            question="Can authors and publishers submit their books?"
            answer="Yes. Authors and publishers may use the Sell Your Books portal to submit their publications for consideration."
          />

          <Faq
            question="Does every programme provide accreditation?"
            answer="Not necessarily. Accreditation, certification, and academic recognition depend on the specific programme and the institute's applicable academic policies."
          />

          <Faq
            question="Are all educational resources free?"
            answer="Some educational resources may be available free of charge, while other programmes, books, or services may have applicable fees."
          />

          <Faq
            question="How can I contact Ilm-Hub Institute?"
            answer="Use the Contact section in the footer or the institute's official contact channels for enquiries regarding admissions, programmes, academic matters, bookstore services, authorship submissions, partnerships, and general enquiries."
          />
        </>
      ),
    },

    privacy: {
      title: 'Privacy Policy',
      content: (
        <>
          <p>
            Ilm-Hub Institute respects the privacy of students, applicants,
            authors, customers, and visitors to its website.
          </p>

          <p>
            Information submitted through admission forms, enquiries,
            bookstore purchases, or other institutional services is collected
            and used only for legitimate institutional purposes.
          </p>

          <p>
            We aim to protect personal information and do not intentionally
            sell personal information to third parties.
          </p>

          <p>
            Payment information should be processed through appropriate secure
            payment providers where applicable. Users should never submit
            passwords, payment credentials, or other highly sensitive
            information through ordinary website forms.
          </p>

          <p>
            While we take reasonable measures to protect information, no
            internet transmission or online system can be guaranteed to be
            completely secure.
          </p>
        </>
      ),
    },

    terms: {
      title: 'Terms of Use',
      content: (
        <>
          <p>
            By accessing the Ilm-Hub website, visitors agree to use the
            platform responsibly, lawfully, and in a manner consistent with
            the institute's educational purpose.
          </p>

          <p>
            Academic materials, publications, logos, written content, and
            other institutional materials may not be reproduced, redistributed,
            or commercially exploited without appropriate permission.
          </p>

          <p>
            Users are responsible for providing accurate information when
            submitting applications, purchases, enquiries, or other forms.
          </p>

          <p>
            Ilm-Hub may update programmes, schedules, prices, availability,
            policies, and website content when necessary.
          </p>

          <p>
            Information provided on this website is intended for general
            educational and institutional purposes and should not be
            interpreted as a substitute for personalised scholarly, legal,
            medical, or other professional advice.
          </p>
        </>
      ),
    },

    refund: {
      title: 'Refund Policy',
      content: (
        <>
          <p>
            Ilm-Hub Institute aims to provide clear information about
            programme fees, books, digital resources, and other purchases
            before payment is made.
          </p>

          <p>
            Refund eligibility may depend on the nature of the purchase,
            programme, digital delivery or access status, physical shipment
            status, and applicable institutional policy.
          </p>

          <p>
            Digital products that have already been delivered or accessed may
            be subject to different refund conditions from physical books or
            other products.
          </p>

          <p>
            If a physical item arrives damaged, incorrect, or materially
            different from the purchased item, customers should contact the
            institute promptly with the relevant order information.
          </p>

          <p>
            For specific refund requests, customers should contact the
            institute directly with their order or programme details before
            initiating a dispute through a payment provider.
          </p>
        </>
      ),
    },

    contact: {
      title: 'Contact Ilm-Hub Institute',
      content: (
        <>
          <p>
            We welcome enquiries from prospective students, current students,
            parents, scholars, authors, publishers, and educational partners.
          </p>

          <div style={contactGridStyle}>
            <ContactItem
              icon="📍"
              title="Institute Address"
              text="Ilm-Hub Institute, [Street / Building Name], [Accra], [Ghana]"
            />

            <ContactItem
              icon="📮"
              title="P.O. Box"
              text="P.O. Box [170], [Accra], [Ghana]"
            />

            <ContactItem
              icon="☎️"
              title="Telephone"
              text="+233 1234568"
            />

            <ContactItem
              icon="💬"
              title="WhatsApp"
              text="+000 000 000 0000"
            />

            <ContactItem
              icon="✉️"
              title="Email"
              text="info@ilmhub.org"
            />

            <ContactItem
              icon="🎓"
              title="Admissions"
              text="admissions@ilmhub.org"
            />

            <ContactItem
              icon="📚"
              title="Bookstore"
              text="bookstore@ilmhub.org"
            />

            <ContactItem
              icon="🕘"
              title="Office Hours"
              text="Monday – Friday: 8:00 AM – 5:00 PM"
            />
          </div>

          <p style={{ marginTop: '20px' }}>
            <strong>General enquiries:</strong> Please use the contact
            information above for admissions, academic programmes, bookstore
            enquiries, partnerships, authorship submissions, and general
            institutional matters.
          </p>
        </>
      ),
    },
  };

  /* =========================================================
     SOCIAL LINKS
  ========================================================= */

  const socialLinks = [
    {
      name: 'Facebook',
      icon: 'f',
      url: 'https://www.facebook.com/',
    },
    {
      name: 'YouTube',
      icon: '▶',
      url: 'https://www.youtube.com/',
    },
    {
      name: 'X',
      icon: '𝕏',
      url: 'https://x.com/',
    },
    {
      name: 'Telegram',
      icon: '✈',
      url: 'https://t.me/',
    },
  ];

  return (
    <div style={pageStyle}>

      {/* =====================================================
          TOP INFORMATION BAR
      ===================================================== */}

      <div style={topBar}>
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '15px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <strong>{currentDate}</strong>

            <span
              style={{
                margin: '0 8px',
                opacity: 0.5,
              }}
            >
              |
            </span>

            <strong>{currentTime}</strong>
          </div>

          <div>
            <span style={{ color: '#e7d48b' }}>
              <strong>Hijri:</strong>
            </span>{' '}

            <strong>{islamicDate}</strong>

            <span
              style={{
                marginLeft: '6px',
                opacity: 0.65,
                fontSize: '10px',
              }}
            >
              (Umm al-Qura)
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header style={headerStyle}>
        <div style={headerInner}>

          <Link href="/" style={brandStyle}>
            <div style={logoStyle}>
              ع
            </div>

            <div>
              <div style={brandName}>
                Ilm-Hub
              </div>

              <div style={brandSubtitle}>
                Institute of Islamic Studies
              </div>
            </div>
          </Link>

          <nav style={navStyle}>

            <NavLink href="/">
              Home
            </NavLink>

            <NavLink href="/programs">
              Academics
            </NavLink>

            <NavLink href="/bookstore">
              Bookstore
            </NavLink>

            <NavLink href="/lectures">
              Lectures
            </NavLink>

            <NavLink href="/admission">
              Admissions
            </NavLink>

          </nav>

          <div style={headerActions}>

            <Link
              href="/bookstore"
              style={cartButton}
            >
              🛒 {cartCount}
            </Link>

            <Link
              href="/login"
              style={loginButton}
            >
              Login
            </Link>

          </div>

        </div>

        {/* MOBILE NAVIGATION */}

        <div
          style={{
            display: 'none',
          }}
          className="mobile-menu-placeholder"
        >
          {mobileMenuOpen && (
            <div>
              <Link href="/" style={mobileNavLink}>
                Home
              </Link>

              <Link href="/programs" style={mobileNavLink}>
                Academics
              </Link>

              <Link href="/bookstore" style={mobileNavLink}>
                Bookstore
              </Link>

              <Link href="/lectures" style={mobileNavLink}>
                Lectures
              </Link>

              <Link href="/admission" style={mobileNavLink}>
                Admissions
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section style={heroStyle}>

        <div style={heroOverlay} />

        <div style={heroInner}>

          <div style={heroBadge}>
            KNOWLEDGE • CHARACTER • EXCELLENCE
          </div>

          <h1 style={heroTitle}>
            Excellence in Islamic Studies & Qur'anic Sciences
          </h1>

          <p style={heroText}>
            A structured environment for students seeking authentic,
            beneficial and disciplined Islamic knowledge through qualified
            instruction, classical texts, modern learning resources and academic programmes.
          </p>

          {/* HERO BUTTONS */}

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '20px',
              flexWrap: 'wrap',
              width: '100%',
              marginTop: '10px',
            }}
          >

            <Link
              href="/admission"
              style={heroPrimaryButton}
            >
              Apply for Admission →
            </Link>

            <Link
              href="/author-portal/admission"
              style={heroSecondaryButton}
            >
              📚 Purchase & Sell Your Books
            </Link>

            <Link
              href="/admin"
              style={heroSecondaryButton}
            >
              ⚙ Admin Portal
            </Link>

          </div>

          {/* HERO FEATURES UNDER BUTTONS */}

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '21px',
              flexWrap: 'wrap',
              marginTop: '29px',
              color: '#c4d4cb',
              fontSize: '14px',
              textAlign: 'center',
            }}
          >

            <span>✓ Structured curriculum</span>
            <span>✓ Online learning</span>
            <span>✓ Academic resources</span>
            <span>✓ Global access</span>

          </div>

        </div>
      </section>

      {/* =====================================================
          WELCOME / INSTITUTE INTRODUCTION
      ===================================================== */}

      <section style={sectionStyle}>

        <div style={headingContainer}>

          <span style={goldLabel}>
            WELCOME TO ILM-HUB
          </span>

          <h2 style={sectionTitle}>
            A place to seek knowledge with sincerity
          </h2>

          <p style={sectionDescription}>
            Ilm-Hub Institute brings together structured academic learning,
            classical Islamic scholarship, digital resources, and a community
            committed to beneficial knowledge, upright character, and lifelong
            learning.
          </p>

        </div>

        <div style={cardGrid}>

          <FeatureCard
            icon="📚"
            title="Structured Learning"
            text="Progress through carefully organized academic programmes and courses designed to build knowledge systematically."
          />

          <FeatureCard
            icon="🕌"
            title="Islamic Scholarship"
            text="Engage with the Qur'an, Sunnah, classical texts, and established Islamic disciplines through sound scholarly tradition."
          />

          <FeatureCard
            icon="🎓"
            title="Student Development"
            text="Develop sound knowledge, disciplined study habits, research ability, humility, and beneficial character."
          />

          <FeatureCard
            icon="🌍"
            title="Learning Without Borders"
            text="Access educational opportunities and digital resources designed to support students wherever they are."
          />

        </div>
      </section>

      {/* =====================================================
          ACADEMICS / PROGRAMMES
      ===================================================== */}

      <section style={greenSection}>

        <div style={sectionInner}>

          <span style={goldLabel}>
            ACADEMICS
          </span>

          <h2 style={sectionTitleWhite}>
            Explore Our Academic Programmes
          </h2>

          <p style={whiteDescription}>
            Explore our academic departments, programmes, courses, and areas
            of Islamic study, rooted in the Qur'an and Sunnah and presented
            through structured and disciplined learning.
          </p>

          <div style={miniFeatureGrid}>

            <MiniFeature
              icon="📖"
              text="Qur'anic Sciences"
            />

            <MiniFeature
              icon="🗣️"
              text="Arabic Language"
            />

            <MiniFeature
              icon="📜"
              text="Hadith Studies"
            />

            <MiniFeature
              icon="⚖️"
              text="Fiqh & Usul"
            />

            <MiniFeature
              icon="☪️"
              text="Aqidah"
            />

            <MiniFeature
              icon="🎙️"
              text="Tajwid & Recitation"
            />

            <MiniFeature
              icon="☝️"
              text="Tauheed (Monotheism)"
            />

            <MiniFeature
              icon="🌱"
              text="Tarbiyah (Education)"
            />
          </div>

          <Link
            href="/programs"
            style={goldButton}
          >
            Explore Academic Departments →
          </Link>

        </div>

      </section>

      {/* =====================================================
          BOOKSTORE
      ===================================================== */}

      <section style={sectionStyle}>

        <div style={splitGrid}>

          <div>

            <span style={goldLabel}>
              ILM-HUB BOOKSTORE
            </span>

            <h2
              style={{
                ...sectionTitle,
                textAlign: 'left',
              }}
            >
              Academic Bookstore
            </h2>

            <p
              style={{
                ...sectionDescription,
                textAlign: 'left',
                margin: '0',
              }}
            >
              Explore selected Islamic books, classical texts, student
              resources, workbooks and educational publications.
            </p>

            <div style={buttonRow}>

              <Link
                href="/bookstore"
                style={mainButton}
              >
                Visit Academic Bookstore →
              </Link>

              <Link
                href="/author-portal/admission"
                style={outlineButton}
              >
                Purchase & Sell Your Books
              </Link>

            </div>

          </div>

          <div style={bookstoreFeature}>

            <div style={{ fontSize: '50px' }}>
              📚
            </div>

            <h3 style={featureDarkTitle}>
              Beneficial Knowledge
            </h3>

            <p style={featureDarkText}>
              Quality books are companions for the serious student. Explore
              our dedicated bookstore for academic and Islamic publications.
            </p>

          </div>

        </div>

      </section>

      {/* =====================================================
          LECTURES
      ===================================================== */}

      <section style={lightSection}>

        <div style={sectionInner}>

          <span style={goldLabel}>
            LECTURES & MEDIA
          </span>

          <h2 style={sectionTitle}>
            Learn, Listen & Revisit
          </h2>

          <p style={sectionDescription}>
            Recorded lessons, Khutbahs, Mutun Al-Ilmiyyah, Manzumat and
            educational programmes are now organized inside the dedicated
            Lectures section.
          </p>

          <Link
            href="/lectures"
            style={mainButton}
          >
            Open Lectures & Media →
          </Link>

        </div>

      </section>

      {/* =====================================================
          WHY ILM-HUB
      ===================================================== */}

      <section style={sectionStyle}>

        <div style={headingContainer}>

          <span style={goldLabel}>
            OUR APPROACH
          </span>

          <h2 style={sectionTitle}>
            More than a website — a learning environment
          </h2>

          <p style={sectionDescription}>
            We aim to make the pursuit of Islamic knowledge organized,
            accessible, responsible and beneficial.
          </p>

        </div>

        <div style={infoGrid}>

          <InfoBox
            number="01"
            title="Authentic Foundations"
            text="Begin with foundational disciplines before progressing into advanced studies."
          />

          <InfoBox
            number="02"
            title="Structured Programmes"
            text="Study through clearly defined academic areas rather than disconnected lessons."
          />

          <InfoBox
            number="03"
            title="Responsible Scholarship"
            text="Approach Islamic knowledge with sincerity, humility, discipline and respect for scholarship."
          />

        </div>

      </section>

      {/* =====================================================
          CTA
      ===================================================== */}

      <section style={ctaSection}>

        <div style={ctaInner}>

          <div style={arabic}>
            BISMILLAH • SEEK KNOWLEDGE • SERVE WITH EXCELLENCE
          </div>

          <h2 style={ctaTitle}>
            Begin Your Journey of Knowledge
          </h2>

          <p style={whiteDescription}>
            Explore academic programmes, educational resources, lectures and
            admissions opportunities.
          </p>

          <div style={buttonRowCenter}>

            <Link
              href="/admission"
              style={heroPrimaryButton}
            >
              Apply for Admission
            </Link>

            <Link
              href="/programs"
              style={heroSecondaryButton}
            >
              Explore Programmes
            </Link>

          </div>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer style={footerStyle}>

        <div style={footerInner}>

          <div style={footerGrid}>

            {/* ABOUT */}

            <div>

              <div style={footerBrand}>

                <div style={footerLogo}>
                  ع
                </div>

                <div>
                  <div style={footerBrandName}>
                    Ilm-Hub Institute
                  </div>

                  <div style={footerBrandTagline}>
                    SEEK • LEARN • BENEFIT
                  </div>
                </div>

              </div>

              <p style={footerText}>
                An institute dedicated to beneficial Islamic knowledge,
                structured learning, scholarly study and the development of
                students who combine knowledge with sound character.
              </p>

              <p style={footerArabic}>
                وَقُلْ رَبِّ زِدْنِي عِلْمًا
              </p>

              <p
                style={{
                  color: '#94a3b8',
                  fontSize: '13px',
                  lineHeight: 1.7,
                  margin: '8px 0 0',
                  maxWidth: '390px',
                }}
              >
                “And say: My Lord, increase me in knowledge.”
              </p>

              <div
                style={{
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid #1e293b',
                  maxWidth: '390px',
                }}
              >

                <strong
                  style={{
                    color: '#f8fafc',
                    fontSize: '13px',
                  }}
                >
                  Our guiding principle
                </strong>

                <p
                  style={{
                    margin: '7px 0 0',
                    color: '#94a3b8',
                    fontSize: '12px',
                    lineHeight: 1.7,
                  }}
                >
                  Knowledge is a trust. We seek to learn it sincerely,
                  understand it responsibly, and share it beneficially.
                </p>

              </div>

            </div>

            {/* ACADEMICS */}

            <FooterColumn title="Academics">

              <FooterLink href="/programs">
                Academic Departments
              </FooterLink>

              <FooterLink href="/programs">
                Programmes
              </FooterLink>

              <FooterLink href="/admission">
                Admissions
              </FooterLink>

              <FooterLink href="/lectures">
                Lectures & Media
              </FooterLink>

            </FooterColumn>

            {/* RESOURCES */}

            <FooterColumn title="Resources">

              <FooterButton
                onClick={() => setFooterModal('resources')}
              >
                Student Resources
              </FooterButton>

              <FooterLink href="/bookstore">
                Bookstore
              </FooterLink>

              <FooterLink href="/author-portal/admission">
                Purchase & Sell Your Books
              </FooterLink>

              <FooterLink href="/bookstore">
                Digital Library
              </FooterLink>

              <FooterButton
                onClick={() => setFooterModal('faq')}
              >
                Frequently Asked Questions
              </FooterButton>

            </FooterColumn>

            {/* INSTITUTE */}

            <FooterColumn title="Institute">

              <FooterButton
                onClick={() => setFooterModal('about')}
              >
                About Ilm-Hub
              </FooterButton>

              <FooterButton
                onClick={() => setFooterModal('contact')}
              >
                Contact
              </FooterButton>

              <FooterButton
                onClick={() => setFooterModal('privacy')}
              >
                Privacy Policy
              </FooterButton>

              <FooterButton
                onClick={() => setFooterModal('terms')}
              >
                Terms of Use
              </FooterButton>

              <FooterButton
                onClick={() => setFooterModal('refund')}
              >
                Refund Policy
              </FooterButton>

            </FooterColumn>

            {/* FOLLOW US */}

            <div>

              <h3 style={footerHeading}>
                Follow Us
              </h3>

              <p style={footerTextSmall}>
                Stay connected with Ilm-Hub for lectures, announcements,
                educational content, new programmes, and institute updates.
              </p>

              <div style={socialGrid}>

                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Follow Ilm-Hub on ${social.name}`}
                    aria-label={`Follow Ilm-Hub on ${social.name}`}
                    style={socialButton}
                  >
                    {social.icon}
                  </a>
                ))}

              </div>

            </div>

          </div>

          {/* FOOTER CONTACT STRIP */}

          <div style={footerContactStrip}>

            <div>
              <span>📍</span>
              <strong> Address:</strong> [Accra-Ghana]
            </div>

            <div>
              <span>☎️</span>
              <strong> Phone:</strong> +233 561 9175 70
            </div>

            <div>
              <span>✉️</span>
              <strong> Email:</strong> info@ilmhub.org
            </div>

            <div>
              <span>🎓</span>
              <strong> Academic Enquiries:</strong>{' '}
              admissions@ilmhub.org
            </div>

          </div>

          {/* FOOTER BOTTOM */}

          <div style={footerBottom}>

            <div>
              © {new Date().getFullYear()} Ilm-Hub Institute. All rights
              reserved.
            </div>

            <div>
              Knowledge is a trust. Character is its companion.
            </div>

          </div>

        </div>

      </footer>

      {/* =====================================================
          MODAL
      ===================================================== */}

      {footerModal && footerContent[footerModal] && (

        <div
          onClick={() => setFooterModal(null)}
          style={modalOverlay}
        >

          <div
            onClick={(e) => e.stopPropagation()}
            style={modalBox}
          >

            <div style={modalHeader}>

              <h2 style={modalTitle}>
                {footerContent[footerModal].title}
              </h2>

              <button
                onClick={() => setFooterModal(null)}
                style={closeButton}
                aria-label="Close"
              >
                ×
              </button>

            </div>

            <div style={modalContent}>
              {footerContent[footerModal].content}
            </div>

          </div>

        </div>

      )}

    </div>
  );
}

/* ============================================================
   COMPONENTS
============================================================ */

function NavLink({ href, children }) {
  return (
    <Link href={href} style={navLink}>
      {children}
    </Link>
  );
}

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

function FeatureCard({ icon, title, text }) {
  return (
    <div style={featureCard}>

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

function MiniFeature({ icon, text }) {
  return (
    <div style={miniFeature}>

      <span style={{ fontSize: '25px' }}>
        {icon}
      </span>

      <strong>
        {text}
      </strong>

    </div>
  );
}

function InfoBox({ number, title, text }) {
  return (
    <div style={infoBox}>

      <div style={infoNumber}>
        {number}
      </div>

      <h3 style={infoTitle}>
        {title}
      </h3>

      <p style={infoText}>
        {text}
      </p>

    </div>
  );
}

function ResourceCard({
  icon,
  title,
  text,
  link,
  action,
}) {
  return (
    <div style={resourceCard}>

      <div style={{ fontSize: '28px' }}>
        {icon}
      </div>

      <h4
        style={{
          color: '#14532d',
          marginBottom: '8px',
        }}
      >
        {title}
      </h4>

      <p
        style={{
          color: '#64748b',
          lineHeight: 1.6,
        }}
      >
        {text}
      </p>

      {link && (
        <Link
          href={link}
          style={resourceLink}
        >
          Open →
        </Link>
      )}

      {action && (
        <button
          onClick={action}
          style={resourceAction}
          type="button"
        >
          Contact Institute →
        </button>
      )}

    </div>
  );
}

function ContactItem({ icon, title, text }) {
  return (
    <div style={contactItem}>

      <div style={contactIcon}>
        {icon}
      </div>

      <div>

        <strong
          style={{
            color: '#14532d',
          }}
        >
          {title}
        </strong>

        <div
          style={{
            color: '#64748b',
            fontSize: '13px',
            marginTop: '4px',
          }}
        >
          {text}
        </div>

      </div>

    </div>
  );
}

function Faq({ question, answer }) {
  return (
    <details style={faqBox}>

      <summary style={faqQuestion}>
        {question}
      </summary>

      <p style={faqAnswer}>
        {answer}
      </p>

    </details>
  );
}

/* ============================================================
   STYLES
============================================================ */

const pageStyle = {
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  background: '#f8fafc',
  color: '#1e293b',
  minHeight: '100vh',
};

const topBar = {
  background:
    'linear-gradient(90deg,#052e16,#14532d,#052e16)',
  color: '#e2e8f0',
  padding: '9px 20px',
  fontSize: '12px',
};

const headerStyle = {
  position: 'sticky',
  top: 0,
  zIndex: 100,
  background: 'rgba(255,255,255,.97)',
  backdropFilter: 'blur(12px)',
  borderBottom: '1px solid #e2e8f0',
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

const logoStyle = {
  width: '44px',
  height: '44px',
  borderRadius: '12px',
  background: 'linear-gradient(135deg,#14532d,#166534)',
  color: '#c59d5f',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '24px',
  fontWeight: '900',
  border: '1px solid rgba(197,157,95,.5)',
};

const brandName = {
  fontSize: '21px',
  fontWeight: '900',
  color: '#14532d',
};

const brandSubtitle = {
  fontSize: '10px',
  color: '#a16207',
  fontWeight: '800',
  letterSpacing: '1.2px',
  textTransform: 'uppercase',
};

const navStyle = {
  display: 'flex',
  gap: '5px',
  flexWrap: 'wrap',
  justifyContent: 'center',
};

const navLink = {
  color: '#334155',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '800',
  padding: '10px 12px',
  borderRadius: '7px',
};

const mobileNavLink = {
  display: 'block',
  color: '#334155',
  textDecoration: 'none',
  padding: '10px 15px',
};

const headerActions = {
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
};

const cartButton = {
  textDecoration: 'none',
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  color: '#334155',
  padding: '9px 13px',
  borderRadius: '8px',
  fontWeight: '800',
  fontSize: '13px',
};

const loginButton = {
  padding: '10px 17px',
  borderRadius: '8px',
  textDecoration: 'none',
  color: '#14532d',
  fontWeight: '800',
  border: '1px solid #14532d',
  fontSize: '14px',
};

const heroStyle = {
  position: 'relative',
  overflow: 'hidden',
  background:
    'radial-gradient(circle at 80% 20%,rgba(197,157,95,.22),transparent 28%),linear-gradient(135deg,#052e16,#14532d 55%,#166534)',
  color: '#fff',
};

const heroOverlay = {
  position: 'absolute',
  inset: 0,
  background:
    'radial-gradient(circle at 20% 80%,rgba(255,255,255,.04),transparent 25%)',
};

const heroInner = {
  position: 'relative',
  maxWidth: '1100px',
  margin: '0 auto',
  padding: '105px 24px 115px',
  textAlign: 'center',
};

const heroBadge = {
  display: 'inline-block',
  padding: '9px 16px',
  borderRadius: '30px',
  border: '1px solid rgba(197,157,95,.45)',
  color: '#f4d58d',
  background: 'rgba(197,157,95,.08)',
  fontSize: '13px',
  fontWeight: '900',
  letterSpacing: '1.4px',
  marginBottom: '22px',
};

/* ============================================================
   ONLY CHANGE #1:
   Reduced the hero title so it fits in one line.
============================================================ */

const heroTitle = {
  fontFamily: 'Georgia,serif',
  fontSize: 'clamp(29px,4.2vw,50px)',
  lineHeight: 1.05,
  maxWidth: '1100px',
  margin: '0 auto 24px',
  letterSpacing: '-1.5px',
  whiteSpace: 'nowrap',
};

const heroText = {
  maxWidth: '820px',
  margin: '0 auto 35px',
  fontSize: '19px',
  lineHeight: 1.85,
  color: '#dbeafe',
};

const heroPrimaryButton = {
  display: 'inline-block',
  padding: '13px 24px',
  borderRadius: '8px',
  textDecoration: 'none',
  background: '#c59d5f',
  color: '#052e16',
  fontWeight: '900',
  fontSize: '14px',
};

const heroSecondaryButton = {
  display: 'inline-block',
  padding: '13px 24px',
  borderRadius: '8px',
  textDecoration: 'none',
  background: 'rgba(255,255,255,.06)',
  color: '#fff',
  border: '1px solid rgba(255,255,255,.6)',
  fontWeight: '800',
  fontSize: '14px',
};

const sectionStyle = {
  maxWidth: '1100px',
  margin: '0 auto',
  padding: '80px 24px',
};

const sectionInner = {
  maxWidth: '1100px',
  margin: '0 auto',
  padding: '80px 24px',
  textAlign: 'center',
};

const headingContainer = {
  textAlign: 'center',
  maxWidth: '1000px',
  margin: '0 auto 45px',
};

const sectionTitle = {
  fontFamily: 'Georgia,serif',
  color: '#14532d',
  fontSize: 'clamp(28px,4vw,40px)',
  margin: '10px 0 14px',
  whiteSpace: 'nowrap',
};

const sectionTitleWhite = {
  ...sectionTitle,
  color: '#fff',
};

const sectionDescription = {
  color: '#64748b',
  lineHeight: 1.8,
  maxWidth: '720px',
  margin: '0 auto',
};

const whiteDescription = {
  color: '#dbeafe',
  lineHeight: 1.8,
  maxWidth: '720px',
  margin: '0 auto 30px',
};

const goldLabel = {
  color: '#a16207',
  fontWeight: '900',
  fontSize: '13px',
  letterSpacing: '1.5px',
};

const cardGrid = {
  display: 'grid',
  gridTemplateColumns:
    'repeat(auto-fit,minmax(230px,1fr))',
  gap: '18px',
};

const featureCard = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '15px',
  padding: '27px',
  boxShadow: '0 10px 30px rgba(15,23,42,.05)',
};

const featureIcon = {
  fontSize: '30px',
  marginBottom: '12px',
};

const featureTitle = {
  color: '#14532d',
  margin: '0 0 8px',
  fontSize: '17px',
};

const featureText = {
  margin: 0,
  color: '#64748b',
  lineHeight: 1.65,
  fontSize: '13px',
};

const greenSection = {
  background:
    'linear-gradient(135deg,#052e16,#14532d,#166534)',
  color: '#fff',
};

const miniFeatureGrid = {
  display: 'grid',
  gridTemplateColumns:
    'repeat(auto-fit,minmax(190px,1fr))',
  gap: '12px',
  margin: '30px auto',
  maxWidth: '850px',
};

const miniFeature = {
  padding: '17px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,.07)',
  border: '1px solid rgba(255,255,255,.12)',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  textAlign: 'left',
};

const goldButton = {
  display: 'inline-block',
  padding: '13px 23px',
  borderRadius: '8px',
  background: '#c59d5f',
  color: '#052e16',
  textDecoration: 'none',
  fontWeight: '900',
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
  display: 'inline-block',
  padding: '12px 22px',
  background: '#14532d',
  color: '#fff',
  textDecoration: 'none',
  borderRadius: '8px',
  fontWeight: '800',
};

const outlineButton = {
  display: 'inline-block',
  padding: '12px 22px',
  background: '#fff',
  color: '#14532d',
  textDecoration: 'none',
  border: '1px solid #14532d',
  borderRadius: '8px',
  fontWeight: '800',
};

const bookstoreFeature = {
  background:
    'linear-gradient(135deg,#052e16,#14532d)',
  borderRadius: '22px',
  padding: '40px',
  color: '#fff',
  boxShadow:
    '0 20px 50px rgba(20,83,45,.16)',
};

const featureDarkTitle = {
  fontFamily: 'Georgia,serif',
  fontSize: '27px',
  margin: '12px 0',
};

const featureDarkText = {
  color: '#dbeafe',
  lineHeight: 1.7,
};

const lightSection = {
  background: '#f0fdf4',
  borderTop: '1px solid #dcfce7',
  borderBottom: '1px solid #e2e8f0',
};

const infoGrid = {
  display: 'grid',
  gridTemplateColumns:
    'repeat(auto-fit,minmax(260px,1fr))',
  gap: '20px',
};

const infoBox = {
  padding: '30px',
  borderRadius: '15px',
  border: '1px solid #e2e8f0',
  background: '#fff',
};

const infoNumber = {
  color: '#c59d5f',
  fontWeight: '900',
  fontSize: '12px',
  letterSpacing: '1px',
};

const infoTitle = {
  color: '#14532d',
  margin: '10px 0',
};

const infoText = {
  color: '#64748b',
  lineHeight: 1.7,
  margin: 0,
};

const ctaSection = {
  background:
    'linear-gradient(135deg,#14532d,#052e16)',
  color: '#fff',
};

const ctaInner = {
  maxWidth: '900px',
  margin: '0 auto',
  padding: '85px 24px',
  textAlign: 'center',
};

/* ============================================================
   ONLY CHANGE #2:
   Smaller, more elegant font for the BISMILLAH line.
============================================================ */

const arabic = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  color: '#f4d58d',
  fontSize: '25px',
  fontWeight: '500',
  letterSpacing: '0.8px',
};

const ctaTitle = {
  fontFamily: 'Georgia,serif',
  fontSize: '38px',
  margin: '15px 0',
};

const footerStyle = {
  background: '#020617',
  color: '#cbd5e1',
  borderTop: '4px solid #c59d5f',
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
  background: '#14532d',
  border: '1px solid #c59d5f',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#c59d5f',
  fontWeight: '900',
  fontSize: '22px',
};

const footerBrandName = {
  color: '#fff',
  fontSize: '19px',
  fontWeight: '900',
};

const footerBrandTagline = {
  fontSize: '9px',
  color: '#c59d5f',
  letterSpacing: '1px',
};

const footerText = {
  lineHeight: 1.8,
  fontSize: '14px',
  maxWidth: '390px',
  color: '#94a3b8',
};

const footerTextSmall = {
  fontSize: '13px',
  lineHeight: 1.6,
  color: '#64748b',
};

const footerArabic = {
  fontFamily: 'Georgia,serif',
  color: '#c59d5f',
  fontSize: '18px',
  marginBottom: '0',
};

const footerHeading = {
  margin: '0 0 17px',
  color: '#f8fafc',
  fontSize: '14px',
  fontWeight: '900',
};

const footerColumnLinks = {
  display: 'flex',
  flexDirection: 'column',
  gap: '11px',
};

const footerLink = {
  color: '#94a3b8',
  textDecoration: 'none',
  fontSize: '13px',
};

const footerButton = {
  border: 'none',
  background: 'none',
  padding: 0,
  color: '#94a3b8',
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
  background: '#0f172a',
  border: '1px solid #334155',
  color: '#f8fafc',
  fontWeight: '900',
};

const footerContactStrip = {
  marginTop: '45px',
  padding: '20px',
  borderRadius: '12px',
  background: '#0f172a',
  border: '1px solid #1e293b',
  display: 'flex',
  gap: '25px',
  flexWrap: 'wrap',
  justifyContent: 'space-around',
  fontSize: '12px',
  color: '#94a3b8',
};

const footerBottom = {
  marginTop: '30px',
  paddingTop: '22px',
  borderTop: '1px solid #1e293b',
  display: 'flex',
  justifyContent: 'space-between',
  gap: '15px',
  flexWrap: 'wrap',
  fontSize: '12px',
  color: '#64748b',
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
  background: '#fff',
  borderRadius: '18px',
  boxShadow: '0 30px 80px rgba(0,0,0,.35)',
};

const modalHeader = {
  padding: '22px 25px',
  background:
    'linear-gradient(135deg,#052e16,#14532d)',
  color: '#fff',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  position: 'sticky',
  top: 0,
};

const modalTitle = {
  margin: 0,
  fontFamily: 'Georgia,serif',
  fontSize: '24px',
};

const closeButton = {
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  border: '1px solid rgba(255,255,255,.35)',
  background: 'rgba(255,255,255,.08)',
  color: '#fff',
  fontSize: '22px',
  cursor: 'pointer',
};

const modalContent = {
  padding: '30px',
  color: '#475569',
  lineHeight: 1.8,
  fontSize: '14px',
};

const quoteBox = {
  marginTop: '20px',
  padding: '20px',
  background: '#f0fdf4',
  borderLeft: '4px solid #c59d5f',
  borderRadius: '8px',
  color: '#14532d',
  lineHeight: 1.8,
};

const resourceGridStyle = {
  display: 'grid',
  gridTemplateColumns:
    'repeat(auto-fit,minmax(210px,1fr))',
  gap: '14px',
};

const resourceCard = {
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '20px',
};

const resourceLink = {
  color: '#14532d',
  fontWeight: '800',
  textDecoration: 'none',
};

const resourceAction = {
  border: 'none',
  background: 'none',
  color: '#14532d',
  fontWeight: '800',
  padding: 0,
  cursor: 'pointer',
};

const contactGridStyle = {
  display: 'grid',
  gridTemplateColumns:
    'repeat(auto-fit,minmax(230px,1fr))',
  gap: '12px',
};

const contactItem = {
  display: 'flex',
  gap: '12px',
  padding: '17px',
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '11px',
};

const contactIcon = {
  fontSize: '22px',
};

const faqBox = {
  border: '1px solid #e2e8f0',
  borderRadius: '10px',
  marginBottom: '10px',
  padding: '15px 17px',
  background: '#f8fafc',
};

const faqQuestion = {
  cursor: 'pointer',
  color: '#14532d',
  fontWeight: '800',
};

const faqAnswer = {
  color: '#64748b',
  lineHeight: 1.7,
};
