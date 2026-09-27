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
    assert c == 1, "%s: expected 1 match, found %d (context: %r)" % (label, c, old[:160])
    return content.replace(old, new)

path = "app/admission/track/page.jsx"
c = load(path)

# 1) State: a pending flag for the letter download button.
c = r1(
    c,
    "  const [applicationNumber, setApplicationNumber] = useState('');\n"
    "  const [loading, setLoading] = useState(false);\n"
    "  const [error, setError] = useState('');\n"
    "  const [result, setResult] = useState(null);",
    "  const [applicationNumber, setApplicationNumber] = useState('');\n"
    "  const [loading, setLoading] = useState(false);\n"
    "  const [error, setError] = useState('');\n"
    "  const [result, setResult] = useState(null);\n"
    "  const [letterDownloading, setLetterDownloading] = useState(false);",
    "track page: letterDownloading state",
)

# 2) Handler, defined alongside runLookup.
c = r1(
    c,
    "  const handleSubmit = (e) => {\n"
    "    e.preventDefault();\n"
    "    runLookup(applicationNumber);\n"
    "  };",
    "  const handleSubmit = (e) => {\n"
    "    e.preventDefault();\n"
    "    runLookup(applicationNumber);\n"
    "  };\n"
    "\n"
    "  const downloadLetter = async () => {\n"
    "    setLetterDownloading(true);\n"
    "    try {\n"
    "      const response = await fetch('/api/admissions/track/letter', {\n"
    "        method: 'POST',\n"
    "        headers: { 'Content-Type': 'application/json' },\n"
    "        body: JSON.stringify({ applicationNumber: result?.applicationNumber || applicationNumber }),\n"
    "      });\n"
    "      const data = await response.json();\n"
    "      if (!data.success) {\n"
    "        setError(data.error || t('Unable to retrieve your Letter of Admission right now.'));\n"
    "        return;\n"
    "      }\n"
    "      window.open(data.data.url, '_blank', 'noopener,noreferrer');\n"
    "    } catch (err) {\n"
    "      console.error('Admission letter download error:', err);\n"
    "      setError(t('Something went wrong. Please try again.'));\n"
    "    } finally {\n"
    "      setLetterDownloading(false);\n"
    "    }\n"
    "  };",
    "track page: downloadLetter handler",
)

# 3) UI: a download button right under the approval banner, only once
# staff have finalized a letter (admissionLetterAvailable, from the
# track API -- Model 17 Section 24: applicant access to the finalized
# document once issued).
c = r1(
    c,
    "            {result.status === 'APPROVED' && result.congratulationsMessage && (\n"
    "              <div style={approvedBanner}>{result.congratulationsMessage}</div>\n"
    "            )}\n",
    "            {result.status === 'APPROVED' && result.congratulationsMessage && (\n"
    "              <div style={approvedBanner}>\n"
    "                <p style={{ margin: 0 }}>{result.congratulationsMessage}</p>\n"
    "                {result.admissionLetterAvailable && (\n"
    "                  <button type=\"button\" style={letterDownloadBtn} disabled={letterDownloading} onClick={downloadLetter}>\n"
    "                    {letterDownloading ? t('Preparing…') : t('Download Your Letter of Admission')}\n"
    "                  </button>\n"
    "                )}\n"
    "              </div>\n"
    "            )}\n",
    "track page: letter download button",
)

# 4) Style constant for the download button.
c = r1(
    c,
    "const approvedBanner = {",
    "const letterDownloadBtn = {\n"
    "  marginTop: 12,\n"
    "  padding: '10px 20px',\n"
    "  borderRadius: 9,\n"
    "  border: 'none',\n"
    "  background: 'var(--brand)',\n"
    "  color: 'var(--on-accent)',\n"
    "  fontWeight: 700,\n"
    "  fontSize: 13.5,\n"
    "  cursor: 'pointer',\n"
    "};\n"
    "\n"
    "const approvedBanner = {",
    "track page: letterDownloadBtn style",
)

save(path, c)
print("app/admission/track/page.jsx: Letter of Admission download button wired in.")
