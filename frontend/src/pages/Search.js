import React, { useState, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { getFaceDescriptorFromFile } from '../utils/faceUtils';
import { useLang } from '../context/LangContext';
import { INDIA_STATES } from '../utils/indiaData';
import './Search.css';

const BADGE_ICONS = { bronze: '🥉', silver: '🥈', gold: '🥇', diamond: '💎', platinum: '🏆' };

export default function Search() {
  const { t } = useLang();
  const [tab, setTab] = useState('face');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [nameForm, setNameForm] = useState({ name: '', city: '', age: '', gender: '', state: '' });
  const [voiceStep, setVoiceStep] = useState(0);
  const [voiceData, setVoiceData] = useState({});
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const fileRef = useRef();

  const handleFaceSearch = async (file) => {
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setSearching(true);
    setResults(null);
    try {
      toast.loading(t('searching'), { id: 'search' });
      const descriptor = await getFaceDescriptorFromFile(file);
      if (!descriptor) {
        toast.error('No face detected! Use a clear face photo.', { id: 'search' });
        setSearching(false);
        return;
      }
      const res = await axios.post('/api/search/by-face', { descriptor });
      toast.dismiss('search');
      setResults({ type: 'face', data: res.data });
    } catch {
      toast.error('Search failed. Try again.', { id: 'search' });
    } finally {
      setSearching(false);
    }
  };

  const handleNameSearch = async (e) => {
    e.preventDefault();
    setSearching(true);
    setResults(null);
    try {
      const params = new URLSearchParams();
      Object.entries(nameForm).forEach(([k, v]) => { if (v) params.append(k, v); });
      const res = await axios.get(`/api/search/by-name?${params}`);
      setResults({ type: 'name', data: Array.isArray(res.data) ? res.data : [] });
    } catch {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error('Voice not supported in this browser');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.interimResults = false;

    const questions = [
      { ask: t('voiceAsk1'), key: 'gender' },
      { ask: t('voiceAsk2'), key: 'caste' },
      { ask: t('voiceAsk3'), key: 'profession' },
    ];

    const speak = (text) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    };

    const askQuestion = (step) => {
      if (step >= questions.length) {
        speak(t('voiceResult'));
        setTimeout(() => {
          window.location.href = `/shaadi?gender=${voiceData.gender || ''}&caste=${voiceData.caste || ''}&profession=${voiceData.profession || ''}`;
        }, 2000);
        return;
      }
      speak(questions[step].ask);
      setVoiceStep(step);
      setTimeout(() => {
        setIsListening(true);
        recognition.start();
        recognition.onresult = (event) => {
          const result = event.results[0][0].transcript;
          setTranscript(result);
          setVoiceData(prev => ({ ...prev, [questions[step].key]: result }));
          setIsListening(false);
          recognition.stop();
          setTimeout(() => askQuestion(step + 1), 500);
        };
        recognition.onerror = () => { setIsListening(false); };
      }, 2000);
    };

    speak("नमस्ते! सिंदूर दान में आपका स्वागत है।");
    setTimeout(() => askQuestion(0), 1500);
  };

  const statusClass = (s) => s === 'single' ? 'status-single' : 'status-taken';
  const statusLabel = (s) => s === 'married' ? t('married') : s === 'taken' ? t('taken') : t('single');

  const UserCard = ({ user, confidence }) => (
    <Link to={`/profile/${user._id}`} className="user-card">
      <div className="user-card-img">
        {user.profilePhoto ? <img src={user.profilePhoto} alt={user.name} /> : <span>👤</span>}
      </div>
      <div className="user-card-body">
        <div className="user-card-name">
          {user.name} {BADGE_ICONS[user.badge || 'bronze']} {user.blueTick ? '✅' : ''}
        </div>
        <div className="user-card-meta">
          {user.age && `${user.age} yrs`}{user.city && ` • ${user.city}`}
        </div>
        <span className={`status-badge ${statusClass(user.status)}`}>{statusLabel(user.status)}</span>
        {confidence && (
          <div>
            <div className="confidence-bar"><div className="confidence-fill" style={{ width: `${confidence}%` }}></div></div>
            <div className="confidence-text">{confidence}% {t('matchFound')}</div>
          </div>
        )}
      </div>
    </Link>
  );

  return (
    <div className="search-page">
      <div className="search-hero">
        <h1 className="search-title">🔍 {t('searchTitle')}</h1>
        <p className="search-subtitle">{t('searchSubtitle')}</p>
      </div>
      <div className="container">
        <div className="search-tabs">
          <button className={`search-tab ${tab === 'face' ? 'active' : ''}`} onClick={() => { setTab('face'); setResults(null); }}>
            📸 {t('photoSearch')} <span className="tab-badge">AI</span>
          </button>
          <button className={`search-tab ${tab === 'name' ? 'active' : ''}`} onClick={() => { setTab('name'); setResults(null); }}>
            🔤 {t('nameSearch')}
          </button>
          <button className={`search-tab ${tab === 'voice' ? 'active' : ''}`} onClick={() => { setTab('voice'); setResults(null); }}>
            🎤 {t('voiceSearch')}
          </button>
        </div>

        <div className="search-body">
          {tab === 'face' && (
            <div className="card">
              <h2>📸 {t('photoSearch')}</h2>
              <p className="search-desc" style={{margin:'8px 0 20px', color:'var(--text-light)', fontSize:'0.88rem'}}>
                Upload a clear photo. Our AI will match the face against all registered profiles.
              </p>
              <div className={`dropzone face-dropzone ${searching ? 'disabled' : ''}`} onClick={() => !searching && fileRef.current.click()}>
                {previewUrl ? (
                  <div style={{textAlign:'center'}}>
                    <img src={previewUrl} alt="Preview" style={{maxWidth:220, maxHeight:220, borderRadius:12, objectFit:'cover'}} />
                    {!searching && <p style={{fontSize:'0.8rem', color:'var(--sindoor)', marginTop:8}}>Click to change</p>}
                  </div>
                ) : (
                  <>
                    <div style={{fontSize:'2.5rem', marginBottom:10}}>🤳</div>
                    <div style={{fontWeight:600}}>{t('dropPhoto')}</div>
                    <div style={{fontSize:'0.8rem', marginTop:4}}>{t('photoSupport')}</div>
                  </>
                )}
              </div>
              <input type="file" ref={fileRef} hidden accept="image/*" onChange={e => handleFaceSearch(e.target.files[0])} />
              {searching && <div style={{textAlign:'center', padding:20, color:'var(--text-light)'}}><div className="sindoor-loader" style={{width:30,height:30,margin:'0 auto 10px'}}></div><p>{t('searching')}</p></div>}
              {results?.type === 'face' && (
                <div style={{marginTop:24}}>
                  <h3 style={{fontFamily:'Playfair Display',marginBottom:16}}>Results ({results.data.total} found)</h3>
                  {results.data.total === 0 ? (
                    <div style={{textAlign:'center', padding:40, background:'#f9f9f9', borderRadius:12}}>
                      <div style={{fontSize:'3rem'}}>🙅</div>
                      <h4>{t('noMatch')}</h4>
                      <p style={{color:'var(--text-light)', fontSize:'0.88rem'}}>{t('noMatchDesc')}</p>
                    </div>
                  ) : (
                    <div className="user-grid">
                      {results.data.matches.map(({ user, confidence }) => (
                        <UserCard key={user._id} user={user} confidence={confidence} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {tab === 'name' && (
            <div className="card">
              <h2>🔤 {t('nameSearch')}</h2>
              <form onSubmit={handleNameSearch} style={{marginTop:16}}>
                <div className="form-row" style={{marginBottom:14}}>
                  <div className="form-group">
                    <label className="form-label">{t('name')}</label>
                    <input className="form-input" placeholder="Rahul, Priya..." value={nameForm.name} onChange={e => setNameForm({...nameForm, name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('city')}</label>
                    <input className="form-input" placeholder="Mumbai, Delhi..." value={nameForm.city} onChange={e => setNameForm({...nameForm, city: e.target.value})} />
                  </div>
                </div>
                <div className="form-row" style={{marginBottom:14}}>
                  <div className="form-group">
                    <label className="form-label">{t('age')}</label>
                    <input type="number" className="form-input" placeholder="25" value={nameForm.age} onChange={e => setNameForm({...nameForm, age: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('gender')}</label>
                    <select className="form-select" value={nameForm.gender} onChange={e => setNameForm({...nameForm, gender: e.target.value})}>
                      <option value="">{t('anyGender')}</option>
                      <option value="male">{t('male')}</option>
                      <option value="female">{t('female')}</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('state')}</label>
                  <select className="form-select" value={nameForm.state} onChange={e => setNameForm({...nameForm, state: e.target.value})}>
                    <option value="">All States</option>
                    {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" disabled={searching}>{searching ? t('loading') : `🔍 ${t('searchNow')}`}</button>
              </form>
              {results?.type === 'name' && (
                <div style={{marginTop:24}}>
                  <h3 style={{fontFamily:'Playfair Display',marginBottom:16}}>Results ({results.data.length} found)</h3>
                  {results.data.length === 0 ? (
                    <div style={{textAlign:'center', padding:40, background:'#f9f9f9', borderRadius:12}}>
                      <div style={{fontSize:'3rem'}}>🙅</div>
                      <h4>{t('noMatch')}</h4>
                    </div>
                  ) : (
                    <div className="user-grid">
                      {results.data.map(user => <UserCard key={user._id} user={user} />)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {tab === 'voice' && (
            <div className="card" style={{textAlign:'center', padding:40}}>
              <h2>🎤 {t('voiceTitle')}</h2>
              <p style={{color:'var(--text-light)', margin:'10px 0 30px', fontSize:'0.9rem'}}>{t('voiceSubtitle')}</p>
              <button className={`voice-btn ${isListening ? 'listening' : ''}`} onClick={startVoiceSearch}>🎤</button>
              <p style={{marginTop:20, fontWeight:600}}>{isListening ? t('listening') : t('tapMic')}</p>
              {voiceStep > 0 && (
                <div style={{marginTop:20, background:'#FFF0F0', borderRadius:12, padding:16}}>
                  <p style={{fontSize:'0.85rem', color:'var(--text-light)'}}>Step {voiceStep}/3</p>
                  {transcript && <p style={{fontWeight:600, marginTop:8}}>"{transcript}"</p>}
                </div>
              )}
              <div style={{marginTop:24, background:'var(--cream)', borderRadius:12, padding:16, textAlign:'left'}}>
                <p style={{fontWeight:600, marginBottom:10}}>How it works:</p>
                <p style={{fontSize:'0.85rem', color:'var(--text-light)', lineHeight:1.8}}>
                  1. 🎤 Tap the mic button<br/>
                  2. 🗣️ Voice assistant will ask questions<br/>
                  3. 👤 Say: "Ladka" or "Ladki"<br/>
                  4. 🕌 Say caste name or "Intercaste"<br/>
                  5. 💼 Say profession like "Software Engineer"<br/>
                  6. ✅ Results will appear automatically!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
