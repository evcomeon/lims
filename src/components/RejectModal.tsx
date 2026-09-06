import React, { useState } from 'react';
import { AlertTriangle, X, CornerDownLeft } from 'lucide-react';
import { useLims } from '../context/LimsContext';

export const RejectModal: React.FC = () => {
  const { rejectModalState, closeRejectModal, confirmReject, prdIssues } = useLims();
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!rejectModalState.isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMsg('退回原因属于审计合规必填项，请输入具体的退回理由或修改意见！');
      return;
    }
    setErrorMsg('');
    confirmReject(reason.trim());
    setReason('');
  };

  const targetNodeText = prdIssues.rejectToNode === 'PREVIOUS' 
    ? '退回至上一流程节点' 
    : '退回至试验检测节点 (重新试验/修正原始数据)';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        id="modal-reject-confirm"
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="px-6 py-4 bg-rose-50/70 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-900">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-base">{rejectModalState.title || '退回确认'}</h3>
          </div>
          <button 
            onClick={closeRejectModal}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
            <span>流转目标：</span>
            <span className="font-semibold text-rose-700">{targetNodeText}</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              退回原因说明 <span className="text-rose-500">* (必填)</span>
            </label>
            <textarea
              id="input-reject-reason"
              rows={4}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="请明确指出试验数据、计算公式、结论或格式存在的问题（如：2#试块破坏荷载异常偏离，请复核加荷速率与试块尺寸...）"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-slate-400"
            />
            {errorMsg && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errorMsg}</p>
            )}
          </div>

          <div className="text-[11px] text-slate-400 leading-relaxed">
            * 依照 PRD 节点十八规范：退回操作将在系统全生命周期追溯记录中永久归档（记录操作人、精确时间戳及完整驳回理由）。
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={closeRejectModal}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              id="btn-confirm-reject"
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CornerDownLeft className="w-3.5 h-3.5" />
              确认退回
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
