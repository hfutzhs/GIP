import { create } from 'zustand'
import type { App, CapabilityKey, Contract, Todo, Message } from '@/types'
import { apps as seedApps, genAppKey, genAppSecret } from '@/mock/apps'
import { contracts as seedContracts } from '@/mock/contracts'
import { todos as seedTodos } from '@/mock/todos'
import { messages as seedMessages } from '@/mock/messages'

type Product = 'developer' | 'workbench'

interface AppState {
  // 产品切换
  product: Product
  setProduct: (p: Product) => void

  // 工作台当前应用 code
  activeAppCode: string
  setActiveAppCode: (code: string) => void

  // 应用主数据
  apps: App[]
  getApp: (id: string) => App | undefined
  getAppByCode: (code: string) => App | undefined
  createApp: (input: { name: string; code: string; description: string; tenantId: string; icon: string; iconBg: string; domain: string; accessUrl: string }) => string
  updateApp: (id: string, patch: Partial<App>) => void
  regenerateAppSecret: (id: string) => string
  revokeCredentials: (id: string) => void

  // 合同（工作台演示）
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

let seq = 1000
const nextId = (prefix: string) => `${prefix}-${++seq}`

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
      accessUrl: input.accessUrl || `https://workbench.baic.com.cn/app/${input.code}`,
      tenantId: input.tenantId,
      domain: input.domain || 'general',
      appKey: genAppKey(input.code),
      appSecret: genAppSecret(),
    }
    set((s) => ({ apps: [...s.apps, newApp] }))
    return id
  },

  updateApp: (id, patch) =>
    set((s) => ({ apps: s.apps.map((a) => (a.id === id ? { ...a, ...patch } : a)) })),

  regenerateAppSecret: (id) => {
    const newSecret = genAppSecret()
    set((s) => ({
      apps: s.apps.map((a) =>
        a.id === id ? { ...a, appSecret: newSecret, credentialsRevoked: false } : a,
      ),
    }))
    return newSecret
  },

  revokeCredentials: (id) =>
    set((s) => ({
      apps: s.apps.map((a) => (a.id === id ? { ...a, credentialsRevoked: true } : a)),
    })),

  // 合同（工作台演示用）
  contracts: seedContracts.map((c) => ({ ...c })),
  addContract: (c) => {
    const id = nextId('C')
    const code = `HT${Date.now().toString().slice(-6)}`
    set((s) => ({
      contracts: [
        { ...c, id, code, date: new Date().toISOString().slice(0, 10), status: 'pending', applicant: '张松' },
        ...s.contracts,
      ],
    }))
  },

  // 待办
  todos: seedTodos.map((t) => ({ ...t })),
  addTodo: (t) => {
    set((s) => ({
      todos: [{ ...t, id: nextId('T'), createdAt: new Date().toISOString(), status: 'pending' }, ...s.todos],
    }))
  },
  finishTodo: (id) => set((s) => ({ todos: s.todos.map((t) => (t.id === id ? { ...t, status: 'done' } : t)) })),

  // 消息
  messages: seedMessages.map((m) => ({ ...m })),
  addMessage: (m) => {
    set((s) => ({
      messages: [{ ...m, id: nextId('M'), createdAt: new Date().toISOString(), read: false }, ...s.messages],
    }))
  },
  readMessage: (id) => set((s) => ({ messages: s.messages.map((m) => (m.id === id ? { ...m, read: true } : m)) })),
  readAllMessages: () => set((s) => ({ messages: s.messages.map((m) => ({ ...m, read: true })) })),
}))
export const useContracts = () => useAppStore((s) => s.contracts)
export const useTodos = () => useAppStore((s) => s.todos)
export const useMessages = () => useAppStore((s) => s.messages)
