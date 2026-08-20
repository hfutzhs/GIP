// ===== 流程管理 Mock 数据 =====
import { userMap } from '@/mock/users'

// 流程分类
export const processCategories = ['合同类', '采购类', '人事类', '财务类', '通用审批']

// 可发起的流程定义（已发布、当前租户可见）
export interface ProcessDef {
  key: string
  name: string
  code: string
  category: string
  app?: string
  description: string
  orgScope: string
  version: string
  nodes: number
  tenantId: string
}

export const processDefs: ProcessDef[] = [
  { key: 'contract_approval', name: '合同审批流程', code: 'CONTRACT_APPROVAL', category: '合同类', app: '合同审批系统', description: '覆盖合同起草、审批、签署全流程，支持多级审批与法务审核', orgScope: '全公司', version: 'v3', nodes: 5, tenantId: 'T001' },
  { key: 'purchase_order', name: '采购下单审批流程', code: 'PURCHASE_ORDER', category: '采购类', app: '合同审批系统', description: '采购申请发起、预算审核、主管审批、采购执行', orgScope: '采购管理部', version: 'v5', nodes: 6, tenantId: 'T001' },
  { key: 'vehicle_dispatch', name: '车辆调度确认流程', code: 'VEHICLE_DISPATCH', category: '通用审批', app: '车辆调度平台', description: '车辆调度任务派发与确认，支持轨迹回放与异常上报', orgScope: '生产运营部', version: 'v2', nodes: 3, tenantId: 'T001' },
  { key: 'leave_apply', name: '请假审批流程', code: 'LEAVE_APPLY', category: '人事类', description: '员工请假申请，按天数分级审批，自动通知考勤', orgScope: '全公司', version: 'v1', nodes: 3, tenantId: 'T001' },
  { key: 'expense_reimburse', name: '费用报销流程', code: 'EXPENSE_REIMBURSE', category: '财务类', app: '合同审批系统', description: '费用报销申请，财务审核、出纳付款、凭证归档', orgScope: '全公司', version: 'v2', nodes: 4, tenantId: 'T001' },
  { key: 'supplier_qualify', name: '供应商资质审核流程', code: 'SUPPLIER_QUALIFY', category: '采购类', app: '供应商门户', description: '供应商入库资质审核，多维度评估与准入审批', orgScope: '采购管理部', version: 'v1', nodes: 4, tenantId: 'T002' },
]

// 流程实例状态
export type InstanceStatus = 'running' | 'completed' | 'rejected' | 'withdrawn'

// 任务处理结果
export type TaskResult = 'approved' | 'rejected' | 'transferred' | 'pending'

// 优先级
export type Priority = 'normal' | 'urgent' | 'critical'

// 流程实例
export interface ProcessInstance {
  id: string
  code: string
  name: string
  defKey: string
  status: InstanceStatus
  initiator: string
  initiatorDept: string
  createdAt: string
  currentNode: string
  currentAssignee: string
  priority: Priority
  category: string
  app?: string
  tenantId: string
  duration: string
  deadline?: string
  overTime?: boolean
}

// 任务记录（流转记录中的每一步）
export interface TaskRecord {
  id: string
  instanceId: string
  nodeName: string
  assignee: string
  assigneeId: string
  status: TaskResult
  action: string
  comment?: string
  arrivedAt: string
  processedAt?: string
}

// ===== 流程实例数据 =====
export const instances: ProcessInstance[] = [
  // 我发起的 (initiator = 张松)
  { id: 'PI001', code: 'LC-2026-0001', name: '合同审批流程', defKey: 'contract_approval', status: 'running', initiator: '张松', initiatorDept: '技术研发中心', createdAt: '2026-08-15 09:30', currentNode: '部门经理审批', currentAssignee: '李娜', priority: 'urgent', category: '合同类', app: '合同审批系统', tenantId: 'T001', duration: '3天6小时', deadline: '2026-08-19 12:00', overTime: false },
  { id: 'PI002', code: 'LC-2026-0002', name: '费用报销流程', defKey: 'expense_reimburse', status: 'completed', initiator: '张松', initiatorDept: '技术研发中心', createdAt: '2026-08-08 14:20', currentNode: '已完成', currentAssignee: '', priority: 'normal', category: '财务类', app: '合同审批系统', tenantId: 'T001', duration: '1天8小时' },
  { id: 'PI003', code: 'LC-2026-0003', name: '采购下单审批流程', defKey: 'purchase_order', status: 'rejected', initiator: '张松', initiatorDept: '技术研发中心', createdAt: '2026-08-10 10:15', currentNode: '预算审核', currentAssignee: '王强', priority: 'normal', category: '采购类', app: '合同审批系统', tenantId: 'T001', duration: '6小时20分' },
  { id: 'PI004', code: 'LC-2026-0004', name: '请假审批流程', defKey: 'leave_apply', status: 'withdrawn', initiator: '张松', initiatorDept: '技术研发中心', createdAt: '2026-08-05 08:00', currentNode: '主管审批', currentAssignee: '陈伟', priority: 'normal', category: '人事类', tenantId: 'T001', duration: '2小时' },

  // 我的待办 (assignee = 张松, pending)
  { id: 'PI005', code: 'LC-2026-0005', name: '合同审批流程', defKey: 'contract_approval', status: 'running', initiator: '李娜', initiatorDept: '采购管理部', createdAt: '2026-08-18 09:12', currentNode: '技术审核', currentAssignee: '张松', priority: 'urgent', category: '合同类', app: '合同审批系统', tenantId: 'T001', duration: '1天2小时', deadline: '2026-08-19 12:00', overTime: true },
  { id: 'PI006', code: 'LC-2026-0006', name: '车辆调度确认流程', defKey: 'vehicle_dispatch', status: 'running', initiator: '周杰', initiatorDept: '北汽福田-生产运营部', createdAt: '2026-08-18 08:45', currentNode: '调度确认', currentAssignee: '张松', priority: 'critical', category: '通用审批', app: '车辆调度平台', tenantId: 'T001', duration: '1天3小时', deadline: '2026-08-19 09:00', overTime: true },
  { id: 'PI007', code: 'LC-2026-0007', name: '费用报销流程', defKey: 'expense_reimburse', status: 'running', initiator: '孙莉', initiatorDept: '采购管理部', createdAt: '2026-08-17 16:30', currentNode: '部门审批', currentAssignee: '张松', priority: 'normal', category: '财务类', app: '合同审批系统', tenantId: 'T001', duration: '1天19小时', deadline: '2026-08-20 18:00' },

  // 我的已办 (assignee = 张松, processed)
  { id: 'PI008', code: 'LC-2026-0008', name: '合同审批流程', defKey: 'contract_approval', status: 'completed', initiator: '王强', initiatorDept: '财务管理部', createdAt: '2026-08-10 11:00', currentNode: '已完成', currentAssignee: '', priority: 'normal', category: '合同类', app: '合同审批系统', tenantId: 'T001', duration: '2天5小时' },
  { id: 'PI009', code: 'LC-2026-0009', name: '采购下单审批流程', defKey: 'purchase_order', status: 'rejected', initiator: '孙莉', initiatorDept: '采购管理部', createdAt: '2026-08-12 09:45', currentNode: '已驳回', currentAssignee: '', priority: 'normal', category: '采购类', app: '合同审批系统', tenantId: 'T001', duration: '1天2小时' },
  { id: 'PI010', code: 'LC-2026-0010', name: '请假审批流程', defKey: 'leave_apply', status: 'completed', initiator: '刘洋', initiatorDept: '技术研发中心', createdAt: '2026-08-06 13:20', currentNode: '已完成', currentAssignee: '', priority: 'normal', category: '人事类', tenantId: 'T001', duration: '4小时' },
  { id: 'PI011', code: 'LC-2026-0011', name: '供应商资质审核流程', defKey: 'supplier_qualify', status: 'completed', initiator: '周杰', initiatorDept: '北汽福田-生产运营部', createdAt: '2026-08-03 10:00', currentNode: '已完成', currentAssignee: '', priority: 'urgent', category: '采购类', app: '供应商门户', tenantId: 'T002', duration: '3天6小时' },
]

// ===== 任务流转记录 =====
export const taskRecords: TaskRecord[] = [
  // PI005 - 我的待办（技术审核待我处理）
  { id: 'T005-1', instanceId: 'PI005', nodeName: '发起人提交', assignee: '李娜', assigneeId: 'U002', status: 'approved', action: '提交', comment: '冲压模具开发合同，金额86万', arrivedAt: '2026-08-18 09:12', processedAt: '2026-08-18 09:12' },
  { id: 'T005-2', instanceId: 'PI005', nodeName: '部门经理审批', assignee: '王强', assigneeId: 'U003', status: 'approved', action: '通过', comment: '同意，金额在预算范围内', arrivedAt: '2026-08-18 09:12', processedAt: '2026-08-18 10:30' },
  { id: 'T005-3', instanceId: 'PI005', nodeName: '技术审核', assignee: '张松', assigneeId: 'U001', status: 'pending', action: '', arrivedAt: '2026-08-18 10:30' },
  { id: 'T005-4', instanceId: 'PI005', nodeName: '法务审核', assignee: '赵敏', assigneeId: 'U004', status: 'pending', action: '', arrivedAt: '' },
  { id: 'T005-5', instanceId: 'PI005', nodeName: '总经理审批', assignee: '总经理', assigneeId: 'U100', status: 'pending', action: '', arrivedAt: '' },

  // PI006 - 我的待办（调度确认待我处理）
  { id: 'T006-1', instanceId: 'PI006', nodeName: '发起人提交', assignee: '周杰', assigneeId: 'U008', status: 'approved', action: '提交', comment: '京A-82903 车辆调度确认', arrivedAt: '2026-08-18 08:45', processedAt: '2026-08-18 08:45' },
  { id: 'T006-2', instanceId: 'PI006', nodeName: '调度确认', assignee: '张松', assigneeId: 'U001', status: 'pending', action: '', arrivedAt: '2026-08-18 08:45' },
  { id: 'T006-3', instanceId: 'PI006', nodeName: '调度完成', assignee: '周杰', assigneeId: 'U008', status: 'pending', action: '', arrivedAt: '' },

  // PI007 - 我的待办（部门审批待我处理）
  { id: 'T007-1', instanceId: 'PI007', nodeName: '发起人提交', assignee: '孙莉', assigneeId: 'U007', status: 'approved', action: '提交', comment: '差旅费用报销，金额5,200元', arrivedAt: '2026-08-17 16:30', processedAt: '2026-08-17 16:30' },
  { id: 'T007-2', instanceId: 'PI007', nodeName: '部门审批', assignee: '张松', assigneeId: 'U001', status: 'pending', action: '', arrivedAt: '2026-08-17 16:30' },
  { id: 'T007-3', instanceId: 'PI007', nodeName: '财务审核', assignee: '王强', assigneeId: 'U003', status: 'pending', action: '', arrivedAt: '' },
  { id: 'T007-4', instanceId: 'PI007', nodeName: '出纳付款', assignee: '财务出纳', assigneeId: 'U101', status: 'pending', action: '', arrivedAt: '' },

  // PI001 - 我发起的（进行中）
  { id: 'T001-1', instanceId: 'PI001', nodeName: '发起人提交', assignee: '张松', assigneeId: 'U001', status: 'approved', action: '提交', comment: '发动机总成采购合同，金额128万', arrivedAt: '2026-08-15 09:30', processedAt: '2026-08-15 09:30' },
  { id: 'T001-2', instanceId: 'PI001', nodeName: '部门经理审批', assignee: '李娜', assigneeId: 'U002', status: 'pending', action: '', arrivedAt: '2026-08-15 09:30' },

  // PI002 - 我发起的（已完成）
  { id: 'T002-1', instanceId: 'PI002', nodeName: '发起人提交', assignee: '张松', assigneeId: 'U001', status: 'approved', action: '提交', comment: '差旅费用报销3,200元', arrivedAt: '2026-08-08 14:20', processedAt: '2026-08-08 14:20' },
  { id: 'T002-2', instanceId: 'PI002', nodeName: '部门审批', assignee: '陈伟', assigneeId: 'U005', status: 'approved', action: '通过', comment: '同意报销', arrivedAt: '2026-08-08 14:20', processedAt: '2026-08-08 15:45' },
  { id: 'T002-3', instanceId: 'PI002', nodeName: '财务审核', assignee: '王强', assigneeId: 'U003', status: 'approved', action: '通过', comment: '票据齐全，同意付款', arrivedAt: '2026-08-08 15:45', processedAt: '2026-08-09 09:30' },
  { id: 'T002-4', instanceId: 'PI002', nodeName: '出纳付款', assignee: '财务出纳', assigneeId: 'U101', status: 'approved', action: '通过', comment: '已付款', arrivedAt: '2026-08-09 09:30', processedAt: '2026-08-09 22:50' },

  // PI003 - 我发起的（已驳回）
  { id: 'T003-1', instanceId: 'PI003', nodeName: '发起人提交', assignee: '张松', assigneeId: 'U001', status: 'approved', action: '提交', comment: '采购下单申请', arrivedAt: '2026-08-10 10:15', processedAt: '2026-08-10 10:15' },
  { id: 'T003-2', instanceId: 'PI003', nodeName: '预算审核', assignee: '王强', assigneeId: 'U003', status: 'rejected', action: '驳回', comment: '超出部门年度预算，需重新调整方案', arrivedAt: '2026-08-10 10:15', processedAt: '2026-08-10 16:35' },

  // PI008 - 我的已办（我处理的，已完成）
  { id: 'T008-1', instanceId: 'PI008', nodeName: '发起人提交', assignee: '王强', assigneeId: 'U003', status: 'approved', action: '提交', comment: '办公场地租赁合同', arrivedAt: '2026-08-10 11:00', processedAt: '2026-08-10 11:00' },
  { id: 'T008-2', instanceId: 'PI008', nodeName: '技术审核', assignee: '张松', assigneeId: 'U001', status: 'approved', action: '通过', comment: '合同条款无技术风险', arrivedAt: '2026-08-10 11:00', processedAt: '2026-08-10 14:20' },
  { id: 'T008-3', instanceId: 'PI008', nodeName: '法务审核', assignee: '赵敏', assigneeId: 'U004', status: 'approved', action: '通过', comment: '合同条款合规', arrivedAt: '2026-08-10 14:20', processedAt: '2026-08-11 09:15' },
  { id: 'T008-4', instanceId: 'PI008', nodeName: '总经理审批', assignee: '总经理', assigneeId: 'U100', status: 'approved', action: '通过', comment: '同意', arrivedAt: '2026-08-11 09:15', processedAt: '2026-08-12 16:00' },

  // PI009 - 我的已办（我驳回的）
  { id: 'T009-1', instanceId: 'PI009', nodeName: '发起人提交', assignee: '孙莉', assigneeId: 'U007', status: 'approved', action: '提交', comment: '采购下单申请', arrivedAt: '2026-08-12 09:45', processedAt: '2026-08-12 09:45' },
  { id: 'T009-2', instanceId: 'PI009', nodeName: '技术审核', assignee: '张松', assigneeId: 'U001', status: 'rejected', action: '驳回', comment: '技术参数不明确，需补充规格说明', arrivedAt: '2026-08-12 09:45', processedAt: '2026-08-12 11:30' },

  // PI010 - 我的已办（我处理的，请假）
  { id: 'T010-1', instanceId: 'PI010', nodeName: '发起人提交', assignee: '刘洋', assigneeId: 'U006', status: 'approved', action: '提交', comment: '年假3天', arrivedAt: '2026-08-06 13:20', processedAt: '2026-08-06 13:20' },
  { id: 'T010-2', instanceId: 'PI010', nodeName: '主管审批', assignee: '张松', assigneeId: 'U001', status: 'approved', action: '通过', comment: '同意，注意项目交接', arrivedAt: '2026-08-06 13:20', processedAt: '2026-08-06 14:00' },
  { id: 'T010-3', instanceId: 'PI010', nodeName: 'HR备案', assignee: 'HR', assigneeId: 'U102', status: 'approved', action: '通过', comment: '已备案', arrivedAt: '2026-08-06 14:00', processedAt: '2026-08-06 17:20' },

  // PI011 - 我的已办（供应商资质审核）
  { id: 'T011-1', instanceId: 'PI011', nodeName: '发起人提交', assignee: '周杰', assigneeId: 'U008', status: 'approved', action: '提交', comment: '供应商入库申请', arrivedAt: '2026-08-03 10:00', processedAt: '2026-08-03 10:00' },
  { id: 'T011-2', instanceId: 'PI011', nodeName: '资质评估', assignee: '张松', assigneeId: 'U001', status: 'approved', action: '通过', comment: '资质齐全，技术能力达标', arrivedAt: '2026-08-03 10:00', processedAt: '2026-08-04 15:30' },
  { id: 'T011-3', instanceId: 'PI011', nodeName: '准入审批', assignee: '采购总监', assigneeId: 'U103', status: 'approved', action: '通过', comment: '同意准入', arrivedAt: '2026-08-04 15:30', processedAt: '2026-08-06 16:20' },
]

// 获取某实例的流转记录
export function getTaskRecords(instanceId: string): TaskRecord[] {
  return taskRecords.filter((t) => t.instanceId === instanceId)
}

// 获取我待办的任务（assigneeId = 当前用户, status = pending）
export function getMyTodos(userId: string): ProcessInstance[] {
  return instances.filter((inst) => {
    if (inst.status !== 'running') return false
    const pendingTask = taskRecords.find((t) => t.instanceId === inst.id && t.assigneeId === userId && t.status === 'pending')
    return !!pendingTask
  })
}

// 获取我已办的任务（assigneeId = 当前用户, status != pending）
export function getMyDone(userId: string): { instance: ProcessInstance; myTask: TaskRecord }[] {
  const result: { instance: ProcessInstance; myTask: TaskRecord }[] = []
  for (const t of taskRecords) {
    if (t.assigneeId === userId && t.status !== 'pending') {
      const inst = instances.find((i) => i.id === t.instanceId)
      if (inst) result.push({ instance: inst, myTask: t })
    }
  }
  return result
}

// 获取我发起的
export function getMyInitiated(userId: string): ProcessInstance[] {
  const user = userMap[userId]
  if (!user) return []
  return instances.filter((i) => i.initiator === user.name)
}