import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', form);
      login(res.data.token, res.data.user);
      toast.success('Welcome back! 💕');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{minHeight:'calc(100vh - 62px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20, background:'radial-gradient(ellipse at top, rgba(196,30,58,0.07) 0%, transparent 60%)'}}>
      <div className="card" style={{width:'100%', maxWidth:420, textAlign:'center'}}>
        <div style={{fontSize:'3rem', marginBottom:14}}>🔴</div>
        <h2 style={{fontFamily:'Playfair Display', fontSize:'1.7rem', color:'var(--sindoor-dark)', marginBottom:6}}>{t('welcomeBack')}</h2>
        <p style={{color:'var(--text-light)', fontSize:'0.88rem', marginBottom:24}}>{t('loginSubtitle')}</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t('email')}</label>
            <input type="email" className="form-input" placeholder="your@email.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">{t('password')}</label>
            <input type="password" className="form-input" placeholder="••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{marginTop:8}}>
            {loading ? t('loading') : t('loginBtn')}
          </button>
        </form>
        <p style={{marginTop:18, fontSize:'0.88rem', color:'var(--text-light)'}}>
          {t('noAccount')} <Link to="/register" style={{color:'var(--sindoor)', fontWeight:600, textDecoration:'none'}}>{t('createAccount')}</Link>
        </p>
      </div>
    </div>
  );
}
