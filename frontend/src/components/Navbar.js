import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import toast from 'react-hot-toast';

const BADGE_ICONS = { bronze: '🥉', silver: '🥈', gold: '🥇', diamond: '💎', platinum: '🏆' };

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t, setLanguage, lang } = useLang();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/'); };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span>🔴</span> {t('appName')}
        </Link>
        <div className="navbar-links">
          <Link to="/search" className="nav-link">🔍 {t('search')}</Link>
          <Link to="/shaadi" className="nav-link">💍 {t('shaadiSection')}</Link>
          <Link to="/feed" className="nav-link">📸 {t('feed')}</Link>
          <button
            onClick={() => setLanguage(lang === 'en' ? 'hi' : 'en')}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', padding: '5px 10px', borderRadius: '14px', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            {lang === 'en' ? '🇮🇳 हिंदी' : '🇬🇧 EN'}
          </button>
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">
                {BADGE_ICONS[user.badge || 'bronze']} {user.blueTick ? '✅' : ''}
              </Link>
              <Link to="/messages" className="nav-link">💬</Link>
              <Link to="/badges" className="nav-link">🏅</Link>
              <button onClick={handleLogout} className="nav-btn">{t('logout')}</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">{t('login')}</Link>
              <Link to="/register" className="nav-btn">{t('register')}</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
