import React, { useState, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getFaceDescriptorFromFile } from '../utils/faceUtils';
import './Dashboard.css';

export default function Dashboard() {
  const { user, setUser, fetchProfile } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '', age: user?.age || '', city: user?.city || '',
    occupation: user?.occupation || '', phone: user?.phone || '',
    gender: user?.gender || '', status: user?.status || 'single',
    isPublic: user?.isPublic !== false,
    partner: { name: user?.partner?.name || '', relationshipType: user?.partner?.relationshipType || '' }
  });
  const [saving, setSaving] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingCouple, setUploadingCouple] = useState(false);
  const profilePhotoRef = useRef();
  const couplePhotoRef = useRef();

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
  const setPartner = (key, val) => setForm(prev => ({ ...prev, partner: { ...prev.partner, [key]: val } }));

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await axios.put('/api/users/profile', form);
      setUser(res.data);
      toast.success('Profile updated! ✅');
      setEditMode(false);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const uploadProfilePhoto = async (file) => {
    if (!file) return;
    setUploadingProfile(true);
    try {
      // First upload photo
      const formData = new FormData();
      formData.append('photo', file);
      await axios.post('/api/users/upload-profile-photo', formData);

      // Then extract face descriptor and save
      toast.loading('Analyzing face for search...', { id: 'face' });
      try {
        const descriptor = await getFaceDescriptorFromFile(file);
        if (descriptor) {
          await axios.post('/api/users/save-face-descriptor', { descriptor });
          toast.success('Face registered for search! 🎯', { id: 'face' });
        } else {
          toast.error('No face detected in photo. Please use a clear face photo.', { id: 'face' });
        }
      } catch {
        toast.dismiss('face');
      }

      await fetchProfile();
      toast.success('Profile photo updated!');
    } catch {
      toast.error('Photo upload failed');
    } finally {
      setUploadingProfile(false);
    }
  };

  const uploadCouplePhoto = async (file) => {
    if (!file) return;
    if ((user?.couplePhotos?.length || 0) >= 10) {
      return toast.error('Maximum 10 couple photos allowed');
    }
    setUploadingCouple(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      await axios.post('/api/users/upload-couple-photo', formData);
      await fetchProfile();
      toast.success('Couple photo added! 💕');
    } catch {
      toast.error('Photo upload failed');
    } finally {
      setUploadingCouple(false);
    }
  };

  const deleteCouple = async (photoUrl) => {
    if (!window.confirm('Delete this photo?')) return;
    try {
      await axios.delete('/api/users/couple-photo', { data: { photoUrl } });
      await fetchProfile();
      toast.success('Photo deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const statusClass = user?.status === 'single' ? 'status-single' : 'status-taken';
  const statusLabel = user?.status === 'married' ? '💍 Married' : user?.status === 'taken' ? '❤️ In Relationship' : '💚 Single';

  return (
    <div className="dashboard container">
      <div className="dash-header">
        <h1 className="section-title">My Profile</h1>
        <div className="section-divider"></div>
      </div>

      <div className="dash-grid">
        {/* Left - Profile Card */}
        <div className="dash-left">
          {/* Profile Photo */}
          <div className="card profile-photo-card">
            <div className="profile-photo-wrap" onClick={() => profilePhotoRef.current.click()}>
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt="Profile" className="profile-photo-img" />
              ) : (
                <div className="profile-photo-placeholder">
                  <span>👤</span>
                  <p>Click to add photo</p>
                </div>
              )}
              <div className="photo-overlay">
                {uploadingProfile ? '⏳ Uploading...' : '📷 Change Photo'}
              </div>
            </div>
            <input
              type="file" ref={profilePhotoRef} hidden
              accept="image/*"
              onChange={e => uploadProfilePhoto(e.target.files[0])}
            />
            <div className="profile-name-block">
              <h2>{user?.name}</h2>
              <span className={`status-badge ${statusClass}`}>{statusLabel}</span>
            </div>
            {user?.city && <p className="profile-meta">📍 {user.city}</p>}
            {user?.age && <p className="profile-meta">🎂 {user.age} years</p>}
            {user?.occupation && <p className="profile-meta">💼 {user.occupation}</p>}
            {user?.partner?.name && (
              <div className="partner-chip">
                💑 {user.partner.relationshipType === 'husband' || user.partner.relationshipType === 'wife' ? '💍' : '❤️'} Partner: <strong>{user.partner.name}</strong>
              </div>
            )}
            <div className="visibility-toggle">
              <span>{form.isPublic ? '🌐 Public Profile' : '🔒 Private Profile'}</span>
            </div>
          </div>

          {/* Edit Profile */}
          <div className="card">
            <div className="card-header-row">
              <h3>Edit Profile</h3>
              {!editMode && (
                <button className="btn btn-outline btn-sm" onClick={() => setEditMode(true)}>Edit</button>
              )}
            </div>

            {editMode ? (
              <div className="edit-form">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} />
                </div>
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Age</label>
                    <input type="number" className="form-input" value={form.age} onChange={e => set('age', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input className="form-input" value={form.city} onChange={e => set('city', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Occupation</label>
                  <input className="form-input" value={form.occupation} onChange={e => set('occupation', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-select" value={form.gender} onChange={e => set('gender', e.target.value)}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Relationship Status</label>
                  <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                    <option value="single">Single 💚</option>
                    <option value="taken">In Relationship ❤️</option>
                    <option value="married">Married 💍</option>
                  </select>
                </div>
                {(form.status === 'taken' || form.status === 'married') && (
                  <div className="partner-section">
                    <h4>Partner Details</h4>
                    <div className="form-group">
                      <label className="form-label">Partner's Name</label>
                      <input className="form-input" placeholder="Partner name"
                        value={form.partner.name} onChange={e => setPartner('name', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Relationship Type</label>
                      <select className="form-select" value={form.partner.relationshipType} onChange={e => setPartner('relationshipType', e.target.value)}>
                        <option value="">Select type</option>
                        <option value="boyfriend">Boyfriend</option>
                        <option value="girlfriend">Girlfriend</option>
                        <option value="husband">Husband</option>
                        <option value="wife">Wife</option>
                        <option value="fiance">Fiancé</option>
                        <option value="fiancee">Fiancée</option>
                      </select>
                    </div>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Profile Visibility</label>
                  <select className="form-select" value={form.isPublic ? 'public' : 'private'} onChange={e => set('isPublic', e.target.value === 'public')}>
                    <option value="public">🌐 Public (searchable)</option>
                    <option value="private">🔒 Private</option>
                  </select>
                </div>
                <div className="edit-actions">
                  <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button className="btn btn-outline" onClick={() => setEditMode(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="profile-details">
                <div className="detail-row"><span>Name</span><strong>{user?.name || '—'}</strong></div>
                <div className="detail-row"><span>Age</span><strong>{user?.age || '—'}</strong></div>
                <div className="detail-row"><span>City</span><strong>{user?.city || '—'}</strong></div>
                <div className="detail-row"><span>Gender</span><strong>{user?.gender || '—'}</strong></div>
                <div className="detail-row"><span>Occupation</span><strong>{user?.occupation || '—'}</strong></div>
                <div className="detail-row"><span>Status</span><strong>{statusLabel}</strong></div>
                {user?.partner?.name && <div className="detail-row"><span>Partner</span><strong>{user.partner.name}</strong></div>}
              </div>
            )}
          </div>
        </div>

        {/* Right - Couple Photos */}
        <div className="dash-right">
          <div className="card">
            <div className="card-header-row">
              <div>
                <h3>💑 Couple Photos</h3>
                <p className="card-subtitle">Add photos with your partner. These are visible when someone searches for you.</p>
              </div>
            </div>

            {/* Upload area */}
            <div
              className="dropzone"
              onClick={() => couplePhotoRef.current.click()}
              style={{ marginBottom: '20px' }}
            >
              {uploadingCouple ? (
                <div>⏳ Uploading photo...</div>
              ) : (
                <>
                  <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📸</div>
                  <div style={{ fontWeight: 600 }}>Click to add couple photo</div>
                  <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>JPG, PNG up to 5MB • Max 10 photos</div>
                </>
              )}
            </div>
            <input type="file" ref={couplePhotoRef} hidden accept="image/*"
              onChange={e => uploadCouplePhoto(e.target.files[0])} />

            {/* Photo grid */}
            {user?.couplePhotos?.length > 0 ? (
              <div className="photo-grid">
                {user.couplePhotos.map((url, i) => (
                  <div key={i} className="photo-thumb">
                    <img src={url} alt={`Couple ${i + 1}`} />
                    <button className="photo-delete" onClick={() => deleteCouple(url)}>✕</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-photos">
                <div style={{ fontSize: '3rem' }}>👫</div>
                <p>No couple photos yet</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>Add photos with your partner to make your profile complete</p>
              </div>
            )}
          </div>

          {/* Tips card */}
          <div className="card tips-card">
            <h3>💡 Tips for Better Profile</h3>
            <ul className="tips-list">
              <li>✅ Use a clear, well-lit profile photo (face visible)</li>
              <li>✅ Your face photo helps with face search matching</li>
              <li>✅ Add multiple couple photos for authenticity</li>
              <li>✅ Keep your city & age updated</li>
              <li>✅ Set your partner's name so others can see</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
