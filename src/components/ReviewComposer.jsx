import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX, IconStarFilled, IconStar } from '@tabler/icons-react';
import useAuthStore from '../store/useAuthStore';
import useToastStore from '../store/useToastStore';
import useDeckStore from '../store/useDeckStore';
import useTranslation from '../i18n/useTranslation';

export default function ReviewComposer({ isOpen, onClose }) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { showToast } = useToastStore();
  const events = useDeckStore(state => state.events);
  const selectedLanguage = useDeckStore(state => state.selectedLanguage);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [selectedPopupId, setSelectedPopupId] = useState('');

  const handleSubmit = () => {
    if (!selectedPopupId) {
      showToast(t('review.please_select_popup'), "error");
      return;
    }
    if (rating === 0) {
      showToast(t('review.please_select_rating'), "error");
      return;
    }
    // Mock submission
    console.log("Mock review submission:", { selectedPopupId, rating, text, lang: selectedLanguage });
    showToast(t('review.posted_success'));
    setRating(0);
    setText('');
    setSelectedPopupId('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
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
              background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
              pointerEvents: 'auto'
            }}
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              background: 'var(--surface)',
              borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
              padding: '24px 24px 40px',
              position: 'relative',
              pointerEvents: 'auto',
              boxShadow: '0 -4px 24px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--ink)' }}>{t('review.write_review')}</h2>
              <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <IconX size={24} style={{ color: 'var(--ink)' }} />
              </button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ccc', overflow: 'hidden' }}>
                {user?.photoURL ? <img src={user.photoURL} alt="avatar" style={{width:'100%', height:'100%'}}/> : <div style={{width:'100%', height:'100%', background:'var(--brand-primary)'}}></div>}
              </div>
              <div>
                <div style={{ fontWeight: 'bold', color: 'var(--ink)', fontSize: '15px' }}>{user?.displayName}</div>
                <div style={{ fontSize: '12px', color: 'var(--ink)', opacity: 0.6 }}>{t('review.posting_publicly')}</div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <select 
                value={selectedPopupId}
                onChange={(e) => setSelectedPopupId(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: '12px',
                  border: '1px solid rgba(0,0,0,0.1)', background: 'var(--paper)',
                  fontSize: '15px', color: 'var(--ink)', fontFamily: 'inherit',
                  outline: 'none', appearance: 'none'
                }}
              >
                <option value="" disabled>{t('review.select_popup')}</option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>{event.name.en}</option>
                ))}
              </select>
            </div>

            {/* Star Rating */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
                >
                  {star <= rating ? (
                    <IconStarFilled size={36} style={{ color: 'var(--brand-primary)' }} />
                  ) : (
                    <IconStar size={36} style={{ color: '#ccc' }} />
                  )}
                </button>
              ))}
            </div>

            {/* Text Area */}
            <textarea
              placeholder={t('review.placeholder')}
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{
                width: '100%', height: '120px', padding: '16px',
                borderRadius: '16px', border: '1px solid rgba(0,0,0,0.1)',
                background: 'var(--paper)', fontSize: '15px', color: 'var(--ink)',
                resize: 'none', outline: 'none', marginBottom: '24px',
                fontFamily: 'inherit'
              }}
            />

            <button
              onClick={handleSubmit}
              className="interactive-btn"
              style={{
                width: '100%', padding: '16px', borderRadius: '16px',
                background: 'var(--brand-primary)', border: 'none',
                color: '#fff', fontSize: '16px', fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {t('review.post_review')}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
