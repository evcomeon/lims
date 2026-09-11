/* 内容路由：按当前页签 page 字段渲染对应页面
 * 已实现页：home/entrusts/entrustNew/entrustDetail/fees/assign/work/review/
 *           reports/approve/print/issue/trace/audit/master
 * 其他：统一走 Placeholder 占位 */
import React from 'react';
import { useLims } from '../context/LimsContext';
import { Placeholder } from '../pages/Placeholder';

/* 已实现页面（P1/P2/P3 完成后逐步替换） */
import { HomePage } from '../pages/HomePage';
import { AuditPage } from '../pages/AuditPage';
import { EntrustsPage } from '../pages/EntrustsPage';
import { AssignPage } from '../pages/AssignPage';
import { WorkPage } from '../pages/WorkPage';
import { ReportsPage } from '../pages/ReportsPage';
import { FeesPage } from '../pages/FeesPage';
import { ReviewPage } from '../pages/ReviewPage';
import { MasterPage } from '../pages/MasterPage';
import { EntrustNewPage } from '../pages/EntrustNewPage';
import { EntrustDetailPage } from '../pages/EntrustDetailPage';
import { TaskDetailPage } from '../pages/TaskDetailPage';
import { ReportDetailPage } from '../pages/ReportDetailPage';
import { TracePage } from '../pages/TracePage';

/* 报告子页（委托 PAGES.reports(status) 的固定过滤） */
const ApprovePage: React.FC<any> = (p) => <ReportsPage {...p} statusFilter="待批准" />;
const PrintPage: React.FC<any> = (p) => <ReportsPage {...p} statusFilter="已批准" />;
const IssuePage: React.FC<any> = (p) => <ReportsPage {...p} statusFilter="已打印" />;
const ReportRevPage: React.FC<any> = (p) => <ReportsPage {...p} statusFilter="编制中" />;

const REGISTRY: Record<string, React.FC<any>> = {
  home: HomePage,
  audit: AuditPage,
  entrusts: EntrustsPage,
  assign: AssignPage,
  work: WorkPage,
  reports: ReportsPage,
  fees: FeesPage,
  review: ReviewPage,
  master: MasterPage,
  entrustNew: EntrustNewPage,
  entrustDetail: EntrustDetailPage,
  taskDetail: TaskDetailPage,
  reportDetail: ReportDetailPage,
  trace: TracePage,
  approve: ApprovePage,
  print: PrintPage,
  issue: IssuePage,
  reportRev: ReportRevPage,
};

export const Content: React.FC = () => {
  const { activeTab } = useLims();
  const tab = activeTab();
  const Page = REGISTRY[tab.page];
  return (
    <div className="content">
      {Page ? <Page arg={tab.arg} /> : <Placeholder pageKey={tab.page} title={tab.title} />}
    </div>
  );
};
