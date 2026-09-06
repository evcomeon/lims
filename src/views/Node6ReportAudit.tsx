import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  RotateCcw, 
  CheckCircle2, 
  ArrowLeft, 
  Eye, 
  CornerDownLeft, 
  FileText, 
  Building, 
  Award,
  Stamp
} from 'lucide-react';
import { useLims } from '../context/LimsContext';
import { CommissionOrder } from '../types';

export const Node6ReportAudit: React.FC = () => {
  const { 
    orders, 
    auditReport, 
    openRejectModal, 
    setActiveNode, 
    openWorkflowTimeline,
    canPerformAction,
    currentUserRole 
  } = useLims();

  const [filterQuery, setFilterQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<CommissionOrder | null>(null);
  const [auditComment, setAuditComment] = useState('经审核，检测报告编制规范，试验数据真实有效，符合资质认定要求，同意呈报授权签字人批准。');

  const canAudit = canPerformAction('AUDIT', 'report_audit');

  // Orders with reports generated
  const reportOrders = orders.filter(o => o.report !== undefined);

  const filteredOrders = reportOrders.filter(o => {
    if (filterQuery && !o.report?.reportCode.toLowerCase().includes(filterQuery.toLowerCase()) && !o.orderCode.toLowerCase().includes(filterQuery.toLowerCase())) return false;
    return true;
  });

  const handleOpenAudit = (order: CommissionOrder) => {
    setSelectedOrder(order);
  };

  const handlePass = () => {
    if (!selectedOrder) return;
    auditReport(selectedOrder.id, auditComment);
    setSelectedOrder(null);
  };

  const handleReject = () => {
    if (!selectedOrder) return;
    openRejectModal(selectedOrder.id, 'report_audit', `报告审核退回：${selectedOrder.report?.reportCode}`);
  };

  return (
    <div className="space-y-6">
      
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <button onClick={() => setActiveNode(null)} className="hover:text-indigo-600 transition-colors">
              工作台首页
            </button>
            <span>/</span>
            <span className="text-indigo-600 font-medium">节点六：报告审核 (PRD 11.0)</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            检验检测报告审核与文书查验
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            第二道质量把关：审核室主任逐项核对委托信息、标准规范版次、数据结论完整性与图表合规性
          </p>
        </div>

        <button
          onClick={() => setActiveNode(null)}
          className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 shadow-2xs self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          返回看板
        </button>
      </div>

      {/* Report Preview & Audit Screen */}
      {selectedOrder && selectedOrder.report ? (
        <div id="view-report-audit-preview" className="space-y-5 animate-in fade-in duration-150">
          
          {/* Top Actions Bar */}
          <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">报告审核与电子凭证核对 (PRD 11.3)</span>
                  <span className="text-xs font-mono font-bold bg-indigo-600 px-2.5 py-0.5 rounded text-white shadow-xs">
                    {selectedOrder.report.reportCode}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  委托单位：{selectedOrder.clientName} · 报告状态：{selectedOrder.report.status}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-audit-reject"
                type="button"
                disabled={!canAudit}
                onClick={handleReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-40"
              >
                <CornerDownLeft className="w-3.5 h-3.5" />
                退回修改 (PRD 18)
              </button>
              <button
                id="btn-audit-pass"
                type="button"
                disabled={!canAudit}
                onClick={handlePass}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-40"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                审核通过 (流转至报告批准)
              </button>
            </div>
          </div>

          {/* Dual Panel: Standard LIMS Test Report Document + Audit Form */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left 8 Cols: Full Formal Test Report Document Preview */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs text-slate-800 space-y-6 font-sans">
              
              {/* Report Header & CMA/CNAS Logo */}
              <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
                <div>
                  <div className="text-[10px] tracking-widest text-slate-500 font-mono">国家检验检测资质认定检验机构</div>
                  <h1 className="text-2xl font-black tracking-wider text-slate-950 mt-1">检 验 检 测 报 告</h1>
                  <p className="text-xs font-mono text-indigo-700 font-bold mt-1">
                    TESTING & INSPECTION REPORT
                  </p>
                </div>
                <div className="text-right">
                  <div className="inline-block border-2 border-indigo-900 px-3 py-1 text-center rounded">
                    <div className="text-xs font-black text-indigo-900 tracking-wider">CMA 认证标志</div>
                    <div className="text-[9px] font-mono text-slate-500">202310123891</div>
                  </div>
                  <div className="mt-2 text-xs font-mono font-bold text-slate-900">
                    报告编号：{selectedOrder.report.reportCode}
                  </div>
                </div>
              </div>

              {/* Commission & Specimen Table */}
              <div className="border border-slate-200 text-xs rounded-xl overflow-hidden">
                <div className="grid grid-cols-4 border-b border-slate-200">
                  <div className="p-2.5 bg-slate-50 font-bold text-slate-600 border-r border-slate-200">委托单位</div>
                  <div className="p-2.5 col-span-3 font-semibold text-slate-900">{selectedOrder.clientName}</div>
                </div>
                <div className="grid grid-cols-4 border-b border-slate-200">
                  <div className="p-2.5 bg-slate-50 font-bold text-slate-600 border-r border-slate-200">工程项目</div>
                  <div className="p-2.5 col-span-3 text-slate-700">{selectedOrder.projectTitle}</div>
                </div>
                <div className="grid grid-cols-4 border-b border-slate-200">
                  <div className="p-2.5 bg-slate-50 font-bold text-slate-600 border-r border-slate-200">样品名称</div>
                  <div className="p-2.5 border-r border-slate-200 font-semibold">{selectedOrder.samples[0]?.sampleName}</div>
                  <div className="p-2.5 bg-slate-50 font-bold text-slate-600 border-r border-slate-200">样品编号</div>
                  <div className="p-2.5 font-mono font-bold text-indigo-600">{selectedOrder.samples[0]?.sampleCode}</div>
                </div>
                <div className="grid grid-cols-4 border-b border-slate-200">
                  <div className="p-2.5 bg-slate-50 font-bold text-slate-600 border-r border-slate-200">规格型号</div>
                  <div className="p-2.5 border-r border-slate-200 text-slate-700">{selectedOrder.samples[0]?.specModel}</div>
                  <div className="p-2.5 bg-slate-50 font-bold text-slate-600 border-r border-slate-200">检验类别</div>
                  <div className="p-2.5 text-slate-700">{selectedOrder.testType}</div>
                </div>
                <div className="grid grid-cols-4">
                  <div className="p-2.5 bg-slate-50 font-bold text-slate-600 border-r border-slate-200">检测依据标准</div>
                  <div className="p-2.5 col-span-3 font-medium text-slate-800">{selectedOrder.testProjects[0]?.testStandard}</div>
                </div>
              </div>

              {/* Testing Data Table */}
              <div className="space-y-2">
                <div className="font-bold text-xs text-slate-900">检验检测数据与技术评价指标</div>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                      <tr>
                        <th className="p-2.5">序号</th>
                        <th className="p-2.5">检测项目</th>
                        <th className="p-2.5">技术标准要求</th>
                        <th className="p-2.5">实测代表值</th>
                        <th className="p-2.5 text-center">单项结论</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <td className="p-2.5 font-mono text-slate-500">1</td>
                        <td className="p-2.5 font-semibold text-slate-900">{selectedOrder.testProjects[0]?.projectName}</td>
                        <td className="p-2.5 text-slate-600">设计等级 ≥ 30.0 MPa (C30)</td>
                        <td className="p-2.5 font-mono font-bold text-indigo-900 text-sm">
                          {selectedOrder.tasks[0]?.testData?.representativeValue || '38.7'} MPa
                        </td>
                        <td className="p-2.5 text-center font-bold text-emerald-700">合格</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Conclusion Box */}
              <div className="p-4 bg-indigo-50/40 border border-indigo-200 rounded-xl space-y-1">
                <div className="font-bold text-xs text-indigo-950">检验检测综合结论：</div>
                <p className="text-xs text-indigo-900 leading-relaxed">
                  经对该批送检试样进行混凝土立方体抗压强度测试，实测代表值达到设计强度等级 C30 评定要求，依照 {selectedOrder.testProjects[0]?.testStandard} 判定：<strong>结论合格</strong>。
                </p>
              </div>

              {/* Signatures & Stamp Area */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">编制人：</span>
                  <span className="font-semibold text-slate-800">{selectedOrder.report.drafter}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">审核人 (当前节点)：</span>
                  <span className="font-semibold text-indigo-600 underline">
                    {selectedOrder.report.auditor || '待审核签字'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">授权签字人 (批准)：</span>
                  <span className="text-slate-400 italic">待批准签发</span>
                </div>
              </div>

            </div>

            {/* Right 4 Cols: Audit Controls */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4 text-xs">
                <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                  审核人核查意见
                </h3>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">审核意见批注 *</label>
                  <textarea
                    rows={4}
                    value={auditComment}
                    onChange={e => setAuditComment(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-[11px] text-slate-500">
                  <div className="font-semibold text-slate-700">审核核查清单：</div>
                  <div>✓ 委托信息与工程现场台账一致</div>
                  <div>✓ 执行检测标准为最新现行有效版</div>
                  <div>✓ 仪器设备在计量检定周期内</div>
                  <div>✓ 计算过程及修约无误</div>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    disabled={!canAudit}
                    onClick={handlePass}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    审核通过 (流转至报告批准)
                  </button>

                  <button
                    disabled={!canAudit}
                    onClick={handleReject}
                    className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-xl border border-rose-200 transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
                  >
                    <CornerDownLeft className="w-3.5 h-3.5" />
                    退回修改 (填写退回原因)
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* Report List View */
        <div className="space-y-4">
          
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between text-xs">
            <div className="relative w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="搜索报告编号 / 委托单号..."
                value={filterQuery}
                onChange={e => setFilterQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div className="text-slate-500">
              当前角色：<span className="font-semibold text-indigo-600 font-mono">{currentUserRole}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-600 border-b border-slate-100 font-semibold">
                    <th className="py-3 px-4">报告编号</th>
                    <th className="py-3 px-4">委托单号</th>
                    <th className="py-3 px-4">委托单位</th>
                    <th className="py-3 px-4">工程项目</th>
                    <th className="py-3 px-4">编制人</th>
                    <th className="py-3 px-4">报告状态</th>
                    <th className="py-3 px-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        暂无待审核报告
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map(order => {
                      const isWaitingAudit = order.report?.status === '待审核';

                      return (
                        <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                            {order.report?.reportCode}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">
                            {order.orderCode}
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-900">
                            {order.clientName}
                          </td>
                          <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                            {order.projectTitle}
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            {order.report?.drafter}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              isWaitingAudit
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            }`}>
                              {order.report?.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            {isWaitingAudit ? (
                              <button
                                id={`btn-audit-${order.orderCode}`}
                                disabled={!canAudit}
                                onClick={() => handleOpenAudit(order)}
                                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs shadow-indigo-100 transition-colors disabled:opacity-40"
                              >
                                审核
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenAudit(order)}
                                className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded-lg text-xs transition-colors"
                              >
                                查看报告
                              </button>
                            )}
                            <button
                              onClick={() => openWorkflowTimeline(order.orderCode)}
                              className="text-slate-500 hover:text-indigo-600 text-xs"
                            >
                              查看流程
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
