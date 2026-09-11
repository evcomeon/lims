/* 试验复核 / 报告批准页（移植自 PAGES.review）
 * 三表：待复核结果 / 报告审批 / 不合格台账 · 四眼原则阻断 */
import React from 'react';
import { useLims } from '../context/LimsContext';
import { Chip } from '../components/ui';
import {
  get, type Task, type Record as RecordE, type Sample, type Entrust,
} from '../data/db';

export const ReviewPage: React.FC<{ arg?: string | null }> = () => {
  const { db, curUser, openTab, uiReview, uiSubmitReport, uiApprove } = useLims();

  const pend = db.results.filter(r => r.status === '待复核');
  const fails = db.results.filter(r => r.failLedger && r.status !== '已驳回');

  return (
    <>
      <div className="page-head">
        <div className="t">试验复核 / 报告批准</div>
        <div className="s">四眼原则：复核人 ≠ 检测员（系统强制阻断）· 批准人必须是授权签字人（孙授权）· 当前操作人：{curUser}</div>
      </div>
      <div className="tbl-wrap">
        <div className="toolbar"><b>待我复核（检测结果）</b></div>
        <table className="tbl">
          <thead><tr><th>任务编号</th><th>记录编号</th><th>样品名称</th><th>检测员</th><th>结论</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>
            {pend.length ? pend.map(r => {
              const tk = get<Task>(db, 'tasks', r.taskId);
              const rc = get<RecordE>(db, 'records', r.recordId);
              const sp = tk ? get<Sample>(db, 'samples', tk.sampleId) : null;
              const self = tk && tk.tester === curUser;
              return (
                <tr key={r.id} className={r.conclusion !== '合格' ? 'row-fail' : ''}>
                  <td className="num-col">{tk ? tk.no : ''}</td>
                  <td className="num-col">{rc ? rc.no : ''}</td>
                  <td>{sp ? sp.name : ''}</td>
                  <td>{tk ? tk.tester : ''}</td>
                  <td>{r.conclusion === '合格' ? <Chip s="合格" /> : <span className="fail-mark">指标不合格</span>}</td>
                  <td><Chip s={r.status} /></td>
                  <td className="actions">
                    <button className={'btn sm' + (self ? '' : ' primary')} onClick={() => uiReview(r.id)}>
                      {self ? '复核（本人阻断）' : '复 核'}
                    </button>
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan={7}><div className="empty"><div className="icon">🎉</div><div className="txt">暂无待复核结果</div></div></td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="tbl-wrap">
        <div className="toolbar"><b>报告审批（编制中 → 待批准 → 已批准）</b></div>
        <table className="tbl">
          <thead><tr><th>报告编号</th><th>委托编号</th><th>状态</th><th>编制（检测员）</th><th>复核</th><th>批准</th><th>操作</th></tr></thead>
          <tbody>
            {db.reports.length ? db.reports.map(rp => {
              const e = get<Entrust>(db, 'entrusts', rp.entrustId);
              const canSubmit = rp.status === '编制中';
              return (
                <tr key={rp.id}>
                  <td className="num-col">{rp.no}</td>
                  <td className="num-col">{e ? e.no : ''}</td>
                  <td><Chip s={rp.status} /></td>
                  <td>{rp.prepared.join('、')}</td>
                  <td>{rp.reviewed || '—'}</td>
                  <td>{rp.approved || '—'}</td>
                  <td className="actions">
                    {canSubmit ? <button className="btn sm primary" onClick={() => uiSubmitReport(rp.id)}>提交批准</button> : null}
                    {rp.status === '待批准' ? <button className="btn sm success" onClick={() => uiApprove(rp.id)}>批准 ✓</button> : null}
                    <button className="btn sm" onClick={() => openTab('report:' + rp.id, rp.no + ' 报告详情', 'reportDetail', rp.id)}>查看</button>
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan={7}><div className="empty">暂无报告</div></td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="tbl-wrap">
        <div className="toolbar"><b style={{ color: '#c0392b' }}>不合格试验台账（不合格试验查询）</b></div>
        <table className="tbl">
          <thead><tr><th>任务编号</th><th>不合格项</th><th>结论</th><th>状态</th></tr></thead>
          <tbody>
            {fails.length ? fails.map(r => {
              const tk = get<Task>(db, 'tasks', r.taskId);
              const bad = r.items.filter(i => !i.pass).map(i => `${i.name}=${i.val}${i.unit || ''}（标准${i.std}）`).join('；');
              return (
                <tr key={r.id} className="row-fail">
                  <td className="num-col">{tk ? tk.no : ''}</td>
                  <td>{bad}</td>
                  <td><Chip s={r.conclusion} /></td>
                  <td><Chip s={r.status} /></td>
                </tr>
              );
            }) : (
              <tr><td colSpan={4}><div className="empty">暂无不合格记录</div></td></tr>
            )}
          </tbody>
        </table>
        <div className="info-line">不合格处理建议：双倍取样复检，复检合格可改判（需批准人授权）· 自动纳入上报监管数据</div>
      </div>
    </>
  );
};
