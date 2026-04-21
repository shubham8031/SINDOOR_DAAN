import React, { useState, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { getFaceDescriptorFromFile } from '../utils/faceUtils';
import './Search.css';

export default function Search() {
  const [tab, setTab] = useState('face'); // 'face' | 'name'
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [nameForm, setNameForm] = useState({ name: '', city: '', age: '', gender: '' });
  const fileRef = useRef();

  // Face search
  const handleFaceSearch = async (file) => {
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setSearching(true);
    setResults(null);
    try {
      toast.loading('Detecting face...', { id: 'search' });
      const descriptor = await getFaceDescriptorFromFile(file);
      if (!descriptor) {
        toast.error('No face detected! Please use a clear face photo.', { id: 'search' });
        setSearching(false);
        return;
      }
      toast.loading('Searching database...', { id: 'search' });
      const res = await axios.post('/api/search/by-face', { descriptor });
      toast.dismiss('search');
      setResults({ type: 'face', data: res.data });
    } catch (err) {
      toast.error('Search failed. Try again.', { id: 'search' });
    } finally {
      setSearching(false);
    }
  };

  // Name search
  const handleNameSearch = async (e) => {
    e.preventDefault();
    if (!nameForm.name && !nameForm.city) return toast.error('Enter at least a name or city');
    setSearching(true);
    setResults(null);
    try {
      const params = new URLSearchParams();
      if (nameForm.name) params.append('name', nameForm.name);
      if (nameForm.city) params.append('city', nameForm.city);
      if (nameForm.age) params.append('age', nameForm.age);
      if (nameForm.gender) params.append('gender', nameForm.gender);
      const res = await axios.get(`/api/search/by-name?${params}`);
      setResults({ type: 'name', data: res.data });
    } catch {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const statusClass = (s) => s === 'single' ? 'status-single' : 'status-taken';
  const statusLabel = (s) => s === 'married' ? '💍 Married' : s === 'taken' ? '❤️ In Relationship' : '💚 Single';

  return (
    <div className="search-page">
      <div className="search-hero">
        <h1 className="search-title">🔍 Search Someone</h1>
        <p className="search-subtitle">Upload their photo or search by name to check relationship status</p>
      </div>

      <div className="container">
        {/* Tabs */}
        <div className="search-tabs">
          <button
            className={`search-tab ${tab === 'face' ? 'active' : ''}`}
            onClick={() => { setTab('face'); setResults(null); }}
          >
            📸 Photo Search <span className="tab-badge">AI</span>
          </button>
          <button
            className={`search-tab ${tab === 'name' ? 'active' : ''}`}
            onClick={() => { setTab('name'); setResults(null); }}
          >
            🔤 Name Search
          </button>
        </div>

        <div className="search-body">
          {/* Face Search */}
          {tab === 'face' && (
            <div className="card face-search-card">
              <h2>Photo / Face Search</h2>
              <p className="search-desc">Upload a photo of the person you want to verify. Our AI will match their face against all registered profiles.</p>

              <div
                className={`dropzone face-dropzone ${searching ? 'disabled' : ''}`}
                onClick={() => !searching && fileRef.current.click()}
              >
                {previewUrl ? (
                  <div className="preview-wrap">
                    <img src={previewUrl} alt="Preview" className="face-preview" />
                    {!searching && <p className="change-photo">Click to change photo</p>}
                  </div>
                ) : (
                  <>
                    <div className="dz-icon">🤳</div>
                    <div className="dz-title">Drop photo here or click to upload</div>
                    <div className="dz-sub">JPG, PNG supported • Face should be clearly visible</div>
                  </>
                )}
              </div>
              <input type="file" ref={fileRef} hidden accept="image/*"
                onChange={e => handleFaceSearch(e.target.files[0])} />

              {searching && (
                <div className="searching-indicator">
                  <div className="sindoor-loader" style={{ width: 30, height: 30, margin: '0 auto 10px' }}></div>
                  <p>AI analyzing face & searching database...</p>
                </div>
              )}

              {results?.type === 'face' && (
                <div className="results-section">
                  <h3>Search Results ({results.data.total} found)</h3>
                  {results.data.total === 0 ? (
                    <div className="no-results">
                      <div style={{ fontSize: '3rem' }}>🙅</div>
                      <h4>No Match Found</h4>
                      <p>This person hasn't registered on Sindoor Daan yet, or they have a private profile.</p>
                    </div>
                  ) : (
                    <div className="user-grid">
                      {results.data.matches.map(({ user, confidence }) => (
                        <Link to={`/profile/${user._id}`} key={user._id} className="user-card">
                          <div className="user-card-img">
                            {user.profilePhoto ? <img src={user.profilePhoto} alt={user.name} /> : <span>👤</span>}
                          </div>
                          <div className="user-card-body">
                            <div className="user-card-name">{user.name}</div>
                            <div className="user-card-meta">
                              {user.age && `${user.age} yrs`}{user.city && ` • ${user.city}`}
                            </div>
                            <span className={`status-badge ${statusClass(user.status)}`}>{statusLabel(user.status)}</span>
                            <div className="confidence-bar">
                              <div className="confidence-fill" style={{ width: `${confidence}%` }}></div>
                              <span>{confidence}% match</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Name Search */}
          {tab === 'name' && (
            <div className="card name-search-card">
              <h2>Search by Name & Details</h2>
              <p className="search-desc">Search by name, city, age to find someone. Since many people share names, use multiple filters for better results.</p>

              <form onSubmit={handleNameSearch} className="name-form">
                <div className="name-form-grid">
                  <div className="form-group">
                    <label className="form-label">Name</label>
                    <input className="form-input" placeholder="Rahul, Priya..."
                      value={nameForm.name} onChange={e => setNameForm({...nameForm, name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input className="form-input" placeholder="Mumbai, Delhi..."
                      value={nameForm.city} onChange={e => setNameForm({...nameForm, city: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Approx. Age</label>
                    <input type="number" className="form-input" placeholder="25"
                      value={nameForm.age} onChange={e => setNameForm({...nameForm, age: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select className="form-select" value={nameForm.gender} onChange={e => setNameForm({...nameForm, gender: e.target.value})}>
                      <option value="">Any</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={searching}>
                  {searching ? 'Searching...' : '🔍 Search Now'}
                </button>
              </form>

              {results?.type === 'name' && (
                <div className="results-section">
                  <h3>Results ({results.data.length} found)</h3>
                  {results.data.length === 0 ? (
                    <div className="no-results">
                      <div style={{ fontSize: '3rem' }}>🙅</div>
                      <h4>No profiles found</h4>
                      <p>Try different search terms or use photo search for better results.</p>
                    </div>
                  ) : (
                    <div className="user-grid">
                      {results.data.map(user => (
                        <Link to={`/profile/${user._id}`} key={user._id} className="user-card">
                          <div className="user-card-img">
                            {user.profilePhoto ? <img src={user.profilePhoto} alt={user.name} /> : <span>👤</span>}
                          </div>
                          <div className="user-card-body">
                            <div className="user-card-name">{user.name}</div>
                            <div className="user-card-meta">
                              {user.age && `${user.age} yrs`}{user.city && ` • ${user.city}`}
                              {user.occupation && ` • ${user.occupation}`}
                            </div>
                            <span className={`status-badge ${statusClass(user.status)}`}>{statusLabel(user.status)}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
