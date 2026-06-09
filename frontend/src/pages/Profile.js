import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useLang } from '../context/LangContext';

const BADGE_ICONS = { bronze: '🥉', silver: '🥈', gold: '🥇', diamond: '💎', platinum: '🏆' };

export default function Profile() {
  const { id } = useParams();
  const { t } = useLang();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    axios.get(`/api/users/${id}`)
      .then(res => setProfile(res.data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-screen"><div className="sindoor-loader"></div></div>;
  if (!profile) return (
    <div style={{textAlign:'center', padding:80}}>
      <div style={{fontSize:'4rem'}}>🔒</div>
      <h2 style={{fontFamily:'Playfair Display', margin:'16px 0 8px'}}>Profile Not Found</h2>
      <p style={{color:'var(--text-light)', marginBottom:24}}>This profile is private or doesn't exist.</p>
      <Link to="/search" className="btn btn-primary">← Back to Search</Link>
    </div>
  );

  const statusClass = profile.status === 'single' ? 'status-single' : 'status-taken';
  const statusLabel = profile.status === 'married' ? t('married') : profile.status === 'taken' ? t('taken') : t('single');

  return (
    <div className="container" style={{padding:'28px 20px 60px'}}>
      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Full size" />
          <button className="lightbox-close">✕</button>
        </div>
      )}
      <Link to="/search" style={{color:'var(--sindoor)', textDecoration:'none', fontSize:'0.88rem', marginBottom:20, display:'inline-block'}}>← Back to Search</Link>

      {profile.status !== 'single' && (
        <div style={{background:'linear-gradient(135deg,var(--sindoor),var(--sindoor-dark))', color:'white', padding:'12px 20px', borderRadius:12, marginBottom:20, textAlign:'center', fontWeight:600}}>
          ⚠️ {t('takenWarning')}
        </div>
      )}

      <div style={{display:'grid', gridTemplateColumns:'300px 1fr', gap:22, alignItems:'start'}}>
        {/* Sidebar */}
        <div className="card" style={{textAlign:'center', position:'sticky', top:85}}>
          <div style={{width:140, height:140, borderRadius:'50%', margin:'0 auto 16px', overflow:'hidden', border:'3px solid var(--sindoor)', boxShadow:'0 0 0 4px rgba(196,30,58,0.12)'}}>
            {profile.profilePhoto
              ? <img src={profile.profilePhoto} alt={profile.name} style={{width:'100%', height:'100%', objectFit:'cover'}} />
              : <div style={{width:'100%', height:'100%', background:'linear-gradient(135deg,#FFF0F0,#FFF8E0)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'3rem'}}>👤</div>}
          </div>
          <h1 style={{fontFamily:'Playfair Display', fontSize:'1.4rem', marginBottom:10}}>
            {profile.name} {BADGE_ICONS[profile.badge || 'bronze']} {profile.blueTick ? '✅' : ''}
          </h1>
          <span className={`status-badge ${statusClass}`} style={{fontSize:'0.9rem', padding:'7px 18px'}}>{statusLabel}</span>

          {profile.partner?.name && (
            <div style={{background:'linear-gradient(135deg,#FFF0F0,#FFF8E0)', border:'1px solid rgba(196,30,58,0.2)', borderRadius:14, padding:'12px 16px', margin:'16px 0'}}>
              <div style={{fontSize:'0.75rem', color:'var(--text-light)', marginBottom:4}}>
                {profile.partner.relationshipType === 'husband' ? '👨 Husband' :
                 profile.partner.relationshipType === 'wife' ? '👩 Wife' :
                 profile.partner.relationshipType === 'boyfriend' ? '👨 Boyfriend' :
                 profile.partner.relationshipType === 'girlfriend' ? '👩 Girlfriend' :
                 profile.partner.relationshipType === 'fiance' ? '💍 Fiancé' :
                 profile.partner.relationshipType === 'fiancee' ? '💍 Fiancée' : '💑 Partner'}
              </div>
              <div style={{fontFamily:'Playfair Display', fontSize:'1.1rem', color:'var(--sindoor-dark)'}}>{profile.partner.name}</div>
            </div>
          )}

          <div style={{marginTop:16}}>
            {[['🎂', t('age'), profile.age ? `${profile.age} yrs` : null],
              ['📍', t('city'), profile.city],
              ['🏛️', t('state'), profile.state],
              ['💼', t('occupation'), profile.occupation],
              ['👤', t('gender'), profile.gender]
            ].filter(([,,v]) => v).map(([icon, label, value]) => (
              <div key={label} style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(0,0,0,0.05)', fontSize:'0.85rem'}}>
                <span style={{color:'var(--text-light)'}}>{icon} {label}</span>
                <strong style={{textTransform:'capitalize'}}>{value}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{display:'flex', flexDirection:'column', gap:20}}>
          {/* Couple Photos */}
          <div className="card">
            <h2 className="section-title" style={{fontSize:'1.3rem'}}>💑 {t('couplePics')}</h2>
            <div className="section-divider"></div>
            {profile.couplePhotos?.length > 0 ? (
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:12}}>
                {profile.couplePhotos.map((url, i) => (
                  <div key={i} style={{aspectRatio:1, borderRadius:12, overflow:'hidden', cursor:'pointer', position:'relative'}} onClick={() => setLightbox(url)}>
                    <img src={url} alt={`Couple ${i+1}`} style={{width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.3s'}} />
                    <div style={{position:'absolute', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', opacity:0, transition:'opacity 0.2s'}} onMouseOver={e => e.currentTarget.style.opacity=1} onMouseOut={e => e.currentTarget.style.opacity=0}>
                      <span style={{color:'white', fontWeight:600}}>🔍 View</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{textAlign:'center', padding:'40px 20px', color:'var(--text-light)'}}>
                <div style={{fontSize:'3rem', marginBottom:12}}>📸</div>
                <p>No couple photos uploaded yet</p>
              </div>
            )}
          </div>

          {/* Warning card */}
          {profile.status !== 'single' && (
            <div className="card" style={{background:'linear-gradient(135deg,#FFF0F0,#FFF8F8)', border:'1px solid rgba(196,30,58,0.3)', textAlign:'center'}}>
              <div style={{fontSize:'2rem', marginBottom:10}}>⚠️</div>
              <h3 style={{fontFamily:'Playfair Display', fontSize:'1.2rem', marginBottom:10, color:'var(--sindoor-dark)'}}>This Person Is Taken!</h3>
              <p style={{fontSize:'0.88rem', color:'var(--text-light)', lineHeight:1.6}}>
                <strong>{profile.name}</strong> is {profile.status === 'married' ? 'married' : 'in a relationship'}
                {profile.partner?.name ? ` with ${profile.partner.name}` : ''}. Please respect their commitment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
