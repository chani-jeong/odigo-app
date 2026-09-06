import React, { useState } from 'react';
import { IconX, IconPhoto, IconMapPin, IconCalendar, IconShieldCheck, IconHeart, IconMessage, IconCheck } from '@tabler/icons-react';
import useDeckStore from '../store/useDeckStore';
import { getForeignerReadyStatus } from '../utils/foreignerReady';
import { getBookingStatusMeta } from '../utils/bookingStatus';
import { PILL_BADGE_BASE_STYLE } from '../utils/badgeStyle';
import { isPopupEnded } from '../utils/popupStatus';
import useTranslation from '../i18n/useTranslation';
import useKoreanAddress from '../hooks/useKoreanAddress';
import ReviewListSheet from './ReviewListSheet';
import EndedBadge from './EndedBadge';

// 위치/기간 줄의 아이콘 wrapper 높이 & 텍스트 line-height에 공통으로 사용하는 고정값(px).
// 두 값을 동일하게 맞춰야, 텍스트가 여러 줄로 줄바꿈되더라도 아이콘의 세로 중심이
// "텍스트 전체 블록 중심"이 아니라 "텍스트 첫 줄의 세로 중심"과 정확히 일치한다.
const INFO_ROW_LINE_HEIGHT = 22;

function KoreanAddressSpan({ lat, lng, fallback, selectedLanguage }) {
  const address = useKoreanAddress(lat, lng, fallback, selectedLanguage);
  return <span style={{ fontSize: '15px', textAlign: 'left', lineHeight: `${INFO_ROW_LINE_HEIGHT}px` }}>{address}</span>;
}

// 위치/기간 줄에서 공용으로 쓰는 아이콘 wrapper.
// 고정 높이(INFO_ROW_LINE_HEIGHT)를 텍스트 첫 줄의 line-height와 동일하게 주고,
// 그 안에서 flex + alignItems:center로 아이콘을 수직 중앙에 배치한다.
function InfoRowIconWrapper({ children }) {
  return (
    <div style={{ height: `${INFO_ROW_LINE_HEIGHT}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </div>
  );
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
                ...PILL_BADGE_BASE_STYLE,
                position: 'absolute',
                top: '16px',
                right: '56px',
                background: badge.bg,
                color: badge.color,
              }}
            >
              <IconShieldCheck size={14} style={{ color: badge.color }} />
              <span>{t('card.foreigner_ready')}</span>
            </div>
          )}
        </div>
        
        {/* Info area */}
        <div style={{ padding: '24px', textAlign: 'left', background: 'var(--paper)' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '24px', color: 'var(--ink)', fontWeight: 'bold', fontFamily: 'var(--font-display)' }}>{displayName}</h2>
          
          {/* 위치/기간: 아이콘 열(20px 고정 너비)과 텍스트 열을 grid로 통일해
              두 줄의 아이콘 x좌표와 텍스트 시작점(x좌표)이 정확히 일치하도록 함.
              alignItems:'start'로 grid row 상단에 두 열을 맞추고, 아이콘은
              InfoRowIconWrapper(텍스트 첫 줄과 동일한 고정 높이 + flex center)로 감싸서
              주소가 여러 줄이 되어도 아이콘이 첫 줄 중심에 오도록 함 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr', columnGap: '8px', alignItems: 'start', color: 'var(--ink-secondary)' }}>
              <InfoRowIconWrapper>
                <IconMapPin size={18} />
              </InfoRowIconWrapper>
              <KoreanAddressSpan lat={popup.location?.lat} lng={popup.location?.lng} fallback={popup.location?.address} selectedLanguage={selectedLanguage} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr', columnGap: '8px', alignItems: 'start', color: 'var(--ink-secondary)' }}>
              <InfoRowIconWrapper>
                <IconCalendar size={18} />
              </InfoRowIconWrapper>
              <span style={{ fontSize: '15px', textAlign: 'left', lineHeight: `${INFO_ROW_LINE_HEIGHT}px` }}>{popup.period.start} ~ {popup.period.end}</span>
            </div>
          </div>

          {bookingMeta && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <span style={{ ...PILL_BADGE_BASE_STYLE, background: bookingMeta.bg, color: bookingMeta.color }}>
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
