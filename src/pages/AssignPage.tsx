/* 任务分配页（移植自 PAGES.assign）
 * 状态切换：待分配 / 已分配 / 全部 · 龄期预警 · 分配按钮 */
import React, { useState } from 'react';
import { useLims } from '../context/LimsContext';
import { Chip } from '../components/ui';
import {
  get, paramsOf, taskOfParam, paramNames,
  type Task, type Sample, type Entrust,
} from '../data/db';

const FILTERS = ['待分配', '已分配', '全部'] as const;

export const AssignPage: React.FC<{ arg?: string | null }> = () => {
  const { db, openTab, uiAssign } = useLims();
  const [filter, setFilter] = useState<typeof FILTERS[number]>('待分配');

  /* 龄期到期预警：样品有 ageDue 且存在未完成检测的任务 */
  const warn = db.samples.filter((s: Sample) => {
    if (!s.ageDue) return false;
    return paramsOf(db, s.id).some(p => {
      const t = taskOfParam(db, p.id);
      return t && t.status !== '已完成';
    });
  });

  const list = db.tasks.filter((t: Task) => filter === '全部' || t.status === filter);

  return (
    <>
      <div className="page-head">
        <div className="t">任务分配</div>
        <div className="s">分配检测部门+检测人员+仪器后，任务进入检测员的「试验任务」列表（待分配 → 已分配）</div>
      </div>
      {warn.length ? (
        <div className="alert-bar">7 天内龄期到期（{warn.length}）：<span className="num">{warn.map(s => s.no).join('、')}</span>（混凝土试块养护到期需安排试验）</div>
      ) : null}
      <div className="tabs-sub">
        {FILTERS.map(f => (
          <span key={f} className={'ts' + (filter === f ? ' active' : '')} onClick={() => setFilter(f)}>{f}任务</span>
        ))}
      </div>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr>
            <th>任务编号</th><th>样品名称</th><th>检测参数</th><th>工程部位/用途</th>
            <th>委托编号</th><th>状态</th><th>部门/检测员</th><th>操作</th>
          </tr></thead>
          <tbody>
            {list.length ? list.map(t => {
              const sp = get<Sample>(db, 'samples', t.sampleId);
              const e = get<Entrust>(db, 'entrusts', t.entrustId);
              return (
                <tr key={t.id}>
                  <td className="num-col">{t.no}</td>
                  <td>{sp ? sp.name : '—'}</td>
                  <td>{paramNames(db, t)}</td>
                  <td>{sp ? sp.usage : ''}</td>
                  <td className="num-col">
                    <a onClick={() => openTab('entrust:' + t.entrustId, '委托详情', 'entrustDetail', t.entrustId)}>{e ? e.no : ''}</a>
                  </td>
                  <td><Chip s={t.status} /></td>
                  <td>{t.tester ? `${t.dept} / ${t.tester}` : '—'}</td>
                  <td className="actions">
                    {t.status === '待分配' ? (
                      <button className="btn sm primary" onClick={() => uiAssign(t.id)}>分配任务</button>
                    ) : (
                      <button className="btn sm" onClick={() => openTab('task:' + t.id, t.no + ' 检测执行', 'taskDetail', t.id)}>查看</button>
                    )}
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan={8}><div className="empty"><div className="icon">📭</div><div className="txt">暂无{filter}任务</div></div></td></tr>
            )}
          </tbody>
        </table>
        <div className="info-line">共 {list.length} 条 · 状态机：待分配 → 已分配 → 检测中 → 待复核 → 报告审批中 → 已完成</div>
      </div>
    </>
  );
};
