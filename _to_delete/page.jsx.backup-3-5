'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdmissionPage() {
  const [currentStage, setCurrentStage] = useState(1);
  const [maxCompletedStage, setMaxCompletedStage] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  
  // State for handling direct payment and processing inside Step 4
  const [isPaymentProcessed, setIsPaymentProcessed] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Account & Personal
    email: 'admin@ilmhub.com',
    password: '',
    fullName: '',
    dateOfBirth: '',
    gender: '',
    nationality: 'Ghana',
    countryOfResidence: 'Ghana',
    phoneNumber: '',
    idNumber: '',
    residentialAddress: '',
    applicantCategory: 'Senior Learner (15-20)',

    // Step 2: Contacts & Education
    guardianName: '',
    guardianPhone: '',
    guardianRelationship: 'Father',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelationship: 'Mother',
    highestEducation: 'High School',
    institutionName: '',

    // Step 3: Programme, Session & Documents
    academicProgramme: 'Academic Programme',
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

    // Step 4: Fee & Payment
    paymentMethod: 'MoMo',
    calculatedFee: 'GHS 150',
    feeBase: 'Ghanaian Resident Rate',
  });

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

  // Dynamic Fee Logic Engine
  useEffect(() => {
    const country = formData.countryOfResidence.trim().toLowerCase();
    const category = formData.applicantCategory;

    let fee = '';
    let base = '';

    if (country === 'ghana') {
      base = 'Ghanaian Resident Rate';
      if (category.includes('Junior')) fee = 'GHS 100';
      else if (category.includes('Senior')) fee = 'GHS 150';
      else fee = 'GHS 200'; // Mature
    } else if (africanCountries.includes(country)) {
      base = 'African Regional Rate';
      if (category.includes('Junior')) fee = 'USD 12';
      else if (category.includes('Senior')) fee = 'USD 20';
      else fee = 'USD 30'; // Mature
    } else {
      base = 'Rest of World International Rate';
      if (category.includes('Junior')) fee = 'USD 20';
      else if (category.includes('Senior')) fee = 'USD 35';
      else fee = 'USD 50'; // Mature
    }

    setFormData((prev) => ({
      ...prev,
      calculatedFee: fee,
      feeBase: base,
    }));
  }, [formData.countryOfResidence, formData.applicantCategory]);

  const handleFileChange = (docKey, file) => {
    setFormData({
      ...formData,
      documents: { ...formData.documents, [docKey]: file ? file.name : null },
    });
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
      const isDiploma = formData.academicProgramme === 'Diploma in Islamic Sciences';
      const requiredBaseDocs = Boolean(formData.documents.passportPicture) && Boolean(formData.documents.identityDocument);

      if (isDiploma) {
        return Boolean(
          requiredBaseDocs &&
          formData.documents.transcripts &&
          formData.documents.certificate &&
          formData.documents.testimonial &&
          formData.documents.recommendation
        );
      }
      return requiredBaseDocs;
    }

    if (stageNum === 4) {
      return Boolean(formData.paymentMethod && isPaymentProcessed);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isPaymentProcessed) {
      alert('Payment authorization is required before submitting the application.');
      return;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('ilm_student_profile', JSON.stringify(formData));
    }
    setSubmitted(true);
  };

  const commonInputStyle = {
    width: '100%',
    padding: '12px 15px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontSize: '15px',
    boxSizing: 'border-box',
    marginTop: '6px',
  };

  const commonLabelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f1f5f9', color: '#14532d', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <main style={{ maxWidth: '900px', width: '100%', margin: '60px auto', padding: '0 20px', flex: 1 }}>
        <div style={{ backgroundColor: '#ffffff', padding: '40px 50px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '32px', color: '#14532d', margin: '0 0 8px 0' }}>Apply for Admission</h1>
            <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>
              Complete your applicant profile, select programmes & pay admission fees.
            </p>
          </div>

          {!submitted && (
            <>
              {/* Stepper navigation bar */}
              <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '40px' }}>
                {['1. Account & Personal', '2. Contacts & Education', '3. Programme & Session', '4. Fee & Payment'].map((step, idx) => {
                  const stepNum = idx + 1;
                  const isActive = currentStage === stepNum;
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
                        color: isActive ? '#16a34a' : isCompleted ? '#059669' : '#94a3b8', 
                        textAlign: 'center', 
                        padding: '15px 0', 
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'color 0.2s ease'
                      }}
                    >
                      {step} {isCompleted && stepNum < currentStage && '(Done)'}
                      {isActive && (
                        <div style={{ position: 'absolute', bottom: -1, left: '10%', width: '80%', height: '3px', backgroundColor: '#16a34a', borderRadius: '3px' }}></div>
                      )}
                    </button>
                  );
                })}
              </div>

              <h2 style={{ fontSize: '18px', color: '#0f172a', margin: '0 0 25px 0', fontWeight: 'bold' }}>
                {currentStage === 1 && "Step 1: Account & Personal Details"}
                {currentStage === 2 && "Step 2: Contacts & Education Background"}
                {currentStage === 3 && "Step 3: Programme, Session & Document Uploads"}
                {currentStage === 4 && "Step 4: Admission Fee & Payment"}
              </h2>

              <form onSubmit={currentStage === 4 ? handleSubmit : nextStage} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* STAGE 1: Account & Personal */}
                {currentStage === 1 && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <label style={commonLabelStyle}>Email Address *</label>
                        <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{...commonInputStyle, backgroundColor: '#f0f9ff', border: '1px solid #bae6fd'}} />
                      </div>
                      <div>
                        <label style={commonLabelStyle}>Password *</label>
                        <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} style={{...commonInputStyle, backgroundColor: '#f0f9ff', border: '1px solid #bae6fd'}} />
                      </div>
                    </div>
                    
                    <div>
                      <label style={commonLabelStyle}>Full Name *</label>
                      <input type="text" required placeholder="Enter full legal name..." value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} style={commonInputStyle} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <label style={commonLabelStyle}>Date of Birth *</label>
                        <input type="date" required value={formData.dateOfBirth} onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} style={commonInputStyle} />
                      </div>
                      <div>
                        <label style={commonLabelStyle}>Gender *</label>
                        <select required value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} style={commonInputStyle}>
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <label style={commonLabelStyle}>Nationality *</label>
                        <select required value={formData.nationality} onChange={(e) => setFormData({...formData, nationality: e.target.value})} style={commonInputStyle}>
                          {countryList.map((c, i) => <option key={i} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={commonLabelStyle}>Country of Residence *</label>
                        <select required value={formData.countryOfResidence} onChange={(e) => setFormData({...formData, countryOfResidence: e.target.value})} style={commonInputStyle}>
                          {countryList.map((c, i) => <option key={i} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <label style={commonLabelStyle}>Phone Number *</label>
                        <input type="tel" required placeholder="+..." value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} style={commonInputStyle} />
                      </div>
                      <div>
                        <label style={commonLabelStyle}>Passport / ID Number *</label>
                        <input type="text" required value={formData.idNumber} onChange={(e) => setFormData({...formData, idNumber: e.target.value})} style={commonInputStyle} />
                      </div>
                    </div>

                    <div>
                      <label style={commonLabelStyle}>Residential Address *</label>
                      <textarea rows="3" required value={formData.residentialAddress} onChange={(e) => setFormData({...formData, residentialAddress: e.target.value})} style={{...commonInputStyle, resize: 'none'}} />
                    </div>

                    <div>
                      <label style={commonLabelStyle}>Applicant Classification *</label>
                      <select required value={formData.applicantCategory} onChange={(e) => setFormData({...formData, applicantCategory: e.target.value})} style={{...commonInputStyle, border: '1px solid #16a34a', fontWeight: 'bold'}}>
                        <option value="Junior Learner (4-14years)">Junior Learner (4-14 years)</option>
                        <option value="Senior Learner (15-20)">Senior Learner (15-20 years)</option>
                        <option value="Mature Learner (20years and above)">Mature Learner (20 years and above)</option>
                      </select>
                    </div>
                  </>
                )}

                {/* STAGE 2: Contacts & Education */}
                {currentStage === 2 && (
                  <>
                    <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#475569', fontWeight: 'bold', margin: '0 0 10px 0', letterSpacing: '0.05em' }}>
                      Parent / Guardian Details
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr', gap: '15px' }}>
                      <input type="text" placeholder="Guardian Name" value={formData.guardianName} onChange={(e) => setFormData({...formData, guardianName: e.target.value})} style={commonInputStyle} />
                      <input type="tel" placeholder="Guardian Phone" value={formData.guardianPhone} onChange={(e) => setFormData({...formData, guardianPhone: e.target.value})} style={commonInputStyle} />
                      <select value={formData.guardianRelationship} onChange={(e) => setFormData({...formData, guardianRelationship: e.target.value})} style={commonInputStyle}>
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Guardian">Guardian</option>
                        <option value="Relative">Relative</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#475569', fontWeight: 'bold', margin: '20px 0 10px 0', letterSpacing: '0.05em' }}>
                      Emergency Contact *
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr', gap: '15px' }}>
                      <input type="text" placeholder="Name *" required value={formData.emergencyName} onChange={(e) => setFormData({...formData, emergencyName: e.target.value})} style={commonInputStyle} />
                      <input type="tel" placeholder="Phone *" required value={formData.emergencyPhone} onChange={(e) => setFormData({...formData, emergencyPhone: e.target.value})} style={commonInputStyle} />
                      <select required value={formData.emergencyRelationship} onChange={(e) => setFormData({...formData, emergencyRelationship: e.target.value})} style={commonInputStyle}>
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Guardian">Guardian</option>
                        <option value="Relative">Relative</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                      <div>
                        <label style={commonLabelStyle}>Highest Education Level *</label>
                        <select required value={formData.highestEducation} onChange={(e) => setFormData({...formData, highestEducation: e.target.value})} style={commonInputStyle}>
                          <option value="High School">High School</option>
                          <option value="Diploma">Diploma</option>
                          <option value="Bachelor Degree">Bachelor Degree</option>
                          <option value="Master Degree">Master Degree</option>
                          <option value="Doctorate">Doctorate</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label style={commonLabelStyle}>Institution Name *</label>
                        <input type="text" required value={formData.institutionName} onChange={(e) => setFormData({...formData, institutionName: e.target.value})} style={commonInputStyle} />
                      </div>
                    </div>
                  </>
                )}

                {/* STAGE 3: Programme, Session & Document Uploads */}
                {currentStage === 3 && (
                  <>
                    <div>
                      <label style={commonLabelStyle}>Academic Programme *</label>
                      <select required value={formData.academicProgramme} onChange={(e) => setFormData({...formData, academicProgramme: e.target.value})} style={commonInputStyle}>
                        <option value="Academic Programme">Academic Programme</option>
                        <option value="Certificate Programme (Specialised Studies)">Certificate Programme (Specialised Studies)</option>
                        <option value="Diploma in Islamic Sciences">Diploma in Islamic Sciences</option>
                      </select>
                    </div>

                    <div>
                      <label style={commonLabelStyle}>Select Study Session *</label>
                      <select required value={formData.studySession} onChange={(e) => setFormData({...formData, studySession: e.target.value})} style={commonInputStyle}>
                        <option value="Morning Session">Morning Session</option>
                        <option value="Evening Session">Evening Session</option>
                        <option value="Weekend Session">Weekend Session</option>
                      </select>
                    </div>

                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginTop: '10px' }}>
                      <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: '#14532d', fontWeight: 'bold', margin: '0 0 5px 0', letterSpacing: '0.05em' }}>
                        Required Document Uploads
                      </h4>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 15px 0' }}>
                        {formData.academicProgramme === 'Diploma in Islamic Sciences' 
                          ? 'Diploma applicants must provide all supporting academic and identification documents.'
                          : 'Please upload identity and passport photos to proceed.'}
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                          <div>
                            <label style={commonLabelStyle}>Select Official Identity Doc *</label>
                            <select value={formData.identityDocType} onChange={(e) => setFormData({...formData, identityDocType: e.target.value})} style={commonInputStyle}>
                              <option value="Ghana Card">Ghana Card</option>
                              <option value="National Identification Card">National Identification Card</option>
                              <option value="Green Card">Green Card</option>
                              <option value="International Passport">International Passport</option>
                              <option value="Birth Certificate">Birth Certificate</option>
                            </select>
                          </div>
                          <div>
                            <label style={commonLabelStyle}>Upload {formData.identityDocType} *</label>
                            <input type="file" required onChange={(e) => handleFileChange('identityDocument', e.target.files[0])} style={commonInputStyle} />
                          </div>
                        </div>

                        <div>
                          <label style={commonLabelStyle}>Passport Picture *</label>
                          <input type="file" required accept="image/*" onChange={(e) => handleFileChange('passportPicture', e.target.files[0])} style={commonInputStyle} />
                        </div>

                        {formData.academicProgramme === 'Diploma in Islamic Sciences' && (
                          <>
                            <div>
                              <label style={commonLabelStyle}>Transcripts *</label>
                              <input type="file" required onChange={(e) => handleFileChange('transcripts', e.target.files[0])} style={commonInputStyle} />
                            </div>

                            <div>
                              <label style={commonLabelStyle}>Certificate *</label>
                              <input type="file" required onChange={(e) => handleFileChange('certificate', e.target.files[0])} style={commonInputStyle} />
                            </div>

                            <div>
                              <label style={commonLabelStyle}>Testimonial *</label>
                              <input type="file" required onChange={(e) => handleFileChange('testimonial', e.target.files[0])} style={commonInputStyle} />
                            </div>

                            <div>
                              <label style={commonLabelStyle}>Recommendation Letter *</label>
                              <input type="file" required onChange={(e) => handleFileChange('recommendation', e.target.files[0])} style={commonInputStyle} />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* STAGE 4: Fee & Payment Gateway */}
                {currentStage === 4 && (
                  <>
                    <div style={{ backgroundColor: '#f0fdf4', padding: '25px', borderRadius: '12px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                      <span style={{ textTransform: 'uppercase', fontSize: '12px', fontWeight: 'bold', color: '#166534', letterSpacing: '0.05em' }}>
                        Auto-Calculated Admission Fee
                      </span>
                      <div style={{ fontSize: '42px', color: '#14532d', fontWeight: 'bold', margin: '10px 0' }}>
                        {formData.calculatedFee}
                      </div>
                      <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                        {formData.feeBase} - {formData.applicantCategory}.
                      </p>
                    </div>

                    <div>
                      <label style={commonLabelStyle}>Select Payment Method *</label>
                      <select 
                        required 
                        value={formData.paymentMethod} 
                        onChange={(e) => {
                          setFormData({...formData, paymentMethod: e.target.value});
                          setIsPaymentProcessed(false); 
                        }} 
                        style={commonInputStyle}
                      >
                        <option value="MoMo">Mobile Money (MoMo)</option>
                        <option value="Debit/Credit Card (Visa/Master)">Debit/Credit Card (Visa/Master)</option>
                        <option value="Direct Bank Transfer">Direct Bank Transfer</option>
                      </select>
                    </div>

                    {/* Integrated Payment Execution Module inside Step 4 */}
                    <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0', marginTop: '10px' }}>
                      <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: '#0f172a', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                        Payment Processing Gateway ({formData.paymentMethod})
                      </h4>
                      <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 15px 0' }}>
                        Complete your payment authorization before final submission.
                      </p>

                      {isPaymentProcessed ? (
                        <div style={{ padding: '12px', backgroundColor: '#dcfce7', border: '1px solid #86efac', borderRadius: '6px', color: '#166534', fontWeight: 'bold', fontSize: '14px', textAlign: 'center' }}>
                          ✓ Payment Successful & Verified ({formData.calculatedFee})
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={isProcessingPayment}
                          onClick={() => {
                            setIsProcessingPayment(true);
                            setTimeout(() => {
                              setIsProcessingPayment(false);
                              setIsPaymentProcessed(true);
                            }, 1000);
                          }}
                          style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: '#0284c7',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            cursor: 'pointer',
                          }}
                        >
                          {isProcessingPayment ? 'Processing Transaction...' : `Pay ${formData.calculatedFee} Now`}
                        </button>
                      )}
                    </div>
                  </>
                )}

                {/* Action Controls */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px', gap: '15px' }}>
                  {currentStage > 1 && (
                    <button type="button" onClick={prevStage} style={{ 
                      width: '200px', padding: '14px', backgroundColor: '#f1f5f9', color: '#14532d', 
                      border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' 
                    }}>
                      &lt;- Back
                    </button>
                  )}

                  <button 
                    type="submit"
                    disabled={currentStage === 4 && !isPaymentProcessed}
                    style={{ 
                      width: currentStage === 1 ? '100%' : '300px', 
                      padding: '14px', 
                      backgroundColor: (currentStage === 4 && !isPaymentProcessed) ? '#94a3b8' : '#16a34a', 
                      color: '#ffffff', 
                      border: 'none', 
                      borderRadius: '8px', 
                      fontWeight: 'bold', 
                      fontSize: '15px', 
                      cursor: (currentStage === 4 && !isPaymentProcessed) ? 'not-allowed' : 'pointer',
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    {currentStage === 1 && "Next: Contacts & Education ->"}
                    {currentStage === 2 && "Next: Programme & Session ->"}
                    {currentStage === 3 && "Next: Fee & Payment ->"}
                    {currentStage === 4 && (isPaymentProcessed ? "Submit Application & Complete" : "Complete Payment First to Submit")}
                  </button>
                </div>

              </form>
            </>
          )}

          {submitted && (
            <div style={{ padding: '10px 0' }}>
              <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>✅</div>
                <h3 style={{ color: '#14532d', fontSize: '24px', margin: '0 0 10px 0' }}>Application Submitted & Saved Successfully!</h3>
                <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>
                  Thank you, <strong>{formData.fullName || 'Applicant'}</strong>. Your admission request has been successfully recorded.
                </p>
              </div>

              {/* Comprehensive Summary Report */}
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '25px', marginBottom: '30px' }}>
                <h4 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#14532d', borderBottom: '2px solid #cbd5e1', paddingBottom: '10px', marginTop: 0, marginBottom: '15px', letterSpacing: '0.05em' }}>
                  Official Admission & Payment Summary Report
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '14px', color: '#334155' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 'bold' }}>Applicant Full Name</span>
                    <strong>{formData.fullName}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 'bold' }}>Email Address</span>
                    <strong>{formData.email}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 'bold' }}>Selected Programme</span>
                    <strong style={{ color: '#16a34a' }}>{formData.academicProgramme}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 'bold' }}>Study Session</span>
                    <strong>{formData.studySession}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 'bold' }}>Applicant Classification</span>
                    <strong>{formData.applicantCategory}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 'bold' }}>Country of Residence</span>
                    <strong>{formData.countryOfResidence}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 'bold' }}>Payment Method Used</span>
                    <strong>{formData.paymentMethod}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 'bold' }}>Non-Refundable Admission Fee Paid</span>
                    <strong style={{ color: '#0284c7', fontSize: '16px' }}>{formData.calculatedFee} ({formData.feeBase})</strong>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <Link href="/" style={{ display: 'inline-block', padding: '12px 28px', backgroundColor: '#14532d', color: '#ffffff', borderRadius: '6px', fontWeight: 'bold', textDecoration: 'none', fontSize: '15px' }}>
                  Return to Home Page
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}