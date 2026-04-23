'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Drawer from '@/components/Drawer';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase/config';
import {
  collection, addDoc, query, orderBy,
  onSnapshot, serverTimestamp, where,
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { getBrandSettings } from '@/lib/firebase-store';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  createdAt: any;
  senderName?: string;
};

export default function SupportPage() {
  const [drawer, setDrawer] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [started, setStarted] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { language } = useStore();
  const { user } = useAuth();
  const isRTL = language === 'ar';

  const sessionId = user?.uid || `guest_${Date.now()}`;

  useEffect(() => {
    getBrandSettings().then(s => {
      setWhatsappUrl(s.whatsappUrl || `https://wa.me/${s.whatsapp?.replace(/[^0-9]/g, '')}` || '');
    });
  }, []);

  useEffect(() => {
    if (!started && !user) return;
    const q = query(
      collection(db, 'supportChats', sessionId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as Message)));
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return () => unsub();
  }, [started, user]);

  const sendMessage = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'supportChats', sessionId, 'messages'), {
        text: text.trim(),
        sender: 'user',
        senderName: user?.displayName || guestName || 'زائر',
        userId: sessionId,
        createdAt: serverTimestamp(),
      });

      // Save chat metadata
      await addDoc(collection(db, 'supportSessions'), {
        sessionId,
        userName: user?.displayName || guestName || 'زائر',
        userEmail: user?.email || '',
        lastMessage: text.trim(),
        updatedAt: serverTimestamp(),
      }).catch(() => {});

      setText('');
    } catch {}
    setSending(false);
  };

  if (!user && !started) {
    return (
      <PageTransition>
        <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
          <Header onMenuOpen={() => setDrawer(true)} />
          <Drawer isOpen={drawer} onClose={() => setDrawer(false)} />
          <div style={{ maxWidth: 420, margin: '0 auto', padding: '80px 20px 60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <i className="fa-solid fa-headset" style={{ fontSize: 30, color: 'var(--paper)' }} />
            </div>
            <h1 style={{ fontFamily: 'Cairo', fontWeight: 900, fontSize: 24, color: 'var(--ink)', textAlign: 'center' }}>
              {isRTL ? 'الدعم الفني' : 'Customer Support'}
            </h1>
            <p style={{ fontFamily: 'Cairo', fontSize: 13, color: 'var(--mid)', textAlign: 'center', lineHeight: 1.8 }}>
              {isRTL ? 'نحن هنا لمساعدتك. ابدأ المحادثة أو تواصل معنا عبر واتساب.' : "We're here to help. Start a chat or reach us on WhatsApp."}
            </p>
            <input
              type="text"
              value={guestName}
              onChange={e => setGuestName(e.target.value)}
              placeholder={isRTL ? 'اسمك (اختياري)' : 'Your name (optional)'}
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--paper-soft)', color: 'var(--ink)', fontSize: 14, fontFamily: 'Cairo', boxSizing: 'border-box', outline: 'none' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStarted(true)}
                style={{ width: '100%', padding: '13px', borderRadius: 12, border: 'none', background: 'var(--ink)', color: 'var(--paper)', fontFamily: 'Cairo', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <i className="fa-solid fa-comments" />
                {isRTL ? 'ابدأ المحادثة' : 'Start Chat'}
              </motion.button>
              {whatsappUrl && (
                <motion.a href={whatsappUrl} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.02 }}
                  style={{ width: '100%', padding: '13px', borderRadius: 12, border: 'none', background: '#25D366', color: '#fff', fontFamily: 'Cairo', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none', boxSizing: 'border-box' }}>
                  <i className="fa-brands fa-whatsapp" style={{ fontSize: 18 }} />
                  {isRTL ? 'تواصل عبر واتساب' : 'Chat on WhatsApp'}
                </motion.a>
              )}
            </div>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex', flexDirection: 'column' }}>
        <Header onMenuOpen={() => setDrawer(true)} />
        <Drawer isOpen={drawer} onClose={() => setDrawer(false)} />

        <div style={{ maxWidth: 600, margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', padding: '64px 0 0' }}>

          {/* Chat header */}
          <div style={{ padding: '16px 20px', background: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fa-solid fa-headset" style={{ fontSize: 18, color: '#fff' }} />
            </div>
            <div>
              <p style={{ fontFamily: 'Cairo', fontWeight: 700, fontSize: 14, color: '#fff' }}>
                {isRTL ? 'فريق الدعم — زيّ' : 'Zayy Support Team'}
              </p>
              <p style={{ fontFamily: 'Cairo', fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                {isRTL ? 'متاح لمساعدتك' : 'Here to help'}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0, maxHeight: 'calc(100vh - 280px)' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--mid)' }}>
                <i className="fa-regular fa-comments" style={{ fontSize: 40, display: 'block', marginBottom: 10 }} />
                <p style={{ fontFamily: 'Cairo', fontSize: 13 }}>
                  {isRTL ? 'ابدأ المحادثة...' : 'Start the conversation...'}
                </p>
              </div>
            )}
            {messages.map(msg => (
              <motion.div key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div style={{
                  maxWidth: '75%',
                  padding: '10px 14px',
                  borderRadius: msg.sender === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: msg.sender === 'user' ? 'var(--ink)' : 'var(--paper-soft)',
                  border: msg.sender === 'admin' ? '1.5px solid var(--border)' : 'none',
                }}>
                  {msg.sender === 'admin' && (
                    <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--mid)', fontFamily: 'Cairo', marginBottom: 4 }}>
                      {isRTL ? 'فريق زيّ' : 'Zayy Team'}
                    </p>
                  )}
                  <p style={{ fontSize: 13, color: msg.sender === 'user' ? 'var(--paper)' : 'var(--ink)', fontFamily: 'Cairo', lineHeight: 1.6 }}>
                    {msg.text}
                  </p>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px 16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder={isRTL ? 'اكتب رسالتك...' : 'Type your message...'}
              style={{ flex: 1, padding: '12px 14px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--paper-soft)', color: 'var(--ink)', fontSize: 14, fontFamily: 'Cairo', outline: 'none' }}
            />
            <motion.button whileTap={{ scale: 0.9 }} onClick={sendMessage} disabled={!text.trim() || sending}
              style={{ width: 48, height: 48, borderRadius: 12, border: 'none', background: text.trim() ? 'var(--ink)' : 'var(--border)', color: 'var(--paper)', cursor: text.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className="fa-solid fa-paper-plane" style={{ fontSize: 16 }} />
            </motion.button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}