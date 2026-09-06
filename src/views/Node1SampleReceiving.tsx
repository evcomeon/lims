import React, { useState } from 'react';
import { 
  PackageCheck, 
  Search, 
  RotateCcw, 
  FileText, 
  Check, 
  ArrowLeft, 
  QrCode, 
  Eye, 
  Clock, 
  ShieldCheck,
  Plus
} from 'lucide-react';
import { useLims } from '../context/LimsContext';
import { CommissionOrder } from '../types';

export const Node1SampleReceiving: React.FC<{ onOpenNewOrderModal: () => void }> = ({ onOpenNewOrderModal }) => {
  const { 
    orders, 
    confirmSampleReceive, 
    setActiveNode, 
    openWorkflowTimeline,
    canPerformAction 
  } = useLims();

  const [orderCodeFilter, setOrderCodeFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusTab, setStatusTab] = useState<'ALL' | 'WAITING' | 'RECEIVED'>('ALL');
  
  // Selected order for detail view / receiving
  const [selectedOrder, setSelectedOrder] = useState<CommissionOrder | null>(null);
  const [receiveRemark, setReceiveRemark] = useState('');
  const [isReceivingModalOpen, setIsReceivingModalOpen] = useState(false);

  // Filter orders related to receiving (or all orders for viewing)
  const filteredOrders = orders.filter(o => {
    if (orderCodeFilter && !o.orderCode.toLowerCase().includes(orderCodeFilter.toLowerCase())) return false;
    if (clientFilter && !o.clientName.toLowerCase().includes(clientFilter.toLowerCase())) return false;
    if (dateFilter && !o.orderDate.includes(dateFilter)) return false;
    
    const isWaiting = o.currentStep === 'sample_receiving' || o.samples.some(s => s.status === '待收样');
    if (statusTab === 'WAITING' && !isWaiting) return false;
    if (statusTab === 'RECEIVED' && isWaiting) return false;

    return true;
  });

  const canEdit = canPerformAction('EDIT', 'sample_receiving');

  const handleOpenReceive = (order: CommissionOrder) => {
    setSelectedOrder(order);
    setReceiveRemark('');
    setIsReceivingModalOpen(true);
  };

  const handleConfirmReceive = () => {
    if (!selectedOrder) return;
    confirmSampleReceive(selectedOrder.id, receiveRemark);
    setIsReceivingModalOpen(false);
    setSelectedOrder(null);
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
            <span className="text-indigo-600 font-medium">节点一：委托收样 (PRD 4.0)</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-indigo-600" />
            委托收样登记与核验
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            业务主线入口：核验客户送检委托凭据、核实样品外观与数量、生成赋码并流转至收费节点
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNewOrderModal}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-100 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            新建客户委托单
          </button>
          <button
            onClick={() => setActiveNode(null)}
            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            返回看板
          </button>
        </div>
      </div>

      {/* Query Bar (PRD 4.2) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-500 font-medium mb-1">委托编号</label>
            <input
              type="text"
              placeholder="例：WT001"
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
            <label className="block text-slate-500 font-medium mb-1">委托日期</label>
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
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
                setDateFilter('');
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <button
            onClick={() => setStatusTab('ALL')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${statusTab === 'ALL' ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            全部委托 ({orders.length})
          </button>
          <button
            onClick={() => setStatusTab('WAITING')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${statusTab === 'WAITING' ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            待收样委托 ({orders.filter(o => o.currentStep === 'sample_receiving').length})
          </button>
          <button
            onClick={() => setStatusTab('RECEIVED')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${statusTab === 'RECEIVED' ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            已收样入库
          </button>
        </div>
      </div>

      {/* List Table (PRD 4.2) */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-600 border-b border-slate-100 font-semibold">
                <th className="py-3 px-4 w-10 text-center">
                  <input type="checkbox" className="rounded text-indigo-600" />
                </th>
                <th className="py-3 px-4">委托编号</th>
                <th className="py-3 px-4">委托单位</th>
                <th className="py-3 px-4">工程项目</th>
                <th className="py-3 px-4">委托日期</th>
                <th className="py-3 px-4">样品名称及规格</th>
                <th className="py-3 px-4 text-center">样品数量</th>
                <th className="py-3 px-4">收样状态</th>
                <th className="py-3 px-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    未查找到符合条件的委托单
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const isPendingReceive = order.currentStep === 'sample_receiving';
                  const totalSampleQty = order.samples.reduce((sum, s) => sum + s.quantity, 0);

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-center">
                        <input type="checkbox" className="rounded text-indigo-600" />
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                        {order.orderCode}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {order.clientName}
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                        {order.projectTitle}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {order.orderDate}
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          {order.samples.map(s => (
                            <div key={s.id} className="flex items-center gap-1.5 text-slate-700">
                              <span className="font-mono text-[10px] bg-slate-100 px-1 py-0.2 rounded text-slate-600">{s.sampleCode}</span>
                              <span>{s.sampleName}</span>
                              <span className="text-[10px] text-slate-400">({s.specModel})</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-800">
                        {totalSampleQty} 组/件
                      </td>
                      <td className="py-3 px-4">
                        {isPendingReceive ? (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            待收样
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            已收样入库
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {isPendingReceive ? (
                          <button
                            id={`btn-receive-${order.orderCode}`}
                            disabled={!canEdit}
                            onClick={() => handleOpenReceive(order)}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs shadow-indigo-100 transition-colors disabled:opacity-40"
                          >
                            收样
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsReceivingModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded-lg text-xs transition-colors"
                          >
                            详情
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

      {/* PRD 4.3 委托详情与收样确认弹窗 */}
      {isReceivingModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div 
            id="modal-sample-receive-detail"
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6"
          >
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <PackageCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {selectedOrder.currentStep === 'sample_receiving' ? '办理样品现场收样验收' : '委托与收样基本信息'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    委托编号：<span className="font-mono font-bold text-indigo-700">{selectedOrder.orderCode}</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsReceivingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-5 text-xs max-h-[70vh] overflow-y-auto">
              
              {/* 1. 委托基本信息 */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 flex items-center justify-between">
                  <span>委托基本信息</span>
                  <span className="text-[11px] font-normal text-slate-400">PRD 节点一·基本字段</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block mb-0.5">委托单位</span>
                    <span className="font-semibold text-slate-800">{selectedOrder.clientName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">工程项目</span>
                    <span className="font-semibold text-slate-800">{selectedOrder.projectTitle}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">检测类型</span>
                    <span className="font-semibold text-slate-800">{selectedOrder.testType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">联系人</span>
                    <span className="font-semibold text-slate-800">{selectedOrder.contactPerson}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">联系电话</span>
                    <span className="font-semibold text-slate-800">{selectedOrder.contactPhone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">委托日期</span>
                    <span className="font-semibold text-slate-800">{selectedOrder.orderDate}</span>
                  </div>
                </div>
              </div>

              {/* 2. 样品信息 */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 flex items-center justify-between">
                  <span>样品明细与赋码信息</span>
                  <span className="text-[11px] text-indigo-600 font-medium">共 {selectedOrder.samples.length} 组样品</span>
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <th className="py-2 px-3">样品编号</th>
                        <th className="py-2 px-3">样品名称</th>
                        <th className="py-2 px-3">规格型号</th>
                        <th className="py-2 px-3 text-center">数量</th>
                        <th className="py-2 px-3">条码 / 库位</th>
                        <th className="py-2 px-3">状态</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedOrder.samples.map(s => (
                        <tr key={s.id}>
                          <td className="py-2.5 px-3 font-mono font-bold text-indigo-600">{s.sampleCode}</td>
                          <td className="py-2.5 px-3 font-medium text-slate-800">{s.sampleName}</td>
                          <td className="py-2.5 px-3 text-slate-500">{s.specModel}</td>
                          <td className="py-2.5 px-3 text-center font-bold">{s.quantity} {s.unit}</td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                            {s.barcode || '系统自动生成'}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700">
                              {s.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. 检测项目 */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 flex items-center justify-between">
                  <span>拟检项目及收费估算</span>
                  <span className="text-[11px] font-semibold text-slate-700">
                    测算应收：¥{selectedOrder.receivableAmount.toLocaleString()} 元
                  </span>
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <th className="py-2 px-3">检测项目</th>
                        <th className="py-2 px-3">依据检测标准</th>
                        <th className="py-2 px-3 text-center">数量</th>
                        <th className="py-2 px-3 text-right">单价</th>
                        <th className="py-2 px-3 text-right">小计金额</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedOrder.testProjects.map(tp => (
                        <tr key={tp.id}>
                          <td className="py-2.5 px-3 font-medium text-slate-800">{tp.projectName}</td>
                          <td className="py-2.5 px-3 text-slate-500">{tp.testStandard}</td>
                          <td className="py-2.5 px-3 text-center">{tp.quantity}</td>
                          <td className="py-2.5 px-3 text-right">¥{tp.unitPrice}</td>
                          <td className="py-2.5 px-3 text-right font-semibold text-indigo-700">¥{tp.totalAmount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 收样验收意见/备注 */}
              {selectedOrder.currentStep === 'sample_receiving' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    现场收样验收意见与封样说明
                  </label>
                  <input
                    type="text"
                    value={receiveRemark}
                    onChange={e => setReceiveRemark(e.target.value)}
                    placeholder="例：试样外观平整无裂缝缺陷，送检人与见证人签字齐全，已封样存入力学暂存区"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              )}

            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsReceivingModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                返回
              </button>

              <div className="flex items-center gap-2">
                {selectedOrder.currentStep === 'sample_receiving' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        alert('已暂存当前收样草稿数据！');
                        setIsReceivingModalOpen(false);
                      }}
                      className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      暂存
                    </button>
                    <button
                      id="btn-confirm-sample-receive-submit"
                      type="button"
                      onClick={handleConfirmReceive}
                      className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md shadow-indigo-100 transition-colors flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      确认收样 (流转至检测收费)
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
