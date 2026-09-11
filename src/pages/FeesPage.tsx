/* 检测收费页（移植自 PAGES.fees）
 * 状态切换：未结算 / 待退费 / 已结算 / 已退费 / 全部
 * 4 KPI 卡 · 11 列表格 · 结算/退费操作 */
import React, { useState } from 'react';
import { useLims } from '../context/LimsContext';
import { Chip } from '../components/ui';
import {
  get, clientName, projName, fmtMoney,
  type Entrust,
} from '../data/db';

const FEE_TABS = ['未结算', '待退费', '已结算', '已退费', '全部'] as const;

export const FeesPage: React.FC<{ arg?: string | null }> = () => {
  const { db, curUser, openTab, uiSettle, uiRefundApply, uiRefundConfirm, uiRefundCancel, toast } = useLims();
  const [tab, setTab] = useState<typeof FEE_TABS[number]>('未结算');

  const list = db.fees.filter(f => tab === '全部' || f.status === tab);
  const sumAmt = db.fees.filter(f => f.status !== '已退费').reduce((a, f) => a + f.amount, 0);
  const sumPaid = db.fees.reduce((a, f) => a + (f.paid || 0), 0);
  const sumRefunding = db.fees.filter(f => f.status === '待退费').reduce((a, f) => a + (f.refundAmt || 0), 0);
  const cnt = (st: string) => db.fees.filter(f => f.status === st).length;

  return (
    <>
      <div className="page-head">
        <div className="t">检测收费</div>
        <div className="s">委托单自动生成的应收费用 · 结算/退费操作限「检测主管」角色（右上角切换）· 全部操作写入审计日志</div>
      </div>
      {db.fees.some(f => f.status === '未结算' && f.mark === '迟') ? (
        <div className="alert-bar">欠费预警：存在标记「迟」的未结算费用，超期未收，请跟进催收。</div>
      ) : null}
      <div className="tabs-sub">
        {FEE_TABS.map(t => {
          const n = t === '全部' ? db.fees.length : cnt(t);
          return (
            <span key={t} className={'ts' + (tab === t ? ' active' : '')} onClick={() => setTab(t)}>
              {t}{n ? <b style={{ color: '#b8860b' }}> {n}</b> : ''}
            </span>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '0 0 12px' }}>
        <div className="kpi k-blue"><div className="big">{fmtMoney(sumAmt)}</div><div className="small">应收总额</div></div>
        <div className="kpi k-green"><div className="big">{fmtMoney(sumPaid)}</div><div className="small">已收金额</div></div>
        <div className="kpi k-orange"><div className="big">{fmtMoney(Math.max(0, sumAmt - sumPaid))}</div><div className="small">未收金额</div></div>
        <div className="kpi k-red"><div className="big">{fmtMoney(sumRefunding)}</div><div className="small">待退费金额</div></div>
      </div>
      <div className="tbl-wrap">
        <div className="toolbar">
          <button className="btn" onClick={() => toast('演示环境：批量结算暂不开放', 'warn')}>批量结算</button>
          <button className="btn" onClick={() => toast('演示环境：导出对账单暂不开放', 'warn')}>导出对账单</button>
          <span className="spacer"></span>
          <span style={{ color: '#8a94a6' }}>当前操作人：{curUser}（检测主管）</span>
        </div>
        <table className="tbl">
          <thead><tr>
            <th>费用编号</th><th>委托编号</th><th>委托单位</th><th>工程项目</th>
            <th>应收金额</th><th>已收金额</th><th>退费金额</th><th>支付方式</th>
            <th>费用状态</th><th>标记</th><th>操作</th>
          </tr></thead>
          <tbody>
            {list.length ? list.map(f => {
              const e = get<Entrust>(db, 'entrusts', f.entrustId);
              let acts: React.ReactNode = <span style={{ color: '#8a94a6' }}>—</span>;
              if (f.status === '未结算') acts = <>
                <button className="btn sm success" onClick={() => uiSettle(f.id)}>结算</button>
                <button className="btn sm warn" onClick={() => uiRefundApply(f.id)}>退费申请</button>
              </>;
              else if (f.status === '已结算') acts = <>
                <button className="btn sm warn" onClick={() => uiRefundApply(f.id)}>退费申请</button>
              </>;
              else if (f.status === '待退费') acts = <>
                <button className="btn sm danger" onClick={() => uiRefundConfirm(f.id)}>确认退费</button>
                <button className="btn sm" onClick={() => uiRefundCancel(f.id)}>取消申请</button>
              </>;
              return (
                <tr key={f.id}>
                  <td className="num-col">{f.no}</td>
                  <td className="num-col">
                    <a onClick={() => openTab('entrust:' + f.entrustId, (e ? e.no : f.entrustId) + ' 委托详情', 'entrustDetail', f.entrustId)}>{e ? e.no : f.entrustId}</a>
                  </td>
                  <td>{clientName(db, f.clientId)}</td>
                  <td>{e ? projName(db, e.projectId) : '—'}</td>
                  <td className="num-col">{fmtMoney(f.amount)}</td>
                  <td className="num-col">{fmtMoney(f.paid || 0)}</td>
                  <td className="num-col">{f.status === '待退费' || f.status === '已退费' ? <span style={{ color: '#b91c1c' }}>{fmtMoney(f.refundAmt || 0)}</span> : '—'}</td>
                  <td>{f.payType || '—'}</td>
                  <td><Chip s={f.status} /></td>
                  <td>{f.mark === '迟' ? <span className="stc stc-red">迟</span> : f.mark === '退' ? <span className="stc stc-orange">退</span> : <span className="stc stc-green">正</span>}</td>
                  <td className="actions">
                    {acts}
                    <button className="btn sm" onClick={() => openTab('entrust:' + f.entrustId, (e ? e.no : f.entrustId) + ' 委托详情', 'entrustDetail', f.entrustId)}>查看委托</button>
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan={11}><div className="empty"><div className="icon">📭</div><div className="txt">暂无{tab}费用记录</div></div></td></tr>
            )}
          </tbody>
        </table>
        <div className="info-line">共 {list.length} 条记录 · 状态机：未结算 →（结算）→ 已结算；未结算/已结算 →（退费申请）→ 待退费 →（确认退费）→ 已退费</div>
      </div>
    </>
  );
};
