/* 首页：流程总览（移植自 PAGES.home）
 * 流程节点条 · KPI 网格 · 不合格预警 · 示例案例进度 · 快捷入口 */
import React from 'react';
import { useLims } from '../context/LimsContext';
import { Chip } from '../components/ui';
import { userByName } from '../data/menu';
import {
  get, samplesOf, clientName, cntAssign, cntWork, sampleStatus,
  type Entrust, type Task,
} from '../data/db';

/* 流程节点图标（9 个 SVG，移植自参考 HTML process-bar） */
const IconEntrust = () => (
  <svg viewBox="0 0 48 48" fill="none">
    <path d="M24 4L8 14v20l16 10 16-10V14L24 4z" fill="#e6f7ff" stroke="#1e5aa8" strokeWidth="1.5" />
    <path d="M24 4v40M8 14l32 20M8 34l32-20" stroke="#1e5aa8" strokeWidth="1" opacity=".5" />
  </svg>
);
const IconFee = () => (
  <svg viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="20" fill="#e6f7ff" stroke="#1e5aa8" strokeWidth="1.5" />
    <text x="24" y="30" textAnchor="middle" fontSize="20" fontWeight="700" fill="#1e5aa8">¥</text>
  </svg>
);
const IconTask = () => (
  <svg viewBox="0 0 48 48" fill="none">
    <rect x="6" y="10" width="36" height="28" rx="2" fill="#e6f7ff" stroke="#1e5aa8" strokeWidth="1.5" />
    <path d="M14 18h20M14 24h20M14 30h12" stroke="#1e5aa8" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="34" cy="30" r="6" fill="#1890ff" stroke="#fff" strokeWidth="1.5" />
    <path d="M32 30l2 2 4-4" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </svg>
);
const IconTest = () => (
  <svg viewBox="0 0 48 48" fill="none">
    <path d="M14 6h20v10l-4 4v18a4 4 0 01-4 4h-4a4 4 0 01-4-4V20l-4-4V6z" fill="#e6f7ff" stroke="#1e5aa8" strokeWidth="1.5" />
    <circle cx="24" cy="32" r="3" fill="#1e5aa8" />
  </svg>
);
const IconReview = () => (
  <svg viewBox="0 0 48 48" fill="none">
    <rect x="8" y="6" width="26" height="36" rx="2" fill="#e6f7ff" stroke="#1e5aa8" strokeWidth="1.5" />
    <path d="M14 14h14M14 20h14M14 26h10" stroke="#1e5aa8" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="36" cy="36" r="8" fill="#52c41a" stroke="#fff" strokeWidth="1.5" />
    <path d="M32 36l3 3 6-6" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);
const IconReportReview = () => (
  <svg viewBox="0 0 48 48" fill="none">
    <rect x="6" y="10" width="36" height="28" rx="2" fill="#e6f7ff" stroke="#1e5aa8" strokeWidth="1.5" />
    <path d="M14 18h20M14 24h20M14 30h12" stroke="#1e5aa8" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="38" cy="32" r="6" fill="#fa8c16" stroke="#fff" strokeWidth="1.5" />
    <path d="M35 32l2 2 4-4" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </svg>
);
const IconApprove = () => (
  <svg viewBox="0 0 48 48" fill="none">
    <rect x="6" y="10" width="36" height="28" rx="2" fill="#e6f7ff" stroke="#1e5aa8" strokeWidth="1.5" />
    <circle cx="36" cy="32" r="6" fill="#722ed1" stroke="#fff" strokeWidth="1.5" />
    <path d="M33 32l2 2 4-4" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </svg>
);
const IconPrint = () => (
  <svg viewBox="0 0 48 48" fill="none">
    <rect x="8" y="14" width="32" height="22" rx="2" fill="#e6f7ff" stroke="#1e5aa8" strokeWidth="1.5" />
    <rect x="14" y="22" width="20" height="10" fill="#fff" stroke="#1e5aa8" strokeWidth="1" />
    <circle cx="36" cy="22" r="1.5" fill="#52c41a" />
    <circle cx="36" cy="26" r="1.5" fill="#52c41a" />
    <rect x="14" y="36" width="20" height="6" fill="#e6f7ff" stroke="#1e5aa8" strokeWidth="1.5" />
  </svg>
);
const IconIssue = () => (
  <svg viewBox="0 0 48 48" fill="none">
    <path d="M24 4l20 8v12c0 11-9 18-20 20C13 42 4 35 4 24V12l20-8z" fill="#e6f7ff" stroke="#1e5aa8" strokeWidth="1.5" />
    <path d="M16 24l6 6 12-12" stroke="#1e5aa8" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);

const FLOW_STEPS = ['已登记', '检测中', '待复核', '待审核', '已签发', '已归档'];

export const HomePage: React.FC<{ arg?: string | null }> = () => {
  const { db, curUser, openTab, openTabKey, resetData, openModal, closeModal } = useLims();

  const cntE = db.entrusts.filter(e => e.status === '已登记').length;
  const cntF = db.fees.filter(f => f.status === '未结算').length;
  const cntA = cntAssign(db);
  const cntT = cntWork(db);
  const cntR = db.results.filter(r => r.status === '待复核').length;
  const cntRR = db.reports.filter(r => r.status === '编制中').length;
  const cntAp = db.reports.filter(r => r.status === '待批准').length;
  const cntP = db.reports.filter(r => r.status === '已批准').length;
  const cntI = db.reports.filter(r => r.status === '已打印').length;
  const fails = db.results.filter(r => r.failLedger && r.status !== '已驳回');

  /* 龄期统计：基于样品 ageDue 与业务时钟 TODAY */
  const today = '2026-09-08';
  const dayDiff = (a: string, b: string) => {
    const ya = +a.slice(0, 4), ma = +a.slice(5, 7) - 1, da = +a.slice(8, 10);
    const yb = +b.slice(0, 4), mb = +b.slice(5, 7) - 1, db2 = +b.slice(8, 10);
    return Math.round((Date.UTC(ya, ma, da) - Date.UTC(yb, mb, db2)) / 86400000);
  };
  let agingOver = 0, agingDue = 0, agingSoon = 0;
  db.samples.forEach(sp => {
    if (!sp.ageDue) return;
    const diff = dayDiff(sp.ageDue, today);
    if (diff < 0) agingOver++;
    else if (diff <= 7) agingDue++;
    else if (diff <= 30) agingSoon++;
  });

  /* 图表页签切换 */
  const [chartTab, setChartTab] = React.useState(0);
  const CHART_TABS = ['收样统计图', '费用统计图', '设备部门分布', '设备购置年份分布', '单位工时统计图'];

  /* —— 各图表数据源（均来自系统 db）—— */
  /* Tab0 收样统计：按送样日期(day)汇总样品数，1-30 日序列 */
  const dayCounts = new Array(31).fill(0);
  db.samples.forEach(sp => {
    const e = get<Entrust>(db, 'entrusts', sp.entrustId);
    if (e && e.dateSend) {
      const d = +e.dateSend.slice(8, 10);
      if (d >= 1 && d <= 30) dayCounts[d]++;
    }
  });

  /* Tab1 费用统计：按委托单送样日汇总检测费用（样品单价合计），1-30 日序列 */
  const feeCounts = new Array(31).fill(0);
  db.samples.forEach(sp => {
    const e = get<Entrust>(db, 'entrusts', sp.entrustId);
    if (e && e.dateSend) {
      const d = +e.dateSend.slice(8, 10);
      if (d >= 1 && d <= 30) feeCounts[d] += sp.price;
    }
  });

  /* Tab2 设备部门分布：按任务所属部门统计任务数 */
  const deptMap: Record<string, number> = {};
  db.tasks.forEach(t => { deptMap[t.dept] = (deptMap[t.dept] || 0) + 1; });
  const deptLabels = Object.keys(deptMap);
  const deptValues = deptLabels.map(l => deptMap[l]);

  /* Tab3 设备购置年份分布：按设备编号(YQ-XXXX)推导购置年份 */
  const yearMap: Record<string, number> = {};
  db.tasks.forEach(t => {
    const m = t.inst.match(/YQ-(\d+)/);
    if (m) {
      const seq = +m[1];
      const year = 2015 + Math.floor(seq / 100); /* 编号段映射年份 */
      const yk = String(year);
      yearMap[yk] = (yearMap[yk] || 0) + 1;
    }
  });
  const yearLabels = Object.keys(yearMap).sort();
  const yearValues = yearLabels.map(l => yearMap[l]);

  /* Tab4 单位工时统计：按执行人统计已完成步骤数（工时） */
  const laborMap: Record<string, number> = {};
  db.steps.forEach(s => {
    if (s.status === '已完成' && s.executor) {
      laborMap[s.executor] = (laborMap[s.executor] || 0) + 1;
    }
  });
  /* 未完成步骤也计入对应检测员工时（计划工时） */
  db.tasks.forEach(t => {
    if (t.tester && t.status !== '已完成') {
      laborMap[t.tester] = (laborMap[t.tester] || 0) + 1;
    }
  });
  const laborLabels = Object.keys(laborMap);
  const laborValues = laborLabels.map(l => laborMap[l]);

  /* 根据当前 tab 选择数据 */
  const isLine = chartTab <= 1;
  let values: number[] = [];
  let xLabels: string[] = [];
  if (chartTab === 0) { values = dayCounts.slice(1, 31); xLabels = ['1','5','10','15','20','25','30']; }
  else if (chartTab === 1) { values = feeCounts.slice(1, 31); xLabels = ['1','5','10','15','20','25','30']; }
  else if (chartTab === 2) { values = deptValues; xLabels = deptLabels; }
  else if (chartTab === 3) { values = yearValues; xLabels = yearLabels; }
  else { values = laborValues; xLabels = laborLabels; }

  const maxV = Math.max(1, ...values);
  /* 折线图：平滑曲线 */
  const pts = values.map((v, i) => {
    const x = values.length > 1 ? (i / (values.length - 1)) * 760 : 380;
    const y = 200 - (v / maxV) * 190;
    return [x, y] as const;
  });
  const areaPath = 'M' + pts.map((p, i) => (i === 0 ? `${p[0]} ${p[1]}` : `Q${p[0] - 20} ${p[1]} ${p[0]} ${p[1]}`)).join(' ') + ` L760 200 L0 200 Z`;
  const linePath = 'M' + pts.map((p, i) => (i === 0 ? `${p[0]} ${p[1]}` : `Q${p[0] - 20} ${p[1]} ${p[0]} ${p[1]}`)).join(' ');
  const peakIdx = values.indexOf(Math.max(...values));
  const peakVal = values[peakIdx];
  const peakX = pts.length ? pts[peakIdx][0] : 0;
  const peakY = pts.length ? pts[peakIdx][1] : 200;
  /* 柱状图：柱子 */
  const barW = values.length ? 760 / values.length * 0.5 : 40;
  const bars = values.map((v, i) => {
    const x = values.length > 1 ? (i / (values.length - 1)) * 760 : 380;
    const h = (v / maxV) * 190;
    return { x: x - barW / 2, y: 200 - h, w: barW, h, v };
  });

  const nodes = [
    { n: cntE, l: '委托收样', key: 'entrusts', Icon: IconEntrust },
    { n: cntF, l: '检测收费', key: 'fees', Icon: IconFee },
    { n: cntA, l: '任务分配', key: 'assign', Icon: IconTask },
    { n: cntT, l: '试验检测', key: 'work', Icon: IconTest },
    { n: cntR, l: '复核确认', key: 'review', Icon: IconReview },
    { n: cntRR, l: '报告审核', key: 'reportRev', Icon: IconReportReview },
    { n: cntAp, l: '报告批准', key: 'approve', Icon: IconApprove },
    { n: cntP, l: '报告打印', key: 'print', Icon: IconPrint },
    { n: cntI, l: '报告领取', key: 'issue', Icon: IconIssue },
  ];

  /* 示例案例进度 */
  const e1 = get<Entrust>(db, 'entrusts', 'E1') || db.entrusts[0];
  let caseHtml: React.ReactNode = null;
  if (e1) {
    const fl = FLOW_STEPS;
    const curIdx = Math.max(fl.indexOf(e1.status), 1);
    const spList = samplesOf(db, e1.id).map(sp => {
      const st = sampleStatus(db, sp);
      return <React.Fragment key={sp.id}><a onClick={() => openTab('trace', '数据追溯', 'trace', sp.id)}>{sp.name}</a> <Chip s={st} /></React.Fragment>;
    });
    const spRender: React.ReactNode[] = [];
    spList.forEach((el, i) => { if (i > 0) spRender.push(<br key={'br' + i} />); spRender.push(el); });

    caseHtml = (
      <div className="card">
        <div className="card-title">
          <span className="left">示例案例进度 · {e1.no}（{clientName(db, e1.clientId)}）</span>
          <span className="right" onClick={() => openTab('entrust:' + e1.id, e1.no + ' 委托详情', 'entrustDetail', e1.id)}>查看详情 →</span>
        </div>
        <div className="section">
          <div style={{ marginBottom: 10 }} className="flowline">
            {fl.map((s, i) => (
              <React.Fragment key={s}>
                <span className={'fs' + (i < curIdx ? ' done' : i === curIdx ? ' cur' : '')}>{s}</span>
                {i < fl.length - 1 ? <span className="fa">→</span> : null}
              </React.Fragment>
            ))}
          </div>
          <table className="kv">
            <tbody>
              <tr><td className="k">委托单状态</td><td className="v"><Chip s={e1.status} /></td></tr>
              <tr><td className="k">样品（点击追溯）</td><td className="v">{spRender}</td></tr>
              <tr><td className="k">当前卡点</td><td className="v">混凝土试块任务 <Chip s="检测中" />（龄期 2026-10-01 到期，本测试站已解锁可直接试压）· 钢材结果 <Chip s="待复核" />（含不合格项，需复核员处理）</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-head">
        <div className="t">工作台 · 流程总览</div>
        <div className="s">欢迎您，{curUser}（{userByName(curUser)?.role || ''}） · 业务时钟 2026-09-08 · 角色提示：执行检测请切换为对应检测员；复核需四眼原则；批准请切换为「孙授权」</div>
      </div>
      <div className="process-bar">
        {nodes.map((nd, i) => (
          <React.Fragment key={i}>
            <div className="node" onClick={() => openTabKey(nd.key)}>
              <div className="ico">
                <nd.Icon />
                <span className={'badge' + (nd.n === 0 ? ' zero' : '')}>{nd.n}</span>
              </div>
              <span className="label">{nd.l}</span>
            </div>
            {i < nodes.length - 1 ? <div className="arrow"></div> : null}
          </React.Fragment>
        ))}
      </div>
      <div className="kpi-grid">
        <div className="kpi k-blue" onClick={() => openTabKey('assign')}><div className="big">{cntA}</div><div className="small">任务分配 · 待分配</div></div>
        <div className="kpi k-cyan" onClick={() => openTabKey('work')}><div className="big">{cntT}</div><div className="small">试验检测 · 进行中</div></div>
        <div className="kpi k-orange" onClick={() => openTabKey('review')}><div className="big">{cntR}</div><div className="small">复核确认 · 待复核</div></div>
        <div className="kpi k-purple" onClick={() => openTabKey('review')}><div className="big">{cntAp}</div><div className="small">报告批准 · 待批准</div></div>
        <div className="kpi k-green" onClick={() => openTab('reports', '报告管理', 'reports', null)}><div className="big">{cntP + cntI}</div><div className="small">报告打印/发放 · 待处理</div></div>
        <div className="kpi k-red" onClick={() => openTabKey('review')}><div className="big">{fails.length}</div><div className="small">不合格台账 · 条目</div></div>
        <div className="kpi k-orange" onClick={() => openTabKey('fees')}><div className="big">{cntF}</div><div className="small">费用 · 未结算</div></div>
        <div className="kpi k-blue" onClick={() => openTab('entrustNew', '新增委托', 'entrustNew', null)}><div className="big">＋</div><div className="small">新增委托单</div></div>
      </div>
      <div className="home-layout">
        <div>
          <div className="aging-grid">
            <div className={'aging' + (agingOver > 0 ? ' over' : '')}>
              <div className="lbl">龄期超期</div>
              <div className="num">{agingOver}</div>
            </div>
            <div className="aging">
              <div className="lbl">龄期到期</div>
              <div className="num">{agingDue}</div>
            </div>
            <div className="aging">
              <div className="lbl">龄期即将到期</div>
              <div className="num">{agingSoon}</div>
            </div>
          </div>

          <div className="chart-wrap">
            <div className="chart-tabs">
              {CHART_TABS.map((t, i) => (
                <div key={t} className={'ct' + (chartTab === i ? ' active' : '')} onClick={() => setChartTab(i)}>{t}</div>
              ))}
            </div>
            <div className="chart-area">
              <div className="chart-legend">
                <span className="btn">近一年</span>
                <span className="btn active">本月</span>
                <span className="btn">本周</span>
              </div>
              <div className="chart-yaxis">
                <div>{Math.ceil(maxV)}</div>
                <div>{Math.ceil(maxV * 0.75)}</div>
                <div>{Math.ceil(maxV * 0.5)}</div>
                <div>{Math.ceil(maxV * 0.25)}</div>
                <div>0</div>
              </div>
              <svg className="chart-svg" viewBox="0 0 800 220" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#1890ff" stopOpacity=".5" />
                    <stop offset="1" stopColor="#1890ff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <g transform="translate(40,10)">
                  <line x1="0" y1="200" x2="760" y2="200" stroke="#e8e8e8" strokeDasharray="3,3" />
                  <line x1="0" y1="150" x2="760" y2="150" stroke="#e8e8e8" strokeDasharray="3,3" />
                  <line x1="0" y1="100" x2="760" y2="100" stroke="#e8e8e8" strokeDasharray="3,3" />
                  <line x1="0" y1="50" x2="760" y2="50" stroke="#e8e8e8" strokeDasharray="3,3" />
                  {isLine ? (
                    <>
                      <path d={areaPath} fill="url(#blueGrad)" />
                      <path d={linePath} fill="none" stroke="#1890ff" strokeWidth="2.5" />
                      {peakVal > 0 ? (
                        <>
                          <circle cx={peakX} cy={peakY} r="4" fill="#1890ff" />
                          <text x={peakX + 12} y={peakY - 2} fontSize="11" fill="#1890ff">{peakVal}</text>
                        </>
                      ) : null}
                    </>
                  ) : (
                    bars.map((b, i) => (
                      <g key={i}>
                        <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="#1890ff" rx="2" />
                        {b.v > 0 ? <text x={b.x + b.w / 2} y={b.y - 4} fontSize="11" fill="#1890ff" textAnchor="middle">{b.v}</text> : null}
                      </g>
                    ))
                  )}
                </g>
              </svg>
              <div style={{ position: 'absolute', left: 36, right: 0, bottom: 0, display: 'flex', justifyContent: 'space-between', padding: '0 14px', color: '#8c8c8c', fontSize: 11 }}>
                {xLabels.length > 7 ? xLabels.filter((_, i) => i % Math.ceil(xLabels.length / 7) === 0 || i === xLabels.length - 1).map((l, i) => <span key={i}>{l}</span>) : xLabels.map((l, i) => <span key={i}>{l}</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>
      {fails.length ? (
        <div className="alert-bar red">不合格台账：<span className="num">{fails.length}</span> 条不合格结果——{fails.map(r => {
          const tk = get(db, 'tasks', r.taskId) as Task | null;
          return (tk ? tk.no : '') + ' ' + r.conclusion;
        }).join('；')}</div>
      ) : null}
      <div className="alert-bar">龄期预警：混凝土试块 YP-2026-12001 龄期到期日 2026-10-01（送样 2026-09-03 + 28d），到期前 7 天任务分配页橙色预警。本测试站为便于演示已解锁试压操作。</div>
      {caseHtml}
      <div className="card">
        <div className="card-title"><span className="left">快捷入口</span></div>
        <div className="section" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn primary" onClick={() => openTab('entrustNew', '新增委托', 'entrustNew', null)}>＋ 新增委托单</button>
          <button className="btn" onClick={() => openTabKey('assign')}>任务分配</button>
          <button className="btn" onClick={() => openTabKey('work')}>任务工作台</button>
          <button className="btn" onClick={() => openTabKey('review')}>复核/批准</button>
          <button className="btn" onClick={() => openTab('reports', '报告管理', 'reports', null)}>报告管理</button>
          <button className="btn" onClick={() => openTabKey('trace')}>数据追溯</button>
          <button className="btn warn" onClick={() => {
            openModal({
              title: '重置示例数据',
              body: (<>
                <div className="mnote">将清空本地所有操作记录，恢复到 WT/GL-2026-2082 的初始「中途」状态（混凝土待检测、钢材待复核、基桩已复核通过、报告初稿编制中）。该操作不可撤销。</div>
                <div className="modal-f">
                  <button className="btn" onClick={closeModal}>取消</button>
                  <button className="btn danger" onClick={() => { closeModal(); resetData(); }}>确认重置</button>
                </div>
              </>),
            });
          }}>重置示例数据</button>
        </div>
      </div>
      <div className="footer-note">iLIS 检测流程测试站 · 委托单 {e1 ? e1.no : ''} · 数据保存在浏览器 localStorage，刷新不丢失</div>
    </>
  );
};
