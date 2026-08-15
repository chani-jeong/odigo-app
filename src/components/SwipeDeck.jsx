import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { IconPhoto, IconMapPin, IconCalendarEvent, IconShieldCheck, IconX, IconHeart } from '@tabler/icons-react';
import useDeckStore from '../store/useDeckStore';
import popups from '../data/popups.sample.json';
import { getForeignerReadyStatus } from '../utils/foreignerReady';

export default function SwipeDeck() {
  const events = useDeckStore(state => state.events);
  const deckOrder = useDeckStore(state => state.deckOrder);
  const currentIndex = useDeckStore(state => state.currentIndex);
  const like = useDeckStore(state => state.like);
  const pass = useDeckStore(state => state.pass);
  const nextCard = useDeckStore(state => state.nextCard);
  const openPopup = useDeckStore(state => state.openPopup);
  const toggleSave = useDeckStore(state => state.toggleSave);
  const savedPopups = useDeckStore(state => state.savedPopups);
  const setEvents = useDeckStore(state => state.setEvents);

  useEffect(() => {
    setEvents(popups);
  }, [setEvents]);

  const controls = useAnimation();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);

  const commitAction = async (direction, id) => {
    if (direction === 'right') {
      like(id);
      if (!savedPopups.includes(id)) {
        toggleSave(id);
      }
      await controls.start({ x: 400, opacity: 0, transition: { duration: 0.3 } });
    } else if (direction === 'left') {
      pass(id);
      await controls.start({ x: -400, opacity: 0, transition: { duration: 0.3 } });
    }
    nextCard();
    x.set(0);
  };

  const handleDragEnd = (event, info, id) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      commitAction('right', id);
    } else if (info.offset.x < -threshold) {
      commitAction('left', id);
    }
  };



  const renderCard = (popup, index, isTop) => {
    let depth = index - currentIndex;
    if (!isTop) depth = index; // Fix depth calculation for non-top cards based on index passed
    
    let baseStyle = {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--paper)',
      borderRadius: '24px',
      overflow: 'hidden',
      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
      touchAction: 'none',
    };

    const status = getForeignerReadyStatus({
      en: popup.access.checks.en,
      phone: popup.access.checks.phone,
      card: popup.access.checks.card !== false,
      flow: popup.access.checks.flow,
    });

    const cardContent = (
      <>
        {/* Photo Area (Mint green) */}
        <div style={{ height: '55%', background: 'var(--brand-tint)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {popup.imageUrl ? (
            <img src={popup.imageUrl} alt={popup.name.en} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <IconPhoto size={64} style={{ color: 'rgba(0,0,0,0.1)' }} />
          )}
        </div>

        {/* Info Area */}
        <div style={{ padding: '20px 24px', background: 'var(--paper)' }}>
          {/* Tags */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <span style={{ background: 'var(--bg-main)', border: '1px solid var(--paper-border)', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', color: 'var(--ink-secondary)', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>
              {popup.category === 'beauty_fashion' ? 'Beauty & Fashion' : popup.category.toUpperCase().replace('_', ' ')}
            </span>
            {status === 'ready' && (
              <span style={{ background: 'rgba(38,196,133,0.1)', color: '#26C485', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <IconShieldCheck size={14} /> Foreigner-Ready
              </span>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <h2 style={{ margin: 0, fontSize: '24px', color: 'var(--ink)', fontFamily: 'var(--font-display)', fontWeight: 'bold' }}>{popup.name.en}</h2>
            <div style={{ background: 'var(--brand-primary)', color: '#000', padding: '4px 12px', borderRadius: '16px', fontSize: '13px', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>
              {Math.round(popup.distance || 0)}km
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--ink-secondary)', fontSize: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <IconMapPin size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ lineHeight: 1.4 }}>{popup.location.address}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconCalendarEvent size={20} style={{ flexShrink: 0 }} />
              <span>{popup.period.start} ~ {popup.period.end}</span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
            <button
              onPointerDown={(e) => e.stopPropagation()} // Prevent dragging when clicking buttons
              onClick={(e) => {
                e.stopPropagation();
                commitAction('left', popup.id);
              }}
              style={{
                width: '56px', height: '56px', borderRadius: '50%',
                border: '2px solid var(--ink)', background: 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 50
              }}
            >
              <IconX size={28} style={{ color: 'var(--ink)' }} />
            </button>
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                commitAction('right', popup.id);
              }}
              style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: 'var(--brand-primary)', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 50
              }}
            >
              <IconHeart size={28} style={{ color: '#fff' }} />
            </button>
          </div>
        </div>
      </>
    );

    if (isTop) {
      return (
        <motion.div
          key={popup.id}
          style={{ ...baseStyle, x, rotate, opacity, zIndex: 30 }}
          animate={controls}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.8}
          onDragEnd={(e, info) => handleDragEnd(e, info, popup.id)}
          onClick={() => openPopup(popup.id)}
        >
          {cardContent}
        </motion.div>
      );
    } else {
      let transform = depth === 1 ? 'translateY(12px) scale(0.96)' : 'translateY(24px) scale(0.92)';
      let zIndex = depth === 1 ? 20 : 10;
      return (
        <div key={popup.id} style={{ ...baseStyle, transform, zIndex }}>
          {cardContent}
        </div>
      );
    }
  };

  const cardsToRender = [];
  if (events.length && deckOrder.length) {
    const topIdx = deckOrder[currentIndex];
    const secondIdx = deckOrder[currentIndex + 1];
    const thirdIdx = deckOrder[currentIndex + 2];
    
    // Push in reverse order so z-index works naturally, though we force zIndex
    if (events[thirdIdx]) cardsToRender.push(renderCard(events[thirdIdx], 2, false));
    if (events[secondIdx]) cardsToRender.push(renderCard(events[secondIdx], 1, false));
    if (events[topIdx]) cardsToRender.push(renderCard(events[topIdx], 0, true));
  }

  return (
    <div style={{ flex: 1, position: 'relative', margin: '0 20px 20px' }}>
      {cardsToRender}
    </div>
  );
}
