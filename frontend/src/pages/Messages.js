import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

const BADGE_ICONS = { bronze: '🥉', silver: '🥈', gold: '🥇', diamond: '💎', platinum: '🏆' };

export default function Messages() {
  const { user } = useAuth();
  const { t } = useLang();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgText, setMsgText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    axios.get('/api/messages/chats').then(res => setChats(Array.isArray(res.data) ? res.data : [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedChat) {
      axios.get(`/api/messages/conversation/${selectedChat.user._id}`)
        .then(res => { setMessages(Array.isArray(res.data) ? res.data : []); })
        .catch(() => {});
    }
  }, [selectedChat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMsg = async () => {
    if (!msgText.trim() || !selectedChat) return;
    setSending(true);
    try {
      const res = await axios.post('/api/messages/send', { receiverId: selectedChat.user._id, text: msgText });
      setMessages(prev => [...prev, res.data]);
      setMsgText('');
    } catch {} finally { setSending(false); }
  };

  return (
    <div className="chat-container">
      {/* Chat list */}
      <div className="chat-list">
        <div style={{padding:'14px 16px', fontFamily:'Playfair Display', fontSize:'1.1rem', borderBottom:'1px solid var(--border)'}}>
          {t('messages')}
        </div>
        {chats.length === 0 ? (
          <div style={{padding:30, textAlign:'center', color:'var(--text-light)', fontSize:'0.85rem'}}>
            <div style={{fontSize:'2.5rem', marginBottom:8}}>💬</div>
            {t('noMessages')}
          </div>
        ) : chats.map((chat, i) => (
          <div key={i} className={`chat-item ${selectedChat?.user._id === chat.user._id ? 'active' : ''}`} onClick={() => setSelectedChat(chat)}>
            {chat.user.profilePhoto
              ? <img src={chat.user.profilePhoto} alt="" className="chat-avatar" />
              : <div className="chat-avatar" style={{background:'var(--cream)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem'}}>👤</div>}
            <div>
              <div className="chat-name">{chat.user.name} {BADGE_ICONS[chat.user.badge || 'bronze']} {chat.user.blueTick ? '✅' : ''}</div>
              <div className="chat-last">{chat.lastMessage}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Message area */}
      <div className="message-area">
        {!selectedChat ? (
          <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', color:'var(--text-light)', gap:12}}>
            <div style={{fontSize:'4rem'}}>💬</div>
            <p>Select a conversation</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{padding:'12px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:12, background:'white'}}>
              {selectedChat.user.profilePhoto
                ? <img src={selectedChat.user.profilePhoto} alt="" style={{width:40, height:40, borderRadius:'50%', objectFit:'cover'}} />
                : <div style={{width:40, height:40, borderRadius:'50%', background:'var(--cream)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem'}}>👤</div>}
              <div>
                <div style={{fontWeight:600, fontSize:'0.95rem'}}>{selectedChat.user.name} {BADGE_ICONS[selectedChat.user.badge || 'bronze']}</div>
              </div>
            </div>

            {/* Messages */}
            <div className="messages-list">
              {messages.length === 0 ? (
                <div style={{textAlign:'center', color:'var(--text-light)', fontSize:'0.85rem', padding:20}}>Start the conversation!</div>
              ) : messages.map((msg, i) => {
                const isSent = msg.sender === user?.id || msg.sender?._id === user?.id;
                return (
                  <div key={i} className={`message-bubble ${isSent ? 'message-sent' : 'message-recv'}`}>
                    {msg.text}
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="message-input-area">
              <input
                className="message-input"
                placeholder={t('typeMessage')}
                value={msgText}
                onChange={e => setMsgText(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && sendMsg()}
              />
              <button className="btn btn-primary btn-sm" onClick={sendMsg} disabled={sending}>{t('send')}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
