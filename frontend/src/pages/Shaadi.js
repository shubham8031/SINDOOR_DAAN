import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';
import { RELIGIONS, CASTES, PROFESSIONS, INDIA_STATES } from '../utils/indiaData';

const BADGE_ICONS = { bronze: '🥉', silver: '🥈', gold: '🥇', diamond: '💎', platinum: '🏆' };

export default function Shaadi() {
  const { t } = useLang();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    gender: searchParams.get('gender') || '',
    religion: '', caste: searchParams.get('caste') || '',
    profession: searchParams.get('profession') || '',
    state: '', minAge: '', maxAge: '', intercasteOk: false
  });
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedReligion, setSelectedReligion] = useState('Hindu');
  const set = (k, v) => setFilters(prev => ({ ...prev, [k]: v }));

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
      const res = await axios.get(`/api/shaadi/search?${params}`);
      setProfiles(Array.isArray(res.data) ? res.data : []);
    } catch { setProfiles([]); } finally { setLoading(false); }
  };

  useEffect(() => {
    if (searchParams.get('gender')) handleSearch();
  }, []);

  const castesForReligion = CASTES[selectedReligion] || [];

  return (
    <div className="shaadi-page">
      {/* Hero */}
      <div className="shaadi-hero">
        <h1 className="shaadi-title">💍 {t('shaadiTitle')}</h1>
        <p style={{opacity:0.85, fontSize:'1rem'}}>{t('shaadiSubtitle')}</p>
      </div>

      <div className="container" style={{padding:'28px 20px'}}>
        {/* Filters */}
        <div className="card" style={{marginBottom:24}}>
          <h3 style={{fontFamily:'Playfair Display', marginBottom:18}}>🔍 Find Your Match</h3>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:14}}>
            <div className="form-group">
              <label className="form-label">{t('selectGender')}</label>
              <select className="form-select" value={filters.gender} onChange={e => set('gender', e.target.value)}>
                <option value="">Any</option>
                <option value="male">{t('boy')}</option>
                <option value="female">{t('girl')}</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t('religion')}</label>
              <select className="form-select" value={selectedReligion} onChange={e => { setSelectedReligion(e.target.value); set('religion', e.target.value); set('caste', ''); }}>
                {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t('selectCaste')}</label>
              <select className="form-select" value={filters.caste} onChange={e => set('caste', e.target.value)}>
                <option value="intercaste">{t('intercasteOption')}</option>
                {castesForReligion.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t('selectProfession')}</label>
              <select className="form-select" value={filters.profession} onChange={e => set('profession', e.target.value)}>
                <option value="">Any Profession</option>
                {Object.keys(PROFESSIONS).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t('state')}</label>
              <select className="form-select" value={filters.state} onChange={e => set('state', e.target.value)}>
                <option value="">All States</option>
                {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Age Range</label>
              <div style={{display:'flex', gap:8}}>
                <input className="form-input" type="number" placeholder="Min" value={filters.minAge} onChange={e => set('minAge', e.target.value)} />
                <input className="form-input" type="number" placeholder="Max" value={filters.maxAge} onChange={e => set('maxAge', e.target.value)} />
              </div>
            </div>
          </div>
          <div style={{marginTop:16, display:'flex', gap:12, alignItems:'center'}}>
            <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
              {loading ? 'Searching...' : '🔍 Search Profiles'}
            </button>
            {user && <Link to="/dashboard" className="btn btn-outline btn-sm">{t('createShaadiProfile')}</Link>}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div style={{textAlign:'center', padding:40}}><div className="sindoor-loader" style={{margin:'0 auto'}}></div></div>
        ) : searched && (
          <div>
            <h3 style={{fontFamily:'Playfair Display', marginBottom:18}}>{profiles.length} Profiles Found</h3>
            {profiles.length === 0 ? (
              <div className="card" style={{textAlign:'center', padding:40}}>
                <div style={{fontSize:'3rem'}}>🙅</div>
                <h4 style={{marginTop:12}}>No profiles found</h4>
                <p style={{color:'var(--text-light)', fontSize:'0.88rem', marginTop:6}}>Try different filters</p>
              </div>
            ) : (
              <div className="user-grid">
                {profiles.map(profile => (
                  <Link to={`/shaadi/profile/${profile._id}`} key={profile._id} className="user-card">
                    <div className="user-card-img">
                      {profile.shaadi?.photos?.[0] || profile.profilePhoto
                        ? <img src={profile.shaadi?.photos?.[0] || profile.profilePhoto} alt={profile.name} />
                        : <span>{profile.gender === 'female' ? '👩' : '👨'}</span>}
                    </div>
                    <div className="user-card-body">
                      <div className="user-card-name">
                        {profile.name} {BADGE_ICONS[profile.badge || 'bronze']} {profile.blueTick ? '✅' : ''}
                      </div>
                      <div className="user-card-meta">
                        {profile.age && `${profile.age} yrs`}{profile.city && ` • ${profile.city}`}
                        {profile.shaadi?.caste && ` • ${profile.shaadi.caste}`}
                      </div>
                      {profile.occupation && <div style={{fontSize:'0.78rem', color:'var(--sindoor)', marginTop:4}}>💼 {profile.occupation}</div>}
                      <div style={{marginTop:8}}>
                        <button className="btn btn-primary btn-sm" style={{fontSize:'0.75rem', padding:'5px 12px'}}>
                          💬 {t('sendMessage')}
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {!searched && (
          <div className="card" style={{textAlign:'center', padding:50}}>
            <div style={{fontSize:'4rem', marginBottom:16}}>💍</div>
            <h3 style={{fontFamily:'Playfair Display', fontSize:'1.4rem', marginBottom:8}}>Find Your Perfect Match</h3>
            <p style={{color:'var(--text-light)', fontSize:'0.9rem'}}>Use filters above to find profiles</p>
          </div>
        )}
      </div>
    </div>
  );
}
