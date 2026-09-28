// Bilingual (English / Arabic) dictionary for the AI Assistant widget's OWN
// interface -- chrome labels, greetings, quick-option labels, department
// names, and the knowledge-base answers reachable from the Student and
// Employee identity-card quick options.
//
// This deliberately follows the exact flat-dictionary, safe-English-
// fallback pattern already used by app/admission/i18n.js: a string with no
// Arabic entry here is simply shown in English rather than breaking or
// rendering blank, so real coverage can keep growing later without the
// widget ever being visibly "half-built" to a visitor. It is a plain
// module (no server-only code), so it can be imported directly by the
// client-side widget -- no network round trip needed just to translate a
// label the server already sent in English.
//
// Why a flat dictionary instead of a React Context like admission's
// LanguageProvider: that pattern exists to share language state across a
// whole route tree of separate components. The assistant widget is a
// single self-contained component, so plain local state + this helper
// gets the same result without an unnecessary Provider.

export const ASSISTANT_AR = {
  // ---- Widget chrome ----
  'Ulul Azm Assistant': 'مساعد معهد أولو العزم',
  'Institute guidance, instantly': 'إرشاد المعهد، فورًا',
  'Close assistant': 'إغلاق المساعد',
  'Open institute assistant': 'فتح مساعد المعهد',
  'Ask a question…': 'اكتب سؤالك…',
  Send: 'إرسال',
  'Thinking…': 'جارٍ التفكير…',
  'What would you like to do next?': 'ماذا تودّ أن تفعل الآن؟',
  'How may I help you today?': 'كيف يمكنني مساعدتك اليوم؟',
  'Welcome! You are:': 'أهلًا بك! أنت:',
  Student: 'طالب',
  Employee: 'موظف',
  Visitor: 'زائر',
  'Welcome! You can pick one of the quick options below.':
    'أهلًا بك! يمكنك اختيار أحد الخيارات السريعة أدناه.',
  'Start over': 'البدء من جديد',
  'Go to': 'الانتقال إلى',
  "Sorry, something went wrong — please try again.":
    'عذرًا، حدث خطأ ما — يرجى المحاولة مرة أخرى.',
  "Sorry, I couldn't reach the server — please try again shortly.":
    'عذرًا، تعذّر الوصول إلى الخادم — يرجى المحاولة بعد قليل.',

  // ---- Dynamic server replies not in the KNOWLEDGE table ----
  'Here is your dashboard.': 'هذه لوحتك.',
  "I don't see a staff position on your account, so there's no staff dashboard to send you to. If that's not right, contact ICT or your supervisor.":
    'لا أرى منصبًا وظيفيًا في حسابك، لذا لا توجد لوحة موظفين لتوجيهك إليها. إذا لم يكن هذا صحيحًا، تواصل مع مكتب تقنية المعلومات أو مشرفك.',
  "I couldn't find anything specific for that — here are a few things I can help with instead:":
    'لم أجد شيئًا محددًا لذلك — إليك بعض الأمور التي يمكنني المساعدة بها بدلًا من ذلك:',
  "I can look that up once you're signed in — please log in first, then ask me again.":
    'يمكنني البحث عن ذلك بمجرد تسجيل دخولك — يرجى تسجيل الدخول أولًا ثم سؤالي مرة أخرى.',
  'Here are a few things I can help with:': 'إليك بعض الأمور التي يمكنني المساعدة بها:',

  // ---- Zone welcome greetings ----
  "Assalamu alaikum! I'm the Ulul Azm assistant. Ask me about admissions, fees, transcripts, requests, or your academic records.":
    'السلام عليكم! أنا مساعد أولو العزم. اسألني عن القبول، الرسوم، كشوف الدرجات، الطلبات، أو سجلك الأكاديمي.',
  "Assalamu alaikum! I'm the Ulul Azm staff assistant. Ask me about your dashboard, courses, students, attendance, or academic tasks.":
    'السلام عليكم! أنا مساعد الموظفين في أولو العزم. اسألني عن لوحتك، مقرراتك، طلابك، الحضور، أو المهام الأكاديمية.',
  "Assalamu alaikum! I'm the Ulul Azm Bookstore assistant. Ask me about books, authors, orders, or purchases.":
    'السلام عليكم! أنا مساعد متجر كتب أولو العزم. اسألني عن الكتب، المؤلفين، الطلبات، أو المشتريات.',
  "Assalamu alaikum! I'm the Ulul Azm Media assistant. Ask me about khutbahs, lectures, mutoon, or your subscription.":
    'السلام عليكم! أنا مساعد وسائط أولو العزم. اسألني عن الخطب، المحاضرات، المتون، أو اشتراكك.',
  "Assalamu alaikum! I'm the Ulul Azm Library assistant. Ask me about articles, fatwas, research papers, or classical texts — the Library is always free, no subscription needed.":
    'السلام عليكم! أنا مساعد مكتبة أولو العزم. اسألني عن المقالات، الفتاوى، الأبحاث، أو النصوص الكلاسيكية — المكتبة مجانية دائمًا ولا تحتاج إلى اشتراك.',
  "Assalamu alaikum! I'm the Ulul Azm assistant. Ask me about admissions, fees, the bookstore, Media, the Library, or anything else about the institute.":
    'السلام عليكم! أنا مساعد أولو العزم. اسألني عن القبول، الرسوم، المتجر، الوسائط، المكتبة، أو أي شيء آخر عن المعهد.',

  // ---- Department names ----
  'Admissions Office': 'مكتب القبول',
  'Academic Records / Registrar': 'السجلات الأكاديمية / التسجيل',
  'Examinations Office': 'مكتب الامتحانات',
  'Academic Affairs': 'الشؤون الأكاديمية',
  'Student Affairs': 'شؤون الطلاب',
  Library: 'المكتبة',
  'Academic Advisor': 'المرشد الأكاديمي',
  Registrar: 'التسجيل',
  'Front Office': 'المكتب الرئيسي',
  'Instructor Dashboard': 'لوحة المحاضر',
  Academy: 'الأكاديمية',
  'Quality Assurance Office': 'مكتب ضمان الجودة',
  'ICT Office': 'مكتب تقنية المعلومات',

  // ---- Student quick-option labels ----
  'My Courses': 'مقرراتي',
  'My Schedule': 'جدولي الدراسي',
  Assignments: 'الواجبات',
  Assessments: 'التقييمات',
  Grades: 'الدرجات',
  Attendance: 'الحضور',
  'Academic Progress': 'التقدم الأكاديمي',
  'Program & Study Plan': 'البرنامج والخطة الدراسية',
  'Student Services': 'خدمات الطلاب',
  Help: 'المساعدة',

  // ---- Employee quick-option labels ----
  'My Dashboard': 'لوحتي',
  'Assigned Courses': 'المقررات المسندة',
  Students: 'الطلاب',
  'Academic Tasks': 'المهام الأكاديمية',
  Messages: 'الرسائل',
  Reports: 'التقارير',
  'Academic Resources': 'الموارد الأكاديمية',

  // ---- Visitor / general / bookstore / media / library quick options ----
  'Check my admission status': 'التحقق من حالة قبولي',
  'My orders': 'طلباتي',
  'My purchased books': 'كتبي المشتراة',
  'Browse & search books': 'تصفح والبحث عن الكتب',
  'Shipping & order status': 'الشحن وحالة الطلب',
  'About authors': 'عن المؤلفين',
  'Browse khutbahs & lectures': 'تصفح الخطب والمحاضرات',
  'My subscription status': 'حالة اشتراكي',
  'Subscription plans': 'خطط الاشتراك',
  'Mutoon & poems': 'المتون والقصائد',
  'Watch or download access': 'المشاهدة أو التحميل',
  'Browse articles & fatwas': 'تصفح المقالات والفتاوى',
  'Research papers': 'الأبحاث العلمية',
  'Classical texts & manuscripts': 'النصوص الكلاسيكية والمخطوطات',
  'Is the Library free?': 'هل المكتبة مجانية؟',
  Admissions: 'القبول',
  'Programmes & faculties': 'البرامج والكليات',
  Bookstore: 'المتجر',
  Media: 'الوسائط',
  Fees: 'الرسوم',
  'Contact the institute': 'التواصل مع المعهد',

  // ---- Knowledge-base answers (priority set: everything reachable from
  // the Student and Employee identity-card quick options) ----
  "Admissions are handled by the Admissions Office. You can start an application from the Admission page on the homepage. Once submitted, an Admissions Officer reviews it and you'll be contacted with next steps.":
    'يتولى مكتب القبول شؤون القبول. يمكنك بدء طلب التقديم من صفحة القبول في الصفحة الرئيسية. بعد إرسال الطلب، سيراجعه موظف القبول وسيتم التواصل معك بالخطوات التالية.',
  "You don't register for courses yourself — the system automatically assigns each semester's courses based on your approved study plan, completed courses, prerequisites, and academic level. If you need a course added or dropped, submit a Request to Add or Request to Drop from Study Plan & Curriculum under Academic System, and Academic Records will review it.":
    'لا تقوم بتسجيل المقررات بنفسك — يقوم النظام تلقائيًا بتحديد مقررات كل فصل دراسي بناءً على خطتك الدراسية المعتمدة، والمقررات المكتملة، والمتطلبات السابقة، ومستواك الأكاديمي. إذا احتجت إلى إضافة أو حذف مقرر، أرسل طلب إضافة أو طلب حذف من الخطة الدراسية والمنهج ضمن النظام الأكاديمي، وستقوم السجلات الأكاديمية بمراجعته.',
  'The official Academic Calendar (Gregorian and Hijri dates, procedures per semester) has its own section in your Student Portal — separate from Academic System — and is downloadable as a PDF. It is published by Academic Records and is the same calendar every portal shows.':
    'التقويم الأكاديمي الرسمي (بالتاريخين الميلادي والهجري، وإجراءات كل فصل دراسي) له قسم خاص في بوابة الطالب — منفصل عن النظام الأكاديمي — ويمكن تحميله بصيغة PDF. يصدره قسم السجلات الأكاديمية، وهو نفس التقويم الذي تعرضه كل بوابة.',
  'Student services such as ID cards and enrollment letters are handled by Student Affairs — submit a request from your Student Portal.':
    'تتولى شؤون الطلاب خدمات مثل بطاقات الهوية وخطابات القيد — أرسل طلبك من بوابة الطالب.',
  'Library services (borrowing, returns, reading resources) are managed by the Librarian. For digital books and purchases specifically, see the Bookstore instead.':
    'يدير أمين المكتبة خدمات المكتبة (الاستعارة، الإرجاع، موارد القراءة). أما الكتب الرقمية والمشتريات تحديدًا، فراجع المتجر بدلًا من ذلك.',
  'Examination scheduling, results processing, and grade appeals are all handled by the Examinations Office. Your own Final Exam Timetable is available under Academic System in your Student Portal.':
    'يتولى مكتب الامتحانات جدولة الامتحانات، ومعالجة النتائج، والتظلمات من الدرجات. جدول امتحاناتك النهائية الخاص متاح ضمن النظام الأكاديمي في بوابة الطالب.',
  'Your lecture attendance and absence percentage, per course, are shown in Attendance Record under Academic System. Reaching 25% absence in a course means you fail it and must repeat it, per academic regulations.':
    'يظهر حضورك للمحاضرات ونسبة غيابك في كل مقرر ضمن سجل الحضور تحت النظام الأكاديمي. بلوغ نسبة الغياب 25% في أي مقرر يعني رسوبك فيه ووجوب إعادته، وفقًا للوائح الأكاديمية.',
  'Your Academic Advisor can help with course selection and study planning. Advisors have view-only access to student records to guide you.':
    'يمكن لمرشدك الأكاديمي مساعدتك في اختيار المقررات والتخطيط الدراسي. يملك المرشدون صلاحية اطلاع فقط على سجلات الطلاب لإرشادك.',
  'Academic System is the central hub for everything about your studies — Study Plan & Curriculum, Grades & Academic History, Courses & Academic Progress, Grading Policy, Communication & Complaints, Graduation Procedures, Graduation Documents, Final Exam Timetable, and Attendance Record. Open it from your Student Portal dashboard.':
    'النظام الأكاديمي هو المركز الرئيسي لكل ما يخص دراستك — الخطة الدراسية والمنهج، الدرجات والسجل الأكاديمي، المقررات والتقدم الأكاديمي، سياسة التقييم، التواصل والشكاوى، إجراءات التخرج، وثائق التخرج، جدول الامتحانات النهائية، وسجل الحضور. افتحه من لوحة بوابة الطالب.',
  'Your course grades, semester GPA, and cumulative CGPA are calculated automatically from your recorded final grades — never entered by hand — and shown in Grades & Academic History under Academic System.':
    'تُحسب درجات مقرراتك، والمعدل الفصلي، والمعدل التراكمي تلقائيًا من درجاتك النهائية المسجّلة — ولا تُدخل يدويًا أبدًا — وتظهر في الدرجات والسجل الأكاديمي ضمن النظام الأكاديمي.',
  'Courses & Academic Progress (under Academic System) shows your completed, current, and remaining curriculum courses, and your academic level, computed live from your real record.':
    'تعرض صفحة المقررات والتقدم الأكاديمي (ضمن النظام الأكاديمي) مقرراتك المكتملة والحالية والمتبقية من المنهج، ومستواك الأكاديمي، محسوبة مباشرة من سجلك الفعلي.',
  'Graduation Procedures (under Academic System) tracks your eligibility, application, clearance across every office, and final approval — all in one place.':
    'تتابع صفحة إجراءات التخرج (ضمن النظام الأكاديمي) أهليتك، وطلبك، وإخلاء طرفك من كل مكتب، والموافقة النهائية — كل ذلك في مكان واحد.',
  'Once your graduation is completed, your Graduation Certificate, Statement of Completion, and Academic Transcript are ready to download from Graduation Documents under Academic System.':
    'بعد اكتمال تخرجك، تصبح شهادة التخرج، وإفادة إتمام الدراسة، وكشف الدرجات الأكاديمي جاهزة للتحميل من وثائق التخرج ضمن النظام الأكاديمي.',
  "Once you've graduated, Graduate Assistant (in your Student Portal) lets you report an issue with your certificate, statement of completion, or transcript, or request a replacement — routed directly to the Registrar.":
    'بعد تخرجك، يتيح لك مساعد الخريجين (في بوابة الطالب) الإبلاغ عن مشكلة في شهادتك، أو إفادة إتمام الدراسة، أو كشف الدرجات، أو طلب استبدالها — ويُوجَّه الطلب مباشرة إلى قسم التسجيل.',
  "Section Discussion (inside each of your enrolled courses) is where you and your classmates in that section discuss topics, ask questions, and respond to exercises your instructor posts — including a deadline and, when relevant, a supporting file. You can see your section classmates' submissions too, so it works like a shared class discussion rather than a private one-on-one submission.":
    'نقاش الشعبة (داخل كل مقرر مسجَّل لديك) هو المكان الذي تناقش فيه أنت وزملاؤك في تلك الشعبة المواضيع، وتطرحون الأسئلة، وتردّون على التمارين التي ينشرها محاضركم — بما في ذلك موعد نهائي، وملف داعم عند الحاجة. يمكنك أيضًا الاطلاع على إجابات زملائك في الشعبة، فهو يعمل كنقاش جماعي مشترك وليس تسليمًا خاصًا فرديًا.',
  'Communication & Complaints (under Academic System) lets you message any office or department directly — pick a topic, send your message, and track responses in one place.':
    'تتيح لك صفحة التواصل والشكاوى (ضمن النظام الأكاديمي) مراسلة أي مكتب أو قسم مباشرة — اختر الموضوع، أرسل رسالتك، وتابع الردود في مكان واحد.',
  "You can reach the institute through the Contact option in the site footer. For a specific matter, tell me what it's about and I'll point you to the right department directly.":
    'يمكنك التواصل مع المعهد من خيار التواصل في تذييل الموقع. إذا كان الأمر محددًا، أخبرني بموضوعه وسأوجهك مباشرة إلى القسم المختص.',

  // ---- Employee knowledge-base answers ----
  'Your assigned courses and sections are listed under Courses in your Instructor Dashboard, each with its own roster, materials and assessments.':
    'مقرراتك وشعبك المسندة مدرجة تحت المقررات في لوحة المحاضر، ولكل منها قائمة طلاب ومواد وتقييمات خاصة بها.',
  'Your students, across every section you teach, are listed under Students in your Instructor Dashboard.':
    'طلابك، في كل شعبة تُدرّسها، مدرجون تحت الطلاب في لوحة المحاضر.',
  'Attendance for your sections is recorded under Attendance in your Instructor Dashboard, per lecture, per course.':
    'يُسجَّل حضور شعبك تحت الحضور في لوحة المحاضر، لكل محاضرة ولكل مقرر.',
  "Exams and quizzes for your courses -- scheduling, questions and results -- are managed under Exams and Quizzes in your Instructor Dashboard.":
    'تُدار امتحانات واختبارات مقرراتك القصيرة — الجدولة، والأسئلة، والنتائج — تحت الامتحانات والاختبارات القصيرة في لوحة المحاضر.',
  "Assignments you've posted and what's still waiting on your grading are under Assignments in your Instructor Dashboard.":
    'الواجبات التي نشرتها وما تبقّى بانتظار تصحيحك موجودة تحت الواجبات في لوحة المحاضر.',
  "Course-level discussion with your students is under Discussions in your Instructor Dashboard. If your position also has Announcements (Dean, Head of Department, and similar roles), you'll find that in your own dashboard's sidebar too.":
    'النقاش على مستوى المقرر مع طلابك موجود تحت النقاشات في لوحة المحاضر. وإذا كان منصبك يشمل أيضًا الإعلانات (كالعميد، ورئيس القسم، وما شابه)، فستجد ذلك في القائمة الجانبية للوحتك الخاصة أيضًا.',
  "Institute-wide reports and analytics are available to staff with Administration access, under the Staff & Admin Portal. If you don't see Reports there, it isn't enabled for your position -- your supervisor can confirm what your role has access to.":
    'التقارير والتحليلات على مستوى المعهد متاحة للموظفين الذين لديهم صلاحية الإدارة، ضمن بوابة الموظفين والإدارة. إذا لم تجد التقارير هناك، فهذا يعني أنها غير مفعّلة لمنصبك — يمكن لمشرفك تأكيد الصلاحيات المتاحة لدورك.',
  "Curriculum, course specifications, and every academic governance document are in the Academy hub -- the same official documents used across every programme.":
    'المنهج، ومواصفات المقررات، وكل وثائق الحوكمة الأكاديمية موجودة في مركز الأكاديمية — وهي نفس الوثائق الرسمية المستخدمة في جميع البرامج.',
};

export function at(lang, text) {
  if (lang !== 'ar') return text;
  if (typeof text !== 'string') return text;
  return ASSISTANT_AR[text] || text;
}
