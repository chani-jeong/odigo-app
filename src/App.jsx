import React, { useState } from 'react';
import { IconSearch, IconCompass, IconMap, IconBookmark, IconMessageCircle } from '@tabler/icons-react';
import './index.css';
import './styles/tokens.css';
import SwipeDeck from './components/SwipeDeck';
import DiscoverList from './components/DiscoverList';
import PopupDetail from './components/PopupDetail';
import SavedList from './components/SavedList';
import ReviewTab from './components/ReviewTab';
import MapTab from './components/MapTab';
import Onboarding from './components/Onboarding';
import LoginModal from './components/LoginModal';
import ProfileModal from './components/ProfileModal';
import Toast from './components/Toast';
import SearchOverlay from './components/SearchOverlay';
import HomeTab from './components/HomeTab';
import useDeckStore from './store/useDeckStore';
import useAuthStore from './store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import useTranslation from './i18n/useTranslation';

const baseFilters = ['beauty_fashion', 'food', 'exhibition', 'character', 'kpop', 'lifestyle'];

function App() {
  const selectedPopup = useDeckStore(state => state.selectedPopup);
  const hasCompletedOnboarding = useDeckStore(state => state.hasCompletedOnboarding);
  const hasAgreedToLocation = useDeckStore(state => state.hasAgreedToLocation);
  const userCountry = useDeckStore(state => state.userCountry);
  const setUserLocation = useDeckStore(state => state.setUserLocation);
  const sortEventsByDistance = useDeckStore(state => state.sortEventsByDistance);
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState('discover');
  const [isSwipeMode, setIsSwipeMode] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { user, isAnonymous } = useAuthStore();

  React.useEffect(() => {
    if (hasAgreedToLocation && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation(position.coords.latitude, position.coords.longitude);
          sortEventsByDistance();
        },
        (error) => {
          console.log("Geolocation error or denied:", error);
        }
      );
    }
  }, [hasAgreedToLocation, setUserLocation, sortEventsByDistance]);
  
  const dynamicFilters = React.useMemo(() => {
    let filters = [...baseFilters];
    // Prioritize Foreigner-Ready for non-Koreans
    if (userCountry && userCountry !== 'kr') {
      filters.unshift('foreigner_ready');
    }
    // Prioritize Halal for specific countries
    const muslimCountries = ['id', 'my', 'sa', 'ae', 'tr', 'eg', 'ng'];
    if (muslimCountries.includes(userCountry)) {
      filters.unshift('halal_friendly');
    }
    return filters;
  }, [userCountry]);

  const [activeFilterKey, setActiveFilterKey] = useState(dynamicFilters[0] || 'beauty_fashion');

  const getFilterLabel = (key) => {
    if (key === 'foreigner_ready') return t('card.foreigner_ready');
    if (key === 'halal_friendly') return t('card.halal_friendly');
    return t(`categories.${key}`);
  };

  if (!hasCompletedOnboarding) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', maxWidth: '400px', margin: '0 auto', background: 'var(--bg-main)', position: 'relative' }}>
        <Onboarding />
      </div>
    );
  }

  const TABS = [
    { id: 'discover', label: t('tabs.discover'), icon: IconCompass },
    { id: 'map', label: t('tabs.map'), icon: IconMap },
    { id: 'saved', label: t('tabs.saved'), icon: IconBookmark },
    { id: 'review', label: t('tabs.review'), icon: IconMessageCircle }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', maxWidth: '400px', margin: '0 auto', background: 'var(--bg-main)', position: 'relative' }}>
      
      {/* Global Header */}
      <div style={{ 
        padding: '16px 20px 0', 
        display: 'flex', 
        flexDirection: 'column',
        background: 'rgba(253, 251, 247, 0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 50
      }}>
        {/* Top Row: Logo + Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h1 
            onClick={() => setActiveTab('home')}
            style={{ margin: 0, padding: 0, lineHeight: '1', fontSize: '30px', color: 'var(--brand-primary)', fontWeight: '900', cursor: 'pointer', fontFamily: 'var(--font-display)' }}
          >
            Odigo
          </h1>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {activeTab === 'discover' && (
              <div 
                onClick={() => setIsSwipeMode(!isSwipeMode)}
                style={{ 
                  width: '44px', height: '24px', borderRadius: '12px', 
                  background: isSwipeMode ? 'var(--brand-primary)' : '#e0e0e0', 
                  border: '1px solid rgba(0,0,0,0.1)',
                  position: 'relative', cursor: 'pointer',
                  transition: 'background 0.3s'
                }}
              >
                <div style={{ 
                  position: 'absolute', left: isSwipeMode ? '22px' : '2px', top: '2px', 
                  width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
                  transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }} />
              </div>
            )}
            <IconSearch size={24} style={{ color: 'var(--brand-primary)', cursor: 'pointer' }} onClick={() => setIsSearchOpen(true)} />
            <button 
              onClick={() => setIsProfileOpen(true)}
              style={{ 
                width: '32px', height: '32px', borderRadius: '50%', 
                background: user?.photoURL
                  ? 'transparent'
                  : 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))', 
                border: user?.photoURL ? '2px solid var(--brand-primary)' : 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
                color: '#000', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 2px 8px rgba(89,203,183,0.3)'
              }}
            >
              {user?.photoURL
                ? <img src={user.photoURL} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : (isAnonymous ? 'G' : (user?.displayName?.[0]?.toUpperCase() || 'U'))
              }
            </button>
          </div>
        </div>

        {/* Bottom Row: Tab Title with divider */}
        {activeTab !== 'home' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--brand-tint)', paddingBottom: '12px' }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: 'var(--text-subtitle)' }}>
              {activeTab === 'discover' && t('header.title_discover')}
              {activeTab === 'map' && t('header.title_map')}
              {activeTab === 'saved' && t('saved.title')}
              {activeTab === 'review' && t('review.title')}
            </span>
          </div>
        )}
      </div>

      {/* Discover Filters - horizontally scrollable */}
      {activeTab === 'discover' && !isSwipeMode && (
        <div style={{ padding: '0 20px 12px', display: 'flex', gap: '8px', overflowX: 'auto', msOverflowStyle: 'none', scrollbarWidth: 'none' }} className="hide-scrollbar">
          {dynamicFilters.map(filterKey => (
            <button
              key={filterKey}
              onClick={() => setActiveFilterKey(filterKey)}
              style={{
                background: activeFilterKey === filterKey ? '#E8F5F4' : 'var(--paper)',
                color: activeFilterKey === filterKey ? '#2D9F98' : 'var(--ink-secondary)',
                border: '1px solid var(--paper-border)',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: activeFilterKey === filterKey ? 'bold' : 'normal',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              {getFilterLabel(filterKey)}
            </button>
          ))}
        </div>
      )}

      {/* Main Content Area */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', overflowY: (activeTab === 'discover' && isSwipeMode) || activeTab === 'map' ? 'hidden' : 'auto' }}>
        
        {/* Map 탭: 애니메이션 완전 배제, 항상 마운트, visibility로만 전환 */}
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          visibility: activeTab === 'map' ? 'visible' : 'hidden',
          pointerEvents: activeTab === 'map' ? 'auto' : 'none',
          zIndex: activeTab === 'map' ? 1 : 0
        }}>
          <MapTab isVisible={activeTab === 'map'} />
        </div>

        {/* 나머지 탭: 기존 AnimatePresence 유지, map은 제외 */}
        <AnimatePresence mode="wait">
          {activeTab !== 'map' && (
            <motion.div
              key={activeTab + (activeTab === 'discover' ? isSwipeMode : '')}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}
            >
              {activeTab === 'home' && <HomeTab onSearchClick={() => setIsSearchOpen(true)} />}
              {activeTab === 'discover' && (isSwipeMode ? <SwipeDeck /> : <DiscoverList activeFilterKey={activeFilterKey} />)}
              {activeTab === 'saved' && <SavedList isSwipeMode={isSwipeMode} />}
              {activeTab === 'review' && <ReviewTab />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Bottom Tab Bar */}
      <div style={{
        display: 'flex',
        padding: '12px 0 24px 0',
        justifyContent: 'space-around',
        background: 'var(--bg-main)',
        borderTop: '1px solid var(--paper-border)',
        zIndex: 100
      }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'transparent',
                color: isActive ? 'var(--brand-primary)' : 'var(--ink-tertiary)',
                border: 'none',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                cursor: 'pointer', padding: '8px',
                width: '64px'
              }}
            >
              <tab.icon size={24} stroke={isActive ? 2.5 : 1.5} />
              <span style={{ fontSize: '11px', fontWeight: isActive ? 'bold' : 'normal' }}>{tab.label}</span>
              {isActive && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--brand-primary)', marginTop: '2px' }} />}
            </button>
          )
        })}
      </div>

      {selectedPopup && <PopupDetail />}
      
      {/* Global Modals */}
      <LoginModal />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <Toast />
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}

export default App;