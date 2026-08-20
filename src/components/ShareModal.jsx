import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { IconX, IconDownload, IconShare } from '@tabler/icons-react';
import useDeckStore from '../store/useDeckStore';
import ShareCard from './ShareCard';

export default function ShareModal() {
  const shareModalPopupId = useDeckStore(state => state.shareModalPopupId);
  const closeShareModal = useDeckStore(state => state.closeShareModal);
  const events = useDeckStore(state => state.events);
  
  const popup = events.find(p => p.id === shareModalPopupId);
  const cardRef = useRef(null);
  const [imageObjUrl, setImageObjUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [blob, setBlob] = useState(null);

  useEffect(() => {
    if (shareModalPopupId && popup) {
      setIsGenerating(true);
      setImageObjUrl(null);
      setBlob(null);

      // Wait a moment for images inside the card to load before capturing
      const timer = setTimeout(() => {
        if (cardRef.current) {
          html2canvas(cardRef.current, { useCORS: true, scale: 2, backgroundColor: '#000' })
            .then(canvas => {
              canvas.toBlob((b) => {
                if (b) {
                  setBlob(b);
                  setImageObjUrl(URL.createObjectURL(b));
                }
                setIsGenerating(false);
              }, 'image/png');
            })
            .catch(err => {
              console.error('html2canvas error:', err);
              setIsGenerating(false);
            });
        }
      }, 800); // Give enough time for crossOrigin image fetch

      return () => clearTimeout(timer);
    }
  }, [shareModalPopupId, popup]);

  if (!shareModalPopupId || !popup) return null;

  const handleDownload = () => {
    if (!imageObjUrl) return;
    const a = document.createElement('a');
    a.href = imageObjUrl;
    a.download = `odigo-${popup.name.en.replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = async () => {
    if (!blob) return;
    const file = new File([blob], `odigo-${popup.name.en.replace(/\s+/g, '-').toLowerCase()}.png`, { type: 'image/png' });
    
    // Check if Web Share API is available and can share files
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: 'Odigo Popup Discovery',
          text: `Check out this popup I visited on Odigo!`,
          files: [file]
        });
      } catch (err) {
        // User cancelled share or other error, fallback not strictly needed if cancelled but we can catch it
        console.error('Share failed/cancelled:', err);
      }
    } else {
      // Fallback to direct download
      handleDownload();
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '20px'
    }}>
      {/* Hidden Card for Rendering */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <ShareCard ref={cardRef} popup={popup} />
      </div>
      
      <div style={{ width: '100%', maxWidth: '360px', display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button onClick={closeShareModal} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <IconX color="#fff" />
        </button>
      </div>

      <div style={{ 
        width: '100%', maxWidth: '360px', 
        aspectRatio: '9/16', 
        background: '#111', borderRadius: '16px', 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        {isGenerating ? (
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--brand-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            Creating your card...
          </div>
        ) : (
          imageObjUrl && <img src={imageObjUrl} alt="Share" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </div>

      <div style={{ marginTop: '24px', display: 'flex', gap: '16px', width: '100%', maxWidth: '360px' }}>
        {navigator.canShare && (
          <button 
            onClick={handleShare}
            disabled={isGenerating}
            style={{
              flex: 1, padding: '16px', borderRadius: '12px',
              background: 'var(--brand-primary)', border: 'none',
              color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              opacity: isGenerating ? 0.5 : 1, transition: 'background 0.2s'
            }}
          >
            <IconShare size={20} /> Share
          </button>
        )}
        <button 
          onClick={handleDownload}
          disabled={isGenerating}
          style={{
            flex: 1, padding: '16px', borderRadius: '12px',
            background: navigator.canShare ? 'rgba(255,255,255,0.15)' : 'var(--brand-primary)', border: 'none',
            color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            opacity: isGenerating ? 0.5 : 1
          }}
        >
          <IconDownload size={20} /> Save Image
        </button>
      </div>
    </div>
  );
}
