import React, { useState, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { getFaceDescriptorFromFile } from '../utils/faceUtils';
import { INDIA_STATES } from '../utils/indiaData';
import { Link } from 'react-router-dom';

const BADGE_ICONS = { bronze: '🥉', silver: '🥈', gold: '🥇', diamond: '💎', platinum: '🏆' };

export default function Dashboard() {
  const { user, setUser, fetchProfile } = useAuth();
  const { t } = useLang();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '', age: user?.age || '', city: user?.city || '',
    state: user?.state || '', district: user?.district || '',
    currentCity: user?.currentCity || '', pincode: user?.pincode || '',
    occupation: user?.occupation || '', phone: user?.phone || '',
    gender: user?.gender || '', status: user?.status || 'single',
    isPublic: user?.isPublic !== false,
    partner: { name: user?.partner?.name || '', relationshipType: user?.partner?.relationshipType || '' }
  });
  const [saving, setSaving] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingCouple, setUploadingCouple] = useState(false);
  const [postCaption, setPostCaption] = useState('');
  const [postingImage, setPostingImage] = useState(null);
  const [posting, setPosting] = useState(false);
  const profileRef = useRef();
  const coupleRef = useRef();
  const postRef = useRef();
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const setPartner = (k, v) => setForm(prev => ({ ...prev, partner: { ...prev.partner, [k]: v } }));

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await axios.put('/api/users/profile', form);
      setUser(res.data);
      toast.success('Profile updated! ✅');
      setEditMode(false);
    } catch { toast.error('Update failed'); } finally { setSaving(false); }
  };

  const uploadProfilePhoto = async (file) => {
    if (!file) return;
    setUploadingProfile(true);
    try {
      const fd = new FormData(); fd.append('photo', file);
      await axios.post('/api/users/upload-profile-photo', fd);
      toast.loading('Analyzing face...', { id: 'face' });
      try {
        const desc = await getFaceDescriptorFromFile(file);
        if (desc) { await axios.post('/api/users/save-face-descriptor', { descriptor: desc }); toast.success('Face registered! 🎯', { id: 'face' }); }
        else toast.error('No face detected. Use clear photo.', { id: 'face' });
      } catch { toast.dismiss('face'); }
      await fetchProfile();
      toast.success('Profile photo updated!');
    } catch { toast.error('Upload failed'); } finally { setUploadingProfile(false); }
  };

  const uploadCouplePhoto = async (file) => {
    if (!file) return;
    setUploadingCouple(true);
    try {
      const fd = new FormData(); fd.append('photo', file);
      await axios.post('/api/users/upload-couple-photo', fd);
      await fetchProfile();
      toast.success('Couple photo added! 💕');
    } catch { toast.error('Upload failed'); } finally { setUploadingCouple(false); }
  };

  const deleteCouple = async (photoUrl) => {
    if (!window.confirm('Delete this photo?')) return;
    try {
      await axios.delete('/api/users/couple-photo', { data: { photoUrl } });
      await fetchProfile();
      toast.success('Deleted');
    } catch { toast.error('Delete failed'); }
  };

  const createPost = async () => {
    if (!postingImage) return toast.error('Select an image first');
    setPosting(true);
    try {
      const fd = new FormData();
      fd.append('image', postingImage);
      fd.append('caption', postCaption);
      await axios.post('/api/posts', fd);
      await fetchProfile();
      setPostingImage(null);
      setPostCaption('');
      toast.success('Post created! 📸');
      if ((user?.postCount || 0) + 1 >= 100) toast.success('🎉 You earned Blue Tick!');
    } catch { toast.error('Post failed'); } finally { setPosting(false); }
  };

  const statusClass = user?.status === 'single' ? 'status-single' : 'status-taken';
  const statusLabel = user?.status === 'married' ? t('married') : user?.status === 'taken' ? t('taken') : t('single');

  return (
    <div className="container" style={{padding:'36px 20px'}}>
      <div style={{marginBottom:28}}>
        <h1 className="section-title">{t('myProfile')}</h1>
        <div className="section-divider"></div>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'340px 1fr', gap:22, alignItems:'start'}}>
        {/* Left */}
        <div style={{display:'flex', flexDirection:'column', gap:18}}>
          {/* Profile card */}
          <div className="card" style={{textAlign:'center'}}>
            <div style={{width:140, height:140, borderRadius:'50%', margin:'0 auto 14px', position:'relative', cursor:'pointer', overflow:'hidden', border:'3px solid var(--sindoor)', boxShadow:'0 0 0 4px rgba(196,30,58,0.12)'}} onClick={() => profileRef.current.click()}>
              {user?.profilePhoto ? <img src={user.profilePhoto} alt="Profile" style={{width:'100%', height:'100%', objectFit:'cover'}} /> : <div style={{width:'100%', height:'100%', background:'linear-gradient(135deg,#FFF0F0,#FFF8E0)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2.5rem'}}>👤</div>}
              <div style={{position:'absolute', bottom:0, left:0, right:0, background:'rgba(0,0,0,0.6)', color:'white', fontSize:'0.7rem', padding:'5px', textAlign:'center'}}>
                {uploadingProfile ? '⏳' : '📷 Change'}
              </div>
            </div>
            <input type="file" ref={profileRef} hidden accept="image/*" onChange={e => uploadProfilePhoto(e.target.files[0])} />
            <h2 style={{fontFamily:'Playfair Display', fontSize:'1.3rem', marginBottom:8}}>
              {user?.name} {BADGE_ICONS[user?.badge || 'bronze']} {user?.blueTick ? '✅' : ''}
            </h2>
            <span className={`status-badge ${statusClass}`}>{statusLabel}</span>
            {user?.city && <p style={{fontSize:'0.85rem', color:'var(--text-light)', marginTop:8}}>📍 {user.city}{user.state ? `, ${user.state}` : ''}</p>}
            {user?.age && <p style={{fontSize:'0.85rem', color:'var(--text-light)', marginTop:4}}>🎂 {user.age} years</p>}
            {user?.occupation && <p style={{fontSize:'0.85rem', color:'var(--text-light)', marginTop:4}}>💼 {user.occupation}</p>}
            {user?.partner?.name && (
              <div style={{background:'linear-gradient(135deg,#FFF0F0,#FFF8E0)', border:'1px solid rgba(196,30,58,0.2)', borderRadius:16, padding:'8px 14px', marginTop:12, fontSize:'0.85rem', color:'var(--sindoor-dark)'}}>
                💑 Partner: <strong>{user.partner.name}</strong>
              </div>
            )}
            <div style={{marginTop:12, display:'flex', gap:10, justifyContent:'center', fontSize:'0.82rem', color:'var(--text-light)'}}>
              <span>📝 {user?.postCount || 0} {t('postsCount')}</span>
              {!user?.blueTick && <span style={{color:'var(--sindoor)'}}>Need {100 - (user?.postCount || 0)} more for ✅</span>}
            </div>
            <div style={{marginTop:12, display:'flex', gap:8, justifyContent:'center'}}>
              <Link to="/badges" className="btn btn-gold btn-sm">🏅 {t('upgradeBadge')}</Link>
            </div>
          </div>

          {/* Edit Profile */}
          <div className="card">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
              <h3 style={{fontFamily:'Playfair Display'}}>Edit Profile</h3>
              {!editMode && <button className="btn btn-outline btn-sm" onClick={() => setEditMode(true)}>{t('edit')}</button>}
            </div>
            {editMode ? (
              <div>
                {[['name', t('fullName')], ['age', t('age')], ['city', t('city')], ['district', t('district')], ['currentCity', t('currentCity')], ['pincode', t('pincode')], ['occupation', t('occupation')]].map(([k, label]) => (
                  <div className="form-group" key={k}>
                    <label className="form-label">{label}</label>
                    <input className="form-input" value={form[k]} onChange={e => set(k, e.target.value)} type={k === 'age' ? 'number' : 'text'} />
                  </div>
                ))}
                <div className="form-group">
                  <label className="form-label">{t('state')}</label>
                  <select className="form-select" value={form.state} onChange={e => set('state', e.target.value)}>
                    <option value="">Select</option>
                    {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('relationshipStatus')}</label>
                  <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                    <option value="single">{t('single')}</option>
                    <option value="taken">{t('taken')}</option>
                    <option value="married">{t('married')}</option>
                  </select>
                </div>
                {(form.status === 'taken' || form.status === 'married') && (
                  <div style={{background:'#FFF8F0', borderRadius:10, padding:12, marginBottom:12, border:'1px solid var(--border)'}}>
                    <h4 style={{fontSize:'0.88rem', marginBottom:10, color:'var(--sindoor)'}}>Partner Details</h4>
                    <div className="form-group">
                      <label className="form-label">{t('partnerName')}</label>
                      <input className="form-input" value={form.partner.name} onChange={e => setPartner('name', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t('relationshipType')}</label>
                      <select className="form-select" value={form.partner.relationshipType} onChange={e => setPartner('relationshipType', e.target.value)}>
                        <option value="">Select</option>
                        {['boyfriend','girlfriend','husband','wife','fiance','fiancee'].map(r => <option key={r} value={r}>{t(r)}</option>)}
                      </select>
                    </div>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">{t('profileVisibility')}</label>
                  <select className="form-select" value={form.isPublic ? 'public' : 'private'} onChange={e => set('isPublic', e.target.value === 'public')}>
                    <option value="public">{t('public')}</option>
                    <option value="private">{t('private')}</option>
                  </select>
                </div>
                <div style={{display:'flex', gap:8}}>
                  <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>{saving ? t('loading') : t('saveChanges')}</button>
                  <button className="btn btn-outline" onClick={() => setEditMode(false)}>{t('cancel')}</button>
                </div>
              </div>
            ) : (
              <div>
                {[['Name', user?.name], ['Age', user?.age], ['City', user?.city], ['State', user?.state], ['Occupation', user?.occupation], ['Status', statusLabel], ['Partner', user?.partner?.name]].filter(([,v]) => v).map(([k, v]) => (
                  <div key={k} style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(0,0,0,0.05)', fontSize:'0.85rem'}}>
                    <span style={{color:'var(--text-light)'}}>{k}</span><strong>{v}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right */}
        <div style={{display:'flex', flexDirection:'column', gap:18}}>
          {/* Create Post */}
          <div className="card">
            <h3 style={{fontFamily:'Playfair Display', marginBottom:14}}>📸 {t('addPost')}</h3>
            <div className="dropzone" onClick={() => postRef.current.click()} style={{marginBottom:12}}>
              {postingImage ? (
                <div style={{textAlign:'center'}}>
                  <img src={URL.createObjectURL(postingImage)} alt="Post" style={{maxWidth:200, maxHeight:200, borderRadius:10, objectFit:'cover'}} />
                  <p style={{fontSize:'0.78rem', color:'var(--sindoor)', marginTop:6}}>Click to change</p>
                </div>
              ) : (
                <>
                  <div style={{fontSize:'2rem', marginBottom:6}}>📷</div>
                  <div style={{fontWeight:600}}>Select photo to post</div>
                </>
              )}
            </div>
            <input type="file" ref={postRef} hidden accept="image/*" onChange={e => setPostingImage(e.target.files[0])} />
            <input className="form-input" placeholder={t('caption')} value={postCaption} onChange={e => setPostCaption(e.target.value)} style={{marginBottom:10}} />
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <p style={{fontSize:'0.78rem', color:'var(--text-light)'}}>{t('blueTickEarn')}</p>
              <button className="btn btn-primary btn-sm" onClick={createPost} disabled={posting}>{posting ? t('loading') : t('post')}</button>
            </div>
          </div>

          {/* Couple Photos */}
          <div className="card">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16}}>
              <div>
                <h3 style={{fontFamily:'Playfair Display'}}>{t('couplePics')}</h3>
                <p style={{fontSize:'0.8rem', color:'var(--text-light)', marginTop:4}}>Add photos with your partner</p>
              </div>
            </div>
            <div className="dropzone" onClick={() => coupleRef.current.click()} style={{marginBottom:16}}>
              {uploadingCouple ? <div>⏳ Uploading...</div> : (
                <>
                  <div style={{fontSize:'2rem', marginBottom:6}}>📸</div>
                  <div style={{fontWeight:600}}>{t('addCouplePhoto')}</div>
                  <div style={{fontSize:'0.78rem', marginTop:4}}>JPG, PNG up to 10MB • Max 10 photos</div>
                </>
              )}
            </div>
            <input type="file" ref={coupleRef} hidden accept="image/*" onChange={e => uploadCouplePhoto(e.target.files[0])} />
            {user?.couplePhotos?.length > 0 ? (
              <div className="photo-grid">
                {user.couplePhotos.map((url, i) => (
                  <div key={i} className="photo-thumb">
                    <img src={url} alt={`Couple ${i+1}`} />
                    <button className="photo-delete" onClick={() => deleteCouple(url)}>✕</button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{textAlign:'center', padding:'30px 20px', color:'var(--text-light)'}}>
                <div style={{fontSize:'3rem'}}>👫</div>
                <p style={{marginTop:8}}>No couple photos yet</p>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="card" style={{background:'linear-gradient(135deg,#FFF8F0,white)'}}>
            <h3 style={{fontSize:'0.95rem', marginBottom:12}}>{t('tips')}</h3>
            <ul style={{listStyle:'none', display:'flex', flexDirection:'column', gap:7}}>
              {['✅ Use a clear face photo for search matching', '✅ Add couple photos for authenticity', '✅ Keep city & age updated', '✅ Post 100+ times to earn Blue Tick ✅', '✅ Upgrade badge to stand out'].map((tip, i) => (
                <li key={i} style={{fontSize:'0.82rem', color:'var(--text-light)'}}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
