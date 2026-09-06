import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  CommissionOrder, 
  WorkflowNodeId, 
  UserRole, 
  NotificationItem, 
  PrdOpenIssues, 
  WorkflowNodeInfo,
  ConcreteTestRawData,
  StatusCode
} from '../types';
import { 
  INITIAL_NODE_INFOS, 
  INITIAL_ORDERS, 
  INITIAL_NOTIFICATIONS, 
  DEFAULT_PRD_ISSUES 
} from '../mockData';

interface LimsContextType {
  orders: CommissionOrder[];
  activeNode: WorkflowNodeId | null; // null = Dashboard/Home
  setActiveNode: (node: WorkflowNodeId | null) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  prdIssues: PrdOpenIssues;
  setPrdIssues: React.Dispatch<React.SetStateAction<PrdOpenIssues>>;
  nodeInfos: WorkflowNodeInfo[];
  
  // History timeline modal
  viewingWorkflowOrder: CommissionOrder | null;
  setViewingWorkflowOrder: (order: CommissionOrder | null) => void;
  openWorkflowTimeline: (orderCode: string) => void;

  // Rejection modal
  rejectModalState: {
    isOpen: boolean;
    title: string;
    sourceNode: WorkflowNodeId | null;
    orderId: string;
    taskId?: string;
    reportId?: string;
  };
  openRejectModal: (params: { orderId: string; sourceNode: WorkflowNodeId; title: string; taskId?: string; reportId?: string }) => void;
  closeRejectModal: () => void;
  confirmReject: (reason: string) => void;

  // Workflow Actions
  createOrder: (newOrder: Partial<CommissionOrder>) => void;
  confirmSampleReceive: (orderId: string, remark?: string) => void;
  collectFee: (orderId: string, amount: number, paymentMethod: string, invoiceTitle?: string) => void;
  assignTask: (taskId: string, assigneeName: string, equipment: string, planDate: string, priority: '普通' | '加急' | '特急', remark?: string) => void;
  submitTestResult: (taskId: string, rawData: ConcreteTestRawData) => void;
  reviewPass: (taskId: string, comment: string) => void;
  auditPass: (reportId: string, comment: string) => void;
  approvePass: (reportId: string, comment: string) => void;
  printReport: (reportId: string, copies: number, printMode: string) => void;
  deliverReport: (reportId: string, receiverName: string, receiverPhone: string, deliveryMethod: '现场领取' | '邮寄' | '其他', trackingNumber?: string, remark?: string) => void;
  
  // Helper for role permissions based on PRD 19
  canPerformAction: (actionType: 'VIEW' | 'CREATE' | 'EDIT' | 'SUBMIT' | 'REJECT' | 'AUDIT' | 'APPROVE', pageNode: WorkflowNodeId) => boolean;

  // Quick reset to demo state
  resetAllData: () => void;
}

const LimsContext = createContext<LimsContextType | undefined>(undefined);

export const LimsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<CommissionOrder[]>(() => {
    const saved = localStorage.getItem('lims_orders_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_ORDERS;
  });

  const [activeNode, setActiveNode] = useState<WorkflowNodeId | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>('ALL');
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [prdIssues, setPrdIssues] = useState<PrdOpenIssues>(DEFAULT_PRD_ISSUES);
  
  const [viewingWorkflowOrder, setViewingWorkflowOrder] = useState<CommissionOrder | null>(null);
  
  const [rejectModalState, setRejectModalState] = useState<{
    isOpen: boolean;
    title: string;
    sourceNode: WorkflowNodeId | null;
    orderId: string;
    taskId?: string;
    reportId?: string;
  }>({
    isOpen: false,
    title: '退回确认',
    sourceNode: null,
    orderId: '',
  });

  useEffect(() => {
    localStorage.setItem('lims_orders_v1', JSON.stringify(orders));
  }, [orders]);

  const resetAllData = () => {
    setOrders(INITIAL_ORDERS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setPrdIssues(DEFAULT_PRD_ISSUES);
    localStorage.removeItem('lims_orders_v1');
  };

  const openWorkflowTimeline = (orderCode: string) => {
    const order = orders.find(o => o.orderCode === orderCode);
    if (order) {
      setViewingWorkflowOrder(order);
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // Node counts calculation
  // Keeps the base numbers from PRD (e.g. 22004, 27, 4510, 187, 99, 1205, 15377) while dynamically reflecting runtime changes
  const nodeInfos: WorkflowNodeInfo[] = INITIAL_NODE_INFOS.map(node => {
    // calculate delta from initial orders vs current orders for this step
    const currentOrdersInStep = orders.filter(o => o.currentStep === node.id).length;
    const initialOrdersInStep = INITIAL_ORDERS.filter(o => o.currentStep === node.id).length;
    const delta = currentOrdersInStep - initialOrdersInStep;
    
    // In sample_receiving: if there are newly added orders
    let base = node.pendingCount;
    const count = Math.max(0, base + delta);
    return {
      ...node,
      pendingCount: count,
    };
  });

  const openRejectModal = (params: { orderId: string; sourceNode: WorkflowNodeId; title: string; taskId?: string; reportId?: string }) => {
    setRejectModalState({
      isOpen: true,
      title: params.title,
      sourceNode: params.sourceNode,
      orderId: params.orderId,
      taskId: params.taskId,
      reportId: params.reportId,
    });
  };

  const closeRejectModal = () => {
    setRejectModalState(prev => ({ ...prev, isOpen: false }));
  };

  // PRD 18: Uniform Rejection Mechanism
  const confirmReject = (reason: string) => {
    const { orderId, sourceNode, taskId, reportId } = rejectModalState;
    if (!orderId || !sourceNode) return;

    const now = new Date().toLocaleString('zh-CN', { hour12: false });
    const operator = currentRole === 'ALL' ? '质控审核员' : getRoleName(currentRole);

    setOrders(prevOrders => prevOrders.map(order => {
      if (order.id !== orderId) return order;

      // Target node according to PRD open issue setting
      let targetNode: WorkflowNodeId = 'testing';
      if (prdIssues.rejectToNode === 'PREVIOUS') {
        if (sourceNode === 'review') targetNode = 'testing';
        else if (sourceNode === 'report_audit') targetNode = 'review';
        else if (sourceNode === 'report_approval') targetNode = 'report_audit';
      } else {
        // Direct return to testing
        targetNode = 'testing';
      }

      const updatedHistory = [
        ...order.history,
        {
          id: `h-rej-${Date.now()}`,
          nodeId: sourceNode,
          nodeName: getNodeName(sourceNode),
          operator,
          operatorRole: getRoleName(currentRole),
          action: `【操作退回】退回至 [${getNodeName(targetNode)}]。退回原因：${reason}`,
          timestamp: now,
          status: 'REJECTED' as StatusCode,
          rejectReason: reason,
        }
      ];

      // Update task status if taskId specified
      const updatedTasks = order.tasks.map(t => {
        if (t.id === taskId || (!taskId && order.tasks.length > 0)) {
          return {
            ...t,
            status: '已退回' as const,
            reviewComment: `退回原因: ${reason}`,
          };
        }
        return t;
      });

      // Update report status if report exists
      let updatedReport = order.report;
      if (updatedReport) {
        updatedReport = {
          ...updatedReport,
          status: '已退回' as const,
          auditComment: `退回原因: ${reason}`,
        };
      }

      return {
        ...order,
        currentStep: targetNode,
        overallStatus: 'REJECTED',
        tasks: updatedTasks,
        report: updatedReport,
        history: updatedHistory,
      };
    }));

    // Add notification (PRD 20)
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        type: 'AUDIT_REJECTED',
        title: `业务单已被退回`,
        content: `节点【${getNodeName(sourceNode)}】已执行退回，原因：${reason}。请及时处理。`,
        time: '刚刚',
        read: false,
        orderCode: orderId,
        nodeId: 'testing',
      },
      ...prev,
    ]);

    closeRejectModal();
  };

  // Action 1: Create Order (PRD 4.2)
  const createOrder = (newOrderData: Partial<CommissionOrder>) => {
    const codeNum = orders.length + 1;
    const orderCode = `WT00${codeNum}`;
    const now = new Date().toISOString().split('T')[0];

    const fullOrder: CommissionOrder = {
      id: `order-${Date.now()}`,
      orderCode,
      clientName: newOrderData.clientName || '新城建设发展有限公司',
      contactPerson: newOrderData.contactPerson || '陈工',
      contactPhone: newOrderData.contactPhone || '13899998888',
      orderDate: now,
      testType: newOrderData.testType || '建筑工程见证取样检测',
      projectTitle: newOrderData.projectTitle || '金融港商业综合体二期工程',
      receivableAmount: newOrderData.receivableAmount || 3600,
      paidAmount: 0,
      unpaidAmount: newOrderData.receivableAmount || 3600,
      feeStatus: '待收费',
      currentStep: 'sample_receiving',
      overallStatus: 'PENDING',
      samples: newOrderData.samples || [
        {
          id: `s-${Date.now()}`,
          sampleCode: `S00${codeNum}`,
          sampleName: '混凝土试块',
          specModel: '150×150×150 mm (C30)',
          quantity: 3,
          unit: '组',
          status: '待收样',
        }
      ],
      testProjects: newOrderData.testProjects || [
        {
          id: `tp-${Date.now()}`,
          projectName: '混凝土立方体抗压强度试验',
          testStandard: 'GB/T 50081-2019',
          unitPrice: 1200,
          quantity: 3,
          totalAmount: 3600,
        }
      ],
      tasks: [],
      history: [
        {
          id: `h-${Date.now()}`,
          nodeId: 'sample_receiving',
          nodeName: '委托收样',
          operator: '收样前台',
          operatorRole: '收样员',
          action: '登记客户委托意向单',
          timestamp: new Date().toLocaleString('zh-CN', { hour12: false }),
          status: 'PENDING',
        }
      ],
    };

    setOrders(prev => [fullOrder, ...prev]);
  };

  // Action 2: 确认收样 (PRD 4.4)
  const confirmSampleReceive = (orderId: string, remark?: string) => {
    const now = new Date().toLocaleString('zh-CN', { hour12: false });
    const operator = currentRole === 'ALL' ? '张秀丽' : getRoleName(currentRole);

    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;

      const updatedSamples = order.samples.map(s => ({
        ...s,
        status: '已收样' as const,
        barcode: s.barcode || `BC${Date.now().toString().slice(-8)}`,
      }));

      return {
        ...order,
        currentStep: 'fee_collection',
        overallStatus: 'PROCESSING',
        samples: updatedSamples,
        history: [
          ...order.history,
          {
            id: `h-${Date.now()}`,
            nodeId: 'sample_receiving',
            nodeName: '委托收样',
            operator,
            operatorRole: '收样员',
            action: remark ? `完成现场查验与收样接收。备注：${remark}` : '完成现场样品验收，状态核对无误，自动赋码',
            timestamp: now,
            status: 'COMPLETED',
          }
        ]
      };
    }));
  };

  // Action 3: 检测收费 (PRD 5.4)
  const collectFee = (orderId: string, amount: number, paymentMethod: string, invoiceTitle?: string) => {
    const now = new Date().toLocaleString('zh-CN', { hour12: false });
    const operator = currentRole === 'ALL' ? '李梅' : getRoleName(currentRole);

    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;

      const newPaid = order.paidAmount + amount;
      const newUnpaid = Math.max(0, order.receivableAmount - newPaid);
      const feeStatus = newUnpaid === 0 ? '已收费' : '部分收费';

      // Automatically generate test tasks if none exist yet for task assignment
      let tasks = order.tasks;
      if (tasks.length === 0) {
        tasks = order.testProjects.map((tp, idx) => ({
          id: `task-${order.orderCode}-${idx + 1}`,
          taskCode: `T${order.orderCode.replace('WT', '')}${idx + 1}`,
          orderCode: order.orderCode,
          clientName: order.clientName,
          sampleCode: order.samples[idx]?.sampleCode || order.samples[0]?.sampleCode || 'S001',
          sampleName: order.samples[idx]?.sampleName || order.samples[0]?.sampleName || '检测样品',
          testProject: tp.projectName,
          standard: tp.testStandard,
          priority: '普通',
          status: '待分配',
        }));
      }

      return {
        ...order,
        paidAmount: newPaid,
        unpaidAmount: newUnpaid,
        feeStatus,
        paymentMethod,
        invoiceTitle: invoiceTitle || order.clientName,
        currentStep: 'task_assignment',
        tasks,
        history: [
          ...order.history,
          {
            id: `h-${Date.now()}`,
            nodeId: 'fee_collection',
            nodeName: '检测收费',
            operator,
            operatorRole: '财务收费员',
            action: `完成收款核验，实收金额 ¥${amount.toLocaleString()} 元 (支付方式: ${paymentMethod})，开具凭证，流转至任务分配`,
            timestamp: now,
            status: 'COMPLETED',
          }
        ]
      };
    }));
  };

  // Action 4: 任务分配 (PRD 6.3)
  const assignTask = (
    taskId: string, 
    assigneeName: string, 
    equipment: string, 
    planDate: string, 
    priority: '普通' | '加急' | '特急', 
    remark?: string
  ) => {
    const now = new Date().toLocaleString('zh-CN', { hour12: false });
    const operator = currentRole === 'ALL' ? '周主任' : getRoleName(currentRole);

    setOrders(prev => prev.map(order => {
      const taskIndex = order.tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return order;

      const updatedTasks = [...order.tasks];
      updatedTasks[taskIndex] = {
        ...updatedTasks[taskIndex],
        assigneeName,
        equipment,
        planDate,
        priority,
        status: '待检测',
        assignedTime: now,
      };

      // If all tasks assigned, move currentStep to testing
      const allAssigned = updatedTasks.every(t => t.status !== '待分配');

      return {
        ...order,
        currentStep: allAssigned ? 'testing' : order.currentStep,
        tasks: updatedTasks,
        history: [
          ...order.history,
          {
            id: `h-${Date.now()}`,
            nodeId: 'task_assignment',
            nodeName: '任务分配',
            operator,
            operatorRole: '调度主任',
            action: `任务 [${updatedTasks[taskIndex].taskCode}] 已指派给检测人员 [${assigneeName}]，安排设备 [${equipment}]，优先级：${priority}${remark ? '。备注：' + remark : ''}`,
            timestamp: now,
            status: 'COMPLETED',
          }
        ]
      };
    }));

    // Notification (PRD 20)
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        type: 'TASK_ASSIGNED',
        title: '新的检测任务已分配',
        content: `任务已指派给 ${assigneeName}，计划完成日期：${planDate}。`,
        time: '刚刚',
        read: false,
        nodeId: 'testing',
      },
      ...prev,
    ]);
  };

  // Action 5: 试验检测提交 (PRD 8 & 9)
  const submitTestResult = (taskId: string, rawData: ConcreteTestRawData) => {
    const now = new Date().toLocaleString('zh-CN', { hour12: false });

    setOrders(prev => prev.map(order => {
      const taskIndex = order.tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return order;

      const currentTask = order.tasks[taskIndex];
      const operator = currentTask.assigneeName || (currentRole === 'ALL' ? '张三' : getRoleName(currentRole));

      const updatedTask: typeof currentTask = {
        ...currentTask,
        status: '待复核',
        submitTime: now,
        testData: rawData,
      };

      const updatedTasks = [...order.tasks];
      updatedTasks[taskIndex] = updatedTask;

      return {
        ...order,
        currentStep: 'review',
        tasks: updatedTasks,
        history: [
          ...order.history,
          {
            id: `h-${Date.now()}`,
            nodeId: 'testing',
            nodeName: '试验检测',
            operator,
            operatorRole: '检测工程师',
            action: `试验操作完成。原始破坏荷载已录入，系统依据公式自动计算抗压代表值 ${rawData.averageStrength} MPa，系统评定结果：【${rawData.verdict}】，已提交复核`,
            timestamp: now,
            status: 'COMPLETED',
          }
        ]
      };
    }));

    // Notification (PRD 20)
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        type: 'TEST_SUBMITTED',
        title: '试验检测数据已提交',
        content: `任务 ${taskId} 试验数据已提交，请复核员及时复核确认。`,
        time: '刚刚',
        read: false,
        nodeId: 'review',
      },
      ...prev,
    ]);
  };

  // Action 6: 复核通过 (PRD 10.4)
  const reviewPass = (taskId: string, comment: string) => {
    const now = new Date().toLocaleString('zh-CN', { hour12: false });
    const operator = currentRole === 'ALL' ? '孙复核' : getRoleName(currentRole);

    setOrders(prev => prev.map(order => {
      const taskIndex = order.tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return order;

      const updatedTasks = [...order.tasks];
      updatedTasks[taskIndex] = {
        ...updatedTasks[taskIndex],
        status: '已复核',
        reviewerName: operator,
        reviewTime: now,
        reviewComment: comment || '数据与原始记录符合检验标准规范，复核通过。',
      };

      const task = updatedTasks[taskIndex];
      const reportCode = `BG${order.orderCode.replace('WT', '')}`;

      // Automatically assemble Inspection Report for Report Audit
      const report = order.report || {
        id: `rep-${order.id}`,
        reportCode,
        orderCode: order.orderCode,
        taskCodes: [task.taskCode],
        clientName: order.clientName,
        sampleName: `${task.sampleName} (${order.samples[0]?.specModel || ''})`,
        testCategory: order.testType,
        testProject: task.testProject,
        summaryData: `设计指标等级: ${task.testData?.designGrade || 'C30'}，实测代表值: ${task.testData?.averageStrength || 35.0} MPa`,
        conclusion: `经检验，该组试样在标准养护条件下经压力试验测试，其代表抗压强度满足设计技术指标要求，综合判定合格。`,
        status: '待审核',
        printCopies: 2,
        printedCopies: 0,
        printCount: 0,
      };

      return {
        ...order,
        currentStep: 'report_audit',
        tasks: updatedTasks,
        report,
        history: [
          ...order.history,
          {
            id: `h-${Date.now()}`,
            nodeId: 'review',
            nodeName: '复核确认',
            operator,
            operatorRole: '技术复核员',
            action: `复核通过。复核意见：${comment || '核查原始记录与计算无误'}。生成检验报告 [${reportCode}]，提交报告审核`,
            timestamp: now,
            status: 'COMPLETED',
          }
        ]
      };
    }));
  };

  // Action 7: 报告审核通过 (PRD 11)
  const auditPass = (reportId: string, comment: string) => {
    const now = new Date().toLocaleString('zh-CN', { hour12: false });
    const operator = currentRole === 'ALL' ? '吴审核' : getRoleName(currentRole);

    setOrders(prev => prev.map(order => {
      if (order.report?.id !== reportId) return order;

      const updatedReport = {
        ...order.report,
        status: '待批准' as const,
        auditorName: operator,
        auditTime: now,
        auditComment: comment || '报告技术参数合规，格式严谨无误，审核通过。',
      };

      return {
        ...order,
        currentStep: 'report_approval',
        report: updatedReport,
        history: [
          ...order.history,
          {
            id: `h-${Date.now()}`,
            nodeId: 'report_audit',
            nodeName: '报告审核',
            operator,
            operatorRole: '技术质量部主任',
            action: `审核通过。审核意见：${comment || '报告合规，同意呈报授权签字人'}`,
            timestamp: now,
            status: 'COMPLETED',
          }
        ]
      };
    }));
  };

  // Action 8: 报告批准 (PRD 12)
  const approvePass = (reportId: string, comment: string) => {
    const now = new Date().toLocaleString('zh-CN', { hour12: false });
    const operator = currentRole === 'ALL' ? '马总工 (授权签字人)' : getRoleName(currentRole);

    setOrders(prev => prev.map(order => {
      if (order.report?.id !== reportId) return order;

      const updatedReport = {
        ...order.report,
        status: '待打印' as const,
        approverName: operator,
        approveTime: now,
        approveComment: comment || '符合国家及行业检验规范标准，同意正式签发批准。',
      };

      return {
        ...order,
        currentStep: 'report_print',
        report: updatedReport,
        history: [
          ...order.history,
          {
            id: `h-${Date.now()}`,
            nodeId: 'report_approval',
            nodeName: '报告批准',
            operator,
            operatorRole: '授权签字人',
            action: `批准通过。批准意见：${comment || '签发合格，授权盖章打印'}`,
            timestamp: now,
            status: 'COMPLETED',
          }
        ]
      };
    }));

    // Notification (PRD 20)
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        type: 'REPORT_APPROVED',
        title: '检验报告已批准签发',
        content: `报告已由授权签字人签批完毕，请归档打印人员安排盖章打印。`,
        time: '刚刚',
        read: false,
        nodeId: 'report_print',
      },
      ...prev,
    ]);
  };

  // Action 9: 报告打印 (PRD 13)
  const printReport = (reportId: string, copies: number, printMode: string) => {
    const now = new Date().toLocaleString('zh-CN', { hour12: false });
    const operator = currentRole === 'ALL' ? '刘打印' : getRoleName(currentRole);

    setOrders(prev => prev.map(order => {
      if (order.report?.id !== reportId) return order;

      const newPrintCount = (order.report.printCount || 0) + 1;
      const updatedReport = {
        ...order.report,
        status: '待领取' as const,
        printCopies: copies,
        printedCopies: copies,
        printerName: operator,
        printTime: now,
        printCount: newPrintCount,
      };

      return {
        ...order,
        currentStep: 'report_delivery',
        report: updatedReport,
        history: [
          ...order.history,
          {
            id: `h-${Date.now()}`,
            nodeId: 'report_print',
            nodeName: '报告打印',
            operator,
            operatorRole: '档案打印员',
            action: `完成报告套印与防伪烫印，打印份数: ${copies} 份 (方式: ${printMode}，累计打印: ${newPrintCount}次)，已移交发证柜台待领取`,
            timestamp: now,
            status: 'COMPLETED',
          }
        ]
      };
    }));
  };

  // Action 10: 报告领取 (PRD 14) -> 业务完成!
  const deliverReport = (
    reportId: string, 
    receiverName: string, 
    receiverPhone: string, 
    deliveryMethod: '现场领取' | '邮寄' | '其他', 
    trackingNumber?: string, 
    remark?: string
  ) => {
    const now = new Date().toLocaleString('zh-CN', { hour12: false });
    const operator = currentRole === 'ALL' ? '发证前台' : getRoleName(currentRole);

    setOrders(prev => prev.map(order => {
      if (order.report?.id !== reportId) return order;

      const updatedReport = {
        ...order.report,
        status: '已领取' as const,
        receiverName,
        receiverPhone,
        deliveryMethod,
        trackingNumber,
        deliverTime: now,
        deliveryRemark: remark,
      };

      return {
        ...order,
        overallStatus: 'COMPLETED',
        report: updatedReport,
        history: [
          ...order.history,
          {
            id: `h-${Date.now()}`,
            nodeId: 'report_delivery',
            nodeName: '报告领取',
            operator,
            operatorRole: '报告发放员',
            action: `完成交付客户。领取人：${receiverName} (电话: ${receiverPhone})，方式：${deliveryMethod}${trackingNumber ? '，单号：' + trackingNumber : ''}${remark ? '。备注：' + remark : ''}。检验检测全业务闭环完成！`,
            timestamp: now,
            status: 'COMPLETED',
          }
        ]
      };
    }));
  };

  // PRD 19: Role Permission Matrix Validation
  const canPerformAction = (
    actionType: 'VIEW' | 'CREATE' | 'EDIT' | 'SUBMIT' | 'REJECT' | 'AUDIT' | 'APPROVE', 
    pageNode: WorkflowNodeId
  ): boolean => {
    if (currentRole === 'ALL') return true;

    switch (pageNode) {
      case 'sample_receiving':
        if (currentRole === 'RECEIVER') return true;
        return actionType === 'VIEW';
      case 'fee_collection':
        if (currentRole === 'CASHIER') return actionType !== 'REJECT' && actionType !== 'AUDIT' && actionType !== 'APPROVE';
        return actionType === 'VIEW';
      case 'task_assignment':
        if (currentRole === 'DISPATCHER') return actionType !== 'REJECT' && actionType !== 'AUDIT' && actionType !== 'APPROVE';
        return actionType === 'VIEW';
      case 'testing':
        if (currentRole === 'TESTER') return actionType === 'VIEW' || actionType === 'EDIT' || actionType === 'SUBMIT';
        return actionType === 'VIEW';
      case 'review':
        if (currentRole === 'REVIEWER') return actionType === 'VIEW' || actionType === 'SUBMIT' || actionType === 'REJECT' || actionType === 'AUDIT';
        return actionType === 'VIEW';
      case 'report_audit':
        if (currentRole === 'AUDITOR') return actionType === 'VIEW' || actionType === 'SUBMIT' || actionType === 'REJECT' || actionType === 'AUDIT';
        return actionType === 'VIEW';
      case 'report_approval':
        if (currentRole === 'APPROVER') return actionType === 'VIEW' || actionType === 'SUBMIT' || actionType === 'REJECT' || actionType === 'APPROVE';
        return actionType === 'VIEW';
      case 'report_print':
        if (currentRole === 'PRINTER') return actionType === 'VIEW' || actionType === 'SUBMIT';
        return actionType === 'VIEW';
      case 'report_delivery':
        if (currentRole === 'DISPATCH_CLERK') return actionType === 'VIEW' || actionType === 'SUBMIT';
        return actionType === 'VIEW';
      default:
        return true;
    }
  };

  return (
    <LimsContext.Provider value={{
      orders,
      activeNode,
      setActiveNode,
      currentRole,
      setCurrentRole,
      notifications,
      markNotificationRead,
      prdIssues,
      setPrdIssues,
      nodeInfos,
      viewingWorkflowOrder,
      setViewingWorkflowOrder,
      openWorkflowTimeline,
      rejectModalState,
      openRejectModal,
      closeRejectModal,
      confirmReject,
      createOrder,
      confirmSampleReceive,
      collectFee,
      assignTask,
      submitTestResult,
      reviewPass,
      auditPass,
      approvePass,
      printReport,
      deliverReport,
      canPerformAction,
      resetAllData,
    }}>
      {children}
    </LimsContext.Provider>
  );
};

export const useLims = () => {
  const context = useContext(LimsContext);
  if (!context) throw new Error('useLims must be used within LimsProvider');
  return context;
};

function getNodeName(nodeId: WorkflowNodeId): string {
  const map: Record<WorkflowNodeId, string> = {
    sample_receiving: '委托收样',
    fee_collection: '检测收费',
    task_assignment: '任务分配',
    testing: '试验检测',
    review: '复核确认',
    report_audit: '报告审核',
    report_approval: '报告批准',
    report_print: '报告打印',
    report_delivery: '报告领取',
  };
  return map[nodeId] || nodeId;
}

function getRoleName(role: UserRole): string {
  const map: Record<UserRole, string> = {
    ALL: '系统超级管理员',
    RECEIVER: '收样前台专员',
    CASHIER: '财务收费员',
    DISPATCHER: '检测调度主任',
    TESTER: '检测工程师',
    REVIEWER: '技术复核员',
    AUDITOR: '报告审核人',
    APPROVER: '授权签字人/总工',
    PRINTER: '档案打印员',
    DISPATCH_CLERK: '服务大厅发证员',
  };
  return map[role] || role;
}
