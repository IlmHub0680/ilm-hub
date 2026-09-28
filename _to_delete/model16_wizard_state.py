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

path = "app/admission/page.js"
c = load(path)

# -----------------------------------------------------------------------
# Model 16: the "Apply Now" wizard (Student Type -> Study Type -> Ready
# to Apply) that sits in front of the existing application form.
# wizardComplete defaults to false (wizard shows first); the effect
# below flips it to true when the applicant already told us what they
# want elsewhere on the site, or is already mid-flow -- in neither
# case should the wizard interrupt them. This mirrors the existing
# isPaymentReturn pattern just above it (same file, same technique).
# -----------------------------------------------------------------------
c = r1(
    c,
    "  // State for handling direct payment and processing inside Step 4\n"
    "  const [isPaymentProcessed, setIsPaymentProcessed] = useState(false);\n"
    "  const [isProcessingPayment, setIsProcessingPayment] = useState(false);",
    "  // State for handling direct payment and processing inside Step 4\n"
    "  const [isPaymentProcessed, setIsPaymentProcessed] = useState(false);\n"
    "  const [isProcessingPayment, setIsProcessingPayment] = useState(false);\n"
    "\n"
    "  // Model 16 \"Apply Now\" wizard -- Student Type -> Study Type -> Ready\n"
    "  // to Apply -- shown before the application form below unless the\n"
    "  // applicant already answered these elsewhere (a specific programme's\n"
    "  // own \"Apply Now\" link) or is already mid-flow.\n"
    "  const [wizardComplete, setWizardComplete] = useState(false);\n"
    "  const [wizardStep, setWizardStep] = useState(1);\n"
    "  const [wizardResidency, setWizardResidency] = useState('');\n"
    "  const [wizardProgramId, setWizardProgramId] = useState('');\n"
    "\n"
    "  useEffect(() => {\n"
    "    if (typeof window === 'undefined') return;\n"
    "    try {\n"
    "      const params = new URLSearchParams(window.location.search);\n"
    "      const alreadyInFlow =\n"
    "        params.has('program') ||\n"
    "        params.has('reference') ||\n"
    "        params.has('stripe_session_id') ||\n"
    "        params.get('payment') === 'cancelled' ||\n"
    "        Boolean(sessionStorage.getItem('ilm_admission_payment_draft'));\n"
    "\n"
    "      if (alreadyInFlow) {\n"
    "        setWizardComplete(true);\n"
    "      }\n"
    "    } catch (error) {\n"
    "      // sessionStorage/URL access unavailable -- default to showing\n"
    "      // the wizard, which is always safe.\n"
    "    }\n"
    "  }, []);\n"
    "\n"
    "  const wizardSelectedProgramme = useMemo(\n"
    "    () => activeProgrammes.find((programme) => programme.id === wizardProgramId),\n"
    "    [activeProgrammes, wizardProgramId]\n"
    "  );\n"
    "\n"
    "  const startApplicationFromWizard = () => {\n"
    "    setFormData((prev) => ({\n"
    "      ...prev,\n"
    "      countryOfResidence:\n"
    "        wizardResidency === 'RESIDENT' ? 'Ghana' : '',\n"
    "      ...(wizardSelectedProgramme\n"
    "        ? {\n"
    "            programId: wizardSelectedProgramme.id,\n"
    "            academicProgramme: wizardSelectedProgramme.name,\n"
    "            academicProgrammeLevel: wizardSelectedProgramme.level,\n"
    "          }\n"
    "        : {}),\n"
    "    }));\n"
    "    setWizardComplete(true);\n"
    "  };\n"
    "\n"
    "  const restartWizard = () => {\n"
    "    setWizardStep(1);\n"
    "    setWizardResidency('');\n"
    "    setWizardProgramId('');\n"
    "  };",
    "admission page: wizard state, skip-detection effect, and handlers",
)

save(path, c)
print("app/admission/page.js: wizard state added.")
