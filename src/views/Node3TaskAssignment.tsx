import React, { useState } from 'react';
import { 
  UserCheck, 
  Search, 
  RotateCcw, 
  Calendar, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { useLims } from '../context/LimsContext';
import { TestTask } from '../types';

export const Node3TaskAssignment: React.FC = () => {
  const { 
    orders, 
    assignTask, 
    setActiveNode, 
    openWorkflowTimeline,
    canPerformAction 
  } = useLims();

  const [orderCodeFilter, setOrderCodeFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Dispatch modal
  const [selectedTask, setSelectedTask] = useState<TestTask | null>(null);
  const [assigneeName, setAssigneeName] = useState('张三 (高级力学工程师 · 持证资质合格)');
  const [equipment, setEquipment] = useState('YAW-3000微机控制电液伺服压力机 (检定有效)');
  const [planDate, setPlanDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [priority, setPriority] = useState<'普通' | '加急' | '特急'>('普通');
  const [remark, setRemark] = useState('');

  const canDispatch = canPerformAction('EDIT', 'task_assignment');

  // Aggregate all tasks across all orders
  const allTasks: TestTask[] = [];
  orders.forEach(order => {
    order.tasks.forEach(task => {
      allTasks.push(task);
    });
  });

  const filteredTasks = allTasks.filter(t => {
    if (orderCodeFilter && !t.orderCode.toLowerCase().includes(orderCodeFilter.toLowerCase())) return false;
    if (projectFilter && !t.testProject.toLowerCase().includes(projectFilter.toLowerCase())) return false;
    if (assigneeFilter && (!t.assigneeName || !t.assigneeName.toLowerCase().includes(assigneeFilter.toLowerCase()))) return false;
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    return true;
  });

  const handleOpenAssign = (task: TestTask) => {
    setSelectedTask(task);
    setPriority(task.priority || '普通');
    setRemark('');
  };

  const handleConfirmAssign = () => {
    if (!selectedTask) return;
    assignTask(selectedTask.id, assigneeName, equipment, planDate, priority, remark);
    setSelectedTask(null);
  };

  const personnelList = [
    { name: '张三', title: '高级力学检测师', cert: '持有力学检验证 (有效期至2028)', status: '在岗空闲' },
    { name: '李四', title: '力学检测工程师', cert: '持有混凝土与水泥检验员证', status: '在岗空闲' },
    { name: '陈建国', title: '资深岩土试验专家', cert: '持有地基基础与岩土检测证', status: '试验中' },
    { name: '赵六', title: '材料物理性能工程师', cert: '持有门窗与物理性能检验员证', status: '在岗空闲' },
  ];

  const equipmentList = [
    { name: 'YAW-3000微机控制电液伺服压力机', code: 'EQ-MECH-01', cert: '计量院检定合格 (有效至2027-04)' },
    { name: 'WAW-1000型微机控制万能材料试验机', code: 'EQ-MECH-02', cert: '计量院检定合格 (有效至2027-02)' },
    { name: 'HP-4.0型微机全自动加压混凝土抗渗仪', code: 'EQ-PERM-01', cert: '检定合格 (有效至2027-05)' },
    { name: 'MC-2000型路面材料强力试验仪', code: 'EQ-ROAD-01', cert: '检定合格 (有效至2026-11)' },
  ];

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
            <span className="text-indigo-600 font-medium">节点三：任务分配 (PRD 6.0)</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            检测任务派工与调度分配
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            调度中心：将委托检验项目指派给持证合格工程师，匹配检定合格仪器设备与试验排期
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

      {/* Query Bar (PRD 6.2) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
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
            <label className="block text-slate-500 font-medium mb-1">检测项目</label>
            <input
              type="text"
              placeholder="如：抗压强度"
              value={projectFilter}
              onChange={e => setProjectFilter(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-medium mb-1">检测人员</label>
            <input
              type="text"
              placeholder="姓名..."
              value={assigneeFilter}
              onChange={e => setAssigneeFilter(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-medium mb-1">任务状态</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
            >
              <option value="ALL">全部状态</option>
              <option value="待分配">待分配</option>
              <option value="待检测">待检测 / 已分配</option>
              <option value="检测中">检测中</option>
              <option value="待复核">已提交复核</option>
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
                setProjectFilter('');
                setAssigneeFilter('');
                setStatusFilter('ALL');
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Task List Table (PRD 6.2) */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-600 border-b border-slate-100 font-semibold">
                <th className="py-3 px-4">任务编号</th>
                <th className="py-3 px-4">委托编号</th>
                <th className="py-3 px-4">检测项目</th>
                <th className="py-3 px-4">检测依据标准</th>
                <th className="py-3 px-4">样品编号及名称</th>
                <th className="py-3 px-4">优先级</th>
                <th className="py-3 px-4">指派人员</th>
                <th className="py-3 px-4">状态</th>
                <th className="py-3 px-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    暂无可分配任务
                  </td>
                </tr>
              ) : (
                filteredTasks.map(task => {
                  const isPendingAssign = task.status === '待分配';

                  return (
                    <tr key={task.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                        {task.taskCode}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {task.orderCode}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {task.testProject}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {task.standard}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-slate-600 font-medium mr-1">{task.sampleCode}</span>
                        <span className="text-slate-700">{task.sampleName}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          task.priority === '特急'
                            ? 'bg-rose-100 text-rose-800'
                            : task.priority === '加急'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {task.assigneeName || <span className="text-slate-400 italic">未指派</span>}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          task.status === '待分配'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {isPendingAssign ? (
                          <button
                            id={`btn-assign-${task.taskCode}`}
                            disabled={!canDispatch}
                            onClick={() => handleOpenAssign(task)}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs shadow-indigo-100 transition-colors disabled:opacity-40"
                          >
                            分配
                          </button>
                        ) : (
                          <button
                            disabled={!canDispatch}
                            onClick={() => handleOpenAssign(task)}
                            className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded-lg text-xs transition-colors"
                          >
                            重配
                          </button>
                        )}
                        <button
                          onClick={() => openWorkflowTimeline(task.orderCode)}
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

      {/* PRD 6.3 分配窗口 */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div 
            id="modal-task-dispatch-window"
            className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-6"
          >
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">检测任务分配 (PRD 6.3)</h3>
                  <p className="text-xs text-slate-500">
                    任务编号：<span className="font-mono font-bold text-indigo-700">{selectedTask.taskCode}</span> · 委托：{selectedTask.orderCode}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedTask(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">✕</button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 text-xs">
              
              {/* Task basic summary */}
              <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 grid grid-cols-2 gap-2 text-slate-700">
                <div>
                  <span className="text-slate-400 block mb-0.5">检测项目：</span>
                  <span className="font-bold text-slate-900">{selectedTask.testProject}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">样品编号：</span>
                  <span className="font-mono font-bold text-indigo-800">{selectedTask.sampleCode} ({selectedTask.sampleName})</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block mb-0.5">执行标准：</span>
                  <span className="font-medium text-slate-700">{selectedTask.standard}</span>
                </div>
              </div>

              {/* Personnel select with qualification checks */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
                  <span>检测人员选择 *</span>
                  <span className="text-[10px] text-emerald-600 font-normal">PRD 规则：仅展示持有效资质人员</span>
                </label>
                <select
                  id="select-dispatch-personnel"
                  value={assigneeName}
                  onChange={e => setAssigneeName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                >
                  {personnelList.map(p => (
                    <option key={p.name} value={`${p.name} (${p.title} · 资质合格)`}>
                      {p.name} — {p.title} [{p.cert}] ({p.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Equipment select */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
                  <span>检测设备指派 *</span>
                  <span className="text-[10px] text-indigo-600 font-normal">计量检定合格设备</span>
                </label>
                <select
                  id="select-dispatch-equipment"
                  value={equipment}
                  onChange={e => setEquipment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                >
                  {equipmentList.map(eq => (
                    <option key={eq.code} value={eq.name}>
                      {eq.name} ({eq.cert})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    计划检测日期 *
                  </label>
                  <input
                    type="date"
                    value={planDate}
                    onChange={e => setPlanDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    试验优先级
                  </label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  >
                    <option value="普通">普通 (正常工期)</option>
                    <option value="加急">加急 (优先安排)</option>
                    <option value="特急">特急 (重点工程特急加塞)</option>
                  </select>
                </div>
              </div>

              {/* Remark */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  调度调度指令备注
                </label>
                <input
                  type="text"
                  value={remark}
                  onChange={e => setRemark(e.target.value)}
                  placeholder="例：试样龄期截至今日满28d，加急优先上机试验..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                取消
              </button>

              <button
                id="btn-confirm-assign-submit"
                type="button"
                onClick={handleConfirmAssign}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md shadow-indigo-100 transition-colors flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                确认分配 (流转至试验检测)
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
