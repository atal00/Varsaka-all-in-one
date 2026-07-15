import React, { useEffect, useState } from 'react';
import Signature from './Signature';
import './Preloader.css';

export default function Preloader() {
  const [show, setShow] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Check if we've already shown the preloader this session
    const hasSeen = sessionStorage.getItem('varsaka_preloader');
    if (hasSeen) {
      setShow(false);
      return;
    }

    // Start fading out after the signature animation completes (approx 2.8s)
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 2800);

    // Remove from DOM completely after fade out (500ms transition)
    const removeTimer = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem('varsaka_preloader', 'true');
    }, 3300);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      aria-hidden="true"
      className={`vk-preloader ${fading ? 'is-fading' : ''}`}
    >
      <Signature animated={true} />
    </div>
  );
}
