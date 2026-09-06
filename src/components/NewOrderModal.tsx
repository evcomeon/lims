import React, { useState } from 'react';
import { X, Plus, Trash2, Building, User, Phone, FileText, Check } from 'lucide-react';
import { useLims } from '../context/LimsContext';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({ isOpen, onClose }) => {
  const { createOrder, setActiveNode } = useLims();

  const [clientName, setClientName] = useState('中交路桥华东建设工程有限公司');
  const [contactPerson, setContactPerson] = useState('周经理');
  const [contactPhone, setContactPhone] = useState('13912345678');
  const [projectTitle, setProjectTitle] = useState('金鸡湖隧道西岸主体结构工程');
  const [testType, setTestType] = useState('见证取样检验');
  
  // Sample info
  const [sampleName, setSampleName] = useState('混凝土立方体试块');
  const [specModel, setSpecModel] = useState('150×150×150 mm (C35)');
  const [quantity, setQuantity] = useState(3);

  // Test project
  const [projectName, setProjectName] = useState('混凝土抗压强度试验');
  const [testStandard, setTestStandard] = useState('GB/T 50081-2019');
  const [unitPrice, setUnitPrice] = useState(600);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const totalAmount = unitPrice * quantity;

    createOrder({
      clientName,
      contactPerson,
      contactPhone,
      projectTitle,
      testType,
      receivableAmount: totalAmount,
      samples: [
        {
          id: `s-${Date.now()}`,
          sampleCode: `S${Math.floor(100 + Math.random() * 900)}`,
          sampleName,
          specModel,
          quantity,
          unit: '组',
          status: '待收样',
        }
      ],
      testProjects: [
        {
          id: `tp-${Date.now()}`,
          projectName,
          testStandard,
          unitPrice,
          quantity,
          totalAmount,
        }
      ],
    });

    setActiveNode('sample_receiving');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div 
        id="modal-new-commission"
        className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-6"
      >
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">新增客户委托单</h3>
              <p className="text-xs text-slate-500">发起新的检验检测任务主线 (PRD 节点一)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Section 1: Client & Project */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-indigo-600" />
              委托单位与工程项目
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">委托单位名称 *</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">工程项目名称 *</label>
                <input
                  type="text"
                  required
                  value={projectTitle}
                  onChange={e => setProjectTitle(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">联系人姓名</label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={e => setContactPerson(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">联系电话</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Sample Info */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              送检样品规格
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">样品名称 *</label>
                <input
                  type="text"
                  required
                  value={sampleName}
                  onChange={e => setSampleName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">规格型号 / 等级</label>
                <input
                  type="text"
                  value={specModel}
                  onChange={e => setSpecModel(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">样品数量 (组)</label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Test Project & Cost */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-indigo-600" />
              检测项目与收费标准
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">检测项目名称</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">检测遵循标准</label>
                <input
                  type="text"
                  value={testStandard}
                  onChange={e => setTestStandard(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">单价 (元/组)</label>
                <input
                  type="number"
                  value={unitPrice}
                  onChange={e => setUnitPrice(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between font-medium">
              <span className="text-slate-600">测算应收总额：</span>
              <span className="text-sm font-bold text-indigo-700">¥{(unitPrice * quantity).toLocaleString()} 元</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              取消
            </button>
            <button
              id="btn-submit-new-order"
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md shadow-indigo-100 transition-colors"
            >
              创建并进入【委托收样】
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
