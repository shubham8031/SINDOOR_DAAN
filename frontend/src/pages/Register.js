import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    age: '', city: '', gender: '', occupation: '', phone: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', form);
      login(res.data.token, res.data.user);
      toast.success('Account created! Now add your couple photos 💕');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (key, val) => setForm(prev => ({...prev, [key]: val}));

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide card">
        <div className="auth-logo">🔴</div>
        <h2 className="auth-title">Create Free Account</h2>
        <p className="auth-subtitle">Join Sindoor Daan & register your relationship</p>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input type="text" className="form-input" placeholder="Your name"
                value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input type="email" className="form-input" placeholder="your@email.com"
                value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input type="password" className="form-input" placeholder="Min 6 characters"
                value={form.password} onChange={e => set('password', e.target.value)} required minLength={6} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input type="password" className="form-input" placeholder="Repeat password"
                value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Age</label>
              <input type="number" className="form-input" placeholder="Your age"
                value={form.age} onChange={e => set('age', e.target.value)} min={18} max={80} />
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <input type="text" className="form-input" placeholder="Mumbai, Delhi..."
                value={form.city} onChange={e => set('city', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="form-select" value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Occupation</label>
              <input type="text" className="form-input" placeholder="Software Engineer..."
                value={form.occupation} onChange={e => set('occupation', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Phone (optional)</label>
            <input type="tel" className="form-input" placeholder="+91 98765 43210"
              value={form.phone} onChange={e => set('phone', e.target.value)} />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Free Account →'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}
