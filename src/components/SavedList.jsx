import React from 'react';
import useDeckStore from '../store/useDeckStore';
import { IconMapPin, IconBookmarkFilled } from '@tabler/icons-react';
import useTranslation from '../i18n/useTranslation';

export default function SavedList() {
  const { t } = useTranslation();
  const savedPopups = useDeckStore(state => state.savedPopups) || [];
  const visitedPopups = useDeckStore(state => state.visitedPopups) || [];
  const toggleVisited = useDeckStore(state => state.toggleVisited);
  const events = useDeckStore(state => state.events) || [];
  const openPopup = useDeckStore(state => state.openPopup);
  const savedItems = savedPopups.map(id => events.find(p => p.id === id)).filter(Boolean);

  const getDDay = (endDateStr) => {
    const end = new Date(endDateStr);
    const now = new Date('2026-08-14');
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `D-${diffDays}` : diffDays === 0 ? 'D-Day' : 'Ended';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0 20px 24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <p style={{ margin: 0, color: 'var(--ink-secondary)', fontSize: '15px' }}>
          {t('saved.you_have_saved')} <span style={{ color: 'var(--badge-dday-warning)', fontWeight: 'bold' }}>{savedItems.length}</span> {t('saved.popups')}
        </p>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }} className="hide-scrollbar">
        {savedItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-secondary)' }}>
            {t('saved.no_saved')}
          </div>
        ) : (
          savedItems.map(popup => (
            <div 
              key={popup.id}
              onClick={() => openPopup(popup.id)}
              style={{
                background: 'var(--paper)', borderRadius: '20px', padding: '16px',
                display: 'flex', gap: '16px', alignItems: 'center',
                border: '1px solid var(--paper-border)', cursor: 'pointer'
              }}
            >
              {/* Thumbnail */}
              <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '16px', background: 'var(--brand-tint)', flexShrink: 0, overflow: 'hidden' }}>
                {popup.imageUrl && (
                  <img src={popup.imageUrl} alt={popup.name.en} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
                <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'var(--badge-new)', color: '#000', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '8px', fontFamily: 'var(--font-mono)', zIndex: 1 }}>NEW</div>
              </div>
              
              {/* Info */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ color: 'var(--badge-dday-warning)', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>{popup.category === 'beauty_fashion' ? 'BEAUTY & FASHION' : popup.category.toUpperCase().replace('_', ' ')}</div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: 'var(--ink)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{popup.name.en}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--ink-secondary)', fontSize: '12px', marginBottom: '12px' }}>
                  <IconMapPin size={12} /> {popup.location.address.split(',')[0]} · {Math.round(popup.distance || 2.5)}km
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleVisited(popup.id); }}
                      style={{ 
                        background: visitedPopups.includes(popup.id) ? 'var(--brand-primary)' : 'rgba(0,0,0,0.05)', 
                        padding: '4px 10px', borderRadius: '12px', fontSize: '11px', 
                        color: visitedPopups.includes(popup.id) ? '#fff' : 'var(--ink-tertiary)', 
                        border: 'none', cursor: 'pointer', fontWeight: 'bold' 
                      }}
                    >
                      {visitedPopups.includes(popup.id) ? `✓ ${t('card.visited')}` : t('card.mark_visited')}
                    </button>
                    <span style={{ color: 'var(--badge-new)', fontWeight: 'bold', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>{getDDay(popup.period.end)}</span>
                  </div>
                  <IconBookmarkFilled size={18} style={{ color: 'var(--brand-secondary)' }} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
