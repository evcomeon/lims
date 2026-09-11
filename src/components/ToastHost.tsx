/* Toast 通知宿主 */
import React from 'react';
import { useLims, type ToastType } from '../context/LimsContext';

const ICON: Record<ToastType, string> = {
  info: 'ℹ️',
  success: '✅',
  error: '⛔',
  warn: '⚠️',
};

export const ToastHost: React.FC = () => {
  const { toasts } = useLims();
  return (
    <div id="toastBox" style={{ position: 'fixed', top: 70, right: 16, zIndex: 2000, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} className={'toast ' + t.type}>
          <span className="tico">{ICON[t.type]}</span>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
};
