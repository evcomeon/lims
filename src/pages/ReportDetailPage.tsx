/* 报告详情（移植自 PAGES.reportDetail）
 * 流程进度 · 报告汇总 · 三级签字 · CMA签章 · 打印/发放状态 */
import React from 'react';
import { useLims } from '../context/LimsContext';
import { Chip } from '../components/ui';
import {
  byIdAny, get, printOf, issueOf, samplesOf, paramsOf, taskOfParam,
  recordOfTask, activeResult, clientName, projName,
  type Entrust, type Report,
} from '../data/db';

const FLOW = ['编制中', '待批准', '已批准', '已打印', '已发放'];
const FLOW_IDX: Record<string, number> = { '编制中': 0, '待批准': 1, '已批准': 2, '已打印': 3, '已发放': 4 };

export const ReportDetailPage: React.FC<{ arg?: string | null }> = ({ arg }) => {
  const { db, openTab, uiSubmitReport, uiApprove, uiSign, uiPrint, uiIssue } = useLims();
  const rpid = arg || '';
  const rp = byIdAny(db, rpid) as Report | null;
  if (!rp) return <div className="empty">报告不存在</div>;

  const e = get<Entrust>(db, 'entrusts', rp.entrustId);
  const pr = printOf(db, rp.id);
  const ir = issueOf(db, rp.id);
  const idx = FLOW_IDX[rp.status] || 0;

  const actions: React.ReactNode[] = [];
  if (rp.status === '编制中') actions.push(<button className="btn primary" key="submit" onClick={() => uiSubmitReport(rp.id)}>提交批准（需全部结果复核通过）</button>);
  if (rp.status === '待批准') actions.push(<button className="btn success" key="approve" onClick={() => uiApprove(rp.id)}>批准通过 ✓（授权签字人）</button>);
  if (rp.status === '已批准') {
    actions.push(<button className="btn primary" key="sign" onClick={() => uiSign(rp.id)}>🏷 电子签章</button>);
    actions.push(<button className="btn" key="print" disabled={!!(pr && pr.signStatus.indexOf('已签章') < 0)} onClick={() => uiPrint(rp.id)}>🖨 打印/标记已打印</button>);
  }
  if (rp.status === '已打印') actions.push(<button className="btn success" key="issue" onClick={() => uiIssue(rp.id)}>📤 报告发放</button>);
  if (rp.status === '已发放') actions.push(<span className="stc stc-green2" key="done">流程已完成，可在委托详情归档</span>);

  const sumRows = samplesOf(db, rp.entrustId).map(sp => {
    const pms = paramsOf(db, sp.id);
    const pmsHtml = pms.length ? pms.map(pm => {
      const tk = taskOfParam(db, pm.id);
      const rc = tk ? recordOfTask(db, tk.id) : null;
      const res = rc ? activeResult(db, rc.id) : null;
      const cell = res
        ? (res.conclusion === '合格' ? <b style={{ color: '#2e7d32' }}>合格</b> : <span className="fail-mark">不合格</span>)
        : <span style={{ color: '#bfbfbf' }}>待检测</span>;
      return <React.Fragment key={pm.id}>{pm.name}：{cell}{res ? <Chip s={res.status} /> : null}<br /></React.Fragment>;
    }) : '—';
    return (
      <tr key={sp.id}>
        <td className="num-col">{sp.no}</td>
        <td>{sp.name}</td>
        <td>{pmsHtml}</td>
        <td>{sp.usage}</td>
      </tr>
    );
  });

  return (
    <>
      <div className="card">
        <div className="det-head">
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span className="stc stc-green">报</span><b style={{ color: '#5a6678' }}>检测报告</b>
            <Chip s={rp.status} />
          </div>
          <div className="det-title">{rp.no}</div>
          <div className="det-sub">
            所属委托单 {e ? e.no : ''} · {e ? clientName(db, e.clientId) : ''} · {e ? projName(db, e.projectId) : ''} · 三级签字 / CMA签章 / 打印 / 发放
          </div>
          <div className="flowline" style={{ marginTop: 10 }}>
            {FLOW.map((s, i) => (
              <React.Fragment key={s}>
                <span className={'fs' + (i < idx ? ' done' : i === idx ? ' cur' : '')}>{s}</span>
                {i < FLOW.length - 1 ? <span className="fa">→</span> : null}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="section">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{actions}</div>
        </div>
      </div>
      <div className="card">
        <div className="card-title">
          <span className="left">报告汇总（本委托单全部样品结论）</span>
          <span className="right" onClick={() => openTab('trace', '数据追溯', 'trace', rp.id)}>全链路追溯 →</span>
        </div>
        <table className="tbl">
          <thead><tr><th>样品编号</th><th>样品名称</th><th>检测参数与结论</th><th>工程部位</th></tr></thead>
          <tbody>{sumRows}</tbody>
        </table>
      </div>
      <div className="card">
        <div className="card-title"><span className="left">三级签字（编制 → 复核 → 批准）</span></div>
        <div className="section">
          <div className="sign-grid">
            <div className={'sign-cell' + (rp.prepared.length ? '' : ' empty-sign')}>
              <div className="role">编制（检测员）</div>
              <div className="name">{rp.prepared.join(' ')}</div>
              <div className="time">{e ? e.dateSend : ''} 起检测</div>
            </div>
            <div className={'sign-cell' + (rp.reviewed ? '' : ' empty-sign')}>
              <div className="role">复核</div>
              <div className="name">{rp.reviewed || '待复核'}</div>
              <div className="time">四眼原则</div>
            </div>
            <div className={'sign-cell' + (rp.approved ? '' : ' empty-sign')}>
              <div className="role">批准（授权签字人）</div>
              <div className="name">{rp.approved || '待批准'}</div>
              <div className="time">{rp.approveTime || '签字领域：基桩/建材'}</div>
            </div>
          </div>
          <div className="stampbox">
            <div className={pr && pr.signStatus.indexOf('已签章') >= 0 ? '' : 'stamp-off'}>
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="56" fill="none" stroke="#c0392b" strokeWidth="3" />
                <circle cx="60" cy="60" r="43" fill="none" stroke="#c0392b" strokeWidth="1.5" />
                <text x="60" y="46" textAnchor="middle" fontSize="16" fontWeight="700" fill="#c0392b">CMA</text>
                <text x="60" y="66" textAnchor="middle" fontSize="9" fill="#c0392b">检验检测机构资质认定</text>
                <text x="60" y="82" textAnchor="middle" fontSize="9" fill="#c0392b">No. CMA2026XXXX</text>
              </svg>
            </div>
            <div className={pr && pr.signStatus.indexOf('已签章') >= 0 ? '' : 'stamp-off'}>
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="56" fill="none" stroke="#1e5aa8" strokeWidth="3" />
                <circle cx="60" cy="60" r="43" fill="none" stroke="#1e5aa8" strokeWidth="1.5" />
                <text x="60" y="46" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1e5aa8">试验检测</text>
                <text x="60" y="64" textAnchor="middle" fontSize="12" fill="#1e5aa8">专用章</text>
                <text x="60" y="82" textAnchor="middle" fontSize="8" fill="#1e5aa8">重庆某某试验检测有限公司</text>
              </svg>
            </div>
            <div>
              <table className="kv" style={{ width: 280 }}><tbody>
                <tr><td className="k">签章状态</td><td className="v">{pr ? pr.signStatus + (pr.signer ? `（${pr.signer} ${pr.signTime}）` : '') : '—'}</td></tr>
                <tr><td className="k">打印状态</td><td className="v">{pr ? pr.printStatus + (pr.printBy ? `（${pr.printBy} ${pr.printTime}）` : '') : '—'}</td></tr>
                <tr><td className="k">发放方式</td><td className="v">{ir ? `${ir.method} · ${ir.status}${ir.trackingNo ? ' · 快递 ' + ir.trackingNo : ''}` : '—'}</td></tr>
              </tbody></table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
