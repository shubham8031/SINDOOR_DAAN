import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

export default function ShaadiProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msgText, setMsgText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    axios.get(`/api/users/${id}`).then(res => setProfile(res.data)).catch(() => setProfile(null)).finally(() => setLoading(false));
  }, [id]);

  const sendMessage = async () => {
    if (!user) return toast.error('Login to send message');
    if (!msgText.trim()) return;
    setSending(true);
    try {
      await axios.post('/api/messages/send', { receiverId: id, text: msgText });
      toast.success('Message sent! 💌');
      setMsgText('');
      navigate('/messages');
    } catch { toast.error('Failed to send'); } finally { setSending(false); }
  };

  if (loading) return <div className="loading-screen"><div className="sindoor-loader"></div></div>;
  if (!profile) return <div style={{textAlign:'center', padding:80}}><div style={{fontSize:'4rem'}}>🔒</div><h2>Profile Not Found</h2><Link to="/shaadi" className="btn btn-primary" style={{marginTop:20, display:'inline-block'}}>← Back</Link></div>;

  return (
    <div className="container" style={{padding:'28px 20px'}}>
      <Link to="/shaadi" style={{color:'var(--sindoor)', textDecoration:'none', fontSize:'0.9rem', marginBottom:20, display:'inline-block'}}>← Back to Shaadi</Link>
      <div style={{display:'grid', gridTemplateColumns:'300px 1fr', gap:22, alignItems:'start'}}>
        <div className="card" style={{textAlign:'center'}}>
          <div style={{width:130, height:130, borderRadius:'50%', margin:'0 auto 14px', overflow:'hidden', border:'3px solid var(--sindoor)'}}>
            {profile.shaadi?.photos?.[0] || profile.profilePhoto
              ? <img src={profile.shaadi?.photos?.[0] || profile.profilePhoto} alt={profile.name} style={{width:'100%', height:'100%', objectFit:'cover'}} />
              : <div style={{width:'100%', height:'100%', background:'var(--cream)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'3rem'}}>{profile.gender === 'female' ? '👩' : '👨'}</div>}
          </div>
          <h2 style={{fontFamily:'Playfair Display', fontSize:'1.3rem', marginBottom:8}}>{profile.name}</h2>
          {[['🎂 Age', profile.age], ['📍 City', profile.city], ['🏛️ State', profile.state], ['💼', profile.occupation], ['🕌 Religion', profile.shaadi?.religion], ['🏷️ Caste', profile.shaadi?.caste], ['📚 Education', profile.shaadi?.education], ['💰 Income', profile.shaadi?.income]].filter(([, v]) => v).map(([k, v]) => (
            <div key={k} style={{display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid rgba(0,0,0,0.05)', fontSize:'0.82rem'}}>
              <span style={{color:'var(--text-light)'}}>{k}</span><strong>{v}</strong>
            </div>
          ))}
          {profile.shaadi?.about && (
            <div style={{marginTop:14, textAlign:'left'}}>
              <p style={{fontWeight:600, fontSize:'0.85rem', marginBottom:6}}>About</p>
              <p style={{fontSize:'0.82rem', color:'var(--text-light)', lineHeight:1.6}}>{profile.shaadi.about}</p>
            </div>
          )}
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:18}}>
          {/* Photos */}
          {profile.shaadi?.photos?.length > 0 && (
            <div className="card">
              <h3 style={{fontFamily:'Playfair Display', marginBottom:14}}>Photos</h3>
              <div className="photo-grid">
                {profile.shaadi.photos.map((url, i) => (
                  <div key={i} style={{aspectRatio:1, borderRadius:10, overflow:'hidden'}}>
                    <img src={url} alt={i} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Send Message */}
          <div className="card">
            <h3 style={{fontFamily:'Playfair Display', marginBottom:14}}>💬 {t('sendMessage')}</h3>
            {user ? (
              <div style={{display:'flex', gap:10}}>
                <input className="form-input" style={{flex:1}} placeholder={t('typeMessage')} value={msgText} onChange={e => setMsgText(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendMessage()} />
                <button className="btn btn-primary" onClick={sendMessage} disabled={sending}>{sending ? '...' : t('send')}</button>
              </div>
            ) : (
              <div style={{textAlign:'center', padding:20}}>
                <p style={{color:'var(--text-light)', marginBottom:12}}>Login to send message</p>
                <Link to="/login" className="btn btn-primary btn-sm">Login</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
