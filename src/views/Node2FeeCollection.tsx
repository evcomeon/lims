import React, { useState } from 'react';
import { 
  Receipt, 
  Search, 
  RotateCcw, 
  CheckCircle2, 
  Printer, 
  ArrowLeft, 
  CreditCard, 
  AlertCircle, 
  Building,
  Sliders,
  DollarSign
} from 'lucide-react';
import { useLims } from '../context/LimsContext';
import { CommissionOrder } from '../types';

export const Node2FeeCollection: React.FC = () => {
  const { 
    orders, 
    collectFee, 
    setActiveNode, 
    openWorkflowTimeline,
    prdIssues,
    canPerformAction
  } = useLims();

  const [orderCodeFilter, setOrderCodeFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [feeStatusFilter, setFeeStatusFilter] = useState('ALL');
  
  // Modals
  const [payingOrder, setPayingOrder] = useState<CommissionOrder | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('公对公银行转账');
  const [invoiceTitle, setInvoiceTitle] = useState('');
  
  // Printable receipt modal
  const [receiptOrder, setReceiptOrder] = useState<CommissionOrder | null>(null);

  const canCollect = canPerformAction('EDIT', 'fee_collection');

  const filteredOrders = orders.filter(o => {
    if (orderCodeFilter && !o.orderCode.toLowerCase().includes(orderCodeFilter.toLowerCase())) return false;
    if (clientFilter && !o.clientName.toLowerCase().includes(clientFilter.toLowerCase())) return false;
    if (feeStatusFilter !== 'ALL' && o.feeStatus !== feeStatusFilter) return false;
    return true;
  });

  const handleOpenPayment = (order: CommissionOrder) => {
    setPayingOrder(order);
    setPaymentAmount(order.unpaidAmount > 0 ? order.unpaidAmount : order.receivableAmount);
    setInvoiceTitle(order.invoiceTitle || order.clientName);
  };

  const handleConfirmPayment = () => {
    if (!payingOrder) return;
    collectFee(payingOrder.id, paymentAmount, paymentMethod, invoiceTitle);
    setPayingOrder(null);
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
            <span className="text-indigo-600 font-medium">节点二：检测收费 (PRD 5.0)</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-600" />
            检测收费核销与开据
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            财务结算节点：依据检测项目清单核定应收，办理现金/转账到账核销，打印收费凭据
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* PRD Open Question Alert Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs">
            <Sliders className="w-3.5 h-3.5 text-amber-600" />
            <span>甲方待确认：未收费是否允许直接进入任务分配？</span>
            <span className="font-bold underline">
              {prdIssues.allowAssignBeforePaid ? '已设为允许' : '严格禁止'}
            </span>
          </div>

          <button
            onClick={() => setActiveNode(null)}
            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            返回看板
          </button>
        </div>
      </div>

      {/* Query Bar (PRD 5.2) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-500 font-medium mb-1">委托编号</label>
            <input
              type="text"
              placeholder="例：WT002"
              value={orderCodeFilter}
              onChange={e => setOrderCodeFilter(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-medium mb-1">委托单位</label>
            <input
              type="text"
              placeholder="搜索单位名称..."
              value={clientFilter}
              onChange={e => setClientFilter(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-medium mb-1">收费状态</label>
            <select
              value={feeStatusFilter}
              onChange={e => setFeeStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
            >
              <option value="ALL">全部收费状态</option>
              <option value="待收费">待收费</option>
              <option value="部分收费">部分收费</option>
              <option value="已收费">已收费</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={() => {}}
              className="flex-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-1 shadow-xs shadow-indigo-100"
            >
              <Search className="w-3.5 h-3.5" />
              查询
            </button>
            <button
              onClick={() => {
                setOrderCodeFilter('');
                setClientFilter('');
                setFeeStatusFilter('ALL');
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* List Table (PRD 5.2) */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-600 border-b border-slate-100 font-semibold">
                <th className="py-3 px-4">委托编号</th>
                <th className="py-3 px-4">委托单位</th>
                <th className="py-3 px-4">工程项目</th>
                <th className="py-3 px-4 text-right">应收金额</th>
                <th className="py-3 px-4 text-right">已收金额</th>
                <th className="py-3 px-4 text-right">未收金额</th>
                <th className="py-3 px-4 text-center">收费状态</th>
                <th className="py-3 px-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    暂无待收费项目
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const isUnpaid = order.unpaidAmount > 0;

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                        {order.orderCode}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {order.clientName}
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                        {order.projectTitle}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                        ¥{order.receivableAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                        ¥{order.paidAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                        ¥{order.unpaidAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          order.feeStatus === '已收费'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : order.feeStatus === '部分收费'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {order.feeStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {isUnpaid && (
                          <button
                            id={`btn-pay-${order.orderCode}`}
                            disabled={!canCollect}
                            onClick={() => handleOpenPayment(order)}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs shadow-indigo-100 transition-colors disabled:opacity-40"
                          >
                            收费核销
                          </button>
                        )}
                        <button
                          onClick={() => setReceiptOrder(order)}
                          className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded-lg text-xs transition-colors inline-flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3" />
                          凭证
                        </button>
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

      {/* PRD 5.3 收费办理弹窗 */}
      {payingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div 
            id="modal-fee-payment"
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6"
          >
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">检测收费结算办理</h3>
                  <p className="text-xs text-slate-500">
                    委托编号：<span className="font-mono font-bold text-indigo-700">{payingOrder.orderCode}</span> · {payingOrder.clientName}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setPayingOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 text-xs max-h-[70vh] overflow-y-auto">
              
              {/* 检测项目收费明细表 */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1 flex items-center justify-between">
                  <span>检测项目明细表 (PRD 5.3)</span>
                  <span className="text-slate-400 font-normal">标准政府指导与实验室协议价</span>
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <th className="py-2 px-3">项目</th>
                        <th className="py-2 px-3 text-center">数量</th>
                        <th className="py-2 px-3 text-right">单价</th>
                        <th className="py-2 px-3 text-right">金额</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {payingOrder.testProjects.map(tp => (
                        <tr key={tp.id}>
                          <td className="py-2.5 px-3 font-medium text-slate-800">{tp.projectName}</td>
                          <td className="py-2.5 px-3 text-center font-bold">{tp.quantity}</td>
                          <td className="py-2.5 px-3 text-right text-slate-600">¥{tp.unitPrice}</td>
                          <td className="py-2.5 px-3 text-right font-semibold text-indigo-700">¥{tp.totalAmount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 金额核算卡片 */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block mb-1">应收金额</span>
                  <span className="text-base font-extrabold font-mono text-slate-900">
                    ¥{payingOrder.receivableAmount.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">前期已收</span>
                  <span className="text-base font-extrabold font-mono text-emerald-600">
                    ¥{payingOrder.paidAmount.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">本次未收</span>
                  <span className="text-base font-extrabold font-mono text-rose-600">
                    ¥{payingOrder.unpaidAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* 收款表单录入 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    本次实收金额 (元) *
                  </label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={e => setPaymentAmount(Number(e.target.value))}
                    max={payingOrder.unpaidAmount || payingOrder.receivableAmount}
                    min={1}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    支付结算方式 *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  >
                    <option value="公对公银行转账">公对公银行转账 (电汇)</option>
                    <option value="微信支付商户直付">微信企业商户付款码</option>
                    <option value="支付宝对公转账">支付宝企业扫码</option>
                    <option value="现金现讫">财务前台现钞收取</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">
                    发票抬头及税号
                  </label>
                  <input
                    type="text"
                    value={invoiceTitle}
                    onChange={e => setInvoiceTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPayingOrder(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                取消
              </button>

              <button
                id="btn-confirm-payment-submit"
                type="button"
                onClick={handleConfirmPayment}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md shadow-indigo-100 transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                确认收款并流转 (检测收费 → 任务分配)
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 打印收费凭证预览弹窗 */}
      {receiptOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div 
            id="modal-fee-receipt-preview"
            className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-6"
          >
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Printer className="w-4 h-4 text-indigo-600" />
                收费凭证预览 (PRD 5.4 规范功能)
              </h3>
              <button onClick={() => setReceiptOrder(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="p-8 text-slate-800 space-y-6 text-xs bg-slate-50/50 border-b border-slate-100 font-sans">
              <div className="text-center space-y-1">
                <h2 className="text-lg font-bold tracking-wider text-slate-900">检验检测业务收费专用凭单</h2>
                <p className="text-[11px] text-slate-400 font-mono">凭证编号：CW-REC-{receiptOrder.orderCode}-01</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs border-y border-dashed border-slate-300 py-3">
                <div><span className="text-slate-400">委托单号：</span><span className="font-mono font-bold text-indigo-600">{receiptOrder.orderCode}</span></div>
                <div><span className="text-slate-400">交款日期：</span><span>{receiptOrder.orderDate}</span></div>
                <div className="col-span-2"><span className="text-slate-400">缴款单位：</span><span className="font-semibold">{receiptOrder.clientName}</span></div>
                <div className="col-span-2"><span className="text-slate-400">工程项目：</span><span>{receiptOrder.projectTitle}</span></div>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr><th className="p-2 text-left">检测项目</th><th className="p-2 text-center">数量</th><th className="p-2 text-right">金额</th></tr>
                  </thead>
                  <tbody>
                    {receiptOrder.testProjects.map(tp => (
                      <tr key={tp.id} className="border-b border-slate-100">
                        <td className="p-2">{tp.projectName}</td>
                        <td className="p-2 text-center">{tp.quantity}</td>
                        <td className="p-2 text-right font-mono">¥{tp.totalAmount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between text-xs bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                <span className="font-medium text-slate-700">实收总计 (人民币大写)：</span>
                <span className="font-bold text-sm text-indigo-900 font-mono">¥{receiptOrder.paidAmount.toLocaleString()} 元整</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-500 pt-4 border-t border-slate-200">
                <div>财务经手人：李梅 (签章)</div>
                <div>结算方式：{receiptOrder.paymentMethod || '公对公银行转账'}</div>
                <div className="text-right">加盖财务专用章</div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 flex items-center justify-end gap-2">
              <button
                onClick={() => setReceiptOrder(null)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                关闭
              </button>
              <button
                onClick={() => {
                  alert('已调起打印机驱动输出收费凭证！');
                  setReceiptOrder(null);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-xs shadow-md shadow-indigo-100 transition-colors"
              >
                确认打印凭单
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
