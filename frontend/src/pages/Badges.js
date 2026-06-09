import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

const BADGES = [
  { id: 'bronze', icon: '🥉', name: 'Bronze', price: 0, color: '#CD7F32', benefits: ['Basic profile', 'Searchable', 'Up to 10 couple photos'] },
  { id: 'silver', icon: '🥈', name: 'Silver', price: 9, color: '#C0C0C0', benefits: ['Silver badge on profile', 'Higher search priority', 'Verified look'] },
  { id: 'gold', icon: '🥇', name: 'Gold', price: 49, color: '#FFD700', benefits: ['Gold badge', 'Top search results', 'Highlighted profile', 'Featured in Shaadi'] },
  { id: 'diamond', icon: '💎', name: 'Diamond', price: 99, color: '#00BCD4', benefits: ['Diamond badge', 'Priority listing', 'Special border', 'Enhanced visibility'] },
  { id: 'platinum', icon: '🏆', name: 'Platinum', price: 199, color: '#9E9E9E', benefits: ['Platinum badge', 'Top of all searches', 'Maximum visibility', 'VIP support'] },
];

export default function Badges() {
  const { user, fetchProfile } = useAuth();
  const { t } = useLang();
  const [upgrading, setUpgrading] = useState(null);

  const handleUpgrade = async (badge) => {
    if (badge.price === 0) return toast('You already have Bronze badge!');
    setUpgrading(badge.id);
    try {
      // For now direct upgrade (Razorpay will be added later)
      await axios.post('/api/payment/upgrade-badge', { badge: badge.id, paymentId: 'test' });
      await fetchProfile();
      toast.success(`${badge.icon} ${badge.name} badge activated!`);
    } catch { toast.error('Upgrade failed'); } finally { setUpgrading(null); }
  };

  const currentBadgeIndex = BADGES.findIndex(b => b.id === (user?.badge || 'bronze'));

  return (
    <div className="container" style={{padding:'36px 20px'}}>
      <h1 className="section-title">🏅 {t('badges')}</h1>
      <div className="section-divider"></div>

      {/* Current badge */}
      <div className="card" style={{marginBottom:24, textAlign:'center', background:'linear-gradient(135deg,#FFF8F0,white)'}}>
        <p style={{fontSize:'0.85rem', color:'var(--text-light)', marginBottom:8}}>{t('currentBadge')}</p>
        <div style={{fontSize:'3.5rem', marginBottom:8}}>{BADGES.find(b => b.id === (user?.badge || 'bronze'))?.icon}</div>
        <h2 style={{fontFamily:'Playfair Display', fontSize:'1.5rem'}}>{BADGES.find(b => b.id === (user?.badge || 'bronze'))?.name}</h2>
        {user?.blueTick && <p style={{marginTop:8, color:'var(--green)', fontWeight:600}}>✅ Blue Tick Verified!</p>}
        {!user?.blueTick && <p style={{marginTop:8, fontSize:'0.82rem', color:'var(--text-light)'}}>Post {100 - (user?.postCount || 0)} more times to earn Blue Tick ✅</p>}
      </div>

      {/* Badge grid */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:16}}>
        {BADGES.map((badge, i) => {
          const isCurrent = badge.id === (user?.badge || 'bronze');
          const isOwned = i <= currentBadgeIndex;
          return (
            <div key={badge.id} className="card" style={{textAlign:'center', border: isCurrent ? `2px solid ${badge.color}` : '1px solid var(--border)', position:'relative'}}>
              {isCurrent && <div style={{position:'absolute', top:-10, left:'50%', transform:'translateX(-50%)', background:badge.color, color:'white', fontSize:'0.7rem', padding:'2px 10px', borderRadius:10, fontWeight:600}}>CURRENT</div>}
              <div style={{fontSize:'2.5rem', marginBottom:8}}>{badge.icon}</div>
              <h3 style={{fontFamily:'Playfair Display', marginBottom:6}}>{badge.name}</h3>
              <div style={{fontSize:'1.4rem', fontWeight:700, color: badge.price === 0 ? 'var(--green)' : 'var(--sindoor)', marginBottom:12}}>
                {badge.price === 0 ? t('free') : `₹${badge.price}`}
              </div>
              <ul style={{listStyle:'none', marginBottom:16, textAlign:'left'}}>
                {badge.benefits.map((b, j) => (
                  <li key={j} style={{fontSize:'0.78rem', color:'var(--text-light)', padding:'3px 0'}}>✓ {b}</li>
                ))}
              </ul>
              {isCurrent ? (
                <button className="btn" style={{background:'#f0f0f0', color:'var(--text-light)', cursor:'default', padding:'8px 20px'}} disabled>Active</button>
              ) : isOwned ? (
                <button className="btn" style={{background:'#f0f0f0', color:'var(--text-light)', cursor:'default', padding:'8px 20px'}} disabled>Owned</button>
              ) : (
                <button className="btn btn-primary btn-sm" onClick={() => handleUpgrade(badge)} disabled={upgrading === badge.id}>
                  {upgrading === badge.id ? t('loading') : `${t('payNow')} ₹${badge.price}`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Payment note */}
      <div className="card" style={{marginTop:24, background:'linear-gradient(135deg,#FFF8F0,white)', textAlign:'center'}}>
        <p style={{fontSize:'0.85rem', color:'var(--text-light)'}}>
          💳 Payment via UPI/Card coming soon. Currently in test mode.<br/>
          Contact us to manually upgrade your badge.
        </p>
      </div>
    </div>
  );
}
