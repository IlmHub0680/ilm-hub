# -*- coding: utf-8 -*-
import io

def load(path):
    with io.open(path, "r", encoding="utf-8") as f:
        return f.read()

def save(path, content):
    with io.open(path, "w", encoding="utf-8") as f:
        f.write(content)

def r1(content, old, new, label):
    c = content.count(old)
    assert c == 1, "%s: expected 1 match, found %d (context: %r)" % (label, c, old[:120])
    return content.replace(old, new)

path = "app/admission/i18n.js"
c = load(path)

c = r1(
    c,
    "  'Return to Home Page': 'العودة إلى الصفحة الرئيسية',\n"
    "};",
    "  'Return to Home Page': 'العودة إلى الصفحة الرئيسية',\n"
    "\n"
    "  // Model 16 \"Apply Now\" wizard (Student Type -> Study Type -> Ready to Apply)\n"
    "  'Step 1 of 3: Who Are You Applying As?': 'الخطوة ١ من ٣: بصفتك ماذا تتقدم؟',\n"
    "  'This determines your application fee currency and payment method. You can still refine your country of residence in the application itself.':\n"
    "    'يحدد هذا عملة رسوم التقديم وطريقة الدفع. يمكنك لاحقًا تحديد بلد إقامتك بدقة داخل الطلب نفسه.',\n"
    "  'New Student — Resident': 'طالب جديد — مقيم',\n"
    "  'Living in Ghana. Application fee is charged in GHS via Mobile Money or card.':\n"
    "    'مقيم في غانا. تُحصَّل رسوم التقديم بالسيدي الغاني عبر الموبايل موني أو البطاقة.',\n"
    "  'New Student — International': 'طالب جديد — دولي',\n"
    "  'Living outside Ghana. Application fee is charged in USD by card.':\n"
    "    'مقيم خارج غانا. تُحصَّل رسوم التقديم بالدولار الأمريكي عبر البطاقة.',\n"
    "  'Back': 'رجوع',\n"
    "  'Step 2 of 3: Choose Your Programme': 'الخطوة ٢ من ٣: اختر برنامجك',\n"
    "  'These are the programmes currently open for admission.':\n"
    "    'هذه هي البرامج المفتوحة حاليًا للقبول.',\n"
    "  'No programmes are currently open for admission. Please check back soon.':\n"
    "    'لا توجد برامج مفتوحة للقبول حاليًا. يرجى التحقق مرة أخرى قريبًا.',\n"
    "  'Step 3 of 3: Ready to Apply': 'الخطوة ٣ من ٣: جاهز للتقديم',\n"
    "  \"Here's what you told us. You can change your specific country and programme details inside the application.\":\n"
    "    'إليك ما أخبرتنا به. يمكنك تغيير بلدك المحدد وتفاصيل البرنامج داخل الطلب.',\n"
    "  'Applying as': 'التقديم بصفة',\n"
    "  'Start Over': 'البدء من جديد',\n"
    "  'Go to Application →': 'الانتقال إلى الطلب ←',\n"
    "  '-- Select your country --': '-- اختر بلدك --',\n"
    "  'You told us you are applying as an International student -- please select your specific country.':\n"
    "    'أخبرتنا أنك تتقدم بصفة طالب دولي -- يرجى اختيار بلدك المحدد.',\n"
    "};",
    "i18n: add Model 16 Apply Now wizard translations",
)

save(path, c)
print("app/admission/i18n.js: Apply Now wizard strings translated.")
