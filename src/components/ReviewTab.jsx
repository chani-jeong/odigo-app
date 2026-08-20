import React, { useState } from 'react';
import { IconStarFilled, IconStar, IconMapPin, IconPencilPlus } from '@tabler/icons-react';
import useAuthStore from '../store/useAuthStore';
import ReviewComposer from './ReviewComposer';
import useTranslation from '../i18n/useTranslation';
import useToastStore from '../store/useToastStore';

export default function ReviewTab() {
  const { t, selectedLanguage } = useTranslation();
  const { user, isAnonymous, openAuthModal } = useAuthStore();
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [translations, setTranslations] = useState({});
  const [showingTranslation, setShowingTranslation] = useState({});
  const [isTranslating, setIsTranslating] = useState({});
  
  const handleWriteReview = () => {
    if (isAnonymous) {
      openAuthModal();
    } else {
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

  const reviews = [
    { 
      id: 1, 
      name: 'Sarah', 
      time: '2 min ago', 
      popupName: 'AMUSE POP-UP', 
      location: 'Seongsu',
      text: 'The line is about 20 minutes long.', 
      stars: 5, 
      lang: 'en'
    },
    { 
      id: 2, 
      name: 'ゆき', 
      time: '15min ago', 
      popupName: 'Torriden x GANADI POP-UP', 
      location: 'Yeouido',
      text: 'ポップアップの雰囲気がとても可愛くて、\n写真もたくさん撮りました！\n平日の午後に行ったら、\n待ち時間は10分くらいでした。', 
      stars: 4, 
      lang: 'ja'
    },
    { 
      id: 3, 
      name: 'Sofía', 
      time: '20 min ago', 
      popupName: 'HALAL FOOD POP-UP', 
      location: 'Itaewon',
      text: 'La comida estaba deliciosa y el ambiente era\nmuy agradable. ¡Definitivamente volvería!', 
      stars: 4, 
      lang: 'es'
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--surface)', padding: '24px 20px', overflowY: 'auto', paddingBottom: '100px', position: 'relative' }} className="hide-scrollbar">
      
      {/* Review List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '16px' }}>
        {reviews.map(review => (
          <div key={review.id} style={{ display: 'flex', flexDirection: 'column', paddingBottom: '24px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            
            {/* User Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#1c6fa6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontSize: '12px' }}>👤</span>
              </div>
              <span style={{ fontWeight: 'bold', fontSize: '15px', color: 'var(--ink)' }}>{review.name}</span>
              <span style={{ fontSize: '12px', color: 'var(--ink)', opacity: 0.6 }}>· {review.time}</span>
            </div>
            
            {/* Target Popup Info Box */}
            <div style={{ 
              background: 'rgba(89, 203, 183, 0.05)', borderRadius: '12px', padding: '12px 16px', marginBottom: '12px',
              borderLeft: '4px solid var(--brand-tint)'
            }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--ink)', marginBottom: '4px' }}>[ {review.popupName} ]</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    i <= review.stars ? 
                      <IconStarFilled key={i} size={12} style={{ color: 'var(--brand-primary)' }} /> : 
                      <IconStar key={i} size={12} style={{ color: 'var(--brand-primary)' }} />
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', opacity: 0.6 }}>
                  <IconMapPin size={12} style={{ color: 'var(--ink)' }} />
                  <span style={{ fontSize: '12px', color: 'var(--ink)' }}>{review.location}</span>
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
              textAlign: 'left'
            }}>
              {showingTranslation[review.id] ? translations[review.id] : review.text}
            </div>

            {review.lang !== selectedLanguage && (
              <div style={{ textAlign: 'right', marginTop: '12px' }}>
                <span 
                  onClick={() => toggleTranslation(review)}
                  className="interactive-btn" 
                  style={{ color: 'var(--brand-primary)', fontSize: '13px', cursor: 'pointer', opacity: 0.8, fontWeight: 'bold' }}
                >
                  {isTranslating[review.id] ? t('card.translating') : showingTranslation[review.id] ? t('card.show_original') : `${t('card.translate')} \u2192`}
                </span>
              </div>
            )}
          </div>
        ))}
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

      <ReviewComposer isOpen={isComposerOpen} onClose={() => setIsComposerOpen(false)} />
    </div>
  );
}
