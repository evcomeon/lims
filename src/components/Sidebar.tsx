import React from 'react';
import { 
  LayoutDashboard, 
  Inbox, 
  CreditCard, 
  Share2, 
  FlaskConical, 
  CheckSquare, 
  ShieldCheck, 
  Award, 
  Printer, 
  Truck, 
  Sliders, 
  History, 
  RotateCcw, 
  User,
  ChevronRight,
  X
} from 'lucide-react';
import { useLims } from '../context/LimsContext';
import { WorkflowNodeId, UserRole } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPrdDrawer: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onOpenPrdDrawer }) => {
  const { 
    activeNode, 
    setActiveNode, 
    currentRole, 
    setCurrentRole, 
    nodeInfos, 
    openWorkflowTimeline,
    resetAllData 
  } = useLims();

  const roleOptions: { value: UserRole; label: string; roleName: string }[] = [
    { value: 'ALL', label: '系统超级管理员', roleName: '超管 Admin' },
    { value: 'RECEIVER', label: '委托收样员', roleName: '收样员' },
    { value: 'CASHIER', label: '财务收费员', roleName: '收费员' },
    { value: 'DISPATCHER', label: '检测调度主任', roleName: '调度主任' },
    { value: 'TESTER', label: '检测工程师', roleName: '检测员' },
    { value: 'REVIEWER', label: '技术复核员', roleName: '复核员' },
    { value: 'AUDITOR', label: '报告审核人', roleName: '审核人' },
    { value: 'APPROVER', label: '授权签字人', roleName: '签字人' },
    { value: 'PRINTER', label: '档案打印员', roleName: '打印员' },
    { value: 'DISPATCH_CLERK', label: '报告发证员', roleName: '发证员' },
  ];

  const currentRoleInfo = roleOptions.find(r => r.value === currentRole) || roleOptions[0];

  const workflowNodesList: { id: WorkflowNodeId | null; name: string; icon: React.ReactNode; code?: string }[] = [
    { id: null, name: '工作台首页', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'sample_receiving', name: '1. 委托收样', icon: <Inbox className="w-4 h-4" />, code: 'N1' },
    { id: 'fee_collection', name: '2. 检测收费', icon: <CreditCard className="w-4 h-4" />, code: 'N2' },
    { id: 'task_assignment', name: '3. 任务分配', icon: <Share2 className="w-4 h-4" />, code: 'N3' },
    { id: 'testing', name: '4. 试验检测', icon: <FlaskConical className="w-4 h-4" />, code: 'N4' },
    { id: 'review', name: '5. 复核确认', icon: <CheckSquare className="w-4 h-4" />, code: 'N5' },
    { id: 'report_audit', name: '6. 报告审核', icon: <ShieldCheck className="w-4 h-4" />, code: 'N6' },
    { id: 'report_approval', name: '7. 报告批准', icon: <Award className="w-4 h-4" />, code: 'N7' },
    { id: 'report_print', name: '8. 报告打印', icon: <Printer className="w-4 h-4" />, code: 'N8' },
    { id: 'report_delivery', name: '9. 报告领取', icon: <Truck className="w-4 h-4" />, code: 'N9' },
  ];

  const getNodeCount = (nodeId: WorkflowNodeId | null) => {
    if (!nodeId) return null;
    const info = nodeInfos.find(n => n.id === nodeId);
    return info ? info.pendingCount : 0;
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sleek Sidebar - Fixed Left Panel */}
      <aside 
        className={`fixed lg:relative top-0 bottom-0 left-0 z-50 w-64 h-screen lg:h-full bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 transition-transform duration-200 ease-in-out select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div 
            onClick={() => { setActiveNode(null); onClose(); }} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-black text-base shadow-xs shadow-indigo-500/40 group-hover:bg-indigo-400 transition-colors">
              L
            </div>
            <div>
              <span className="text-white font-bold tracking-tight text-base block leading-none">
                LIMS Control
              </span>
              <span className="text-[10px] text-slate-500 font-mono tracking-wider mt-1 block">
                9-NODE WORKFLOW
              </span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 p-3 space-y-6 overflow-y-auto">
          
          {/* Core Workflow Section */}
          <div>
            <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              核心工作流 (PRD 9节点)
            </div>
            <div className="space-y-0.5 mt-1">
              {workflowNodesList.map((item) => {
                const isActive = activeNode === item.id;
                const count = getNodeCount(item.id);

                return (
                  <button
                    key={item.name}
                    id={`sidebar-link-${item.id || 'home'}`}
                    onClick={() => {
                      setActiveNode(item.id);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-all ${
                      isActive 
                        ? 'bg-slate-800 text-white font-medium shadow-xs ring-1 ring-slate-700/50' 
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={isActive ? 'text-indigo-400' : 'text-slate-400'}>
                        {item.icon}
                      </span>
                      <span className="truncate">{item.name}</span>
                    </div>

                    {count !== null && count > 0 && (
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                        count > 1000 
                          ? 'bg-rose-500/20 text-rose-300' 
                          : count > 100 
                          ? 'bg-amber-500/20 text-amber-300' 
                          : 'bg-indigo-500/20 text-indigo-300'
                      }`}>
                        {count.toLocaleString()}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tools & Review Section */}
          <div>
            <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              评审与工具
            </div>
            <div className="space-y-0.5 mt-1">
              <button
                onClick={() => { onOpenPrdDrawer(); onClose(); }}
                className="w-full flex items-center justify-between px-3 py-2 text-xs text-amber-400 hover:bg-slate-800/60 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span>PRD 待确认项 (6项)</span>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              </button>

              <button
                onClick={() => { openWorkflowTimeline('WT001'); onClose(); }}
                className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <History className="w-4 h-4 text-slate-400" />
                  <span>全流程时间轴追溯</span>
                </div>
              </button>

              <button
                onClick={() => {
                  if (confirm('确定要重置所有演示数据为 PRD 初始状态吗？')) {
                    resetAllData();
                  }
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <RotateCcw className="w-4 h-4 text-slate-400" />
                  <span>重置演示数据</span>
                </div>
              </button>
            </div>
          </div>

        </nav>

        {/* Bottom User / Role Profile */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 border-2 border-indigo-400 flex items-center justify-center text-indigo-300 shrink-0 font-bold text-xs">
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium text-xs truncate block">
                  {currentRoleInfo.roleName}
                </span>
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1 rounded">
                  {currentRole}
                </span>
              </div>
              <div className="mt-1">
                <select
                  id="sidebar-role-select"
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value as UserRole)}
                  className="w-full bg-slate-800 text-[11px] text-slate-300 rounded px-1.5 py-1 border border-slate-700 focus:outline-none focus:border-indigo-400 cursor-pointer"
                >
                  {roleOptions.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                      切换：{opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
};
