import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX, IconStarFilled, IconStar, IconPencilPlus, IconPhoto, IconTrash, IconEdit, IconAlertTriangle, IconThumbUp } from '@tabler/icons-react';
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import useTranslation from '../i18n/useTranslation';
import useAuthStore from '../store/useAuthStore';
import ReviewComposer from './ReviewComposer';
import useToastStore from '../store/useToastStore';

export default function ReviewListSheet({ isOpen, onClose, popupId }) {
  const { t, selectedLanguage } = useTranslation();
  const { isAnonymous, user, openAuthModal } = useAuthStore();
  const showToast = useToastStore(state => state.showToast);
  
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  
  const [translations, setTranslations] = useState({});
  const [showingTranslation, setShowingTranslation] = useState({});
  const [isTranslating, setIsTranslating] = useState({});

  useEffect(() => {
    if (!isOpen || !popupId) return;
    
    setLoading(true);
    const q = query(
      collection(db, 'reviews'),
      where('popupId', '==', popupId),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviews(data);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching reviews:', error);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [isOpen, popupId]);

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const handleWriteReview = () => {
    if (isAnonymous) {
      openAuthModal();
    } else {
      setEditingReview(null);
      setIsComposerOpen(true);
    }
  };

  const handleDelete = async (reviewId) => {
    if (window.confirm("정말 이 리뷰를 삭제하시겠습니까?")) {
      try {
        await deleteDoc(doc(db, 'reviews', reviewId));
        showToast('Review deleted successfully');
      } catch (e) {
        console.error('Failed to delete review:', e);
        showToast('Failed to delete review', 'error');
      }
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setIsComposerOpen(true);
  };

  const toggleTranslation = async (review) => {
    if (showingTranslation[review.id]) {
      setShowingTranslation(prev => ({ ...prev, [review.id]: false }));
      return;
    }
    if (translations[review.id]) {
      setShowingTranslation(prev => ({ ...prev, [review.id]: true }));
      return;
    }
    
    setIsTranslating(prev => ({ ...prev, [review.id]: true }));
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: review.text, targetLang: selectedLanguage })
      });
      const data = await res.json();
      
      if (data.error) {
        console.error('Translation error:', data);
        showToast('Translation failed', 'error');
        return;
      }
      
      setTranslations(prev => ({ ...prev, [review.id]: data.translated }));
      setShowingTranslation(prev => ({ ...prev, [review.id]: true }));
    } catch (e) {
      console.error('Translation error:', e);
      showToast('Network error during translation', 'error');
    } finally {
      setIsTranslating(prev => ({ ...prev, [review.id]: false }));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2100,
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          pointerEvents: 'none'
        }}>
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

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            style={{
              background: 'var(--surface)',
              borderTopLeftRadius: '28px', borderTopRightRadius: '28px',
              padding: '12px 24px 24px',
              position: 'relative',
              pointerEvents: 'auto',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.12)',
              height: '80vh',
              display: 'flex', flexDirection: 'column'
            }}
          >
            {/* Handle */}
            <div style={{
              width: '40px', height: '4px', borderRadius: '2px',
              background: 'rgba(0,0,0,0.12)', margin: '8px auto 20px', flexShrink: 0
            }} />
            
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

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexShrink: 0 }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: 'var(--ink)' }}>{t('review.title')}</h2>
              <button 
                onClick={handleWriteReview}
                style={{
                  background: 'var(--brand-primary)', color: '#fff', border: 'none',
                  borderRadius: '20px', padding: '8px 16px', fontSize: '14px', fontWeight: 'bold',
                  display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'
                }}
              >
                <IconPencilPlus size={16} />
                {t('review.write_review')}
              </button>
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }} className="hide-scrollbar">
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-secondary)' }}>Loading...</div>
              ) : reviews.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--ink-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <IconStar size={48} style={{ opacity: 0.2 }} />
                  <p style={{ margin: 0, fontSize: '15px' }}>No reviews yet.<br/>Be the first to review!</p>
                </div>
              ) : (
                reviews.map(review => (
                  <div key={review.id} style={{ display: 'flex', flexDirection: 'column', paddingBottom: '24px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--brand-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          {review.authorPhotoURL ? (
                            <img src={review.authorPhotoURL} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <IconPhoto size={16} style={{ color: 'var(--brand-primary)' }} />
                          )}
                        </div>
                        <span style={{ fontWeight: 'bold', fontSize: '15px', color: 'var(--ink)' }}>{review.authorName}</span>
                        <span style={{ fontSize: '12px', color: 'var(--ink-secondary)' }}>· {formatTime(review.createdAt)}</span>
                      </div>

                      {/* Edit/Delete for author */}
                      {user && user.uid === review.authorUid && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <button 
                            onClick={() => handleEdit(review)}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--ink-secondary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                          >
                            <IconEdit size={14} /> 수정
                          </button>
                          <button 
                            onClick={() => handleDelete(review.id)}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, color: '#FF3B30', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                          >
                            <IconTrash size={14} /> 삭제
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '2px', marginBottom: '12px' }}>
                      {[1, 2, 3, 4, 5].map(i => (
                        i <= review.rating ? 
                          <IconStarFilled key={i} size={14} style={{ color: 'var(--brand-primary)' }} /> : 
                          <IconStar key={i} size={14} style={{ color: 'var(--brand-primary)' }} />
                      ))}
                    </div>

                    <div style={{ fontSize: '15px', color: 'var(--ink)', lineHeight: '1.5', whiteSpace: 'pre-wrap', marginBottom: '12px' }}>
                      {showingTranslation[review.id] ? translations[review.id] : review.text}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {/* Small Report/Recommend buttons */}
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button style={{ background: 'transparent', border: 'none', color: 'var(--ink-secondary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', cursor: 'pointer', padding: 0, opacity: 0.8 }}>
                          <IconThumbUp size={12} /> 추천
                        </button>
                        <button style={{ background: 'transparent', border: 'none', color: 'var(--ink-secondary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', cursor: 'pointer', padding: 0, opacity: 0.8 }}>
                          <IconAlertTriangle size={12} /> 신고
                        </button>
                      </div>

                      {review.lang !== selectedLanguage && (
                        <div style={{ textAlign: 'right' }}>
                          <span 
                            onClick={() => toggleTranslation(review)}
                            className="interactive-btn" 
                            style={{ color: 'var(--brand-primary)', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            {isTranslating[review.id] ? t('card.translating') : showingTranslation[review.id] ? t('card.show_original') : `${t('card.translate')} \u2192`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
      <ReviewComposer isOpen={isComposerOpen} onClose={() => { setIsComposerOpen(false); setEditingReview(null); }} initialPopupId={popupId} editingReview={editingReview} />
    </AnimatePresence>
  );
}
