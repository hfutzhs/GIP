import { create } from 'zustand'
import type { App, AppStatus, CapabilityKey, Contract, MenuNode, Role, Todo, Message, ApiApprovalStatus } from '@/types'
import { apps as seedApps } from '@/mock/apps'
import { contracts as seedContracts } from '@/mock/contracts'
import { todos as seedTodos } from '@/mock/todos'
import { messages as seedMessages } from '@/mock/messages'
import { capabilities } from '@/mock/capabilities'

type Product = 'developer' | 'workbench'

interface AppState {
  // 产品切换
  product: Product
  setProduct: (p: Product) => void

  // 工作台当前应用 code
  activeAppCode: string
  setActiveAppCode: (code: string) => void

  // 应用
  apps: App[]
  getApp: (id: string) => App | undefined
  getAppByCode: (code: string) => App | undefined
  createApp: (input: { name: string; code: string; description: string; tenantId: string; icon: string; iconBg: string; domain: string }) => string
  updateApp: (id: string, patch: Partial<App>) => void
  updateAppStatus: (id: string, status: AppStatus) => void
  setAppCapabilities: (id: string, caps: CapabilityKey[]) => void
  setAppMenus: (id: string, menus: MenuNode[]) => void
  setAppRoles: (id: string, roles: Role[]) => void
  applyApi: (appId: string, apiId: string) => void
  approveApi: (appId: string, apiId: string) => void
  publishApp: (appId: string) => void

  // 合同
  contracts: Contract[]
  addContract: (c: Omit<Contract, 'id' | 'code' | 'date' | 'status' | 'applicant'>) => void

  // 待办
  todos: Todo[]
  addTodo: (t: Omit<Todo, 'id' | 'createdAt' | 'status'>) => void
  finishTodo: (id: string) => void

  // 消息
  messages: Message[]
  addMessage: (m: Omit<Message, 'id' | 'createdAt' | 'read'>) => void
  readMessage: (id: string) => void
  readAllMessages: () => void
}

// 生成简易 id
let seq = 1000
const nextId = (prefix: string) => `${prefix}-${++seq}`
const now = () => {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}
const today = () => {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

// 收集某能力下所有 API id
const apiIdsOfCapability = (cap: CapabilityKey) =>
  capabilities.find((c) => c.key === cap)?.apis.map((a) => a.id) ?? []

export const useAppStore = create<AppState>((set, get) => ({
  product: 'developer',
  setProduct: (p) => set({ product: p }),

  activeAppCode: 'contract-approval',
  setActiveAppCode: (code) => set({ activeAppCode: code }),

  apps: seedApps.map((a) => ({ ...a })),
  getApp: (id) => get().apps.find((a) => a.id === id),
  getAppByCode: (code) => get().apps.find((a) => a.code === code),

  createApp: (input) => {
    const id = `app-${Date.now()}`
    const newApp: App = {
      id,
      name: input.name,
      code: input.code,
      description: input.description,
      icon: input.icon || 'Appstore',
      iconBg: input.iconBg || '#2563eb',
      domain: input.domain || 'general',
      tenantId: input.tenantId,
      status: 'draft',
      path: `/app/${input.code}`,
      capabilities: ['sso'],
      menus: [{ key: nextId('m'), title: '首页', icon: 'Home', path: `/${input.code}/home` }],
      roles: [{ id: nextId('R'), name: '管理员', description: '应用全部权限', menuKeys: [], userIds: [] }],
      version: 'v0.1.0',
      versions: [{ version: 'v0.1.0', time: now(), operator: '张松', note: '创建应用' }],
      appKey: `AK2026${input.code.replace(/-/g, '').toUpperCase().slice(0, 8)}`,
      appSecret: `SK_${Math.random().toString(16).slice(2, 18).padEnd(16, '0')}`,
      appliedApiIds: ['sso-1'],
    }
    set((s) => ({ apps: [...s.apps, newApp] }))
    return id
  },

  updateApp: (id, patch) =>
    set((s) => ({ apps: s.apps.map((a) => (a.id === id ? { ...a, ...patch } : a)) })),

  updateAppStatus: (id, status) =>
    set((s) => ({ apps: s.apps.map((a) => (a.id === id ? { ...a, status } : a)) })),

  setAppCapabilities: (id, caps) =>
    set((s) => ({
      apps: s.apps.map((a) => {
        if (a.id !== id) return a
        // 能力变化后同步可申请 API 列表：保留已申请且仍属于已勾选能力的 API
        const kept = a.appliedApiIds.filter((apiId) => {
          const cap = capabilities.find((c) => c.apis.some((ap) => ap.id === apiId))
          return cap && caps.includes(cap.key)
        })
        // 新勾选能力的 API 初始为 none（未申请），不自动加入 appliedApiIds
        return { ...a, capabilities: caps, appliedApiIds: kept }
      }),
    })),

  setAppMenus: (id, menus) =>
    set((s) => ({ apps: s.apps.map((a) => (a.id === id ? { ...a, menus } : a)) })),

  setAppRoles: (id, roles) =>
    set((s) => ({ apps: s.apps.map((a) => (a.id === id ? { ...a, roles } : a)) })),

  applyApi: (appId, apiId) =>
    set((s) => ({
      apps: s.apps.map((a) =>
        a.id === appId && !a.appliedApiIds.includes(apiId)
          ? { ...a, appliedApiIds: [...a.appliedApiIds, apiId] }
          : a,
      ),
    })),

  approveApi: (appId, apiId) => {
    // 模拟审批：加入 appliedApiIds 即视为已批准（API 面板按 appliedApiIds 判定 approved）
    set((s) => ({
      apps: s.apps.map((a) =>
        a.id === appId && !a.appliedApiIds.includes(apiId)
          ? { ...a, appliedApiIds: [...a.appliedApiIds, apiId] }
          : a,
      ),
    }))
  },

  publishApp: (appId) =>
    set((s) => ({
      apps: s.apps.map((a) =>
        a.id === appId
          ? {
              ...a,
              status: 'published',
              publishedUrl: `workbench.baic.com.cn/app/${a.code}`,
              version: bumpVersion(a.version),
              versions: [
                { version: bumpVersion(a.version), time: now(), operator: '张松', note: '发布到工作台' },
                ...a.versions,
              ],
            }
          : a,
      ),
    })),

  contracts: seedContracts.map((c) => ({ ...c })),
  addContract: (c) => {
    const newCode = `HT-2026-${String(get().contracts.length + 1).padStart(4, '0')}`
    const contract: Contract = {
      ...c,
      id: nextId('C'),
      code: newCode,
      date: today(),
      status: 'pending',
      applicant: '张松',
    }
    set((s) => ({ contracts: [contract, ...s.contracts] }))
    // 自动发起审批流程 → 生成一条待办 + 一条消息（流程中心/待办中心/通知中心能力注入的体现）
    get().addTodo({
      title: `${contract.name} 待你审批`,
      appCode: 'contract-approval',
      appName: '合同审批系统',
      type: '合同审批',
      link: '/app/contract-approval',
    })
    get().addMessage({
      title: `${contract.name} 已发起审批流程`,
      content: `合同编号 ${contract.code} 已自动进入审批流程，下一节点：部门审批。`,
      appCode: 'contract-approval',
      type: 'approval',
    })
  },

  todos: seedTodos.map((t) => ({ ...t })),
  addTodo: (t) =>
    set((s) => ({
      todos: [{ ...t, id: nextId('TD'), status: 'pending', createdAt: now() }, ...s.todos],
    })),
  finishTodo: (id) =>
    set((s) => ({ todos: s.todos.map((t) => (t.id === id ? { ...t, status: 'done' } : t)) })),

  messages: seedMessages.map((m) => ({ ...m })),
  addMessage: (m) =>
    set((s) => ({
      messages: [{ ...m, id: nextId('M'), read: false, createdAt: now() }, ...s.messages],
    })),
  readMessage: (id) =>
    set((s) => ({ messages: s.messages.map((m) => (m.id === id ? { ...m, read: true } : m)) })),
  readAllMessages: () => set((s) => ({ messages: s.messages.map((m) => ({ ...m, read: true })) })),
}))

// 版本号自增 v0.1.0 -> v0.2.0
function bumpVersion(v: string): string {
  const m = v.match(/^v(\d+)\.(\d+)\.(\d+)$/)
  if (!m) return 'v1.0.0'
  return `v${m[1]}.${Number(m[2]) + 1}.${m[3]}`
}

// 导出便捷钩子
export const useApps = () => useAppStore((s) => s.apps)
export const useTodos = () => useAppStore((s) => s.todos)
export const useMessages = () => useAppStore((s) => s.messages)
export const useContracts = () => useAppStore((s) => s.contracts)
export type { AppState }
export type ApiStatus = ApiApprovalStatus
export { apiIdsOfCapability }