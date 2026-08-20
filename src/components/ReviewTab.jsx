import React, { useState, useEffect } from 'react';
import { IconStarFilled, IconStar, IconMapPin, IconPencilPlus, IconPhoto, IconTrash, IconEdit, IconAlertTriangle, IconThumbUp } from '@tabler/icons-react';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import useAuthStore from '../store/useAuthStore';
import ReviewComposer from './ReviewComposer';
import useTranslation from '../i18n/useTranslation';
import useToastStore from '../store/useToastStore';

export default function ReviewTab() {
  const { t, selectedLanguage } = useTranslation();
  const { user, isAnonymous, openAuthModal } = useAuthStore();
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [translations, setTranslations] = useState({});
  const [showingTranslation, setShowingTranslation] = useState({});
  const [isTranslating, setIsTranslating] = useState({});

  useEffect(() => {
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setReviews(data);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching reviews:', error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate();
    const now = new Date();
    const diffMins = Math.floor((now - date) / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
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
  
  const handleWriteReview = () => {
    if (isAnonymous) {
      openAuthModal();
    } else {
      setEditingReview(null);
      setIsComposerOpen(true);
    }
  };

  const showToast = useToastStore(state => state.showToast);

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
        console.error('Translation error from API:', data);
        showToast('Translation failed', 'error');
        return;
      }
      
      setTranslations(prev => ({ ...prev, [review.id]: data.translated }));
      setShowingTranslation(prev => ({ ...prev, [review.id]: true }));
    } catch (e) {
      console.error('Translation network/fetch error:', e);
      showToast('Network error during translation', 'error');
    } finally {
      setIsTranslating(prev => ({ ...prev, [review.id]: false }));
    }
  };



  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--surface)', padding: '24px 20px', overflowY: 'auto', paddingBottom: '100px', position: 'relative' }} className="hide-scrollbar">
      
      {/* Review List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '16px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-secondary)' }}>Loading...</div>
        ) : reviews.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--ink-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <IconStar size={48} style={{ opacity: 0.2 }} />
            <p style={{ margin: 0, fontSize: '15px' }}>아직 리뷰가 없습니다 / No reviews yet.</p>
          </div>
        ) : (
          reviews.map(review => (
            <div key={review.id} style={{ display: 'flex', flexDirection: 'column', paddingBottom: '24px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              
              {/* User Info & Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--brand-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {review.authorPhotoURL ? (
                      <img src={review.authorPhotoURL} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <IconPhoto size={16} style={{ color: 'var(--brand-primary)' }} />
                    )}
                  </div>
                  <span style={{ fontWeight: 'bold', fontSize: '15px', color: 'var(--ink)' }}>{review.authorName}</span>
                  <span style={{ fontSize: '12px', color: 'var(--ink)', opacity: 0.6 }}>· {formatTime(review.createdAt)}</span>
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
              
              {/* Target Popup Info Box (we don't have popupName inside review doc easily, so let's fallback to popupId for now, or assume it's just general view) */}
              <div style={{ 
                background: 'rgba(89, 203, 183, 0.05)', borderRadius: '12px', padding: '12px 16px', marginBottom: '12px',
                borderLeft: '4px solid var(--brand-tint)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[1, 2, 3, 4, 5].map(i => (
                      i <= review.rating ? 
                        <IconStarFilled key={i} size={12} style={{ color: 'var(--brand-primary)' }} /> : 
                        <IconStar key={i} size={12} style={{ color: 'var(--brand-primary)' }} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Review Content */}
              <div style={{ 
                fontSize: '15px', 
                color: 'var(--ink)',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap',
                paddingLeft: '4px',
                textAlign: 'left',
                marginBottom: '12px'
              }}>
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
                      style={{ color: 'var(--brand-primary)', fontSize: '12px', cursor: 'pointer', opacity: 0.8, fontWeight: 'bold' }}
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

      {/* Write Review FAB */}
      <button 
        onClick={handleWriteReview}
        style={{
          position: 'fixed',
          bottom: '100px',
          right: '24px',
          background: 'var(--brand-primary)',
          color: '#fff',
          border: 'none',
          borderRadius: '24px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 12px rgba(89, 203, 183, 0.4)',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '15px'
        }}
      >
        <IconPencilPlus size={20} />
        {t('review.write_review')}
      </button>

      <ReviewComposer isOpen={isComposerOpen} onClose={() => { setIsComposerOpen(false); setEditingReview(null); }} editingReview={editingReview} />
    </div>
  );
}
