/* 报告打印预览：正式 CNAS/CMA 风格检测报告，A4 排版（210mm × 297mm）
 * 数据来源于系统 db（委托单、样品、参数、结果、三级签字、签章状态）
 * 通过「打印 / 导出 PDF」按钮调用 window.print()，配合 @media print CSS 仅打印 A4 区域，
 * 浏览器打印对话框中选择"另存为 PDF"即可得到 PDF 文件 */
import React from 'react';
import {
  get, samplesOf, paramsOf, taskOfParam, recordOfTask, activeResult, printOf,
  clientName, projName, senderName, TODAY,
  type Db, type Entrust, type Report, type Sample,
} from '../data/db';

export interface PreviewItem { name: string; std: string; conclusion: string | null }
export interface PreviewRow { sp: Sample; items: PreviewItem[]; overall: string }

/* 汇总某委托单下每个样品的参数结论 */
export function reportRows(db: Db, eid: string): PreviewRow[] {
  return samplesOf(db, eid).map(sp => {
    const items: PreviewItem[] = paramsOf(db, sp.id).map(pm => {
      const tk = taskOfParam(db, pm.id);
      const rc = tk ? recordOfTask(db, tk.id) : null;
      const res = rc ? activeResult(db, rc.id) : null;
      return { name: pm.name, std: pm.std, conclusion: res ? res.conclusion : null };
    });
    const bad = items.some(i => i.conclusion && i.conclusion !== '合格');
    const allPass = items.length > 0 && items.every(i => i.conclusion === '合格');
    const overall = bad ? '不合格' : allPass ? '合格' : '待检测';
    return { sp, items, overall };
  });
}

export const ReportPrintPreview: React.FC<{ db: Db; rp: Report }> = ({ db, rp }) => {
  const e = get<Entrust>(db, 'entrusts', rp.entrustId);
  if (!e) return null;

  const rows = reportRows(db, e.id);
  const bad = rows.some(r => r.overall === '不合格');
  const allPass = rows.length > 0 && rows.every(r => r.overall === '合格');
  const overall = bad ? '不合格' : allPass ? '合格' : '待检测';

  const pr = printOf(db, rp.id);
  const signed = !!pr && pr.signStatus.indexOf('已签章') >= 0;

  const conclusionText = bad
    ? '经检测，所送样品部分检测参数结果不符合相关规范/标准要求，判定为不合格（详见检测结果汇总表），请委托方按有关规定处理。'
    : allPass
      ? '经检测，所送样品的上述检测参数结果符合相关规范/标准要求，判定为合格。'
      : '样品检测尚未完成，待全部检测参数完成后出具正式结论。';

  /* 结果表行：每个参数一行，样品信息在首行 rowspan 合并 */
  const tableRows: React.ReactNode[] = [];
  let seq = 0;
  rows.forEach(r => {
    const span = Math.max(r.items.length, 1);
    if (r.items.length === 0) {
      tableRows.push(
        <tr key={r.sp.id}>
          <td>{++seq}</td>
          <td className="mono">{r.sp.no}</td>
          <td>{r.sp.name}{r.sp.spec ? `（${r.sp.spec}）` : ''}</td>
          <td>—</td>
          <td>—</td>
          <td>待检测</td>
        </tr>,
      );
      return;
    }
    r.items.forEach((it, k) => {
      tableRows.push(
        <tr key={r.sp.id + '-' + k}>
          {k === 0 && (
            <>
              <td rowSpan={span}>{++seq}</td>
              <td rowSpan={span} className="mono">{r.sp.no}</td>
              <td rowSpan={span}>{r.sp.name}{r.sp.spec ? `（${r.sp.spec}）` : ''}</td>
            </>
          )}
          <td>{it.name}{it.std ? `（${it.std}）` : ''}</td>
          <td>—</td>
          <td>{it.conclusion ? (it.conclusion === '指标不合格' ? '不合格' : it.conclusion) : '待检测'}</td>
        </tr>,
      );
    });
  });

  return (
    <div className="print-a4">
      {/* 报告头 */}
      <div className="a4-head">
        <svg width="52" height="52" viewBox="0 0 120 120" style={{ position: 'absolute', left: 0, top: 4, opacity: signed ? 1 : .35 }}>
          <circle cx="60" cy="60" r="56" fill="none" stroke="#c0392b" strokeWidth="6" />
          <text x="60" y="54" textAnchor="middle" fontSize="30" fontWeight="700" fill="#c0392b">CMA</text>
          <text x="60" y="80" textAnchor="middle" fontSize="15" fill="#c0392b">1600XXXXX</text>
        </svg>
        <div className="a4-title">检 测 报 告</div>
        <div className="a4-title-en">TEST REPORT</div>
        <div className="a4-no">报告编号：<span className="mono">{rp.no}</span></div>
      </div>

      {/* 基本信息 */}
      <table className="a4-tbl a4-info"><tbody>
        <tr>
          <td className="k">委托单位</td><td>{clientName(db, e.clientId)}</td>
          <td className="k">工程名称</td><td>{projName(db, e.projectId)}</td>
        </tr>
        <tr>
          <td className="k">委托编号</td><td className="mono">{e.no}</td>
          <td className="k">检测类别</td><td>{e.testForm}{e.domain ? ` · ${e.domain}` : ''}</td>
        </tr>
        <tr>
          <td className="k">样品来源</td><td>{e.sampleSource}</td>
          <td className="k">检测部门</td><td>{e.dept}</td>
        </tr>
        <tr>
          <td className="k">送样单位</td><td>{senderName(db, e.senderId)}</td>
          <td className="k">送样日期</td><td>{e.dateSend}</td>
        </tr>
      </tbody></table>

      {/* 检测结果汇总 */}
      <div className="a4-sec">检测结果汇总</div>
      <table className="a4-tbl a4-result">
        <thead>
          <tr><th style={{ width: 28 }}>序号</th><th>样品编号</th><th>样品名称</th><th>检测参数（检测依据）</th><th style={{ width: 46 }}>单位</th><th style={{ width: 56 }}>结论</th></tr>
        </thead>
        <tbody>{tableRows}</tbody>
      </table>

      {/* 检测结论 */}
      <div className="a4-sec">检测结论</div>
      <p className="a4-conclusion"><b>结论：{overall}。</b>{conclusionText}</p>

      {/* 三级签字 + 签章 */}
      <div className="a4-signs">
        <div className="a4-sign"><span className="role">编制：</span><span className="name">{rp.prepared.length ? rp.prepared.join('、') : '________'}</span><span className="time">{e.dateSend}</span></div>
        <div className="a4-sign"><span className="role">复核：</span><span className="name">{rp.reviewed || '________'}</span><span className="time">{rp.reviewed ? '四眼原则' : ''}</span></div>
        <div className="a4-sign"><span className="role">批准：</span><span className="name">{rp.approved || '________'}</span><span className="time">{rp.approveTime || ''}</span></div>
      </div>

      {/* 红色印章（已签章时显示） */}
      {signed ? (
        <>
          <svg className="a4-stamp a4-stamp-cma" width="110" height="110" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="56" fill="none" stroke="#c0392b" strokeWidth="3" />
            <circle cx="60" cy="60" r="43" fill="none" stroke="#c0392b" strokeWidth="1.5" />
            <text x="60" y="46" textAnchor="middle" fontSize="16" fontWeight="700" fill="#c0392b">CMA</text>
            <text x="60" y="66" textAnchor="middle" fontSize="9" fill="#c0392b">检验检测机构资质认定</text>
            <text x="60" y="82" textAnchor="middle" fontSize="9" fill="#c0392b">No. CMA2026XXXX</text>
          </svg>
          <svg className="a4-stamp a4-stamp-org" width="110" height="110" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="56" fill="none" stroke="#1e5aa8" strokeWidth="3" />
            <circle cx="60" cy="60" r="43" fill="none" stroke="#1e5aa8" strokeWidth="1.5" />
            <text x="60" y="46" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1e5aa8">试验检测</text>
            <text x="60" y="64" textAnchor="middle" fontSize="12" fill="#1e5aa8">专用章</text>
            <text x="60" y="82" textAnchor="middle" fontSize="8" fill="#1e5aa8">重庆某某试验检测有限公司</text>
          </svg>
        </>
      ) : null}

      {/* 声明 */}
      <div className="a4-notes">
        <div>声明：</div>
        <div>1. 本报告未加盖"检验检测专用章"及 CMA 标志无效；涂改、增删无效。</div>
        <div>2. 本报告仅对本次来样（或本次检测对象）负责，复印件未重新加盖印章无效。</div>
        <div>3. 对本报告若有异议，请于收到报告之日起十五日内向本机构书面提出。</div>
      </div>

      {/* 页脚 */}
      <div className="a4-footer">
        <span>重庆某某试验检测有限公司 · {TODAY()}</span>
        <span>第 1 页 共 1 页</span>
      </div>
    </div>
  );
};
