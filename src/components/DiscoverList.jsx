import React from 'react';
import { IconMapPin, IconBookmark } from '@tabler/icons-react';
import useDeckStore from '../store/useDeckStore';
import { getForeignerReadyStatus } from '../utils/foreignerReady';
import useTranslation from '../i18n/useTranslation';
import enTranslation from '../i18n/en.json';
import useKoreanAddress from '../hooks/useKoreanAddress';
import EndedBadge from './EndedBadge';
import { sortByEndedStatus } from '../utils/popupStatus';

const DiscoverListItem = ({ popup, selectedLanguage, getDDay, openPopup, t }) => {
  const address = useKoreanAddress(
    popup.location.lat,
    popup.location.lng,
    popup.location.address,
    selectedLanguage
  );

  return (
    <div 
      onClick={() => openPopup(popup.id)}
      style={{ 
        background: 'var(--paper)', borderRadius: '12px', overflow: 'hidden',
        cursor: 'pointer', border: '1px solid var(--paper-border)',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}
    >
      {/* Image Area */}
      <div style={{ position: 'relative', height: '160px', background: 'var(--brand-tint)', overflow: 'hidden' }}>
        {popup.imageUrl ? (
          <img src={popup.imageUrl} alt={popup.name.en} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
        ) : null}
        {/* Overlay elements */}
        {getDDay(popup).isEnded && (
          <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 2 }}>
            <EndedBadge label={t('card.ended')} />
          </div>
        )}
        <div style={{ position: 'absolute', top: '12px', right: '12px', width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
          <IconBookmark size={14} style={{ color: '#fff' }} />
        </div>
        <div style={{ position: 'absolute', bottom: '12px', left: '12px', color: getDDay(popup).isEnded ? 'rgba(255,255,255,0.6)' : '#fff', fontSize: '12px', fontWeight: 'bold', fontFamily: 'var(--font-mono)', zIndex: 2 }}>
          {getDDay(popup).text}
        </div>
        {/* Gradient bottom for text legibility */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 40%)', zIndex: 1 }} />
      </div>

      {/* Content Area */}
      <div style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: '#E8F5F4', color: '#2D9F98', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px', fontFamily: 'var(--font-display)', padding: '2px 6px', borderRadius: '4px', alignSelf: 'flex-start' }}>
          {enTranslation.categories[popup.category]?.toUpperCase() || popup.category.toUpperCase()}
        </div>
        <div style={{ color: 'var(--ink)', fontSize: '14px', fontWeight: 'bold', lineHeight: 1.3, marginBottom: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {popup.name[selectedLanguage] || popup.name.en}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px', color: 'var(--ink-secondary)', fontSize: '11px', textAlign: 'left' }}>
          <IconMapPin size={12} style={{ flexShrink: 0, marginTop: '3px' }} />
          <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
            {address}
          </span>
        </div>
      </div>
    </div>
  );
};

export default function DiscoverList({ activeFilterKey }) {
  const { selectedLanguage, t } = useTranslation();
  const events = useDeckStore(state => state.events);
  const openPopup = useDeckStore(state => state.openPopup);

  const displayPopups = React.useMemo(() => {
    if (!events || !events.length) return [];

    let filtered;
    if (activeFilterKey === 'foreigner_ready') {
      filtered = events.filter(p => {
        const status = getForeignerReadyStatus({
          en: p.access?.checks?.en,
          phone: p.access?.checks?.phone,
          card: p.access?.checks?.card !== false,
          flow: p.access?.checks?.flow
        });
        return status === 'ready';
      });
    } else if (activeFilterKey === 'halal_friendly') {
      filtered = events.filter(p => p.dietary?.halal && p.dietary.halal !== 'unknown');
    } else {
      filtered = activeFilterKey ? events.filter(p => p.category === activeFilterKey) : events;
    }

    // 진행 중인 팝업이 항상 종료된 팝업보다 앞에 오도록 정렬
    return sortByEndedStatus(filtered);
  }, [events, activeFilterKey]);

  const getDDay = (popup) => {
    const start = new Date(popup.period.start);
    const end = new Date(popup.period.end);
    const today = new Date();
    today.setHours(0,0,0,0);
    start.setHours(0,0,0,0);
    end.setHours(0,0,0,0);

    if (today > end) {
      return { text: selectedLanguage === 'ko' ? '종료' : 'Ended', isEnded: true };
    }
    
    if (today < start) {
      const diffTime = start - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { text: `D-${diffDays}`, isEnded: false };
    }
    
    const diffTime = today - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return { text: `D+${diffDays}`, isEnded: false };
  };

  return (
    <div style={{ padding: '24px 20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {displayPopups.map(popup => (
          <DiscoverListItem key={popup.id} popup={popup} selectedLanguage={selectedLanguage} getDDay={getDDay} openPopup={openPopup} t={t} />
        ))}
      </div>
    </div>
  );
}
