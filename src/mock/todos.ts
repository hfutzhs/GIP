import type { Todo } from '@/types'

// 跨应用待办（工作台顶部待办图标聚合展示）
export const todos: Todo[] = [
  {
    id: 'TD001',
    title: '冲压模具开发合同 待你审批',
    appCode: 'contract-approval',
    appName: '合同审批系统',
    type: '合同审批',
    status: 'pending',
    createdAt: '2026-07-31 09:12',
    link: '/app/contract-approval',
  },
  {
    id: 'TD002',
    title: '物流运输服务合同 待你审批',
    appCode: 'contract-approval',
    appName: '合同审批系统',
    type: '合同审批',
    status: 'pending',
    createdAt: '2026-07-31 09:30',
    link: '/app/contract-approval',
  },
  {
    id: 'TD003',
    title: '京A-82903 调度任务待确认',
    appCode: 'vehicle-dispatch',
    appName: '车辆调度平台',
    type: '任务确认',
    status: 'pending',
    createdAt: '2026-07-31 08:45',
    link: '/app/vehicle-dispatch',
  },
]