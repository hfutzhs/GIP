import type { MenuNode } from '@/types'

// 合同审批系统菜单树
export const contractMenus: MenuNode[] = [
  { key: 'm-list', title: '合同列表', icon: 'FileText', path: '/contract/list' },
  { key: 'm-create', title: '新建合同', icon: 'FileAdd', path: '/contract/create' },
  {
    key: 'm-report',
    title: '统计报表',
    icon: 'BarChart',
    path: '/contract/report',
    children: [
      { key: 'm-report-monthly', title: '月度统计', icon: 'Calendar', path: '/contract/report/monthly' },
      { key: 'm-report-yearly', title: '年度统计', icon: 'Calendar', path: '/contract/report/yearly' },
    ],
  },
  { key: 'm-settings', title: '系统设置', icon: 'Setting', path: '/contract/settings' },
]

// 车辆调度平台菜单树
export const vehicleMenus: MenuNode[] = [
  { key: 'v-list', title: '调度任务', icon: 'Car', path: '/vehicle/tasks' },
  { key: 'v-create', title: '新建调度', icon: 'Plus', path: '/vehicle/create' },
  { key: 'v-monitor', title: '实时监控', icon: 'Monitor', path: '/vehicle/monitor' },
  { key: 'v-settings', title: '系统设置', icon: 'Setting', path: '/vehicle/settings' },
]

// 供应商门户菜单树
export const supplierMenus: MenuNode[] = [
  { key: 's-list', title: '供应商列表', icon: 'Team', path: '/supplier/list' },
  { key: 's-quote', title: '报价管理', icon: 'Profile', path: '/supplier/quote' },
  { key: 's-settings', title: '系统设置', icon: 'Setting', path: '/supplier/settings' },
]