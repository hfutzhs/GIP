// ===== 核心领域类型定义 =====

// 应用状态
export type AppStatus = 'published' | 'developing' | 'draft'

// 合同状态
export type ContractStatus = 'pending' | 'approved' | 'rejected'

// API 审批状态
export type ApiApprovalStatus = 'approved' | 'pending' | 'none'

// 通用能力 key（对应八大能力）
export type CapabilityKey =
  | 'org'
  | 'sso'
  | 'permission'
  | 'process'
  | 'todo'
  | 'notification'
  | 'tenant'
  | 'frontend'
  | 'agent'
  | 'digital-expert'
  | 'roundtable'
  | 'smart-query'
  | 'process-agent'


// 能力一级分类
export type CapabilityCategory = 'general' | 'agent'
// 智能agent二级分类
export type AgentSubCategory = 'business-expert' | 'data-expert' | 'process-assistant'

// HTTP 方法
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

// API 端点
export interface ApiEndpoint {
  id: string
  method: HttpMethod
  path: string
  description: string
  status: ApiApprovalStatus
  capability: CapabilityKey
  /** 在线调试时的 Mock 返回示例 */
  mockResponse?: string
  /** 在线调试时可填入的参数示例 */
  mockParams?: { name: string; description: string; required?: boolean; example?: string }[]
}

// 通用能力
export interface Capability {
  key: CapabilityKey
  name: string
  shortName: string
  icon: string
  color: string
  description: string
  apis: ApiEndpoint[]
  sdk: { lang: string; label: string }[]
  /** 一级分类：通用能力 / 智能agent */
  category?: CapabilityCategory
  /** 智能agent二级分类：业务专家 / 数据专家 / 流程助理 */
  subcategory?: AgentSubCategory
}

// 菜单节点
export interface MenuNode {
  key: string
  title: string
  icon?: string
  path?: string
  hidden?: boolean
  children?: MenuNode[]
}

// 角色绑定菜单权限 + 人员
export interface Role {
  id: string
  name: string
  description: string
  menuKeys: string[]
  userIds: string[]
}

// 版本历史
export interface AppVersion {
  version: string
  time: string
  operator: string
  note: string
}

// 应用
export interface App {
  id: string
  name: string
  code: string
  description: string
  icon: string
  iconBg: string
  tenantId: string
  status: AppStatus
  /** 路由后缀，如 /app/contract-approval */
  path: string
  capabilities: CapabilityKey[]
  menus: MenuNode[]
  roles: Role[]
  version: string
  versions: AppVersion[]
  appKey: string
  appSecret: string
  /** 发布到工作台后的访问地址 */
  publishedUrl?: string
  /** 已申请 API 的 id 集合（用于能力组件勾选后自动出现待申请 API） */
  appliedApiIds: string[]
}

// 租户
export interface Tenant {
  id: string
  name: string
  shortName: string
  status: 'running' | 'stopped'
  appCount: number
  userCount: number
  quota: number
  usedQuota: number
  capabilities: CapabilityKey[]
  theme: string
  createTime: string
}

// 合同
export interface Contract {
  id: string
  code: string
  name: string
  party: string
  amount: number
  date: string
  status: ContractStatus
  type: string
  applicant: string
}

// 组织部门
export interface Department {
  key: string
  title: string
  children?: Department[]
}

// 用户
export interface User {
  id: string
  name: string
  department: string
  position: string
  avatar: string
  email: string
  phone: string
}

// 待办
export interface Todo {
  id: string
  title: string
  appCode: string
  appName: string
  type: string
  status: 'pending' | 'done'
  createdAt: string
  link?: string
}

// 消息通知
export interface Message {
  id: string
  title: string
  content: string
  appCode: string
  type: 'system' | 'approval' | 'notice'
  read: boolean
  createdAt: string
}

// 当前登录用户
export interface CurrentUser {
  id: string
  name: string
  department: string
  position: string
  tenantName: string
  avatar: string
}