// Translation dictionary for the public Admission application flow
// (app/admission/page.js and app/admission/track/page.jsx).
//
// Deliberately simple by design: each key is the exact English string
// as it already appears in the JSX, mapped to its Arabic translation.
// This lets every call site stay as `{t('Exact English Text')}` without
// inventing a separate key namespace, so the change is a mechanical
// wrap rather than a rewrite of the component. Anything not found in
// this table is returned unchanged (English), so a missed string never
// breaks rendering — it just isn't translated yet.
export const AR_TRANSLATIONS = {
  // Header / intro
  'Back to Home': 'العودة إلى الرئيسية',
  'Apply for Admission': 'التقديم للقبول',
  'Admission Application': 'طلب القبول',
  'Complete your applicant profile, select programmes & pay application fees.':
    'أكمل ملف مقدم الطلب، واختر البرنامج، وادفع رسوم التقديم.',
  'Track Admission Progress': 'متابعة حالة الطلب',
  '🔍 Track Admission Progress': '🔍 متابعة حالة الطلب',

  // Notices
  "Your payment was cancelled — nothing was charged. You can try again below whenever you're ready.":
    'تم إلغاء عملية الدفع — لم يتم خصم أي مبلغ. يمكنك المحاولة مرة أخرى أدناه في أي وقت.',
  'Verifying your payment…': 'جارٍ التحقق من عملية الدفع…',
  "This only takes a few seconds. Please don't close this page.":
    'يستغرق هذا بضع ثوانٍ فقط. يرجى عدم إغلاق هذه الصفحة.',

  // Stepper
  '1. Account & Personal': '١. الحساب والبيانات الشخصية',
  '2. Contacts & Education': '٢. جهات الاتصال والتعليم',
  '3. Programme & Session': '٣. البرنامج والفترة الدراسية',
  '4. Fee & Payment': '٤. الرسوم والدفع',
  '(Done)': '(تم)',

  // Stage headings
  'Step 1: Account & Personal Details': 'الخطوة ١: الحساب والبيانات الشخصية',
  'Step 2: Contacts & Education Background': 'الخطوة ٢: جهات الاتصال والخلفية التعليمية',
  'Step 3: Programme, Session & Document Uploads': 'الخطوة ٣: البرنامج والفترة الدراسية ورفع المستندات',
  'Step 4: Application Fee & Payment': 'الخطوة ٤: رسوم التقديم والدفع',

  // Stage 1: Account & Personal
  'Email Address *': 'البريد الإلكتروني *',
  'Enter your email address': 'أدخل بريدك الإلكتروني',
  'Password *': 'كلمة المرور *',
  'Full Name *': 'الاسم الكامل *',
  'Enter full legal name...': 'أدخل الاسم الكامل الرسمي...',
  'Date of Birth *': 'تاريخ الميلاد *',
  'Gender *': 'الجنس *',
  'Select Gender': 'اختر الجنس',
  'Male': 'ذكر',
  'Female': 'أنثى',
  'Nationality *': 'الجنسية *',
  'Country of Residence *': 'بلد الإقامة *',
  'Phone Number *': 'رقم الهاتف *',
  'Passport / ID Number *': 'رقم جواز السفر / الهوية *',
  'Residential Address *': 'عنوان السكن *',
  'Applicant Classification *': 'فئة مقدم الطلب *',
  'Junior Learner (4-13 years)': 'متعلم صغير (٤-١٣ سنة)',
  'Senior Learner (15-20 years)': 'متعلم كبير (١٥-٢٠ سنة)',
  'Mature Learner (21 years and above)': 'متعلم بالغ (٢١ سنة فأكثر)',

  // Stage 2: Contacts & Education
  'Parent / Guardian Details': 'بيانات ولي الأمر',
  'Guardian Name': 'اسم ولي الأمر',
  'Guardian Phone': 'هاتف ولي الأمر',
  'Father': 'الأب',
  'Mother': 'الأم',
  'Spouse': 'الزوج/الزوجة',
  'Guardian': 'ولي الأمر',
  'Relative': 'قريب',
  'Other': 'أخرى',
  'Emergency Contact *': 'جهة اتصال للطوارئ *',
  'Name *': 'الاسم *',
  'Phone *': 'الهاتف *',
  'Highest Education Level *': 'أعلى مؤهل دراسي *',
  'High School': 'الثانوية العامة',
  'Diploma': 'دبلوم',
  'Bachelor Degree': 'درجة البكالوريوس',
  'Master Degree': 'درجة الماجستير',
  'Doctorate': 'الدكتوراه',
  'Institution Name *': 'اسم المؤسسة التعليمية *',

  // Stage 3: Programme, Session & Documents
  'Choose Your Academic Programme': 'اختر برنامجك الأكاديمي',
  'Select the programme you wish to apply for.': 'اختر البرنامج الذي ترغب في التقديم عليه.',
  'Loading academic programmes...': 'جارٍ تحميل البرامج الأكاديمية...',
  'Please select an academic programme to continue.': 'يرجى اختيار برنامج أكاديمي للمتابعة.',
  'Selected Programme': 'البرنامج المختار',
  'Select Study Session *': 'اختر الفترة الدراسية *',
  'Morning Session': 'الفترة الصباحية',
  'Evening Session': 'الفترة المسائية',
  'Weekend Session': 'فترة نهاية الأسبوع',
  'Required Document Uploads': 'المستندات المطلوب رفعها',
  'Diploma applicants must provide all supporting academic and identification documents.':
    'يجب على المتقدمين للدبلوم تقديم جميع المستندات الأكاديمية وإثبات الهوية الداعمة.',
  'Please upload identity and passport photos to proceed.':
    'يرجى رفع إثبات الهوية وصورة جواز السفر للمتابعة.',
  'Select Official Identity Doc *': 'اختر مستند إثبات الهوية الرسمي *',
  'Ghana Card': 'بطاقة غانا',
  'National Identification Card': 'بطاقة الهوية الوطنية',
  'Green Card': 'البطاقة الخضراء',
  'International Passport': 'جواز السفر الدولي',
  'Birth Certificate': 'شهادة الميلاد',
  'Upload': 'رفع',
  'e.g. 384927160': 'مثال: 384927160',
  'Passport Picture *': 'صورة جواز السفر *',
  'Transcripts *': 'كشف الدرجات *',
  'Certificate *': 'الشهادة *',
  'Testimonial *': 'خطاب توصية *',
  'Recommendation Letter *': 'خطاب التزكية *',

  // Stage 4: Fee & Payment
  'Auto-Calculated Application Fee': 'رسوم التقديم المحسوبة تلقائيًا',
  'Payment Method': 'طريقة الدفع',
  'Choose how you would like to pay your application fee.':
    'اختر الطريقة التي ترغب بها في دفع رسوم التقديم.',
  'Pay with Paystack': 'الدفع عبر Paystack',
  'Stripe Payment': 'الدفع عبر Stripe',
  'Paystack Payment': 'الدفع عبر Paystack',
  'You will be securely redirected to Paystack to complete your application fee payment.':
    'سيتم تحويلك بأمان إلى Paystack لإتمام دفع رسوم التقديم.',
  'Preparing Payment...': 'جارٍ تجهيز عملية الدفع...',
  'Pay your application fee securely through Stripe. You will be redirected to Stripe Checkout to complete your payment.':
    'ادفع رسوم التقديم بأمان عبر Stripe. سيتم تحويلك إلى صفحة الدفع الخاصة بـ Stripe لإتمام عملية الدفع.',
  'Preparing Stripe Payment...': 'جارٍ تجهيز الدفع عبر Stripe...',
  'Payment Verified': 'تم التحقق من الدفع',
  'Pay': 'ادفع',
  'with Paystack': 'عبر Paystack',
  'with Stripe': 'عبر Stripe',

  // Track Admission Progress page
  'Back to Admission': 'العودة إلى صفحة التقديم',
  'Please enter your application number.': 'يرجى إدخال رقم طلبك.',
  'Unable to find that application.': 'تعذر العثور على هذا الطلب.',
  'Something went wrong. Please try again.': 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
  'Enter the application number you received when you submitted your application to check its current status, payment confirmation and document checklist.':
    'أدخل رقم الطلب الذي حصلت عليه عند تقديم طلبك للاطلاع على حالته الحالية وتأكيد الدفع وقائمة المستندات.',
  'Checking…': 'جارٍ التحقق…',
  'Track': 'متابعة',
  'Application': 'الطلب',
  'Programme': 'البرنامج',
  'Level': 'المستوى',
  'Submitted': 'تاريخ التقديم',
  'Payment': 'الدفع',
  'Gateway': 'بوابة الدفع',
  'Method': 'الطريقة',
  'Paid On': 'تاريخ الدفع',
  'Not yet paid': 'لم يتم الدفع بعد',
  'Documents Received': 'المستندات المستلمة',

  // Application status labels (StudentAdmissionStatus)
  'Pending Payment': 'بانتظار الدفع',
  'Paid — Awaiting Submission': 'تم الدفع — بانتظار الإرسال',
  'Under Review': 'قيد المراجعة',
  'Approved': 'مقبول',
  'Not Approved': 'غير مقبول',

  // Document checklist labels
  'Identity Document': 'إثبات الهوية',
  'Passport Picture': 'صورة جواز السفر',
  'Academic Transcripts': 'كشف الدرجات الأكاديمي',
  'Certificate': 'الشهادة',
  'Testimonial': 'خطاب التوصية',
  'Recommendation Letter': 'خطاب التزكية',

  // Action controls
  '<- Back': 'رجوع ->',
  'Next: Contacts & Education ->': '<- التالي: جهات الاتصال والتعليم',
  'Next: Programme & Session ->': '<- التالي: البرنامج والفترة الدراسية',
  'Next: Fee & Payment ->': '<- التالي: الرسوم والدفع',
  'Submit Application & Complete': 'إرسال الطلب وإكماله',
  'Complete Payment First to Submit': 'أكمل الدفع أولًا لتتمكن من الإرسال',

  // Confirmation screen
  'Application Submitted Successfully!': 'تم إرسال الطلب بنجاح!',
  'Thank you,': 'شكرًا لك،',
  'Applicant': 'المتقدم',
  'admission application has been recorded successfully.':
    'تم تسجيل طلب القبول بنجاح.',
  'Official Admission & Payment Summary Report': 'التقرير الرسمي لملخص القبول والدفع',
  'Applicant Full Name': 'الاسم الكامل لمقدم الطلب',
  'Email Address': 'البريد الإلكتروني',
  'Study Session': 'الفترة الدراسية',
  'Applicant Classification': 'فئة مقدم الطلب',
  'Country of Residence': 'بلد الإقامة',
  'Application Fee': 'رسوم التقديم',
  'Payment Status': 'حالة الدفع',
  'Paystack': 'Paystack',
  'Stripe': 'Stripe',
  'Payment verified successfully through Paystack.': 'تم التحقق من الدفع بنجاح عبر Paystack.',
  'Verifying your Paystack payment...': 'جارٍ التحقق من دفعتك عبر Paystack...',
  'Payment not yet verified. Complete the Paystack payment above.':
    'لم يتم التحقق من الدفع بعد. أكمل الدفع عبر Paystack أعلاه.',
  'Bank transfer selected. Payment will be confirmed after transfer verification.':
    'تم اختيار التحويل البنكي. سيتم تأكيد الدفع بعد التحقق من التحويل.',
  'Your Application Number — Save This': 'رقم طلبك — احتفظ به',
  'Use this number any time to check your application and payment status.':
    'استخدم هذا الرقم في أي وقت للاطلاع على حالة طلبك والدفع.',
  'Return to Home Page': 'العودة إلى الصفحة الرئيسية',

  // Model 16 "Apply Now" wizard (Student Type -> Study Type -> Ready to Apply)
  'Step 1 of 3: Who Are You Applying As?': 'الخطوة ١ من ٣: بصفتك ماذا تتقدم؟',
  'This determines your application fee currency and payment method. You can still refine your country of residence in the application itself.':
    'يحدد هذا عملة رسوم التقديم وطريقة الدفع. يمكنك لاحقًا تحديد بلد إقامتك بدقة داخل الطلب نفسه.',
  'New Student — Resident': 'طالب جديد — مقيم',
  'Living in Ghana. Application fee is charged in GHS via Mobile Money or card.':
    'مقيم في غانا. تُحصَّل رسوم التقديم بالسيدي الغاني عبر الموبايل موني أو البطاقة.',
  'New Student — International': 'طالب جديد — دولي',
  'Living outside Ghana. Application fee is charged in USD by card.':
    'مقيم خارج غانا. تُحصَّل رسوم التقديم بالدولار الأمريكي عبر البطاقة.',
  'Back': 'رجوع',
  'Step 2 of 3: Choose Your Programme': 'الخطوة ٢ من ٣: اختر برنامجك',
  'These are the programmes currently open for admission.':
    'هذه هي البرامج المفتوحة حاليًا للقبول.',
  'No programmes are currently open for admission. Please check back soon.':
    'لا توجد برامج مفتوحة للقبول حاليًا. يرجى التحقق مرة أخرى قريبًا.',
  'Step 3 of 3: Ready to Apply': 'الخطوة ٣ من ٣: جاهز للتقديم',
  "Here's what you told us. You can change your specific country and programme details inside the application.":
    'إليك ما أخبرتنا به. يمكنك تغيير بلدك المحدد وتفاصيل البرنامج داخل الطلب.',
  'Applying as': 'التقديم بصفة',
  'Start Over': 'البدء من جديد',
  'Go to Application →': 'الانتقال إلى الطلب ←',
  '-- Select your country --': '-- اختر بلدك --',
  'You told us you are applying as an International student -- please select your specific country.':
    'أخبرتنا أنك تتقدم بصفة طالب دولي -- يرجى اختيار بلدك المحدد.',
};

export function translate(lang, text) {
  if (lang !== 'ar') return text;
  if (typeof text !== 'string') return text;
  return AR_TRANSLATIONS[text] || text;
}
