import React from 'react';
import { IconX, IconPhoto, IconMapPin, IconCalendar, IconShieldCheck, IconHeart, IconMessage, IconCheck } from '@tabler/icons-react';
import useDeckStore from '../store/useDeckStore';
import { getForeignerReadyStatus } from '../utils/foreignerReady';
import useTranslation from '../i18n/useTranslation';

export default function PopupDetail() {
  const { t } = useTranslation();
  const selectedPopup = useDeckStore(state => state.selectedPopup);
  const closePopup = useDeckStore(state => state.closePopup);
  const events = useDeckStore(state => state.events);
  const visitedPopups = useDeckStore(state => state.visitedPopups) || [];
  const toggleVisited = useDeckStore(state => state.toggleVisited);
  
  if (!selectedPopup) return null;

  const popup = events.find((p) => p.id === selectedPopup);
  if (!popup) return null;
  const isVisited = visitedPopups.includes(popup.id);

  const status = getForeignerReadyStatus({
    en: popup.access.checks.en,
    phone: popup.access.checks.phone,
    card: popup.access.checks.card !== false,
    flow: popup.access.checks.flow,
  });

  const badgeColors = {
    ready: { bg: '#26C485', color: '#FFF' },
    assisted: { bg: '#FF9F45', color: '#FFF' },
    blocked: { bg: '#FF5D73', color: '#FFF' },
  };
  const badge = badgeColors[status] || badgeColors['blocked'];

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) closePopup();
  };

  const openUrl = () => {
    if (popup.access?.url) window.open(popup.access.url, '_blank');
  };

  return (
    <div
      className="popup-overlay"
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 2000,
      }}
    >
      <div
        className="popup-modal"
        style={{
          width: '100%',
          maxWidth: '400px',
          background: 'var(--paper)',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Close button */}
        <button
          onClick={closePopup}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(4px)',
            borderRadius: '50%',
            border: 'none',
            padding: '4px',
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          <IconX size={24} style={{ color: '#000' }} />
        </button>
        
        {/* Image area */}
        <div
          className="photo"
          style={{
            background: 'var(--brand-tint)',
            height: '240px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {popup.imageUrl ? (
            <img src={popup.imageUrl} alt={popup.name.en} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <IconPhoto size={48} style={{ color: 'var(--ink)' }} />
          )}
          {status && (
            <div
              className="ready-badge"
              style={{
                position: 'absolute',
                top: '16px',
                right: '56px',
                background: badge.bg,
                borderRadius: '20px',
                padding: '6px 10px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <IconShieldCheck size={16} style={{ marginRight: '6px', color: badge.color }} />
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: badge.color, fontFamily: 'var(--font-mono)' }}>{t('card.foreigner_ready')}</span>
            </div>
          )}
        </div>
        
        {/* Info area */}
        <div style={{ padding: '24px', textAlign: 'left', background: 'var(--paper)' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '24px', color: 'var(--ink)', fontWeight: 'bold', fontFamily: 'var(--font-display)' }}>{popup.name.en}</h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--ink-secondary)' }}>
            <IconMapPin size={18} />
            <span style={{ fontSize: '15px' }}>{popup.location.address}</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: 'var(--ink-secondary)' }}>
            <IconCalendar size={18} />
            <span style={{ fontSize: '15px' }}>{popup.period.start} ~ {popup.period.end}</span>
          </div>
          
          {popup.category === 'food' && (popup.dietary?.halal !== 'unknown' || popup.dietary?.vegan !== 'unknown') && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              {popup.dietary?.halal && popup.dietary.halal !== 'unknown' && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(59, 169, 150, 0.1)', color: '#3BA996', padding: '6px 12px', borderRadius: '16px', fontSize: '13px', fontWeight: 'bold' }}>
                  ☪️ Halal {popup.dietary.halal === 'certified' ? 'Certified' : 'Friendly'}
                </span>
              )}
              {popup.dietary?.vegan && popup.dietary.vegan !== 'unknown' && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(76, 175, 80, 0.1)', color: '#4CAF50', padding: '6px 12px', borderRadius: '16px', fontSize: '13px', fontWeight: 'bold' }}>
                  🍃 {popup.dietary.vegan === 'vegan' ? 'Vegan' : popup.dietary.vegan === 'vegetarian' ? 'Vegetarian' : 'Options'}
                </span>
              )}
            </div>
          )}
          
          <button
            onClick={status === 'blocked' ? null : openUrl}
            style={{
              width: '100%',
              padding: '16px',
              background: 'var(--brand-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: '16px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: status === 'blocked' ? 'default' : 'pointer',
              marginBottom: '24px',
            }}
          >
            {status === 'blocked' ? t('card.walkin_guide') : t('card.book_now')}
          </button>
          
          <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid var(--paper-border)', paddingTop: '24px' }}>
            <button
              onClick={() => { console.log('saved', popup.id); }}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
            >
              <IconHeart size={24} style={{ color: 'var(--ink)' }} />
              <span style={{ fontSize: '13px', color: 'var(--ink-secondary)', fontWeight: 'bold' }}>{t('card.save')}</span>
            </button>
            <button
              onClick={() => toggleVisited(popup.id)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
            >
              <IconCheck size={24} style={{ color: isVisited ? 'var(--brand-primary)' : 'var(--ink)' }} />
              <span style={{ fontSize: '13px', color: isVisited ? 'var(--brand-primary)' : 'var(--ink-secondary)', fontWeight: 'bold' }}>{t('card.visited')}</span>
            </button>
            <button
              onClick={() => { console.log('map', popup.location); }}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
            >
              <IconMapPin size={24} style={{ color: 'var(--ink)' }} />
              <span style={{ fontSize: '13px', color: 'var(--ink-secondary)', fontWeight: 'bold' }}>{t('card.map')}</span>
            </button>
            <button
              onClick={() => { console.log('review', popup.id); }}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
            >
              <IconMessage size={24} style={{ color: 'var(--ink)' }} />
              <span style={{ fontSize: '13px', color: 'var(--ink-secondary)', fontWeight: 'bold' }}>{t('card.review')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
