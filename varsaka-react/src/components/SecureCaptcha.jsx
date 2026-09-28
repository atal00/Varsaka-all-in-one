import React, { useState, useEffect, useRef } from 'react';

const SecureCaptcha = ({ onValidate }) => {
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');
  const canvasRef = useRef(null);
  const captchaTextRef = useRef('');

  const generateRandomString = (length) => {
    // Clean character set excluding easily confused symbols
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const drawCaptcha = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    const text = generateRandomString(6);
    captchaTextRef.current = text;
    setCaptchaText(text);

    console.log('[SecureCaptcha] Generated CAPTCHA:', text);

    // Add noise (dots)
    for (let i = 0; i < 100; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`;
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add lines
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`;
      ctx.lineWidth = Math.random() * 3;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.stroke();
    }

    // Draw text with rotation and distortion
    const fonts = ['24px Arial', '26px Verdana', '22px Courier New', '24px Georgia'];
    for (let i = 0; i < text.length; i++) {
      ctx.font = fonts[Math.floor(Math.random() * fonts.length)];
      ctx.fillStyle = `rgb(${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)})`;
      ctx.save();
      
      const x = 20 + i * 30;
      const y = 35 + Math.random() * 10;
      const angle = (Math.random() - 0.5) * 0.8;
      
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }
  };

  useEffect(() => {
    drawCaptcha();
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setUserInput(val);

    // Normalize both input and target by trimming whitespace and normalizing case
    // This resolves font distortion confusion (e.g. rotated P vs p, C vs c) and trailing whitespace
    const target = captchaTextRef.current || captchaText;
    const normalizedInput = (val || '').trim().toLowerCase();
    const normalizedTarget = (target || '').trim().toLowerCase();
    const isValid = Boolean(
      normalizedInput.length > 0 &&
      normalizedTarget.length > 0 &&
      normalizedInput === normalizedTarget
    );

    console.log('[SecureCaptcha] Validation - Input:', val, '| Target:', target, '| Normalized Input:', normalizedInput, '| Normalized Target:', normalizedTarget, '| Valid:', isValid);

    onValidate(isValid);
  };

  const handleRefresh = (e) => {
    e.preventDefault();
    drawCaptcha();
    setUserInput('');
    onValidate(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '5px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <canvas 
          id="captcha-canvas"
          ref={canvasRef} 
          width="220" 
          height="60" 
          data-captcha={import.meta.env.DEV ? (captchaTextRef.current || captchaText) : undefined}
          style={{ 
            border: '2px solid #e2e8f0', 
            borderRadius: '8px',
            background: 'white'
          }} 
        />
        <button 
          id="btn-refresh-captcha"
          type="button" 
          onClick={handleRefresh}
          style={{
            background: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            fontSize: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#475569',
            transition: 'all 0.2s'
          }}
          title="Refresh CAPTCHA"
        >
          ↻
        </button>
      </div>
      <input 
        id="captcha-input"
        type="text" 
        value={userInput}
        onChange={handleChange}
        placeholder="Enter security code"
        required
        autoComplete="off"
        spellCheck="false"
        style={{
          padding: '10px 12px',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          fontSize: '0.95rem',
          outline: 'none',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)'
        }}
        onFocus={e => e.target.style.borderColor = '#2563eb'}
        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
      />
    </div>
  );
};

export default SecureCaptcha;
