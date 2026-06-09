import React from 'react';
import { useLang } from '../context/LangContext';

export default function LanguageSelect() {
  const { setLanguage } = useLang();
  return (
    <div className="lang-screen">
      <div className="lang-card">
        <div className="lang-logo">🔴</div>
        <h1 className="lang-title">Sindoor Daan</h1>
        <p className="lang-subtitle">India's Relationship Verification Platform<br/>भारत का रिश्ता सत्यापन प्लेटफॉर्म</p>
        <div className="lang-options">
          <button className="lang-btn" onClick={() => setLanguage('en')}>
            <span className="lang-flag">🇬🇧</span>
            <span className="lang-name">English</span>
            <span className="lang-native">Continue in English</span>
          </button>
          <button className="lang-btn" onClick={() => setLanguage('hi')}>
            <span className="lang-flag">🇮🇳</span>
            <span className="lang-name">हिंदी</span>
            <span className="lang-native">हिंदी में जारी रखें</span>
          </button>
        </div>
      </div>
    </div>
  );
}
