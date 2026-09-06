import React, { useState } from 'react';
import { 
  Printer, 
  Search, 
  RotateCcw, 
  CheckCircle2, 
  ArrowLeft, 
  History, 
  Copy, 
  FileCheck,
  QrCode,
  ShieldAlert
} from 'lucide-react';
import { useLims } from '../context/LimsContext';
import { CommissionOrder } from '../types';

export const Node8ReportPrint: React.FC = () => {
  const { 
    orders, 
    printReport, 
    setActiveNode, 
    openWorkflowTimeline,
    canPerformAction,
    currentUserRole 
  } = useLims();

  const [filterQuery, setFilterQuery] = useState('');
  const [printingOrder, setPrintingOrder] = useState<CommissionOrder | null>(null);
  const [printCopies, setPrintCopies] = useState<number>(3);
  const [printMode, setPrintMode] = useState<'标准双面防伪水印打印' | '普通黑白复核打印' | '批量高速打印'>('标准双面防伪水印打印');

  const canPrint = canPerformAction('EDIT', 'report_print');

  const printOrders = orders.filter(o => o.report !== undefined);

  const filteredOrders = printOrders.filter(o => {
    if (filterQuery && !o.report?.reportCode.toLowerCase().includes(filterQuery.toLowerCase()) && !o.orderCode.toLowerCase().includes(filterQuery.toLowerCase())) return false;
    return true;
  });

  const handleOpenPrint = (order: CommissionOrder) => {
    setPrintingOrder(order);
    setPrintCopies(order.report?.printCopies || 3);
  };

  const handleConfirmPrint = () => {
    if (!printingOrder) return;
    printReport(printingOrder.id, printCopies);
    setPrintingOrder(null);
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
            <span className="text-indigo-600 font-medium">节点八：报告打印 (PRD 13.0)</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Printer className="w-5 h-5 text-indigo-600" />
            批准报告正本打印与防伪赋码
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            文印中心：加载实验室官方防伪底纹防伪码，打印指定份数并登记打印审计日志，流转至领取环节
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

      {/* Query Bar */}
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
          已授权打印权限角色：<span className="font-semibold text-indigo-600 font-mono">{currentUserRole}</span>
        </div>
      </div>

      {/* List Table */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-600 border-b border-slate-100 font-semibold">
                <th className="py-3 px-4">报告编号</th>
                <th className="py-3 px-4">委托单号</th>
                <th className="py-3 px-4">委托单位</th>
                <th className="py-3 px-4">工程项目</th>
                <th className="py-3 px-4">批准人</th>
                <th className="py-3 px-4 text-center">打印份数</th>
                <th className="py-3 px-4 text-center">累计打印</th>
                <th className="py-3 px-4">状态</th>
                <th className="py-3 px-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    暂无待打印报告
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const isWaitingPrint = order.currentStep === 'report_print' || order.report?.status === '待打印';

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
                        {order.report?.approver || '周总工'}
                      </td>
                      <td className="py-3 px-4 text-center font-bold">
                        {order.report?.printCopies || 3} 份
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                          (order.report?.printCount || 0) > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {order.report?.printCount || 0} 次
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          isWaitingPrint
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {order.report?.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {isWaitingPrint ? (
                          <button
                            id={`btn-print-${order.orderCode}`}
                            disabled={!canPrint}
                            onClick={() => handleOpenPrint(order)}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs shadow-indigo-100 transition-colors disabled:opacity-40 inline-flex items-center gap-1"
                          >
                            <Printer className="w-3 h-3" />
                            打印
                          </button>
                        ) : (
                          <button
                            disabled={!canPrint}
                            onClick={() => handleOpenPrint(order)}
                            className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded-lg text-xs transition-colors"
                          >
                            补打
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

      {/* PRD 13.3 打印设置窗口 (Print Modal) */}
      {printingOrder && printingOrder.report && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div 
            id="modal-print-window"
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-100 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">打印确认窗口 (PRD 13.3)</h3>
                  <p className="text-xs text-slate-500">
                    报告编号：<span className="font-mono font-bold text-indigo-600">{printingOrder.report.reportCode}</span>
                  </p>
                </div>
              </div>
              <button onClick={() => setPrintingOrder(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">✕</button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">委托单位：</span>
                  <span className="font-semibold text-slate-800">{printingOrder.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">批准签发人：</span>
                  <span className="font-semibold text-slate-800">{printingOrder.report.approver || '周总工'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">历史已打印次数：</span>
                  <span className="font-mono font-bold text-indigo-600">{printingOrder.report.printCount} 次</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  打印份数 (按资质认定规定正本+副本) *
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={printCopies}
                    onChange={e => setPrintCopies(Number(e.target.value))}
                    className="w-24 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono font-bold text-center"
                  />
                  <span className="text-slate-500">份 (默认3份：客户1份、留档1份、备查1份)</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  打印输出模式
                </label>
                <select
                  value={printMode}
                  onChange={e => setPrintMode(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                >
                  <option value="标准双面防伪水印打印">标准彩色防伪水印证书纸双面打印</option>
                  <option value="普通黑白复核打印">普通 A4 黑白复印纸 (仅限内部复核)</option>
                  <option value="批量高速打印">高速双向激光批量队列</option>
                </select>
              </div>

              <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100 flex items-center gap-2 text-indigo-900">
                <QrCode className="w-5 h-5 text-indigo-600 shrink-0" />
                <span className="text-[11px]">
                  系统将自动生成国家检验检测资质认可二维码，加盖电子防伪水印并锁定文书打印流水号。
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPrintingOrder(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                取消
              </button>

              <button
                id="btn-confirm-print-submit"
                type="button"
                disabled={!canPrint}
                onClick={handleConfirmPrint}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs shadow-indigo-100 transition-colors flex items-center gap-1.5 disabled:opacity-40"
              >
                <Printer className="w-4 h-4" />
                确认打印完成 (流转至报告领取)
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
