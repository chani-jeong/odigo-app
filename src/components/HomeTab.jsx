import React from 'react';
import { IconSearch, IconFlame } from '@tabler/icons-react';
import useDeckStore from '../store/useDeckStore';

export default function HomeTab({ onSearchClick }) {
  const events = useDeckStore(state => state.events);
  const openPopup = useDeckStore(state => state.openPopup);
  const originalCategories = ['Beauty & Fashion', 'Food', 'Exhibition', 'Character', 'K-pop', 'Lifestyle'];

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto' }} className="hide-scrollbar">
      
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
            <h2 style={{ margin: 0, color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>{events[0].name.en}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <span style={{ background: 'var(--badge-dday-warning)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>NEW</span>
              <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px' }}>{events[0].location.address.split(',')[0]}</span>
            </div>
          </div>
        </div>
      )}

      {/* Categories */}
      <div>
        <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: 'var(--ink)' }}>Categories</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {originalCategories.map(cat => (
            <div key={cat} style={{ background: 'var(--paper)', padding: '16px 8px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', border: '1px solid var(--paper-border)' }}>
              <div style={{ width: '32px', height: '32px', background: 'var(--brand-tint)', borderRadius: '50%' }} />
              <span style={{ fontSize: '12px', color: 'var(--ink-secondary)', textAlign: 'center' }}>{cat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Popups */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <IconFlame size={20} style={{ color: 'var(--badge-dday-warning)' }} />
          <h2 style={{ margin: 0, fontSize: '18px', color: 'var(--ink)', fontFamily: 'var(--font-display)', fontWeight: 'bold' }}>Trending Popups</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {events.slice(1, 4).map(item => (
            <div key={item.id} onClick={() => openPopup(item.id)} style={{ display: 'flex', gap: '16px', padding: '12px', background: 'var(--paper)', borderRadius: '16px', border: '1px solid var(--paper-border)', cursor: 'pointer' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '12px', background: 'var(--brand-tint)', flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.name.en} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ color: 'var(--brand-primary)', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>{item.category.toUpperCase()}</div>
                <div style={{ color: 'var(--ink)', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>{item.name.en}</div>
                <div style={{ color: 'var(--ink-secondary)', fontSize: '12px' }}>{item.location.address.split(',')[0]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
