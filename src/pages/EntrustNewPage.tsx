/* 新增委托表单页（移植自 PAGES.entrustNew + entrustFormHTML）
 * 委托信息 + 样品信息 · 委托单位/工程项目/委托人必须从主数据选择 */
import React from 'react';
import { useLims } from '../context/LimsContext';
import { PAY_WAYS, DEPTS } from '../data/menu';
import { TEMPLATES } from '../data/templates';
import { fmtMoney } from '../data/db';

export const EntrustNewPage: React.FC<{ arg?: string | null }> = () => {
  const { db, newE, setNewE, uiAddSampleModal, uiSaveEntrust, closeTab, toast } = useLims() as any;

  /* 委托单位变更时联动项目与送样人 */
  const onClientChange = (clientId: string) => {
    setNewE((prev: any) => ({ ...prev, clientId, projectId: '', senderId: '' }));
  };

  const projs = db.projects.filter((p: any) => p.clientId === newE.clientId);
  const senders = db.senders.filter((s: any) => s.clientId === newE.clientId);
  const curSender = db.senders.find((s: any) => s.id === newE.senderId);

  const set = (k: string, v: string) => setNewE((prev: any) => ({ ...prev, [k]: v }));

  const sampleTotal = newE.samples.reduce((a: number, s: any) => a + (s.price || 0), 0);

  return (
    <>
      <div className="page-head">
        <div className="t">新增委托（新增收样）</div>
        <div className="s">委托单位/工程项目/委托人必须从已审核主数据中选择，禁止手工录入 · 保存后自动生成委托编号与应收费用</div>
      </div>
      <div className="form-section">
        <div className="sec-title">委托信息</div>
        <div className="form-grid">
          <div className="form-row">
            <label>资料类型</label><div className="field"><span className="ro">公路工程-甲级</span></div>
            <label>检测形式</label><div className="field">
              <select value={newE.testForm} onChange={e => set('testForm', e.target.value)}>
                <option>初检</option><option>复检</option><option>仲裁检验</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <label>编号类别</label><div className="field">
              <select value={newE.cat} onChange={e => set('cat', e.target.value)}>
                <option>WT/GL</option><option>WT/SY</option>
              </select>
            </div>
            <label>委托编号</label><div className="field"><input readOnly placeholder="保存后自动生成" /><span className="hint">保存后自动生成</span></div>
          </div>
          <div className="form-row">
            <label>检测类别</label><div className="field"><span className="ro">委托检测</span></div>
            <label>样品来源</label><div className="field">
              <select value={newE.sampleSource} onChange={e => set('sampleSource', e.target.value)}>
                <option>客户自送</option><option>现场抽样</option><option>委托方提供</option>
              </select>
            </div>
          </div>
          <div className="form-row required">
            <label>委托单位</label><div className="field">
              <select value={newE.clientId} onChange={e => onClientChange(e.target.value)}>
                <option value="">请选择</option>
                {db.clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <label>工程项目</label><div className="field">
              <select value={newE.projectId} onChange={e => set('projectId', e.target.value)}>
                <option value="">{projs.length ? '请选择' : '（该单位暂无已审核项目）'}</option>
                {projs.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row required">
            <label>委托人</label><div className="field">
              <select value={newE.senderId} onChange={e => set('senderId', e.target.value)}>
                <option value="">{senders.length ? '请选择' : '（该单位暂无已审核送样人）'}</option>
                {senders.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <label>委托人电话</label><div className="field"><input readOnly placeholder="选择委托人后自动带出" value={curSender ? curSender.phone : ''} /></div>
          </div>
          <div className="form-row required">
            <label>委托日期</label><div className="field"><input type="date" value={newE.date} onChange={e => set('date', e.target.value)} /></div>
            <label>送样日期</label><div className="field"><input type="date" value={newE.dateSend} onChange={e => set('dateSend', e.target.value)} /></div>
          </div>
          <div className="form-row">
            <label>要求报告日期</label><div className="field">
              <input type="date" value={newE.dateReportStart} onChange={e => set('dateReportStart', e.target.value)} />
              <span>~</span>
              <input type="date" value={newE.dateReportEnd} onChange={e => set('dateReportEnd', e.target.value)} />
            </div>
            <label>支付方式</label><div className="field">
              <select value={newE.payType} onChange={e => set('payType', e.target.value)}>
                {PAY_WAYS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <label>检测部门</label><div className="field">
              <select value={newE.dept} onChange={e => set('dept', e.target.value)}>
                {DEPTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <label>备注</label><div className="field"><input placeholder="选填" value={newE.memo} onChange={e => set('memo', e.target.value)} /></div>
          </div>
        </div>
      </div>
      <div className="form-section">
        <div className="sec-title">样品信息 <span style={{ fontWeight: 400, color: '#8a94a6', fontSize: 11 }}>（添加样品并勾选检测参数后，系统自动生成样品编号、检测参数与待分配任务）</span></div>
        <div className="section">
          <div className="toolbar" style={{ padding: '0 0 10px', border: 0 }}>
            <button className="btn primary" onClick={uiAddSampleModal}>＋ 添加样品</button>
          </div>
          {newE.samples.length ? (
            <div className="tbl-wrap" style={{ margin: 0 }}>
              <table className="tbl">
                <thead><tr><th>检测样品</th><th>规格型号</th><th>工程部位/用途</th><th>检测参数</th><th>计价数量</th><th>金额(元)</th><th>操作</th></tr></thead>
                <tbody>
                  {newE.samples.map((s: any, i: number) => (
                    <tr key={i}>
                      <td className="num-col">{s.name}</td>
                      <td>{s.spec}</td>
                      <td>{s.usage}</td>
                      <td>{s.paramKeys.map((k: string) => TEMPLATES[k]?.name || k).join(' / ')}</td>
                      <td>{s.qty}</td>
                      <td className="num-col">{fmtMoney(s.price)}</td>
                      <td className="actions">
                        <button className="btn sm danger" onClick={() => setNewE((prev: any) => ({ ...prev, samples: prev.samples.filter((_: any, j: number) => j !== i) }))}>删除</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="info-line">样品合计：{newE.samples.length} 个 · 应收费用 {fmtMoney(sampleTotal)}</div>
            </div>
          ) : (
            <div className="empty" style={{ padding: 26 }}><div className="txt">暂无样品数据，请点击「添加样品」录入</div></div>
          )}
        </div>
      </div>
      <div className="form-section">
        <div className="form-actions">
          <button className="btn primary" onClick={uiSaveEntrust}>保 存</button>
          <button className="btn" onClick={() => { closeTab('newentrust'); toast('已取消新增委托', 'info'); }}>取 消</button>
        </div>
      </div>
    </>
  );
};
