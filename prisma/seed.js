import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing from .env");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const categories = [
  {
    id: "cat-aqidah",
    nameEn: "Aqidah",
    nameAr: "العقيدة",
    slug: "aqidah",
  },
  {
    id: "cat-quran",
    nameEn: "Quran",
    nameAr: "القرآن",
    slug: "quran",
  },
  {
    id: "cat-hadith",
    nameEn: "Hadith",
    nameAr: "الحديث",
    slug: "hadith",
  },
  {
    id: "cat-fiqh",
    nameEn: "Fiqh",
    nameAr: "الفقه",
    slug: "fiqh",
  },
  {
    id: "cat-seerah",
    nameEn: "Seerah",
    nameAr: "السيرة",
    slug: "seerah",
  },
  {
    id: "cat-tazkiyah",
    nameEn: "Tazkiyah",
    nameAr: "التزكية",
    slug: "tazkiyah",
  },
  {
    id: "cat-arabic",
    nameEn: "Arabic Language",
    nameAr: "اللغة العربية",
    slug: "arabic",
  },
];

const books = [
  {
    id: "book-kitab-tawhid",
    titleEn: "Kitab At-Tawhid",
    titleAr: "كتاب التوحيد",
    slug: "kitab-at-tawhid",
    descriptionEn:
      "A foundational work on Islamic monotheism and the worship of Allah alone.",
    descriptionAr:
      "كتاب تأسيسي في توحيد الله وإفراده بالعبادة.",
    priceUSD: "9.99",
    coverImageUrl:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=85",
    r2FileKey: "books/kitab-at-tawhid.pdf",
    isFeatured: true,
    isNewRelease: false,
    categoryId: "cat-aqidah",
  },

  {
    id: "book-three-fundamental-principles",
    titleEn: "The Three Fundamental Principles",
    titleAr: "الأصول الثلاثة",
    slug: "three-fundamental-principles",
    descriptionEn:
      "A concise introduction to the fundamental knowledge every Muslim should learn.",
    descriptionAr:
      "رسالة مختصرة في أصول العلم التي ينبغي لكل مسلم معرفتها.",
    priceUSD: "7.99",
    coverImageUrl:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=85",
    r2FileKey: "books/three-fundamental-principles.pdf",
    isFeatured: true,
    isNewRelease: true,
    categoryId: "cat-aqidah",
  },

  {
    id: "book-forty-hadith",
    titleEn: "Forty Hadith of Imam An-Nawawi",
    titleAr: "الأربعون النووية",
    slug: "forty-hadith-imam-nawawi",
    descriptionEn:
      "A collection of forty foundational prophetic traditions compiled by Imam An-Nawawi.",
    descriptionAr:
      "مجموعة من الأحاديث النبوية الجامعة التي جمعها الإمام النووي رحمه الله.",
    priceUSD: "12.99",
    coverImageUrl:
      "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=900&q=85",
    r2FileKey: "books/forty-hadith-imam-nawawi.pdf",
    isFeatured: true,
    isNewRelease: false,
    categoryId: "cat-hadith",
  },

  {
    id: "book-riyad-us-saliheen",
    titleEn: "Riyad As-Salihin",
    titleAr: "رياض الصالحين",
    slug: "riyad-as-salihin",
    descriptionEn:
      "A major collection of authentic prophetic traditions covering manners, worship and righteous conduct.",
    descriptionAr:
      "من أشهر كتب الحديث التي تجمع أحاديث في العبادات والآداب والأخلاق.",
    priceUSD: "19.99",
    coverImageUrl:
      "https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=900&q=85",
    r2FileKey: "books/riyad-as-salihin.pdf",
    isFeatured: true,
    isNewRelease: false,
    categoryId: "cat-hadith",
  },

  {
    id: "book-tafsir-ibn-kathir",
    titleEn: "Tafsir Ibn Kathir",
    titleAr: "تفسير ابن كثير",
    slug: "tafsir-ibn-kathir",
    descriptionEn:
      "A renowned classical commentary on the Quran based on the Quran, Sunnah and statements of the early generations.",
    descriptionAr:
      "من أشهر كتب تفسير القرآن الكريم بالمأثور.",
    priceUSD: "24.99",
    coverImageUrl:
      "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=900&q=85",
    r2FileKey: "books/tafsir-ibn-kathir.pdf",
    isFeatured: true,
    isNewRelease: false,
    categoryId: "cat-quran",
  },

  {
    id: "book-quranic-sciences",
    titleEn: "Introduction to Quranic Sciences",
    titleAr: "مقدمة في علوم القرآن",
    slug: "introduction-quranic-sciences",
    descriptionEn:
      "An introductory academic resource covering important subjects related to the sciences of the Quran.",
    descriptionAr:
      "مدخل تعليمي إلى أهم مباحث علوم القرآن.",
    priceUSD: "14.99",
    coverImageUrl:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=85",
    r2FileKey: "books/introduction-quranic-sciences.pdf",
    isFeatured: false,
    isNewRelease: true,
    categoryId: "cat-quran",
  },

  {
    id: "book-umdatul-ahkam",
    titleEn: "Umdat Al-Ahkam",
    titleAr: "عمدة الأحكام",
    slug: "umdat-al-ahkam",
    descriptionEn:
      "A concise collection of authentic hadith dealing primarily with rulings of worship and daily practice.",
    descriptionAr:
      "مختصر جامع لأحاديث الأحكام الصحيحة.",
    priceUSD: "15.99",
    coverImageUrl:
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=900&q=85",
    r2FileKey: "books/umdat-al-ahkam.pdf",
    isFeatured: false,
    isNewRelease: true,
    categoryId: "cat-fiqh",
  },

  {
    id: "book-madinah-arabic",
    titleEn: "Arabic Language Foundations",
    titleAr: "أساسيات اللغة العربية",
    slug: "arabic-language-foundations",
    descriptionEn:
      "A foundational resource for students beginning their study of the Arabic language.",
    descriptionAr:
      "مادة تأسيسية للطلاب المبتدئين في دراسة اللغة العربية.",
    priceUSD: "17.99",
    coverImageUrl:
      "https://images.unsplash.com/photo-1455885666463-6d7f4c7e5a2d?auto=format&fit=crop&w=900&q=85",
    r2FileKey: "books/arabic-language-foundations.pdf",
    isFeatured: true,
    isNewRelease: true,
    categoryId: "cat-arabic",
  },

  {
    id: "book-prophetic-biography",
    titleEn: "The Prophetic Biography",
    titleAr: "السيرة النبوية",
    slug: "prophetic-biography",
    descriptionEn:
      "A study resource covering the life, character and mission of Prophet Muhammad ﷺ.",
    descriptionAr:
      "مادة علمية لدراسة حياة النبي محمد ﷺ وسيرته وشمائله.",
    priceUSD: "21.99",
    coverImageUrl:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=85",
    r2FileKey: "books/prophetic-biography.pdf",
    isFeatured: true,
    isNewRelease: false,
    categoryId: "cat-seerah",
  },

  {
    id: "book-purification-soul",
    titleEn: "Purification of the Soul",
    titleAr: "تزكية النفس",
    slug: "purification-of-the-soul",
    descriptionEn:
      "A beneficial introduction to spiritual purification, sincerity and righteous character.",
    descriptionAr:
      "مدخل نافع إلى تزكية النفس والإخلاص وحسن الخلق.",
    priceUSD: "13.99",
    coverImageUrl:
      "https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=900&q=85",
    r2FileKey: "books/purification-of-the-soul.pdf",
    isFeatured: false,
    isNewRelease: true,
    categoryId: "cat-tazkiyah",
  },
];

const countries = [
  {
    id: "country-ghana",
    code: "GH",
    name: "Ghana",
    currencyCode: "GHS",
    currencySymbol: "GH₵",
  },
  {
    id: "country-saudi-arabia",
    code: "SA",
    name: "Saudi Arabia",
    currencyCode: "SAR",
    currencySymbol: "﷼",
  },
  {
    id: "country-nigeria",
    code: "NG",
    name: "Nigeria",
    currencyCode: "NGN",
    currencySymbol: "₦",
  },
  {
    id: "country-united-states",
    code: "US",
    name: "United States",
    currencyCode: "USD",
    currencySymbol: "$",
  },
  {
    id: "country-united-kingdom",
    code: "GB",
    name: "United Kingdom",
    currencyCode: "GBP",
    currencySymbol: "£",
  },
];

const exchangeRates = [
  {
    id: "rate-ghs",
    currencyCode: "GHS",
    rateToUSD: "12.500000",
    countryId: "country-ghana",
  },
  {
    id: "rate-sar",
    currencyCode: "SAR",
    rateToUSD: "3.750000",
    countryId: "country-saudi-arabia",
  },
  {
    id: "rate-ngn",
    currencyCode: "NGN",
    rateToUSD: "1500.000000",
    countryId: "country-nigeria",
  },
  {
    id: "rate-usd",
    currencyCode: "USD",
    rateToUSD: "1.000000",
    countryId: "country-united-states",
  },
  {
    id: "rate-gbp",
    currencyCode: "GBP",
    rateToUSD: "0.750000",
    countryId: "country-united-kingdom",
  },
];

async function seedCategories() {
  console.log("Seeding categories...");

  for (const category of categories) {
    await prisma.category.upsert({
      where: {
        id: category.id,
      },
      update: {
        nameEn: category.nameEn,
        nameAr: category.nameAr,
        slug: category.slug,
      },
      create: category,
    });

    console.log(`  ✓ ${category.nameEn}`);
  }
}

async function seedCountries() {
  console.log("Seeding countries...");

  for (const country of countries) {
    await prisma.country.upsert({
      where: {
        id: country.id,
      },
      update: {
        code: country.code,
        name: country.name,
        currencyCode: country.currencyCode,
        currencySymbol: country.currencySymbol,
      },
      create: country,
    });

    console.log(`  ✓ ${country.name}`);
  }
}

async function seedExchangeRates() {
  console.log("Seeding exchange rates...");

  for (const rate of exchangeRates) {
    await prisma.exchangeRate.upsert({
      where: {
        id: rate.id,
      },
      update: {
        currencyCode: rate.currencyCode,
        rateToUSD: rate.rateToUSD,
        countryId: rate.countryId,
        updatedAt: new Date(),
      },
      create: {
        id: rate.id,
        currencyCode: rate.currencyCode,
        rateToUSD: rate.rateToUSD,
        countryId: rate.countryId,
        updatedAt: new Date(),
      },
    });

    console.log(`  ✓ ${rate.currencyCode}`);
  }
}

async function seedBooks() {
  console.log("Seeding books...");

  for (const book of books) {
    await prisma.book.upsert({
      where: {
        id: book.id,
      },
      update: {
        titleEn: book.titleEn,
        titleAr: book.titleAr,
        slug: book.slug,
        descriptionEn: book.descriptionEn,
        descriptionAr: book.descriptionAr,
        priceUSD: book.priceUSD,
        coverImageUrl: book.coverImageUrl,
        r2FileKey: book.r2FileKey,
        isFeatured: book.isFeatured,
        isNewRelease: book.isNewRelease,
        categoryId: book.categoryId,
      },
      create: book,
    });

    console.log(`  ✓ ${book.titleEn}`);
  }
}

async function main() {
  console.log("");
  console.log("========================================");
  console.log("       ILM-HUB DATABASE SEED");
  console.log("========================================");
  console.log("");

  await seedCategories();
  console.log("");

  await seedCountries();
  console.log("");

  await seedExchangeRates();
  console.log("");

  await seedBooks();
  console.log("");

  console.log("========================================");
  console.log("       SEED COMPLETED SUCCESSFULLY");
  console.log("========================================");
  console.log("");
}

main()
  .catch((error) => {
    console.error("");
    console.error("========================================");
    console.error("           SEED FAILED");
    console.error("========================================");
    console.error("");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
