/* 左侧二级菜单：按当前顶部一级菜单分组渲染，按 group 聚类，角标计数
 * 默认收起（仅图标），点击顶部标签栏可展开/收起 */
import React, { useState } from 'react';
import { useLims } from '../context/LimsContext';
import { SIDEGROUPS, TOPMENU, type SideGroupKey } from '../data/menu';

const GROUP_ORDER: SideGroupKey[] = ['业务', '主数据', '统计', '配置', '数据', '系统'];

/* 详情页 → 侧边栏父菜单项 page（用于高亮） */
const PARENT_PAGE: Record<string, string> = {
  entrustDetail: 'entrusts', entrustNew: 'entrusts',
  taskDetail: 'work',
  reportDetail: 'reports',
};

export const Sidebar: React.FC = () => {
  const { currentTopKey, activeTab, openTabKey, db } = useLims();
  const [collapsed, setCollapsed] = useState(true);
  if (currentTopKey === 'home') return null;
  const list = SIDEGROUPS[currentTopKey] || [];
  const topLabel = TOPMENU.find(m => m.key === currentTopKey)?.label || '';
  const cur = activeTab();
  /* 当前页面对应的侧边栏 page（详情页映射到父菜单） */
  const curPage = cur ? (PARENT_PAGE[cur.page] || cur.page) : '';

  /* 按 group 聚类 */
  const grouped: Record<string, typeof list> = {};
  list.forEach(it => {
    if (!grouped[it.group]) grouped[it.group] = [];
    grouped[it.group].push(it);
  });

  return (
    <div className={'side' + (collapsed ? ' collapsed' : '')}>
      <div className="top-tag" onClick={() => setCollapsed(c => !c)} title={collapsed ? '展开菜单' : '收起菜单'}>
        {collapsed ? (
          <span className="toggle-ico">☰</span>
        ) : (
          <>
            {topLabel}
            <span className="num">{list.length}</span>
          </>
        )}
      </div>
      {GROUP_ORDER.map(g => {
        if (!grouped[g]) return null;
        return (
          <div key={g} className="menu-group">
            {!collapsed ? <div className="gt">{g}</div> : null}
            {grouped[g].map(it => {
              const n = it.cnt ? it.cnt(db) : 0;
              const activeCls = curPage === it.page ? 'active' : '';
              return (
                <a
                  key={it.key}
                  href="#"
                  className={'menu-item ' + activeCls}
                  title={it.label}
                  onClick={e => { e.preventDefault(); openTabKey(it.key); }}
                >
                  <span>{it.icon}</span>
                  {!collapsed ? <span>{it.label}</span> : null}
                  {!collapsed ? (
                    it.cnt ? (
                      <span className={'cnt' + (n === 0 ? ' zero' : '')}>{n}</span>
                    ) : !it.impl ? (
                      <span className="soon">规划中</span>
                    ) : null
                  ) : null}
                </a>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
