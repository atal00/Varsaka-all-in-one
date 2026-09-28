import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../supabaseClient';
import logo from '../assets/logo.png';
import sealImg from '../assets/official_seal.png';
import directorSignature from '../assets/director_signature.png';
import { QRCodeCanvas } from 'qrcode.react';
import './VerifyCertificate.css';

// Strict UUIDv4 pattern to reject predictable/sequential strings before sending requests
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const GENERIC_VERIFY_ERROR = 'Unable to verify this certificate. Please check the verification link or contact Varsaka Labs.';

export default function VerifyCertificate() {
    const { id } = useParams();
    const navigate = useNavigate();
    const rawToken = (id || '').trim();
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
            }, 1500);
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
        let isMounted = true;

        const verifyToken = async () => {
            if (!rawToken) {
                if (isMounted) {
                    setError(GENERIC_VERIFY_ERROR);
                    setLoading(false);
                }
                return;
            }

            // 🛡️ ANTI-ENUMERATION: Validate token format strictly.
            // If the identifier is sequential (e.g. VAR-INT-2026-001) or malformed,
            // reject immediately without leaking state or sending network requests.
            if (!UUID_REGEX.test(rawToken)) {
                if (isMounted) {
                    setError(GENERIC_VERIFY_ERROR);
                    setLoading(false);
                }
                return;
            }

            setLoading(true);
            try {
                const { data, error: rpcError } = await supabase.rpc(
                    'verify_certificate_by_token',
                    { p_token: rawToken }
                );

                if (rpcError) {
                    console.error('Certificate verification RPC error:', rpcError);
                    if (isMounted) {
                        setError(GENERIC_VERIFY_ERROR);
                        setCertificate(null);
                    }
                    return;
                }

                if (!data || data.length === 0) {
                    if (isMounted) {
                        setError(GENERIC_VERIFY_ERROR);
                        setCertificate(null);
                    }
                    return;
                }

                if (isMounted) {
                    setCertificate(data[0]);
                    setError(null);
                }
            } catch (err) {
                console.error('Unexpected certificate verification error:', err);
                if (isMounted) {
                    setError(GENERIC_VERIFY_ERROR);
                    setCertificate(null);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        verifyToken();

        return () => {
            isMounted = false;
        };
    }, [rawToken]);

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
                    ) : error || !certificate ? (
                        <div style={{padding:'100px', textAlign:'center'}}>
                            <div style={{fontSize:'4rem', marginBottom:'20px'}}>❌</div>
                            <h2 style={{color:'#ef4444', fontFamily:'Inter, sans-serif'}}>Verification Failed</h2>
                            <p style={{color:'#64748b', fontFamily:'Inter, sans-serif', maxWidth:'460px', margin:'10px auto'}}>{error || GENERIC_VERIFY_ERROR}</p>
                            <button className="btn-back" onClick={() => navigate('/')} style={{marginTop:'20px', padding:'10px 20px', borderRadius:'8px', background:'#1e293b', color:'white', border:'none', cursor:'pointer'}}>Back to Home</button>
                        </div>
                    ) : (
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
                                        value={`https://varsaka.com/verify/${rawToken}`}
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
                    )}
                </main>

                {!loading && !error && certificate && (
                    <div className="btn-print-wrap" style={{textAlign:'center'}}>
                        <button className="btn-print-cert" onClick={handleDownload}>
                            📥 Download Official Certificate (PDF)
                        </button>
                    </div>
                )}
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
