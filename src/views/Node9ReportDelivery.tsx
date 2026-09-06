import React, { useState } from 'react';
import { 
  Truck, 
  Search, 
  RotateCcw, 
  CheckCircle2, 
  ArrowLeft, 
  UserCheck, 
  MapPin, 
  Phone, 
  FileCheck,
  Send,
  Sparkles,
  PackageCheck
} from 'lucide-react';
import { useLims } from '../context/LimsContext';
import { CommissionOrder } from '../types';

export const Node9ReportDelivery: React.FC = () => {
  const { 
    orders, 
    deliverReport, 
    setActiveNode, 
    openWorkflowTimeline,
    canPerformAction,
    currentUserRole 
  } = useLims();

  const [filterQuery, setFilterQuery] = useState('');
  const [deliveryOrder, setDeliveryOrder] = useState<CommissionOrder | null>(null);
  
  // Delivery form state (PRD 14.3)
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [receivedCopies, setReceivedCopies] = useState<number>(1);
  const [deliveryMethod, setDeliveryMethod] = useState<'现场领取' | '快递寄送' | '电子报告推送'>('现场领取');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [remark, setRemark] = useState('');

  const canDeliver = canPerformAction('EDIT', 'report_delivery');

  const deliveryOrders = orders.filter(o => o.report !== undefined);

  const filteredOrders = deliveryOrders.filter(o => {
    if (filterQuery && !o.report?.reportCode.toLowerCase().includes(filterQuery.toLowerCase()) && !o.orderCode.toLowerCase().includes(filterQuery.toLowerCase())) return false;
    return true;
  });

  const handleOpenDelivery = (order: CommissionOrder) => {
    setDeliveryOrder(order);
    setReceiverName(order.contactPerson || '');
    setReceiverPhone(order.contactPhone || '');
    setReceivedCopies(order.report?.printCopies || 1);
    setTrackingNumber('');
    setRemark('');
  };

  const handleConfirmDelivery = () => {
    if (!deliveryOrder) return;
    deliverReport(
      deliveryOrder.id,
      receiverName || '经办人',
      receiverPhone || '13800000000',
      receivedCopies,
      deliveryMethod,
      trackingNumber,
      remark
    );
    setDeliveryOrder(null);
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
            <span className="text-indigo-600 font-medium">节点九：报告领取 (PRD 14.0 终点闭环)</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-indigo-600" />
            检测报告交付领取与业务闭环
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            业务主线终点：核对领报告人身份凭证与收费状态，登记现场交接或邮寄单号，达成【业务完成】归档
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
          业务窗口发件员角色：<span className="font-semibold text-indigo-600 font-mono">{currentUserRole}</span>
        </div>
      </div>

      {/* List Table (PRD 14.2) */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-600 border-b border-slate-100 font-semibold">
                <th className="py-3 px-4">报告编号</th>
                <th className="py-3 px-4">委托单号</th>
                <th className="py-3 px-4">委托单位</th>
                <th className="py-3 px-4">费用状态</th>
                <th className="py-3 px-4">领取方式</th>
                <th className="py-3 px-4">签收人 / 单号</th>
                <th className="py-3 px-4">状态</th>
                <th className="py-3 px-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    暂无待领取报告
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const isWaitingDelivery = order.currentStep === 'report_delivery' || order.report?.status === '待领取';
                  const isDelivered = order.report?.status === '已领取' || order.overallStatus === 'COMPLETED';

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
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          order.feeStatus === '已收费'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}>
                          {order.feeStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {order.deliveryInfo?.deliveryMethod || (isWaitingDelivery ? '待选择' : '现场领取')}
                      </td>
                      <td className="py-3 px-4">
                        {order.deliveryInfo ? (
                          <div>
                            <span className="font-semibold text-slate-900">{order.deliveryInfo.receiverName}</span>
                            {order.deliveryInfo.trackingNumber && (
                              <span className="block font-mono text-[10px] text-indigo-600">{order.deliveryInfo.trackingNumber}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">尚未交付</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isDelivered ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> 业务完成
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            待领取
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {isWaitingDelivery ? (
                          <button
                            id={`btn-deliver-${order.orderCode}`}
                            disabled={!canDeliver}
                            onClick={() => handleOpenDelivery(order)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-40 inline-flex items-center gap-1"
                          >
                            <UserCheck className="w-3 h-3" />
                            办理领取
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenDelivery(order)}
                            className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded-lg text-xs transition-colors"
                          >
                            交接凭单
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

      {/* PRD 14.3 领取登记窗口 (Delivery Registration Modal) */}
      {deliveryOrder && deliveryOrder.report && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div 
            id="modal-delivery-window"
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-100 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">报告交付登记 (PRD 14.3)</h3>
                  <p className="text-xs text-slate-500">
                    报告编号：<span className="font-mono font-bold text-indigo-600">{deliveryOrder.report.reportCode}</span>
                  </p>
                </div>
              </div>
              <button onClick={() => setDeliveryOrder(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">✕</button>
            </div>

            {/* Content Form */}
            <div className="p-6 space-y-4 text-xs">
              
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">委托单位：</span>
                  <span className="font-semibold text-slate-900">{deliveryOrder.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">工程项目：</span>
                  <span className="text-slate-700">{deliveryOrder.projectTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">财务缴费核销：</span>
                  <span className={`font-semibold ${deliveryOrder.feeStatus === '已收费' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {deliveryOrder.feeStatus} (应收: ¥{deliveryOrder.receivableAmount} / 已收: ¥{deliveryOrder.paidAmount})
                  </span>
                </div>
              </div>

              {/* Delivery method selector */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  报告领取交付方式 * (PRD 14.3)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['现场领取', '快递寄送', '电子报告推送'] as const).map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setDeliveryMethod(method)}
                      className={`py-2 px-3 rounded-xl border font-medium text-xs text-center transition-all ${
                        deliveryMethod === method
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-800 font-bold'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Receiver Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">领取人 / 收件人 *</label>
                  <input
                    type="text"
                    required
                    value={receiverName}
                    onChange={e => setReceiverName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">联系电话 *</label>
                  <input
                    type="text"
                    required
                    value={receiverPhone}
                    onChange={e => setReceiverPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">领取正本份数</label>
                  <input
                    type="number"
                    min={1}
                    value={receivedCopies}
                    onChange={e => setReceivedCopies(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                {deliveryMethod === '快递寄送' && (
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">快递单号 (顺丰/EMS) *</label>
                    <input
                      type="text"
                      placeholder="例：SF10928374928"
                      value={trackingNumber}
                      onChange={e => setTrackingNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">交接领证说明 / 备注</label>
                <input
                  type="text"
                  placeholder="如：身份证已核验、委托单回执已回收存查..."
                  value={remark}
                  onChange={e => setRemark(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 flex items-start gap-2 text-emerald-900">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed">
                  点击确认后，该笔业务正式跃迁为<strong>【业务完成】</strong>，完成从委托收样到报告领取的全流程 9 节点闭环！
                </span>
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setDeliveryOrder(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                取消
              </button>

              <button
                id="btn-confirm-delivery-submit"
                type="button"
                disabled={!canDeliver}
                onClick={handleConfirmDelivery}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-40"
              >
                <CheckCircle2 className="w-4 h-4" />
                确认领取并归档 (达成业务完成)
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
