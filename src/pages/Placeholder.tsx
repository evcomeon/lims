/* 占位页：未实现模块统一占位（移植自 renderModulePlaceholder）
 * 显示面包屑 / 父子实体 / 关联模块 / 规划字段 */
import React from 'react';
import { useLims } from '../context/LimsContext';
import { SIDEGROUPS, TOPMENU, findItemByPage, inferFields } from '../data/menu';

const REL_MAP: Record<string, [string, string][]> = {
  tuo: [['entrusts', '委托管理']],
  wai: [['entrusts', '委托管理']],
  jing: [['entrusts', '委托管理'], ['fees', '费用']],
  jian: [['assign', '任务分配'], ['work', '试验任务'], ['review', '试验复核']],
  bao: [['approve', '报告审核'], ['print', '报告打印'], ['issue', '报告发放']],
  more: [['trace', '数据追溯'], ['audit', '审计日志'], ['master', '主数据']],
};

export const Placeholder: React.FC<{ pageKey: string; title: string }> = ({ pageKey, title }) => {
  const { openTabKey } = useLims();
  const it = findItemByPage(pageKey);

  if (!it) {
    return (
      <div className="placeholder">
        <div className="empty">
          <div className="icon">🚧</div>
          <div className="txt">页面 {pageKey} 不存在</div>
        </div>
      </div>
    );
  }

  const fields = inferFields(pageKey);
  let topKey = '';
  for (const k in SIDEGROUPS) {
    if ((SIDEGROUPS[k] as any[]).indexOf(it) >= 0) { topKey = k; break; }
  }
  const topLabel = TOPMENU.find(m => m.key === topKey)?.label || '';
  const related = REL_MAP[topKey] || [];

  return (
    <div className="placeholder">
      <div className="ph-head">
        <div className="ph-icon">{it.icon}</div>
        <div>
          <div className="ph-title">{it.label}</div>
          <div className="ph-bread">
            <span className="crumb">{topLabel}</span> / <span className="crumb">{it.group}</span> / {it.label}
          </div>
        </div>
      </div>
      <div className="ph-grid">
        <div className="ph-card">
          <h4>📥 父级实体</h4>
          <ul><li><strong>{it.parent}</strong></li></ul>
        </div>
        <div className="ph-card">
          <h4>📤 子级实体</h4>
          <ul><li><strong>{it.children}</strong></li></ul>
        </div>
        <div className="ph-card">
          <h4>🔗 关联模块</h4>
          <div className="ph-rels">
            {related.length ? related.map(([k, l]) => (
              <a key={k} href="#" className="chip" onClick={e => { e.preventDefault(); openTabKey(k); }}>{l}</a>
            )) : <span style={{ color: '#9aa3b2', fontSize: 12 }}>暂无已实现的同级模块</span>}
          </div>
        </div>
      </div>
      <div className="ph-card">
        <h4>📋 规划字段（基于截图识别 + iLIS 业务标准）</h4>
        <ul>{fields.map((f, i) => <li key={i}>{f}</li>)}</ul>
      </div>
      <div className="ph-note">
        ⚠ 本模块在演示环境中暂未实现主体逻辑，当前显示的是字段与父子关系框架，可作为开发人员的实施参考。点击上方「关联模块」可跳转到已实现的业务页验证主链路。
      </div>
    </div>
  );
};
