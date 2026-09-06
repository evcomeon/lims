import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  PlusCircle, 
  X,
  ChevronRight,
  Sliders,
  Menu
} from 'lucide-react';
import { useLims } from '../context/LimsContext';

interface NavbarProps {
  onOpenPrdDrawer: () => void;
  onOpenNewOrderModal: () => void;
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenPrdDrawer, 
  onOpenNewOrderModal,
  onToggleSidebar 
}) => {
  const { 
    activeNode, 
    setActiveNode, 
    notifications, 
    markNotificationRead,
    openWorkflowTimeline,
    orders,
    nodeInfos
  } = useLims();

  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const currentNodeInfo = nodeInfos.find(n => n.id === activeNode);

  const handleSearch = (val: string) => {
    setSearchTerm(val);
    if (!val.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }
    const q = val.trim().toLowerCase();
    const results = orders.filter(o => 
      o.orderCode.toLowerCase().includes(q) || 
      o.clientName.toLowerCase().includes(q) ||
      (o.report?.reportCode && o.report.reportCode.toLowerCase().includes(q)) ||
      o.samples.some(s => s.sampleCode.toLowerCase().includes(q) || s.sampleName.toLowerCase().includes(q))
    );
    setSearchResults(results);
    setShowSearchDropdown(true);
  };

  return (
    <header className="mb-6 lg:mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: View Title & Subtitle + Mobile menu toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg lg:hidden transition-colors"
            title="展开菜单"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {currentNodeInfo ? (
                <span className="flex items-center gap-2">
                  <span className="text-indigo-600 font-mono">{currentNodeInfo.code}</span>
                  <span>{currentNodeInfo.name}</span>
                </span>
              ) : (
                'LIMS 检验检测工作流'
              )}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {currentNodeInfo ? (
                <span>{currentNodeInfo.description}</span>
              ) : (
                '业务全过程线上化、标准化和可追溯看板'
              )}
            </p>
          </div>
        </div>

        {/* Right: Global Search & Action Buttons matching Sleek Interface */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap sm:flex-nowrap">
          
          {/* Global Search Bar */}
          <div className="relative flex-1 sm:w-64 md:w-72">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="input-global-search"
                type="text"
                placeholder="搜索单号 / 报告 / 客户..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => { if (searchResults.length > 0) setShowSearchDropdown(true); }}
                className="w-full pl-8 pr-7 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs transition-all placeholder:text-slate-400"
              />
              {searchTerm && (
                <button 
                  onClick={() => { setSearchTerm(''); setSearchResults([]); setShowSearchDropdown(false); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Dropdown Results */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden py-1 max-h-80 overflow-y-auto">
                <div className="px-3 py-1.5 text-[11px] font-medium text-slate-400 border-b border-slate-100">
                  找到 {searchResults.length} 条业务记录
                </div>
                {searchResults.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => {
                      openWorkflowTimeline(item.orderCode);
                      setShowSearchDropdown(false);
                    }}
                    className="px-3 py-2 hover:bg-indigo-50/50 cursor-pointer border-b border-slate-50 last:border-0 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        <span className="font-mono text-indigo-700">{item.orderCode}</span>
                        {item.report?.reportCode && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-mono">
                            {item.report.reportCode}
                          </span>
                        )}
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700">
                          {item.currentStep}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[180px]">{item.clientName}</div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Button */}
          <div className="relative">
            <button
              id="btn-nav-notifications"
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors relative"
              title="工作流消息提醒"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse"></span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden text-xs">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">工作流提醒与消息中心</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 font-medium">
                        {unreadCount} 未读
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">PRD 节点二十</span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-slate-400">暂无提醒消息</div>
                  ) : (
                    notifications.map(item => (
                      <div 
                        key={item.id} 
                        onClick={() => {
                          markNotificationRead(item.id);
                          if (item.nodeId) setActiveNode(item.nodeId);
                          setShowNotifications(false);
                        }}
                        className={`p-3 hover:bg-slate-50 cursor-pointer transition-colors ${!item.read ? 'bg-indigo-50/40' : ''}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={`font-semibold ${!item.read ? 'text-indigo-900' : 'text-slate-800'}`}>
                            {item.title}
                          </span>
                          <span className="text-[10px] text-slate-400">{item.time}</span>
                        </div>
                        <p className="text-slate-600 mt-1 line-clamp-2 leading-relaxed text-[11px]">
                          {item.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 text-center">
                  <button
                    onClick={() => {
                      notifications.forEach(n => markNotificationRead(n.id));
                      setShowNotifications(false);
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    全部标为已读
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* PRD Review & Settings Button */}
          <button
            id="btn-open-prd-review"
            onClick={onOpenPrdDrawer}
            className="px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm font-medium text-slate-600 shadow-2xs hover:bg-slate-50 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span>PRD 待确认项</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          </button>

          {/* New Order Trigger */}
          <button
            id="btn-nav-new-order"
            onClick={onOpenNewOrderModal}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs sm:text-sm font-medium shadow-md shadow-indigo-200/70 hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>新建委托单</span>
          </button>

        </div>

      </div>
    </header>
  );
};
