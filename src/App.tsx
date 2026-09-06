import React, { useState } from 'react';
import { LimsProvider, useLims } from './context/LimsContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { WorkflowTimelineModal } from './components/WorkflowTimelineModal';
import { RejectModal } from './components/RejectModal';
import { PrdReviewDrawer } from './components/PrdReviewDrawer';
import { NewOrderModal } from './components/NewOrderModal';

// 9 Node Views
import { WorkflowHome } from './views/WorkflowHome';
import { Node1SampleReceiving } from './views/Node1SampleReceiving';
import { Node2FeeCollection } from './views/Node2FeeCollection';
import { Node3TaskAssignment } from './views/Node3TaskAssignment';
import { Node4Testing } from './views/Node4Testing';
import { Node5Review } from './views/Node5Review';
import { Node6ReportAudit } from './views/Node6ReportAudit';
import { Node7ReportApproval } from './views/Node7ReportApproval';
import { Node8ReportPrint } from './views/Node8ReportPrint';
import { Node9ReportDelivery } from './views/Node9ReportDelivery';

const MainContent: React.FC = () => {
  const { activeNode } = useLims();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPrdDrawerOpen, setIsPrdDrawerOpen] = useState(false);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeNode) {
      case 'sample_receiving':
        return <Node1SampleReceiving onOpenNewOrderModal={() => setIsNewOrderModalOpen(true)} />;
      case 'fee_collection':
        return <Node2FeeCollection />;
      case 'task_assignment':
        return <Node3TaskAssignment />;
      case 'testing':
        return <Node4Testing />;
      case 'review':
        return <Node5Review />;
      case 'report_audit':
        return <Node6ReportAudit />;
      case 'report_approval':
        return <Node7ReportApproval />;
      case 'report_print':
        return <Node8ReportPrint />;
      case 'report_delivery':
        return <Node9ReportDelivery />;
      default:
        return <WorkflowHome onOpenPrdDrawer={() => setIsPrdDrawerOpen(true)} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-800 font-sans selection:bg-indigo-600 selection:text-white overflow-hidden">
      {/* Sleek Sidebar (PRD 9 Nodes Navigation & Role Management) */}
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenPrdDrawer={() => setIsPrdDrawerOpen(true)}
      />

      {/* Main Workspace Area - Independent Scroll Container */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto overflow-x-hidden">
        
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex flex-col">
          {/* Header with Search & Quick Actions */}
          <Navbar 
            onOpenPrdDrawer={() => setIsPrdDrawerOpen(true)}
            onOpenNewOrderModal={() => setIsNewOrderModalOpen(true)}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />

          {/* Active View */}
          <div className="flex-1">
            {renderActiveView()}
          </div>

          {/* Sleek Interface Footer with Status Legend */}
          <footer className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span>积压 (待处理 &gt; 1000)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <span>关注 (待处理 &gt; 100)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                <span>正常状态</span>
              </div>
            </div>

            <div className="text-right text-[11px]">
              文档版本：PRD V1.0 | 9 节点检验检测全生命周期可追溯系统
            </div>
          </footer>
        </div>

      </main>

      {/* Global Modals & Drawers */}
      <WorkflowTimelineModal />
      <RejectModal />
      <PrdReviewDrawer 
        isOpen={isPrdDrawerOpen} 
        onClose={() => setIsPrdDrawerOpen(false)} 
      />
      <NewOrderModal 
        isOpen={isNewOrderModalOpen} 
        onClose={() => setIsNewOrderModalOpen(false)} 
      />
    </div>
  );
};

export default function App() {
  return (
    <LimsProvider>
      <MainContent />
    </LimsProvider>
  );
}
