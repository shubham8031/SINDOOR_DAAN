import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">🇮🇳 India's First Relationship Verification Platform</div>
          <h1 className="hero-title">
            Is He <span className="highlight">Already Taken?</span><br />
            Find Out Before It's Too Late
          </h1>
          <p className="hero-subtitle">
            Sindoor Daan helps you verify if someone is already in a committed relationship.
            Upload their photo and find out instantly. No more heartbreak. No more deception.
          </p>
          <div className="hero-actions">
            <Link to="/search" className="btn btn-primary btn-lg">🔍 Search Someone Now</Link>
            <Link to="/register" className="btn btn-outline btn-lg">Create Free Profile</Link>
          </div>
          <div className="hero-trust">
            <span>✅ 100% Free to join</span>
            <span>🔒 Safe & Secure</span>
            <span>❤️ Protect your heart</span>
          </div>
          <div className="tagline-text">
  Jo Apni Biwi Se Kare Pyar,{' '}
  <span className="tagline-highlight">Vo SindoorDaan</span>{' '}
  Se Kaise Kare Inkar
</div>
        </div>
        <div className="hero-visual">
          <div className="hero-card">
            <div className="profile-mock">
              <div className="mock-avatar">👫</div>
              <div className="mock-info">
                <div className="mock-name">Rahul Sharma</div>
                <div className="mock-meta">28 yrs • Mumbai</div>
                <span className="status-badge status-married">💍 Married to Priya</span>
              </div>
            </div>
            <div className="match-indicator">
              <div className="match-bar"></div>
              <span>92% Face Match Found!</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How Sindoor Daan Works</h2>
            <div className="section-divider"></div>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-icon">📸</div>
              <div className="step-num">01</div>
              <h3>Upload a Photo</h3>
              <p>Upload the photo of the person you want to verify. Our AI will detect and analyze their face.</p>
            </div>
            <div className="step-card">
              <div className="step-icon">🤖</div>
              <div className="step-num">02</div>
              <h3>AI Face Matching</h3>
              <p>Our face recognition technology searches through all registered profiles instantly.</p>
            </div>
            <div className="step-card">
              <div className="step-icon">💡</div>
              <div className="step-num">03</div>
              <h3>See Their Status</h3>
              <p>If they're registered, you'll see their relationship status and couple photos immediately.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why register */}
      <section className="why-register">
        <div className="container">
          <div className="why-grid">
            <div className="why-content">
              <h2 className="section-title">Why Register Your Relationship?</h2>
              <div className="section-divider"></div>
              <ul className="why-list">
                <li>
                  <span className="why-icon">💑</span>
                  <div>
                    <strong>Show you're committed</strong>
                    <p>Let the world know you're happily taken with your partner</p>
                  </div>
                </li>
                <li>
                  <span className="why-icon">🛡️</span>
                  <div>
                    <strong>Protect your relationship</strong>
                    <p>Anyone who searches for you will know you're not available</p>
                  </div>
                </li>
                <li>
                  <span className="why-icon">🎁</span>
                  <div>
                    <strong>Completely Free</strong>
                    <p>Create your couple profile at zero cost</p>
                  </div>
                </li>
              </ul>
              <Link to="/register" className="btn btn-primary">Create Couple Profile Free</Link>
            </div>
            <div className="why-visual">
              <div className="couple-preview">
                <div className="couple-emoji">👨‍❤️‍👩</div>
                <div className="couple-label">Your Couple Profile</div>
                <div className="couple-status">TAKEN ❤️</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-brand">🔴 Sindoor Daan</div>
          <p>India's relationship verification platform</p>
          <p style={{fontSize:'0.8rem', marginTop:'10px', opacity:0.6}}>
            © 2024 Sindoor Daan. Made with ❤️ in India
          </p>
        </div>
      </footer>
    </div>
  );
}
