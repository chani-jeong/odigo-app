import React, { useState, useEffect, useRef } from 'react';
import { IconPhoto, IconSearch, IconMapPin, IconChevronDown } from '@tabler/icons-react';
import BeautyIcon from '../../public/icons/BeautyFashion.svg?react';
import KpopIcon from '../../public/icons/Kpop.svg?react';
import LifestyleIcon from '../../public/icons/Lifestyle.svg?react';
import FoodIcon from '../../public/icons/Food.svg?react';
import CharacterIcon from '../../public/icons/Character.svg?react';
import useDeckStore from '../store/useDeckStore';
import popups from '../data/popups.sample.json';
import ALL_COUNTRIES from '../data/countries.json';
import useTranslation from '../i18n/useTranslation';
import { flagEmoji } from '../utils/flag';

const INTERESTS = [
  { id: 'beauty_fashion', labelKey: 'categories.beauty_fashion', icon: BeautyIcon },
  { id: 'kpop', labelKey: 'categories.kpop', icon: KpopIcon },
  { id: 'lifestyle', labelKey: 'categories.lifestyle', icon: LifestyleIcon },
  { id: 'food', labelKey: 'categories.food', icon: FoodIcon },
  { id: 'character', labelKey: 'categories.character', icon: CharacterIcon },
];

const LANGUAGES = [
  { id: 'en', label: 'English', flagCode: 'us' },
  { id: 'ko', label: '한국어', flagCode: 'kr' },
  { id: 'ja', label: '日本語', flagCode: 'jp' },
  { id: 'zh', label: '中文', flagCode: 'cn' },
  { id: 'vi', label: 'Tiếng Việt', flagCode: 'vn' },
  { id: 'es', label: 'Español', flagCode: 'es' },
  { id: 'fr', label: 'Français', flagCode: 'fr' }
];

const getLanguageForCountry = (countryId) => {
  const map = {
    kr: 'ko',
    us: 'en', gb: 'en', au: 'en', ca: 'en', sg: 'en', in: 'en',
    cn: 'zh', tw: 'zh', hk: 'zh',
    jp: 'ja',
    vn: 'vi',
    es: 'es', mx: 'es', ar: 'es',
    fr: 'fr'
  };
  return map[countryId] || 'en';
};

export default function Onboarding() {
  const mapRef = useRef(null);
  const { t } = useTranslation();
  const completeOnboarding = useDeckStore(state => state.completeOnboarding);
  const setCountry = useDeckStore(state => state.setCountry);
  const toggleInterest = useDeckStore(state => state.toggleInterest);
  const userInterests = useDeckStore(state => state.userInterests) || [];
  const userCountry = useDeckStore(state => state.userCountry);
  const selectedLanguage = useDeckStore(state => state.selectedLanguage);
  const setLanguage = useDeckStore(state => state.setLanguage);
  const events = useDeckStore(state => state.events);

  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isLangOpen, setIsLangOpen] = useState(false);

  useEffect(() => {
    if (step !== 1) return;
    const timer = setInterval(() => {
      setCarouselIndex(prev => (prev + 1) % popups.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [step]);

  useEffect(() => {
    if (step !== 1) return;

    let initTimer = null;
    let overlays = [];

    const initMap = () => {
      // DOM 마운트가 완전히 끝나지 않았거나 카카오맵 스크립트가 아직 로드되지 않은 경우 재시도
      if (!mapRef.current || !window.kakao || !window.kakao.maps) {
        initTimer = setTimeout(initMap, 100);
        return;
      }

      window.kakao.maps.load(() => {
        if (!mapRef.current) return;
        const options = {
          center: new window.kakao.maps.LatLng(37.5665, 126.9749),
          level: 12,
          scrollwheel: true,
          disableDoubleClickZoom: true
        };
        const mapInstance = new window.kakao.maps.Map(mapRef.current, options);
        mapInstance.setZoomable(true);

        const mapData = (events && events.length > 0) ? events : popups;

        if (mapData && mapData.length > 0) {
          const bounds = new window.kakao.maps.LatLngBounds();
          let hasBounds = false;

          mapData.forEach((popup) => {
            if (!popup.location || !popup.location.lat) return;

            const position = new window.kakao.maps.LatLng(popup.location.lat, popup.location.lng);
            bounds.extend(position);
            hasBounds = true;
            
            const content = document.createElement('div');
            content.style.display = 'flex';
            content.style.flexDirection = 'column';
            content.style.alignItems = 'center';
            
            // MapTab.jsx 비활성 상태보다 약간 작은 고정 스타일
            content.innerHTML = `
              <div style="background: var(--paper); color: var(--text-secondary); border: 1px solid var(--paper-border); border-radius: 50%; padding: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); display: flex; justify-content: center; align-items: center;">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"></path>
                  <path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z"></path>
                </svg>
              </div>
              <div style="width: 4px; height: 4px; border-radius: 50%; background: rgba(0,0,0,0.1); margin-top: 3px;"></div>
            `;

            const customOverlay = new window.kakao.maps.CustomOverlay({
              position: position,
              content: content,
              yAnchor: 1
            });

            customOverlay.setMap(mapInstance);
            overlays.push(customOverlay);
          });
          
          if (hasBounds) {
            mapInstance.setBounds(bounds);
          }
        }
      });
    };

    // React의 DOM 업데이트 이후 다음 tick에 안전하게 실행되도록 setTimeout(0) 적용
    initTimer = setTimeout(initMap, 0);

    return () => {
      if (initTimer) clearTimeout(initTimer);
      overlays.forEach(overlay => overlay.setMap(null));
      // 컴포넌트 언마운트 또는 step 변경 시 정리
      if (mapRef.current) {
        mapRef.current.innerHTML = '';
      }
    };
  }, [step, events]);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else completeOnboarding();
  };

  const handleCountrySelect = (cId) => {
    setCountry(cId);
    setLanguage(getLanguageForCountry(cId));
  };

  const filteredCountries = ALL_COUNTRIES.filter(c => 
    c.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--surface)', justifyContent: step === 1 ? 'center' : 'flex-start' }}>
      
      {/* Header */}
      <div style={{ padding: step === 1 ? '16px 20px' : '32px 20px 16px', textAlign: 'center' }}>
        <h1 style={{ margin: '0 0 8px', fontSize: '36px', color: 'var(--brand-primary)', fontWeight: 'bold' }}>Odigo</h1>
        
        {step === 1 && <p style={{ margin: 0, fontSize: 'var(--text-subtitle)', color: 'var(--text-primary)', fontWeight: '600' }}>{t('onboarding.title_step1')}</p>}
        {step === 2 && (
          <>
            <h2 style={{ margin: '0 0 4px', fontSize: 'var(--text-title)', color: 'var(--text-primary)', fontWeight: '700' }}>{t('onboarding.title_step2')}</h2>
            <p style={{ margin: 0, fontSize: '15px', fontWeight: 400, color: 'var(--text-secondary)' }}>{t('onboarding.subtitle_step2')}</p>
          </>
        )}
        {step === 3 && (
          <>
            <h2 style={{ margin: '0 0 4px', fontSize: 'var(--text-title)', color: 'var(--text-primary)', fontWeight: '700' }}>{t('onboarding.title_step3')}</h2>
            <p style={{ margin: 0, fontSize: '15px', fontWeight: 400, color: 'var(--text-secondary)' }}>{t('onboarding.subtitle_step3')}</p>
          </>
        )}
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingBottom: '100px' }} className="hide-scrollbar">
        
        {/* Step 1: Preview Carousel */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ 
              flex: 1, minHeight: '200px', margin: '0 20px 16px', borderRadius: '24px', 
              position: 'relative', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
            }}>
              <div 
                ref={mapRef}
                style={{ 
                  width: '100%', height: '100%', position: 'absolute', inset: 0, 
                  filter: 'saturate(1.2) contrast(1.1)'
                }} 
              />
              <div style={{ position: 'absolute', inset: 0, background: 'var(--brand-tint)', opacity: 0.2, pointerEvents: 'none' }} />
            </div>
            
            <div style={{ position: 'relative', height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: '16px' }}>
              {popups.map((popup, i) => {
                let offset = i - carouselIndex;
                if (offset < -1) offset += popups.length;
                if (offset > popups.length - 2) offset -= popups.length;
                
                if (Math.abs(offset) > 1) return null;
                
                return (
                  <div key={popup.id} style={{
                    position: 'absolute', width: '70%', height: '240px',
                    background: 'var(--paper)', borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    transform: `translateX(${offset * 90}%) scale(${offset === 0 ? 1 : 0.9})`,
                    opacity: offset === 0 ? 1 : 0.6,
                    transition: 'all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    zIndex: offset === 0 ? 10 : 5,
                    display: 'flex', flexDirection: 'column', overflow: 'hidden'
                  }}>
                    <div style={{ height: '75%', background: 'var(--brand-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                      {popup.imageUrl ? (
                        <img src={popup.imageUrl} alt={popup.name.en} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <IconPhoto size={40} style={{ color: 'rgba(0,0,0,0.1)' }} />
                      )}
                    </div>
                    <div style={{ padding: '12px 16px 24px 16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', textAlign: 'left', gap: '2px' }}>
                      <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--ink)', fontWeight: 'bold', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', width: '100%', letterSpacing: '-0.02em', lineHeight: '1.2' }}>{popup.name.en}</h3>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--ink-secondary)', fontWeight: 'bold', width: '100%', letterSpacing: '-0.02em', lineHeight: '1.2' }}>{popup.period.start} ~ {popup.period.end}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--ink)', opacity: 0.7, display: 'flex', alignItems: 'center', gap: '2px', width: '100%', letterSpacing: '-0.02em', lineHeight: '1.2' }}>
                        <IconMapPin size={14} style={{ flexShrink: 0 }} />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {popup.location.address.split(',').length >= 2 
                            ? popup.location.address.split(',').slice(-2).reverse().join(' ').replace(/\s+/g, ' ').trim() 
                            : popup.location.address}
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Country & Language Selection */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '0 20px', paddingBottom: '40px' }}>
            
            {/* Country Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', background: '#FFF4DA', borderRadius: '12px', padding: '12px 16px', marginBottom: '8px' }}>
                <IconSearch size={18} style={{ color: 'var(--brand-primary)', marginRight: '8px' }} />
                <input 
                  type="text" 
                  placeholder="Search country..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '15px', color: 'var(--brand-primary)' }}
                />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }} className="hide-scrollbar">
                {filteredCountries.map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleCountrySelect(c.id)}
                    className="interactive-btn"
                    style={{
                      padding: '14px 16px', borderRadius: '12px', flexShrink: 0,
                      background: userCountry === c.id ? 'var(--brand-tint)' : 'var(--paper)',
                      border: userCountry === c.id ? '2px solid var(--brand-primary)' : '2px solid transparent',
                      color: 'var(--ink)', fontSize: '15px', fontWeight: 'bold',
                      display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'all 0.2s', gap: '12px'
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>{flagEmoji(c.id)}</span>
                    <span>{c.label.replace(/^\[.*?\]\s*/, '') /* in case some labels have old codes */}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Language Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--ink-secondary)', marginBottom: '4px' }}>
                {t('onboarding.label_language')}
              </div>
              <div 
                onClick={() => setIsLangOpen(!isLangOpen)}
                style={{
                  padding: '14px 16px', borderRadius: '12px', background: 'var(--paper)',
                  border: '1px solid var(--paper-border)', display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px' }}>{flagEmoji(LANGUAGES.find(l => l.id === selectedLanguage)?.flagCode || 'us')}</span>
                  <span style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--ink)' }}>
                    {LANGUAGES.find(l => l.id === selectedLanguage)?.label || 'English'}
                  </span>
                </div>
                <IconChevronDown size={20} style={{ color: 'var(--ink-secondary)', transform: isLangOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </div>

              {isLangOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'var(--paper)', borderRadius: '12px', padding: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid var(--paper-border)' }}>
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.id}
                      onClick={() => {
                        setLanguage(lang.id);
                        setIsLangOpen(false);
                      }}
                      style={{
                        padding: '12px 16px', borderRadius: '8px', border: 'none',
                        background: selectedLanguage === lang.id ? 'var(--brand-tint)' : 'transparent',
                        color: selectedLanguage === lang.id ? 'var(--brand-primary)' : 'var(--ink)',
                        fontSize: '15px', fontWeight: selectedLanguage === lang.id ? 'bold' : 'normal',
                        textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px'
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>{flagEmoji(lang.flagCode)}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Step 3: Interest Selection */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 20px' }}>
            {INTERESTS.map(interest => {
              const isSelected = userInterests.includes(interest.id);
              return (
                <button
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  className="interactive-btn"
                  style={{
                    padding: '16px', borderRadius: '12px',
                    background: isSelected ? 'var(--brand-tint)' : 'var(--paper)',
                    border: isSelected ? '2px solid var(--brand-primary)' : '2px solid transparent',
                    color: isSelected ? 'var(--brand-primary)' : 'var(--ink)', fontSize: '16px', fontWeight: 'bold',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  <interest.icon width={20} height={20} />
                  {t(interest.labelKey)}
                </button>
              );
            })}
          </div>
        )}

      </div>

      {/* Footer / CTA */}
      <div style={{ position: 'fixed', bottom: '34px', left: '20px', right: '20px', zIndex: 100 }}>
        <button
          onClick={handleNext}
          className="interactive-btn"
          disabled={(step === 2 && !userCountry) || (step === 3 && userInterests.length === 0)}
          style={{
            width: '100%', height: '52px', borderRadius: '26px',
            background: ((step === 2 && !userCountry) || (step === 3 && userInterests.length === 0)) ? '#D1D5DB' : 'var(--brand-primary)',
            color: ((step === 2 && !userCountry) || (step === 3 && userInterests.length === 0)) ? '#9CA3AF' : '#fff', fontSize: '16px', fontWeight: '600', border: 'none',
            cursor: ((step === 2 && !userCountry) || (step === 3 && userInterests.length === 0)) ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {step === 1 ? t('onboarding.btn_start') : t('onboarding.btn_continue')}
        </button>
      </div>

    </div>
  );
}
