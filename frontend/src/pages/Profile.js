import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';

export default function Profile() {
  const { id } = useParams();
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
    <div className="profile-not-found">
      <div style={{ fontSize: '4rem' }}>🔒</div>
      <h2>Profile Not Found</h2>
      <p>This profile is private or doesn't exist.</p>
      <Link to="/search" className="btn btn-primary">← Back to Search</Link>
    </div>
  );

  const statusClass = profile.status === 'single' ? 'status-single' : 'status-taken';
  const statusLabel = profile.status === 'married' ? '💍 Married' : profile.status === 'taken' ? '❤️ In Relationship' : '💚 Single';

  return (
    <div className="profile-page container">
      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Full size" />
          <button className="lightbox-close">✕</button>
        </div>
      )}

      <Link to="/search" className="back-link">← Back to Search</Link>

      <div className="profile-layout">
        {/* Left sidebar */}
        <div className="profile-sidebar">
          <div className="card profile-main-card">
            {/* Status banner */}
            {profile.status !== 'single' && (
              <div className="taken-banner">
                ⚠️ This person is NOT available
              </div>
            )}

            <div className="pub-photo-wrap">
              {profile.profilePhoto ? (
                <img src={profile.profilePhoto} alt={profile.name} className="pub-photo" />
              ) : (
                <div className="pub-photo-placeholder">👤</div>
              )}
            </div>

            <h1 className="pub-name">{profile.name}</h1>
            <span className={`status-badge ${statusClass}`} style={{ fontSize: '1rem', padding: '8px 20px' }}>
              {statusLabel}
            </span>

            {profile.partner?.name && (
              <div className="partner-info-box">
                <div className="partner-label">
                  {profile.partner.relationshipType === 'husband' ? '👨 Husband' :
                   profile.partner.relationshipType === 'wife' ? '👩 Wife' :
                   profile.partner.relationshipType === 'boyfriend' ? '👨 Boyfriend' :
                   profile.partner.relationshipType === 'girlfriend' ? '👩 Girlfriend' :
                   profile.partner.relationshipType === 'fiance' ? '💍 Fiancé' :
                   profile.partner.relationshipType === 'fiancee' ? '💍 Fiancée' : '💑 Partner'}
                </div>
                <div className="partner-name">{profile.partner.name}</div>
              </div>
            )}

            <div className="pub-details">
              {profile.age && <div className="pub-detail-row"><span>🎂 Age</span><strong>{profile.age} years</strong></div>}
              {profile.city && <div className="pub-detail-row"><span>📍 City</span><strong>{profile.city}</strong></div>}
              {profile.gender && <div className="pub-detail-row"><span>👤 Gender</span><strong style={{textTransform:'capitalize'}}>{profile.gender}</strong></div>}
              {profile.occupation && <div className="pub-detail-row"><span>💼 Work</span><strong>{profile.occupation}</strong></div>}
            </div>
          </div>
        </div>

        {/* Right - couple photos */}
        <div className="profile-content">
          <div className="card">
            <h2 className="section-title">💑 Couple Photos</h2>
            <div className="section-divider"></div>

            {profile.couplePhotos?.length > 0 ? (
              <div className="couple-gallery">
                {profile.couplePhotos.map((url, i) => (
                  <div key={i} className="gallery-item" onClick={() => setLightbox(url)}>
                    <img src={url} alt={`Couple photo ${i + 1}`} />
                    <div className="gallery-overlay">🔍 View</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-couple-photos">
                <div style={{ fontSize: '3rem' }}>📸</div>
                <p>No couple photos uploaded yet</p>
              </div>
            )}
          </div>

          {profile.status !== 'single' && (
            <div className="card warning-card">
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⚠️</div>
              <h3>This Person Is Taken!</h3>
              <p>
                <strong>{profile.name}</strong> is {profile.status === 'married' ? 'married' : 'in a relationship'}
                {profile.partner?.name ? ` with ${profile.partner.name}` : ''}.
                Please respect their relationship.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
