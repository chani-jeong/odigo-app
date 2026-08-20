import React, { forwardRef } from 'react';
import useTranslation from '../i18n/useTranslation';

const ShareCard = forwardRef(({ popup }, ref) => {
  const { selectedLanguage } = useTranslation();
  
  if (!popup) return null;

  const displayName = selectedLanguage === 'ko' && popup.name.ko ? popup.name.ko : popup.name.en;
  
  return (
    <div 
      ref={ref}
      style={{
        width: '360px',
        height: '640px', // 9:16 aspect ratio
        position: 'relative',
        background: '#000',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-display), sans-serif'
      }}
    >
      {/* Background Image */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.8 }}>
        <img src={popup.imageUrl} alt="Background" style={{ width: '100%', height: '100%', objectFit: 'cover' }} crossOrigin="anonymous" />
      </div>
      
      {/* Gradient Overlay for Text Readability */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 40%, rgba(0,0,0,0.8) 100%)' }} />
      
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', height: '100%', padding: '40px 32px' }}>
        {/* Odigo Logo */}
        <div style={{ alignSelf: 'center', marginBottom: 'auto' }}>
          <h1 style={{ color: '#59CBB7', fontSize: '42px', fontWeight: '900', margin: 0, letterSpacing: '-1px' }}>Odigo</h1>
        </div>
        
        {/* Text Area */}
        <div style={{ marginTop: 'auto', textAlign: 'center' }}>
          <div style={{ background: 'var(--brand-primary)', display: 'inline-block', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold', color: '#fff', marginBottom: '16px', fontFamily: 'var(--font-mono)' }}>
            ✓ VISITED
          </div>
          <h2 style={{ color: '#fff', fontSize: '32px', fontWeight: 'bold', margin: '0 0 20px', lineHeight: 1.2 }}>
            {displayName}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: '16px', margin: 0, lineHeight: 1.5, fontWeight: '500' }}>
            {selectedLanguage === 'ko' 
              ? `Odigo를 통해 '${displayName}'에서\n한국 문화를 발견했어요!` 
              : `I discovered Korean culture through\n'${displayName}' via Odigo.`}
          </p>
        </div>
      </div>
    </div>
  );
});

export default ShareCard;
