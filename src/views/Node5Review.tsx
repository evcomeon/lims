import React, { useState } from 'react';
import { 
  FileCheck2, 
  Search, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Eye, 
  CornerDownLeft, 
  FileSpreadsheet, 
  Layers,
  Scale
} from 'lucide-react';
import { useLims } from '../context/LimsContext';
import { TestTask } from '../types';

export const Node5Review: React.FC = () => {
  const { 
    orders, 
    confirmReview, 
    openRejectModal, 
    setActiveNode, 
    openWorkflowTimeline,
    canPerformAction,
    currentUserRole 
  } = useLims();

  const [filterCode, setFilterCode] = useState('');
  
  // Selected task to review
  const [reviewingTask, setReviewingTask] = useState<TestTask | null>(null);
  const [reviewComment, setReviewComment] = useState('数据经核对，试验机校准曲线对应无误，计算公式及修约规则符合 GB/T 50081-2019 标准。');

  const canReview = canPerformAction('REVIEW', 'review');

  // Extract tasks awaiting review or review history
  const allTasks: TestTask[] = [];
  orders.forEach(o => {
    o.tasks.forEach(t => allTasks.push(t));
  });

  const reviewableTasks = allTasks.filter(t => {
    if (filterCode && !t.taskCode.toLowerCase().includes(filterCode.toLowerCase()) && !t.orderCode.toLowerCase().includes(filterCode.toLowerCase())) return false;
    return true;
  });

  const handleOpenReview = (task: TestTask) => {
    setReviewingTask(task);
  };

  const handlePass = () => {
    if (!reviewingTask) return;
    confirmReview(reviewingTask.id, reviewComment);
    setReviewingTask(null);
  };

  const handleReject = () => {
    if (!reviewingTask) return;
    // Find parent order
    const parentOrder = orders.find(o => o.orderCode === reviewingTask.orderCode);
    if (!parentOrder) return;
    openRejectModal(parentOrder.id, 'review', `复核退回：${reviewingTask.taskCode} (${reviewingTask.testProject})`);
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
            <span className="text-indigo-600 font-medium">节点五：复核确认 (PRD 10.0)</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-indigo-600" />
            试验数据技术复核与双人校验
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            第一道质量把关：复核员双重复验原始传感器荷载、校对计算修约公式，支持复核通过或退回重测
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

      {/* Review Modal / Screen: PRD 10.3 左右双栏布局 */}
      {reviewingTask ? (
        <div id="view-review-detail" className="space-y-5 animate-in fade-in duration-150">
          
          {/* Top Bar */}
          <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setReviewingTask(null)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">技术复核操作台 (PRD 10.3 左右布局)</span>
                  <span className="text-xs font-mono font-bold bg-indigo-600 px-2.5 py-0.5 rounded text-white shadow-xs">
                    {reviewingTask.taskCode}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  委托编号：{reviewingTask.orderCode} · 检测项目：{reviewingTask.testProject}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-review-reject"
                type="button"
                disabled={!canReview}
                onClick={handleReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-40"
              >
                <CornerDownLeft className="w-3.5 h-3.5" />
                退回修改 (PRD 18)
              </button>
              <button
                id="btn-review-pass"
                type="button"
                disabled={!canReview}
                onClick={handlePass}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-40"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                复核通过 (流转至报告审核)
              </button>
            </div>
          </div>

          {/* PRD 10.3 左右两列布局 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-xs">
            
            {/* 左侧：任务基本信息、样品信息、检测人员、检测标准、检测设备 */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  左栏：任务与样品溯源信息 (PRD 10.3)
                </h3>

                <div className="space-y-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">任务编号</span>
                      <span className="font-mono font-bold text-indigo-600">{reviewingTask.taskCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">委托单号</span>
                      <span className="font-mono text-slate-700">{reviewingTask.orderCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">样品编号</span>
                      <span className="font-mono font-semibold text-slate-900">{reviewingTask.sampleCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">样品名称</span>
                      <span className="font-medium text-slate-800">{reviewingTask.sampleName}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                    <div>
                      <span className="text-slate-400 block mb-0.5">检测执行标准</span>
                      <span className="font-medium text-slate-800">{reviewingTask.standard}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">试验设备</span>
                      <span className="font-medium text-slate-800">{reviewingTask.equipment || 'YAW-3000微机电液压力机'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">主检人员</span>
                      <span className="font-semibold text-slate-900">{reviewingTask.assigneeName || '张三'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">环境温湿度</span>
                      <span className="font-mono text-slate-700">
                        {reviewingTask.testData?.temperature || '20.0℃'} · {reviewingTask.testData?.humidity || '95% RH'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧：检测结果、原始数据、计算结果、判定结果 */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-indigo-600" />
                  右栏：原始数据、计算结果与结论判定 (PRD 10.3)
                </h3>

                {/* 原始数据表 */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                        <th className="p-2.5 text-center">试件#</th>
                        <th className="p-2.5">受压破坏荷载 (kN)</th>
                        <th className="p-2.5">单值强度 (MPa)</th>
                        <th className="p-2.5">复核验算状态</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reviewingTask.testData?.items.map(item => (
                        <tr key={item.sampleIndex}>
                          <td className="p-2.5 text-center font-bold text-slate-600">{item.sampleIndex}#</td>
                          <td className="p-2.5 font-mono font-bold text-indigo-800">{item.load} kN</td>
                          <td className="p-2.5 font-mono font-bold text-slate-800">{item.calculatedStrength} MPa</td>
                          <td className="p-2.5 text-emerald-600 font-medium">✓ 验算无误</td>
                        </tr>
                      )) || (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-slate-400">无试验记录</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 汇总与判定卡片 */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block mb-1">代表值验算</span>
                    <span className="text-xl font-extrabold font-mono text-indigo-600">
                      {reviewingTask.testData?.representativeValue} MPa
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">技术符合性判定</span>
                    <span className="text-xl font-extrabold text-emerald-600">
                      {reviewingTask.testData?.judgment || '合格'}
                    </span>
                  </div>
                </div>

                {/* 复核意见输入框 */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    复核人审核意见批注 *
                  </label>
                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs"
                  />
                </div>

              </div>
            </div>

          </div>

        </div>
      ) : (
        /* Task List View */
        <div className="space-y-4">
          
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between text-xs">
            <div className="relative w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="搜索任务编号 / 委托单号..."
                value={filterCode}
                onChange={e => setFilterCode(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div className="text-slate-500">
              当前角色权限：<span className="font-semibold text-indigo-600 font-mono">{currentUserRole}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-600 border-b border-slate-100 font-semibold">
                    <th className="py-3 px-4">任务编号</th>
                    <th className="py-3 px-4">委托单号</th>
                    <th className="py-3 px-4">检测项目</th>
                    <th className="py-3 px-4">检测人员</th>
                    <th className="py-3 px-4">试验代表值</th>
                    <th className="py-3 px-4">判定结论</th>
                    <th className="py-3 px-4">任务状态</th>
                    <th className="py-3 px-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reviewableTasks.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        暂无待复核任务
                      </td>
                    </tr>
                  ) : (
                    reviewableTasks.map(task => {
                      const isWaitingReview = task.status === '待复核';

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
                          <td className="py-3 px-4 font-medium text-slate-800">
                            {task.assigneeName || '张三'}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-indigo-800">
                            {task.testData ? `${task.testData.representativeValue || task.testData.averageStrength || '-'} MPa` : '-'}
                          </td>
                          <td className="py-3 px-4">
                            {task.testData ? (
                              <span className="font-semibold text-emerald-600">
                                {task.testData.judgment || task.testData.verdict || '合格'}
                              </span>
                            ) : '-'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              isWaitingReview
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                              {task.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            {isWaitingReview ? (
                              <button
                                id={`btn-review-${task.taskCode}`}
                                disabled={!canReview}
                                onClick={() => handleOpenReview(task)}
                                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs shadow-indigo-100 transition-colors disabled:opacity-40"
                              >
                                复核
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenReview(task)}
                                className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded-lg text-xs transition-colors"
                              >
                                查阅
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

        </div>
      )}

    </div>
  );
};
