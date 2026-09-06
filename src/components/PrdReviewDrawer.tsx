import React from 'react';
import { 
  X, 
  HelpCircle, 
  CheckCircle, 
  Sliders, 
  ShieldAlert, 
  FileText, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useLims } from '../context/LimsContext';

interface PrdReviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrdReviewDrawer: React.FC<PrdReviewDrawerProps> = ({ isOpen, onClose }) => {
  const { prdIssues, setPrdIssues } = useLims();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div 
        id="drawer-prd-review"
        className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden animate-in slide-in-from-right duration-200"
      >
        {/* Drawer Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base">PRD 联合评审与业务规则待确认项</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold">
                6 项关键待定
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">供 PM、UI/UX、前端、后端、测试共同评审与规则动态模拟</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
          
          {/* PRD Summary Banner */}
          <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 text-indigo-950">
            <div className="font-bold text-sm text-indigo-900 mb-1 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-600" />
              LIMS 9 节点检验检测业务主线
            </div>
            <p className="text-indigo-900/80 leading-relaxed">
              核心闭环：<strong>委托收样 → 检测收费 → 任务分配 → 试验检测 → 复核确认 → 报告审核 → 报告批准 → 报告打印 → 报告领取</strong>。
              本原型严格按照 PRD 规范搭建，以下 6 项属于需在评审会上与客户重点核实确认的规则：
            </p>
          </div>

          {/* 6 Key Items Pending Confirmation (待确认) */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              业务规则待确认开关 (可实时切换模拟)
            </h3>

            {/* Item 1 */}
            <div className="p-4 bg-slate-50/80 border border-slate-100 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">
                  1. 是否允许未收费直接进入任务分配？
                </span>
                <button
                  type="button"
                  onClick={() => setPrdIssues(prev => ({ ...prev, allowAssignBeforePaid: !prev.allowAssignBeforePaid }))}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${prdIssues.allowAssignBeforePaid ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${prdIssues.allowAssignBeforePaid ? 'translate-x-4' : 'translate-x-0'}`}
                  />
                </button>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                当前设定：<strong className="text-slate-700">{prdIssues.allowAssignBeforePaid ? '允许 (先做后收/特批放行模式)' : '不允许 (严格款清才分配派工)'}</strong>。
                <br />
                <em>评审建议：</em>多数实验室要求严格预收或企业授信月结客户才允许特批分配。
              </p>
            </div>

            {/* Item 2 */}
            <div className="p-4 bg-slate-50/80 border border-slate-100 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">
                  2. 一个委托单是否允许拆分为多个检测任务？
                </span>
                <button
                  type="button"
                  onClick={() => setPrdIssues(prev => ({ ...prev, allowSplitMultipleTasks: !prev.allowSplitMultipleTasks }))}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${prdIssues.allowSplitMultipleTasks ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${prdIssues.allowSplitMultipleTasks ? 'translate-x-4' : 'translate-x-0'}`}
                  />
                </button>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                当前设定：<strong className="text-slate-700">{prdIssues.allowSplitMultipleTasks ? '允许拆分为多个不同科室任务 (如力学/化学)' : '不允许 (整单单任务流转)'}</strong>。
              </p>
            </div>

            {/* Item 3 */}
            <div className="p-4 bg-slate-50/80 border border-slate-100 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">
                  3. 复核/报告审核退回时的目标节点？
                </span>
                <div className="flex items-center gap-1 bg-white border border-slate-200 p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setPrdIssues(prev => ({ ...prev, rejectToNode: 'TESTING' }))}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${prdIssues.rejectToNode === 'TESTING' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    直接退回检测
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrdIssues(prev => ({ ...prev, rejectToNode: 'PREVIOUS' }))}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${prdIssues.rejectToNode === 'PREVIOUS' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    退回上一节点
                  </button>
                </div>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                当前设定：<strong className="text-slate-700">{prdIssues.rejectToNode === 'TESTING' ? '退回试验检测节点 (重新试压/复算)' : '退回上一操作节点 (逐级回退)'}</strong>。
              </p>
            </div>

            {/* Item 4 */}
            <div className="p-4 bg-slate-50/80 border border-slate-100 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">
                  4. 报告批准后是否允许修改？
                </span>
                <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  {prdIssues.allowModifyAfterApproved ? '允许修改 (不合规)' : '禁止修改 (需走作废补发)'}
                </span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                依照 ISO/IEC 17025 及资质认定要求，已批准签发报告具有法律效力，禁止直接篡改。需走“报告作废并出具补充说明/新版报告”闭环流程。
              </p>
            </div>

            {/* Item 5 */}
            <div className="p-4 bg-slate-50/80 border border-slate-100 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">
                  5. 报告领取支持方式？
                </span>
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  现场领取 / 顺丰邮寄 / 电子签章推送
                </span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                系统当前已支持“现场核验人证领取”与“快递填单”，同时支持生成防伪带章电子报告供客户在线查验。
              </p>
            </div>

            {/* Item 6 */}
            <div className="p-4 bg-slate-50/80 border border-slate-100 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">
                  6. 首页 9 个数字的具体统计口径？
                </span>
                <span className="text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  原型暂定：该节点当前待办任务数
                </span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                PRD 中指明：“当前数字资料未明确统计口径，原型阶段暂定为该节点当前待办数量，最终需业务确认（如收费待办是否包含欠款单位历史累计等）”。
              </p>
            </div>
          </div>

          {/* PRD 19 Permission Matrix Quick Check */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
              PRD 节点十九：权限控制速查
            </h4>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="p-2">页面节点</th>
                    <th className="p-2 text-center">查看</th>
                    <th className="p-2 text-center">编辑/录入</th>
                    <th className="p-2 text-center">提交</th>
                    <th className="p-2 text-center">退回</th>
                    <th className="p-2 text-center">审核/批准</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr><td className="p-2 font-medium">委托收样</td><td className="text-center text-emerald-600">✓</td><td className="text-center text-emerald-600">✓</td><td className="text-center text-emerald-600">✓</td><td className="text-center text-slate-300">-</td><td className="text-center text-slate-300">-</td></tr>
                  <tr><td className="p-2 font-medium">检测收费</td><td className="text-center text-emerald-600">✓</td><td className="text-center text-emerald-600">✓</td><td className="text-center text-emerald-600">✓</td><td className="text-center text-slate-300">-</td><td className="text-center text-slate-300">-</td></tr>
                  <tr><td className="p-2 font-medium">任务分配</td><td className="text-center text-emerald-600">✓</td><td className="text-center text-emerald-600">✓</td><td className="text-center text-emerald-600">✓</td><td className="text-center text-slate-300">-</td><td className="text-center text-slate-300">-</td></tr>
                  <tr><td className="p-2 font-medium">试验检测</td><td className="text-center text-emerald-600">✓</td><td className="text-center text-emerald-600">✓</td><td className="text-center text-emerald-600">✓</td><td className="text-center text-slate-300">-</td><td className="text-center text-slate-300">-</td></tr>
                  <tr><td className="p-2 font-medium">复核确认</td><td className="text-center text-emerald-600">✓</td><td className="text-center text-slate-300">-</td><td className="text-center text-emerald-600">✓</td><td className="text-center text-rose-600">✓</td><td className="text-center text-emerald-600">复核</td></tr>
                  <tr><td className="p-2 font-medium">报告审核</td><td className="text-center text-emerald-600">✓</td><td className="text-center text-slate-300">-</td><td className="text-center text-emerald-600">✓</td><td className="text-center text-rose-600">✓</td><td className="text-center text-emerald-600">审核</td></tr>
                  <tr><td className="p-2 font-medium">报告批准</td><td className="text-center text-emerald-600">✓</td><td className="text-center text-slate-300">-</td><td className="text-center text-emerald-600">✓</td><td className="text-center text-rose-600">✓</td><td className="text-center text-emerald-600">批准</td></tr>
                  <tr><td className="p-2 font-medium">报告打印</td><td className="text-center text-emerald-600">✓</td><td className="text-center text-slate-300">-</td><td className="text-center text-emerald-600">✓</td><td className="text-center text-slate-300">-</td><td className="text-center text-slate-300">-</td></tr>
                  <tr><td className="p-2 font-medium">报告领取</td><td className="text-center text-emerald-600">✓</td><td className="text-center text-slate-300">-</td><td className="text-center text-emerald-600">✓</td><td className="text-center text-slate-300">-</td><td className="text-center text-slate-300">-</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-slate-400">
              * 您可以在顶部导航栏随时切换“当前角色”，界面将自动按该矩阵响应按钮显示/置灰状态。
            </p>
          </div>

          {/* PRD 21 Acceptance Checklist */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              PRD 节点二十一：验收标准核验
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
                <span className="font-semibold text-slate-800">① 状态正确：</span>
                <p className="text-slate-500 mt-0.5">流转后状态严格跃迁无遗漏</p>
              </div>
              <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
                <span className="font-semibold text-slate-800">② 权限正确：</span>
                <p className="text-slate-500 mt-0.5">无权角色不可越权提交审核</p>
              </div>
              <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
                <span className="font-semibold text-slate-800">③ 数据完整：</span>
                <p className="text-slate-500 mt-0.5">原始数据、计算值全流程保全</p>
              </div>
              <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
                <span className="font-semibold text-slate-800">④ 全程追溯：</span>
                <p className="text-slate-500 mt-0.5">记录操作人、时间、内容</p>
              </div>
              <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
                <span className="font-semibold text-slate-800">⑤ 退回可溯：</span>
                <p className="text-slate-500 mt-0.5">退回人+时间+必填退回原因</p>
              </div>
              <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
                <span className="font-semibold text-slate-800">⑥ 流程不可越级：</span>
                <p className="text-slate-500 mt-0.5">报告未批准禁止正常打印</p>
              </div>
            </div>
          </div>

        </div>

        {/* Drawer Footer */}
        <div className="px-6 py-3 bg-slate-50/80 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            完成评审查阅
          </button>
        </div>
      </div>
    </div>
  );
};
