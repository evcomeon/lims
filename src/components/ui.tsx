/* 共享 UI 小组件：状态标签 Chip、空态 Empty
 * 移植自 lims-test-app.html 的 chip() / empty 占位 */
import React from 'react';
import { ST } from '../data/menu';

/* 状态标签：按 ST 映射到 stc-{color} 类名 */
export const Chip: React.FC<{ s: string }> = ({ s }) => {
  const text = s === '指标不合格' ? '不合格' : s;
  const cls = ST[text] || 'gray';
  return <span className={`stc stc-${cls}`}>{text}</span>;
};

/* 空态占位（表格内跨列用） */
export const Empty: React.FC<{ icon?: string; txt?: string; colspan?: number }> = ({ icon = '📭', txt = '暂无数据', colspan = 1 }) => (
  <tr><td colSpan={colspan}><div className="empty"><div className="icon">{icon}</div><div className="txt">{txt}</div></div></td></tr>
);
