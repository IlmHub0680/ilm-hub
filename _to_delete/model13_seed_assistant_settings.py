# -*- coding: utf-8 -*-
import io

def r1(content, old, new, label):
    c = content.count(old)
    assert c == 1, "%s: expected 1 match, found %d" % (label, c)
    return content.replace(old, new)

def load(path):
    with io.open(path, "r", encoding="utf-8") as f:
        return f.read()

def save(path, content):
    with io.open(path, "w", encoding="utf-8") as f:
        f.write(content)

path = "prisma/seed.js"
c = load(path)

c = r1(
    c,
    "async function main() {",
    '''const assistantSettingsDefault = {
  id: "default-assistant-settings",
  isEnabled: true,
  welcomeMessageEn:
    "Assalamu alaikum! I'm the Ulul Azm assistant. How may I help you today?",
  welcomeMessageAr: "السلام عليكم! أنا مساعد أولو العزم. كيف يمكنني مساعدتك اليوم؟",
  supportedLanguages: ["en", "ar"],
};

async function seedAssistantSettings() {
  console.log("Seeding AI Assistant settings...");

  await prisma.assistantSettings.upsert({
    where: { id: assistantSettingsDefault.id },
    update: {
      isEnabled: assistantSettingsDefault.isEnabled,
      welcomeMessageEn: assistantSettingsDefault.welcomeMessageEn,
      welcomeMessageAr: assistantSettingsDefault.welcomeMessageAr,
      supportedLanguages: assistantSettingsDefault.supportedLanguages,
    },
    create: assistantSettingsDefault,
  });
  console.log("  ✓ Assistant settings");
}

async function main() {''',
    "seed.js: add seedAssistantSettings function",
)

c = r1(
    c,
    """  await seedAcademyHub();
  console.log("");

  console.log("========================================");
  console.log("       SEED COMPLETED SUCCESSFULLY");""",
    """  await seedAcademyHub();
  console.log("");

  await seedAssistantSettings();
  console.log("");

  console.log("========================================");
  console.log("       SEED COMPLETED SUCCESSFULLY");""",
    "seed.js: call seedAssistantSettings from main()",
)

save(path, c)
print("prisma/seed.js: AssistantSettings default row wired in.")
