/* 报告综合页（移植自 PAGES.reports）
 * 支持 statusFilter（来自页签 arg 或 approve/print/issue 包装）
 * 顶部状态统计 KPI · 状态过滤列表 */
import React from 'react';
import { useLims } from '../context/LimsContext';
import { Chip } from '../components/ui';
import { ReportPrintPreview } from '../components/ReportPrintPreview';
import { get, samplesOf, paramsOf, clientName, type Db, type Entrust, type Report } from '../data/db';

const SUBTITLES: Record<string, string> = {
  '待批准': '仅显示待批准报告（编制完成 / 复核通过 / 等待终审批准）',
  '已批准': '仅显示已批准报告（批准后进入打印环节）',
  '已打印': '仅显示已打印报告（可执行发放）',
  '已发放': '仅显示已发放报告（流程闭环，归档中）',
  '':        '1个委托单1份报告（多样品合并）· 三级签字 · CMA电子签章 · 打印后方能发放',
};

const STATUS_LIST = ['编制中', '待批准', '已批准', '已打印', '已发放'];

/* 委托单的检测参数总数（用于「汇总」列） */
function paramsCount(db: Db, eid: string): number {
  let n = 0;
  samplesOf(db, eid).forEach(sp => { n += paramsOf(db, sp.id).length; });
  return n;
}

export const ReportsPage: React.FC<{ arg?: string | null; statusFilter?: string }> = ({ arg, statusFilter }) => {
  const { db, openTab, openModal } = useLims();
  const flt = statusFilter || arg || '';
  const list: Report[] = flt ? db.reports.filter(r => r.status === flt) : db.reports;

  const subtitle = SUBTITLES[flt] || SUBTITLES[''];

  /* 打印预览：弹窗展示 A4 排版报告，可导出 PDF */
  const openPreview = (rp: Report) => {
    openModal({
      title: '打印预览 · ' + rp.no,
      wide: true,
      body: (
        <>
          <div className="print-toolbar no-print">
            <span style={{ color: '#8a94a6', fontSize: 12 }}>A4 纵向（210mm × 297mm）· 点击「打印 / 导出 PDF」后在打印对话框选择打印机或"另存为 PDF"</span>
            <button className="btn primary sm" onClick={() => window.print()}>🖨 打印 / 导出 PDF</button>
          </div>
          <ReportPrintPreview db={db} rp={rp} />
        </>
      ),
    });
  };

  /* 顶部状态统计 */
  const stats: Record<string, number> = {};
  STATUS_LIST.forEach(s => { stats[s] = db.reports.filter(r => r.status === s).length; });

  return (
    <>
      <div className="page-head">
        <div className="t">报告管理（批准 → 打印 → 发放）{flt ? ' · ' + flt : ''}</div>
        <div className="s">{subtitle}</div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {STATUS_LIST.map(s => {
          const n = stats[s];
          return (
            <div
              key={s}
              className={'kpi ' + (n > 0 ? 'k-orange' : 'k-grey')}
              style={{ minWidth: 140, cursor: 'pointer' }}
              onClick={() => openTab('rpstat:' + s, '报告 · ' + s, 'reports', s)}
            >
              <div className="big">{n}</div>
              <div className="small">{s}</div>
            </div>
          );
        })}
      </div>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr>
            <th>报告编号</th><th>委托编号</th><th>委托单位</th><th>状态</th><th>汇总</th><th>操作</th>
          </tr></thead>
          <tbody>
            {list.length ? list.map(rp => {
              const e = get<Entrust>(db, 'entrusts', rp.entrustId);
              return (
                <tr key={rp.id}>
                  <td className="num-col">
                    <a onClick={() => openTab('report:' + rp.id, rp.no + ' 报告详情', 'reportDetail', rp.id)}>{rp.no}</a>
                  </td>
                  <td className="num-col">{e ? e.no : ''}</td>
                  <td>{e ? clientName(db, e.clientId) : ''}</td>
                  <td><Chip s={rp.status} /></td>
                  <td>{samplesOf(db, rp.entrustId).length}样品 / {paramsCount(db, rp.entrustId)}参数</td>
                  <td className="actions">
                    <button className="btn sm primary" onClick={() => openTab('report:' + rp.id, rp.no + ' 报告详情', 'reportDetail', rp.id)}>打开</button>
                    <button className="btn sm" onClick={() => openPreview(rp)}>🖨 打印预览</button>
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan={6}><div className="empty"><div className="icon">📭</div><div className="txt">暂无{flt}报告</div></div></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};
