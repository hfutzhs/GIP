import type { BusinessDomain } from '@/types'

export const businessDomains: BusinessDomain[] = [
  { key: 'rd',          name: '研发',   color: '#2563eb', icon: 'ExperimentOutlined',  description: '产品设计、技术研发、创新管理', sort: 1 },
  { key: 'production',  name: '生产',   color: '#0891b2', icon: 'ToolOutlined',        description: '生产计划、制造执行、车间管理', sort: 2 },
  { key: 'supply',      name: '供应链', color: '#7c3aed', icon: 'DeploymentUnitOutlined', description: '采购、仓储、物流、供应商管理', sort: 3 },
  { key: 'marketing',   name: '营销',   color: '#e11d48', icon: 'RiseOutlined',        description: '市场推广、线索管理、客户运营', sort: 4 },
  { key: 'aftersales',  name: '售后',   color: '#ea580c', icon: 'CustomerServiceOutlined', description: '维修保养、客户服务、投诉处理', sort: 5 },
  { key: 'hr',          name: '人力',   color: '#16a34a', icon: 'TeamOutlined',        description: '招聘、薪酬、绩效、培训发展', sort: 6 },
  { key: 'finance',     name: '财务',   color: '#9333ea', icon: 'MoneyCollectOutlined', description: '预算、核算、资金、税务管理', sort: 7 },
  { key: 'quality',     name: '品质',   color: '#0d9488', icon: 'SafetyCertificateOutlined', description: '质量检验、质量追溯、持续改进', sort: 8 },
  { key: 'operation',   name: '经营',   color: '#4f46e5', icon: 'FundProjectionScreenOutlined', description: '战略规划、经营分析、决策支持', sort: 9 },
  { key: 'general',     name: '通用',   color: '#64748b', icon: 'AppstoreOutlined',    description: '通用工具、跨领域协同应用', sort: 10 },
]

export const domainMap: Record<string, BusinessDomain> = businessDomains.reduce(
  (acc, d) => { acc[d.key] = d; return acc },
  {} as Record<string, BusinessDomain>,
)
