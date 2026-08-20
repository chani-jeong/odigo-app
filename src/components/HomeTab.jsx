import React, { useState } from 'react';
import { IconSearch, IconFlame, IconArrowLeft, IconMapPin, IconCalendarEvent } from '@tabler/icons-react';
import useDeckStore from '../store/useDeckStore';
import useTranslation from '../i18n/useTranslation';
import useKoreanAddress from '../hooks/useKoreanAddress';

import BeautyIcon from '../../public/icons/BeautyFashion.svg?react';
import KpopIcon from '../../public/icons/Kpop.svg?react';
import LifestyleIcon from '../../public/icons/Lifestyle.svg?react';
import FoodIcon from '../../public/icons/Food.svg?react';
import CharacterIcon from '../../public/icons/Character.svg?react';

function KoreanAddressSpan({ lat, lng, fallback, selectedLanguage }) {
  const address = useKoreanAddress(lat, lng, fallback, selectedLanguage);
  return <span>{address.split(',')[0]}</span>;
}

const CATEGORIES = [
  { id: 'beauty_fashion', label: 'Beauty & Fashion', icon: BeautyIcon },
  { id: 'food', label: 'Food', icon: FoodIcon },
  { id: 'character', label: 'Character', icon: CharacterIcon },
  { id: 'kpop', label: 'K-pop', icon: KpopIcon },
  { id: 'lifestyle', label: 'Lifestyle', icon: LifestyleIcon },
];

export default function HomeTab({ onSearchClick }) {
  const { t, selectedLanguage } = useTranslation();
  const events = useDeckStore(state => state.events);
  const openPopup = useDeckStore(state => state.openPopup);
  const [selectedCategory, setSelectedCategory] = useState(null);

  if (selectedCategory) {
    const filteredEvents = events.filter(e => e.category === selectedCategory.id);
    return (
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--surface)', overflowY: 'auto' }} className="hide-scrollbar">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--paper-border)' }}>
          <button onClick={() => setSelectedCategory(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
            <IconArrowLeft size={24} style={{ color: 'var(--ink)' }} />
          </button>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: 'var(--ink)' }}>{selectedCategory.label}</h2>
        </div>

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '100px' }}>
          {filteredEvents.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--ink-secondary)', marginTop: '40px' }}>No popups found in this category.</div>
          ) : (
            filteredEvents.map(item => {
              const displayName = selectedLanguage === 'ko' && item.name.ko ? item.name.ko : item.name.en;
              return (
                <div key={item.id} onClick={() => openPopup(item.id)} style={{ display: 'flex', gap: '16px', padding: '16px', background: 'var(--paper)', borderRadius: '16px', border: '1px solid var(--paper-border)', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '12px', background: 'var(--brand-tint)', flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ background: '#E8F5F4', color: '#2D9F98', fontSize: '11px', fontWeight: 'bold', marginBottom: '6px', padding: '4px 8px', borderRadius: '4px', alignSelf: 'flex-start' }}>
                      {item.category.replace('_', ' ').toUpperCase()}
                    </div>
                    <div style={{ color: 'var(--ink)', fontSize: '15px', fontWeight: 'bold', marginBottom: '6px', lineHeight: '1.3' }}>{displayName}</div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--ink-secondary)', fontSize: '12px', marginBottom: '4px' }}>
                      <IconCalendarEvent size={14} style={{ flexShrink: 0 }} />
                      <span>{item.date?.start ? `${item.date.start} ~ ${item.date.end}` : 'Ongoing'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--ink-secondary)', fontSize: '12px' }}>
                      <IconMapPin size={14} style={{ flexShrink: 0 }} />
                      <KoreanAddressSpan lat={item.location.lat} lng={item.location.lng} fallback={item.location.address} selectedLanguage={selectedLanguage} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto', paddingBottom: '100px' }} className="hide-scrollbar">
      
      {/* Search Trigger */}
      <div 
        onClick={onSearchClick}
        style={{ display: 'flex', alignItems: 'center', background: 'var(--paper)', borderRadius: '12px', padding: '16px', cursor: 'pointer', border: '1px solid var(--paper-border)' }}
      >
        <IconSearch size={20} style={{ color: 'var(--ink-secondary)', marginRight: '12px' }} />
        <span style={{ color: 'var(--ink-secondary)', fontSize: '15px' }}>Find your next popup...</span>
      </div>

      {/* Main Banner */}
      {events.length > 0 && (
        <div 
          onClick={() => openPopup(events[0].id)}
          style={{ 
            height: '240px', borderRadius: '16px', background: 'var(--brand-tint)',
            position: 'relative', overflow: 'hidden', cursor: 'pointer'
          }}
        >
          {events[0].imageUrl && (
            <img src={events[0].imageUrl} alt={events[0].name.en} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', zIndex: 1 }} />
          <div style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 2 }}>
            <h2 style={{ margin: 0, color: '#fff', fontSize: '24px', fontWeight: 'bold', lineHeight: '1.3' }}>
              {selectedLanguage === 'ko' && events[0].name.ko ? events[0].name.ko : events[0].name.en}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <span style={{ background: 'var(--badge-dday-warning)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>NEW</span>
              <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <IconMapPin size={14} />
                <KoreanAddressSpan lat={events[0].location.lat} lng={events[0].location.lng} fallback={events[0].location.address} selectedLanguage={selectedLanguage} />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Categories */}
      <div>
        <h3 style={{ margin: '0 0 16px', fontSize: 'var(--text-subtitle)', color: 'var(--ink-secondary)', fontWeight: '600' }}>Categories</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {CATEGORIES.map(cat => {
            const IconComponent = cat.icon;
            return (
              <div 
                key={cat.id} 
                onClick={() => setSelectedCategory(cat)}
                style={{ background: 'var(--paper)', padding: '16px 8px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', border: '1px solid var(--paper-border)', cursor: 'pointer', transition: 'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ width: '40px', height: '40px', background: 'var(--brand-tint)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconComponent width={24} height={24} />
                </div>
                <span style={{ fontSize: '12px', color: 'var(--ink-secondary)', textAlign: 'center' }}>{cat.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trending Popups */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <IconFlame size={20} style={{ color: 'var(--badge-dday-warning)' }} />
          <h2 style={{ margin: 0, fontSize: 'var(--text-title)', color: 'var(--ink-secondary)', fontFamily: 'var(--font-display)', fontWeight: '700' }}>Trending Popups</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {events.slice(1, 4).map(item => {
            const displayName = selectedLanguage === 'ko' && item.name.ko ? item.name.ko : item.name.en;
            return (
              <div key={item.id} onClick={() => openPopup(item.id)} style={{ display: 'flex', gap: '16px', padding: '12px', background: 'var(--paper)', borderRadius: '16px', border: '1px solid var(--paper-border)', cursor: 'pointer' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '12px', background: 'var(--brand-tint)', flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ background: '#E8F5F4', color: '#2D9F98', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px', padding: '4px 8px', borderRadius: '4px', alignSelf: 'flex-start' }}>{item.category.replace('_', ' ').toUpperCase()}</div>
                  <div style={{ color: 'var(--ink)', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px', lineHeight: '1.3' }}>{displayName}</div>
                  <div style={{ color: 'var(--ink-secondary)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <IconMapPin size={12} />
                    <KoreanAddressSpan lat={item.location.lat} lng={item.location.lng} fallback={item.location.address} selectedLanguage={selectedLanguage} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
    </div>
  );
}
