import React from 'react';
import { 
  Inbox, 
  CreditCard, 
  Share2, 
  FlaskConical, 
  CheckSquare, 
  ShieldCheck, 
  Award, 
  Printer, 
  Truck, 
  ChevronRight, 
  Eye, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Sparkles,
  Sliders,
  FileSpreadsheet
} from 'lucide-react';
import { useLims } from '../context/LimsContext';
import { WorkflowNodeId, WorkflowNodeInfo } from '../types';

interface WorkflowHomeProps {
  onOpenPrdDrawer: () => void;
}

export const WorkflowHome: React.FC<WorkflowHomeProps> = ({ onOpenPrdDrawer }) => {
  const { 
    orders, 
    nodeInfos, 
    setActiveNode, 
    openWorkflowTimeline 
  } = useLims();

  const getStatusDotAndText = (id: WorkflowNodeId, count: number) => {
    switch (id) {
      case 'sample_receiving':
        return count === 0 ? (
          <div className="flex items-center text-xs text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-slate-200 mr-2"></span> 无待收样项目
          </div>
        ) : (
          <div className="flex items-center text-xs text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-slate-400 mr-2"></span> 待接收扫码
          </div>
        );
      case 'fee_collection':
        return (
          <div className="flex items-center text-xs text-red-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></span> 待收费任务积压中
          </div>
        );
      case 'task_assignment':
        return (
          <div className="flex items-center text-xs text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-400 mr-2"></span> 调度队列中
          </div>
        );
      case 'testing':
        return (
          <div className="flex items-center text-xs text-indigo-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></span> 正在试验进行
          </div>
        );
      case 'review':
        return count === 0 ? (
          <div className="flex items-center text-xs text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-slate-200 mr-2"></span> 暂无待复核数据
          </div>
        ) : (
          <div className="flex items-center text-xs text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-purple-400 mr-2"></span> 待技术复核
          </div>
        );
      case 'report_audit':
        return (
          <div className="flex items-center text-xs text-amber-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span> 需加急审核
          </div>
        );
      case 'report_approval':
        return (
          <div className="flex items-center text-xs text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-indigo-400 mr-2"></span> 等待签字人批准
          </div>
        );
      case 'report_print':
        return (
          <div className="flex items-center text-xs text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-slate-400 mr-2"></span> 队列打印中
          </div>
        );
      case 'report_delivery':
        return (
          <div className="flex items-center text-xs text-emerald-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span> 可办理交接领取
          </div>
        );
      default:
        return (
          <div className="flex items-center text-xs text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-slate-200 mr-2"></span> 正常运行
          </div>
        );
    }
  };

  // Node lookup map
  const nodeMap = new Map<WorkflowNodeId, (typeof nodeInfos)[0]>(nodeInfos.map(n => [n.id, n]));

  const renderSleekNodeCard = (id: WorkflowNodeId) => {
    const node = nodeMap.get(id);
    if (!node) return null;

    // Filter orders currently waiting at this node
    const waitingOrders = orders.filter(o => o.currentStep === id);
    const isSpecialHighlight = id === 'fee_collection';
    const isDelivery = id === 'report_delivery';
    const isZero = node.pendingCount === 0;

    return (
      <div
        id={`card-node-${id}`}
        onClick={() => setActiveNode(id)}
        className={`group bg-white p-5 sm:p-6 rounded-2xl shadow-xs border transition-all cursor-pointer flex flex-col justify-between gap-3 relative hover:shadow-md hover:border-indigo-300 ${
          isSpecialHighlight 
            ? 'border-indigo-100 ring-2 ring-indigo-50' 
            : 'border-slate-100'
        }`}
      >
        {/* Top Header Row: Label & Code */}
        <div className="flex items-center justify-between">
          <span className={`font-semibold text-xs uppercase tracking-wider ${
            isSpecialHighlight ? 'text-indigo-600 font-bold' : 'text-slate-400'
          }`}>
            {node.name}
          </span>
          <span className="text-[10px] font-mono font-bold text-slate-400 px-1.5 py-0.5 rounded bg-slate-50 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
            {node.code}
          </span>
        </div>

        {/* Middle: Big Metric */}
        <div className="flex items-baseline justify-between my-1">
          <div className={`text-3xl sm:text-4xl font-bold font-mono tracking-tight ${
            isZero 
              ? 'text-slate-300' 
              : isDelivery 
              ? 'text-indigo-600 font-black' 
              : isSpecialHighlight
              ? 'text-slate-900 font-black'
              : 'text-slate-900'
          }`}>
            {node.pendingCount.toLocaleString()}
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
        </div>

        {/* Bottom: Status Dot and Description */}
        <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
          {getStatusDotAndText(id, node.pendingCount)}
          {waitingOrders.length > 0 && (
            <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
              {waitingOrders[0].orderCode}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10 pb-16">
      
      {/* Sleek Workflow Metrics Board (Staggered Layout from Theme Design) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              核心业务流节点全景看板
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              按照 PRD 9 节点递进关系展示实时业务待办负荷与任务流转队列
            </p>
          </div>
          <button
            onClick={() => openWorkflowTimeline('WT001')}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 bg-indigo-50/70 hover:bg-indigo-100/70 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>查看生命周期全景 (WT001)</span>
          </button>
        </div>

        {/* Row 1: 4 columns - 委托收样 / 检测收费 / 任务分配 / 试验检测 */}
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
            业务受理与试验执行阶段
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {renderSleekNodeCard('sample_receiving')}
            {renderSleekNodeCard('fee_collection')}
            {renderSleekNodeCard('task_assignment')}
            {renderSleekNodeCard('testing')}
          </div>
        </div>

        {/* Row 2: 3 columns - 复核确认 / 报告审核 / 报告批准 */}
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
            三级技术质量把关与授权签发
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {renderSleekNodeCard('review')}
            {renderSleekNodeCard('report_audit')}
            {renderSleekNodeCard('report_approval')}
          </div>
        </div>

        {/* Row 3: 2 columns - 报告打印 / 报告领取 */}
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
            文印出具与客户交付闭环
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {renderSleekNodeCard('report_print')}
            {renderSleekNodeCard('report_delivery')}
          </div>
        </div>
      </div>

      {/* Active Commission Orders Full Panorama Table */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
              流转中的业务委托订单列表
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              端到端支持从委托收样流转至报告领取，点击“查看流程”可核查全生命周期历史审计日志
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 self-start sm:self-auto">
            共 {orders.length} 笔委托
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-600 border-b border-slate-100 font-semibold">
                <th className="py-3 px-4">委托编号</th>
                <th className="py-3 px-4">委托单位</th>
                <th className="py-3 px-4">工程项目</th>
                <th className="py-3 px-4">当前流转节点</th>
                <th className="py-3 px-4">检测收费</th>
                <th className="py-3 px-4">总体状态</th>
                <th className="py-3 px-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map(order => {
                const nodeInfo = nodeMap.get(order.currentStep as WorkflowNodeId);
                return (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                      {order.orderCode}
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-medium">
                      {order.clientName}
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                      {order.projectTitle}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                        {nodeInfo?.name || order.currentStep}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        order.feeStatus === '已收费' 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {order.feeStatus} (¥{order.paidAmount}/{order.receivableAmount})
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {order.overallStatus === 'COMPLETED' ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 业务完成
                        </span>
                      ) : order.overallStatus === 'REJECTED' ? (
                        <span className="text-rose-700 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> 已退回重检
                        </span>
                      ) : (
                        <span className="text-slate-600 font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-indigo-500" /> 流转处理中
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => openWorkflowTimeline(order.orderCode)}
                        className="text-slate-500 hover:text-indigo-600 hover:underline text-xs"
                      >
                        查看流程
                      </button>
                      <button
                        onClick={() => setActiveNode(order.currentStep)}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium transition-colors"
                      >
                        去处理
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
