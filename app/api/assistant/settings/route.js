import { prisma } from "@/lib/prisma";

// Public, unauthenticated read of the AI Assistant's admin-configured
// settings (availability, welcome message, supported languages). Falls
// back to safe defaults matching the widget's own built-in copy whenever
// nothing has been configured yet, so the assistant never regresses to a
// broken or empty state — the same fallback pattern already used by
// /api/homepage-content and /api/academy-hub.
export const dynamic = "force-dynamic";

const ASSISTANT_SETTINGS_ID = "default-assistant-settings";

const DEFAULTS = {
  isEnabled: true,
  welcomeMessageEn: "",
  welcomeMessageAr: "",
  supportedLanguages: ["en", "ar"],
};

export async function GET() {
  try {
    const settings = await prisma.assistantSettings.findUnique({
      where: { id: ASSISTANT_SETTINGS_ID },
    });

    if (!settings) {
      return Response.json({ success: true, data: DEFAULTS });
    }

    return Response.json({
      success: true,
      data: {
        isEnabled: settings.isEnabled,
        welcomeMessageEn: settings.welcomeMessageEn || "",
        welcomeMessageAr: settings.welcomeMessageAr || "",
        supportedLanguages: settings.supportedLanguages?.length ? settings.supportedLanguages : DEFAULTS.supportedLanguages,
      },
    });
  } catch (error) {
    console.error("GET public assistant settings error:", error);
    // Never let a settings-lookup failure take the whole assistant down.
    return Response.json({ success: true, data: DEFAULTS });
  }
}
