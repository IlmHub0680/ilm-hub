// Single source of truth for the Legal & Info Pages CMS's "real
// content" defaults — the actual About/Privacy/Terms/Refund copy,
// FAQ list and contact details the public site has always shown.
// Both the public route (app/api/legal-content) and the Admin
// editors (app/api/admin/legal-pages/*) import from here, so:
//   - the public site never regresses if a DB row is missing or the
//     database is briefly unreachable (falls back to this content), and
//   - the Admin editors show this same real content pre-filled
//     instead of an empty box, so an admin can never accidentally
//     save a blank page over what visitors already see.
// Kept in one place deliberately — do not copy these strings into
// another file; import them instead.

export const DEFAULT_PAGES = {
  about: {
    title: 'About Ulul Azm',
    bodyHtml: `
      <p><strong>Ulul Azm</strong> is an educational institution dedicated to the pursuit, preservation, understanding, and responsible transmission of beneficial Islamic knowledge.</p>
      <p>Our aim is to provide structured and disciplined learning in Qur'anic sciences, Arabic language, Hadith, Fiqh, Aqidah, Tajwid, Seerah, and other foundational Islamic disciplines — rooted firmly in the Qur'an and Sunnah, grounded in the rich scholarly tradition, and delivered through an accessible, systematic, and transformative academic approach.</p>
      <p>We believe that beneficial knowledge must be pursued with sincerity, sound methodology, humility, discipline, and respect for the scholarly tradition, while cultivating students who embody good character, live by what they learn, and use their knowledge in service to their communities.</p>
      <p><strong>Our guiding principle:</strong> "And say: My Lord, increase me in knowledge." Knowledge is a religion. We seek to learn it sincerely, understand it responsibly, and share it beneficially.</p>
    `.trim(),
  },
  privacy: {
    title: 'Privacy Policy',
    bodyHtml: `
      <p>Ulul Azm respects the privacy of students, applicants, authors, customers, and visitors to its website.</p>
      <p>Information submitted through admission forms, enquiries, bookstore purchases, or other institutional services is collected and used only for legitimate institutional purposes.</p>
      <p>We aim to protect personal information and do not intentionally sell personal information to third parties.</p>
      <p>Payment information should be processed through appropriate secure payment providers where applicable. Users should never submit passwords, payment credentials, or other highly sensitive information through ordinary website forms.</p>
      <p>While we take reasonable measures to protect information, no internet transmission or online system can be guaranteed to be completely secure.</p>
    `.trim(),
  },
  terms: {
    title: 'Terms of Use',
    bodyHtml: `
      <p>By accessing the Ulul Azm website, visitors agree to use the platform responsibly, lawfully, and in a manner consistent with the institute's educational purpose.</p>
      <p>Academic materials, publications, logos, written content, and other institutional materials may not be reproduced, redistributed, or commercially exploited without appropriate permission.</p>
      <p>Users are responsible for providing accurate information when submitting applications, purchases, enquiries, or other forms.</p>
      <p>Ulul Azm may update programmes, schedules, prices, availability, policies, and website content when necessary.</p>
      <p>Information provided on this website is intended for general educational and institutional purposes and should not be interpreted as a substitute for personalised scholarly, legal, medical, or other professional advice.</p>
    `.trim(),
  },
  refund: {
    title: 'Refund Policy',
    bodyHtml: `
      <p>Ulul Azm aims to provide clear information about programme fees, books, digital resources, and other purchases before payment is made.</p>
      <p>Refund eligibility may depend on the nature of the purchase, programme, digital delivery or access status, physical shipment status, and applicable institutional policy.</p>
      <p>Digital products that have already been delivered or accessed may be subject to different refund conditions from physical books or other products.</p>
      <p>If a physical item arrives damaged, incorrect, or materially different from the purchased item, customers should contact the institute promptly with the relevant order information.</p>
      <p>For specific refund requests, customers should contact the institute directly with their order or programme details before initiating a dispute through a payment provider.</p>
    `.trim(),
  },
  'academic-policies': {
    title: 'Academic Policies',
    bodyHtml: `
      <p>These policies govern the academic conduct of every student enrolled at Ulul Azm Institute, across every department and programme. They exist to keep the pursuit of knowledge disciplined, fair, and consistent for everyone.</p>
      <h2>Attendance</h2>
      <p>Students are expected to attend scheduled classes and live sessions punctually. Extended or repeated absence without prior notice to the relevant Instructor or Department may affect academic standing and, where applicable, continued enrollment.</p>
      <h2>Grading and Assessment</h2>
      <p>Grades are recorded by the Instructor of record for each course and are subject to review by the Department and, where relevant, the Examinations office. Any correction to a recorded grade follows the institute's formal grade-correction process and is logged for accountability.</p>
      <h2>Academic Integrity</h2>
      <p>Students are expected to submit their own work. Plagiarism, impersonation in examinations, or submitting another person's work as one's own is treated as a serious academic integrity violation and may result in a failing grade, probation, or dismissal, depending on severity.</p>
      <h2>Academic Probation and Dismissal</h2>
      <p>A student who falls below the minimum standing required by their programme may be placed on academic probation, with a defined path to return to good standing. Continued failure to meet minimum standards may lead to dismissal from the programme.</p>
      <h2>Appeals</h2>
      <p>A student who believes a grade, disciplinary action, or academic decision was made in error may formally appeal through their Department or Student Services, who will review the matter and respond in writing.</p>
    `.trim(),
  },
  'student-resources': {
    title: 'Student Resources',
    bodyHtml: `
      <p>A quick guide to where currently enrolled students can go for support, materials, and services across the Institute.</p>
      <h2>Academic Support</h2>
      <p>Questions about coursework, grading, or your study plan should go first to your course Instructor, then to your academic Department if unresolved. Your student dashboard shows your current courses, grades, and academic records.</p>
      <h2>Digital Library &amp; Media Center</h2>
      <p>The Digital Library holds the Institute's catalogue of texts and reference material available to enrolled students. The Media Center hosts recorded lectures and other learning media, kept independently from the Library so each can be browsed on its own terms.</p>
      <h2>Student Services</h2>
      <p>For matters relating to enrollment status, records, or general student affairs, Student Services is the first point of contact and can direct more specific requests to the right department.</p>
      <h2>Finance &amp; Fees</h2>
      <p>Fee balances, payment history, and payment options are available from your student finance portal. Questions about a specific charge should be raised with the Finance office directly.</p>
      <h2>Community</h2>
      <p>Enrolled students may join the Ulul Azm Community space to connect with peers, subject to reading and accepting the Community Guidelines beforehand.</p>
      <h2>Technical Support</h2>
      <p>For login issues, access problems, or other technical difficulties with the platform, see the IT Support page for guidance or to reach the ICT team.</p>
    `.trim(),
  },
  'community-guidelines': {
    title: 'Ulul Azm Community Guidelines',
    bodyHtml: `
      <p>The Ulul Azm Community is a space for current students and alumni to connect around learning, character, and service -- not a general-purpose social network. These guidelines apply to every post, comment, and profile in the Community.</p>

      <h2>1. Purpose</h2>
      <p>The Community exists to support beneficial interaction: sharing knowledge, encouraging one another, coordinating service, and building good character. Content unrelated to these aims, or that turns the space into idle entertainment or promotion, may be removed.</p>

      <h2>2. Conduct</h2>
      <ul>
        <li>Speak to one another with the respect and good manners (adab) expected of students of knowledge.</li>
        <li>No harassment, insults, threats, or personal attacks.</li>
        <li>No content that is sexually explicit, violent, or promotes unlawful activity.</li>
        <li>No spam, unsolicited advertising, or commercial solicitation.</li>
        <li>No sharing of another member's private information without their consent.</li>
        <li>Disagreement is welcome when expressed with sincerity and courtesy; contempt and mockery are not.</li>
      </ul>

      <h2>3. Privacy</h2>
      <p>Your Community profile is separate from your academic and financial records. Passwords, payment details, grades, transcripts, application information, and contact details are never shown to other members. You control whether your Community profile (bio, interests) is visible to others.</p>

      <h2>4. Blocking</h2>
      <p>Any member may block another member at any time. Blocking is immediate and does not require the other person's agreement; once blocked, the two members no longer see each other's Community posts, comments, or profile.</p>

      <h2>5. Reporting</h2>
      <p>Members can report a post or comment that violates these guidelines. Reports go directly to the moderation team and are reviewed promptly. Reporting is never visible to the person being reported.</p>

      <h2>6. Moderation</h2>
      <p>Staff and administrators with Student Matters permissions may hide, pin, or otherwise moderate Community content that violates these guidelines. Moderation decisions are made to protect the integrity and safety of the Community, not to suppress honest discussion.</p>

      <h2>7. Academic Discussion vs. Community</h2>
      <p>Course-specific academic discussion happens in each course's own Discussion area and is governed separately. The Community is the place for the broader student and alumni body to connect outside of coursework.</p>

      <p>Questions about these guidelines, or about a moderation decision, can be directed to the institute through the <a href="/contact">Contact</a> page.</p>
    `.trim(),
  },
  'admission-requirements': {
    title: 'Admission Requirements',
    bodyHtml: `
      <p><strong>Admission Requirements.</strong> This page covers only what it takes to enter each Ulul Azm Academy pathway. For the full pathway descriptions, qualification framework and course structure, see <a href="/academy-pathways">Academic Pathways &amp; Qualifications</a>.</p>

      <h2>1. How Placement Works</h2>
      <p>Every applicant is placed by evidence, never by age or self-report alone. Placement draws on seven inputs:</p>
      <ul>
      <li>Previous education (Islamic and general)</li>
      <li>Existing Islamic Studies knowledge</li>
      <li>Qur'an reading ability</li>
      <li>Tajweed level</li>
      <li>Hifz (memorization) progress, where relevant</li>
      <li>Arabic proficiency</li>
      <li>General learning readiness</li>
      </ul>

      <h2>2. Entry Requirements by Pathway</h2>

      <h3>Foundation Studies</h3>
      <p>None beyond basic literacy and willingness to be placed by a short readiness assessment — deliberately the pathway with no prerequisite, and the default entry point for anyone with no prior structured Islamic education. Leads to a Certificate of Foundation Studies.</p>

      <h3>Intermediate Islamic Studies</h3>
      <p>Completed Foundation Studies, or a placement assessment demonstrating equivalent competence. Leads to a Certificate of Intermediate Islamic Studies.</p>

      <h3>Advanced Islamic Studies</h3>
      <p>Completed Intermediate Islamic Studies, or a placement assessment demonstrating equivalent competence. Leads to a Certificate of Advanced Islamic Studies.</p>

      <h3>Diploma in Islamic Studies</h3>
      <p>Completed Advanced Islamic Studies, or a comprehensive placement assessment demonstrating equivalent competence across all prior tiers — held to a higher evidentiary bar than lower-tier placement, given the weight of the credential it leads to. Leads to the Diploma in Islamic Studies.</p>

      <h3>Specialized Certificate Programs</h3>
      <p>Completed Advanced Islamic Studies or the Diploma in Islamic Studies, or a placement assessment demonstrating equivalent competence in the chosen area.</p>
      <blockquote>Specialized Certificate Programs now has an approved initial course list — see <a href="/academy-pathways">Academic Pathways &amp; Qualifications</a> §7 for the current course list and the criteria the Department follows when adding further certificate courses to it.</blockquote>

      <h2>3. Recognition of Prior Learning (RPL)</h2>
      <p>A learner's own account of their prior learning is never sufficient by itself. Recognition happens only through the same placement assessment every other entrant goes through — evidence-based, administered by Academic Advising or the relevant Department, and documented in the learner's record.</p>

      <h2>4. How to Apply</h2>
      <p>Ready to apply? Start your application, track an existing one, or review the registration process:</p>
      <ul>
      <li><a href="/admission">Apply Now</a></li>
      <li><a href="/admission/track">Track Your Application</a></li>
      </ul>
    `,
  },
  'academy-foundation': {
    title: 'Academy Foundation',
    bodyHtml: `
      <p><em>وَقُلْ رَبِّ زِدْنِي عِلْمًا — "And say: My Lord, increase me in knowledge." — Qur'an 20:114</em></p>
      <p><strong>Institutional Identity, Educational Philosophy, and Learning Principles.</strong> Ulul Azm Academy is the educational and teaching arm of Ulul Azm Institute. It provides a structured environment through which the Institute's mission of Islamic knowledge reaches learners.</p>

      <h2>1. Introduction</h2>
      <p>The Academy is founded on the conviction that beneficial knowledge should be soundly sourced, carefully understood, reflected in character and practice, and responsibly shared. Its educational approach brings together the discipline of the Islamic scholarly tradition and clear, purposeful educational design.</p>
      <p>This Foundation sets out the Academy's identity, purpose, educational philosophy, learner and graduate profiles, institutional objectives, and guiding principles. It provides the basis for the Academy's academic pathways, programs, courses, instruction, assessment, learner support, and ongoing development.</p>
      <p>The Foundation describes the principles that guide the Academy. Detailed pathway requirements and qualification structures are set out separately in the <strong>Ulul Azm Academy Pathways: Academic Pathways &amp; Qualification Framework</strong>.</p>

      <h2>2. Academy Identity</h2>
      <h3>Purpose</h3>
      <p>To provide structured, authentically sourced, and academically coherent Islamic education that develops learners who understand what they know, live by what they understand, and can carry that knowledge responsibly into their communities. The Academy aims to serve learners at different starting points and stages of life through pathways that are flexible in route while maintaining clear academic standards.</p>

      <h3>Mission</h3>
      <p>Ulul Azm Academy exists to make sound Islamic knowledge accessible through progressive, quality-assured learning pathways. It seeks to unite the discipline of traditional scholarship with the clarity of effective teaching, so that learners' progress is meaningful, evidenced, and built upon sound foundations.</p>

      <h3>Vision</h3>
      <p>To be an Academy where knowledge and character are never separated; where scholarly depth and institutional maturity continue to develop; where educational claims and qualifications are represented honestly; and where learners can begin from their actual level and pursue further learning with purpose.</p>

      <h3>Core Values</h3>
      <p><strong>Sincerity — Ikhlas.</strong> Knowledge is sought for the sake of Allah, with sincerity and humility, rather than for appearance, status, or personal acclaim.</p>
      <p><strong>Sound Knowledge.</strong> Learning is grounded in the Qur'an, the Sunnah, and the established Islamic scholarly tradition. Religious content is treated with care and is not improvised or presented as authoritative without appropriate scholarly review.</p>
      <p><strong>Character — Akhlaq.</strong> Knowledge and conduct belong together. The Academy values good manners, humility, integrity, responsibility, and the practical expression of beneficial learning.</p>
      <p><strong>Rigor.</strong> Academic standards should be meaningful and assessed honestly. A certificate or qualification should represent the learning and competence it claims to recognize.</p>
      <p><strong>Accessibility.</strong> Learners come from different educational backgrounds, circumstances, and levels of preparation. The Academy seeks to provide appropriate routes and support without compromising the standards learners are expected to meet.</p>
      <p><strong>Accountability.</strong> The Academy values responsible governance, quality assurance, transparent communication, and honest reporting about its educational work and institutional development.</p>
      <p><strong>Continuous Learning.</strong> Learning is a lifelong pursuit. The Academy also regards its own educational practices and institutional systems as subject to reflection, evaluation, and improvement.</p>
      <p><strong>Service.</strong> Beneficial knowledge should contribute to the learner's family, community, and wider society. Learning is not pursued solely as a personal accomplishment.</p>

      <h2>3. Educational Philosophy</h2>
      <p>The Academy understands learning as a connected process:</p>
      <p style="text-align:center;"><strong>Sound Knowledge → Understanding → Character → Practice → Service</strong></p>
      <p>Knowledge should be accurately acquired and properly understood. Understanding should inform character and conduct. Learning should be reflected in practice and, where appropriate, contribute to the well-being of others.</p>
      <p>Memorization has an important place in Islamic learning, but memorization alone is not the entirety of education. Learners should also develop understanding, sound reasoning within an established methodology, good conduct, and the ability to apply what they have learned responsibly.</p>
      <p>This educational philosophy informs curriculum planning, instruction, assessment, learner support, and the Academy's expectations of its graduates.</p>

      <h2>4. Academic Philosophy</h2>
      <p>Learning at the Academy is structured, progressive, and competency-based. Learners should advance when they have demonstrated the required readiness and competence, rather than solely because a fixed period of time has passed.</p>
      <p>Curriculum, instruction, and assessment are treated as connected parts of one educational system. Programs should have clear purposes and learning outcomes; instruction should support those outcomes; and assessment should provide appropriate evidence of learning.</p>
      <p>The Academy's academic pathways are designed to build progressively, with suitable prerequisites and opportunities for learners to demonstrate equivalent prior learning where the established placement process permits it.</p>

      <h2>5. Learner-Centered Philosophy</h2>
      <p>The Academy recognizes that learners differ in their prior education, Islamic knowledge, Qur'an reading and recitation, Arabic proficiency, learning goals, available study time, and individual learning needs.</p>
      <p>The Academy therefore seeks to design pathways around learners' demonstrated starting points and educational needs rather than assuming that all learners should follow one identical route.</p>
      <p>Flexibility in learning route does not mean lowering academic standards. Appropriate support, placement, pacing, and teaching methods may vary, while the required learning outcomes and standards remain meaningful.</p>

      <h2>6. Lifelong Learning Philosophy</h2>
      <p>Graduation is a milestone in a learner's continuing relationship with knowledge, not the end of learning.</p>
      <p>The Academy seeks to cultivate sound study habits, intellectual curiosity, responsibility, and the ability to continue learning beyond formal study. Its educational pathways are intended to provide foundations for further study, personal development, community service, and, where appropriately prepared, teaching or specialized learning.</p>

      <h2>7. Islamic Educational Philosophy</h2>
      <p>The Academy's approach to Islamic education rests upon the Qur'an and the Sunnah as its primary sources, understood and taught through the established methodology of the Islamic scholarly tradition.</p>
      <p>Islamic knowledge (<em>ʿilm</em>) is not treated as an end detached from conduct. It is pursued to support sound belief, correct worship, beneficial understanding, and upright character. The Academy understands <em>tarbiyah</em> as formation as well as instruction: the development of the learner's intellect, spiritual life, and conduct together.</p>

      <h3>Intellectual Development</h3>
      <p>The Academy seeks to develop learners' ability to read texts accurately, understand what they study, reason soundly within an established methodology, and distinguish between matters that are settled and matters in which qualified scholars have differed.</p>

      <h3>Spiritual Development</h3>
      <p>The Academy values sincerity, God-consciousness (<em>taqwa</em>), and the inner disposition that gives beneficial knowledge its purpose. Spiritual development is not confined to a single subject; it should be reflected appropriately throughout the learning environment.</p>

      <h3>Ethical and Community Responsibility</h3>
      <p>Learners are encouraged to use knowledge honestly, act with humility, respect others, and recognize their responsibilities toward their families and communities.</p>

      <h3>Methodological Foundation</h3>
      <p>The Academy's confirmed methodology is <strong>Ahlus-Sunnah wal-Jamaʿah, upon the understanding of the Salaf</strong>. This is the Academy's stated methodological foundation.</p>
      <p>This statement does not, by itself, establish a particular named school of jurisprudence, a specific hadith-authentication methodology, or an institutional position on every matter of scholarly disagreement. Where a curriculum requires a specific position or approach to differing scholarly views, that matter requires appropriate governance and qualified scholarly review.</p>

      <h2>8. Learner Profile</h2>
      <p>The Academy is intended to serve learners with varied backgrounds and goals, including learners who differ in:</p>
      <ul>
      <li>Prior educational experience, from no formal Islamic education to advanced prior study.</li>
      <li>Existing knowledge across Islamic disciplines.</li>
      <li>Qur'an reading and recitation ability.</li>
      <li>Arabic language proficiency, from beginner to fluent.</li>
      <li>Learning goals, including personal development, structured study, certification, further education, or preparation for appropriate teaching responsibilities.</li>
      <li>Available study time, including full-time, part-time, and study alongside work or family responsibilities.</li>
      <li>Individual learning needs, including language support and accessibility needs.</li>
      </ul>
      <p><strong>Placement Principle.</strong> Academic placement is based on demonstrated prior learning, readiness, and appropriate assessment — not age alone. Age may be relevant to administrative, safeguarding, pastoral, or cohort arrangements, but it does not by itself determine a learner's academic level or course access.</p>

      <h2>9. Graduate Profile</h2>
      <p>The Academy does not expect every graduate to become an expert in every Islamic discipline. Its core areas — including ʿAqidah, Qur'anic Studies, Hadith Sciences, Fiqh, Seerah, Tazkiyah, and Arabic Language — may develop along distinct learning tracks. A learner's overall profile reflects the areas and pathways they have pursued, rather than an assumed uniform level of expertise across every discipline.</p>
      <p>The Academy describes progression through the following broad competence tiers:</p>
      <p><strong>Foundational — Entry Competence.</strong> The learner demonstrates basic knowledge relevant to belief and worship, functional Qur'an reading, and familiarity with essential terminology in Islamic learning. The learner has a foundation for continued study but is not presumed ready to derive rulings or teach independently.</p>
      <p><strong>Intermediate — Working Competence.</strong> The learner can follow texts with guidance, apply learned material to familiar situations, and explain core concepts with appropriate reasoning. The learner demonstrates developing competence while continuing to benefit from structured instruction.</p>
      <p><strong>Advanced — Independent Competence.</strong> The learner engages primary texts more directly, follows scholarly arguments and their methodologies, and applies learning responsibly within an established framework. Independent study does not mean independently originating religious rulings or going beyond the bounds of established scholarship.</p>
      <p><strong>Diploma-Level — Certified Competence.</strong> The learner has completed a defined and assessed pathway across the required disciplines and has met the Academy's stated standard for the qualification awarded.</p>
      <p><strong>Specialized — Concentrated Competence.</strong> The learner develops deeper competence in a particular discipline or focused area beyond the general pathway, potentially in preparation for further study, research, teaching, or community service within the scope of that specialization.</p>
      <p>Across all tiers, character and conduct remain integral to the Academy's educational aims. Academic achievement is not considered in isolation from the responsible use of knowledge.</p>

      <h2>10. Institutional Objectives</h2>
      <p>Ulul Azm Academy aims to:</p>
      <ol>
      <li>Provide sound, correctly sourced knowledge of the Qur'an, Hadith, ʿAqidah, and Fiqh appropriate to each learner's level.</li>
      <li>Develop functional and, where pursued further, advanced ability to engage with the Qur'an in Arabic, including recitation, comprehension, and textual access.</li>
      <li>Build Arabic language competence over time, reducing learners' dependence on translation as their proficiency develops.</li>
      <li>Cultivate good character (<em>akhlaq</em>) alongside academic instruction, rather than treating it as a separate or secondary concern.</li>
      <li>Develop critical thinking within an Islamic epistemological framework, emphasizing sound reasoning rather than recall alone.</li>
      <li>Strengthen clear written and spoken communication, including the ability to explain learned material appropriately.</li>
      <li>Cultivate habits that support lifelong and self-directed learning beyond formal study.</li>
      <li>Prepare learners for responsible contributions within their families and communities and, where relevant and appropriately qualified, future teaching roles.</li>
      <li>Introduce research and source-verification skills appropriate to the learner's level.</li>
      <li>Connect learning with meaningful community contribution and service.</li>
      <li>Where learners pursue a teaching-oriented specialization, prepare them to teach material they have themselves studied soundly and are qualified to convey.</li>
      <li>Maintain an honest, evidence-based understanding of educational effectiveness through quality assurance and continuous improvement.</li>
      </ol>

      <h2>11. Educational Principles</h2>
      <p><strong>Progression.</strong> Learning is deliberately sequenced. Each stage should prepare learners for the next rather than functioning as a loose collection of unrelated courses.</p>
      <p><strong>Coherence.</strong> Courses within a program should contribute to that program's stated outcomes. Content should have a clear educational purpose.</p>
      <p><strong>Accessibility.</strong> Pathways should accommodate different starting points, paces, and circumstances without lowering the standards learners must ultimately meet.</p>
      <p><strong>Appropriate Challenge.</strong> Learning should be neither unnecessarily below a learner's readiness nor so far beyond it that the learner is set up to fail.</p>
      <p><strong>Evidence-Based Assessment.</strong> Progress is determined by demonstrated performance against defined criteria, not attendance, effort alone, or time spent.</p>
      <p><strong>Alignment.</strong> What is taught, assessed, and claimed as a program outcome should be consistent. Assessment should measure the learning outcomes it is intended to evaluate.</p>
      <p><strong>Prerequisite Progression.</strong> Advanced learning should build on specified prior learning. Learners may meet prerequisites through completion or through an approved assessment of equivalent readiness.</p>
      <p><strong>Specialization.</strong> Deeper study in a particular discipline should be offered as a deliberate pathway for learners who are prepared for it, rather than being required of every learner by default.</p>
      <p><strong>Academic Integrity.</strong> Qualifications should represent genuine achievement. Assessment and reporting should be honest and should not be adjusted merely to improve completion figures.</p>
      <p><strong>Continuous Improvement.</strong> Curriculum and assessment should be reviewed and improved in response to evidence, through a recurring process rather than only when a problem becomes visible.</p>

      <h2>12. Academic Organization and Design</h2>
      <p>The Academy follows this organizing principle:</p>
      <p><strong>Departments organize academic disciplines. Programs organize learning pathways. Courses organize structured learning experiences. Assessments provide evidence of learning. Quality assurance evaluates and improves the system.</strong></p>
      <p>Each level has a distinct purpose. A department is not a program; a program is not a course; and a course is not its assessment.</p>
      <p>Academic design should avoid unnecessary duplication and artificial symmetry. Departments are not required to contribute courses to every program, and courses should not be created merely to make departments appear equal in size or structure.</p>
      <p>Placement should be based on readiness rather than age. Prerequisites should be respected, and any exception should follow an appropriate assessment process. Learning outcomes should be assessable, and assessments should be designed to measure the outcomes they claim to measure.</p>
      <p>The Academy should represent its qualifications and institutional standing honestly and should not claim external recognition or accreditation that has not been granted.</p>

      <h2>13. Learner Support Philosophy</h2>
      <p>The Academy seeks to provide a learning environment in which learners can receive appropriate support while remaining responsible for meeting established academic standards.</p>
      <ul>
      <li><strong>Accessibility:</strong> Learning materials and programs should be designed with a range of learner needs in mind.</li>
      <li><strong>Learning support:</strong> Learners experiencing difficulty should have a clear way to seek assistance before challenges become insurmountable.</li>
      <li><strong>Language support:</strong> Learners with limited Arabic should have a meaningful opportunity to develop their proficiency.</li>
      <li><strong>Academic advising:</strong> Learners should be able to obtain guidance about pathway choice, pace, readiness, and progression.</li>
      <li><strong>Differentiated instruction:</strong> Where appropriate, different instructional approaches may support learners toward the same defined outcome.</li>
      <li><strong>Reasonable accommodations:</strong> Adjustments may be considered for documented needs through the Academy's applicable process, without changing the meaning of mastery.</li>
      <li><strong>Alternative assessment:</strong> Where justified, the method by which a learner demonstrates mastery may vary, while the standard being assessed remains intact.</li>
      <li><strong>Early intervention:</strong> Learners who are struggling should be identified and supported in a timely manner.</li>
      </ul>
      <p><strong>The governing principle is that support changes how a learner reaches the standard; it does not change what the standard is.</strong></p>

      <h2>14. Scholarly Review and Academic Responsibility</h2>
      <p>The Academy distinguishes between designing the structure of education and determining specific religious content.</p>
      <p>The Foundation establishes educational principles, learner progression, and the relationship between knowledge, understanding, character, and practice. It does not independently determine specific religious rulings, a named school of jurisprudence, hadith-authentication positions, or the Academy's approach to every matter of genuine scholarly disagreement.</p>
      <p>Curriculum content bearing on Islamic rulings, positions, or interpretation must receive appropriate review and approval by qualified scholars before it is taught as institutional content under the Academy's name.</p>
      <p>Where qualified scholars differ, the Academy's approach to presenting that difference — whether by adopting a particular view or presenting multiple views comparatively — is a matter for appropriate governance and scholarly review.</p>
      <p>Preparing, drafting, or developing educational content does not itself constitute scholarly review. Content should only be described as reviewed when qualified scholars have actually reviewed it.</p>

      <h2>15. Quality Culture</h2>
      <p>Quality is an ongoing institutional practice. Learning outcomes should be defined before curriculum is developed; assessment should be checked against those outcomes; and educational practices should be reviewed when evidence indicates that improvement is needed.</p>
      <p>The Academy seeks to develop a culture of reflection, accountability, and continuous improvement in which educational decisions are informed by evidence and the institution remains honest about both its progress and its limitations.</p>

      <h2>16. Future Development</h2>
      <p>The Academy's programs, courses, curricula, assessment methods, and learner-support arrangements should be developed in accordance with this Foundation and the Academy's governing academic documents.</p>
      <p>New proposals should identify any unresolved institutional decisions on which they depend, rather than treating undecided matters as established policy.</p>
      <p>Future academic documents should remain consistent with the Academy's stated Islamic educational philosophy and scholarly-review principles. Any substantive change to those foundations should be deliberate and appropriately authorized.</p>
      <p>This Foundation is intended to develop as the Academy matures. It provides a stable institutional basis while allowing for considered refinement informed by experience, evidence, and appropriate review.</p>

      <h2>17. Institutional Note</h2>
      <p>This Foundation describes the Academy's educational identity and guiding principles. Specific operational policies, governance authorities, academic procedures, program structures, and implementation decisions are addressed in their respective institutional documents.</p>
      <p>The Academy's confirmed methodological foundation is Ahlus-Sunnah wal-Jamaʿah upon the understanding of the Salaf. Matters not yet formally determined should not be represented as settled institutional policy.</p>

      <p><em>Ulul Azm Academy — Institutional Foundation. A place for sound knowledge, understanding, character, and beneficial service.</em></p>

    `.trim(),
  },
  'academy-governance': {
    title: 'Academy Governance',
    bodyHtml: `
      <p><strong>Academic Governance &amp; Organizational Structure.</strong> The Institutional Foundation document establishes the Academy's identity and educational philosophy. This document sets out the professional structure that carries that philosophy out: who holds academic authority, how departments and cross-cutting units are organized, who is responsible for what, and how a curriculum decision actually moves through the system. No detailed courses, programs, or syllabi are designed here.</p>
      <blockquote><strong>How this document was built.</strong> Ulul Azm's platform already has a real, working staff-governance system — Faculties, Departments, Programs, Positions, module-level permissions, and dedicated dashboards for Deans, Heads of Department, Programme Coordinators, Instructors, Advisors, Quality Assurance, Student Affairs, Finance, Library, and ICT. This document does not rebuild any of that. It names each real role and mechanism as it already exists, adds the one role that was genuinely missing (Academy Director), and is explicit about which pieces of it — committees, cross-cutting units, formal approval workflows — are new design that still needs a founder decision before it becomes real, tracked functionality.</p>

      <h2>1. Institutional Structure</h2>
      <p>The Academy's structure sits inside the Institute's existing staff hierarchy. Two Institute-wide roles already sit above it — the <strong>Rector</strong> and <strong>Vice Rector</strong> — who hold view-only oversight across every division of the Institute (Academy, Admissions &amp; Registration, Bookstore, Media, Library, Student Portal), not the Academy alone. The Academy's own leadership begins with the Academy Director:</p>
      <ul>
      <li><strong>Academy Director</strong> — new role, added in this document. Academy-wide oversight of Faculty, Department, Program, Course, Academic Records and Quality Assurance matters — view-only by design, the same "oversight, not operational control" pattern already used for Rector/Vice Rector, scoped to academic matters rather than the whole Institute. Lands on the general Admin console after login.</li>
      <li><strong>Academic Dean</strong> — existing Position ("Dean"). Leads a Faculty; edits Faculty Matters, views Department/Program/Course data beneath it. Own dashboard: <code>/dean-dashboard</code>.</li>
      <li><strong>Department Heads</strong> — existing Position ("Head of Department"). Leads a Department; edits Department Matters, views Programs/Courses beneath it. Own dashboard: <code>/hod-dashboard</code>.</li>
      <li><strong>Program Coordinators</strong> — existing Position. Edits Program Matters, views Courses beneath it. Own dashboard: <code>/coordinator-dashboard</code>.</li>
      <li><strong>Instructors</strong> — existing Position (Lecturer / Instructor). Edits Courses &amp; Grades for assigned courses. Own dashboard: <code>/instructor-dashboard</code>.</li>
      <li><strong>Academic Advisors</strong> — existing Position. Views Student Matters; advises assigned students. Own dashboard: <code>/advisor-dashboard</code>.</li>
      <li><strong>Assessment and Quality Assurance personnel</strong> — existing Position ("Quality Assurance Officer"). Edits Quality Assurance reviews across programs, courses, departments and faculties. Own dashboard: <code>/qa-dashboard</code>.</li>
      <li><strong>Student Affairs</strong> — existing Position ("Student Affairs Officer"). Edits Student Matters (non-academic welfare, complaints, tutoring). Own dashboard: <code>/student-affairs-dashboard</code>.</li>
      <li><strong>Administration</strong> — existing Positions: Registrar (Academic Records, Admissions oversight), Academic Administrator (Academic Records, Faculty/Department view), and general Administrative Staff.</li>
      <li><strong>Technology / LMS</strong> — existing Position ("ICT Officer"). Edits ICT Operations. Own dashboard: <code>/ict-dashboard</code>.</li>
      <li><strong>Finance and Operations</strong> — existing Position ("Finance Officer"). Edits Fees and Payroll. Own dashboard: <code>/finance-dashboard</code>.</li>
      </ul>
      <p><strong>Academic vs. administrative responsibility.</strong> The platform already separates these formally: every Position carries an <code>isAcademic</code> flag. Academy Director, Dean, Head of Department, Programme Coordinator, Instructor and Academic Advisor are academic positions — their authority runs through the Faculty → Department → Program → Course chain. Registrar, Academic Administrator, Admissions Officer, Examinations Officer, Student Affairs Officer, Finance Officer, Librarian, Quality Assurance Officer, ICT Officer and Administrative Staff are administrative positions — their authority runs through institutional operations that support, but do not themselves make, academic decisions.</p>

      <h2>2. Academic Governance</h2>
      <p>Authority for each governance function, as the system already enforces it (module-permission edit rights), or — where marked open — as it does not yet formally exist and needs a decision before it can be built:</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Function</th><th>Authority</th><th>How it works today</th></tr></thead>
      <tbody>
      <tr><td>Academic authority (overall)</td><td>Academy Director (oversight) → Dean (Faculty) → HoD (Department) → Programme Coordinator (Program)</td><td>Real — module edit rights at each tier</td></tr>
      <tr><td>Curriculum approval</td><td>Not formally defined</td><td>Open — no distinct "curriculum approved" state exists yet; see §9</td></tr>
      <tr><td>Course approval</td><td>Programme Coordinator submits, Head of Department approves</td><td>Real — <code>Course.approvalStatus</code> (Draft/Under Review/Approved/Returned for Revision); see Academic Regulations, Records &amp; Quality Assurance §4</td></tr>
      <tr><td>Program approval</td><td>Head of Department submits, Dean approves</td><td>Real — <code>Program.approvalStatus</code>, same workflow; see Academic Regulations, Records &amp; Quality Assurance §4</td></tr>
      <tr><td>Instructor approval</td><td>Not formally defined</td><td>Open — instructors are simply assigned to courses (<code>InstructorCourse</code>); no qualification-review or authorization step exists yet; see §7 and §9</td></tr>
      <tr><td>Assessment approval</td><td>Quality Assurance Officer</td><td>Real — <code>QualityReview</code> records against programs, courses, departments and faculties</td></tr>
      <tr><td>Academic appeals</td><td>Examinations Officer / relevant department staff</td><td>Real — <code>GRADE_APPEAL</code> request type, routed and tracked through the existing Request system</td></tr>
      <tr><td>Progression decisions</td><td>Academic Records / Examinations, per term</td><td>Real — <code>AcademicStanding</code> (Good Standing, Dean's List, Probation, Suspended) recorded per <code>TermRecord</code></td></tr>
      <tr><td>Graduation approval</td><td>Multi-office clearance, Registrar sign-off</td><td>Real — the full Graduation Clearance workflow (application → per-office clearance → approval → completion)</td></tr>
      <tr><td>Certificate approval</td><td>Automatic on completed graduation</td><td>Real — graduation documents are issued once a <code>GraduationApplication</code> reaches Completed</td></tr>
      <tr><td>Quality assurance authority</td><td>Quality Assurance Officer / Unit</td><td>Real — the same <code>QualityReview</code> mechanism above, Institute-wide</td></tr>
      </tbody>
      </table></div>

      <h2>3. Academic Departments</h2>
      <p>The Academy organizes its teaching disciplines into exactly five departments. Institutional Foundation named seven disciplines the Academy teaches (Aqidah, Qur'anic Studies, Hadith Sciences, Fiqh, Seerah, Tazkiyah, Arabic Language) — those remain the actual subjects taught; the five departments below are the administrative structure that houses them, plus one department for the broader civilizational and societal study Academic Governance adds.</p>

      <h3>Department of Islamic Studies</h3>
      <p><strong>Academic purpose:</strong> the Academy's core traditional-sciences department. <strong>Disciplinary scope:</strong> Aqidah, Hadith Sciences, Fiqh, and Seerah. <strong>Responsibilities:</strong> curriculum coherence across these four disciplines, ensuring each is taught progressively from Foundational through Specialized tier. <strong>Relationship with programs:</strong> supplies the core courses for any diploma or specialization pathway built on traditional Islamic scholarship. <strong>Relationship with courses:</strong> owns course design and sequencing for its four disciplines. <strong>Faculty responsibilities:</strong> instructor assignment and subject-matter oversight within the department. <strong>Curriculum responsibilities:</strong> proposes courses and prerequisite structure to the Programme Coordinator and Head of Department for approval.</p>

      <h3>Department of Qur'anic Studies</h3>
      <p><strong>Academic purpose:</strong> Qur'anic recitation, memorization support, and textual/exegetical study. <strong>Disciplinary scope:</strong> Tajwid, Qur'an memorization and recitation, and Tafsir (Qur'anic exegesis). <strong>Responsibilities:</strong> the learner's direct relationship with the Qur'anic text, from correct recitation through comprehension. <strong>Relationship with programs:</strong> a required strand in every general pathway, and the home department for any dedicated Qur'an-track program. <strong>Relationship with courses:</strong> owns recitation, memorization and Tafsir course design. <strong>Faculty responsibilities:</strong> qualified Qur'an instructors, including recitation-certification standards where applicable. <strong>Curriculum responsibilities:</strong> works closely with the Qur'an Memorization &amp; Recitation cross-cutting unit (§4) on delivery, while owning the academic curriculum itself.</p>

      <h3>Department of Arabic Language</h3>
      <p><strong>Academic purpose:</strong> builds the Arabic proficiency every other department's advanced study depends on. <strong>Disciplinary scope:</strong> Arabic grammar (Nahw), morphology (Sarf), vocabulary, and reading/comprehension at every learner level. <strong>Responsibilities:</strong> the Academy's language-readiness pipeline, from zero-Arabic entry to fluency. <strong>Relationship with programs:</strong> a prerequisite track feeding into every other department's advanced courses. <strong>Relationship with courses:</strong> owns Arabic-language course design and level placement. <strong>Faculty responsibilities:</strong> Arabic-language instructors and placement assessment. <strong>Curriculum responsibilities:</strong> defines the proficiency thresholds other departments can rely on when they set prerequisites.</p>

      <h3>Department of Islamic Education &amp; Tarbiyah</h3>
      <p><strong>Academic purpose:</strong> the Academy's own account of tarbiyah — character and spiritual formation — as a taught, structured discipline, plus training for learners on a teaching track. <strong>Disciplinary scope:</strong> Tazkiyah (spiritual development), Islamic pedagogy, da'wah (outreach) methodology, and teacher-preparation for learners pursuing the Specialized teaching pathway named in Institutional Foundation's Graduate Profile. <strong>Responsibilities:</strong> ensuring character formation is taught deliberately, not left implicit, and that learners who go on to teach have themselves been soundly prepared to do so. <strong>Relationship with programs:</strong> a required strand across all programs (Tazkiyah) plus a dedicated specialization track (teacher preparation). <strong>Relationship with courses:</strong> owns Tazkiyah, pedagogy, and da'wah course design. <strong>Faculty responsibilities:</strong> instructors qualified in both subject content and teaching practice. <strong>Curriculum responsibilities:</strong> coordinates with every other department when designing the teacher-preparation track, since it draws on their subject matter.</p>

      <h3>Department of Islamic Civilization &amp; Society</h3>
      <p><strong>Academic purpose:</strong> situates Islamic knowledge in its historical and contemporary context — new ground Institutional Foundation did not name as one of the seven core disciplines, added here deliberately. <strong>Disciplinary scope:</strong> Islamic history and civilization, and contemporary Muslim community issues. <strong>Responsibilities:</strong> the objectives in Institutional Foundation around community contribution, responsible leadership, and applying knowledge in service of one's community. <strong>Relationship with programs:</strong> an elective and advanced-track strand rather than a universal prerequisite. <strong>Relationship with courses:</strong> owns history and contemporary-issues course design. <strong>Faculty responsibilities:</strong> instructors with both classical grounding and contemporary awareness. <strong>Curriculum responsibilities:</strong> the natural home for any future community-facing or leadership-track program.</p>

      <blockquote><strong>What this section does and does not decide.</strong> This defines the Academy's five-department teaching structure. It does not, by itself, create or rename the live Faculty and Department records already in the system's database — that is a real operational step with real Program, Staff and Student records attached to it, and it needs your confirmation of what currently exists there before it is safe to act on. See §9.</blockquote>

      <h2>4. Cross-Cutting Units</h2>
      <p>These four units support learners and academic quality across every department, rather than owning a body of disciplinary knowledge themselves — which is exactly why they are units, not departments. A department exists because a discipline needs a home; a cross-cutting unit exists because a function (a skill, a support service, a quality check) needs to reach every department equally, and would either be duplicated five times or quietly neglected if it were left to each department separately.</p>
      <ul>
      <li><strong>Research &amp; Learning Skills Unit.</strong> Teaches the study, research and source-verification skills named as Institutional Objective 9 in Institutional Foundation — skills every department's learners need, not specific to any one discipline.</li>
      <li><strong>Student Development &amp; Academic Advising Unit.</strong> The institutional home for the Academic Advisor role (§1) and the Learner Support Philosophy from Institutional Foundation §9 — pathway guidance, accommodations, and early intervention, applied the same way regardless of which department a learner is studying in.</li>
      <li><strong>Assessment &amp; Quality Assurance Unit.</strong> The institutional home for the existing Quality Assurance Officer role and the real <code>QualityReview</code> mechanism (§2) — evaluates programs, courses, departments and faculties against Institutional Foundation's Educational Principles, Institute-wide.</li>
      <li><strong>Qur'an Memorization &amp; Recitation Unit.</strong> A dedicated support function for memorization tracking, recitation practice and certification logistics — distinct from the Department of Qur'anic Studies (§3), which owns the academic curriculum; this unit owns the ongoing practice and progress-tracking that surrounds it, in any department a learner is otherwise studying in.</li>
      </ul>
      <blockquote>None of these four exist yet as tracked records in the system — the Institute's existing <code>Unit</code> model currently represents administrative offices (Registrar, Finance, ICT, and so on), not academic support units of this kind. Implementing them as real, trackable units is a decision for §9, not something this document invents on its own.</blockquote>

      <h2>5. Responsibility Matrix</h2>
      <div class="table-wrap"><table>
      <thead><tr><th>Area</th><th>Responsible role</th><th>Escalates to</th></tr></thead>
      <tbody>
      <tr><td>Curriculum</td><td>Head of Department</td><td>Dean → Academy Director (oversight)</td></tr>
      <tr><td>Programs</td><td>Programme Coordinator</td><td>Head of Department → Dean</td></tr>
      <tr><td>Courses</td><td>Programme Coordinator / Instructor</td><td>Head of Department</td></tr>
      <tr><td>Instructors</td><td>Head of Department</td><td>Dean</td></tr>
      <tr><td>Student progression</td><td>Academic Records / Examinations Officer</td><td>Registrar</td></tr>
      <tr><td>Assessment</td><td>Instructor (delivery) / Examinations Officer (records)</td><td>Quality Assurance Officer</td></tr>
      <tr><td>Quality assurance</td><td>Quality Assurance Officer</td><td>Academy Director (oversight)</td></tr>
      <tr><td>Academic records</td><td>Registrar / Academic Administrator</td><td>Academy Director (oversight)</td></tr>
      <tr><td>Graduation</td><td>Registrar, with per-office clearance</td><td>Academy Director (oversight)</td></tr>
      </tbody>
      </table></div>
      <p>"Escalates to" reflects real module-permission scope, not a chain of command in the everyday sense — the Academy Director and Dean hold view-level oversight at the top of each row, not day-to-day operational control, matching the "designated body owns the work" principle already built into the platform's permission design.</p>

      <h2>6. Governance Committees</h2>
      <p>Six committees, kept deliberately few — this list stops short of a committee for every function, so it does not become bureaucracy for its own sake.</p>
      <ul>
      <li><strong>Academic Council.</strong> Purpose: the Academy's senior academic decision-making body. Membership: Academy Director (chair), all Deans, the Quality Assurance Officer. Authority: ratifies department structure changes, new programs, and policy set at the founder-decision level once confirmed. Decisions: binding at the Academy level. Reporting: to the Rector's office.</li>
      <li><strong>Curriculum Committee.</strong> Purpose: reviews and approves curriculum and course design before it is taught. Membership: relevant Heads of Department, Programme Coordinators for affected programs, one Research &amp; Learning Skills Unit representative. Authority: approves or returns-for-revision. Decisions: course- and program-level. Reporting: to the Academic Council.</li>
      <li><strong>Assessment Committee.</strong> Purpose: reviews assessment design for alignment with stated learning outcomes (Institutional Foundation's Alignment principle, §6). Membership: Quality Assurance Officer (chair), Examinations Officer, instructors for the courses under review. Authority: approves or requires revision of assessment instruments. Decisions: course-level. Reporting: to the Assessment &amp; Quality Assurance Unit.</li>
      <li><strong>Quality Assurance Committee.</strong> Purpose: the standing body behind the existing <code>QualityReview</code> mechanism — schedules and reviews findings across programs, courses, departments and faculties. Membership: Quality Assurance Officer (chair), one representative per Faculty. Authority: issues findings and recommendations; does not itself discipline staff. Decisions: institutional-quality findings. Reporting: to the Academic Council and the Rector's office.</li>
      <li><strong>Academic Appeals Committee.</strong> Purpose: the formal body behind grade and academic-standing appeals (the existing <code>GRADE_APPEAL</code> request type). Membership: Registrar (chair), the relevant Head of Department, one instructor not involved in the original assessment. Authority: upholds, overturns, or remands the original decision. Decisions: binding on the individual case. Reporting: to the Registrar's office and the Academic Council.</li>
      <li><strong>Scholarly Review Committee.</strong> Purpose: the body Institutional Foundation §10 requires — reviews any curriculum content bearing on Islamic rulings, positions, or interpretation before it is taught under the Academy's name. Membership: qualified scholars, named per the manhaj confirmed in Institutional Foundation §2 (Ahlus-Sunnah wal-Jama'ah, upon the understanding of the Salaf); exact composition is a founder decision (§9). Authority: approves, requires revision, or rejects religious content — the only committee whose authority Academic Council cannot override on matters of Islamic ruling. Decisions: binding on religious content specifically. Reporting: directly to the Academy Founder.</li>
      </ul>

      <h2>7. Instructor Governance</h2>
      <p>A framework for how instructors join, are authorized, and are supported — deliberately silent on specific legal or licensing requirements, which vary by jurisdiction and are not this document's to invent.</p>
      <ul>
      <li><strong>Recruitment.</strong> Sourced by the relevant Head of Department, based on the department's teaching needs (§3).</li>
      <li><strong>Qualifications.</strong> Subject-matter competence at or above the tier being taught (Institutional Foundation's Graduate Profile, §4), assessed by the Head of Department — specific credential requirements are a founder decision, not invented here.</li>
      <li><strong>Appointment.</strong> Head of Department proposes, Dean confirms — mirrors the existing Faculty/Department edit-permission tiers (§1).</li>
      <li><strong>Course authorization.</strong> Today, this is simply the <code>InstructorCourse</code> assignment (§2) — there is no separate authorization or qualification-review step yet. Formalizing one is flagged in §9.</li>
      <li><strong>Performance review.</strong> Conducted through the Assessment &amp; Quality Assurance Unit's existing <code>QualityReview</code> mechanism, scoped to the instructor's courses.</li>
      <li><strong>Professional development.</strong> Coordinated by the Head of Department. A <code>StaffDevelopmentRecord</code> model exists in the schema (training title, provider, completion date, hours, certificate) but no admin or dashboard screen reads or writes it yet — the data shape is there; the working feature is not.</li>
      <li><strong>Scholarly review.</strong> Any instructor's content bearing on Islamic rulings or positions follows Institutional Foundation §10 and the Scholarly Review Committee (§6) — never taught under the Academy's name unreviewed.</li>
      <li><strong>Teaching evaluation.</strong> Falls under the same Quality Assurance mechanism as performance review, applied per course rather than per instructor overall.</li>
      </ul>

      <h2>8. Academic Decision-Making Workflow</h2>
      <p>How a curriculum decision actually moves through the structure above, applying Institutional Foundation's Governing Design Rule (Departments organize disciplines, Programs organize pathways, Courses organize experiences, Assessments provide evidence, Quality Assurance evaluates and improves):</p>
      <ol>
      <li>An Instructor or Programme Coordinator identifies a curriculum need within their Department.</li>
      <li>The proposal goes to the Curriculum Committee (§6) for review against Institutional Foundation's Educational Principles (§6 of that document) and the Academic Design Rules (§8 of that document).</li>
      <li>If it touches Islamic rulings, positions, or interpretation, it also goes to the Scholarly Review Committee before it can be taught — never after.</li>
      <li>The Head of Department and Dean confirm it fits departmental and Faculty structure (§1, §3).</li>
      <li>The Academy Director holds oversight visibility throughout, without operational sign-off at this stage — consistent with the view-only design in §1.</li>
      <li>Once taught, the Assessment &amp; Quality Assurance Unit reviews outcomes on the Institute's normal QA cycle (Institutional Foundation §1, Quality Culture) and findings return to the Curriculum Committee for any revision.</li>
      </ol>
      <p>This workflow describes intended practice. The formal "approved" states referenced in §2 and §9 do not yet exist as enforced system states — today, this workflow is carried out by people using the edit permissions already in place, not enforced by the software itself.</p>

      <h2>9. Decisions That Must Be Confirmed by the Academy Founder</h2>
      <p>Continuing Institutional Foundation's numbering. These cannot be responsibly invented or implemented without your confirmation.</p>
      <ol start="13">
      <li><strong>Live department restructuring — done.</strong> Nothing existed yet, so the real Faculty ("Ulul Azm Academy") and its five Departments were created directly, matching §3 exactly — no reorganization of existing data was needed.</li>
      <li><strong>Correction applied: course and program approval are now real, enforced states — action taken, not open.</strong> §2: a Course/Program now genuinely moves Draft → Under Review → Approved (or Returned for Revision), enforced by <code>Course.approvalStatus</code> / <code>Program.approvalStatus</code>, not just tracked informally through edit permissions. See Academic Regulations, Records &amp; Quality Assurance §4 for the full workflow and portals.</li>
      <li><strong>Curriculum-level approval and instructor qualification approval remain informal — open.</strong> §2: this is narrower than the original item above. A Course and a Program each now have a real approval state (previous item), but there is still no distinct "curriculum approved" state above the individual course level, and no qualification-review or authorization step beyond simply assigning an instructor to a course via <code>InstructorCourse</code>. Formalizing either would need its own schema change and is a founder-level decision this document does not make by extension.</li>
      <li><strong>Committees as real, tracked records — open.</strong> §6 describes six committees. None exist as data in the system yet — right now they are policy, not software. Confirm if you want them implemented as real, trackable records (also a schema migration).</li>
      <li><strong>Cross-cutting units as real, tracked records — open.</strong> Same as above for the four units in §4 — the existing <code>Unit</code> model doesn't fit them without a schema change.</li>
      <li><strong>Scholarly Review Committee membership — open.</strong> Who specifically sits on it, and their scope of authority relative to the Academy Director and Academic Council.</li>
      <li><strong>Instructor qualification requirements — open.</strong> Specific credential or licensing requirements per subject area, deliberately not invented here.</li>
      </ol>
      <p><em>Ulul Azm Academy — Academic Governance &amp; Organizational Structure. Prepared for Founder review. The Academy Director role and its permissions are already live in the system; the department, committee and cross-cutting-unit structures above are confirmed design, awaiting the schema and data decisions in this section before they become real, tracked functionality.</em></p>
    `.trim(),
  },
  'academy-pathways': {
    title: 'Academy Pathways',
    bodyHtml: `
      <p><strong>Academic Pathways &amp; Qualification Framework.</strong> The Ulul Azm Academy Foundation establishes the Academy's identity, educational philosophy, and guiding principles. This document explains the academic pathways through which learners progress and the qualification framework associated with those pathways.</p>
      <p>The Academy uses five academic pathways:</p>
      <ol>
      <li>Foundation Studies</li>
      <li>Intermediate Islamic Studies</li>
      <li>Advanced Islamic Studies</li>
      <li>Diploma in Islamic Studies</li>
      <li>Specialized Certificate Programs</li>
      </ol>
      <p>These pathways correspond to progressively developing levels of competence, from foundational learning to focused specialization.</p>
      <p>This framework defines the pathways and their intended academic characteristics. It does not, by itself, constitute a complete course catalogue. Specific course lists, detailed syllabi, term schedules, and exact credit-hour requirements are established through the Academy's academic development and approval processes.</p>
      <p>The Academy does not claim external accreditation or recognition through this framework. Qualifications described here are Academy-issued unless and until applicable external recognition is formally obtained.</p>

      <h2>1. Academic Pathway Framework</h2>

      <h3>1.1 Foundation Studies</h3>
      <p><strong>Purpose.</strong> To establish the essential Islamic knowledge, Qur'an reading ability, introductory Arabic, character, and study habits required for further structured learning.</p>
      <p><strong>Intended learners.</strong> Learners with little or no prior structured Islamic education, including learners beginning their studies from the ground level.</p>
      <p><strong>Entry requirements.</strong> There is no prior Islamic Studies qualification required. Basic literacy, willingness to learn, and participation in the placement or readiness process are expected.</p>
      <p><strong>Academic depth.</strong> Introductory and deliberately focused. The pathway establishes a strong foundation rather than attempting to cover advanced disciplines.</p>
      <p><strong>Expected competencies.</strong> Basic Islamic knowledge relevant to belief and worship; correct reading of the Arabic script of the Qur'an; foundational Tajweed; basic Arabic vocabulary and introductory grammar; Islamic character and adab; basic study skills, including learning habits, note-taking, and preparation for assessment.</p>
      <p><strong>Duration and intensity.</strong> Foundation is intended to be the shortest pathway, with light-to-moderate study intensity. Exact term and credit-hour requirements are to be determined through the course catalogue.</p>
      <p><strong>Assessment.</strong> Competency-based assessment, including demonstrated recitation, basic knowledge checks, study tasks, and appropriate observation of character and adab during learning.</p>
      <p><strong>Progression.</strong> Successful completion normally leads to Intermediate Islamic Studies. Direct placement into a higher pathway may be considered through the Academy's evidence-based placement process.</p>
      <p><strong>Completion and award.</strong> Learners must demonstrate competence across the required Foundation areas; attendance alone is not sufficient. Successful completion leads to the <strong>Certificate of Foundation Studies</strong>, issued by the Academy.</p>

      <h3>1.2 Intermediate Islamic Studies</h3>
      <p><strong>Purpose.</strong> To develop learners from foundational knowledge toward systematic and connected understanding of the core Islamic disciplines.</p>
      <p><strong>Intended learners.</strong> Learners who have completed Foundation Studies or who demonstrate equivalent competence through the approved placement process.</p>
      <p><strong>Entry requirements.</strong> Completion of Foundation Studies or demonstrated equivalent readiness.</p>
      <p><strong>Academic depth.</strong> Systematic and more connected than Foundation. Learners develop structured knowledge across core disciplines and begin to apply and explain what they have learned.</p>
      <p><strong>Expected competencies.</strong> Systematic Islamic knowledge, including structured study of ʿAqidah, Fiqh, and Hadith; stronger Qur'an reading and recitation, with introductory comprehension; developing Arabic grammar and vocabulary; introductory Islamic history and civilization; clear communication of learned material in writing and speech; early leadership and responsibility, such as peer support or small-group participation; introductory analytical skills within an Islamic epistemological framework.</p>
      <p><strong>Duration and intensity.</strong> Longer than Foundation and shorter than Advanced, normally involving a multi-term sequence. Exact duration and credit-hour requirements are to be established through the course catalogue. Study intensity is moderate.</p>
      <p><strong>Assessment.</strong> A combination of knowledge assessments and applied tasks, including appropriate communication and explanation of learned material.</p>
      <p><strong>Progression.</strong> Successful completion normally leads to Advanced Islamic Studies. Controlled direct placement may be considered where equivalent competence is demonstrated.</p>
      <p><strong>Completion and award.</strong> Learners must demonstrate competence across the required Intermediate areas. Successful completion leads to the <strong>Certificate of Intermediate Islamic Studies</strong>, issued by the Academy.</p>

      <h3>1.3 Advanced Islamic Studies</h3>
      <p><strong>Purpose.</strong> To develop deeper disciplinary understanding, more independent study, direct engagement with primary texts, analytical ability, and preparation for the Diploma or a focused specialization.</p>
      <p><strong>Intended learners.</strong> Learners who have completed Intermediate Islamic Studies or who demonstrate equivalent competence through approved placement.</p>
      <p><strong>Entry requirements.</strong> Completion of Intermediate Islamic Studies or demonstrated equivalent readiness.</p>
      <p><strong>Academic depth.</strong> Advanced study with greater independence and engagement with primary sources. Learners follow scholarly arguments and their methodologies while remaining within established scholarship.</p>
      <p><strong>Expected competencies.</strong> Deeper engagement with Islamic sciences, including ʿAqidah, Fiqh, Hadith, and Seerah; stronger Arabic and direct engagement with relevant source texts; analytical thinking and responsible reasoning within the Academy's stated methodology; an introductory area of selected specialization; engagement with Islamic thought and the broader intellectual tradition; research preparation, including foundational source-verification skills.</p>
      <p><strong>Duration and intensity.</strong> Comparable to or somewhat longer than Intermediate, with exact duration and credit-hour requirements established at the course-catalogue stage. Study intensity is moderate to high, with increased independent reading and source engagement.</p>
      <p><strong>Assessment.</strong> Assessment emphasizes source engagement, analytical tasks, and demonstrated understanding rather than recall alone.</p>
      <p><strong>Progression.</strong> Successful completion normally prepares learners for the Diploma in Islamic Studies. Learners may also apply for a Specialized Certificate pathway when they meet that certificate's specific entry requirements.</p>
      <p><strong>Completion and award.</strong> Learners must demonstrate competence across the required Advanced areas, including their selected area of early specialization. Successful completion leads to the <strong>Certificate of Advanced Islamic Studies</strong>, issued by the Academy.</p>

      <h3>1.4 Diploma in Islamic Studies</h3>
      <p><strong>Purpose.</strong> The Diploma is the Academy's integrated, principal general qualification. It is designed as a coherent academic pathway rather than an unrelated collection of courses.</p>
      <p><strong>Intended learners.</strong> Learners who have completed Advanced Islamic Studies or who demonstrate equivalent competence through a comprehensive placement assessment.</p>
      <p><strong>Entry requirements.</strong> Completion of Advanced Islamic Studies or demonstrated equivalent competence across the required prior learning.</p>
      <p><strong>Academic depth.</strong> Integrated study across the Academy's contributing academic areas, with greater independence, application, and research preparation.</p>
      <p><strong>Academic areas.</strong> Islamic Studies (core disciplinary study, including ʿAqidah, Fiqh, Hadith, and Seerah); Qur'anic Studies (continued recitation, memorization development where applicable, and engagement with Tafsir); Arabic Language (development of proficiency to support direct engagement with relevant sources); Islamic Education &amp; Tarbiyah (continued attention to character formation, educational understanding, and responsible development); Islamic Civilization &amp; Society (historical, civilizational, and relevant contemporary context); Research &amp; Learning Skills (research preparation and source-verification skills, potentially developed into a defined research or capstone component).</p>
      <p><strong>Duration and intensity.</strong> The Diploma is intended to be the longest and most demanding general pathway. Exact term and credit-hour requirements are to be established through the course catalogue.</p>
      <p><strong>Assessment.</strong> Assessment is comprehensive and integrative. Learners must demonstrate that they can connect and apply learning across the contributing academic areas, rather than merely pass isolated courses without demonstrating integrated competence.</p>
      <p><strong>Progression.</strong> The Diploma may prepare learners for further specialized study, including a Specialized Certificate, or for responsible application and service within the scope of their learning and qualifications.</p>
      <p><strong>Completion and award.</strong> Learners must demonstrate integrated competence across the required areas and meet the Academy's approved completion standard. Successful completion leads to the <strong>Diploma in Islamic Studies</strong>, issued by the Academy.</p>
      <p>This is an Academy-issued qualification. It should not be described as externally accredited unless and until such accreditation or recognition has been formally obtained.</p>

      <h3>1.5 Specialized Certificate Programs</h3>
      <p><strong>Purpose.</strong> To provide focused, single-area learning and demonstrated competence beyond the general pathway, for learners seeking depth in a particular field.</p>
      <p><strong>Intended learners.</strong> Learners who have completed Advanced Islamic Studies or the Diploma, subject to the specific entry requirements of the certificate concerned.</p>
      <p><strong>Entry requirements.</strong> Requirements vary by certificate. Each certificate must have its own stated prerequisite and, where appropriate, a certificate-specific placement or readiness assessment.</p>
      <p><strong>Academic depth.</strong> Focused and deeper within a defined area, rather than broad across the general Islamic Studies pathway.</p>
      <p><strong>Expected competencies.</strong> Competencies are specific to each certificate and must be defined when the certificate is designed and approved.</p>
      <p><strong>Duration and intensity.</strong> Specialized Certificates are generally shorter and more focused than the Diploma. Duration and intensity depend on the subject and the approved learning outcomes.</p>
      <p><strong>Assessment.</strong> Learners must demonstrate mastery of the specific competency named by the certificate. Assessment methods and completion standards are defined for each approved certificate.</p>
      <p><strong>Progression and awards.</strong> A certificate is a focused award in its named area. A learner may complete more than one Specialized Certificate over time. The award should identify the specific competency or area of study rather than imply a broader qualification than was earned.</p>

      <h2>2. Foundation Studies: Scope and Competencies</h2>
      <p>Foundation Studies is deliberately limited in scope. It establishes six essential areas:</p>
      <ol>
      <li><strong>Basic Islamic Knowledge:</strong> Essential introductory knowledge relevant to belief and worship, presented in an accessible and appropriately sourced manner.</li>
      <li><strong>Qur'an Reading:</strong> The ability to read the Arabic script of the Qur'an correctly.</li>
      <li><strong>Foundational Tajweed:</strong> Introductory rules that support correct recitation, without overloading the entry pathway with advanced articulation or narration differences.</li>
      <li><strong>Basic Arabic:</strong> Introductory vocabulary and grammar that establish a starting point for further language learning, not a claim of fluency.</li>
      <li><strong>Islamic Character and Adab:</strong> Manners and conduct treated as an intentional part of learning, consistent with the Foundation's educational sequence of knowledge, understanding, character, practice, and service.</li>
      <li><strong>Basic Study Skills:</strong> Learning habits, note-taking, preparation, and basic assessment readiness needed for subsequent study.</li>
      </ol>
      <p>Foundation is not intended to include advanced disciplines such as Hadith methodology, Usul al-Fiqh, or comparative Fiqh. Its purpose is to provide a genuine entry point for learners beginning from little or no prior structured Islamic education.</p>

      <h2>3. Intermediate Islamic Studies: Scope and Competencies</h2>
      <p>Intermediate develops the Foundation areas into systematic learning and introduces additional competencies:</p>
      <ul>
      <li><strong>Systematic Islamic Knowledge:</strong> Structured and connected study of ʿAqidah, Fiqh, and Hadith rather than disconnected facts.</li>
      <li><strong>Stronger Qur'an Competence:</strong> Improved recitation fluency and introductory comprehension.</li>
      <li><strong>Developing Arabic:</strong> Grammar and vocabulary that progressively reduce dependence on translation.</li>
      <li><strong>Islamic History and Civilization:</strong> Structured introduction to the relevant subject area.</li>
      <li><strong>Communication:</strong> Clear written and spoken explanation of learned material.</li>
      <li><strong>Leadership:</strong> Early responsibility, such as peer support and small-group participation, without presuming readiness for formal teaching.</li>
      <li><strong>Introductory Analysis:</strong> Initial development of reasoning within an Islamic epistemological framework, still supported by guidance and instruction.</li>
      </ul>

      <h2>4. Advanced Islamic Studies: Scope and Competencies</h2>
      <p>Advanced develops learners toward greater independence through:</p>
      <ul>
      <li><strong>Deeper Islamic Sciences:</strong> More substantial study of ʿAqidah, Fiqh, Hadith, and Seerah, including engagement with scholarly argument and methodology.</li>
      <li><strong>Arabic and Source Engagement:</strong> Improved ability to engage primary texts directly rather than relying exclusively on secondary summaries or translations.</li>
      <li><strong>Analytical Thinking:</strong> Reasoning within the Academy's established methodology, with appropriate recognition of the boundaries of independent study.</li>
      <li><strong>Selected Specialization:</strong> An initial area of focused study that may prepare the learner for a later Specialized Certificate.</li>
      <li><strong>Islamic Thought:</strong> Engagement with the wider intellectual tradition, not limited to rulings alone.</li>
      <li><strong>Research Preparation:</strong> Foundational research, reading, and source-verification skills in preparation for the Diploma's Research &amp; Learning Skills component.</li>
      </ul>

      <h2>5. Diploma: Integrated Academic Identity</h2>
      <p>The Diploma is a defined qualification drawing on the Academy's academic areas and a cross-cutting Research &amp; Learning Skills component.</p>
      <p>Its structure should connect the contributing disciplines into one coherent learning pathway. Arabic and Islamic Studies prerequisites should be sequenced before courses that depend on them. The course list, term structure, and detailed learning outcomes are established through the Academy's academic development and approval processes.</p>
      <p><strong>Expected Graduate Competencies.</strong> A Diploma graduate is expected to have demonstrated: integrated learning across the required academic areas; appropriate engagement with primary texts; competence in the approved learning outcomes and assessments; research preparation and source-verification skills appropriate to the qualification; the character and adab expected throughout the Academy's pathways; and readiness to explain, apply, and responsibly convey learned material within the limits of the graduate's actual competence.</p>
      <p>The Diploma should prepare learners for responsible community contribution and, where further requirements are met, continued specialized study. It should not be represented as conferring scholarly authority or teaching qualification beyond what the Academy has explicitly established.</p>

      <h2>6. Specialized Certificate Areas and Approval</h2>
      <p>The Academy's initial Specialized Certificate course areas are:</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Academic area</th><th>Initial certificate course areas</th></tr></thead>
      <tbody>
      <tr><td>Qur'anic Studies</td><td>Tajweed; Qur'an Recitation; Hifz (memorization); Tafsir</td></tr>
      <tr><td>Islamic Studies</td><td>Hadith; Fiqh</td></tr>
      <tr><td>Arabic Language</td><td>Arabic; Qur'anic Arabic</td></tr>
      <tr><td>Islamic Education &amp; Tarbiyah</td><td>Islamic Education; Da'wah</td></tr>
      <tr><td>Islamic Civilization &amp; Society</td><td>Islamic History/Civilization</td></tr>
      </tbody>
      </table></div>
      <p>These areas form the initial course offering under the Specialized Certificate pathway. They should not be misrepresented as individually approved, fully specified qualifications unless each has separately completed the required design and approval process.</p>
      <p><strong>Requirements for New Specialized Certificates.</strong> A proposed certificate should: define one clear, focused competency outcome rather than replicate an existing pathway; identify its academic owner; state its own entry prerequisite; specify its assessment method and completion standard; avoid unnecessary duplication or overlap with existing pathway requirements; receive qualified scholarly review where its content concerns Islamic rulings, positions, or interpretation; and complete the Academy's applicable curriculum review and approval process before being taught under the Academy's name.</p>

      <h2>7. Entry, Placement, and Recognition of Prior Learning</h2>
      <p>Placement is based on evidence of prior learning and readiness, not age. Relevant evidence may include: previous Islamic and general education; existing Islamic Studies knowledge; Qur'an reading ability; Tajweed level; Hifz progress, where relevant; Arabic proficiency; and general learning readiness.</p>
      <p><strong>Entry by Pathway.</strong></p>
      <ul>
      <li><strong>Foundation Studies:</strong> The default entry pathway for learners without prior structured Islamic education. A short readiness assessment helps confirm the appropriate starting point and is not intended to create an unnecessary barrier to entry.</li>
      <li><strong>Intermediate Islamic Studies:</strong> Entry normally follows Foundation completion. Direct placement may be considered when an assessment demonstrates equivalent competence.</li>
      <li><strong>Advanced Islamic Studies:</strong> Entry normally follows Intermediate completion. Direct placement may be considered when equivalent competence is demonstrated.</li>
      <li><strong>Diploma in Islamic Studies:</strong> Entry normally follows Advanced completion. Direct placement requires a comprehensive assessment against the required prior competencies and a higher evidentiary standard.</li>
      <li><strong>Specialized Certificate Programs:</strong> Entry depends on the specific certificate's approved prerequisite and any certificate-specific readiness assessment.</li>
      </ul>
      <p><strong>Recognition of Prior Learning.</strong> Recognition of prior learning (RPL) is evidence-based. A learner's self-report alone is not sufficient to establish equivalent competence or award a qualification. Prior learning should be assessed through the Academy's applicable placement process, documented in the learner's academic record, and reviewed by the appropriate academic personnel. RPL provides a controlled route to appropriate placement; it is not an automatic award of an Academy qualification.</p>

      <h2>8. Progression and Completion</h2>
      <p>Progression between pathways depends on demonstrated achievement and readiness. Relevant requirements include: demonstration of the required competencies for the current pathway; meeting the applicable academic standing requirements; completing the prerequisites required for the next stage; meeting the pathway's approved completion and assessment standards; and following the controlled placement process where direct entry or a pathway exception is considered.</p>
      <p>A learner who has not yet met the required standard should receive appropriate academic guidance and support. Where applicable, probation, remediation, additional instruction, or reassessment may provide a route toward meeting the requirements.</p>
      <p>Support should help learners reach the standard; it should not silently change the standard or permit progression without the required evidence.</p>

      <h2>9. Qualification Framework at a Glance</h2>
      <div class="table-wrap"><table>
      <thead><tr><th>Dimension</th><th>Foundation</th><th>Intermediate</th><th>Advanced</th><th>Diploma</th><th>Specialized Certificate</th></tr></thead>
      <tbody>
      <tr><td><strong>Purpose</strong></td><td>Entry and essentials</td><td>Systematic knowledge</td><td>Independent depth</td><td>Integrated qualification</td><td>Focused competence</td></tr>
      <tr><td><strong>Knowledge depth</strong></td><td>Introductory</td><td>Systematic</td><td>Deep and source-engaged</td><td>Integrated across academic areas</td><td>Deep in a defined area</td></tr>
      <tr><td><strong>Skills</strong></td><td>Reading, basic Tajweed, adab, study skills</td><td>Communication and introductory analysis</td><td>Analysis and research preparation</td><td>Integrated application and research</td><td>Certificate-specific mastery</td></tr>
      <tr><td><strong>Independence</strong></td><td>Fully guided</td><td>Guided</td><td>Largely independent</td><td>Independent within requirements</td><td>Independent within defined scope</td></tr>
      <tr><td><strong>Assessment</strong></td><td>Competency checks</td><td>Knowledge and applied tasks</td><td>Source engagement and analysis</td><td>Comprehensive and integrative</td><td>Mastery of named competencies</td></tr>
      <tr><td><strong>Award</strong></td><td>Certificate of Foundation Studies</td><td>Certificate of Intermediate Islamic Studies</td><td>Certificate of Advanced Islamic Studies</td><td>Diploma in Islamic Studies</td><td>Named Specialized Certificate</td></tr>
      </tbody>
      </table></div>

      <h2>10. Principles for Future Programs</h2>
      <p>All future academic programs should fit within one of the five established pathways or qualify as an approved Specialized Certificate. The Academy should not create an additional pathway category without an appropriate institutional decision.</p>
      <p>Program duration and intensity should be set according to the pathway's purpose and academic level, rather than copied from an unrelated program.</p>
      <p>Every entrant should be placed through the evidence-based placement framework. A program drawing on multiple academic areas should state its academic identity and explain how those areas contribute to its outcomes.</p>
      <p>The Academy should revisit this framework as real enrollment, learning, and assessment evidence becomes available, in keeping with its institutional commitment to continuous improvement.</p>

      <h2>11. Qualification and Recognition Statement</h2>
      <p>The qualifications described in this framework are awards issued by Ulul Azm Academy under its own academic structure. This document does not establish or claim external accreditation, government recognition, equivalency, or transferability.</p>
      <p>Any future statement about external recognition should be based on formal, verifiable approval and should accurately describe its scope.</p>

      <h2>12. Framework Review</h2>
      <p>This framework is intended to guide the Academy's academic development. It may be reviewed and refined through the Academy's established governance and quality-assurance processes as programs, courses, assessment arrangements, and institutional experience develop.</p>
      <p>Changes should preserve the Academy Foundation's educational philosophy, placement principles, academic integrity, and scholarly-review requirements.</p>

      <p><em>Ulul Azm Academy — Academic Pathways &amp; Qualification Framework.</em></p>
    `.trim(),
  },
  'academy-curriculum': {
    title: 'Academy Curriculum',
    bodyHtml: `
      <p><strong>Program Architecture &amp; Curriculum Framework.</strong> The Institutional Foundation, Academic Governance, and Academic Pathways documents are fixed foundations here, not renegotiated. This document turns the Academic Pathways framework's five pathways into a real curriculum shape — what each program actually contains, in what order, with what prerequisites — using temporary course-code placeholders. No weekly syllabi, and no final course catalogue, yet.</p>

      <h2>1. Program Design Principle</h2>
      <p>Every program in the Academy — pathway or Specialized Certificate — must define all eleven of the following before it is taught. None are optional, but not every program draws courses from every department:</p>
      <ul>
      <li><strong>Clear purpose</strong> — stated once, in one sentence, matching its pathway definition in Academic Pathways.</li>
      <li><strong>Target learner</strong> — matching Academic Pathways's Intended Learner Profile for that pathway.</li>
      <li><strong>Entry requirements</strong> — matching Academic Pathways §8's placement framework, never invented fresh per program.</li>
      <li><strong>Program learning outcomes (PLOs)</strong> — measurable, using only the categories relevant to that program (§5).</li>
      <li><strong>Study plan</strong> — the actual course sequence (§6).</li>
      <li><strong>Core courses</strong> — required for everyone on the program.</li>
      <li><strong>Electives, where appropriate</strong> — not required for every program; Foundation and Intermediate have none (§4).</li>
      <li><strong>Prerequisites</strong> — course-to-course, not just pathway-to-pathway (§7).</li>
      <li><strong>Assessment</strong> — matching Academic Pathways's Assessment Expectations for that pathway.</li>
      <li><strong>Progression</strong> — matching Academic Pathways §9.</li>
      <li><strong>Completion requirements</strong> — matching Academic Pathways's Completion Requirements for that pathway.</li>
      </ul>
      <blockquote><strong>Deliberately not every department, every time.</strong> A program draws only the departments its purpose actually needs. Foundation Studies does not need Islamic Civilization &amp; Society; the Diploma does. Forcing every department into every program would violate Academic Governance's Academic Design Rule against creating courses "simply to make departments look symmetrical."</blockquote>

      <h2>2. Curriculum Structure</h2>

      <h3>Foundation Studies Curriculum</h3>
      <p>Five areas, matching Academic Pathways §3 exactly, each with one anchor course: Islamic foundations, Qur'an (reading, then Tajweed), foundational Arabic, adab/character, and basic learning skills. See §6 for the course table.</p>

      <h3>Intermediate Curriculum</h3>
      <p>Expands each Foundation area into a systematic course, and adds three new ones matching Academic Pathways §4: history/civilization, leadership/communication, and introductory analytical skills. Seerah and Tazkiyah — named as core disciplines in Institutional Foundation but not broken out in Academic Pathways's own field list — get their first dedicated courses here rather than being left implicit inside "Islamic foundations."</p>

      <h3>Advanced Curriculum</h3>
      <p>Deepens every Intermediate discipline (Aqeedah, Fiqh, Tajweed, Arabic, Civilization) into its advanced form, adds Hadith Sciences and Tafsir as new dedicated disciplines (both assumed by Institutional Foundation's Graduate Profile but not yet given a course home before this document), and introduces the first point of learner choice — one specialization elective, previewing §7's Specialized Certificate track.</p>

      <h3>Diploma Curriculum</h3>
      <p>A balanced structure integrating Islamic Studies, Qur'anic Studies, Arabic Language, and — through two electives — a choice between Islamic Education &amp; Tarbiyah (teaching track) or Islamic Civilization &amp; Society (community track), plus a Research &amp; Learning Skills capstone that every Diploma learner completes regardless of track. This is the "integrated, not a bundle of unrelated courses" structure Academic Pathways §6 requires.</p>

      <h3>Specialized Certificate Framework</h3>
      <p>A certificate is not a shrunken pathway — it is three to five focused courses in one discipline, entirely core (no electives, by definition), ending in a mastery assessment of the one competency it names. Academic Pathways §7's approval criteria still govern which certificates actually get built; this document only fixes the shape every approved certificate will share.</p>

      <h2>3. Curriculum Coherence</h2>
      <p>What each discipline is doing at each level — repetition across levels is only ever the intentionally progressive kind Academic Pathways describes (introductory → systematic → deep → integrated), never the same ground covered twice at the same depth.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Discipline</th><th>Foundation</th><th>Intermediate</th><th>Advanced</th><th>Diploma</th></tr></thead>
      <tbody>
      <tr><td>Aqeedah</td><td>Introduced</td><td>Developed (systematic)</td><td>Deepened (independent)</td><td>—</td></tr>
      <tr><td>Fiqh</td><td>Introduced</td><td>Developed (systematic)</td><td>Deepened (Usul al-Fiqh)</td><td>Mastered (comparative)</td></tr>
      <tr><td>Hadith</td><td>—</td><td>—</td><td>Introduced &amp; developed</td><td>Mastered (methodology)</td></tr>
      <tr><td>Seerah</td><td>—</td><td>Introduced</td><td>—</td><td>—</td></tr>
      <tr><td>Qur'an reading &amp; Tajweed</td><td>Introduced</td><td>Developed (applied)</td><td>Mastered</td><td>—</td></tr>
      <tr><td>Tafsir</td><td>—</td><td>Comprehension introduced</td><td>Developed</td><td>Mastered</td></tr>
      <tr><td>Arabic</td><td>Introduced</td><td>Developed (grammar I)</td><td>Deepened (grammar II)</td><td>Mastered (source reading)</td></tr>
      <tr><td>Islamic Civilization &amp; History</td><td>—</td><td>Introduced</td><td>Deepened (Islamic social thought)</td><td>Developed (contemporary issues, elective)</td></tr>
      <tr><td>Character, Adab &amp; Tazkiyah</td><td>Introduced</td><td>Developed</td><td>—</td><td>—</td></tr>
      <tr><td>Communication &amp; Leadership</td><td>—</td><td>Introduced</td><td>—</td><td>—</td></tr>
      <tr><td>Research &amp; Study Skills</td><td>Introduced (basic)</td><td>Developed (analytical)</td><td>Deepened (research prep)</td><td>Mastered (capstone)</td></tr>
      </tbody>
      </table></div>
      <p>Aqeedah, Tajweed, and Communication/Leadership deliberately stop being taught as their own course past a certain level — not a gap, but the point at which that competency is assumed and exercised through the remaining coursework rather than taught again.</p>

      <h2>4. Core/Elective Structure</h2>
      <ul>
      <li><strong>Foundation Studies:</strong> entirely core. Too early in a learner's path for meaningful choice.</li>
      <li><strong>Intermediate Islamic Studies:</strong> entirely core. Still building the common base every later track depends on.</li>
      <li><strong>Advanced Islamic Studies:</strong> core, plus one specialization elective — the first real choice point, previewing a Specialized Certificate.</li>
      <li><strong>Diploma in Islamic Studies:</strong> core integrative courses, plus a two-way elective (teaching track vs. community track), plus a practical requirement (community contribution, Institutional Foundation Objective 10) and a research requirement (the capstone) — both mandatory, neither elective.</li>
      <li><strong>Specialized Certificate:</strong> entirely core within its one discipline, by definition (§2).</li>
      </ul>
      <blockquote>Electives exist at exactly two points — one in Advanced, one in the Diploma — each attached to a real decision a learner is actually making (a specialization, a track). No elective is added anywhere else merely to look like a fuller program.</blockquote>

      <h2>5. Program Learning Outcomes</h2>
      <p>Measurable outcomes per pathway, using only the categories that actually apply at that level:</p>

      <h3>Foundation Studies PLOs</h3>
      <ul>
      <li><strong>Knowledge:</strong> recall essential Aqeedah and Fiqh accurately.</li>
      <li><strong>Qur'anic competence:</strong> read Qur'anic Arabic correctly, applying foundational Tajweed rules.</li>
      <li><strong>Arabic competence:</strong> recognize basic vocabulary and sentence structure.</li>
      <li><strong>Ethical responsibility:</strong> demonstrate Islamic adab consistently in conduct and interaction.</li>
      </ul>

      <h3>Intermediate Islamic Studies PLOs</h3>
      <ul>
      <li><strong>Knowledge:</strong> explain Aqeedah and Fiqh systematically, with supporting evidence.</li>
      <li><strong>Understanding:</strong> situate a given Islamic ruling or event within its historical context.</li>
      <li><strong>Application:</strong> apply learned rulings correctly to familiar, everyday situations.</li>
      <li><strong>Qur'anic competence:</strong> recite fluently with applied Tajweed; demonstrate basic comprehension.</li>
      <li><strong>Arabic competence:</strong> read intermediate texts with grammatical understanding.</li>
      <li><strong>Communication:</strong> explain what has been learned clearly to a non-specialist.</li>
      </ul>

      <h3>Advanced Islamic Studies PLOs</h3>
      <ul>
      <li><strong>Knowledge:</strong> engage primary Hadith and Fiqh texts directly, in their original structure.</li>
      <li><strong>Understanding:</strong> follow a scholarly argument and identify its underlying methodology.</li>
      <li><strong>Application:</strong> apply rulings responsibly within an established framework, without originating new ones.</li>
      <li><strong>Analysis:</strong> reason independently within the Academy's manhaj, distinguishing settled matters from genuine scholarly difference.</li>
      <li><strong>Qur'anic competence:</strong> engage introductory Tafsir texts directly.</li>
      <li><strong>Arabic competence:</strong> read advanced-grammar texts with minimal reliance on translation.</li>
      <li><strong>Research:</strong> carry out basic source verification, correctly attributing a position to its source.</li>
      </ul>

      <h3>Diploma in Islamic Studies PLOs</h3>
      <ul>
      <li><strong>Knowledge:</strong> integrate Aqeedah, Fiqh, Hadith and Tafsir at diploma-level depth.</li>
      <li><strong>Understanding:</strong> situate Islamic knowledge within both its classical and contemporary context.</li>
      <li><strong>Application:</strong> apply integrated knowledge responsibly to real community questions.</li>
      <li><strong>Analysis:</strong> critically evaluate competing scholarly positions and the evidence behind them.</li>
      <li><strong>Communication:</strong> present findings clearly, in writing and in speech, to both specialist and general audiences.</li>
      <li><strong>Ethical responsibility:</strong> demonstrate character and adab as inseparable from academic standing, per Institutional Foundation's Graduate Profile.</li>
      <li><strong>Qur'anic competence:</strong> engage Tafsir and textual analysis independently.</li>
      <li><strong>Arabic competence:</strong> compose and comprehend at a level supporting independent source engagement.</li>
      <li><strong>Teaching/leadership</strong> <em>(teaching-track electives only):</em> demonstrate readiness to responsibly transmit knowledge to others.</li>
      <li><strong>Research:</strong> complete a capstone research project meeting the Academy's evidentiary standard.</li>
      </ul>
      <p><strong>Specialized Certificate PLOs</strong> are certificate-specific, set at approval per Academic Pathways §7 — not generic here.</p>

      <h2>6. Study Plans</h2>
      <blockquote>Course codes below have been updated to the Academy's permanent coding system, finalized by Course Catalogue (Course Catalogue) — closing decision 23. They originally used temporary <code>[PATHWAY]-[DEPT]-[SEQ]</code> placeholders; Course Catalogue explains the final <code>[DEPT]-[LEVEL][SEQ]</code> format and recodes every course. "Units" are still placeholders, pending Academic Pathways decision 19 / Curriculum Framework decision 22.</blockquote>

      <h3>Foundation Studies — study plan</h3>
      <div class="table-wrap"><table>
      <thead><tr><th>Code</th><th>Course</th><th>Department</th><th>Level</th><th>Units</th><th>Prerequisite</th><th>Core/Elective</th><th>Sequence</th></tr></thead>
      <tbody>
      <tr><td>IS-101</td><td>Islamic Foundations</td><td>Islamic Studies</td><td>Foundation</td><td>3</td><td>—</td><td>Core</td><td>1</td></tr>
      <tr><td>QS-101</td><td>Qur'an Reading Foundations</td><td>Qur'anic Studies</td><td>Foundation</td><td>3</td><td>—</td><td>Core</td><td>1</td></tr>
      <tr><td>QS-102</td><td>Tajweed Foundations</td><td>Qur'anic Studies</td><td>Foundation</td><td>2</td><td>QS-101</td><td>Core</td><td>2</td></tr>
      <tr><td>AR-101</td><td>Arabic Foundations</td><td>Arabic Language</td><td>Foundation</td><td>3</td><td>—</td><td>Core</td><td>1</td></tr>
      <tr><td>IE-101</td><td>Islamic Character &amp; Adab</td><td>Islamic Education &amp; Tarbiyah</td><td>Foundation</td><td>2</td><td>—</td><td>Core</td><td>1</td></tr>
      <tr><td>RL-101</td><td>Basic Study Skills</td><td>Research &amp; Learning Skills (unit)</td><td>Foundation</td><td>1</td><td>—</td><td>Core</td><td>1</td></tr>
      </tbody>
      </table></div>

      <h3>Intermediate Islamic Studies — study plan</h3>
      <div class="table-wrap"><table>
      <thead><tr><th>Code</th><th>Course</th><th>Department</th><th>Level</th><th>Units</th><th>Prerequisite</th><th>Core/Elective</th><th>Sequence</th></tr></thead>
      <tbody>
      <tr><td>IS-201</td><td>Intermediate Aqeedah</td><td>Islamic Studies</td><td>Intermediate</td><td>3</td><td>IS-101</td><td>Core</td><td>1</td></tr>
      <tr><td>IS-202</td><td>Intermediate Fiqh</td><td>Islamic Studies</td><td>Intermediate</td><td>3</td><td>IS-101</td><td>Core</td><td>1</td></tr>
      <tr><td>IS-203</td><td>Seerah I</td><td>Islamic Studies</td><td>Intermediate</td><td>2</td><td>IS-101</td><td>Core</td><td>2</td></tr>
      <tr><td>QS-201</td><td>Applied Tajweed</td><td>Qur'anic Studies</td><td>Intermediate</td><td>2</td><td>QS-102</td><td>Core</td><td>1</td></tr>
      <tr><td>QS-202</td><td>Qur'an Comprehension I</td><td>Qur'anic Studies</td><td>Intermediate</td><td>2</td><td>QS-101</td><td>Core</td><td>1</td></tr>
      <tr><td>AR-201</td><td>Arabic Grammar I</td><td>Arabic Language</td><td>Intermediate</td><td>3</td><td>AR-101</td><td>Core</td><td>1</td></tr>
      <tr><td>IC-201</td><td>Islamic History &amp; Civilization I</td><td>Islamic Civilization &amp; Society</td><td>Intermediate</td><td>2</td><td>—</td><td>Core</td><td>1</td></tr>
      <tr><td>IE-201</td><td>Communication &amp; Leadership</td><td>Islamic Education &amp; Tarbiyah</td><td>Intermediate</td><td>2</td><td>—</td><td>Core</td><td>2</td></tr>
      <tr><td>IE-202</td><td>Tazkiyah I</td><td>Islamic Education &amp; Tarbiyah</td><td>Intermediate</td><td>2</td><td>IE-101</td><td>Core</td><td>1</td></tr>
      <tr><td>RL-201</td><td>Introductory Analytical Skills</td><td>Research &amp; Learning Skills (unit)</td><td>Intermediate</td><td>1</td><td>RL-101</td><td>Core</td><td>1</td></tr>
      </tbody>
      </table></div>

      <h3>Advanced Islamic Studies — study plan</h3>
      <div class="table-wrap"><table>
      <thead><tr><th>Code</th><th>Course</th><th>Department</th><th>Level</th><th>Units</th><th>Prerequisite</th><th>Core/Elective</th><th>Sequence</th></tr></thead>
      <tbody>
      <tr><td>IS-301</td><td>Advanced Aqeedah</td><td>Islamic Studies</td><td>Advanced</td><td>3</td><td>IS-201</td><td>Core</td><td>1</td></tr>
      <tr><td>IS-302</td><td>Usul al-Fiqh</td><td>Islamic Studies</td><td>Advanced</td><td>3</td><td>IS-202</td><td>Core</td><td>1</td></tr>
      <tr><td>IS-303</td><td>Hadith Sciences</td><td>Islamic Studies</td><td>Advanced</td><td>3</td><td>IS-202</td><td>Core</td><td>2</td></tr>
      <tr><td>QS-301</td><td>Advanced Tajweed</td><td>Qur'anic Studies</td><td>Advanced</td><td>2</td><td>QS-201</td><td>Core</td><td>1</td></tr>
      <tr><td>QS-302</td><td>Tafsir I</td><td>Qur'anic Studies</td><td>Advanced</td><td>3</td><td>QS-202</td><td>Core</td><td>1</td></tr>
      <tr><td>AR-301</td><td>Arabic Grammar II</td><td>Arabic Language</td><td>Advanced</td><td>3</td><td>AR-201</td><td>Core</td><td>1</td></tr>
      <tr><td>IC-301</td><td>Islamic Social Thought</td><td>Islamic Civilization &amp; Society</td><td>Advanced</td><td>2</td><td>IC-201</td><td>Core</td><td>1</td></tr>
      <tr><td>RL-301</td><td>Research Preparation</td><td>Research &amp; Learning Skills (unit)</td><td>Advanced</td><td>2</td><td>RL-201</td><td>Core</td><td>2</td></tr>
      <tr><td>SPEC-3xx</td><td>Specialization Elective (one required)</td><td>Varies by choice</td><td>Advanced</td><td>2</td><td>Varies by choice</td><td>Elective</td><td>2</td></tr>
      </tbody>
      </table></div>

      <h3>Diploma in Islamic Studies — study plan</h3>
      <div class="table-wrap"><table>
      <thead><tr><th>Code</th><th>Course</th><th>Department</th><th>Level</th><th>Units</th><th>Prerequisite</th><th>Core/Elective</th><th>Sequence</th></tr></thead>
      <tbody>
      <tr><td>IS-401</td><td>Comparative Fiqh</td><td>Islamic Studies</td><td>Diploma</td><td>3</td><td>IS-302</td><td>Core</td><td>1</td></tr>
      <tr><td>IS-402</td><td>Hadith Methodology (Takhrij)</td><td>Islamic Studies</td><td>Diploma</td><td>3</td><td>IS-303</td><td>Core</td><td>1</td></tr>
      <tr><td>QS-401</td><td>Tafsir II</td><td>Qur'anic Studies</td><td>Diploma</td><td>3</td><td>QS-302</td><td>Core</td><td>1</td></tr>
      <tr><td>AR-401</td><td>Classical Arabic &amp; Source Reading</td><td>Arabic Language</td><td>Diploma</td><td>3</td><td>AR-301</td><td>Core</td><td>1</td></tr>
      <tr><td>IE-401</td><td>Islamic Education &amp; Teaching Methodology</td><td>Islamic Education &amp; Tarbiyah</td><td>Diploma</td><td>2</td><td>IE-101</td><td>Elective (teaching track)</td><td>2</td></tr>
      <tr><td>IC-401</td><td>Contemporary Muslim Issues</td><td>Islamic Civilization &amp; Society</td><td>Diploma</td><td>2</td><td>IC-301</td><td>Elective (community track)</td><td>2</td></tr>
      <tr><td>RL-401</td><td>Capstone Research Project</td><td>Research &amp; Learning Skills (unit)</td><td>Diploma</td><td>3</td><td>RL-301</td><td>Core (research requirement)</td><td>3</td></tr>
      </tbody>
      </table></div>
      <p><strong>Specialized Certificate</strong> study plans are not produced here — each certificate's plan is written when that certificate is approved under Academic Pathways §7.</p>

      <h2>7. Prerequisite Chains</h2>
      <p>The three chains named earlier in this document, using the codes above, plus three more the study plans above imply:</p>
      <ul>
      <li><strong>Arabic:</strong> AR-101 (Arabic Foundations) → AR-201 (Arabic Grammar I) → AR-301 (Arabic Grammar II) → AR-401 (Classical Arabic &amp; Source Reading)</li>
      <li><strong>Tajweed:</strong> QS-102 (Tajweed Foundations) → QS-201 (Applied Tajweed) → QS-301 (Advanced Tajweed) — stops at Advanced; by Diploma, correct Tajweed is assumed, not separately taught.</li>
      <li><strong>Aqeedah:</strong> IS-101 (Islamic Foundations) → IS-201 (Intermediate Aqeedah) → IS-301 (Advanced Aqeedah) — stops at Advanced for the same reason.</li>
      <li><strong>Fiqh:</strong> IS-101 → IS-202 (Intermediate Fiqh) → IS-302 (Usul al-Fiqh) → IS-401 (Comparative Fiqh)</li>
      <li><strong>Hadith:</strong> IS-101 → IS-202 → IS-303 (Hadith Sciences) → IS-402 (Hadith Methodology)</li>
      <li><strong>Qur'an/Tafsir:</strong> QS-101 (Qur'an Reading Foundations) → QS-202 (Qur'an Comprehension I) → QS-302 (Tafsir I) → QS-401 (Tafsir II)</li>
      <li><strong>Research:</strong> RL-101 (Basic Study Skills) → RL-201 (Introductory Analytical Skills) → RL-301 (Research Preparation) → RL-401 (Capstone Research Project)</li>
      </ul>

      <h2>8. Curriculum Map</h2>
      <blockquote><strong>Progression map.</strong> Foundation Studies → Intermediate Islamic Studies → Advanced Islamic Studies → Diploma in Islamic Studies, with a Specialized Certificate reachable as a branch after Advanced or after the Diploma (Academic Pathways §1) — never a fifth step in the main line.</blockquote>
      <p><strong>PLO contribution by pathway</strong> — which outcome categories each pathway is responsible for (✓) versus deliberately not yet addressed (—):</p>
      <div class="table-wrap"><table>
      <thead><tr><th>PLO category</th><th>Foundation</th><th>Intermediate</th><th>Advanced</th><th>Diploma</th></tr></thead>
      <tbody>
      <tr><td>Knowledge</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td></tr>
      <tr><td>Understanding</td><td>—</td><td>✓</td><td>✓</td><td>✓</td></tr>
      <tr><td>Application</td><td>—</td><td>✓</td><td>✓</td><td>✓</td></tr>
      <tr><td>Analysis</td><td>—</td><td>—</td><td>✓</td><td>✓</td></tr>
      <tr><td>Communication</td><td>—</td><td>✓</td><td>—</td><td>✓</td></tr>
      <tr><td>Ethical responsibility</td><td>✓</td><td>—</td><td>—</td><td>✓</td></tr>
      <tr><td>Qur'anic competence</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td></tr>
      <tr><td>Arabic competence</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td></tr>
      <tr><td>Teaching/leadership</td><td>—</td><td>—</td><td>—</td><td>✓ (elective track)</td></tr>
      <tr><td>Research</td><td>—</td><td>—</td><td>✓</td><td>✓</td></tr>
      </tbody>
      </table></div>
      <p>The individual study-plan tables in §6 show which specific course within each pathway is the primary carrier of a given discipline.</p>

      <h2>9. Curriculum Gaps &amp; Redundancies</h2>
      <ul>
      <li><strong>Hifz (memorization) has no course home yet.</strong> Academic Pathways names Hifz as a real placement input and a real future certificate, and Academic Governance names a whole cross-cutting Qur'an Memorization &amp; Recitation Unit — but no course in this document's study plans carries it. This is a genuine gap, not an oversight to route around; it needs its own design pass coordinated with that unit (§10, decision 25).</li>
      <li><strong>Leadership is carried by one course.</strong> IE-201 covers both communication and leadership together — adequate for Intermediate, but the Diploma's teaching track (IE-401) is the only place leadership is picked up again. Worth watching as the catalogue matures.</li>
      <li><strong>No redundancy found</strong> in the Aqeedah, Fiqh, Tajweed, or Arabic chains — each level's course is a genuine deepening of the one before it, never a repeat at the same depth (§3).</li>
      <li><strong>Character/adab and Tazkiyah are intentionally sequential, not redundant</strong> — Foundation teaches adab directly; Intermediate's Tazkiyah I builds on it rather than re-teaching it, matching Institutional Foundation's chain (Knowledge → Understanding → Character → Practice → Service).</li>
      </ul>

      <h2>10. Decisions Requiring Approval</h2>
      <p>Continuing the numbering from Institutional Foundation through Academic Pathways.</p>
      <ol start="22">
      <li><strong>Unit/credit-hour values — open.</strong> The "Units" column in §6 is a placeholder pattern, not a confirmed credit system — ties directly to Academic Pathways decision 19.</li>
      <li><strong>Permanent course-coding system — resolved by Course Catalogue.</strong> This document originally used temporary <code>[PATHWAY]-[DEPT]-[SEQ]</code> codes. Course Catalogue (Course Catalogue) finalized the permanent <code>[DEPT]-[LEVEL][SEQ]</code> system and recoded every course above to match — pending your confirmation of who assigns future codes (Course Catalogue proposes the Registrar).</li>
      <li><strong>Diploma track choice mechanism — open.</strong> Who approves a learner's choice between the teaching-track and community-track electives, and when in the pathway that choice is locked in.</li>
      <li><strong>Hifz / Qur'an memorization curriculum placement — open.</strong> Flagged in §9 — needs its own design pass, coordinated with the Qur'an Memorization &amp; Recitation Unit (Academic Governance §4).</li>
      </ol>
      <p><em>Ulul Azm Academy — Program Architecture &amp; Curriculum Framework. Prepared for Founder review. This document's courses are illustrative placeholders that fix the Academy's curriculum shape — they are not yet real Course records, and none should be created until decision 22 above is resolved (decision 23 has since been resolved by the Course Catalogue).</em></p>
    `.trim(),
  },
  'academy-department-curriculum': {
    title: 'Department Curriculum',
    bodyHtml: `
      <p><strong>Department &amp; Program Curriculum Design.</strong> The Institutional Foundation, Academic Governance, Academic Pathways, and Curriculum Framework documents are fixed foundations here, not renegotiated. This document answers a question the Curriculum Framework deliberately left open: not every program should have the same courses, and not every course belongs to the department someone might guess first. It gives each of the Academy's five departments a defined topic list, resolves every place two departments' topics appeared to overlap, and corrects two course attributions the Academic Pathways and Curriculum Framework documents got wrong before this document existed to catch them. No weekly syllabi, and no final course catalogue, yet.</p>

      <h2>1. Departmental Ownership Principle</h2>
      <p>Every course belongs to exactly one department. That department designs it, sequences it, and staffs it (Academic Governance §3); a program may draw courses from several departments, but a course itself is never co-owned. Curriculum Framework §1 already established that a program draws only the departments its purpose needs — Foundation Studies does not need Islamic Civilization &amp; Society, the Diploma does. This document adds the other half of that rule: when two departments' subject matter appears to overlap, the overlap must be resolved — by scope, by reassignment, or by folding one into the other — before any course for it is created. An unresolved overlap is not a minor gap; it is exactly how a catalogue ends up with two courses teaching the same thing under two different names, which Institutional Foundation's Institutional Objectives and Academic Governance's Academic Design Rule both exist to prevent.</p>
      <blockquote><strong>Two corrections this document makes to already-published work.</strong> While reconciling department topic lists, this document found that Curriculum Framework's IC-301 ("Islamic Thought") and IC-401 ("Contemporary Muslim Issues &amp; Da'wah") had drifted into territory that belongs to Islamic Studies and Islamic Education &amp; Tarbiyah respectively. Consistent with the Academy's practice of keeping earlier documents current when later work reveals a needed correction, IC-301 is renamed <strong>Islamic Social Thought</strong>, IC-401 is renamed <strong>Contemporary Muslim Issues</strong> (its da'wah component moved to Islamic Education &amp; Tarbiyah), and Academic Governance §3's department descriptions and Academic Pathways §7's certificate table have been updated to match. See §9 for the full reasoning.</blockquote>

      <h2>2. Department of Islamic Studies — Curriculum Framework</h2>
      <p>Owns Aqeedah, Fiqh, Hadith, and Seerah (Academic Governance §3), plus two topics this document adds to its scope: Islamic Thought and Contemporary Islamic Issues.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Topic</th><th>Existing course chain</th><th>Status</th><th>Notes</th></tr></thead>
      <tbody>
      <tr><td>Aqeedah</td><td>IS-101 → IS-201 → IS-301</td><td>Existing</td><td>Introductory → systematic → independent, per Curriculum Framework §3.</td></tr>
      <tr><td>Fiqh</td><td>IS-101 → IS-202 → IS-302 → IS-401</td><td>Existing</td><td>Reaches "comparative" mastery at Diploma (Curriculum Framework §3).</td></tr>
      <tr><td>Hadith</td><td>IS-202 (shared entry) → IS-303 → IS-402</td><td>Existing</td><td>Introduced and developed together at Advanced (Curriculum Framework §3).</td></tr>
      <tr><td>Seerah</td><td>IS-203</td><td>Existing, single course</td><td>No Advanced or Diploma continuation yet — flagged as decision 28 (§11).</td></tr>
      <tr><td>Islamic Thought</td><td>— (new)</td><td>New course</td><td>Classical and contemporary Islamic intellectual tradition (kalam, philosophical theology, schools of thought) — the Advanced-tier competency named in Academic Pathways §5. Previously mis-housed as Islamic Civilization &amp; Society's IC-301; corrected in §1 above.</td></tr>
      <tr><td>Islamic Ethics</td><td>— (new)</td><td>New course</td><td>Akhlaq as a reasoned discipline — the theoretical counterpart to Tazkiyah's practiced formation (Islamic Education &amp; Tarbiyah). Distinct disciplines, not a duplication.</td></tr>
      <tr><td>Contemporary Islamic Issues</td><td>— (new)</td><td>New course</td><td>Fiqh- and Aqeedah-based reasoning applied to modern questions (bioethics, Islamic finance, technology) — the juristic "can/should" question. See §9 for its distinction from Islamic Civilization &amp; Society's Contemporary Muslim Issues.</td></tr>
      </tbody>
      </table></div>

      <h2>3. Department of Qur'anic Studies — Curriculum Framework</h2>
      <p>Owns Tajwid, Qur'an memorization and recitation, and Tafsir (Academic Governance §3), plus one topic this document adds: Ulum al-Qur'an.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Topic</th><th>Existing course chain</th><th>Status</th><th>Notes</th></tr></thead>
      <tbody>
      <tr><td>Tajwid</td><td>QS-102 → QS-201 → QS-301</td><td>Existing</td><td>Mastered at Advanced; not separately taught past that point (Curriculum Framework §3).</td></tr>
      <tr><td>Qur'an reading &amp; recitation</td><td>QS-101 → QS-202</td><td>Existing</td><td>Feeds directly into the Tafsir chain below.</td></tr>
      <tr><td>Tafsir</td><td>QS-302 → QS-401</td><td>Existing</td><td>Comprehension introduced at Intermediate, developed at Advanced, mastered at Diploma (Curriculum Framework §3).</td></tr>
      <tr><td>Hifz (memorization)</td><td>— (gap, flagged Curriculum Framework §9)</td><td>Resolved: merged, no new course</td><td>Carried by the existing Qur'an reading &amp; recitation chain, tracked operationally by the Qur'an Memorization &amp; Recitation cross-cutting unit (Academic Governance §4) rather than a separate course. Closes Curriculum Framework decision 25.</td></tr>
      <tr><td>Ulum al-Qur'an</td><td>— (new)</td><td>New course</td><td>Sciences of the Qur'an — revelation circumstances, makki/madani, compilation history — the contextual scaffolding Tafsir depends on but does not itself teach. Recommended between QS-302 and QS-401.</td></tr>
      </tbody>
      </table></div>

      <h2>4. Department of Arabic Language — Curriculum Framework</h2>
      <p>Owns Arabic grammar (Nahw), morphology (Sarf), vocabulary, and reading/comprehension (Academic Governance §3). Two of those four stay folded into the existing chain rather than becoming standalone courses; two genuinely new topics are added.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Topic</th><th>Existing course chain</th><th>Status</th><th>Notes</th></tr></thead>
      <tbody>
      <tr><td>Grammar (Nahw)</td><td>AR-101 → AR-201 → AR-301 → AR-401</td><td>Existing</td><td>Reaches "source reading" mastery at Diploma (Curriculum Framework §3).</td></tr>
      <tr><td>Morphology (Sarf)</td><td>taught within the Grammar chain</td><td>Folded in, no new course</td><td>Part of the department's scope (Academic Governance §3) but not a distinct competency worth testing separately from Nahw.</td></tr>
      <tr><td>Vocabulary</td><td>threaded through Foundation and Intermediate</td><td>Folded in, no new course</td><td>Already named explicitly in Academic Pathways §3 and §4's field lists; not a standalone course.</td></tr>
      <tr><td>Writing</td><td>— (new)</td><td>New course</td><td>Composition and written expression — distinct from grammar's rules and reading's comprehension. Recommended after AR-401.</td></tr>
      <tr><td>Conversation</td><td>— (new)</td><td>New course</td><td>Spoken fluency and applied dialogue — the department's one topic that is not text-facing. Recommended alongside AR-301; exact placement depends on the Advanced elective structure (§8).</td></tr>
      </tbody>
      </table></div>

      <h2>5. Department of Islamic Education &amp; Tarbiyah — Curriculum Framework</h2>
      <p>Owns Tazkiyah, Islamic pedagogy, and teacher-preparation (Academic Governance §3), and — following the correction in §1 — da'wah (outreach) methodology, moved here from Islamic Civilization &amp; Society. Three further topics are added as new gaps.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Topic</th><th>Existing course chain</th><th>Status</th><th>Notes</th></tr></thead>
      <tbody>
      <tr><td>Tazkiyah</td><td>IE-101 (adab/character) → IE-202 (Tazkiyah I)</td><td>Existing</td><td>No Advanced/Diploma continuation — by design; assumed and exercised rather than re-taught past Intermediate (Curriculum Framework §3, §9).</td></tr>
      <tr><td>Islamic pedagogy / teaching methodology</td><td>IE-401</td><td>Existing</td><td>The Diploma's teaching-track elective.</td></tr>
      <tr><td>Communication &amp; leadership</td><td>IE-201</td><td>Existing</td><td>Both threads carried by one course (Curriculum Framework §9 notes this as worth watching).</td></tr>
      <tr><td>Da'wah (outreach) methodology</td><td>— (reassigned)</td><td>New course, reassigned here</td><td><strong>Da'wah &amp; Outreach</strong> — moved from Islamic Civilization &amp; Society (§1, §9). Its placement relative to the existing Diploma electives is open — decision 26 (§11).</td></tr>
      <tr><td>Islamic curriculum design</td><td>— (new)</td><td>New course</td><td>How to design and sequence Islamic teaching material — a natural companion to IE-401 for the same teaching-track learners.</td></tr>
      <tr><td>Youth education</td><td>— (new)</td><td>New course</td><td>Age-specific pedagogy for younger learners — distinct from IE-401's general teaching methodology.</td></tr>
      <tr><td>Family education</td><td>— (new)</td><td>New course</td><td>How to raise and teach children Islamically — parent-facing, a tarbiyah skill. See §9 for its distinction from Islamic Civilization &amp; Society's Family &amp; Society.</td></tr>
      </tbody>
      </table></div>

      <h2>6. Department of Islamic Civilization &amp; Society — Curriculum Framework</h2>
      <p>Owns Islamic history and civilization, and contemporary Muslim community issues (Academic Governance §3, corrected in §1 to remove da'wah). One topic is added as a new gap; two candidate topics are deliberately folded into existing courses rather than spun out.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Topic</th><th>Existing course chain</th><th>Status</th><th>Notes</th></tr></thead>
      <tbody>
      <tr><td>Islamic history &amp; civilization</td><td>IC-201</td><td>Existing</td><td>The learner's first structured exposure to the department (Academic Pathways §4).</td></tr>
      <tr><td>Islamic Social Thought</td><td>IC-301</td><td>Existing, renamed</td><td>Was "Islamic Thought"; renamed in §1 to avoid duplicating Islamic Studies' own Islamic Thought (§9). Civilizational/social application of thought, not the classical intellectual tradition itself.</td></tr>
      <tr><td>Contemporary Muslim Issues</td><td>IC-401</td><td>Existing, renamed</td><td>Dropped "&amp; Da'wah" in §1 — sociological and communal challenges facing Muslim societies, not outreach methodology.</td></tr>
      <tr><td>Muslim societies / Islamic culture</td><td>content within existing courses</td><td>Folded in, no new course</td><td>Treated as material inside Islamic history &amp; civilization and Islamic Social Thought rather than given dedicated courses — avoids near-duplication (§9).</td></tr>
      <tr><td>Family &amp; Society</td><td>— (new)</td><td>New course</td><td>The family as a social institution within Muslim civilization — a sociological/historical lens. Distinct from Islamic Education &amp; Tarbiyah's parent-facing Family Education (§9). Recommended after IC-301.</td></tr>
      </tbody>
      </table></div>

      <h2>7. Program-to-Department Mapping</h2>
      <div class="table-wrap"><table>
      <thead><tr><th>Program</th><th>Departments drawn on</th><th>Rationale</th></tr></thead>
      <tbody>
      <tr><td>Foundation Studies</td><td>Islamic Studies, Qur'anic Studies, Arabic Language, Islamic Education &amp; Tarbiyah (adab/character only), Research &amp; Learning Skills unit</td><td>No Islamic Civilization &amp; Society — a zero-prior-knowledge learner has no use for civilizational or contemporary context before the basics exist (Curriculum Framework §1).</td></tr>
      <tr><td>Intermediate Islamic Studies</td><td>adds Islamic Civilization &amp; Society</td><td>First structured exposure to history/civilization, per Academic Pathways §4.</td></tr>
      <tr><td>Advanced Islamic Studies</td><td>Islamic Studies, Qur'anic Studies, Arabic Language, Islamic Civilization &amp; Society, Research &amp; Learning Skills unit, plus one specialization elective</td><td>No Islamic Education &amp; Tarbiyah — Tazkiyah is assumed rather than re-taught past Intermediate, and the teaching track itself does not begin until the Diploma.</td></tr>
      <tr><td>Diploma in Islamic Studies</td><td>all five departments, plus Research &amp; Learning Skills unit</td><td>The Academy's integrated credential (Academic Pathways §6) — the only program that draws every department, by design rather than symmetry.</td></tr>
      <tr><td>Specialized Certificate Programs</td><td>exactly one department each</td><td>By definition (Curriculum Framework §2) — a certificate is single-discipline mastery, never multi-department.</td></tr>
      </tbody>
      </table></div>

      <h2>8. Specialization Framework</h2>
      <ul>
      <li><strong>One department per certificate.</strong> A Specialized Certificate belongs to exactly one department, matching Academic Pathways §7's example table (now corrected for Da'wah — see §1). No certificate may combine content from two departments; that would recreate the exact ambiguity §9 exists to resolve.</li>
      <li><strong>The Advanced elective previews a real track.</strong> The Advanced pathway's single specialization elective (SPEC-3xx, Curriculum Framework §6) is the formal preview mechanism — whichever certificate track a learner samples there should draw from the same department the eventual certificate belongs to, so the preview is genuine rather than decorative.</li>
      <li><strong>Certificates draw only from their department's own courses.</strong> Curriculum Framework §2 defines a certificate as three to five focused courses in one discipline — meaning the gap-filling courses identified in §§2–6 above are also the future raw material for new certificates (a future Da'wah certificate, for instance, would draw on the new Da'wah &amp; Outreach course once it exists as a real Course record).</li>
      </ul>

      <h2>9. Course Duplication Audit</h2>
      <p>Five ways an apparent overlap between two departments' topics can be resolved, applied to every overlap this document found:</p>
      <ol>
      <li><strong>Differentiate</strong> — keep both, split by scope, rename if the names alone invite confusion.</li>
      <li><strong>Reassign</strong> — move the topic to a single owning department entirely.</li>
      <li><strong>Fold in</strong> — treat it as content within an existing course; no new course created.</li>
      <li><strong>Merge</strong> — combine two proposed gap topics into one new course.</li>
      <li><strong>No duplication</strong> — confirm the apparent overlap doesn't hold once scope is checked.</li>
      </ol>
      <div class="table-wrap"><table>
      <thead><tr><th>Overlap</th><th>Resolution</th><th>Reasoning</th></tr></thead>
      <tbody>
      <tr><td>Islamic Thought (Islamic Studies, new) vs. the course formerly named "Islamic Thought" (Islamic Civilization &amp; Society)</td><td>Differentiate + rename</td><td>Islamic Studies' version is the classical intellectual/theological tradition; the Civilization &amp; Society course is its civilizational and social application. Renamed to Islamic Social Thought (§1) so the two names no longer collide.</td></tr>
      <tr><td>Da'wah (outreach) methodology, previously under Islamic Civilization &amp; Society</td><td>Reassign</td><td>Da'wah is fundamentally a pedagogical and outreach skill — teaching and conveying — not a historical or civilizational study area. Moved to Islamic Education &amp; Tarbiyah (§1, §5), which already owns pedagogy.</td></tr>
      <tr><td>Contemporary Islamic Issues (Islamic Studies, new) vs. Contemporary Muslim Issues (Islamic Civilization &amp; Society)</td><td>Differentiate</td><td>Islamic Studies' version asks the juristic "can/should" question (fiqh and aqeedah reasoning on bioethics, finance, technology); Civilization &amp; Society's version asks the sociological "what's happening, and how does the community respond" question. Different disciplines answering different questions — kept as two courses.</td></tr>
      <tr><td>Muslim societies / Islamic culture vs. existing Islamic history &amp; civilization and Islamic Social Thought courses</td><td>Fold in</td><td>No independent competency these would test that the existing courses don't already cover. Spinning them out would create near-duplicate courses purely to look thorough — exactly what Academic Governance's Academic Design Rule warns against.</td></tr>
      <tr><td>Family Education (Islamic Education &amp; Tarbiyah, new) vs. Family &amp; Society (Islamic Civilization &amp; Society, new)</td><td>Differentiate</td><td>Tarbiyah's version is parent-facing — how to raise and teach children Islamically. Civilization &amp; Society's version treats the family as a social institution within Muslim civilization — a sociological/historical lens. Close names, genuinely different disciplines; flagged for founder sign-off as decision 29 (§11) given how easily they could be confused in practice.</td></tr>
      <tr><td>Hifz (memorization) vs. Qur'an reading &amp; recitation</td><td>Merge / fold in</td><td>Hifz was flagged in Curriculum Framework §9 as a course-home gap. Rather than create a new standalone course, it is carried by the existing Qur'an reading &amp; recitation chain and tracked operationally by the Qur'an Memorization &amp; Recitation cross-cutting unit (Academic Governance §4) — closing Curriculum Framework decision 25.</td></tr>
      <tr><td>Character/adab &amp; Tazkiyah chain, checked against every other department's course list</td><td>No duplication found</td><td>Confirms Curriculum Framework §9's own finding: Foundation's adab/character anchor and Intermediate's Tazkiyah I are sequential, not redundant, and no other department's topic list overlaps this chain.</td></tr>
      </tbody>
      </table></div>

      <h2>10. Recommended Final Curriculum Structure</h2>
      <p>The genuinely new courses this document identifies — illustrative names and tiers, not final course records. Codes shown above and throughout now follow the permanent system Course Catalogue (Course Catalogue) finalized, superseding the temporary convention Curriculum Framework originally established:</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Department</th><th>New course</th><th>Recommended tier</th><th>Relationship to existing courses</th></tr></thead>
      <tbody>
      <tr><td>Islamic Studies</td><td>Islamic Thought</td><td>Advanced</td><td>After IS-301</td></tr>
      <tr><td>Islamic Studies</td><td>Islamic Ethics</td><td>Advanced</td><td>Alongside Islamic Thought</td></tr>
      <tr><td>Islamic Studies</td><td>Contemporary Islamic Issues</td><td>Diploma</td><td>After IS-401</td></tr>
      <tr><td>Qur'anic Studies</td><td>Ulum al-Qur'an</td><td>Diploma</td><td>Between QS-302 and QS-401</td></tr>
      <tr><td>Arabic Language</td><td>Writing</td><td>Diploma</td><td>After AR-401</td></tr>
      <tr><td>Arabic Language</td><td>Conversation</td><td>Advanced</td><td>Alongside AR-301</td></tr>
      <tr><td>Islamic Education &amp; Tarbiyah</td><td>Da'wah &amp; Outreach</td><td>Open — decision 26</td><td>Reassigned from Islamic Civilization &amp; Society</td></tr>
      <tr><td>Islamic Education &amp; Tarbiyah</td><td>Islamic Curriculum Design</td><td>Diploma</td><td>Alongside IE-401</td></tr>
      <tr><td>Islamic Education &amp; Tarbiyah</td><td>Youth Education</td><td>Diploma</td><td>Alongside IE-401</td></tr>
      <tr><td>Islamic Education &amp; Tarbiyah</td><td>Family Education</td><td>Diploma</td><td>Alongside IE-401</td></tr>
      <tr><td>Islamic Civilization &amp; Society</td><td>Family &amp; Society</td><td>Diploma</td><td>After IC-301 (Islamic Social Thought)</td></tr>
      </tbody>
      </table></div>
      <p>Not listed above because §9 resolved them without a new course: Hifz, morphology (Sarf), vocabulary, and "Muslim societies / Islamic culture." As with every course in Curriculum Framework, none of this creates real <code>Course</code> records — it fixes the Academy's curriculum shape for when that step is taken.</p>

      <h2>11. Decisions Requiring Approval</h2>
      <p>Continuing the numbering from Institutional Foundation through Curriculum Framework.</p>
      <ol start="26">
      <li><strong>Da'wah &amp; Outreach's placement — open.</strong> Should it become a third Diploma elective alongside the teaching-track and community-track electives, fold into the existing teaching-track elective (IE-401), or wait for a future Specialized Certificate? This document identifies the course and its department; it does not decide where it sits in the Diploma's structure.</li>
      <li><strong>New course tier placements — open.</strong> The tiers and sequencing in §10 are illustrative, not confirmed — the same review Curriculum Framework's original study-plan tables are still awaiting (Curriculum Framework decision 22) applies here too. Course coding itself is no longer open — see Course Catalogue.</li>
      <li><strong>Seerah's missing Advanced/Diploma continuation — open.</strong> Flagged in §2. Is this deliberate, the same way Tazkiyah is assumed after Intermediate, or a genuine gap needing its own course? Needs a founder call, not an assumption.</li>
      <li><strong>Family Education vs. Family &amp; Society — confirm the split.</strong> §9 resolves this by scope, but the names are close enough to confuse in practice; worth explicit founder sign-off before either course is built.</li>
      </ol>
      <p><em>Ulul Azm Academy — Department &amp; Program Curriculum Design. Prepared for Founder review. This document's courses are illustrative placeholders, not yet real Course records; none should be created until decision 22, and 26–29 (Curriculum Framework and Department Curriculum Design), are resolved (decision 23 has since been resolved by the Course Catalogue).</em></p>
    `.trim(),
  },
  'academy-course-catalogue': {
    title: 'Course Catalogue',
    bodyHtml: `
      <p><strong>Course Catalogue &amp; Coding System.</strong> The Institutional Foundation, Academic Governance, Academic Pathways, Curriculum Framework, and Department Curriculum Design documents are fixed foundations here, not renegotiated. This catalogue turns every course named across the Curriculum Framework and Department Curriculum Design documents into one master catalogue: a permanent coding system (closing Curriculum Framework decision 23), a numbering framework that encodes academic level without guesswork, full course-level detail for all 42 courses identified so far, and the quality-control and gap audits a real catalogue needs before any of it becomes actual <code>Course</code> records. Codes in the Curriculum Framework and Department Curriculum Design documents have been updated to match this catalogue throughout. No weekly syllabi yet.</p>

      <h2>1. Coding System</h2>
      <p>Every code follows <strong><code>[DEPT]-[LEVEL][SEQ]</code></strong> — a two-letter department code, a one-digit level, and a two-digit sequence number within that department and level.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Code</th><th>Department / unit</th></tr></thead>
      <tbody>
      <tr><td>IS</td><td>Islamic Studies</td></tr>
      <tr><td>QS</td><td>Qur'anic Studies</td></tr>
      <tr><td>AR</td><td>Arabic Language</td></tr>
      <tr><td>IE</td><td>Islamic Education &amp; Tarbiyah</td></tr>
      <tr><td>IC</td><td>Islamic Civilization &amp; Society</td></tr>
      <tr><td>RL</td><td>Research &amp; Learning Skills (cross-cutting unit, not a department — Academic Governance §4)</td></tr>
      </tbody>
      </table></div>
      <p>This finalizes and replaces Curriculum Framework's temporary <code>[PATHWAY]-[DEPT]-[SEQ]</code> placeholders (decision 23). It keeps Curriculum Framework's original numbers unchanged and simply drops the redundant pathway-name prefix, since the level digit already carries that information — see §2. The one substantive change is department lettering: Islamic Education &amp; Tarbiyah moves from Curriculum Framework's ad hoc "ED" to "IE", and Islamic Civilization &amp; Society from "CS" to "IC", both closer to the department's actual name. <strong>Who assigns new codes:</strong> proposed as the Registrar's responsibility going forward, matching Curriculum Framework decision 23's original framing — open for your confirmation (decision 31, §10).</p>

      <h2>2. Course Numbering Framework</h2>
      <p>The level digit is not decorative — it is the rule, applied without exception across all 42 courses below:</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Digit</th><th>Level</th></tr></thead>
      <tbody>
      <tr><td>1</td><td>Foundation</td></tr>
      <tr><td>2</td><td>Intermediate</td></tr>
      <tr><td>3</td><td>Advanced</td></tr>
      <tr><td>4</td><td>Diploma</td></tr>
      <tr><td>5</td><td>Specialized Certificate (reserved — no certificate has a defined course list yet, §9)</td></tr>
      </tbody>
      </table></div>
      <p>The sequence digits (the last two) simply order courses within a department and level — IS-301, IS-302, IS-303, IS-304 carry no meaning individually beyond "the 1st through 4th Islamic Studies courses at Advanced." One exception: the Advanced pathway's single specialization elective keeps a floating, department-agnostic placeholder — <code>SPEC-3xx</code> — because which department it eventually draws from varies by learner choice (Curriculum Framework §6); it is not itself a numbered course.</p>

      <h2>3. Master Course Catalogue</h2>
      <p>All 42 courses identified across the Curriculum Framework and Department Curriculum Design documents, grouped by owning department — grouping by department here serves as both the master catalogue and the department course lists Course Catalogue §6 asks for. Each department's quick-reference table is followed by every course's description, primary learning outcome, and assessment type. <strong>Teaching hours</strong> use an illustrative 1 unit = 15 teaching hours conversion — not a confirmed credit system, still pending Curriculum Framework decision 22 (see decision 30, §10). Courses new to this catalogue (first named in Department Curriculum Design) are marked <em>New</em>.</p>

      <h3>Islamic Studies (IS)</h3>
      <div class="table-wrap"><table>
      <thead><tr><th>Code</th><th>Course</th><th>Pathway</th><th>Level</th><th>Units</th><th>Hours</th><th>Prerequisite</th><th>Type</th></tr></thead>
      <tbody>
      <tr><td>IS-101</td><td>Islamic Foundations</td><td>Foundation Studies</td><td>Foundation</td><td>3</td><td>45</td><td>—</td><td>Core</td></tr>
      <tr><td>IS-201</td><td>Intermediate Aqeedah</td><td>Intermediate Islamic Studies</td><td>Intermediate</td><td>3</td><td>45</td><td>IS-101</td><td>Core</td></tr>
      <tr><td>IS-202</td><td>Intermediate Fiqh</td><td>Intermediate Islamic Studies</td><td>Intermediate</td><td>3</td><td>45</td><td>IS-101</td><td>Core</td></tr>
      <tr><td>IS-203</td><td>Seerah I</td><td>Intermediate Islamic Studies</td><td>Intermediate</td><td>2</td><td>30</td><td>IS-101</td><td>Core</td></tr>
      <tr><td>IS-301</td><td>Advanced Aqeedah</td><td>Advanced Islamic Studies</td><td>Advanced</td><td>3</td><td>45</td><td>IS-201</td><td>Core</td></tr>
      <tr><td>IS-302</td><td>Usul al-Fiqh</td><td>Advanced Islamic Studies</td><td>Advanced</td><td>3</td><td>45</td><td>IS-202</td><td>Core</td></tr>
      <tr><td>IS-303</td><td>Hadith Sciences</td><td>Advanced Islamic Studies</td><td>Advanced</td><td>3</td><td>45</td><td>IS-202</td><td>Core</td></tr>
      <tr><td>IS-304</td><td>Islamic Thought <em>(New)</em></td><td>Advanced Islamic Studies</td><td>Advanced</td><td>2</td><td>30</td><td>IS-301</td><td>Core</td></tr>
      <tr><td>IS-305</td><td>Islamic Ethics <em>(New)</em></td><td>Advanced Islamic Studies</td><td>Advanced</td><td>2</td><td>30</td><td>IS-301</td><td>Core</td></tr>
      <tr><td>IS-401</td><td>Comparative Fiqh</td><td>Diploma in Islamic Studies</td><td>Diploma</td><td>3</td><td>45</td><td>IS-302</td><td>Core</td></tr>
      <tr><td>IS-402</td><td>Hadith Methodology (Takhrij)</td><td>Diploma in Islamic Studies</td><td>Diploma</td><td>3</td><td>45</td><td>IS-303</td><td>Core</td></tr>
      <tr><td>IS-403</td><td>Contemporary Islamic Issues <em>(New)</em></td><td>Diploma in Islamic Studies</td><td>Diploma</td><td>2</td><td>30</td><td>IS-401</td><td>Core</td></tr>
      </tbody>
      </table></div>
      <p><strong>IS-101 — Islamic Foundations.</strong> Core Aqeedah and Fiqh essentials for a learner starting from zero (Academic Pathways's zero-prior-knowledge entry point). Outcome: recall essential Aqeedah and Fiqh accurately. Assessment: written examination.</p>
      <p><strong>IS-201 — Intermediate Aqeedah.</strong> Aqeedah taught as a connected, systematic body of knowledge rather than scattered facts. Outcome: explain Aqeedah systematically, not just recall it. Assessment: written examination.</p>
      <p><strong>IS-202 — Intermediate Fiqh.</strong> Systematic Fiqh instruction building on Foundation's essentials. Outcome: apply basic Fiqh rulings to everyday situations. Assessment: written examination.</p>
      <p><strong>IS-203 — Seerah I.</strong> The learner's first dedicated Seerah course, broken out from "Islamic foundations" (Curriculum Framework §2). Outcome: recall and narrate the essential events of the Prophetic biography. Assessment: written examination.</p>
      <p><strong>IS-301 — Advanced Aqeedah.</strong> Deepens Aqeedah to independent, argument-following engagement. Outcome: reason independently within the Academy's manhaj on Aqeedah questions. Assessment: written examination.</p>
      <p><strong>IS-302 — Usul al-Fiqh.</strong> The methodology behind Fiqh rulings, not just the rulings themselves. Outcome: analyze how a Fiqh ruling is derived from its sources. Assessment: written examination.</p>
      <p><strong>IS-303 — Hadith Sciences.</strong> Hadith introduced and developed as its own dedicated discipline at Advanced tier. Outcome: explain Hadith classification and basic authentication criteria. Assessment: written examination.</p>
      <p><strong>IS-304 — Islamic Thought.</strong> Classical and contemporary Islamic intellectual tradition — kalam, philosophical theology, schools of thought — the Advanced-tier competency named in Academic Pathways §5, previously mis-housed under Islamic Civilization &amp; Society before Department Curriculum Design corrected it. Outcome: engage the broader intellectual tradition, not only rulings. Assessment: written examination plus a short research essay.</p>
      <p><strong>IS-305 — Islamic Ethics.</strong> Akhlaq as a reasoned discipline — the theoretical counterpart to Tazkiyah's practiced formation. Outcome: reason about moral questions using Islamic ethical frameworks, not only rules. Assessment: written examination.</p>
      <p><strong>IS-401 — Comparative Fiqh.</strong> Comparative treatment of Fiqh positions across schools, the Diploma's mastery-tier Fiqh course. Outcome: compare and evaluate differing Fiqh positions on a given issue. Assessment: written examination.</p>
      <p><strong>IS-402 — Hadith Methodology (Takhrij).</strong> Hadith authentication methodology at mastery level. Outcome: trace and evaluate a Hadith's chain of transmission. Assessment: research project (a takhrij exercise).</p>
      <p><strong>IS-403 — Contemporary Islamic Issues.</strong> Fiqh- and Aqeedah-based reasoning applied to modern questions — bioethics, Islamic finance, technology — the juristic "can/should" question, distinct from Islamic Civilization &amp; Society's sociological IC-401 (Department Curriculum Design §9). Outcome: apply juristic reasoning to a genuinely contemporary question. Assessment: written examination plus a case-study essay.</p>

      <h3>Qur'anic Studies (QS)</h3>
      <div class="table-wrap"><table>
      <thead><tr><th>Code</th><th>Course</th><th>Pathway</th><th>Level</th><th>Units</th><th>Hours</th><th>Prerequisite</th><th>Type</th></tr></thead>
      <tbody>
      <tr><td>QS-101</td><td>Qur'an Reading Foundations</td><td>Foundation Studies</td><td>Foundation</td><td>3</td><td>45</td><td>—</td><td>Recitation/Hifz</td></tr>
      <tr><td>QS-102</td><td>Tajweed Foundations</td><td>Foundation Studies</td><td>Foundation</td><td>2</td><td>30</td><td>QS-101</td><td>Recitation/Hifz</td></tr>
      <tr><td>QS-201</td><td>Applied Tajweed</td><td>Intermediate Islamic Studies</td><td>Intermediate</td><td>2</td><td>30</td><td>QS-102</td><td>Recitation/Hifz</td></tr>
      <tr><td>QS-202</td><td>Qur'an Comprehension I</td><td>Intermediate Islamic Studies</td><td>Intermediate</td><td>2</td><td>30</td><td>QS-101</td><td>Core</td></tr>
      <tr><td>QS-301</td><td>Advanced Tajweed</td><td>Advanced Islamic Studies</td><td>Advanced</td><td>2</td><td>30</td><td>QS-201</td><td>Recitation/Hifz</td></tr>
      <tr><td>QS-302</td><td>Tafsir I</td><td>Advanced Islamic Studies</td><td>Advanced</td><td>3</td><td>45</td><td>QS-202</td><td>Core</td></tr>
      <tr><td>QS-401</td><td>Tafsir II</td><td>Diploma in Islamic Studies</td><td>Diploma</td><td>3</td><td>45</td><td>QS-302</td><td>Core</td></tr>
      <tr><td>QS-402</td><td>Ulum al-Qur'an <em>(New)</em></td><td>Diploma in Islamic Studies</td><td>Diploma</td><td>2</td><td>30</td><td>QS-302</td><td>Core</td></tr>
      </tbody>
      </table></div>
      <p><strong>QS-101 — Qur'an Reading Foundations.</strong> Correct Qur'anic reading from a zero-prior-knowledge start. Outcome: read Qur'anic Arabic correctly at a foundational level. Assessment: oral recitation assessment.</p>
      <p><strong>QS-102 — Tajweed Foundations.</strong> Foundational Tajwid rules applied to correct recitation. Outcome: apply foundational Tajweed rules while reading. Assessment: oral recitation assessment.</p>
      <p><strong>QS-201 — Applied Tajweed.</strong> Tajwid applied with growing fluency across longer passages. Outcome: recite with improved fluency and Tajwid accuracy. Assessment: oral recitation assessment.</p>
      <p><strong>QS-202 — Qur'an Comprehension I.</strong> The beginning of Qur'anic comprehension, not just correct reading. Outcome: demonstrate basic comprehension of recited passages. Assessment: written and oral assessment.</p>
      <p><strong>QS-301 — Advanced Tajweed.</strong> Tajwid mastered — the last dedicated Tajwid course before it is assumed rather than re-taught (Curriculum Framework §3). Outcome: recite with mastery-level Tajwid accuracy. Assessment: oral recitation assessment.</p>
      <p><strong>QS-302 — Tafsir I.</strong> Verse-by-verse exegesis, comprehension deepened from Intermediate. Outcome: explain the meaning of assigned verses using established Tafsir. Assessment: written examination.</p>
      <p><strong>QS-401 — Tafsir II.</strong> Tafsir mastered at Diploma tier. Outcome: independently research and present a Tafsir analysis. Assessment: research project.</p>
      <p><strong>QS-402 — Ulum al-Qur'an.</strong> Sciences of the Qur'an — revelation circumstances, makki/madani, compilation history — the contextual scaffolding Tafsir depends on but does not itself teach (Department Curriculum Design §3). Outcome: explain how a verse's revelation context shapes its interpretation. Assessment: written examination.</p>

      <h3>Arabic Language (AR)</h3>
      <div class="table-wrap"><table>
      <thead><tr><th>Code</th><th>Course</th><th>Pathway</th><th>Level</th><th>Units</th><th>Hours</th><th>Prerequisite</th><th>Type</th></tr></thead>
      <tbody>
      <tr><td>AR-101</td><td>Arabic Foundations</td><td>Foundation Studies</td><td>Foundation</td><td>3</td><td>45</td><td>—</td><td>Language</td></tr>
      <tr><td>AR-201</td><td>Arabic Grammar I</td><td>Intermediate Islamic Studies</td><td>Intermediate</td><td>3</td><td>45</td><td>AR-101</td><td>Language</td></tr>
      <tr><td>AR-301</td><td>Arabic Grammar II</td><td>Advanced Islamic Studies</td><td>Advanced</td><td>3</td><td>45</td><td>AR-201</td><td>Language</td></tr>
      <tr><td>AR-302</td><td>Conversation <em>(New)</em></td><td>Advanced Islamic Studies</td><td>Advanced</td><td>2</td><td>30</td><td>AR-201</td><td>Language</td></tr>
      <tr><td>AR-401</td><td>Classical Arabic &amp; Source Reading</td><td>Diploma in Islamic Studies</td><td>Diploma</td><td>3</td><td>45</td><td>AR-301</td><td>Language</td></tr>
      <tr><td>AR-402</td><td>Writing <em>(New)</em></td><td>Diploma in Islamic Studies</td><td>Diploma</td><td>2</td><td>30</td><td>AR-401</td><td>Language</td></tr>
      </tbody>
      </table></div>
      <p><strong>AR-101 — Arabic Foundations.</strong> Zero-Arabic entry point building basic vocabulary and sentence structure. Outcome: recognize basic vocabulary and sentence structure. Assessment: written examination.</p>
      <p><strong>AR-201 — Arabic Grammar I.</strong> Grammar sufficient to reduce dependence on translation. Outcome: apply basic grammar rules to read simple texts. Assessment: written examination.</p>
      <p><strong>AR-301 — Arabic Grammar II.</strong> Grammar deepened toward reading primary texts directly. Outcome: read primary texts with reduced reliance on secondary summaries. Assessment: written examination.</p>
      <p><strong>AR-302 — Conversation.</strong> Spoken fluency and applied dialogue — the department's one topic that is not text-facing (Department Curriculum Design §4); needs only Intermediate grammar, not the full Advanced Grammar II, so it runs alongside AR-301 rather than after it. Outcome: hold a basic conversational exchange in Arabic. Assessment: oral/practical assessment.</p>
      <p><strong>AR-401 — Classical Arabic &amp; Source Reading.</strong> Source-reading mastery, the proficiency level that makes direct source engagement possible. Outcome: read a classical source text directly, without translation support. Assessment: written examination.</p>
      <p><strong>AR-402 — Writing.</strong> Composition and written expression — distinct from grammar's rules and reading's comprehension (Department Curriculum Design §4). Outcome: compose a structured piece of Arabic writing on a given topic. Assessment: written composition assessment.</p>

      <h3>Islamic Education &amp; Tarbiyah (IE)</h3>
      <div class="table-wrap"><table>
      <thead><tr><th>Code</th><th>Course</th><th>Pathway</th><th>Level</th><th>Units</th><th>Hours</th><th>Prerequisite</th><th>Type</th></tr></thead>
      <tbody>
      <tr><td>IE-101</td><td>Islamic Character &amp; Adab</td><td>Foundation Studies</td><td>Foundation</td><td>2</td><td>30</td><td>—</td><td>Core</td></tr>
      <tr><td>IE-201</td><td>Communication &amp; Leadership</td><td>Intermediate Islamic Studies</td><td>Intermediate</td><td>2</td><td>30</td><td>—</td><td>Core</td></tr>
      <tr><td>IE-202</td><td>Tazkiyah I</td><td>Intermediate Islamic Studies</td><td>Intermediate</td><td>2</td><td>30</td><td>IE-101</td><td>Core</td></tr>
      <tr><td>IE-401</td><td>Islamic Education &amp; Teaching Methodology</td><td>Diploma in Islamic Studies</td><td>Diploma</td><td>2</td><td>30</td><td>IE-101</td><td>Required specialization (teaching track)</td></tr>
      <tr><td>IE-402</td><td>Da'wah &amp; Outreach <em>(New)</em></td><td>Diploma in Islamic Studies</td><td>Diploma — provisional</td><td>2</td><td>30</td><td>IE-201 — provisional</td><td>Elective — provisional</td></tr>
      <tr><td>IE-403</td><td>Islamic Curriculum Design <em>(New)</em></td><td>Diploma in Islamic Studies</td><td>Diploma</td><td>2</td><td>30</td><td>IE-101</td><td>Required specialization (teaching track)</td></tr>
      <tr><td>IE-404</td><td>Youth Education <em>(New)</em></td><td>Diploma in Islamic Studies</td><td>Diploma</td><td>2</td><td>30</td><td>IE-101</td><td>Required specialization (teaching track)</td></tr>
      <tr><td>IE-405</td><td>Family Education <em>(New)</em></td><td>Diploma in Islamic Studies</td><td>Diploma</td><td>2</td><td>30</td><td>IE-101</td><td>Required specialization (teaching track)</td></tr>
      </tbody>
      </table></div>
      <p><strong>IE-101 — Islamic Character &amp; Adab.</strong> The Foundation-tier adab/character anchor, the entry point into the Tazkiyah chain. Outcome: demonstrate Islamic adab consistently in conduct and interaction. Assessment: practical, instructor-observed assessment.</p>
      <p><strong>IE-201 — Communication &amp; Leadership.</strong> Early responsibility and expressing what has been learned clearly, in writing and speech. Outcome: communicate learned material clearly, in writing and speech. Assessment: presentation/practical assessment.</p>
      <p><strong>IE-202 — Tazkiyah I.</strong> Builds on Foundation's adab rather than re-teaching it — Institutional Foundation's Knowledge → Character chain made explicit as a course. Outcome: apply Tazkiyah principles to personal conduct. Assessment: reflective portfolio / practical assessment.</p>
      <p><strong>IE-401 — Islamic Education &amp; Teaching Methodology.</strong> Teacher-preparation for the Diploma's teaching-track learners. Outcome: design and deliver a basic Islamic-studies lesson. Assessment: teaching demonstration plus written assessment.</p>
      <p><strong>IE-402 — Da'wah &amp; Outreach.</strong> Outreach methodology, reassigned here from Islamic Civilization &amp; Society (Department Curriculum Design §1, §9). Its exact tier, prerequisite, and track placement remain open — Department Curriculum Design decision 26, restated as decision 32 (§10) at catalogue level. Outcome: apply basic da'wah/outreach methodology to a sample scenario. Assessment: practical assessment, pending decision 32.</p>
      <p><strong>IE-403 — Islamic Curriculum Design.</strong> How to design and sequence Islamic teaching material — a companion to IE-401 for the same teaching-track learners (Department Curriculum Design §5). Outcome: sequence a short unit of Islamic teaching material. Assessment: practical/portfolio assessment.</p>
      <p><strong>IE-404 — Youth Education.</strong> Age-specific pedagogy for younger learners, distinct from IE-401's general teaching methodology. Outcome: adapt a lesson for a younger age group. Assessment: teaching demonstration.</p>
      <p><strong>IE-405 — Family Education.</strong> How to raise and teach children Islamically — parent-facing, distinct from Islamic Civilization &amp; Society's IC-402 (Department Curriculum Design §5, §9). Outcome: advise on age-appropriate Islamic upbringing practices. Assessment: written/practical assessment.</p>

      <h3>Islamic Civilization &amp; Society (IC)</h3>
      <div class="table-wrap"><table>
      <thead><tr><th>Code</th><th>Course</th><th>Pathway</th><th>Level</th><th>Units</th><th>Hours</th><th>Prerequisite</th><th>Type</th></tr></thead>
      <tbody>
      <tr><td>IC-201</td><td>Islamic History &amp; Civilization I</td><td>Intermediate Islamic Studies</td><td>Intermediate</td><td>2</td><td>30</td><td>—</td><td>Core</td></tr>
      <tr><td>IC-301</td><td>Islamic Social Thought</td><td>Advanced Islamic Studies</td><td>Advanced</td><td>2</td><td>30</td><td>IC-201</td><td>Core</td></tr>
      <tr><td>IC-401</td><td>Contemporary Muslim Issues</td><td>Diploma in Islamic Studies</td><td>Diploma</td><td>2</td><td>30</td><td>IC-301</td><td>Required specialization (community track)</td></tr>
      <tr><td>IC-402</td><td>Family &amp; Society <em>(New)</em></td><td>Diploma in Islamic Studies</td><td>Diploma</td><td>2</td><td>30</td><td>IC-301</td><td>Required specialization (community track)</td></tr>
      </tbody>
      </table></div>
      <p><strong>IC-201 — Islamic History &amp; Civilization I.</strong> The learner's first structured exposure to the department's subject matter. Outcome: recall the essential arc of Islamic history and civilization. Assessment: written examination.</p>
      <p><strong>IC-301 — Islamic Social Thought.</strong> Civilizational and social application of Islamic thought — renamed from "Islamic Thought" to avoid duplicating Islamic Studies' own IS-304 (Department Curriculum Design §1, §9). Outcome: explain how Islamic thought has shaped social and civilizational life. Assessment: written examination.</p>
      <p><strong>IC-401 — Contemporary Muslim Issues.</strong> Sociological and communal challenges facing Muslim societies — renamed to drop its former da'wah component, now IE-402 (Department Curriculum Design §1). Outcome: analyze a contemporary challenge facing a Muslim community. Assessment: written examination plus a case-study essay.</p>
      <p><strong>IC-402 — Family &amp; Society.</strong> The family as a social institution within Muslim civilization — a sociological/historical lens, distinct from Islamic Education &amp; Tarbiyah's parent-facing IE-405 (Department Curriculum Design §5, §9). Outcome: analyze the family's role as a social institution within Muslim civilization. Assessment: written examination.</p>

      <h3>Research &amp; Learning Skills (RL — cross-cutting unit)</h3>
      <div class="table-wrap"><table>
      <thead><tr><th>Code</th><th>Course</th><th>Pathway</th><th>Level</th><th>Units</th><th>Hours</th><th>Prerequisite</th><th>Type</th></tr></thead>
      <tbody>
      <tr><td>RL-101</td><td>Basic Study Skills</td><td>Foundation Studies</td><td>Foundation</td><td>1</td><td>15</td><td>—</td><td>Core</td></tr>
      <tr><td>RL-201</td><td>Introductory Analytical Skills</td><td>Intermediate Islamic Studies</td><td>Intermediate</td><td>1</td><td>15</td><td>RL-101</td><td>Core</td></tr>
      <tr><td>RL-301</td><td>Research Preparation</td><td>Advanced Islamic Studies</td><td>Advanced</td><td>2</td><td>30</td><td>RL-201</td><td>Research</td></tr>
      <tr><td>RL-401</td><td>Capstone Research Project</td><td>Diploma in Islamic Studies</td><td>Diploma</td><td>3</td><td>45</td><td>RL-301</td><td>Research</td></tr>
      </tbody>
      </table></div>
      <p><strong>RL-101 — Basic Study Skills.</strong> How to learn, take notes, and prepare for assessment. Outcome: apply basic study and note-taking techniques. Assessment: practical/portfolio assessment.</p>
      <p><strong>RL-201 — Introductory Analytical Skills.</strong> The first step toward reasoning within an Islamic epistemological framework, still guided rather than independent. Outcome: apply guided analytical reasoning to a given text. Assessment: written assessment.</p>
      <p><strong>RL-301 — Research Preparation.</strong> Foundational research and source-verification skills, readying a learner for the Diploma's capstone. Outcome: verify a source and apply basic research methodology. Assessment: research exercise.</p>
      <p><strong>RL-401 — Capstone Research Project.</strong> The Diploma's mastery-tier research or capstone component. Outcome: produce and defend an independent research or capstone project. Assessment: research project plus defense.</p>

      <h3>Advanced specialization slot (not a department)</h3>
      <div class="table-wrap"><table>
      <thead><tr><th>Code</th><th>Course</th><th>Pathway</th><th>Level</th><th>Units</th><th>Hours</th><th>Prerequisite</th><th>Type</th></tr></thead>
      <tbody>
      <tr><td>SPEC-3xx</td><td>Specialization Elective (one required)</td><td>Advanced Islamic Studies</td><td>Advanced</td><td>2</td><td>30</td><td>Varies by choice</td><td>Elective</td></tr>
      </tbody>
      </table></div>
      <p><strong>SPEC-3xx — Specialization Elective.</strong> Previews a future Specialized Certificate track (Curriculum Framework §2, Department Curriculum Design §8); department, prerequisite, outcome and assessment all vary by the learner's chosen preview.</p>

      <h2>4. Program Course Lists</h2>
      <div class="table-wrap"><table>
      <thead><tr><th>Program</th><th>Core courses</th><th>Elective / specialization courses</th></tr></thead>
      <tbody>
      <tr><td>Foundation Studies</td><td>IS-101, QS-101, QS-102, AR-101, IE-101, RL-101 (6, all core)</td><td>none</td></tr>
      <tr><td>Intermediate Islamic Studies</td><td>IS-201, IS-202, IS-203, QS-201, QS-202, AR-201, IC-201, IE-201, IE-202, RL-201 (10, all core)</td><td>none</td></tr>
      <tr><td>Advanced Islamic Studies</td><td>IS-301, IS-302, IS-303, IS-304, IS-305, QS-301, QS-302, AR-301, AR-302, IC-301, RL-301 (11)</td><td>SPEC-3xx (1 elective slot)</td></tr>
      <tr><td>Diploma in Islamic Studies</td><td>IS-401, IS-402, IS-403, QS-401, QS-402, AR-401, AR-402, RL-401 (8, universal core)</td><td>Teaching track: IE-401, IE-403, IE-404, IE-405 (4). Community track: IC-401, IC-402 (2). Provisional: IE-402 (1, decision 32).</td></tr>
      <tr><td>Specialized Certificate Programs</td><td>3–5 courses per certificate, single department, per Curriculum Framework §2</td><td>No certificate has a real course list yet — see §9</td></tr>
      </tbody>
      </table></div>
      <p>Course counts grow with tier depth — 6 → 10 → 12 → 15 — consistent with Institutional Foundation's progressive Educational Philosophy chain, not padded for symmetry (§7).</p>

      <h2>5. Prerequisite Map</h2>
      <ul>
      <li><strong>Aqeedah/Thought:</strong> IS-101 → IS-201 → IS-301 → {IS-304, IS-305} (both branch from IS-301)</li>
      <li><strong>Fiqh:</strong> IS-101 → IS-202 → IS-302 → IS-401 → IS-403</li>
      <li><strong>Hadith:</strong> IS-101 → IS-202 → IS-303 → IS-402</li>
      <li><strong>Seerah:</strong> IS-101 → IS-203 — stops here; a genuine gap, not a design choice (Department Curriculum Design decision 28, restated §9).</li>
      <li><strong>Tajweed/Recitation:</strong> QS-101 → QS-102 → QS-201 → QS-301 — stops at Advanced, by design (Curriculum Framework §3).</li>
      <li><strong>Qur'an/Tafsir:</strong> QS-101 → QS-202 → QS-302 → QS-401, with QS-302 → QS-402 as a parallel branch.</li>
      <li><strong>Arabic:</strong> AR-101 → AR-201 → AR-301 → AR-401 → AR-402, with AR-201 → AR-302 as a parallel branch.</li>
      <li><strong>Character/Tazkiyah:</strong> IE-101 → IE-202 — stops here, by design (assumed and exercised past Intermediate, Curriculum Framework §3, §9).</li>
      <li><strong>Teaching track:</strong> IE-101 → {IE-401, IE-403, IE-404, IE-405} (all four branch from the same Foundation prerequisite as Diploma companions).</li>
      <li><strong>Da'wah:</strong> IE-201 → IE-402 — provisional, pending decision 32.</li>
      <li><strong>Civilization/Social Thought:</strong> IC-201 → IC-301 → {IC-401, IC-402} (both branch from IC-301).</li>
      <li><strong>Research:</strong> RL-101 → RL-201 → RL-301 → RL-401</li>
      </ul>

      <h2>6. Course Type Classification</h2>
      <div class="table-wrap"><table>
      <thead><tr><th>Type</th><th>Courses</th><th>Purpose</th></tr></thead>
      <tbody>
      <tr><td>Core</td><td>IS-101, IS-201, IS-202, IS-203, IS-301, IS-302, IS-303, IS-304, IS-305, IS-401, IS-402, IS-403, QS-202, QS-302, QS-401, QS-402, IE-101, IE-201, IE-202, IC-201, IC-301, RL-101, RL-201 (23 courses)</td><td>Required of every learner on the program, no choice involved.</td></tr>
      <tr><td>Recitation/Hifz</td><td>QS-101, QS-102, QS-201, QS-301 (4)</td><td>Tajwid and recitation performance specifically, as opposed to comprehension or exegesis.</td></tr>
      <tr><td>Language</td><td>AR-101, AR-201, AR-301, AR-302, AR-401, AR-402 (6)</td><td>Arabic proficiency itself, independent of Islamic-sciences content.</td></tr>
      <tr><td>Research</td><td>RL-301, RL-401 (2)</td><td>Research methodology and the capstone, as distinct from general study skills (RL-101, RL-201, kept Core).</td></tr>
      <tr><td>Required specialization</td><td>IE-401, IE-403, IE-404, IE-405 (teaching track); IC-401, IC-402 (community track) (6)</td><td>Not freely elective — once a Diploma track is chosen, these are mandatory within it.</td></tr>
      <tr><td>Elective</td><td>SPEC-3xx; IE-402 provisionally (2)</td><td>Genuine learner choice among options, or not yet locked to a track.</td></tr>
      <tr><td>Practical</td><td>none yet</td><td>No placement/practicum-style course exists in the catalogue yet — a real gap, not an unused label. See §9.</td></tr>
      </tbody>
      </table></div>

      <h2>7. Course Quality Control</h2>
      <ul>
      <li><strong>No unnecessary duplication.</strong> Confirmed against Department Curriculum Design's seven-case audit, re-checked here with final codes assigned: IS-304/IC-301, IS-403/IC-401, and IE-405/IC-402 all read as close names but distinct disciplines by design; no new duplication was introduced by assigning codes. Full detail in §8.</li>
      <li><strong>Prerequisites are logical.</strong> Every prerequisite in §5 points to either the immediately preceding course in its own chain or a lower-tier grounding course — no forward references, no skipped tiers, no course listing a prerequisite from a level above it.</li>
      <li><strong>Advanced courses have sufficient preparation.</strong> Every Advanced-tier course requires at least one Intermediate-tier course, except AR-302 (Conversation), which intentionally requires only AR-201 rather than the full AR-301 chain, since conversational fluency does not depend on completing Advanced grammar first (Department Curriculum Design §4).</li>
      <li><strong>Courses belong to appropriate departments.</strong> Reconfirms Department Curriculum Design §9's resolutions now that real codes exist: IS-304 (Islamic Thought) sits under Islamic Studies, not Islamic Civilization &amp; Society; IE-402 (Da'wah &amp; Outreach) sits under Islamic Education &amp; Tarbiyah, not Islamic Civilization &amp; Society; IS-403/IC-401 and IE-405/IC-402 keep their department split by scope.</li>
      <li><strong>Programs contain enough relevant courses.</strong> 6 → 10 → 12 → 15 across Foundation → Intermediate → Advanced → Diploma (§4) — growing depth at every tier, no thin pathway.</li>
      <li><strong>No course exists only to fill space.</strong> Every course traces either to an explicit Institutional Foundation–4 requirement or a specific gap Department Curriculum Design named by discipline — none was added merely to make a department's course count match another's, which Academic Governance's Academic Design Rule and Curriculum Framework §1's blockquote both rule out. Islamic Education &amp; Tarbiyah's four new Diploma companions (IE-402–405) look like the largest single addition, but each answers a distinct, separately-named Department Curriculum Design gap (da'wah, curriculum design, youth education, family education), not one topic split four ways for volume.</li>
      </ul>

      <h2>8. Duplication Audit</h2>
      <p>Re-run at catalogue-build stage, now that every course in Department Curriculum Design's audit has a real code:</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Pair</th><th>Status</th><th>Why it isn't a duplication</th></tr></thead>
      <tbody>
      <tr><td>IS-304 Islamic Thought vs. IC-301 Islamic Social Thought</td><td>Resolved (Department Curriculum Design §9)</td><td>Classical intellectual tradition vs. its civilizational/social application — different disciplines, confirmed distinct at coding stage.</td></tr>
      <tr><td>IS-403 Contemporary Islamic Issues vs. IC-401 Contemporary Muslim Issues</td><td>Resolved (Department Curriculum Design §9)</td><td>Juristic "can/should" reasoning vs. sociological "what's happening" analysis — different departments, different questions.</td></tr>
      <tr><td>IE-405 Family Education vs. IC-402 Family &amp; Society</td><td>Resolved (Department Curriculum Design §9)</td><td>Parent-facing tarbiyah skill vs. the family as a civilizational/social institution — flagged for founder sign-off as Department Curriculum Design decision 29, still open.</td></tr>
      <tr><td>IE-402 Da'wah &amp; Outreach vs. any Islamic Civilization &amp; Society course</td><td>Resolved (Department Curriculum Design §1, §9)</td><td>Da'wah is pedagogical/outreach, not historical or civilizational study — reassigned, not duplicated.</td></tr>
      <tr><td>SPEC-3xx vs. any named course</td><td>Not a duplication</td><td>SPEC-3xx has no defined content of its own — it is a placeholder slot filled by whichever department's certificate preview a learner chooses, never a competing course.</td></tr>
      </tbody>
      </table></div>
      <p>No new duplication was found while assigning final codes.</p>

      <h2>9. Missing-Course Audit</h2>
      <ul>
      <li><strong>No "Practical" type course exists.</strong> A genuine placement/practicum course — a teaching practicum for the teaching track, a da'wah practicum for IE-402, or a community-service placement tied to Institutional Foundation Objective 10 — is absent from the catalogue. This is a real gap, not a naming oversight; a future document should decide whether to add one.</li>
      <li><strong>Specialized Certificate course lists don't exist yet.</strong> Academic Pathways §7 names candidate certificates and owning departments; Curriculum Framework §2 defines the shape (3–5 core courses per certificate); no certificate has an actual course list. Still open.</li>
      <li><strong>Seerah has no Advanced or Diploma continuation.</strong> Only IS-203 exists; Department Curriculum Design decision 28 (is this deliberate, like Tazkiyah, or a genuine gap?) is still unresolved.</li>
      <li><strong>IE-402's placement is still provisional.</strong> Tier, prerequisite, and track are all open pending decision 32 (§10) — the catalogue-level restatement of Department Curriculum Design decision 26.</li>
      <li><strong>Hifz is not missing — it's a deliberate non-course.</strong> Department Curriculum Design §3 resolved this by tracking Hifz through the existing Qur'an reading/recitation chain and the Qur'an Memorization &amp; Recitation cross-cutting unit rather than a standalone course. Listed here only to confirm it was considered, not overlooked.</li>
      </ul>

      <h2>10. Decisions Requiring Approval</h2>
      <p>Continuing the numbering from Institutional Foundation through Department Curriculum Design.</p>
      <ol start="30">
      <li><strong>Units-to-teaching-hours conversion — open.</strong> This catalogue applies an illustrative 1 unit = 15 teaching hours to answer §3's "teaching hours" field. The underlying credit system itself is still unresolved — Curriculum Framework decision 22.</li>
      <li><strong>Permanent coding system — proposed, pending confirmation.</strong> §1–§2 finalize the <code>[DEPT]-[LEVEL][SEQ]</code> system and close Curriculum Framework decision 23 in substance; formal sign-off, and confirmation that the Registrar assigns future codes, is still yours to give.</li>
      <li><strong>Da'wah &amp; Outreach (IE-402)'s placement — open.</strong> Restates Department Curriculum Design decision 26 at catalogue level: which Diploma track it belongs to, or whether it becomes a third track, is still undecided.</li>
      <li><strong>Whether to add a Practical-type course — open.</strong> §6 and §9 both flag that no course currently uses this label. Worth a founder decision on whether a practicum belongs in the catalogue, and if so, where.</li>
      </ol>
      <p><em>Ulul Azm Academy — Course Catalogue &amp; Coding System. Prepared for Founder review. This catalogue's 42 courses (plus the SPEC-3xx placeholder) are illustrative — not yet real Course records — and none should be created until decision 22 (Curriculum Framework) and decisions 30–33 above are resolved.</em></p>
    `.trim(),
  },
  'academy-course-specifications': {
    title: 'Course Specifications',
    bodyHtml: `
      <p><strong>Course Specifications &amp; Syllabi.</strong> The Institutional Foundation, Academic Governance, Academic Pathways, Curriculum Framework, Department Curriculum Design, and Course Catalogue documents are the fixed academic foundation here — this document does not redesign departments, programs, prerequisites, or the course catalogue. It takes each catalogued course and adds the syllabus-level detail the Course Catalogue deliberately didn't attempt: weekly sequencing, measurable learning outcomes, teaching methodology, assessment design, and a CLO → Teaching → Assessment → Evidence map. Where the Course Catalogue already defined a field correctly (code, title, department, program, pathway, level, units, hours, prerequisites, type), this document carries it forward rather than re-deriving it. This document proceeds by department and tier group, working from Foundation through Diploma (§4–§11), followed by a summary of all 42 specifications (§12) and a consolidated list of decisions requiring founder or Scholarly Review Committee approval (§13).</p>

      <h2>1. Scope &amp; Constraints</h2>
      <ul>
      <li>This document does not change department structure, programs, prerequisites, or course codes. Where writing an actual syllabus surfaces a real inconsistency Institutional Foundation through Course Catalogue didn't catch, it is flagged as a decision (§13) — never silently fixed here.</li>
      <li>This document does not invent religious rulings, a fiqh madhab position, or a qira'ah/riwayah choice. Where a course's content depends on one of those, this document identifies the dependency and routes it to the Scholarly Review Committee (Academic Governance §6) rather than deciding it — see §2's Islamic Scholarly Review framework and each course's own note.</li>
      </ul>

      <h2>2. Institution-Wide Conventions</h2>
      <p>Stated once here and referenced by every course below, rather than repeated per course — all provisional pending founder confirmation.</p>
      <ul>
      <li><strong>Term length.</strong> A 15-week term for every course, regardless of unit count. Weekly contact hours = Units (a 3-unit course runs 3 hours/week; a 1-unit course runs 1 hour/week) — the natural extension of Course Catalogue §3's "1 unit = 15 teaching hours," itself still pending Curriculum Framework decision 22. A course may instead run as a shorter, front-loaded intensive within the same 15-week term when that serves the content better (RL-101 does this — see §4) — the exception is justified per course, not applied by default.</li>
      <li><strong>Expected learner workload.</strong> Teaching hours (contact) plus self-study hours. Self-study ≈ contact hours × 1 for most courses, × 1.5 for Recitation/Hifz and Language courses (practice-heavy), × 2 for Research-type courses (independent work) — illustrative, tied to the same open credit-hour decision as term length.</li>
      <li><strong>Assessment weighting, by course type:</strong>
        <div class="table-wrap"><table>
        <thead><tr><th>Course type</th><th>Quizzes</th><th>Assignments</th><th>Midterm</th><th>Practical</th><th>Final</th><th>Passing requirement</th></tr></thead>
        <tbody>
        <tr><td>Core / Language / Research</td><td>15%</td><td>20%</td><td>25%</td><td>—</td><td>40%</td><td>60% overall, no component below 40%</td></tr>
        <tr><td>Recitation/Hifz</td><td>10%</td><td>10%</td><td>20%</td><td>30%</td><td>30%</td><td>60% overall AND minimum 60% on the combined Practical + Final recitation component</td></tr>
        <tr><td>Character/practical (adab, teaching practice)</td><td>10%</td><td>25%</td><td>20%</td><td>25%</td><td>20%</td><td>60% overall; the Practical component must show consistent demonstration over the term, not just a numeric average — instructor-attested, not purely computed</td></tr>
        </tbody>
        </table></div>
        Foundation-tier weighting deliberately favors ongoing/practical work over a single final exam, matching Academic Pathways §3's "competence-based, not exam-heavy" assessment expectation for this pathway.
      </li>
      <li><strong>Academic integrity.</strong> Written work must be the learner's own; recitation and practical assessments must be the learner's own unaided performance; unauthorized assistance on individually-assessed quizzes or exams is not permitted. <strong>Correction applied: this is now real, not proposed.</strong> A first violation typically means resubmission or a grade penalty at the reporting instructor's own discretion; a repeat or severe violation escalates to the Head of Department and may engage the Academic Standing process (the existing <code>AcademicStanding</code> enum) — exactly the escalation described here, now enforced by a real <code>IntegrityCase</code> record rather than only the general Request system. See Academic Regulations, Records &amp; Quality Assurance §3 for the full case-tracking system, violation types, and portals.</li>
      <li><strong>Course review cadence.</strong> Every course is reviewed by its Head of Department at least once per academic year, on the same cycle as the Assessment &amp; Quality Assurance Unit's <code>QualityReview</code> mechanism (Academic Governance §5). A course specification is revised whenever its department identifies a needed change, using the same update discipline applied across Institutional Foundation through Course Catalogue.</li>
      <li><strong>Instructor requirements, baseline.</strong> Subject-matter competence at or above the tier being taught, appointed via Head of Department → Dean (Academic Governance §7). Content bearing on Islamic rulings or positions requires Scholarly Review Committee clearance before use. Each course below states only what's genuinely course-specific beyond this baseline.</li>
      <li><strong>Islamic Scholarly Review, framework.</strong> Per Institutional Foundation §10 and Academic Governance §6, any content bearing on Islamic rulings, positions, or interpretation is reviewed and approved by the Scholarly Review Committee before being taught under the Academy's name. This document identifies <em>where</em> that review is needed per course — it does not supply the ruling, madhab position, or qira'ah/riwayah choice itself, all of which remain open Founder or Committee decisions. Course content consistent with the Academy's already-confirmed manhaj (Ahlus-Sunnah wal-Jama'ah, upon the understanding of the Salaf — Institutional Foundation §12 decision 1) is treated as safe to outline at a topic level; content depending on the still-open madhab or riwayah decisions is flagged, not resolved.</li>
      <li><strong>Required texts.</strong> Drawn from the Academy's own Bookstore catalogue where a genuine topical match exists, rather than inventing new titles. Where no bookstore title fits, this document says so plainly instead of filling the gap with an invented source.</li>
      </ul>

      <h2>3. Course Learning Outcome Verbs</h2>
      <p>Every CLO below uses one of: identify, explain, describe, compare, apply, analyze, evaluate, demonstrate, recite, interpret, produce — bolded in each list so the verb is easy to verify against this set.</p>

      <h2>4. Foundation Studies</h2>
      <p>All six Foundation-tier courses (Academic Pathways §3), one per department/unit. Every course below carries forward its code, title, department, program, pathway, level, units, hours, prerequisite, and type exactly as Course Catalogue §3 established.</p>

      <h3>IS-101 — Islamic Foundations</h3>
      <div class="table-wrap"><table>
      <tbody>
      <tr><td>Department</td><td>Islamic Studies</td><td>Program / Pathway</td><td>Foundation Studies</td></tr>
      <tr><td>Level</td><td>Foundation</td><td>Units / Teaching hours</td><td>3 / 45 (3 hrs/week × 15 weeks)</td></tr>
      <tr><td>Expected workload</td><td>~90 hrs (45 contact + 45 self-study)</td><td>Prerequisite</td><td>— (entry course)</td></tr>
      <tr><td>Course type</td><td>Core</td><td>Passing requirement</td><td>60% overall, no component below 40% (§2)</td></tr>
      </tbody>
      </table></div>
      <p><strong>Course Description.</strong> Core Aqeedah and Fiqh essentials for a learner starting from zero — the Academy's zero-prior-knowledge entry point (Academic Pathways §3). Covers the pillars of Iman and Islam and the basic Fiqh of worship, at introductory depth only.</p>
      <p><strong>Course Objectives.</strong> Give every learner a shared, correct foundation in core beliefs and basic worship practice; build comfort with core Islamic vocabulary; prepare learners for Intermediate Aqeedah (IS-201) and Intermediate Fiqh (IS-202).</p>
      <p><strong>Course Learning Outcomes.</strong></p>
      <ol>
      <li><strong>Identify</strong> the six pillars of Iman and the five pillars of Islam.</li>
      <li><strong>Explain</strong> the three categories of Tawhid at an introductory level.</li>
      <li><strong>Describe</strong> the basic conditions and steps of Salah and Taharah.</li>
      <li><strong>Apply</strong> basic Fiqh rulings on purification, prayer, fasting, and zakat to everyday situations.</li>
      <li><strong>Demonstrate</strong> correct performance of Salah's physical steps.</li>
      </ol>
      <div class="table-wrap"><table>
      <thead><tr><th>Wk</th><th>Topic</th><th>Objectives</th><th>Key concepts</th><th>Activities</th><th>Readings</th><th>Assessment</th></tr></thead>
      <tbody>
      <tr><td>1</td><td>Orientation; what Aqeedah and Fiqh are</td><td>Identify the course's two strands</td><td>Aqeedah, Fiqh, Iman, Islam</td><td>Lecture, discussion</td><td>Course guide</td><td>—</td></tr>
      <tr><td>2</td><td>The six pillars of Iman (overview)</td><td>Identify the six pillars</td><td>Belief in Allah, angels, books, messengers, Last Day, Qadr</td><td>Lecture, group recall exercise</td><td>Three Fundamental Principles, ch. 1–2</td><td>Quiz 1</td></tr>
      <tr><td>3</td><td>Tawhid — the three categories</td><td>Explain each category</td><td>Ruboobiyyah, Uloohiyyah, Asma wa Sifat</td><td>Lecture, guided reading</td><td>Three Fundamental Principles, ch. 3</td><td>—</td></tr>
      <tr><td>4</td><td>The five pillars of Islam (overview)</td><td>Identify the five pillars</td><td>Shahadah, Salah, Zakah, Sawm, Hajj</td><td>Lecture, discussion</td><td>Three Fundamental Principles, ch. 4</td><td>Quiz 2</td></tr>
      <tr><td>5</td><td>Taharah and Salah basics</td><td>Describe wudu and Salah conditions</td><td>Wudu, conditions of Salah</td><td>Demonstration, guided practice</td><td>Instructor handout*</td><td>Assignment 1</td></tr>
      <tr><td>6</td><td>Salah — practical steps</td><td>Demonstrate the physical steps of Salah</td><td>Rukoo, Sujood, Tashahhud</td><td>Guided practice, peer check</td><td>Instructor handout*</td><td>—</td></tr>
      <tr><td>7</td><td>Review</td><td>Consolidate weeks 1–6</td><td>—</td><td>Review session</td><td>—</td><td>—</td></tr>
      <tr><td>8</td><td>Midterm Assessment</td><td>—</td><td>—</td><td>—</td><td>—</td><td>Midterm</td></tr>
      <tr><td>9</td><td>Fasting and Zakat basics</td><td>Apply basic Sawm and Zakah rulings</td><td>Sawm, Zakah</td><td>Lecture, case scenarios</td><td>Instructor handout*</td><td>Quiz 3</td></tr>
      <tr><td>10</td><td>Hajj (overview only)</td><td>Identify Hajj's basic rites</td><td>Ihram, Tawaf, Sa'i</td><td>Lecture, video</td><td>Instructor handout*</td><td>—</td></tr>
      <tr><td>11</td><td>Names and Attributes of Allah</td><td>Explain Asma wa Sifat at an introductory level</td><td>Names, Attributes</td><td>Lecture, discussion</td><td>Three Fundamental Principles, ch. 5</td><td>Assignment 2</td></tr>
      <tr><td>12</td><td>Belief in angels, books, messengers, Last Day, Qadr</td><td>Describe each pillar in more depth</td><td>Angels, Books, Messengers, Akhirah, Qadr</td><td>Lecture, discussion</td><td>Three Fundamental Principles, ch. 6</td><td>Quiz 4</td></tr>
      <tr><td>13</td><td>Everyday Fiqh — halal/haram basics</td><td>Apply basic halal/haram distinctions</td><td>Halal, haram, adab of worship</td><td>Case discussion</td><td>Instructor handout*</td><td>—</td></tr>
      <tr><td>14</td><td>Review and consolidation</td><td>Consolidate the full term</td><td>—</td><td>Review session</td><td>—</td><td>—</td></tr>
      <tr><td>15</td><td>Final Assessment</td><td>—</td><td>—</td><td>—</td><td>—</td><td>Final</td></tr>
      </tbody>
      </table></div>
      <p><strong>Required Texts.</strong> <em>The Three Fundamental Principles</em> (Academy Bookstore) for the Aqeedah strand. <strong>Gap:</strong> no Foundation-level Fiqh primer currently exists in the Bookstore catalogue — flagged as decision 34 (§13) rather than invented here (*instructor handouts marked above are a stand-in, not a substitute for a reviewed text).</p>
      <p><strong>Recommended Readings.</strong> None assigned beyond the required text at this introductory tier.</p>
      <p><strong>Teaching Methodology &amp; Learning Activities.</strong> Lecture plus guided discussion for Aqeedah content; demonstration and guided practice for Fiqh/worship content, since Salah's physical steps are a practical skill, not just a fact to recall.</p>
      <p><strong>Assessment.</strong> Core-type weighting (§2): Quizzes 15%, Assignments 20%, Midterm 25%, Final 40%.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>CLO</th><th>Teaching activity</th><th>Assessment</th><th>Evidence</th></tr></thead>
      <tbody>
      <tr><td>1 — Identify the pillars</td><td>Weeks 2, 4 lecture</td><td>Quiz 1, Quiz 2</td><td>Quiz scripts</td></tr>
      <tr><td>2 — Explain Tawhid categories</td><td>Week 3 lecture</td><td>Midterm</td><td>Midterm script</td></tr>
      <tr><td>3 — Describe Salah/Taharah</td><td>Week 5 demonstration</td><td>Assignment 1</td><td>Assignment submission</td></tr>
      <tr><td>4 — Apply Fiqh rulings</td><td>Weeks 9, 13</td><td>Quiz 3, Final</td><td>Quiz script, final script</td></tr>
      <tr><td>5 — Demonstrate Salah steps</td><td>Week 6 guided practice</td><td>Instructor-observed practical check, Week 6</td><td>Instructor observation record</td></tr>
      </tbody>
      </table></div>
      <p><strong>Instructor Requirements.</strong> Baseline (§2) plus comfort leading physical Salah demonstration.</p>
      <p><strong>Islamic Scholarly Review.</strong> The Aqeedah content (weeks 2–4, 11–12) is consistent with the Academy's confirmed manhaj and safe to outline at this topic level. The Fiqh content (weeks 5–6, 9–10, 13) depends on Institutional Foundation §12 decision 1 — whether a single madhab is adopted or rulings are presented evidence-based without binding to one school — still open. This course cannot specify which position to teach on any point where schools differ until that decision, and Scholarly Review Committee clearance, are in place.</p>

      <h3>QS-101 — Qur'an Reading Foundations</h3>
      <div class="table-wrap"><table>
      <tbody>
      <tr><td>Department</td><td>Qur'anic Studies</td><td>Program / Pathway</td><td>Foundation Studies</td></tr>
      <tr><td>Level</td><td>Foundation</td><td>Units / Teaching hours</td><td>3 / 45 (3 hrs/week × 15 weeks)</td></tr>
      <tr><td>Expected workload</td><td>~112.5 hrs (45 contact + ~67.5 self-study, ×1.5)</td><td>Prerequisite</td><td>— (entry course)</td></tr>
      <tr><td>Course type</td><td>Recitation/Hifz</td><td>Passing requirement</td><td>60% overall AND minimum 60% on Practical + Final combined (§2)</td></tr>
      </tbody>
      </table></div>
      <p><strong>Course Description.</strong> Correct Qur'anic reading from a zero-prior-knowledge start — letter recognition through guided reading of short Surahs, without yet applying formal Tajwid rules (those begin in QS-102).</p>
      <p><strong>Course Objectives.</strong> Build accurate letter recognition and basic reading fluency; prepare learners to apply Tajwid rules in QS-102; build confidence reading short, familiar Surahs independently.</p>
      <p><strong>Course Learning Outcomes.</strong></p>
      <ol>
      <li><strong>Identify</strong> all Arabic letters in isolated and connected forms.</li>
      <li><strong>Recite</strong> short vowel, long vowel, tanween, and shaddah sounds correctly.</li>
      <li><strong>Recite</strong> short, familiar Surahs (Juz Amma selection) with basic fluency.</li>
      <li><strong>Demonstrate</strong> self-correction of common beginner reading errors.</li>
      </ol>
      <div class="table-wrap"><table>
      <thead><tr><th>Wk</th><th>Topic</th><th>Objectives</th><th>Key concepts</th><th>Activities</th><th>Readings</th><th>Assessment</th></tr></thead>
      <tbody>
      <tr><td>1</td><td>Orientation; alphabet recognition</td><td>Identify isolated letter forms</td><td>28 Arabic letters</td><td>Drill, flashcards</td><td>Course guide</td><td>—</td></tr>
      <tr><td>2</td><td>Letter forms in context</td><td>Identify connected forms</td><td>Initial, medial, final, isolated</td><td>Drill, paired practice</td><td>Reading primer*</td><td>Quiz 1</td></tr>
      <tr><td>3</td><td>Short vowels</td><td>Recite fatha, kasra, damma sounds</td><td>Harakat</td><td>Guided reading</td><td>Reading primer*</td><td>—</td></tr>
      <tr><td>4</td><td>Long vowels / madd letters</td><td>Recite natural extensions correctly</td><td>Alif, waw, ya as madd</td><td>Guided reading</td><td>Reading primer*</td><td>Quiz 2</td></tr>
      <tr><td>5</td><td>Sukoon and consonant clusters</td><td>Recite sukoon correctly</td><td>Sukoon</td><td>Guided reading</td><td>Reading primer*</td><td>Practical check 1</td></tr>
      <tr><td>6</td><td>Tanween</td><td>Recite tanween endings</td><td>Tanween</td><td>Guided reading</td><td>Reading primer*</td><td>—</td></tr>
      <tr><td>7</td><td>Shaddah</td><td>Recite doubled letters</td><td>Shaddah</td><td>Guided reading</td><td>Reading primer*</td><td>Assignment 1</td></tr>
      <tr><td>8</td><td>Midterm Assessment</td><td>—</td><td>—</td><td>—</td><td>—</td><td>Midterm (reading checkpoint)</td></tr>
      <tr><td>9</td><td>Reading short Surahs — guided</td><td>Recite Juz Amma selections</td><td>Selected short Surahs</td><td>Guided group reading</td><td>Mus'haf, selected Surahs</td><td>—</td></tr>
      <tr><td>10</td><td>Reading short Surahs — continued</td><td>Recite with growing independence</td><td>Selected short Surahs</td><td>Guided group reading</td><td>Mus'haf</td><td>Practical check 2</td></tr>
      <tr><td>11</td><td>Fluency practice</td><td>Recite timed passages</td><td>Fluency</td><td>Timed practice</td><td>Mus'haf</td><td>—</td></tr>
      <tr><td>12</td><td>Common errors and correction</td><td>Demonstrate self-correction</td><td>Common misreadings</td><td>Peer review, instructor correction</td><td>Mus'haf</td><td>Assignment 2</td></tr>
      <tr><td>13</td><td>Peer recitation practice</td><td>Recite before peers with feedback</td><td>—</td><td>Peer recitation circle</td><td>Mus'haf</td><td>Practical check 3</td></tr>
      <tr><td>14</td><td>Review and consolidation</td><td>Consolidate the full term</td><td>—</td><td>Review session</td><td>—</td><td>—</td></tr>
      <tr><td>15</td><td>Final Assessment</td><td>—</td><td>—</td><td>—</td><td>—</td><td>Final (oral reading exam)</td></tr>
      </tbody>
      </table></div>
      <p><strong>Required Texts.</strong> A Mus'haf (standard printed Qur'an). <strong>Gap:</strong> no dedicated Arabic-reading primer for absolute beginners currently exists in the Bookstore catalogue (*"reading primer" above is a placeholder) — flagged as decision 35 (§13).</p>
      <p><strong>Recommended Readings.</strong> None at this introductory tier.</p>
      <p><strong>Teaching Methodology &amp; Learning Activities.</strong> Drill and guided reading with heavy repetition; paired and group practice; one-on-one correction is central to this course type and should be budgeted for even in group sessions.</p>
      <p><strong>Assessment.</strong> Recitation/Hifz weighting (§2): Quizzes 10%, Assignments 10%, Midterm 20%, Practical 30%, Final 30%.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>CLO</th><th>Teaching activity</th><th>Assessment</th><th>Evidence</th></tr></thead>
      <tbody>
      <tr><td>1 — Identify letter forms</td><td>Weeks 1–2 drill</td><td>Quiz 1</td><td>Quiz script</td></tr>
      <tr><td>2 — Recite vowels/tanween/shaddah</td><td>Weeks 3–7 guided reading</td><td>Quiz 2, Midterm</td><td>Quiz script, midterm recording</td></tr>
      <tr><td>3 — Recite short Surahs with fluency</td><td>Weeks 9–11 guided group reading</td><td>Practical checks 2–3, Final</td><td>Instructor rubric scores, final recording</td></tr>
      <tr><td>4 — Demonstrate self-correction</td><td>Week 12 peer review</td><td>Assignment 2</td><td>Assignment submission</td></tr>
      </tbody>
      </table></div>
      <p><strong>Practical Competency Rubric.</strong> Each practical check and the final scored 1–4 per criterion: (1) letter accuracy, (2) vowel/tanween/shaddah accuracy, (3) fluency and pacing, (4) self-correction. Overall practical pass requires an average of 3.0/4 or higher, consistent with the 60% Practical+Final floor above.</p>
      <p><strong>Instructor Requirements.</strong> Baseline (§2) plus demonstrated personal recitation competence, assessed by the Head of Department (Academic Governance §7) — formal ijazah requirements are a founder decision (§13, decision 36).</p>
      <p><strong>Islamic Scholarly Review.</strong> Teaching any specific recitation style (riwayah/qira'ah — most commonly Hafs 'an Asim in contemporary practice, but not yet formally adopted by the Academy) requires a Scholarly Review Committee / Qur'an Memorization &amp; Recitation Unit decision before instruction begins — see decision 37 (§13).</p>

      <h3>QS-102 — Tajweed Foundations</h3>
      <div class="table-wrap"><table>
      <tbody>
      <tr><td>Department</td><td>Qur'anic Studies</td><td>Program / Pathway</td><td>Foundation Studies</td></tr>
      <tr><td>Level</td><td>Foundation</td><td>Units / Teaching hours</td><td>2 / 30 (2 hrs/week × 15 weeks)</td></tr>
      <tr><td>Expected workload</td><td>~75 hrs (30 contact + 45 self-study, ×1.5)</td><td>Prerequisite</td><td>QS-101</td></tr>
      <tr><td>Course type</td><td>Recitation/Hifz</td><td>Passing requirement</td><td>60% overall AND minimum 60% on Practical + Final combined (§2)</td></tr>
      </tbody>
      </table></div>
      <p><strong>Course Description.</strong> Foundational Tajwid rules applied to correct recitation — articulation points, letter characteristics, and the core rulings of Noon Sakinah, Tanween, Meem Sakinah, Qalqalah, and natural Madd.</p>
      <p><strong>Course Objectives.</strong> Build accurate articulation of every letter; teach the core Tajwid rulings needed to recite without gross error; prepare learners for Applied Tajweed (QS-201).</p>
      <p><strong>Course Learning Outcomes.</strong></p>
      <ol>
      <li><strong>Identify</strong> the correct articulation point (makhraj) of every Arabic letter.</li>
      <li><strong>Describe</strong> the core characteristics (sifat) of Arabic letters.</li>
      <li><strong>Apply</strong> the rules of Noon Sakinah, Tanween, Meem Sakinah, Qalqalah, and natural Madd.</li>
      <li><strong>Recite</strong> short passages applying these rules correctly.</li>
      </ol>
      <div class="table-wrap"><table>
      <thead><tr><th>Wk</th><th>Topic</th><th>Objectives</th><th>Key concepts</th><th>Activities</th><th>Readings</th><th>Assessment</th></tr></thead>
      <tbody>
      <tr><td>1</td><td>What is Tajwid; course overview</td><td>Explain why Tajwid matters</td><td>Tajwid, Lahn</td><td>Lecture</td><td>Course guide</td><td>—</td></tr>
      <tr><td>2</td><td>Makharij — throat letters</td><td>Identify throat articulation points</td><td>Halq letters</td><td>Demonstration, drill</td><td>Instructor handout*</td><td>Quiz 1</td></tr>
      <tr><td>3</td><td>Makharij — tongue letters</td><td>Identify tongue articulation points</td><td>Lisan letters</td><td>Demonstration, drill</td><td>Instructor handout*</td><td>—</td></tr>
      <tr><td>4</td><td>Makharij — lip letters</td><td>Identify lip articulation points</td><td>Shafatayn letters</td><td>Demonstration, drill</td><td>Instructor handout*</td><td>Practical check 1</td></tr>
      <tr><td>5</td><td>Sifat al-Huruf, part 1</td><td>Describe strong/weak letter characteristics</td><td>Sifat</td><td>Lecture, drill</td><td>Instructor handout*</td><td>Quiz 2</td></tr>
      <tr><td>6</td><td>Sifat al-Huruf, part 2</td><td>Describe remaining characteristics</td><td>Sifat</td><td>Lecture, drill</td><td>Instructor handout*</td><td>—</td></tr>
      <tr><td>7</td><td>Noon Sakinah/Tanween — Izhar, Idgham</td><td>Apply Izhar and Idgham rules</td><td>Izhar, Idgham</td><td>Guided reading</td><td>Instructor handout*</td><td>Assignment 1</td></tr>
      <tr><td>8</td><td>Midterm Assessment</td><td>—</td><td>—</td><td>—</td><td>—</td><td>Midterm (recitation checkpoint)</td></tr>
      <tr><td>9</td><td>Noon Sakinah/Tanween — Iqlab, Ikhfa</td><td>Apply Iqlab and Ikhfa rules</td><td>Iqlab, Ikhfa</td><td>Guided reading</td><td>Instructor handout*</td><td>Practical check 2</td></tr>
      <tr><td>10</td><td>Rules of Meem Sakinah</td><td>Apply Meem Sakinah rules</td><td>Idgham Shafawi, Ikhfa Shafawi, Izhar Shafawi</td><td>Guided reading</td><td>Instructor handout*</td><td>Quiz 3</td></tr>
      <tr><td>11</td><td>Qalqalah</td><td>Apply Qalqalah correctly</td><td>Qalqalah letters</td><td>Guided reading</td><td>Instructor handout*</td><td>—</td></tr>
      <tr><td>12</td><td>Basic Madd rules</td><td>Apply natural Madd</td><td>Madd Tabi'i</td><td>Guided reading</td><td>Instructor handout*</td><td>Assignment 2</td></tr>
      <tr><td>13</td><td>Applied recitation practice</td><td>Recite short passages applying all rules</td><td>—</td><td>Guided practice</td><td>Mus'haf</td><td>Practical check 3</td></tr>
      <tr><td>14</td><td>Review and consolidation</td><td>Consolidate the full term</td><td>—</td><td>Review session</td><td>—</td><td>—</td></tr>
      <tr><td>15</td><td>Final Assessment</td><td>—</td><td>—</td><td>—</td><td>—</td><td>Final (oral Tajwid exam)</td></tr>
      </tbody>
      </table></div>
      <p><strong>Required Texts.</strong> <strong>Gap:</strong> no Tajwid manual currently exists in the Bookstore catalogue (*instructor handouts are a stand-in) — same gap as QS-101, flagged together as decision 35 (§13).</p>
      <p><strong>Recommended Readings.</strong> None at this introductory tier.</p>
      <p><strong>Teaching Methodology &amp; Learning Activities.</strong> Demonstration-led articulation drills; guided reading applying each rule as it's introduced; heavy one-on-one correction, same as QS-101.</p>
      <p><strong>Assessment.</strong> Recitation/Hifz weighting (§2): Quizzes 10%, Assignments 10%, Midterm 20%, Practical 30%, Final 30%.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>CLO</th><th>Teaching activity</th><th>Assessment</th><th>Evidence</th></tr></thead>
      <tbody>
      <tr><td>1 — Identify makharij</td><td>Weeks 2–4 demonstration</td><td>Quiz 1, Practical check 1</td><td>Quiz script, rubric score</td></tr>
      <tr><td>2 — Describe sifat</td><td>Weeks 5–6 lecture</td><td>Quiz 2</td><td>Quiz script</td></tr>
      <tr><td>3 — Apply Noon/Meem/Qalqalah/Madd rules</td><td>Weeks 7, 9–12</td><td>Midterm, Practical check 2, Quiz 3, Assignment 2</td><td>Midterm recording, rubric score, quiz script, assignment</td></tr>
      <tr><td>4 — Recite applying all rules</td><td>Week 13 guided practice</td><td>Practical check 3, Final</td><td>Rubric score, final recording</td></tr>
      </tbody>
      </table></div>
      <p><strong>Practical Competency Rubric.</strong> Same four-criterion, 1–4 scale as QS-101 (§ above), with Tajwid-specific criteria: (1) makhraj accuracy, (2) sifat accuracy, (3) correct application of the term's rules, (4) fluency under applied rules. Pass requires 3.0/4 average.</p>
      <p><strong>Instructor Requirements.</strong> Baseline (§2) plus demonstrated Tajwid competence, same open ijazah-requirement question as QS-101 (decision 36).</p>
      <p><strong>Islamic Scholarly Review.</strong> Same riwayah/qira'ah dependency as QS-101 (decision 37) — the specific rule variants taught (e.g., Idgham/Ikhfa letter groupings) can differ slightly by riwayah, so this course cannot be finalized independently of that decision.</p>

      <h3>AR-101 — Arabic Foundations</h3>
      <div class="table-wrap"><table>
      <tbody>
      <tr><td>Department</td><td>Arabic Language</td><td>Program / Pathway</td><td>Foundation Studies</td></tr>
      <tr><td>Level</td><td>Foundation</td><td>Units / Teaching hours</td><td>3 / 45 (3 hrs/week × 15 weeks)</td></tr>
      <tr><td>Expected workload</td><td>~112.5 hrs (45 contact + ~67.5 self-study, ×1.5)</td><td>Prerequisite</td><td>— (entry course)</td></tr>
      <tr><td>Course type</td><td>Language</td><td>Passing requirement</td><td>60% overall, no component below 40% (§2)</td></tr>
      </tbody>
      </table></div>
      <p><strong>Course Description.</strong> A zero-Arabic entry point building basic vocabulary, sentence structure, and everyday communication — general Arabic proficiency, distinct from QS-101's Qur'an-specific reading focus.</p>
      <p><strong>Course Objectives.</strong> Build basic vocabulary and recognition of simple sentence structure; introduce nouns, pronouns, and simple verbs; prepare learners for Arabic Grammar I (AR-201).</p>
      <p><strong>Course Learning Outcomes.</strong></p>
      <ol>
      <li><strong>Identify</strong> the Arabic alphabet and basic sounds.</li>
      <li><strong>Describe</strong> gender and number for Arabic nouns.</li>
      <li><strong>Apply</strong> basic pronouns and simple verb forms in short sentences.</li>
      <li><strong>Produce</strong> simple original sentences using taught vocabulary and structures.</li>
      </ol>
      <div class="table-wrap"><table>
      <thead><tr><th>Wk</th><th>Topic</th><th>Objectives</th><th>Key concepts</th><th>Activities</th><th>Readings</th><th>Assessment</th></tr></thead>
      <tbody>
      <tr><td>1</td><td>Alphabet and sounds</td><td>Identify letters and sounds</td><td>Arabic alphabet</td><td>Drill</td><td>Arabic Language Foundations, ch. 1</td><td>—</td></tr>
      <tr><td>2</td><td>Greetings and everyday vocabulary</td><td>Identify common greetings</td><td>Everyday vocabulary</td><td>Role play</td><td>Arabic Language Foundations, ch. 2</td><td>Quiz 1</td></tr>
      <tr><td>3</td><td>Nouns — gender</td><td>Describe masculine/feminine nouns</td><td>Mudhakkar, Mu'annath</td><td>Drill, pair work</td><td>Arabic Language Foundations, ch. 3</td><td>—</td></tr>
      <tr><td>4</td><td>Nouns — number</td><td>Describe singular/dual/plural</td><td>Mufrad, Muthanna, Jam'</td><td>Drill</td><td>Arabic Language Foundations, ch. 3</td><td>Quiz 2</td></tr>
      <tr><td>5</td><td>Personal pronouns</td><td>Apply personal pronouns</td><td>Damaa'ir</td><td>Drill, pair work</td><td>Arabic Language Foundations, ch. 4</td><td>Assignment 1</td></tr>
      <tr><td>6</td><td>Simple nominal sentences</td><td>Apply Mubtada/Khabar structure</td><td>Mubtada, Khabar</td><td>Guided practice</td><td>Arabic Language Foundations, ch. 5</td><td>—</td></tr>
      <tr><td>7</td><td>Review</td><td>Consolidate weeks 1–6</td><td>—</td><td>Review session</td><td>—</td><td>—</td></tr>
      <tr><td>8</td><td>Midterm Assessment</td><td>—</td><td>—</td><td>—</td><td>—</td><td>Midterm</td></tr>
      <tr><td>9</td><td>Basic prepositions</td><td>Apply common prepositions</td><td>Huroof al-Jarr</td><td>Drill</td><td>Arabic Language Foundations, ch. 6</td><td>Quiz 3</td></tr>
      <tr><td>10</td><td>Demonstrative pronouns</td><td>Apply this/that constructions</td><td>Asma' al-Ishara</td><td>Drill, pair work</td><td>Arabic Language Foundations, ch. 6</td><td>—</td></tr>
      <tr><td>11</td><td>Simple verbs — past tense</td><td>Apply past-tense verb forms</td><td>Fi'l Madi (intro)</td><td>Drill</td><td>Arabic Language Foundations, ch. 7</td><td>Assignment 2</td></tr>
      <tr><td>12</td><td>Simple verbs — present tense</td><td>Apply present-tense verb forms</td><td>Fi'l Mudari' (intro)</td><td>Drill</td><td>Arabic Language Foundations, ch. 7</td><td>Quiz 4</td></tr>
      <tr><td>13</td><td>Numbers 1–10; sentence building</td><td>Produce original simple sentences</td><td>Numbers, applied grammar</td><td>Guided writing/speaking practice</td><td>Arabic Language Foundations, ch. 8</td><td>—</td></tr>
      <tr><td>14</td><td>Review and consolidation</td><td>Consolidate the full term</td><td>—</td><td>Review session</td><td>—</td><td>—</td></tr>
      <tr><td>15</td><td>Final Assessment</td><td>—</td><td>—</td><td>—</td><td>—</td><td>Final</td></tr>
      </tbody>
      </table></div>
      <p><strong>Required Texts.</strong> <em>Arabic Language Foundations</em> (Academy Bookstore) — a direct, confirmed match for this course.</p>
      <p><strong>Recommended Readings.</strong> None beyond the required text at this introductory tier.</p>
      <p><strong>Teaching Methodology &amp; Learning Activities.</strong> Drill-based vocabulary and structure building, role play for everyday communication, pair work for applied practice.</p>
      <p><strong>Assessment.</strong> Core/Language weighting (§2): Quizzes 15%, Assignments 20%, Midterm 25%, Final 40%.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>CLO</th><th>Teaching activity</th><th>Assessment</th><th>Evidence</th></tr></thead>
      <tbody>
      <tr><td>1 — Identify alphabet/sounds</td><td>Week 1 drill</td><td>Midterm</td><td>Midterm script</td></tr>
      <tr><td>2 — Describe gender/number</td><td>Weeks 3–4 drill</td><td>Quiz 1, Quiz 2</td><td>Quiz scripts</td></tr>
      <tr><td>3 — Apply pronouns/verbs</td><td>Weeks 5, 9–12</td><td>Assignment 1, Quiz 3, Quiz 4</td><td>Assignment, quiz scripts</td></tr>
      <tr><td>4 — Produce original sentences</td><td>Week 13 guided practice</td><td>Assignment 2, Final</td><td>Assignment, final script</td></tr>
      </tbody>
      </table></div>
      <p><strong>Instructor Requirements.</strong> Baseline (§2); no course-specific addition — general Arabic proficiency, no religious-content qualification needed.</p>
      <p><strong>Islamic Scholarly Review.</strong> Not required. This course teaches general Arabic language, not Islamic rulings, positions, or Qur'anic content — no dependency on the open manhaj or riwayah decisions.</p>

      <h3>IE-101 — Islamic Character &amp; Adab</h3>
      <div class="table-wrap"><table>
      <tbody>
      <tr><td>Department</td><td>Islamic Education &amp; Tarbiyah</td><td>Program / Pathway</td><td>Foundation Studies</td></tr>
      <tr><td>Level</td><td>Foundation</td><td>Units / Teaching hours</td><td>2 / 30 (2 hrs/week × 15 weeks)</td></tr>
      <tr><td>Expected workload</td><td>~60 hrs (30 contact + 30 self-study)</td><td>Prerequisite</td><td>— (entry course)</td></tr>
      <tr><td>Course type</td><td>Core</td><td>Passing requirement</td><td>60% overall; Practical component instructor-attested, not purely computed (§2)</td></tr>
      </tbody>
      </table></div>
      <p><strong>Course Description.</strong> The Foundation-tier adab/character anchor — the entry point into the Tazkiyah chain that continues in IE-202. Covers adab with Allah, the Qur'an, parents, teachers, peers, and the community.</p>
      <p><strong>Course Objectives.</strong> Build a working, practiced vocabulary of Islamic adab; establish consistent, observable conduct as a graded expectation from the first term, not an afterthought; prepare learners for Tazkiyah I (IE-202).</p>
      <p><strong>Course Learning Outcomes.</strong></p>
      <ol>
      <li><strong>Identify</strong> the core areas of Islamic adab covered in this course.</li>
      <li><strong>Explain</strong> why sincerity, honesty, and patience matter as Islamic character traits, not just social conventions.</li>
      <li><strong>Demonstrate</strong> consistent Islamic adab in conduct and interaction over the term.</li>
      <li><strong>Evaluate</strong> a short case scenario for which adab principle applies.</li>
      </ol>
      <div class="table-wrap"><table>
      <thead><tr><th>Wk</th><th>Topic</th><th>Objectives</th><th>Key concepts</th><th>Activities</th><th>Readings</th><th>Assessment</th></tr></thead>
      <tbody>
      <tr><td>1</td><td>What is adab; course overview</td><td>Identify why character matters in Islam</td><td>Adab, Akhlaq</td><td>Lecture, discussion</td><td>Course guide</td><td>—</td></tr>
      <tr><td>2</td><td>Adab with Allah</td><td>Explain sincerity and gratitude</td><td>Ikhlas, Shukr</td><td>Discussion</td><td>Purification of the Soul, ch. 1*</td><td>—</td></tr>
      <tr><td>3</td><td>Adab with the Qur'an</td><td>Describe Qur'an etiquette</td><td>Respect, handling, listening</td><td>Discussion, demonstration</td><td>Purification of the Soul, ch. 1*</td><td>Quiz 1</td></tr>
      <tr><td>4</td><td>Adab with parents</td><td>Explain birr al-walidayn</td><td>Birr al-Walidayn</td><td>Discussion, case scenarios</td><td>Purification of the Soul, ch. 2*</td><td>—</td></tr>
      <tr><td>5</td><td>Adab with teachers and elders</td><td>Describe respect for teachers/elders</td><td>Respect, humility</td><td>Discussion</td><td>Purification of the Soul, ch. 2*</td><td>Reflective journal 1</td></tr>
      <tr><td>6</td><td>Adab with peers and community</td><td>Evaluate case scenarios on peer conduct</td><td>Ukhuwwah, mutual respect</td><td>Case discussion</td><td>Purification of the Soul, ch. 3*</td><td>—</td></tr>
      <tr><td>7</td><td>Midterm — instructor check-in + reflective assignment</td><td>—</td><td>—</td><td>One-on-one check-in</td><td>—</td><td>Midterm</td></tr>
      <tr><td>8</td><td>Adab of speech</td><td>Explain truthfulness, avoiding backbiting</td><td>Sidq, Ghibah</td><td>Discussion, case scenarios</td><td>Purification of the Soul, ch. 4*</td><td>Quiz 2</td></tr>
      <tr><td>9</td><td>Adab of eating and daily routines</td><td>Describe everyday adab</td><td>Daily-life etiquette</td><td>Discussion</td><td>Purification of the Soul, ch. 4*</td><td>—</td></tr>
      <tr><td>10</td><td>Adab of the masjid and public spaces</td><td>Describe public-space etiquette</td><td>Masjid adab</td><td>Discussion, demonstration</td><td>Purification of the Soul, ch. 5*</td><td>Reflective journal 2</td></tr>
      <tr><td>11</td><td>Adab of dress and personal conduct</td><td>Describe modest, appropriate conduct</td><td>Haya', modesty</td><td>Discussion</td><td>Purification of the Soul, ch. 5*</td><td>—</td></tr>
      <tr><td>12</td><td>Honesty, trustworthiness, promises</td><td>Explain amanah and keeping one's word</td><td>Amanah, Wafa' bil-'Ahd</td><td>Case discussion</td><td>Purification of the Soul, ch. 6*</td><td>Quiz 3</td></tr>
      <tr><td>13</td><td>Patience and self-control</td><td>Evaluate case studies on sabr</td><td>Sabr</td><td>Case discussion</td><td>Purification of the Soul, ch. 6*</td><td>—</td></tr>
      <tr><td>14</td><td>Review; portfolio compilation</td><td>Consolidate the term's reflections</td><td>—</td><td>Portfolio workshop</td><td>—</td><td>—</td></tr>
      <tr><td>15</td><td>Final Assessment</td><td>—</td><td>—</td><td>—</td><td>—</td><td>Final (portfolio + instructor evaluation)</td></tr>
      </tbody>
      </table></div>
      <p><strong>Required Texts.</strong> <em>Purification of the Soul</em> (Academy Bookstore)* — the closest topical match; note it is written at a more advanced level than a pure Foundation-tier adab primer, so its use here should be confirmed by the Head of Department rather than assumed automatically correct — flagged as decision 38 (§13).</p>
      <p><strong>Recommended Readings.</strong> None assigned beyond the required text.</p>
      <p><strong>Teaching Methodology &amp; Learning Activities.</strong> Discussion-led, case-scenario-based — adab is practiced and evaluated, not memorized from a list. Reflective journaling gives instructors an ongoing, dated record of a learner's engagement across the term, feeding the instructor-attested Practical component.</p>
      <p><strong>Assessment.</strong> Character/practical weighting (§2): Quizzes 10%, Assignments (reflective journal) 25%, Midterm 20%, Practical (instructor-observed conduct) 25%, Final 20%.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>CLO</th><th>Teaching activity</th><th>Assessment</th><th>Evidence</th></tr></thead>
      <tbody>
      <tr><td>1 — Identify core adab areas</td><td>Week 1 lecture</td><td>Quiz 1</td><td>Quiz script</td></tr>
      <tr><td>2 — Explain why traits matter</td><td>Weeks 2, 8, 12</td><td>Quiz 2, Quiz 3</td><td>Quiz scripts</td></tr>
      <tr><td>3 — Demonstrate consistent adab</td><td>Ongoing, weeks 1–13</td><td>Practical component (instructor-observed)</td><td>Instructor observation log</td></tr>
      <tr><td>4 — Evaluate case scenarios</td><td>Weeks 4, 6, 13</td><td>Reflective journals 1–2, Midterm</td><td>Journal entries, midterm notes</td></tr>
      </tbody>
      </table></div>
      <p><strong>Instructor Requirements.</strong> Baseline (§2) plus training in observational/formative assessment, since a meaningful share of this course's grade rests on instructor-attested conduct rather than written tests.</p>
      <p><strong>Islamic Scholarly Review.</strong> The adab principles taught here (sincerity, honesty, respect for parents/teachers, patience) are consensus-level content consistent with the confirmed manhaj and do not depend on the open madhab decision. The required text's specific framing (Purification of the Soul) should still receive a light Scholarly Review Committee read-through before adoption, given decision 38's open question about its fit at this tier.</p>

      <h3>RL-101 — Basic Study Skills</h3>
      <div class="table-wrap"><table>
      <tbody>
      <tr><td>Unit</td><td>Research &amp; Learning Skills (cross-cutting)</td><td>Program / Pathway</td><td>Foundation Studies</td></tr>
      <tr><td>Level</td><td>Foundation</td><td>Units / Teaching hours</td><td>1 / 15 (3 hrs/week × 5 weeks — front-loaded, see note)</td></tr>
      <tr><td>Expected workload</td><td>~30 hrs (15 contact + 15 self-study)</td><td>Prerequisite</td><td>— (entry course)</td></tr>
      <tr><td>Course type</td><td>Core</td><td>Passing requirement</td><td>60% overall, no component below 40% (§2)</td></tr>
      </tbody>
      </table></div>
      <p><strong>Term-length note.</strong> Run as a front-loaded 5-week intensive within the 15-week Foundation term, rather than 1 hour/week for 15 weeks — study skills are most useful learned before the rest of the term's coursework load peaks, not spread thin across it. This is a course-specific exception to §2's default convention, made explicitly and for a stated reason, not silently.</p>
      <p><strong>Course Description.</strong> How to learn, take notes, manage time, and prepare for assessment — a general-education foundation every later course assumes, taught early so it's available before it's needed.</p>
      <p><strong>Course Objectives.</strong> Build practical note-taking and time-management habits; introduce active-recall based review techniques; give every learner a shared baseline before Intermediate's heavier workload.</p>
      <p><strong>Course Learning Outcomes.</strong></p>
      <ol>
      <li><strong>Identify</strong> personal learning preferences and common study obstacles.</li>
      <li><strong>Apply</strong> a structured note-taking method.</li>
      <li><strong>Apply</strong> a weekly study schedule.</li>
      <li><strong>Demonstrate</strong> active-recall review techniques when preparing for assessment.</li>
      </ol>
      <div class="table-wrap"><table>
      <thead><tr><th>Wk</th><th>Topic</th><th>Objectives</th><th>Key concepts</th><th>Activities</th><th>Readings</th><th>Assessment</th></tr></thead>
      <tbody>
      <tr><td>1</td><td>Why study skills matter; learning styles</td><td>Identify personal learning preferences</td><td>Learning styles, study obstacles</td><td>Self-assessment, discussion</td><td>Course guide</td><td>—</td></tr>
      <tr><td>2</td><td>Note-taking techniques</td><td>Apply a structured note-taking method</td><td>Cornell method, outlining</td><td>Guided practice</td><td>Instructor handout*</td><td>Quiz 1</td></tr>
      <tr><td>3</td><td>Time management and study routines</td><td>Apply a weekly study schedule</td><td>Scheduling, prioritization</td><td>Guided workshop</td><td>Instructor handout*</td><td>Assignment 1</td></tr>
      <tr><td>4</td><td>Preparing for assessments; active recall</td><td>Demonstrate active-recall techniques</td><td>Active recall, spaced review</td><td>Guided practice</td><td>Instructor handout*</td><td>—</td></tr>
      <tr><td>5</td><td>Final Assessment</td><td>—</td><td>—</td><td>—</td><td>—</td><td>Final (applied study-skills portfolio)</td></tr>
      </tbody>
      </table></div>
      <p><strong>Required Texts.</strong> <strong>Gap:</strong> none of the Bookstore's titles are general-education study-skills resources (all are Islamic-sciences texts) — appropriate, since this is non-religious pedagogical content. A general study-skills resource should be selected at ordinary department discretion, not through Scholarly Review (*handouts above are a placeholder pending that selection) — flagged as decision 39 (§13), a curriculum-design gap, not a scholarly one.</p>
      <p><strong>Recommended Readings.</strong> None at this introductory tier.</p>
      <p><strong>Teaching Methodology &amp; Learning Activities.</strong> Workshop-style, applied practice over lecture — learners leave each session having actually used the technique, not just heard about it.</p>
      <p><strong>Assessment.</strong> Core weighting (§2), condensed for a 1-unit/5-week course: Quiz 1 15%, Assignment 1 20%, Final portfolio 65% (no separate midterm, given the course's short span).</p>
      <div class="table-wrap"><table>
      <thead><tr><th>CLO</th><th>Teaching activity</th><th>Assessment</th><th>Evidence</th></tr></thead>
      <tbody>
      <tr><td>1 — Identify preferences/obstacles</td><td>Week 1 self-assessment</td><td>Final portfolio (reflection component)</td><td>Portfolio submission</td></tr>
      <tr><td>2 — Apply note-taking method</td><td>Week 2 guided practice</td><td>Quiz 1</td><td>Quiz script</td></tr>
      <tr><td>3 — Apply study schedule</td><td>Week 3 workshop</td><td>Assignment 1</td><td>Assignment submission</td></tr>
      <tr><td>4 — Demonstrate active recall</td><td>Week 4 guided practice</td><td>Final portfolio (technique log)</td><td>Portfolio submission</td></tr>
      </tbody>
      </table></div>
      <p><strong>Instructor Requirements.</strong> Baseline (§2); no religious-content qualification needed.</p>
      <p><strong>Islamic Scholarly Review.</strong> Not required. General academic study-skills content, no Islamic-ruling or interpretive content.</p>

      <h2>5. Intermediate Islamic Studies</h2>
      <p>All ten Intermediate-tier courses (Academic Pathways §4), one per department/unit plus IS's three. A note on weighting profiles first: §2's table headers ("Core/Language/Research," "Recitation/Hifz," "Character/practical") are <em>assessment-nature</em> profiles this document chooses per course, not a re-statement of Course Catalogue's catalogue Type field — IE-201 and IE-202 are both catalogued Core in Course Catalogue but use the Character/practical profile here because their content is practiced and observed, not just recalled, matching how IE-101 was treated in Foundation Studies (§4).</p>

      <h3>IS-201 — Intermediate Aqeedah</h3>
      <div class="table-wrap"><table>
      <tbody>
      <tr><td>Department</td><td>Islamic Studies</td><td>Program / Pathway</td><td>Intermediate Islamic Studies</td></tr>
      <tr><td>Level</td><td>Intermediate</td><td>Units / Teaching hours</td><td>3 / 45 (3 hrs/week × 15 weeks)</td></tr>
      <tr><td>Expected workload</td><td>~90 hrs</td><td>Prerequisite</td><td>IS-101</td></tr>
      <tr><td>Course type</td><td>Core</td><td>Passing requirement</td><td>60% overall, no component below 40%</td></tr>
      </tbody>
      </table></div>
      <p><strong>Description.</strong> Aqeedah taught as a connected, systematic body of knowledge — the three categories of Tawhid, shirk, and the six pillars of Iman, each in depth rather than overview.</p>
      <p><strong>Objectives.</strong> Move learners from recall to systematic understanding of core belief; prepare for Advanced Aqeedah (IS-301).</p>
      <p><strong>Learning Outcomes.</strong></p>
      <ol>
      <li><strong>Explain</strong> the three categories of Tawhid systematically.</li>
      <li><strong>Compare</strong> major and minor shirk.</li>
      <li><strong>Describe</strong> each of the six pillars of Iman in depth.</li>
      <li><strong>Analyze</strong> a short scenario for which category of Tawhid it engages.</li>
      </ol>
      <div class="table-wrap"><table>
      <thead><tr><th>Wk</th><th>Topic</th><th>Objectives</th><th>Key concepts</th><th>Activities</th><th>Readings</th><th>Assessment</th></tr></thead>
      <tbody>
      <tr><td>1</td><td>From isolated facts to systematic Aqeedah</td><td>Explain the shift from Foundation</td><td>Systematic study</td><td>Lecture</td><td>Kitab At-Tawhid, intro</td><td>—</td></tr>
      <tr><td>2</td><td>Tawhid ar-Ruboobiyyah in depth</td><td>Explain Ruboobiyyah</td><td>Lordship</td><td>Lecture, discussion</td><td>Kitab At-Tawhid, ch. 1–3</td><td>Quiz 1</td></tr>
      <tr><td>3</td><td>Tawhid al-Uloohiyyah in depth</td><td>Explain Uloohiyyah</td><td>Worship</td><td>Lecture, discussion</td><td>Kitab At-Tawhid, ch. 4–6</td><td>—</td></tr>
      <tr><td>4</td><td>Tawhid al-Asma wa Sifat in depth</td><td>Explain Names and Attributes</td><td>Divine names</td><td>Lecture, discussion</td><td>Kitab At-Tawhid, ch. 7–9</td><td>Quiz 2</td></tr>
      <tr><td>5</td><td>Shirk — major and minor</td><td>Compare shirk categories</td><td>Shirk</td><td>Lecture, case discussion</td><td>Kitab At-Tawhid, ch. 10–12</td><td>Assignment 1</td></tr>
      <tr><td>6</td><td>Nullifiers of Islam (overview)</td><td>Identify the nullifiers, cautiously framed</td><td>Nawaqid al-Islam</td><td>Lecture, discussion</td><td>Kitab At-Tawhid, ch. 13</td><td>—</td></tr>
      <tr><td>7</td><td>Review</td><td>Consolidate weeks 1–6</td><td>—</td><td>Review session</td><td>—</td><td>—</td></tr>
      <tr><td>8</td><td>Midterm</td><td>—</td><td>—</td><td>—</td><td>—</td><td>Midterm</td></tr>
      <tr><td>9</td><td>Belief in the unseen, systematized</td><td>Explain Ghayb systematically</td><td>Ghayb</td><td>Lecture</td><td>Instructor handout*</td><td>Quiz 3</td></tr>
      <tr><td>10</td><td>Angels — roles and named angels</td><td>Describe angelic roles</td><td>Malaa'ikah</td><td>Lecture, discussion</td><td>Instructor handout*</td><td>—</td></tr>
      <tr><td>11</td><td>Divine books, systematic overview</td><td>Describe the divine books</td><td>Kutub</td><td>Lecture</td><td>Instructor handout*</td><td>Assignment 2</td></tr>
      <tr><td>12</td><td>Prophethood, systematic overview</td><td>Describe the role of prophethood</td><td>Nubuwwah, Risalah</td><td>Lecture, discussion</td><td>Instructor handout*</td><td>Quiz 4</td></tr>
      <tr><td>13</td><td>Qadr, systematic treatment</td><td>Analyze scenarios involving Qadr</td><td>Qadr</td><td>Case discussion</td><td>Instructor handout*</td><td>—</td></tr>
      <tr><td>14</td><td>Review and consolidation</td><td>Consolidate the term</td><td>—</td><td>Review session</td><td>—</td><td>—</td></tr>
      <tr><td>15</td><td>Final</td><td>—</td><td>—</td><td>—</td><td>—</td><td>Final</td></tr>
      </tbody>
      </table></div>
      <p><strong>Required Texts.</strong> <em>Kitab At-Tawhid</em> (Academy Bookstore). <strong>Recommended Readings.</strong> None beyond the required text. <strong>Teaching Methodology.</strong> Lecture and discussion, building systematically on IS-101 rather than repeating it.</p>
      <p><strong>Assessment (Core: 15/20/25/40).</strong></p>
      <div class="table-wrap"><table>
      <thead><tr><th>CLO</th><th>Teaching activity</th><th>Assessment</th><th>Evidence</th></tr></thead>
      <tbody>
      <tr><td>1 — Explain Tawhid categories</td><td>Weeks 2–4</td><td>Quiz 1, Quiz 2, Midterm</td><td>Quiz/midterm scripts</td></tr>
      <tr><td>2 — Compare shirk</td><td>Week 5</td><td>Assignment 1</td><td>Assignment submission</td></tr>
      <tr><td>3 — Describe pillars of Iman</td><td>Weeks 9–12</td><td>Quiz 3, Quiz 4</td><td>Quiz scripts</td></tr>
      <tr><td>4 — Analyze scenarios</td><td>Week 13</td><td>Assignment 2, Final</td><td>Assignment, final script</td></tr>
      </tbody>
      </table></div>
      <p><strong>Instructor Requirements.</strong> Baseline (§2). <strong>Islamic Scholarly Review.</strong> Consistent with the confirmed manhaj at this topic level; the nullifiers-of-Islam topic (week 6) should be reviewed by the Scholarly Review Committee before teaching, given its sensitivity, before this course is finalized.</p>

      <h3>IS-202 — Intermediate Fiqh</h3>
      <div class="table-wrap"><table>
      <tbody>
      <tr><td>Department</td><td>Islamic Studies</td><td>Program / Pathway</td><td>Intermediate Islamic Studies</td></tr>
      <tr><td>Level</td><td>Intermediate</td><td>Units / Teaching hours</td><td>3 / 45 (3 hrs/week × 15 weeks)</td></tr>
      <tr><td>Expected workload</td><td>~90 hrs</td><td>Prerequisite</td><td>IS-101</td></tr>
      <tr><td>Course type</td><td>Core</td><td>Passing requirement</td><td>60% overall, no component below 40%</td></tr>
      </tbody>
      </table></div>
      <p><strong>Description.</strong> Systematic Fiqh across Taharah, Salah, Zakah, Sawm, and Hajj, plus an introduction to transactions and marriage — building on Foundation's essentials.</p>
      <p><strong>Objectives.</strong> Teach the systematic structure behind everyday Fiqh; prepare learners for Usul al-Fiqh (IS-302).</p>
      <p><strong>Learning Outcomes.</strong></p>
      <ol>
      <li><strong>Describe</strong> the systematic structure of Taharah and Salah rulings.</li>
      <li><strong>Apply</strong> Zakah, Sawm, and Hajj rulings to worked scenarios.</li>
      <li><strong>Explain</strong> the basics of transaction and marriage Fiqh.</li>
      <li><strong>Compare</strong> obligatory and voluntary acts of worship.</li>
      </ol>
      <div class="table-wrap"><table>
      <thead><tr><th>Wk</th><th>Topic</th><th>Objectives</th><th>Key concepts</th><th>Activities</th><th>Readings</th><th>Assessment</th></tr></thead>
      <tbody>
      <tr><td>1</td><td>Systematic Fiqh vs isolated rulings</td><td>Explain the shift from Foundation</td><td>Fiqh structure</td><td>Lecture</td><td>Umdat Al-Ahkam, intro</td><td>—</td></tr>
      <tr><td>2</td><td>Fiqh of Taharah, systematic</td><td>Describe Taharah rulings</td><td>Taharah</td><td>Lecture</td><td>Umdat Al-Ahkam, selected</td><td>Quiz 1</td></tr>
      <tr><td>3</td><td>Fiqh of Salah — conditions and pillars</td><td>Describe Salah's structure</td><td>Arkan, Shurut</td><td>Lecture</td><td>Umdat Al-Ahkam, selected</td><td>—</td></tr>
      <tr><td>4</td><td>Fiqh of Salah — voluntary/congregational</td><td>Compare obligatory/voluntary acts</td><td>Sunan, Jama'ah</td><td>Lecture, discussion</td><td>Umdat Al-Ahkam, selected</td><td>Quiz 2</td></tr>
      <tr><td>5</td><td>Fiqh of Zakah, systematic</td><td>Apply Zakah rulings to scenarios</td><td>Nisab, Zakah categories</td><td>Case scenarios</td><td>Umdat Al-Ahkam, selected</td><td>Assignment 1</td></tr>
      <tr><td>6</td><td>Fiqh of Sawm, systematic</td><td>Apply Sawm rulings to scenarios</td><td>Sawm conditions</td><td>Case scenarios</td><td>Umdat Al-Ahkam, selected</td><td>—</td></tr>
      <tr><td>7</td><td>Review</td><td>Consolidate weeks 1–6</td><td>—</td><td>Review session</td><td>—</td><td>—</td></tr>
      <tr><td>8</td><td>Midterm</td><td>—</td><td>—</td><td>—</td><td>—</td><td>Midterm</td></tr>
      <tr><td>9</td><td>Fiqh of Hajj, systematic</td><td>Apply Hajj rulings to scenarios</td><td>Hajj rites</td><td>Case scenarios</td><td>Umdat Al-Ahkam, selected</td><td>Quiz 3</td></tr>
      <tr><td>10</td><td>Business transactions, basics</td><td>Explain basic transaction Fiqh</td><td>Buyu', Riba (overview)</td><td>Lecture</td><td>Instructor handout*</td><td>—</td></tr>
      <tr><td>11</td><td>Marriage, basics (introductory)</td><td>Explain basic marriage Fiqh</td><td>Nikah (overview)</td><td>Lecture</td><td>Instructor handout*</td><td>Assignment 2</td></tr>
      <tr><td>12</td><td>Halal food and dietary rulings</td><td>Apply dietary rulings to scenarios</td><td>Halal/haram food</td><td>Case scenarios</td><td>Instructor handout*</td><td>Quiz 4</td></tr>
      <tr><td>13</td><td>Contemporary everyday Fiqh questions</td><td>Explain how classical rulings meet modern cases</td><td>Applied Fiqh</td><td>Discussion</td><td>Instructor handout*</td><td>—</td></tr>
      <tr><td>14</td><td>Review and consolidation</td><td>Consolidate the term</td><td>—</td><td>Review session</td><td>—</td><td>—</td></tr>
      <tr><td>15</td><td>Final</td><td>—</td><td>—</td><td>—</td><td>—</td><td>Final</td></tr>
      </tbody>
      </table></div>
      <p><strong>Required Texts.</strong> <em>Umdat Al-Ahkam</em> (Academy Bookstore). <strong>Recommended Readings.</strong> None beyond the required text. <strong>Teaching Methodology.</strong> Lecture plus worked case scenarios — Fiqh is practiced through application, not just stated.</p>
      <p><strong>Assessment (Core: 15/20/25/40).</strong></p>
      <div class="table-wrap"><table>
      <thead><tr><th>CLO</th><th>Teaching activity</th><th>Assessment</th><th>Evidence</th></tr></thead>
      <tbody>
      <tr><td>1 — Describe Taharah/Salah structure</td><td>Weeks 2–4</td><td>Quiz 1, Quiz 2, Midterm</td><td>Quiz/midterm scripts</td></tr>
      <tr><td>2 — Apply Zakah/Sawm/Hajj rulings</td><td>Weeks 5, 6, 9</td><td>Assignment 1, Quiz 3</td><td>Assignment, quiz script</td></tr>
      <tr><td>3 — Explain transaction/marriage basics</td><td>Weeks 10–11</td><td>Assignment 2</td><td>Assignment submission</td></tr>
      <tr><td>4 — Compare obligatory/voluntary acts</td><td>Week 4, ongoing</td><td>Quiz 4, Final</td><td>Quiz script, final script</td></tr>
      </tbody>
      </table></div>
      <p><strong>Instructor Requirements.</strong> Baseline (§2). <strong>Islamic Scholarly Review.</strong> Every ruling taught in this course depends on Institutional Foundation §12 decision 1 (madhab adoption vs. evidence-based, non-binding presentation) — same open dependency as IS-101, now across a much larger body of content. This is the single largest scholarly-review dependency surfaced so far across Institutional Foundation through Course Specifications.</p>

      <h3>IS-203 — Seerah I</h3>
      <div class="table-wrap"><table>
      <tbody>
      <tr><td>Department</td><td>Islamic Studies</td><td>Program / Pathway</td><td>Intermediate Islamic Studies</td></tr>
      <tr><td>Level</td><td>Intermediate</td><td>Units / Teaching hours</td><td>2 / 30 (2 hrs/week × 15 weeks)</td></tr>
      <tr><td>Expected workload</td><td>~60 hrs</td><td>Prerequisite</td><td>IS-101</td></tr>
      <tr><td>Course type</td><td>Core</td><td>Passing requirement</td><td>60% overall, no component below 40%</td></tr>
      </tbody>
      </table></div>
      <p><strong>Description.</strong> The Prophetic biography from pre-Islamic Arabia through the conquest of Makkah — the learner's first dedicated Seerah course (Curriculum Framework §2).</p>
      <p><strong>Objectives.</strong> Build a chronological, source-grounded understanding of the Seerah; connect historical events to their lessons.</p>
      <p><strong>Learning Outcomes.</strong></p>
      <ol>
      <li><strong>Identify</strong> the major phases of the Prophetic biography.</li>
      <li><strong>Describe</strong> key events in Makkah and Madinah.</li>
      <li><strong>Explain</strong> the significance of the Hijrah.</li>
      <li><strong>Interpret</strong> a lesson drawn from a named Seerah event.</li>
      </ol>
      <div class="table-wrap"><table>
      <thead><tr><th>Wk</th><th>Topic</th><th>Objectives</th><th>Key concepts</th><th>Activities</th><th>Readings</th><th>Assessment</th></tr></thead>
      <tbody>
      <tr><td>1</td><td>Sources of Seerah</td><td>Identify primary Seerah sources</td><td>Sirah sources</td><td>Lecture</td><td>The Prophetic Biography, intro</td><td>—</td></tr>
      <tr><td>2</td><td>Pre-Islamic Arabia</td><td>Describe the pre-Islamic context</td><td>Jahiliyyah</td><td>Lecture</td><td>The Prophetic Biography, ch. 1</td><td>Quiz 1</td></tr>
      <tr><td>3</td><td>Birth and early life</td><td>Identify key early-life events</td><td>—</td><td>Lecture</td><td>The Prophetic Biography, ch. 2</td><td>—</td></tr>
      <tr><td>4</td><td>Prophethood begins</td><td>Describe early revelation</td><td>Wahy</td><td>Lecture, discussion</td><td>The Prophetic Biography, ch. 3</td><td>Quiz 2</td></tr>
      <tr><td>5</td><td>Early Muslims and persecution</td><td>Describe the Makkan persecution period</td><td>Makkan period</td><td>Lecture</td><td>The Prophetic Biography, ch. 4</td><td>Assignment 1</td></tr>
      <tr><td>6</td><td>Migration to Abyssinia</td><td>Explain the first Hijrah</td><td>Hijrah to Abyssinia</td><td>Lecture</td><td>The Prophetic Biography, ch. 5</td><td>—</td></tr>
      <tr><td>7</td><td>Review</td><td>Consolidate weeks 1–6</td><td>—</td><td>Review session</td><td>—</td><td>—</td></tr>
      <tr><td>8</td><td>Midterm</td><td>—</td><td>—</td><td>—</td><td>—</td><td>Midterm</td></tr>
      <tr><td>9</td><td>Isra' and Mi'raj</td><td>Describe the Night Journey</td><td>Isra', Mi'raj</td><td>Lecture</td><td>The Prophetic Biography, ch. 6</td><td>Quiz 3</td></tr>
      <tr><td>10</td><td>Hijrah to Madinah</td><td>Explain the significance of the Hijrah</td><td>Hijrah</td><td>Lecture, discussion</td><td>The Prophetic Biography, ch. 7</td><td>—</td></tr>
      <tr><td>11</td><td>Building the Madinan community</td><td>Describe early Madinan society</td><td>Madinan Constitution</td><td>Lecture</td><td>The Prophetic Biography, ch. 8</td><td>Assignment 2</td></tr>
      <tr><td>12</td><td>Major battles, overview</td><td>Interpret lessons from Badr/Uhud</td><td>Badr, Uhud</td><td>Lecture, discussion</td><td>The Prophetic Biography, ch. 9</td><td>Quiz 4</td></tr>
      <tr><td>13</td><td>Hudaybiyyah and the conquest of Makkah</td><td>Interpret the treaty's significance</td><td>Hudaybiyyah, Fath Makkah</td><td>Lecture, discussion</td><td>The Prophetic Biography, ch. 10</td><td>—</td></tr>
      <tr><td>14</td><td>Review and consolidation</td><td>Consolidate the term</td><td>—</td><td>Review session</td><td>—</td><td>—</td></tr>
      <tr><td>15</td><td>Final</td><td>—</td><td>—</td><td>—</td><td>—</td><td>Final</td></tr>
      </tbody>
      </table></div>
      <p><strong>Required Texts.</strong> <em>The Prophetic Biography</em> (Academy Bookstore) — a direct, confirmed match. <strong>Recommended Readings.</strong> None beyond the required text. <strong>Teaching Methodology.</strong> Chronological lecture with discussion of lessons drawn from events, not just narration.</p>
      <p><strong>Assessment (Core: 15/20/25/40).</strong></p>
      <div class="table-wrap"><table>
      <thead><tr><th>CLO</th><th>Teaching activity</th><th>Assessment</th><th>Evidence</th></tr></thead>
      <tbody>
      <tr><td>1 — Identify phases</td><td>Weeks 1–2</td><td>Quiz 1</td><td>Quiz script</td></tr>
      <tr><td>2 — Describe key events</td><td>Weeks 4, 9, 11</td><td>Quiz 2, Quiz 3, Assignment 2</td><td>Quiz scripts, assignment</td></tr>
      <tr><td>3 — Explain Hijrah's significance</td><td>Week 10</td><td>Midterm</td><td>Midterm script</td></tr>
      <tr><td>4 — Interpret lessons</td><td>Weeks 5, 12–13</td><td>Assignment 1, Quiz 4, Final</td><td>Assignment, quiz, final script</td></tr>
      </tbody>
      </table></div>
      <p><strong>Instructor Requirements.</strong> Baseline (§2). <strong>Islamic Scholarly Review.</strong> Seerah narration is generally consensus-level historical content; weak or disputed narrations used for any specific event should be flagged to the Scholarly Review Committee before adoption, per Institutional Foundation §10's source-authentication principle.</p>

      <h3>QS-201 — Applied Tajweed</h3>
      <div class="table-wrap"><table>
      <tbody>
      <tr><td>Department</td><td>Qur'anic Studies</td><td>Program / Pathway</td><td>Intermediate Islamic Studies</td></tr>
      <tr><td>Level</td><td>Intermediate</td><td>Units / Teaching hours</td><td>2 / 30 (2 hrs/week × 15 weeks)</td></tr>
      <tr><td>Expected workload</td><td>~75 hrs (×1.5)</td><td>Prerequisite</td><td>QS-102</td></tr>
      <tr><td>Course type</td><td>Recitation/Hifz</td><td>Passing requirement</td><td>60% overall AND minimum 60% on Practical + Final combined</td></tr>
      </tbody>
      </table></div>
      <p><strong>Description.</strong> Tajwid applied with growing fluency across longer passages — Foundation's rules applied at speed and in context, plus Waqf/Ibtida' basics.</p>
      <p><strong>Objectives.</strong> Move from rule-by-rule application to fluent, rule-consistent recitation; prepare for Advanced Tajweed (QS-301).</p>
      <p><strong>Learning Outcomes.</strong></p>
      <ol>
      <li><strong>Apply</strong> Foundation Tajwid rules fluently in longer passages.</li>
      <li><strong>Describe</strong> secondary Madd types and basic Waqf/Ibtida' rules.</li>
      <li><strong>Recite</strong> medium-length passages with improved fluency and accuracy.</li>
      <li><strong>Demonstrate</strong> self-correction of intermediate-level errors.</li>
      </ol>
      <div class="table-wrap"><table>
      <thead><tr><th>Wk</th><th>Topic</th><th>Objectives</th><th>Key concepts</th><th>Activities</th><th>Readings</th><th>Assessment</th></tr></thead>
      <tbody>
      <tr><td>1</td><td>Review of Foundation rules</td><td>Apply Foundation rules on review</td><td>Recap</td><td>Guided reading</td><td>Instructor handout*</td><td>—</td></tr>
      <tr><td>2</td><td>Applied Izhar/Idgham</td><td>Apply in longer passages</td><td>Izhar, Idgham</td><td>Guided reading</td><td>Instructor handout*</td><td>Quiz 1</td></tr>
      <tr><td>3</td><td>Applied Iqlab/Ikhfa</td><td>Apply in longer passages</td><td>Iqlab, Ikhfa</td><td>Guided reading</td><td>Instructor handout*</td><td>—</td></tr>
      <tr><td>4</td><td>Applied Meem Sakinah rules</td><td>Apply in longer passages</td><td>Meem Sakinah</td><td>Guided reading</td><td>Instructor handout*</td><td>Practical check 1</td></tr>
      <tr><td>5</td><td>Applied Qalqalah</td><td>Apply in longer passages</td><td>Qalqalah</td><td>Guided reading</td><td>Instructor handout*</td><td>—</td></tr>
      <tr><td>6</td><td>Madd — Muttasil, Munfasil</td><td>Describe secondary Madd types</td><td>Madd Muttasil, Munfasil</td><td>Lecture, guided reading</td><td>Instructor handout*</td><td>Quiz 2</td></tr>
      <tr><td>7</td><td>Review</td><td>Consolidate weeks 1–6</td><td>—</td><td>Review session</td><td>—</td><td>—</td></tr>
      <tr><td>8</td><td>Midterm</td><td>—</td><td>—</td><td>—</td><td>—</td><td>Midterm (recitation checkpoint)</td></tr>
      <tr><td>9</td><td>Waqf rules, basics</td><td>Describe stopping rules</td><td>Waqf</td><td>Lecture, guided reading</td><td>Instructor handout*</td><td>Practical check 2</td></tr>
      <tr><td>10</td><td>Ibtida' rules, basics</td><td>Describe starting rules</td><td>Ibtida'</td><td>Lecture, guided reading</td><td>Instructor handout*</td><td>—</td></tr>
      <tr><td>11</td><td>Fluency practice, medium passages</td><td>Recite with improved fluency</td><td>Fluency</td><td>Guided practice</td><td>Mus'haf</td><td>Assignment 1</td></tr>
      <tr><td>12</td><td>Common intermediate errors</td><td>Demonstrate self-correction</td><td>Common errors</td><td>Peer review</td><td>Mus'haf</td><td>—</td></tr>
      <tr><td>13</td><td>Peer recitation practice</td><td>Recite before peers with feedback</td><td>—</td><td>Peer circle</td><td>Mus'haf</td><td>Practical check 3</td></tr>
      <tr><td>14</td><td>Review and consolidation</td><td>Consolidate the term</td><td>—</td><td>Review session</td><td>—</td><td>—</td></tr>
      <tr><td>15</td><td>Final</td><td>—</td><td>—</td><td>—</td><td>—</td><td>Final (oral exam)</td></tr>
      </tbody>
      </table></div>
      <p><strong>Required Texts.</strong> Same Tajwid-manual gap as QS-102 (decision 35). Mus'haf as the working text. <strong>Recommended Readings.</strong> None. <strong>Teaching Methodology.</strong> Guided reading applying rules at increasing speed and passage length; one-on-one correction remains central.</p>
      <p><strong>Assessment (Recitation/Hifz: 10/10/20/30/30).</strong></p>
      <div class="table-wrap"><table>
      <thead><tr><th>CLO</th><th>Teaching activity</th><th>Assessment</th><th>Evidence</th></tr></thead>
      <tbody>
      <tr><td>1 — Apply rules fluently</td><td>Weeks 2–5</td><td>Quiz 1, Practical check 1</td><td>Quiz script, rubric score</td></tr>
      <tr><td>2 — Describe Madd/Waqf/Ibtida'</td><td>Weeks 6, 9–10</td><td>Quiz 2, Midterm</td><td>Quiz script, midterm recording</td></tr>
      <tr><td>3 — Recite with fluency</td><td>Week 11</td><td>Assignment 1, Practical check 2</td><td>Assignment, rubric score</td></tr>
      <tr><td>4 — Demonstrate self-correction</td><td>Weeks 12–13</td><td>Practical check 3, Final</td><td>Rubric score, final recording</td></tr>
      </tbody>
      </table></div>
      <p><strong>Practical Competency Rubric.</strong> Same four-criterion 1–4 scale as QS-101/102, weighted toward fluency and consistency at this tier. Pass requires 3.0/4 average.</p>
      <p><strong>Instructor Requirements.</strong> Baseline (§2) plus demonstrated Tajwid competence (same open ijazah question as QS-102, decision 36). <strong>Islamic Scholarly Review.</strong> Same riwayah/qira'ah dependency as QS-101/102 (decision 37).</p>

      <h3>QS-202 — Qur'an Comprehension I</h3>
      <div class="table-wrap"><table>
      <tbody>
      <tr><td>Department</td><td>Qur'anic Studies</td><td>Program / Pathway</td><td>Intermediate Islamic Studies</td></tr>
      <tr><td>Level</td><td>Intermediate</td><td>Units / Teaching hours</td><td>2 / 30 (2 hrs/week × 15 weeks)</td></tr>
      <tr><td>Expected workload</td><td>~60 hrs</td><td>Prerequisite</td><td>QS-101</td></tr>
      <tr><td>Course type</td><td>Core</td><td>Passing requirement</td><td>60% overall, no component below 40%</td></tr>
      </tbody>
      </table></div>
      <p><strong>Description.</strong> The beginning of Qur'anic comprehension, not just correct reading — vocabulary, basic themes, and guided meaning of short Surahs.</p>
      <p><strong>Objectives.</strong> Build a working Qur'anic vocabulary; introduce major Qur'anic themes; prepare for Tafsir I (QS-302).</p>
      <p><strong>Learning Outcomes.</strong></p>
      <ol>
      <li><strong>Identify</strong> common Qur'anic vocabulary.</li>
      <li><strong>Explain</strong> the basic meaning of assigned short Surahs.</li>
      <li><strong>Describe</strong> major recurring Qur'anic themes.</li>
      <li><strong>Interpret</strong> a short passage's basic guidance.</li>
      </ol>
      <div class="table-wrap"><table>
      <thead><tr><th>Wk</th><th>Topic</th><th>Objectives</th><th>Key concepts</th><th>Activities</th><th>Readings</th><th>Assessment</th></tr></thead>
      <tbody>
      <tr><td>1</td><td>Approaching Qur'anic meaning</td><td>Explain the course's approach</td><td>Comprehension vs recitation</td><td>Lecture</td><td>Introduction to Quranic Sciences, intro</td><td>—</td></tr>
      <tr><td>2</td><td>Vocabulary building</td><td>Identify common Qur'anic words</td><td>Core vocabulary</td><td>Drill</td><td>Introduction to Quranic Sciences, ch. 1</td><td>Quiz 1</td></tr>
      <tr><td>3</td><td>Comprehension — short Surahs</td><td>Explain short Surahs' meaning</td><td>Juz Amma</td><td>Guided reading</td><td>Tafsir Ibn Kathir, selected</td><td>—</td></tr>
      <tr><td>4</td><td>Theme — Tawhid in the Qur'an</td><td>Describe Tawhid as a Qur'anic theme</td><td>Tawhid theme</td><td>Lecture, discussion</td><td>Tafsir Ibn Kathir, selected</td><td>Quiz 2</td></tr>
      <tr><td>5</td><td>Theme — stories of the Prophets</td><td>Describe recurring prophetic narratives</td><td>Qasas al-Anbiya</td><td>Lecture</td><td>Tafsir Ibn Kathir, selected</td><td>Assignment 1</td></tr>
      <tr><td>6</td><td>Theme — guidance and ethics</td><td>Describe the Qur'an's ethical guidance</td><td>Akhlaq theme</td><td>Discussion</td><td>Tafsir Ibn Kathir, selected</td><td>—</td></tr>
      <tr><td>7</td><td>Review</td><td>Consolidate weeks 1–6</td><td>—</td><td>Review session</td><td>—</td><td>—</td></tr>
      <tr><td>8</td><td>Midterm</td><td>—</td><td>—</td><td>—</td><td>—</td><td>Midterm</td></tr>
      <tr><td>9</td><td>Guided translation review</td><td>Explain assigned passages</td><td>—</td><td>Guided reading</td><td>Tafsir Ibn Kathir, selected</td><td>Quiz 3</td></tr>
      <tr><td>10</td><td>Comprehension practice, continued</td><td>Interpret passages' basic guidance</td><td>—</td><td>Guided reading</td><td>Tafsir Ibn Kathir, selected</td><td>—</td></tr>
      <tr><td>11</td><td>Reflection and application</td><td>Interpret passages for personal application</td><td>—</td><td>Reflective exercise</td><td>—</td><td>Assignment 2</td></tr>
      <tr><td>12</td><td>Group discussion of meaning</td><td>Explain meaning in group discussion</td><td>—</td><td>Group discussion</td><td>—</td><td>Quiz 4</td></tr>
      <tr><td>13</td><td>Applied comprehension practice</td><td>Interpret an unseen short passage</td><td>—</td><td>Guided practice</td><td>—</td><td>—</td></tr>
      <tr><td>14</td><td>Review and consolidation</td><td>Consolidate the term</td><td>—</td><td>Review session</td><td>—</td><td>—</td></tr>
      <tr><td>15</td><td>Final</td><td>—</td><td>—</td><td>—</td><td>—</td><td>Final</td></tr>
      </tbody>
      </table></div>
      <p><strong>Required Texts.</strong> <em>Introduction to Quranic Sciences</em> (Academy Bookstore). <strong>Recommended Readings.</strong> <em>Tafsir Ibn Kathir</em> (Academy Bookstore), selected passages, for deeper reference beyond guided-lesson excerpts. <strong>Teaching Methodology.</strong> Guided reading and group discussion — meaning is built collaboratively, not lectured at.</p>
      <p><strong>Assessment (Core: 15/20/25/40).</strong></p>
      <div class="table-wrap"><table>
      <thead><tr><th>CLO</th><th>Teaching activity</th><th>Assessment</th><th>Evidence</th></tr></thead>
      <tbody>
      <tr><td>1 — Identify vocabulary</td><td>Week 2</td><td>Quiz 1</td><td>Quiz script</td></tr>
      <tr><td>2 — Explain Surah meaning</td><td>Weeks 3, 9</td><td>Midterm, Quiz 3</td><td>Midterm/quiz scripts</td></tr>
      <tr><td>3 — Describe themes</td><td>Weeks 4–6</td><td>Quiz 2, Assignment 1</td><td>Quiz script, assignment</td></tr>
      <tr><td>4 — Interpret guidance</td><td>Weeks 11–13</td><td>Assignment 2, Quiz 4, Final</td><td>Assignment, quiz, final script</td></tr>
      </tbody>
      </table></div>
      <p><strong>Instructor Requirements.</strong> Baseline (§2). <strong>Islamic Scholarly Review.</strong> Tafsir content necessarily reflects interpretive choices; any point of genuine scholarly difference in the assigned excerpts should be flagged and reviewed rather than presented as settled, per Institutional Foundation §10.</p>

      <h3>AR-201 — Arabic Grammar I</h3>
      <div class="table-wrap"><table>
      <tbody>
      <tr><td>Department</td><td>Arabic Language</td><td>Program / Pathway</td><td>Intermediate Islamic Studies</td></tr>
      <tr><td>Level</td><td>Intermediate</td><td>Units / Teaching hours</td><td>3 / 45 (3 hrs/week × 15 weeks)</td></tr>
      <tr><td>Expected workload</td><td>~112.5 hrs (×1.5)</td><td>Prerequisite</td><td>AR-101</td></tr>
      <tr><td>Course type</td><td>Language</td><td>Passing requirement</td><td>60% overall, no component below 40%</td></tr>
      </tbody>
      </table></div>
      <p><strong>Description.</strong> Grammar sufficient to reduce dependence on translation — case endings, Idafa, verb conjugation in both tenses, and simple verbal sentences.</p>
      <p><strong>Objectives.</strong> Build functional grammatical competence; reduce reliance on translation; prepare for Arabic Grammar II (AR-301).</p>
      <p><strong>Learning Outcomes.</strong></p>
      <ol>
      <li><strong>Identify</strong> Arabic case endings (Rafa', Nasb, Jarr).</li>
      <li><strong>Apply</strong> the Idafa construction and adjective agreement.</li>
      <li><strong>Apply</strong> past- and present-tense verb conjugation across persons.</li>
      <li><strong>Produce</strong> simple verbal sentences.</li>
      </ol>
      <div class="table-wrap"><table>
      <thead><tr><th>Wk</th><th>Topic</th><th>Objectives</th><th>Key concepts</th><th>Activities</th><th>Readings</th><th>Assessment</th></tr></thead>
      <tbody>
      <tr><td>1</td><td>Review of Foundation grammar</td><td>Recall Foundation structures</td><td>Recap</td><td>Review drill</td><td>Arabic Language Foundations, ch. 9</td><td>—</td></tr>
      <tr><td>2</td><td>Case endings, intro</td><td>Identify Rafa'/Nasb/Jarr</td><td>I'rab</td><td>Drill</td><td>Arabic Language Foundations, ch. 10</td><td>Quiz 1</td></tr>
      <tr><td>3</td><td>Definite article and Idafa</td><td>Apply Idafa construction</td><td>Idafa</td><td>Drill</td><td>Arabic Language Foundations, ch. 11</td><td>—</td></tr>
      <tr><td>4</td><td>Adjectives and agreement</td><td>Apply adjective agreement</td><td>Na't</td><td>Drill</td><td>Arabic Language Foundations, ch. 11</td><td>Quiz 2</td></tr>
      <tr><td>5</td><td>Verb conjugation — past tense</td><td>Apply past-tense conjugation</td><td>Fi'l Madi</td><td>Drill</td><td>Arabic Language Foundations, ch. 12</td><td>Assignment 1</td></tr>
      <tr><td>6</td><td>Verb conjugation — present tense</td><td>Apply present-tense conjugation</td><td>Fi'l Mudari'</td><td>Drill</td><td>Arabic Language Foundations, ch. 12</td><td>—</td></tr>
      <tr><td>7</td><td>Review</td><td>Consolidate weeks 1–6</td><td>—</td><td>Review session</td><td>—</td><td>—</td></tr>
      <tr><td>8</td><td>Midterm</td><td>—</td><td>—</td><td>—</td><td>—</td><td>Midterm</td></tr>
      <tr><td>9</td><td>Question particles</td><td>Apply question formation</td><td>Adawat al-Istifham</td><td>Drill</td><td>Arabic Language Foundations, ch. 13</td><td>Quiz 3</td></tr>
      <tr><td>10</td><td>Negation particles</td><td>Apply negation</td><td>Adawat an-Nafy</td><td>Drill</td><td>Arabic Language Foundations, ch. 13</td><td>—</td></tr>
      <tr><td>11</td><td>Prepositions and case effects</td><td>Apply prepositions correctly</td><td>Huroof al-Jarr</td><td>Drill</td><td>Arabic Language Foundations, ch. 14</td><td>Assignment 2</td></tr>
      <tr><td>12</td><td>Simple verbal sentences</td><td>Produce Fi'l-Fa'il sentences</td><td>Jumla Fi'liyya</td><td>Guided writing</td><td>Arabic Language Foundations, ch. 14</td><td>Quiz 4</td></tr>
      <tr><td>13</td><td>Applied reading — simple texts</td><td>Produce sentences from a simple text</td><td>—</td><td>Guided reading/writing</td><td>Arabic Language Foundations, ch. 15</td><td>—</td></tr>
      <tr><td>14</td><td>Review and consolidation</td><td>Consolidate the term</td><td>—</td><td>Review session</td><td>—</td><td>—</td></tr>
      <tr><td>15</td><td>Final</td><td>—</td><td>—</td><td>—</td><td>—</td><td>Final</td></tr>
      </tbody>
      </table></div>
      <p><strong>Required Texts.</strong> <em>Arabic Language Foundations</em> (Academy Bookstore), continuing from AR-101's earlier chapters. <strong>Recommended Readings.</strong> None. <strong>Teaching Methodology.</strong> Drill-based, cumulative — each week's structure is practiced until fluent before the next is introduced.</p>
      <p><strong>Assessment (Language: 15/20/25/40).</strong></p>
      <div class="table-wrap"><table>
      <thead><tr><th>CLO</th><th>Teaching activity</th><th>Assessment</th><th>Evidence</th></tr></thead>
      <tbody>
      <tr><td>1 — Identify case endings</td><td>Week 2</td><td>Quiz 1</td><td>Quiz script</td></tr>
      <tr><td>2 — Apply Idafa/agreement</td><td>Weeks 3–4</td><td>Quiz 2, Midterm</td><td>Quiz/midterm scripts</td></tr>
      <tr><td>3 — Apply verb conjugation</td><td>Weeks 5–6</td><td>Assignment 1, Quiz 3</td><td>Assignment, quiz script</td></tr>
      <tr><td>4 — Produce sentences</td><td>Weeks 12–13</td><td>Assignment 2, Quiz 4, Final</td><td>Assignment, quiz, final script</td></tr>
      </tbody>
      </table></div>
      <p><strong>Instructor Requirements.</strong> Baseline (§2); no religious-content qualification needed. <strong>Islamic Scholarly Review.</strong> Not required — general Arabic language, no dependency on the open manhaj or riwayah decisions.</p>

      <h3>IC-201 — Islamic History &amp; Civilization I</h3>
      <div class="table-wrap"><table>
      <tbody>
      <tr><td>Department</td><td>Islamic Civilization &amp; Society</td><td>Program / Pathway</td><td>Intermediate Islamic Studies</td></tr>
      <tr><td>Level</td><td>Intermediate</td><td>Units / Teaching hours</td><td>2 / 30 (2 hrs/week × 15 weeks)</td></tr>
      <tr><td>Expected workload</td><td>~60 hrs</td><td>Prerequisite</td><td>— (entry course)</td></tr>
      <tr><td>Course type</td><td>Core</td><td>Passing requirement</td><td>60% overall, no component below 40%</td></tr>
      </tbody>
      </table></div>
      <p><strong>Description.</strong> The learner's first structured exposure to Islamic history and civilization — the Rightly-Guided Caliphs through the Abbasid period, and civilization's contributions to science, arts, and architecture.</p>
      <p><strong>Objectives.</strong> Give learners a chronological anchor for later civilizational and social-thought content; connect history to lived Muslim identity today.</p>
      <p><strong>Learning Outcomes.</strong></p>
      <ol>
      <li><strong>Identify</strong> the major periods of early Islamic history.</li>
      <li><strong>Describe</strong> Islamic civilization's contributions to science, arts, and architecture.</li>
      <li><strong>Explain</strong> the spread of Islam through trade and scholarship.</li>
      <li><strong>Interpret</strong> the relevance of Islamic history to a contemporary question.</li>
      </ol>
      <div class="table-wrap"><table>
      <thead><tr><th>Wk</th><th>Topic</th><th>Objectives</th><th>Key concepts</th><th>Activities</th><th>Readings</th><th>Assessment</th></tr></thead>
      <tbody>
      <tr><td>1</td><td>Why history and civilization matter</td><td>Explain the course's purpose</td><td>—</td><td>Lecture</td><td>Instructor handout*</td><td>—</td></tr>
      <tr><td>2</td><td>The Rightly-Guided Caliphs</td><td>Identify the four Caliphs and their era</td><td>Khulafa Rashidun</td><td>Lecture</td><td>Instructor handout*</td><td>Quiz 1</td></tr>
      <tr><td>3</td><td>The Umayyad period</td><td>Identify Umayyad-era developments</td><td>Umayyad Caliphate</td><td>Lecture</td><td>Instructor handout*</td><td>—</td></tr>
      <tr><td>4</td><td>The Abbasid period</td><td>Identify Abbasid-era developments</td><td>Abbasid Caliphate</td><td>Lecture</td><td>Instructor handout*</td><td>Quiz 2</td></tr>
      <tr><td>5</td><td>Contributions — sciences</td><td>Describe scientific contributions</td><td>Islamic Golden Age</td><td>Lecture, discussion</td><td>Instructor handout*</td><td>Assignment 1</td></tr>
      <tr><td>6</td><td>Contributions — arts and architecture</td><td>Describe artistic/architectural contributions</td><td>Islamic art, architecture</td><td>Lecture, discussion</td><td>Instructor handout*</td><td>—</td></tr>
      <tr><td>7</td><td>Review</td><td>Consolidate weeks 1–6</td><td>—</td><td>Review session</td><td>—</td><td>—</td></tr>
      <tr><td>8</td><td>Midterm</td><td>—</td><td>—</td><td>—</td><td>—</td><td>Midterm</td></tr>
      <tr><td>9</td><td>Spread of Islam — trade and scholarship</td><td>Explain the spread of Islam</td><td>Trade routes, scholarship networks</td><td>Lecture</td><td>Instructor handout*</td><td>Quiz 3</td></tr>
      <tr><td>10</td><td>Major centers of learning</td><td>Identify major learning centers</td><td>Baghdad, Cordoba, Cairo</td><td>Lecture</td><td>Instructor handout*</td><td>—</td></tr>
      <tr><td>11</td><td>Islamic civilization and the wider world</td><td>Describe cross-cultural exchange</td><td>Cultural exchange</td><td>Discussion</td><td>Instructor handout*</td><td>Assignment 2</td></tr>
      <tr><td>12</td><td>Decline and transition periods</td><td>Identify major transition points</td><td>Overview</td><td>Lecture</td><td>Instructor handout*</td><td>Quiz 4</td></tr>
      <tr><td>13</td><td>Relevance today</td><td>Interpret history's relevance to a modern question</td><td>—</td><td>Discussion</td><td>—</td><td>—</td></tr>
      <tr><td>14</td><td>Review and consolidation</td><td>Consolidate the term</td><td>—</td><td>Review session</td><td>—</td><td>—</td></tr>
      <tr><td>15</td><td>Final</td><td>—</td><td>—</td><td>—</td><td>—</td><td>Final</td></tr>
      </tbody>
      </table></div>
      <p><strong>Required Texts.</strong> <strong>Gap:</strong> no dedicated Islamic-history/civilization text currently exists in the Bookstore catalogue (*instructor handouts are a placeholder) — flagged as decision 40 (§13). <strong>Recommended Readings.</strong> None assigned pending that gap. <strong>Teaching Methodology.</strong> Chronological lecture with discussion connecting history to contemporary relevance.</p>
      <p><strong>Assessment (Core: 15/20/25/40).</strong></p>
      <div class="table-wrap"><table>
      <thead><tr><th>CLO</th><th>Teaching activity</th><th>Assessment</th><th>Evidence</th></tr></thead>
      <tbody>
      <tr><td>1 — Identify periods</td><td>Weeks 2–4</td><td>Quiz 1, Quiz 2</td><td>Quiz scripts</td></tr>
      <tr><td>2 — Describe contributions</td><td>Weeks 5–6</td><td>Assignment 1, Midterm</td><td>Assignment, midterm script</td></tr>
      <tr><td>3 — Explain spread of Islam</td><td>Weeks 9–10</td><td>Quiz 3</td><td>Quiz script</td></tr>
      <tr><td>4 — Interpret relevance</td><td>Weeks 11, 13</td><td>Assignment 2, Quiz 4, Final</td><td>Assignment, quiz, final script</td></tr>
      </tbody>
      </table></div>
      <p><strong>Instructor Requirements.</strong> Baseline (§2). <strong>Islamic Scholarly Review.</strong> Historical-narrative content, not ruling content — lower scholarly-review priority than Fiqh/Aqeedah courses, but any interpretive claim about historical causation should still be sourced and reviewable.</p>

      <h3>IE-201 — Communication &amp; Leadership</h3>
      <div class="table-wrap"><table>
      <tbody>
      <tr><td>Department</td><td>Islamic Education &amp; Tarbiyah</td><td>Program / Pathway</td><td>Intermediate Islamic Studies</td></tr>
      <tr><td>Level</td><td>Intermediate</td><td>Units / Teaching hours</td><td>2 / 30 (2 hrs/week × 15 weeks)</td></tr>
      <tr><td>Expected workload</td><td>~60 hrs</td><td>Prerequisite</td><td>— (entry course)</td></tr>
      <tr><td>Course type</td><td>Core</td><td>Passing requirement</td><td>60% overall; Practical component instructor-attested</td></tr>
      </tbody>
      </table></div>
      <p><strong>Description.</strong> Early responsibility and expressing what has been learned clearly, in writing and speech — both communication and leadership carried by one course at this tier (Curriculum Framework §9 flags this as worth watching as the catalogue matures).</p>
      <p><strong>Objectives.</strong> Build clear spoken and written communication; introduce basic leadership through small-group roles, not yet formal teaching.</p>
      <p><strong>Learning Outcomes.</strong></p>
      <ol>
      <li><strong>Demonstrate</strong> clear spoken communication in a short presentation.</li>
      <li><strong>Produce</strong> a short piece of clear written communication.</li>
      <li><strong>Apply</strong> active-listening and feedback skills.</li>
      <li><strong>Demonstrate</strong> leading a small-group activity.</li>
      </ol>
      <div class="table-wrap"><table>
      <thead><tr><th>Wk</th><th>Topic</th><th>Objectives</th><th>Key concepts</th><th>Activities</th><th>Readings</th><th>Assessment</th></tr></thead>
      <tbody>
      <tr><td>1</td><td>Why communication/leadership matter Islamically</td><td>Explain the Islamic basis for both</td><td>Bayan, Amanah</td><td>Lecture</td><td>Instructor handout*</td><td>—</td></tr>
      <tr><td>2</td><td>Clear speech and articulation</td><td>Demonstrate clear articulation</td><td>—</td><td>Practice</td><td>Instructor handout*</td><td>—</td></tr>
      <tr><td>3</td><td>Active listening</td><td>Apply active-listening skills</td><td>Active listening</td><td>Paired practice</td><td>Instructor handout*</td><td>Quiz 1</td></tr>
      <tr><td>4</td><td>Written communication basics</td><td>Produce a short written piece</td><td>—</td><td>Guided writing</td><td>Instructor handout*</td><td>Assignment 1</td></tr>
      <tr><td>5</td><td>Public speaking fundamentals</td><td>Demonstrate a short prepared talk</td><td>—</td><td>Practice presentations</td><td>Instructor handout*</td><td>—</td></tr>
      <tr><td>6</td><td>Leading a small-group activity</td><td>Demonstrate leading a group task</td><td>—</td><td>Group activity</td><td>Instructor handout*</td><td>Practical check 1</td></tr>
      <tr><td>7</td><td>Review + practice presentation</td><td>Consolidate weeks 1–6</td><td>—</td><td>Practice run</td><td>—</td><td>—</td></tr>
      <tr><td>8</td><td>Midterm (practical: short presentation)</td><td>—</td><td>—</td><td>—</td><td>—</td><td>Midterm (practical)</td></tr>
      <tr><td>9</td><td>Giving and receiving feedback</td><td>Apply constructive feedback</td><td>Feedback</td><td>Peer practice</td><td>Instructor handout*</td><td>Quiz 2</td></tr>
      <tr><td>10</td><td>Conflict resolution basics</td><td>Apply basic conflict-resolution steps</td><td>—</td><td>Case scenarios</td><td>Instructor handout*</td><td>—</td></tr>
      <tr><td>11</td><td>Islamic leadership models</td><td>Describe the Prophetic leadership example</td><td>—</td><td>Lecture, discussion</td><td>Instructor handout*</td><td>Assignment 2</td></tr>
      <tr><td>12</td><td>Peer support and small-group roles</td><td>Apply peer-support skills</td><td>—</td><td>Group activity</td><td>Instructor handout*</td><td>Practical check 2</td></tr>
      <tr><td>13</td><td>Applied leadership exercise</td><td>Demonstrate leading a full session</td><td>—</td><td>Group activity</td><td>—</td><td>—</td></tr>
      <tr><td>14</td><td>Review and consolidation</td><td>Consolidate the term</td><td>—</td><td>Review session</td><td>—</td><td>—</td></tr>
      <tr><td>15</td><td>Final (practical: leading a group session)</td><td>—</td><td>—</td><td>—</td><td>—</td><td>Final (practical)</td></tr>
      </tbody>
      </table></div>
      <p><strong>Required Texts.</strong> <strong>Gap:</strong> general communication/leadership skills, no religious-content text needed; no Bookstore title fits and none is required — ordinary curriculum-design discretion, flagged with RL-101's gap (decision 39). <strong>Recommended Readings.</strong> None. <strong>Teaching Methodology.</strong> Practice-based — presentations, group activities, and peer feedback, not lecture-heavy.</p>
      <p><strong>Assessment (Character/practical: 10/25/20/25/20).</strong></p>
      <div class="table-wrap"><table>
      <thead><tr><th>CLO</th><th>Teaching activity</th><th>Assessment</th><th>Evidence</th></tr></thead>
      <tbody>
      <tr><td>1 — Demonstrate spoken communication</td><td>Week 5</td><td>Midterm (practical)</td><td>Instructor rubric score</td></tr>
      <tr><td>2 — Produce written communication</td><td>Week 4</td><td>Assignment 1</td><td>Assignment submission</td></tr>
      <tr><td>3 — Apply listening/feedback</td><td>Weeks 3, 9</td><td>Quiz 1, Quiz 2</td><td>Quiz scripts</td></tr>
      <tr><td>4 — Demonstrate leading a group</td><td>Weeks 6, 12–13</td><td>Practical checks 1–2, Final</td><td>Instructor rubric scores</td></tr>
      </tbody>
      </table></div>
      <p><strong>Instructor Requirements.</strong> Baseline (§2) plus facilitation experience, given the group-leadership component. <strong>Islamic Scholarly Review.</strong> Not required for the communication/leadership skill content; the "Islamic leadership models" session (week 11) should draw only from well-established Seerah material, cross-checked against IS-203's own scholarly-review note.</p>

      <h3>IE-202 — Tazkiyah I</h3>
      <div class="table-wrap"><table>
      <tbody>
      <tr><td>Department</td><td>Islamic Education &amp; Tarbiyah</td><td>Program / Pathway</td><td>Intermediate Islamic Studies</td></tr>
      <tr><td>Level</td><td>Intermediate</td><td>Units / Teaching hours</td><td>2 / 30 (2 hrs/week × 15 weeks)</td></tr>
      <tr><td>Expected workload</td><td>~60 hrs</td><td>Prerequisite</td><td>IE-101</td></tr>
      <tr><td>Course type</td><td>Core</td><td>Passing requirement</td><td>60% overall; Practical component instructor-attested</td></tr>
      </tbody>
      </table></div>
      <p><strong>Description.</strong> Builds on Foundation's adab rather than re-teaching it — Institutional Foundation's Knowledge → Character chain made explicit and systematic: intentions, diseases of the heart, humility, patience, gratitude, Tawakkul, and self-accountability.</p>
      <p><strong>Objectives.</strong> Move from observed conduct (IE-101) to a systematic, named vocabulary for character development; prepare for the Diploma's teaching-track and community-track work.</p>
      <p><strong>Learning Outcomes.</strong></p>
      <ol>
      <li><strong>Explain</strong> Ikhlas and its centrality to Tazkiyah.</li>
      <li><strong>Describe</strong> named diseases of the heart and their remedies.</li>
      <li><strong>Apply</strong> Tazkiyah principles to a personal case study.</li>
      <li><strong>Demonstrate</strong> consistent self-accountability practice over the term.</li>
      </ol>
      <div class="table-wrap"><table>
      <thead><tr><th>Wk</th><th>Topic</th><th>Objectives</th><th>Key concepts</th><th>Activities</th><th>Readings</th><th>Assessment</th></tr></thead>
      <tbody>
      <tr><td>1</td><td>From Foundation adab to systematic Tazkiyah</td><td>Explain the shift from IE-101</td><td>Tazkiyah</td><td>Lecture</td><td>Purification of the Soul, ch. 2</td><td>—</td></tr>
      <tr><td>2</td><td>Purifying intentions (Ikhlas)</td><td>Explain Ikhlas in depth</td><td>Ikhlas</td><td>Discussion</td><td>Purification of the Soul, ch. 3</td><td>Quiz 1</td></tr>
      <tr><td>3</td><td>Diseases of the heart, overview</td><td>Describe envy and arrogance</td><td>Hasad, Kibr</td><td>Discussion, case scenarios</td><td>Purification of the Soul, ch. 4</td><td>—</td></tr>
      <tr><td>4</td><td>Cultivating humility</td><td>Describe humility's remedy for arrogance</td><td>Tawadu'</td><td>Discussion</td><td>Purification of the Soul, ch. 4</td><td>Reflective journal 1</td></tr>
      <tr><td>5</td><td>Cultivating patience (Sabr)</td><td>Explain Sabr in depth</td><td>Sabr</td><td>Discussion, case scenarios</td><td>Purification of the Soul, ch. 5</td><td>—</td></tr>
      <tr><td>6</td><td>Cultivating gratitude (Shukr)</td><td>Explain Shukr in depth</td><td>Shukr</td><td>Discussion</td><td>Forty Hadith, selected</td><td>Quiz 2</td></tr>
      <tr><td>7</td><td>Review + reflective assignment</td><td>Consolidate weeks 1–6</td><td>—</td><td>Review session</td><td>—</td><td>—</td></tr>
      <tr><td>8</td><td>Midterm (instructor check-in)</td><td>—</td><td>—</td><td>One-on-one check-in</td><td>—</td><td>Midterm</td></tr>
      <tr><td>9</td><td>Reliance on Allah (Tawakkul)</td><td>Explain Tawakkul</td><td>Tawakkul</td><td>Discussion</td><td>Purification of the Soul, ch. 6</td><td>Quiz 3</td></tr>
      <tr><td>10</td><td>Love and fear of Allah, balanced</td><td>Describe balanced Khawf/Raja'</td><td>Khawf, Raja'</td><td>Discussion</td><td>Purification of the Soul, ch. 6</td><td>—</td></tr>
      <tr><td>11</td><td>Self-accountability (Muhasabah)</td><td>Apply Muhasabah to daily practice</td><td>Muhasabah</td><td>Guided practice</td><td>Purification of the Soul, ch. 7</td><td>Reflective journal 2</td></tr>
      <tr><td>12</td><td>Company and its effect on character</td><td>Explain the effect of companionship</td><td>Suhbah</td><td>Discussion</td><td>Forty Hadith, selected</td><td>Quiz 4</td></tr>
      <tr><td>13</td><td>Applying Tazkiyah to daily life</td><td>Apply principles to a case study</td><td>—</td><td>Case study</td><td>—</td><td>—</td></tr>
      <tr><td>14</td><td>Review and consolidation; portfolio</td><td>Consolidate the term's reflections</td><td>—</td><td>Portfolio workshop</td><td>—</td><td>—</td></tr>
      <tr><td>15</td><td>Final</td><td>—</td><td>—</td><td>—</td><td>—</td><td>Final (portfolio + instructor evaluation)</td></tr>
      </tbody>
      </table></div>
      <p><strong>Required Texts.</strong> <em>Purification of the Soul</em> (Academy Bookstore), continuing from IE-101. <strong>Recommended Readings.</strong> <em>Forty Hadith of Imam An-Nawawi</em> (Academy Bookstore), selected hadith on character. <strong>Teaching Methodology.</strong> Discussion and reflective journaling, same practiced-not-memorized approach as IE-101.</p>
      <p><strong>Assessment (Character/practical: 10/25/20/25/20).</strong></p>
      <div class="table-wrap"><table>
      <thead><tr><th>CLO</th><th>Teaching activity</th><th>Assessment</th><th>Evidence</th></tr></thead>
      <tbody>
      <tr><td>1 — Explain Ikhlas</td><td>Week 2</td><td>Quiz 1</td><td>Quiz script</td></tr>
      <tr><td>2 — Describe diseases of the heart</td><td>Weeks 3–4, 9</td><td>Quiz 2, Quiz 3</td><td>Quiz scripts</td></tr>
      <tr><td>3 — Apply to a case study</td><td>Weeks 11, 13</td><td>Reflective journal 2, Final</td><td>Journal, final portfolio</td></tr>
      <tr><td>4 — Demonstrate self-accountability</td><td>Ongoing, weeks 1–13</td><td>Practical component (instructor-observed)</td><td>Instructor observation log</td></tr>
      </tbody>
      </table></div>
      <p><strong>Instructor Requirements.</strong> Baseline (§2) plus observational/formative-assessment training, same as IE-101. <strong>Islamic Scholarly Review.</strong> Consensus-level Tazkiyah content, consistent with the confirmed manhaj; no dependency on the open madhab decision.</p>

      <h3>RL-201 — Introductory Analytical Skills</h3>
      <div class="table-wrap"><table>
      <tbody>
      <tr><td>Unit</td><td>Research &amp; Learning Skills (cross-cutting)</td><td>Program / Pathway</td><td>Intermediate Islamic Studies</td></tr>
      <tr><td>Level</td><td>Intermediate</td><td>Units / Teaching hours</td><td>1 / 15 (1 hr/week × 15 weeks)</td></tr>
      <tr><td>Expected workload</td><td>~30 hrs</td><td>Prerequisite</td><td>RL-101</td></tr>
      <tr><td>Course type</td><td>Core</td><td>Passing requirement</td><td>60% overall, no component below 40%</td></tr>
      </tbody>
      </table></div>
      <p><strong>Term-length note.</strong> Unlike RL-101's front-loaded intensive, this course is spread across the full 15-week term — it's applied concurrently to material from the other Intermediate courses as they're taught, which only makes pedagogical sense running alongside them.</p>
      <p><strong>Description.</strong> The first step toward reasoning within an Islamic epistemological framework — still guided rather than independent, applying analysis to short texts drawn from concurrent coursework.</p>
      <p><strong>Objectives.</strong> Build guided analytical reading skills; connect directly to material from IS-201/202/203 as worked examples; prepare for Research Preparation (RL-301).</p>
      <p><strong>Learning Outcomes.</strong></p>
      <ol>
      <li><strong>Identify</strong> an argument's basic structure in a short text.</li>
      <li><strong>Compare</strong> evidence and opinion in a source.</li>
      <li><strong>Apply</strong> basic source-verification steps.</li>
      <li><strong>Analyze</strong> a short text using guided critical questions.</li>
      </ol>
      <div class="table-wrap"><table>
      <thead><tr><th>Wk</th><th>Topic</th><th>Objectives</th><th>Key concepts</th><th>Activities</th><th>Readings</th><th>Assessment</th></tr></thead>
      <tbody>
      <tr><td>1</td><td>Guided vs independent reasoning</td><td>Explain the course's aim</td><td>—</td><td>Lecture</td><td>Instructor handout*</td><td>—</td></tr>
      <tr><td>2</td><td>Identifying an argument's structure</td><td>Identify claim/support structure</td><td>—</td><td>Guided practice</td><td>Instructor handout*</td><td>Quiz 1</td></tr>
      <tr><td>3</td><td>Evidence vs opinion</td><td>Compare evidence and opinion</td><td>—</td><td>Guided practice</td><td>Instructor handout*</td><td>—</td></tr>
      <tr><td>4</td><td>Basic source verification</td><td>Apply source-checking steps</td><td>Source verification</td><td>Guided practice</td><td>Instructor handout*</td><td>Quiz 2</td></tr>
      <tr><td>5</td><td>Applying analysis to an Aqeedah text</td><td>Analyze an IS-201 excerpt</td><td>Cross-course application</td><td>Guided practice</td><td>Kitab At-Tawhid excerpt</td><td>Assignment 1</td></tr>
      <tr><td>6</td><td>Applying analysis to a Fiqh text</td><td>Analyze an IS-202 excerpt</td><td>Cross-course application</td><td>Guided practice</td><td>Umdat Al-Ahkam excerpt</td><td>—</td></tr>
      <tr><td>7</td><td>Review</td><td>Consolidate weeks 1–6</td><td>—</td><td>Review session</td><td>—</td><td>—</td></tr>
      <tr><td>8</td><td>Midterm</td><td>—</td><td>—</td><td>—</td><td>—</td><td>Midterm</td></tr>
      <tr><td>9</td><td>Note-taking for analysis</td><td>Apply analytical note-taking</td><td>—</td><td>Guided practice</td><td>Instructor handout*</td><td>Quiz 3</td></tr>
      <tr><td>10</td><td>Comparing two short texts</td><td>Compare two short excerpts</td><td>—</td><td>Guided practice</td><td>Instructor handout*</td><td>—</td></tr>
      <tr><td>11</td><td>Guided critical questions</td><td>Apply a critical-questions framework</td><td>—</td><td>Guided practice</td><td>Instructor handout*</td><td>Assignment 2</td></tr>
      <tr><td>12</td><td>Applying analysis to a Seerah narrative</td><td>Analyze an IS-203 excerpt</td><td>Cross-course application</td><td>Guided practice</td><td>The Prophetic Biography excerpt</td><td>Quiz 4</td></tr>
      <tr><td>13</td><td>Applied analysis exercise</td><td>Analyze an unseen short text</td><td>—</td><td>Guided practice</td><td>—</td><td>—</td></tr>
      <tr><td>14</td><td>Review and consolidation</td><td>Consolidate the term</td><td>—</td><td>Review session</td><td>—</td><td>—</td></tr>
      <tr><td>15</td><td>Final</td><td>—</td><td>—</td><td>—</td><td>—</td><td>Final</td></tr>
      </tbody>
      </table></div>
      <p><strong>Required Texts.</strong> None dedicated — draws short excerpts from the same term's IS-201/202/203 required texts by design. <strong>Recommended Readings.</strong> None. <strong>Teaching Methodology.</strong> Guided practice applying a repeatable analytical framework to real excerpts from concurrent coursework.</p>
      <p><strong>Assessment (Core: 15/20/25/40).</strong></p>
      <div class="table-wrap"><table>
      <thead><tr><th>CLO</th><th>Teaching activity</th><th>Assessment</th><th>Evidence</th></tr></thead>
      <tbody>
      <tr><td>1 — Identify argument structure</td><td>Week 2</td><td>Quiz 1</td><td>Quiz script</td></tr>
      <tr><td>2 — Compare evidence/opinion</td><td>Week 3</td><td>Midterm</td><td>Midterm script</td></tr>
      <tr><td>3 — Apply source verification</td><td>Week 4</td><td>Quiz 2</td><td>Quiz script</td></tr>
      <tr><td>4 — Analyze using critical questions</td><td>Weeks 5–6, 11–13</td><td>Assignment 1, Assignment 2, Quiz 3, Quiz 4, Final</td><td>Assignments, quiz scripts, final script</td></tr>
      </tbody>
      </table></div>
      <p><strong>Instructor Requirements.</strong> Baseline (§2); ideally co-taught or coordinated with the term's IS-201/202/203 instructors, given the cross-course excerpts. <strong>Islamic Scholarly Review.</strong> Not required for the analytical-skills content itself; excerpts drawn from other courses inherit those courses' own scholarly-review notes (IS-201, IS-202, IS-203 above).</p>


      <h2>6. Advanced Islamic Studies</h2>
      <p>All five Advanced-tier Islamic Studies courses (Academic Pathways §4; Course Catalogue). A cross-course note before the specifications: none of the five draw on a confirmed Bookstore text at the depth this tier needs — Foundation and Intermediate tiers had partial coverage (Kitab At-Tawhid, Umdat Al-Ahkam, The Prophetic Biography), but the Bookstore currently stocks no Advanced-level Aqeedah, Usul al-Fiqh, Hadith-sciences, Islamic-thought, or Islamic-ethics text. This is flagged once, covering all five courses, as decision 41 (§13) rather than as five near-identical entries. <em>Riyad As-Salihin</em>, not yet used elsewhere in the Course Specifications, is a genuine (if partial) fit as supplementary reading for IS-305 and is used there rather than left idle.</p>

      <h3>IS-301 — Advanced Aqeedah</h3>
      <div class="table-wrap"><table>
      <tbody>
      <tr><td>Department</td><td>Islamic Studies</td></tr>
      <tr><td>Program / Pathway</td><td>Advanced Islamic Studies</td></tr>
      <tr><td>Level</td><td>Advanced</td></tr>
      <tr><td>Units / Weekly hours</td><td>3 units — 3 hrs/week</td></tr>
      <tr><td>Expected workload</td><td>3 contact + 3 self-study = 6 hrs/week (Core/Language/Research self-study ratio, §2)</td></tr>
      <tr><td>Prerequisite</td><td>IS-201 (Intermediate Aqeedah)</td></tr>
      <tr><td>Course type</td><td>Core</td></tr>
      <tr><td>Passing requirement</td><td>60% overall, no component below 40% (Core/Language/Research profile, §2)</td></tr>
      </tbody></table></div>
      <p><strong>Description.</strong> Moves Aqeedah from structured understanding (IS-201) to independent, argument-following engagement: how the Academy's confirmed Ahlus-Sunnah-wal-Jama'ah, Salaf-understanding positions are reasoned to, not only what they conclude, and how common contemporary doubts are addressed.</p>
      <p><strong>Objectives.</strong> Equip learners to follow and reconstruct the reasoning behind core Aqeedah positions independently, and to recognize and respond to common contemporary challenges to belief.</p>
      <p><strong>Learning Outcomes.</strong> By course end, learners will be able to: (1) <strong>explain</strong> the evidential basis (Qur'an, Sunnah, scholarly consensus) behind the Academy's core Aqeedah positions; (2) <strong>analyze</strong> the internal logic connecting a given Aqeedah position to its evidence; (3) <strong>compare</strong> the confirmed manhaj's positions against at least two commonly encountered contemporary counter-arguments; (4) <strong>evaluate</strong> a presented argument on a belief question for internal consistency and evidential grounding; (5) <strong>demonstrate</strong> reasoned, respectful articulation of a belief position in discussion.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Week</th><th>Topic</th><th>Objectives</th><th>Key Concepts</th><th>Activities</th><th>Readings</th><th>Assessment</th></tr></thead>
      <tbody>
      <tr><td>1</td><td>From structured belief to reasoned belief</td><td>Contextualize the course</td><td>IS-201 recap; what "independent engagement" means here</td><td>Lecture, discussion</td><td>Course guide</td><td>—</td></tr>
      <tr><td>2–3</td><td>Evidential basis of Tawhid</td><td>Explain the evidence behind Tawhid ar-Rububiyyah/Uluhiyyah/Asma-wa-Sifat</td><td>Categories of Tawhid revisited at evidence-level</td><td>Lecture, source analysis</td><td>Core text (pending, decision 41)</td><td>Quiz 1</td></tr>
      <tr><td>4–5</td><td>Evidential basis of Prophethood and Revelation</td><td>Explain why the Qur'an and authentic Sunnah are held as reliable sources</td><td>Proofs of prophethood; textual preservation</td><td>Lecture, discussion</td><td>Core text</td><td>Assignment 1</td></tr>
      <tr><td>6–7</td><td>The Unseen (Ghayb): angels, jinn, the Last Day</td><td>Explain the evidential basis for belief in the unseen</td><td>Categories of ghayb; limits of rational inquiry into it</td><td>Lecture, discussion</td><td>Core text</td><td>Quiz 2</td></tr>
      <tr><td>8</td><td>Midterm review and examination</td><td>Consolidate weeks 1–7</td><td>—</td><td>Written exam</td><td>—</td><td>Midterm</td></tr>
      <tr><td>9–10</td><td>Common contemporary doubts I — origins and existence of God</td><td>Compare confirmed positions against materialist/atheist arguments</td><td>Argument structure; where doubts typically originate</td><td>Case discussion</td><td>Instructor-curated readings</td><td>Assignment 2</td></tr>
      <tr><td>11–12</td><td>Common contemporary doubts II — scripture and science, problem of evil</td><td>Compare confirmed positions against these specific challenges</td><td>Framing science/revelation as complementary, not competing; theodicy</td><td>Case discussion</td><td>Instructor-curated readings</td><td>Quiz 3</td></tr>
      <tr><td>13</td><td>Evaluating arguments</td><td>Evaluate a presented argument for consistency and grounding</td><td>Identifying assumptions, evidential gaps, question-begging</td><td>Workshop — critique sample arguments</td><td>Sample arguments packet</td><td>Assignment 3</td></tr>
      <tr><td>14</td><td>Articulating belief respectfully</td><td>Demonstrate reasoned, respectful articulation</td><td>Da'wah-adjacent communication norms (cf. IE-402)</td><td>Structured discussion/debate practice</td><td>—</td><td>Practical component (discussion)</td></tr>
      <tr><td>15</td><td>Review and final examination</td><td>Consolidate the full term</td><td>—</td><td>Written exam</td><td>—</td><td>Final</td></tr>
      </tbody></table></div>
      <p><strong>Required Texts.</strong> <strong>Gap:</strong> no Advanced-level Aqeedah text currently exists in the Bookstore catalogue — flagged along with the rest of this section as decision 41 (§13); instructor-curated readings are a placeholder. <strong>Recommended Readings.</strong> None assigned pending that gap. <strong>Teaching Methodology.</strong> Lecture and Socratic discussion — the point of this tier is following reasoning, not receiving conclusions.</p>
      <p><strong>Assessment.</strong> Core/Language/Research profile (§2): Quizzes 15% / Assignments 20% / Midterm 25% / Final 40%.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>CLO</th><th>Teaching Activity</th><th>Assessment</th><th>Evidence</th></tr></thead>
      <tbody>
      <tr><td>1. Explain evidential basis</td><td>Weeks 2–7 lectures</td><td>Quizzes 1–2, Midterm</td><td>Quiz scripts, midterm script</td></tr>
      <tr><td>2. Analyze internal logic</td><td>Weeks 2–7</td><td>Midterm, Final</td><td>Exam scripts</td></tr>
      <tr><td>3. Compare against counter-arguments</td><td>Weeks 9–12</td><td>Assignments 2, Quiz 3</td><td>Assignment submissions, quiz script</td></tr>
      <tr><td>4. Evaluate arguments</td><td>Week 13</td><td>Assignment 3</td><td>Assignment submission</td></tr>
      <tr><td>5. Demonstrate articulation</td><td>Week 14</td><td>Practical component</td><td>Instructor observation record</td></tr>
      </tbody></table></div>
      <p><strong>Instructor Requirements.</strong> Baseline (§2), plus demonstrated ability to teach comparative/apologetic material without misrepresenting opposing positions. <strong>Islamic Scholarly Review.</strong> Not dependent on the open madhab decision (Institutional Foundation §12 decision 1) — Aqeedah, not Fiqh. The comparative "common doubts" content (weeks 9–12) should be reviewed by the Scholarly Review Committee for balanced, non-strawman framing of opposing arguments before first delivery.</p>

      <h3>IS-302 — Usul al-Fiqh</h3>
      <div class="table-wrap"><table>
      <tbody>
      <tr><td>Department</td><td>Islamic Studies</td></tr>
      <tr><td>Program / Pathway</td><td>Advanced Islamic Studies</td></tr>
      <tr><td>Level</td><td>Advanced</td></tr>
      <tr><td>Units / Weekly hours</td><td>3 units — 3 hrs/week</td></tr>
      <tr><td>Expected workload</td><td>3 contact + 3 self-study = 6 hrs/week</td></tr>
      <tr><td>Prerequisite</td><td>IS-202 (Intermediate Fiqh)</td></tr>
      <tr><td>Course type</td><td>Core</td></tr>
      <tr><td>Passing requirement</td><td>60% overall, no component below 40%</td></tr>
      </tbody></table></div>
      <p><strong>Description.</strong> The methodology behind Fiqh rulings, not the rulings themselves: how scholars derive rulings from the Qur'an, Sunnah, consensus, and analogical reasoning, and why qualified scholars can differ.</p>
      <p><strong>Objectives.</strong> Equip learners to analyze how a ruling is derived from its sources and to understand, at a foundational level, why legitimate scholarly difference exists.</p>
      <p><strong>Learning Outcomes.</strong> By course end, learners will be able to: (1) <strong>identify</strong> the four primary sources of Islamic law (Qur'an, Sunnah, Ijma, Qiyas) and their role in derivation; (2) <strong>explain</strong> core Usul concepts (e.g. 'amm/khaas, mutlaq/muqayyad, nasikh/mansukh, the categories of a hukm); (3) <strong>analyze</strong> a worked derivation example to identify which source(s) and principle(s) it rests on; (4) <strong>compare</strong> how methodological differences between scholars can legitimately produce different rulings from the same evidence; (5) <strong>apply</strong> basic Usul reasoning to a simple, previously unseen scenario under instructor guidance.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Week</th><th>Topic</th><th>Objectives</th><th>Key Concepts</th><th>Activities</th><th>Readings</th><th>Assessment</th></tr></thead>
      <tbody>
      <tr><td>1</td><td>What Usul al-Fiqh is and why it matters</td><td>Contextualize the course</td><td>Fiqh vs. Usul al-Fiqh distinction</td><td>Lecture</td><td>Course guide</td><td>—</td></tr>
      <tr><td>2–3</td><td>The four primary sources</td><td>Identify Qur'an, Sunnah, Ijma, Qiyas and their hierarchy</td><td>Source hierarchy; conditions for each</td><td>Lecture, discussion</td><td>Core text (pending, decision 41)</td><td>Quiz 1</td></tr>
      <tr><td>4–5</td><td>Categories of a ruling (ahkam)</td><td>Explain wajib, mandub, mubah, makruh, haram and their evidential markers</td><td>The five-category framework</td><td>Lecture, worked examples</td><td>Core text</td><td>Assignment 1</td></tr>
      <tr><td>6–7</td><td>Textual interpretation tools</td><td>Explain 'amm/khaas, mutlaq/muqayyad, nasikh/mansukh</td><td>How texts are read precisely</td><td>Lecture, source analysis</td><td>Core text</td><td>Quiz 2</td></tr>
      <tr><td>8</td><td>Midterm review and examination</td><td>Consolidate weeks 1–7</td><td>—</td><td>Written exam</td><td>—</td><td>Midterm</td></tr>
      <tr><td>9–10</td><td>Ijma and Qiyas in practice</td><td>Analyze worked derivation examples</td><td>Conditions for valid consensus and analogy</td><td>Worked examples, discussion</td><td>Instructor-curated case set</td><td>Assignment 2</td></tr>
      <tr><td>11–12</td><td>Why qualified scholars differ (ikhtilaf)</td><td>Compare methodological roots of legitimate difference</td><td>Sources of ikhtilaf; adab of disagreement</td><td>Case discussion</td><td>Instructor-curated case set</td><td>Quiz 3</td></tr>
      <tr><td>13</td><td>Guided application workshop</td><td>Apply Usul reasoning to a simple new scenario</td><td>Putting the framework together</td><td>Guided workshop</td><td>Practice scenarios</td><td>Assignment 3</td></tr>
      <tr><td>14</td><td>Bridging to IS-401 (Comparative Fiqh)</td><td>Preview how this methodology underlies comparative study</td><td>—</td><td>Lecture, Q&amp;A</td><td>—</td><td>—</td></tr>
      <tr><td>15</td><td>Review and final examination</td><td>Consolidate the full term</td><td>—</td><td>Written exam</td><td>—</td><td>Final</td></tr>
      </tbody></table></div>
      <p><strong>Required Texts.</strong> <strong>Gap:</strong> no Usul al-Fiqh methodology text currently exists in the Bookstore catalogue — decision 41 (§13); instructor-curated materials are a placeholder. <strong>Recommended Readings.</strong> None assigned pending that gap. <strong>Teaching Methodology.</strong> Lecture plus worked derivation examples — Usul is learned by tracing derivations, not by memorizing definitions alone.</p>
      <p><strong>Assessment.</strong> Core/Language/Research profile: Quizzes 15% / Assignments 20% / Midterm 25% / Final 40%.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>CLO</th><th>Teaching Activity</th><th>Assessment</th><th>Evidence</th></tr></thead>
      <tbody>
      <tr><td>1. Identify primary sources</td><td>Weeks 2–3</td><td>Quiz 1</td><td>Quiz script</td></tr>
      <tr><td>2. Explain Usul concepts</td><td>Weeks 4–7</td><td>Assignment 1, Quiz 2, Midterm</td><td>Submissions, scripts</td></tr>
      <tr><td>3. Analyze worked derivations</td><td>Weeks 9–10</td><td>Assignment 2</td><td>Assignment submission</td></tr>
      <tr><td>4. Compare sources of ikhtilaf</td><td>Weeks 11–12</td><td>Quiz 3</td><td>Quiz script</td></tr>
      <tr><td>5. Apply to a new scenario</td><td>Week 13</td><td>Assignment 3, Final</td><td>Assignment submission, exam script</td></tr>
      </tbody></table></div>
      <p><strong>Instructor Requirements.</strong> Baseline (§2), plus demonstrated command of Usul al-Fiqh methodology (typically evidenced by relevant advanced study). <strong>Islamic Scholarly Review.</strong> Depends directly on Institutional Foundation §12 decision 1: whether a single madhab's Usul framework is adopted, or the course presents Usul methodology generally with madhab differences noted evidentially and non-bindingly. Worked examples in weeks 9–10 and the guided application in week 13 cannot be finalized until that decision is made.</p>

      <h3>IS-303 — Hadith Sciences</h3>
      <div class="table-wrap"><table>
      <tbody>
      <tr><td>Department</td><td>Islamic Studies</td></tr>
      <tr><td>Program / Pathway</td><td>Advanced Islamic Studies</td></tr>
      <tr><td>Level</td><td>Advanced</td></tr>
      <tr><td>Units / Weekly hours</td><td>3 units — 3 hrs/week</td></tr>
      <tr><td>Expected workload</td><td>3 contact + 3 self-study = 6 hrs/week</td></tr>
      <tr><td>Prerequisite</td><td>IS-202 (Intermediate Fiqh)</td></tr>
      <tr><td>Course type</td><td>Core</td></tr>
      <tr><td>Passing requirement</td><td>60% overall, no component below 40%</td></tr>
      </tbody></table></div>
      <p><strong>Description.</strong> Hadith introduced and developed as its own dedicated discipline (mustalah al-hadith) at Advanced tier, building on the hadith exposure already present in IS-101/IS-202. Classification, chains of transmission (isnad), and basic authentication criteria.</p>
      <p><strong>Objectives.</strong> Equip learners to classify hadith by authenticity grade and explain, at a foundational level, how that grading is reached.</p>
      <p><strong>Learning Outcomes.</strong> By course end, learners will be able to: (1) <strong>identify</strong> the components of an isnad (chain of narrators) and matn (text); (2) <strong>explain</strong> the classification categories (sahih, hasan, da'if, mawdu') and their defining criteria; (3) <strong>describe</strong> the major hadith collections and their relative standing (the six canonical collections, Riyad As-Salihin as a curated compilation); (4) <strong>analyze</strong> a sample isnad against basic authentication criteria (continuity, narrator reliability, absence of hidden defects); (5) <strong>apply</strong> basic classification reasoning to a guided sample hadith.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Week</th><th>Topic</th><th>Objectives</th><th>Key Concepts</th><th>Activities</th><th>Readings</th><th>Assessment</th></tr></thead>
      <tbody>
      <tr><td>1</td><td>Why hadith sciences exist</td><td>Contextualize the discipline</td><td>Preservation of the Sunnah; why classification matters</td><td>Lecture</td><td>Course guide</td><td>—</td></tr>
      <tr><td>2–3</td><td>Isnad and matn</td><td>Identify the components of a hadith report</td><td>Chain of narration; text of the report</td><td>Lecture, source analysis</td><td>Core text (pending, decision 41)</td><td>Quiz 1</td></tr>
      <tr><td>4–5</td><td>Classification categories</td><td>Explain sahih, hasan, da'if, mawdu' and their criteria</td><td>Continuity, narrator reliability ('adalah, dabt), absence of defects</td><td>Lecture, discussion</td><td>Core text</td><td>Assignment 1</td></tr>
      <tr><td>6–7</td><td>The major collections</td><td>Describe the six canonical collections and curated compilations</td><td>Bukhari, Muslim, the four Sunan; Riyad As-Salihin's role</td><td>Lecture, survey</td><td><em>Riyad As-Salihin</em> (Academy Bookstore), selected passages</td><td>Quiz 2</td></tr>
      <tr><td>8</td><td>Midterm review and examination</td><td>Consolidate weeks 1–7</td><td>—</td><td>Written exam</td><td>—</td><td>Midterm</td></tr>
      <tr><td>9–10</td><td>Narrator criticism ('ilm al-jarh wa-t-ta'dil), introduced</td><td>Analyze how narrator reliability is assessed</td><td>Basic jarh wa ta'dil concepts, at introductory depth</td><td>Lecture, worked examples</td><td>Instructor-curated readings</td><td>Assignment 2</td></tr>
      <tr><td>11–12</td><td>Guided isnad analysis</td><td>Analyze a sample isnad against authentication criteria</td><td>Applying the criteria step by step</td><td>Workshop</td><td>Sample isnad packet</td><td>Quiz 3</td></tr>
      <tr><td>13</td><td>Guided classification practice</td><td>Apply classification reasoning to a guided sample</td><td>Putting criteria together into a grade</td><td>Guided workshop</td><td>Practice hadith set</td><td>Assignment 3</td></tr>
      <tr><td>14</td><td>Bridging to IS-402 (Hadith Methodology/Takhrij)</td><td>Preview how classification underlies takhrij</td><td>—</td><td>Lecture, Q&amp;A</td><td>—</td><td>—</td></tr>
      <tr><td>15</td><td>Review and final examination</td><td>Consolidate the full term</td><td>—</td><td>Written exam</td><td>—</td><td>Final</td></tr>
      </tbody></table></div>
      <p><strong>Required Texts.</strong> <strong>Gap:</strong> no dedicated hadith-sciences (mustalah al-hadith) text currently exists in the Bookstore catalogue — decision 41 (§13); instructor-curated materials are a placeholder. <strong>Recommended Readings.</strong> <em>Riyad As-Salihin</em> (Academy Bookstore), selected passages, for the major-collections survey in weeks 6–7 — a genuine, if partial, fit as a curated hadith compilation rather than a sciences-of-hadith text. <strong>Teaching Methodology.</strong> Lecture plus guided isnad-analysis workshops — classification is a practiced skill, not only a set of definitions.</p>
      <p><strong>Assessment.</strong> Core/Language/Research profile: Quizzes 15% / Assignments 20% / Midterm 25% / Final 40%.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>CLO</th><th>Teaching Activity</th><th>Assessment</th><th>Evidence</th></tr></thead>
      <tbody>
      <tr><td>1. Identify isnad/matn components</td><td>Weeks 2–3</td><td>Quiz 1</td><td>Quiz script</td></tr>
      <tr><td>2. Explain classification categories</td><td>Weeks 4–5</td><td>Assignment 1, Midterm</td><td>Submission, exam script</td></tr>
      <tr><td>3. Describe major collections</td><td>Weeks 6–7</td><td>Quiz 2</td><td>Quiz script</td></tr>
      <tr><td>4. Analyze a sample isnad</td><td>Weeks 9–12</td><td>Assignment 2, Quiz 3</td><td>Submission, quiz script</td></tr>
      <tr><td>5. Apply classification reasoning</td><td>Week 13</td><td>Assignment 3, Final</td><td>Submission, exam script</td></tr>
      </tbody></table></div>
      <p><strong>Instructor Requirements.</strong> Baseline (§2), plus demonstrated grounding in hadith-sciences methodology (typically evidenced by relevant advanced study). <strong>Islamic Scholarly Review.</strong> Classification terminology and criteria are consensus-level within mainstream Sunni hadith methodology and not dependent on the open madhab decision. The Scholarly Review Committee should confirm the instructor-curated case sets (weeks 9–13) use only examples with settled classifications, avoiding contested individual gradings at this introductory depth.</p>

      <h3>IS-304 — Islamic Thought</h3>
      <div class="table-wrap"><table>
      <tbody>
      <tr><td>Department</td><td>Islamic Studies</td></tr>
      <tr><td>Program / Pathway</td><td>Advanced Islamic Studies</td></tr>
      <tr><td>Level</td><td>Advanced</td></tr>
      <tr><td>Units / Weekly hours</td><td>2 units — 2 hrs/week</td></tr>
      <tr><td>Expected workload</td><td>2 contact + 2 self-study = 4 hrs/week</td></tr>
      <tr><td>Prerequisite</td><td>IS-301 (Advanced Aqeedah)</td></tr>
      <tr><td>Course type</td><td>Core</td></tr>
      <tr><td>Passing requirement</td><td>60% overall, no component below 40%</td></tr>
      </tbody></table></div>
      <p><strong>Description.</strong> The classical and contemporary Islamic intellectual tradition — kalam (theological discourse), philosophical theology, and the historical schools of thought — surveyed comparatively and historically, distinct from IC-301 (Islamic Social Thought)'s civilizational/social application of that same tradition (Department Curriculum Design §1, §9).</p>
      <p><strong>Objectives.</strong> Equip learners to engage with the broader intellectual tradition historically and comparatively, distinguishing description of a position from endorsement of it.</p>
      <p><strong>Learning Outcomes.</strong> By course end, learners will be able to: (1) <strong>describe</strong> the historical emergence of kalam and the major early theological schools; (2) <strong>compare</strong> the confirmed Ahlus-Sunnah manhaj's positions against those schools on key questions (e.g. the nature of divine attributes, free will and predestination); (3) <strong>explain</strong> why the Academy's manhaj holds the positions it does, referencing IS-301's evidential grounding; (4) <strong>analyze</strong> a primary or secondary source excerpt to identify which theological school it represents; (5) <strong>produce</strong> a short research essay on one figure, school, or debate from the tradition.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Week</th><th>Topic</th><th>Objectives</th><th>Key Concepts</th><th>Activities</th><th>Readings</th><th>Assessment</th></tr></thead>
      <tbody>
      <tr><td>1</td><td>What kalam is and why it emerged</td><td>Contextualize the course</td><td>Historical origins of theological discourse</td><td>Lecture</td><td>Course guide</td><td>—</td></tr>
      <tr><td>2–3</td><td>Early theological schools I</td><td>Describe the emergence and core positions of early schools</td><td>Historical overview, non-endorsing framing</td><td>Lecture, discussion</td><td>Core text (pending, decision 41)</td><td>Quiz 1</td></tr>
      <tr><td>4–5</td><td>Early theological schools II; the confirmed manhaj's response</td><td>Compare manhaj positions against these schools</td><td>Divine attributes, free will/predestination debates</td><td>Lecture, source comparison</td><td>Core text; cross-reference IS-301</td><td>Assignment 1</td></tr>
      <tr><td>6–7</td><td>Later developments and contemporary currents</td><td>Describe how the tradition continued into the modern period</td><td>Selected contemporary theological trends, surveyed not endorsed</td><td>Lecture, discussion</td><td>Instructor-curated readings</td><td>Quiz 2</td></tr>
      <tr><td>8</td><td>Midterm review and examination</td><td>Consolidate weeks 1–7</td><td>—</td><td>Written exam</td><td>—</td><td>Midterm</td></tr>
      <tr><td>9–10</td><td>Source analysis workshop</td><td>Analyze excerpts to identify their theological school</td><td>Reading for school-identifying markers</td><td>Workshop</td><td>Source excerpt packet</td><td>Assignment 2</td></tr>
      <tr><td>11–13</td><td>Research essay preparation and drafting</td><td>Produce a short research essay</td><td>Selecting a figure/school/debate; structuring an essay</td><td>Supervised research, drafting</td><td>Student-selected sources, instructor-approved</td><td>Research essay</td></tr>
      <tr><td>14</td><td>Peer discussion of essays</td><td>Reinforce comparative, non-endorsing framing</td><td>—</td><td>Seminar discussion</td><td>—</td><td>—</td></tr>
      <tr><td>15</td><td>Review and final examination</td><td>Consolidate the full term</td><td>—</td><td>Written exam</td><td>—</td><td>Final</td></tr>
      </tbody></table></div>
      <p><strong>Required Texts.</strong> <strong>Gap:</strong> no Islamic-thought/kalam survey text currently exists in the Bookstore catalogue — decision 41 (§13); instructor-curated materials are a placeholder. <strong>Recommended Readings.</strong> None assigned pending that gap. <strong>Teaching Methodology.</strong> Lecture and comparative source analysis, with an explicit "describe before evaluate" discipline — the point is understanding the tradition, not adjudicating it in class.</p>
      <p><strong>Assessment.</strong> Core/Language/Research profile: Quizzes 15% / Assignments 20% / Midterm 25% / Final 40% (the research essay is graded within the Final component).</p>
      <div class="table-wrap"><table>
      <thead><tr><th>CLO</th><th>Teaching Activity</th><th>Assessment</th><th>Evidence</th></tr></thead>
      <tbody>
      <tr><td>1. Describe early schools</td><td>Weeks 2–3</td><td>Quiz 1</td><td>Quiz script</td></tr>
      <tr><td>2. Compare against manhaj positions</td><td>Weeks 4–5</td><td>Assignment 1, Midterm</td><td>Submission, exam script</td></tr>
      <tr><td>3. Explain manhaj's grounding</td><td>Weeks 4–7</td><td>Quiz 2, Midterm</td><td>Quiz script, exam script</td></tr>
      <tr><td>4. Analyze source excerpts</td><td>Weeks 9–10</td><td>Assignment 2</td><td>Submission</td></tr>
      <tr><td>5. Produce a research essay</td><td>Weeks 11–13</td><td>Research essay, Final</td><td>Essay manuscript</td></tr>
      </tbody></table></div>
      <p><strong>Instructor Requirements.</strong> Baseline (§2), plus demonstrated ability to present contested historical schools comparatively and without misrepresentation. <strong>Islamic Scholarly Review.</strong> Not dependent on the open madhab decision (kalam schools, not Fiqh madhabs) but requires its own Scholarly Review Committee sign-off before first delivery: the comparative survey of theological schools (weeks 2–7) must be framed as historical description, not endorsement, and this framing should be checked rather than assumed. Flagged as a new, course-specific scholarly-review dependency (decision 42, §13) distinct from decision 1.</p>

      <h3>IS-305 — Islamic Ethics</h3>
      <div class="table-wrap"><table>
      <tbody>
      <tr><td>Department</td><td>Islamic Studies</td></tr>
      <tr><td>Program / Pathway</td><td>Advanced Islamic Studies</td></tr>
      <tr><td>Level</td><td>Advanced</td></tr>
      <tr><td>Units / Weekly hours</td><td>2 units — 2 hrs/week</td></tr>
      <tr><td>Expected workload</td><td>2 contact + 2 self-study = 4 hrs/week</td></tr>
      <tr><td>Prerequisite</td><td>IS-301 (Advanced Aqeedah)</td></tr>
      <tr><td>Course type</td><td>Core</td></tr>
      <tr><td>Passing requirement</td><td>60% overall, no component below 40%</td></tr>
      </tbody></table></div>
      <p><strong>Description.</strong> Akhlaq (Islamic ethics) treated as a reasoned discipline — the theoretical counterpart to Tazkiyah's practiced formation (IE-101, IE-202). Explores how Islamic ethical frameworks ground and evaluate moral questions, including contemporary applied ones.</p>
      <p><strong>Objectives.</strong> Equip learners to reason about moral questions using Islamic ethical frameworks, distinguishing this theoretical reasoning from Tazkiyah's practiced character formation.</p>
      <p><strong>Learning Outcomes.</strong> By course end, learners will be able to: (1) <strong>explain</strong> the evidential and rational grounding of Islamic ethics (Qur'an, Sunnah, maqasid al-shari'ah at introductory depth); (2) <strong>describe</strong> how akhlaq relates to but differs from Tazkiyah, Fiqh, and secular ethical theory; (3) <strong>compare</strong> an Islamic ethical framework against at least one secular ethical framework (e.g. consequentialism, deontology) on a shared question; (4) <strong>analyze</strong> a contemporary applied-ethics case using Islamic ethical reasoning; (5) <strong>evaluate</strong> a moral argument for whether it follows from stated Islamic ethical premises.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Week</th><th>Topic</th><th>Objectives</th><th>Key Concepts</th><th>Activities</th><th>Readings</th><th>Assessment</th></tr></thead>
      <tbody>
      <tr><td>1</td><td>What Islamic ethics is</td><td>Contextualize the course</td><td>Akhlaq vs. Tazkiyah vs. Fiqh, distinguished</td><td>Lecture</td><td>Course guide</td><td>—</td></tr>
      <tr><td>2–3</td><td>Evidential and rational grounding</td><td>Explain the grounding of Islamic ethics</td><td>Maqasid al-shari'ah, introductory depth</td><td>Lecture, discussion</td><td>Core text (pending, decision 41)</td><td>Quiz 1</td></tr>
      <tr><td>4–5</td><td>Islamic ethics and secular ethical theory</td><td>Compare frameworks on a shared question</td><td>Consequentialism, deontology, virtue ethics, briefly surveyed</td><td>Lecture, comparative discussion</td><td>Instructor-curated readings</td><td>Assignment 1</td></tr>
      <tr><td>6–7</td><td>Character and virtue in the Islamic tradition</td><td>Describe akhlaq's relationship to practiced character</td><td>Connecting theory (this course) to practice (IE-101/202)</td><td>Lecture, discussion</td><td><em>Riyad As-Salihin</em> (Academy Bookstore), selected chapters</td><td>Quiz 2</td></tr>
      <tr><td>8</td><td>Midterm review and examination</td><td>Consolidate weeks 1–7</td><td>—</td><td>Written exam</td><td>—</td><td>Midterm</td></tr>
      <tr><td>9–10</td><td>Applied ethics case studies I</td><td>Analyze contemporary cases using Islamic ethical reasoning</td><td>Selected accessible cases (e.g. honesty in business, care for the vulnerable)</td><td>Case discussion</td><td>Case packet</td><td>Assignment 2</td></tr>
      <tr><td>11–12</td><td>Applied ethics case studies II</td><td>Continue applied analysis on new cases</td><td>Further accessible cases</td><td>Case discussion</td><td>Case packet</td><td>Quiz 3</td></tr>
      <tr><td>13</td><td>Evaluating moral arguments</td><td>Evaluate whether an argument follows from stated premises</td><td>Argument structure in ethical reasoning</td><td>Workshop</td><td>Sample arguments</td><td>Assignment 3</td></tr>
      <tr><td>14</td><td>Synthesis discussion</td><td>Connect theory back to practiced formation</td><td>—</td><td>Seminar discussion</td><td>—</td><td>—</td></tr>
      <tr><td>15</td><td>Review and final examination</td><td>Consolidate the full term</td><td>—</td><td>Written exam</td><td>—</td><td>Final</td></tr>
      </tbody></table></div>
      <p><strong>Required Texts.</strong> <strong>Gap:</strong> no dedicated Islamic-ethics/akhlaq-theory text currently exists in the Bookstore catalogue — decision 41 (§13); instructor-curated materials are a placeholder. <strong>Recommended Readings.</strong> <em>Riyad As-Salihin</em> (Academy Bookstore), selected chapters on character, as a primary-source companion for weeks 6–7 — genuine but partial, since it is a hadith compilation rather than an ethics-theory text. <strong>Teaching Methodology.</strong> Lecture plus applied case discussion — akhlaq is tested against real questions, not only stated as theory.</p>
      <p><strong>Assessment.</strong> Core/Language/Research profile: Quizzes 15% / Assignments 20% / Midterm 25% / Final 40%.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>CLO</th><th>Teaching Activity</th><th>Assessment</th><th>Evidence</th></tr></thead>
      <tbody>
      <tr><td>1. Explain grounding of Islamic ethics</td><td>Weeks 2–3</td><td>Quiz 1, Midterm</td><td>Quiz script, exam script</td></tr>
      <tr><td>2. Describe relation to Tazkiyah/Fiqh/secular ethics</td><td>Weeks 1, 6–7</td><td>Quiz 2</td><td>Quiz script</td></tr>
      <tr><td>3. Compare against a secular framework</td><td>Weeks 4–5</td><td>Assignment 1</td><td>Submission</td></tr>
      <tr><td>4. Analyze applied cases</td><td>Weeks 9–12</td><td>Assignment 2, Quiz 3</td><td>Submission, quiz script</td></tr>
      <tr><td>5. Evaluate moral arguments</td><td>Week 13</td><td>Assignment 3, Final</td><td>Submission, exam script</td></tr>
      </tbody></table></div>
      <p><strong>Instructor Requirements.</strong> Baseline (§2), plus familiarity with both Islamic ethical reasoning and, at survey level, the secular ethical frameworks used for comparison in weeks 4–5. <strong>Islamic Scholarly Review.</strong> Consensus-level akhlaq content, consistent with the confirmed manhaj — no dependency on the open madhab decision, same status as IE-101/IE-202's Tazkiyah content. The secular-framework comparison (weeks 4–5) should be reviewed once to confirm balanced, non-strawman treatment, similar in kind to IS-301's comparative-doubts content.</p>

      <h2>7. Advanced Qur'anic Studies, Arabic, Civilization &amp; Society, Research</h2>
      <p>The six remaining Advanced-tier courses outside Islamic Studies (Academic Pathways §4; Course Catalogue): one per Qur'anic Studies, two Arabic, one Civilization &amp; Society, one Research &amp; Learning Skills. QS-301 (Advanced Tajweed) uses the Recitation/Hifz profile and needs a practical competency rubric; AR-302 (Conversation) is the Academy's first dedicated Arabic-speaking practical course and needs one too. <em>Tafsir Ibn Kathir</em>, used as a supplementary reading at QS-202, is elevated to a Required Text at QS-302 — the natural place for it once Tafsir becomes the dedicated subject rather than a reference aid.</p>

      <h3>QS-301 — Advanced Tajweed</h3>
      <div class="table-wrap"><table>
      <tbody>
      <tr><td>Department</td><td>Qur'anic Studies</td></tr>
      <tr><td>Program / Pathway</td><td>Advanced Islamic Studies</td></tr>
      <tr><td>Level</td><td>Advanced</td></tr>
      <tr><td>Units / Weekly hours</td><td>2 units — 2 hrs/week</td></tr>
      <tr><td>Expected workload</td><td>2 contact + 3 self-study = 5 hrs/week (Recitation/Hifz self-study ratio ×1.5, §2)</td></tr>
      <tr><td>Prerequisite</td><td>QS-201 (Applied Tajweed)</td></tr>
      <tr><td>Course type</td><td>Recitation/Hifz</td></tr>
      <tr><td>Passing requirement</td><td>60% overall AND minimum 60% on Practical+Final combined (Recitation/Hifz profile, §2)</td></tr>
      </tbody></table></div>
      <p><strong>Description.</strong> Mastery-level Tajweed: the point at which the discipline is no longer separately taught past this course (Curriculum Framework §3) — fluent, correct recitation across longer passages at speed, with self-correction.</p>
      <p><strong>Objectives.</strong> Bring learners to independent, self-correcting mastery of Tajweed rules across extended recitation.</p>
      <p><strong>Learning Outcomes.</strong> By course end, learners will be able to: (1) <strong>recite</strong> extended Qur'anic passages applying all Tajweed rules correctly at natural speed; (2) <strong>identify</strong> and self-correct Tajweed errors in real time without instructor prompting; (3) <strong>explain</strong> the rule governing any given application, on request, during recitation; (4) <strong>demonstrate</strong> consistent application across previously unseen passages; (5) <strong>evaluate</strong> a peer's recitation against Tajweed criteria, constructively.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Week</th><th>Topic</th><th>Objectives</th><th>Key Concepts</th><th>Activities</th><th>Readings</th><th>Assessment</th></tr></thead>
      <tbody>
      <tr><td>1</td><td>Diagnostic recitation</td><td>Baseline each learner's current level</td><td>—</td><td>Individual recitation, instructor notes</td><td>—</td><td>Diagnostic (non-graded)</td></tr>
      <tr><td>2–4</td><td>Extended-passage fluency</td><td>Recite longer passages at natural speed</td><td>Rule application under increasing length/speed</td><td>Guided group and individual recitation</td><td>Mus'haf</td><td>Quiz 1 (recitation)</td></tr>
      <tr><td>5–7</td><td>Self-correction practice</td><td>Identify and self-correct errors in real time</td><td>Listening-while-reciting; error self-detection</td><td>Paired practice, recorded self-review</td><td>Mus'haf</td><td>Assignment 1 (recorded recitation)</td></tr>
      <tr><td>8</td><td>Midterm practical assessment</td><td>Consolidate weeks 1–7</td><td>—</td><td>Individual recitation exam</td><td>—</td><td>Midterm (practical)</td></tr>
      <tr><td>9–10</td><td>Explaining rules on demand</td><td>Explain the rule behind any given application</td><td>Rule-naming under recitation</td><td>Guided practice with instructor questioning</td><td>Mus'haf</td><td>Quiz 2</td></tr>
      <tr><td>11–12</td><td>Unseen-passage application</td><td>Demonstrate consistent application on new passages</td><td>Transfer of skill beyond practiced material</td><td>Sight-recitation practice</td><td>Mus'haf, previously unseen sections</td><td>Assignment 2</td></tr>
      <tr><td>13–14</td><td>Peer evaluation practice</td><td>Evaluate a peer's recitation constructively</td><td>Applying the rubric as an evaluator, not only a reciter</td><td>Peer-review circles</td><td>Practical Competency Rubric (below)</td><td>Assignment 3</td></tr>
      <tr><td>15</td><td>Final practical examination</td><td>Consolidate the full term</td><td>—</td><td>Individual recitation exam</td><td>—</td><td>Final (practical)</td></tr>
      </tbody></table></div>
      <p><strong>Practical Competency Rubric.</strong> Scored on four bands (Not yet competent / Developing / Competent / Mastery) across: rule accuracy across an extended passage; fluency and pacing; self-correction without prompting; ability to explain a rule on request. Practical and Final components (60% combined minimum, §2) are assessed against this rubric by the instructor, with the midterm practical scored the same way as a formative checkpoint.</p>
      <p><strong>Required Texts.</strong> Same Tajwid-manual gap as QS-101/QS-102/QS-201 (decision 35) — Mus'haf as the working text. <strong>Recommended Readings.</strong> None. <strong>Teaching Methodology.</strong> Individual and paired guided recitation — this is a practiced skill course; lecture time is minimal.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>CLO</th><th>Teaching Activity</th><th>Assessment</th><th>Evidence</th></tr></thead>
      <tbody>
      <tr><td>1. Recite extended passages correctly</td><td>Weeks 2–4</td><td>Quiz 1, Midterm</td><td>Recitation recordings, instructor scoring</td></tr>
      <tr><td>2. Self-correct in real time</td><td>Weeks 5–7</td><td>Assignment 1</td><td>Recorded recitation</td></tr>
      <tr><td>3. Explain rules on demand</td><td>Weeks 9–10</td><td>Quiz 2</td><td>Instructor observation record</td></tr>
      <tr><td>4. Apply to unseen passages</td><td>Weeks 11–12</td><td>Assignment 2, Final</td><td>Recitation recordings</td></tr>
      <tr><td>5. Evaluate a peer's recitation</td><td>Weeks 13–14</td><td>Assignment 3</td><td>Peer-review notes</td></tr>
      </tbody></table></div>
      <p><strong>Instructor Requirements.</strong> Baseline (§2) plus demonstrated advanced Tajweed mastery — same open ijazah question as QS-101/QS-102/QS-201 (decision 36). <strong>Islamic Scholarly Review.</strong> Same riwayah/qira'ah dependency as QS-101/102/201 (decision 37) — the extended passages and rule set taught here depend on which riwayah is adopted.</p>

      <h3>QS-302 — Tafsir I</h3>
      <div class="table-wrap"><table>
      <tbody>
      <tr><td>Department</td><td>Qur'anic Studies</td></tr>
      <tr><td>Program / Pathway</td><td>Advanced Islamic Studies</td></tr>
      <tr><td>Level</td><td>Advanced</td></tr>
      <tr><td>Units / Weekly hours</td><td>3 units — 3 hrs/week</td></tr>
      <tr><td>Expected workload</td><td>3 contact + 4.5 self-study ≈ 7.5 hrs/week (Language/Research-adjacent self-study ratio ×1.5, §2 — Tafsir treated as text-intensive)</td></tr>
      <tr><td>Prerequisite</td><td>QS-202 (Qur'an Comprehension I)</td></tr>
      <tr><td>Course type</td><td>Core</td></tr>
      <tr><td>Passing requirement</td><td>60% overall, no component below 40% (Core/Language/Research profile, §2)</td></tr>
      </tbody></table></div>
      <p><strong>Description.</strong> The first dedicated Tafsir course: sustained, exegetical study of selected surahs using a classical Tafsir work, moving beyond QS-202's guided-comprehension excerpts to full exegetical method.</p>
      <p><strong>Objectives.</strong> Equip learners to read and follow a classical Tafsir's reasoning on selected passages, and to summarize its exegetical conclusions accurately.</p>
      <p><strong>Learning Outcomes.</strong> By course end, learners will be able to: (1) <strong>describe</strong> the classical Tafsir methodology used (source hierarchy: Qur'an by Qur'an, by Sunnah, by companion statements, by language); (2) <strong>explain</strong> the exegetical reasoning given for at least six selected passages; (3) <strong>compare</strong> two classical explanations of the same verse where the text presents more than one; (4) <strong>interpret</strong> a previously unseen but comparable verse using the same methodology, under guidance; (5) <strong>produce</strong> a written exegetical summary of one assigned passage.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Week</th><th>Topic</th><th>Objectives</th><th>Key Concepts</th><th>Activities</th><th>Readings</th><th>Assessment</th></tr></thead>
      <tbody>
      <tr><td>1</td><td>Tafsir methodology overview</td><td>Describe the source hierarchy used</td><td>Tafsir bi-l-ma'thur; the classical method</td><td>Lecture</td><td><em>Tafsir Ibn Kathir</em> (Academy Bookstore), introduction</td><td>—</td></tr>
      <tr><td>2–4</td><td>Selected passage I</td><td>Explain the exegetical reasoning given</td><td>Working through one surah section in depth</td><td>Guided reading, discussion</td><td>Tafsir Ibn Kathir, assigned sections</td><td>Quiz 1</td></tr>
      <tr><td>5–7</td><td>Selected passage II</td><td>Explain exegetical reasoning; compare differing explanations</td><td>Where the text presents more than one view</td><td>Guided reading, discussion</td><td>Tafsir Ibn Kathir, assigned sections</td><td>Assignment 1</td></tr>
      <tr><td>8</td><td>Midterm review and examination</td><td>Consolidate weeks 1–7</td><td>—</td><td>Written exam</td><td>—</td><td>Midterm</td></tr>
      <tr><td>9–11</td><td>Selected passage III</td><td>Continue exegetical reading, greater learner independence</td><td>Applying the method with less guidance</td><td>Guided reading, discussion</td><td>Tafsir Ibn Kathir, assigned sections</td><td>Quiz 2</td></tr>
      <tr><td>12–13</td><td>Guided interpretation of an unseen verse</td><td>Interpret a comparable unseen verse using the method</td><td>Transfer of methodology</td><td>Workshop</td><td>Instructor-selected verse</td><td>Assignment 2</td></tr>
      <tr><td>14</td><td>Exegetical summary writing</td><td>Produce a written summary of an assigned passage</td><td>Summarizing exegesis accurately and concisely</td><td>Supervised writing</td><td>—</td><td>Assignment 3 (exegetical summary)</td></tr>
      <tr><td>15</td><td>Review and final examination</td><td>Consolidate the full term</td><td>—</td><td>Written exam</td><td>—</td><td>Final</td></tr>
      </tbody></table></div>
      <p><strong>Required Texts.</strong> <em>Tafsir Ibn Kathir</em> (Academy Bookstore) — a direct, confirmed match, elevated here from QS-202's supplementary reference to the course's central text. <strong>Recommended Readings.</strong> None beyond the required text. <strong>Teaching Methodology.</strong> Guided close reading and discussion — exegesis is followed passage by passage, not summarized in lecture alone.</p>
      <p><strong>Assessment.</strong> Core/Language/Research profile: Quizzes 15% / Assignments 20% / Midterm 25% / Final 40%.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>CLO</th><th>Teaching Activity</th><th>Assessment</th><th>Evidence</th></tr></thead>
      <tbody>
      <tr><td>1. Describe Tafsir methodology</td><td>Week 1</td><td>Midterm</td><td>Exam script</td></tr>
      <tr><td>2. Explain exegetical reasoning</td><td>Weeks 2–7</td><td>Quiz 1, Assignment 1, Midterm</td><td>Quiz/exam scripts, submission</td></tr>
      <tr><td>3. Compare differing explanations</td><td>Weeks 5–7</td><td>Assignment 1</td><td>Submission</td></tr>
      <tr><td>4. Interpret an unseen verse</td><td>Weeks 12–13</td><td>Assignment 2</td><td>Submission</td></tr>
      <tr><td>5. Produce a written summary</td><td>Week 14</td><td>Assignment 3, Final</td><td>Summary manuscript, exam script</td></tr>
      </tbody></table></div>
      <p><strong>Instructor Requirements.</strong> Baseline (§2), plus demonstrated command of classical Tafsir methodology and the specific text used. <strong>Islamic Scholarly Review.</strong> Not directly dependent on the open madhab decision (Tafsir, not Fiqh), but exegetical passages touching legal verses (ayat al-ahkam) should be flagged where they arise, since those specific explanations may carry the same decision-1 dependency as IS-202/IS-302. The Scholarly Review Committee should confirm the specific passage selections (weeks 2–13) before first delivery.</p>

      <h3>AR-301 — Arabic Grammar II</h3>
      <div class="table-wrap"><table>
      <tbody>
      <tr><td>Department</td><td>Arabic Language</td></tr>
      <tr><td>Program / Pathway</td><td>Advanced Islamic Studies</td></tr>
      <tr><td>Level</td><td>Advanced</td></tr>
      <tr><td>Units / Weekly hours</td><td>3 units — 3 hrs/week</td></tr>
      <tr><td>Expected workload</td><td>3 contact + 4.5 self-study ≈ 7.5 hrs/week (Language self-study ratio ×1.5, §2)</td></tr>
      <tr><td>Prerequisite</td><td>AR-201 (Arabic Grammar I)</td></tr>
      <tr><td>Course type</td><td>Language</td></tr>
      <tr><td>Passing requirement</td><td>60% overall, no component below 40%</td></tr>
      </tbody></table></div>
      <p><strong>Description.</strong> Continues AR-201's grammar sequence into more advanced syntax and morphology, preparing learners for AR-401's classical/source-text reading.</p>
      <p><strong>Objectives.</strong> Extend grammatical competence to the point where learners can parse and produce more complex sentence structures independently.</p>
      <p><strong>Learning Outcomes.</strong> By course end, learners will be able to: (1) <strong>identify</strong> advanced morphological patterns (verb forms II–X, irregular verb classes); (2) <strong>explain</strong> complex syntactic structures (conditional sentences, relative clauses, idafa chains); (3) <strong>apply</strong> these structures correctly in original sentence production; (4) <strong>analyze</strong> a moderately complex unseen sentence to identify its grammatical structure; (5) <strong>produce</strong> short original paragraphs using the term's grammatical structures correctly.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Week</th><th>Topic</th><th>Objectives</th><th>Key Concepts</th><th>Activities</th><th>Readings</th><th>Assessment</th></tr></thead>
      <tbody>
      <tr><td>1–3</td><td>Verb forms II–VI</td><td>Identify and apply these forms</td><td>Derived verb patterns and their typical meanings</td><td>Drill, guided practice</td><td>Core text (pending, decision 43)</td><td>Quiz 1</td></tr>
      <tr><td>4–6</td><td>Verb forms VII–X; irregular verbs</td><td>Identify and apply these forms</td><td>Hollow, defective, and doubled verbs</td><td>Drill, guided practice</td><td>Core text</td><td>Assignment 1</td></tr>
      <tr><td>7</td><td>Idafa chains and complex genitive constructions</td><td>Explain and apply idafa structures</td><td>Multi-noun chains, definiteness rules</td><td>Drill, sentence production</td><td>Core text</td><td>Quiz 2</td></tr>
      <tr><td>8</td><td>Midterm review and examination</td><td>Consolidate weeks 1–7</td><td>—</td><td>Written exam</td><td>—</td><td>Midterm</td></tr>
      <tr><td>9–10</td><td>Conditional sentences</td><td>Explain and apply conditional structures</td><td>Particle-governed conditionals and their moods</td><td>Drill, sentence production</td><td>Core text</td><td>Assignment 2</td></tr>
      <tr><td>11–12</td><td>Relative clauses</td><td>Explain and apply relative clause structures</td><td>Definite/indefinite antecedents, agreement</td><td>Drill, sentence production</td><td>Core text</td><td>Quiz 3</td></tr>
      <tr><td>13</td><td>Unseen-sentence parsing workshop</td><td>Analyze a moderately complex unseen sentence</td><td>Applying the term's structures to new material</td><td>Workshop</td><td>Practice sentence packet</td><td>Assignment 3</td></tr>
      <tr><td>14</td><td>Original paragraph production</td><td>Produce short original paragraphs correctly</td><td>Combining the term's structures in composition</td><td>Supervised writing</td><td>—</td><td>Paragraph submission</td></tr>
      <tr><td>15</td><td>Review and final examination</td><td>Consolidate the full term</td><td>—</td><td>Written exam</td><td>—</td><td>Final</td></tr>
      </tbody></table></div>
      <p><strong>Required Texts.</strong> <strong>Gap:</strong> <em>Arabic Language Foundations</em> (used at AR-101/AR-201) is pitched at foundation level and does not cover Advanced-tier morphology/syntax — no Bookstore text currently serves this course; flagged as decision 43 (§13), distinct from the Advanced Islamic Studies gap (decision 41) since this is a language, not a religious-sciences, text. <strong>Recommended Readings.</strong> None assigned pending that gap. <strong>Teaching Methodology.</strong> Drill-based with increasing sentence-production emphasis — grammar is tested by production, not only recognition, at this tier.</p>
      <p><strong>Assessment.</strong> Core/Language/Research profile: Quizzes 15% / Assignments 20% / Midterm 25% / Final 40%.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>CLO</th><th>Teaching Activity</th><th>Assessment</th><th>Evidence</th></tr></thead>
      <tbody>
      <tr><td>1. Identify morphological patterns</td><td>Weeks 1–6</td><td>Quiz 1, Assignment 1</td><td>Quiz script, submission</td></tr>
      <tr><td>2. Explain complex syntax</td><td>Weeks 7–12</td><td>Quiz 2, Assignment 2, Quiz 3</td><td>Quiz scripts, submission</td></tr>
      <tr><td>3. Apply structures in production</td><td>Weeks 1–14</td><td>Midterm, Paragraph submission</td><td>Exam script, paragraph</td></tr>
      <tr><td>4. Analyze unseen sentences</td><td>Week 13</td><td>Assignment 3</td><td>Submission</td></tr>
      <tr><td>5. Produce original paragraphs</td><td>Week 14</td><td>Paragraph submission, Final</td><td>Paragraph, exam script</td></tr>
      </tbody></table></div>
      <p><strong>Instructor Requirements.</strong> Baseline (§2), plus demonstrated advanced Arabic grammar competence; no religious-content qualification needed. <strong>Islamic Scholarly Review.</strong> Not required — general Arabic language, no dependency on the open manhaj or riwayah decisions.</p>

      <h3>AR-302 — Conversation</h3>
      <div class="table-wrap"><table>
      <tbody>
      <tr><td>Department</td><td>Arabic Language</td></tr>
      <tr><td>Program / Pathway</td><td>Advanced Islamic Studies</td></tr>
      <tr><td>Level</td><td>Advanced</td></tr>
      <tr><td>Units / Weekly hours</td><td>2 units — 2 hrs/week</td></tr>
      <tr><td>Expected workload</td><td>2 contact + 3 self-study = 5 hrs/week (Language self-study ratio ×1.5, §2)</td></tr>
      <tr><td>Prerequisite</td><td>AR-201 (Arabic Grammar I); runs alongside AR-301</td></tr>
      <tr><td>Course type</td><td>Language</td></tr>
      <tr><td>Passing requirement</td><td>60% overall AND minimum 60% on Practical+Final combined (Recitation/Hifz-style practical weighting adapted for a speaking course, §2 — see assessment note below)</td></tr>
      </tbody></table></div>
      <p><strong>Description.</strong> The Academy's first dedicated Arabic-speaking practical course: structured conversational fluency practice, complementing AR-301's grammar with functional spoken competence.</p>
      <p><strong>Objectives.</strong> Bring learners to functional conversational fluency in everyday and topically relevant (Islamic-education-context) spoken Arabic.</p>
      <p><strong>Learning Outcomes.</strong> By course end, learners will be able to: (1) <strong>demonstrate</strong> functional spoken fluency in guided everyday conversation; (2) <strong>apply</strong> AR-301's grammatical structures correctly in spontaneous speech; (3) <strong>describe</strong> familiar topics (daily routine, study, community life) aloud without a script; (4) <strong>interpret</strong> a partner's spoken Arabic in real-time exchange and respond appropriately; (5) <strong>demonstrate</strong> classroom-register conversational Arabic suitable for an Islamic-education setting.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Week</th><th>Topic</th><th>Objectives</th><th>Key Concepts</th><th>Activities</th><th>Readings</th><th>Assessment</th></tr></thead>
      <tbody>
      <tr><td>1</td><td>Diagnostic conversation</td><td>Baseline each learner's current level</td><td>—</td><td>Paired conversation, instructor notes</td><td>—</td><td>Diagnostic (non-graded)</td></tr>
      <tr><td>2–4</td><td>Everyday topics I</td><td>Describe familiar topics aloud</td><td>Daily routine, family, study vocabulary in use</td><td>Paired/group conversation practice</td><td>Instructor-curated prompts</td><td>Quiz 1 (spoken)</td></tr>
      <tr><td>5–7</td><td>Everyday topics II; grammar-in-speech</td><td>Apply AR-301 structures in spontaneous speech</td><td>Verb forms and idafa in live conversation</td><td>Paired conversation, instructor correction</td><td>Instructor-curated prompts</td><td>Assignment 1 (recorded conversation)</td></tr>
      <tr><td>8</td><td>Midterm practical assessment</td><td>Consolidate weeks 1–7</td><td>—</td><td>Individual conversation exam</td><td>—</td><td>Midterm (practical)</td></tr>
      <tr><td>9–10</td><td>Real-time responsiveness</td><td>Interpret a partner's speech and respond appropriately</td><td>Listening comprehension under live exchange</td><td>Unscripted paired dialogue</td><td>—</td><td>Quiz 2</td></tr>
      <tr><td>11–12</td><td>Islamic-education-context register</td><td>Demonstrate classroom-appropriate conversational register</td><td>Vocabulary and register for a teaching/learning setting</td><td>Role-play (e.g. classroom, community interactions)</td><td>Instructor-curated prompts</td><td>Assignment 2</td></tr>
      <tr><td>13–14</td><td>Extended unscripted conversation practice</td><td>Sustain a longer unscripted exchange</td><td>Consolidating fluency across topics</td><td>Group conversation circles</td><td>—</td><td>Assignment 3</td></tr>
      <tr><td>15</td><td>Final practical examination</td><td>Consolidate the full term</td><td>—</td><td>Individual conversation exam</td><td>—</td><td>Final (practical)</td></tr>
      </tbody></table></div>
      <p><strong>Practical Competency Rubric.</strong> Scored on four bands (Not yet competent / Developing / Competent / Mastery) across: fluency and pacing; grammatical accuracy in spontaneous speech; comprehension of a partner's speech; appropriateness of register for context. Practical and Final components are assessed against this rubric by the instructor.</p>
      <p><strong>Required Texts.</strong> <strong>Gap:</strong> conversational practice, no dedicated Bookstore text needed or available — appropriate for a practical-skills course; instructor-curated prompts are the working material, not a placeholder for a missing text. <strong>Recommended Readings.</strong> None. <strong>Teaching Methodology.</strong> Paired and group spoken practice — minimal lecture; the course is the practice.</p>
      <p><strong>Assessment note.</strong> Adapted from the Recitation/Hifz profile's practical emphasis (§2: Quizzes 10% / Assignments 10% / Midterm 20% / Practical 30% / Final 30%) since AR-302, like Recitation/Hifz courses, is assessed mainly through demonstrated live performance rather than written work; this adaptation is noted here rather than silently applied, since AR-302 is catalogued Language, not Recitation/Hifz, in Course Catalogue.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>CLO</th><th>Teaching Activity</th><th>Assessment</th><th>Evidence</th></tr></thead>
      <tbody>
      <tr><td>1. Demonstrate functional fluency</td><td>Weeks 2–7</td><td>Quiz 1, Midterm</td><td>Recordings, instructor scoring</td></tr>
      <tr><td>2. Apply grammar in speech</td><td>Weeks 5–7</td><td>Assignment 1</td><td>Recorded conversation</td></tr>
      <tr><td>3. Describe familiar topics unscripted</td><td>Weeks 2–4, 13–14</td><td>Quiz 1, Assignment 3</td><td>Recordings, instructor notes</td></tr>
      <tr><td>4. Interpret and respond in real time</td><td>Weeks 9–10</td><td>Quiz 2</td><td>Instructor observation record</td></tr>
      <tr><td>5. Demonstrate classroom-register Arabic</td><td>Weeks 11–12</td><td>Assignment 2, Final</td><td>Role-play notes, exam recording</td></tr>
      </tbody></table></div>
      <p><strong>Instructor Requirements.</strong> Baseline (§2), plus native or near-native conversational fluency and experience teaching spoken Arabic specifically (a distinct skill from teaching grammar). <strong>Islamic Scholarly Review.</strong> Not required — general Arabic conversation, no religious-content dependency.</p>

      <h3>IC-301 — Islamic Social Thought</h3>
      <div class="table-wrap"><table>
      <tbody>
      <tr><td>Department</td><td>Islamic Civilization &amp; Society</td></tr>
      <tr><td>Program / Pathway</td><td>Advanced Islamic Studies</td></tr>
      <tr><td>Level</td><td>Advanced</td></tr>
      <tr><td>Units / Weekly hours</td><td>2 units — 2 hrs/week</td></tr>
      <tr><td>Expected workload</td><td>2 contact + 2 self-study = 4 hrs/week</td></tr>
      <tr><td>Prerequisite</td><td>IC-201 (Islamic History &amp; Civilization I)</td></tr>
      <tr><td>Course type</td><td>Core</td></tr>
      <tr><td>Passing requirement</td><td>60% overall, no component below 40%</td></tr>
      </tbody></table></div>
      <p><strong>Description.</strong> The civilizational and social application of Islamic thought — distinct from Islamic Studies' own IS-304 (Islamic Thought), which covers the classical intellectual tradition itself (Department Curriculum Design §1, §9; this course was renamed from "Islamic Thought" to avoid duplicating IS-304). Explores how Islamic thought has shaped social structures, institutions, and civilizational life historically and today.</p>
      <p><strong>Objectives.</strong> Equip learners to explain how Islamic thought has shaped social and civilizational life, connecting IC-201's historical foundation to social and institutional analysis.</p>
      <p><strong>Learning Outcomes.</strong> By course end, learners will be able to: (1) <strong>explain</strong> how core Islamic concepts (e.g. justice, communal responsibility, knowledge) have shaped historical Muslim social institutions; (2) <strong>describe</strong> at least two historical examples of Islamic social/civilizational achievement (e.g. waqf institutions, early public education, hospitals); (3) <strong>compare</strong> historical Islamic social structures with a contemporary analogue; (4) <strong>analyze</strong> a case study of Islamic thought's social application, historical or contemporary; (5) <strong>evaluate</strong> how these historical patterns might inform present-day community life, without overreaching into unsettled contemporary rulings.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Week</th><th>Topic</th><th>Objectives</th><th>Key Concepts</th><th>Activities</th><th>Readings</th><th>Assessment</th></tr></thead>
      <tbody>
      <tr><td>1</td><td>From history (IC-201) to social thought</td><td>Contextualize the course</td><td>Distinguishing this course from IS-304</td><td>Lecture</td><td>Course guide</td><td>—</td></tr>
      <tr><td>2–3</td><td>Foundational social concepts</td><td>Explain how core concepts shaped institutions</td><td>Justice, communal responsibility ('adl, ta'awun), knowledge ('ilm)</td><td>Lecture, discussion</td><td>Core text (pending, decision 41 — grouped with IC-201's gap)</td><td>Quiz 1</td></tr>
      <tr><td>4–6</td><td>Historical social institutions</td><td>Describe historical achievements</td><td>Waqf, early public education, hospitals (bimaristan)</td><td>Lecture, case study</td><td>Core text</td><td>Assignment 1</td></tr>
      <tr><td>7</td><td>Comparing historical and contemporary structures</td><td>Compare a historical structure with a contemporary analogue</td><td>Continuity and change in social institutions</td><td>Discussion</td><td>Instructor-curated readings</td><td>Quiz 2</td></tr>
      <tr><td>8</td><td>Midterm review and examination</td><td>Consolidate weeks 1–7</td><td>—</td><td>Written exam</td><td>—</td><td>Midterm</td></tr>
      <tr><td>9–11</td><td>Case study analysis</td><td>Analyze a case of Islamic thought's social application</td><td>Working through one case in depth (historical or contemporary)</td><td>Case discussion</td><td>Case packet</td><td>Assignment 2</td></tr>
      <tr><td>12–13</td><td>Contemporary community-life discussion</td><td>Evaluate how patterns inform present-day community life</td><td>Careful scoping — descriptive/analytical, not new ruling-making</td><td>Seminar discussion</td><td>Instructor-curated readings</td><td>Quiz 3</td></tr>
      <tr><td>14</td><td>Bridging to IC-401 (Contemporary Muslim Issues)</td><td>Preview the community track's next step</td><td>—</td><td>Lecture, Q&amp;A</td><td>—</td><td>—</td></tr>
      <tr><td>15</td><td>Review and final examination</td><td>Consolidate the full term</td><td>—</td><td>Written exam</td><td>—</td><td>Final</td></tr>
      </tbody></table></div>
      <p><strong>Required Texts.</strong> <strong>Gap:</strong> same underlying Bookstore gap as IC-201 (decision 40) — no Islamic-history/civilization/social-thought text exists in the catalogue; instructor handouts are a placeholder. <strong>Recommended Readings.</strong> None assigned pending that gap. <strong>Teaching Methodology.</strong> Lecture and case-study discussion — social thought is best taught through concrete historical and contemporary examples, not abstract theory alone.</p>
      <p><strong>Assessment.</strong> Core/Language/Research profile: Quizzes 15% / Assignments 20% / Midterm 25% / Final 40%.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>CLO</th><th>Teaching Activity</th><th>Assessment</th><th>Evidence</th></tr></thead>
      <tbody>
      <tr><td>1. Explain concepts shaping institutions</td><td>Weeks 2–3</td><td>Quiz 1</td><td>Quiz script</td></tr>
      <tr><td>2. Describe historical achievements</td><td>Weeks 4–6</td><td>Assignment 1, Midterm</td><td>Submission, exam script</td></tr>
      <tr><td>3. Compare historical/contemporary structures</td><td>Week 7</td><td>Quiz 2</td><td>Quiz script</td></tr>
      <tr><td>4. Analyze a case study</td><td>Weeks 9–11</td><td>Assignment 2</td><td>Submission</td></tr>
      <tr><td>5. Evaluate present-day relevance</td><td>Weeks 12–13</td><td>Quiz 3, Final</td><td>Quiz script, exam script</td></tr>
      </tbody></table></div>
      <p><strong>Instructor Requirements.</strong> Baseline (§2), plus grounding in Islamic social and institutional history. <strong>Islamic Scholarly Review.</strong> The historical/descriptive content is low-risk, but weeks 12–13's contemporary community-life discussion should stay descriptive and analytical rather than issuing new rulings — Scholarly Review Committee should confirm this scoping before first delivery, and any specific ruling questions that arise should be referred out rather than answered in class.</p>

      <h3>RL-301 — Research Preparation</h3>
      <div class="table-wrap"><table>
      <tbody>
      <tr><td>Department</td><td>Research &amp; Learning Skills (unit)</td></tr>
      <tr><td>Program / Pathway</td><td>Advanced Islamic Studies</td></tr>
      <tr><td>Level</td><td>Advanced</td></tr>
      <tr><td>Units / Weekly hours</td><td>2 units — 2 hrs/week</td></tr>
      <tr><td>Expected workload</td><td>2 contact + 4 self-study = 6 hrs/week (Research self-study ratio ×2, §2)</td></tr>
      <tr><td>Prerequisite</td><td>RL-201 (Introductory Analytical Skills)</td></tr>
      <tr><td>Course type</td><td>Research</td></tr>
      <tr><td>Passing requirement</td><td>60% overall, no component below 40%</td></tr>
      </tbody></table></div>
      <p><strong>Description.</strong> Prepares learners for RL-401's capstone research project: source evaluation, citation, structuring a research question, and basic research-writing conventions, applied to Islamic-studies topics.</p>
      <p><strong>Objectives.</strong> Equip learners with the research skills needed to plan and begin a supervised research project.</p>
      <p><strong>Learning Outcomes.</strong> By course end, learners will be able to: (1) <strong>identify</strong> credible primary and secondary sources for an Islamic-studies research topic; (2) <strong>explain</strong> citation conventions and why accurate sourcing matters, especially for religious content; (3) <strong>produce</strong> a well-scoped research question and a short research proposal; (4) <strong>analyze</strong> a sample research paper's structure and argument; (5) <strong>apply</strong> these skills to draft a literature-review outline for the learner's own proposed capstone topic.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Week</th><th>Topic</th><th>Objectives</th><th>Key Concepts</th><th>Activities</th><th>Readings</th><th>Assessment</th></tr></thead>
      <tbody>
      <tr><td>1</td><td>From RL-201 to research preparation</td><td>Contextualize the course</td><td>Analytical skills vs. research skills</td><td>Lecture</td><td>Course guide</td><td>—</td></tr>
      <tr><td>2–3</td><td>Source evaluation</td><td>Identify credible primary and secondary sources</td><td>Primary vs. secondary sources in Islamic studies; source reliability</td><td>Lecture, workshop</td><td>Instructor-curated readings</td><td>Quiz 1</td></tr>
      <tr><td>4–5</td><td>Citation and academic integrity</td><td>Explain citation conventions and their importance</td><td>Citing religious sources accurately; the Academic Integrity policy (§2)</td><td>Lecture, exercises</td><td>Academic Integrity policy (§2)</td><td>Assignment 1</td></tr>
      <tr><td>6–7</td><td>Analyzing a sample research paper</td><td>Analyze structure and argument</td><td>Introduction, literature review, argument, conclusion</td><td>Guided reading, discussion</td><td>Sample paper</td><td>Quiz 2</td></tr>
      <tr><td>8</td><td>Midterm review and examination</td><td>Consolidate weeks 1–7</td><td>—</td><td>Written exam</td><td>—</td><td>Midterm</td></tr>
      <tr><td>9–10</td><td>Scoping a research question</td><td>Produce a well-scoped research question</td><td>Narrow vs. broad questions; feasibility</td><td>Workshop, instructor feedback</td><td>—</td><td>Assignment 2 (draft research question)</td></tr>
      <tr><td>11–13</td><td>Research proposal and literature-review outline</td><td>Produce a proposal; draft a literature-review outline</td><td>Structuring a proposal; organizing sources thematically</td><td>Supervised drafting</td><td>Student-selected sources</td><td>Assignment 3 (proposal + outline)</td></tr>
      <tr><td>14</td><td>Peer feedback on proposals</td><td>Reinforce evaluation skills reciprocally</td><td>—</td><td>Peer-review workshop</td><td>—</td><td>—</td></tr>
      <tr><td>15</td><td>Review and final examination</td><td>Consolidate the full term</td><td>—</td><td>Written exam</td><td>—</td><td>Final</td></tr>
      </tbody></table></div>
      <p><strong>Required Texts.</strong> <strong>Gap:</strong> no general academic-research-skills resource exists in the Bookstore (Islamic-sciences texts only) — a curriculum-design gap, not a scholarly one, of the same kind as RL-101/RL-201's gaps (decisions 39). <strong>Recommended Readings.</strong> None assigned pending selection at ordinary department discretion. <strong>Teaching Methodology.</strong> Workshop-based — the proposal and outline are built incrementally across the term, not written in one sitting.</p>
      <p><strong>Assessment.</strong> Core/Language/Research profile: Quizzes 15% / Assignments 20% / Midterm 25% / Final 40% (the proposal + outline is graded within Assignment 3).</p>
      <div class="table-wrap"><table>
      <thead><tr><th>CLO</th><th>Teaching Activity</th><th>Assessment</th><th>Evidence</th></tr></thead>
      <tbody>
      <tr><td>1. Identify credible sources</td><td>Weeks 2–3</td><td>Quiz 1</td><td>Quiz script</td></tr>
      <tr><td>2. Explain citation conventions</td><td>Weeks 4–5</td><td>Assignment 1</td><td>Submission</td></tr>
      <tr><td>3. Produce a research question/proposal</td><td>Weeks 9–13</td><td>Assignment 2, Assignment 3</td><td>Submissions</td></tr>
      <tr><td>4. Analyze a sample paper's structure</td><td>Weeks 6–7</td><td>Quiz 2, Midterm</td><td>Quiz script, exam script</td></tr>
      <tr><td>5. Draft a literature-review outline</td><td>Weeks 11–13</td><td>Assignment 3, Final</td><td>Submission, exam script</td></tr>
      </tbody></table></div>
      <p><strong>Instructor Requirements.</strong> Baseline (§2), plus experience supervising academic research writing. <strong>Islamic Scholarly Review.</strong> Not required for the research-skills content itself; the learner's own topic selection (weeks 11–13) may touch scholarly-review-dependent subject matter, in which case that dependency belongs to the topic, not this course, and should be flagged case by case by the supervising instructor.</p>

      <h2>8. Diploma: Islamic Studies &amp; Qur'anic Studies</h2>
      <p>Three Islamic Studies courses reaching "comparative"/mastery depth on their respective strands (Curriculum Framework §3), plus two Qur'anic Studies courses, make up this section. IS-403 (Contemporary Islamic Issues) is new at Curriculum Framework and carries this section's main scholarly-review flag, since applied contemporary topics are inherently higher-risk than historical or methodological content. QS-402 (Ulum al-Qur'an) revisits the same subject area as QS-202's <em>Introduction to Quranic Sciences</em> at Diploma depth — reused as a starting text with the depth gap flagged rather than assumed adequate.</p>

      <h3>IS-401 — Comparative Fiqh</h3>
      <div class="table-wrap"><table>
      <tbody>
      <tr><td>Department</td><td>Islamic Studies</td></tr>
      <tr><td>Program / Pathway</td><td>Diploma in Islamic Studies</td></tr>
      <tr><td>Level</td><td>Diploma</td></tr>
      <tr><td>Units / Weekly hours</td><td>3 units — 3 hrs/week</td></tr>
      <tr><td>Expected workload</td><td>3 contact + 3 self-study = 6 hrs/week (Core/Language/Research self-study ratio, §2)</td></tr>
      <tr><td>Prerequisite</td><td>IS-302 (Usul al-Fiqh)</td></tr>
      <tr><td>Course type</td><td>Core</td></tr>
      <tr><td>Passing requirement</td><td>60% overall, no component below 40%</td></tr>
      </tbody></table></div>
      <p><strong>Description.</strong> Reaches "comparative" mastery on the Fiqh strand (Curriculum Framework §3, IS-101 → IS-202 → IS-302 → IS-401): how different schools of Fiqh reason to different conclusions from the same Usul al-Fiqh methodology (IS-302), and how a well-formed learner engages that difference rather than being unsettled by it.</p>
      <p><strong>Objectives.</strong> Equip learners to compare how different schools reach different rulings on selected questions, and to hold that difference within a coherent understanding of legitimate scholarly variation.</p>
      <p><strong>Learning Outcomes.</strong> By course end, learners will be able to: (1) <strong>describe</strong> the major schools of Fiqh and their general methodological character; (2) <strong>compare</strong> at least six selected rulings across two or more schools, tracing each to its Usul basis; (3) <strong>explain</strong> why the Academy's own teaching position is reached, referencing IS-302's methodology; (4) <strong>analyze</strong> a comparative ruling to identify where the schools' reasoning diverges; (5) <strong>evaluate</strong> a claim that comparative Fiqh is "confusing" or "relativistic," using the adab of legitimate ikhtilaf (IS-302, week 11).</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Week</th><th>Topic</th><th>Objectives</th><th>Key Concepts</th><th>Activities</th><th>Readings</th><th>Assessment</th></tr></thead>
      <tbody>
      <tr><td>1</td><td>From methodology (IS-302) to comparison</td><td>Contextualize the course</td><td>What "comparative Fiqh" means and does not mean</td><td>Lecture</td><td>Course guide</td><td>—</td></tr>
      <tr><td>2–4</td><td>Comparative rulings I — worship (ibadat)</td><td>Compare rulings across schools; trace to Usul basis</td><td>Selected worship-related differences</td><td>Lecture, worked comparison</td><td>Core text (pending, decision 44)</td><td>Quiz 1</td></tr>
      <tr><td>5–7</td><td>Comparative rulings II — transactions (mu'amalat)</td><td>Continue comparative analysis</td><td>Selected transaction-related differences</td><td>Lecture, worked comparison</td><td>Core text</td><td>Assignment 1</td></tr>
      <tr><td>8</td><td>Midterm review and examination</td><td>Consolidate weeks 1–7</td><td>—</td><td>Written exam</td><td>—</td><td>Midterm</td></tr>
      <tr><td>9–10</td><td>The Academy's teaching position</td><td>Explain why the Academy reaches its position</td><td>Applying IS-302's methodology to the Academy's own stance</td><td>Lecture, discussion</td><td>Core text</td><td>Quiz 2</td></tr>
      <tr><td>11–12</td><td>Guided divergence analysis</td><td>Analyze where schools' reasoning diverges</td><td>Locating the exact methodological fork</td><td>Workshop</td><td>Case packet</td><td>Assignment 2</td></tr>
      <tr><td>13</td><td>Responding to "confusion"/relativism claims</td><td>Evaluate such claims using the adab of ikhtilaf</td><td>Legitimate difference vs. relativism, distinguished</td><td>Discussion, role-play (responding to a learner's question)</td><td>—</td><td>Assignment 3</td></tr>
      <tr><td>14</td><td>Synthesis and review</td><td>Consolidate the comparative method</td><td>—</td><td>Seminar discussion</td><td>—</td><td>—</td></tr>
      <tr><td>15</td><td>Review and final examination</td><td>Consolidate the full term</td><td>—</td><td>Written exam</td><td>—</td><td>Final</td></tr>
      </tbody></table></div>
      <p><strong>Required Texts.</strong> <strong>Gap:</strong> no comparative-Fiqh text currently exists in the Bookstore catalogue — flagged as decision 44 (§13); instructor-curated comparative materials are a placeholder. <strong>Recommended Readings.</strong> None assigned pending that gap. <strong>Teaching Methodology.</strong> Lecture plus side-by-side worked comparison — the method only lands when learners see two derivations next to each other.</p>
      <p><strong>Assessment.</strong> Core/Language/Research profile: Quizzes 15% / Assignments 20% / Midterm 25% / Final 40%.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>CLO</th><th>Teaching Activity</th><th>Assessment</th><th>Evidence</th></tr></thead>
      <tbody>
      <tr><td>1. Describe major schools</td><td>Week 1</td><td>Midterm</td><td>Exam script</td></tr>
      <tr><td>2. Compare selected rulings</td><td>Weeks 2–7</td><td>Quiz 1, Assignment 1</td><td>Quiz script, submission</td></tr>
      <tr><td>3. Explain the Academy's position</td><td>Weeks 9–10</td><td>Quiz 2</td><td>Quiz script</td></tr>
      <tr><td>4. Analyze divergence</td><td>Weeks 11–12</td><td>Assignment 2</td><td>Submission</td></tr>
      <tr><td>5. Evaluate relativism claims</td><td>Week 13</td><td>Assignment 3, Final</td><td>Submission, exam script</td></tr>
      </tbody></table></div>
      <p><strong>Instructor Requirements.</strong> Baseline (§2), plus demonstrated comparative-Fiqh competence across at least the major schools. <strong>Islamic Scholarly Review.</strong> The single largest scholarly-review dependency of this course is the same as IS-202/IS-302: Institutional Foundation §12 decision 1 determines whether "the Academy's teaching position" (weeks 9–10) means a formally adopted madhab or an evidence-based, non-binding synthesis — this course cannot be finalized until that decision is made, arguably even more directly than IS-202/IS-302 since it is the course that must state and justify the Academy's position explicitly.</p>

      <h3>IS-402 — Hadith Methodology (Takhrij)</h3>
      <div class="table-wrap"><table>
      <tbody>
      <tr><td>Department</td><td>Islamic Studies</td></tr>
      <tr><td>Program / Pathway</td><td>Diploma in Islamic Studies</td></tr>
      <tr><td>Level</td><td>Diploma</td></tr>
      <tr><td>Units / Weekly hours</td><td>3 units — 3 hrs/week</td></tr>
      <tr><td>Expected workload</td><td>3 contact + 6 self-study = 9 hrs/week (Research self-study ratio ×2, §2 — takhrij is source-tracing research work)</td></tr>
      <tr><td>Prerequisite</td><td>IS-303 (Hadith Sciences)</td></tr>
      <tr><td>Course type</td><td>Core</td></tr>
      <tr><td>Passing requirement</td><td>60% overall, no component below 40%</td></tr>
      </tbody></table></div>
      <p><strong>Description.</strong> Develops the Hadith strand (IS-202 → IS-303 → IS-402, Curriculum Framework §3) into takhrij: the practical methodology of tracing a hadith to its sources, cross-referencing collections, and locating existing scholarly gradings — the applied skill built on IS-303's classification theory.</p>
      <p><strong>Objectives.</strong> Equip learners to trace a given hadith through the major collections and locate existing scholarly gradings, applying IS-303's classification criteria to interpret what they find.</p>
      <p><strong>Learning Outcomes.</strong> By course end, learners will be able to: (1) <strong>identify</strong> which major collection(s) a given hadith appears in; (2) <strong>describe</strong> the standard takhrij workflow (source-tracing steps in order); (3) <strong>apply</strong> IS-303's classification criteria to interpret an existing scholarly grading; (4) <strong>analyze</strong> a hadith's different wordings (riwayat) across collections for significant variation; (5) <strong>produce</strong> a short takhrij report on an assigned hadith.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Week</th><th>Topic</th><th>Objectives</th><th>Key Concepts</th><th>Activities</th><th>Readings</th><th>Assessment</th></tr></thead>
      <tbody>
      <tr><td>1</td><td>From classification (IS-303) to takhrij</td><td>Contextualize the course</td><td>What takhrij is; why it matters practically</td><td>Lecture</td><td>Course guide</td><td>—</td></tr>
      <tr><td>2–3</td><td>The major collections as a research toolkit</td><td>Identify which collection(s) contain a hadith</td><td>Indices, chapter arrangements, cross-referencing</td><td>Lecture, guided search practice</td><td>Core text (pending, decision 45)</td><td>Quiz 1</td></tr>
      <tr><td>4–5</td><td>The standard takhrij workflow</td><td>Describe the workflow in order</td><td>Step-by-step source-tracing method</td><td>Lecture, worked example</td><td>Core text</td><td>Assignment 1</td></tr>
      <tr><td>6–7</td><td>Reading existing scholarly gradings</td><td>Apply IS-303 criteria to interpret a grading</td><td>Connecting classification theory to practical takhrij output</td><td>Guided practice</td><td>Core text; cross-reference IS-303</td><td>Quiz 2</td></tr>
      <tr><td>8</td><td>Midterm review and examination</td><td>Consolidate weeks 1–7</td><td>—</td><td>Written exam</td><td>—</td><td>Midterm</td></tr>
      <tr><td>9–10</td><td>Comparing riwayat (wordings) across collections</td><td>Analyze different wordings for significant variation</td><td>Riwayah bi-l-lafz vs. bi-l-ma'na; what counts as "significant"</td><td>Guided comparison workshop</td><td>Sample hadith set</td><td>Assignment 2</td></tr>
      <tr><td>11–13</td><td>Guided takhrij practicum</td><td>Produce a takhrij report on an assigned hadith</td><td>Full workflow applied start to finish</td><td>Supervised practicum</td><td>Assigned hadith</td><td>Takhrij report (Assignment 3)</td></tr>
      <tr><td>14</td><td>Peer review of takhrij reports</td><td>Reinforce evaluation of takhrij work</td><td>—</td><td>Peer-review workshop</td><td>—</td><td>—</td></tr>
      <tr><td>15</td><td>Review and final examination</td><td>Consolidate the full term</td><td>—</td><td>Written exam</td><td>—</td><td>Final</td></tr>
      </tbody></table></div>
      <p><strong>Required Texts.</strong> <strong>Gap:</strong> no dedicated takhrij-methodology text currently exists in the Bookstore catalogue — flagged as decision 45 (§13); instructor-curated materials and the collections themselves (cross-referenced, not individually re-purchased) are a placeholder. <strong>Recommended Readings.</strong> None assigned pending that gap. <strong>Teaching Methodology.</strong> Guided practicum-based — takhrij is a research skill practiced on real hadith, not a lecture topic.</p>
      <p><strong>Assessment.</strong> Core/Language/Research profile: Quizzes 15% / Assignments 20% / Midterm 25% / Final 40% (the takhrij report is graded within Assignment 3).</p>
      <div class="table-wrap"><table>
      <thead><tr><th>CLO</th><th>Teaching Activity</th><th>Assessment</th><th>Evidence</th></tr></thead>
      <tbody>
      <tr><td>1. Identify source collection(s)</td><td>Weeks 2–3</td><td>Quiz 1</td><td>Quiz script</td></tr>
      <tr><td>2. Describe the takhrij workflow</td><td>Weeks 4–5</td><td>Assignment 1, Midterm</td><td>Submission, exam script</td></tr>
      <tr><td>3. Apply classification to gradings</td><td>Weeks 6–7</td><td>Quiz 2</td><td>Quiz script</td></tr>
      <tr><td>4. Analyze riwayat variation</td><td>Weeks 9–10</td><td>Assignment 2</td><td>Submission</td></tr>
      <tr><td>5. Produce a takhrij report</td><td>Weeks 11–13</td><td>Assignment 3, Final</td><td>Report manuscript, exam script</td></tr>
      </tbody></table></div>
      <p><strong>Instructor Requirements.</strong> Baseline (§2), plus demonstrated takhrij competence (typically evidenced by relevant advanced study or supervised practice). <strong>Islamic Scholarly Review.</strong> Not dependent on the open madhab decision — takhrij is source-tracing methodology, consensus-level in its steps. The assigned hadith set (weeks 11–13) should be selected by the Scholarly Review Committee or a qualified instructor from hadith with settled classifications, avoiding contested individual gradings at this practicum depth (same discipline as IS-303's case-set selection).</p>

      <h3>IS-403 — Contemporary Islamic Issues</h3>
      <div class="table-wrap"><table>
      <tbody>
      <tr><td>Department</td><td>Islamic Studies</td></tr>
      <tr><td>Program / Pathway</td><td>Diploma in Islamic Studies</td></tr>
      <tr><td>Level</td><td>Diploma</td></tr>
      <tr><td>Units / Weekly hours</td><td>2 units — 2 hrs/week</td></tr>
      <tr><td>Expected workload</td><td>2 contact + 2 self-study = 4 hrs/week</td></tr>
      <tr><td>Prerequisite</td><td>IS-401 (Comparative Fiqh)</td></tr>
      <tr><td>Course type</td><td>Core</td></tr>
      <tr><td>Passing requirement</td><td>60% overall, no component below 40%</td></tr>
      </tbody></table></div>
      <p><strong>Description.</strong> Applies the Diploma-tier's accumulated Aqeedah, Fiqh, and methodological grounding to contemporary questions Muslims actually face — new at Curriculum Framework, and the highest scholarly-risk course in this section, since it engages live, sometimes unsettled contemporary issues rather than historical or purely methodological content.</p>
      <p><strong>Objectives.</strong> Equip learners to approach contemporary Islamic issues methodically — distinguishing settled positions from areas of legitimate ongoing scholarly discussion — rather than either avoiding such questions or answering them without adequate grounding.</p>
      <p><strong>Learning Outcomes.</strong> By course end, learners will be able to: (1) <strong>identify</strong> which category a contemporary question falls into (settled by clear text/consensus; area of legitimate scholarly difference; genuinely unsettled/emerging); (2) <strong>explain</strong> the relevant methodological tools (IS-302, IS-401) as applied to a contemporary case; (3) <strong>describe</strong> at least four contemporary issue areas at a survey level (selected per current Scholarly Review Committee guidance, §13); (4) <strong>analyze</strong> a contemporary case study for which category it falls into and why; (5) <strong>demonstrate</strong> appropriate referral practice — recognizing when a question exceeds the learner's or even the course's scope and must go to qualified scholarly authority.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Week</th><th>Topic</th><th>Objectives</th><th>Key Concepts</th><th>Activities</th><th>Readings</th><th>Assessment</th></tr></thead>
      <tbody>
      <tr><td>1</td><td>A framework for contemporary questions</td><td>Contextualize the course</td><td>Settled / legitimately disputed / genuinely unsettled, as categories</td><td>Lecture</td><td>Course guide</td><td>—</td></tr>
      <tr><td>2–3</td><td>Applying methodology to contemporary cases</td><td>Explain IS-302/IS-401 tools applied to a live case</td><td>Worked example using settled methodology</td><td>Lecture, worked example</td><td>Instructor-curated readings (Scholarly-Review-approved)</td><td>Quiz 1</td></tr>
      <tr><td>4–7</td><td>Survey of issue areas I–II</td><td>Describe selected contemporary issue areas</td><td>Survey-level treatment only; specific areas set per current Committee guidance</td><td>Lecture, discussion</td><td>Instructor-curated readings (Scholarly-Review-approved)</td><td>Assignment 1</td></tr>
      <tr><td>8</td><td>Midterm review and examination</td><td>Consolidate weeks 1–7</td><td>—</td><td>Written exam</td><td>—</td><td>Midterm</td></tr>
      <tr><td>9–11</td><td>Case study analysis</td><td>Analyze a case for its category</td><td>Applying the three-category framework in practice</td><td>Case discussion</td><td>Case packet (Scholarly-Review-approved)</td><td>Quiz 2</td></tr>
      <tr><td>12–13</td><td>Referral practice</td><td>Demonstrate appropriate referral for out-of-scope questions</td><td>Recognizing limits; who to refer to and how</td><td>Role-play (responding to a real-world question)</td><td>—</td><td>Assignment 2</td></tr>
      <tr><td>14</td><td>Synthesis discussion</td><td>Consolidate the framework</td><td>—</td><td>Seminar discussion</td><td>—</td><td>—</td></tr>
      <tr><td>15</td><td>Review and final examination</td><td>Consolidate the full term</td><td>—</td><td>Written exam</td><td>—</td><td>Final</td></tr>
      </tbody></table></div>
      <p><strong>Required Texts.</strong> <strong>Gap:</strong> no contemporary-issues text currently exists in the Bookstore catalogue, and any such text would itself need Scholarly Review Committee vetting before adoption — flagged as decision 46 (§13), distinct from an ordinary sourcing gap because of the content sensitivity involved. <strong>Recommended Readings.</strong> None assigned pending that vetting. <strong>Teaching Methodology.</strong> Framework-first lecture plus case discussion — the categorization skill (settled/disputed/unsettled) is taught before any specific case is examined.</p>
      <p><strong>Assessment.</strong> Core/Language/Research profile: Quizzes 15% / Assignments 20% / Midterm 25% / Final 40%.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>CLO</th><th>Teaching Activity</th><th>Assessment</th><th>Evidence</th></tr></thead>
      <tbody>
      <tr><td>1. Identify a question's category</td><td>Week 1, Weeks 9–11</td><td>Quiz 2</td><td>Quiz script</td></tr>
      <tr><td>2. Explain methodology applied</td><td>Weeks 2–3</td><td>Quiz 1, Midterm</td><td>Quiz script, exam script</td></tr>
      <tr><td>3. Describe issue areas</td><td>Weeks 4–7</td><td>Assignment 1</td><td>Submission</td></tr>
      <tr><td>4. Analyze case studies</td><td>Weeks 9–11</td><td>Quiz 2, Final</td><td>Quiz script, exam script</td></tr>
      <tr><td>5. Demonstrate referral practice</td><td>Weeks 12–13</td><td>Assignment 2</td><td>Submission, instructor observation record</td></tr>
      </tbody></table></div>
      <p><strong>Instructor Requirements.</strong> Baseline (§2), plus explicit Scholarly Review Committee clearance to teach this specific course — a higher instructor-approval bar than any other course in Institutional Foundation through Course Specifications so far, given the content sensitivity. <strong>Islamic Scholarly Review.</strong> The single highest-scrutiny course identified across all of Course Specifications: every issue area taught (weeks 4–7), every case used (weeks 9–11), and every instructor-curated reading must be Committee-approved before first delivery, not merely reviewed after the fact. This entire course is flagged as decision 46 (§13) and should not run until the Committee has approved its specific syllabus content, not just this framework-level specification.</p>

      <h3>QS-401 — Tafsir II</h3>
      <div class="table-wrap"><table>
      <tbody>
      <tr><td>Department</td><td>Qur'anic Studies</td></tr>
      <tr><td>Program / Pathway</td><td>Diploma in Islamic Studies</td></tr>
      <tr><td>Level</td><td>Diploma</td></tr>
      <tr><td>Units / Weekly hours</td><td>3 units — 3 hrs/week</td></tr>
      <tr><td>Expected workload</td><td>3 contact + 4.5 self-study ≈ 7.5 hrs/week (text-intensive ratio ×1.5, as QS-302, §2)</td></tr>
      <tr><td>Prerequisite</td><td>QS-302 (Tafsir I)</td></tr>
      <tr><td>Course type</td><td>Core</td></tr>
      <tr><td>Passing requirement</td><td>60% overall, no component below 40%</td></tr>
      </tbody></table></div>
      <p><strong>Description.</strong> Completes the Tafsir strand (QS-302 → QS-401, mastered at Diploma per Curriculum Framework §3): continued exegetical study of further selected surahs, with learners taking greater independent responsibility for reading and summarizing the text.</p>
      <p><strong>Objectives.</strong> Bring learners to independent competence reading and summarizing classical Tafsir on previously unseen passages.</p>
      <p><strong>Learning Outcomes.</strong> By course end, learners will be able to: (1) <strong>explain</strong> the exegetical reasoning for a further set of selected passages, building on QS-302; (2) <strong>compare</strong> differing classical explanations across a wider range of verses than QS-302 covered; (3) <strong>interpret</strong> an unseen passage independently, with reduced instructor guidance compared to QS-302; (4) <strong>analyze</strong> how a passage's exegesis connects to broader Qur'anic themes across surahs; (5) <strong>produce</strong> an independent written exegetical essay on an assigned passage, at greater depth than QS-302's summary.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Week</th><th>Topic</th><th>Objectives</th><th>Key Concepts</th><th>Activities</th><th>Readings</th><th>Assessment</th></tr></thead>
      <tbody>
      <tr><td>1</td><td>From QS-302 to independent reading</td><td>Contextualize the course</td><td>Raising the independence bar</td><td>Lecture</td><td><em>Tafsir Ibn Kathir</em> (Academy Bookstore), continuing</td><td>—</td></tr>
      <tr><td>2–4</td><td>Selected passage IV</td><td>Explain exegetical reasoning with reduced guidance</td><td>New surah section</td><td>Guided-to-independent reading</td><td>Tafsir Ibn Kathir, assigned sections</td><td>Quiz 1</td></tr>
      <tr><td>5–7</td><td>Selected passage V; cross-surah thematic links</td><td>Analyze connections to broader Qur'anic themes</td><td>Thematic coherence across the Qur'an</td><td>Guided reading, discussion</td><td>Tafsir Ibn Kathir, assigned sections</td><td>Assignment 1</td></tr>
      <tr><td>8</td><td>Midterm review and examination</td><td>Consolidate weeks 1–7</td><td>—</td><td>Written exam</td><td>—</td><td>Midterm</td></tr>
      <tr><td>9–11</td><td>Independent unseen-passage interpretation</td><td>Interpret unseen passages with minimal guidance</td><td>Applying the full method independently</td><td>Independent work with periodic check-ins</td><td>Instructor-assigned unseen passages</td><td>Quiz 2</td></tr>
      <tr><td>12–14</td><td>Exegetical essay</td><td>Produce an independent written essay</td><td>Depth and independence beyond QS-302's summary</td><td>Supervised independent writing</td><td>—</td><td>Exegetical essay (Assignment 2)</td></tr>
      <tr><td>15</td><td>Review and final examination</td><td>Consolidate the full term</td><td>—</td><td>Written exam</td><td>—</td><td>Final</td></tr>
      </tbody></table></div>
      <p><strong>Required Texts.</strong> <em>Tafsir Ibn Kathir</em> (Academy Bookstore) — continuing from QS-302, a direct, confirmed match. <strong>Recommended Readings.</strong> None beyond the required text. <strong>Teaching Methodology.</strong> Progressively independent close reading — instructor support tapers deliberately across the term.</p>
      <p><strong>Assessment.</strong> Core/Language/Research profile: Quizzes 15% / Assignments 20% / Midterm 25% / Final 40% (the exegetical essay is graded within Assignment 2 and reflected in the Final).</p>
      <div class="table-wrap"><table>
      <thead><tr><th>CLO</th><th>Teaching Activity</th><th>Assessment</th><th>Evidence</th></tr></thead>
      <tbody>
      <tr><td>1. Explain exegetical reasoning</td><td>Weeks 2–4</td><td>Quiz 1</td><td>Quiz script</td></tr>
      <tr><td>2. Compare differing explanations</td><td>Weeks 5–7</td><td>Assignment 1, Midterm</td><td>Submission, exam script</td></tr>
      <tr><td>3. Interpret unseen passages independently</td><td>Weeks 9–11</td><td>Quiz 2</td><td>Quiz script</td></tr>
      <tr><td>4. Analyze cross-surah themes</td><td>Weeks 5–7</td><td>Assignment 1</td><td>Submission</td></tr>
      <tr><td>5. Produce an exegetical essay</td><td>Weeks 12–14</td><td>Assignment 2, Final</td><td>Essay manuscript, exam script</td></tr>
      </tbody></table></div>
      <p><strong>Instructor Requirements.</strong> Baseline (§2), plus the same classical-Tafsir-methodology command as QS-302, with demonstrated ability to supervise increasingly independent student work. <strong>Islamic Scholarly Review.</strong> Same status as QS-302: not directly dependent on the open madhab decision, but ayat al-ahkam (legal verses) encountered in the newly selected passages should be flagged where they arise, and passage selections (weeks 2–14) should be confirmed by the Scholarly Review Committee before first delivery.</p>

      <h3>QS-402 — Ulum al-Qur'an</h3>
      <div class="table-wrap"><table>
      <tbody>
      <tr><td>Department</td><td>Qur'anic Studies</td></tr>
      <tr><td>Program / Pathway</td><td>Diploma in Islamic Studies</td></tr>
      <tr><td>Level</td><td>Diploma</td></tr>
      <tr><td>Units / Weekly hours</td><td>2 units — 2 hrs/week</td></tr>
      <tr><td>Expected workload</td><td>2 contact + 3 self-study = 5 hrs/week (text-intensive ratio ×1.5, §2)</td></tr>
      <tr><td>Prerequisite</td><td>QS-302 (Tafsir I)</td></tr>
      <tr><td>Course type</td><td>Core</td></tr>
      <tr><td>Passing requirement</td><td>60% overall, no component below 40%</td></tr>
      </tbody></table></div>
      <p><strong>Description.</strong> New at Curriculum Framework: the sciences of the Qur'an (Ulum al-Qur'an) at Diploma depth — revelation circumstances (asbab an-nuzul), compilation history, script and recitation traditions, abrogation (naskh), and the inimitability (i'jaz) of the Qur'an — the "sciences behind the text" that QS-202's introductory <em>Introduction to Quranic Sciences</em> only surveyed.</p>
      <p><strong>Objectives.</strong> Equip learners with a Diploma-depth understanding of the scholarly disciplines surrounding the Qur'an's revelation, compilation, and transmission.</p>
      <p><strong>Learning Outcomes.</strong> By course end, learners will be able to: (1) <strong>explain</strong> asbab an-nuzul (occasions of revelation) and its role in interpretation; (2) <strong>describe</strong> the compilation history of the Qur'an, from revelation to the standardized mushaf; (3) <strong>identify</strong> the classical riwayat/qira'at traditions at a survey level; (4) <strong>explain</strong> the concept of naskh (abrogation) and its scope as understood within the confirmed manhaj; (5) <strong>analyze</strong> the classical arguments for the Qur'an's i'jaz (inimitability).</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Week</th><th>Topic</th><th>Objectives</th><th>Key Concepts</th><th>Activities</th><th>Readings</th><th>Assessment</th></tr></thead>
      <tbody>
      <tr><td>1</td><td>From QS-202's survey to Diploma depth</td><td>Contextualize the course</td><td>What this course adds beyond QS-202</td><td>Lecture</td><td><em>Introduction to Quranic Sciences</em> (Academy Bookstore), continuing at greater depth</td><td>—</td></tr>
      <tr><td>2–3</td><td>Asbab an-nuzul</td><td>Explain occasions of revelation and their interpretive role</td><td>Types of asbab; how they inform meaning</td><td>Lecture, case examples</td><td>Core text</td><td>Quiz 1</td></tr>
      <tr><td>4–6</td><td>Compilation history</td><td>Describe the path from revelation to standardized mushaf</td><td>Oral preservation, written compilation, Uthmanic standardization</td><td>Lecture, discussion</td><td>Core text</td><td>Assignment 1</td></tr>
      <tr><td>7</td><td>Riwayat and qira'at, surveyed</td><td>Identify the classical traditions at survey level</td><td>Plurality of authentic transmissions; the riwayah/qira'ah decision's relevance (decision 37)</td><td>Lecture</td><td>Core text</td><td>Quiz 2</td></tr>
      <tr><td>8</td><td>Midterm review and examination</td><td>Consolidate weeks 1–7</td><td>—</td><td>Written exam</td><td>—</td><td>Midterm</td></tr>
      <tr><td>9–11</td><td>Naskh (abrogation)</td><td>Explain the concept and its scope within the confirmed manhaj</td><td>Types of naskh; scholarly caution around over-applying it</td><td>Lecture, discussion</td><td>Instructor-curated readings</td><td>Assignment 2</td></tr>
      <tr><td>12–14</td><td>I'jaz al-Qur'an</td><td>Analyze classical arguments for inimitability</td><td>Linguistic, rhetorical, and content-based arguments</td><td>Lecture, discussion, source analysis</td><td>Instructor-curated readings</td><td>Quiz 3</td></tr>
      <tr><td>15</td><td>Review and final examination</td><td>Consolidate the full term</td><td>—</td><td>Written exam</td><td>—</td><td>Final</td></tr>
      </tbody></table></div>
      <p><strong>Required Texts.</strong> <em>Introduction to Quranic Sciences</em> (Academy Bookstore), continuing from QS-202. <strong>Gap:</strong> the same title served QS-202 at introductory depth; whether it also covers naskh and i'jaz at the depth this Diploma-tier course needs, or whether a second, deeper text is required, should be confirmed by the Head of Department — flagged as decision 47 (§13), a depth-adequacy question rather than a total-absence gap. <strong>Recommended Readings.</strong> None assigned pending that confirmation. <strong>Teaching Methodology.</strong> Lecture and source-based discussion.</p>
      <p><strong>Assessment.</strong> Core/Language/Research profile: Quizzes 15% / Assignments 20% / Midterm 25% / Final 40%.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>CLO</th><th>Teaching Activity</th><th>Assessment</th><th>Evidence</th></tr></thead>
      <tbody>
      <tr><td>1. Explain asbab an-nuzul</td><td>Weeks 2–3</td><td>Quiz 1</td><td>Quiz script</td></tr>
      <tr><td>2. Describe compilation history</td><td>Weeks 4–6</td><td>Assignment 1, Midterm</td><td>Submission, exam script</td></tr>
      <tr><td>3. Identify riwayat/qira'at traditions</td><td>Week 7</td><td>Quiz 2</td><td>Quiz script</td></tr>
      <tr><td>4. Explain naskh</td><td>Weeks 9–11</td><td>Assignment 2</td><td>Submission</td></tr>
      <tr><td>5. Analyze i'jaz arguments</td><td>Weeks 12–14</td><td>Quiz 3, Final</td><td>Quiz script, exam script</td></tr>
      </tbody></table></div>
      <p><strong>Instructor Requirements.</strong> Baseline (§2), plus demonstrated grounding in Ulum al-Qur'an as its own discipline. <strong>Islamic Scholarly Review.</strong> Week 7 (riwayat/qira'at survey) directly touches the open riwayah/qira'ah choice (decision 37) — the survey can proceed acknowledging plurality, but the Academy's own practiced riwayah, taught elsewhere (QS-101/102/201/301), cannot be named here until that decision is made. Naskh (weeks 9–11) should be scoped conservatively and reviewed by the Scholarly Review Committee, since over-broad naskh claims are a common source of misunderstanding.</p>

      <h2>9. Diploma: Arabic &amp; Research</h2>
      <p>The three courses that complete the Grammar/Arabic strand at Diploma ("source reading" mastery, Curriculum Framework §3) and the Research strand's capstone. RL-401 (Capstone Research Project) is assessed differently from a normal lecture course: its weighting keeps the Core/Language/Research profile's numeric split (§2) but maps each component to a project milestone rather than a quiz or exam, the same kind of justified, per-course adaptation used for RL-101's intensive format and AR-302's practical weighting — not a change to the institution-wide framework itself.</p>

      <h3>AR-401 — Classical Arabic &amp; Source Reading</h3>
      <div class="table-wrap"><table>
      <tbody>
      <tr><td>Department</td><td>Arabic Language</td></tr>
      <tr><td>Program / Pathway</td><td>Diploma in Islamic Studies</td></tr>
      <tr><td>Level</td><td>Diploma</td></tr>
      <tr><td>Units / Weekly hours</td><td>3 units — 3 hrs/week</td></tr>
      <tr><td>Expected workload</td><td>3 contact + 4.5 self-study ≈ 7.5 hrs/week (Language self-study ratio ×1.5, §2)</td></tr>
      <tr><td>Prerequisite</td><td>AR-301 (Arabic Grammar II)</td></tr>
      <tr><td>Course type</td><td>Language</td></tr>
      <tr><td>Passing requirement</td><td>60% overall, no component below 40%</td></tr>
      </tbody></table></div>
      <p><strong>Description.</strong> Reaches "source reading" mastery on the Grammar strand (AR-101 → AR-201 → AR-301 → AR-401, Curriculum Framework §3): reading original, unvocalized or lightly vocalized classical Arabic texts directly — the applied purpose of the whole grammar sequence — rather than studying grammar in the abstract.</p>
      <p><strong>Objectives.</strong> Bring learners to functional competence reading original classical Arabic source texts with dictionary support, connecting AR-301's grammar to real primary-source material.</p>
      <p><strong>Learning Outcomes.</strong> By course end, learners will be able to: (1) <strong>identify</strong> grammatical structures within an unvocalized or lightly vocalized classical text; (2) <strong>apply</strong> AR-301's morphology and syntax to parse an original source passage; (3) <strong>interpret</strong> the meaning of a classical passage using grammatical analysis plus dictionary support; (4) <strong>analyze</strong> a passage's structure to identify where classical usage differs from modern standard Arabic; (5) <strong>produce</strong> an accurate translation of an assigned classical passage.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Week</th><th>Topic</th><th>Objectives</th><th>Key Concepts</th><th>Activities</th><th>Readings</th><th>Assessment</th></tr></thead>
      <tbody>
      <tr><td>1</td><td>From grammar study to source reading</td><td>Contextualize the course</td><td>Reading unvocalized text; dictionary use strategy</td><td>Lecture, orientation</td><td>Course guide</td><td>—</td></tr>
      <tr><td>2–4</td><td>Guided reading I — narrative source excerpts</td><td>Identify structures; apply grammar to parse</td><td>Sirah/history-style narrative Arabic</td><td>Guided reading, dictionary practice</td><td>Classical excerpts (pending, decision 48)</td><td>Quiz 1</td></tr>
      <tr><td>5–7</td><td>Guided reading II — religious-text excerpts</td><td>Interpret meaning using grammar plus dictionary</td><td>Formal/religious register Arabic</td><td>Guided reading, discussion</td><td>Classical excerpts</td><td>Assignment 1</td></tr>
      <tr><td>8</td><td>Midterm review and examination</td><td>Consolidate weeks 1–7</td><td>—</td><td>Written exam (translation-based)</td><td>—</td><td>Midterm</td></tr>
      <tr><td>9–11</td><td>Classical vs. modern usage</td><td>Analyze where classical usage diverges from MSA</td><td>Archaic vocabulary, structures rare in modern use</td><td>Comparative reading, discussion</td><td>Classical and modern excerpt pairs</td><td>Assignment 2</td></tr>
      <tr><td>12–14</td><td>Independent translation practicum</td><td>Produce an accurate translation of an assigned passage</td><td>Full workflow: parse, interpret, render</td><td>Supervised independent work</td><td>Assigned classical passage</td><td>Translation project (Assignment 3)</td></tr>
      <tr><td>15</td><td>Review and final examination</td><td>Consolidate the full term</td><td>—</td><td>Written exam (translation-based)</td><td>—</td><td>Final</td></tr>
      </tbody></table></div>
      <p><strong>Required Texts.</strong> <strong>Gap:</strong> the Bookstore's Arabic-language religious texts are English-facing materials; no collection of original, unvocalized classical Arabic source excerpts currently exists in the catalogue for this specific purpose — flagged as decision 48 (§13); instructor-compiled excerpts are a placeholder. <strong>Recommended Readings.</strong> None assigned pending that gap. <strong>Teaching Methodology.</strong> Guided close reading with dictionary work — the skill is built passage by passage, not through grammar drills alone at this stage.</p>
      <p><strong>Assessment.</strong> Core/Language/Research profile: Quizzes 15% / Assignments 20% / Midterm 25% / Final 40%.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>CLO</th><th>Teaching Activity</th><th>Assessment</th><th>Evidence</th></tr></thead>
      <tbody>
      <tr><td>1. Identify grammatical structures</td><td>Weeks 2–4</td><td>Quiz 1</td><td>Quiz script</td></tr>
      <tr><td>2. Apply grammar to parse text</td><td>Weeks 2–7</td><td>Assignment 1, Midterm</td><td>Submission, exam script</td></tr>
      <tr><td>3. Interpret classical passages</td><td>Weeks 5–7</td><td>Assignment 1</td><td>Submission</td></tr>
      <tr><td>4. Analyze classical vs. modern usage</td><td>Weeks 9–11</td><td>Assignment 2</td><td>Submission</td></tr>
      <tr><td>5. Produce an accurate translation</td><td>Weeks 12–14</td><td>Assignment 3, Final</td><td>Translation manuscript, exam script</td></tr>
      </tbody></table></div>
      <p><strong>Instructor Requirements.</strong> Baseline (§2), plus demonstrated fluency reading unvocalized classical Arabic across religious and historical registers. <strong>Islamic Scholarly Review.</strong> Not required for the language-reading skill itself; where excerpts are drawn from religious texts touching ayat al-ahkam or fiqh content, the same case-by-case flagging used elsewhere (e.g. QS-401) applies — the language instructor is not expected to adjudicate the content, only to select excerpts the Scholarly Review Committee has cleared for classroom use.</p>

      <h3>AR-402 — Writing</h3>
      <div class="table-wrap"><table>
      <tbody>
      <tr><td>Department</td><td>Arabic Language</td></tr>
      <tr><td>Program / Pathway</td><td>Diploma in Islamic Studies</td></tr>
      <tr><td>Level</td><td>Diploma</td></tr>
      <tr><td>Units / Weekly hours</td><td>2 units — 2 hrs/week</td></tr>
      <tr><td>Expected workload</td><td>2 contact + 3 self-study = 5 hrs/week (Language self-study ratio ×1.5, §2)</td></tr>
      <tr><td>Prerequisite</td><td>AR-401 (Classical Arabic &amp; Source Reading)</td></tr>
      <tr><td>Course type</td><td>Language</td></tr>
      <tr><td>Passing requirement</td><td>60% overall, no component below 40%</td></tr>
      </tbody></table></div>
      <p><strong>Description.</strong> New at Curriculum Framework: the Arabic-language sequence's production counterpart to AR-302's speaking and AR-401's reading — structured composition practice, from correct sentence-level writing to short original passages.</p>
      <p><strong>Objectives.</strong> Bring learners to functional competence composing correct, coherent original Arabic text.</p>
      <p><strong>Learning Outcomes.</strong> By course end, learners will be able to: (1) <strong>apply</strong> correct grammar and morphology in original written sentences; (2) <strong>produce</strong> a coherent short paragraph on a familiar topic; (3) <strong>describe</strong> a given topic in writing using appropriate vocabulary and register; (4) <strong>analyze</strong> a peer's written work for grammatical accuracy and coherence; (5) <strong>produce</strong> a polished short composition as a final portfolio piece.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Week</th><th>Topic</th><th>Objectives</th><th>Key Concepts</th><th>Activities</th><th>Readings</th><th>Assessment</th></tr></thead>
      <tbody>
      <tr><td>1</td><td>From reading (AR-401) to writing</td><td>Contextualize the course</td><td>Passive vs. productive competence</td><td>Lecture</td><td>Course guide</td><td>—</td></tr>
      <tr><td>2–4</td><td>Sentence-level accuracy</td><td>Apply correct grammar in original sentences</td><td>Common learner-error patterns, addressed directly</td><td>Guided writing drills</td><td>Instructor-curated exercises</td><td>Quiz 1</td></tr>
      <tr><td>5–7</td><td>Paragraph coherence</td><td>Produce a coherent short paragraph</td><td>Topic sentences, connectors, structure</td><td>Guided writing, peer feedback</td><td>Instructor-curated exercises</td><td>Assignment 1 (paragraph)</td></tr>
      <tr><td>8</td><td>Midterm review and examination</td><td>Consolidate weeks 1–7</td><td>—</td><td>Written exam (composition-based)</td><td>—</td><td>Midterm</td></tr>
      <tr><td>9–10</td><td>Descriptive writing</td><td>Describe a topic using appropriate vocabulary/register</td><td>Register awareness in written Arabic</td><td>Guided writing</td><td>Instructor-curated prompts</td><td>Assignment 2</td></tr>
      <tr><td>11–12</td><td>Peer review practice</td><td>Analyze a peer's writing for accuracy and coherence</td><td>Applying evaluation criteria to others' work</td><td>Peer-review workshop</td><td>Peer drafts</td><td>Quiz 2</td></tr>
      <tr><td>13–14</td><td>Final portfolio composition</td><td>Produce a polished final composition</td><td>Drafting, revising, polishing</td><td>Supervised writing and revision</td><td>—</td><td>Portfolio piece (Assignment 3)</td></tr>
      <tr><td>15</td><td>Review and final examination</td><td>Consolidate the full term</td><td>—</td><td>Written exam (composition-based)</td><td>—</td><td>Final</td></tr>
      </tbody></table></div>
      <p><strong>Required Texts.</strong> <strong>Gap:</strong> no dedicated Arabic-composition text currently exists in the Bookstore catalogue — a curriculum-design gap similar in kind to AR-302's, appropriate for a practical-skills course; instructor-curated exercises are the working material. <strong>Recommended Readings.</strong> None. <strong>Teaching Methodology.</strong> Guided writing with iterative feedback — drafts are revised, not graded once and discarded.</p>
      <p><strong>Assessment.</strong> Core/Language/Research profile: Quizzes 15% / Assignments 20% / Midterm 25% / Final 40% (the final portfolio piece is graded within Assignment 3 and reflected in the Final).</p>
      <div class="table-wrap"><table>
      <thead><tr><th>CLO</th><th>Teaching Activity</th><th>Assessment</th><th>Evidence</th></tr></thead>
      <tbody>
      <tr><td>1. Apply grammar in original sentences</td><td>Weeks 2–4</td><td>Quiz 1</td><td>Quiz script</td></tr>
      <tr><td>2. Produce a coherent paragraph</td><td>Weeks 5–7</td><td>Assignment 1, Midterm</td><td>Submission, exam script</td></tr>
      <tr><td>3. Describe a topic in writing</td><td>Weeks 9–10</td><td>Assignment 2</td><td>Submission</td></tr>
      <tr><td>4. Analyze a peer's writing</td><td>Weeks 11–12</td><td>Quiz 2</td><td>Peer-review notes</td></tr>
      <tr><td>5. Produce a polished final composition</td><td>Weeks 13–14</td><td>Assignment 3, Final</td><td>Portfolio piece, exam script</td></tr>
      </tbody></table></div>
      <p><strong>Instructor Requirements.</strong> Baseline (§2), plus demonstrated Arabic composition/writing-instruction experience — a distinct skill from teaching grammar or conversation. <strong>Islamic Scholarly Review.</strong> Not required — general Arabic writing practice, no religious-content dependency.</p>

      <h3>RL-401 — Capstone Research Project</h3>
      <div class="table-wrap"><table>
      <tbody>
      <tr><td>Department</td><td>Research &amp; Learning Skills (unit)</td></tr>
      <tr><td>Program / Pathway</td><td>Diploma in Islamic Studies</td></tr>
      <tr><td>Level</td><td>Diploma</td></tr>
      <tr><td>Units / Weekly hours</td><td>3 units — 3 hrs/week (supervised research time, not lecture)</td></tr>
      <tr><td>Expected workload</td><td>3 contact + 6 self-study = 9 hrs/week (Research self-study ratio ×2, §2)</td></tr>
      <tr><td>Prerequisite</td><td>RL-301 (Research Preparation)</td></tr>
      <tr><td>Course type</td><td>Core (research requirement)</td></tr>
      <tr><td>Passing requirement</td><td>60% overall, no component below 40%</td></tr>
      </tbody></table></div>
      <p><strong>Description.</strong> The Diploma's capstone: a supervised independent research project on an Islamic-studies topic of the learner's choosing (building on RL-301's proposal work), from finalized proposal through a completed written project and final presentation/defense.</p>
      <p><strong>Objectives.</strong> Bring learners to independent completion of a full research project: refining a proposal, conducting the research, and producing and defending a finished piece of work.</p>
      <p><strong>Learning Outcomes.</strong> By course end, learners will be able to: (1) <strong>produce</strong> a finalized research proposal building on RL-301's draft; (2) <strong>apply</strong> RL-301's source-evaluation and citation skills across a sustained project; (3) <strong>analyze</strong> and synthesize multiple sources into a coherent argument; (4) <strong>produce</strong> a complete, properly cited written research project; (5) <strong>demonstrate</strong> the project's findings and reasoning in a final oral presentation, responding to questions.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Week</th><th>Topic</th><th>Objectives</th><th>Key Concepts</th><th>Activities</th><th>Readings</th><th>Assessment</th></tr></thead>
      <tbody>
      <tr><td>1–2</td><td>Proposal finalization</td><td>Produce a finalized proposal</td><td>Refining RL-301's draft with a supervisor</td><td>Supervised revision</td><td>Learner's RL-301 draft</td><td>Progress Checkpoint 1 (proposal)</td></tr>
      <tr><td>3–6</td><td>Research and source gathering</td><td>Apply source-evaluation and citation skills</td><td>Sustained, systematic source work</td><td>Independent research, supervisor check-ins</td><td>Student-gathered sources</td><td>Progress Checkpoint 2 (source log)</td></tr>
      <tr><td>7–8</td><td>Drafting begins; midterm progress review</td><td>Begin synthesizing sources into argument</td><td>Moving from sources to structured writing</td><td>Supervised drafting</td><td>—</td><td>Midterm (draft progress defense)</td></tr>
      <tr><td>9–12</td><td>Sustained drafting and synthesis</td><td>Analyze and synthesize sources into a coherent argument</td><td>Building the project's full argument</td><td>Independent drafting, supervisor feedback</td><td>—</td><td>Progress Checkpoint 3 (draft chapters)</td></tr>
      <tr><td>13</td><td>Revision and finalization</td><td>Produce a complete, properly cited project</td><td>Final editing, citation-checking</td><td>Supervised revision</td><td>—</td><td>Final project submission</td></tr>
      <tr><td>14–15</td><td>Final presentation and defense</td><td>Demonstrate findings and reasoning; respond to questions</td><td>Oral defense practice and delivery</td><td>Presentation before instructor/panel</td><td>—</td><td>Final (oral defense)</td></tr>
      </tbody></table></div>
      <p><strong>Required Texts.</strong> None dedicated — draws on the learner's own gathered sources plus RL-301's Academic Integrity and citation materials (§2). <strong>Recommended Readings.</strong> RL-301's source set, as a starting point. <strong>Teaching Methodology.</strong> Individual supervision — this is a supervised independent project, not a taught lecture course; "contact hours" above are supervision time.</p>
      <p><strong>Assessment.</strong> Core/Language/Research profile's numeric weighting (§2), mapped to project milestones rather than quizzes/exams: Progress Checkpoints (proposal, source log, draft chapters — analogous to Quizzes) 15% / (analogous to Assignments — supervisor-graded drafting quality across checkpoints) 20% / Midterm (draft progress defense) 25% / Final (completed project + oral defense) 40%. Passing requires 60% overall with no component below 40%, as elsewhere.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>CLO</th><th>Teaching Activity</th><th>Assessment</th><th>Evidence</th></tr></thead>
      <tbody>
      <tr><td>1. Produce a finalized proposal</td><td>Weeks 1–2</td><td>Progress Checkpoint 1</td><td>Finalized proposal document</td></tr>
      <tr><td>2. Apply source-evaluation/citation skills</td><td>Weeks 3–6</td><td>Progress Checkpoint 2</td><td>Source log</td></tr>
      <tr><td>3. Analyze and synthesize sources</td><td>Weeks 7–12</td><td>Midterm, Progress Checkpoint 3</td><td>Draft progress notes, draft chapters</td></tr>
      <tr><td>4. Produce a complete written project</td><td>Weeks 9–13</td><td>Final project submission</td><td>Final project manuscript</td></tr>
      <tr><td>5. Demonstrate and defend findings</td><td>Weeks 14–15</td><td>Final (oral defense)</td><td>Presentation record, panel notes</td></tr>
      </tbody></table></div>
      <p><strong>Instructor Requirements.</strong> Baseline (§2), plus demonstrated capacity to supervise independent research to completion — typically a more senior or research-experienced instructor than a standard lecture course requires. <strong>Islamic Scholarly Review.</strong> Not required for the research-supervision process itself; as with RL-301, the learner's chosen topic may touch scholarly-review-dependent subject matter, and the supervising instructor is responsible for flagging that case by case and, where needed, routing the project's religious content past the Scholarly Review Committee before the project is finalized — this is the last checkpoint in Institutional Foundation through Course Specifications where an unflagged dependency could otherwise reach a learner's finished capstone work unreviewed.</p>

      <h2>10. Diploma: Islamic Education &amp; Tarbiyah (Teaching Track)</h2>
      <p>The Diploma teaching track's four required-specialization companions (IE-401, IE-403, IE-404, IE-405, all branching from IE-101) plus IE-402 (Da'wah &amp; Outreach), whose tier, prerequisite, and track placement remain genuinely open pending decision 32 (§13) — restated here rather than resolved, consistent with this document's practice (§1) of flagging inconsistencies for approval rather than resolving them unilaterally. IE-401, IE-402, IE-404, and IE-405 are observed/practiced-skill courses and use the Character/practical profile (§2), the same profile already applied to IE-201/IE-202 despite the Course Catalogue's "type" labels not distinguishing this; IE-403 (Curriculum Design) is primarily written-design work and uses the Core/Language/Research profile instead. This section also carries forward, rather than resolves, Course Catalogue's audited gap that no "Practical" (practicum/placement) course exists anywhere in the catalogue (§8) — a teaching practicum would naturally sit here, alongside IE-401, but adding one is a catalogue-level change outside this document's scope and is flagged again below rather than invented.</p>

      <h3>IE-401 — Islamic Education &amp; Teaching Methodology</h3>
      <div class="table-wrap"><table>
      <tbody>
      <tr><td>Department</td><td>Islamic Education &amp; Tarbiyah</td></tr>
      <tr><td>Program / Pathway</td><td>Diploma in Islamic Studies — teaching track</td></tr>
      <tr><td>Level</td><td>Diploma</td></tr>
      <tr><td>Units / Weekly hours</td><td>2 units — 2 hrs/week</td></tr>
      <tr><td>Expected workload</td><td>2 contact + 2 self-study = 4 hrs/week</td></tr>
      <tr><td>Prerequisite</td><td>IE-101 (Islamic Education Foundations)</td></tr>
      <tr><td>Course type</td><td>Required specialization (teaching track)</td></tr>
      <tr><td>Passing requirement</td><td>60% overall, Practical+Final combined minimum 60% (Character/practical profile, §2)</td></tr>
      </tbody></table></div>
      <p><strong>Description.</strong> How to teach Islamic content effectively: lesson planning, classroom management, and instructional methods suited to an Islamic-education setting — the teaching track's methodological foundation.</p>
      <p><strong>Objectives.</strong> Equip learners to plan and deliver a well-structured lesson on Islamic content and manage a learning environment appropriately.</p>
      <p><strong>Learning Outcomes.</strong> By course end, learners will be able to: (1) <strong>explain</strong> core pedagogical principles relevant to Islamic education (learner engagement, scaffolding, assessment for learning); (2) <strong>produce</strong> a complete lesson plan for a given Islamic-content topic; (3) <strong>demonstrate</strong> a short microteaching segment applying that plan; (4) <strong>apply</strong> basic classroom-management techniques in a simulated scenario; (5) <strong>evaluate</strong> a peer's microteaching for pedagogical effectiveness, constructively.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Week</th><th>Topic</th><th>Objectives</th><th>Key Concepts</th><th>Activities</th><th>Readings</th><th>Assessment</th></tr></thead>
      <tbody>
      <tr><td>1–2</td><td>Pedagogical foundations</td><td>Explain core principles</td><td>Engagement, scaffolding, formative assessment</td><td>Lecture, discussion</td><td>Core text (pending, decision 49)</td><td>Quiz 1</td></tr>
      <tr><td>3–4</td><td>Lesson planning</td><td>Produce a complete lesson plan</td><td>Objectives, structure, pacing, assessment built in</td><td>Guided planning workshop</td><td>Lesson-plan templates</td><td>Assignment 1 (lesson plan)</td></tr>
      <tr><td>5–6</td><td>Classroom management</td><td>Apply basic management techniques</td><td>Age-appropriate management strategies</td><td>Case discussion, role-play</td><td>Instructor-curated readings</td><td>Quiz 2</td></tr>
      <tr><td>7</td><td>Midterm progress check</td><td>Consolidate weeks 1–6</td><td>—</td><td>Written exam plus lesson-plan review</td><td>—</td><td>Midterm</td></tr>
      <tr><td>8–10</td><td>Microteaching practicum I</td><td>Demonstrate a microteaching segment</td><td>Delivering the planned lesson to peers</td><td>Microteaching, instructor observation</td><td>Learner's lesson plan</td><td>Practical 1</td></tr>
      <tr><td>11–12</td><td>Peer evaluation practice</td><td>Evaluate a peer's microteaching constructively</td><td>Applying pedagogical criteria as an evaluator</td><td>Peer-review circles</td><td>Evaluation rubric</td><td>Assignment 2</td></tr>
      <tr><td>13–14</td><td>Microteaching practicum II (revised)</td><td>Demonstrate improvement from feedback</td><td>Applying peer/instructor feedback</td><td>Microteaching, instructor observation</td><td>—</td><td>Practical 2 (Final)</td></tr>
      <tr><td>15</td><td>Review and synthesis</td><td>Consolidate the full term</td><td>—</td><td>Written exam</td><td>—</td><td>Final (written component)</td></tr>
      </tbody></table></div>
      <p><strong>Required Texts.</strong> <strong>Gap:</strong> no Islamic-pedagogy/teaching-methodology text currently exists in the Bookstore catalogue — flagged as decision 49 (§13); instructor-curated materials are a placeholder. <strong>Recommended Readings.</strong> None assigned pending that gap. <strong>Teaching Methodology.</strong> Workshop and microteaching-based — teaching is learned by teaching, observed and critiqued, not by lecture alone.</p>
      <p><strong>Assessment.</strong> Character/practical profile (§2): Quizzes 10% / Assignments 25% / Midterm 20% / Practical 25% / Final 20%; Practical instructor-attested, not purely computed.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>CLO</th><th>Teaching Activity</th><th>Assessment</th><th>Evidence</th></tr></thead>
      <tbody>
      <tr><td>1. Explain pedagogical principles</td><td>Weeks 1–2</td><td>Quiz 1, Midterm</td><td>Quiz script, exam script</td></tr>
      <tr><td>2. Produce a lesson plan</td><td>Weeks 3–4</td><td>Assignment 1</td><td>Lesson-plan submission</td></tr>
      <tr><td>3. Demonstrate microteaching</td><td>Weeks 8–10, 13–14</td><td>Practical 1, Practical 2</td><td>Instructor observation record</td></tr>
      <tr><td>4. Apply classroom management</td><td>Weeks 5–6</td><td>Quiz 2</td><td>Quiz script</td></tr>
      <tr><td>5. Evaluate a peer's teaching</td><td>Weeks 11–12</td><td>Assignment 2</td><td>Peer-review notes</td></tr>
      </tbody></table></div>
      <p><strong>Instructor Requirements.</strong> Baseline (§2), plus demonstrated teaching-supervision or teacher-training experience. <strong>Islamic Scholarly Review.</strong> Not required for pedagogical methodology itself; content used in microteaching demonstrations should be drawn from already-cleared course material (e.g. IE-101, IS-101) rather than newly composed religious content.</p>

      <h3>IE-402 — Da'wah &amp; Outreach <span style="font-weight:normal;">(provisional — see note below)</span></h3>
      <p><strong>Placement note.</strong> IE-402's tier, prerequisite, and track are still open pending decision 32 (§13), restating Department Curriculum Design decision 26. The specification below follows the catalogue's current working placement (Diploma, provisionally following IE-201) so the course can be drafted at all, but every field here — level, prerequisite, and whether it belongs to the teaching track, a future da'wah/outreach track, or elsewhere — remains provisional until that decision is made, per Course Catalogue's own note (§9, §10).</p>
      <div class="table-wrap"><table>
      <tbody>
      <tr><td>Department</td><td>Islamic Education &amp; Tarbiyah <span style="font-weight:normal;">(provisional)</span></td></tr>
      <tr><td>Program / Pathway</td><td>Diploma in Islamic Studies — provisional track</td></tr>
      <tr><td>Level</td><td>Diploma — provisional</td></tr>
      <tr><td>Units / Weekly hours</td><td>2 units — 2 hrs/week (provisional)</td></tr>
      <tr><td>Expected workload</td><td>2 contact + 2 self-study = 4 hrs/week (provisional)</td></tr>
      <tr><td>Prerequisite</td><td>IE-201 (Communication &amp; Leadership) — provisional</td></tr>
      <tr><td>Course type</td><td>Elective — provisional</td></tr>
      <tr><td>Passing requirement</td><td>60% overall, Practical+Final combined minimum 60% (Character/practical profile, §2, provisionally applied)</td></tr>
      </tbody></table></div>
      <p><strong>Description.</strong> Outreach methodology: how to present Islamic teachings to others — Muslim and non-Muslim audiences — respectfully and effectively, reassigned to this department from Islamic Civilization &amp; Society (Department Curriculum Design §1, §9).</p>
      <p><strong>Objectives.</strong> Equip learners to apply basic da'wah/outreach methodology to a sample scenario, communicating respectfully and adapting to audience context.</p>
      <p><strong>Learning Outcomes.</strong> By course end, learners will be able to: (1) <strong>explain</strong> core principles of respectful, effective da'wah (hikmah, adab, audience awareness); (2) <strong>describe</strong> how outreach approach should differ across audience contexts; (3) <strong>apply</strong> basic da'wah methodology to a sample scenario; (4) <strong>demonstrate</strong> a respectful response to a common objection or question in a simulated interaction; (5) <strong>evaluate</strong> a sample outreach interaction for effectiveness and adab.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Week</th><th>Topic</th><th>Objectives</th><th>Key Concepts</th><th>Activities</th><th>Readings</th><th>Assessment</th></tr></thead>
      <tbody>
      <tr><td>1–3</td><td>Principles of da'wah</td><td>Explain hikmah, adab, audience awareness</td><td>Qur'anic and prophetic basis for outreach conduct</td><td>Lecture, discussion</td><td>Core text (pending, decision 49, shared with IE-401)</td><td>Quiz 1</td></tr>
      <tr><td>4–6</td><td>Audience context</td><td>Describe how approach differs by audience</td><td>Muslim vs. non-Muslim audiences; cultural sensitivity</td><td>Case discussion</td><td>Instructor-curated readings</td><td>Assignment 1</td></tr>
      <tr><td>7</td><td>Midterm review and examination</td><td>Consolidate weeks 1–6</td><td>—</td><td>Written exam</td><td>—</td><td>Midterm</td></tr>
      <tr><td>8–10</td><td>Applied scenario practice</td><td>Apply methodology to a sample scenario</td><td>Structured scenario walkthroughs</td><td>Role-play, instructor feedback</td><td>Scenario packet</td><td>Practical 1</td></tr>
      <tr><td>11–13</td><td>Responding to objections respectfully</td><td>Demonstrate respectful responses to common objections</td><td>Common objections; de-escalation and adab under pressure</td><td>Role-play</td><td>Instructor-curated objection set</td><td>Practical 2 (Final)</td></tr>
      <tr><td>14–15</td><td>Evaluation and review</td><td>Evaluate a sample interaction; consolidate the term</td><td>—</td><td>Case evaluation, written exam</td><td>Sample interaction transcript</td><td>Assignment 2</td></tr>
      </tbody></table></div>
      <p><strong>Required Texts.</strong> <strong>Gap:</strong> shares the pedagogy-text gap noted at IE-401 (decision 49) for its methodological content; no dedicated da'wah-methodology text currently exists in the Bookstore either. <strong>Recommended Readings.</strong> None assigned pending sourcing. <strong>Teaching Methodology.</strong> Case discussion and role-play — outreach is a practiced interpersonal skill, not only stated principle.</p>
      <p><strong>Assessment.</strong> Character/practical profile (§2, provisionally applied pending decision 32): Quizzes 10% / Assignments 25% / Midterm 20% / Practical 25% / Final 20%.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>CLO</th><th>Teaching Activity</th><th>Assessment</th><th>Evidence</th></tr></thead>
      <tbody>
      <tr><td>1. Explain da'wah principles</td><td>Weeks 1–3</td><td>Quiz 1, Midterm</td><td>Quiz script, exam script</td></tr>
      <tr><td>2. Describe audience-context differences</td><td>Weeks 4–6</td><td>Assignment 1</td><td>Submission</td></tr>
      <tr><td>3. Apply methodology to a scenario</td><td>Weeks 8–10</td><td>Practical 1</td><td>Instructor observation record</td></tr>
      <tr><td>4. Demonstrate respectful objection-handling</td><td>Weeks 11–13</td><td>Practical 2</td><td>Instructor observation record</td></tr>
      <tr><td>5. Evaluate an outreach interaction</td><td>Weeks 14–15</td><td>Assignment 2, Final</td><td>Submission, exam script</td></tr>
      </tbody></table></div>
      <p><strong>Instructor Requirements.</strong> Baseline (§2), plus demonstrated da'wah/outreach experience — provisional pending decision 32. <strong>Islamic Scholarly Review.</strong> Objection-handling content (weeks 11–13) should be Scholarly Review Committee-approved before first delivery, since responses to common objections about Aqeedah or Fiqh questions may carry the same dependencies as IS-301 and IS-401. This course cannot be finalized — content, tier, or otherwise — until decision 32 is resolved.</p>

      <h3>IE-403 — Islamic Curriculum Design</h3>
      <div class="table-wrap"><table>
      <tbody>
      <tr><td>Department</td><td>Islamic Education &amp; Tarbiyah</td></tr>
      <tr><td>Program / Pathway</td><td>Diploma in Islamic Studies — teaching track</td></tr>
      <tr><td>Level</td><td>Diploma</td></tr>
      <tr><td>Units / Weekly hours</td><td>2 units — 2 hrs/week</td></tr>
      <tr><td>Expected workload</td><td>2 contact + 2 self-study = 4 hrs/week</td></tr>
      <tr><td>Prerequisite</td><td>IE-101 (Islamic Education Foundations)</td></tr>
      <tr><td>Course type</td><td>Required specialization (teaching track)</td></tr>
      <tr><td>Passing requirement</td><td>60% overall, no component below 40% (Core/Language/Research profile, §2)</td></tr>
      </tbody></table></div>
      <p><strong>Description.</strong> How to design an Islamic-education curriculum: sequencing content, aligning objectives to assessment, and adapting design to different learner contexts — the planning-level counterpart to IE-401's classroom-level methodology.</p>
      <p><strong>Objectives.</strong> Equip learners to design a coherent short curriculum unit for an Islamic-education context.</p>
      <p><strong>Learning Outcomes.</strong> By course end, learners will be able to: (1) <strong>explain</strong> principles of curriculum sequencing and objective-assessment alignment; (2) <strong>describe</strong> how curriculum design should adapt to different learner ages/contexts; (3) <strong>apply</strong> backward-design principles (starting from outcomes) to a sample topic; (4) <strong>analyze</strong> an existing curriculum unit (e.g. from Department Curriculum Design through Course Specifications themselves) for its design choices; (5) <strong>produce</strong> a complete short curriculum unit (multi-week) for an assigned Islamic-education topic.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Week</th><th>Topic</th><th>Objectives</th><th>Key Concepts</th><th>Activities</th><th>Readings</th><th>Assessment</th></tr></thead>
      <tbody>
      <tr><td>1–2</td><td>Curriculum design principles</td><td>Explain sequencing and alignment principles</td><td>Backward design; objective-assessment alignment</td><td>Lecture, discussion</td><td>Core text (pending, decision 49)</td><td>Quiz 1</td></tr>
      <tr><td>3–4</td><td>Adapting to learner context</td><td>Describe context-appropriate adaptation</td><td>Age, prior knowledge, setting (school vs. weekend program)</td><td>Case discussion</td><td>Instructor-curated readings</td><td>Assignment 1</td></tr>
      <tr><td>5–7</td><td>Analyzing existing curricula</td><td>Analyze an existing unit's design choices</td><td>Using Department Curriculum Design through Course Specifications's own curriculum as a worked example</td><td>Guided analysis</td><td>Academy Department &amp; Program Curriculum Design (Department Curriculum Design) excerpts</td><td>Quiz 2</td></tr>
      <tr><td>8</td><td>Midterm review and examination</td><td>Consolidate weeks 1–7</td><td>—</td><td>Written exam</td><td>—</td><td>Midterm</td></tr>
      <tr><td>9–13</td><td>Guided curriculum-design practicum</td><td>Produce a complete short curriculum unit</td><td>Full design cycle applied to an assigned topic</td><td>Supervised design work</td><td>Assigned topic</td><td>Curriculum unit (Assignment 2)</td></tr>
      <tr><td>14</td><td>Peer review of curriculum units</td><td>Reinforce evaluation of design choices</td><td>—</td><td>Peer-review workshop</td><td>—</td><td>—</td></tr>
      <tr><td>15</td><td>Review and final examination</td><td>Consolidate the full term</td><td>—</td><td>Written exam</td><td>—</td><td>Final</td></tr>
      </tbody></table></div>
      <p><strong>Required Texts.</strong> <strong>Gap:</strong> shares the pedagogy-text gap noted at IE-401 (decision 49); no dedicated curriculum-design text currently exists in the Bookstore. <strong>Recommended Readings.</strong> The Academy's own Department Curriculum Design (Department &amp; Program Curriculum Design) document, used as a worked example rather than a purchased text — a genuine, if unconventional, fit. <strong>Teaching Methodology.</strong> Guided design practicum — the curriculum unit is built incrementally across the term.</p>
      <p><strong>Assessment.</strong> Core/Language/Research profile: Quizzes 15% / Assignments 20% / Midterm 25% / Final 40% (the curriculum unit is graded within Assignment 2 and reflected in the Final).</p>
      <div class="table-wrap"><table>
      <thead><tr><th>CLO</th><th>Teaching Activity</th><th>Assessment</th><th>Evidence</th></tr></thead>
      <tbody>
      <tr><td>1. Explain sequencing/alignment principles</td><td>Weeks 1–2</td><td>Quiz 1, Midterm</td><td>Quiz script, exam script</td></tr>
      <tr><td>2. Describe context-appropriate adaptation</td><td>Weeks 3–4</td><td>Assignment 1</td><td>Submission</td></tr>
      <tr><td>3. Apply backward design</td><td>Weeks 9–13</td><td>Assignment 2</td><td>Curriculum unit submission</td></tr>
      <tr><td>4. Analyze an existing curriculum</td><td>Weeks 5–7</td><td>Quiz 2</td><td>Quiz script</td></tr>
      <tr><td>5. Produce a complete curriculum unit</td><td>Weeks 9–14</td><td>Assignment 2, Final</td><td>Curriculum unit, exam script</td></tr>
      </tbody></table></div>
      <p><strong>Instructor Requirements.</strong> Baseline (§2), plus curriculum-design experience (developing or evaluating an Islamic-education curriculum). <strong>Islamic Scholarly Review.</strong> Not required for design methodology itself; any religious content the learner selects for their curriculum unit (weeks 9–13) should be drawn from already-cleared course material, consistent with IE-401's microteaching content rule.</p>

      <h3>IE-404 — Youth Education</h3>
      <div class="table-wrap"><table>
      <tbody>
      <tr><td>Department</td><td>Islamic Education &amp; Tarbiyah</td></tr>
      <tr><td>Program / Pathway</td><td>Diploma in Islamic Studies — teaching track</td></tr>
      <tr><td>Level</td><td>Diploma</td></tr>
      <tr><td>Units / Weekly hours</td><td>2 units — 2 hrs/week</td></tr>
      <tr><td>Expected workload</td><td>2 contact + 2 self-study = 4 hrs/week</td></tr>
      <tr><td>Prerequisite</td><td>IE-101 (Islamic Education Foundations)</td></tr>
      <tr><td>Course type</td><td>Required specialization (teaching track)</td></tr>
      <tr><td>Passing requirement</td><td>60% overall, Practical+Final combined minimum 60% (Character/practical profile, §2)</td></tr>
      </tbody></table></div>
      <p><strong>Description.</strong> Teaching Islamic content specifically to youth (adolescents and pre-adolescents): developmentally appropriate methods, engagement strategies, and common challenges distinct from adult or general instruction.</p>
      <p><strong>Objectives.</strong> Equip learners to teach Islamic content to youth using developmentally appropriate, engaging methods.</p>
      <p><strong>Learning Outcomes.</strong> By course end, learners will be able to: (1) <strong>explain</strong> developmental considerations relevant to teaching youth (attention span, identity formation, peer dynamics); (2) <strong>describe</strong> engagement strategies suited to youth audiences (activity-based learning, discussion facilitation); (3) <strong>apply</strong> IE-401's lesson-planning skills to a youth-specific topic and age band; (4) <strong>demonstrate</strong> a youth-oriented teaching segment; (5) <strong>analyze</strong> a common youth-engagement challenge (e.g. disengagement, identity questions) and propose an appropriate response.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Week</th><th>Topic</th><th>Objectives</th><th>Key Concepts</th><th>Activities</th><th>Readings</th><th>Assessment</th></tr></thead>
      <tbody>
      <tr><td>1–3</td><td>Youth development and learning</td><td>Explain developmental considerations</td><td>Adolescent development, identity formation basics</td><td>Lecture, discussion</td><td>Core text (pending, decision 49)</td><td>Quiz 1</td></tr>
      <tr><td>4–6</td><td>Youth engagement strategies</td><td>Describe engagement strategies for youth</td><td>Activity-based learning, discussion facilitation, peer dynamics</td><td>Lecture, case discussion</td><td>Instructor-curated readings</td><td>Assignment 1</td></tr>
      <tr><td>7</td><td>Midterm review and examination</td><td>Consolidate weeks 1–6</td><td>—</td><td>Written exam</td><td>—</td><td>Midterm</td></tr>
      <tr><td>8–10</td><td>Youth lesson planning and microteaching</td><td>Apply lesson planning; demonstrate a teaching segment</td><td>Adapting IE-401 planning to a youth audience</td><td>Guided planning, microteaching</td><td>Learner's lesson plan</td><td>Practical 1</td></tr>
      <tr><td>11–13</td><td>Common youth-engagement challenges</td><td>Analyze challenges and propose responses</td><td>Disengagement, identity questions, peer pressure</td><td>Case discussion, role-play</td><td>Case packet</td><td>Assignment 2</td></tr>
      <tr><td>14</td><td>Revised youth microteaching</td><td>Demonstrate improvement from feedback</td><td>—</td><td>Microteaching, instructor observation</td><td>—</td><td>Practical 2 (Final)</td></tr>
      <tr><td>15</td><td>Review and synthesis</td><td>Consolidate the full term</td><td>—</td><td>Written exam</td><td>—</td><td>Final (written component)</td></tr>
      </tbody></table></div>
      <p><strong>Required Texts.</strong> <strong>Gap:</strong> shares the pedagogy-text gap noted at IE-401 (decision 49); no youth-education-specific text currently exists in the Bookstore. <strong>Recommended Readings.</strong> None assigned pending sourcing. <strong>Teaching Methodology.</strong> Case discussion and microteaching, adapted from IE-401's method for a youth-specific focus.</p>
      <p><strong>Assessment.</strong> Character/practical profile (§2): Quizzes 10% / Assignments 25% / Midterm 20% / Practical 25% / Final 20%.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>CLO</th><th>Teaching Activity</th><th>Assessment</th><th>Evidence</th></tr></thead>
      <tbody>
      <tr><td>1. Explain developmental considerations</td><td>Weeks 1–3</td><td>Quiz 1, Midterm</td><td>Quiz script, exam script</td></tr>
      <tr><td>2. Describe engagement strategies</td><td>Weeks 4–6</td><td>Assignment 1</td><td>Submission</td></tr>
      <tr><td>3. Apply lesson planning to youth topics</td><td>Weeks 8–10</td><td>Practical 1</td><td>Instructor observation record</td></tr>
      <tr><td>4. Demonstrate youth-oriented teaching</td><td>Weeks 8–10, 14</td><td>Practical 1, Practical 2</td><td>Instructor observation record</td></tr>
      <tr><td>5. Analyze engagement challenges</td><td>Weeks 11–13</td><td>Assignment 2</td><td>Submission</td></tr>
      </tbody></table></div>
      <p><strong>Instructor Requirements.</strong> Baseline (§2), plus demonstrated experience teaching Islamic content to youth specifically. <strong>Islamic Scholarly Review.</strong> Not required for youth-pedagogy methodology itself; religious content used in microteaching (weeks 8–10, 14) follows the same already-cleared-material rule as IE-401.</p>

      <h3>IE-405 — Family Education</h3>
      <div class="table-wrap"><table>
      <tbody>
      <tr><td>Department</td><td>Islamic Education &amp; Tarbiyah</td></tr>
      <tr><td>Program / Pathway</td><td>Diploma in Islamic Studies — teaching track</td></tr>
      <tr><td>Level</td><td>Diploma</td></tr>
      <tr><td>Units / Weekly hours</td><td>2 units — 2 hrs/week</td></tr>
      <tr><td>Expected workload</td><td>2 contact + 2 self-study = 4 hrs/week</td></tr>
      <tr><td>Prerequisite</td><td>IE-101 (Islamic Education Foundations)</td></tr>
      <tr><td>Course type</td><td>Required specialization (teaching track)</td></tr>
      <tr><td>Passing requirement</td><td>60% overall, Practical+Final combined minimum 60% (Character/practical profile, §2)</td></tr>
      </tbody></table></div>
      <p><strong>Description.</strong> How to raise and teach children Islamically — parent-facing advisory content, distinct from Islamic Civilization &amp; Society's IC-402 (Family &amp; Society), which studies the family as a social institution through a sociological/historical lens (Department Curriculum Design §5, §9) rather than advising parents directly.</p>
      <p><strong>Objectives.</strong> Equip learners to advise families on age-appropriate Islamic upbringing practices.</p>
      <p><strong>Learning Outcomes.</strong> By course end, learners will be able to: (1) <strong>explain</strong> Islamic principles of child-rearing and family responsibility (tarbiyah at the family level); (2) <strong>describe</strong> age-appropriate expectations and practices across childhood stages; (3) <strong>apply</strong> these principles to a sample family scenario; (4) <strong>demonstrate</strong> respectful, practical advising in a simulated parent consultation; (5) <strong>evaluate</strong> a family-education case for appropriate, non-judgmental guidance.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Week</th><th>Topic</th><th>Objectives</th><th>Key Concepts</th><th>Activities</th><th>Readings</th><th>Assessment</th></tr></thead>
      <tbody>
      <tr><td>1–3</td><td>Islamic principles of child-rearing</td><td>Explain tarbiyah at the family level</td><td>Parental responsibility, prophetic guidance on raising children</td><td>Lecture, discussion</td><td>Core text (pending, decision 49)</td><td>Quiz 1</td></tr>
      <tr><td>4–6</td><td>Age-appropriate practices</td><td>Describe expectations across childhood stages</td><td>Early childhood through adolescence, staged expectations</td><td>Lecture, case discussion</td><td>Instructor-curated readings</td><td>Assignment 1</td></tr>
      <tr><td>7</td><td>Midterm review and examination</td><td>Consolidate weeks 1–6</td><td>—</td><td>Written exam</td><td>—</td><td>Midterm</td></tr>
      <tr><td>8–10</td><td>Applying principles to family scenarios</td><td>Apply principles to a sample scenario</td><td>Structured scenario walkthroughs</td><td>Case work, discussion</td><td>Scenario packet</td><td>Assignment 2</td></tr>
      <tr><td>11–13</td><td>Simulated parent consultation</td><td>Demonstrate respectful, practical advising</td><td>Non-judgmental advisory tone; practical guidance, not rulings</td><td>Role-play, instructor feedback</td><td>—</td><td>Practical 1</td></tr>
      <tr><td>14</td><td>Case evaluation practice</td><td>Evaluate a family-education case for appropriate guidance</td><td>Recognizing when to refer to scholarly authority</td><td>Case evaluation workshop</td><td>Case packet</td><td>Practical 2 (Final)</td></tr>
      <tr><td>15</td><td>Review and synthesis</td><td>Consolidate the full term</td><td>—</td><td>Written exam</td><td>—</td><td>Final (written component)</td></tr>
      </tbody></table></div>
      <p><strong>Required Texts.</strong> <strong>Gap:</strong> shares the pedagogy-text gap noted at IE-401 (decision 49); no family-education-specific text currently exists in the Bookstore. <strong>Recommended Readings.</strong> None assigned pending sourcing. <strong>Teaching Methodology.</strong> Case-based and role-play — advising is a practiced interpersonal skill, distinct from IE-401's classroom-teaching focus.</p>
      <p><strong>Assessment.</strong> Character/practical profile (§2): Quizzes 10% / Assignments 25% / Midterm 20% / Practical 25% / Final 20%.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>CLO</th><th>Teaching Activity</th><th>Assessment</th><th>Evidence</th></tr></thead>
      <tbody>
      <tr><td>1. Explain child-rearing principles</td><td>Weeks 1–3</td><td>Quiz 1, Midterm</td><td>Quiz script, exam script</td></tr>
      <tr><td>2. Describe age-appropriate practices</td><td>Weeks 4–6</td><td>Assignment 1</td><td>Submission</td></tr>
      <tr><td>3. Apply principles to scenarios</td><td>Weeks 8–10</td><td>Assignment 2</td><td>Submission</td></tr>
      <tr><td>4. Demonstrate respectful advising</td><td>Weeks 11–13</td><td>Practical 1</td><td>Instructor observation record</td></tr>
      <tr><td>5. Evaluate a case for appropriate guidance</td><td>Week 14</td><td>Practical 2, Final</td><td>Instructor observation record, exam script</td></tr>
      </tbody></table></div>
      <p><strong>Instructor Requirements.</strong> Baseline (§2), plus demonstrated experience in family/parenting-education contexts. <strong>Islamic Scholarly Review.</strong> The referral-recognition skill (week 14) is important precisely because this course trains practical advising, not ruling-issuing — learners must be able to recognize when a family's question exceeds ordinary advisory guidance and requires qualified scholarly authority. Scholarly Review Committee should confirm this scoping, similar to IC-301's community-life discussion, before first delivery.</p>

      <h2>11. Diploma: Islamic Civilization &amp; Society (Community Track), Plus SPEC-3xx</h2>
      <p>This final section covers the community track's two Diploma companions (IC-401, IC-402, both branching from IC-301) and a framework note for SPEC-3xx, the Advanced pathway's floating specialization-elective placeholder (Curriculum Framework §6, Course Catalogue §3). SPEC-3xx has no fixed content to specify — its department, prerequisite, and outcome vary by the learner's chosen Specialized Certificate preview — so it receives a framework note rather than a full 28-field specification, exactly as anticipated when SPEC-3xx was left open in Course Catalogue §3. IC-401 and IC-402 complete the finding first raised at IC-201/IC-301 (decision 40): the entire Islamic Civilization &amp; Society department — all four of its courses — currently has no dedicated Bookstore text, restated once at the end of this section rather than as two more near-identical gap entries.</p>

      <h3>IC-401 — Contemporary Muslim Issues</h3>
      <div class="table-wrap"><table>
      <tbody>
      <tr><td>Department</td><td>Islamic Civilization &amp; Society</td></tr>
      <tr><td>Program / Pathway</td><td>Diploma in Islamic Studies — community track</td></tr>
      <tr><td>Level</td><td>Diploma</td></tr>
      <tr><td>Units / Weekly hours</td><td>2 units — 2 hrs/week</td></tr>
      <tr><td>Expected workload</td><td>2 contact + 2 self-study = 4 hrs/week</td></tr>
      <tr><td>Prerequisite</td><td>IC-301 (Islamic Social Thought)</td></tr>
      <tr><td>Course type</td><td>Required specialization (community track)</td></tr>
      <tr><td>Passing requirement</td><td>60% overall, no component below 40% (Core/Language/Research profile, §2)</td></tr>
      </tbody></table></div>
      <p><strong>Description.</strong> Sociological and communal challenges facing Muslim societies today — renamed from an earlier "&amp; Da'wah" framing once outreach methodology moved to IE-402 (Department Curriculum Design §1) — distinct from IS-403's ruling-methodology focus: IC-401 analyzes communal challenges sociologically, IS-403 determines which category (settled/disputed/unsettled) a specific ruling question falls into.</p>
      <p><strong>Objectives.</strong> Equip learners to analyze a contemporary challenge facing a Muslim community using the sociological/historical lens developed across IC-201/IC-301, distinct from fiqh-ruling analysis.</p>
      <p><strong>Learning Outcomes.</strong> By course end, learners will be able to: (1) <strong>describe</strong> at least three contemporary communal challenges facing Muslim societies (survey level, selected per current guidance); (2) <strong>explain</strong> the historical/social roots of a given challenge, connecting to IC-201/IC-301; (3) <strong>compare</strong> how different Muslim communities or contexts have responded to a shared challenge; (4) <strong>analyze</strong> a contemporary case study sociologically, distinguishing this from a ruling-focused analysis (cf. IS-403); (5) <strong>evaluate</strong> a proposed communal response for its social/practical soundness.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Week</th><th>Topic</th><th>Objectives</th><th>Key Concepts</th><th>Activities</th><th>Readings</th><th>Assessment</th></tr></thead>
      <tbody>
      <tr><td>1</td><td>Sociological analysis vs. ruling analysis</td><td>Contextualize the course; distinguish from IS-403</td><td>What this course does and does not attempt</td><td>Lecture</td><td>Course guide</td><td>—</td></tr>
      <tr><td>2–4</td><td>Survey of communal challenges I</td><td>Describe contemporary challenges</td><td>Selected areas (per current Committee/Department guidance)</td><td>Lecture, discussion</td><td>Core text (pending, restated decision 40)</td><td>Quiz 1</td></tr>
      <tr><td>5–7</td><td>Historical/social roots</td><td>Explain roots of a given challenge</td><td>Connecting to IC-201/IC-301 content</td><td>Lecture, discussion</td><td>Cross-reference IC-201, IC-301</td><td>Assignment 1</td></tr>
      <tr><td>8</td><td>Midterm review and examination</td><td>Consolidate weeks 1–7</td><td>—</td><td>Written exam</td><td>—</td><td>Midterm</td></tr>
      <tr><td>9–10</td><td>Comparative community responses</td><td>Compare responses across communities/contexts</td><td>Contextual variation in communal response</td><td>Case discussion</td><td>Instructor-curated readings</td><td>Quiz 2</td></tr>
      <tr><td>11–13</td><td>Case study analysis</td><td>Analyze a case sociologically</td><td>Applying the sociological lens, not a ruling-analysis one</td><td>Case discussion</td><td>Case packet</td><td>Assignment 2</td></tr>
      <tr><td>14</td><td>Evaluating proposed responses</td><td>Evaluate a proposed communal response</td><td>Social/practical soundness criteria</td><td>Seminar discussion</td><td>—</td><td>—</td></tr>
      <tr><td>15</td><td>Review and final examination</td><td>Consolidate the full term</td><td>—</td><td>Written exam</td><td>—</td><td>Final</td></tr>
      </tbody></table></div>
      <p><strong>Required Texts.</strong> <strong>Gap:</strong> same underlying Bookstore gap as IC-201/IC-301 (decision 40, restated below to cover the whole department); instructor handouts are a placeholder. <strong>Recommended Readings.</strong> None assigned pending that gap. <strong>Teaching Methodology.</strong> Lecture and case discussion, with the sociological/ruling distinction (week 1) reinforced throughout so learners do not conflate this course with IS-403.</p>
      <p><strong>Assessment.</strong> Core/Language/Research profile: Quizzes 15% / Assignments 20% / Midterm 25% / Final 40%.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>CLO</th><th>Teaching Activity</th><th>Assessment</th><th>Evidence</th></tr></thead>
      <tbody>
      <tr><td>1. Describe communal challenges</td><td>Weeks 2–4</td><td>Quiz 1</td><td>Quiz script</td></tr>
      <tr><td>2. Explain historical/social roots</td><td>Weeks 5–7</td><td>Assignment 1, Midterm</td><td>Submission, exam script</td></tr>
      <tr><td>3. Compare community responses</td><td>Weeks 9–10</td><td>Quiz 2</td><td>Quiz script</td></tr>
      <tr><td>4. Analyze a case sociologically</td><td>Weeks 11–13</td><td>Assignment 2</td><td>Submission</td></tr>
      <tr><td>5. Evaluate a proposed response</td><td>Week 14</td><td>Final</td><td>Exam script</td></tr>
      </tbody></table></div>
      <p><strong>Instructor Requirements.</strong> Baseline (§2), plus grounding in the sociology of contemporary Muslim communities. <strong>Islamic Scholarly Review.</strong> Lower-risk than IS-403 since this course stays at the sociological/descriptive level rather than issuing or categorizing rulings, but any case (weeks 11–13) that shades into a ruling question should be redirected to IS-403's framework rather than resolved here — the Scholarly Review Committee should confirm this boundary is held before first delivery, the same discipline used at IC-301.</p>

      <h3>IC-402 — Family &amp; Society</h3>
      <div class="table-wrap"><table>
      <tbody>
      <tr><td>Department</td><td>Islamic Civilization &amp; Society</td></tr>
      <tr><td>Program / Pathway</td><td>Diploma in Islamic Studies — community track</td></tr>
      <tr><td>Level</td><td>Diploma</td></tr>
      <tr><td>Units / Weekly hours</td><td>2 units — 2 hrs/week</td></tr>
      <tr><td>Expected workload</td><td>2 contact + 2 self-study = 4 hrs/week</td></tr>
      <tr><td>Prerequisite</td><td>IC-301 (Islamic Social Thought)</td></tr>
      <tr><td>Course type</td><td>Required specialization (community track)</td></tr>
      <tr><td>Passing requirement</td><td>60% overall, no component below 40%</td></tr>
      </tbody></table></div>
      <p><strong>Description.</strong> New at Curriculum Framework: the family as a social institution within Muslim civilization — a sociological/historical lens, distinct from Islamic Education &amp; Tarbiyah's parent-facing IE-405 (Department Curriculum Design §5, §9), which advises individual families rather than analyzing the family institution itself.</p>
      <p><strong>Objectives.</strong> Equip learners to analyze the family's role as a social institution within Muslim civilization, historically and today.</p>
      <p><strong>Learning Outcomes.</strong> By course end, learners will be able to: (1) <strong>describe</strong> the family's historical role as a social institution in Muslim civilization; (2) <strong>explain</strong> how Islamic teachings have shaped family structure and roles institutionally, distinct from IE-405's individual-advising focus; (3) <strong>compare</strong> historical family structures with contemporary Muslim family life; (4) <strong>analyze</strong> a case study of family-institution change (historical or contemporary); (5) <strong>evaluate</strong>, at a descriptive/sociological level, how family-institution patterns relate to broader communal wellbeing — without issuing new rulings on family matters.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Week</th><th>Topic</th><th>Objectives</th><th>Key Concepts</th><th>Activities</th><th>Readings</th><th>Assessment</th></tr></thead>
      <tbody>
      <tr><td>1</td><td>The family as an institution, not just a household</td><td>Contextualize the course; distinguish from IE-405</td><td>Institutional vs. individual-advising lens</td><td>Lecture</td><td>Course guide</td><td>—</td></tr>
      <tr><td>2–4</td><td>Historical role of the family in Muslim civilization</td><td>Describe the family's historical institutional role</td><td>Family as the basic social/economic/educational unit historically</td><td>Lecture, discussion</td><td>Core text (pending, restated decision 40)</td><td>Quiz 1</td></tr>
      <tr><td>5–7</td><td>Islamic teachings and institutional structure</td><td>Explain how teachings shaped structure/roles institutionally</td><td>Rights and responsibilities at the institutional (not individual-advice) level</td><td>Lecture, discussion</td><td>Core text</td><td>Assignment 1</td></tr>
      <tr><td>8</td><td>Midterm review and examination</td><td>Consolidate weeks 1–7</td><td>—</td><td>Written exam</td><td>—</td><td>Midterm</td></tr>
      <tr><td>9–10</td><td>Historical vs. contemporary family life</td><td>Compare historical structures with contemporary life</td><td>Continuity and change in Muslim family life</td><td>Discussion</td><td>Instructor-curated readings</td><td>Quiz 2</td></tr>
      <tr><td>11–13</td><td>Case study — family-institution change</td><td>Analyze a case of institutional change</td><td>Working through one case in depth</td><td>Case discussion</td><td>Case packet</td><td>Assignment 2</td></tr>
      <tr><td>14</td><td>Family institution and communal wellbeing</td><td>Evaluate patterns descriptively, without issuing rulings</td><td>Sociological evaluation vs. ruling-issuing, held apart deliberately</td><td>Seminar discussion</td><td>—</td><td>—</td></tr>
      <tr><td>15</td><td>Review and final examination</td><td>Consolidate the full term</td><td>—</td><td>Written exam</td><td>—</td><td>Final</td></tr>
      </tbody></table></div>
      <p><strong>Required Texts.</strong> <strong>Gap:</strong> same underlying Bookstore gap as IC-201/IC-301/IC-401 (decision 40, restated below); instructor handouts are a placeholder. <strong>Recommended Readings.</strong> None assigned pending that gap. <strong>Teaching Methodology.</strong> Lecture and case-study discussion, with the institutional/individual-advising distinction (week 1) reinforced throughout so learners do not conflate this course with IE-405.</p>
      <p><strong>Assessment.</strong> Core/Language/Research profile: Quizzes 15% / Assignments 20% / Midterm 25% / Final 40%.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>CLO</th><th>Teaching Activity</th><th>Assessment</th><th>Evidence</th></tr></thead>
      <tbody>
      <tr><td>1. Describe historical institutional role</td><td>Weeks 2–4</td><td>Quiz 1</td><td>Quiz script</td></tr>
      <tr><td>2. Explain institutional structure/roles</td><td>Weeks 5–7</td><td>Assignment 1, Midterm</td><td>Submission, exam script</td></tr>
      <tr><td>3. Compare historical/contemporary family life</td><td>Weeks 9–10</td><td>Quiz 2</td><td>Quiz script</td></tr>
      <tr><td>4. Analyze institutional change</td><td>Weeks 11–13</td><td>Assignment 2</td><td>Submission</td></tr>
      <tr><td>5. Evaluate descriptively, without ruling</td><td>Week 14</td><td>Final</td><td>Exam script</td></tr>
      </tbody></table></div>
      <p><strong>Instructor Requirements.</strong> Baseline (§2), plus grounding in the sociology/history of the Muslim family as an institution. <strong>Islamic Scholarly Review.</strong> Family structure and gender roles are sensitive topics even at a purely descriptive/sociological level; the Scholarly Review Committee should confirm the weeks 5–7 and week-14 content is framed descriptively and does not drift into issuing new rulings on family matters — any specific ruling question raised in discussion should be referred to IE-405's advisory framework or out to qualified scholarly authority, not answered as sociology.</p>

      <h3>SPEC-3xx — Specialization Elective (Framework Note)</h3>
      <p>SPEC-3xx is the Advanced pathway's single specialization elective (Curriculum Framework §6, Course Catalogue §3, §9): a 2-unit, Advanced-tier slot whose department, prerequisite, outcome, and content all vary by which future Specialized Certificate track a learner previews (Curriculum Framework §2, Department Curriculum Design §8). It has no fixed content of its own — it is a placeholder slot filled by whichever department's certificate preview a learner chooses, never a competing course (Course Catalogue §9's duplication audit already confirms this) — so unlike every other entry in this catalogue, it cannot receive a full 28-field specification until a specific Specialized Certificate track exists to preview. This is not an oversight or a gap on the same footing as the Bookstore-text gaps above; it is how SPEC-3xx was designed to work from Curriculum Framework onward.</p>
      <p><strong>Framework for when a track is defined.</strong> Once a founder decision establishes at least one Specialized Certificate track (a future document's task, not this one's), SPEC-3xx's actual offerings should each receive their own full specification following this document's template, and should: (1) sit at the Advanced tier, 2 units, workload consistent with other 2-unit Advanced electives (§2); (2) draw its department, prerequisite, and content entirely from the certificate track it previews — never invented independently of that track; (3) use whichever assessment profile (§2) matches that content's nature, exactly as every other course in this catalogue does; (4) undergo the same Islamic Scholarly Review discipline as any other course drawing on religious content. No further action is needed on SPEC-3xx in Course Specifications beyond recording this framework — exactly the outcome anticipated when SPEC-3xx was left as a placeholder in Course Catalogue §3 ("framework only — no fixed content to specify").</p>

      <h2>12. Course Specifications Summary</h2>
      <p><strong>Completed courses (42/42), plus the SPEC-3xx framework note:</strong> §4 Foundation Studies — IS-101, QS-101, QS-102, AR-101, IE-101, RL-101. §5 Intermediate Islamic Studies — IS-201, IS-202, IS-203, QS-201, QS-202, AR-201, IC-201, IE-201, IE-202, RL-201. §6 Advanced Islamic Studies — IS-301, IS-302, IS-303, IS-304, IS-305. §7 Advanced Qur'anic Studies, Arabic, Civilization &amp; Society, Research — QS-301, QS-302, AR-301, AR-302, IC-301, RL-301. §8 Diploma: Islamic Studies &amp; Qur'anic Studies — IS-401, IS-402, IS-403, QS-401, QS-402. §9 Diploma: Arabic &amp; Research — AR-401, AR-402, RL-401. §10 Diploma: Islamic Education &amp; Tarbiyah (Teaching Track) — IE-401, IE-402 (provisional), IE-403, IE-404, IE-405. §11 Diploma: Islamic Civilization &amp; Society (Community Track), Plus SPEC-3xx — IC-401, IC-402, SPEC-3xx (framework note, not a full specification — see §11 above). Course Specifications is now complete: every course in the Course Catalogue has a full specification and syllabus.</p>
      <p><strong>Issues discovered:</strong> no structural inconsistency was found anywhere in Institutional Foundation through Course Catalogue across all 42 courses at full syllabus-level detail — department, program, prerequisite, and code assignments all held up from Foundation through Diploma. Eighteen genuine content gaps and scope questions surfaced instead, each flagged as its own decision below rather than filled in with invented material — missing Bookstore texts at every tier and in every department (most notably: the entire Islamic Civilization &amp; Society department has none, decision 40; the entire Advanced Islamic Studies tier has none, decision 41; the entire teaching track has none, decision 49), scope-sensitive courses needing dedicated Scholarly Review Committee sign-off (IS-304, IC-301, IE-402, IE-405, IC-402), and one course, IS-403, requiring full syllabus-level Committee approval before it can run at all. Two catalogue-level items were restated rather than resolved: IE-402's fully provisional placement (decision 32) and the absence of any teaching-practicum (Practical-type) course anywhere in the 42-course catalogue. SPEC-3xx received a framework note rather than a specification, as designed.</p>
      <p><strong>Decisions required:</strong> see §7.</p>

      <h2>13. Decisions Requiring Approval</h2>
      <p>Continuing the numbering from Institutional Foundation through Course Catalogue.</p>
      <ol start="34">
      <li><strong>No Foundation-level Fiqh primer in the Bookstore — open.</strong> IS-101 needs a beginner Fiqh-of-worship text; none currently exists in the catalogue. Sourcing and Scholarly Review Committee approval needed before this course's Required Texts field is final.</li>
      <li><strong>No Tajwid manual in the Bookstore — open.</strong> QS-101 and QS-102 both need one; flagged together since it's the same gap.</li>
      <li><strong>Instructor ijazah requirements for Qur'an/Tajwid teaching — open.</strong> QS-101 and QS-102 both note this; a founder decision on whether a formal ijazah is required, and in what riwayah, is needed before instructor qualifications can be finalized.</li>
      <li><strong>Riwayah/qira'ah choice — open.</strong> QS-101 and QS-102's specific rule content depends on which recitation style the Academy teaches. Not yet decided anywhere in Institutional Foundation through Course Catalogue; surfaced for the first time at this syllabus level of detail.</li>
      <li><strong>Purification of the Soul's fit for IE-101 — open.</strong> It's the closest Bookstore match for Foundation-tier adab content but may be pitched above this tier; Head of Department and Scholarly Review Committee should confirm before it's treated as the course's settled Required Text.</li>
      <li><strong>General study-skills resource for RL-101 — open, non-scholarly.</strong> A curriculum-design gap only — ordinary department discretion, no Scholarly Review Committee involvement needed. (IE-201's own communication/leadership materials gap is the same kind of non-scholarly curriculum-design gap and is tracked alongside this item rather than as a separate decision.)</li>
      <li><strong>No Bookstore text anywhere in the Islamic Civilization &amp; Society department — open.</strong> First surfaced at IC-201 (needs a dedicated history/civilization text) and IC-301 (§7); IC-401 and IC-402 confirm the same absence extends to them as well — the entire four-course department currently has no dedicated Bookstore text, not just one course. Instructor handouts are a placeholder throughout. Sourcing and Head of Department approval needed, ideally as one department-wide effort rather than four separate ones, before any of these four courses' Required Texts fields are final.</li>
      <li><strong>No Advanced-tier Islamic Studies texts in the Bookstore — open.</strong> IS-301, IS-302, IS-303, IS-304, and IS-305 each need a specialized text (Advanced Aqeedah, Usul al-Fiqh, Hadith Sciences, Islamic Thought, Islamic Ethics respectively); none currently exists in the catalogue at this depth. Grouped as one decision since it is one root cause — the Bookstore currently stocks introductory/general texts only — rather than five near-identical entries. Sourcing and Scholarly Review Committee approval needed before these five courses' Required Texts fields are final.</li>
      <li><strong>Scholarly Review Committee sign-off needed for IS-304's comparative theology framing — open.</strong> IS-304 (Islamic Thought) surveys historically contested theological schools comparatively; the Committee should confirm the "describe before evaluate" framing (weeks 2–7) before first delivery, distinct from and additional to decision 1.</li>
      <li><strong>No Advanced-level Arabic grammar text in the Bookstore — open.</strong> AR-301 (Arabic Grammar II) has outgrown <em>Arabic Language Foundations</em> (used at AR-101/AR-201); no text currently in the catalogue covers Advanced-tier morphology and syntax. Distinct from decision 41 since this is a language, not a religious-sciences, gap. Sourcing and Head of Department approval needed before this course's Required Texts field is final.</li>
      <li><strong>No comparative-Fiqh text in the Bookstore — open.</strong> IS-401 needs a text presenting rulings across multiple schools; none currently exists in the catalogue. Sourcing needed, and any candidate text should itself be reviewed given IS-401's direct dependency on decision 1.</li>
      <li><strong>No takhrij-methodology text in the Bookstore — open.</strong> IS-402 needs a practical hadith-sourcing methodology text; none currently exists in the catalogue.</li>
      <li><strong>IS-403 (Contemporary Islamic Issues) requires full Scholarly Review Committee syllabus approval before delivery — open, highest priority.</strong> Every issue area, case, and reading for this course must be Committee-approved, not merely reviewed after the fact, given the sensitivity of live contemporary questions; this is broader than a text-sourcing gap and blocks the course from running as specified until that approval is obtained.</li>
      <li><strong>Depth-adequacy of <em>Introduction to Quranic Sciences</em> for QS-402 — open.</strong> The same Bookstore title served QS-202 at introductory depth; whether it also covers naskh and i'jaz at Diploma depth, or a second text is needed, should be confirmed by the Head of Department before this course's Required Texts field is final.</li>
      <li><strong>No original classical-Arabic source-reading excerpts in the Bookstore — open.</strong> AR-401 needs a collection of unvocalized classical Arabic excerpts for source-reading practice; the Bookstore's existing Arabic-language religious texts are English-facing, not a substitute. Sourcing needed; any collection drawing on religious texts should have its excerpts cleared by the Scholarly Review Committee before classroom use.</li>
      <li><strong>No Islamic-pedagogy/teaching-methodology text in the Bookstore — open.</strong> IE-401, IE-402, IE-403, IE-404, and IE-405 all share this one gap (teaching methodology, da'wah methodology, curriculum design, youth education, and family education respectively) — grouped as one decision, the teaching track's counterpart to decision 41's Advanced Islamic Studies grouping, rather than five near-identical entries. Sourcing needed at ordinary department discretion; non-scholarly except where noted per course above.</li>
      <li><strong>IE-402 (Da'wah &amp; Outreach) remains fully provisional — open, restated.</strong> Decision 32 (tier, prerequisite, and track placement) is unchanged since Course Catalogue; this document drafted IE-402 at its current working placement so a specification exists, but every field is provisional pending that decision, consistent with Course Catalogue's own caveat.</li>
      <li><strong>No teaching-practicum (Practical-type) course exists — open, restated.</strong> Course Catalogue's catalogue audit (§8) found no course of type "Practical" anywhere in the 42-course catalogue; IE-401's microteaching segments are embedded practice within a lecture-format course, not a dedicated practicum/placement. Whether to add one is a catalogue-level decision outside this document's scope, flagged again here since §10 (the Diploma teaching track) is where it would most naturally sit.</li>
      </ol>
      <p><em>Ulul Azm Academy — Course Specifications &amp; Syllabi — COMPLETE across all subject groups (Foundation Studies; Intermediate Islamic Studies; Advanced Islamic Studies; Advanced Qur'anic Studies/Arabic/Civilization &amp; Society/Research; Diploma — Islamic Studies &amp; Qur'anic Studies; Diploma — Arabic &amp; Research; Diploma — Islamic Education &amp; Tarbiyah teaching track; Diploma — Islamic Civilization &amp; Society community track plus SPEC-3xx). Prepared for Founder review. All 42 courses in the Course Catalogue now have a full specification and syllabus, plus a framework note for SPEC-3xx. These specifications are illustrative and pending decisions 34–51 above (decision 40 now covers the whole Islamic Civilization &amp; Society department), plus every open decision inherited from earlier documents that a given course depends on — most centrally Institutional Foundation §12 decision 1 (madhab adoption), the riwayah/qira'ah choice (decision 37), and IE-402's fully provisional placement (decision 32). None of these open decisions block using this document as the Academy's working course-specification reference; they block only the specific fields each one touches.</em></p>
    `.trim(),
  },
  'academy-assessment-grading': {
    title: 'Assessment, Grading & Progression',
    bodyHtml: `
      <p><strong>Assessment, Grading &amp; Progression Framework.</strong> Using the Institutional Foundation, Academic Governance, Academic Pathways, Curriculum Framework, Department Curriculum Design, Course Catalogue, and Course Specifications documents as the fixed academic foundation, this framework defines how the Academy measures, grades, and progresses learners: the two assessment families, CLO/PLO alignment, the grading scale, practical rubrics, progression rules, and graduation requirements per pathway tier. It does not redesign departments, programs, prerequisites, the course catalogue, or any course's own specification (the Curriculum Framework through Course Specifications documents); it formalizes how those are measured. Where the platform already has real, live grading and eligibility logic, this framework codifies that logic rather than inventing a second one — and corrects the one real conflict found between that live logic and the Course Specifications' published text (§4.3, §9 decision 52).</p>

      <h2>1. Scope &amp; Constraints</h2>
      <p>This document defines the Academy's assessment, grading, and progression framework: how the two assessment families introduced informally across Course Specifications are formalized institution-wide, how course-level outcomes roll up into program-level achievement, how raw scores become grades and academic standing, how learners move through the Foundation → Intermediate → Advanced → Diploma pathway, and what graduation requires at each stage. It does not redesign the department structure, programs, prerequisites, or course catalogue (Curriculum Framework through Course Catalogue) or the course specifications themselves (Course Specifications); it formalizes how those are measured and progressed. Where this document's grading scale, GPA formula, attendance-fail rule, or graduation-eligibility logic already exist as real, implemented, already-enforced code in the platform (<code>lib/grading.js</code>, <code>lib/attendancePolicy.js</code>, <code>lib/graduationEligibility.js</code>, and the underlying Prisma schema), this document codifies that existing system rather than inventing a second, competing one — the two must never diverge. One genuine conflict between Course Specifications's published course specifications and the platform's already-live grading scale was found while writing this document; it is corrected here and then mechanically applied back to all 42 Course Specifications course specifications (§9, decision 52), rather than leaving two published documents disagreeing.</p>
      <p>This grading and GPA system is Ulul Azm Academy's own internal system, designed for its own curriculum and assessment structure. It is not represented, and should not be represented, as equivalent to the grading scale, credit system, or GPA scale of any other institution, ministry of education, or accrediting body. Any future credential-recognition or transfer-credit claim is a separate institutional decision, outside this document's scope.</p>

      <h2>2. The Two Assessment Families</h2>
      <p>Every assessment used anywhere in the catalogue (Course Specifications) falls into exactly one of two families. This is a formal restatement of a distinction Course Specifications already used implicitly through its three assessment-weighting profiles (Core/Language/Research; Recitation/Hifz; Character/practical) — not a new design.</p>
      <p><strong>Knowledge Assessment</strong> measures knowledge, understanding, and analysis through written or oral academic performance: quizzes, assignments, midterms, final examinations, essays, research papers, and oral examinations. It is scored numerically (0–100, or a maxScore-relative equivalent) and maps directly onto the components already named in every Course Specifications course specification — Quiz 1/2/3, Assignment 1/2/3, Midterm, Final.</p>
      <p><strong>Practical Assessment</strong> measures demonstrated competence rather than written performance: Qur'an recitation, Hifz, Tajweed, Arabic conversation, Arabic reading, teaching demonstrations, presentations, public speaking, research presentations, and practical projects. It is scored against a rubric (§6) by an instructor's direct observation, not by a written script — already used by name in Course Specifications wherever a "Practical" component or a "Practical Competency Rubric" appears (QS-301, AR-302, IE-401/402/404/405, and RL-401's oral defense).</p>
      <p>A course's assessment plan (Course Specifications, per course) draws on one or both families according to its content — a pure lecture course (e.g. IS-302) uses Knowledge Assessment only; a pure skills course (e.g. AR-302) uses Practical Assessment only, or nearly so; most courses in between use both, weighted per §4's profiles. No course needs a type it does not use — the point of formalizing the two families here is a shared vocabulary and a shared rubric standard (§6), not a requirement that every course use both.</p>

      <h2>3. Assessment Alignment</h2>
      <h3>3.1 Course level: CLO → Assessment → Evidence → Grade</h3>
      <p>Every course in Course Specifications already carries a CLO → Teaching Activity → Assessment → Evidence table mapping each Course Learning Outcome to how it is taught and assessed. This document adds the final link already implicit but not previously named: <strong>Evidence → Grade</strong> — the rule by which a piece of evidence (a quiz script, an assignment submission, an instructor observation record, an exam script) becomes a numeric score, and how that course's scores become one overall course grade. That rule is §4.2's weighted-profile formula, applied uniformly to every course using the profile its own specification already names. Nothing here changes any individual course's CLOs, teaching activities, or assessments (Course Specifications already fixed those, per-course) — this section only names the missing final step and makes it uniform.</p>
      <h3>3.2 Program level: PLO → Courses → Assessments → Achievement</h3>
      <p>The Academy has not previously stated Program Learning Outcomes (PLOs) as a named, numbered list — Academic Pathways (Pathways) and Course Specifications (per-course CLOs) between them establish everything a PLO framework needs, but nothing before this document synthesized it upward into program-level outcomes. The seven PLOs below are derived bottom-up from the 42 already-specified courses' own CLOs and from the six areas the Diploma in Islamic Studies draws from (per its own seeded description: Islamic Studies, Qur'anic Studies, Arabic Language, Islamic Education &amp; Tarbiyah, Islamic Civilization &amp; Society, Research &amp; Learning Skills), plus one integrative outcome spanning all of them — not invented independently of that existing content.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>PLO</th><th>Program Learning Outcome</th><th>Primary contributing courses (representative, not exhaustive)</th><th>Primary assessment evidence</th></tr></thead>
      <tbody>
      <tr><td>PLO 1</td><td>Reason within the Academy's confirmed Ahlus-Sunnah-wal-Jama'ah, Salaf-understanding manhaj on core Aqeedah and Fiqh questions, distinguishing settled positions from areas of legitimate scholarly difference.</td><td>IS-101, IS-201, IS-202, IS-301, IS-302, IS-401, IS-403</td><td>Written examinations, comparative-analysis assignments, IS-403's category-identification case work</td></tr>
      <tr><td>PLO 2</td><td>Recite the Qur'an with correct Tajweed and demonstrate sustained memorization and comprehension consistent with the program's tier.</td><td>QS-101, QS-102, QS-201, QS-202, QS-301, QS-302, QS-401, QS-402</td><td>Recitation and Hifz practicals (§6), Tafsir written work</td></tr>
      <tr><td>PLO 3</td><td>Read, understand, and produce Arabic at a functional level across reading, writing, conversation, and classical source text.</td><td>AR-101, AR-201, AR-301, AR-302, AR-401, AR-402</td><td>Grammar examinations, conversation and writing practicals (§6)</td></tr>
      <tr><td>PLO 4</td><td>Teach Islamic content effectively and appropriately to the audience — general, youth, or family — using sound pedagogical method.</td><td>IE-101, IE-201, IE-202, IE-401, IE-402, IE-403, IE-404, IE-405</td><td>Microteaching and advising practicals (§6), curriculum-design assignments</td></tr>
      <tr><td>PLO 5</td><td>Situate Islamic thought and practice within its historical, civilizational, and social context, distinguishing historical/sociological analysis from ruling-issuance.</td><td>IC-201, IC-301, IC-401, IC-402, IS-304, IS-305</td><td>Case-study analyses, written examinations</td></tr>
      <tr><td>PLO 6</td><td>Locate, evaluate, and cite sources correctly, and produce a properly structured piece of independent research.</td><td>RL-101, RL-201, RL-301, RL-401</td><td>Research proposal, literature review, capstone project and oral defense (§6)</td></tr>
      <tr><td>PLO 7 (integrative)</td><td>Demonstrate the practiced character (akhlaq) and referral judgment expected of a graduate operating within Islamic Scholarly Review boundaries — recognizing when a question exceeds one's own or the course's scope.</td><td>IE-101, IE-202, IS-305, IE-405, IC-301, IS-403</td><td>Instructor-attested practicals, referral-practice assessments</td></tr>
      </tbody></table></div>
      <p>A given course's contribution to a PLO is exactly the contribution already stated in its own specification in Course Specifications (its CLOs and assessments) — this table is a cross-reference index into that existing content, not a second copy of it. <strong>Achievement</strong> at the PLO level is reported at two points: informally, at each pathway-tier completion (§8), by the learner's academic advisor reviewing whether the tier's courses were passed; formally, at Diploma completion, as part of the graduation-eligibility check (§7.9) — the existing curriculum-completion check (all required courses passed, all required credit hours earned) is, in substance, already a PLO-achievement check, since Course Catalogue's curriculum was built to deliver every PLO across the full course list.</p>

      <h2>4. Grading System</h2>
      <h3>4.1 Grade scale (existing, codified here — not new)</h3>
      <p>The Academy already has one official grading scale, implemented in <code>lib/grading.js</code> and displayed to students as <code>GRADING_SYSTEM</code> in the Academic Progress pages. This document adopts it exactly as it already exists — it is not redesigned, only stated here as the formal institutional policy so every future document and every printed document can cite one source.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Score</th><th>Letter</th><th>Grade Point (5.00 scale)</th><th>Descriptor</th></tr></thead>
      <tbody>
      <tr><td>95 – 100</td><td>A+</td><td>5.0</td><td>Exceptional</td></tr>
      <tr><td>90 – 94</td><td>A</td><td>4.5</td><td>Excellent</td></tr>
      <tr><td>85 – 89</td><td>B+</td><td>4.0</td><td>Very Good</td></tr>
      <tr><td>80 – 84</td><td>B</td><td>3.5</td><td>Good</td></tr>
      <tr><td>75 – 79</td><td>C+</td><td>3.0</td><td>Above Average</td></tr>
      <tr><td>70 – 74</td><td>C</td><td>2.5</td><td>Satisfactory</td></tr>
      <tr><td>65 – 69</td><td>D+</td><td>2.0</td><td>Below Average</td></tr>
      <tr><td>60 – 64</td><td>D</td><td>1.5</td><td>Minimum Pass</td></tr>
      <tr><td>0 – 59</td><td>F</td><td>0.0</td><td>Fail</td></tr>
      </tbody></table></div>
      <p>The Academy's official GPA scale runs to a maximum of 5.00 (<code>MAX_GPA</code>), not the more commonly seen 4.00 — this is a deliberate, already-implemented institutional choice, and every GPA figure the Academy publishes should be shown alongside its scale ("3.75 / 5.00"), never bare, precisely because 5.00-point scales are not universal. Semester GPA and CGPA are both computed live, credit-hour-weighted, from a student's actual final letter grades — never hand-entered — exactly as <code>computeGpa()</code> already does; this document does not add a second computation method.</p>
      <h3>4.2 Overall course score: the weighted-profile formula</h3>
      <p>Course Specifications §2 already defines three assessment-weighting profiles by component percentage. This document states, for the first time as an explicit formula, how those percentages combine into the one overall course score that <strong>60% is measured against</strong> (§4.3):</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Profile</th><th>Formula</th><th>Used by</th></tr></thead>
      <tbody>
      <tr><td>Core/Language/Research</td><td>Quizzes×15% + Assignments×20% + Midterm×25% + Final×40%</td><td>Most Knowledge-Assessment-only or Knowledge-dominant courses</td></tr>
      <tr><td>Recitation/Hifz</td><td>Quizzes×10% + Assignments×10% + Midterm×20% + Practical×30% + Final×30%</td><td>Qur'an/Tajweed/Hifz courses (e.g. QS-101, QS-201, QS-301)</td></tr>
      <tr><td>Character/practical</td><td>Quizzes×10% + Assignments×25% + Midterm×20% + Practical×25% + Final×20%</td><td>Adab, teaching-practice, and advising courses (e.g. IE-101, IE-202, IE-401)</td></tr>
      </tbody></table></div>
      <p>Where a course specification names more than one Quiz or Assignment (Quiz 1/2/3, Assignment 1/2/3), those are averaged within their own component before the profile weighting is applied — the profile weights the <em>component</em> (all quizzes together, all assignments together), not each individual item separately, exactly as every Course Specifications CLO-alignment table already treats them.</p>
      <h3>4.3 Minimum pass — correcting a real conflict with Course Specifications</h3>
      <p><strong>Correction.</strong> Course Specifications's 42 course specifications state course passing as "50% overall, no component below 40%" (or the Recitation/Hifz and Character/practical equivalents). That 50% figure was never checked against the Academy's own already-implemented grading scale (§4.1) while Course Specifications was being written, and it conflicts with it: under that scale, anything from 0–59% is letter grade F ("Fail"), and only 60% and above is a passing grade (D, "Minimum Pass"). A learner scoring 50–59% overall would, under Course Specifications's stated threshold, be told they passed the course, while the platform's own grading logic — already live, already shown to students — would record and display an F. This is exactly the kind of serious inconsistency that should be corrected rather than left standing once found. <strong>The corrected rule, effective for all 42 courses, is: minimum overall pass = 60% (letter grade D or better), with the existing "no single component below 40%" floor kept unchanged as a separate, stricter anti-neglect safeguard,</strong> and the Recitation/Hifz profile's existing "Practical+Final combined minimum 60%" rule is unaffected, since it was already set at 60% and was never the inconsistent figure. This correction is applied mechanically to all 42 course specifications immediately after this document is published (§9, decision 52), not left as a standing discrepancy between two published documents.</p>
      <h3>4.4 Incomplete</h3>
      <p>A grade of Incomplete applies when a student has done passing-quality work but could not finish one or more required components for a genuine, documented reason (illness, emergency, approved leave) before the term's grading deadline. Incomplete is not a grade on the 4.1 scale — it is a temporary administrative hold: the student has one full subsequent term to complete the outstanding work, after which an actual letter grade is recorded from whatever was completed (outstanding components scored as zero if still missing). An Incomplete left unresolved past that one-term window converts automatically to F. Only the instructor of record, with academic administration's sign-off, may grant an Incomplete — a student cannot request one merely to avoid a low score on completed work. <em>Implementation note (§9, decision 53): the <code>Grade</code> model currently stores only raw component scores with no status field, so "Incomplete" cannot yet be recorded as a distinct state distinguishable from "not yet graded" — this policy is ready to enforce administratively today, but a schema field is needed before it can be tracked and displayed automatically.</em></p>
      <h3>4.5 Reassessment (Makeup)</h3>
      <p>Reassessment is a single supplementary opportunity to sit a missed or failed Knowledge Assessment component, under the already-existing <code>MAKEUP</code> exam type (<code>ExamType</code>, alongside QUIZ/MIDTERM/FINAL) — this document formalizes policy around a mechanism the schema already supports, rather than inventing a new one. Reassessment is available when: (a) a component was missed for a documented, approved reason (illness, emergency — the same standard as Incomplete), scheduled as soon as practicable after the original; or (b) a student's overall course score falls in the 50–59% band (below the 60% pass line, §4.3) at Final Examination stage, in which case one Reassessment of the Final component only is offered, capped at the minimum passing score (60%) regardless of the raw mark achieved on reassessment — a Reassessment corrects a near-miss, it does not let a student out-perform their original attempt into a higher band. Reassessment is not available for Practical components below Mastery band (§6) purely on the grounds of a low score — practical competence is rebuilt through repeating the course's practicum weeks, not resat as a single exam. A student may not sit more than one Reassessment per component per course attempt.</p>
      <h3>4.6 Failed course</h3>
      <p>A course is failed when the final overall score (§4.2) is below 60% (§4.3), or when the learner fails on attendance grounds under the Academy's existing attendance policy (<code>lib/attendancePolicy.js</code>: 25% absence in a course is an automatic fail and repeat requirement, regardless of any assessment score — this document defers to that policy exactly as it already exists rather than restating a second attendance rule). A failed course must be repeated and passed before it, or any course that names it as a prerequisite, can be counted toward graduation (§7.9 already enforces this for the whole program; §7 below states it as explicit course-level policy too).</p>
      <h3>4.7 Academic standing</h3>
      <p>The Academy's <code>AcademicStanding</code> enum (GOOD_STANDING, DEANS_LIST, PROBATION, SUSPENDED) already exists in the schema and is recorded once per student per term on <code>TermRecord</code>, alongside that term's GPA and credit hours — but no threshold has previously been defined for which GPA or outcome produces which standing. This document sets those thresholds for the first time:</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Standing</th><th>Criteria (per term)</th><th>Consequence</th></tr></thead>
      <tbody>
      <tr><td>Dean's List</td><td>Term GPA ≥ 4.50 (A average) and no failed course that term</td><td>Formal recognition; noted on the student's record</td></tr>
      <tr><td>Good Standing</td><td>Term GPA ≥ 2.50 (C average) and fewer than two failed courses that term</td><td>Normal progression, no restriction</td></tr>
      <tr><td>Probation</td><td>Term GPA below 2.50, OR two or more failed courses in the term</td><td>Remediation plan required (§7.6); course load may be capped by the academic advisor</td></tr>
      <tr><td>Suspended</td><td>A second consecutive term on Probation without meeting the remediation plan's terms, OR Term GPA below 1.50, OR three or more failed courses in one term</td><td>Enrollment suspended for a defined period (Student Affairs sets the term); re-admission requires a Student Affairs review</td></tr>
      </tbody></table></div>
      <p>Per-term <code>AcademicStanding</code> (on <code>TermRecord</code>) is distinct from the account-level <code>StudentStatus</code> (APPLICANT/ADMITTED/ACTIVE/SUSPENDED/DEFERRED/GRADUATED/WITHDRAWN/DISMISSED, on <code>StudentProfile</code>): a student can reach Suspended academic standing for a term, which is the trigger, not the same event, as Student Affairs then changing their account-level status to SUSPENDED — the first is a computed academic snapshot, the second is an administrative action taken in response to it.</p>

      <h2>5. Practical Assessment Framework</h2>
      <p>Practical Assessment (§2) is scored by direct instructor observation against a rubric, not a written script, and — for courses using the Recitation/Hifz or Character/practical profiles (§4.2) — contributes 25–30% of the overall course score. Every Practical Competency Rubric already written into a Course Specifications course (QS-301, AR-302, IE-401, IE-402, IE-404, IE-405, RL-401) uses the same four-band structure: <strong>Not yet competent / Developing / Competent / Mastery</strong>. This document formalizes that structure as the institution-wide standard (§6) rather than a coincidence of independent course design, and states the scoring rule that was implicit but never stated in Course Specifications: Not yet competent = below 60% of the Practical component's weight; Developing = 60–74%; Competent = 75–89%; Mastery = 90–100% — aligned to the same 60% minimum-pass line as every other component (§4.3), so a Practical score is never graded on a different implicit scale than the rest of the course.</p>
      <p><strong>Implementation note (§9, decision 54):</strong> the <code>Grade</code> model has fields for <code>quiz1</code>, <code>quiz2</code>, <code>assignment</code>, <code>midterm</code>, and <code>final</code> only — there is no <code>practical</code> field, and no field for a third quiz or a second/third assignment, even though Course Specifications's syllabi (and this document's own §4.2 formula) reference up to three of each plus a Practical component for many courses. This is a real, structural gap between the assessment framework this document defines and what the platform can currently store: today, an instructor teaching a Recitation/Hifz or Character/practical course has no field to record a Practical score at all, and must either omit it from the stored Grade or work around the schema informally. This document does not change the schema itself — that is a decision for engineering, not for a content model — but names the gap precisely so it can be resolved: at minimum, a <code>practical</code> Float field and either a flexible per-component JSON breakdown or explicit <code>quiz3</code>/<code>assignment2</code>/<code>assignment3</code> fields are needed for the <code>Grade</code> model to actually store what Course Specifications and this document together specify every course should be assessed on.</p>

      <h2>6. Practical Rubric Principles</h2>
      <p>Each area below states the competencies a rubric for that skill must cover and the same four-band standard (§5) applied to it — a set of principles an instructor can build a specific rubric from, consistent with the specific rubrics Course Specifications already wrote for individual courses (QS-301, AR-302, IE-401/402/404/405, RL-401), not a replacement for them.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Area</th><th>What the rubric must assess</th><th>Anchor course(s) already using this structure</th></tr></thead>
      <tbody>
      <tr><td>Qur'an recitation</td><td>Rule accuracy (Tajweed applied correctly); fluency and pacing; self-correction without prompting; ability to explain a rule on request</td><td>QS-301 (full rubric already written)</td></tr>
      <tr><td>Tajweed</td><td>Same four criteria as recitation, assessed at the tier's expected rule set (introductory rules at QS-101/102, full mastery-level application by QS-301); riwayah/qira'ah-specific criteria pending decision 37</td><td>QS-101, QS-102, QS-201, QS-301</td></tr>
      <tr><td>Hifz</td><td>Accuracy of memorized text against the mus'haf; consistency across repeated recitation (not a one-time success); ability to resume correctly from an arbitrary starting point; retention over time, not only immediately after memorizing</td><td>(No dedicated Hifz course exists yet in the 42-course catalogue outside Tajweed/recitation integration — see decision 55)</td></tr>
      <tr><td>Arabic speaking</td><td>Fluency and pacing; grammatical accuracy in spontaneous speech; comprehension of a partner's speech in real time; appropriateness of register for context</td><td>AR-302 (full rubric already written)</td></tr>
      <tr><td>Teaching demonstration</td><td>Lesson structure and pacing; clarity of explanation; classroom management/engagement; responsiveness to learner questions; improvement from feedback across attempts</td><td>IE-401, IE-404 (microteaching)</td></tr>
      <tr><td>Presentations / public speaking</td><td>Structure and clarity; delivery (pacing, eye contact, audibility); command of content without reading verbatim; handling of audience questions</td><td>IE-402 (scenario practice), IE-405 (simulated consultation)</td></tr>
      <tr><td>Research presentation</td><td>Clarity of the research question and findings; quality of argument and evidence; response to panel questions under the oral-defense format; time management</td><td>RL-401 (capstone defense, full rubric already written)</td></tr>
      </tbody></table></div>
      <p>Every Practical rubric, whatever the area, is instructor-attested, not purely computed (Course Specifications §2's own phrasing for the Character/practical profile) — a numeric band score is the record kept for grading purposes, but the instructor's judgment of what that band reflects is the actual assessment, consistent with how every course-level rubric in Course Specifications already describes itself.</p>

      <h2>7. Progression Rules</h2>
      <h3>7.1 Course completion</h3>
      <p>A course is complete once a final overall score (§4.2) has been recorded and the course is not left as Incomplete (§4.4). Completion with a passing score (§4.3) satisfies any prerequisite that names the course and counts toward the program's required credit hours; completion with a failing score does not, and the course remains outstanding until repeated and passed (§7.7) — this already matches, exactly, how <code>computeGraduationEligibility</code> and <code>getCoursePlanOverview</code> already treat a failed course today.</p>
      <h3>7.2 Prerequisite completion</h3>
      <p>Every course's stated prerequisite (Course Catalogue's catalogue, Course Specifications's per-course metadata table) must be passed — not merely attempted — before enrollment in the course that names it as a prerequisite, matching the schema's existing self-referencing <code>Course.prerequisites</code> relation. A student who fails a prerequisite mid-term while already enrolled in a course that depends on it is not retroactively unenrolled from the dependent course that term, but may not enroll in any further course that depends on the still-failed prerequisite until it is repeated and passed.</p>
      <h3>7.3 Pathway progression (Foundation → Intermediate → Advanced → Diploma)</h3>
      <p>The four-tier pathway (Academic Pathways) is, today, tracked only informally: the tier a course belongs to lives in its course code (Course Catalogue's <code>[DEPT]-[LEVEL][SEQ]</code> format) and in Department Curriculum Design/7's content, not as a queryable field on <code>Course</code> or <code>StudentProfile</code> — the platform's actual level-progression logic (<code>getAcademicLevelProgress</code>) computes a generic numeric "Level 1 of N" from total courses ÷ programme duration years, which is not currently wired to Foundation/Intermediate/Advanced/Diploma tier names at all (the Academy's seeded programme has no <code>durationYears</code> set, so this computation is presently a no-op for it). Until that is resolved (§9, decision 56), pathway-tier progression is an advisor-confirmed milestone, not a system-enforced gate: a student's academic advisor reviews their completed courses against Department Curriculum Design/6's tier course lists and confirms a tier is complete when every course the tier's own program list requires has been passed. A student is not blocked from enrolling in a higher-tier course by the system today if they have the specific course-level prerequisite (§7.2) satisfied, even if their broader tier is not yet advisor-confirmed complete — prerequisite chains (§7.2), not tier gates, are what currently enforce sequencing, and they do so correctly for every course Course Catalogue defined a prerequisite for.</p>
      <h3>7.4 Academic probation</h3>
      <p>Governed by §4.7's standing table. A student placed on Probation must meet with their academic advisor within two weeks of the standing being recorded to agree a remediation plan (§7.6); the advisor may cap the student's course load for the following term. Probation is a per-term standing, not a permanent record — a student who returns to Good Standing the following term is no longer on Probation, though the prior term's Probation remains part of their academic history (via <code>TermRecord</code>).</p>
      <h3>7.5 Reassessment</h3>
      <p>See §4.5 — the same policy applies whether reassessment is being considered as an isolated missed-component event or as part of a Probation remediation plan.</p>
      <h3>7.6 Remediation</h3>
      <p>A remediation plan is agreed between a Probation-standing student and their academic advisor and may include: a reduced course load; mandatory attendance at the Academy's existing tutoring support (<code>TutoringRequest</code>, already in the schema); a required repeat of any failed prerequisite course before any dependent course is attempted; and, for Practical-heavy courses, additional supervised practice sessions before the next Practical assessment. Remediation is advisory and support-focused, not punitive — its purpose is returning the student to Good Standing, and failing to engage with an agreed plan (not merely remaining on Probation itself) is what triggers Suspension consideration (§4.7).</p>
      <h3>7.7 Repeat courses</h3>
      <p>A failed course (§4.6) must be repeated in a later term and passed before it or any dependent course counts toward graduation. <strong>Current implementation.</strong> The <code>Grade</code> model is uniquely keyed on <code>[studentId, courseId]</code> only — not per term — so a repeat attempt's grade is recorded by updating that same Grade record; the new final score and letter replace the failing one as the course's current, transcript-facing grade. The originally-failed term's own <code>TermRecord</code> (GPA and standing for that specific term) is not retroactively altered — the historical record of having failed and repeated the course remains visible through term history even though the <code>Grade</code> row itself now shows only the passing result. <strong>Policy.</strong> This "latest attempt replaces" approach is what today's schema supports without a structural change and is the Academy's policy for now; a student may attempt a given course no more than twice before requiring Academic Administration's explicit approval for a third attempt. If the Academy later wants a repeated course's original failing attempt to remain independently visible at the Grade level too (rather than only via term history) — a fuller "all attempts on the transcript" model some institutions use — that needs its own schema change (§9, decision 57) and is a founder-level policy choice, not something this document decides unilaterally.</p>
      <h3>7.8 Withdrawal</h3>
      <p>Two levels exist, both already represented in the schema. A student may withdraw from a single course, before a defined drop deadline each term, through the existing <code>COURSE_ADD_DROP</code> request type — this leaves no failing grade on record, distinct from a fail. A student may withdraw from the program entirely, which moves their <code>StudentStatus</code> to <code>WITHDRAWN</code> (an administrative action by Student Affairs, following the student's request) — courses already passed remain on record, but the student is no longer active in the program and re-entry, if sought later, is treated as a fresh admission decision rather than an automatic resumption. A <code>LEAVE_OF_ABSENCE</code> or <code>DEFERMENT</code> request (both already existing request types) is the correct route for a temporary pause that is not a withdrawal — the student's status moves to <code>DEFERRED</code> rather than <code>WITHDRAWN</code>, and resumption is expected, not a fresh admission decision.</p>
      <h3>7.9 Graduation eligibility</h3>
      <p>Program-level graduation eligibility is already computed server-side, in full, by <code>computeGraduationEligibility()</code> — not something this document needs to redesign. It checks, in order: the student's account status permits graduation (not SUSPENDED/WITHDRAWN/DISMISSED); the student is assigned to a programme with a configured curriculum; every required course in that curriculum has been passed (a failed course counts as outstanding until repeated and passed, per §7.7); every required credit hour has been earned; and, where the programme's duration/level data is configured, all required academic levels are complete. <strong>One correction this document makes to that logic's inputs, not its structure:</strong> "passed" there is currently determined from <code>grade.final</code> alone (via <code>gradeLetter</code>), i.e. the raw Final-exam score only — not the weighted overall course score this document defines in §4.2. For a Core/Language/Research-profile course this rarely changes the outcome (Final is already the largest single component, 40%), but for a Recitation/Hifz or Character/practical course, where Final is 20–30% and Practical is another 25–30%, a student could show a passing weighted overall score while their eligibility check looks only at a Final score in the 50s, or the reverse. This is flagged, not silently patched, as decision 58 (§9): graduation eligibility should ultimately check the same §4.2 weighted overall score this document defines everywhere else, which in turn depends on the <code>practical</code> field (§5, decision 54) existing to compute that score at all for Practical-bearing courses.</p>

      <h2>8. Graduation Requirements</h2>
      <p>The Academy currently issues one formal, system-tracked graduation event per student (<code>GraduationApplication</code> is uniquely keyed to one row per student) — the Diploma. Foundation, Intermediate, and Advanced tier completions are real curricular milestones (Academic Pathways, Department Curriculum Design, Course Catalogue all treat them as such) but are not, today, separate system-enforced "graduations" with their own application/clearance workflow; they are advisor-confirmed progression checkpoints (§7.3). This section states requirements for all five, at the level each can actually be enforced today.</p>
      <h3>8.1 Foundation completion</h3>
      <p>Every course in the Foundation-tier program list (Course Catalogue §4: IS-101, QS-101, QS-102, AR-101, IE-101, RL-101 — 6 courses, all Core) passed at 60% or above (§4.3). Confirmed by the academic advisor, not a separate application. A student may begin Intermediate-tier courses as soon as each one's own specific prerequisite (§7.2) is met, even before full advisor confirmation of Foundation completion — see §7.3's caveat.</p>
      <h3>8.2 Intermediate completion</h3>
      <p>Every course in the Intermediate-tier program list (Course Catalogue §4: 10 courses — IS-201/202/203, QS-201/202, AR-201, IC-201, IE-201/202, RL-201) passed at 60% or above, plus Foundation completion (§8.1). Advisor-confirmed, same basis as §8.1.</p>
      <h3>8.3 Advanced completion</h3>
      <p>Every required course in the Advanced-tier program list (Course Catalogue §4: 11 courses — IS-301–305, QS-301/302, AR-301/302, IC-301, RL-301) passed at 60% or above, plus the single required SPEC-3xx specialization elective (Course Catalogue §3, Course Specifications §11's framework note) completed under whichever department's content it drew from, plus Intermediate completion (§8.2). Advanced completion is the normal entry point into the Diploma tier (per the programme's own seeded description: "Entry normally follows completion of Advanced Islamic Studies").</p>
      <h3>8.4 Diploma completion (formal graduation)</h3>
      <p>Every required Diploma-tier course (Course Catalogue §4: 14 courses across IS-401/402/403, QS-401/402, AR-401/402, IE-401/402(provisional)/403/404/405, IC-401/402, RL-401) passed at 60% or above, plus Advanced completion (§8.3) — together, every one of the 42 courses in Course Catalogue's catalogue plus SPEC-3xx. This is the one graduation event the platform already fully implements: eligibility is computed by <code>computeGraduationEligibility()</code> (§7.9), the student then applies via <code>GraduationApplication</code>, each relevant office clears them independently via <code>GraduationClearance</code> (library, finance, academic administration, etc., per <code>Unit</code>), and the Registrar's final approval moves the application to <code>COMPLETED</code>, which is when the official <code>GraduationDocument</code>(s) are issued.</p>
      <h3>8.5 Certificate completion</h3>
      <p>Two distinct things fall under this heading, and they should not be conflated. First, the Diploma itself is issued as a formal document once <code>GraduationApplication.status</code> reaches <code>COMPLETED</code> — the existing <code>GraduationDocumentType</code> enum offers <code>CERTIFICATE</code> and <code>STATEMENT_OF_COMPLETION</code>, and this document recommends <code>CERTIFICATE</code> be the type issued for Diploma completion itself, with <code>STATEMENT_OF_COMPLETION</code> reserved for the tier-level completions (§8.1–8.3) if and when the Academy chooses to formalize those with an issued document rather than only an advisor confirmation — that choice, and the exact document-type mapping, should be confirmed by Academic Administration rather than assumed here (§9, decision 59). Second, a future Specialized Certificate track (previewed today only by SPEC-3xx, per Curriculum Framework §2 and Department Curriculum Design §8) would be its own short credential, awarded on completion of that specific track's courses — since no Specialized Certificate track has been defined yet (Course Specifications §11 explicitly left SPEC-3xx as a framework note, not real content), "Certificate completion" in that sense has no requirements to state until a future document defines an actual track; this document only reserves the framework (a Specialized Certificate follows the same course-completion-plus-clearance shape as §8.4, scaled to a shorter course list) so a future document does not have to invent that shape from nothing.</p>

      <h2>9. Decisions Requiring Approval</h2>
      <p>Continuing the numbering from Institutional Foundation through Course Specifications.</p>
      <ol start="52">
      <li><strong>Correction applied: Course Specifications's "50% overall" passing threshold is being replaced with 60% across all 42 courses — action taken, not open.</strong> §4.3 explains the conflict with the Academy's already-live grading scale; this correction is mechanically applied to every Course Specifications course specification immediately after this document is published, and is recorded here for visibility rather than left silent.</li>
      <li><strong>The <code>Grade</code> model has no status field for Incomplete — open.</strong> §4.4's Incomplete policy can be enforced administratively today but cannot be tracked or displayed as a distinct state from "not yet graded" until a schema field exists for it.</li>
      <li><strong>The <code>Grade</code> model has no <code>practical</code> field, and only one <code>quiz</code>/<code>assignment</code> slot each beyond the second quiz — open, high priority.</strong> §5 explains this in full: it is the single largest gap between what this document and Course Specifications specify every course should be assessed on and what the platform can currently store, affecting every Recitation/Hifz and Character/practical course in the catalogue (roughly half of it).</li>
      <li><strong>No Hifz-specific course exists in the 42-course catalogue — open.</strong> §6's rubric table notes this: Hifz criteria are defined here in principle, but no course currently teaches or assesses memorization as its own dedicated subject, distinct from Tajweed/recitation. Whether to add one is a catalogue-level decision outside this document's scope, flagged here since this is where the gap became visible.</li>
      <li><strong>Pathway-tier (Foundation/Intermediate/Advanced/Diploma) progression is not a queryable field anywhere in the schema — open.</strong> §7.3 explains this fully: tier lives only in the course code and in content documents; the platform's actual level-progression computation is a generic, unconfigured numeric formula unrelated to tier names, and is currently a no-op for the Academy's programme since no <code>durationYears</code> value is set. Formalizing tiers as real, queryable data (on <code>Course</code> and/or a programme-structure table) is a schema-level decision this document flags but does not make.</li>
      <li><strong>Grade replacement on course repeat vs. full multi-attempt history — open.</strong> §7.7: today's schema supports only "latest attempt replaces" (the Academy's stated policy for now); a fuller model where every attempt remains independently visible on the transcript needs its own schema change and is a founder-level policy choice.</li>
      <li><strong>Graduation eligibility currently checks only the raw Final score, not this document's weighted overall course score — open.</strong> §7.9: for Recitation/Hifz and Character/practical courses this can diverge from the correct pass/fail outcome under §4.2's formula; resolving it depends on decision 53 (the <code>practical</code> field) existing first.</li>
      <li><strong>Mapping of <code>GraduationDocumentType</code> (CERTIFICATE / STATEMENT_OF_COMPLETION) to Diploma completion vs. tier completions vs. future Specialized Certificates — open.</strong> §8.5: this document recommends CERTIFICATE for the Diploma and STATEMENT_OF_COMPLETION for any future tier-level documents, but the actual policy should be confirmed by Academic Administration rather than assumed by this document.</li>
      </ol>
      <p><em>Ulul Azm Academy — Assessment, Grading &amp; Progression Framework. Prepared for Founder review. This framework codifies and extends the Academy's existing, already-implemented grading and eligibility logic (grading scale, GPA formula, attendance-fail rule, graduation-eligibility check) rather than replacing it, corrects one real conflict found between that live system and the Course Specifications' published course specifications (decision 52, now applied), and names eight further gaps between what this framework specifies and what the current schema can store or enforce — none of which block using this document as the Academy's working assessment policy; they block only the specific automated checks each one touches.</em></p>

    `.trim(),
  },
  'academy-student-lifecycle': {
    title: 'Student Lifecycle & Academic Administration',
    bodyHtml: `
      <p><strong>Student Lifecycle &amp; Academic Administration Framework.</strong> Using the Institutional Foundation, Academic Governance, Academic Pathways, Curriculum Framework, Department Curriculum Design, Course Catalogue, Course Specifications, and Assessment, Grading &amp; Progression documents as the fixed academic foundation, this framework states the complete path a learner travels from first discovering the Academy through to graduation and alumni status, and names the real, already-implemented system behind each stage. It does not redesign admissions, grading, progression, repeat-course, withdrawal, or graduation policy — Assessment, Grading &amp; Progression already sets those (§4, §7, §8) — it states the stages around and between them: how an applicant becomes a record, how a record becomes a placed and registered student, how that student is advised and tracked, and what an official student record actually consists of. Two genuinely new systems were built alongside this document rather than only described: a structured Placement workflow operationalizing Academic Pathways §8's seven-input policy, and roughly twenty new application-form fields (self-rated Qur'an/Arabic levels, pathway/department/specialization preference, learning goals, support needs, a declaration) that the live admission form previously did not collect at all.</p>

      <h2>1. Scope &amp; Constraints</h2>
      <p>This document defines the Academy's student lifecycle end to end: Discovery, Application, Admission, Placement, Enrollment, Registration, Learning, Attendance, Assessment, Results, Advising, Progression, Graduation, Certificate, and Alumni (§2). It states the application form's complete field specification (§3), the Placement workflow that now exists to operationalize Academic Pathways §8 (§4), how course registration actually happens today — both a staff-triggered bulk process and an individual request process (§5), how attendance is tracked and how intervention escalates (§6), how academic advising is assigned and used (§7), what constitutes the official student record and who can request what from it (§8), and how graduation and the alumni transition work (§9) — the last of these by cross-reference to Assessment, Grading &amp; Progression's already-complete graduation logic (§7.9, §8), not by restating it. Learning, Assessment, and Results (stages within §2) are Course Specifications' and Assessment, Grading &amp; Progression's subject matter respectively and are not redefined here beyond locating them in the journey.</p>
      <p>Where this document describes a system already live in the platform — the admission-to-decision pipeline, the Placement API, the automatic and request-based registration paths, the attendance-tier logic in <code>lib/attendancePolicy.js</code>, advisor assignment, or the graduation clearance workflow — it states that system as it actually behaves, including its real field names, model names, and function names, so this document and the code can never quietly drift apart. Two structural gaps found while writing this document are corrected as part of it, not left standing: admission approval previously created a <code>User</code> account but never the corresponding <code>StudentProfile</code>, silently breaking every downstream system keyed to that record; and a fully-built admin admissions review/decision backend had no page to use it from. Both are fixed (§3.4, §10 decisions 60–61). A third finding — real, working automatic course-registration logic that already existed but had no student-facing trigger — is documented as the deliberate staff-triggered design it already is, once traced (§5.1), not treated as a gap.</p>

      <h2>2. The Student Journey</h2>
      <p>Fourteen stages, each landing on a real system rather than a description of an intended one:</p>
      <div class="table-wrap"><table>
      <thead><tr><th>#</th><th>Stage</th><th>What happens</th><th>System of record</th></tr></thead>
      <tbody>
      <tr><td>1</td><td>Discovery</td><td>A prospective learner reaches the public Academy pages — the pathway, program, and course-catalogue documents (Academy Pathways, Course Catalogue) and the public <code>/academy</code> hub.</td><td>Public academy-* pages; no account yet</td></tr>
      <tr><td>2</td><td>Application</td><td>The applicant completes the live admission form and pays the application fee.</td><td><code>app/admission/page.js</code> → <code>AdmissionApplication</code> (§3)</td></tr>
      <tr><td>3</td><td>Admission</td><td>Academic Administration reviews the paid application and decides Approve or Reject.</td><td><code>/admin/admissions/[id]</code> → <code>/api/admin/admissions/[id]/decision</code> (§3.4)</td></tr>
      <tr><td>4</td><td>Placement</td><td>On approval, a <code>StudentProfile</code> is created in <code>ADMITTED</code> status. An academic advisor records a Placement assessment against the applicant's self-reported levels; completing it moves the student to <code>ACTIVE</code> and, where a specific programme was recommended, sets it.</td><td><code>PlacementAssessment</code>; <code>/api/advisor/placement/*</code> (§4)</td></tr>
      <tr><td>5</td><td>Enrollment</td><td>The now-<code>ACTIVE</code> student holds an account, a programme (where placed), and a department — the platform's working definition of "enrolled," distinct from being registered into specific courses (stage 6).</td><td><code>StudentProfile</code> (<code>status</code>, <code>programId</code>, <code>departmentId</code>)</td></tr>
      <tr><td>6</td><td>Registration</td><td>Actual <code>Enrollment</code> rows in specific courses are created — either in bulk by Academic Records running sequencing- and prerequisite-aware automatic assignment, or individually through a student's course add/drop request.</td><td><code>Enrollment</code>; <code>lib/courseAssignment.js</code>; <code>Request</code> (type <code>COURSE_ADD_DROP</code>) (§5)</td></tr>
      <tr><td>7</td><td>Learning</td><td>Coursework proceeds under each course's own specification — teaching activities, weekly topics, assignments.</td><td>Course Specifications (per course); <code>Assignment</code> / <code>Submission</code></td></tr>
      <tr><td>8</td><td>Attendance</td><td>Class-by-class presence is tallied per course; standing deteriorates through six graduated tiers as absence rises, with a hard 25% fail-and-repeat line.</td><td><code>Attendance</code>; <code>lib/attendancePolicy.js</code> (§6)</td></tr>
      <tr><td>9</td><td>Assessment</td><td>Knowledge and Practical assessment components are recorded per course under the weighted-profile formula.</td><td><code>Grade</code>; Assessment, Grading &amp; Progression §4</td></tr>
      <tr><td>10</td><td>Results</td><td>Scores become letter grades, GPA, and per-term academic standing.</td><td><code>Grade</code> → <code>TermRecord</code>; Assessment, Grading &amp; Progression §4.1, §4.7</td></tr>
      <tr><td>11</td><td>Advising</td><td>An assigned academic advisor monitors progress, messages the student, and refers to tutoring or remediation when standing slips.</td><td><code>StudentProfile.academicAdvisorId</code>; <code>AdvisorMessage</code>; <code>TutoringRequest</code> (§7)</td></tr>
      <tr><td>12</td><td>Progression</td><td>Prerequisite chains gate individual courses; pathway-tier completion (Foundation → Diploma) is advisor-confirmed against the tier's required course list.</td><td>Assessment, Grading &amp; Progression §7.2, §7.3</td></tr>
      <tr><td>13</td><td>Graduation</td><td>Eligibility is computed automatically; the student applies; each office clears them independently; the Registrar approves; documents are issued.</td><td><code>GraduationApplication</code> / <code>GraduationClearance</code> / <code>GraduationDocument</code>; Assessment, Grading &amp; Progression §7.9, §8 (§9)</td></tr>
      <tr><td>14</td><td>Certificate</td><td>The formal credential document is generated and stored.</td><td><code>GraduationDocument</code> (<code>type</code>: <code>CERTIFICATE</code> or <code>STATEMENT_OF_COMPLETION</code>)</td></tr>
      <tr><td>15</td><td>Alumni</td><td><code>StudentStatus</code> reaches <code>GRADUATED</code> — the terminal successful state. No further stage exists today: there is no alumni directory, network, or post-graduation engagement record distinct from a graduated account. Flagged, not invented (§9, §10 decision 64).</td><td><code>StudentProfile.status = GRADUATED</code></td></tr>
      </tbody></table></div>
      <p>The fourteen named stages of the journey are kept as fourteen, with Enrollment and Registration each landing on a genuinely distinct system (§2's table rows 5–6) rather than treated as one step, since conflating them would misstate what the platform actually does: a student can be <code>ACTIVE</code> and hold a programme (enrolled) before any specific course <code>Enrollment</code> row exists for them (registered).</p>

      <h2>3. Application</h2>
      <h3>3.1 Process</h3>
      <p>An applicant completes the public admission form in three stages (personal details; academic background and self-assessment; programme preferences and declaration) before paying the application fee through Paystack or Stripe; payment success is what actually creates the <code>AdmissionApplication</code> row, through each gateway's own initialize route — this was already true before this document and remains the single source of truth for what fields exist on a submitted application, since a form field with no corresponding line in <code>applicationFieldsData</code> in both initialize routes is collected on screen but silently never saved. Every field in §3.2 below is confirmed present in both <code>app/api/admissions/paystack/initialize/route.js</code> and <code>app/api/admissions/stripe/initialize/route.js</code>, not only in the form's on-screen state.</p>
      <h3>3.2 Application form field specification</h3>
      <p>The seeded field set already covered legal name, date of birth, contact information, residence, emergency contact, previous education (highest education, institution), study session, programme, and the six document uploads. This document's contribution is the fields that did not previously exist and are now live on the form and stored on <code>AdmissionApplication</code>:</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Group</th><th>Field</th><th>Stored as</th></tr></thead>
      <tbody>
      <tr><td rowspan="1">Applicant information</td><td>Preferred name</td><td><code>preferredName</code> (String?)</td></tr>
      <tr><td rowspan="4">Programme application</td><td>Pathway preference</td><td><code>pathwayPreference</code> (String? — one of the five Academy Pathways names)</td></tr>
      <tr><td>Preferred department</td><td><code>preferredDepartmentId</code> (relation to <code>Department</code>)</td></tr>
      <tr><td>Specialization</td><td><code>specialization</code> (String?)</td></tr>
      <tr><td>Study mode (full/part-time)</td><td><code>studyMode</code> (<code>StudyMode</code>: <code>FULL_TIME</code> | <code>PART_TIME</code>)</td></tr>
      <tr><td>Islamic education background</td><td>Islamic Studies background</td><td><code>islamicStudiesBackground</code> (String? — free text)</td></tr>
      <tr><td rowspan="4">Qur'an placement (self-rated)</td><td>Reading</td><td><code>quranReadingSelf</code></td></tr>
      <tr><td>Tajweed</td><td><code>quranTajweedSelf</code></td></tr>
      <tr><td>Hifz</td><td><code>quranHifzSelf</code></td></tr>
      <tr><td>Recitation</td><td><code>quranRecitationSelf</code></td></tr>
      <tr><td rowspan="6">Arabic placement (self-rated)</td><td>Reading</td><td><code>arabicReadingSelf</code></td></tr>
      <tr><td>Writing</td><td><code>arabicWritingSelf</code></td></tr>
      <tr><td>Grammar</td><td><code>arabicGrammarSelf</code></td></tr>
      <tr><td>Vocabulary</td><td><code>arabicVocabularySelf</code></td></tr>
      <tr><td>Conversation</td><td><code>arabicConversationSelf</code></td></tr>
      <tr><td>Qur'anic Arabic</td><td><code>quranicArabicSelf</code></td></tr>
      <tr><td rowspan="2">Learning goals / support</td><td>Learning goals</td><td><code>learningGoals</code> (String?)</td></tr>
      <tr><td>Support / accessibility needs</td><td><code>supportNeeds</code> (String?)</td></tr>
      <tr><td rowspan="2">Declaration</td><td>Accepted</td><td><code>declarationAccepted</code> (Boolean, required to submit)</td></tr>
      <tr><td>Accepted at</td><td><code>declarationAcceptedAt</code> (DateTime?)</td></tr>
      </tbody></table></div>
      <p>All ten self-rated fields use one shared <code>SelfRatedLevel</code> enum — <code>NONE</code> / <code>BEGINNER</code> / <code>INTERMEDIATE</code> / <code>ADVANCED</code> / <code>PROFICIENT</code> — the applicant's own account of themselves, feeding Placement (§4) as a starting point, never as the placement result itself; that distinction is stated on the admin review screen exactly so it is never mistaken for an assessed level. The declaration is a required checkbox gating submission, not a separate document upload — the applicant affirms the accuracy of the information provided and their understanding of the Academy's academic and conduct expectations before the form can be paid for and submitted.</p>
      <p>Previously existing and unchanged: legal name, date of birth, gender, nationality, country of residence, phone, ID number, residential address, applicant category, guardian details, emergency contact, programme selection, study session, highest education, institution name, and the six required document uploads (identity document, passport picture, transcripts, certificate, testimonial, recommendation letter).</p>
      <h3>3.3 Required documents</h3>
      <p>Unchanged from the existing form: identity document, passport picture, academic transcripts, certificate, testimonial, and recommendation letter — each stored as a private object and viewable by Academic Administration through a presigned-URL viewer, never exposed as a public link.</p>
      <h3>3.4 Admission decision — the gap this document closes</h3>
      <p><strong>Correction applied.</strong> Approving an application (<code>/api/admin/admissions/[id]/decision</code>, decision <code>APPROVED</code>) already created the applicant's <code>User</code> account, but never created the corresponding <code>StudentProfile</code> — meaning every downstream system this document and Assessment, Grading &amp; Progression describe (Placement, Enrollment, Attendance, Grades, Advising, Graduation) had no record to attach to for a newly-approved student. This is corrected: approval now creates a <code>StudentProfile</code> in the same transaction as the decision, with <code>status: ADMITTED</code>, a generated student number (<code>lib/studentNumber.js</code>, format <code>ULA-&lt;year&gt;-&lt;6 digits&gt;</code>, mirroring the existing <code>applicationNumber</code> generator's uniqueness-retry pattern), and faculty/department/programme copied from the approved application's programme. <code>ADMITTED</code> deliberately does not mean the same as <code>ACTIVE</code>: it is "approved, record created, not yet placed" — Placement (§4) is what moves a student from <code>ADMITTED</code> to <code>ACTIVE</code>.</p>
      <p><strong>Second gap closed.</strong> A complete admissions review/decision backend (<code>/api/admin/admissions/[id]/review</code> and <code>/decision</code>) already existed with no page to drive it from — the admissions list page's own text claimed this was "handled by Registry/Admissions staff at their own dashboard," which was not true; that dashboard has no admissions functionality at all. A full review page now exists at <code>/admin/admissions/[id]</code>, showing every field in §3.2 grouped by section, the six documents with a working viewer, payment status, and the "Move to Under Review," "Approve &amp; Create Student Record," and "Reject" actions.</p>

      <h2>4. Placement</h2>
      <p>Academic Pathways §8 already set the placement policy: seven inputs, never age, administered by Academic Advising or the relevant Department, evidence-based rather than by request. What did not exist before this document was any system to actually run that policy against a real applicant. It now does.</p>
      <h3>4.1 Placement queue</h3>
      <p><code>GET /api/advisor/placement</code> returns every student in <code>ADMITTED</code> status, plus any student whose <code>PlacementAssessment</code> has been started but not completed — deliberately not scoped to "my advisees," matching Academic Pathways §8's framing of placement as an Academic Advising / Department function rather than one pre-assigned advisor's task (a newly admitted student usually has no advisor yet; that assignment normally follows placement, once a programme is set, §7.2). Each queue entry is joined, by email, to the applicant's own §3.2 self-reported levels and pathway preference — the starting point an assessor works from, not the result.</p>
      <h3>4.2 Recording an assessment</h3>
      <p><code>POST /api/advisor/placement/[studentId]</code> records or updates one <code>PlacementAssessment</code> per student (<code>studentId</code> is unique on the model): the same ten Qur'an/Arabic dimensions as §3.2, now assessor-recorded rather than self-reported, plus a recommended pathway, an optional recommended programme, an assessor note, and a status (<code>PENDING</code> / <code>SCHEDULED</code> / <code>IN_PROGRESS</code> / <code>COMPLETED</code>). A recommended pathway is required to reach <code>COMPLETED</code>.</p>
      <h3>4.3 The Placement → Enrollment handoff</h3>
      <p>Completing a Placement assessment (status <code>COMPLETED</code>) is the one action that moves a student's <code>StudentProfile.status</code> from <code>ADMITTED</code> to <code>ACTIVE</code>, and — where a specific programme was recommended — sets <code>StudentProfile.programId</code> to it, inside the same transaction as saving the assessment. This is the concrete system behind stage 4→5 of the journey (§2): a student is not "enrolled" in the sense this document uses the word until Placement has actually run.</p>
      <h3>4.4 Advisor dashboard</h3>
      <p>The Placement queue and assessment form are available to advisory staff from a dedicated tab on the existing Advisor Dashboard, alongside the pre-existing Advisees &amp; Messages tab — the same staff surface, not a separate tool, since Academic Pathways §8 places placement with Academic Advising in the first place.</p>
      <h3>4.5 Recognition of prior learning</h3>
      <p>Unchanged from Academic Pathways §8: an applicant's own account of prior learning (§3.2's self-rated fields) is never sufficient by itself. The Placement assessment (§4.2) is the same evidence-based process every entrant goes through, whether they are placing in fresh or seeking recognition of prior study — there is no separate, lighter RPL pathway that could become an informal way around the standard.</p>

      <h2>5. Registration</h2>
      <h3>5.1 Course registration — two real paths</h3>
      <p>Two distinct, already-implemented mechanisms register a student into specific courses; this document names both rather than only the more visible one.</p>
      <p><strong>Automatic, bulk assignment (staff-triggered).</strong> <code>computeAutoAssignableCourses</code> / <code>autoAssignCoursesForProgram</code> (<code>lib/courseAssignment.js</code>) assign a student every course in their own programme where: the course has been sequenced (<code>Course.semesterLevel</code> is set), the student has not already passed it, they are not already enrolled in it, and every one of its prerequisites has been passed — only the lowest not-yet-satisfied level is assigned at a time, so no student is registered years ahead of where they actually stand. This runs per-programme from Academic Records' own dashboard (<code>/academic-records-dashboard/auto-assign</code>, backed by <code>POST /api/records/auto-assign</code>), which also shows how many of a programme's courses are sequenced and ready. It is deliberately staff-triggered rather than automatic-on-placement — Academic Records decides when a term's registration run happens, across a whole programme at once — and is idempotent, so re-running it for an already-current student creates nothing new.</p>
      <p><strong>Individual add/drop (student-requested, staff-approved).</strong> A student requests a specific course addition or removal through the existing <code>Request</code> mechanism (<code>type: COURSE_ADD_DROP</code>, with a structured <code>courseId</code> and <code>courseAction</code> of <code>ADD</code> or <code>DROP</code> — not free text). Academic Records approves or rejects it (<code>PATCH /api/records/course-requests/[id]</code>); approval actually creates or removes the real <code>Enrollment</code> row, not merely a status flag. Both paths write to the same <code>Enrollment</code> model (<code>AccessStatus</code>: <code>PENDING</code> / <code>APPROVED</code> / <code>REVOKED</code>), so a student's registered-courses view is always one consistent list regardless of which path put a course there.</p>
      <h3>5.2 Prerequisites</h3>
      <p>Governed by Assessment, Grading &amp; Progression §7.2 and enforced identically by both registration paths above through the schema's self-referencing <code>Course.prerequisites</code> relation: a prerequisite must be passed, not merely attempted, before enrollment in the course that names it.</p>
      <h3>5.3 Approval</h3>
      <p>Bulk assignment (§5.1) requires no per-course approval — Academic Records' decision to run it for a programme is the approval. Individual add/drop requests require explicit Academic Records approval (§5.1) before the Enrollment row is created or removed; a request left <code>SUBMITTED</code> or <code>UNDER_REVIEW</code> changes nothing about the student's actual registration.</p>
      <h3>5.4 Withdrawal and repeat courses</h3>
      <p>Both are Assessment, Grading &amp; Progression's subject matter and are not restated here: course-level withdrawal via the same <code>COURSE_ADD_DROP</code> (<code>DROP</code>) request before a term's drop deadline; programme-level withdrawal (<code>StudentStatus</code> → <code>WITHDRAWN</code>) versus a temporary leave of absence or deferment (<code>StudentStatus</code> → <code>DEFERRED</code>, via the existing <code>LEAVE_OF_ABSENCE</code> / <code>DEFERMENT</code> request types) — see Assessment, Grading &amp; Progression §7.8; repeat-course policy (two attempts before requiring Academic Administration approval for a third, "latest attempt replaces" under today's schema) — see §7.7.</p>

      <h2>6. Attendance &amp; Intervention</h2>
      <p>Attendance is tracked per student per course (<code>Attendance</code>: <code>totalClasses</code>, <code>attended</code>, <code>late</code>, <code>absent</code>) and already carries a real, graduated six-tier standing system (<code>lib/attendancePolicy.js</code>) that this document formalizes as institutional policy rather than redesigns:</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Absence rate</th><th>Standing</th><th>Meaning</th></tr></thead>
      <tbody>
      <tr><td>0% – 4.9%</td><td>Good Standing</td><td>Excellent attendance</td></tr>
      <tr><td>5% – 9.9%</td><td>Normal</td><td>Within expectations</td></tr>
      <tr><td>10% – 14.9%</td><td>Attendance Warning</td><td>First formal warning tier</td></tr>
      <tr><td>15% – 19.9%</td><td>Nearing Danger</td><td>Approaching the fail limit</td></tr>
      <tr><td>20% – 24.9%</td><td>Critical</td><td>One or two more absences from failing</td></tr>
      <tr><td>≥ 25%</td><td>At Risk</td><td>Has reached the fail limit — fails the course and must repeat it</td></tr>
      </tbody></table></div>
      <p>A late arrival still counts as classroom attendance for standing purposes — only true absences (<code>absent / totalClasses</code>) drive the rate. A course with no sessions recorded yet is reported "Not Started" rather than defaulting into any tier. The 25% hard line is the same automatic-fail rule Assessment, Grading &amp; Progression §4.6 already defers to; this document does not restate a second attendance-fail rule, only the tier system leading up to it. Both the instructor's Attendance view and the student's own Attendance Record page already read this same shared logic, so a student's status never reads differently depending on who is looking at it.</p>
      <h3>6.1 Intervention</h3>
      <p>The graduated tiers exist specifically so intervention can begin well before the 25% fail line: a student reaching Attendance Warning or Nearing Danger is a natural trigger for their academic advisor to make contact (<code>AdvisorMessage</code>, §7) and, if warranted, refer them to tutoring support (<code>TutoringRequest</code>, §7) before the course is lost outright. Reaching Critical or At Risk in a course, combined with the per-term academic-standing thresholds (Assessment, Grading &amp; Progression §4.7), is exactly the kind of pattern the Probation remediation process (§7.6 of that document) is designed to catch — this document does not add a second, separate attendance-triggered intervention process, since the existing academic-standing and remediation machinery already covers it once attendance and grade data are both visible to the advisor in one place (§7).</p>

      <h2>7. Academic Advising</h2>
      <h3>7.1 Advisor assignment</h3>
      <p>Each <code>StudentProfile</code> carries one <code>academicAdvisorId</code> (a direct relation to <code>StaffProfile</code>), assigned and reassigned by Academic Administration through the existing <code>/admin/advising</code> page — this is a real, already-working one-to-one assignment, not a gap this document needed to fill. A student admitted but not yet placed (§4) typically has no advisor yet; assignment normally follows Placement, once a programme is known, matching Academic Pathways §8's framing of placement itself as an Academic Advising / Department function performed ahead of, or as part of, that assignment.</p>
      <h3>7.2 Study planning</h3>
      <p>An advisor's working view of a student's plan draws on the same data Registration (§5) and Progression (Assessment, Grading &amp; Progression §7) already produce: passed and outstanding required courses, unmet prerequisites, and current pathway-tier standing. No separate "study plan" document or model exists, or is proposed here — the plan is always the live, current state of these existing records, not a document that can drift out of date.</p>
      <h3>7.3 Communication</h3>
      <p><code>AdvisorMessage</code> (sender <code>STUDENT</code> or <code>ADVISOR</code>) is the existing direct channel between a student and their advisor, already read/write from both the student portal and the advisor's own dashboard.</p>
      <h3>7.4 Progression monitoring and at-risk identification</h3>
      <p>An advisee is identified as at-risk from the same two already-computed signals this document has named throughout, read together rather than separately: per-term <code>AcademicStanding</code> (Probation or worse — Assessment, Grading &amp; Progression §4.7) and per-course attendance standing (Critical or At Risk — §6 above). Neither signal alone is treated as authoritative here; this document does not define a new combined at-risk score, since doing so would itself be new grading/standing policy outside this document's scope — it states that both existing signals are visible to an advisor and should be read together, which they were not necessarily previously understood to be.</p>
      <h3>7.5 Intervention and remediation</h3>
      <p>Governed by Assessment, Grading &amp; Progression §7.4 and §7.6 (Probation, remediation plans, course-load caps, a required tutoring referral via the existing <code>TutoringRequest</code> mechanism) — not restated here. This document's contribution is naming attendance (§6.1) as an intervention trigger an advisor should act on alongside academic standing, not only after Probation is already formally recorded.</p>
      <h3>7.6 Graduation planning</h3>
      <p>An advisor's role in graduation planning is to confirm pathway-tier completion (Assessment, Grading &amp; Progression §7.3, §8.1–8.3) as a student progresses, so that Diploma-level eligibility (computed automatically, §9 below) is not a surprise at the end — this document does not add a separate advisor sign-off step to the graduation workflow itself (§9), which already runs independently of any single advisor's confirmation.</p>

      <h2>8. Student Records</h2>
      <p>No single model or page holds "the student record" as one row — it is the coherent set of everything this document and Assessment, Grading &amp; Progression have already named, and this section states what belongs to it for the first time as a defined set rather than an implicit one:</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Record component</th><th>Held in</th><th>Who can request a copy / action</th></tr></thead>
      <tbody>
      <tr><td>Application &amp; admission decision</td><td><code>AdmissionApplication</code></td><td>Academic Administration (internal); not separately requestable by the student post-decision</td></tr>
      <tr><td>Placement result</td><td><code>PlacementAssessment</code></td><td>Advisory staff (record); visible to the student via their profile</td></tr>
      <tr><td>Enrollment / registration history</td><td><code>Enrollment</code></td><td>Academic Records (§5)</td></tr>
      <tr><td>Attendance</td><td><code>Attendance</code></td><td>Student (own record), instructor, advisor</td></tr>
      <tr><td>Grades</td><td><code>Grade</code></td><td>Student (own record); Academic Records for corrections</td></tr>
      <tr><td>Per-term GPA &amp; standing</td><td><code>TermRecord</code></td><td>Student (own record); Academic Administration</td></tr>
      <tr><td>Transcript</td><td><code>TranscriptIssue</code> (generated PDF, cumulative GPA snapshot)</td><td>Student, via a <code>TRANSCRIPT</code> request</td></tr>
      <tr><td>Fees</td><td><code>StudentFee</code></td><td>Student (own record); Finance</td></tr>
      <tr><td>Requests &amp; their history</td><td><code>Request</code> / <code>RequestActivity</code></td><td>Student (own submissions); the assigned unit/staff</td></tr>
      <tr><td>Graduation &amp; clearance</td><td><code>GraduationApplication</code> / <code>GraduationClearance</code></td><td>Student (own status); each clearing office; the Registrar</td></tr>
      <tr><td>Issued credentials</td><td><code>GraduationDocument</code></td><td>Student, on request or automatically once issued</td></tr>
      </tbody></table></div>
      <p>Every one of these already has a real page or API surfacing it to the student, an advisor, or the relevant office (Academic Records' own <code>/academics/records</code> page already brings several of them together for the student) — this table is the first place they are named together as one coherent "student record" rather than as separately-built features. Requests for a copy or action on any component that is not simply self-viewable in a portal go through the existing <code>Request</code> types (<code>TRANSCRIPT</code>, <code>LETTER_CONFIRMATION</code>, <code>GRADE_APPEAL</code>, <code>COMPLAINT</code>, <code>GRADUATE_SUPPORT</code>, <code>OTHER</code>) — this document does not add a new request type for anything already covered by an existing one.</p>

      <h2>9. Graduation, Certification &amp; Alumni Transition</h2>
      <p>Graduation eligibility, application, clearance, and document issuance are fully defined and fully implemented by Assessment, Grading &amp; Progression §7.9 and §8 (<code>computeGraduationEligibility()</code>, <code>GraduationApplication</code>, <code>GraduationClearance</code> per <code>Unit</code>, <code>GraduationDocument</code>) — this document does not redesign or restate that logic, only locates it as stages 13–14 of the journey (§2) and states what comes after it, which that document does not address.</p>
      <p><strong>Alumni — a genuine, open gap.</strong> Once a <code>GraduationApplication</code> reaches <code>COMPLETED</code> and the student's account status moves to <code>GRADUATED</code>, no further system exists: there is no alumni directory, no distinct alumni record, portal, or engagement tracking separate from a graduated account sitting in its final state. Alumni is named as the journey's final stage (§2) precisely so this is stated plainly rather than filled with an invented system — an alumni programme (a directory, continuing-education pathways for a Specialized Certificate per Academy Pathways §7, or any post-graduation engagement) is a founder-level decision this document flags rather than makes (§10 below, decision 64).</p>

      <h2>10. Decisions Requiring Approval</h2>
      <p>Continuing the numbering from Institutional Foundation through Assessment, Grading &amp; Progression.</p>
      <ol start="60">
      <li><strong>Correction applied: admission approval now creates a <code>StudentProfile</code> — action taken, not open.</strong> §3.4 explains the gap this closes: without it, every system this document and Assessment, Grading &amp; Progression describe had no record to attach a newly-approved student to.</li>
      <li><strong>Correction applied: a full admin admissions review page now exists — action taken, not open.</strong> §3.4: the review/decision backend already existed; the admissions list page's claim that this was "handled at Registry/Admissions' own dashboard" was inaccurate and has been corrected along with building the page.</li>
      <li><strong>Built: the Placement workflow (<code>PlacementAssessment</code>, queue API, advisor dashboard tab) — action taken, not open.</strong> §4: this is the first real system operationalizing Academic Pathways §8's seven-input placement policy; no code previously existed for it.</li>
      <li><strong>Built: ~20 new application-form fields — action taken, not open.</strong> §3.2: pathway/department/specialization/study-mode preference, ten self-rated Qur'an/Arabic levels, Islamic Studies background, learning goals, support needs, and a required declaration, all now live on the form and stored on <code>AdmissionApplication</code>.</li>
      <li><strong>No alumni system exists beyond the <code>GRADUATED</code> status — open.</strong> §9: whether to build a directory, continuing-education pathway, or engagement tracking is a founder-level decision this document does not make.</li>
      </ol>
      <p><em>Ulul Azm Academy — Student Lifecycle &amp; Academic Administration Framework. Prepared for Founder review. This framework states the complete learner journey and, unlike a purely descriptive document, is accompanied by two real systems built alongside it — Placement and the expanded application form — plus two structural corrections to admission approval and its admin review page. It cross-references rather than restates Assessment, Grading &amp; Progression's already-complete grading, progression, and graduation logic, and names one genuine open gap: no system exists yet for the Academy's learners once they graduate.</em></p>

    `.trim(),
  },
  'academy-faculty-portals': {
    title: 'Faculty, Staff & Academic Portals',
    bodyHtml: `
      <p><strong>Faculty, Staff &amp; Academic Portals Framework.</strong> Using the Institutional Foundation, Academic Governance, Academic Pathways, Curriculum Framework, Department Curriculum Design, Course Catalogue, Course Specifications, Assessment, Grading &amp; Progression, and Student Lifecycle &amp; Academic Administration documents as the fixed academic foundation, this framework states who teaches and administers the Academy, what each academic role can see and do, and what each role's digital portal actually contains. It does not invent titles: every role named below is one of the Academy's own already-seeded staff positions (<code>Position.nameEn</code>), not a new legal designation created for this document. It does not redesign grading, progression, or the student journey — those are Assessment, Grading &amp; Progression's and Student Lifecycle's subject matter — it states the staff-facing structure and portals around them. Five genuinely new systems were built alongside this document rather than only described: a Senior Instructor position with a real Instructor Profile (qualifications, professional development, and performance review); an expanded Programme Coordinator dashboard with applicant, student, and graduation visibility; a Department Head instructor-assignment tool; a Faculty-wide Dean standards view; and a Quality Assurance extension covering instructor evaluation, improvement-plan tracking, an evidence repository, and student course evaluations.</p>

      <h2>1. Scope &amp; Constraints</h2>
      <p>This document defines the Academy's faculty and staff role structure (§2), the Instructor Profile now recorded for every teaching position (§3), and six portals: Student (§4), Instructor (§5), Programme Coordinator (§6), Department Head (§7), Academic Dean (§8), and Quality Assurance (§9) — followed by the role/permission matrix and cross-portal workflows that tie them together (§10) and a record of what was built versus what remains an open, founder-level decision (§11). Where a portal already existed and worked, this document states it as it already behaves rather than redesigning it; where a portal was missing a piece this framework specifies and the platform's own data could genuinely support it, that piece was built as part of this pass, not merely proposed. Where a piece would require inventing data that does not exist anywhere in the platform today — most importantly, a PLO/CLO achievement-percentage calculation — this document names that gap plainly instead of fabricating numbers (§11).</p>
      <p>Every role, permission, and relationship described below is the real, already-implemented <code>Position</code> / <code>PositionPermission</code> / <code>Module</code> system (<code>lib/permissions.ts</code>, <code>prisma/seed.js</code>) and the real one-to-one assignment relations already on <code>Faculty</code>, <code>Department</code>, <code>Program</code>, and <code>StudentProfile</code> — not a parallel structure invented for this document. Two new things were added to that real system, not a competing one: a <strong>Senior Instructor</strong> position (Academic Pathways already anticipates a more senior teaching rank "where appropriate," and none previously existed), and a <strong>STAFF</strong> subject type on the Academy's existing <code>QualityReview</code> model, so an instructor evaluation is recorded the same way every other quality review already is.</p>

      <h2>2. Faculty &amp; Staff Structure</h2>
      <p>Every academic role below is a real row in the <code>Position</code> table, seeded once and referenced by every staff member's <code>StaffProfile.positionId</code> — there is no free-text "job title" a staff record can hold instead of one of these. (A separate, optional <code>StaffProfile.title</code> field exists for a personal honorific such as "Dr." or "Shaykh" alongside the position — it customizes how a name is shown, it never substitutes for the governing position.) <code>Position.isAcademic</code> marks which of these are teaching/academic roles as opposed to pure administrative ones (Registrar, Finance Officer, ICT Officer, and similar), which this document does not otherwise cover.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Role (brief)</th><th>Real seeded position</th><th>Scope relation</th><th>Portal</th></tr></thead>
      <tbody>
      <tr><td>Instructor</td><td><code>Instructor</code></td><td>Assigned per course via <code>InstructorCourse</code></td><td>Instructor Portal (§5)</td></tr>
      <tr><td>Senior Instructor</td><td><code>Senior Instructor</code> — new this document</td><td>Same as Instructor, plus <code>QUALITY_ASSURANCE</code> view</td><td>Instructor Portal (§5)</td></tr>
      <tr><td>Department Head</td><td><code>Head of Department</code></td><td><code>Department.headId</code> (unique)</td><td>Department Head Portal (§7)</td></tr>
      <tr><td>Program Coordinator</td><td><code>Programme Coordinator</code></td><td><code>Program.coordinatorId</code></td><td>Programme Coordinator Portal (§6)</td></tr>
      <tr><td>Academic Advisor</td><td><code>Academic Advisor</code></td><td><code>StudentProfile.academicAdvisorId</code>, per student</td><td>Advisor Dashboard (Student Lifecycle §7)</td></tr>
      <tr><td>Academic Dean</td><td><code>Dean</code></td><td><code>Faculty.deanId</code> (unique)</td><td>Academic Dean Portal (§8)</td></tr>
      <tr><td>Assessment / Quality personnel</td><td><code>Quality Assurance Officer</code> (plus Senior Instructor's QA view)</td><td>Institution-wide, via <code>QUALITY_ASSURANCE</code> module</td><td>Quality Assurance Portal (§9)</td></tr>
      </tbody></table></div>
      <p>Two roles named in Academic Governance and already seeded sit above this table and are unchanged by this document: <code>Academy Director</code> (institution-wide academic oversight, view-only across faculty, department, program, courses, records, and quality) and <code>Academic Administrator</code> (academic-records-facing, not department- or faculty-scoped). Neither is a "portal" in the sense of §§4–9 below; both already have working admin-console access through the same <code>PositionPermission</code> system (§10).</p>
      <p>No legal or institutional title was invented for this document. Every position in the table above already existed in <code>prisma/seed.js</code> before this pass except Senior Instructor, which was added in the same list, the same way, with the same <code>code</code>/<code>nameEn</code>/<code>nameAr</code>/<code>isAcademic</code> shape as every position around it — not as a special case.</p>

      <h2>3. Instructor Profile</h2>
      <p>Before this document, a <code>StaffProfile</code> recorded only operational facts: which faculty/department, which position, an employee number, whether active. It held nothing about who the person actually is as a teacher. This section is the profile the Academy's faculty framework requires, and it is now real and populated per instructor rather than only specified here.</p>
      <h3>3.1 Qualifications</h3>
      <p><code>StaffQualification</code> (one-to-many per <code>StaffProfile</code>): a <code>title</code>, an optional <code>institution</code> and <code>yearObtained</code>, and a <code>type</code> — <code>GENERAL</code> or <code>ISLAMIC</code>. The two-value split exists specifically to record Islamic qualifications — an Ijazah in Hafs recitation, for example — separately from general academic ones such as a B.A. in Arabic Literature: both are qualifications, recorded the same way, distinguished only by this one field, never by two separate tables that could drift apart.</p>
      <h3>3.2 Specialization, experience, and languages</h3>
      <p>Added directly to <code>StaffProfile</code> rather than their own tables, since each is a single value per person, not a repeating list: <code>specialization</code> (free text — e.g. "Tafsir", "Arabic Grammar"), <code>yearsExperience</code> (integer), and <code>languages</code> (a string array — every language the instructor can teach or assist in, not only their native one).</p>
      <h3>3.3 Courses authorized to teach</h3>
      <p>This is not new: <code>InstructorCourse</code> (keyed by <code>instructorId</code> — a <code>User.id</code> — and <code>courseId</code>, unique on the pair) has been the platform's real course-assignment mechanism since before this document, already used throughout the Instructor Portal (§5) to determine which courses appear for a given instructor. This document's contribution is surfacing it, for the first time, on the instructor's own profile page as "Courses Authorized to Teach" — the same underlying rows, read rather than duplicated — and giving a Department Head a real tool to create and remove those rows for instructors in their own department (§7.2), where before only direct database seeding could set them.</p>
      <h3>3.4 Professional development</h3>
      <p><code>StaffDevelopmentRecord</code> (one-to-many per <code>StaffProfile</code>): a <code>title</code>, optional <code>provider</code>, <code>completedAt</code> date, <code>hours</code>, and an optional <code>certificateUrl</code> — a workshop attended, a certification earned, a training completed. Recorded by an administrator on the staff member's admin profile page; visible to the instructor on their own read-only profile view.</p>
      <h3>3.5 Performance review</h3>
      <p><code>StaffPerformanceReview</code>: a <code>period</code> (free text — e.g. "2026 Spring Term"), an optional <code>rating</code> (<code>NEEDS_IMPROVEMENT</code> / <code>MEETS_EXPECTATIONS</code> / <code>EXCEEDS_EXPECTATIONS</code> / <code>OUTSTANDING</code>), free-text <code>strengths</code> and <code>areasForGrowth</code>, and a <code>status</code> (<code>DRAFT</code> → <code>SUBMITTED</code> → <code>ACKNOWLEDGED</code>). A reviewer must be a real staff member holding <code>FACULTY_MATTERS</code> or <code>DEPARTMENT_MATTERS</code> edit permission — in practice a Dean or Department Head — and must have their own <code>StaffProfile</code>, since the review is recorded as one staff member reviewing another, never as an admin account with no staff identity reviewing on nobody's behalf. A reviewed instructor sees only <code>SUBMITTED</code> or <code>ACKNOWLEDGED</code> reviews on their own profile — a <code>DRAFT</code> is a reviewer's working note, not yet a recorded evaluation of the instructor.</p>
      <p>All five pieces above are shown together on one admin-facing "Teaching Profile" page per staff member (<code>/admin/staff/[id]</code>) and one instructor-facing read view (<code>/instructor-dashboard/profile</code>) — the same data, an editor's view and a subject's own view of it, never two independently-maintained copies.</p>

      <h2>4. Student Portal</h2>
      <p>The Student Portal is not one new build — every item named below already exists as a real page or API, most of it predating this document, several pieces added by Student Lifecycle &amp; Academic Administration. This section states the complete set together for the first time, and names the one place a student-facing feature is not yet backed by real data.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Brief item</th><th>Where it lives</th><th>Status</th></tr></thead>
      <tbody>
      <tr><td>Application</td><td><code>/admission</code> → <code>AdmissionApplication</code></td><td>Real (Student Lifecycle §3)</td></tr>
      <tr><td>Admission status</td><td><code>StudentProfile.status</code> (<code>ADMITTED</code> before Placement)</td><td>Real (Student Lifecycle §3.4)</td></tr>
      <tr><td>Placement</td><td><code>PlacementAssessment</code>, visible on the student's own profile</td><td>Real (Student Lifecycle §4)</td></tr>
      <tr><td>Registration</td><td><code>/academics/study-plan</code>, <code>/academics/remaining-courses</code> → <code>Enrollment</code></td><td>Real (Student Lifecycle §5)</td></tr>
      <tr><td>Timetable</td><td><code>/academics/overview</code>, <code>/academics/exams</code> → <code>GET /api/calendar/timetable</code></td><td><strong>Not real — see below</strong></td></tr>
      <tr><td>Courses</td><td><code>/academics/study-plan</code>, <code>/academics/remaining-courses</code> → <code>Enrollment</code></td><td>Real</td></tr>
      <tr><td>Materials</td><td>Per-course content surfaced through <code>/academics</code> and course pages</td><td>Real</td></tr>
      <tr><td>Attendance</td><td><code>/academics/attendance</code> → <code>Attendance</code></td><td>Real (Student Lifecycle §6)</td></tr>
      <tr><td>Assignments</td><td>Course-level assignment/submission views → <code>Assignment</code> / <code>Submission</code></td><td>Real, incl. per-submission <code>feedback</code></td></tr>
      <tr><td>Assessments</td><td><code>/academics/exams</code> → <code>Exam</code> / <code>Quiz</code></td><td>Real</td></tr>
      <tr><td>Grades</td><td><code>/academics/records</code> → <code>Grade</code></td><td>Real (Assessment, Grading &amp; Progression §4)</td></tr>
      <tr><td>Academic progress</td><td><code>/academics/records</code>, <code>/academics/overview</code> → <code>TermRecord</code></td><td>Real</td></tr>
      <tr><td>Transcript</td><td><code>/academics/records</code> → <code>TranscriptIssue</code> (<code>TRANSCRIPT</code> request)</td><td>Real (Student Lifecycle §8)</td></tr>
      <tr><td>Certificates</td><td><code>/academics/graduation-documents</code> → <code>GraduationDocument</code></td><td>Real</td></tr>
      <tr><td>Advising</td><td>Advisor messaging on the student's own dashboard → <code>AdvisorMessage</code></td><td>Real (Student Lifecycle §7)</td></tr>
      <tr><td>Notifications</td><td>Platform-wide → <code>Notification</code></td><td>Real, generic (not academic-event-specific)</td></tr>
      </tbody></table></div>
      <p><strong>Genuine gap found while writing this document: the student timetable is demonstration data, not real data.</strong> <code>GET /api/calendar/timetable</code> returns a fixed, hard-coded schedule (the same three class sessions and the same named instructors for every student, every request) rather than anything derived from that student's actual <code>Enrollment</code> rows or the platform's real <code>LiveClass</code> records. This was found, not assumed, by reading the route directly. It is not fixed as part of this document — building a real timetable requires a scheduled-session model tying a course, an instructor, a day/time, and a room or link together, which does not exist today (<code>LiveClass</code> records individual sessions as they are scheduled, not a recurring weekly grid) — and that is a data-model decision for engineering, not something this content document should invent silently. It is named here so the gap is known rather than mistaken for live data (§11).</p>

      <h2>5. Instructor Portal</h2>
      <p>Real and already comprehensive before this document — the Instructor Dashboard's own tabs already covered assigned courses, roster, attendance, materials, assignments, quizzes, exams, and grading — with two gaps closed and two named honestly rather than built around.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Brief item</th><th>Where it lives</th><th>Status</th></tr></thead>
      <tbody>
      <tr><td>Assigned courses</td><td><code>/instructor-dashboard/courses</code> → <code>InstructorCourse</code></td><td>Real</td></tr>
      <tr><td>Student roster</td><td><code>/instructor-dashboard/students</code> → <code>Enrollment</code></td><td>Real</td></tr>
      <tr><td>Attendance</td><td><code>/instructor-dashboard/attendance</code> → <code>Attendance</code></td><td>Real</td></tr>
      <tr><td>Materials</td><td>Course content management from the courses tab</td><td>Real</td></tr>
      <tr><td>Assignments</td><td><code>/instructor-dashboard/assignments</code> → <code>Assignment</code> / <code>Submission</code></td><td>Real, incl. scoring and <code>feedback</code></td></tr>
      <tr><td>Quizzes</td><td><code>/instructor-dashboard/quizzes</code> → <code>Quiz</code></td><td>Real</td></tr>
      <tr><td>Assessments</td><td><code>/instructor-dashboard/exams</code> → <code>Exam</code></td><td>Real</td></tr>
      <tr><td>Grading</td><td><code>/instructor-dashboard/grades</code> → <code>Grade</code></td><td>Real</td></tr>
      <tr><td>Practical rubrics</td><td>Course Specifications, per course (text)</td><td><strong>Judgment-based, not a scoring field — open (§11)</strong></td></tr>
      <tr><td>Feedback</td><td><code>Submission.feedback</code></td><td>Real</td></tr>
      <tr><td>CLO evidence</td><td>Course Specifications' CLO tables (text)</td><td><strong>Descriptive only, not a repository — open (§11)</strong></td></tr>
      <tr><td>Teaching profile (new)</td><td><code>/instructor-dashboard/profile</code></td><td>Built this document (§3)</td></tr>
      </tbody></table></div>
      <p>Two items are named honestly as gaps rather than filled with an invented system. <strong>Practical rubrics</strong> exist today exactly as Course Specifications defined them: a written four-band or four-criterion description per course, scored by an instructor's direct observation and professional judgment — real pedagogical policy, but there is no field on <code>Grade</code> to record a rubric score by criterion (the same missing <code>practical</code> field Assessment, Grading &amp; Progression already flagged as decision 54), and no in-portal form presenting the rubric's own criteria for an instructor to score against one by one. <strong>CLO evidence</strong> is, today, the "Evidence" column already printed in each course's CLO → Teaching → Assessment → Evidence table in Course Specifications (e.g. "Quiz script, rubric score") — a description of what evidence looks like for that outcome, not an actual attached artifact per student per CLO. The evidence repository built in this document (§9.3) is a QA-review-level repository, for a program, course, department, faculty, or staff review — it is a different, and separately real, thing from a per-assignment CLO evidence record, and does not double as one.</p>

      <h2>6. Program Coordinator Portal</h2>
      <p>Before this document, the Coordinator Dashboard was a single course/prerequisite editor. It is now a five-tab operational portal, each tab reading real, scoped data — every programme this coordinator is assigned to via <code>Program.coordinatorId</code>, never every programme institution-wide.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Tab</th><th>Contents</th><th>Source</th></tr></thead>
      <tbody>
      <tr><td>Dashboard</td><td>Programme summary; applicant, active-student, and graduation-candidate counts</td><td><code>GET /api/coordinator/overview</code> — new this document</td></tr>
      <tr><td>Applicants</td><td>Admission applications naming this coordinator's programmes</td><td><code>AdmissionApplication</code>, scoped by <code>programId</code></td></tr>
      <tr><td>Students</td><td>Active students in these programmes, with status</td><td><code>StudentProfile</code></td></tr>
      <tr><td>Graduation</td><td>Graduation candidates in progress</td><td><code>GraduationApplication</code></td></tr>
      <tr><td>Curriculum</td><td>Course and prerequisite management — the original, unchanged tool</td><td><code>Course</code> / prerequisite relation</td></tr>
      </tbody></table></div>
      <p>The "at-risk students," "enrollment," and "assessment" items above are not separately re-shown here: they are Assessment, Grading &amp; Progression's academic-standing and attendance-tier signals (Student Lifecycle §7.4), already the same signals a Programme Coordinator would need, and are not duplicated into a second, competing indicator on this dashboard. "Placement" is Academic Advising's process (Student Lifecycle §4), not the Coordinator's — a coordinator sees its result (a placed programme) once it has happened, not the assessment itself. "PLOs, CLOs, course mapping, assessment coverage" under Curriculum is the one item in this portal this document does not build: no PLO/CLO database exists to map against (§11) — the Curriculum tab manages real course and prerequisite structure, which is the part of "curriculum" that is genuinely data today.</p>

      <h2>7. Department Head Portal</h2>
      <p>The HOD Dashboard already showed department-level announcements and basic counts. This document adds real instructor and curriculum visibility, plus the ability to actually assign instructors to courses — previously only possible by direct database seeding.</p>
      <h3>7.1 Department overview</h3>
      <p><code>GET /api/hod/portal</code> (extended, not replaced) now also returns: every course belonging to a programme in this department, each with its assigned instructors; every active academic staff member in the department with their specialization; and a department performance summary (student count, at-risk count by academic standing, average recorded GPA) — the same standing signal Student Lifecycle §7.4 already defines, read at department scale rather than reinvented.</p>
      <h3>7.2 Instructor assignment</h3>
      <p><code>POST</code> / <code>DELETE /api/hod/instructor-assignments</code>: a Head of Department may assign or remove an instructor for a course, restricted to courses belonging to a programme in their own department (verified server-side against <code>Department.headId</code>, not merely trusted from the request). This writes directly to the real <code>InstructorCourse</code> model (§3.3) — the same table every other part of the platform already reads — not a parallel "assignment" record that could disagree with it.</p>
      <h3>7.3 Course review</h3>
      <p>Course-level review (a Head of Department examining a specific course's quality) is not a separate mechanism: it is a <code>QualityReview</code> with <code>subjectType: COURSE</code>, scheduled by anyone holding <code>QUALITY_ASSURANCE</code> permission (§9, §10) — a Head of Department with that permission uses the same Quality Assurance workflow every other reviewer does, rather than a second review system scoped only to department heads.</p>

      <h2>8. Academic Dean Portal</h2>
      <p>The Dean Dashboard already showed department listings and announcements. This document adds faculty-wide programme, progression, graduation, and quality visibility — the view a Dean needs to see the whole faculty at once, not department by department.</p>
      <h3>8.1 Programmes &amp; standards</h3>
      <p><code>GET /api/dean/portal</code> (extended) now also returns every programme in the faculty (with department, coordinator, course and student counts), a faculty-wide progression summary (student count, at-risk count, average GPA — the same standing signal as §7.1, at faculty scale), and graduation candidates currently in progress across the faculty.</p>
      <h3>8.2 Curriculum approvals</h3>
      <p>Not a separate approval queue: programme and course structure changes are made by Programme Coordinators (§6) and Department Heads acting within their own <code>PROGRAM_MATTERS</code> / <code>DEPARTMENT_MATTERS</code> edit permission (§10); a Dean's <code>FACULTY_MATTERS</code> edit permission already lets them view and, where warranted, personally amend any programme in their faculty — this document does not add a second, formal sign-off workflow on top of the permission system that already governs who may change what.</p>
      <h3>8.3 Quality indicators</h3>
      <p>Aggregated directly from <code>QualityReview</code> across every programme, department, course, and faculty-level subject in this faculty: total reviews, compliant/minor/major outcome counts, and open improvement plans (§9.2) — the same real review data Quality Assurance itself works from (§9), read at faculty scale rather than a separately-computed "quality score."</p>

      <h2>9. Quality Assurance Portal</h2>
      <p>Already real before this document — programme, course, department, and faculty review scheduling and completion, through one <code>QualityReview</code> model and one generically-handled <code>VALID_SUBJECT_TYPES</code> pattern. This document extends that same pattern rather than building beside it, closing three of the four gaps named above and naming the fourth honestly.</p>
      <h3>9.1 Instructor evaluation</h3>
      <p><code>STAFF</code> is now a fifth <code>QASubjectType</code>, following the same <code>SUBJECT_FIELD</code> pattern as <code>PROGRAM</code> / <code>COURSE</code> / <code>DEPARTMENT</code> / <code>FACULTY</code> — an instructor evaluation is a <code>QualityReview</code> whose subject is a <code>StaffProfile</code>, not a separate "InstructorEvaluation" table with its own status, outcome, and reviewer logic that could drift from the rest of Quality Assurance. The Schedule a Review page's subject-type selector now offers "Staff (Instructor Evaluation)", sourced from every active academic staff member (<code>Position.isAcademic</code>), so an evaluation can actually be scheduled and run through the same queue, findings, outcome, and completion flow as every other review type.</p>
      <h3>9.2 Improvement plans</h3>
      <p><code>QualityReview.improvementStatus</code> (<code>NOT_REQUIRED</code> / <code>PENDING</code> / <code>IN_PROGRESS</code> / <code>COMPLETED</code>) tracks a completed review's recommendation through to resolution — distinct from <code>outcome</code>, which grades the review itself. A review completed with a recommendation defaults to <code>PENDING</code>, not silently to "nothing outstanding"; a reviewer can then update its status over one or more later follow-ups (<code>update_progress</code>) without re-completing the review. The Quality Assurance overview now surfaces a live count of open improvement plans (<code>PENDING</code> or <code>IN_PROGRESS</code>) institution-wide.</p>
      <h3>9.3 Evidence repository</h3>
      <p><code>QualityReview.evidenceUrls</code> (a string array) attaches supporting documents — an observation record, a syllabus excerpt, a sample of graded work, a survey export — directly to the review they evidence, addable both when a review is completed and later during improvement-plan follow-up, rather than a separate, unlinked document store a reviewer would have to cross-reference by hand. This is, deliberately, a review-level evidence repository (§5 already distinguishes it from per-assignment CLO evidence, which remains open).</p>
      <h3>9.4 Course evaluations</h3>
      <p>The first real student-submitted course evaluation system: a student rates a course they are enrolled in (<code>ratingOverall</code> required; optional <code>ratingContent</code>, <code>ratingInstructor</code>, and free-text <code>comments</code>) through <code>POST /api/student/course-evaluations</code>, one submission per student per course (upserted, so resubmitting updates rather than duplicates), anonymous by default (<code>isAnonymous</code>, true unless the student opts out). Quality Assurance sees only the aggregate: a new "Course Evaluations" tab shows per-course response counts and average ratings and, separately, the submitted comment text — never a respondent's identity, whether or not that submission was marked anonymous, since the aggregate endpoint (<code>GET /api/qa/course-evaluations</code>) never selects <code>studentId</code> at all.</p>
      <h3>9.5 PLO achievement — the one item this document does not build</h3>
      <p><strong>Genuine, open gap, not fabricated.</strong> Quality Assurance's remit includes "PLO achievement" alongside course evaluations, assessment quality, and instructor evaluation. Programme Learning Outcomes and Course Learning Outcomes exist today only as descriptive text inside each course's Course Specifications document (§1) — there is no <code>ProgrammeLearningOutcome</code> or <code>CourseLearningOutcome</code> table, no link from a CLO to the specific <code>Grade</code> or <code>Submission</code> rows that would evidence a student having met it, and therefore nothing a query could honestly aggregate into an "achievement percentage." Building this for real would mean modeling the entire curriculum's CLOs and PLOs as queryable rows and mapping every relevant assessment component to them — a substantial schema and data-entry undertaking in its own right, and a founder-level scope decision, not something to approximate with an invented number in this pass (§11). "Assessment quality," "instructor evaluation," "program review," and "improvement plans" — the rest of §8's list — are real and covered by §§9.1–9.3 and the pre-existing review/subject-type system; PLO achievement alone remains open.</p>

      <h2>10. Role Matrix, Permissions &amp; Workflows</h2>
      <h3>10.1 The real permission system</h3>
      <p>Every access decision described in this document runs through one mechanism, already real: <code>requireModulePermission(module, action)</code> (<code>lib/permissions.ts</code>) checks the caller's <code>StaffProfile.position.permissions</code> — a set of <code>PositionPermission</code> rows, each granting <code>canView</code> and/or <code>canEdit</code> on one of fourteen <code>Module</code> values — with <code>SUPER_ADMIN</code> bypassing the check entirely. No portal in this document has its own separate permission logic; each calls this same function against the module its data belongs to (<code>DEPARTMENT_MATTERS</code> for the HOD portal, <code>FACULTY_MATTERS</code> for the Dean portal, <code>PROGRAM_MATTERS</code> for the Coordinator portal, <code>QUALITY_ASSURANCE</code> for the QA portal).</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Position</th><th>Key modules (view / edit)</th></tr></thead>
      <tbody>
      <tr><td>Dean</td><td><code>FACULTY_MATTERS</code> (edit); <code>DEPARTMENT_MATTERS</code>, <code>PROGRAM_MATTERS</code>, <code>COURSES_GRADES</code> (view)</td></tr>
      <tr><td>Head of Department</td><td><code>DEPARTMENT_MATTERS</code> (edit); <code>PROGRAM_MATTERS</code>, <code>COURSES_GRADES</code> (view)</td></tr>
      <tr><td>Programme Coordinator</td><td><code>PROGRAM_MATTERS</code> (edit); <code>COURSES_GRADES</code> (view)</td></tr>
      <tr><td>Instructor</td><td><code>COURSES_GRADES</code> (edit)</td></tr>
      <tr><td>Senior Instructor</td><td><code>COURSES_GRADES</code> (edit); <code>QUALITY_ASSURANCE</code> (view) — new this document</td></tr>
      <tr><td>Academic Advisor</td><td><code>STUDENT_MATTERS</code> (view)</td></tr>
      <tr><td>Quality Assurance Officer</td><td><code>QUALITY_ASSURANCE</code> (edit)</td></tr>
      <tr><td>Academy Director</td><td><code>FACULTY_MATTERS</code>, <code>DEPARTMENT_MATTERS</code>, <code>PROGRAM_MATTERS</code>, <code>COURSES_GRADES</code>, <code>ACADEMIC_RECORDS</code>, <code>QUALITY_ASSURANCE</code> (view)</td></tr>
      </tbody></table></div>
      <p>This table states the same <code>positionPermissions</code> seed data already governing the admin console — it is not a second policy this document proposes, only the first place it is shown as a matrix rather than as seed-file entries.</p>
      <h3>10.2 Cross-portal workflows</h3>
      <p><strong>Instructor assignment.</strong> A Head of Department assigns an instructor to a course in their own department (§7.2) → the resulting <code>InstructorCourse</code> row is what makes that course appear in the instructor's own Instructor Portal (§5) and on their public Teaching Profile (§3.3) — one write, two portals reading it, never two.</p>
      <p><strong>Performance review.</strong> A qualifying reviewer (§3.5) opens a review in <code>DRAFT</code> on the instructor's admin profile → moves it to <code>SUBMITTED</code> when ready → the instructor sees it on their own profile (§3.5) and it becomes <code>ACKNOWLEDGED</code> once they have. Nothing in an unacknowledged review blocks any other system — this is a record, not a gate.</p>
      <p><strong>Instructor evaluation → improvement plan → evidence.</strong> Quality Assurance schedules a <code>STAFF</code> review (§9.1) against an instructor → completes it with findings, an outcome, and, if warranted, a recommendation, which sets an initial <code>improvementStatus</code> of <code>PENDING</code> (§9.2) → evidence can be attached at completion or added later (§9.3) → the plan's status is updated as work proceeds, without ever re-opening or duplicating the original review.</p>
      <p><strong>Course evaluation → quality visibility.</strong> A student submits a course evaluation (§9.4) → it is immediately reflected, anonymously, in Quality Assurance's aggregate Course Evaluations view and in that programme's Dean-level quality indicators (§8.3) — no manual aggregation step exists to be skipped or delayed.</p>

      <h2>11. Decisions Requiring Approval</h2>
      <p>Continuing the numbering from Institutional Foundation through Student Lifecycle &amp; Academic Administration.</p>
      <ol start="65">
      <li><strong>Built: Senior Instructor position and the full Instructor Profile system — action taken, not open.</strong> §2, §3: qualifications (general and Islamic), specialization, experience, languages, courses authorized to teach, professional development, and performance review, all now real and recorded per instructor.</li>
      <li><strong>Built: Programme Coordinator, Department Head, and Academic Dean portal expansions — action taken, not open.</strong> §§6–8: applicant/student/graduation visibility for coordinators, instructor assignment and department performance for heads of department, and faculty-wide programme/progression/quality visibility for deans.</li>
      <li><strong>Built: Quality Assurance instructor evaluation, improvement-plan tracking, and an evidence repository — action taken, not open.</strong> §9.1–§9.3: a fifth <code>QASubjectType</code> (<code>STAFF</code>), <code>improvementStatus</code> tracked to resolution, and <code>evidenceUrls</code> attachable at completion or during follow-up.</li>
      <li><strong>Built: student course evaluations — action taken, not open.</strong> §9.4: the first real student-submitted course evaluation system, anonymous by default, aggregated for Quality Assurance without ever exposing a respondent's identity.</li>
      <li><strong>No PLO/CLO achievement system exists — open.</strong> §9.5: Programme and Course Learning Outcomes remain document text, not queryable rows linked to real assessment data; an achievement-percentage feature needs its own schema and data-entry design before it can be built honestly, and is a founder-level scope decision this document does not make by approximation.</li>
      <li><strong>No CLO evidence repository at the assignment level — open.</strong> §5: the "Evidence" column in each course's CLO table is descriptive text, not an uploadable artifact tied to a specific student's submission; the evidence repository this document does build (§9.3) is review-level, not a substitute for this.</li>
      <li><strong>No structured practical-rubric scoring — open.</strong> §5: Practical Competency Rubrics remain document text scored by instructor judgment; no <code>practical</code> field or per-criterion scoring form exists yet (see also Assessment, Grading &amp; Progression decision 54, the same underlying schema gap).</li>
      <li><strong>Found, not fixed: the student timetable is demonstration data — open.</strong> §4: <code>GET /api/calendar/timetable</code> returns a fixed, identical schedule for every student rather than deriving one from real <code>Enrollment</code> or scheduled-session records; a real weekly timetable needs a recurring-schedule data model that does not exist today, which is an engineering scope decision, not a content correction this document can make alone.</li>
      </ol>
      <p><em>Ulul Azm Academy — Faculty, Staff &amp; Academic Portals Framework. Prepared for Founder review. This framework names every academic role from the Academy's own already-seeded positions, builds a real Instructor Profile and real expansions to the Coordinator, Department Head, Dean, and Quality Assurance portals, and states plainly — rather than approximates — the four places (PLO/CLO achievement, per-assignment CLO evidence, structured rubric scoring, and the demonstration-data timetable) where a genuinely complete portal would need further, founder-level work this document does not take upon itself to invent.</em></p>

    `.trim(),
  },
  'academy-master-integration': {
    title: 'Website, Recognition Readiness & Master Integration',
    bodyHtml: `
      <p><strong>Website, Recognition Readiness &amp; Master Integration.</strong> Using every prior framework — Institutional Foundation through Academic Regulations, Records &amp; Quality Assurance — as the complete Academy foundation, this document integrates the institution into one coherent whole. It does not redesign anything already settled; where an earlier document already governs a topic, this document indexes it rather than restating it (§1). Genuine new work was done alongside this document rather than only described: the Academy's course catalogue and three of its four pathway-tier programmes were discovered, during this document's own audit, to have never been created as real database records despite several later documents describing them as if they were — this is corrected in full (§10, and the companion technical work it documents), the Programme detail page and homepage were extended to show the real data that correction makes possible (§3–§4), and a static placeholder on the Instructor Portal was replaced with a real, working page. Where this document states a readiness framework rather than a claim — recognition and accreditation readiness above all — that distinction is deliberate and is repeated at every point it matters (§6).</p>

      <h2>1. Scope &amp; Constraints</h2>
      <p>This document covers, in order: the website's structure as it actually exists today (§2); the homepage's Academic Programs section (§3); what a programme page contains (§4); how the Academy's academic documentation functions as a catalogue (§5); a recognition and accreditation readiness framework that claims no accreditation (§6); the master data model (§7); the master workflow (§8); master academic alignment (§9); a final audit (§10); a closing synthesis distinguishing confirmed decisions from open ones (§11); and a decisions log (§12). Two constraints, both already standing and both reaffirmed here without exception: nothing in this document claims accreditation or external recognition the Academy has not actually been granted (Institutional Foundation §8's honest-recognition-claims principle, decision 4 still open); and nothing in this document is created or described as real unless it is genuinely real, working, and verifiable in the platform's own data and code — where a genuine gap was found during this document's audit, it is named plainly rather than filled with an invented system or a fabricated number, exactly as every prior document in this series has already committed to doing.</p>

      <h2>2. Website Structure</h2>
      <p>The public website already covers every element this section asks for; this section indexes what exists rather than proposing a redesign. Top-level navigation is five destinations plus login: Home, Academy, Admission, Bookstore, Media, Library.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Website element</th><th>Where it actually lives</th></tr></thead>
      <tbody>
      <tr><td>Identity, mission, learning philosophy</td><td>Homepage "Welcome to Ulul Azm" section; full detail at Academy Foundation (institutional identity, mission, educational philosophy)</td></tr>
      <tr><td>Academic programs</td><td>Homepage Academic Programs section (§3, new this document); full catalogue at /programs and each programme's own page (§4)</td></tr>
      <tr><td>Departments</td><td>Academy Governance (organizational structure); Department Curriculum (department-to-topic and department-to-program mapping)</td></tr>
      <tr><td>Learning model</td><td>Academy Pathways (the five-tier pathway framework); Course Specifications (per-course teaching methodology)</td></tr>
      <tr><td>Student support</td><td>Student Lifecycle §7 (academic advising); each programme page's Support section (§4, new this document)</td></tr>
      <tr><td>Faculty / scholars</td><td>Faculty &amp; Portals (staff structure, Instructor Profile); each programme page's real, deduplicated instructor roster (§4, new this document) — see §10 for the one genuine gap this leaves</td></tr>
      <tr><td>Admissions</td><td>/admission (the real application form, now with the ~20 fields Student Lifecycle §3 added); /academy-pathways for pathway-specific entry requirements</td></tr>
      <tr><td>News / events</td><td>Homepage institution-wide Announcements strip — real, admin-managed, renders nothing when there is nothing to show rather than a placeholder feed</td></tr>
      <tr><td>Contact</td><td>/contact, plus the footer's contact details</td></tr>
      </tbody></table></div>
      <p>Two items on this list are handled honestly rather than built to look more complete than they are. First, "News / events" is a single institution-wide announcements strip, not a separate news archive or an events calendar with dates, RSVPs, or a distinct events type — if the Academy wants a dedicated events system later, that is a new, founder-level feature, not a gap in what already exists. Second, "Faculty / scholars" has no standalone public directory page (no <code>/faculty</code> route listing every instructor with a photo and bio) — faculty are real and visible everywhere the platform actually has structured faculty data (Instructor Profile fields, each programme's own roster), but a browsable, cross-programme directory does not exist today. Both are named as open items rather than built speculatively (§10, §12).</p>

      <h2>3. Academic Programs — Homepage Section</h2>
      <p>A new homepage section, deliberately scoped to five compact cards rather than the full 42-course catalogue, was built this document (<code>AcademicProgramsSection</code> in <code>app/page.jsx</code>, placed between the existing subject-area teaser and the Bookstore section). Each card states, for one pathway tier: purpose, who it is for, study areas, duration, delivery, progression, admission, a "Programme Details" link, and — where the tier is open to enrolment — an "Apply" link. Every field's wording is transcribed from Academy Pathways §1–§2, not invented for the homepage.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Tier</th><th>Programme Details links to</th><th>Apply shown?</th></tr></thead>
      <tbody>
      <tr><td>Foundation Studies</td><td>Its own real programme page (§4), resolved live by the Academy's public programmes endpoint — never a hardcoded id</td><td>Yes</td></tr>
      <tr><td>Intermediate Islamic Studies</td><td>Its own real programme page</td><td>Yes</td></tr>
      <tr><td>Advanced Islamic Studies</td><td>Its own real programme page</td><td>Yes</td></tr>
      <tr><td>Diploma in Islamic Studies</td><td>Its own real programme page</td><td>Yes</td></tr>
      <tr><td>Specialized Certificate Programs</td><td>/academy-pathways (the framework itself — there is no individual certificate page to link to)</td><td>No — see below</td></tr>
      </tbody></table></div>
      <p><strong>Specialized Certificate Programs is shown honestly, not glossed over.</strong> Academy Pathways §1 and §7 already establish this as a real, approved fifth pathway tier and framework — but no individual certificate has yet been approved with a defined course list under that framework. The homepage card says so directly ("a framework, not yet an open programme") and deliberately carries no "Apply" action, rather than linking to an application for a credential that does not yet exist. This matches, rather than contradicts, Course Catalogue §9's own note that certificate course lists are reserved and undefined.</p>

      <h2>4. Programme Page</h2>
      <p>Every active programme's page (<code>/programs/[id]</code>) was extended by this document to include every element listed below, either already present or newly added. Nothing here is unique per page beyond its own programme's real data — the same component serves all four real pathway-tier programmes.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Programme page element</th><th>Status &amp; source</th></tr></thead>
      <tbody>
      <tr><td>Overview, purpose</td><td>Already present — programme description, now joined by a new "Is This Programme Right For You?" block transcribing Academy Pathways' purpose, learner-profile, entry-requirement, placement, assessment and progression text for that tier</td></tr>
      <tr><td>Learner profile, entry requirements, placement</td><td>New this document — the same block, above</td></tr>
      <tr><td>Duration, delivery</td><td>New this document — delivery is stated honestly: online, instructor-led, through the Academy's own course portal, with any in-person component named as a standing open decision rather than asserted either way</td></tr>
      <tr><td>Learning outcomes</td><td>Cross-referenced to Assessment, Grading &amp; Progression §3.2's seven Programme Learning Outcomes (§9 below) — not restated per page</td></tr>
      <tr><td>Study plan, courses, units, prerequisites</td><td>Already present (study plan table); prerequisites column is new this document, reading real <code>Course.prerequisites</code> relationships that existed in the schema but were empty for every course until this document's companion seed work (§10)</td></tr>
      <tr><td>Assessment</td><td>Cross-referenced to Assessment, Grading &amp; Progression §4–§6, not restated</td></tr>
      <tr><td>Progression, graduation</td><td>Cross-referenced to Assessment, Grading &amp; Progression §7–§8 and the pathway-info block's own progression field</td></tr>
      <tr><td>Faculty</td><td>New this document — a real, deduplicated roster of the instructors actually assigned to the programme's own courses (joined through <code>InstructorCourse</code> to each instructor's Instructor Profile), with an honest empty state ("No instructor has been assigned to this programme's courses yet") rather than invented names where none exist yet</td></tr>
      <tr><td>Support</td><td>New this document — a real cross-reference to Academic Advisor assignment and Student Affairs (Student Lifecycle §7)</td></tr>
      <tr><td>FAQs</td><td>New this document — three questions genuinely specific to reading a programme page: the accreditation caution, how online delivery works, and placement-in-lieu-of-prerequisites</td></tr>
      <tr><td>Application</td><td>Already present — the apply call-to-action linking to /admission</td></tr>
      </tbody></table></div>
      <p>A course's approval status is now shown next to it in the study plan (Not yet running / Pending scholarly review, or nothing for an already-approved course), sourced from the real <code>approvalStatus</code> Academic Regulations §4 already added to every course. This is the same honest signal Course Specifications already named for specific courses (IS-403 needing full syllabus-level Committee approval before it can run at all; IS-304, IC-301, IE-402, IE-405 and IC-402 needing dedicated Scholarly Review Committee sign-off) — the programme page now shows that status to a prospective applicant instead of presenting every listed course as equally ready to take.</p>

      <h2>5. Academic Catalogue</h2>
      <p>The Academic Catalogue elements this document covers — institutional information, academic governance, departments, programs, admission, academic policies, course catalogue, academic calendar, assessment, graduation, certificates, student responsibilities, faculty information — already exist as real content, each owned by exactly one prior document, indexed together at the public /academy hub page and its admin equivalent. No standalone "Academic Catalogue" document or page is built by this document; building one would either duplicate eleven already-governing documents or thin them into a summary that drifts out of date the next time one of them changes. The index below is what a reader actually finds today.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Catalogue element</th><th>Governing document</th></tr></thead>
      <tbody>
      <tr><td>Institutional information</td><td>Academy Foundation</td></tr>
      <tr><td>Academic governance</td><td>Academy Governance</td></tr>
      <tr><td>Departments</td><td>Academy Governance; Department Curriculum</td></tr>
      <tr><td>Programs</td><td>Academy Pathways; Academy Curriculum; §3–§4 of this document</td></tr>
      <tr><td>Admission</td><td>Student Lifecycle §3 (application form); Academy Pathways §8 (placement); Academic Regulations §2, §4 (approval)</td></tr>
      <tr><td>Academic policies</td><td>Academic Regulations §2's own consolidated policy index</td></tr>
      <tr><td>Course catalogue</td><td>Course Catalogue; Course Specifications</td></tr>
      <tr><td>Academic calendar</td><td>Not yet a named, dated calendar system — <code>AcademicTerm</code> exists and is real, but a published calendar of terms, deadlines and holidays is not built; flagged, not invented (§10, §12)</td></tr>
      <tr><td>Assessment</td><td>Assessment, Grading &amp; Progression §4–§6</td></tr>
      <tr><td>Graduation</td><td>Assessment, Grading &amp; Progression §7.9–§8; Student Lifecycle §9</td></tr>
      <tr><td>Certificates</td><td>Assessment, Grading &amp; Progression §8 (<code>GraduationDocument</code>)</td></tr>
      <tr><td>Student responsibilities</td><td>Institutional Foundation's Institutional Objectives; Student Lifecycle (advising, attendance, records)</td></tr>
      <tr><td>Faculty information</td><td>Faculty &amp; Portals §3; each programme's own faculty roster (§4)</td></tr>
      </tbody></table></div>
      <p>Whether a single consolidated /academic-catalogue page, generated from these eleven documents rather than replacing them, would still be worth building for a reader who does not want to open eleven separate pages is left open, as a presentation decision rather than a content gap (§12).</p>

      <h2>6. Recognition &amp; Accreditation Readiness</h2>
      <p><strong>No accreditation is claimed anywhere in this section, or anywhere else in the Academy's documentation.</strong> This is not new: Institutional Foundation §8 already committed to it as a founding principle ("the Academy does not claim external recognition or accreditation it has not actually been granted"), and left the accreditation strategy itself as decision 4, still open. What follows is a readiness framework — an honest inventory of which foundations a recognition body would typically expect to see already exist, and which would need to be confirmed with the appropriate country authority before any accreditation claim could honestly be made — not a claim that recognition has been sought, granted, or is imminent.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Readiness area</th><th>Academy status</th><th>Requires confirmation from</th></tr></thead>
      <tbody>
      <tr><td>Institutional governance</td><td>Real — Academy Governance names organizational structure, committees and decision authority</td><td>The appropriate national/regional education or religious-education authority, on what governance structure it requires for recognition</td></tr>
      <tr><td>Academic standards</td><td>Real — Academy Pathways sets competence tiers; Assessment, Grading &amp; Progression sets grading and progression standards</td><td>Whether the Academy's own standards meet a recognized external benchmark, or need mapping to one</td></tr>
      <tr><td>Faculty qualifications</td><td>Partially real — Instructor Profile records qualifications and experience; Course Specifications names which courses need Scholarly Review Committee sign-off (§4 above); no formal external credential-verification step exists</td><td>Whether the authority requires third-party credential verification beyond the Academy's own review</td></tr>
      <tr><td>Curriculum documentation</td><td>Real — Curriculum Framework, Department Curriculum, Course Catalogue and Course Specifications document every course in detail</td><td>Whether the documented depth and credit-hour structure meets the authority's own curriculum-hour requirements</td></tr>
      <tr><td>Assessment evidence</td><td>Real — <code>Grade</code> records exist per component, per course, per term, and PLO/CLO mapping exists as text (§9)</td><td>Whether the authority requires structured, queryable PLO/CLO achievement data (§9, §10) beyond what exists today</td></tr>
      <tr><td>Student records</td><td>Real — Student Lifecycle §8's records framework; transcript and grade history</td><td>Records-retention and access requirements specific to the authority</td></tr>
      <tr><td>Quality assurance</td><td>Real — the Plan-Design-Teach-Assess-Measure-Review-Improve cycle, program/course review, computed KPIs (Academic Regulations §6–§9)</td><td>Whether the cycle's cadence and documentation meet the authority's own QA-audit expectations</td></tr>
      <tr><td>Policies</td><td>Real — Academic Regulations §2's consolidated policy index covers every regulation area a recognition review would typically ask for</td><td>Jurisdiction-specific policy requirements (e.g. specific appeals timelines) not yet cross-checked against any one authority</td></tr>
      <tr><td>Learning resources</td><td>Real — Bookstore, Media, Library are live, distinct systems with real content</td><td>Whether resource volume/breadth meets a minimum the authority sets</td></tr>
      <tr><td>Facilities</td><td>Open — the Academy operates online; no physical-facility documentation exists because none may be required, but this has not been confirmed against any specific authority's requirements</td><td>Whether the target authority accredits online-only institutions, and on what facility-equivalent terms (e.g. platform reliability, proctoring)</td></tr>
      <tr><td>Financial &amp; administrative systems</td><td>Real — Order, Receipt, fee and payment systems already exist and are live for admissions, bookstore and media</td><td>Financial-solvency or reporting requirements specific to the authority</td></tr>
      </tbody></table></div>
      <p>Reading this table as a checklist, the Academy is documentation-ready in most areas and administratively real in the rest; what is missing everywhere is the same missing piece — an actual named target authority to confirm requirements against. Institutional Foundation decision 4 (accreditation strategy: whether, with whom, and on what timeline) is the decision that would produce that target, and this document does not make it by extension. Until it is made, "readiness" in this section means only "the foundations a review would likely ask about already exist," never "recognition is being pursued" or "recognition is likely."</p>

      <h2>7. Master Data Model</h2>
      <p>The chain this section states — Academy → Departments → Programs → PLOs → Study Plans → Courses → CLOs → Prerequisites → Assessments → Students → Enrollment → Results → Transcript → Certificates → Quality Assurance — already exists as the Prisma schema (<code>prisma/schema.prisma</code>), which is the Academy's real, enforced, de facto master data model; this section names the chain against its real models rather than proposing a new one.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Chain link</th><th>Real model(s)</th></tr></thead>
      <tbody>
      <tr><td>Academy</td><td>The platform itself — no single "Academy" row; institutional identity lives in Academy Foundation's document content</td></tr>
      <tr><td>Departments</td><td><code>Department</code> (five real departments, plus cross-cutting units named in Academy Governance §3 — Research &amp; Learning Skills, and Tazkiyah/pedagogy/da'wah — that are not their own <code>Department</code> rows)</td></tr>
      <tr><td>Programs</td><td><code>Program</code> — four real pathway-tier rows as of this document (§10), plus <code>ProgramLevel</code></td></tr>
      <tr><td>PLOs</td><td>Text, cross-referenced by course — Assessment, Grading &amp; Progression §3.2's seven PLOs; not a queryable row linked to <code>Program</code> (§9, §10)</td></tr>
      <tr><td>Study Plans</td><td>Each programme's ordered course list, computed from <code>Course.programId</code> and <code>Course.semesterLevel</code></td></tr>
      <tr><td>Courses</td><td><code>Course</code> — 42 real rows as of this document (§10)</td></tr>
      <tr><td>CLOs</td><td>Text per course in Course Specifications; not a queryable row (§9, §10) — same status as PLOs, one level down</td></tr>
      <tr><td>Prerequisites</td><td><code>Course.prerequisites</code> / <code>isPrerequisiteFor</code> self-relation — defined in the schema, populated for every course as of this document (§10)</td></tr>
      <tr><td>Assessments</td><td><code>Grade</code>, per component, per course, per term</td></tr>
      <tr><td>Students</td><td><code>StudentProfile</code>, <code>User</code></td></tr>
      <tr><td>Enrollment</td><td><code>Enrollment</code></td></tr>
      <tr><td>Results</td><td><code>Grade</code>, <code>TermRecord</code></td></tr>
      <tr><td>Transcript</td><td><code>TermRecord</code> aggregation; <code>TRANSCRIPT</code> request type</td></tr>
      <tr><td>Certificates</td><td><code>GraduationApplication</code>, <code>GraduationDocument</code></td></tr>
      <tr><td>Quality Assurance</td><td><code>QualityReview</code>, <code>improvementStatus</code>, <code>CourseEvaluation</code>, <code>StaffPerformanceReview</code></td></tr>
      </tbody></table></div>
      <p>Two links in this chain are text, not data — PLOs and CLOs. Every other link is a real, queryable relation. This is stated plainly here because it is the same distinction §9 and §10 return to: the chain reads as complete in prose, but two of its fourteen links do not yet support being queried the way the rest do.</p>

      <h2>8. Master Workflow</h2>
      <p>The Applicant → Admission → Placement → Program → Registration → Courses → Learning → Assessment → Results → Progression → Graduation → Certificate → Alumni workflow is already stated in full, stage by stage, against its real mechanism, in Student Lifecycle &amp; Academic Administration §2's fifteen-stage table (Discovery through Alumni) — this document does not restate that table, only confirms it against the workflow's own naming below and notes the one place it already names an honest gap.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Workflow stage</th><th>Student Lifecycle §2 stage(s)</th></tr></thead>
      <tbody>
      <tr><td>Applicant</td><td>Discovery, Application</td></tr>
      <tr><td>Admission</td><td>Admission</td></tr>
      <tr><td>Placement</td><td>Placement</td></tr>
      <tr><td>Program</td><td>Enrollment</td></tr>
      <tr><td>Registration</td><td>Registration</td></tr>
      <tr><td>Courses / Learning</td><td>Learning, Attendance</td></tr>
      <tr><td>Assessment / Results</td><td>Assessment, Results</td></tr>
      <tr><td>Progression</td><td>Advising, Progression</td></tr>
      <tr><td>Graduation / Certificate</td><td>Graduation, Certificate</td></tr>
      <tr><td>Alumni</td><td>Alumni — named as the workflow's terminal stage, with no system beyond <code>StudentProfile.status = GRADUATED</code> existing yet (Student Lifecycle §9, decision 64, still open)</td></tr>
      </tbody></table></div>
      <p>The workflow's stage naming and the platform's own naming match stage for stage. The one gap this workflow already carries forward honestly — no alumni directory, network, or post-graduation engagement record — is not addressed by this document; it remains Student Lifecycle's decision 64.</p>

      <h2>9. Master Academic Alignment</h2>
      <p>The Mission → Graduate Profile → Program Outcomes → Curriculum → Courses → CLOs → Teaching → Assessment → Results → PLO Achievement → Program Review → Improvement chain is, like §8, already substantially built and documented; this section confirms the chain against its real sources rather than redefining it.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Chain link</th><th>Real source</th></tr></thead>
      <tbody>
      <tr><td>Mission</td><td>Academy Foundation §1</td></tr>
      <tr><td>Graduate Profile</td><td>Academy Foundation §4 — five competence tiers</td></tr>
      <tr><td>Program Outcomes</td><td>Assessment, Grading &amp; Progression §3.2 — seven PLOs, derived bottom-up from the 42 courses' own CLOs</td></tr>
      <tr><td>Curriculum</td><td>Curriculum Framework; Department Curriculum</td></tr>
      <tr><td>Courses</td><td>Course Catalogue — 42 real rows as of this document (§10)</td></tr>
      <tr><td>CLOs</td><td>Course Specifications — per-course learning outcomes and weekly content</td></tr>
      <tr><td>Teaching</td><td>Faculty &amp; Portals §5 — Instructor Portal, course delivery</td></tr>
      <tr><td>Assessment</td><td>Assessment, Grading &amp; Progression §4–§6</td></tr>
      <tr><td>Results</td><td><code>Grade</code>, <code>TermRecord</code></td></tr>
      <tr><td>PLO Achievement</td><td>Not computed — text cross-reference only (Academic Regulations §7, already naming this gap; not filled by this document)</td></tr>
      <tr><td>Program Review</td><td>Academic Regulations §7 — real <code>QualityReview</code>, subject type PROGRAM</td></tr>
      <tr><td>Improvement</td><td><code>improvementStatus</code>, tracked to completion (Faculty &amp; Portals §9.2)</td></tr>
      </tbody></table></div>
      <p>Every link in this chain is real except one: PLO Achievement. This document reaffirms, rather than re-argues, why it is not computed — PLOs and CLOs are document text cross-referenced to course content, not queryable rows linked to per-student assessment results, and approximating a percentage from data never structured to support one would produce a number that looks precise while meaning nothing. The chain otherwise closes end to end, and Program Review already uses every other link's real data (course pass rates, student and instructor feedback, curriculum mapping) as its actual evidence base.</p>

      <h2>10. Final Audit</h2>
      <p>This audit was carried out against a standard institutional audit checklist. Its one major finding, discovered while researching this document and confirmed with the Academy's founder before being acted on, reshaped the rest of this document's technical scope; the remaining findings are smaller and are each closed or left open individually below.</p>

      <h3>10.1 Major finding: the course catalogue and three pathway programmes were never real</h3>
      <p>Course Catalogue's 42 courses existed only as document text in this platform's content system — never as <code>Course</code> rows in the database, and never seeded by any script. Its own closing text already said so ("illustrative — not yet real Course records — and none should be created until decision 22 and decisions 30–33 above are resolved"), but three later documents — Assessment, Grading &amp; Progression, Faculty, Staff &amp; Academic Portals, and Academic Regulations, Records &amp; Quality Assurance — went on to describe "every one of the Academy's existing 42 courses" as though they already existed, without that description ever being verified against the database. Separately, of the four pathway-tier programmes Academy Pathways names, only Diploma in Islamic Studies had ever been seeded as a real <code>Program</code> row; Foundation, Intermediate and Advanced were explicitly commented in the seed script as framework-only, pending a schema migration that had not yet been done. Asked directly whether the 42 courses were real, working database records, the founder confirmed they were not, and reaffirmed that everything in the Academy must be real and working, never fabricated. This document's companion technical work corrects both gaps in full (§12, decisions 80–84): a schema migration added <code>FOUNDATION</code>, <code>INTERMEDIATE</code> and <code>ADVANCED</code> to <code>ProgramLevel</code>; all four pathway programmes now exist as real <code>Program</code> rows; all 42 catalogued courses now exist as real <code>Course</code> rows, correctly linked to their programme, department category, credit hours and semester level; every course's real prerequisite relationships (from Course Catalogue §5's own Prerequisite Map) are now populated, where the schema relation existed but had been empty for every course until now; and approval status was set honestly per course — <code>DRAFT</code> for IS-403 (which Course Specifications already said needs full syllabus-level Committee approval before it can run at all) and <code>UNDER_REVIEW</code> for IS-304, IC-301, IE-402, IE-405 and IC-402 (each already named as needing dedicated Scholarly Review Committee sign-off), with every other course <code>APPROVED</code> — rather than approving all 42 blindly.</p>
      <p>The deeper lesson this finding leaves for the series, stated plainly rather than smoothed over: a later document's confident description of an earlier document's subject matter is not, by itself, evidence that the subject matter was ever built. This document's own claims above have been checked directly against seed data, schema, and route code before being written, for exactly this reason.</p>

      <h3>10.2 Audit checklist — remaining items</h3>
      <div class="table-wrap"><table>
      <thead><tr><th>Checklist item</th><th>Finding</th></tr></thead>
      <tbody>
      <tr><td>Duplication</td><td>None found beyond what Department Curriculum §9 and Course Catalogue §8 already audit and resolve; no new duplication introduced by this document's own additions</td></tr>
      <tr><td>Missing prerequisites</td><td>Found and closed by §10.1 — every course's prerequisites are now populated from the Course Catalogue's own Prerequisite Map</td></tr>
      <tr><td>Curriculum gaps</td><td>None new; Curriculum Framework §9 and Course Catalogue §9 already name and track the series' known curriculum gaps</td></tr>
      <tr><td>Inconsistent terminology</td><td>One found: "Academic Catalogue" is used informally in places in informal use to mean the combined set of academic documents, while no single page is actually named that (§5) — resolved in this document by treating "Academic Catalogue" as an index, not a page title, and naming the eleven documents it actually indexes</td></tr>
      <tr><td>Unclear responsibilities</td><td>None new; Academic Governance §7–§8 and this document's own §4 course/programme approval index already state who approves what</td></tr>
      <tr><td>Unsupported qualifications</td><td>None found in this document's own additions; the Diploma and pathway certificates continue to be described only as Academy-issued, never externally accredited (§6)</td></tr>
      <tr><td>Assessment misalignment</td><td>None new; Assessment, Grading &amp; Progression §4.3 already found and corrected the one real conflict between live grading logic and Course Specifications' published text</td></tr>
      <tr><td>PLO/CLO gaps</td><td>Confirmed, not newly found — §9 above restates the same gap Academic Regulations §7 and Faculty &amp; Portals §9.5 already name: no queryable PLO/CLO achievement data exists</td></tr>
      <tr><td>Progression problems</td><td>None found; progression logic (Assessment, Grading &amp; Progression §7) is unaffected by this document's changes and continues to rely on <code>semesterLevel</code>, which every one of the 42 courses now has set correctly (§10.1)</td></tr>
      <tr><td>Regulatory assumptions</td><td>One found: earlier documents' description of the 42 courses as "existing" was, in effect, an unverified assumption carried across three documents (§10.1) — the practice of stating a system as real without checking the database is the regulatory-assumption risk this item asks about, now corrected and named as a lesson for the series</td></tr>
      <tr><td>Accessibility problems</td><td>None newly audited in depth; the homepage's new Academic Programs section and the programme page's new sections follow the same layout and color conventions already used elsewhere on the site, but no dedicated accessibility (WCAG) audit has been performed on this site at any point in the series — flagged as a genuine, unaddressed gap (§12)</td></tr>
      <tr><td>Quality assurance gaps</td><td>None new; Academic Regulations §6–§9 already names the one QA gap that matters most (PLO/CLO achievement), repeated here rather than re-found</td></tr>
      </tbody></table></div>

      <h2>11. Final Master Document — Academy Blueprint</h2>
      <p>This section is the requested closing synthesis: every prior framework, plus this document's own additions, read together as one blueprint, with each element marked by what kind of statement it is — not by how confident it sounds.</p>
      <p><strong>Confirmed Academy decisions</strong> — settled, in force, not reopened by this document: the five-tier pathway framework (Academy Pathways); the six-department-equivalent curriculum structure (Department Curriculum); the grading scale and progression rules (Assessment, Grading &amp; Progression §4, §7); the academic integrity and course/programme approval systems (Academic Regulations §3–§4); the Plan-Design-Teach-Assess-Measure-Review-Improve quality cycle (Academic Regulations §6); and, as of this document, the 42 real courses and four real pathway programmes with populated prerequisites and honest approval status (§10.1).</p>
      <p><strong>Recommended designs</strong> — built or extended by this document as the reasonable way to implement something the Academy had already approved in principle, but not itself a new founder-level policy: the homepage Academic Programs section's five-card layout (§3); the programme page's expanded sections (§4); the Instructor Portal's real Student Enrollees page, replacing its placeholder, built by extending the existing roster endpoint rather than inventing a new data source (§12, decision 88).</p>
      <p><strong>Assumptions this document made, stated so they can be checked</strong>: that "Academic Catalogue," as referenced in Academy-wide planning, means the combined index of existing documents rather than a request for one new page (§5); that a course's <code>approvalStatus</code>, already added in Academic Regulations §4, is the right signal to surface on a programme page rather than inventing a second status field; that the homepage's Specialized Certificate card should link to the pathway framework document rather than being omitted entirely, since the tier itself is real even though no certificate under it is.</p>
      <p><strong>Matters requiring scholarly review</strong> — unchanged from where Course Specifications already left them, restated here because §4 now surfaces them to applicants directly: IS-403 requires full syllabus-level Scholarly Review Committee approval before it can run at all; IS-304, IC-301, IE-402, IE-405 and IC-402 require the Committee's scope-sensitivity sign-off before they can run.</p>
      <p><strong>Matters requiring regulatory or legal confirmation</strong> — genuinely outside this document's or any prior document's authority to decide: which country's or region's recognition authority, if any, the Academy will approach (Institutional Foundation decision 4); whether that authority accredits online-only institutions and on what facility-equivalent terms (§6); any jurisdiction-specific requirement on records retention, learner protection, or financial reporting not yet checked against a named authority (§6).</p>

      <h2>12. Decisions Requiring Approval</h2>
      <ol start="80">
      <li><strong>Built: real Program records for Foundation, Intermediate and Advanced Islamic Studies — action taken, not open.</strong> §10.1: a schema migration added <code>FOUNDATION</code>, <code>INTERMEDIATE</code> and <code>ADVANCED</code> to <code>ProgramLevel</code>; all four pathway-tier programmes (these three plus the already-real Diploma) now exist as real, seeded <code>Program</code> rows.</li>
      <li><strong>Built: all 42 catalogued courses created as real Course records — action taken, not open.</strong> §10.1: every course named in Course Catalogue now exists as a real <code>Course</code> row, correctly linked to its programme, department category, credit hours and semester level — closing the gap the founder confirmed was not yet real.</li>
      <li><strong>Built: real prerequisite relationships populated for every course — action taken, not open.</strong> §10.1: <code>Course.prerequisites</code>, defined in the schema but empty for every course until now, now reflects Course Catalogue §5's own Prerequisite Map.</li>
      <li><strong>Built: honest per-course approval status, not a blanket approval — action taken, not open.</strong> §10.1: IS-403 set to Draft, IS-304/IC-301/IE-402/IE-405/IC-402 set to Under Review (matching Course Specifications' own named scholarly-review flags), every other course Approved.</li>
      <li><strong>Correction applied: Course Catalogue's closing caveat is now out of date and should be read against this document.</strong> §10.1: the caveat correctly said the 42 courses were not yet real; as of this document, they are — this decision item records that the underlying condition it described has changed, without editing that document's own historical text.</li>
      <li><strong>Correction applied: Assessment, Faculty &amp; Portals, and Academic Regulations' "every one of the Academy's existing 42 courses" language is now accurate, where it was previously unverified.</strong> §10.1: the wording in each of those three documents was true in intent but not yet true in the database at the time it was written; this document does not rewrite their text, but records that the condition they assumed is now actually met.</li>
      <li><strong>Built: expanded Programme detail page — action taken, not open.</strong> §4: real prerequisites and approval-status badges in the study plan; a real, deduplicated faculty roster; a pathway-info block sourced from Academy Pathways; Support and FAQ sections.</li>
      <li><strong>Built: homepage Academic Programs section — action taken, not open.</strong> §3: five pathway-tier cards, each resolving to its real programme id live rather than a hardcoded one, deliberately scoped short of the full course catalogue.</li>
      <li><strong>Fixed: a real, pre-existing bug in the Instructor Attendance feature — action taken, not open.</strong> Found during this document's work on the Instructor Portal: <code>GET /api/instructor/attendance</code> selected a <code>StudentProfile.nationality</code> field that does not exist in the schema (nationality is only ever captured on <code>AdmissionApplication</code>, which has no link back to <code>StudentProfile</code>), so the endpoint — and the Attendance page depending on it — failed on every real call. Corrected by removing the nonexistent field rather than fabricating a data source for it; the Attendance page now works.</li>
      <li><strong>Built: a real Student Enrollees page on the Instructor Portal, replacing a static placeholder — action taken, not open.</strong> Flagged at the end of Academic Regulations, Records &amp; Quality Assurance as the platform's one remaining static placeholder page: <code>app/instructor-dashboard/students/page.tsx</code> now shows real enrolled students across an instructor's own courses, by extending the existing roster endpoint (email, level, status and programme, in addition to the name and student number it already returned) rather than building a second, competing data source.</li>
      <li><strong>No standalone public faculty directory exists — open.</strong> §2: faculty are real and visible per-programme (§4) and within Faculty &amp; Portals' own structure, but there is no single, browsable, cross-programme page listing every instructor; a founder-level decision on whether to build one.</li>
      <li><strong>No academic calendar exists as a named, dated system — open.</strong> §5: <code>AcademicTerm</code> is real, but a published calendar of terms, deadlines and holidays is not built.</li>
      <li><strong>No dedicated events system exists — open.</strong> §2: the homepage's institution-wide Announcements strip is real and live, but it is not an events calendar with dates or RSVPs; whether the Academy wants one is a founder-level decision.</li>
      <li><strong>Whether a single consolidated Academic Catalogue page is worth building remains open.</strong> §5: this document indexes eleven existing documents rather than replacing them; a generated single-page view of that same index is a presentation decision, not a content gap, and is left to the founder.</li>
      <li><strong>Recognition/accreditation readiness is documented, not pursued — Institutional Foundation decision 4 remains the open item.</strong> §6: this document's readiness table identifies what a recognition authority would likely expect and what is already real versus what needs jurisdiction-specific confirmation; it does not choose a target authority or begin a recognition process, matching the "no accreditation claimed" constraint stated at the outset (§1).</li>
      <li><strong>PLO/CLO achievement remains uncomputed — restated, not newly found.</strong> §7, §9: the same gap Academic Regulations §7 and Faculty &amp; Portals §9.5 already name; a real, queryable PLO/CLO data model would be needed before an honest achievement percentage could be produced, and this document does not approximate one.</li>
      <li><strong>No accessibility (WCAG) audit has ever been performed on this site — open.</strong> §10.2: named plainly as a gap the series has not yet addressed at any point, not only in this document's own new sections.</li>
      </ol>
      <p><em>Ulul Azm Academy — Website, Recognition Readiness &amp; Master Integration. Prepared for Founder review. This document closes the series by integrating every prior framework into one blueprint, correcting the one genuine discrepancy its own audit found — a course catalogue and three pathway programmes that had never actually been created as real records, despite later documents describing them as real — and building the real homepage, programme-page, and Instructor Portal work that discrepancy's correction made possible. It claims no accreditation, computes no figure it cannot support with real data, and leaves every matter that is genuinely a founder's, a scholar's, or a regulator's to decide named as such rather than decided by default.</em></p>

    `.trim(),
  },
  'academy-academic-regulations': {
    title: 'Academic Regulations, Records & Quality Assurance',
    bodyHtml: `
      <p><strong>Academic Regulations, Records &amp; Quality Assurance Framework.</strong> Using every prior framework, from Institutional Foundation through Faculty, Staff &amp; Academic Portals, as the fixed academic foundation, this document is the single place the Academy's academic regulations are named together end to end: admission through certificate, academic integrity, the record framework, the quality assurance cycle, program and course review, and the institution's real, computed academic KPIs. For the large majority of the academic regulation areas this document addresses, the regulation already exists in full somewhere in that foundation — this document's job for those is to index them together, not redescribe them (§2). Three things did not exist anywhere in the platform before this document and were genuinely built alongside it: a real academic-integrity case-tracking system (§3), replacing a paragraph Course Specifications had already drafted but explicitly marked "proposed, not yet founder-confirmed"; a real course-and-program approval workflow (§4), closing a gap Academic Governance had already flagged twice as informal and partial; and a set of real, computed academic dashboards and KPIs (§9), deliberately built from existing data rather than any invented formula. Two earlier documents are corrected in place because this document's work revealed they were now out of date — Academic Governance's course/program-approval status, and Course Specifications' academic-integrity paragraph — both noted where they occur and recorded again here (§10).</p>

      <h2>1. Scope &amp; Constraints</h2>
      <p>This document states the consolidated index of academic policies (§2), the real academic integrity framework (§3), the real course and program approval workflow (§4), the records framework (§5), the quality assurance cycle (§6), program review (§7), course review (§8), and academic dashboards and KPIs (§9) — followed by a record of what was built, corrected, or remains an open, founder-level decision (§10). Where a regulation already exists and works, this document cross-references it by section rather than restating or redesigning it; grading, progression, graduation, the student journey, placement, faculty roles, and every portal already described elsewhere keep their existing, already-correct behavior. Where a genuine functional gap existed — nowhere to record an integrity case, no enforced approval state for a course or program, no computed institution-wide KPI — this document builds the real thing rather than only describing an intended one. Where building the real thing would require inventing data that does not exist anywhere in the platform today — most importantly, a PLO/CLO achievement percentage — this document names that gap plainly instead of approximating a number for it (§9, §10), matching the same commitment already made in Faculty, Staff &amp; Academic Portals §9.5 and Assessment, Grading &amp; Progression's own PLO paragraph.</p>

      <h2>2. Academic Policies — Consolidated Index</h2>
      <p>Every policy area below already has one governing document and section; this table exists so a reader (or a founder reviewing "is this covered?") finds all of them in one place, rather than having to know which of eleven documents to open. Nothing in this table is redefined — each row links to where the real policy and, where applicable, the real system actually lives.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Policy area</th><th>Governing document &amp; section</th><th>Status</th></tr></thead>
      <tbody>
      <tr><td>Admission</td><td>Student Lifecycle &amp; Academic Administration §3 (application form); Academic Governance §2 (approval)</td><td>Real</td></tr>
      <tr><td>Placement</td><td>Student Lifecycle &amp; Academic Administration §4</td><td>Real</td></tr>
      <tr><td>Recognition of Prior Learning (RPL)</td><td>Academy Curriculum (RPL paragraph) — routed through the same placement assessment every entrant undergoes</td><td>Real</td></tr>
      <tr><td>Registration</td><td>Student Lifecycle &amp; Academic Administration §5</td><td>Real</td></tr>
      <tr><td>Attendance</td><td>Student Lifecycle &amp; Academic Administration §6</td><td>Real</td></tr>
      <tr><td>Assessment</td><td>Assessment, Grading &amp; Progression §4–§6; Course Specifications (per-course design)</td><td>Real</td></tr>
      <tr><td>Examination</td><td>Assessment, Grading &amp; Progression §4 (Final component); Course Specifications</td><td>Real</td></tr>
      <tr><td>Grading</td><td>Assessment, Grading &amp; Progression §4</td><td>Real</td></tr>
      <tr><td>Progression</td><td>Assessment, Grading &amp; Progression §7</td><td>Real</td></tr>
      <tr><td>Academic probation</td><td>Assessment, Grading &amp; Progression §7 (<code>AcademicStanding</code>, <code>TermRecord.standing</code>)</td><td>Real</td></tr>
      <tr><td>Graduation</td><td>Assessment, Grading &amp; Progression §7.9–§8; Student Lifecycle &amp; Academic Administration §9</td><td>Real</td></tr>
      <tr><td>Certificates</td><td>Assessment, Grading &amp; Progression §8 (<code>GraduationDocument</code>)</td><td>Real</td></tr>
      <tr><td>Academic integrity</td><td>This document §3 (was: Course Specifications, proposed only — now corrected there)</td><td>Real — built by this document</td></tr>
      <tr><td>Student records</td><td>Student Lifecycle &amp; Academic Administration §8</td><td>Real</td></tr>
      <tr><td>Appeals</td><td>Academic Governance §6 (Academic Appeals Committee; <code>GRADE_APPEAL</code> request type)</td><td>Real</td></tr>
      <tr><td>Complaints</td><td>Student Lifecycle &amp; Academic Administration §8; Student Affairs (<code>COMPLAINT</code> request type)</td><td>Real</td></tr>
      <tr><td>Academic advising</td><td>Student Lifecycle &amp; Academic Administration §7</td><td>Real</td></tr>
      <tr><td>Instructor qualifications</td><td>Faculty, Staff &amp; Academic Portals §3 (Instructor Profile)</td><td>Real</td></tr>
      <tr><td>Course approval</td><td>This document §4 (was: Academic Governance, informal only — now corrected there)</td><td>Real — built by this document</td></tr>
      <tr><td>Program approval</td><td>This document §4 (was: Academic Governance, informal only — now corrected there)</td><td>Real — built by this document</td></tr>
      </tbody></table></div>
      <p>Two narrower approval gaps Academic Governance §9 also named — a distinct curriculum-level approval state above the individual course, and a formal qualification-review/authorization step for instructors beyond simply assigning them to a course — are outside the course-and-program approval workflow this document builds, and remain open exactly as Academic Governance already flagged them (§10).</p>

      <h2>3. Academic Integrity Framework</h2>
      <p>Course Specifications already drafted the Academy's academic integrity policy in full — what counts as a violation, who it is reported to, and how it escalates — but marked the paragraph "proposed, not yet founder-confirmed" because nothing existed to actually record a case: a suspected violation could only be described as free text through the general Request system, with no violation type, no severity, and no queryable outcome. That paragraph is corrected in place (§10) and this section is the real system behind it: an <code>IntegrityCase</code> record, typed and tracked exactly the way the drafted policy already described.</p>
      <p><strong>Violation types</strong> — a fixed, real enum (<code>IntegrityViolationType</code>) covering each of these categories directly: Plagiarism, Cheating, Unauthorized Collaboration, Falsification, Impersonation, Assessment Misconduct, AI Misuse, and Other for anything genuinely not covered by the first seven. <strong>Citation and academic honesty</strong> are not separate case types — they are the standard a violation is measured against, and are already taught directly: Course Specifications' Research &amp; Islamic Studies Methodology course (RL-301) has a dedicated citation and academic-integrity teaching unit (its curriculum table, "Citing religious sources accurately; the Academic Integrity policy"), and Institutional Foundation already states academic integrity as a founding principle ("credentials mean what they say; assessment is honest"). This document does not re-teach or redefine either — it is where a violation of them is actually recorded.</p>
      <p><strong>Severity and escalation</strong> — every case is Minor or Major, matching the drafted policy word for word: a Minor case (typically a first violation) is resolved directly by the instructor who reported it — usually resubmission or a grade penalty, recorded as free-text <code>sanction</code> since real sanctions vary too much for a fixed catalogue; a Major case (a repeat or severe violation) requires Head of Department authorization to resolve, reusing the same <code>DEPARTMENT_MATTERS</code> edit permission and department-scoping (<code>Department.headId</code>) already established for every other Head of Department function. A case can, where warranted, be marked as having engaged the Academy's existing Academic Standing process (<code>standingActionTaken</code>) — this is a record that the separate, already-real standing process was engaged because of this case, never a second standing mechanism competing with it.</p>
      <p><strong>Lifecycle and reporting.</strong> A case moves Reported → Under Review → Resolved or Dismissed. Any staff member holding <code>COURSES_GRADES</code>, <code>DEPARTMENT_MATTERS</code>, or <code>QUALITY_ASSURANCE</code> edit access can report one — an instructor grading their own course, a Head of Department, or Quality Assurance following up on something a review surfaced. There is deliberately no student-facing view: this is a staff-side integrity record, not something filed as a Request against a student. An instructor reports a case and manages their own Minor cases from a new Integrity tab on the Instructor Portal, with a real course→student roster lookup (resolving <code>Enrollment</code> to the correct <code>StudentProfile</code>) so a case is always filed against the actual enrolled student, not typed in free text. A Head of Department reviews every case touching their own department — by course or by the student's own department — from a new Approvals &amp; Integrity page on the Department Head Portal, alongside course approvals (§4).</p>

      <h2>4. Course &amp; Program Approval Workflow</h2>
      <p>Academic Governance already named the intended authority for this twice over — "Course approval: Programme Coordinator/HoD, in practice" and "Program approval: Dean, in practice" — but flagged both as partial: a <code>Course</code> only had <code>isPublished</code> and a <code>Program</code> only had <code>isActive</code>, neither a real approval state or a sign-off trail. Both rows, and the decision item naming this as open, are corrected in Academic Governance (§10); this section is the real workflow now behind them.</p>
      <p>Both <code>Course</code> and <code>Program</code> gained a real <code>approvalStatus</code> (Draft → Under Review → Approved, or Returned for Revision, with a free-text <code>approvalNote</code> explaining any return) and nothing already live was disturbed by adding it: every one of the Academy's existing 42 courses and its existing programs defaults to Approved, exactly the state they were already functioning in. Only newly created courses and programs start at Draft. A Programme Coordinator creates and submits a course for review from the Coordinator Dashboard's existing curriculum tab, which now shows the course's approval badge and note and a "Submit for Review" action; a Head of Department approves or returns it, scoped to their own department exactly as every other Head of Department action already is (<code>Department.headId</code>), from the same new Approvals &amp; Integrity page as §3. A Head of Department creates and submits a programme the same way; a Dean approves or returns it from a new Approvals page on the Dean Portal, scoped to their own faculty (<code>Faculty.deanId</code>). A returned course or programme carries the reviewer's note forward so the reason for the return is never lost between the decision and the next revision.</p>

      <h2>5. Records Framework</h2>
      <p>Every record type below is already real, already governed by an earlier document, and is not redefined here — this section exists so the complete set of institutional records is named together once, the same purpose §2's policy index serves for regulations.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Record</th><th>Real mechanism</th><th>Governing section</th></tr></thead>
      <tbody>
      <tr><td>Student records</td><td><code>StudentProfile</code>, academic record aggregation</td><td>Student Lifecycle &amp; Academic Administration §8</td></tr>
      <tr><td>Transcript records</td><td><code>Grade</code>, <code>TermRecord</code>; <code>TRANSCRIPT</code> request type</td><td>Assessment, Grading &amp; Progression §7; Student Lifecycle §8</td></tr>
      <tr><td>Assessment records</td><td><code>Grade</code> (per component, per course, per term)</td><td>Assessment, Grading &amp; Progression §4–§5</td></tr>
      <tr><td>Certificate records</td><td><code>GraduationApplication</code>, <code>GraduationDocument</code></td><td>Assessment, Grading &amp; Progression §8</td></tr>
      <tr><td>Instructor records</td><td><code>StaffProfile</code> plus the Instructor Profile (qualifications, professional development, performance review)</td><td>Faculty, Staff &amp; Academic Portals §3</td></tr>
      <tr><td>Course records</td><td><code>Course</code>, now including <code>approvalStatus</code>/<code>approvalNote</code></td><td>Course Catalogue; this document §4</td></tr>
      <tr><td>Program records</td><td><code>Program</code>, now including <code>approvalStatus</code>/<code>approvalNote</code></td><td>Academy Pathways; this document §4</td></tr>
      </tbody></table></div>

      <h2>6. Quality Assurance Cycle</h2>
      <p>The Plan → Design → Teach → Assess → Measure → Review → Improve cycle is not a new process invented for this document — every stage already maps onto a real, already-built mechanism, and the cycle's value is in naming them as one continuous loop rather than seven disconnected features.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Stage</th><th>Real mechanism</th></tr></thead>
      <tbody>
      <tr><td>Plan</td><td>A course or programme is proposed and submitted for review before it is taught (§4)</td></tr>
      <tr><td>Design</td><td>Course Specifications — CLOs, weekly content, assessment plan, required texts, per course</td></tr>
      <tr><td>Teach</td><td>Instructor Portal, attendance, course delivery (Faculty, Staff &amp; Academic Portals §5)</td></tr>
      <tr><td>Assess</td><td><code>Grade</code> per component, per the weighting Assessment, Grading &amp; Progression §4 defines</td></tr>
      <tr><td>Measure</td><td>Academic Dashboards &amp; KPIs — newly computed by this document (§9)</td></tr>
      <tr><td>Review</td><td><code>QualityReview</code> — Program, Course, Department, Faculty, and Staff subject types (Academic Governance §5; Faculty, Staff &amp; Academic Portals §9)</td></tr>
      <tr><td>Improve</td><td><code>improvementStatus</code> tracked to completion (Faculty, Staff &amp; Academic Portals §9.2), plus a course or programme returned for revision re-entering Plan (§4)</td></tr>
      </tbody></table></div>
      <p>Review and Improve are where this document's own Course/Program approval workflow (§4) becomes part of the cycle rather than a one-time gate: a <code>QualityReview</code> that finds Major Non-Compliance against a course is exactly the situation the approval workflow's Returned-for-Revision state exists for — the same lever a Head of Department uses to return a newly submitted course can equally return an existing one flagged by review, closing the loop back to Plan without a second, competing mechanism.</p>

      <h2>7. Program Review</h2>
      <p>Annual monitoring and periodic review are carried out through the existing <code>QualityReview</code> mechanism with <code>subjectType: PROGRAM</code> — already real, already scheduled and tracked to an outcome and, where required, an improvement plan (Academic Governance §5). Student feedback rolls up from <code>CourseEvaluation</code> across a programme's courses; instructor feedback from <code>StaffPerformanceReview</code> for instructors teaching in it; course performance and assessment analysis from the course-level pass-rate figures this document now computes (§9); curriculum mapping already exists as Assessment, Grading &amp; Progression's PLO cross-reference table, which indexes each course's contribution to each Programme Learning Outcome against its own Course Specifications content rather than duplicating it. Improvement plans are the same real <code>improvementStatus</code> tracking already described in §6.</p>
      <p><strong>PLO achievement is not computed as a percentage, and this document does not invent one.</strong> Programme Learning Outcomes remain document text cross-referenced to course content (as above), not queryable rows linked to actual per-student assessment results — the same gap Faculty, Staff &amp; Academic Portals §9.5 already named. An honest achievement figure needs a real PLO/CLO data model and a deliberate decision about how a course's grades roll up into it; approximating one now, from data that was never structured to support it, would be exactly the kind of meaningless number the Academy's standing no-fabrication principle rules out (§9, §10).</p>

      <h2>8. Course Review</h2>
      <p>Course evaluation is real and already live: the first genuinely student-submitted course evaluation system, anonymous by default, built in Faculty, Staff &amp; Academic Portals §9.4. CLO achievement is not computed for the same reason PLO achievement is not (§7) — the "Evidence" column in each course's CLO table (Course Specifications) names what evidence would look like, it is not an attached, queryable result per student per CLO. Assessment analysis is the course pass-rate figure this document computes per course (§9), using the same Final-only convention every other pass/fail determination in the platform already uses. Student feedback is <code>CourseEvaluation</code> itself. <strong>Instructor reflection on a specific course taught is an open gap, named honestly rather than mapped onto something that does not actually do this</strong>: <code>StaffPerformanceReview</code> exists, but it is a whole-staff-member review authored by a reviewer, on a period basis — not a per-course self-reflection an instructor records themselves, and this document does not stretch it to claim otherwise. Required revision and approval of revisions are the same Returned-for-Revision → resubmit → Approved cycle §4 and §6 already describe — a course review's finding is what would trigger it, not a separate revision-tracking system built again for this section alone.</p>

      <h2>9. Academic Dashboards &amp; KPIs</h2>
      <p>Eight KPIs are computed live, on request, directly from real student, grade, attendance, evaluation, and review data — nothing here is a static or seeded number. Consistent with the Academy's standing principle against meaningless KPIs, a metric is only included where the platform's actual data can support computing it honestly; where it cannot (PLO achievement, above all), it is left out entirely rather than filled with a proxy.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>KPI</th><th>How it is computed</th></tr></thead>
      <tbody>
      <tr><td>Retention</td><td>Of every student ever admitted (excludes Applicants, who never became students), the share who did not leave without completing (excludes Withdrawn/Dismissed)</td></tr>
      <tr><td>Completion</td><td>Of students who reached a terminal outcome (Graduated, Withdrawn, or Dismissed), the share who Graduated — students still actively studying are not yet counted either way</td></tr>
      <tr><td>Progression (In Good Standing)</td><td>Current-term <code>TermRecord.standing</code> distribution — Good Standing/Dean's List against Probation/Suspended, scoped to the current <code>AcademicTerm</code></td></tr>
      <tr><td>Course pass rate</td><td>Graded records using <code>gradeLetter(grade.final)</code> — the same Final-score-only convention graduation eligibility and every transcript view already use, deliberately matched rather than computing a theoretically "more correct" figure that would disagree with the rest of the platform</td></tr>
      <tr><td>Average attendance</td><td>Averaged across student-course attendance records — cumulative per student per course, since <code>Attendance</code> has no per-term field, honestly labeled as cumulative rather than presented as a single-term snapshot</td></tr>
      <tr><td>Student satisfaction</td><td>Average overall rating across <code>CourseEvaluation</code> submissions</td></tr>
      <tr><td>Instructor rating (student-rated)</td><td>Average instructor rating across the same <code>CourseEvaluation</code> submissions</td></tr>
      <tr><td>Instructor rating (formal review)</td><td>Rating distribution across submitted/acknowledged <code>StaffPerformanceReview</code> records, on the existing Needs Improvement–Outstanding scale</td></tr>
      </tbody></table></div>
      <p>A ninth figure — the lowest pass-rate courses, among those with at least five graded records — is surfaced alongside the eight KPIs as a starting point for course review (§8), not a judgment on its own. <strong>PLO achievement is deliberately not a ninth KPI</strong>, for the reason already stated in full at §7: no structured PLO/CLO achievement data exists to compute it from, and this document does not manufacture a number to fill the tile. All eight KPIs, and the explanation of how each is computed, are shown together on a new KPIs tab on the Quality Assurance Portal.</p>

      <h2>10. Decisions Requiring Approval</h2>
      <ol start="72">
      <li><strong>Built: the Academic Integrity case-tracking system — action taken, not open.</strong> §3: <code>IntegrityCase</code>, its violation types, Minor/Major severity split, and Reported → Under Review → Resolved/Dismissed lifecycle, implementing exactly the policy Course Specifications had already drafted but marked unconfirmed.</li>
      <li><strong>Correction applied: Course Specifications' academic integrity paragraph is now marked real, not proposed — action taken, not open.</strong> §3: the paragraph is updated in place to reference the real system now behind it.</li>
      <li><strong>Built: the Course &amp; Program approval workflow — action taken, not open.</strong> §4: <code>Course.approvalStatus</code> / <code>Program.approvalStatus</code>, Programme Coordinator → Head of Department for courses and Head of Department → Dean for programmes, exactly the authority Academic Governance had already named as "in practice."</li>
      <li><strong>Correction applied: Academic Governance's course/program-approval status and its "formal approval workflow" decision are updated — action taken, not open.</strong> §2, §4: both are now Real, and the open decision item is split to separate what is now built from what genuinely remains open (next item).</li>
      <li><strong>Curriculum-level approval and instructor qualification approval remain open.</strong> §2: distinct from course and program approval (now real), there is still no approval state above the individual course, and no formal qualification-review step for instructors beyond assignment via <code>InstructorCourse</code> — both are founder-level decisions this document does not make by extension.</li>
      <li><strong>Built: Academic Dashboards &amp; KPIs — action taken, not open.</strong> §9: eight KPIs computed live from real data, plus a lowest-pass-rate-courses list, on a new Quality Assurance Portal tab.</li>
      <li><strong>No PLO/CLO achievement percentage exists — open.</strong> §7, §9: the same gap Faculty, Staff &amp; Academic Portals §9.5 already named; a real PLO/CLO data model is needed before an honest figure can be computed, and this document does not approximate one to fill a KPI tile.</li>
      <li><strong>No per-course instructor reflection and no per-assignment CLO evidence — open.</strong> §8: <code>StaffPerformanceReview</code> is a whole-staff, reviewer-authored record, not an instructor's own per-course reflection; the CLO "Evidence" column in Course Specifications remains descriptive text, not an attached per-student artifact — both distinct from the review-level evidence repository Faculty, Staff &amp; Academic Portals §9.3 already built.</li>
      </ol>
      <p><em>Ulul Azm Academy — Academic Regulations, Records &amp; Quality Assurance Framework. Prepared for Founder review. This framework indexes the Academy's academic policies, records, and quality assurance cycle from across every prior document rather than restating them, and is accompanied by three genuinely new systems built alongside it — academic integrity case-tracking, a real course-and-program approval workflow, and computed academic KPIs — plus two structural corrections to Academic Governance's approval status and Course Specifications' integrity policy. It names, rather than approximates, the two places — PLO/CLO achievement and per-course instructor reflection — where a genuinely complete framework would need further, founder-level work this document does not take upon itself to invent.</em></p>

    `.trim(),
  },
};

export const DEFAULT_FAQS = [
  { category: 'general', question: "What does Ulul Azm teach?", answer: "Our academic areas include Qur'anic sciences, Arabic language, Tajwid, Hadith, Fiqh, Usul al-Fiqh, Aqidah, Seerah, Islamic methodology, and other foundational Islamic disciplines." },
  { category: 'general', question: 'How can I view the academic programmes?', answer: "Use the Academics or Programmes links to view the institute's dedicated Academic Programmes page and explore the available programmes." },
  { category: 'general', question: 'Can I study online?', answer: 'Selected programmes and educational resources may be available digitally. Please check the relevant programme page or contact the institute for current availability.' },
  { category: 'general', question: 'How do I apply for admission?', answer: 'Use the Apply Now button or visit the Admission & Registration section to begin the application process.' },
  { category: 'general', question: 'Can I purchase Islamic books from Ulul Azm?', answer: 'Yes. Our Academic Bookstore provides access to selected Islamic academic texts, books, and educational publications. Some books and resources may be subject to applicable fees.' },
  { category: 'general', question: 'Can authors and publishers submit their books?', answer: 'Yes. Authors and publishers may use the Sell Your Books portal to submit their publications for consideration.' },
  { category: 'general', question: 'Does every programme provide accreditation?', answer: "Not necessarily. Accreditation, certification, and academic recognition depend on the specific programme and the institute's applicable academic policies." },
  { category: 'general', question: 'Are all educational resources free?', answer: 'Some educational resources may be available free of charge, while other programmes, books, or services may have applicable fees.' },
  { category: 'general', question: 'How can I contact Ulul Azm?', answer: "Use the Contact page or the institute's official contact channels for enquiries regarding admissions, programmes, academic matters, bookstore services, authorship submissions, partnerships, and general enquiries." },
];

// Shown at /it-support (the footer's Technical Support -> Help & FAQ
// link) -- Model 26. Deliberately different from DEFAULT_FAQS above:
// real technical/account help, not programme or admissions content.
// Grounded in this site's actual features -- the real
// /account/forgot-password reset flow, the real 10MB document
// upload limit (app/api/admissions/documents), and the real
// /contact page -- nothing invented.
export const DEFAULT_FAQS_TECHNICAL = [
  {
    category: 'technical',
    question: 'I forgot my password. How do I get back into my account?',
    answer: "Use the \"Forgot your password?\" link on the Student Portal login page to reset it by email, then log in again with your new password.",
  },
  {
    category: 'technical',
    question: "I'm having trouble logging in to the Student Portal.",
    answer: "Double-check that you're using the email address and password you registered with. If you can't remember your password, use the password reset option on the login page. If you still can't get in, reach us through the Contact page and we'll help you regain access.",
  },
  {
    category: 'technical',
    question: 'My document upload keeps failing during admission or registration.',
    answer: 'Each uploaded document must be under 10MB. If a file is larger, try compressing it or saving it at a lower resolution/quality, then upload it again.',
  },
  {
    category: 'technical',
    question: "The website isn't displaying properly or a page seems stuck.",
    answer: "Try refreshing the page, or clearing your browser's cache and reloading. If the issue continues, let us know through the Contact page so our team can look into it.",
  },
  {
    category: 'technical',
    question: "Who do I contact for technical help if my issue isn't listed here?",
    answer: "Reach our team through the Contact page for any technical issue not covered above, and we'll follow up as soon as possible.",
  },
];

export const DEFAULT_CONTACT = {
  address: 'Ulul Azm Institute, [Street / Building Name], Accra, Ghana',
  // Just the P.O. Box line -- city/country already come from the
  // address field above. The old default repeated "Accra, Ghana"
  // here too, which the footer's combined address line then showed
  // twice (once from this field, once from the address field).
  poBox: 'P.O. Box 170',
  phone: '+233 1234568',
  whatsapp: '+000 000 000 0000',
  email: 'info@ululazm.org',
  admissionsEmail: 'admissions@ululazm.org',
  bookstoreEmail: 'bookstore@ululazm.org',
  officeHours: 'Monday – Friday: 8:00 AM – 5:00 PM',
};
