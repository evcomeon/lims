/* ============================================================
 * 数据层：实体类型 + 种子数据 + 访问助手 + 工具函数
 * 移植自 lims-test-app.html 第 467-825 行。
 * ============================================================ */
import { TEMPLATES, COMPUTE, type StepInput, type ResultItem, type StepDef } from './templates';

/* ================= 实体类型 ================= */
export interface Client {
  id: string; name: string; code: string; legal: string; credit: string; source: string; status: string;
}
export interface Project {
  id: string; name: string; code: string; clientId: string; builder: string; supervisor: string; addr: string; status: string;
}
export interface Sender {
  id: string; name: string; clientId: string; title: string; phone: string; status: string;
}
export interface Entrust {
  id: string; no: string; clientId: string; projectId: string; senderId: string;
  testForm: string; sampleSource: string; payType: string; dept: string; domain: string;
  dateEntrust: string; dateSend: string; dateReportStart: string; dateReportEnd: string;
  createdAt: string; status: string; archived: boolean;
}
export interface Sample {
  id: string; no: string; name: string; spec: string; usage: string; appaType: string;
  qty: string; price: number; entrustId: string; ageDue?: string; status: string;
}
export interface Param {
  id: string; name: string; tmpl: string; std: string; judge: string; sampleId: string; taskId: string;
}
export interface Task {
  id: string; no: string; entrustId: string; sampleId: string; paramIds: string[];
  tmpl: string; dept: string; tester: string; assignDate: string; dueDate: string;
  inst: string; status: string;
}
export interface Record {
  id: string; no: string; taskId: string; tmpl: string; env: string; status: string;
}
export interface Step {
  id: string; seq: number; recordId: string; name: string; method: string; inst: string;
  inputs: StepInput[]; status: string; executor: string; execTime: string;
}
export interface Result {
  id: string; recordId: string; taskId: string; items: ResultItem[]; conclusion: string;
  note: string; status: string; tester: string; genTime: string; reviewer: string;
  reviewTime: string; failLedger: boolean;
}
export interface Report {
  id: string; no: string; entrustId: string; status: string;
  prepared: string[]; reviewed: string; approved: string; approveTime: string;
}
export interface Print {
  id: string; reportId: string; signStatus: string; printStatus: string;
  signer: string; signTime: string; printTime: string; printBy: string;
}
export interface Issue {
  id: string; reportId: string; method: string; receiver: string; trackingNo: string;
  status: string; time: string; operator: string;
}
export interface Fee {
  id: string; no: string; entrustId: string; clientId: string; amount: number; paid: number;
  payType: string; status: string; mark: string;
  refundAmt?: number; refundReason?: string; refundTime?: string; refundBy?: string; _prev?: string;
}
export interface LogEntry {
  t: string; user: string; action: string; target: string; tname: string; detail: string;
}

export interface DbSeq { idc: number; entrust: number; sample: number; task: number; record: number; report: number; fee: number; }
export interface Db {
  v: number;
  seq: DbSeq;
  entrusts: Entrust[];
  samples: Sample[];
  params: Param[];
  tasks: Task[];
  records: Record[];
  steps: Step[];
  results: Result[];
  reports: Report[];
  prints: Print[];
  issues: Issue[];
  fees: Fee[];
  clients: Client[];
  projects: Project[];
  senders: Sender[];
  logs: LogEntry[];
}

/* ================= 常量 ================= */
export const LS_KEY = 'lims-test-db-v2';
export const COLLS: (keyof Db)[] = [
  'entrusts', 'samples', 'params', 'tasks', 'records', 'steps', 'results',
  'reports', 'prints', 'issues', 'fees', 'clients', 'projects', 'senders',
];
export const TASK_ORDER = ['待分配', '已分配', '检测中', '待复核', '报告审批中', '已完成'];
export const ENTRUST_FLOW = ['已登记', '检测中', '待复核', '待审核', '已签发', '已归档'];

/* ================= 基础工具 ================= */
export function esc(s: unknown): string {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string)
  );
}
export function round1(x: number): number { return Math.round(x * 10) / 10; }
export function fmtMoney(n: number): string {
  return '¥' + Number(n || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
/* 系统业务时钟：与种子案例同处 2026-09-08，时间取真实时刻 */
export function NOW(): string {
  const d = new Date();
  return '2026-09-08 ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
}
export function TODAY(): string { return '2026-09-08'; }
/* 纯字符串日期加法：UTC 构造 + UTC 输出，避免本地时区与 toISOString 混用导致的偏移 */
export function addDays(s: string, n: number): string {
  const y = +s.slice(0, 4), m = +s.slice(5, 7) - 1, d = +s.slice(8, 10);
  const dt = new Date(Date.UTC(y, m, d + n));
  return dt.toISOString().slice(0, 10);
}
export function pad(n: number, w: number): string { return String(n).padStart(w, '0'); }
/* 生成新 id：共享 db.seq.idc 计数器（后增） */
export function nid(db: Db, p: string): string { return p + db.seq.idc++; }

/* ================= 种子数据：WT/GL-2026-2082 中途状态 ================= */
export function seed(): Db {
  const db: Db = {
    v: 2,
    seq: { idc: 100, entrust: 2083, sample: 12004, task: 454, record: 119, report: 1157, fee: 302 },
    entrusts: [], samples: [], params: [], tasks: [], records: [], steps: [], results: [],
    reports: [], prints: [], issues: [], fees: [], clients: [], projects: [], senders: [],
    logs: [],
  };

  /* 主数据 */
  db.clients.push({ id: 'CL1', name: '重庆公路养护工程（集团）有限公司', code: '91500000MA5Uxxxxx', legal: '陈某某', credit: 'A（账期30天）', source: '送检单位上传 · 营业执照OCR', status: '已审核' });
  db.projects.push({ id: 'PJ1', name: 'G42沪蓉高速段养护工程', code: 'PRJ-2026-0117', clientId: 'CL1', builder: '重庆某建设工程有限公司', supervisor: '某工程监理咨询有限公司', addr: '重庆市 · G42沪蓉高速 K1668+300~K1682+500', status: '已审核' });
  db.senders.push({ id: 'SN1', name: '张伟', clientId: 'CL1', title: '工程部材料员', phone: '138****6672', status: '已审核' });

  /* 委托单 */
  db.entrusts.push({
    id: 'E1', no: 'WT/GL-2026-2082', clientId: 'CL1', projectId: 'PJ1', senderId: 'SN1',
    testForm: '初检', sampleSource: '现场抽样', payType: '延后付费', dept: '试验检测一室',
    domain: 'GL', dateEntrust: '2026-09-02', dateSend: '2026-09-03', dateReportStart: '2026-09-18', dateReportEnd: '2026-09-20',
    createdAt: '2026-09-02 10:12', status: '检测中', archived: false,
  });

  /* 样品 */
  db.samples.push({ id: 'SP1', no: 'YP-2026-12001', name: 'C50混凝土试块', spec: '150×150×150mm', usage: '桥涵工程/下部结构（墩柱）', appaType: '标准养护试块', qty: '3组（9块）', price: 18000, entrustId: 'E1', ageDue: '2026-10-01', status: '检测中' });
  db.samples.push({ id: 'SP2', no: 'YP-2026-12002', name: '热轧带肋钢筋 HRB400E Φ22', spec: 'Φ22×500mm', usage: '武隆路桥梁伸缩缝连接件', appaType: '现场抽样', qty: '1组（3根）', price: 12000, entrustId: 'E1', status: '待复核' });
  db.samples.push({ id: 'SP3', no: 'YP-2026-12003', name: '钻孔灌注桩（基桩）', spec: '桩径1.5m / 桩长22m / 3根', usage: '武隆路桥梁桩基', appaType: '现场检测', qty: '3根桩', price: 20000, entrustId: 'E1', status: '报告审批中' });

  /* 检测参数 */
  db.params.push({ id: 'PM1', name: '混凝土抗压强度（C50）', tmpl: 'conc', std: 'GB/T 50081-2019', judge: 'GB/T 50107-2010', sampleId: 'SP1', taskId: 'TK1' });
  db.params.push({ id: 'PM2', name: '钢材力学性能（屈服/抗拉/伸长率）', tmpl: 'steel', std: 'GB/T 228.1-2021', judge: 'GB/T 1499.2-2018', sampleId: 'SP2', taskId: 'TK2' });
  db.params.push({ id: 'PM3', name: '冷弯性能', tmpl: 'bend', std: 'GB/T 232-2010', judge: 'GB/T 1499.2-2018', sampleId: 'SP2', taskId: 'TK2' });
  db.params.push({ id: 'PM4', name: '基桩完整性（声波透射法）', tmpl: 'pile', std: 'JGJ 106-2014', judge: 'JGJ 106-2014', sampleId: 'SP3', taskId: 'TK3' });

  /* 检测任务 */
  db.tasks.push({ id: 'TK1', no: 'RW-2026-0451', entrustId: 'E1', sampleId: 'SP1', paramIds: ['PM1'], tmpl: 'conc', dept: '试验检测一室', tester: '李强', assignDate: '2026-09-03', dueDate: '2026-10-01', inst: '2000kN压力试验机（YQ-0102）', status: '检测中' });
  db.tasks.push({ id: 'TK2', no: 'RW-2026-0452', entrustId: 'E1', sampleId: 'SP2', paramIds: ['PM2', 'PM3'], tmpl: 'steel', dept: '试验检测一室', tester: '王芳', assignDate: '2026-09-03', dueDate: '2026-09-08', inst: '600kN万能试验机（YQ-0056）', status: '待复核' });
  db.tasks.push({ id: 'TK3', no: 'RW-2026-0453', entrustId: 'E1', sampleId: 'SP3', paramIds: ['PM4'], tmpl: 'pile', dept: '外检项目组', tester: '赵鹏', assignDate: '2026-09-04', dueDate: '2026-09-10', inst: '超声检测仪（YQ-0207）', status: '报告审批中' });

  /* 原始记录 */
  db.records.push({ id: 'RC1', no: 'MNYP-2026-TYH-0116', taskId: 'TK1', tmpl: 'conc', env: '温度 20±2℃ · 湿度 ≥95%（养护室）', status: '待检测' });
  db.records.push({ id: 'RC2', no: 'MNYP-2026-TYH-0117', taskId: 'TK2', tmpl: 'steel', env: '温度 23℃ · 湿度 56%（符合 10~35℃）', status: '待复核' });
  db.records.push({ id: 'RC3', no: 'MNYP-2026-TYH-0118', taskId: 'TK3', tmpl: 'pile', env: '现场检测 · 天气晴', status: '复核通过' });

  /* R1 混凝土：步骤全部待执行 */
  TEMPLATES.conc.buildSteps().forEach((s: StepDef, i: number) => {
    db.steps.push({ id: 'ST' + db.seq.idc++, seq: i + 1, recordId: 'RC1', name: s.name, method: s.method, inst: s.inst, inputs: s.inputs, status: '待执行', executor: '', execTime: '' });
  });
  /* R2 钢材：步骤已全部完成（王芳 2026-09-06） */
  const steelSteps = TEMPLATES.steel.buildSteps();
  const steelVals = [
    ['110', '3'],
    ['176.2', '231.4', '128', '177.0', '232.8', '129', '175.5', '230.1', '127'],
    ['无裂纹'],
  ];
  steelSteps.forEach((s: StepDef, i: number) => {
    s.inputs.forEach((inp: StepInput, j: number) => { inp.value = steelVals[i][j]; });
    db.steps.push({ id: 'ST' + db.seq.idc++, seq: i + 1, recordId: 'RC2', name: s.name, method: s.method, inst: s.inst, inputs: s.inputs, status: '已完成', executor: '王芳', execTime: '2026-09-06 ' + ['09:20', '10:05', '11:30'][i] });
  });
  /* R3 基桩：3根桩步骤已完成（赵鹏 2026-09-05） */
  const pileSeed = [['桩3-1# 声波检测', '3850', 'Ⅰ类'], ['桩3-2# 声波检测', '3920', 'Ⅰ类'], ['桩3-3# 声波检测', '3640', 'Ⅱ类']];
  pileSeed.forEach((p, i) => {
    db.steps.push({
      id: 'ST' + db.seq.idc++, seq: i + 1, recordId: 'RC3', name: p[0], method: 'JGJ 106-2014 §10', inst: '超声检测仪（YQ-0207）',
      inputs: [
        { label: '平均波速', unit: 'm/s', type: 'number', value: p[1] },
        { label: '完整性类别', type: 'select', options: ['Ⅰ类', 'Ⅱ类', 'Ⅲ类', 'Ⅳ类'], value: p[2] },
      ],
      status: '已完成', executor: '赵鹏', execTime: '2026-09-05 1' + (4 + i) + ':00',
    });
  });

  /* 检测结果：R2 待复核（含伸长率不合格红色案例）；R3 已复核通过 */
  const r2 = COMPUTE.steel(stepsOf(db, 'RC2'));
  db.results.push({ id: nid(db, 'RS'), recordId: 'RC2', taskId: 'TK2', items: r2.items, conclusion: r2.conclusion, note: r2.note, status: '待复核', tester: '王芳', genTime: '2026-09-06 11:35', reviewer: '', reviewTime: '', failLedger: r2.conclusion !== '合格' });
  const r3 = COMPUTE.pile(stepsOf(db, 'RC3'));
  db.results.push({ id: nid(db, 'RS'), recordId: 'RC3', taskId: 'TK3', items: r3.items, conclusion: r3.conclusion, note: r3.note, status: '复核通过', tester: '赵鹏', genTime: '2026-09-05 17:20', reviewer: '钱进', reviewTime: '2026-09-07 09:15', failLedger: false });

  /* 检测报告（初稿：基桩结果复核通过后自动生成） */
  db.reports.push({ id: 'RP1', no: 'BG-2026-1156', entrustId: 'E1', status: '编制中', prepared: ['李强', '王芳', '赵鹏'], reviewed: '', approved: '', approveTime: '' });
  db.prints.push({ id: nid(db, 'PR'), reportId: 'RP1', signStatus: '未签章', printStatus: '未打印', signer: '', signTime: '', printTime: '', printBy: '' });
  db.issues.push({ id: nid(db, 'IR'), reportId: 'RP1', method: '自取', receiver: '张伟', trackingNo: '', status: '未发放', time: '', operator: '' });

  /* 费用 */
  db.fees.push({ id: 'FE1', no: 'F-2026-0301', entrustId: 'E1', clientId: 'CL1', amount: 50000, paid: 0, payType: '延后付费', status: '未结算', mark: '迟' });

  /* 审计日志（新→旧） */
  db.logs = [
    { t: '2026-09-07 09:15', user: '钱进', action: '复核通过', target: 'RS' + db.results[1].id.slice(2), tname: '基桩完整性结果', detail: '3根桩结果复核通过，报告进入审批链' },
    { t: '2026-09-07 09:15', user: '系统', action: '生成报告初稿', target: 'RP1', tname: 'BG-2026-1156', detail: '首个结果复核通过，自动生成报告初稿（编制中）' },
    { t: '2026-09-06 11:35', user: '王芳', action: '生成检测结果', target: 'RS' + db.results[0].id.slice(2), tname: '钢材力学性能结果', detail: '断后伸长率 16.4% 低于标准下限 17%，其余指标合格，判不合格进入台账' },
    { t: '2026-09-06 11:30', user: '王芳', action: '完成检测步骤', target: 'RC2', tname: '冷弯试验', detail: 'd=4a，180°，外表面无裂纹' },
    { t: '2026-09-05 17:20', user: '赵鹏', action: '生成检测结果', target: 'RC3', tname: '基桩完整性结果', detail: '3-3# 桩 Ⅱ类，综合合格' },
    { t: '2026-09-05 14:00', user: '赵鹏', action: '完成检测步骤', target: 'RC3', tname: '桩3-1# 声波检测', detail: '现场检测，仪器直采' },
    { t: '2026-09-03 16:40', user: '周敏', action: '分配任务', target: 'TK3', tname: 'RW-2026-0453', detail: '分配至 外检项目组/赵鹏/超声检测仪' },
    { t: '2026-09-03 16:35', user: '周敏', action: '分配任务', target: 'TK2', tname: 'RW-2026-0452', detail: '分配至 试验检测一室/王芳/600kN万能试验机' },
    { t: '2026-09-03 16:30', user: '周敏', action: '分配任务', target: 'TK1', tname: 'RW-2026-0451', detail: '分配至 试验检测一室/李强/2000kN压力试验机（龄期2026-10-01解锁）' },
    { t: '2026-09-02 10:12', user: '周敏', action: '新增委托单', target: 'E1', tname: 'WT/GL-2026-2082', detail: '3个样品、4个检测参数，自动生成费用 ¥50,000.00' },
  ];

  return db;
}

/* ================= 数据访问 ================= */
export function byIdAny(db: Db, id: string): unknown {
  for (let i = 0; i < COLLS.length; i++) {
    const f = (db[COLLS[i]] as { id: string }[]).filter((x) => x.id === id)[0];
    if (f) return f;
  }
  return null;
}
export function get<T extends { id: string }>(db: Db, coll: keyof Db, id: string): T | null {
  const arr = db[coll] as unknown as T[];
  return arr.filter((x) => x.id === id)[0] || null;
}
export function samplesOf(db: Db, eid: string): Sample[] { return db.samples.filter((s) => s.entrustId === eid); }
export function paramsOf(db: Db, sid: string): Param[] { return db.params.filter((p) => p.sampleId === sid); }
export function tasksOf(db: Db, eid: string): Task[] { return db.tasks.filter((t) => t.entrustId === eid); }
export function taskOfParam(db: Db, pid: string): Task | null {
  return db.tasks.filter((t) => (t.paramIds || []).indexOf(pid) >= 0)[0] || null;
}
export function recordOfTask(db: Db, tid: string): Record | null {
  return db.records.filter((r) => r.taskId === tid)[0] || null;
}
export function stepsOf(db: Db, rid: string): Step[] {
  return db.steps.filter((s) => s.recordId === rid).sort((a, b) => a.seq - b.seq);
}
export function activeResult(db: Db, rid: string): Result | null {
  return db.results.filter((r) => r.recordId === rid && (r.status === '待复核' || r.status === '复核通过'))[0] || null;
}
export function resultsOfTask(db: Db, tid: string): Result[] {
  return db.results.filter((r) => r.taskId === tid && r.status !== '已驳回');
}
export function resultsOfEntrust(db: Db, eid: string): Result[] {
  const out: Result[] = [];
  tasksOf(db, eid).forEach((t) => {
    const r = recordOfTask(db, t.id);
    if (r) {
      const res = activeResult(db, r.id);
      if (res) out.push(res);
    }
  });
  return out;
}
export function reportOf(db: Db, eid: string): Report | null {
  return db.reports.filter((r) => r.entrustId === eid)[0] || null;
}
export function printOf(db: Db, rid: string): Print | null {
  return db.prints.filter((p) => p.reportId === rid)[0] || null;
}
export function issueOf(db: Db, rid: string): Issue | null {
  return db.issues.filter((i) => i.reportId === rid)[0] || null;
}
export function feeOf(db: Db, eid: string): Fee | null {
  return db.fees.filter((f) => f.entrustId === eid)[0] || null;
}
export function clientName(db: Db, id: string): string { const c = get<Client>(db, 'clients', id); return c ? c.name : '—'; }
export function projName(db: Db, id: string): string { const p = get<Project>(db, 'projects', id); return p ? p.name : '—'; }
export function senderName(db: Db, id: string): string { const s = get<Sender>(db, 'senders', id); return s ? s.name : '—'; }
export function paramNames(db: Db, t: Task): string {
  return (t.paramIds || []).map((pid) => { const p = get<Param>(db, 'params', pid); return p ? p.name : ''; }).join(' / ');
}

/* 样品状态 = 其任务链最靠前状态 */
export function sampleStatus(db: Db, sp: Sample): string {
  const ts = paramsOf(db, sp.id).map((p) => taskOfParam(db, p.id)).filter(Boolean) as Task[];
  if (!ts.length) return '待分配';
  let min = 99;
  ts.forEach((t) => { const i = TASK_ORDER.indexOf(t.status); if (i >= 0 && i < min) min = i; });
  return TASK_ORDER[min];
}

/* 委托单状态机（派生+落库） */
export function refreshEntrust(db: Db, e: Entrust): void {
  let st: string;
  if (e.archived) st = '已归档';
  else {
    const rp = reportOf(db, e.id);
    if (rp && rp.status === '已发放') st = '已签发';
    else if (rp && (rp.status === '待批准' || rp.status === '已批准' || rp.status === '已打印')) st = '待审核';
    else {
      const ts = tasksOf(db, e.id);
      if (ts.length && ts.every((t) => ['待复核', '报告审批中', '已完成'].indexOf(t.status) >= 0)) st = '待复核';
      else if (ts.some((t) => t.status !== '待分配')) st = '检测中';
      else st = '已登记';
    }
  }
  e.status = st;
}

/* 审计 */
export function addLog(db: Db, user: string, action: string, target: string, tname: string, detail: string): void {
  db.logs.unshift({ t: NOW(), user, action, target, tname: tname || '', detail: detail || '' });
}
export function logsOf(db: Db, id: string): LogEntry[] {
  return db.logs.filter((l) => l.target === id);
}

/* -------- 数据追溯助手（移植自 lims-test-app.html 第 2281-2334 行） -------- */
export function typeLabelOf(id: string): string {
  const p = id.slice(0, 2);
  const map: { [k: string]: string } = {
    E: '委托单', SP: '检测样品', PM: '检测参数', TK: '检测任务', RC: '原始记录',
    ST: '检测步骤', RS: '检测结果', RP: '检测报告', PR: '打印记录', IR: '发放记录',
    FE: '费用记录', CL: '主数据·委托单位', PJ: '主数据·工程项目', SN: '主数据·送样人',
  };
  return map[p] || '实体';
}
/* eslint-disable @typescript-eslint/no-explicit-any */
export function displayNameOf(o: any, id: string): string {
  if (!o) return id;
  const p = id.slice(0, 2);
  if (p === 'E') return o.no;
  if (p === 'SP') return o.no + ' ' + o.name;
  if (p === 'PM') return o.name;
  if (p === 'TK') return o.no;
  if (p === 'RC') return o.no;
  if (p === 'ST') return o.name;
  if (p === 'RS') return '检测结果（' + o.conclusion + '）';
  if (p === 'RP') return o.no;
  if (p === 'PR') return '打印记录（' + o.printStatus + '）';
  if (p === 'IR') return '发放记录（' + o.method + '·' + o.status + '）';
  if (p === 'FE') return o.no;
  return o.name || o.no || id;
}
export function parentIdOf(db: Db, id: string): string | null {
  const o = byIdAny(db, id) as any;
  if (!o) return null;
  const p = id.slice(0, 2);
  if (p === 'SP') return o.entrustId;
  if (p === 'PM') return o.sampleId;
  if (p === 'TK') return o.paramIds && o.paramIds.length ? o.paramIds[0] : o.sampleId;
  if (p === 'RC') return o.taskId;
  if (p === 'ST') return o.recordId;
  if (p === 'RS') return o.recordId;
  if (p === 'RP') return o.entrustId;
  if (p === 'PR' || p === 'IR') return o.reportId;
  if (p === 'FE') return o.entrustId;
  return null;
}
export function childrenIdsOf(db: Db, id: string): string[] {
  const out: string[] = [];
  db.samples.forEach((x) => { if (x.entrustId === id) out.push(x.id); });
  db.params.forEach((x) => { if (x.sampleId === id) out.push(x.id); });
  /* 任务仅经参数(PM)路径收集，避免 sampleId 直连导致下游树重复展开；无参数任务回退 sampleId */
  db.tasks.forEach((x) => { const pids = x.paramIds || []; if (pids.indexOf(id) >= 0) out.push(x.id); else if (!pids.length && x.sampleId === id) out.push(x.id); });
  db.records.forEach((x) => { if (x.taskId === id) out.push(x.id); });
  db.steps.forEach((x) => { if (x.recordId === id) out.push(x.id); });
  db.results.forEach((x) => { if (x.recordId === id) out.push(x.id); });
  db.reports.forEach((x) => { if (x.entrustId === id) out.push(x.id); });
  db.prints.forEach((x) => { if (x.reportId === id) out.push(x.id); });
  db.issues.forEach((x) => { if (x.reportId === id) out.push(x.id); });
  db.fees.forEach((x) => { if (x.entrustId === id) out.push(x.id); });
  return out;
}
export function allEntityIds(db: Db): string[] {
  const out: string[] = [];
  COLLS.forEach((c) => { (db[c] as { id: string }[]).forEach((x) => out.push(x.id)); });
  return out;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/* -------- 角标计数 -------- */
export function cntAssign(db: Db): number { return db.tasks.filter((t) => t.status === '待分配').length; }
export function cntWork(db: Db): number { return db.tasks.filter((t) => t.status === '已分配' || t.status === '检测中').length; }
export function cntReview(db: Db): number {
  return db.results.filter((r) => r.status === '待复核').length + db.reports.filter((r) => r.status === '待批准').length;
}
export function cntFees(db: Db): number { return db.fees.filter((f) => f.status === '未结算' || f.status === '待退费').length; }
export function cntEntrusts(db: Db): number { return db.entrusts.filter((e) => e.status !== '已归档' && e.status !== '作废').length; }
export function cntReports(db: Db): number { return db.reports.filter((r) => r.status !== '已发放' && r.status !== '已归档').length; }
export function cntIssue(db: Db): number { return db.reports.filter((r) => r.status === '待发放' || r.status === '已打印').length; }

/* ================= 持久化 ================= */
export function loadOrInit(): Db {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(LS_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw) as Db;
      if (parsed && parsed.v === 2) return parsed;
    }
  } catch { /* 损坏则重建 */ }
  const fresh = seed();
  return fresh;
}
export function save(db: Db): void {
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(LS_KEY, JSON.stringify(db)); } catch { /* ignore */ }
}
