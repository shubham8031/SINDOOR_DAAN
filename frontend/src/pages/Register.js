import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { INDIA_STATES } from '../utils/indiaData';

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    age: '', dob: '', city: '', state: '', district: '', currentCity: '',
    pincode: '', gender: '', occupation: '', phone: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password min 6 characters');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', { ...form, language: lang });
      login(res.data.token, res.data.user);
      toast.success('Account created! 💕');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{minHeight:'calc(100vh - 62px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'30px 20px', background:'radial-gradient(ellipse at top, rgba(196,30,58,0.07) 0%, transparent 60%)'}}>
      <div className="card" style={{width:'100%', maxWidth:680, textAlign:'center'}}>
        <div style={{fontSize:'2.5rem', marginBottom:12}}>🔴</div>
        <h2 style={{fontFamily:'Playfair Display', fontSize:'1.7rem', color:'var(--sindoor-dark)', marginBottom:6}}>{t('createAccount')}</h2>
        <p style={{color:'var(--text-light)', fontSize:'0.85rem', marginBottom:24}}>{t('registerSubtitle')}</p>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('fullName')} *</label>
              <input className="form-input" placeholder="Aapka naam" value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">{t('email')} *</label>
              <input type="email" className="form-input" placeholder="email@example.com" value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('password')} *</label>
              <input type="password" className="form-input" placeholder="Min 6 characters" value={form.password} onChange={e => set('password', e.target.value)} required minLength={6} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('confirmPassword')} *</label>
              <input type="password" className="form-input" placeholder="Repeat password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('age')}</label>
              <input type="number" className="form-input" placeholder="25" value={form.age} onChange={e => set('age', e.target.value)} min={18} max={80} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('dob')}</label>
              <input type="date" className="form-input" value={form.dob} onChange={e => set('dob', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('gender')} *</label>
              <select className="form-select" value={form.gender} onChange={e => set('gender', e.target.value)} required>
                <option value="">Select</option>
                <option value="male">{t('male')}</option>
                <option value="female">{t('female')}</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t('phone')}</label>
              <input type="tel" className="form-input" placeholder="+91 98765 43210" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('state')}</label>
              <select className="form-select" value={form.state} onChange={e => set('state', e.target.value)}>
                <option value="">Select State</option>
                {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t('district')}</label>
              <input className="form-input" placeholder="Your district" value={form.district} onChange={e => set('district', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('city')}</label>
              <input className="form-input" placeholder="Mumbai, Delhi..." value={form.city} onChange={e => set('city', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('currentCity')}</label>
              <input className="form-input" placeholder="Current city (if different)" value={form.currentCity} onChange={e => set('currentCity', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('pincode')}</label>
              <input className="form-input" placeholder="110001" value={form.pincode} onChange={e => set('pincode', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('occupation')}</label>
              <input className="form-input" placeholder="Software Engineer..." value={form.occupation} onChange={e => set('occupation', e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{marginTop:8}}>
            {loading ? t('loading') : `${t('createAccount')} →`}
          </button>
        </form>
        <p style={{marginTop:16, fontSize:'0.85rem', color:'var(--text-light)'}}>
          {t('alreadyAccount')} <Link to="/login" style={{color:'var(--sindoor)', fontWeight:600, textDecoration:'none'}}>{t('loginHere')}</Link>
        </p>
      </div>
    </div>
  );
}
