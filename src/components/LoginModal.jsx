import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconBrandGoogle, IconBrandApple, IconMessageCircle, IconX } from '@tabler/icons-react';
import useAuthStore from '../store/useAuthStore';
import useTranslation from '../i18n/useTranslation';

export default function LoginModal() {
  const { t } = useTranslation();
  const { isAuthModalOpen, closeAuthModal, loginWithGoogle, loginWithApple, loginWithWeChat, authLoading } = useAuthStore();

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          pointerEvents: 'none'
        }}>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={closeAuthModal}
            style={{ 
              position: 'absolute', inset: 0, 
              background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
              pointerEvents: 'auto'
            }}
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              background: 'var(--surface)',
              borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
              padding: '24px 24px 40px',
              position: 'relative',
              pointerEvents: 'auto',
              boxShadow: '0 -4px 24px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--ink)' }}>{t('login.title')}</h2>
              <button onClick={closeAuthModal} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <IconX size={24} style={{ color: 'var(--ink)' }} />
              </button>
            </div>
            
            <p style={{ margin: '0 0 24px', color: 'var(--ink)', opacity: 0.7, fontSize: '15px' }}>
              Save your favorite pop-ups and write reviews to share your experience!
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={loginWithGoogle}
                disabled={authLoading}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                  width: '100%', padding: '14px', borderRadius: '12px',
                  background: '#fff', border: '1px solid #ddd',
                  fontSize: '16px', fontWeight: 'bold', color: '#333',
                  cursor: authLoading ? 'not-allowed' : 'pointer',
                  opacity: authLoading ? 0.7 : 1
                }}
              >
                <IconBrandGoogle size={20} />
                {t('login.continue_google')}
              </button>

              <button 
                onClick={loginWithApple}
                disabled={authLoading}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                  width: '100%', padding: '14px', borderRadius: '12px',
                  background: '#000', border: 'none',
                  fontSize: '16px', fontWeight: 'bold', color: '#fff',
                  cursor: 'pointer',
                  opacity: authLoading ? 0.7 : 1
                }}
              >
                <IconBrandApple size={20} />
                {t('login.continue_apple')}
              </button>

              <button 
                onClick={loginWithWeChat}
                disabled={authLoading}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                  width: '100%', padding: '14px', borderRadius: '12px',
                  background: '#07C160', border: 'none',
                  fontSize: '16px', fontWeight: 'bold', color: '#fff',
                  cursor: authLoading ? 'not-allowed' : 'pointer',
                  opacity: authLoading ? 0.7 : 1
                }}
              >
                {/* Fallback icon for WeChat since Tabler doesn't have a specific WeChat icon, MessageCircle looks like a chat bubble */}
                <IconMessageCircle size={20} />
                {t('login.continue_wechat')}
              </button>
            </div>
            
            <p style={{ margin: '24px 0 0', textAlign: 'center', fontSize: '12px', color: 'var(--ink)', opacity: 0.5 }}>
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
