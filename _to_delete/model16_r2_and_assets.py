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

# =======================================================================
# lib/r2.ts -- add a direct object-fetch helper (no presigning) for the
# new public asset proxy. Existing helpers (uploadToR2, deleteFromR2,
# getR2PresignedUrl) are untouched -- this is purely additive, and every
# private/gated file (admission documents, assignments, manuscripts,
# etc.) keeps using the presigned-URL path exactly as before. This new
# helper is ONLY ever called by app/api/assets/[...key]/route.js, which
# itself only serves keys under the "public/" prefix -- see that route's
# own comment for the security reasoning.
# =======================================================================
path = "lib/r2.ts"
c = load(path)

c = r1(
    c,
    "export async function getR2PresignedUrl(",
    "export async function getR2Object(\n"
    "  key: string\n"
    ") {\n"
    "  const cleanKey =\n"
    "    key.trim();\n"
    "\n"
    "  if (!cleanKey) {\n"
    "    throw new Error(\n"
    "      \"R2 file key is missing.\"\n"
    "    );\n"
    "  }\n"
    "\n"
    "  const client =\n"
    "    getR2Client();\n"
    "\n"
    "  const command =\n"
    "    new GetObjectCommand({\n"
    "      Bucket: getBucket(),\n"
    "      Key: cleanKey,\n"
    "    });\n"
    "\n"
    "  return client.send(command);\n"
    "}\n"
    "\n"
    "export async function getR2PresignedUrl(",
    "r2.ts: add getR2Object (direct fetch, no presigning)",
)

save(path, c)
print("lib/r2.ts: getR2Object() added.")
