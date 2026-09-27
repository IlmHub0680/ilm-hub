'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from './LanguageContext';

// Display-only friendly names for the real Program records shown in
// this admission flow -- matches PATHWAY_OPTIONS/PATHWAY_TIERS' wording
// elsewhere on the site. The database's Program.nameEn values (and
// what gets submitted with the application) are unchanged.
const PROGRAMME_DISPLAY_NAMES = {
  'Foundation Studies': 'Foundation Learner Programme',
  'Intermediate Islamic Studies': 'Intermediate Learner Programme',
  'Advanced Islamic Studies': 'Advanced Islamic Studies',
  'Diploma in Islamic Studies': 'Diploma in Islamic Studies',
};

function programmeDisplayName(name) {
  return PROGRAMME_DISPLAY_NAMES[name] || name;
}

function AdmissionPageInner() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const [currentStage, setCurrentStage] = useState(1);
  const [academicProgrammes, setAcademicProgrammes] = useState([]);
  const [programmesLoading, setProgrammesLoading] = useState(true);
  const [programmesError, setProgrammesError] = useState('');

  // Keep only active programmes and avoid recalculating on every render.
  const activeProgrammes = useMemo(
    () => academicProgrammes.filter((programme) => programme.status === 'Active'),
    [academicProgrammes]
  );

  const [maxCompletedStage, setMaxCompletedStage] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submittedApplicationNumber, setSubmittedApplicationNumber] = useState('');

  useEffect(() => {
    if (!submitted) return;
    try {
      const stored = localStorage.getItem('ilm_admission_application_number');
      if (stored) setSubmittedApplicationNumber(stored);
    } catch (error) {
      // localStorage unavailable — tracking number just won't prefill.
    }
  }, [submitted]);

  // Prevent Step 1 from flashing while returning from Paystack or Stripe
  // and a real payment verification is in flight. This is reset back to
  // false as soon as that verification finishes (success or failure) —
  // it must never permanently hide the wizard (that was the bug: the
  // applicant would pay, come back, and see no Submit button at all).
  const [isPaymentReturn, setIsPaymentReturn] = useState(false);

  // Shown once, inline, when the applicant is sent back here after
  // cancelling a payment on the gateway's own page.
  const [paymentCancelledNotice, setPaymentCancelledNotice] = useState(false);

  // State for handling direct payment and processing inside Step 4
  const [isPaymentProcessed, setIsPaymentProcessed] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Model 16 "Apply Now" wizard -- Student Type -> Study Type -> Ready
  // to Apply -- shown before the application form below unless the
  // applicant already answered these elsewhere (a specific programme's
  // own "Apply Now" link) or is already mid-flow.
  const [wizardComplete, setWizardComplete] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardResidency, setWizardResidency] = useState('');
  const [wizardProgramId, setWizardProgramId] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const alreadyInFlow =
        params.has('program') ||
        params.has('reference') ||
        params.has('stripe_session_id') ||
        params.get('payment') === 'cancelled' ||
        Boolean(sessionStorage.getItem('ilm_admission_payment_draft'));

      if (alreadyInFlow) {
        setWizardComplete(true);
      }
    } catch (error) {
      // sessionStorage/URL access unavailable -- default to showing
      // the wizard, which is always safe.
    }
  }, []);

  const wizardSelectedProgramme = useMemo(
    () => activeProgrammes.find((programme) => programme.id === wizardProgramId),
    [activeProgrammes, wizardProgramId]
  );

  const startApplicationFromWizard = () => {
    setFormData((prev) => ({
      ...prev,
      countryOfResidence:
        wizardResidency === 'RESIDENT' ? 'Ghana' : '',
      ...(wizardSelectedProgramme
        ? {
            programId: wizardSelectedProgramme.id,
            academicProgramme: wizardSelectedProgramme.name,
            academicProgrammeLevel: wizardSelectedProgramme.level,
          }
        : {}),
    }));
    setWizardComplete(true);
  };

  const restartWizard = () => {
    setWizardStep(1);
    setWizardResidency('');
    setWizardProgramId('');
  };

  const [formData, setFormData] = useState({
    // Step 1: Account & Personal
    email: '',
    password: '',
    fullName: '',
    preferredName: '',
    dateOfBirth: '',
    gender: '',
    nationality: 'Ghana',
    countryOfResidence: 'Ghana',
    phoneNumber: '',
    idNumber: '',
    residentialAddress: '',
    applicantCategory: 'Senior Learner (15-20 years)',

    // Step 2: Contacts & Education
    guardianName: '',
    guardianPhone: '',
    guardianRelationship: 'Father',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelationship: 'Mother',
    highestEducation: 'High School',
    institutionName: '',

    // Step 2 (cont.): Academic background & placement self-assessment
    islamicStudiesBackground: '',
    quranReadingSelf: '',
    quranTajweedSelf: '',
    quranHifzSelf: '',
    quranRecitationSelf: '',
    arabicReadingSelf: '',
    arabicWritingSelf: '',
    arabicGrammarSelf: '',
    arabicVocabularySelf: '',
    arabicConversationSelf: '',
    quranicArabicSelf: '',
    learningGoals: '',
    supportNeeds: '',

    // Step 3: Programme, Session & Documents
    programId: '',
    academicProgramme: '',
    academicProgrammeLevel: '',
    pathwayPreference: '',
    preferredDepartmentId: '',
    specialization: '',
    studyMode: '',
    studySession: 'Morning Session',
    identityDocType: 'Ghana Card',
    documents: {
      identityDocument: null,
      passportPicture: null,
      transcripts: null,
      certificate: null,
      testimonial: null,
      recommendation: null,
    },
    declarationAccepted: false,

    // Step 4: Fee & Payment
    paymentMethod: 'ADMISSION_PAYSTACK',
    calculatedFee: 'Calculating...',
    feeBase: 'Based on country of residence and learner category',
  });

  const selectedProgramme = useMemo(
    () => activeProgrammes.find((programme) => programme.id === formData.programId),
    [activeProgrammes, formData.programId]
  );

  // Preferred department options, derived from the programmes already
  // loaded for Step 3 rather than a second network call — a program's
  // department (Program.departmentId) is real, so a genuine department
  // preference can be recorded even before a specific programme is
  // chosen.
  const departmentOptions = useMemo(() => {
    const seen = new Map();
    for (const programme of activeProgrammes) {
      if (programme.departmentId && programme.department && !seen.has(programme.departmentId)) {
        seen.set(programme.departmentId, programme.department);
      }
    }
    return Array.from(seen, ([id, name]) => ({ id, name }));
  }, [activeProgrammes]);

  // The Academy's five pathways (Academy Pathways §1) — a starting
  // preference only; Placement (Academy Pathways §8) decides the
  // pathway a learner actually enters.
  const PATHWAY_OPTIONS = [
    'Foundation Learner Programme',
    'Intermediate Learner Programme',
    'Advanced Islamic Studies',
    'Diploma in Islamic Studies',
    'Specialized Certificate Programs',
  ];

  // Shared five-point self-rating scale for the Qur'an and Arabic
  // placement inputs below (Academy Pathways §8's seven placement
  // inputs, made concrete) — the applicant's own account, not the
  // placement result itself.
  const SELF_LEVEL_OPTIONS = [
    { value: '', label: t('Prefer not to say') },
    { value: 'NONE', label: t('None yet') },
    { value: 'BEGINNER', label: t('Beginner') },
    { value: 'INTERMEDIATE', label: t('Intermediate') },
    { value: 'ADVANCED', label: t('Advanced') },
    { value: 'PROFICIENT', label: t('Proficient') },
  ];

  const renderSelfLevelField = (label, field) => (
    <div>
      <label style={commonLabelStyle}>{t(label)}</label>
      <select value={formData[field]} onChange={(e) => setFormData({ ...formData, [field]: e.target.value })} style={commonInputStyle}>
        {SELF_LEVEL_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  const countryList = [
    "Ghana", "Nigeria", "Kenya", "South Africa", "Egypt", "Uganda", "Tanzania",
    "United Kingdom", "United States", "Canada", "Saudi Arabia", "United Arab Emirates", 
    "Germany", "France", "Pakistan", "India", "Other"
  ];

  const africanCountries = [
    "nigeria", "kenya", "south africa", "egypt", "uganda", "tanzania", 
    "morocco", "algeria", "ethiopia", "rwanda", "zambia", "zimbabwe",
    "senegal", "ivory coast", "côte d'ivoire", "cameroon", "angola", "benin",
    "botswana", "burkina faso", "burundi", "cabo verde", "central african republic",
    "chad", "comoros", "congo", "djibouti", "equatorial guinea", "eritrea",
    "eswatini", "gabon", "gambia", "guinea", "guinea-bissau", "lesotho",
    "liberia", "libya", "madagascar", "malawi", "mali", "mauritania",
    "mauritius", "mozambique", "namibia", "niger", "sao tome and principe",
    "seychelles", "sierra leone", "somalia", "south sudan", "sudan", "togo", "tunisia"
  ];

  // Admission pricing comes from the admin-configured database settings.
  // IMPORTANT: fee is determined ONLY by:
  //   1. Date of birth -> learner category
  //   2. Country of residence -> Ghana or International
  // Nationality does NOT determine the fee.

  useEffect(() => {
    let cancelled = false;

    async function loadAcademicProgrammes() {
      try {
        setProgrammesLoading(true);
        setProgrammesError('');

        const response = await fetch('/api/academic/programs?type=programs');

        if (!response.ok) {
          throw new Error('Unable to load academic programmes.');
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(
            result.error || 'Unable to load academic programmes.'
          );
        }

        if (!cancelled) {
          setAcademicProgrammes(result.data || []);

          // Coming from a specific programme's page (Apply Now) --
          // pre-select it instead of asking the visitor to find it
          // again among every active programme.
          const requestedProgramId = searchParams?.get('program');
          if (requestedProgramId) {
            const match = (result.data || []).find(
              (programme) => programme.id === requestedProgramId && programme.status === 'Active'
            );
            if (match) {
              setFormData((f) => (f.programId ? f : { ...f, programId: match.id }));
            }
          }
        }
      } catch (error) {
        if (!cancelled) {
          setProgrammesError(
            error?.message || 'Unable to load academic programmes.'
          );
        }
      } finally {
        if (!cancelled) {
          setProgrammesLoading(false);
        }
      }
    }

    loadAcademicProgrammes();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadAdmissionFee() {
      if (!formData.dateOfBirth || !formData.countryOfResidence) {
        return;
      }

      try {
        const response = await fetch('/api/admissions/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fullName: formData.fullName || 'Applicant',
            dob: formData.dateOfBirth,
            nationality: formData.nationality,
            countryOfResidence: formData.countryOfResidence,
            studySession: formData.studySession,
          }),
        });

        const result = await response.json();

        if (cancelled) {
          return;
        }

        if (!response.ok || !result.success || !result.data) {
          console.error(
            'Application fee calculation failed:',
            result.error || 'Unknown error'
          );
          return;
        }

        setFormData((prev) => ({
          ...prev,
          calculatedFee: `${result.data.currency} ${Number(
            result.data.admissionFee
          ).toFixed(2)}`,
          feeBase: result.data.feeBasis,
        }));
      } catch (error) {
        if (!cancelled) {
          console.error('Unable to load application fee:', error);
        }
      }
    }

    loadAdmissionFee();

    return () => {
      cancelled = true;
    };
  }, [
    formData.dateOfBirth,
    formData.countryOfResidence,
  ]);

  const handleFileChange = (docKey, file) => {
    setFormData((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docKey]: file || null,
      },
    }));
  };

  // Restore the admission form after returning from Paystack.
  // sessionStorage keeps the draft in the same browser session without
  // permanently storing the applicant's password in localStorage.
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const params = new URLSearchParams(window.location.search);

      // Only a reference/session id means there is an actual payment to
      // verify — that's the only case worth briefly hiding the wizard
      // for, while the verification effects below run.
      const hasVerifiablePaymentReturn =
        params.has('reference') || params.has('stripe_session_id');

      if (hasVerifiablePaymentReturn) {
        setIsPaymentReturn(true);
      } else if (params.get('payment') === 'cancelled') {
        setCurrentStage(4);
        setMaxCompletedStage((previous) => Math.max(previous, 4));
        setPaymentCancelledNotice(true);

        const cleanUrl = `${window.location.pathname}${window.location.hash || ''}`;
        window.history.replaceState({}, document.title, cleanUrl);
      }

      const savedDraft = sessionStorage.getItem('ilm_admission_payment_draft');

      if (!savedDraft) {
        return;
      }

      const parsedDraft = JSON.parse(savedDraft);

      if (parsedDraft && typeof parsedDraft === 'object') {
        setFormData((prev) => ({
          ...prev,
          ...parsedDraft,
          documents: {
            ...prev.documents,
            ...(parsedDraft.documents || {}),
          },
        }));
      }
    } catch (error) {
      console.error(
        'Unable to restore admission payment draft:',
        error
      );
    }
  }, []);

  // Verify the Paystack transaction when Paystack redirects
  // the applicant back to /admission?reference=...
  useEffect(() => {
    let cancelled = false;

    async function verifyReturnedPayment() {
      if (typeof window === 'undefined') {
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const reference = params.get('reference');

      if (!reference) {
        return;
      }

      try {
        setIsProcessingPayment(true);

        const response = await fetch('/api/admissions/paystack/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reference,
          }),
        });

        const result = await response.json();

        if (cancelled) {
          return;
        }

        if (!response.ok || !result.success || !result.data) {
          throw new Error(
            result.error || 'Unable to verify your Paystack payment.'
          );
        }

        setIsPaymentProcessed(true);

        const applicationId =
          result.data.applicationId ||
          localStorage.getItem(
            'ilm_admission_application_id'
          );

        if (!applicationId) {
          throw new Error(
            'Payment was verified, but the admission application ID could not be found.'
          );
        }

        localStorage.setItem(
          'ilm_admission_application_id',
          String(applicationId)
        );

        if (result.data.applicationNumber) {
          localStorage.setItem(
            'ilm_admission_application_number',
            String(
              result.data.applicationNumber
            )
          );
        }

        localStorage.setItem(
          'ilm_admission_payment_reference',
          result.data.reference || reference
        );

        /*
         * Payment verification is NOT final application submission.
         *
         * The applicant must return to the admission form and
         * explicitly click Final Submit. Only Final Submit moves
         * the application to UNDER_REVIEW.
         *
         * Keep the applicant on the payment/review stage after
         * returning from the gateway so they can review the
         * application and explicitly submit it.
         */
        setCurrentStage(4);
        setMaxCompletedStage((previous) => Math.max(previous, 4));
        setIsPaymentReturn(false);

        // Remove the Paystack reference from the address bar after
        // successful verification so a refresh does not re-trigger it.
        const cleanUrl = `${window.location.pathname}${window.location.hash || ''}`;
        window.history.replaceState({}, document.title, cleanUrl);
      } catch (error) {
        if (!cancelled) {
          console.error(
            'Admission Paystack return verification failed:',
            error
          );

          // Verification failed (or the request itself failed) — never
          // leave the applicant stuck behind a permanent loading gate.
          // Send them back to the Fee & Payment step so they can see
          // what happened and retry.
          setIsPaymentReturn(false);
          setCurrentStage(4);
          setMaxCompletedStage((previous) => Math.max(previous, 4));

          alert(
            error?.message ||
              'We could not verify your Paystack payment. Please contact admissions if money was deducted.'
          );
        }
      } finally {
        if (!cancelled) {
          setIsProcessingPayment(false);
        }
      }
    }

    verifyReturnedPayment();

    return () => {
      cancelled = true;
    };
  }, []);

  // Verify Stripe Checkout when Stripe redirects
  // the applicant back to /admission?stripe_session_id=...
  useEffect(() => {
    let cancelled = false;

    async function verifyReturnedStripePayment() {
      if (typeof window === 'undefined') {
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get('stripe_session_id');

      if (!sessionId) {
        return;
      }

      try {
        setIsProcessingPayment(true);

        const response = await fetch(
          '/api/admissions/stripe/verify',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId,
            }),
          }
        );

        const result = await response.json();

        if (cancelled) {
          return;
        }

        if (!response.ok || !result.success || !result.data) {
          throw new Error(
            result.error ||
              'Unable to verify your Stripe payment.'
          );
        }

        setIsPaymentProcessed(true);

        const applicationId =
          result.data.applicationId ||
          localStorage.getItem(
            'ilm_admission_application_id'
          );

        if (!applicationId) {
          throw new Error(
            'Payment was verified, but the admission application ID could not be found.'
          );
        }

        localStorage.setItem(
          'ilm_admission_application_id',
          String(applicationId)
        );

        if (result.data.applicationNumber) {
          localStorage.setItem(
            'ilm_admission_application_number',
            String(
              result.data.applicationNumber
            )
          );
        }

        localStorage.setItem(
          'ilm_admission_payment_reference',
          sessionId
        );

        /*
         * Payment verification is NOT final application submission.
         *
         * The applicant must return to the admission form and
         * explicitly click Final Submit. Only Final Submit moves
         * the application to UNDER_REVIEW.
         *
         * Keep the applicant on the payment/review stage after
         * returning from the gateway so they can review the
         * application and explicitly submit it.
         */
        setCurrentStage(4);
        setMaxCompletedStage((previous) => Math.max(previous, 4));
        setIsPaymentReturn(false);

        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      } catch (error) {
        if (!cancelled) {
          console.error(
            'Admission Stripe return verification failed:',
            error
          );

          // Verification failed (or the request itself failed) — never
          // leave the applicant stuck behind a permanent loading gate.
          // Send them back to the Fee & Payment step so they can see
          // what happened and retry.
          setIsPaymentReturn(false);
          setCurrentStage(4);
          setMaxCompletedStage((previous) => Math.max(previous, 4));

          alert(
            error?.message ||
              'We could not verify your Stripe payment. Please contact admissions if money was deducted.'
          );
        }
      } finally {
        if (!cancelled) {
          setIsProcessingPayment(false);
        }
      }
    }

    verifyReturnedStripePayment();

    return () => {
      cancelled = true;
    };
  }, []);

  const initializeAdmissionPayment = async () => {
    if (isProcessingPayment || isPaymentProcessed) {
      return;
    }

    const paymentMethod = formData.paymentMethod;

    if (
      paymentMethod !== 'ADMISSION_PAYSTACK' &&
      paymentMethod !== 'STRIPE'
    ) {
      alert('Please select a valid online payment method.');
      return;
    }

    if (
      !formData.fullName ||
      !formData.email ||
      !formData.dateOfBirth ||
      !formData.countryOfResidence ||
      !formData.programId
    ) {
      alert(
        'Please complete your personal information, country of residence and programme before starting payment.'
      );
      return;
    }

    try {
      setIsProcessingPayment(true);

      const endpoint =
        paymentMethod === 'ADMISSION_PAYSTACK'
          ? '/api/admissions/paystack/initialize'
          : '/api/admissions/stripe/initialize';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          dob: formData.dateOfBirth,
          nationality: formData.nationality,
          countryOfResidence: formData.countryOfResidence,
          programId: formData.programId,
          studySession: formData.studySession,
          gender: formData.gender,
          phoneNumber: formData.phoneNumber,
          idNumber: formData.idNumber,
          residentialAddress: formData.residentialAddress,
          applicantCategory: formData.applicantCategory,
          guardianName: formData.guardianName,
          guardianPhone: formData.guardianPhone,
          guardianRelationship: formData.guardianRelationship,
          emergencyName: formData.emergencyName,
          emergencyPhone: formData.emergencyPhone,
          emergencyRelationship: formData.emergencyRelationship,
          highestEducation: formData.highestEducation,
          institutionName: formData.institutionName,
          identityDocType: formData.identityDocType,
          preferredName: formData.preferredName,
          pathwayPreference: formData.pathwayPreference,
          preferredDepartmentId: formData.preferredDepartmentId,
          specialization: formData.specialization,
          studyMode: formData.studyMode,
          islamicStudiesBackground: formData.islamicStudiesBackground,
          quranReadingSelf: formData.quranReadingSelf,
          quranTajweedSelf: formData.quranTajweedSelf,
          quranHifzSelf: formData.quranHifzSelf,
          quranRecitationSelf: formData.quranRecitationSelf,
          arabicReadingSelf: formData.arabicReadingSelf,
          arabicWritingSelf: formData.arabicWritingSelf,
          arabicGrammarSelf: formData.arabicGrammarSelf,
          arabicVocabularySelf: formData.arabicVocabularySelf,
          arabicConversationSelf: formData.arabicConversationSelf,
          quranicArabicSelf: formData.quranicArabicSelf,
          learningGoals: formData.learningGoals,
          supportNeeds: formData.supportNeeds,
          declarationAccepted: formData.declarationAccepted,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success || !result.data) {
        throw new Error(
          result.error ||
            `Unable to initialize ${
              paymentMethod === 'ADMISSION_PAYSTACK'
                ? 'Paystack'
                : 'Stripe'
            } payment.`
        );
      }

      const paymentUrl =
        result.data.authorizationUrl ||
        result.data.checkoutUrl;

      if (!paymentUrl) {
        throw new Error(
          `${
            paymentMethod === 'ADMISSION_PAYSTACK'
              ? 'Paystack'
              : 'Stripe'
          } did not return a payment URL.`
        );
      }

      const applicationId = result.data.applicationId;

      if (!applicationId) {
        throw new Error(
          'Payment was initialized, but the admission application ID is missing.'
        );
      }

      /*
       * File objects cannot survive the payment-provider redirect,
       * so upload the admission documents to R2 before leaving the site.
       */
      saveAdmissionPaymentDraft();

      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          'ilm_admission_payment_application_id',
          String(applicationId)
        );

        if (result.data.applicationNumber) {
          sessionStorage.setItem(
            'ilm_admission_payment_application_number',
            String(result.data.applicationNumber)
          );
        }
      }

      await uploadAdmissionDocuments(applicationId, result.data.applicationNumber);

      window.location.href = paymentUrl;
    } catch (error) {
      console.error(
        'Admission payment initialization failed:',
        error
      );

      alert(
        error?.message ||
          'Unable to start payment. Please try again.'
      );

      setIsProcessingPayment(false);
    }
  };

  const isStageValid = (stageNum) => {
    if (stageNum === 1) {
      return Boolean(
        formData.email &&
        formData.password &&
        formData.fullName &&
        formData.dateOfBirth &&
        formData.gender &&
        formData.gender !== 'Select Gender' &&
        formData.nationality &&
        formData.countryOfResidence &&
        formData.phoneNumber &&
        formData.idNumber &&
        formData.residentialAddress &&
        formData.applicantCategory
      );
    }

    if (stageNum === 2) {
      return Boolean(
        formData.emergencyName &&
        formData.emergencyPhone &&
        formData.emergencyRelationship &&
        formData.highestEducation &&
        formData.institutionName
      );
    }

    if (stageNum === 3) {
      const isDiploma = formData.academicProgrammeLevel === 'DIPLOMA';
      const requiredBaseDocs = Boolean(formData.documents.passportPicture) && Boolean(formData.documents.identityDocument);

      if (isDiploma) {
        return Boolean(
          requiredBaseDocs &&
          formData.documents.transcripts &&
          formData.documents.certificate &&
          formData.documents.testimonial &&
          formData.documents.recommendation &&
          formData.declarationAccepted
        );
      }
      return Boolean(requiredBaseDocs && formData.declarationAccepted);
    }

    if (stageNum === 4) {
      if (formData.paymentMethod === 'ADMISSION_PAYSTACK') {
        return isPaymentProcessed;
      }

      if (formData.paymentMethod === 'STRIPE') {
        return isPaymentProcessed;
      }

      return false;
    }

    return true;
  };

  const handleTabClick = (targetStage) => {
    if (targetStage < currentStage) {
      setCurrentStage(targetStage);
      return;
    }

    let canProceed = true;
    for (let i = 1; i < targetStage; i++) {
      if (!isStageValid(i)) {
        canProceed = false;
        break;
      }
    }

    if (canProceed) {
      setCurrentStage(targetStage);
      if (targetStage > maxCompletedStage) setMaxCompletedStage(targetStage);
    } else {
      alert(`Please complete Step ${currentStage} fully before jumping ahead.`);
    }
  };

  const nextStage = (e) => {
    e.preventDefault();
    if (!isStageValid(currentStage)) {
      alert('Please complete all required fields before moving forward.');
      return;
    }
    const nextStep = currentStage + 1;
    if (nextStep <= 4) {
      setCurrentStage(nextStep);
      if (nextStep > maxCompletedStage) setMaxCompletedStage(nextStep);
    }
  };

  const prevStage = () => {
    if (currentStage > 1) setCurrentStage(currentStage - 1);
  };

  const uploadAdmissionDocuments = async (applicationId, applicationNumber) => {
    if (!applicationId) {
      throw new Error('Admission application ID is missing.');
    }

    if (!applicationNumber) {
      throw new Error('Admission application number is missing.');
    }

    const uploadFormData = new FormData();

    uploadFormData.append(
      'applicationId',
      String(applicationId)
    );

    // Security: the server verifies this application number belongs to
    // applicationId before accepting any upload, so a guessed/leaked
    // applicationId alone can never be used to overwrite someone else's
    // admission documents.
    uploadFormData.append(
      'applicationNumber',
      String(applicationNumber)
    );

    const documentFields = [
      'identityDocument',
      'passportPicture',
      'transcripts',
      'certificate',
      'testimonial',
      'recommendation',
    ];

    let fileCount = 0;

    for (const field of documentFields) {
      const file = formData.documents[field];

      if (typeof File !== 'undefined' && file instanceof File) {
        uploadFormData.append(field, file);
        fileCount += 1;
      }
    }

    if (fileCount === 0) {
      throw new Error(
        'Please select the required admission documents before continuing.'
      );
    }

    const response = await fetch(
      '/api/admissions/documents',
      {
        method: 'POST',
        body: uploadFormData,
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.error ||
          'Unable to upload admission documents.'
      );
    }

    return result;
  };

  const submitAdmissionApplication = async (applicationId) => {
    if (!applicationId) {
      throw new Error(
        'Admission application ID is missing.'
      );
    }

    const response = await fetch(
      '/api/admissions/submit',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: String(applicationId),
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.error ||
          'Unable to submit admission application.'
      );
    }

    return result;
  };

  const saveAdmissionPaymentDraft = () => {
    if (typeof window === 'undefined') {
      return;
    }

    const draft = {
      ...formData,
      documents: {
        identityDocument: null,
        passportPicture: null,
        transcripts: null,
        certificate: null,
        testimonial: null,
        recommendation: null,
      },
    };

    sessionStorage.setItem(
      'ilm_admission_payment_draft',
      JSON.stringify(draft)
    );
  };

  const initializeAdmissionPaymentAndUpload = async ({
    initializeUrl,
    body,
    checkoutUrlFromResult,
  }) => {
    try {
      setIsProcessingPayment(true);

      const response = await fetch(
        initializeUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );

      const result = await response.json();

      if (
        !response.ok ||
        !result.success ||
        !result.data
      ) {
        throw new Error(
          result.error ||
            'Unable to initialize admission payment.'
        );
      }

      const applicationId =
        result.data.applicationId;

      if (!applicationId) {
        throw new Error(
          'Payment was initialized but no application ID was returned.'
        );
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'ilm_admission_application_id',
          String(applicationId)
        );

        if (result.data.applicationNumber) {
          localStorage.setItem(
            'ilm_admission_application_number',
            String(
              result.data.applicationNumber
            )
          );
        }

        if (result.data.reference) {
          localStorage.setItem(
            'ilm_admission_payment_reference',
            String(result.data.reference)
          );
        }

        if (result.data.sessionId) {
          localStorage.setItem(
            'ilm_admission_payment_reference',
            String(result.data.sessionId)
          );
        }
      }

      /*
       * Save the non-file portion of the form before
       * leaving the site. The actual File objects cannot
       * survive a payment-provider redirect, so upload
       * them to R2 first.
       */
      saveAdmissionPaymentDraft();

      await uploadAdmissionDocuments(
        applicationId,
        result.data.applicationNumber
      );

      const checkoutUrl =
        checkoutUrlFromResult(result.data);

      if (!checkoutUrl) {
        throw new Error(
          'Payment gateway did not return a checkout URL.'
        );
      }

      window.location.href = checkoutUrl;
    } catch (error) {
      console.error(
        'Admission payment initialization failed:',
        error
      );

      alert(
        error?.message ||
          'Unable to start payment. Please try again.'
      );

      setIsProcessingPayment(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.paymentMethod) {
      alert('Please select a payment method.');
      return;
    }

    if (
      (
        formData.paymentMethod === 'ADMISSION_PAYSTACK' ||
        formData.paymentMethod === 'STRIPE'
      ) &&
      !isPaymentProcessed
    ) {
      alert(
        'Please complete and verify your payment before submitting.'
      );
      return;
    }

    const applicationId =
      typeof window !== 'undefined'
        ? localStorage.getItem(
            'ilm_admission_application_id'
          )
        : null;

    if (!applicationId) {
      alert(
        'Your admission application could not be identified. Please contact admissions.'
      );
      return;
    }

    try {
      setIsProcessingPayment(true);

      const result =
        await submitAdmissionApplication(
          applicationId
        );

      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'ilm_student_profile',
          JSON.stringify({
            ...formData,
            documents: {
              identityDocument:
                formData.documents.identityDocument
                  ? formData.documents.identityDocument.name
                  : null,
              passportPicture:
                formData.documents.passportPicture
                  ? formData.documents.passportPicture.name
                  : null,
              transcripts:
                formData.documents.transcripts
                  ? formData.documents.transcripts.name
                  : null,
              certificate:
                formData.documents.certificate
                  ? formData.documents.certificate.name
                  : null,
              testimonial:
                formData.documents.testimonial
                  ? formData.documents.testimonial.name
                  : null,
              recommendation:
                formData.documents.recommendation
                  ? formData.documents.recommendation.name
                  : null,
            },
          })
        );

        if (
          result?.data?.applicationNumber
        ) {
          localStorage.setItem(
            'ilm_admission_application_number',
            String(
              result.data.applicationNumber
            )
          );
        }
      }

      sessionStorage.removeItem(
        'ilm_admission_payment_draft'
      );

      setSubmitted(true);
    } catch (error) {
      console.error(
        'Admission final submission failed:',
        error
      );

      alert(
        error?.message ||
          'Unable to submit your admission application.'
      );
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const commonInputStyle = {
    width: '100%',
    padding: '12px 15px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--surface)',
    color: 'var(--ink)',
    fontSize: '15px',
    boxSizing: 'border-box',
    marginTop: '6px',
  };

  const commonLabelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 'bold',
    color: 'var(--ink-soft)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  // Model 16 "Apply Now" wizard card/back-link styling.
  const wizardCardStyle = (isSelected) => ({
    textAlign: 'left',
    border: isSelected ? '2px solid var(--brand)' : '1px solid var(--border)',
    background: isSelected ? 'var(--brand-tint)' : 'var(--surface)',
    borderRadius: '14px',
    padding: '18px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: isSelected ? '0 5px 18px rgba(21, 128, 61, 0.14)' : '0 2px 8px rgba(15, 23, 42, 0.04)',
  });

  const wizardBackLinkStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '16px',
    background: 'none',
    border: 'none',
    padding: 0,
    color: 'var(--ink-soft)',
    fontSize: '13.5px',
    fontWeight: 'bold',
    cursor: 'pointer',
  };

  return (
    <div style={{ fontFamily: 'var(--font-body)', backgroundColor: 'var(--border-soft)', color: 'var(--brand)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <main style={{ maxWidth: '900px', width: '100%', margin: '60px auto', padding: '0 20px', flex: 1 }}>
        {!submitted && (
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '16px',
              color: 'var(--ink-soft)',
              fontSize: '13.5px',
              fontWeight: 'bold',
              textDecoration: 'none',
            }}
          >
            <span aria-hidden="true">←</span>
            {t('Back to Home')}
          </Link>
        )}

        <div style={{ backgroundColor: 'var(--surface)', padding: '40px 50px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '32px', color: 'var(--brand)', margin: '0 0 8px 0' }}>{t('Admission Application')}</h1>
            <p style={{ fontSize: '15px', color: 'var(--ink-soft)', margin: '0 0 18px 0' }}>
              {t('Complete your applicant profile, select programmes & pay application fees.')}
            </p>
          </div>

          {paymentCancelledNotice && !submitted && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 18px',
                borderRadius: '10px',
                border: '1px solid var(--warning)',
                backgroundColor: 'var(--warning-tint)',
                color: 'var(--warning)',
                fontSize: '14px',
                fontWeight: 'bold',
                marginBottom: '24px',
              }}
            >
              <span aria-hidden="true">⚠</span>
              <span>
                {t("Your payment was cancelled — nothing was charged. You can try again below whenever you're ready.")}
              </span>
            </div>
          )}

          {!submitted && isPaymentReturn && (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: 'var(--ink-soft)',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  margin: '0 auto 18px',
                  border: '4px solid var(--border)',
                  borderTopColor: 'var(--brand)',
                  borderRadius: '50%',
                  animation: 'ilm-admission-spin 0.8s linear infinite',
                }}
              />
              <p style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--brand)', margin: '0 0 6px' }}>
                {t('Verifying your payment…')}
              </p>
              <p style={{ fontSize: '13px', margin: 0 }}>
                {t("This only takes a few seconds. Please don't close this page.")}
              </p>
              <style jsx>{`
                @keyframes ilm-admission-spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          )}

          {!submitted && !isPaymentReturn && !wizardComplete && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '28px' }}>
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      color: step <= wizardStep ? 'var(--on-accent, #fff)' : 'var(--ink-soft)',
                      background: step <= wizardStep ? 'var(--brand)' : 'var(--border-soft)',
                      border: step === wizardStep ? '2px solid var(--gold)' : '2px solid transparent',
                    }}
                  >
                    {step}
                  </div>
                ))}
              </div>

              {wizardStep === 1 && (
                <div>
                  <h2 style={{ fontSize: '20px', color: 'var(--ink)', textAlign: 'center', margin: '0 0 6px 0', fontWeight: 'bold' }}>
                    {t('Step 1 of 3: Who Are You Applying As?')}
                  </h2>
                  <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', textAlign: 'center', margin: '0 0 26px 0' }}>
                    {t('This determines your application fee currency and payment method. You can still refine your country of residence in the application itself.')}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                    <button
                      type="button"
                      onClick={() => { setWizardResidency('RESIDENT'); setWizardStep(2); }}
                      style={wizardCardStyle(wizardResidency === 'RESIDENT')}
                    >
                      <div style={{ fontSize: '28px', marginBottom: '10px' }} aria-hidden="true">🇬🇭</div>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--brand)', marginBottom: '6px' }}>
                        {t('New Student — Resident')}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>
                        {t('Living in Ghana. Application fee is charged in GHS via Mobile Money or card.')}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setWizardResidency('INTERNATIONAL'); setWizardStep(2); }}
                      style={wizardCardStyle(wizardResidency === 'INTERNATIONAL')}
                    >
                      <div style={{ fontSize: '28px', marginBottom: '10px' }} aria-hidden="true">🌍</div>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--brand)', marginBottom: '6px' }}>
                        {t('New Student — International')}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>
                        {t('Living outside Ghana. Application fee is charged in USD by card.')}
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div>
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    style={wizardBackLinkStyle}
                  >
                    ← {t('Back')}
                  </button>

                  <h2 style={{ fontSize: '20px', color: 'var(--ink)', textAlign: 'center', margin: '0 0 6px 0', fontWeight: 'bold' }}>
                    {t('Step 2 of 3: Choose Your Programme')}
                  </h2>
                  <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', textAlign: 'center', margin: '0 0 26px 0' }}>
                    {t('These are the programmes currently open for admission.')}
                  </p>

                  {programmesLoading && (
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', color: 'var(--ink-soft)', fontSize: '13px', textAlign: 'center' }}>
                      {t('Loading academic programmes...')}
                    </div>
                  )}

                  {programmesError && (
                    <div style={{ background: 'var(--danger-tint)', border: '1px solid var(--danger-tint)', borderRadius: '12px', padding: '12px 14px', color: 'var(--danger)', fontSize: '13px', marginBottom: '12px' }}>
                      {programmesError}
                    </div>
                  )}

                  {!programmesLoading && !programmesError && activeProgrammes.length === 0 && (
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', color: 'var(--ink-soft)', fontSize: '13px', textAlign: 'center' }}>
                      {t('No programmes are currently open for admission. Please check back soon.')}
                    </div>
                  )}

                  {!programmesLoading && !programmesError && activeProgrammes.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                      {activeProgrammes.map((programme) => (
                        <button
                          key={programme.id}
                          type="button"
                          onClick={() => { setWizardProgramId(programme.id); setWizardStep(3); }}
                          style={wizardCardStyle(wizardProgramId === programme.id)}
                        >
                          <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--brand)', marginBottom: '6px' }}>
                            {programmeDisplayName(programme.name)}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                            {programme.level}{programme.duration ? ` · ${programme.duration}` : ''}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {wizardStep === 3 && (
                <div>
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    style={wizardBackLinkStyle}
                  >
                    ← {t('Back')}
                  </button>

                  <h2 style={{ fontSize: '20px', color: 'var(--ink)', textAlign: 'center', margin: '0 0 6px 0', fontWeight: 'bold' }}>
                    {t('Step 3 of 3: Ready to Apply')}
                  </h2>
                  <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', textAlign: 'center', margin: '0 0 26px 0' }}>
                    {t("Here's what you told us. You can change your specific country and programme details inside the application.")}
                  </p>

                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '22px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-soft)' }}>
                      <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-soft)', fontWeight: 'bold' }}>
                        {t('Applying as')}
                      </span>
                      <strong style={{ color: 'var(--ink)' }}>
                        {wizardResidency === 'RESIDENT'
                          ? `🇬🇭 ${t('New Student — Resident')}`
                          : `🌍 ${t('New Student — International')}`}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                      <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-soft)', fontWeight: 'bold' }}>
                        {t('Programme')}
                      </span>
                      <strong style={{ color: 'var(--ink)', textAlign: 'right' }}>
                        {wizardSelectedProgramme ? programmeDisplayName(wizardSelectedProgramme.name) : '—'}
                      </strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={restartWizard}
                      style={{ padding: '12px 26px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--ink-soft)', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}
                    >
                      {t('Start Over')}
                    </button>
                    <button
                      type="button"
                      disabled={!wizardResidency || !wizardProgramId}
                      onClick={startApplicationFromWizard}
                      style={{
                        padding: '12px 32px',
                        borderRadius: '10px',
                        border: 'none',
                        background: (!wizardResidency || !wizardProgramId) ? 'var(--border)' : 'var(--brand)',
                        color: 'var(--on-accent, #fff)',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        cursor: (!wizardResidency || !wizardProgramId) ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {t('Go to Application →')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {!submitted && !isPaymentReturn && wizardComplete && (
            <>
              {/* Stepper navigation bar */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '40px' }}>
                {[t('1. Account & Personal'), t('2. Contacts & Education'), t('3. Programme & Session'), t('4. Fee & Payment')].map((step, idx) => {
                  const stepNum = idx + 1;
                  const isActive = currentStage === stepNum;
                  // Only show green if completed, gray otherwise until filled
                  const isCompleted = isStageValid(stepNum);

                  return (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => handleTabClick(stepNum)}
                      style={{ 
                        flex: 1, 
                        background: 'none',
                        border: 'none',
                        textTransform: 'uppercase', 
                        fontSize: '12px', 
                        fontWeight: 'bold', 
                        letterSpacing: '0.05em', 
                        color: isActive ? 'var(--success)' : isCompleted ? 'var(--success)' : 'var(--ink-soft)', 
                        textAlign: 'center', 
                        padding: '15px 0', 
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'color 0.2s ease'
                      }}
                    >
                      {step} {isCompleted && stepNum < currentStage && t('(Done)')}
                      {isActive && (
                        <div style={{ position: 'absolute', bottom: -1, left: '10%', width: '80%', height: '3px', backgroundColor: 'var(--success)', borderRadius: '3px' }}></div>
                      )}
                    </button>
                  );
                })}
              </div>

              <h2 style={{ fontSize: '18px', color: 'var(--ink)', margin: '0 0 25px 0', fontWeight: 'bold' }}>
                {currentStage === 1 && t("Step 1: Account & Personal Details")}
                {currentStage === 2 && t("Step 2: Contacts & Education Background")}
                {currentStage === 3 && t("Step 3: Programme, Session & Document Uploads")}
                {currentStage === 4 && t("Step 4: Application Fee & Payment")}
              </h2>

              <form onSubmit={currentStage === 4 ? handleSubmit : nextStage} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* STAGE 1: Account & Personal */}
                {currentStage === 1 && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <label style={commonLabelStyle}>{t('Email Address *')}</label>
                        <input
                          type="email"
                          name="email"
                          id="applicant-email"
                          autoComplete="off"
                          required
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              email: e.target.value,
                            })
                          }
                          placeholder={t('Enter your email address')}
                          style={{
                            ...commonInputStyle,
                            backgroundColor: 'var(--info-tint)',
                            border: '1px solid var(--info-tint)',
                          }}
                        />
                      </div>
                      <div>
                        <label style={commonLabelStyle}>{t('Password *')}</label>
                        <input
                          type="password"
                          name="admission-password"
                          autoComplete="new-password"
                          required
                          value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} style={{...commonInputStyle, backgroundColor: 'var(--info-tint)', border: '1px solid var(--info-tint)'}} />
                      </div>
                    </div>
                    
                    <div>
                      <label style={commonLabelStyle}>{t('Full Name *')}</label>
                      <input type="text" required placeholder={t('Enter full legal name...')} value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} style={commonInputStyle} />
                    </div>

                    <div>
                      <label style={commonLabelStyle}>{t('Preferred Name')}</label>
                      <input type="text" placeholder={t('What you\'d like to be called, if different from your legal name')} value={formData.preferredName} onChange={(e) => setFormData({...formData, preferredName: e.target.value})} style={commonInputStyle} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <label style={commonLabelStyle}>{t('Date of Birth *')}</label>
                        <input type="date" required value={formData.dateOfBirth} onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} style={commonInputStyle} />
                      </div>
                      <div>
                        <label style={commonLabelStyle}>{t('Gender *')}</label>
                        <select required value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} style={commonInputStyle}>
                          <option value="">{t('Select Gender')}</option>
                          <option value="Male">{t('Male')}</option>
                          <option value="Female">{t('Female')}</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <label style={commonLabelStyle}>{t('Nationality *')}</label>
                        <select required value={formData.nationality} onChange={(e) => setFormData({...formData, nationality: e.target.value})} style={commonInputStyle}>
                          {countryList.map((c, i) => <option key={i} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={commonLabelStyle}>{t('Country of Residence *')}</label>
                        <select required value={formData.countryOfResidence} onChange={(e) => setFormData({...formData, countryOfResidence: e.target.value})} style={commonInputStyle}>
                          {!formData.countryOfResidence && (
                            <option value="" disabled>{t('-- Select your country --')}</option>
                          )}
                          {countryList.map((c, i) => <option key={i} value={c}>{c}</option>)}
                        </select>
                        {wizardResidency === 'INTERNATIONAL' && !formData.countryOfResidence && (
                          <p style={{ fontSize: '12px', color: 'var(--gold-dark)', margin: '6px 0 0' }}>
                            {t('You told us you are applying as an International student -- please select your specific country.')}
                          </p>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <label style={commonLabelStyle}>{t('Phone Number *')}</label>
                        <input type="tel" required placeholder="+..." value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} style={commonInputStyle} />
                      </div>
                      <div>
                        <label style={commonLabelStyle}>{t('Passport / ID Number *')}</label>
                        <input type="text" required value={formData.idNumber} onChange={(e) => setFormData({...formData, idNumber: e.target.value})} style={commonInputStyle} />
                      </div>
                    </div>

                    <div>
                      <label style={commonLabelStyle}>{t('Residential Address *')}</label>
                      <textarea rows="3" required value={formData.residentialAddress} onChange={(e) => setFormData({...formData, residentialAddress: e.target.value})} style={{...commonInputStyle, resize: 'none'}} />
                    </div>

                    <div>
                      <label style={commonLabelStyle}>{t('Applicant Classification *')}</label>
                      <select required value={formData.applicantCategory} onChange={(e) => setFormData({...formData, applicantCategory: e.target.value})} style={{...commonInputStyle, border: '1px solid var(--success)', fontWeight: 'bold'}}>
                        <option value="Junior Learner (4-13 years)">{t('Junior Learner (4-13 years)')}</option>
                        <option value="Senior Learner (15-20 years)">{t('Senior Learner (15-20 years)')}</option>
                        <option value="Mature Learner (21 years and above)">{t('Mature Learner (21 years and above)')}</option>
                      </select>
                    </div>
                  </>
                )}

                {/* STAGE 2: Contacts & Education */}
                {currentStage === 2 && (
                  <>
                    <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--ink-soft)', fontWeight: 'bold', margin: '0 0 10px 0', letterSpacing: '0.05em' }}>
                      {t('Parent / Guardian Details')}
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr', gap: '15px' }}>
                      <input type="text" placeholder={t('Guardian Name')} value={formData.guardianName} onChange={(e) => setFormData({...formData, guardianName: e.target.value})} style={commonInputStyle} />
                      <input type="tel" placeholder={t('Guardian Phone')} value={formData.guardianPhone} onChange={(e) => setFormData({...formData, guardianPhone: e.target.value})} style={commonInputStyle} />
                      <select value={formData.guardianRelationship} onChange={(e) => setFormData({...formData, guardianRelationship: e.target.value})} style={commonInputStyle}>
                        <option value="Father">{t('Father')}</option>
                        <option value="Mother">{t('Mother')}</option>
                        <option value="Spouse">{t('Spouse')}</option>
                        <option value="Guardian">{t('Guardian')}</option>
                        <option value="Relative">{t('Relative')}</option>
                        <option value="Other">{t('Other')}</option>
                      </select>
                    </div>

                    <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--ink-soft)', fontWeight: 'bold', margin: '20px 0 10px 0', letterSpacing: '0.05em' }}>
                      {t('Emergency Contact *')}
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr', gap: '15px' }}>
                      <input type="text" placeholder={t('Name *')} required value={formData.emergencyName} onChange={(e) => setFormData({...formData, emergencyName: e.target.value})} style={commonInputStyle} />
                      <input type="tel" placeholder={t('Phone *')} required value={formData.emergencyPhone} onChange={(e) => setFormData({...formData, emergencyPhone: e.target.value})} style={commonInputStyle} />
                      <select required value={formData.emergencyRelationship} onChange={(e) => setFormData({...formData, emergencyRelationship: e.target.value})} style={commonInputStyle}>
                        <option value="Father">{t('Father')}</option>
                        <option value="Mother">{t('Mother')}</option>
                        <option value="Spouse">{t('Spouse')}</option>
                        <option value="Guardian">{t('Guardian')}</option>
                        <option value="Relative">{t('Relative')}</option>
                        <option value="Other">{t('Other')}</option>
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                      <div>
                        <label style={commonLabelStyle}>{t('Highest Education Level *')}</label>
                        <select required value={formData.highestEducation} onChange={(e) => setFormData({...formData, highestEducation: e.target.value})} style={commonInputStyle}>
                          <option value="High School">{t('High School')}</option>
                          <option value="Diploma">{t('Diploma')}</option>
                          <option value="Bachelor Degree">{t('Bachelor Degree')}</option>
                          <option value="Master Degree">{t('Master Degree')}</option>
                          <option value="Doctorate">{t('Doctorate')}</option>
                          <option value="Other">{t('Other')}</option>
                        </select>
                      </div>
                      <div>
                        <label style={commonLabelStyle}>{t('Institution Name *')}</label>
                        <input type="text" required value={formData.institutionName} onChange={(e) => setFormData({...formData, institutionName: e.target.value})} style={commonInputStyle} />
                      </div>
                    </div>

                    <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--ink-soft)', fontWeight: 'bold', margin: '20px 0 10px 0', letterSpacing: '0.05em' }}>
                      {t('Islamic Studies & Placement Background')}
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--ink-soft)', margin: '0 0 15px 0' }}>
                      {t('Your own account of your current level — used as a starting point for the placement assessment that follows admission, not as the placement result itself.')}
                    </p>

                    <div>
                      <label style={commonLabelStyle}>{t('Islamic Studies Background')}</label>
                      <textarea rows="3" placeholder={t('Any prior Islamic education, self-study, or memorization — in your own words')} value={formData.islamicStudiesBackground} onChange={(e) => setFormData({...formData, islamicStudiesBackground: e.target.value})} style={{...commonInputStyle, resize: 'none'}} />
                    </div>

                    <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--ink-soft)', fontWeight: 'bold', margin: '18px 0 10px 0', letterSpacing: '0.05em' }}>
                      {t("Qur'an")}
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      {renderSelfLevelField('Reading', 'quranReadingSelf')}
                      {renderSelfLevelField('Tajweed', 'quranTajweedSelf')}
                      {renderSelfLevelField('Hifz (memorization)', 'quranHifzSelf')}
                      {renderSelfLevelField('Recitation', 'quranRecitationSelf')}
                    </div>

                    <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--ink-soft)', fontWeight: 'bold', margin: '18px 0 10px 0', letterSpacing: '0.05em' }}>
                      {t('Arabic')}
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      {renderSelfLevelField('Reading', 'arabicReadingSelf')}
                      {renderSelfLevelField('Writing', 'arabicWritingSelf')}
                      {renderSelfLevelField('Grammar', 'arabicGrammarSelf')}
                      {renderSelfLevelField('Vocabulary', 'arabicVocabularySelf')}
                      {renderSelfLevelField('Conversation', 'arabicConversationSelf')}
                      {renderSelfLevelField("Qur'anic Arabic", 'quranicArabicSelf')}
                    </div>

                    <div style={{ marginTop: '18px' }}>
                      <label style={commonLabelStyle}>{t('Learning Goals')}</label>
                      <textarea rows="2" placeholder={t('What are you hoping to achieve by studying here?')} value={formData.learningGoals} onChange={(e) => setFormData({...formData, learningGoals: e.target.value})} style={{...commonInputStyle, resize: 'none'}} />
                    </div>

                    <div>
                      <label style={commonLabelStyle}>{t('Accessibility / Support Needs')}</label>
                      <textarea rows="2" placeholder={t('Anything the Academy should know to support your learning (optional)')} value={formData.supportNeeds} onChange={(e) => setFormData({...formData, supportNeeds: e.target.value})} style={{...commonInputStyle, resize: 'none'}} />
                    </div>
                  </>
                )}

                {/* STAGE 3: Programme, Session & Document Uploads */}
                {currentStage === 3 && (
                  <>
                    <div
                      style={{
                        background: 'linear-gradient(135deg, var(--brand-tint) 0%, var(--surface) 55%, var(--warning-tint) 100%)',
                        border: '1px solid var(--success-tint)',
                        borderRadius: '18px',
                        padding: '22px',
                        marginBottom: '22px',
                        boxShadow: '0 8px 25px rgba(20, 83, 45, 0.07)',
                      }}
                    >
                      <div style={{ marginBottom: '18px' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: '7px',
                          }}
                        >
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '12px',
                              background: 'var(--brand)',
                              color: 'var(--warning)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '18px',
                              fontWeight: '800',
                            }}
                          >
                            🎓
                          </div>

                          <div>
                            <h3
                              style={{
                                margin: 0,
                                color: 'var(--brand)',
                                fontSize: '20px',
                                fontWeight: '800',
                              }}
                            >
                              {t('Choose Your Academic Programme')}
                            </h3>

                            <p
                              style={{
                                margin: '4px 0 0',
                                color: 'var(--ink-soft)',
                                fontSize: '13px',
                              }}
                            >
                              {t('Select the programme you wish to apply for.')}
                            </p>
                          </div>
                        </div>

                        {programmesLoading && (
                          <div
                            style={{
                              background: 'var(--surface)',
                              border: '1px solid var(--border)',
                              borderRadius: '12px',
                              padding: '16px',
                              color: 'var(--ink-soft)',
                              fontSize: '13px',
                            }}
                          >
                            {t('Loading academic programmes...')}
                          </div>
                        )}

                        {programmesError && (
                          <div
                            style={{
                              background: 'var(--danger-tint)',
                              border: '1px solid var(--danger-tint)',
                              borderRadius: '12px',
                              padding: '12px 14px',
                              color: 'var(--danger)',
                              fontSize: '13px',
                              marginBottom: '12px',
                            }}
                          >
                            {programmesError}
                          </div>
                        )}

                        {!programmesLoading && !programmesError && (
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                              gap: '12px',
                            }}
                          >
                            {activeProgrammes.map((programme) => {
                              const isSelected = formData.programId === programme.id;

                              return (
                                <button
                                  key={programme.id}
                                  type="button"
                                  onClick={() =>
                                    setFormData({
                                      ...formData,
                                      programId: programme.id,
                                      academicProgramme: programme.name,
                                      academicProgrammeLevel: programme.level,
                                    })
                                  }
                                  style={{
                                    textAlign: 'left',
                                    border: isSelected
                                      ? '2px solid var(--brand)'
                                      : '1px solid var(--border)',
                                    background: isSelected ? 'var(--brand-tint)' : 'var(--surface)',
                                    borderRadius: '14px',
                                    padding: '16px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: isSelected
                                      ? '0 5px 18px rgba(21, 128, 61, 0.14)'
                                      : '0 2px 8px rgba(15, 23, 42, 0.04)',
                                  }}
                                >
                                  <div
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'flex-start',
                                      gap: '10px',
                                    }}
                                  >
                                    <div>
                                      <div
                                        style={{
                                          color: 'var(--brand)',
                                          fontSize: '15px',
                                          fontWeight: '800',
                                          lineHeight: 1.35,
                                        }}
                                      >
                                        {programmeDisplayName(programme.name)}
                                      </div>

                                      <div
                                        style={{
                                          display: 'flex',
                                          gap: '7px',
                                          flexWrap: 'wrap',
                                          marginTop: '9px',
                                        }}
                                      >
                                        <span
                                          style={{
                                            background: 'var(--success-tint)',
                                            color: 'var(--brand-light)',
                                            borderRadius: '999px',
                                            padding: '4px 8px',
                                            fontSize: '11px',
                                            fontWeight: '700',
                                          }}
                                        >
                                          {programme.level}
                                        </span>

                                        <span
                                          style={{
                                            background: 'var(--warning-tint)',
                                            color: 'var(--warning)',
                                            borderRadius: '999px',
                                            padding: '4px 8px',
                                            fontSize: '11px',
                                            fontWeight: '700',
                                          }}
                                        >
                                          {programme.duration}
                                        </span>
                                      </div>
                                    </div>

                                    <div
                                      style={{
                                        width: '23px',
                                        height: '23px',
                                        minWidth: '23px',
                                        borderRadius: '50%',
                                        border: isSelected
                                          ? '6px solid var(--brand)'
                                          : '2px solid var(--border)',
                                        background: 'var(--surface)',
                                      }}
                                    />
                                  </div>

                                  <p
                                    style={{
                                      margin: '12px 0 0',
                                      color: 'var(--ink-soft)',
                                      fontSize: '12px',
                                      lineHeight: 1.55,
                                    }}
                                  >
                                    {programme.description}
                                  </p>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        <input
                          type="hidden"
                          name="programId"
                          value={formData.programId}
                          required
                        />

                        {!formData.programId && !programmesLoading && (
                          <p
                            style={{
                              margin: '12px 0 0',
                              color: 'var(--warning)',
                              fontSize: '12px',
                              fontWeight: '600',
                            }}
                          >
                            {t('Please select an academic programme to continue.')}
                          </p>
                        )}
                      </div>

                      {selectedProgramme && (
                        <div
                          style={{
                            marginTop: '16px',
                            padding: '14px 16px',
                            background: 'var(--brand)',
                            color: 'var(--on-accent)',
                            borderRadius: '12px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '12px',
                            flexWrap: 'wrap',
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: '10px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                color: 'var(--success-tint)',
                                fontWeight: '700',
                              }}
                            >
                              {t('Selected Programme')}
                            </div>

                            <div
                              style={{
                                fontSize: '15px',
                                fontWeight: '800',
                                marginTop: '3px',
                              }}
                            >
                              {selectedProgramme.name}
                            </div>
                          </div>

                          <div
                            style={{
                              color: 'var(--warning)',
                              fontSize: '12px',
                              fontWeight: '700',
                            }}
                          >
                            {selectedProgramme.id}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label style={commonLabelStyle}>{t('Select Study Session *')}</label>
                      <select required value={formData.studySession} onChange={(e) => setFormData({...formData, studySession: e.target.value})} style={commonInputStyle}>
                        <option value="Morning Session">{t('Morning Session')}</option>
                        <option value="Evening Session">{t('Evening Session')}</option>
                        <option value="Weekend Session">{t('Weekend Session')}</option>
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <label style={commonLabelStyle}>{t('Pathway Preference')}</label>
                        <select value={formData.pathwayPreference} onChange={(e) => setFormData({...formData, pathwayPreference: e.target.value})} style={commonInputStyle}>
                          <option value="">{t("Not sure — let placement decide")}</option>
                          {PATHWAY_OPTIONS.map((p) => <option key={p} value={p}>{t(p)}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={commonLabelStyle}>{t('Preferred Department')}</label>
                        <select value={formData.preferredDepartmentId} onChange={(e) => setFormData({...formData, preferredDepartmentId: e.target.value})} style={commonInputStyle}>
                          <option value="">{t('No preference')}</option>
                          {departmentOptions.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <label style={commonLabelStyle}>{t('Specialization (if any)')}</label>
                        <input type="text" placeholder={t('e.g. a specific area of interest within your pathway')} value={formData.specialization} onChange={(e) => setFormData({...formData, specialization: e.target.value})} style={commonInputStyle} />
                      </div>
                      <div>
                        <label style={commonLabelStyle}>{t('Study Mode')}</label>
                        <select value={formData.studyMode} onChange={(e) => setFormData({...formData, studyMode: e.target.value})} style={commonInputStyle}>
                          <option value="">{t('Select study mode')}</option>
                          <option value="FULL_TIME">{t('Full-time')}</option>
                          <option value="PART_TIME">{t('Part-time')}</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: '10px' }}>
                      <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--brand)', fontWeight: 'bold', margin: '0 0 5px 0', letterSpacing: '0.05em' }}>
                        {t('Required Document Uploads')}
                      </h4>
                      <p style={{ fontSize: '12px', color: 'var(--ink-soft)', margin: '0 0 15px 0' }}>
                        {formData.academicProgrammeLevel === 'DIPLOMA'
                          ? t('Diploma applicants must provide all supporting academic and identification documents.')
                          : t('Please upload identity and passport photos to proceed.')}
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                          <div>
                            <label style={commonLabelStyle}>{t('Select Official Identity Doc *')}</label>
                            <select value={formData.identityDocType} onChange={(e) => setFormData({...formData, identityDocType: e.target.value})} style={commonInputStyle}>
                              <option value="Ghana Card">{t('Ghana Card')}</option>
                              <option value="National Identification Card">{t('National Identification Card')}</option>
                              <option value="Green Card">{t('Green Card')}</option>
                              <option value="International Passport">{t('International Passport')}</option>
                              <option value="Birth Certificate">{t('Birth Certificate')}</option>
                            </select>
                          </div>
                          <div>
                            <label style={commonLabelStyle}>{t('Upload')} {formData.identityDocType} *</label>
                            <input type="file" required onChange={(e) => handleFileChange('identityDocument', e.target.files[0])} style={commonInputStyle} />
                          </div>
                        </div>

                        <div>
                          <label style={commonLabelStyle}>{t('Passport Picture *')}</label>
                          <input type="file" required accept="image/*" onChange={(e) => handleFileChange('passportPicture', e.target.files[0])} style={commonInputStyle} />
                        </div>

                        {formData.academicProgrammeLevel === 'DIPLOMA' && (
                          <>
                            <div>
                              <label style={commonLabelStyle}>{t('Transcripts *')}</label>
                              <input type="file" required onChange={(e) => handleFileChange('transcripts', e.target.files[0])} style={commonInputStyle} />
                            </div>

                            <div>
                              <label style={commonLabelStyle}>{t('Certificate *')}</label>
                              <input type="file" required onChange={(e) => handleFileChange('certificate', e.target.files[0])} style={commonInputStyle} />
                            </div>

                            <div>
                              <label style={commonLabelStyle}>{t('Testimonial *')}</label>
                              <input type="file" required onChange={(e) => handleFileChange('testimonial', e.target.files[0])} style={commonInputStyle} />
                            </div>

                            <div>
                              <label style={commonLabelStyle}>{t('Recommendation Letter *')}</label>
                              <input type="file" required onChange={(e) => handleFileChange('recommendation', e.target.files[0])} style={commonInputStyle} />
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: '10px' }}>
                      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: 'var(--ink)', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          required
                          checked={formData.declarationAccepted}
                          onChange={(e) => setFormData({...formData, declarationAccepted: e.target.checked})}
                          style={{ marginTop: '3px' }}
                        />
                        <span>
                          {t('I declare that the information provided in this application is accurate and complete to the best of my knowledge, and I understand that any document or document upload may be verified. *')}
                        </span>
                      </label>
                    </div>
                  </>
                )}

                {/* STAGE 4: Fee & Payment Gateway */}
                {currentStage === 4 && (
                  <>
                    <div
                      style={{
                        backgroundColor: 'var(--brand-tint)',
                        padding: '25px',
                        borderRadius: '12px',
                        border: '1px solid var(--success-tint)',
                        textAlign: 'center',
                      }}
                    >
                      <span
                        style={{
                          textTransform: 'uppercase',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          color: 'var(--brand-light)',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {t('Auto-Calculated Application Fee')}
                      </span>

                      <div
                        style={{
                          fontSize: '42px',
                          color: 'var(--brand)',
                          fontWeight: 'bold',
                          margin: '10px 0',
                        }}
                      >
                        {formData.calculatedFee}
                      </div>

                      <p
                        style={{
                          fontSize: '13px',
                          color: 'var(--ink-soft)',
                          margin: 0,
                        }}
                      >
                        {formData.feeBase} - {formData.applicantCategory}.
                      </p>
                    </div>

                    <div
                      style={{
                        backgroundColor: 'var(--paper)',
                        padding: '20px',
                        borderRadius: '10px',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <h4
                        style={{
                          fontSize: '13px',
                          textTransform: 'uppercase',
                          color: 'var(--ink)',
                          fontWeight: 'bold',
                          margin: '0 0 8px 0',
                        }}
                      >
                        {t('Payment Method')}
                      </h4>

                      <p
                        style={{
                          fontSize: '13px',
                          color: 'var(--ink-soft)',
                          margin: '0 0 15px 0',
                        }}
                      >
                        {t('Choose how you would like to pay your application fee.')}
                      </p>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '15px',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              paymentMethod: 'ADMISSION_PAYSTACK',
                            })
                          }
                          style={{
                            padding: '16px',
                            borderRadius: '8px',
                            border:
                              formData.paymentMethod === 'ADMISSION_PAYSTACK'
                                ? '2px solid var(--success)'
                                : '1px solid var(--border)',
                            backgroundColor:
                              formData.paymentMethod === 'ADMISSION_PAYSTACK'
                                ? 'var(--brand-tint)'
                                : 'var(--surface)',
                            color: 'var(--brand)',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                          }}
                        >
                          {t('Pay with Paystack')}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              paymentMethod: 'STRIPE',
                            })
                          }
                          style={{
                            padding: '16px',
                            borderRadius: '8px',
                            border:
                              formData.paymentMethod === 'STRIPE'
                                ? '2px solid var(--success)'
                                : '1px solid var(--border)',
                            backgroundColor:
                              formData.paymentMethod === 'STRIPE'
                                ? 'var(--brand-tint)'
                                : 'var(--surface)',
                            color: 'var(--brand)',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                          }}
                        >
                          {t('Stripe Payment')}
                        </button>
                      </div>
                    </div>

                    {formData.paymentMethod === 'ADMISSION_PAYSTACK' && (
                      <div
                        style={{
                          backgroundColor: 'var(--info-tint)',
                          padding: '20px',
                          borderRadius: '10px',
                          border: '1px solid var(--info-tint)',
                        }}
                      >
                        <h4
                          style={{
                            fontSize: '14px',
                            color: 'var(--info)',
                            fontWeight: 'bold',
                            margin: '0 0 8px 0',
                          }}
                        >
                          {t('Paystack Payment')}
                        </h4>

                        <p
                          style={{
                            fontSize: '13px',
                            color: 'var(--ink-soft)',
                            margin: '0 0 15px 0',
                          }}
                        >
                          {t('You will be securely redirected to Paystack to complete your application fee payment.')}
                        </p>

                        <button
                          type="button"
                          onClick={initializeAdmissionPayment}
                          disabled={isProcessingPayment}
                          style={{
                            width: '100%',
                            padding: '13px',
                            backgroundColor: isProcessingPayment
                              ? 'var(--ink-soft)'
                              : 'var(--info)',
                            color: 'var(--on-accent)',
                            border: 'none',
                            borderRadius: '7px',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            cursor: isProcessingPayment
                              ? 'not-allowed'
                              : 'pointer',
                          }}
                        >
                          {isProcessingPayment
                            ? t('Preparing Payment...')
                            : `${t('Pay')} ${formData.calculatedFee} ${t('with Paystack')}`}
                        </button>
                      </div>
                    )}

                    {formData.paymentMethod === 'STRIPE' && (
                      <div
                        style={{
                          backgroundColor: 'var(--warning-tint)',
                          padding: '20px',
                          borderRadius: '10px',
                          border: '1px solid var(--warning-tint)',
                        }}
                      >
                        <h4
                          style={{
                            fontSize: '14px',
                            color: 'var(--warning)',
                            fontWeight: 'bold',
                            margin: '0 0 8px 0',
                          }}
                        >
                          {t('Stripe Payment')}
                        </h4>

                        <p
                          style={{
                            fontSize: '13px',
                            color: 'var(--ink-soft)',
                            margin: '0 0 15px 0',
                          }}
                        >
                          {t('Pay your application fee securely through Stripe. You will be redirected to Stripe Checkout to complete your payment.')}
                        </p>

                        <button
                          type="button"
                          onClick={initializeAdmissionPayment}
                          disabled={isProcessingPayment || isPaymentProcessed}
                          style={{
                            width: '100%',
                            padding: '13px',
                            backgroundColor:
                              isProcessingPayment || isPaymentProcessed
                                ? 'var(--ink-soft)'
                                : '#635bff',
                            color: 'var(--on-accent)',
                            border: 'none',
                            borderRadius: '7px',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            cursor:
                              isProcessingPayment || isPaymentProcessed
                                ? 'not-allowed'
                                : 'pointer',
                          }}
                        >
                          {isProcessingPayment
                            ? t('Preparing Stripe Payment...')
                            : isPaymentProcessed
                              ? t('Payment Verified')
                              : `${t('Pay')} ${formData.calculatedFee} ${t('with Stripe')}`}
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* Action Controls */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px', gap: '15px' }}>
                  {currentStage > 1 && (
                    <button type="button" onClick={prevStage} style={{ 
                      width: '200px', padding: '14px', backgroundColor: 'var(--border-soft)', color: 'var(--brand)', 
                      border: '1px solid var(--border)', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' 
                    }}>
                      {t('<- Back')}
                    </button>
                  )}

                  <button 
                    type="submit"
                    disabled={!isStageValid(currentStage)}
                    style={{ 
                      width: currentStage === 1 ? '100%' : '300px', 
                      padding: '14px', 
                      backgroundColor: !isStageValid(currentStage) ? 'var(--ink-soft)' : 'var(--success)', 
                      color: 'var(--on-accent)', 
                      border: 'none', 
                      borderRadius: '8px', 
                      fontWeight: 'bold', 
                      fontSize: '15px', 
                      cursor: !isStageValid(currentStage) ? 'not-allowed' : 'pointer',
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    {currentStage === 1 && t("Next: Contacts & Education ->")}
                    {currentStage === 2 && t("Next: Programme & Session ->")}
                    {currentStage === 3 && t("Next: Fee & Payment ->")}
                    {currentStage === 4 && (isPaymentProcessed ? t("Submit Application & Complete") : t("Complete Payment First to Submit"))}
                  </button>
                </div>

              </form>
            </>
          )}

          {submitted && (
            <div style={{ padding: '10px 0' }}>
              <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>✅</div>

                <h3
                  style={{
                    color: 'var(--brand)',
                    fontSize: '24px',
                    margin: '0 0 10px 0',
                  }}
                >
                  {t('Application Submitted Successfully!')}
                </h3>

                <p
                  style={{
                    color: 'var(--ink-soft)',
                    fontSize: '15px',
                    margin: 0,
                  }}
                >
                  {t('Thank you,')}{' '}
                  <strong>{formData.fullName || t('Applicant')}</strong>. {t('admission application has been recorded successfully.')}
                </p>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--paper)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '25px',
                  marginBottom: '30px',
                }}
              >
                <h4
                  style={{
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    color: 'var(--brand)',
                    borderBottom: '2px solid var(--border)',
                    paddingBottom: '10px',
                    marginTop: 0,
                    marginBottom: '15px',
                    letterSpacing: '0.05em',
                  }}
                >
                  {t('Official Admission & Payment Summary Report')}
                </h4>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '15px',
                    fontSize: '14px',
                    color: 'var(--ink-soft)',
                  }}
                >
                  <div>
                    <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--ink-soft)', fontWeight: 'bold' }}>
                      {t('Applicant Full Name')}
                    </span>
                    <strong>{formData.fullName}</strong>
                  </div>

                  <div>
                    <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--ink-soft)', fontWeight: 'bold' }}>
                      {t('Email Address')}
                    </span>
                    <strong>{formData.email}</strong>
                  </div>

                  <div>
                    <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--ink-soft)', fontWeight: 'bold' }}>
                      {t('Selected Programme')}
                    </span>
                    <strong style={{ color: 'var(--success)' }}>
                      {formData.academicProgramme}
                    </strong>
                  </div>

                  <div>
                    <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--ink-soft)', fontWeight: 'bold' }}>
                      {t('Study Session')}
                    </span>
                    <strong>{formData.studySession}</strong>
                  </div>

                  <div>
                    <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--ink-soft)', fontWeight: 'bold' }}>
                      {t('Applicant Classification')}
                    </span>
                    <strong>{formData.applicantCategory}</strong>
                  </div>

                  <div>
                    <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--ink-soft)', fontWeight: 'bold' }}>
                      {t('Country of Residence')}
                    </span>
                    <strong>{formData.countryOfResidence}</strong>
                  </div>

                  <div>
                    <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--ink-soft)', fontWeight: 'bold' }}>
                      {t('Payment Method')}
                    </span>
                    <strong>
                      {formData.paymentMethod === 'ADMISSION_PAYSTACK'
                        ? t('Paystack')
                        : formData.paymentMethod === 'STRIPE'
                          ? t('Stripe')
                          : formData.paymentMethod}
                    </strong>
                  </div>

                  <div>
                    <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--ink-soft)', fontWeight: 'bold' }}>
                      {t('Application Fee')}
                    </span>
                    <strong
                      style={{
                        color: 'var(--info)',
                        fontSize: '16px',
                      }}
                    >
                      {formData.calculatedFee} ({formData.feeBase})
                    </strong>
                  </div>

                  <div
                    style={{
                      gridColumn: '1 / -1',
                      marginTop: '5px',
                      padding: '12px',
                      backgroundColor:
                        formData.paymentMethod === 'ADMISSION_PAYSTACK'
                          ? 'var(--success-tint)'
                          : 'var(--warning-tint)',
                      border:
                        formData.paymentMethod === 'ADMISSION_PAYSTACK'
                          ? '1px solid var(--success-tint)'
                          : '1px solid var(--warning-tint)',
                      borderRadius: '8px',
                    }}
                  >
                    <span
                      style={{
                        display: 'block',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        color: 'var(--ink-soft)',
                        fontWeight: 'bold',
                        marginBottom: '4px',
                      }}
                    >
                      {t('Payment Status')}
                    </span>

                    <strong
                      style={{
                        color:
                          formData.paymentMethod === 'ADMISSION_PAYSTACK'
                            ? isPaymentProcessed
                              ? 'var(--brand-light)'
                              : 'var(--warning)'
                            : 'var(--warning)',
                      }}
                    >
                      {formData.paymentMethod === 'ADMISSION_PAYSTACK'
                        ? isPaymentProcessed
                          ? t('Payment verified successfully through Paystack.')
                          : isProcessingPayment
                            ? t('Verifying your Paystack payment...')
                            : t('Payment not yet verified. Complete the Paystack payment above.')
                        : t('Bank transfer selected. Payment will be confirmed after transfer verification.')}
                    </strong>
                  </div>
                </div>
              </div>

              {submittedApplicationNumber && (
                <div
                  style={{
                    textAlign: 'center',
                    marginBottom: '25px',
                    padding: '18px',
                    backgroundColor: 'var(--brand-tint, var(--paper))',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      color: 'var(--ink-soft)',
                      fontWeight: 'bold',
                      letterSpacing: '0.05em',
                      marginBottom: '6px',
                    }}
                  >
                    {t('Your Application Number — Save This')}
                  </span>
                  <strong
                    style={{
                      fontSize: '20px',
                      color: 'var(--brand)',
                      letterSpacing: '0.03em',
                    }}
                  >
                    {submittedApplicationNumber}
                  </strong>
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'var(--ink-soft)',
                      margin: '8px 0 0',
                    }}
                  >
                    {t('Use this number any time to check your application and payment status.')}
                  </p>
                </div>
              )}

              <div style={{ textAlign: 'center', display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link
                  href={
                    submittedApplicationNumber
                      ? `/admission/track?ref=${encodeURIComponent(submittedApplicationNumber)}`
                      : '/admission/track'
                  }
                  style={{
                    display: 'inline-block',
                    padding: '12px 28px',
                    backgroundColor: 'var(--gold)',
                    color: 'var(--on-accent)',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    fontSize: '15px',
                  }}
                >
                  {t('Track Admission Progress')}
                </Link>

                <Link
                  href="/"
                  style={{
                    display: 'inline-block',
                    padding: '12px 28px',
                    backgroundColor: 'var(--brand)',
                    color: 'var(--on-accent)',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    fontSize: '15px',
                  }}
                >
                  {t('Return to Home Page')}
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}


export default function AdmissionPage() {
  return (
    <Suspense fallback={null}>
      <AdmissionPageInner />
    </Suspense>
  );
}
