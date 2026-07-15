import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../supabaseClient';
import logo from '../assets/logo.png';
import sealImg from '../assets/official_seal.png';
import directorSignature from '../assets/director_signature.png';
import { QRCodeCanvas } from 'qrcode.react';
import './VerifyCertificate.css';

export default function VerifyCertificate() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [certificate, setCertificate] = useState(null);
    const [error, setError] = useState(null);
    const [showMobilePopup, setShowMobilePopup] = useState(false);

    useEffect(() => {
        // Show popup only on mobile and if not dismissed this session
        const isMobile = window.innerWidth <= 850;
        const dismissed = sessionStorage.getItem('cert-popup-dismissed');
        if (isMobile && !dismissed) {
            const timer = setTimeout(() => {
                setShowMobilePopup(true);
            }, 1500); // Delay for better UX
            return () => clearTimeout(timer);
        }
    }, []);

    const dismissPopup = () => {
        setShowMobilePopup(false);
        sessionStorage.setItem('cert-popup-dismissed', 'true');
    };

    const handleDownload = () => {
        dismissPopup();
        window.print();
    };

    useEffect(() => {
        const fetchCertificate = async () => {
            if (!id) return;
            
            // 🛡️ SECURITY: Sanitize the ID to prevent any injection attempt
            const cleanId = id.replace(/[^a-zA-Z0-9-]/g, '').trim();
            
            console.log("Fetching certificate for ID:", cleanId);
            setLoading(true);
            try {
                const { data, error: fetchError } = await supabase
                    .from('certificates')
                    .select('*')
                    .eq('certificate_id', cleanId)
                    .single();

                if (fetchError) {
                    console.error("Supabase Error:", fetchError);
                    if (fetchError.code === 'PGRST116') {
                        setError('Certificate not found. Please check the ID and try again.');
                    } else {
                        throw fetchError;
                    }
                } else {
                    console.log("Certificate found:", data);
                    setCertificate(data);
                }
            } catch (err) {
                console.error('Verification Error:', err);
                setError('An error occurred while verifying the certificate.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCertificate();
        }
    }, [id]);

    return (
        <div className="verify-page">
            <Helmet>
                <title>Verify Certificate | Varsaka Labs</title>
                <meta name="description" content="Verify the authenticity of Varsaka Labs internship certificates." />
            </Helmet>

            <div className="verify-container">
                {/* Only show this header if we are loading or there is an error */}
                {(loading || error || !certificate) && (
                    <header className="verify-header" style={{marginBottom:'2rem', textAlign:'center'}}>
                        <img src={logo} alt="Varsaka Labs" style={{width:'50px', cursor:'pointer'}} onClick={() => navigate('/')} />
                        <p style={{fontSize:'0.7rem', letterSpacing:'0.2em', color:'#94a3b8', marginTop:'0.5rem', fontWeight:'600'}}>OFFICIAL VERIFICATION PORTAL</p>
                    </header>
                )}

                <main className="verify-card">
                    {loading ? (
                        <div style={{padding:'100px', textAlign:'center', color:'#64748b'}}>
                            <div className="spinner" style={{margin:'0 auto 20px'}}></div>
                            <p style={{fontFamily:'Inter, sans-serif', letterSpacing:'0.05em'}}>Authenticating Digital Credential...</p>
                        </div>
                    ) : error ? (
                        <div style={{padding:'100px', textAlign:'center'}}>
                            <div style={{fontSize:'4rem', marginBottom:'20px'}}>❌</div>
                            <h2 style={{color:'#ef4444', fontFamily:'Inter, sans-serif'}}>Verification Failed</h2>
                            <p style={{color:'#64748b', fontFamily:'Inter, sans-serif'}}>{error}</p>
                            <button className="btn-back" onClick={() => navigate('/')} style={{marginTop:'20px', padding:'10px 20px', borderRadius:'8px', background:'#1e293b', color:'white', border:'none', cursor:'pointer'}}>Back to Home</button>
                        </div>
                    ) : certificate ? (
                        <div className="certificate-frame">
                            <div className="cert-watermark">
                                <img src={logo} alt="Watermark" className="ghost-watermark" />
                            </div>
                            
                            {/* Decorative Ornate Corners */}
                            <div className="corner corner-tl"></div>
                            <div className="corner corner-tr"></div>
                            <div className="corner corner-bl"></div>
                            <div className="corner corner-br"></div>

                            <div className="cert-header">
                                <div className="cert-medal-wrap">
                                    <div className="cert-ribbon"></div>
                                    <div className="cert-logo-badge">
                                        <img src={logo} alt="Logo" className="cert-logo" />
                                    </div>
                                </div>
                                <h1>Certificate</h1>
                                <div className="cert-sub-title">of Completion</div>
                            </div>

                            <div className="cert-body">
                                <p className="cert-text" style={{textTransform:'uppercase', fontSize:'0.9rem', letterSpacing:'0.2em', color:'#94a3b8', marginBottom:'20px'}}>This is to certify that</p>
                                <div className="cert-name" style={{textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'40px'}}>{certificate.full_name}</div>
                                
                                <div className="cert-main-content">
                                    <p style={{fontSize:'1.25rem', maxWidth:'850px', margin:'0 auto', lineHeight:'1.8'}}>
                                        has successfully completed a professional internship at <span className="highlight">Varsaka Labs</span>. 
                                        Working on the <span className="highlight">"{certificate.project_title || 'Enterprise Solutions'}"</span> project 
                                        under the mentorship of <span className="highlight">{certificate.mentor_name || 'Technical Leadership'}</span>, 
                                        the candidate achieved an aggregate performance of <span className="highlight">Grade {certificate.grade || 'A+'}</span>.
                                    </p>

                                    <p style={{marginTop:'25px', fontSize:'1.1rem', color:'#64748b'}}>
                                        Tenure: {new Date(certificate.start_date).toLocaleDateString('en-US', {month:'long', year:'numeric'})} - {new Date(certificate.end_date).toLocaleDateString('en-US', {month:'long', year:'numeric'})}
                                        <br/>
                                        Location: {certificate.location || 'Gachibowli, Hyderabad'}
                                    </p>

                                    <p className="cert-wish" style={{marginTop:'40px', fontStyle:'italic', color:'#94a3b8', fontSize:'1rem'}}>
                                        "We wish the candidate continued success in all future professional endeavors."
                                    </p>
                                </div>
                            </div>

                            <div className="cert-footer">
                                <div className="footer-left">
                                    <div className="signature-line" style={{position:'relative'}}>
                                        <div className="sig-title">CEO, Varsaka Labs</div>
                                        <img src={sealImg} alt="Official Seal" className="cert-seal-overlap" />
                                        <img src={directorSignature} alt="Signature" className="signature-img" />
                                    </div>
                                </div>

                                <div className="qr-code-wrap">
                                    <QRCodeCanvas 
                                        value={window.location.href}
                                        size={100}
                                        level={"H"}
                                        includeMargin={true}
                                        className="qr-code-canvas"
                                    />
                                    <div className="qr-label">SCAN TO VERIFY</div>
                                </div>

                                <div className="footer-right">
                                    <div style={{fontSize:'1.1rem', fontWeight:'600', marginBottom:'5px'}}>{new Date(certificate.issue_date).toLocaleDateString('en-US', {day:'numeric', month:'short', year:'numeric'})}</div>
                                    <div className="signature-line">
                                        <div className="sig-title">Date of Issue</div>
                                    </div>
                                </div>
                            </div>
                            <div className="cert-id-tag">
                                VERIFICATION ID: {certificate.certificate_id}
                            </div>
                        </div>
                    ) : (
                        <div style={{padding:'100px', textAlign:'center'}}>
                            <div style={{fontSize:'4rem', marginBottom:'20px'}}>❓</div>
                            <h2>Unknown Record</h2>
                            <p>We couldn't locate this certificate. Please contact career@in.varsaka.com</p>
                            <button className="btn-back" onClick={() => navigate('/')}>Back</button>
                        </div>
                    )}
                </main>

                <div className="btn-print-wrap" style={{textAlign:'center'}}>
                    <button className="btn-print-cert" onClick={handleDownload}>
                        📥 Download Official Certificate (PDF)
                    </button>
                </div>
            </div>

            {/* Mobile View Suggestion Popup */}
            {showMobilePopup && (
                <div className="mobile-popup-overlay">
                    <div className="mobile-popup-card">
                        <button className="popup-close" onClick={dismissPopup}>&times;</button>
                        <div className="popup-icon">🖥️</div>
                        <h3>Better Visibility</h3>
                        <p>For better visibility, kindly turn on your desktop mode.</p>
                        <div className="popup-actions">
                            <button className="btn-popup-download" onClick={dismissPopup}>
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
