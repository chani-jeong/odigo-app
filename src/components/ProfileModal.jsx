import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconX, IconBrandGoogle, IconBrandApple, IconMessageCircle,
  IconBookmark, IconMapPin, IconLogout, IconUser, IconChevronDown
} from '@tabler/icons-react';
import useAuthStore from '../store/useAuthStore';
import useDeckStore from '../store/useDeckStore';
import { db, auth } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import ALL_COUNTRIES from '../data/countries.json';

const LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'ko', label: '한국어' },
  { id: 'ja', label: '日本語' },
  { id: 'zh', label: '中文' },
  { id: 'vi', label: 'Tiếng Việt' },
  { id: 'es', label: 'Español' },
  { id: 'fr', label: 'Français' },
];

export default function ProfileModal({ isOpen, onClose }) {
  const { user, isAnonymous, loginWithGoogle, loginWithApple, loginWithWeChat, logout, authLoading } = useAuthStore();
  const savedPopups = useDeckStore(state => state.savedPopups) || [];
  const visitedPopups = useDeckStore(state => state.visitedPopups) || [];
  const userCountry = useDeckStore(state => state.userCountry);
  const selectedLanguage = useDeckStore(state => state.selectedLanguage);
  const setCountry = useDeckStore(state => state.setCountry);
  const setLanguage = useDeckStore(state => state.setLanguage);

  const [editingLang, setEditingLang] = useState(false);
  const [editingCountry, setEditingCountry] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  const saveToFirestore = async (patch) => {
    const currentUser = auth.currentUser;
    if (currentUser && !currentUser.isAnonymous) {
      await setDoc(doc(db, 'users', currentUser.uid), {
        ...patch,
        updatedAt: serverTimestamp(),
      }, { merge: true }).catch(err => console.error('ProfileModal Firestore error:', err));
    }
  };

  const handleLanguageChange = async (langId) => {
    setLanguage(langId);
    setEditingLang(false);
    await saveToFirestore({ selectedLanguage: langId });
  };

  const handleCountryChange = async (cId) => {
    setCountry(cId);
    setEditingCountry(false);
    setCountrySearch('');
    await saveToFirestore({ userCountry: cId });
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1500,
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          pointerEvents: 'none'
        }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)',
              pointerEvents: 'auto'
            }}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            style={{
              background: 'var(--paper)',
              borderTopLeftRadius: '28px', borderTopRightRadius: '28px',
              padding: '12px 24px 48px',
              position: 'relative',
              pointerEvents: 'auto',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.12)',
              maxHeight: '85vh',
              overflowY: 'auto'
            }}
          >
            {/* Drag handle */}
            <div style={{
              width: '40px', height: '4px', borderRadius: '2px',
              background: 'rgba(0,0,0,0.12)', margin: '8px auto 20px'
            }} />

            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute', top: '20px', right: '20px',
                background: 'var(--bg-main)', border: 'none', borderRadius: '50%',
                width: '32px', height: '32px', display: 'flex',
                alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
              }}
            >
              <IconX size={18} style={{ color: 'var(--ink-secondary)' }} />
            </button>

            {isAnonymous ? (
              /* ── GUEST STATE ── */
              <div>
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                  <div style={{
                    width: '72px', height: '72px', borderRadius: '50%',
                    background: 'var(--brand-tint)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}>
                    <IconUser size={36} style={{ color: 'var(--brand-primary)' }} />
                  </div>
                  <h2 style={{ margin: '0 0 8px', fontSize: '20px', color: 'var(--ink)', fontWeight: 'bold' }}>
                    Welcome to Odigo!
                  </h2>
                  <p style={{ margin: 0, fontSize: '14px', color: 'var(--ink-secondary)', lineHeight: 1.6 }}>
                    Sign in to save your progress,<br />write reviews, and track visits.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button
                    onClick={loginWithGoogle}
                    disabled={authLoading}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                      width: '100%', padding: '14px', borderRadius: '14px',
                      background: '#fff', border: '1.5px solid #e0e0e0',
                      fontSize: '15px', fontWeight: '600', color: '#333',
                      cursor: authLoading ? 'not-allowed' : 'pointer',
                      opacity: authLoading ? 0.7 : 1,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}
                  >
                    <IconBrandGoogle size={20} />
                    Continue with Google
                  </button>

                  <button
                    onClick={loginWithApple}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                      width: '100%', padding: '14px', borderRadius: '14px',
                      background: '#000', border: 'none',
                      fontSize: '15px', fontWeight: '600', color: '#fff', cursor: 'pointer'
                    }}
                  >
                    <IconBrandApple size={20} />
                    Continue with Apple
                  </button>

                  <button
                    onClick={loginWithWeChat}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                      width: '100%', padding: '14px', borderRadius: '14px',
                      background: '#07C160', border: 'none',
                      fontSize: '15px', fontWeight: '600', color: '#fff', cursor: 'pointer'
                    }}
                  >
                    <IconMessageCircle size={20} />
                    Continue with WeChat
                  </button>
                </div>
              </div>
            ) : (
              /* ── LOGGED-IN STATE ── */
              <div>
                {/* Avatar + Name */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px' }}>
                  <div style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    overflow: 'hidden', background: 'var(--brand-tint)',
                    border: '3px solid var(--brand-primary)',
                    marginBottom: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {user?.photoURL
                      ? <img src={user.photoURL} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      : <IconUser size={36} style={{ color: 'var(--brand-primary)' }} />
                    }
                  </div>
                  <h2 style={{ margin: '0 0 4px', fontSize: '20px', color: 'var(--ink)', fontWeight: 'bold' }}>
                    {user?.displayName || 'Odigo User'}
                  </h2>
                  {user?.email && (
                    <span style={{ fontSize: '13px', color: 'var(--ink-secondary)' }}>{user.email}</span>
                  )}
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  {[
                    { icon: IconBookmark, label: 'Saved', value: savedPopups.length, color: 'var(--brand-primary)' },
                    { icon: IconMapPin, label: 'Visited', value: visitedPopups.length, color: '#FF9F45' },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} style={{
                      background: 'var(--bg-main)', borderRadius: '16px',
                      padding: '18px 12px', textAlign: 'center',
                      border: '1px solid var(--paper-border)'
                    }}>
                      <Icon size={22} style={{ color, marginBottom: '8px' }} />
                      <div style={{ fontSize: '26px', fontWeight: 'bold', color: 'var(--ink)', lineHeight: 1, fontFamily: 'var(--font-mono)' }}>{value}</div>
                      <div style={{ fontSize: '12px', color: 'var(--ink-secondary)', marginTop: '4px' }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* Country / Language — Language is editable */}
                <div style={{
                  background: 'var(--bg-main)', borderRadius: '16px',
                  padding: '4px 16px', marginBottom: '24px',
                  border: '1px solid var(--paper-border)'
                }}>
                                  {/* Country row — editable, same pattern as Language */}
                  <div style={{ padding: '14px 0' }}>
                    <button
                      onClick={() => {
                        setEditingCountry(v => !v);
                        setEditingLang(false);
                        setCountrySearch('');
                      }}
                      style={{
                        width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: 'transparent', border: 'none', cursor: 'pointer', padding: 0
                      }}
                    >
                      <span style={{ fontSize: '14px', color: 'var(--ink-secondary)' }}>Country</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--ink)' }}>
                          {userCountry
                            ? (ALL_COUNTRIES.find(c => c.id === userCountry)?.label || userCountry.toUpperCase())
                            : '—'}
                        </span>
                        <IconChevronDown size={16} style={{ color: 'var(--ink-secondary)', transform: editingCountry ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      </div>
                    </button>

                    {editingCountry && (
                      <div style={{ marginTop: '10px' }}>
                        {/* Search input */}
                        <div style={{
                          display: 'flex', alignItems: 'center',
                          background: 'var(--paper)', borderRadius: '10px',
                          padding: '8px 12px', marginBottom: '8px',
                          border: '1px solid var(--paper-border)'
                        }}>
                          <span style={{ fontSize: '13px', color: 'var(--ink-secondary)', marginRight: '8px' }}>🔍</span>
                          <input
                            type="text"
                            placeholder="Search country..."
                            value={countrySearch}
                            onChange={e => setCountrySearch(e.target.value)}
                            autoFocus
                            style={{
                              border: 'none', background: 'transparent', outline: 'none',
                              width: '100%', fontSize: '14px', color: 'var(--ink)', fontFamily: 'inherit'
                            }}
                          />
                        </div>
                        {/* Country list */}
                        <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }} className="hide-scrollbar">
                          {ALL_COUNTRIES
                            .filter(c => c.label.toLowerCase().includes(countrySearch.toLowerCase()))
                            .map(c => (
                              <button
                                key={c.id}
                                onClick={() => handleCountryChange(c.id)}
                                style={{
                                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                  padding: '10px 12px', borderRadius: '10px', border: 'none',
                                  background: c.id === userCountry ? 'var(--brand-tint)' : 'transparent',
                                  cursor: 'pointer', width: '100%', textAlign: 'left'
                                }}
                              >
                                <span style={{ fontSize: '14px', color: 'var(--ink)', fontWeight: c.id === userCountry ? '600' : '400' }}>
                                  {c.label}
                                </span>
                                {c.id === userCountry && (
                                  <span style={{ color: 'var(--brand-primary)', fontSize: '13px', fontWeight: 'bold' }}>✓</span>
                                )}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ height: '1px', background: 'var(--paper-border)' }} />

                  {/* Language row (editable) */}
                  <div style={{ padding: '14px 0' }}>
                    <button
                      onClick={() => {
                        setEditingLang(v => !v);
                        setEditingCountry(false);
                      }}
                      style={{
                        width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: 'transparent', border: 'none', cursor: 'pointer', padding: 0
                      }}
                    >
                      <span style={{ fontSize: '14px', color: 'var(--ink-secondary)' }}>Language</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--ink)' }}>
                          {LANGUAGES.find(l => l.id === selectedLanguage)?.label || selectedLanguage.toUpperCase()}
                        </span>
                        <IconChevronDown size={16} style={{ color: 'var(--ink-secondary)', transform: editingLang ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      </div>
                    </button>

                    {editingLang && (
                      <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {LANGUAGES.map(lang => (
                          <button
                            key={lang.id}
                            onClick={() => handleLanguageChange(lang.id)}
                            style={{
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                              padding: '10px 12px', borderRadius: '10px', border: 'none',
                              background: lang.id === selectedLanguage ? 'var(--brand-tint)' : 'transparent',
                              cursor: 'pointer', width: '100%', textAlign: 'left'
                            }}
                          >
                            <span style={{ fontSize: '14px', color: 'var(--ink)', fontWeight: lang.id === selectedLanguage ? '600' : '400' }}>{lang.label}</span>
                            {lang.id === selectedLanguage && (
                              <span style={{ color: 'var(--brand-primary)', fontSize: '13px', fontWeight: 'bold' }}>✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%', padding: '14px', borderRadius: '14px',
                    background: 'transparent', border: '1.5px solid #FF5D73',
                    color: '#FF5D73', fontSize: '15px', fontWeight: '600',
                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: '8px', transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,93,115,0.07)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <IconLogout size={18} />
                  Log out
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
