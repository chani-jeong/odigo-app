import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconSearch, IconX, IconArrowLeft, IconMapPin } from '@tabler/icons-react';
import popups from '../data/popups.sample.json';
import useDeckStore from '../store/useDeckStore';

export default function SearchOverlay({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const { setPopup } = useDeckStore();

  const results = popups.filter(p => 
    p.name.en.toLowerCase().includes(query.toLowerCase()) || 
    p.location.area.toLowerCase().includes(query.toLowerCase()) ||
    p.category.includes(query)
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{
            position: 'absolute', inset: 0, zIndex: 500,
            background: 'var(--surface)',
            display: 'flex', flexDirection: 'column'
          }}
        >
          {/* Header Search Bar */}
          <div style={{ padding: '24px 20px 16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
              <IconArrowLeft size={24} style={{ color: 'var(--ink)' }} />
            </button>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--paper)', borderRadius: '12px', padding: '10px 16px', border: '1px solid rgba(0,0,0,0.1)' }}>
              <IconSearch size={18} style={{ color: 'var(--brand-primary)', marginRight: '8px' }} />
              <input
                autoFocus
                type="text"
                placeholder="Search pop-ups, areas, categories..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '15px', color: 'var(--ink)' }}
              />
              {query && (
                <button onClick={() => setQuery('')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                  <IconX size={16} style={{ color: 'var(--ink)', opacity: 0.5 }} />
                </button>
              )}
            </div>
          </div>

          {/* Results Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 24px' }}>
            {query.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {results.length > 0 ? (
                  results.map(popup => (
                    <div 
                      key={popup.id}
                      onClick={() => {
                        setPopup(popup);
                        onClose();
                      }}
                      style={{
                        display: 'flex', gap: '12px', padding: '12px', borderRadius: '16px',
                        background: 'var(--paper)', cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                      }}
                    >
                      <div style={{ width: '64px', height: '64px', borderRadius: '12px', background: 'var(--brand-tint)', flexShrink: 0 }} />
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '15px', color: 'var(--ink)', marginBottom: '4px' }}>
                          {popup.name.en}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--ink)', opacity: 0.6 }}>
                          <IconMapPin size={12} /> {popup.location.area}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink)', opacity: 0.5 }}>
                    No results found for "{query}"
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h3 style={{ margin: '0 0 16px', fontSize: '14px', color: 'var(--ink)', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px' }}>Trending Areas</h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['Seongsu', 'Hongdae', 'Itaewon', 'Yeouido'].map(area => (
                    <button
                      key={area}
                      onClick={() => setQuery(area)}
                      style={{
                        padding: '8px 16px', borderRadius: '100px',
                        background: 'var(--paper)', border: '1px solid rgba(0,0,0,0.05)',
                        color: 'var(--ink)', fontSize: '14px', cursor: 'pointer'
                      }}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
