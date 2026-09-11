# iLIS UI 1:1 复刻实施计划

## Context（背景与目标）

当前 `lims` 项目（React 19 + Vite 6 + Tailwind v4）的 UI 是一套自研的"9 节点工作流"设计（靛蓝主题、左侧栏+顶部 Navbar+页脚、`LimsContext` 驱动的 9 个 Node 视图）。用户要求**完全 1:1 复刻**参考项目 `ilis-workflow-sim/lims-test-app.html` 的 UI 到本 React 项目。

**已确认的范围与决策（来自用户）：**
- **参考源**：以 `lims-test-app.html`（2493 行，内嵌 CSS+JS 的单文件 SPA）为唯一蓝本。
- **布局**：重构为 iLIS 布局外壳（顶部 56px 深蓝渐变导航 + 38px 多页签栏 + 224px 动态左侧菜单 + 白底内容区）。
- **数据/交互**：采用参考的模拟数据与交互（页签开关、菜单切换、子 Tab 过滤、模态框、Toast），重建视图，追求像素级 1:1。
- **范围解读**（用户在范围项选了"Other"）：完整复刻 `lims-test-app.html` 的全部内容——**15 个已实现页面组件 + 57 个左侧菜单模块（其中 45 个为 🚧 占位页）+ 全部模拟数据 + 22 个业务动作 + 全部交互**。这比"约 11 个页签"广（含占位页与详情/新增页），比"50+ 模块全量规范"窄（仅复刻 HTML 中实际存在的，HTML 未实现的以占位页呈现）。

**预期结果**：`npm run dev` 后，浏览器中看到的 React 应用与直接打开 `lims-test-app.html` 视觉、结构、交互一致。

---

## 总体方案

1. **CSS 原样移植**：把参考 HTML `<style>` 块（约 1-405 行）原样作为普通 CSS 追加到 `src/index.css`，**保留原类名**（`.topbar/.tabsbar/.tab/.side/.menu-item/.btn/.tbl/.stc-*/.kpi.*/.modal/.toast/...`）。JSX 直接使用这些类名，确保像素级保真。需处理 Tailwind Preflight 冲突。
2. **Context 整体重写**：现有 `LimsContext`（9 节点 PRD 模型）与新域模型（14 实体 `db` + 多页签 SPA + 命令式 modal/toast）不兼容，整体替换。
3. **外壳重写**：`App.tsx` 重构为 `<LimsProvider><div class="app"><Topbar/><Tabsbar/><div class="main-wrap"><Sidebar/><Content/></div><ModalMount/><ToastMount/></div>`。
4. **页面组件化**：15 个页面组件，由 `Content` 根据 `activeTab.page` 路由分发。
5. **数据/动作移植**：`db` 数据模型 + `TEMPLATES`/`COMPUTE` + 22 个业务动作 + 工具函数，从 JS 原样译为 TypeScript。

---

## 目标文件结构

### 新增文件
- `src/index.css` 修改：保留 `@import "tailwindcss"`，追加移植的 iLIS CSS 块（原类名）+ `@layer base` 对 `button/table/input` 的 Preflight 覆盖。
- `src/data/db.ts`：`Db` 类型 + `seed()` + `loadOrInit()`（localStorage key `lims-test-db-v2`）+ `COLLS` + 访问助手（`get/samplesOf/paramsOf/tasksOf/recordOfTask/stepsOf/activeResult/reportOf/printOf/issueOf/feeOf/clientName/projName/senderName/sampleStatus/refreshEntrust/addLog/logsOf`）+ 工具（`nid/pad/NOW/TODAY/addDays/fmtMoney/esc/round1/inputVal`）。
- `src/data/templates.ts`：`TEMPLATES`（conc/steel/bend/pile，各含 `buildSteps`）+ `COMPUTE`（`computeConc/steel/bend/pile`）+ `seqInputs`。
- `src/data/menu.ts`：`TOPMENU`（7 项）+ `SIDEGROUPS`（57 模块）+ `findItemByPage` + `PLACEHOLDER_FIELDS` 字典 + `inferFields` + 常量（`USERS/TESTERS/DEPTS/INSTR/PAY_WAYS/ISSUE_WAYS/ST`）。
- `src/context/LimsContext.tsx` 重写：`db` 单一 state atom（`useEffect` 持久化）+ `curUser/tabs/activeKey/currentTopKey` + 命令式 `modal/toasts` + 22 个业务动作 + 页签动作（`openTab/closeTab/switchTab/switchTop/openTabKey/openHome`）+ `switchUser/resetData`。页内状态（`FEE_TAB/ASG_FILTER/WB_FILTER/AUDIT_USER/TRACE_SEL/NEWE`）留在各页面组件本地 `useState`。
- `src/components/shell/Topbar.tsx`：品牌+7 顶部菜单+搜索框+操作人下拉+重置按钮。
- `src/components/shell/Tabsbar.tsx`：页签列表（首页 pinned 无 X，其余可关），关闭逻辑：右→左→home。
- `src/components/shell/Sidebar.tsx`：按 `currentTopKey` 渲染 `SIDEGROUPS`，分组（业务/主数据/统计/配置/数据/系统），active 高亮，cnt 角标，impl:false 显示"规划中"。
- `src/components/shell/Content.tsx`：读 `activeTab`，按 `page` 路由到对应页面组件。
- `src/components/shell/Modal.tsx` + `Toast.tsx`：受控渲染 `modal`/`toasts` state。
- `src/pages/`：15 个组件（见下"页面清单与构建顺序"）。

### 删除文件
- `src/components/{Navbar,Sidebar,NewOrderModal,WorkflowTimelineModal,RejectModal,PrdReviewDrawer}.tsx`
- `src/views/{WorkflowHome,Node1SampleReceiving,Node2FeeCollection,Node3TaskAssignment,Node4Testing,Node5Review,Node6ReportAudit,Node7ReportApproval,Node8ReportPrint,Node9ReportDelivery}.tsx`
- `src/types.ts`（`CommissionOrder` 模型）、`src/mockData.ts`（`INITIAL_*`）

### 保留
- `package.json`、`vite.config.ts`、`tsconfig`、`src/main.tsx`、`lucide-react`/`motion` 依赖。

---

## 页面清单与构建顺序（15 个，由易到难）

| # | 组件 | 参考行 | 要点 |
|---|---|---|---|
| 1 | `Audit` | 2393-2409 | 只读审计日志表，`AUDIT_USER` 过滤 |
| 2 | `Entrusts` | 1824-1850 | 委托列表，`openTab(entrustDetail)`、新增委托入口 |
| 3 | `Assign` | 1977-2005 | 任务分配，`ASG_FILTER`（待/已/全部），`uiAssign` 弹窗 |
| 4 | `Work` | 2010-2043 | 试验任务，`WB_TABS`（7 项），超期红色 alert-bar |
| 5 | `Reports` | 2173-2208 | **参数化**：`statusFilter` prop。approve/print/issue/reportRev 都路由到此组件传不同 filter |
| 6 | `EntrustNew` | 1906-1911+1211-1294 | 新增委托表单，级联下拉+样品子表+`uiSaveEntrust` |
| 7 | `Fees` | 1856-1903 | `FEE_TABS`（5 项）+ 4 KPI + 角色门控的结算/退费 4 流程 |
| 8 | `Master` | 2412-2476 | 委托单位/工程项目/送样人三表 + `uiAddMaster` 三种模态 |
| 9 | `Review` | 2116-2170 | 三张表（待复核结果/报告审批/不合格台账）+ 四眼原则门控 |
| 10 | `Home` | 1738-1821 | 流程图 8 节点+角标、8 KPI、龄期预警、示例案例卡片 |
| 11 | `Trace` | 2341-2385+2281-2340 | 实体选择器+上下游追溯 chip 带（递归 walk+去重，纯读） |
| 12 | `EntrustDetail` | 1914-1969 | kv 表+父子树（样品→参数→任务→记录→步骤→结果）+审计日志 |
| 13 | `ReportDetail` | 2216-2278 | flowline+报告汇总+三级签字 sign-grid+3 个内联 SVG+状态门控动作 |
| 14 | `TaskDetail` | 2046-2113 | 步骤列表+结果卡+`uiExecStep`（顺序锁+计算预览模态）+`uiGenResult` |
| 15 | `Placeholder` | 1081-1126 | `renderModulePlaceholder`：ph-head/ph-grid（父/子/关联）/规划字段/ph-note |

**参考不一致处理**：`reportRev` 在 `SIDEGROUPS.bao` 标 `impl:false`，但 `PAGES.reportRev` 存在（委托 `reports('编制中')`）。React 中视为 impl:true，打开 `Reports` 传 `statusFilter='编制中'`，代码注释标注。

---

## 关键技术决策

1. **CSS 移植 + Preflight**：`@import "tailwindcss"` 后追加 iLIS CSS 块；用 `@layer base` 覆盖 Preflight 对 `button`（恢复边框/背景）、`table`（恢复边框）、`input`、`h1-h6` 的重置，避免 `.btn/.tbl/.modal` 视觉漂移。先做这一步并验证一个页面渲染正确，再铺开。
2. **原子化状态更新**：所有 22 个业务动作用**单次** `setDb(prev => { const next = structuredClone(prev); /* 原地 mutate */ ; return next; })`，`useEffect([db])` 持久化。`uiReview`（通过分支同时建 report+print+issue 并改 5 实体）、`uiSaveEntrust`+`addSampleToEntrust`（一次建 entrust+samples+params+tasks+records+steps+fee）必须原子，避免撕裂态。
3. **命令式 modal → 受控 React modal**：`ModalState = { title, body: ReactNode, buttons: {text, cls, onClick}[], wide }`。`uiExecStep` 动态生成 `st.inputs.length` 个输入框 → 用表单 state hook 替代 `mval('mi_i')`。计算步骤预览（inputs.length===0）→ `COMPUTE[rc.tmpl](steps)` 渲染结果项到 modal body，确认后置步骤完成。
4. **行用 React `.map` 而非 HTML 字符串**：消灭 `onclick="uiAssign('TK1')"` 转义 bug 类。每个表格行作为 React 元素，`onClick={() => uiAssign(t.id)}`。
5. **内联 SVG 属性转 camelCase**：`stroke-width→strokeWidth`、`font-size→fontSize`、`text-anchor→textAnchor` 等（`uiSign` 与 `reportDetail` 的 CMA 章/检测专用章/骑缝章 SVG）。
6. **角色门控再渲染**：`curUser` 放 context state，`switchUser` 触发所有消费组件自动重渲染；6 个动作检查角色（`uiExecStep`=检测员、`uiReview`=非检测员、`uiApprove`=授权签字人、`uiSettle/Refund*`=检测主管）。
7. **页内过滤状态**：`FEE_TAB/ASG_FILTER/WB_FILTER/AUDIT_USER/TRACE_SEL/NEWE` 留页面本地 `useState`（参考是模块级 var 跨页签持久；接受页签关闭后重置的小差异，不引入额外复杂度）。
8. **不移植**：参考把 `GO0..GO7` 挂 `window` 给首页流程图点击——改用 React 闭包 `onClick`。
9. **时间 mock**：`TODAY()` 返回硬编码 `'2026-09-08'`，`NOW()` 返回该日期+真实时分，`addDays` 用 UTC 构造避免时区漂移。原样移植，保证 `ageDue=2026-10-01` 等业务时钟一致。

---

## 实施阶段

1. **P0 基线**：移植 CSS 到 `index.css` + Preflight 覆盖；建 `data/db.ts`/`templates.ts`/`menu.ts`；重写 `LimsContext`（数据/页签/会话 + 持久化）；重写 `App.tsx` 外壳 + `Topbar/Tabsbar/Sidebar/Content/Modal/Toast`。验证：能渲染首页空壳、菜单切换、页签开关、重置数据。
2. **P1 简单页**：Audit、Entrusts、Assign、Work、Reports、Placeholder。验证列表/子 Tab/占位页渲染。
3. **P2 中等页**：EntrustNew、Fees、Master、Review、Home。验证表单、结算/退费、主数据新增、复核流程、首页看板。
4. **P3 复杂页**：Trace、EntrustDetail、ReportDetail、TaskDetail。验证追溯、父子树、签字盖章 SVG、步骤顺序锁+结果生成。
5. **P4 收尾**：删除旧文件；全链路走查（委托→分配→检测→复核→批准→签章→打印→发放→归档）；像素比对 QA 截图。

---

## 验证方式

1. `npm run dev`（端口 3000）启动，无 TS/lint 报错（`npm run lint` = `tsc --noEmit`）。
2. 与参考并排比对：浏览器开 `file:///Users/yiwei/Downloads/ilis-workflow-sim/ilis-workflow-sim/lims-test-app.html` 与 `http://localhost:3000`，逐页核对：
   - 顶部导航、页签栏、左侧菜单结构、内容区布局、配色、字体、表格斑马纹、按钮样式。
   - 7 顶部菜单切换 → 左侧菜单动态变化（57 模块分组渲染、角标、"规划中"标记）。
   - 首页流程图 8 节点角标、8 KPI、龄期预警。
   - 全业务链：新增委托 → 任务分配 → 试验检测（执行步骤+生成结果）→ 复核（通过建报告初稿/退回重检测）→ 报告批准/签章/打印/发放 → 资料归档；角色切换（周敏=检测主管、各检测员、孙授权=授权签字人）门控生效。
   - 页签开关（首页不可关、关闭当前页签智能切换）、重置示例数据、Toast、模态框。
3. 比对参考目录下 QA 截图（`_qa_shot_*.png`）做像素级抽查。
4. localStorage key `lims-test-db-v2` 持久化生效；刷新后状态保留（参考 `init()` 每次重置 TABS=[home]，业务数据保留）。
