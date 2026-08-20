import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IconMapPin, IconLeaf, IconCurrentLocation } from '@tabler/icons-react';
import useDeckStore from '../store/useDeckStore';

export default function MapTab({ isVisible }) {
  const events = useDeckStore(state => state.events);
  const openPopup = useDeckStore(state => state.openPopup);
  const hasAgreedToLocation = useDeckStore(state => state.hasAgreedToLocation);
  const setAgreedToLocation = useDeckStore(state => state.setAgreedToLocation);

  const [isConsentChecked, setIsConsentChecked] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  
  const mapRef = useRef(null);
  const carouselRef = useRef(null);
  const markersRef = useRef([]);
  const currentLocMarkerRef = useRef(null);

  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) return;

    window.kakao.maps.load(() => {
      if (!mapRef.current) return;
      const options = {
        center: new window.kakao.maps.LatLng(37.5445, 127.0557),
        level: 5
      };
      const map = new window.kakao.maps.Map(mapRef.current, options);
      setMapInstance(map);

      // 초기 설정 후 좌표 재계산
      setTimeout(() => {
        map.relayout();
        map.setCenter(options.center);
      }, 100); 
    });
  }, []);

  useEffect(() => {
    if (isVisible && mapInstance) {
      // visibility: hidden 상태에서 visible로 바뀔 때, 
      // DOM이 화면에 그려질 시간을 약간 주고 relayout() 호출
      setTimeout(() => {
        mapInstance.relayout();
        if (events[activeIndex]?.location?.lat) {
          mapInstance.setCenter(new window.kakao.maps.LatLng(events[activeIndex].location.lat, events[activeIndex].location.lng));
        } else {
          mapInstance.setCenter(new window.kakao.maps.LatLng(37.5445, 127.0557));
        }
      }, 50);
    }
  }, [isVisible, mapInstance, events, activeIndex]);

  useEffect(() => {
    if (!mapInstance || !window.kakao || events.length === 0) return;

    markersRef.current.forEach(m => m.overlay.setMap(null));
    markersRef.current = [];

    events.forEach((popup, idx) => {
      if (!popup.location || !popup.location.lat) return;

      const position = new window.kakao.maps.LatLng(popup.location.lat, popup.location.lng);
      
      const content = document.createElement('div');
      content.style.display = 'flex';
      content.style.flexDirection = 'column';
      content.style.alignItems = 'center';
      content.style.cursor = 'pointer';
      
      const updateMarkerStyle = (isActive) => {
        content.innerHTML = `
          <div style="background: ${isActive ? 'var(--brand-primary)' : 'var(--paper)'}; color: ${isActive ? '#fff' : 'var(--text-secondary)'}; border: ${isActive ? 'none' : '1px solid var(--paper-border)'}; border-radius: 50%; padding: ${isActive ? '8px' : '6px'}; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: all 0.3s ease; display: flex; justify-content: center; align-items: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="${isActive ? '20' : '16'}" height="${isActive ? '20' : '16'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"></path>
              <path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z"></path>
            </svg>
          </div>
          <div style="width: ${isActive ? '8px' : '6px'}; height: ${isActive ? '8px' : '6px'}; border-radius: 50%; background: ${isActive ? 'rgba(89,203,183,0.4)' : 'rgba(0,0,0,0.1)'}; margin-top: 4px; transition: all 0.3s ease;"></div>
        `;
      };
      
      updateMarkerStyle(idx === activeIndex);

      const customOverlay = new window.kakao.maps.CustomOverlay({
        position: position,
        content: content,
        yAnchor: 1
      });

      customOverlay.setMap(mapInstance);
      
      content.onclick = () => {
        setActiveIndex(idx);
        mapInstance.panTo(position);
        if (carouselRef.current) {
          const cardWidth = 160 + 12; // card minWidth + gap
          carouselRef.current.scrollTo({ left: idx * cardWidth, behavior: 'smooth' });
        }
      };

      markersRef.current.push({ overlay: customOverlay, update: updateMarkerStyle, position });
    });
    
    return () => {
      markersRef.current.forEach(m => m.overlay.setMap(null));
      markersRef.current = [];
    };
  }, [mapInstance, events]);

  useEffect(() => {
    markersRef.current.forEach((marker, idx) => {
      marker.update(idx === activeIndex);
    });
  }, [activeIndex]);

  const getCurrentLocationAndCenter = useCallback(() => {
    if (!mapInstance || !window.kakao) return;
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      const locPosition = new window.kakao.maps.LatLng(latitude, longitude);

      if (currentLocMarkerRef.current) {
        currentLocMarkerRef.current.setMap(null);
      }

      const content = document.createElement('div');
      content.innerHTML = `
        <div style="width: 16px; height: 16px; background: #007AFF; border: 3px solid #fff; border-radius: 50%; box-shadow: 0 0 8px rgba(0,0,0,0.3);"></div>
      `;

      currentLocMarkerRef.current = new window.kakao.maps.CustomOverlay({
        position: locPosition,
        content: content,
      });

      currentLocMarkerRef.current.setMap(mapInstance);
      mapInstance.panTo(locPosition);
    }, (err) => {
      console.error('Geolocation error', err);
    });
  }, [mapInstance]);

  useEffect(() => {
    if (!hasAgreedToLocation || !mapInstance || !window.kakao) return;
    getCurrentLocationAndCenter();
  }, [hasAgreedToLocation, mapInstance, getCurrentLocationAndCenter]);

  const handleCarouselScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const cardWidth = 160 + 12; 
    const newIndex = Math.round(scrollLeft / cardWidth);
    
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < events.length) {
      setActiveIndex(newIndex);
      if (mapInstance && events[newIndex].location?.lat) {
        mapInstance.panTo(new window.kakao.maps.LatLng(events[newIndex].location.lat, events[newIndex].location.lng));
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', background: '#e5e3df' }}>
      
      {/* Location Consent Modal */}
      {(!hasAgreedToLocation || showConsentModal) && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '16px', padding: '32px 24px', width: '300px',
            display: 'flex', flexDirection: 'column', color: 'var(--ink)', boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', textAlign: 'center', fontWeight: 'bold', lineHeight: '1.4' }}>
              Please agree to use location info
            </h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', textAlign: 'center', color: 'var(--ink-secondary)', lineHeight: '1.5' }}>
              If you allow location information, you can use nearby services more conveniently.
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--paper-border)' }}>
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
                if (isConsentChecked) {
                  setAgreedToLocation();
                  setShowConsentModal(false);
                  setIsConsentChecked(false);
                }
              }}
              style={{
                width: '100%', height: '52px', borderRadius: '26px',
                background: isConsentChecked ? 'var(--brand-primary)' : '#D1D5DB',
                color: isConsentChecked ? '#fff' : '#9CA3AF',
                border: 'none', fontSize: '16px', fontWeight: '600',
                cursor: isConsentChecked ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s'
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div 
        ref={mapRef}
        style={{ position: 'absolute', inset: 0, zIndex: 0 }}
      />
      
      {/* Subtle overlay to make map look slightly muted/branded */}
      <div style={{ position: 'absolute', inset: 0, background: 'var(--brand-tint)', opacity: 0.2, pointerEvents: 'none', zIndex: 1 }} />

      {/* Top Gradient for header readability (if global header overlays) */}
      <div style={{ position: 'absolute', top: 0, width: '100%', height: '100px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.8), transparent)', zIndex: 2, pointerEvents: 'none' }} />

      {/* Current Location Button */}
      <button
        onClick={() => {
          if (!hasAgreedToLocation) {
            setShowConsentModal(true);
          } else {
            getCurrentLocationAndCenter();
          }
        }}
        style={{
          position: 'absolute',
          bottom: '200px',
          right: '16px',
          zIndex: 5,
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: '#fff',
          border: 'none',
          boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'box-shadow 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.25)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.18)'}
      >
        <IconCurrentLocation size={22} style={{ color: '#007AFF' }} />
      </button>

      {/* Bottom Horizontal Carousel */}
      <div style={{ 
        position: 'absolute', 
        bottom: '24px', 
        width: '100%', 
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div 
          ref={carouselRef}
          onScroll={handleCarouselScroll}
          style={{ 
          display: 'flex', 
          gap: '12px', 
          overflowX: 'auto', 
          padding: '0 20px 20px', 
          scrollSnapType: 'x mandatory'
        }} className="hide-scrollbar">
          {events.map((popup, index) => {
            const isActive = index === activeIndex; 
            return (
              <div 
                key={popup.id}
                onClick={() => {
                  setActiveIndex(index);
                  if (mapInstance && popup.location?.lat) {
                    mapInstance.panTo(new window.kakao.maps.LatLng(popup.location.lat, popup.location.lng));
                  }
                  openPopup(popup.id);
                }}
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
