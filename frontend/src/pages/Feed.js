import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

const BADGE_ICONS = { bronze: '🥉', silver: '🥈', gold: '🥇', diamond: '💎', platinum: '🏆' };

export default function Feed() {
  const { user } = useAuth();
  const { t } = useLang();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState({});

  useEffect(() => {
    axios.get('/api/posts/feed').then(res => setPosts(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleLike = async (postId) => {
    if (!user) return toast.error('Login to like');
    try {
      const res = await axios.post(`/api/posts/${postId}/like`);
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, likes: res.data.liked ? [...p.likes, user.id] : p.likes.filter(id => id !== user.id) } : p));
    } catch { toast.error('Failed'); }
  };

  const handleComment = async (postId) => {
    if (!user) return toast.error('Login to comment');
    const text = commentText[postId];
    if (!text?.trim()) return;
    try {
      await axios.post(`/api/posts/${postId}/comment`, { text });
      setCommentText(prev => ({ ...prev, [postId]: '' }));
      const res = await axios.get('/api/posts/feed');
      setPosts(res.data);
    } catch { toast.error('Failed'); }
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (loading) return <div className="loading-screen"><div className="sindoor-loader"></div></div>;

  return (
    <div style={{maxWidth:600, margin:'0 auto', padding:'28px 20px'}}>
      <h1 className="section-title">📸 {t('feed')}</h1>
      <div className="section-divider"></div>

      {posts.length === 0 ? (
        <div className="card" style={{textAlign:'center', padding:50}}>
          <div style={{fontSize:'3rem', marginBottom:12}}>📸</div>
          <h3>No posts yet</h3>
          <p style={{color:'var(--text-light)', marginTop:8}}>Be the first to post!</p>
          {user && <Link to="/dashboard" className="btn btn-primary" style={{marginTop:16, display:'inline-block'}}>{t('addPost')}</Link>}
        </div>
      ) : posts.map(post => (
        <div key={post._id} className="post-card">
          {/* Header */}
          <div className="post-header">
            <Link to={`/profile/${post.user?._id}`}>
              {post.user?.profilePhoto
                ? <img src={post.user.profilePhoto} alt="" className="post-avatar" />
                : <div className="post-avatar" style={{background:'var(--cream)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem'}}>👤</div>}
            </Link>
            <div style={{flex:1}}>
              <div className="post-user-name">
                <Link to={`/profile/${post.user?._id}`} style={{textDecoration:'none', color:'inherit'}}>
                  {post.user?.name} {BADGE_ICONS[post.user?.badge || 'bronze']} {post.user?.blueTick ? '✅' : ''}
                </Link>
              </div>
              <div className="post-time">{timeAgo(post.createdAt)}</div>
            </div>
          </div>
          {/* Image */}
          <img src={post.image} alt="Post" className="post-image" />
          {/* Actions */}
          <div className="post-actions">
            <button className={`post-action-btn ${post.likes?.includes(user?.id) ? 'liked' : ''}`} onClick={() => handleLike(post._id)}>
              {post.likes?.includes(user?.id) ? '❤️' : '🤍'} {post.likes?.length || 0}
            </button>
            <span style={{fontSize:'0.85rem', color:'var(--text-light)'}}>💬 {post.comments?.length || 0}</span>
          </div>
          {/* Caption */}
          {post.caption && <div className="post-caption"><strong>{post.user?.name}</strong> {post.caption}</div>}
          {/* Comments */}
          {post.comments?.length > 0 && (
            <div style={{padding:'0 14px 10px'}}>
              {post.comments.slice(-2).map((c, i) => (
                <div key={i} style={{fontSize:'0.82rem', marginBottom:4}}>
                  <strong>User</strong> {c.text}
                </div>
              ))}
            </div>
          )}
          {/* Comment input */}
          {user && (
            <div style={{padding:'10px 14px', borderTop:'1px solid var(--border)', display:'flex', gap:8}}>
              <input
                className="form-input" style={{flex:1, fontSize:'0.82rem', padding:'7px 12px'}}
                placeholder={t('caption')}
                value={commentText[post._id] || ''}
                onChange={e => setCommentText(prev => ({ ...prev, [post._id]: e.target.value }))}
                onKeyPress={e => e.key === 'Enter' && handleComment(post._id)}
              />
              <button className="btn btn-primary btn-sm" onClick={() => handleComment(post._id)}>{t('send')}</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
