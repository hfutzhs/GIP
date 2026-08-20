import type { Tenant } from '@/types'

export const tenants: Tenant[] = [
  { id: 'T001', name: '北汽股份', code: 'BAIC', status: 'running', userCount: 5, orgIds: ['sales', 'rd', 'finance', 'hr'] },
  { id: 'T002', name: '北汽福田', code: 'FOTON', status: 'running', userCount: 3, orgIds: ['foton-sales', 'foton-service'] },
  { id: 'T003', name: '北京奔驰', code: 'BENZ', status: 'running', userCount: 2, orgIds: ['benz-sales', 'benz-prod'] },
]

export const tenantMap: Record<string, Tenant> = tenants.reduce(
  (acc, t) => {
    acc[t.id] = t
    return acc
  },
  {} as Record<string, Tenant>,
)
