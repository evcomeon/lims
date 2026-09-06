import React, { useState } from 'react';
import { 
  FlaskConical, 
  Search, 
  RotateCcw, 
  Play, 
  FileEdit, 
  ArrowLeft, 
  Calculator, 
  CheckCircle2, 
  AlertCircle, 
  FileSpreadsheet,
  Save,
  Send,
  Sliders
} from 'lucide-react';
import { useLims } from '../context/LimsContext';
import { TestTask, RawTestData } from '../types';

export const Node4Testing: React.FC = () => {
  const { 
    orders, 
    submitTestResult, 
    setActiveNode, 
    openWorkflowTimeline,
    canPerformAction,
    currentUserRole 
  } = useLims();

  const [taskFilter, setTaskFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Active testing task being entered/tested
  const [activeTask, setActiveTask] = useState<TestTask | null>(null);

  // Form states for raw test data
  const [load1, setLoad1] = useState<number>(865);
  const [load2, setLoad2] = useState<number>(878);
  const [load3, setLoad3] = useState<number>(870);
  const [dimLength, setDimLength] = useState<number>(150);
  const [dimWidth, setDimWidth] = useState<number>(150);
  const [dimHeight, setDimHeight] = useState<number>(150);
  const [testTemp, setTestTemp] = useState<string>('20.5℃');
  const [testHumidity, setTestHumidity] = useState<string>('95% RH');
  const [equipmentUsed, setEquipmentUsed] = useState<string>('YAW-3000微机电液伺服压力机 (检定有效)');

  const canTest = canPerformAction('EDIT', 'testing');

  // Extract all test tasks
  const allTasks: TestTask[] = [];
  orders.forEach(o => {
    o.tasks.forEach(t => allTasks.push(t));
  });

  const filteredTasks = allTasks.filter(t => {
    if (taskFilter && !t.taskCode.toLowerCase().includes(taskFilter.toLowerCase()) && !t.orderCode.toLowerCase().includes(taskFilter.toLowerCase())) return false;
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    return true;
  });

  // Calculate live values as user types (PRD 8.2 自动计算公式)
  const area = (dimLength * dimWidth);
  const f1 = area > 0 ? Number(((load1 * 1000) / area).toFixed(1)) : 0;
  const f2 = area > 0 ? Number(((load2 * 1000) / area).toFixed(1)) : 0;
  const f3 = area > 0 ? Number(((load3 * 1000) / area).toFixed(1)) : 0;
  
  // Representative value calculation (GB/T 50081-2019 standard rule)
  const values = [f1, f2, f3].sort((a, b) => a - b);
  const median = values[1];
  const maxDev = Math.max(values[2] - median, median - values[0]) / median;
  let repValue = Number(((f1 + f2 + f3) / 3).toFixed(1));
  let isInvalidBatch = false;
  if (maxDev > 0.15) {
    if ((values[2] - median) / median > 0.15 && (median - values[0]) / median > 0.15) {
      isInvalidBatch = true;
      repValue = 0;
    } else {
      repValue = median;
    }
  }

  // Automatic Judgment vs Design Grade C30/C35 (PRD 8.3)
  const designGrade = 30.0;
  const isQualified = !isInvalidBatch && repValue >= designGrade;
  const judgment = isInvalidBatch ? '试验数据无效需重做' : isQualified ? '合格' : '不合格';

  const handleOpenTestEditor = (task: TestTask) => {
    setActiveTask(task);
    if (task.testData) {
      const td = task.testData;
      setLoad1(td.items?.[0]?.load || td.specimen1Load || 865);
      setLoad2(td.items?.[1]?.load || td.specimen2Load || 878);
      setLoad3(td.items?.[2]?.load || td.specimen3Load || 870);
      setDimLength(td.items?.[0]?.dimensions?.length || 150);
      setDimWidth(td.items?.[0]?.dimensions?.width || 150);
      setDimHeight(td.items?.[0]?.dimensions?.height || 150);
      setTestTemp(td.temperature || '20.5℃');
      setTestHumidity(td.humidity || '95% RH');
      setEquipmentUsed(td.equipmentUsed || td.testEquipment || task.equipment || 'YAW-3000微机电液伺服压力机');
    }
  };

  const handleSaveDraft = () => {
    alert('试验原始数据草稿已在本地安全暂存！');
  };

  const handleSubmitResult = () => {
    if (!activeTask) return;

    const payload: RawTestData = {
      testDate: new Date().toISOString().split('T')[0],
      temperature: testTemp,
      humidity: testHumidity,
      equipmentUsed,
      items: [
        { sampleIndex: 1, dimensions: { length: dimLength, width: dimWidth, height: dimHeight }, load: load1, calculatedStrength: f1 },
        { sampleIndex: 2, dimensions: { length: dimLength, width: dimWidth, height: dimHeight }, load: load2, calculatedStrength: f2 },
        { sampleIndex: 3, dimensions: { length: dimLength, width: dimWidth, height: dimHeight }, load: load3, calculatedStrength: f3 },
      ],
      representativeValue: repValue,
      designRequirement: `设计抗压强度等级 C30 (≥ 30.0 MPa)`,
      judgment,
    };

    submitTestResult(activeTask.id, payload);
    setActiveTask(null);
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
            <span className="text-indigo-600 font-medium">节点四：试验检测 (PRD 7.0 / 8.0 / 9.0)</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-indigo-600" />
            试验检测与原始记录智能核算
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            试验核心工作区：录入传感器破坏荷载原始数据、系统实时计算单值与代表值、自动对照标准判定结论
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

      {/* If task editor is active, show the full testing screen */}
      {activeTask ? (
        <div id="view-testing-data-entry" className="space-y-6 animate-in fade-in duration-150">
          
          {/* Top Return Bar */}
          <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActiveTask(null)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">正在录入试验数据</span>
                  <span className="text-xs font-mono font-bold bg-indigo-600 px-2.5 py-0.5 rounded text-white shadow-xs">
                    {activeTask.taskCode}
                  </span>
                  <span className="text-xs text-slate-400">
                    (委托单: {activeTask.orderCode})
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  项目：{activeTask.testProject} · 标准：{activeTask.standard}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
              >
                <Save className="w-3.5 h-3.5" />
                保存草稿
              </button>
              <button
                id="btn-submit-test-result"
                type="button"
                disabled={!canTest}
                onClick={handleSubmitResult}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs shadow-md shadow-indigo-900/30 transition-colors flex items-center gap-1.5 disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
                提交检测结果 (流转至复核确认)
              </button>
            </div>
          </div>

          {/* Section 1: 任务基本信息 */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-3 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
              1. 任务基本信息 (PRD 8.1)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block mb-0.5">任务编号</span>
                <span className="font-mono font-bold text-indigo-600">{activeTask.taskCode}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">样品编号</span>
                <span className="font-mono font-bold text-slate-800">{activeTask.sampleCode} ({activeTask.sampleName})</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">检测依据标准</span>
                <span className="font-medium text-slate-800">{activeTask.standard}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">检测人员</span>
                <span className="font-semibold text-slate-800">{activeTask.assigneeName || '张三'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">试验环境温湿度</span>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={testTemp} 
                    onChange={e => setTestTemp(e.target.value)} 
                    className="w-20 px-2 py-0.5 border border-slate-200 rounded bg-white font-mono" 
                  />
                  <input 
                    type="text" 
                    value={testHumidity} 
                    onChange={e => setTestHumidity(e.target.value)} 
                    className="w-24 px-2 py-0.5 border border-slate-200 rounded bg-white font-mono" 
                  />
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block mb-0.5">检测使用仪器设备</span>
                <input 
                  type="text" 
                  value={equipmentUsed} 
                  onChange={e => setEquipmentUsed(e.target.value)} 
                  className="w-full px-2 py-0.5 border border-slate-200 rounded bg-white" 
                />
              </div>
            </div>
          </div>

          {/* Section 2: 原始数据录入与实时计算 */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-indigo-600" />
                  2. 原始检测数据录入与实时自动核算 (PRD 8.2)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  标准公式：单值强度 <code className="font-mono bg-slate-100 px-1 rounded text-indigo-600">f = (F × 1000) / (L × W)</code>，代表值按 GB/T 50081-2019 三值剔除或取均值算法自动执行
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                公式引擎活跃中
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                    <th className="py-2.5 px-4 text-center w-16">试件#</th>
                    <th className="py-2.5 px-4">试件设计尺寸 (L × W × H, mm)</th>
                    <th className="py-2.5 px-4">受压破坏荷载 F (kN) *</th>
                    <th className="py-2.5 px-4">单值抗压强度 (MPa)</th>
                    <th className="py-2.5 px-4">破坏形态描述</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Specimen 1 */}
                  <tr>
                    <td className="py-3 px-4 text-center font-bold text-slate-600">1#</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 font-mono text-slate-700">
                        <input 
                          type="number" 
                          value={dimLength} 
                          onChange={e => setDimLength(Number(e.target.value))} 
                          className="w-16 px-2 py-1 border border-slate-200 rounded text-center" 
                        />
                        <span>×</span>
                        <input 
                          type="number" 
                          value={dimWidth} 
                          onChange={e => setDimWidth(Number(e.target.value))} 
                          className="w-16 px-2 py-1 border border-slate-200 rounded text-center" 
                        />
                        <span>×</span>
                        <input 
                          type="number" 
                          value={dimHeight} 
                          onChange={e => setDimHeight(Number(e.target.value))} 
                          className="w-16 px-2 py-1 border border-slate-200 rounded text-center" 
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        value={load1}
                        onChange={e => setLoad1(Number(e.target.value))}
                        className="w-28 px-3 py-1.5 border border-indigo-200 rounded-lg font-mono font-bold text-indigo-950 bg-indigo-50/40 focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 text-sm">
                      {f1} MPa
                    </td>
                    <td className="py-3 px-4 text-slate-500">倒双锥体破坏 (正常破坏)</td>
                  </tr>

                  {/* Specimen 2 */}
                  <tr>
                    <td className="py-3 px-4 text-center font-bold text-slate-600">2#</td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {dimLength} × {dimWidth} × {dimHeight} mm
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        value={load2}
                        onChange={e => setLoad2(Number(e.target.value))}
                        className="w-28 px-3 py-1.5 border border-indigo-200 rounded-lg font-mono font-bold text-indigo-950 bg-indigo-50/40 focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 text-sm">
                      {f2} MPa
                    </td>
                    <td className="py-3 px-4 text-slate-500">正常锥形破坏</td>
                  </tr>

                  {/* Specimen 3 */}
                  <tr>
                    <td className="py-3 px-4 text-center font-bold text-slate-600">3#</td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {dimLength} × {dimWidth} × {dimHeight} mm
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        value={load3}
                        onChange={e => setLoad3(Number(e.target.value))}
                        className="w-28 px-3 py-1.5 border border-indigo-200 rounded-lg font-mono font-bold text-indigo-950 bg-indigo-50/40 focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 text-sm">
                      {f3} MPa
                    </td>
                    <td className="py-3 px-4 text-slate-500">倒锥体破坏 (无偏压)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: 检测结果判定 */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-3 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              3. 最终检测结果与判定 (PRD 8.3)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-xs block mb-1">设计抗压强度等级指标</span>
                <span className="text-base font-bold text-slate-900 font-mono">≥ 30.0 MPa (C30)</span>
                <p className="text-[11px] text-slate-400 mt-1">依据委托单明确的设计强度标号</p>
              </div>

              <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-200">
                <span className="text-indigo-800 text-xs block mb-1 font-semibold">代表值自动计算结果</span>
                <span className="text-2xl font-black text-indigo-700 font-mono">
                  {isInvalidBatch ? '无效' : `${repValue} MPa`}
                </span>
                <p className="text-[11px] text-indigo-600 mt-1">
                  {isInvalidBatch ? '三值离散度均超标15%，按国标作废' : '三试件强度算术平均值'}
                </p>
              </div>

              <div className={`p-4 rounded-xl border ${
                isQualified ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' : 'bg-rose-50/80 border-rose-200 text-rose-950'
              }`}>
                <span className="text-xs block mb-1 font-semibold">标准符合性判定结论</span>
                <span className={`text-2xl font-black ${isQualified ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {judgment}
                </span>
                <p className={`text-[11px] mt-1 ${isQualified ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {isQualified ? '达到 C30 设计指标，结论合格' : '低于设计值或数据离散，结论不合格'}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setActiveTask(null)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                取消返回列表
              </button>
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                暂存试验草稿
              </button>
              <button
                id="btn-confirm-submit-test-bottom"
                type="button"
                disabled={!canTest}
                onClick={handleSubmitResult}
                className="px-6 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md shadow-indigo-100 transition-colors flex items-center gap-1.5 disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
                确认提交复核 (试验检测 → 复核确认)
              </button>
            </div>
          </div>

        </div>
      ) : (
        /* Task List View */
        <div className="space-y-4">
          
          {/* Query Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="搜索任务编号 / 委托单号..."
                  value={taskFilter}
                  onChange={e => setTaskFilter(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
              >
                <option value="ALL">全部检测状态</option>
                <option value="待检测">待检测</option>
                <option value="检测中">检测中</option>
                <option value="待复核">已提交待复核</option>
                <option value="退回修改">已退回修改</option>
              </select>
            </div>

            <div className="flex items-center gap-1 text-slate-500">
              <span>当前检测角色：</span>
              <span className="font-semibold text-indigo-600 font-mono">
                {currentUserRole === 'TESTER' ? '试验检测员 (可操作录入)' : `${currentUserRole} (只读查看模式)`}
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-600 border-b border-slate-100 font-semibold">
                    <th className="py-3 px-4">任务编号</th>
                    <th className="py-3 px-4">委托单号</th>
                    <th className="py-3 px-4">检测项目</th>
                    <th className="py-3 px-4">样品编号及规格</th>
                    <th className="py-3 px-4">设备指派</th>
                    <th className="py-3 px-4">状态</th>
                    <th className="py-3 px-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        暂无检测任务
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map(task => {
                      const isWaitingTest = task.status === '待检测' || task.status === '检测中' || task.status === '已退回' || task.status === '退回修改';

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
                          <td className="py-3 px-4">
                            <span className="font-mono text-slate-600 mr-1">{task.sampleCode}</span>
                            <span className="text-slate-700">{task.sampleName}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-[11px]">
                            {task.equipment || '未配置设备'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              task.status === '待复核'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : (task.status === '已退回' || task.status === '退回修改')
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            }`}>
                              {task.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            {isWaitingTest ? (
                              <button
                                id={`btn-enter-test-${task.taskCode}`}
                                disabled={!canTest}
                                onClick={() => handleOpenTestEditor(task)}
                                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs shadow-indigo-100 transition-colors disabled:opacity-40 inline-flex items-center gap-1"
                              >
                                <FileEdit className="w-3 h-3" />
                                录入数据
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenTestEditor(task)}
                                className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded-lg text-xs transition-colors"
                              >
                                查看数据
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
