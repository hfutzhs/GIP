import { businessDomains } from './businessDomains'
import type { BusinessDomain } from '@/types'

// 字典分类
export interface DictCategory {
  key: string
  name: string
  code: string
  description: string
}

// 字典条目（通用结构，不同分类字段可能不同）
export interface DictItem {
  key: string
  categoryCode: string   // 所属分类编码
  label: string          // 显示名称
  value: string          // 字典值
  sort: number           // 排序
  enabled: boolean       // 是否启用
  // 领域分类额外字段
  color?: string
  description?: string
}

// 预置分类
export const dictCategories: DictCategory[] = [
  { key: 'cat-domain', name: '业务领域', code: 'business_domain', description: '应用归属的业务领域分类' },
  { key: 'cat-app-type', name: '应用类型', code: 'app_type', description: '应用的业务类型枚举' },
  { key: 'cat-contract-type', name: '合同类型', code: 'contract_type', description: '合同审批中的合同类型' },
  { key: 'cat-priority', name: '优先级', code: 'priority', description: '流程优先级枚举' },
]

// 预置字典条目
export const dictItems: DictItem[] = [
  // 业务领域（从 businessDomains 生成）
  ...businessDomains.map((d: BusinessDomain, i: number) => ({
    key: `domain-${d.key}`,
    categoryCode: 'business_domain',
    label: d.name,
    value: d.key,
    sort: d.sort,
    enabled: true,
    color: d.color,
    description: d.description,
  })),
  // 应用类型
  { key: 'at-web', categoryCode: 'app_type', label: 'Web应用', value: 'web', sort: 1, enabled: true },
  { key: 'at-mobile', categoryCode: 'app_type', label: '移动应用', value: 'mobile', sort: 2, enabled: true },
  { key: 'at-mini', categoryCode: 'app_type', label: '小程序', value: 'mini', sort: 3, enabled: true },
  { key: 'at-api', categoryCode: 'app_type', label: 'API服务', value: 'api', sort: 4, enabled: true },
  // 合同类型
  { key: 'ct-purchase', categoryCode: 'contract_type', label: '采购合同', value: 'purchase', sort: 1, enabled: true },
  { key: 'ct-service', categoryCode: 'contract_type', label: '服务合同', value: 'service', sort: 2, enabled: true },
  { key: 'ct-lease', categoryCode: 'contract_type', label: '租赁合同', value: 'lease', sort: 3, enabled: true },
  { key: 'ct-tech', categoryCode: 'contract_type', label: '技术开发合同', value: 'tech', sort: 4, enabled: true },
  // 优先级
  { key: 'pr-low', categoryCode: 'priority', label: '低', value: 'low', sort: 1, enabled: true },
  { key: 'pr-medium', categoryCode: 'priority', label: '中', value: 'medium', sort: 2, enabled: true },
  { key: 'pr-high', categoryCode: 'priority', label: '高', value: 'high', sort: 3, enabled: true },
  { key: 'pr-urgent', categoryCode: 'priority', label: '紧急', value: 'urgent', sort: 4, enabled: true },
]
