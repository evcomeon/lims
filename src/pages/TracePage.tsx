/* 数据追溯（移植自 PAGES.trace）
 * 选择任意实体 → 展示上游来源链 + 下游产出树
 * 绿色=上游来源 · 蓝色=当前 · 橙色=下游产出，点击卡片切换追溯对象 */
import React, { useState, useEffect } from 'react';
import { useLims } from '../context/LimsContext';
import {
  byIdAny, allEntityIds, typeLabelOf, displayNameOf,
  parentIdOf, childrenIdsOf,
} from '../data/db';

/* 追溯芯片：当前/上游/下游三种样式 */
const TraceChip: React.FC<{ id: string; cls: string; onClick: (id: string) => void }> = ({ id, cls, onClick }) => {
  const { db } = useLims();
  const o = byIdAny(db, id);
  if (!o) return null;
  return (
    <div className={'chip ' + cls} onClick={() => onClick(id)}>
      <span className="c1">{typeLabelOf(id)}</span>
      <span className="c2">{displayNameOf(o, id)}</span>
    </div>
  );
};

export const TracePage: React.FC<{ arg?: string | null }> = ({ arg }) => {
  const { db } = useLims();
  /* arg 携带跳转来源实体 id；本地 traceSel 等价于参考中的 TRACE_SEL */
  const [traceSel, setTraceSel] = useState<string>(arg && byIdAny(db, arg) ? arg : 'E1');

  /* 当页签 arg 变化时（从其他页签点击「追溯」跳入），同步当前追溯对象 */
  useEffect(() => {
    if (arg && byIdAny(db, arg)) setTraceSel(arg);
  }, [arg, db]);

  const id = traceSel && byIdAny(db, traceSel) ? traceSel : 'E1';
  const o = byIdAny(db, id);

  /* 上游链：沿 parentId 逐级向上，E* 还要前置 clientId/projectId/senderId */
  const ups: string[] = [];
  let p = parentIdOf(db, id);
  let guard = 0;
  while (p && guard++ < 12) { ups.unshift(p); p = parentIdOf(db, p); }
  if (id.slice(0, 1) === 'E' && id.slice(0, 2) !== 'FE' && o) {
    const e = o as { clientId?: string; projectId?: string; senderId?: string };
    ups.unshift(...[e.clientId, e.projectId, e.senderId].filter(Boolean) as string[]);
  }

  /* 下游树：递归 childrenIdsOf，Set 去重防同一实体经多路径重复展开 */
  const downList: { id: string; depth: number }[] = [];
  const seen: Record<string, boolean> = {};
  function walk(pid: string, depth: number) {
    childrenIdsOf(db, pid).forEach((cid) => {
      if (seen[cid]) return;
      seen[cid] = true;
      downList.push({ id: cid, depth });
      walk(cid, depth + 1);
    });
  }
  walk(id, 1);

  const opts = allEntityIds(db).map((eid) => {
    const eo = byIdAny(db, eid);
    return (
      <option key={eid} value={eid} selected={eid === id}>
        {typeLabelOf(eid)} · {eo ? displayNameOf(eo, eid) : eid}
      </option>
    );
  });

  return (
    <>
      <div className="trace-selector">
        <b style={{ color: '#1e2a3a' }}>选择任意实体，查看其上下游全链路：</b>&nbsp;&nbsp;
        <select value={id} onChange={(e) => setTraceSel(e.target.value)}>{opts}</select>
        &nbsp;&nbsp;<span style={{ color: '#8a94a6', fontSize: 12 }}>（绿色=上游来源 · 蓝色=当前 · 橙色=下游产出，点击卡片可切换追溯对象）</span>
      </div>
      <div className="card">
        <div className="section">
          <div className="trace-band self-band">
            <h5><span className="lg" />当前节点</h5>
            <div className="trace-flow">
              <TraceChip id={id} cls="" onClick={setTraceSel} />
              <div style={{ fontSize: 12, color: '#6b7688', padding: '6px 10px' }}>{typeLabelOf(id)}</div>
            </div>
          </div>
          {ups.length ? (
            <div className="trace-band upstream">
              <h5><span className="lg" />上游来源（我来自哪里 · {ups.length} 级）</h5>
              <div className="trace-flow">
                {ups.map((u, i) => (
                  <React.Fragment key={u + i}>
                    <TraceChip id={u} cls="up" onClick={setTraceSel} />
                    {i < ups.length - 1 ? <span className="tflow-arrow">→</span> : null}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ) : null}
          {downList.length ? (
            <div className="trace-band downstream">
              <h5><span className="lg" />下游产出（我产生了什么 · {downList.length} 个）</h5>
              <div className="trace-flow">
                {downList.map((d, i) => (
                  <React.Fragment key={d.id + i}>
                    <div style={{ marginLeft: (d.depth - 1) * 20 }}>
                      <TraceChip id={d.id} cls="down" onClick={setTraceSel} />
                    </div>
                    {i < downList.length - 1 ? <span className="tflow-arrow">↓</span> : null}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ) : null}
          <div className="mnote" style={{ marginTop: 14 }}>
            💡 追溯含义：从任何节点出发都能向上找到源头委托单与主数据，向下找到报告与发放记录——满足 CNAS 对数据可追溯性（ISO/IEC 17025 §7.5 原始记录可复现）的要求。
          </div>
        </div>
      </div>
    </>
  );
};
