/* 试验任务页 / 任务工作台（移植自 PAGES.work）
 * 状态切换：全部 / 待分配 / 已分配 / 检测中 / 待复核 / 报告审批中 / 已完成
 * 超时预警 · 步骤进度 · 执行检测入口 */
import React, { useState } from 'react';
import { useLims } from '../context/LimsContext';
import { Chip } from '../components/ui';
import {
  get, recordOfTask, stepsOf, TODAY,
  type Task, type Sample,
} from '../data/db';

const TABS = ['全部', '待分配', '已分配', '检测中', '待复核', '报告审批中', '已完成'] as const;

export const WorkPage: React.FC<{ arg?: string | null }> = () => {
  const { db, curUser, openTab, toast } = useLims();
  const [tab, setTab] = useState<typeof TABS[number]>('全部');

  const overdue = db.tasks.filter((t: Task) => t.status === '检测中' && t.dueDate && t.dueDate < TODAY());
  const list = db.tasks.filter((t: Task) => tab === '全部' || t.status === tab);

  return (
    <>
      <div className="page-head">
        <div className="t">任务工作台（试验任务）</div>
        <div className="s">检测员在此录入原始数据 · 步骤严格顺序依赖 · 当前操作人：{curUser}（执行检测须为任务检测员）</div>
      </div>
      {overdue.length ? (
        <div className="alert-bar red">超出标准完成时间未完成（{overdue.length}）：<span className="num">{overdue.map(t => t.no).join('、')}</span></div>
      ) : null}
      <div className="tabs-sub">
        {TABS.map(f => (
          <span key={f} className={'ts' + (tab === f ? ' active' : '')} onClick={() => setTab(f)}>{f}</span>
        ))}
      </div>
      <div className="tbl-wrap">
        <div className="toolbar">
          <button className="btn" onClick={() => toast('演示环境：打印空表已随任务分配单发放（示例数据）', 'info')}>打印空表</button>
          <button className="btn" onClick={() => toast('演示环境：任务转交暂不开放', 'warn')}>任务转交</button>
          <button className="btn" onClick={() => toast('演示环境：放弃任务暂不开放', 'warn')}>放弃任务</button>
          <span className="spacer"></span>
        </div>
        <table className="tbl">
          <thead><tr>
            <th>状态</th><th>任务编号</th><th>样品编号</th><th>记录编号</th>
            <th>样品名称</th><th>步骤</th><th>检测人员</th><th>操作</th>
          </tr></thead>
          <tbody>
            {list.length ? list.map(t => {
              const sp = get<Sample>(db, 'samples', t.sampleId);
              const rc = recordOfTask(db, t.id);
              const steps = rc ? stepsOf(db, rc.id) : [];
              const doneN = steps.filter(s => s.status === '已完成').length;
              return (
                <tr key={t.id}>
                  <td><Chip s={t.status} /></td>
                  <td className="num-col">{t.no}</td>
                  <td className="num-col">{sp ? sp.no : ''}</td>
                  <td className="num-col">{rc ? rc.no : '—'}</td>
                  <td>{sp ? sp.name : ''}</td>
                  <td>{steps.length ? `${doneN}/${steps.length}` : '—'}</td>
                  <td>
                    {t.tester || '未分配'}
                    {t.tester === curUser ? <span className="stc stc-blue">本人</span> : null}
                  </td>
                  <td className="actions">
                    {t.status === '待分配' ? (
                      <button className="btn sm" onClick={() => toast('请先在「任务分配」页完成分配', 'warn')}>未分配</button>
                    ) : (
                      <button className="btn sm primary" onClick={() => openTab('task:' + t.id, t.no + ' 检测执行', 'taskDetail', t.id)}>执行检测</button>
                    )}
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan={8}><div className="empty"><div className="icon">📭</div><div className="txt">暂无任务</div></div></td></tr>
            )}
          </tbody>
        </table>
        <div className="info-line">共 {list.length} 条</div>
      </div>
    </>
  );
};
