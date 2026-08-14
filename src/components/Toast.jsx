import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useToastStore from '../store/useToastStore';
import { IconCheck, IconInfoCircle } from '@tabler/icons-react';

export default function Toast() {
  const { toast } = useToastStore();

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ y: -50, opacity: 0, scale: 0.9 }}
          animate={{ y: 20, opacity: 1, scale: 1 }}
          exit={{ y: -50, opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <div style={{
            background: toast.type === 'success' ? '#2e3a36' : '#222',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '100px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
            fontSize: '14px',
            fontWeight: 'bold',
            backdropFilter: 'blur(10px)',
          }}>
            {toast.type === 'success' ? (
              <IconCheck size={18} style={{ color: 'var(--brand-primary)' }} />
            ) : (
              <IconInfoCircle size={18} style={{ color: '#aaa' }} />
            )}
            {toast.message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
