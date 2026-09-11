/* 委托管理列表页（移植自 PAGES.entrusts）
 * 列：委托/报告编号 | 委托单位 | 工程项目 | 委托人 | 样品数 | 应收费用 | 费用状态 | 委托状态 | 操作 */
import React from 'react';
import { useLims } from '../context/LimsContext';
import { Chip } from '../components/ui';
import { feeOf, samplesOf, clientName, projName, senderName, fmtMoney } from '../data/db';

export const EntrustsPage: React.FC<{ arg?: string | null }> = () => {
  const { db, curUser, openTab, uiAddSampleTo, toast } = useLims();
  const rows = db.entrusts;

  return (
    <>
      <div className="page-head">
        <div className="t">委托管理</div>
        <div className="s">委托单列表（父子树形请点「查看」）· 委托单位/工程项目/委托人从主数据选择</div>
      </div>
      <div className="tbl-wrap">
        <div className="toolbar">
          <button className="btn primary" onClick={() => openTab('entrustNew', '新增委托', 'entrustNew', null)}>＋ 新增委托（新增收样）</button>
          <button className="btn" onClick={() => toast('演示环境：报告预约登记暂不开放', 'warn')}>报告预约</button>
          <button className="btn" onClick={() => toast('演示环境：导出 Excel 暂不开放', 'warn')}>导出</button>
          <span className="spacer"></span>
          <span style={{ color: '#8a94a6' }}>当前操作人：{curUser}</span>
        </div>
        <table className="tbl">
          <thead><tr>
            <th>委托/报告编号</th><th>委托单位</th><th>工程项目</th><th>委托人</th>
            <th>样品数</th><th>应收费用</th><th>费用状态</th><th>委托状态</th><th>操作</th>
          </tr></thead>
          <tbody>
            {rows.length ? rows.map(e => {
              const fee = feeOf(db, e.id);
              const sps = samplesOf(db, e.id);
              return (
                <tr key={e.id}>
                  <td className="num-col">
                    <a onClick={() => openTab('entrust:' + e.id, e.no + ' 委托详情', 'entrustDetail', e.id)}>{e.no}</a>
                  </td>
                  <td>{clientName(db, e.clientId)}</td>
                  <td>{projName(db, e.projectId)}</td>
                  <td>{senderName(db, e.senderId)}</td>
                  <td>{sps.length}</td>
                  <td className="num-col">{fee ? fmtMoney(fee.amount) : '—'}</td>
                  <td>{fee ? <Chip s={fee.status} /> : <Chip s="—" />}</td>
                  <td><Chip s={e.status} /></td>
                  <td className="actions">
                    <button className="btn sm" onClick={() => openTab('entrust:' + e.id, e.no + ' 委托详情', 'entrustDetail', e.id)}>查看</button>
                    <button className="btn sm" onClick={() => uiAddSampleTo(e.id)}>添加样品</button>
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan={9}><div className="empty"><div className="icon">📭</div><div className="txt">暂无委托单</div></div></td></tr>
            )}
          </tbody>
        </table>
        <div className="info-line">共 {rows.length} 条记录 · 新增委托后自动生成编号、任务（待分配）与应收费用</div>
      </div>
    </>
  );
};
