import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const ASSISTANT_SETTINGS_ID = "default-assistant-settings";

function json(data, status = 200) {
  return Response.json(data, { status });
}

function serialize(settings) {
  return {
    isEnabled: settings.isEnabled,
    welcomeMessageEn: settings.welcomeMessageEn || "",
    welcomeMessageAr: settings.welcomeMessageAr || "",
    supportedLanguages: settings.supportedLanguages,
  };
}

export async function GET() {
  try {
    await requireAdmin();

    const settings = await prisma.assistantSettings.findUnique({
      where: { id: ASSISTANT_SETTINGS_ID },
    });

    if (!settings) {
      return json({ success: false, error: "Assistant settings have not been configured yet." }, 404);
    }

    return json({ success: true, data: serialize(settings) });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Admin access required." }, 403);

    console.error("GET assistant settings error:", error);
    return json({ success: false, error: "Failed to load assistant settings." }, 500);
  }
}

export async function PUT(request) {
  try {
    await requireAdmin();

    const body = await request.json();

    const isEnabled = Boolean(body.isEnabled);
    const welcomeMessageEn =
      typeof body.welcomeMessageEn === "string" ? body.welcomeMessageEn.trim().slice(0, 500) : "";
    const welcomeMessageAr =
      typeof body.welcomeMessageAr === "string" ? body.welcomeMessageAr.trim().slice(0, 500) : "";

    const requestedLanguages = Array.isArray(body.supportedLanguages) ? body.supportedLanguages : [];
    // Only 'en' and 'ar' actually exist as translated interfaces today
    // (see lib/assistantI18n.js) — never let this field claim a language
    // the widget can't really speak.
    const supportedLanguages = ["en", "ar"].filter((lang) => requestedLanguages.includes(lang));
    if (supportedLanguages.length === 0) supportedLanguages.push("en");

    const data = {
      isEnabled,
      welcomeMessageEn: welcomeMessageEn || null,
      welcomeMessageAr: welcomeMessageAr || null,
      supportedLanguages,
    };

    const settings = await prisma.assistantSettings.upsert({
      where: { id: ASSISTANT_SETTINGS_ID },
      update: data,
      create: { id: ASSISTANT_SETTINGS_ID, ...data },
    });

    return json({ success: true, data: serialize(settings) });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Admin access required." }, 403);

    console.error("PUT assistant settings error:", error);
    return json({ success: false, error: "Failed to save assistant settings." }, 500);
  }
}
