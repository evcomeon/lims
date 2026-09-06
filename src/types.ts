export type WorkflowNodeId = 
  | 'sample_receiving'   // 1. 委托收样
  | 'fee_collection'     // 2. 检测收费
  | 'task_assignment'    // 3. 任务分配
  | 'testing'            // 4. 试验检测
  | 'review'             // 5. 复核确认
  | 'report_audit'       // 6. 报告审核
  | 'report_approval'    // 7. 报告批准
  | 'report_print'       // 8. 报告打印
  | 'report_delivery';   // 9. 报告领取

export type StatusCode = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'VOID';

export interface WorkflowNodeInfo {
  id: WorkflowNodeId;
  name: string;
  code: string;
  step: number;
  description: string;
  pendingCount: number;
  iconName: string;
}

export type UserRole = 
  | 'ALL'             // 系统管理员 (全权限)
  | 'RECEIVER'        // 收样员
  | 'CASHIER'         // 收费员
  | 'DISPATCHER'      // 任务分配主任
  | 'TESTER'          // 检测工程师
  | 'REVIEWER'        // 复核员
  | 'AUDITOR'         // 报告审核人
  | 'APPROVER'        // 报告批准人 (授权签字人)
  | 'PRINTER'         // 打印归档员
  | 'DISPATCH_CLERK'; // 报告发放员

export interface HistoryRecord {
  id: string;
  nodeId: WorkflowNodeId;
  nodeName: string;
  operator: string;
  operatorRole: string;
  action: string;
  timestamp: string;
  status: StatusCode;
  remark?: string;
  rejectReason?: string;
}

export interface SampleItem {
  id: string;
  sampleCode: string;       // 样品编号: 如 S001
  sampleName: string;       // 样品名称: 如 混凝土立方体试块
  specModel: string;        // 规格型号: 如 150×150×150 mm
  quantity: number;         // 数量: 3
  unit: string;             // 组 / 个 / 根
  status: '待收样' | '已收样' | '检测中' | '已完成';
  barcode?: string;
  location?: string;
}

export interface TestProjectItem {
  id: string;
  projectName: string;      // 检测项目: 抗压强度
  testStandard: string;     // 检测标准: GB/T 50081-2019
  unitPrice: number;        // 单价
  quantity: number;         // 数量
  totalAmount: number;      // 金额
}

export interface RawTestItem {
  sampleIndex: number;
  dimensions?: { length: number; width: number; height: number };
  load: number;
  calculatedStrength: number;
}

// 试验原始数据及计算
export interface ConcreteTestRawData {
  specimen1Area?: number;    // 承压面积 mm² (150*150 = 22500)
  specimen1Load?: number;    // 破坏荷载 kN
  specimen2Area?: number;
  specimen2Load?: number;
  specimen3Area?: number;
  specimen3Load?: number;
  strength1?: number;       // 计算单值 MPa
  strength2?: number;
  strength3?: number;
  averageStrength?: number; // 计算代表值 MPa
  designGrade?: string;      // 设计等级 如 C30
  verdict?: '合格' | '不合格' | '待评定';
  testEquipment?: string;    // 设备
  temperature?: string;      // 环境温度
  humidity?: string;         // 湿度

  // 扩展录入字段
  testDate?: string;
  equipmentUsed?: string;
  items?: RawTestItem[];
  representativeValue?: number;
  designRequirement?: string;
  judgment?: string;
}

export type RawTestData = ConcreteTestRawData;

export interface TestTask {
  id: string;
  taskCode: string;         // T001
  orderCode: string;        // WT001
  clientName: string;       // 委托单位
  sampleCode: string;       // S001
  sampleName: string;       // 混凝土试块
  testProject: string;      // 抗压强度
  standard: string;         // GB/T 50081-2019
  assigneeName?: string;    // 检测人员
  equipment?: string;       // 检测设备
  planDate?: string;        // 计划检测日期
  priority: '普通' | '加急' | '特急';
  status: '待分配' | '待检测' | '检测中' | '待复核' | '已复核' | '已退回' | '退回修改';
  assignedTime?: string;
  submitTime?: string;
  testData?: ConcreteTestRawData;
  reviewComment?: string;
  reviewerName?: string;
  reviewTime?: string;
}

export interface InspectionReport {
  id: string;
  reportCode: string;       // BG001
  orderCode: string;        // WT001
  taskCodes: string[];      // [T001]
  clientName: string;       // 委托单位
  sampleName: string;       // 样品名称
  testCategory: string;     // 检测类型: 建筑材料工程检测
  testProject: string;      // 检测项目
  conclusion: string;       // 结论
  summaryData: string;      // 关键测试数据
  status: '待审核' | '待批准' | '待打印' | '待领取' | '已领取' | '已退回';
  
  // 编制信息
  drafter?: string;
  drafterName?: string;
  draftTime?: string;
  
  // 审核信息
  auditor?: string;
  auditorName?: string;
  auditTime?: string;
  auditComment?: string;
  
  // 批准信息
  approver?: string;
  approverName?: string;
  approveTime?: string;
  approveComment?: string;
  
  // 打印信息
  printCopies: number;
  printedCopies: number;
  printTime?: string;
  printerName?: string;
  printCount: number;
  
  // 领取信息
  deliverTime?: string;
  receiverName?: string;
  receiverPhone?: string;
  deliveryMethod?: '现场领取' | '邮寄' | '其他';
  trackingNumber?: string;
  deliveryRemark?: string;
}

export interface CommissionOrder {
  id: string;
  orderCode: string;        // WT001
  clientName: string;       // XX建筑工程有限公司
  contactPerson: string;    // 张经理
  contactPhone: string;     // 13800138000
  orderDate: string;        // 2026-09-06
  testType: string;         // 见证取样检测
  projectTitle: string;     // 金湖湾花园一期工程
  
  // 费用
  receivableAmount: number; // 应收金额
  paidAmount: number;       // 已收金额
  unpaidAmount: number;     // 未收金额
  feeStatus: '待收费' | '部分收费' | '已收费';
  paymentMethod?: string;
  invoiceTitle?: string;
  
  // 状态与流程
  currentStep: WorkflowNodeId;
  overallStatus: StatusCode;
  
  // 子列表
  samples: SampleItem[];
  testProjects: TestProjectItem[];
  tasks: TestTask[];
  report?: InspectionReport;
  history: HistoryRecord[];
}

export interface NotificationItem {
  id: string;
  type: 'TASK_ASSIGNED' | 'TEST_SUBMITTED' | 'AUDIT_REJECTED' | 'REPORT_APPROVED' | 'INFO';
  title: string;
  content: string;
  time: string;
  read: boolean;
  orderCode?: string;
  nodeId?: WorkflowNodeId;
}

export interface PrdOpenIssues {
  allowAssignBeforePaid: boolean;      // 问题1: 是否允许未收费直接进入任务分配
  allowSplitMultipleTasks: boolean;    // 问题2: 一个委托是否允许拆成多个检测任务
  rejectToNode: 'PREVIOUS' | 'TESTING';// 问题3: 复核/审核退回到哪个节点 (退回试验检测 vs 退回上一节点)
  allowModifyAfterApproved: boolean;   // 问题4: 报告批准后是否允许修改
  supportDigitalDelivery: boolean;     // 问题5: 报告领取是否支持邮寄/电子报告
  statScopeMode: 'PENDING_ONLY' | 'ALL_ACTIVE'; // 问题6: 首页9个数字的统计口径
}
