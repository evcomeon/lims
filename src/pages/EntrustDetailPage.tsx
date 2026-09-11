/* 委托详情：父子树（移植自 PAGES.entrustDetail）
 * 样品 → 检测参数 → 检测任务/原始记录 → 检测结果 · 审计日志 */
import React from 'react';
import { useLims } from '../context/LimsContext';
import { Chip } from '../components/ui';
import {
  get, feeOf, reportOf, samplesOf, paramsOf, taskOfParam, recordOfTask,
  stepsOf, activeResult, clientName, projName, senderName, logsOf, tasksOf,
  fmtMoney,
  type Entrust, type Sample, type Sender,
} from '../data/db';

function paramsCount(db: any, eid: string): number {
  let n = 0;
  samplesOf(db, eid).forEach(sp => { n += paramsOf(db, sp.id).length; });
  return n;
}

export const EntrustDetailPage: React.FC<{ arg?: string | null }> = ({ arg }) => {
  const { db, openTab, uiAddSampleTo, uiArchive, uiSettle } = useLims();
  const eid = arg || '';
  const e = get<Entrust>(db, 'entrusts', eid);
  if (!e) return <div className="empty"><div className="icon">🚫</div><div className="txt">委托单不存在</div></div>;

  const fee = feeOf(db, e.id);
  const rp = reportOf(db, e.id);
  const snd = get<Sender>(db, 'senders', e.senderId);
  const sps = samplesOf(db, e.id);

  /* 父子树行 */
  const treeRows: React.ReactNode[] = [];
  sps.forEach(sp => {
    const st = sampleStatusInline(db, sp);
    treeRows.push(
      <tr key={sp.id} style={{ background: '#fbfcfe' }}>
        <td style={{ paddingLeft: 14 }}>
          <span className="stc stc-blue2">样</span> <b>{sp.name}</b>
          <a onClick={() => openTab('trace', '数据追溯', 'trace', sp.id)} style={{ fontFamily: 'Consolas,monospace' }}> {sp.no}</a>
          <Chip s={st} />
          {sp.ageDue ? <span className="stc stc-orange">龄期至 {sp.ageDue}</span> : null}
        </td>
        <td>{sp.qty}</td>
        <td>{fmtMoney(sp.price)}</td>
        <td colSpan={2}>{sp.usage}</td>
      </tr>
    );
    const pms = paramsOf(db, sp.id);
    if (!pms.length) {
      treeRows.push(<tr key={sp.id + '-empty'}><td colSpan={5} style={{ paddingLeft: 34, color: '#bfbfbf' }}>（未挂检测参数）</td></tr>);
    } else {
      pms.forEach(pm => {
        const tk = taskOfParam(db, pm.id);
        const rc = tk ? recordOfTask(db, tk.id) : null;
        const steps = rc ? stepsOf(db, rc.id) : [];
        const doneN = steps.filter(s => s.status === '已完成').length;
        const res = rc ? activeResult(db, rc.id) : null;
        treeRows.push(
          <tr key={pm.id}>
            <td style={{ paddingLeft: 34 }}>
              <span className="stc stc-purple">参</span> <b>{pm.name}</b>
              <span style={{ color: '#9aa3b2', fontSize: 11 }}> {pm.std}</span>
            </td>
            <td>{tk ? <><a onClick={() => openTab('trace', '数据追溯', 'trace', tk.id)}>{tk.no}</a> <Chip s={tk.status} /></> : '—'}</td>
            <td>{rc ? <a onClick={() => openTab('trace', '数据追溯', 'trace', rc.id)}>{rc.no}</a> : '—'}</td>
            <td>{steps.length ? `${doneN}/${steps.length} 步` : '—'}</td>
            <td>{res ? (res.conclusion === '合格' ? <Chip s="合格" /> : <span className="fail-mark">❌ 不合格</span>) : <Chip s="待生成" />}{res ? <Chip s={res.status} /> : null}</td>
          </tr>
        );
      });
    }
  });

  /* 审计日志 */
  const auditLogs = [
    ...logsOf(db, e.id),
    ...db.logs.filter(l => tasksOf(db, e.id).some(t => t.id === l.target)),
  ];

  return (
    <>
      <div className="card">
        <div className="det-head">
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span className="stc stc-blue">委</span><b style={{ color: '#5a6678' }}>委托单</b>
            <Chip s={e.status} />
            {fee && fee.mark === '迟' ? <span className="stc stc-red">迟</span> : null}
          </div>
          <div className="det-title">{e.no}</div>
          <div className="det-sub">
            {clientName(db, e.clientId)} · {projName(db, e.projectId)} · 委托人 {senderName(db, e.senderId)} · {sps.length}个样品 · {paramsCount(db, e.id)}个检测参数
          </div>
        </div>
        <div className="section">
          <table className="kv"><tbody>
            <tr>
              <td className="k">资料类型 / 检测形式</td><td className="v">公路工程-甲级 · {e.testForm}</td>
              <td className="k">样品来源</td><td className="v">{e.sampleSource}</td>
            </tr>
            <tr>
              <td className="k">委托单位</td><td className="v">{clientName(db, e.clientId)} <span className="flink" onClick={() => openTab('trace', '数据追溯', 'trace', e.clientId)}>→ 主数据</span></td>
              <td className="k">委托人/电话</td><td className="v">{senderName(db, e.senderId)} / {snd ? snd.phone : '—'}</td>
            </tr>
            <tr>
              <td className="k">委托日期 / 送样日期</td><td className="v">{e.dateEntrust} / {e.dateSend}</td>
              <td className="k">要求报告日期</td><td className="v">{e.dateReportStart || '—'} ~ {e.dateReportEnd || '—'}</td>
            </tr>
            <tr>
              <td className="k">支付方式 / 检测部门</td><td className="v">{e.payType} · {e.dept}</td>
              <td className="k">关联报告</td>
              <td className="v">{rp ? <span className="flink" onClick={() => openTab('report:' + rp.id, rp.no + ' 报告详情', 'reportDetail', rp.id)}>{rp.no}</span> : '（暂无）'}{rp ? <Chip s={rp.status} /> : null}</td>
            </tr>
            <tr>
              <td className="k">应收费用</td>
              <td className="v">
                {fee ? <>{fmtMoney(fee.amount)} · 已收 {fmtMoney(fee.paid)} <Chip s={fee.status} /> <button className="btn sm success" disabled={fee.status === '已结算'} onClick={() => uiSettle(fee.id)}>结算</button></> : '—'}
              </td>
              <td className="k">全链路追溯</td>
              <td className="v"><span className="flink" onClick={() => openTab('trace', '数据追溯', 'trace', e.id)}>🧭 从本委托单追溯</span></td>
            </tr>
          </tbody></table>
        </div>
        <div style={{ padding: '0 14px 12px' }}>
          <button className="btn" onClick={() => uiAddSampleTo(e.id)}>＋ 添加样品</button>
          {e.archived ? null : <button className="btn warn" onClick={() => uiArchive(e.id)}>📦 资料归档</button>}
          <span style={{ color: '#9aa3b2', fontSize: 11, marginLeft: 6 }}>归档条件：报告已发放（已签发）</span>
        </div>
      </div>
      <div className="tbl-wrap">
        <div className="toolbar"><b>父子结构树：样品 → 检测参数 → 检测任务/原始记录 → 检测结果</b></div>
        <table className="tbl">
          <thead><tr><th>实体</th><th>任务编号/状态</th><th>原始记录</th><th>步骤进度</th><th>检测结果</th></tr></thead>
          <tbody>{treeRows}</tbody>
        </table>
      </div>
      <div className="card">
        <div className="card-title"><span className="left">本委托单审计日志</span></div>
        <table className="tbl">
          <thead><tr><th>时间</th><th>操作人</th><th>动作</th><th>对象</th><th>详情</th></tr></thead>
          <tbody>
            {auditLogs.length ? auditLogs.map((l, i) => (
              <tr key={i}>
                <td style={{ whiteSpace: 'nowrap', color: '#9aa3b2' }}>{l.t}</td>
                <td>{l.user}</td>
                <td>{l.action}</td>
                <td className="num-col">{l.tname}</td>
                <td>{l.detail}</td>
              </tr>
            )) : <tr><td colSpan={5}><div className="empty">暂无日志</div></td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
};

/* 样品状态（内联避免循环依赖） */
const TASK_ORDER = ['待分配', '已分配', '检测中', '待复核', '报告审批中', '已完成'];
function sampleStatusInline(db: any, sp: Sample): string {
  const ts = paramsOf(db, sp.id).map(p => taskOfParam(db, p.id)).filter(Boolean);
  if (!ts.length) return '待分配';
  let min = 99;
  ts.forEach((t: any) => { const i = TASK_ORDER.indexOf(t.status); if (i >= 0 && i < min) min = i; });
  return TASK_ORDER[min] || '待分配';
}
