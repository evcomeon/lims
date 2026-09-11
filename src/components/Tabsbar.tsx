/* 多页签栏：首页固定，其余可关闭 */
import React from 'react';
import { useLims } from '../context/LimsContext';

export const Tabsbar: React.FC = () => {
  const { tabs, activeKey, switchTab, closeTab } = useLims();
  return (
    <div className="tabsbar">
      {tabs.map(t => (
        <div
          key={t.key}
          className={'tab' + (t.key === activeKey ? ' active' : '') + (t.key === 'home' ? ' pinned' : '')}
          onClick={() => switchTab(t.key)}
        >
          {t.title}
          {t.key !== 'home' && (
            <span className="close" onClick={e => { e.stopPropagation(); closeTab(t.key); }}>✕</span>
          )}
        </div>
      ))}
    </div>
  );
};
