/* ============================================================
 * iLIS 试验检测管理信息系统 · 检测流程测试站
 * 应用外壳：顶部导航 + 多页签栏 + 左侧菜单 + 内容区 + 弹窗 + Toast
 * 移植自 lims-test-app.html 主体框架。
 * ============================================================ */
import React from 'react';
import { LimsProvider } from './context/LimsContext';
import { Topbar } from './components/Topbar';
import { Tabsbar } from './components/Tabsbar';
import { Sidebar } from './components/Sidebar';
import { Content } from './components/Content';
import { ModalHost } from './components/ModalHost';
import { ToastHost } from './components/ToastHost';

const App: React.FC = () => {
  return (
    <LimsProvider>
      <div className="app">
        <Topbar />
        <Tabsbar />
        <div className="main-wrap">
          <Sidebar />
          <Content />
        </div>
      </div>
      <ToastHost />
      <ModalHost />
    </LimsProvider>
  );
};

export default App;
