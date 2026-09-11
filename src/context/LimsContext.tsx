/* ============================================================
 * iLIS 全局状态上下文
 * 移植自 lims-test-app.html：db 原子 + 页签 + 弹窗 + Toast + 18 业务动作。
 * 弹窗表单组件以内联组件形式定义于本文件末尾，避免循环依赖。
 * ============================================================ */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  type Db, type Entrust, type Task, type Result, type Step, type Report, type Fee,
  type Sample, type Record as RecordE, type Param, type Client, type Project, type Sender,
  loadOrInit, save, get, byIdAny, tasksOf, recordOfTask,
  stepsOf, activeResult, reportOf, printOf, issueOf, feeOf,
  clientName, senderName, refreshEntrust, addLog,
  nid, NOW, TODAY, addDays, pad, fmtMoney, seed,
} from '../data/db';
import {
  TOPMENU, SIDEGROUPS, PLACEHOLDER_FIELDS, inferFields, USERS, TESTERS, DEPTS, INSTR,
  PAY_WAYS, ISSUE_WAYS, DEFAULT_USER, userByName, findItemByPage, findItemByKey, topKeyOfPage,
} from '../data/menu';
import { TEMPLATES, COMPUTE, type StepInput, type StepDef, type ResultItem, inputVal, type TemplateKey } from '../data/templates';

/* ================= 类型 ================= */
export type ToastType = 'info' | 'success' | 'error' | 'warn';
export interface ToastItem { id: number; msg: string; type: ToastType; }
export interface Tab { key: string; title: string; page: string; arg: string | null; }
export interface ModalConfig { title: string; body: React.ReactNode; wide?: boolean; }
export interface NewSampleDraft {
  name: string; spec: string; usage: string; appaType: string;
  qty: string; price: number; paramKeys: string[];
}
export interface NewEntrustDraft {
  clientId: string; projectId: string; senderId: string;
  testForm: string; sampleSource: string; payType: string; dept: string;
  cat: string; date: string; dateSend: string;
  dateReportStart: string; dateReportEnd: string; memo: string;
  samples: NewSampleDraft[];
}

interface LimsContextType {
  /* state */
  db: Db;
  curUser: string;
  setCurUser: (n: string) => void;
  tabs: Tab[];
  activeKey: string;
  currentTopKey: string;
  newE: NewEntrustDraft;
  setNewE: React.Dispatch<React.SetStateAction<NewEntrustDraft>>;
  modal: ModalConfig | null;
  toasts: ToastItem[];
  /* tabs */
  activeTab: () => Tab;
  openTab: (key: string, title: string, page: string, arg?: string | null) => void;
  closeTab: (key: string) => void;
  switchTab: (key: string) => void;
  switchTop: (topKey: string) => void;
  openTabKey: (itemKey: string) => void;
  openHome: () => void;
  /* modal & toast */
  openModal: (c: ModalConfig) => void;
  closeModal: () => void;
  toast: (msg: string, type?: ToastType) => void;
  dismissToast: (id: number) => void;
  /* db helpers */
  commit: (mutator: (draft: Db) => void) => void;
  refresh: () => void;
  resetData: () => void;
  /* 18 业务动作 */
  uiNewEntrust: () => void;
  uiAddSampleModal: () => void;
  uiSaveEntrust: () => void;
  uiAddSampleTo: (eid: string) => void;
  uiAssign: (taskId: string) => void;
  uiExecStep: (stepId: string) => void;
  uiGenResult: (taskId: string) => void;
  uiReview: (resultId: string) => void;
  uiSubmitReport: (rpId: string) => void;
  uiApprove: (rpId: string) => void;
  uiSign: (rpId: string) => void;
  uiPrint: (rpId: string) => void;
  uiIssue: (rpId: string) => void;
  uiSettle: (feeId: string) => void;
  uiRefundApply: (feeId: string) => void;
  uiRefundConfirm: (feeId: string) => void;
  uiRefundCancel: (feeId: string) => void;
  uiArchive: (eid: string) => void;
  uiAddMaster: (type: 'client' | 'project' | 'sender') => void;
}

const LimsContext = createContext<LimsContextType | undefined>(undefined);

let toastSeq = 0;

/* ================= 工具 ================= */
function cloneDb(db: Db): Db {
  if (typeof structuredClone === 'function') return structuredClone(db);
  return JSON.parse(JSON.stringify(db));
}

export function createEmptyNewE(): NewEntrustDraft {
  return {
    clientId: '', projectId: '', senderId: '',
    testForm: '初检', sampleSource: '现场抽样', payType: '延后付费', dept: '试验检测一室',
    cat: 'WT/GL', date: TODAY(), dateSend: TODAY(),
    dateReportStart: '', dateReportEnd: '', memo: '',
    samples: [],
  };
}

/* ================= Provider ================= */
export const LimsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<Db>(() => loadOrInit());
  const [curUser, setCurUser] = useState<string>(DEFAULT_USER);
  const [tabs, setTabs] = useState<Tab[]>([{ key: 'home', title: '首页', page: 'home', arg: null }]);
  const [activeKey, setActiveKey] = useState<string>('home');
  const [currentTopKey, setCurrentTopKey] = useState<string>('home');
  const [newE, setNewE] = useState<NewEntrustDraft>(() => createEmptyNewE());
  const [modal, setModal] = useState<ModalConfig | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => { save(db); }, [db]);

  /* -------- Toast -------- */
  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);
  const toast = useCallback((msg: string, type: ToastType = 'info') => {
    const id = ++toastSeq;
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3600);
  }, []);

  /* -------- Modal -------- */
  const openModal = useCallback((c: ModalConfig) => setModal(c), []);
  const closeModal = useCallback(() => setModal(null), []);

  /* -------- Tabs -------- */
  const activeTab = useCallback(() =>
    tabs.find(t => t.key === activeKey) || tabs[0] || { key: 'home', title: '首页', page: 'home', arg: null },
    [tabs, activeKey]);

  const openTab = useCallback((key: string, title: string, page: string, arg: string | null = null) => {
    setTabs(prev => {
      const existing = prev.find(t => t.key === key);
      if (existing) return prev.map(t => t.key === key ? { ...t, title, page, arg } : t);
      return [...prev, { key, title, page, arg }];
    });
    setActiveKey(key);
    /* 同步侧边栏顶部菜单到所开页签 */
    const tk = topKeyOfPage(page);
    if (tk) setCurrentTopKey(tk);
  }, []);

  const closeTab = useCallback((key: string) => {
    if (key === 'home') { toast('「首页」页签固定不可关闭', 'warn'); return; }
    setTabs(prev => {
      const idx = prev.findIndex(t => t.key === key);
      if (idx < 0) return prev;
      const next = [...prev];
      next.splice(idx, 1);
      return next;
    });
    setActiveKey(prevActive => {
      if (prevActive !== key) return prevActive;
      const remaining = tabs.filter(t => t.key !== key);
      const idx = tabs.findIndex(t => t.key === key);
      const fallback = remaining[Math.min(idx, remaining.length - 1)];
      const nextKey = fallback ? fallback.key : 'home';
      /* 同步侧边栏顶部菜单到新激活页签 */
      const nextTab = tabs.find(t => t.key === nextKey);
      if (nextTab) {
        const tk = topKeyOfPage(nextTab.page);
        if (tk) setCurrentTopKey(tk);
      }
      return nextKey;
    });
  }, [tabs, toast]);

  const switchTab = useCallback((key: string) => {
    setActiveKey(key);
    const tab = tabs.find(t => t.key === key);
    if (tab) {
      const tk = topKeyOfPage(tab.page);
      if (tk) setCurrentTopKey(tk);
    }
  }, [tabs]);

  const switchTop = useCallback((topKey: string) => {
    if (topKey === 'home') { setCurrentTopKey('home'); setActiveKey('home'); return; }
    setCurrentTopKey(topKey);
    const list = SIDEGROUPS[topKey] || [];
    const firstImpl = list.find(it => it.impl);
    const target = firstImpl || list[0];
    if (target) openTab(target.key, target.label, target.page, null);
  }, [openTab]);

  const openTabKey = useCallback((itemKey: string) => {
    const found = findItemByKey(itemKey);
    if (!found) return;
    setCurrentTopKey(found.topKey);
    openTab(found.item.key, found.item.label, found.item.page, null);
  }, [openTab]);

  const openHome = useCallback(() => {
    setCurrentTopKey('home');
    setActiveKey('home');
  }, []);

  /* -------- DB helpers -------- */
  const commit = useCallback((mutator: (draft: Db) => void) => {
    setDb(prev => {
      const draft = cloneDb(prev);
      mutator(draft);
      return draft;
    });
  }, []);
  const refresh = useCallback(() => setDb(prev => ({ ...prev })), []);
  const resetData = useCallback(() => {
    setDb(seed());
    setTabs([{ key: 'home', title: '首页', page: 'home', arg: null }]);
    setActiveKey('home');
    setCurrentTopKey('home');
    toast('已重置为初始模拟数据', 'info');
  }, [toast]);

  /* -------- 18 业务动作 -------- */
  /* 1. 新增委托：清空草稿并打开 entrustNew 页签 */
  const uiNewEntrust = useCallback(() => {
    setNewE(createEmptyNewE());
    openTab('newentrust', '新增委托单', 'entrustNew', null);
  }, [openTab]);

  /* 2. 添加样品（弹窗） */
  const uiAddSampleModal = useCallback(() => {
    openModal({ title: '添加样品', body: <AddSampleForm mode="new" /> });
  }, [openModal]);

  /* 3. 保存委托单 */
  const uiSaveEntrust = useCallback(() => {
    if (!newE.clientId || !newE.projectId || !newE.senderId) {
      toast('委托单位、工程项目、委托人均为必填（须从主数据选择）', 'error'); return;
    }
    if (!newE.samples.length) { toast('请至少添加一个样品', 'error'); return; }
    commit(draft => {
      const e: Entrust = {
        id: nid(draft, 'E'),
        no: newE.cat + '-2026-' + pad(draft.seq.entrust, 4),
        clientId: newE.clientId, projectId: newE.projectId, senderId: newE.senderId,
        testForm: newE.testForm, sampleSource: newE.sampleSource, payType: newE.payType,
        dept: newE.dept, domain: newE.cat === 'WT/GL' ? 'GL' : 'SY',
        dateEntrust: newE.date || TODAY(), dateSend: newE.dateSend || TODAY(),
        dateReportStart: newE.dateReportStart, dateReportEnd: newE.dateReportEnd,
        createdAt: NOW(), status: '已登记', archived: false,
      };
      draft.seq.entrust++;
      draft.entrusts.push(e);
      newE.samples.forEach(s => addSampleToEntrust(draft, e, s));
      draft.fees.push({
        id: nid(draft, 'FE'), no: 'F-2026-' + pad(draft.seq.fee++, 4),
        entrustId: e.id, clientId: e.clientId,
        amount: newE.samples.reduce((a, s) => a + (s.price || 0), 0),
        paid: 0, payType: e.payType, status: '未结算', mark: '正',
      });
      refreshEntrust(draft, e);
      addLog(draft, curUser, '新增委托单', e.id, e.no,
        newE.samples.length + '个样品，自动生成检测任务（待分配）与应收费用');
      // 关闭新增委托页签并打开详情页签
      setTimeout(() => {
        setTabs(prev => prev.filter(t => t.key !== 'newentrust'));
        openTab('entrust:' + e.id, e.no + ' 委托详情', 'entrustDetail', e.id);
      }, 0);
    });
    toast('委托单保存成功，已生成检测任务（待分配）', 'success');
  }, [newE, commit, curUser, toast, openTab]);

  /* 4. 给已有委托追加样品 */
  const uiAddSampleTo = useCallback((eid: string) => {
    openModal({ title: '添加样品（挂到委托单下）', body: <AddSampleForm mode="append" eid={eid} /> });
  }, [openModal]);

  /* 5. 任务分配 */
  const uiAssign = useCallback((taskId: string) => {
    const t = get<Task>(db, 'tasks', taskId);
    if (!t || t.status !== '待分配') { toast('该任务不是「待分配」状态', 'error'); return; }
    openModal({ title: '分配任务 · ' + t.no, body: <AssignForm taskId={taskId} /> });
  }, [db, openModal, toast]);

  /* 6. 执行检测步骤 */
  const uiExecStep = useCallback((stepId: string) => {
    const st = byIdAny(db, stepId) as Step | null;
    if (!st) return;
    const rc = get<RecordE>(db, 'records', st.recordId);
    if (!rc) return;
    const tk = get<Task>(db, 'tasks', rc.taskId);
    if (!tk) return;
    if (tk.status === '待分配') { toast('请先分配任务（任务分配 → 分配）', 'error'); return; }
    if (tk.status === '待复核') { toast('该记录已提交复核，不能直接修改（如需修改请由复核员驳回）', 'error'); return; }
    if (['报告审批中', '已完成'].indexOf(tk.status) >= 0) { toast('该任务已完成检测流程，数据已锁定', 'error'); return; }
    if (!tk.tester || tk.tester !== curUser) {
      toast('当前操作人「' + curUser + '」不是该任务检测员「' + (tk.tester || '未分配') + '」，请在右上角切换操作人', 'error'); return;
    }
    const steps = stepsOf(db, rc.id);
    const idx = steps.findIndex(s => s.id === stepId);
    if (idx > 0 && steps[idx - 1].status !== '已完成') {
      toast('顺序依赖：请先完成「' + steps[idx - 1].name + '」', 'error'); return;
    }
    openModal({ title: '执行步骤 ' + st.seq + ' · ' + st.name, body: <ExecStepForm stepId={stepId} /> });
  }, [db, curUser, openModal, toast]);

  /* 7. 生成检测结果 */
  const uiGenResult = useCallback((taskId: string) => {
    const tk = get<Task>(db, 'tasks', taskId);
    if (!tk) return;
    const rc = recordOfTask(db, tk.id);
    if (!rc) return;
    if (tk.status === '待分配') { toast('请先分配任务', 'error'); return; }
    if (!tk.tester || tk.tester !== curUser) {
      toast('当前操作人「' + curUser + '」不是该任务检测员「' + tk.tester + '」，请切换操作人', 'error'); return;
    }
    const steps = stepsOf(db, rc.id);
    if (!steps.length || !steps.every(s => s.status === '已完成')) {
      toast('原始记录尚有未完成的检测步骤，不能生成结果', 'error'); return;
    }
    for (const s of steps) {
      for (const inp of s.inputs) {
        if (inputVal(inp) === '') { toast('步骤' + s.seq + '「' + s.name + '」读数缺失', 'error'); return; }
      }
    }
    if (activeResult(db, rc.id)) {
      toast('该记录已有生效检测结果（' + activeResult(db, rc.id)!.status + '），不能重复生成', 'error'); return;
    }
    const comp = COMPUTE[rc.tmpl as TemplateKey](steps);
    commit(draft => {
      const dtk = get<Task>(draft, 'tasks', taskId)!;
      const drc = get<RecordE>(draft, 'records', rc.id)!;
      const res: Result = {
        id: nid(draft, 'RS'), recordId: rc.id, taskId: tk.id,
        items: comp.items, conclusion: comp.conclusion, note: comp.note,
        status: '待复核', tester: curUser, genTime: NOW(),
        reviewer: '', reviewTime: '', failLedger: comp.conclusion !== '合格',
      };
      draft.results.push(res);
      drc.status = '待复核'; dtk.status = '待复核';
      const sp = get<Sample>(draft, 'samples', tk.sampleId);
      if (sp) sp.status = '待复核';
      const e = get<Entrust>(draft, 'entrusts', tk.entrustId);
      if (e) refreshEntrust(draft, e);
      addLog(draft, curUser, '生成检测结果', res.id, '检测结果（' + tk.no + '）',
        comp.conclusion === '合格' ? '结论合格，提交复核' : '结论不合格，进入不合格台账，提交复核');
    });
    if (comp.conclusion === '合格') toast('检测结果已生成（合格），已提交复核', 'success');
    else toast('检测结果为「不合格」，已红色标记并进入不合格台账', 'error');
  }, [db, curUser, commit, toast]);

  /* 8. 试验复核 */
  const uiReview = useCallback((resultId: string) => {
    const res = byIdAny(db, resultId) as Result | null;
    if (!res) return;
    if (res.status !== '待复核') { toast('该结果当前状态为「' + res.status + '」，不可复核', 'error'); return; }
    const tk = get<Task>(db, 'tasks', res.taskId);
    if (tk && tk.tester === curUser) {
      toast('四眼原则阻断：复核人（' + curUser + '）不能是检测员本人（' + tk.tester + '），请切换操作人', 'error'); return;
    }
    openModal({ title: '试验复核 · ' + (tk ? tk.no : ''), body: <ReviewForm resultId={resultId} /> });
  }, [db, curUser, openModal, toast]);

  /* 9. 提交报告审批 */
  const uiSubmitReport = useCallback((rpId: string) => {
    const rp = byIdAny(db, rpId) as Report | null;
    if (!rp) return;
    if (rp.status !== '编制中') { toast('报告当前状态「' + rp.status + '」不可提交', 'error'); return; }
    const ts = tasksOf(db, rp.entrustId);
    for (const t of ts) {
      const rc = recordOfTask(db, t.id);
      const res = rc ? activeResult(db, rc.id) : null;
      if (!res) { toast('任务 ' + t.no + ' 尚未生成检测结果，不能提交报告', 'error'); return; }
      if (res.status !== '复核通过') { toast('任务 ' + t.no + ' 的结果尚未复核通过，不能提交报告', 'error'); return; }
    }
    commit(draft => {
      const drp = get<Report>(draft, 'reports', rpId)!;
      drp.status = '待批准';
      drp.reviewed = draft.results
        .filter(r => r.status === '复核通过')
        .map(r => r.reviewer)
        .filter((v, i, a) => !!v && a.indexOf(v) === i)
        .join('、');
      const e = get<Entrust>(draft, 'entrusts', rp.entrustId);
      if (e) refreshEntrust(draft, e);
      addLog(draft, curUser, '提交报告审批', drp.id, drp.no, '全部结果复核通过，报告进入待批准');
    });
    toast('报告已提交，等待授权签字人批准', 'success');
  }, [db, curUser, commit, toast]);

  /* 10. 批准报告 */
  const uiApprove = useCallback((rpId: string) => {
    const rp = byIdAny(db, rpId) as Report | null;
    if (!rp) return;
    if (rp.status !== '待批准') { toast('报告当前状态「' + rp.status + '」不可批准', 'error'); return; }
    const u = userByName(curUser);
    if (!u || u.role !== '授权签字人') {
      toast('批准人必须是授权签字人（CMA资质附表内），当前操作人「' + curUser + '」角色为「' + (u ? u.role : '—') + '」，请切换为 孙授权', 'error'); return;
    }
    commit(draft => {
      const drp = get<Report>(draft, 'reports', rpId)!;
      drp.status = '已批准'; drp.approved = curUser; drp.approveTime = NOW();
      const pr = printOf(draft, drp.id);
      if (pr) pr.printStatus = '待打印';
      tasksOf(draft, drp.entrustId).forEach(t => { if (t.status === '报告审批中') t.status = '已完成'; });
      const e = get<Entrust>(draft, 'entrusts', drp.entrustId);
      if (e) refreshEntrust(draft, e);
      addLog(draft, curUser, '批准报告', drp.id, drp.no, '授权签字人批准，CMA章+检测专用章待签，进入打印队列');
    });
    toast('报告已批准，请先完成电子签章再打印', 'success');
  }, [db, curUser, commit, toast]);

  /* 11. 电子签章 */
  const uiSign = useCallback((rpId: string) => {
    const rp = byIdAny(db, rpId) as Report | null;
    if (!rp) return;
    if (rp.status !== '已批准') { toast('报告须「已批准」后才可签章', 'error'); return; }
    const pr = printOf(db, rp.id);
    if (pr && pr.signStatus === '已签章（CMA+专用+骑缝）') { toast('该报告已签章', 'warn'); return; }
    openModal({ title: '电子签章 · ' + rp.no, body: <SignForm rpId={rpId} /> });
  }, [db, openModal, toast]);

  /* 12. 打印报告 */
  const uiPrint = useCallback((rpId: string) => {
    const rp = byIdAny(db, rpId) as Report | null;
    if (!rp) return;
    if (rp.status !== '已批准') { toast('报告须「已批准」后才可打印', 'error'); return; }
    const pr = printOf(db, rp.id);
    if (pr && pr.signStatus.indexOf('已签章') < 0) {
      toast('打印前须先完成电子签章（CMA章+检测专用章+骑缝章）', 'error'); return;
    }
    commit(draft => {
      const drp = get<Report>(draft, 'reports', rpId)!;
      drp.status = '已打印';
      const dpr = printOf(draft, drp.id);
      if (dpr) { dpr.printStatus = '已打印'; dpr.printTime = NOW(); dpr.printBy = curUser; }
      const e = get<Entrust>(draft, 'entrusts', drp.entrustId);
      if (e) refreshEntrust(draft, e);
      addLog(draft, curUser, '打印报告', drp.id, drp.no, '打印 1 份正本，进入发放队列');
    });
    toast('报告已打印并标记，进入发放队列', 'success');
  }, [db, curUser, commit, toast]);

  /* 13. 报告发放 */
  const uiIssue = useCallback((rpId: string) => {
    const rp = byIdAny(db, rpId) as Report | null;
    if (!rp) return;
    if (rp.status !== '已打印') { toast('报告须「已打印」后才可发放', 'error'); return; }
    openModal({ title: '报告发放 · ' + rp.no, body: <IssueForm rpId={rpId} /> });
  }, [db, openModal, toast]);

  /* 14. 费用结算 */
  const uiSettle = useCallback((feeId: string) => {
    const f = byIdAny(db, feeId) as Fee | null;
    if (!f) return;
    const u = userByName(curUser);
    if (!u || u.role !== '检测主管') {
      toast('「费用结算」仅限收费管理角色（检测主管）执行，当前操作人：' + curUser + '，请右上角切换为 周敏', 'error'); return;
    }
    if (f.status === '已结算') { toast('该费用已结算', 'warn'); return; }
    if (f.status === '待退费') { toast('退费申请处理中，暂不可结算', 'warn'); return; }
    if (f.status === '已退费') { toast('该费用已全额退费，不可再结算', 'warn'); return; }
    commit(draft => {
      const df = get<Fee>(draft, 'fees', feeId)!;
      df.paid = df.amount; df.status = '已结算'; df.mark = '正';
      addLog(draft, curUser, '费用结算', df.id, df.no, '实收 ' + fmtMoney(df.amount));
    });
    toast('费用已结算：' + fmtMoney(f.amount), 'success');
  }, [db, curUser, commit, toast]);

  /* 15. 退费申请 */
  const uiRefundApply = useCallback((feeId: string) => {
    const f = byIdAny(db, feeId) as Fee | null;
    if (!f) return;
    const u = userByName(curUser);
    if (!u || u.role !== '检测主管') {
      toast('「退费申请」仅限收费管理角色（检测主管）执行，当前操作人：' + curUser + '，请右上角切换为 周敏', 'error'); return;
    }
    if (f.status === '待退费') { toast('退费申请已提交，勿重复操作', 'warn'); return; }
    if (f.status === '已退费') { toast('该费用已退费完毕', 'warn'); return; }
    openModal({ title: '退费申请 · ' + f.no, body: <RefundApplyForm feeId={feeId} /> });
  }, [db, curUser, openModal, toast]);

  /* 16. 确认退费 */
  const uiRefundConfirm = useCallback((feeId: string) => {
    const f = byIdAny(db, feeId) as Fee | null;
    if (!f) return;
    const u = userByName(curUser);
    if (!u || u.role !== '检测主管') {
      toast('「确认退费」仅限收费管理角色（检测主管）执行，当前操作人：' + curUser + '，请右上角切换为 周敏', 'error'); return;
    }
    if (f.status !== '待退费') { toast('仅「待退费」状态可执行确认退费', 'warn'); return; }
    openModal({ title: '确认退费 · ' + f.no, body: <RefundConfirmForm feeId={feeId} /> });
  }, [db, curUser, openModal, toast]);

  /* 17. 取消退费申请 */
  const uiRefundCancel = useCallback((feeId: string) => {
    const f = byIdAny(db, feeId) as Fee | null;
    if (!f) return;
    const u = userByName(curUser);
    if (!u || u.role !== '检测主管') {
      toast('「取消退费申请」仅限收费管理角色（检测主管）执行，当前操作人：' + curUser + '，请右上角切换为 周敏', 'error'); return;
    }
    if (f.status !== '待退费') { toast('仅「待退费」状态可取消申请', 'warn'); return; }
    commit(draft => {
      const df = get<Fee>(draft, 'fees', feeId)!;
      df.status = df._prev || (df.paid > 0 ? '已结算' : '未结算');
      df.mark = df.status === '已结算' ? '正' : (df.refundReason ? '正' : '迟');
      df.refundAmt = 0; df.refundReason = '';
      addLog(draft, curUser, '取消退费申请', df.id, df.no, '恢复为「' + df.status + '」');
    });
    toast('退费申请已取消，费用恢复为「' + (f._prev || (f.paid > 0 ? '已结算' : '未结算')) + '」', 'info');
  }, [db, curUser, commit, toast]);

  /* 18. 资料归档 */
  const uiArchive = useCallback((eid: string) => {
    const e = get<Entrust>(db, 'entrusts', eid);
    if (!e) return;
    const rp = reportOf(db, eid);
    if (!rp || rp.status !== '已发放') {
      toast('报告发放完成后才可归档（当前委托单状态：' + e.status + '）', 'error'); return;
    }
    commit(draft => {
      const de = get<Entrust>(draft, 'entrusts', eid)!;
      de.archived = true;
      refreshEntrust(draft, de);
      addLog(draft, curUser, '资料归档', de.id, de.no, '报告发放后归档，全流程闭环');
    });
    toast('委托单已归档，全流程闭环 ✅', 'success');
  }, [db, curUser, commit, toast]);

  /* 19. 新增主数据 */
  const uiAddMaster = useCallback((type: 'client' | 'project' | 'sender') => {
    const titles: Record<string, string> = {
      client: '新增委托单位（模拟营业执照OCR入库）',
      project: '新增工程项目（模拟立项文件OCR入库）',
      sender: '新增送样人（模拟身份证OCR入库）',
    };
    openModal({ title: titles[type], body: <AddMasterForm type={type} /> });
  }, [openModal]);

  /* -------- Provider value -------- */
  const value: LimsContextType = {
    db, curUser, setCurUser, tabs, activeKey, currentTopKey, newE, setNewE, modal, toasts,
    activeTab, openTab, closeTab, switchTab, switchTop, openTabKey, openHome,
    openModal, closeModal, toast, dismissToast, commit, refresh, resetData,
    uiNewEntrust, uiAddSampleModal, uiSaveEntrust, uiAddSampleTo, uiAssign, uiExecStep,
    uiGenResult, uiReview, uiSubmitReport, uiApprove, uiSign, uiPrint, uiIssue,
    uiSettle, uiRefundApply, uiRefundConfirm, uiRefundCancel, uiArchive, uiAddMaster,
  };

  return <LimsContext.Provider value={value}>{children}</LimsContext.Provider>;
};

export const useLims = () => {
  const ctx = useContext(LimsContext);
  if (!ctx) throw new Error('useLims must be used within LimsProvider');
  return ctx;
};

/* ============================================================
 * 辅助：样品落库（委托 → 样品 → 参数 → 任务 → 原始记录 → 步骤）
 * ============================================================ */
function addSampleToEntrust(draft: Db, e: Entrust, sdef: NewSampleDraft): void {
  const sp: Sample = {
    id: nid(draft, 'SP'), no: 'YP-2026-' + pad(draft.seq.sample++, 5),
    name: sdef.name, spec: sdef.spec, usage: sdef.usage || '—',
    appaType: sdef.appaType || '客户自送', qty: sdef.qty || '1组',
    price: sdef.price || 0, entrustId: e.id, status: '待分配',
  };
  if (sdef.paramKeys.indexOf('conc') >= 0) sp.ageDue = addDays(e.dateSend || TODAY(), 28);
  draft.samples.push(sp);
  sdef.paramKeys.forEach(k => {
    const tmpl = TEMPLATES[k as TemplateKey];
    const pm: Param = {
      id: nid(draft, 'PM'), name: tmpl.name, tmpl: k, std: tmpl.std, judge: tmpl.judge,
      sampleId: sp.id, taskId: '',
    };
    draft.params.push(pm);
    const tk: Task = {
      id: nid(draft, 'TK'), no: 'RW-2026-' + pad(draft.seq.task++, 4),
      entrustId: e.id, sampleId: sp.id, paramIds: [pm.id], tmpl: k,
      dept: e.dept || '试验检测一室', tester: '', assignDate: '', dueDate: '',
      inst: '', status: '待分配',
    };
    draft.tasks.push(tk); pm.taskId = tk.id;
    const rc: RecordE = {
      id: nid(draft, 'RC'), no: 'MNYP-2026-TYH-' + pad(draft.seq.record++, 4),
      taskId: tk.id, tmpl: k, env: '温度 ℃ / 湿度 %（检测时录入）', status: '待检测',
    };
    draft.records.push(rc);
    TEMPLATES[k as TemplateKey].buildSteps(sp.qty).forEach((st: StepDef, i: number) => {
      draft.steps.push({
        id: nid(draft, 'ST'), seq: i + 1, recordId: rc.id, name: st.name,
        method: st.method, inst: st.inst,
        inputs: JSON.parse(JSON.stringify(st.inputs)),
        status: '待执行', executor: '', execTime: '',
      });
    });
  });
  refreshEntrust(draft, e);
}

/* ============================================================
 * 弹窗表单组件
 * ============================================================ */

/* -------- 通用按钮行 -------- */
function ModalFoot({ children }: { children: React.ReactNode }) {
  return <div className="modal-f">{children}</div>;
}

/* -------- 添加样品（新增/追加） -------- */
const AddSampleForm: React.FC<{ mode: 'new' | 'append'; eid?: string }> = ({ mode, eid }) => {
  const { setNewE, db, commit, closeModal, toast, curUser, openTab } = useLims();
  const [name, setName] = useState('');
  const [spec, setSpec] = useState('');
  const [usage, setUsage] = useState('');
  const [appaType, setAppaType] = useState('标准养护试块');
  const [qty, setQty] = useState('');
  const [price, setPrice] = useState(10000);
  const [pks, setPks] = useState<string[]>([]);

  const submit = () => {
    if (!name.trim()) { toast('请填写检测样品名称', 'error'); return; }
    if (!spec.trim()) { toast('请填写规格型号', 'error'); return; }
    if (!pks.length) { toast('请至少勾选一个检测参数', 'error'); return; }
    const draft: NewSampleDraft = {
      name: name.trim(), spec: spec.trim(), usage: usage || '—',
      appaType, qty: qty || '1组', price: +price || 0, paramKeys: pks,
    };
    if (mode === 'new') {
      setNewE(prev => ({ ...prev, samples: [...prev.samples, draft] }));
      toast('样品「' + name + '」已暂存，保存委托单后生效', 'success');
    } else if (mode === 'append' && eid) {
      commit(d => {
        const e = get<Entrust>(d, 'entrusts', eid)!;
        addSampleToEntrust(d, e, draft);
        const fee = feeOf(d, eid);
        if (fee) fee.amount += (+price || 0);
        addLog(d, curUser, '添加样品', e.id, e.no, '样品「' + name + '」+' + pks.length + '个参数，任务待分配');
      });
      toast('样品已挂到委托单下，任务待分配', 'success');
    }
    closeModal();
  };

  return (
    <>
      {mode === 'append' && (
        <div className="mnote">样品将挂到当前委托单下，自动生成样品编号、检测参数与「待分配」检测任务。</div>
      )}
      <div className="mrow"><label className="req">检测样品名称</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="如 C50混凝土试块" />
      </div>
      <div className="mrow"><label className="req">规格型号</label>
        <input value={spec} onChange={e => setSpec(e.target.value)} placeholder="如 150×150×150mm / Φ22×500mm" />
      </div>
      <div className="mrow"><label>工程部位/用途</label>
        <input value={usage} onChange={e => setUsage(e.target.value)} placeholder="如 桥涵工程/下部结构" />
      </div>
      <div className="mrow"><label>表观类型</label>
        <select value={appaType} onChange={e => setAppaType(e.target.value)}>
          <option>标准养护试块</option>
          <option>现场抽样</option>
          <option>现场检测</option>
          <option>客户自送</option>
        </select>
      </div>
      <div className="mrow"><label className="req">计价数量</label>
        <input value={qty} onChange={e => setQty(e.target.value)} placeholder="如 3组（9块）/ 1组（3根）/ 3根桩" />
      </div>
      <div className="mrow"><label className="req">金额(元)</label>
        <input type="number" value={price} onChange={e => setPrice(+e.target.value)} />
      </div>
      <div className="mrow" style={{ alignItems: 'flex-start' }}>
        <label className="req" style={{ paddingTop: 6 }}>检测参数</label>
        <div style={{ flex: 1 }}>
          {Object.keys(TEMPLATES).map(k => (
            <label key={k} className="radio" style={{ display: 'flex', alignItems: 'center', gap: 4, margin: '4px 10px 4px 0' }}>
              <input
                type="checkbox"
                checked={pks.includes(k)}
                onChange={e => setPks(prev => e.target.checked ? [...prev, k] : prev.filter(x => x !== k))}
              /> {TEMPLATES[k as TemplateKey].name}
            </label>
          ))}
          <div style={{ color: '#9aa3b2', fontSize: 11, marginTop: 6 }}>
            可多选；混凝土试块送样日期+28天为龄期到期日
          </div>
        </div>
      </div>
      <ModalFoot>
        <button className="btn" onClick={closeModal}>取消</button>
        <button className="btn primary" onClick={submit}>添加</button>
      </ModalFoot>
    </>
  );
};

/* -------- 任务分配 -------- */
const AssignForm: React.FC<{ taskId: string }> = ({ taskId }) => {
  const { db, commit, closeModal, toast, curUser } = useLims();
  const t = get<Task>(db, 'tasks', taskId)!;
  const [dept, setDept] = useState(DEPTS[0]);
  const [tester, setTester] = useState(TESTERS[0]);
  const [inst, setInst] = useState(INSTR[0]);
  const [due, setDue] = useState('2026-09-20');

  const submit = () => {
    commit(draft => {
      const nt = get<Task>(draft, 'tasks', taskId)!;
      nt.dept = dept; nt.tester = tester; nt.inst = inst;
      nt.assignDate = TODAY(); nt.dueDate = due; nt.status = '已分配';
      const sp = get<Sample>(draft, 'samples', nt.sampleId);
      if (sp) sp.status = '已分配';
      const e = get<Entrust>(draft, 'entrusts', nt.entrustId);
      if (e) refreshEntrust(draft, e);
      addLog(draft, curUser, '分配任务', nt.id, nt.no, '分配至 ' + nt.dept + ' / ' + nt.tester + ' / ' + nt.inst);
    });
    toast('任务 ' + t.no + ' 已分配给 ' + tester + '（请切换操作人为该检测员后执行检测）', 'success');
    closeModal();
  };

  return (
    <>
      <div className="mnote">
        分配后任务进入检测员的「试验任务」列表，状态 待分配 → 已分配。
        混凝土试块龄期未到时不能提前试压（系统按龄期到期日解锁）。
      </div>
      <div className="mrow"><label className="req">检测部门</label>
        <select value={dept} onChange={e => setDept(e.target.value)}>
          {DEPTS.map(d => <option key={d}>{d}</option>)}
        </select>
      </div>
      <div className="mrow"><label className="req">检测人员</label>
        <select value={tester} onChange={e => setTester(e.target.value)}>
          {TESTERS.map(x => <option key={x}>{x}</option>)}
        </select>
      </div>
      <div className="mrow"><label className="req">使用仪器</label>
        <select value={inst} onChange={e => setInst(e.target.value)}>
          {INSTR.map(x => <option key={x}>{x}</option>)}
        </select>
      </div>
      <div className="mrow"><label>要求完成日期</label>
        <input type="date" value={due} onChange={e => setDue(e.target.value)} />
      </div>
      <ModalFoot>
        <button className="btn" onClick={closeModal}>取消</button>
        <button className="btn primary" onClick={submit}>确认分配</button>
      </ModalFoot>
    </>
  );
};

/* -------- 执行检测步骤 -------- */
const ExecStepForm: React.FC<{ stepId: string }> = ({ stepId }) => {
  const { db, commit, closeModal, toast, curUser } = useLims();
  const st = byIdAny(db, stepId) as Step;
  const rc = get<RecordE>(db, 'records', st.recordId)!;
  const tk = get<Task>(db, 'tasks', rc.taskId)!;
  const steps = stepsOf(db, rc.id);
  const [values, setValues] = useState<Record<number, string>>(() => {
    const v: Record<number, string> = {};
    st.inputs.forEach((inp, i) => { v[i] = inputVal(inp); });
    return v;
  });

  /* 无输入：自动计算步骤 */
  if (!st.inputs.length) {
    const comp = COMPUTE[rc.tmpl as TemplateKey](steps);
    const submit = () => {
      commit(draft => {
        const dst = draft.steps.find(s => s.id === stepId)!;
        const drc = get<RecordE>(draft, 'records', st.recordId)!;
        const dtk = get<Task>(draft, 'tasks', rc.taskId)!;
        dst.status = '已完成'; dst.executor = curUser; dst.execTime = NOW();
        afterStepDone(draft, drc, dtk, dst);
      });
      toast('步骤「' + st.name + '」已完成', 'success');
      closeModal();
    };
    return (
      <>
        <div className="mnote">{comp.note}</div>
        {comp.items.map((it, i) => (
          <div key={i} className={'res-item' + (it.pass ? '' : ' fail')}>
            <span className="rn">{it.name}</span>
            <span className="rv">{it.val} {it.unit || ''}</span>
            <span className="rs">标准 {it.std} · {it.pass ? '符合' : <b className="fail-mark">不符合</b>}</span>
          </div>
        ))}
        <div style={{ marginTop: 10, color: '#8a94a6', fontSize: 12 }}>
          本步骤由系统自动计算，确认后写入原始记录。
        </div>
        <ModalFoot>
          <button className="btn" onClick={closeModal}>取消</button>
          <button className="btn primary" onClick={submit}>确认完成</button>
        </ModalFoot>
      </>
    );
  }

  /* 有输入：表单录入 */
  const submit = () => {
    let ok = true;
    st.inputs.forEach((inp, i) => {
      const v = values[i] ?? '';
      if (inp.type !== 'select' && (v === '' || isNaN(+v))) ok = false;
    });
    if (!ok) { toast('存在未填或非数字的读数，请补全后再保存', 'error'); return; }
    commit(draft => {
      const dst = draft.steps.find(s => s.id === stepId)!;
      const drc = get<RecordE>(draft, 'records', st.recordId)!;
      const dtk = get<Task>(draft, 'tasks', rc.taskId)!;
      st.inputs.forEach((inp, i) => { inp.value = values[i]; });
      dst.inputs = JSON.parse(JSON.stringify(st.inputs));
      dst.status = '已完成'; dst.executor = curUser; dst.execTime = NOW();
      afterStepDone(draft, drc, dtk, dst);
    });
    closeModal();
  };

  return (
    <>
      <div className="mnote">
        步骤 {st.seq}：{st.name} · {st.method} · 仪器：{st.inst}<br />
        顺序依赖：前序步骤完成后本步骤方可执行；读数保存即写入审计日志。
      </div>
      <div className="mgrid">
        {st.inputs.map((inp, i) => (
          <div key={i} className="gi">
            <div className="gl">{inp.label}{inp.unit ? '（' + inp.unit + '）' : ''}</div>
            {inp.type === 'select' ? (
              <select value={values[i] ?? ''} onChange={e => setValues(v => ({ ...v, [i]: e.target.value }))}>
                {(inp.options || []).map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input
                type="number" step="any" value={values[i] ?? ''}
                onChange={e => setValues(v => ({ ...v, [i]: e.target.value }))}
              />
            )}
          </div>
        ))}
      </div>
      <ModalFoot>
        <button className="btn" onClick={closeModal}>取消</button>
        <button className="btn primary" onClick={submit}>保存读数并完成</button>
      </ModalFoot>
    </>
  );
};

/* 步骤完成后的派生动作 */
function afterStepDone(draft: Db, rc: RecordE, tk: Task, st: Step): void {
  if (rc.status === '待检测') rc.status = '检测中';
  if (tk.status === '已分配') tk.status = '检测中';
  const steps = stepsOf(draft, rc.id);
  addLog(draft, '', '完成检测步骤', rc.id, rc.no,
    '步骤' + st.seq + ' ' + st.name + '，读数：' + st.inputs.map(i => inputVal(i)).join(', '));
  // 委托单状态同步
  const e = get<Entrust>(draft, 'entrusts', tk.entrustId);
  if (e) refreshEntrust(draft, e);
}

/* -------- 试验复核 -------- */
const ReviewForm: React.FC<{ resultId: string }> = ({ resultId }) => {
  const { db, commit, closeModal, toast, curUser } = useLims();
  const res = byIdAny(db, resultId) as Result;
  const tk = get<Task>(db, 'tasks', res.taskId);
  const [op, setOp] = useState('数据与计算过程核对无误');

  const reject = () => {
    commit(draft => {
      const dr = draft.results.find(r => r.id === resultId)!;
      dr.status = '已驳回'; dr.reviewer = curUser; dr.reviewTime = NOW();
      const drc = get<RecordE>(draft, 'records', dr.recordId)!;
      const dtk = get<Task>(draft, 'tasks', dr.taskId)!;
      const dsteps = stepsOf(draft, drc.id);
      dsteps.forEach(s => {
        s.status = '待执行'; s.executor = ''; s.execTime = '';
        s.inputs.forEach(i => { delete i.value; });
      });
      drc.status = '检测中'; dtk.status = '检测中';
      const sp = get<Sample>(draft, 'samples', dtk.sampleId);
      if (sp) sp.status = '检测中';
      const e = get<Entrust>(draft, 'entrusts', dtk.entrustId);
      if (e) refreshEntrust(draft, e);
      addLog(draft, curUser, '复核驳回', dr.id, dtk.no, '意见：' + (op || '—') + '。检测步骤已重置为待执行');
    });
    toast('已驳回：任务回到「检测中」，检测步骤已重置，请检测员重新检测', 'warn');
    closeModal();
  };

  const pass = () => {
    commit(draft => {
      const dr = draft.results.find(r => r.id === resultId)!;
      dr.status = '复核通过'; dr.reviewer = curUser; dr.reviewTime = NOW();
      const drc = get<RecordE>(draft, 'records', dr.recordId)!;
      const dtk = get<Task>(draft, 'tasks', dr.taskId)!;
      drc.status = '复核通过'; dtk.status = '报告审批中';
      const sp = get<Sample>(draft, 'samples', dtk.sampleId);
      if (sp) sp.status = '报告审批中';
      const e = get<Entrust>(draft, 'entrusts', dtk.entrustId)!;
      let rp = reportOf(draft, e.id);
      if (!rp) {
        const newRp: Report = {
          id: nid(draft, 'RP'), no: 'BG-2026-' + pad(draft.seq.report++, 4),
          entrustId: e.id, status: '编制中',
          prepared: Array.from(new Set(tasksOf(draft, e.id).map(t => t.tester).filter(Boolean))),
          reviewed: '', approved: '', approveTime: '',
        };
        draft.reports.push(newRp);
        draft.prints.push({
          id: nid(draft, 'PR'), reportId: newRp.id, signStatus: '未签章', printStatus: '未打印',
          signer: '', signTime: '', printTime: '', printBy: '',
        });
        draft.issues.push({
          id: nid(draft, 'IR'), reportId: newRp.id, method: '自取',
          receiver: senderName(draft, e.senderId), trackingNo: '',
          status: '未发放', time: '', operator: '',
        });
        addLog(draft, curUser, '生成报告初稿', newRp.id, newRp.no, '首个结果复核通过后自动生成（编制中）');
      }
      refreshEntrust(draft, e);
      addLog(draft, curUser, '复核通过', dr.id, dtk.no, '意见：' + (op || '—'));
    });
    toast('复核通过：任务进入「报告审批中」，报告同步汇总结论', 'success');
    closeModal();
  };

  return (
    <>
      <div className="mnote">{res.note}</div>
      {res.items.map((it, i) => (
        <div key={i} className={'res-item' + (it.pass ? '' : ' fail')}>
          <span className="rn">{it.name}</span>
          <span className="rv">{it.val} {it.unit || ''}</span>
          <span className="rs">标准 {it.std} · {it.pass ? '符合' : <b className="fail-mark">不符合</b>}</span>
        </div>
      ))}
      <div className={'verdict ' + (res.conclusion === '合格' ? 'pass' : 'fail')}>
        检测结论：{res.conclusion}{res.conclusion === '合格' ? '' : '（不合格项将进入不合格台账）'}
      </div>
      <div className="mrow" style={{ marginTop: 12 }}>
        <label className="req">复核意见</label>
        <input value={op} onChange={e => setOp(e.target.value)} placeholder="如：数据与修约核对无误，同意" />
      </div>
      <ModalFoot>
        <button className="btn danger" onClick={reject}>驳回退回检测</button>
        <button className="btn success" onClick={pass}>复核通过</button>
      </ModalFoot>
    </>
  );
};

/* -------- 电子签章 -------- */
const SignForm: React.FC<{ rpId: string }> = ({ rpId }) => {
  const { db, commit, closeModal, toast, curUser } = useLims();
  const submit = () => {
    commit(draft => {
      const drp = get<Report>(draft, 'reports', rpId)!;
      const dpr = printOf(draft, drp.id);
      if (dpr) {
        dpr.signStatus = '已签章（CMA+专用+骑缝）';
        dpr.signer = curUser; dpr.signTime = NOW();
      }
      addLog(draft, curUser, '电子签章', drp.id, drp.no, 'CMA标志章+检测专用章+骑缝章');
    });
    toast('签章完成，可执行打印', 'success');
    closeModal();
  };
  return (
    <>
      <div className="mnote">
        打印前须完成电子签章。将依次加盖：<br />
        ① CMA 标志章（检验检测机构资质认定）<br />
        ② 检测专用章（试验检测一室）<br />
        ③ 骑缝章（跨页盖章，防篡改）
      </div>
      <div className="stampbox" style={{ padding: '4px 0', display: 'flex', gap: 8 }}>
        <svg width="110" height="110" viewBox="0 0 110 110">
          <circle cx="55" cy="55" r="52" fill="none" stroke="#c0392b" strokeWidth="3" />
          <circle cx="55" cy="55" r="40" fill="none" stroke="#c0392b" strokeWidth="1.5" />
          <text x="55" y="42" textAnchor="middle" fontSize="15" fontWeight="700" fill="#c0392b">CMA</text>
          <text x="55" y="62" textAnchor="middle" fontSize="10" fill="#c0392b">检验检测专用章</text>
          <text x="55" y="78" textAnchor="middle" fontSize="8" fill="#c0392b">2026</text>
        </svg>
        <svg width="110" height="110" viewBox="0 0 110 110">
          <circle cx="55" cy="55" r="52" fill="none" stroke="#1e5aa8" strokeWidth="3" />
          <circle cx="55" cy="55" r="40" fill="none" stroke="#1e5aa8" strokeWidth="1.5" />
          <text x="55" y="42" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1e5aa8">试验检测</text>
          <text x="55" y="62" textAnchor="middle" fontSize="11" fill="#1e5aa8">专用章</text>
          <text x="55" y="78" textAnchor="middle" fontSize="8" fill="#1e5aa8">编号 YJ-2026</text>
        </svg>
        <svg width="110" height="110" viewBox="0 0 110 110">
          <rect x="8" y="44" width="94" height="22" rx="4" fill="none" stroke="#c77700" strokeWidth="2" strokeDasharray="6 3" />
          <text x="55" y="59" textAnchor="middle" fontSize="11" fill="#c77700">骑 缝 章</text>
        </svg>
      </div>
      <ModalFoot>
        <button className="btn" onClick={closeModal}>取消</button>
        <button className="btn primary" onClick={submit}>确认签章</button>
      </ModalFoot>
    </>
  );
};

/* -------- 报告发放 -------- */
const IssueForm: React.FC<{ rpId: string }> = ({ rpId }) => {
  const { db, commit, closeModal, toast, curUser } = useLims();
  const rp = byIdAny(db, rpId) as Report;
  const ir0 = issueOf(db, rp.id);
  const [way, setWay] = useState(ir0?.method || '自取');
  const [recv, setRecv] = useState(ir0?.receiver || '');
  const [track, setTrack] = useState(ir0?.trackingNo || '');

  const submit = () => {
    if (!recv.trim()) { toast('请填写领取人/收件人', 'error'); return; }
    if (way === '邮寄' && !track.trim()) { toast('邮寄方式必须登记快递单号', 'error'); return; }
    commit(draft => {
      const drp = get<Report>(draft, 'reports', rpId)!;
      drp.status = '已发放';
      const ir = issueOf(draft, drp.id);
      if (ir) {
        ir.method = way; ir.receiver = recv.trim(); ir.trackingNo = track;
        ir.status = '已发放'; ir.time = NOW(); ir.operator = curUser;
      }
      const e = get<Entrust>(draft, 'entrusts', drp.entrustId);
      if (e) refreshEntrust(draft, e);
      addLog(draft, curUser, '发放报告', drp.id, drp.no,
        '方式：' + way + ' · 领取人：' + recv + (way === '邮寄' ? ' · 快递单号 ' + track : ''));
    });
    toast('报告已发放，委托单进入「已签发」；可在委托详情执行归档', 'success');
    closeModal();
  };

  return (
    <>
      <div className="mrow"><label className="req">发放方式</label>
        <select value={way} onChange={e => setWay(e.target.value)}>
          {ISSUE_WAYS.map(w => <option key={w}>{w}</option>)}
        </select>
      </div>
      <div className="mrow"><label className="req">领取人 / 收件人</label>
        <input value={recv} onChange={e => setRecv(e.target.value)} />
      </div>
      <div className="mrow"><label>快递单号（邮寄时）</label>
        <input value={track} onChange={e => setTrack(e.target.value)} placeholder="如 SF13800001234" />
      </div>
      <ModalFoot>
        <button className="btn" onClick={closeModal}>取消</button>
        <button className="btn success" onClick={submit}>确认发放</button>
      </ModalFoot>
    </>
  );
};

/* -------- 退费申请 -------- */
const RefundApplyForm: React.FC<{ feeId: string }> = ({ feeId }) => {
  const { db, commit, closeModal, toast, curUser } = useLims();
  const f = byIdAny(db, feeId) as Fee;
  const maxBack = f.status === '已结算' ? f.paid : f.amount;
  const [amt, setAmt] = useState(maxBack);
  const [reason, setReason] = useState('');

  const submit = () => {
    if (!amt || amt <= 0) { toast('请填写有效的退费金额', 'error'); return; }
    if (amt > maxBack) { toast('退费金额不可超过 ' + fmtMoney(maxBack), 'error'); return; }
    if (!reason.trim()) { toast('请填写退费原因', 'error'); return; }
    commit(draft => {
      const df = get<Fee>(draft, 'fees', feeId)!;
      df._prev = df.status; df.status = '待退费';
      df.refundAmt = amt; df.refundReason = reason.trim(); df.mark = '退';
      addLog(draft, curUser, '退费申请', df.id, df.no,
        '申请退费 ' + fmtMoney(amt) + ' · 原因：' + reason.trim());
    });
    toast('退费申请已提交，等待确认退费', 'success');
    closeModal();
  };

  return (
    <>
      <div className="form-section"><div className="form-grid">
        <div className="form-row">
          <label>委托编号</label><div className="field">
            <span className="ro">{get<Entrust>(db, 'entrusts', f.entrustId)?.no}</span>
          </div>
          <label>委托单位</label><div className="field">
            <span className="ro">{clientName(db, f.clientId)}</span>
          </div>
        </div>
        <div className="form-row required">
          <label>退费金额(元)</label><div className="field">
            <input type="number" value={amt} min={0} max={maxBack}
              onChange={e => setAmt(+e.target.value)} />
            <span className="hint">上限 {fmtMoney(maxBack)}（{f.status === '已结算' ? '已收金额' : '应收金额'}）</span>
          </div>
        </div>
        <div className="form-row required">
          <label>退费原因</label><div className="field">
            <input value={reason} onChange={e => setReason(e.target.value)}
              placeholder="如：委托方取消部分检测项目" />
          </div>
        </div>
      </div></div>
      <ModalFoot>
        <button className="btn" onClick={closeModal}>取消</button>
        <button className="btn warn" onClick={submit}>提交退费申请</button>
      </ModalFoot>
    </>
  );
};

/* -------- 确认退费 -------- */
const RefundConfirmForm: React.FC<{ feeId: string }> = ({ feeId }) => {
  const { db, commit, closeModal, toast, curUser } = useLims();
  const f = byIdAny(db, feeId) as Fee;
  const amt = f.refundAmt || 0;
  const e = get<Entrust>(db, 'entrusts', f.entrustId);

  const submit = () => {
    commit(draft => {
      const df = get<Fee>(draft, 'fees', feeId)!;
      df.status = '已退费';
      df.paid = Math.max(0, (df.paid || 0) - amt);
      df.refundTime = NOW(); df.refundBy = curUser;
      addLog(draft, curUser, '确认退费', df.id, df.no,
        '实退 ' + fmtMoney(amt) + ' · 原因：' + (df.refundReason || '—'));
    });
    toast('退费完成：' + fmtMoney(amt), 'success');
    closeModal();
  };

  return (
    <>
      <div className="mnote">
        即将对 <b>{e?.no}</b>（{clientName(db, f.clientId)}）执行退费 <b style={{ color: '#b91c1c' }}>{fmtMoney(amt)}</b>。<br />
        原因：{f.refundReason || '—'}<br />
        确认后费用状态变为「已退费」，此操作将写入审计日志。
      </div>
      <ModalFoot>
        <button className="btn" onClick={closeModal}>取消</button>
        <button className="btn danger" onClick={submit}>确认退费</button>
      </ModalFoot>
    </>
  );
};

/* -------- 新增主数据 -------- */
const AddMasterForm: React.FC<{ type: 'client' | 'project' | 'sender' }> = ({ type }) => {
  const { db, commit, closeModal, toast, curUser } = useLims();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [legal, setLegal] = useState('');
  const [clientId, setClientId] = useState(db.clients[0]?.id || '');
  const [builder, setBuilder] = useState('');
  const [phone, setPhone] = useState('');

  const submit = () => {
    if (type === 'client') {
      if (!name.trim() || !code.trim()) { toast('单位名称与信用代码必填', 'error'); return; }
      const dup = db.clients.some(c => c.name === name.trim() || c.code === code.trim());
      if (dup) { toast('同名/同信用代码的主数据不允许重复', 'error'); return; }
      commit(draft => {
        const c: Client = {
          id: nid(draft, 'CL'), name: name.trim(), code: code.trim(),
          legal: legal || '—', credit: 'B（账期15天）', source: 'OCR识别入库', status: '已审核',
        };
        draft.clients.push(c);
        addLog(draft, curUser, '新增主数据', c.id, '委托单位', name.trim());
      });
      toast('委托单位已入库', 'success');
    } else if (type === 'project') {
      if (!name.trim()) { toast('项目名称必填', 'error'); return; }
      commit(draft => {
        const p: Project = {
          id: nid(draft, 'PJ'), name: name.trim(),
          code: 'PRJ-2026-' + pad(draft.projects.length + 118, 4),
          clientId, builder: builder || '—', supervisor: '—', addr: '—', status: '已审核',
        };
        draft.projects.push(p);
        addLog(draft, curUser, '新增主数据', p.id, '工程项目', name.trim());
      });
      toast('工程项目已入库', 'success');
    } else {
      if (!name.trim()) { toast('姓名必填', 'error'); return; }
      commit(draft => {
        const s: Sender = {
          id: nid(draft, 'SN'), name: name.trim(), clientId,
          title: '材料员', phone: phone || '—', status: '已审核',
        };
        draft.senders.push(s);
        addLog(draft, curUser, '新增主数据', s.id, '送样人', name.trim());
      });
      toast('送样人已入库', 'success');
    }
    closeModal();
  };

  const noteMap: Record<string, string> = {
    client: '正式环境：送检单位上传营业执照 → OCR识别 → 预览确认 → 管理员审核入库。此处模拟直接入库。',
    project: '一个工程项目唯一归属一个委托单位。',
    sender: '送样人必须绑定所属委托单位并上传电子授权书方可生效。',
  };

  return (
    <>
      <div className="mnote">{noteMap[type]}</div>
      <div className="mrow"><label className="req">{type === 'client' ? '单位名称' : type === 'project' ? '项目名称' : '姓名'}</label>
        <input value={name} onChange={e => setName(e.target.value)} />
      </div>
      {type === 'client' && (
        <div className="mrow"><label className="req">统一社会信用代码</label>
          <input value={code} onChange={e => setCode(e.target.value)} placeholder="18位" />
        </div>
      )}
      {type === 'client' && (
        <div className="mrow"><label>法人代表</label>
          <input value={legal} onChange={e => setLegal(e.target.value)} />
        </div>
      )}
      {(type === 'project' || type === 'sender') && (
        <div className="mrow"><label className={type === 'sender' ? 'req' : ''}>所属单位</label>
          <select value={clientId} onChange={e => setClientId(e.target.value)}>
            {db.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}
      {type === 'project' && (
        <div className="mrow"><label>施工单位</label>
          <input value={builder} onChange={e => setBuilder(e.target.value)} />
        </div>
      )}
      {type === 'sender' && (
        <div className="mrow"><label>联系电话</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="138****0000" />
        </div>
      )}
      <ModalFoot>
        <button className="btn" onClick={closeModal}>取消</button>
        <button className="btn primary" onClick={submit}>入库</button>
      </ModalFoot>
    </>
  );
};
