import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX, IconTrophy, IconLanguage } from '@tabler/icons-react';

export default function ProfileModal({ isOpen, onClose }) {
  const [lang, setLang] = useState('en');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999
            }}
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed', top: 0, bottom: 0, right: 0, width: '85%', maxWidth: '340px',
              zIndex: 1000,
              background: 'var(--surface)',
              boxShadow: '-8px 0 24px rgba(0,0,0,0.1)',
              display: 'flex', flexDirection: 'column'
            }}
          >
            {/* Header */}
            <div style={{ padding: '24px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                onClick={() => setLang(lang === 'en' ? 'ko' : 'en')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--paper)', border: '1px solid var(--paper-border)', padding: '6px 12px', borderRadius: '16px', cursor: 'pointer', color: 'var(--ink)', fontSize: '13px', fontWeight: 'bold' }}
              >
                <IconLanguage size={16} /> {lang === 'en' ? 'EN' : 'KO'}
              </button>
              <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
                <IconX size={28} style={{ color: 'var(--ink)' }} />
              </button>
            </div>

            <div style={{ padding: '0 20px 40px', flex: 1, overflowY: 'auto' }} className="hide-scrollbar">
              {/* Profile Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>
                  K
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--ink)' }}>Kim Jisoo</h2>
                  <span style={{ color: 'var(--ink-secondary)', fontSize: '14px' }}>@jisoo_popup</span>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                {[
                  { label: 'Saved', value: '2' },
                  { label: 'Visited', value: '12' },
                  { label: 'Reviews', value: '7' },
                ].map(stat => (
                  <div key={stat.label} style={{ flex: 1, background: 'var(--paper)', borderRadius: '16px', padding: '16px 0', textAlign: 'center', border: '1px solid var(--paper-border)' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--ink)', fontFamily: 'var(--font-mono)' }}>{stat.value}</div>
                    <div style={{ fontSize: '13px', color: 'var(--ink-secondary)', marginTop: '4px' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Badge */}
              <div style={{ background: 'var(--paper)', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--paper-border)', marginBottom: '32px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--brand-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconTrophy size={24} style={{ color: 'var(--brand-secondary)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '16px', color: 'var(--ink)', marginBottom: '4px' }}>Popup Explorer</div>
                  <div style={{ fontSize: '13px', color: 'var(--ink-secondary)' }}>Visited 10 popups</div>
                </div>
                <div style={{ background: 'var(--brand-secondary)', color: '#000', fontSize: '11px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '12px' }}>NEW</div>
              </div>

              {/* Activity */}
              <h3 style={{ fontSize: '16px', color: 'var(--ink-secondary)', margin: '0 0 16px' }}>Recent Activity</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--paper-border)', paddingBottom: '16px' }}>
                  <span style={{ color: 'var(--ink)', fontSize: '14px', maxWidth: '160px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Visited 3 popups in Seongsu</span>
                  <span style={{ color: 'var(--ink-secondary)', fontSize: '12px' }}>Yesterday</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--paper-border)', paddingBottom: '16px' }}>
                  <span style={{ color: 'var(--ink)', fontSize: '14px', maxWidth: '160px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Reviewed PUMA × Ader Error</span>
                  <span style={{ color: 'var(--ink-secondary)', fontSize: '12px' }}>3 days ago</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
