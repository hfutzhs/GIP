import type { Tenant, CapabilityKey } from '@/types'

export const tenants: Tenant[] = [
  {
    id: 'T001',
    name: '北汽股份',
    shortName: '北汽股份',
    status: 'running',
    appCount: 8,
    userCount: 12450,
    quota: 20000,
    usedQuota: 12450,
    capabilities: ['org', 'sso', 'permission', 'process', 'todo', 'notification', 'tenant', 'frontend'] as CapabilityKey[],
    theme: '品牌蓝 #2563eb',
    createTime: '2024-03-12',
  },
  {
    id: 'T002',
    name: '北汽福田',
    shortName: '北汽福田',
    status: 'running',
    appCount: 5,
    userCount: 8200,
    quota: 15000,
    usedQuota: 8200,
    capabilities: ['org', 'sso', 'permission', 'process', 'todo', 'notification'] as CapabilityKey[],
    theme: '福田绿 #16a34a',
    createTime: '2024-06-20',
  },
  {
    id: 'T003',
    name: '北京奔驰',
    shortName: '北京奔驰',
    status: 'running',
    appCount: 3,
    userCount: 6800,
    quota: 10000,
    usedQuota: 6800,
    capabilities: ['org', 'sso', 'permission', 'todo', 'notification'] as CapabilityKey[],
    theme: '奔驰银 #6b7280',
    createTime: '2025-01-08',
  },
]

export const tenantMap: Record<string, Tenant> = tenants.reduce(
  (acc, t) => {
    acc[t.id] = t
    return acc
  },
  {} as Record<string, Tenant>,
)