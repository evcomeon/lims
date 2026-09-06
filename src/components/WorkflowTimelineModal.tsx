import React from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  User, 
  Calendar, 
  FileText, 
  ArrowDown, 
  CornerDownRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { useLims } from '../context/LimsContext';
import { WorkflowNodeId } from '../types';

const NODE_STEPS_ORDER: { id: WorkflowNodeId; name: string }[] = [
  { id: 'sample_receiving', name: '委托收样' },
  { id: 'fee_collection', name: '检测收费' },
  { id: 'task_assignment', name: '任务分配' },
  { id: 'testing', name: '试验检测' },
  { id: 'review', name: '复核确认' },
  { id: 'report_audit', name: '报告审核' },
  { id: 'report_approval', name: '报告批准' },
  { id: 'report_print', name: '报告打印' },
  { id: 'report_delivery', name: '报告领取' },
];

export const WorkflowTimelineModal: React.FC = () => {
  const { viewingWorkflowOrder, setViewingWorkflowOrder } = useLims();

  if (!viewingWorkflowOrder) return null;

  const order = viewingWorkflowOrder;

  // Determine which steps are completed, in-progress, or upcoming
  const currentStepIndex = NODE_STEPS_ORDER.findIndex(s => s.id === order.currentStep);
  const isAllCompleted = order.overallStatus === 'COMPLETED';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div 
        id="modal-workflow-timeline"
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">全生命周期流程追溯</h3>
                <span className="text-xs px-2 py-0.5 rounded-full font-mono font-medium bg-indigo-100 text-indigo-800">
                  {order.orderCode}
                </span>
                {order.report?.reportCode && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-mono font-medium bg-purple-100 text-purple-800">
                    {order.report.reportCode}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {order.clientName} · {order.projectTitle}
              </p>
            </div>
          </div>
          <button
            id="btn-close-timeline-modal"
            onClick={() => setViewingWorkflowOrder(null)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="px-6 py-3 bg-indigo-50/40 border-b border-indigo-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <span className="font-medium">委托日期：</span>
            <span>{order.orderDate}</span>
            <span className="text-slate-300">|</span>
            <span className="font-medium">检测类型：</span>
            <span>{order.testType}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">总体状态：</span>
            {isAllCompleted ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> 业务完成
              </span>
            ) : order.overallStatus === 'REJECTED' ? (
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold flex items-center gap-1">
                <RotateCcw className="w-3 h-3" /> 已退回重检
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3" /> 流转中
              </span>
            )}
          </div>
        </div>

        {/* Timeline Content */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6">
          <div className="relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {NODE_STEPS_ORDER.map((step, idx) => {
              // Find matching history logs
              const stepHistories = order.history.filter(h => h.nodeId === step.id);
              const isPast = idx < currentStepIndex || isAllCompleted;
              const isCurrent = idx === currentStepIndex && !isAllCompleted;
              const isFuture = idx > currentStepIndex && !isAllCompleted;

              let dotClass = "bg-slate-300 ring-white text-slate-600";
              if (isPast) dotClass = "bg-emerald-600 ring-emerald-100 text-white";
              if (isCurrent) {
                dotClass = order.overallStatus === 'REJECTED' 
                  ? "bg-rose-500 ring-rose-100 text-white animate-pulse"
                  : "bg-indigo-600 ring-indigo-100 text-white animate-pulse";
              }

              return (
                <div key={step.id} className="relative mb-6 last:mb-0">
                  {/* Step Dot */}
                  <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ring-4 ${dotClass}`}>
                    {isPast ? <CheckCircle2 className="w-3 h-3" /> : (idx + 1)}
                  </div>

                  {/* Step Title Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${isCurrent ? 'text-indigo-950' : isPast ? 'text-slate-900' : 'text-slate-400'}`}>
                        {step.name}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] px-2 py-0.2 rounded-full font-medium bg-indigo-100 text-indigo-700">
                          当前待办
                        </span>
                      )}
                      {isPast && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-emerald-50 text-emerald-700">
                          已完成
                        </span>
                      )}
                      {isFuture && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-slate-100 text-slate-400">
                          未到达
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Execution Logs */}
                  {stepHistories.length > 0 ? (
                    <div className="mt-2 space-y-2">
                      {stepHistories.map(h => (
                        <div 
                          key={h.id}
                          className={`p-3 rounded-xl border text-xs ${
                            h.status === 'REJECTED' 
                              ? 'bg-rose-50/70 border-rose-200 text-rose-900' 
                              : 'bg-slate-50 border-slate-200/80 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                            <div className="flex items-center gap-1.5 font-medium text-slate-700">
                              <User className="w-3 h-3 text-slate-400" />
                              <span>{h.operator}</span>
                              <span className="text-slate-400">({h.operatorRole})</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-400">
                              <Clock className="w-3 h-3" />
                              <span>{h.timestamp}</span>
                            </div>
                          </div>
                          
                          <div className="text-xs leading-relaxed font-normal">
                            {h.action}
                          </div>

                          {h.rejectReason && (
                            <div className="mt-1.5 pt-1.5 border-t border-rose-200/60 font-medium text-rose-700 flex items-start gap-1">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <span>退回批注：{h.rejectReason}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-1 text-xs text-slate-400 italic">
                      {isFuture ? '等待前序节点处理完成后流转' : '无详细操作日志'}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Final Completed Node */}
            <div className="relative pt-2">
              <div className={`absolute -left-6 top-2.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ring-4 ${
                isAllCompleted ? 'bg-emerald-600 ring-emerald-100 text-white' : 'bg-slate-200 ring-white text-slate-400'
              }`}>
                ✓
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${isAllCompleted ? 'text-emerald-800' : 'text-slate-400'}`}>
                  业务闭环完成
                </span>
                {isAllCompleted && (
                  <span className="text-xs text-emerald-600 font-medium">已交付归档，电子报告凭据生效</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => setViewingWorkflowOrder(null)}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            关闭窗口
          </button>
        </div>
      </div>
    </div>
  );
};
