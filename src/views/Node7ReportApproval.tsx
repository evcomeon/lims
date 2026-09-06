import React, { useState } from 'react';
import { 
  Award, 
  Search, 
  RotateCcw, 
  CheckCircle2, 
  ArrowLeft, 
  CornerDownLeft, 
  ShieldCheck,
  Stamp,
  Sliders,
  AlertTriangle
} from 'lucide-react';
import { useLims } from '../context/LimsContext';
import { CommissionOrder } from '../types';

export const Node7ReportApproval: React.FC = () => {
  const { 
    orders, 
    approveReport, 
    openRejectModal, 
    setActiveNode, 
    openWorkflowTimeline,
    canPerformAction,
    currentUserRole,
    prdIssues 
  } = useLims();

  const [filterQuery, setFilterQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<CommissionOrder | null>(null);
  const [approvalComment, setApprovalComment] = useState('经技术负责人授权签字复验，检测全过程受控，报告数据合法有效，准予正式签发。');

  const canApprove = canPerformAction('APPROVE', 'report_approval');

  // Orders with report
  const reportOrders = orders.filter(o => o.report !== undefined);

  const filteredOrders = reportOrders.filter(o => {
    if (filterQuery && !o.report?.reportCode.toLowerCase().includes(filterQuery.toLowerCase()) && !o.orderCode.toLowerCase().includes(filterQuery.toLowerCase())) return false;
    return true;
  });

  const handleOpenApprove = (order: CommissionOrder) => {
    setSelectedOrder(order);
  };

  const handlePass = () => {
    if (!selectedOrder) return;
    approveReport(selectedOrder.id, approvalComment);
    setSelectedOrder(null);
  };

  const handleReject = () => {
    if (!selectedOrder) return;
    openRejectModal(selectedOrder.id, 'report_approval', `批准退回：${selectedOrder.report?.reportCode}`);
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
            <span className="text-indigo-600 font-medium">节点七：报告批准 (PRD 12.0)</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            授权签字人报告终审与批准签发
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            终审法律责任把关：授权签字人对报告具有最终批准签发权，加盖 CMA 检验检测专用章与 CA 电子印章
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

      {/* Approve Screen (PRD 12.3) */}
      {selectedOrder && selectedOrder.report ? (
        <div id="view-report-approval-screen" className="space-y-5 animate-in fade-in duration-150">
          
          {/* Top Actions */}
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
                  <span className="font-bold text-sm">授权签字人签发决策工作区</span>
                  <span className="text-xs font-mono font-bold bg-indigo-600 px-2.5 py-0.5 rounded text-white shadow-xs">
                    {selectedOrder.report.reportCode}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  委托单位：{selectedOrder.clientName} · 审核人已签字：{selectedOrder.report.auditor || '赵六'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-approve-reject"
                type="button"
                disabled={!canApprove}
                onClick={handleReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-40"
              >
                <CornerDownLeft className="w-3.5 h-3.5" />
                退回驳回 (PRD 18)
              </button>
              <button
                id="btn-approve-pass"
                type="button"
                disabled={!canApprove}
                onClick={handlePass}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-40"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                正式批准签发 (流转至报告打印)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left 8 cols: Document summary & sign zones */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 text-slate-800 text-xs">
              
              <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
                <div>
                  <h1 className="text-xl font-black tracking-wider text-slate-950">检 验 检 测 报 告 (审批稿)</h1>
                  <p className="text-[11px] font-mono text-slate-500 mt-0.5">报告编号：{selectedOrder.report.reportCode}</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold text-xs">
                    {selectedOrder.report.status}
                  </span>
                </div>
              </div>

              {/* Core metadata grid */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div><span className="text-slate-400">委托单位：</span><span className="font-semibold">{selectedOrder.clientName}</span></div>
                <div><span className="text-slate-400">工程名称：</span><span>{selectedOrder.projectTitle}</span></div>
                <div><span className="text-slate-400">检测项目：</span><span className="font-semibold text-indigo-800">{selectedOrder.testProjects[0]?.projectName}</span></div>
                <div><span className="text-slate-400">实测结果：</span><span className="font-bold text-emerald-700">{selectedOrder.tasks[0]?.testData?.representativeValue || '38.7'} MPa (合格)</span></div>
                <div><span className="text-slate-400">编制人：</span><span>{selectedOrder.report.drafter}</span></div>
                <div><span className="text-slate-400">审核人：</span><span className="font-semibold text-slate-800">{selectedOrder.report.auditor || '赵六 (审核已通过)'}</span></div>
              </div>

              {/* Stamp & Authorized Signatory Area */}
              <div className="border border-dashed border-indigo-200 bg-indigo-50/20 p-6 rounded-2xl relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-indigo-900 block">法定授权签字人签署席位</span>
                    <span className="text-sm font-extrabold text-slate-900 font-mono">周总工 (高级工程师 / 资质认定授权签字人)</span>
                    <p className="text-[11px] text-slate-500">签署授权编号：AUTH-SIGN-2024-0038 · 认可专业范围：建材与工程结构检测</p>
                  </div>

                  {/* Stamp Graphic */}
                  <div className="w-28 h-28 rounded-full border-4 border-rose-600/70 border-dashed flex flex-col items-center justify-center text-rose-600 font-bold rotate-12 shadow-xs bg-white/80">
                    <span className="text-[8px] tracking-wider">检验检测机构专用章</span>
                    <span className="text-xs font-black my-0.5">★★★★★</span>
                    <span className="text-[9px]">已核准签发</span>
                  </div>
                </div>
              </div>

              {/* PRD Rule Notice */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>PRD 待确认规范：</strong>报告经授权签字人批准签发后，具备正式法律效力，<strong>系统禁止任何形式的在线直接修改</strong>。如确有差错需走“报告作废并出具补充/换发报告”规范程序。
                </div>
              </div>

            </div>

            {/* Right 4 cols: Approval Action Box */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4 text-xs">
                <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                  授权签字人批准意见
                </h3>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">批准意见批注 *</label>
                  <textarea
                    rows={4}
                    value={approvalComment}
                    onChange={e => setApprovalComment(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    disabled={!canApprove}
                    onClick={handlePass}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    准予正式批准 (流转至报告打印)
                  </button>

                  <button
                    disabled={!canApprove}
                    onClick={handleReject}
                    className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-xl border border-rose-200 transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
                  >
                    <CornerDownLeft className="w-3.5 h-3.5" />
                    退回修改 (PRD 18)
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* Report Approval List View */
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
                    <th className="py-3 px-4">审核人</th>
                    <th className="py-3 px-4">报告状态</th>
                    <th className="py-3 px-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        暂无待批准报告
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map(order => {
                      const isWaitingApprove = order.report?.status === '待批准';

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
                          <td className="py-3 px-4 text-slate-700">
                            {order.report?.auditor || '赵六'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              isWaitingApprove
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            }`}>
                              {order.report?.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            {isWaitingApprove ? (
                              <button
                                id={`btn-approve-${order.orderCode}`}
                                disabled={!canApprove}
                                onClick={() => handleOpenApprove(order)}
                                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs shadow-indigo-100 transition-colors disabled:opacity-40"
                              >
                                批准
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenApprove(order)}
                                className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded-lg text-xs transition-colors"
                              >
                                查看详情
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
