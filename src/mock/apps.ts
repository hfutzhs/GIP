import type { App } from '@/types'

// ===== AppSecret 生成规则: SK_ + 随机十六进制(32位) =====
function genAppSecret(): string {
  const hex = '0123456789abcdef'
  let s = ''
  for (let i = 0; i < 32; i++) s += hex[Math.floor(Math.random() * 16)]
  return `SK_${s}`
}

export const apps: App[] = [
  {
    id: 'app-contract',
    name: '合同审批系统',
    code: 'contract-approval',
    description: '覆盖合同起草、审批、签署、归档全流程，对接流程中心与待办中心，实现跨部门协同审批。',
    icon: 'FileProtect',
    iconBg: '#2f6bff',
    accessUrl: 'https://workbench.baic.com.cn/app/contract-approval',
    tenantId: 'T001',
    domain: 'marketing',
    appSecret: genAppSecret(),
  },
  {
    id: 'app-vehicle',
    name: '车辆调度平台',
    code: 'vehicle-dispatch',
    description: '集团车辆统一调度与实时监控，支持任务派发、轨迹回放与异常告警。',
    icon: 'Car',
    iconBg: '#06b6d4',
    accessUrl: 'https://workbench.baic.com.cn/app/vehicle-dispatch',
    tenantId: 'T001',
    domain: 'production',
    appSecret: genAppSecret(),
  },
  {
    id: 'app-supplier',
    name: '供应商门户',
    code: 'supplier-portal',
    description: '面向供应商的协同门户，支持资质上传、报价协同与订单查询。',
    icon: 'Shop',
    iconBg: '#f59e0b',
    accessUrl: 'https://supplier.baic.com.cn',
    tenantId: 'T001',
    domain: 'supply',
    appSecret: genAppSecret(),
  },
  {
    id: 'app-quality',
    name: '质量追溯系统',
    code: 'quality-trace',
    description: '整车质量全链路追溯，从零部件入库到终检下线，支持扫码追溯与异常召回。',
    icon: 'SafetyCertificate',
    iconBg: '#0d9488',
    accessUrl: 'https://quality.baic.com.cn',
    tenantId: 'T002',
    domain: 'quality',
    appSecret: genAppSecret(),
  },
  {
    id: 'app-hr',
    name: '薪酬管理系统',
    code: 'salary-mgmt',
    description: '集团薪酬核算与发放管理，支持多套薪酬体系、个税计算与银行代发。',
    icon: 'Team',
    iconBg: '#16a34a',
    accessUrl: 'https://hr.baic.com.cn/salary',
    tenantId: 'T001',
    domain: 'hr',
    appSecret: genAppSecret(),
  },
]

export const appMap: Record<string, App> = apps.reduce(
  (acc, a) => { acc[a.id] = a; return acc },
  {} as Record<string, App>,
)

export const appByCode: Record<string, App> = apps.reduce(
  (acc, a) => { acc[a.code] = a; return acc },
  {} as Record<string, App>,
)

export { genAppSecret }