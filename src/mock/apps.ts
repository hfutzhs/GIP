import type { App, CapabilityKey } from '@/types'
import { contractMenus, vehicleMenus, supplierMenus } from './menus'

// 收集菜单树所有 key（用于默认角色权限演示）
const allContractMenuKeys = ['m-list', 'm-create', 'm-report', 'm-report-monthly', 'm-report-yearly', 'm-settings']

export const apps: App[] = [
  {
    id: 'app-contract',
    name: '合同审批系统',
    code: 'contract-approval',
    description: '覆盖合同起草、审批、签署、归档全流程，对接流程中心与待办中心，实现跨部门协同审批。',
    icon: 'FileProtect',
    iconBg: '#2f6bff',
    tenantId: 'T001',
    status: 'published',
    domain: 'marketing',
    path: '/app/contract-approval',
    capabilities: ['sso', 'frontend', 'permission', 'process', 'todo', 'notification'] as CapabilityKey[],
    menus: contractMenus,
    roles: [
      { id: 'R01', name: '管理员', description: '拥有全部菜单与配置权限', menuKeys: allContractMenuKeys, userIds: ['U005'] },
      { id: 'R02', name: '审批员', description: '可审批合同、查看报表', menuKeys: ['m-list', 'm-create', 'm-report', 'm-report-monthly', 'm-report-yearly'], userIds: ['U002', 'U003'] },
      { id: 'R03', name: '查看者', description: '仅可查看合同列表', menuKeys: ['m-list'], userIds: ['U001', 'U004', 'U006', 'U007'] },
    ],
    version: 'v2.1.0',
    versions: [
      { version: 'v2.1.0', time: '2026-07-28 14:20', operator: '陈伟', note: '新增月度/年度统计报表，优化待办推送' },
      { version: 'v2.0.0', time: '2026-06-15 10:05', operator: '陈伟', note: '接入通知中心，审批结果自动推送' },
      { version: 'v1.0.0', time: '2026-03-20 16:40', operator: '陈伟', note: '首版上线：合同起草/审批/归档' },
    ],
    appKey: 'AK2026CONTRACT',
    appSecret: 'SK_9f8e7d6c5b4a3928f1e0d7c6b5a49382',
    publishedUrl: 'workbench.baic.com.cn/app/contract-approval',
    appliedApiIds: ['sso-1', 'sso-2', 'sso-3', 'perm-1', 'proc-1', 'todo-1', 'todo-2', 'notif-1'],
  },
  {
    id: 'app-vehicle',
    name: '车辆调度平台',
    code: 'vehicle-dispatch',
    description: '集团车辆统一调度与实时监控，支持任务派发、轨迹回放与异常告警。',
    icon: 'Car',
    iconBg: '#06b6d4',
    tenantId: 'T001',
    status: 'developing',
    domain: 'production',
    path: '/app/vehicle-dispatch',
    capabilities: ['sso', 'frontend', 'permission', 'todo', 'notification'] as CapabilityKey[],
    menus: vehicleMenus,
    roles: [
      { id: 'V01', name: '管理员', description: '调度平台全部权限', menuKeys: ['v-list', 'v-create', 'v-monitor', 'v-settings'], userIds: ['U008'] },
      { id: 'V02', name: '调度员', description: '可新建调度、查看监控', menuKeys: ['v-list', 'v-create', 'v-monitor'], userIds: ['U006'] },
    ],
    version: 'v0.9.2',
    versions: [{ version: 'v0.9.2', time: '2026-07-25 09:30', operator: '周杰', note: '接入待办中心，任务待确认自动推送' }],
    appKey: 'AK2026VEHICLE',
    appSecret: 'SK_2a3b4c5d6e7f8091a2b3c4d5e6f70819',
    appliedApiIds: ['sso-1', 'sso-3', 'perm-1', 'todo-1'],
  },
  {
    id: 'app-supplier',
    name: '供应商门户',
    code: 'supplier-portal',
    description: '面向供应商的协同门户，支持资质上传、报价协同与订单查询。',
    icon: 'Shop',
    iconBg: '#f59e0b',
    tenantId: 'T001',
    status: 'draft',
    domain: 'supply',
    path: '/app/supplier-portal',
    capabilities: ['sso'] as CapabilityKey[],
    menus: supplierMenus,
    roles: [{ id: 'S01', name: '管理员', description: '门户全部权限', menuKeys: ['s-list', 's-quote', 's-settings'], userIds: ['U002'] }],
    version: 'v0.1.0',
    versions: [{ version: 'v0.1.0', time: '2026-07-30 11:15', operator: '李娜', note: '创建应用，完成基本信息录入' }],
    appKey: 'AK2026SUPPLIER',
    appSecret: 'SK_a1b2c3d4e5f60718293a4b5c6d7e8f90',
    appliedApiIds: ['sso-1'],
  },
]

export const appMap: Record<string, App> = apps.reduce(
  (acc, a) => {
    acc[a.id] = a
    return acc
  },
  {} as Record<string, App>,
)

// 按 code 查找应用（工作台路由 /app/:code 使用）
export const appByCode: Record<string, App> = apps.reduce(
  (acc, a) => {
    acc[a.code] = a
    return acc
  },
  {} as Record<string, App>,
)