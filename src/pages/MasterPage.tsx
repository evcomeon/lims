/* 主数据页（移植自 PAGES.master）
 * 三表：委托单位 / 工程项目 / 送样人 · 新增（模拟OCR入库） */
import React from 'react';
import { useLims } from '../context/LimsContext';
import { Chip } from '../components/ui';
import { clientName, type Client, type Project, type Sender } from '../data/db';

export const MasterPage: React.FC<{ arg?: string | null }> = () => {
  const { db, uiAddMaster } = useLims();

  return (
    <>
      <div className="page-head">
        <div className="t">主数据（委托单位 / 工程项目 / 送样人）</div>
        <div className="s">来源：送检单位上传 → OCR识别 → 管理员审核入库（禁止手录）· 被引用中的主数据不可停用/删除</div>
      </div>
      <div className="tbl-wrap">
        <div className="toolbar">
          <b>委托单位</b><span className="spacer"></span>
          <button className="btn sm" onClick={() => uiAddMaster('client')}>＋ 新增（模拟OCR入库）</button>
        </div>
        <table className="tbl">
          <thead><tr><th>单位名称</th><th>统一社会信用代码</th><th>法人</th><th>信用等级</th><th>状态</th></tr></thead>
          <tbody>
            {db.clients.map((c: Client) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.code}</td>
                <td>{c.legal}</td>
                <td>{c.credit}</td>
                <td><Chip s={c.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="tbl-wrap">
        <div className="toolbar">
          <b>工程项目</b><span className="spacer"></span>
          <button className="btn sm" onClick={() => uiAddMaster('project')}>＋ 新增（模拟OCR入库）</button>
        </div>
        <table className="tbl">
          <thead><tr><th>项目名称</th><th>项目编号</th><th>归属委托单位</th><th>施工单位</th><th>状态</th></tr></thead>
          <tbody>
            {db.projects.map((p: Project) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.code}</td>
                <td>{clientName(db, p.clientId)}</td>
                <td>{p.builder}</td>
                <td><Chip s={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="tbl-wrap">
        <div className="toolbar">
          <b>送样人</b><span className="spacer"></span>
          <button className="btn sm" onClick={() => uiAddMaster('sender')}>＋ 新增（模拟OCR入库）</button>
        </div>
        <table className="tbl">
          <thead><tr><th>姓名</th><th>所属单位</th><th>职务</th><th>联系电话</th><th>状态</th></tr></thead>
          <tbody>
            {db.senders.map((s: Sender) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{clientName(db, s.clientId)}</td>
                <td>{s.title}</td>
                <td>{s.phone}</td>
                <td><Chip s={s.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
