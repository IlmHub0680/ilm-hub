'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const [step, setStep] = useState(1);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const [nationality, setNationality] = useState('');
    const [country, setCountry] = useState('');
    const [city, setCity] = useState('');
    const [gender, setGender] = useState('');
    const [phone, setPhone] = useState('');
    const [nativeLanguage, setNativeLanguage] = useState('');
    const [maritalStatus, setMaritalStatus] = useState('');
    const [studyLevel, setStudyLevel] = useState('Beginner');
    const [passport, setPassport] = useState('');
    const [certificate, setCertificate] = useState('');
    const [transcript, setTranscript] = useState('');
    const [testimonial, setTestimonial] = useState('');

    const router = useRouter();

    const handleFileChange = (e, setter) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setter(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const nextStep = (e) => {
        e.preventDefault();
        if (name && email && password) {
            setStep(2);
            window.scrollTo(0, 0);
        } else {
            alert('Please fill out all required basic information fields.');
        }
    };

    const handleRegister = (e) => {
        e.preventDefault();
        
        // If Diploma in Islamic Science is selected, validate that documents are uploaded
        if (studyLevel === 'Diploma in Islamic Science') {
            if (!certificate || !transcript || !testimonial) {
                alert('Diploma in Islamic Science applicants must upload their Certificate, Transcript, and Testimonial.');
                return;
            }
        }

        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('studentName', name);
        localStorage.setItem('studentEmail', email);
        if (passport) localStorage.setItem('studentPassport', passport);
        localStorage.setItem('studentLevel', studyLevel);
        router.push('/dashboard');
    };

    return (
        <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
            <div style={{ marginBottom: '20px', width: '100%', maxWidth: '600px' }}>
                <Link href="/" style={{ color: '#16a34a', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>
                    &larr; Back to Home
                </Link>
            </div>
            <div style={{ background: '#ffffff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', width: '100%', maxWidth: '600px', border: '1px solid #e2e8f0' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <h1 style={{ color: '#14532d', margin: '0 0 8px 0', fontSize: '24px' }}>Ilm Hub Institute</h1>
                    <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                        {step === 1 ? 'Step 1 of 2: Account & Program Details' : 'Step 2 of 2: Demographics & Documents'}
                    </p>
                </div>

                {step === 1 ? (
                    <form onSubmit={nextStep}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold', color: '#14532d' }}>Full Name *</label>
                            <input 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                required 
                                placeholder="Enter your full name..."
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} 
                            />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold', color: '#14532d' }}>Email Address *</label>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                                placeholder="test@gmail.com"
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} 
                            />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold', color: '#14532d' }}>Password *</label>
                            <input 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                                placeholder="Enter password..."
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} 
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold', color: '#14532d' }}>Passport Picture (Appears in Student Dashboard)</label>
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, setPassport)} 
                                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', background: '#f8fafc' }} 
                            />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold', color: '#14532d' }}>Select Level / Program *</label>
                            <select 
                                value={studyLevel} 
                                onChange={(e) => setStudyLevel(e.target.value)} 
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', backgroundColor: '#fff' }}
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Certificate in Specific Courses">Certificate in Specific Courses</option>
                                <option value="Diploma in Islamic Science">Diploma in Islamic Science (Requires Qualification Documents)</option>
                            </select>
                        </div>

                        <button type="submit" style={{ width: '100%', backgroundColor: '#16a34a', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>
                            Next: Demographics & Documents &rarr;
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleRegister}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold', color: '#14532d' }}>Nationality</label>
                                <input 
                                    type="text" 
                                    value={nationality} 
                                    onChange={(e) => setNationality(e.target.value)} 
                                    placeholder="e.g. Ghanaian"
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} 
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold', color: '#14532d' }}>Country of Residence</label>
                                <input 
                                    type="text" 
                                    value={country} 
                                    onChange={(e) => setCountry(e.target.value)} 
                                    placeholder="e.g. Ghana"
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} 
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold', color: '#14532d' }}>City</label>
                                <input 
                                    type="text" 
                                    value={city} 
                                    onChange={(e) => setCity(e.target.value)} 
                                    placeholder="e.g. Accra"
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} 
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold', color: '#14532d' }}>Phone Number</label>
                                <input 
                                    type="text" 
                                    value={phone} 
                                    onChange={(e) => setPhone(e.target.value)} 
                                    placeholder="+233..."
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} 
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold', color: '#14532d' }}>Gender</label>
                                <select 
                                    value={gender} 
                                    onChange={(e) => setGender(e.target.value)} 
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', backgroundColor: '#fff' }}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold', color: '#14532d' }}>Marital Status</label>
                                <select 
                                    value={maritalStatus} 
                                    onChange={(e) => setMaritalStatus(e.target.value)} 
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', backgroundColor: '#fff' }}
                                >
                                    <option value="">Select Status</option>
                                    <option value="Single">Single</option>
                                    <option value="Married">Married</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold', color: '#14532d' }}>Native Language</label>
                            <input 
                                type="text" 
                                value={nativeLanguage} 
                                onChange={(e) => setNativeLanguage(e.target.value)} 
                                placeholder="e.g. Arabic, English"
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} 
                            />
                        </div>

                        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f1f5f9', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                            <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#14532d', margin: '0 0 10px 0' }}>
                                Qualification Documents 
                                {studyLevel === 'Diploma in Islamic Science' ? ' (Mandatory for Diploma)' : ' (Optional)'}
                            </p>
                            
                            <div style={{ marginBottom: '10px' }}>
                                <label style={{ display: 'block', fontSize: '12px', color: '#475569', marginBottom: '4px' }}>
                                    Certificate {studyLevel === 'Diploma in Islamic Science' ? '*' : '(Optional)'}
                                </label>
                                <input type="file" onChange={(e) => handleFileChange(e, setCertificate)} style={{ fontSize: '12px', width: '100%' }} />
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <label style={{ display: 'block', fontSize: '12px', color: '#475569', marginBottom: '4px' }}>
                                    Transcript {studyLevel === 'Diploma in Islamic Science' ? '*' : '(Optional)'}
                                </label>
                                <input type="file" onChange={(e) => handleFileChange(e, setTranscript)} style={{ fontSize: '12px', width: '100%' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', color: '#475569', marginBottom: '4px' }}>
                                    Testimonial {studyLevel === 'Diploma in Islamic Science' ? '*' : '(Optional)'}
                                </label>
                                <input type="file" onChange={(e) => handleFileChange(e, setTestimonial)} style={{ fontSize: '12px', width: '100%' }} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                                type="button" 
                                onClick={() => setStep(1)} 
                                style={{ width: '35%', backgroundColor: '#64748b', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}
                            >
                                &larr; Back
                            </button>
                            <button 
                                type="submit" 
                                style={{ width: '65%', backgroundColor: '#16a34a', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}
                            >
                                Complete Registration
                            </button>
                        </div>
                    </form>
                )}

                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#64748b' }}>
                    Already have an account? <Link href="/login" style={{ color: '#16a34a', fontWeight: 'bold', textDecoration: 'none' }}>Sign In</Link>
                </p>
            </div>
        </div>
    );
}