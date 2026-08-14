import React, { useState } from 'react';
import { IconMapPin, IconLeaf } from '@tabler/icons-react';
import useDeckStore from '../store/useDeckStore';

export default function MapTab() {
  const events = useDeckStore(state => state.events);
  const openPopup = useDeckStore(state => state.openPopup);
  const hasAgreedToLocation = useDeckStore(state => state.hasAgreedToLocation);
  const setAgreedToLocation = useDeckStore(state => state.setAgreedToLocation);

  const [isConsentChecked, setIsConsentChecked] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', background: '#e5e3df' }}>
      
      {/* Location Consent Modal */}
      {!hasAgreedToLocation && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#222', borderRadius: '16px', padding: '32px 24px', width: '300px',
            display: 'flex', flexDirection: 'column', color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', textAlign: 'center', fontWeight: 'bold', lineHeight: '1.4' }}>
              Please agree to use location info
            </h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', textAlign: 'center', color: '#ccc', lineHeight: '1.5' }}>
              If you allow location information, you can use nearby services more conveniently.
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #444' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={isConsentChecked}
                  onChange={(e) => setIsConsentChecked(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--brand-primary)', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Agree to use location info</span>
              </label>
              <span style={{ fontSize: '12px', color: '#888', textDecoration: 'underline', cursor: 'pointer' }}>View</span>
            </div>

            <button 
              onClick={() => {
                if (isConsentChecked) setAgreedToLocation();
              }}
              style={{
                background: isConsentChecked ? 'var(--brand-primary)' : '#555',
                color: isConsentChecked ? '#000' : '#888',
                border: 'none', borderRadius: '8px', padding: '16px', fontSize: '16px', fontWeight: 'bold',
                cursor: isConsentChecked ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s'
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* Full-bleed Map Background (Placeholder using an iframe for realistic UI) */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <iframe 
          title="Map"
          width="100%" 
          height="100%" 
          frameBorder="0" 
          style={{ border: 0, filter: 'saturate(1.2) contrast(1.1)' }} 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3162.2711674395013!2d126.9749!3d37.5665!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDMzJzU5LjQiTiAxMjbCsDU4JzI5LjYiRQ!5e0!3m2!1sen!2skr!4v1620000000000!5m2!1sen!2skr" 
          allowFullScreen 
        />
        {/* Subtle overlay to make map look slightly muted/branded */}
        <div style={{ position: 'absolute', inset: 0, background: 'var(--brand-tint)', opacity: 0.3, pointerEvents: 'none' }} />
      </div>

      {/* Top Gradient for header readability (if global header overlays) */}
      <div style={{ position: 'absolute', top: 0, width: '100%', height: '100px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.8), transparent)', zIndex: 1, pointerEvents: 'none' }} />

      {/* Map Pins overlay (Mocked positions for visual effect) */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none' }}>
        {events.map((popup, idx) => {
          // generate an arbitrary top/left position to scatter them
          const top = 30 + (idx * 15) % 40 + '%';
          const left = 20 + (idx * 25) % 60 + '%';
          return (
            <div key={popup.id} style={{ position: 'absolute', top, left, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ background: 'var(--brand-primary)', color: '#fff', borderRadius: '50%', padding: '6px', boxShadow: '0 4px 12px rgba(89,203,183,0.5)' }}>
                <IconMapPin size={18} />
              </div>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(89,203,183,0.4)', marginTop: '4px' }} />
            </div>
          );
        })}
      </div>

      {/* Bottom Horizontal Carousel */}
      <div style={{ 
        position: 'absolute', 
        bottom: '24px', 
        width: '100%', 
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          overflowX: 'auto', 
          padding: '0 20px 20px', 
          scrollSnapType: 'x mandatory'
        }} className="hide-scrollbar">
          {events.map((popup, index) => {
            const isActive = index === 1; 
            return (
              <div 
                key={popup.id}
                onClick={() => openPopup(popup.id)}
                style={{
                  scrollSnapAlign: 'center',
                  minWidth: '160px',
                  height: isActive ? '200px' : '180px',
                  marginTop: isActive ? '0' : '20px',
                  background: isActive ? 'var(--brand-primary)' : 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: isActive ? '0 12px 24px rgba(89,203,183,0.4)' : '0 4px 12px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: isActive ? 'none' : '1px solid rgba(255,255,255,0.4)'
                }}
              >
                {/* Image top half */}
                <div style={{ height: '55%', background: 'var(--ink-secondary)', position: 'relative' }}>
                  {popup.imageUrl && (
                    <img src={popup.imageUrl} alt={popup.name.en} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
                
                {/* Text bottom half */}
                <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', flex: 1, position: 'relative' }}>
                  <h3 style={{ 
                    margin: '0 0 8px 0', 
                    fontSize: isActive ? '14px' : '13px', 
                    color: isActive ? '#000' : 'var(--ink)', 
                    fontWeight: '900', 
                    lineHeight: 1.2,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>
                    {popup.name.en.toUpperCase()}
                  </h3>
                  
                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ 
                      background: isActive ? 'rgba(0,0,0,0.15)' : 'var(--brand-tint)', 
                      color: isActive ? '#000' : 'var(--ink-secondary)', 
                      fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      {popup.category.toUpperCase().replace('_', ' ')}
                    </div>
                  </div>
                  
                  {/* Circular badge icon (like the leaf in the screenshot) */}
                  {popup.category === 'food' && (
                    <div style={{ 
                      position: 'absolute', bottom: '12px', right: '12px', 
                      width: '24px', height: '24px', borderRadius: '50%', background: '#fff', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      <IconLeaf size={14} style={{ color: '#4CAF50' }} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
