import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './ConsentBanner.css';

const STORAGE_KEY_CONSENT = 'varsaka_dpdp_consent';
const STORAGE_KEY_PREFS = 'varsaka_dpdp_preferences';
const STORAGE_KEY_TIME = 'varsaka_dpdp_consent_time';

const DEFAULT_PREFERENCES = {
  essential: true,   // Always active, required for site functionality & security
  preferences: false, // UI theme & form draft recovery
  analytics: false,   // Aggregated performance telemetry
};

const getInitialPreferences = () => {
  try {
    const savedConsent = localStorage.getItem(STORAGE_KEY_CONSENT);
    const savedPrefsRaw = localStorage.getItem(STORAGE_KEY_PREFS);

    if (savedConsent) {
      if (savedPrefsRaw) {
        try {
          const parsed = JSON.parse(savedPrefsRaw);
          return {
            essential: true,
            preferences: Boolean(parsed.preferences),
            analytics: Boolean(parsed.analytics),
          };
        } catch {
          // Fallback to legacy string check
        }
      }

      // Handle legacy strings: 'accepted' or 'essential_only' / 'rejected_optional'
      if (savedConsent === 'accepted') {
        return { essential: true, preferences: true, analytics: true };
      } else {
        return { essential: true, preferences: false, analytics: false };
      }
    }
  } catch {
    // Storage access blocked or restricted
  }
  return DEFAULT_PREFERENCES;
};

const checkHasPriorChoice = () => {
  try {
    return Boolean(localStorage.getItem(STORAGE_KEY_CONSENT));
  } catch {
    return false;
  }
};

export default function ConsentBanner() {
  const [preferences, setPreferences] = useState(getInitialPreferences);
  const [hasPriorChoice, setHasPriorChoice] = useState(checkHasPriorChoice);
  const [visible, setVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const modalRef = useRef(null);

  // If no prior choice has been recorded, show banner after smooth entry delay
  useEffect(() => {
    if (!hasPriorChoice) {
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasPriorChoice]);

  // Listener for consent withdrawal / reopening from footer
  useEffect(() => {
    const handleOpenPreferences = () => {
      setPreferences(getInitialPreferences());
      setHasPriorChoice(checkHasPriorChoice());
      setShowCustomize(true);
      setVisible(true);
    };

    window.addEventListener('varsaka-open-cookie-preferences', handleOpenPreferences);
    return () => {
      window.removeEventListener('varsaka-open-cookie-preferences', handleOpenPreferences);
    };
  }, []);

  // Handle Escape key navigation
  useEffect(() => {
    if (!visible) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showCustomize) {
          if (hasPriorChoice) {
            // Dismiss customize modal without changing saved preferences
            setVisible(false);
            setShowCustomize(false);
          } else {
            // Return to primary banner
            setShowCustomize(false);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, showCustomize, hasPriorChoice]);

  // Save choices and broadcast custom event
  const persistConsent = (consentValue, prefs) => {
    try {
      localStorage.setItem(STORAGE_KEY_CONSENT, consentValue);
      localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(prefs));
      localStorage.setItem(STORAGE_KEY_TIME, new Date().toISOString());
    } catch {
      // Storage unavailable or disabled
    }

    setHasPriorChoice(true);
    setPreferences(prefs);
    setVisible(false);
    setShowCustomize(false);

    // Notify application & any telemetry hooks
    window.dispatchEvent(
      new CustomEvent('varsaka-cookie-consent-updated', {
        detail: {
          consent: consentValue,
          preferences: prefs,
          timestamp: new Date().toISOString(),
        },
      })
    );
  };

  const handleAcceptAll = () => {
    const allEnabled = { essential: true, preferences: true, analytics: true };
    persistConsent('accepted', allEnabled);
  };

  const handleRejectOptional = () => {
    const essentialOnly = { essential: true, preferences: false, analytics: false };
    persistConsent('rejected_optional', essentialOnly);
  };

  const handleSaveCustom = () => {
    const finalPrefs = { ...preferences, essential: true };
    const consentValue =
      finalPrefs.preferences && finalPrefs.analytics
        ? 'accepted'
        : !finalPrefs.preferences && !finalPrefs.analytics
        ? 'rejected_optional'
        : 'custom';

    persistConsent(consentValue, finalPrefs);
  };

  const handleToggle = (category) => {
    if (category === 'essential') return; // Cannot disable essential
    setPreferences((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  if (!visible) return null;

  return (
    <>
      {/* 1. Primary Bottom-Right Banner (Shown when not customizing) */}
      {!showCustomize && (
        <aside
          aria-label="Data Protection & Cookie Preferences"
          role="region"
          className="varsaka-consent-banner"
        >
          <div className="varsaka-consent-header">
            <span className="varsaka-consent-icon" aria-hidden="true">🛡️</span>
            <h2 className="varsaka-consent-title">
              Data Protection & Cookie Preferences
            </h2>
          </div>

          <p className="varsaka-consent-desc">
            Varsaka Labs uses essential cookies required for the website to function. With your permission,
            we may also use optional cookies to understand website usage and improve our services. You can
            change your preferences at any time. Learn more in our{' '}
            <Link to="/privacy-policy">Privacy Policy</Link> and{' '}
            <Link to="/cookies-policy">Cookie Policy</Link>.
          </p>

          <div className="varsaka-consent-actions">
            <button
              type="button"
              onClick={handleAcceptAll}
              className="varsaka-consent-btn varsaka-consent-btn-accept"
              aria-label="Accept all cookies and storage categories"
            >
              Accept All
            </button>
            <button
              type="button"
              onClick={handleRejectOptional}
              className="varsaka-consent-btn varsaka-consent-btn-reject"
              aria-label="Reject all optional cookies and retain only essential functionality"
            >
              Reject Optional
            </button>
            <button
              type="button"
              onClick={() => setShowCustomize(true)}
              className="varsaka-consent-btn varsaka-consent-btn-customize"
              aria-label="Customize individual cookie preferences"
            >
              Customize
            </button>
          </div>
        </aside>
      )}

      {/* 2. Customize Preferences Modal / Overlay */}
      {showCustomize && (
        <div
          className="varsaka-pref-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget && hasPriorChoice) {
              setVisible(false);
              setShowCustomize(false);
            }
          }}
        >
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="varsaka-pref-modal-title"
            className="varsaka-pref-modal"
          >
            {/* Modal Header */}
            <div className="varsaka-pref-header">
              <div className="varsaka-pref-header-left">
                <span className="varsaka-consent-icon" aria-hidden="true">⚙️</span>
                <h3 id="varsaka-pref-modal-title">Data Protection & Cookie Preferences</h3>
              </div>
              {hasPriorChoice && (
                <button
                  type="button"
                  onClick={() => {
                    setVisible(false);
                    setShowCustomize(false);
                  }}
                  className="varsaka-pref-close-btn"
                  aria-label="Close cookie preferences modal"
                >
                  &times;
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="varsaka-pref-body">
              <p className="varsaka-pref-intro">
                Varsaka Labs respects your privacy under India's Digital Personal Data Protection Act, 2023 (DPDP Act).
                Select which categories of cookies and local storage you permit. Essential cookies are strictly
                necessary for core site operation and security and cannot be disabled.
              </p>

              <div className="varsaka-pref-category-list">
                {/* Category 1: Essential (Always Active) */}
                <div className="varsaka-pref-category">
                  <div className="varsaka-pref-cat-top">
                    <div className="varsaka-pref-cat-title-group">
                      <span className="varsaka-pref-cat-title">Strictly Necessary & Security</span>
                      <span className="varsaka-badge varsaka-badge-essential">Always Active</span>
                    </div>
                    <label className="varsaka-switch" aria-label="Strictly Necessary Cookies - Always Active">
                      <input
                        type="checkbox"
                        checked={true}
                        disabled={true}
                        aria-disabled="true"
                        readOnly
                      />
                      <span className="varsaka-switch-slider" aria-hidden="true"></span>
                    </label>
                  </div>
                  <p className="varsaka-pref-cat-desc">
                    Required for core website functionality, anti-abuse form submission rate limiting
                    (anti-spam throttling), and securely recording your cookie consent preferences.
                    These do not store personal profiles.
                  </p>
                </div>

                {/* Category 2: Preferences & Functional (Optional) */}
                <div className="varsaka-pref-category">
                  <div className="varsaka-pref-cat-top">
                    <div className="varsaka-pref-cat-title-group">
                      <span className="varsaka-pref-cat-title">Preferences & Functional Storage</span>
                      <span className="varsaka-badge varsaka-badge-optional">Optional</span>
                    </div>
                    <label className="varsaka-switch" htmlFor="cat-pref-toggle">
                      <input
                        id="cat-pref-toggle"
                        type="checkbox"
                        checked={preferences.preferences}
                        onChange={() => handleToggle('preferences')}
                        aria-checked={preferences.preferences}
                      />
                      <span className="varsaka-switch-slider" aria-hidden="true"></span>
                    </label>
                  </div>
                  <p className="varsaka-pref-cat-desc">
                    Enables the website to remember your preferred interface theme (Light or Dark mode)
                    and preserves candidate job or internship application form drafts locally so your progress is not lost upon page reload.
                  </p>
                </div>

                {/* Category 3: Analytics & Performance (Optional) */}
                <div className="varsaka-pref-category">
                  <div className="varsaka-pref-cat-top">
                    <div className="varsaka-pref-cat-title-group">
                      <span className="varsaka-pref-cat-title">Analytics & Performance</span>
                      <span className="varsaka-badge varsaka-badge-optional">Optional</span>
                    </div>
                    <label className="varsaka-switch" htmlFor="cat-analytics-toggle">
                      <input
                        id="cat-analytics-toggle"
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={() => handleToggle('analytics')}
                        aria-checked={preferences.analytics}
                      />
                      <span className="varsaka-switch-slider" aria-hidden="true"></span>
                    </label>
                  </div>
                  <p className="varsaka-pref-cat-desc">
                    Collects aggregated, privacy-preserving performance metrics to diagnose page load speeds
                    and operational reliability. No third-party behavioral advertising or cross-site tracking is conducted.
                  </p>
                </div>
              </div>

              {/* No Marketing / Ad Cookies Notice */}
              <div className="varsaka-pref-notice">
                <span className="varsaka-pref-notice-icon" aria-hidden="true">🛡️</span>
                <div>
                  <strong>No Advertising Trackers:</strong> Varsaka Labs operates an advertising-free corporate platform.
                  We never deploy commercial tracking pixels, data brokers, or marketing cookies.
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="varsaka-pref-footer">
              <div className="varsaka-pref-footer-left">
                <button
                  type="button"
                  onClick={handleRejectOptional}
                  className="varsaka-consent-btn varsaka-consent-btn-reject"
                >
                  Reject Optional
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="varsaka-consent-btn varsaka-consent-btn-accept"
                >
                  Accept All
                </button>
              </div>

              <div className="varsaka-pref-footer-right">
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="varsaka-consent-btn varsaka-consent-btn-customize"
                  style={{ background: '#2563eb', color: '#fff', borderColor: '#3b82f6' }}
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
