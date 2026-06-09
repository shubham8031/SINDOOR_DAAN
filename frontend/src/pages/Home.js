import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import './Home.css';

export default function Home() {
  const { t } = useLang();
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">🇮🇳 {t('appName')} — India's First</div>
          <h1 className="hero-title">
            {t('heroTitle')}<br/>
            <span className="highlight">{t('heroTitle2')}</span>
          </h1>
          <p className="hero-subtitle">{t('heroSubtitle')}</p>
          <div className="hero-actions">
            <Link to="/search" className="btn btn-primary btn-lg">🔍 {t('searchBtn')}</Link>
            <Link to="/register" className="btn btn-outline btn-lg">{t('createProfile')}</Link>
          </div>
          <div className="hero-trust">
            <span>✅ {t('freeJoin')}</span>
            <span>🔒 {t('safeSecure')}</span>
            <span>❤️ {t('protectHeart')}</span>
          </div>
          <div className="hero-tagline">
            <span>Jo Apni Biwi Se Kare Pyar, </span>
            <span className="tagline-highlight">Vo SindoorDaan </span>
            <span>Se Kaise Kare Inkar</span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card">
            <div className="profile-mock">
              <div className="mock-avatar">👫</div>
              <div className="mock-info">
                <div className="mock-name">Rahul Sharma 🥇</div>
                <div className="mock-meta">28 yrs • Mumbai</div>
                <span className="status-badge status-married">💍 Married to Priya</span>
              </div>
            </div>
            <div className="match-result">
              <div className="match-bar-fill"></div>
              <span>92% Face Match Found! 🎯</span>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card" onClick={() => window.location.href='/search'}>
              <div className="feature-icon">🔍</div>
              <h3>Verification</h3>
              <p>Check if someone is already taken using AI face search</p>
            </div>
            <div className="feature-card" onClick={() => window.location.href='/shaadi'}>
              <div className="feature-icon">💍</div>
              <h3>{t('shaadiSection')}</h3>
              <p>Find your life partner with caste & profession filters</p>
            </div>
            <div className="feature-card" onClick={() => window.location.href='/feed'}>
              <div className="feature-icon">📸</div>
              <h3>{t('feed')}</h3>
              <p>Share couple photos and celebrate your love</p>
            </div>
            <div className="feature-card" onClick={() => window.location.href='/badges'}>
              <div className="feature-icon">🏅</div>
              <h3>{t('badges')}</h3>
              <p>Get verified with Silver, Gold, Diamond or Platinum badge</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-brand">🔴 {t('appName')}</div>
          <p>India's relationship verification platform</p>
          <p style={{fontSize:'0.78rem', marginTop:'8px', opacity:0.6}}>© 2024 Sindoor Daan. Made with ❤️ in India</p>
        </div>
      </footer>
    </div>
  );
}
