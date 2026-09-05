import React, { useState } from 'react';
import { IconX, IconPhoto, IconMapPin, IconCalendar, IconShieldCheck, IconHeart, IconMessage, IconCheck } from '@tabler/icons-react';
import useDeckStore from '../store/useDeckStore';
import { getForeignerReadyStatus } from '../utils/foreignerReady';
import { getBookingStatusMeta } from '../utils/bookingStatus';
import { isPopupEnded } from '../utils/popupStatus';
import useTranslation from '../i18n/useTranslation';
import useKoreanAddress from '../hooks/useKoreanAddress';
import ReviewListSheet from './ReviewListSheet';
import EndedBadge from './EndedBadge';

function KoreanAddressSpan({ lat, lng, fallback, selectedLanguage }) {
  const address = useKoreanAddress(lat, lng, fallback, selectedLanguage);
  return <span style={{ fontSize: '15px' }}>{address}</span>;
}

export default function PopupDetail() {
  const { t, selectedLanguage } = useTranslation();
  const [showReviewSheet, setShowReviewSheet] = useState(false);
  const selectedPopup = useDeckStore(state => state.selectedPopup);
  const closePopup = useDeckStore(state => state.closePopup);
  const events = useDeckStore(state => state.events);
  const visitedPopups = useDeckStore(state => state.visitedPopups) || [];
  const toggleVisited = useDeckStore(state => state.toggleVisited);
  const savedPopups = useDeckStore(state => state.savedPopups) || [];
  const toggleSave = useDeckStore(state => state.toggleSave);
  
  if (!selectedPopup) return null;

  const popup = events.find((p) => p.id === selectedPopup);
  if (!popup) return null;
  const isVisited = visitedPopups.includes(popup.id);
  const isSaved = savedPopups.includes(popup.id);

  // 언어별 이름 표시 (ko 우선, fallback → en)
  const displayName = (selectedLanguage === 'ko' && popup.name?.ko)
    ? popup.name.ko
    : popup.name.en;

  // URL 유무 확인
  const hasUrl = !!popup.access?.url;

  const status = getForeignerReadyStatus({
    en: popup.access?.checks?.en,
    phone: popup.access?.checks?.phone,
    card: popup.access?.checks?.card !== false,
    flow: popup.access?.checks?.flow,
  });
  const bookingMeta = getBookingStatusMeta(popup.access?.booking_required);
  const ended = isPopupEnded(popup);

  const badgeColors = {
    ready: { bg: '#E8F5F4', color: '#2D9F98' },
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
          {ended && (
            <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 5 }}>
              <EndedBadge label={t('card.ended')} />
            </div>
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
          <h2 style={{ margin: '0 0 12px', fontSize: '24px', color: 'var(--ink)', fontWeight: 'bold', fontFamily: 'var(--font-display)' }}>{displayName}</h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--ink-secondary)' }}>
            <IconMapPin size={18} />
            <KoreanAddressSpan lat={popup.location?.lat} lng={popup.location?.lng} fallback={popup.location?.address} selectedLanguage={selectedLanguage} />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: 'var(--ink-secondary)' }}>
            <IconCalendar size={18} />
            <span style={{ fontSize: '15px' }}>{popup.period.start} ~ {popup.period.end}</span>
          </div>

          {bookingMeta && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: bookingMeta.bg, color: bookingMeta.color, padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>
                <bookingMeta.Icon size={14} /> {t(bookingMeta.labelKey)}
              </span>
            </div>
          )}

          {popup.category === 'food' && (popup.dietary?.halal !== 'unknown' || popup.dietary?.vegan !== 'unknown') && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              {popup.dietary?.halal && popup.dietary.halal !== 'unknown' && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#E8F5F4', color: '#2D9F98', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                  ☪️ {popup.dietary.halal === 'certified' ? t('card.halal_certified') : t('card.halal_friendly')}
                </span>
              )}
              {popup.dietary?.vegan && popup.dietary.vegan !== 'unknown' && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#E8F5F4', color: '#2D9F98', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                  🍃 {popup.dietary.vegan === 'vegan' ? t('card.vegan') : popup.dietary.vegan === 'vegetarian' ? t('card.vegetarian') : t('card.vegan_options')}
                </span>
              )}
            </div>
          )}
          
          {hasUrl && (
            <button
              onClick={openUrl}
              style={{
                width: '100%',
                height: '52px',
                background: 'var(--brand-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '26px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                marginBottom: '24px',
              }}
            >
              {t('card.view_details')}
            </button>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '24px', paddingBottom: '24px' }}>
            <button
              onClick={() => toggleSave(popup.id)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
            >
              <IconHeart size={24} style={{ color: isSaved ? 'var(--brand-primary)' : 'var(--ink)', fill: isSaved ? 'var(--brand-primary)' : 'none' }} />
              <span style={{ fontSize: '13px', color: isSaved ? 'var(--brand-primary)' : 'var(--ink-secondary)', fontWeight: 'bold' }}>{t('card.save')}</span>
            </button>
            <button
              onClick={() => toggleVisited(popup.id)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
            >
              <IconCheck size={24} style={{ color: isVisited ? 'var(--brand-primary)' : 'var(--ink)' }} />
              <span style={{ fontSize: '13px', color: isVisited ? 'var(--brand-primary)' : 'var(--ink-secondary)', fontWeight: 'bold' }}>{t('card.visited')}</span>
            </button>
            <button
              onClick={() => {
                const { lat, lng, address } = popup.location;
                const query = lat && lng
                  ? `${lat},${lng}`
                  : encodeURIComponent(address);
                window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
              }}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
            >
              <IconMapPin size={24} style={{ color: 'var(--ink)' }} />
              <span style={{ fontSize: '13px', color: 'var(--ink-secondary)', fontWeight: 'bold' }}>{t('card.map')}</span>
            </button>
            <button
              onClick={() => setShowReviewSheet(true)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
            >
              <IconMessage size={24} style={{ color: 'var(--ink)' }} />
              <span style={{ fontSize: '13px', color: 'var(--ink-secondary)', fontWeight: 'bold' }}>{t('card.review')}</span>
            </button>
          </div>
        </div>
      </div>
      <ReviewListSheet isOpen={showReviewSheet} onClose={() => setShowReviewSheet(false)} popupId={popup.id} />
    </div>
  );
}
