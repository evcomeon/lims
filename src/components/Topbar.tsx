/* 顶部深蓝渐变导航栏：品牌 / 一级菜单 / 搜索 / 操作人切换 / 重置 */
import React from 'react';
import { useLims } from '../context/LimsContext';
import { TOPMENU, USERS } from '../data/menu';

export const Topbar: React.FC = () => {
  const { currentTopKey, switchTop, curUser, setCurUser, resetData, toast, openModal, closeModal } = useLims();

  const onReset = () => {
    openModal({
      title: '重置示例数据',
      body: (
        <>
          <div className="mnote">
            将清空本地所有操作记录，恢复到 WT/GL-2026-2082 的初始「中途」状态（混凝土待检测、钢材待复核、基桩已复核通过、报告初稿编制中）。该操作不可撤销。
          </div>
          <div className="modal-f">
            <button className="btn" onClick={closeModal}>取消</button>
            <button className="btn danger" onClick={() => { closeModal(); resetData(); }}>确认重置</button>
          </div>
        </>
      ),
    });
  };

  const onSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') toast('演示环境暂不支持菜单搜索：' + e.currentTarget.value, 'warn');
  };

  const onUserChange = (name: string) => {
    setCurUser(name);
    const u = USERS.find(x => x.name === name);
    toast('当前操作人已切换为「' + name + '」（' + (u?.role || '') + '）', 'info');
  };

  return (
    <div className="topbar">
      <div className="brand">
        <div className="logo">iL</div>
        <div>
          <div className="cn">试验检测管理信息系统</div>
          <div className="en">LIMS TESTING WORKBENCH · 检测流程测试站</div>
        </div>
      </div>
      <div className="nav">
        {TOPMENU.map(m => (
          <a
            key={m.key}
            href="#"
            className={currentTopKey === m.key ? 'active' : ''}
            onClick={e => { e.preventDefault(); switchTop(m.key); }}
          >
            {m.key === 'home' && <span className="navi">⌂</span>}
            {m.label}
          </a>
        ))}
      </div>
      <div className="search">
        <span>🔍</span>
        <input placeholder="搜索菜单" onKeyDown={onSearch} />
      </div>
      <div className="user-area">
        <span>操作人：</span>
        <select value={curUser} onChange={e => onUserChange(e.target.value)}>
          {USERS.map(u => <option key={u.id}>{u.name}</option>)}
        </select>
        <button className="btn-mini" onClick={onReset}>重置示例数据</button>
      </div>
    </div>
  );
};
