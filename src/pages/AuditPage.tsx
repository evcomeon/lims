/* 审计日志页（移植自 PAGES.audit）
 * 操作人过滤：全部 / 各用户 / 系统 · 全局操作流水 */
import React, { useState } from 'react';
import { useLims } from '../context/LimsContext';
import { USERS } from '../data/menu';

export const AuditPage: React.FC<{ arg?: string | null }> = () => {
  const { db } = useLims();
  const [user, setUser] = useState('全部');

  const list = db.logs.filter(l => user === '全部' || l.user === user);

  return (
    <>
      <div className="page-head">
        <div className="t">审计日志（全局操作流水）</div>
        <div className="s">谁在什么时间对什么对象做了什么 · 所有状态变更均记录操作人/时间/动作</div>
      </div>
      <div className="tabs-sub">
        <span className={'ts' + (user === '全部' ? ' active' : '')} onClick={() => setUser('全部')}>全部</span>
        {USERS.map(u => (
          <span key={u.id} className={'ts' + (user === u.name ? ' active' : '')} onClick={() => setUser(u.name)}>{u.name}</span>
        ))}
        <span className={'ts' + (user === '系统' ? ' active' : '')} onClick={() => setUser('系统')}>系统</span>
      </div>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr>
            <th>时间</th><th>操作人</th><th>动作</th><th>对象</th><th>详情</th>
          </tr></thead>
          <tbody>
            {list.length ? list.map((l, i) => (
              <tr key={i}>
                <td style={{ whiteSpace: 'nowrap', color: '#9aa3b2' }}>{l.t}</td>
                <td>{l.user}</td>
                <td><b style={{ color: '#1e5aa8' }}>{l.action}</b></td>
                <td className="num-col">{l.tname}</td>
                <td>{l.detail}</td>
              </tr>
            )) : (
              <tr><td colSpan={5}><div className="empty">暂无日志</div></td></tr>
            )}
          </tbody>
        </table>
        <div className="info-line">共 {list.length} 条 / 总计 {db.logs.length} 条</div>
      </div>
    </>
  );
};
