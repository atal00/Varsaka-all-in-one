import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function Fake404() {
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate('/', { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <>
      <Helmet>
        <title>404 - Page Not Found</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div style={{
        height: '100vh',
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--bg, #f5f5f7)',
        color: 'var(--text, #1d1d1f)',
        fontFamily: 'Inter, sans-serif'
      }}>
        <h1 style={{ fontSize: '6rem', fontWeight: 800, margin: 0, color: 'var(--blue-bright, #0066cc)' }}>404</h1>
        <p style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: '10px', marginBottom: '30px' }}>Page Not Found</p>
        
        <p style={{ color: 'var(--text-light, #86868b)', fontSize: '1rem' }}>
          Looks like you're lost. Redirecting to home in <strong style={{ color: 'var(--text)' }}>{countdown}</strong> seconds...
        </p>

        <button 
          onClick={() => navigate('/', { replace: true })}
          style={{
            marginTop: '30px',
            padding: '12px 24px',
            background: 'var(--blue-bright, #0066cc)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'opacity 0.2s'
          }}
          onMouseOver={(e) => e.target.style.opacity = '0.8'}
          onMouseOut={(e) => e.target.style.opacity = '1'}
        >
          Go Home Now
        </button>
      </div>
    </>
  );
}
