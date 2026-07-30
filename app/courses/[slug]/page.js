import Link from 'next/link';

export const metadata = {
  title: 'Course Details | Islamic Peace Message',
  description: 'View course syllabus, instructor details, and enrollment options.',
};

async function getCourseDetails(slug) {
  return {
    id: 'c1',
    titleEn: 'Fundamentals of Aqeedah & Tawheed',
    titleAr: 'Ø£ØµÙˆÙ„ Ø§Ù„Ø¹Ù‚ÙŠØ¯Ø© ÙˆØ§Ù„ØªÙˆØ­ÙŠØ¯',
    slug: slug,
    isPaid: false,
    priceGHS: 0,
    category: 'Aqeedah',
    description:
      'A comprehensive guide to understanding the core pillars of Islamic creed, monotheism (Tawheed), and avoiding common misconceptions. Taught with classical texts simplified for modern learning.',
    instructor: 'Shaykh Ahmad Ghana',
    instructorBio: 'Senior lecturer in Islamic Studies with over 15 years of experience teaching Aqeedah and Usul-al-Din in West Africa.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80',
    sections: [
      {
        id: 's1',
        title: 'Section 1: Introduction to Tawheed',
        lectures: [
          { id: 'l1', title: 'Meaning and Importance of Tawheed', duration: '25 mins', isFreePreview: true },
          { id: 'l2', title: 'The Three Categories of Tawheed', duration: '40 mins', isFreePreview: true },
        ],
      },
      {
        id: 's2',
        title: 'Section 2: The Six Pillars of Iman',
        lectures: [
          { id: 'l3', title: 'Belief in Allah & His Attributes', duration: '45 mins', isFreePreview: false },
          { id: 'l4', title: 'Belief in the Angels and Books', duration: '35 mins', isFreePreview: false },
        ],
      },
    ],
  };
}

export default async function CourseDetailPage({ params }) {
  const course = await getCourseDetails(params.slug);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 md:h-auto relative bg-gray-200">
            <img src={course.thumbnailUrl} alt={course.titleEn} className="w-full h-full object-cover" />
          </div>
          <div className="p-6 md:col-span-2 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-[#0D5C3A] uppercase tracking-wider">{course.category}</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">{course.titleEn}</h1>
              <p className="text-md dir-rtl text-right font-semibold text-gray-500 mt-1">{course.titleAr}</p>
              <p className="mt-4 text-gray-600 text-sm sm:text-base">{course.description}</p>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 pt-4">
              <div>
                <span className="text-xs text-gray-500 block">Price</span>
                <span className="text-2xl font-bold text-[#0D5C3A]">
                  {course.isPaid ? `GHâ‚µ ${course.priceGHS}` : 'FREE'}
                </span>
              </div>
              <Link
                href={`/checkout?type=course&slug=${course.slug}`}
                className="w-full sm:w-auto text-center bg-[#0D5C3A] hover:bg-[#0a482d] text-white py-3 px-8 rounded-xl font-bold transition-colors"
              >
                {course.isPaid ? 'Enroll Now (Pay with MoMo / Card)' : 'Enroll for Free'}
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Instructor</h2>
          <p className="font-semibold text-[#0D5C3A]">{course.instructor}</p>
          <p className="text-sm text-gray-600 mt-1">{course.instructorBio}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Course Syllabus</h2>
          <div className="space-y-4">
            {course.sections.map((section) => (
              <div key={section.id} className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 font-semibold text-gray-800 border-b border-gray-200">
                  {section.title}
                </div>
                <ul className="divide-y divide-gray-100">
                  {section.lectures.map((lecture) => (
                    <li key={lecture.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-[#0D5C3A]">â–¶</span>
                        <span className="text-sm font-medium text-gray-800">{lecture.title}</span>
                        {lecture.isFreePreview && (
                          <span className="bg-emerald-100 text-[#0D5C3A] text-xs px-2 py-0.5 rounded font-semibold">
                            Free Preview
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{lecture.duration}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}