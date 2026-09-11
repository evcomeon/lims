/* ============================================================
 * 顶部一级菜单 + 左侧二级菜单 + 占位字段字典 + 常量
 * 移植自 lims-test-app.html 第 492-522、915-1001、1129-1189 行。
 * ============================================================ */
import type { Db } from './db';
import { cntEntrusts, cntFees, cntAssign, cntWork, cntReview } from './db';

/* ================= 常量 ================= */
export interface User { id: string; name: string; role: string; cert?: string; }
export const USERS: User[] = [
  { id: 'U1', name: '周敏', role: '检测主管' },
  { id: 'U2', name: '李强', role: '检测员', cert: 'JCe-2024-0887' },
  { id: 'U3', name: '王芳', role: '检测员', cert: 'JCe-2024-1023' },
  { id: 'U4', name: '赵鹏', role: '外检员', cert: 'WJ-2025-0456' },
  { id: 'U5', name: '钱进', role: '复核员' },
  { id: 'U6', name: '孙授权', role: '授权签字人' },
];
export const TESTERS = ['李强', '王芳', '赵鹏'];
export const DEPTS = ['试验检测一室', '试验检测二室', '外检项目组'];
export const INSTR = ['2000kN压力试验机（YQ-0102）', '600kN万能试验机（YQ-0056）', '超声检测仪（YQ-0207）', '钢直尺 300mm（YQ-0034）'];
export const PAY_WAYS = ['延后付费', '现金', '银行转账', '支票'];
export const ISSUE_WAYS = ['自取', '邮寄', '电子报告'];

export const DEFAULT_USER = '周敏';

/* 状态→颜色类名映射（chip 用） */
export const ST: Record<string, string> = {
  '待分配': 'gray', '已登记': 'gray', '待检测': 'gray', '待执行': 'gray', '待生成': 'gray', '编制中': 'grayblue', '未签章': 'gray',
  '已分配': 'blue2', '检测中': 'blue', '试验检测中': 'blue', '已收样': 'blue2',
  '待复核': 'cyan', '复核确认中': 'cyan',
  '报告审批中': 'orange', '待审核': 'orange', '待批准': 'orange', '未结算': 'orange', '待打印': 'orange', '龄期预警': 'orange', '待退费': 'orange',
  '复核通过': 'green', '已批准': 'green', '合格': 'green', '已完成': 'green', '已结算': 'green', '已签章': 'purple', '已打印': 'purple',
  '已发放': 'green2', '已签发': 'green2',
  '不合格': 'red', '已驳回': 'red', '指标不合格': 'red',
  '已归档': 'slate', '已退费': 'slate',
};

export function userByName(n: string): User | null {
  for (let i = 0; i < USERS.length; i++) if (USERS[i].name === n) return USERS[i];
  return null;
}

/* ================= 顶部一级菜单 ================= */
export interface TopMenuItem { key: string; label: string; }
export const TOPMENU: TopMenuItem[] = [
  { key: 'home', label: '首页' },
  { key: 'tuo', label: '委托/收样' },
  { key: 'wai', label: '外检项目' },
  { key: 'jing', label: '经营管理' },
  { key: 'jian', label: '试验检测' },
  { key: 'bao', label: '报告管理' },
  { key: 'more', label: '更多' },
];

/* ================= 左侧二级菜单 ================= */
export type SideGroupKey = '业务' | '主数据' | '统计' | '配置' | '数据' | '系统';
export interface SideItem {
  key: string;
  label: string;
  page: string;
  impl: boolean;
  icon: string;
  cnt?: (db: Db) => number;
  group: SideGroupKey;
  parent: string;
  children: string;
}
export type SideGroups = Record<string, SideItem[]>;

export const SIDEGROUPS: SideGroups = {
  tuo: [
    { key: 'entrusts', label: '委托管理', page: 'entrusts', impl: true, icon: '📋', cnt: cntEntrusts, group: '业务', parent: '委托单', children: '样品 / 费用 / 任务 / 报告' },
    { key: 'clientMgmt', label: '委托单位管理', page: 'clientMgmt', impl: false, icon: '🏢', group: '主数据', parent: '委托单 → 委托单位', children: '工程项目 / 送样人 / 合同' },
    { key: 'projectMgmt', label: '工程项目管理', page: 'projectMgmt', impl: false, icon: '🏗️', group: '主数据', parent: '委托单位 → 工程项目', children: '委托单 / 收样 / 合同' },
    { key: 'senderMgmt', label: '送样人员管理', page: 'senderMgmt', impl: false, icon: '👤', group: '主数据', parent: '委托单位 → 送样人', children: '委托单 → 联系人 / 电话' },
    { key: 'sampleRsv', label: '来样/预约管理', page: 'sampleRsv', impl: false, icon: '📦', group: '业务', parent: '委托单 → 样品预约', children: '样品接收 / 逾期预警' },
    { key: 'entrustStat', label: '委托信息统计', page: 'entrustStat', impl: false, icon: '📊', group: '统计', parent: '委托单汇总', children: '按状态 / 单位 / 项目' },
    { key: 'sampleTrend', label: '收样走势图', page: 'sampleTrend', impl: false, icon: '📈', group: '统计', parent: '样品 → 收样时间序列', children: '日报 / 周报 / 月报' },
    { key: 'sampleCat', label: '收样样品分类统计', page: 'sampleCat', impl: false, icon: '📉', group: '统计', parent: '样品 → 类别维度', children: '材料 / 工程部位 / 试验类型' },
    { key: 'pkgParams', label: '打包参数管理', page: 'pkgParams', impl: false, icon: '🎯', group: '配置', parent: '样品 → 检测参数包', children: '参数 / 方法 / 依据' },
  ],
  wai: [
    { key: 'onsiteBoard', label: '项目看板', page: 'onsiteBoard', impl: false, icon: '📺', group: '业务', parent: '工程项目 → 现场', children: '任务 / 人员 / 进度' },
    { key: 'onsiteList', label: '项目管理', page: 'onsiteList', impl: false, icon: '📁', group: '业务', parent: '外检项目 → 任务', children: '抽样 / 送检 / 归档' },
  ],
  jing: [
    { key: 'fees', label: '检测收费', page: 'fees', impl: true, icon: '💰', cnt: cntFees, group: '业务', parent: '委托单 → 费用单', children: '结算 / 退费 / 发票' },
    { key: 'credit', label: '信用管理', page: 'credit', impl: false, icon: '⭐', group: '业务', parent: '委托单位 → 信用评级', children: '欠费 / 付款及时性' },
    { key: 'contract', label: '合同管理', page: 'contract', impl: false, icon: '📑', group: '业务', parent: '委托单位 ↔ 检测机构', children: '合同审核 / 到期' },
    { key: 'chargeStat', label: '收费统计', page: 'chargeStat', impl: false, icon: '💹', group: '统计', parent: '费用 → 已收汇总', children: '按月 / 单位 / 项目' },
    { key: 'arrearsStat', label: '欠费统计', page: 'arrearsStat', impl: false, icon: '💸', group: '统计', parent: '费用 → 未收汇总', children: '逾期 / 账龄' },
    { key: 'contractCost', label: '合同费用统计', page: 'contractCost', impl: false, icon: '📊', group: '统计', parent: '合同 ↔ 费用', children: '合同金额 / 已结 / 未结' },
    { key: 'arrearsM', label: '欠费管理', page: 'arrearsM', impl: false, icon: '⚠️', group: '业务', parent: '费用 → 催缴', children: '催款记录 / 停单' },
    { key: 'contractRev', label: '合同审核', page: 'contractRev', impl: false, icon: '✔️', group: '业务', parent: '合同 → 审核流程', children: '初审 / 复核 / 批准' },
  ],
  jian: [
    { key: 'assign', label: '任务分配', page: 'assign', impl: true, icon: '👥', cnt: cntAssign, group: '业务', parent: '委托单 → 任务', children: '分配到检测员' },
    { key: 'work', label: '试验任务', page: 'work', impl: true, icon: '🔬', cnt: cntWork, group: '业务', parent: '任务 → 检测', children: '原始记录 / 结果' },
    { key: 'review', label: '试验复核', page: 'review', impl: true, icon: '✅', cnt: cntReview, group: '业务', parent: '结果 → 复核', children: '四眼原则 / 批准' },
    { key: 'onsiteTestM', label: '项目检测管理', page: 'onsiteTestM', impl: false, icon: '🚧', group: '业务', parent: '外检项目 → 检测', children: '现场记录' },
    { key: 'resultStat', label: '试验检测结果统计', page: 'resultStat', impl: false, icon: '📊', group: '统计', parent: '结果汇总', children: '合格率 / 不合格率' },
    { key: 'failSearch', label: '不合格试验查询', page: 'failSearch', impl: false, icon: '🔍', group: '业务', parent: '结果 → 不合格', children: '原因分析 / 复检' },
    { key: 'overdueStat', label: '检测超期统计', page: 'overdueStat', impl: false, icon: '⏰', group: '统计', parent: '任务 → 超期', children: '3天 / 7天 / 超长' },
    { key: 'taskAmtStat', label: '检测任务量统计', page: 'taskAmtStat', impl: false, icon: '📈', group: '统计', parent: '任务 → 数量', children: '日 / 周 / 月' },
    { key: 'manhourStat', label: '检测工时统计', page: 'manhourStat', impl: false, icon: '⌛', group: '统计', parent: '任务 → 工时', children: '人均 / 项目' },
    { key: 'paramCovStat', label: '检测参数覆盖统计', page: 'paramCovStat', impl: false, icon: '🎯', group: '统计', parent: '参数覆盖', children: '已覆盖 / 未覆盖' },
    { key: 'paramStat', label: '检测参数统计', page: 'paramStat', impl: false, icon: '📋', group: '统计', parent: '参数 → 用量', children: '热门参数' },
    { key: 'containerM', label: '试验容器管理', page: 'containerM', impl: false, icon: '🧪', group: '主数据', parent: '样品 → 容器', children: '规格 / 状态' },
    { key: 'gradingCfg', label: '设计级配范围配置', page: 'gradingCfg', impl: false, icon: '⚖️', group: '配置', parent: '配合比 → 级配', children: '设计 / 施工' },
    { key: 'testValueStat', label: '检测产值统计', page: 'testValueStat', impl: false, icon: '💎', group: '统计', parent: '任务 → 产值', children: '金额汇总' },
    { key: 'prodValueStat', label: '生产产值统计', page: 'prodValueStat', impl: false, icon: '🏭', group: '统计', parent: '检测 → 生产产值', children: '效益分析' },
    { key: 'envRecord', label: '环境条件记录查询', page: 'envRecord', impl: false, icon: '🌡️', group: '业务', parent: '检测 → 环境', children: '温湿度 / 合规' },
  ],
  bao: [
    /* 注：参考 SIDEGROUPS.bao 中 reportRev 标 impl:false，但 PAGES.reportRev 存在（委托 reports('编制中')）。
       React 中视为 impl:true，打开 Reports 传 statusFilter='编制中'。此处保留 impl:false 与参考一致，由路由层特殊处理。 */
    { key: 'reportRev', label: '报告审核', page: 'reportRev', impl: false, icon: '🔍', group: '业务', parent: '结果 → 报告初稿', children: '审核人 / 审核意见' },
    { key: 'approve', label: '报告批准', page: 'approve', impl: true, icon: '✔️', group: '业务', parent: '结果 → 报告审核', children: '编制人 / 审核人' },
    { key: 'print', label: '报告打印', page: 'print', impl: true, icon: '🖨️', group: '业务', parent: '报告 → 打印', children: '批次 / 份数' },
    { key: 'sealM', label: '报告盖章管理', page: 'sealM', impl: false, icon: '🔏', group: '业务', parent: '报告 → 盖章', children: '公章 / 电子章' },
    { key: 'issue', label: '报告发放', page: 'issue', impl: true, icon: '📤', group: '业务', parent: '报告 → 发放', children: '客户 / 邮寄' },
    { key: 'archive', label: '资料归档', page: 'archive', impl: false, icon: '🗄️', group: '业务', parent: '报告 → 归档', children: '纸质 / 电子' },
    { key: 'comprehensiveQ', label: '综合查询', page: 'comprehensiveQ', impl: false, icon: '🔎', group: '业务', parent: '跨表查询', children: '委托 / 样品 / 报告' },
    { key: 'reprint', label: '重打&修改审批', page: 'reprint', impl: false, icon: '🔁', group: '业务', parent: '报告 → 修订', children: '审批 / 版本' },
    { key: 'dataStatusQ', label: '数据状态查询', page: 'dataStatusQ', impl: false, icon: '🚦', group: '业务', parent: '数据状态', children: '异常 / 堵塞' },
    { key: 'reportLedger', label: '检测报告台账', page: 'reportLedger', impl: false, icon: '📚', group: '统计', parent: '报告 → 台账', children: '列表 / 汇总' },
    { key: 'reportRegu', label: '上报监管系统', page: 'reportRegu', impl: false, icon: '📡', group: '业务', parent: '报告 → 监管上报', children: '交通部 / 省厅' },
    { key: 'transportR', label: '交通专项整治上报', page: 'transportR', impl: false, icon: '🚦', group: '业务', parent: '专项上报', children: '专题 / 批量' },
    { key: 'mailInfoCfg', label: '邮寄信息配置', page: 'mailInfoCfg', impl: false, icon: '📮', group: '配置', parent: '发放 → 邮寄', children: '收件人 / 地址' },
    { key: 'printStat', label: '报告打印统计', page: 'printStat', impl: false, icon: '📊', group: '统计', parent: '打印 → 汇总', children: '份数 / 类型' },
    { key: 'issueStat', label: '报告发放统计', page: 'issueStat', impl: false, icon: '📈', group: '统计', parent: '发放 → 汇总', children: '客户 / 方式' },
    { key: 'esign', label: '电子签名', page: 'esign', impl: false, icon: '✍️', group: '配置', parent: '报告 → 电子签', children: 'CA证书 / 时间戳' },
  ],
  more: [
    { key: 'trace', label: '数据追溯', page: 'trace', impl: true, icon: '🧭', group: '数据', parent: '跨实体追溯', children: '正向 / 反向' },
    { key: 'audit', label: '审计日志', page: 'audit', impl: true, icon: '📜', group: '数据', parent: '操作日志', children: '用户 / 动作 / 对象' },
    { key: 'master', label: '主数据', page: 'master', impl: true, icon: '🗂️', group: '数据', parent: '基础数据', children: '人员 / 设备 / 参数' },
    { key: 'roles', label: '角色权限', page: 'roles', impl: false, icon: '🔐', group: '系统', parent: '用户 → 角色 → 权限', children: '四眼原则' },
    { key: 'settings', label: '系统设置', page: 'settings', impl: false, icon: '⚙️', group: '系统', parent: '系统参数', children: '编号规则 / 流程' },
    { key: 'help', label: '帮助文档', page: 'help', impl: false, icon: '❓', group: '系统', parent: '操作手册', children: '流程 / 字段' },
  ],
};

export function findItemByPage(pageKey: string): SideItem | null {
  for (const k in SIDEGROUPS) {
    for (let i = 0; i < SIDEGROUPS[k].length; i++) {
      if (SIDEGROUPS[k][i].page === pageKey) return SIDEGROUPS[k][i];
    }
  }
  return null;
}

/* 详情页/非侧边栏页 → 所属顶部菜单 key（用于 tab 切换时同步侧边栏） */
const DETAIL_PAGE_TOP: Record<string, string> = {
  entrustDetail: 'tuo', entrustNew: 'tuo',
  taskDetail: 'jian',
  reportDetail: 'bao',
};

export function topKeyOfPage(pageKey: string): string | null {
  if (pageKey === 'home') return 'home';
  for (const k in SIDEGROUPS) {
    for (let i = 0; i < SIDEGROUPS[k].length; i++) {
      if (SIDEGROUPS[k][i].page === pageKey) return k;
    }
  }
  return DETAIL_PAGE_TOP[pageKey] || null;
}

/* 在 SIDEGROUPS 中按 key 找菜单项，并返回所属顶部菜单 key */
export function findItemByKey(itemKey: string): { item: SideItem; topKey: string } | null {
  for (const k in SIDEGROUPS) {
    for (let i = 0; i < SIDEGROUPS[k].length; i++) {
      if (SIDEGROUPS[k][i].key === itemKey) return { item: SIDEGROUPS[k][i], topKey: k };
    }
  }
  return null;
}

/* ================= 各模块的字段规划字典（截图识别 + iLIS 标准） ================= */
export const PLACEHOLDER_FIELDS: Record<string, string[]> = {
  clientMgmt: ['编号 / 单位名称 / 简称 / 统一社会信用代码', '联系人 / 联系电话 / 邮箱 / 地址', '信用等级 (A/B/C/D) / 账期 / 授信金额', '附件 (营业执照 / 资质证书)', '关联: 工程项目、送样人员、合同'],
  projectMgmt: ['编号 / 项目名称 / 项目编号 / 合同编号', '委托单位 (来自委托单位)', '项目地点 / 工程类型 / 公路等级', '开工日期 / 竣工日期 / 预计工期', '负责人 / 联系电话 / 备注', '关联: 委托单、外检任务'],
  senderMgmt: ['编号 / 姓名 / 所属委托单位', '手机 / 邮箱 / 身份证号', '职务 / 授权范围 / 默认联系', '送样次数 / 最后送样日期', '关联: 委托单 → 送样人'],
  sampleRsv: ['预约编号 / 委托单位 / 工程项目', '预约送样日期 / 实际收样日期', '样品名称 / 规格 / 数量', '检测项目 / 接收人', '状态: 待接收 / 已接收 / 逾期', '关联: 委托单 → 样品'],
  entrustStat: ['按状态分组: 待提交 / 检测中 / 已完成 / 已归档', '按委托单位分组: TOP 10', '按项目分组: 项目维度', '按收样时间段分组', '导出: 月度报表'],
  sampleTrend: ['时间维度: 日 / 周 / 月', '送样量 / 收样量 / 预约量', '同比 / 环比', '按样品类型叠加'],
  sampleCat: ['按材料分类: 混凝土 / 钢筋 / 基桩 / 砂浆', '按工程部位: 桩基 / 墩台 / 梁板', '按试验类型: 力学 / 化学 / 耐久性', '占比饼图'],
  pkgParams: ['打包编号 / 打包名称', '适用样品类型 / 工程部位', '包含的参数列表 (从参数库选择)', '检测依据 / 优先级', '关联: 委托单 → 样品 → 参数包'],

  onsiteBoard: ['项目卡片: 项目名 / 进度条 / 工期', '现场任务: 待抽样 / 已抽样 / 检测中', '现场人员: 检测员定位 (可选地图)', '现场照片 / 视频证据', '预警: 超期 / 异常'],
  onsiteList: ['项目编号 / 项目名称 / 委托单位', '现场负责人 / 检测员 / 抽样员', '现场抽样记录 / 现场检测原始数据', '状态: 准备 / 抽样 / 检测 / 提交', '关联: 委托单 → 外检任务 → 结果'],

  credit: ['单位编号 / 单位名称 / 信用等级', '评估日期 / 评估人', '按时付款率 / 平均账期 / 历史欠费', '评级: A (优) / B (良) / C (差) / D (黑名单)', '影响: 委托单是否拦截'],
  contract: ['合同编号 / 合同名称 / 委托单位', '签订日期 / 生效日期 / 到期日期', '合同金额 / 检测项目 / 检测量', '附件 (合同扫描件)', '状态: 草稿 / 待审 / 生效 / 终止', '关联: 委托单 → 合同 → 费用'],
  chargeStat: ['时间维度: 月 / 季 / 年', '已收金额 / 应收金额 / 回收率', '按委托单位 / 按项目', '同比 / 环比', '导出: 财务凭证'],
  arrearsStat: ['欠费总额 / 笔数 / 账龄分布', '按委托单位 / 按项目', '逾期 30 天 / 60 天 / 90 天', '催缴记录 / 停单阈值'],
  contractCost: ['合同金额 / 已发生费用 / 未结算费用', '按合同分组 / 按检测项目', '完成率 / 节超比'],
  arrearsM: ['欠费编号 / 委托单位 / 委托单', '欠费金额 / 账龄 / 最后催缴', '催缴方式: 短信 / 邮件 / 电话', '催缴人 / 催缴日期', '措施: 警告 / 停单 / 法律函'],
  contractRev: ['合同编号 / 合同名称', '审核人 / 审核意见 / 审核结果', '初审 / 复审 / 终审', '附件 / 历史版本'],

  onsiteTestM: ['外检任务编号 / 关联外检项目', '现场检测员 / 抽样员', '现场原始数据 / 现场照片', '检测方法 / 检测依据', '关联: 外检项目 → 检测任务 → 结果'],
  resultStat: ['时间维度 / 项目维度 / 检测员维度', '总检测数 / 合格数 / 不合格数', '合格率 / 不合格率 / 趋势', '导出: 检测报表'],
  failSearch: ['不合格项目编号 / 样品 / 检测参数', '实测值 / 标准值 / 偏差', '原因分类: 设备 / 方法 / 环境 / 人为', '复检任务 / 复检结果', '关联: 结果 → 复检'],
  overdueStat: ['超期任务数 / 占比 / 平均超期天数', '按检测员 / 按检测类型', '超期 3 天 / 7 天 / 30 天 / 长期', '预警: 即将超期'],
  taskAmtStat: ['检测任务总量 / 检测样品总量', '日维度 / 周维度 / 月维度', '按检测员人均 / 按部门', '趋势对比'],
  manhourStat: ['总工时 / 人均工时', '按检测员 / 按检测类型 / 按设备', '有效工时 / 等待工时', '工时利用率'],
  paramCovStat: ['参数库总数 / 已覆盖 / 未覆盖', '按样品类型覆盖度', '覆盖率 TOP 10 / 末位 10', '建议补充参数'],
  paramStat: ['参数编号 / 参数名称', '使用频次 / 关联样品数', '检测依据 / 标准号 / 版本', '单价 / 收费参考'],
  containerM: ['容器编号 / 容器名称 / 规格', '适用样品类型 / 容量', '状态: 在用 / 空闲 / 报废', '位置 / 领用人'],
  gradingCfg: ['级配类型 / 设计范围 (上限 / 下限)', '适用工程部位 / 材料', '筛孔尺寸序列 / 通过率', '依据: JTG/T F30 / JTG E30 等'],
  testValueStat: ['检测任务数 / 检测产值', '时间维度 / 检测员维度 / 项目维度', '同比 / 环比', '导出: 财务报表'],
  prodValueStat: ['检测 → 产值转换率', '成本 / 收入 / 利润率', '按月 / 按季 / 按年', '生产效率分析'],
  envRecord: ['环境编号 / 检测任务', '温度 / 湿度 / 气压', '记录时间 / 记录人', '合规判定', '依据: GB/T 50082 / JTG E30'],

  sealM: ['报告编号 / 盖章类型: 公章 / 电子章 / 检验章', '盖章人 / 盖章日期', '用印记录 / 授权记录', '作废记录 / 重盖记录', '关联: 报告 → 盖章'],
  archive: ['归档编号 / 报告编号 / 委托单', '归档日期 / 保管期限 / 存放介质', '纸质位置 / 电子位置', '查阅记录 / 借阅审批', '关联: 报告 → 档案'],
  comprehensiveQ: ['查询条件: 委托编号 / 样品 / 报告 / 客户 / 项目 / 时间范围', '返回: 多实体联表结果', '导出: Excel / PDF', '权限控制: 仅可见授权数据'],
  reprint: ['重打报告编号 / 原报告版本', '重打原因 / 申请人 / 审批人', '修改内容 / 修改前后对比', '审批流程 / 版本号', '关联: 报告 → 修订版'],
  dataStatusQ: ['委托单号 / 数据状态', '阻塞点 / 异常类型', '处理人 / 处理时间', '预警: 长期未处理'],
  reportLedger: ['报告编号 / 委托编号 / 客户 / 项目', '状态: 编制 / 审核 / 批准 / 打印 / 发放 / 归档', '时间线 / 操作日志', '导出: 台账报表'],
  reportRegu: ['上报批次 / 上报单位', '上报系统: 交通部 / 省厅 / 监管平台', '上报格式 / 接口状态', '回执 / 错误重试', '关联: 报告 → 监管上报'],
  transportR: ['专项整治类型 / 时间段', '专项报告列表 / 汇总数据', '上报状态 / 上报日期'],
  mailInfoCfg: ['邮寄编号 / 收件人 / 单位 / 地址', '快递公司 / 单号 / 邮费', '寄出日期 / 签收日期', '关联: 报告 → 发放 → 邮寄'],
  printStat: ['打印次数 / 报告份数 / 客户', '时间维度: 日 / 周 / 月', '按打印员 / 按报告类型', '同比 / 环比'],
  issueStat: ['发放方式: 自取 / 邮寄 / 电子', '发放份数 / 客户数', '时间维度 / 按客户', '签收率 / 异常率'],
  esign: ['电子签名证书 / CA 机构', '签名人 / 证书有效期', '签名记录 / 时间戳', '验证记录 / 撤销记录', '关联: 报告 → 电子签名'],

  roles: ['角色编号 / 角色名称', '权限列表 / 数据范围', '用户列表 (多对多)', '四眼原则配置: 哪些动作需要复核人不同', '关联: 用户 → 角色 → 权限'],
  settings: ['编号规则: 委托单前缀 / 报告前缀', '流程配置: 各阶段责任人', '系统参数: 默认账期 / 信用阈值', '备份恢复 / 日志保留期'],
  help: ['操作手册 / 字段说明', '常见问题 FAQ', '流程图 / 状态机说明', '联系技术支持'],
};

export function inferFields(pageKey: string): string[] {
  return PLACEHOLDER_FIELDS[pageKey] || [
    '字段 1 / 字段 2 / 字段 3',
    '字段 4 / 字段 5 / 字段 6',
    '关联字段 (外键) / 业务状态',
    '创建人 / 创建时间 / 修改人 / 修改时间',
  ];
}
