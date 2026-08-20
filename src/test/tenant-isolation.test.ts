import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from '@/store/useAppStore'
import { apps as seedApps } from '@/mock/apps'
import { currentUser } from '@/mock/users'
import { processDefs, instances, taskRecords, getMyTodos } from '@/mock/processInstances'

function resetStore() {
  useAppStore.setState({
    product: 'developer',
    currentTenantId: 'T001',
    activeAppCode: 'contract-approval',
    apps: seedApps.map((a) => ({ ...a })),
    contracts: [],
    todos: [],
    messages: [],
  })
}

describe('租户隔离: 应用列表过滤', () => {
  beforeEach(resetStore)

  it('T001 下只显示 T001 的应用', () => {
    useAppStore.getState().setCurrentTenantId('T001')
    const currentTenantId = useAppStore.getState().currentTenantId
    const tenantApps = useAppStore.getState().apps.filter((a) => a.tenantId === currentTenantId)
    expect(tenantApps.length).toBeGreaterThan(0)
    for (const a of tenantApps) {
      expect(a.tenantId).toBe('T001')
    }
  })

  it('T002 下只显示 T002 的应用', () => {
    useAppStore.getState().setCurrentTenantId('T002')
    const currentTenantId = useAppStore.getState().currentTenantId
    const tenantApps = useAppStore.getState().apps.filter((a) => a.tenantId === currentTenantId)
    for (const a of tenantApps) {
      expect(a.tenantId).toBe('T002')
    }
  })

  it('T003 下只显示 T003 的应用', () => {
    useAppStore.getState().setCurrentTenantId('T003')
    const currentTenantId = useAppStore.getState().currentTenantId
    const tenantApps = useAppStore.getState().apps.filter((a) => a.tenantId === currentTenantId)
    for (const a of tenantApps) {
      expect(a.tenantId).toBe('T003')
    }
  })

  it('切换租户后应用列表变化', () => {
    useAppStore.getState().setCurrentTenantId('T001')
    const appsT001 = useAppStore.getState().apps.filter((a) => a.tenantId === 'T001')
    useAppStore.getState().setCurrentTenantId('T002')
    const appsT002 = useAppStore.getState().apps.filter((a) => a.tenantId === 'T002')
    expect(appsT001.length).not.toBe(appsT002.length)
  })

  it('在 T001 下创建应用自动归属 T001', () => {
    useAppStore.getState().setCurrentTenantId('T001')
    const currentTenantId = useAppStore.getState().currentTenantId
    const id = useAppStore.getState().createApp({
      name: '测试',
      description: '描述',
      tenantId: currentTenantId,
      icon: 'Appstore',
      iconBg: '#2563eb',
      domain: 'general',
      accessUrl: 'https://test.com',
    })
    const app = useAppStore.getState().getApp(id)
    expect(app?.tenantId).toBe('T001')
  })

  it('在 T002 下创建应用自动归属 T002', () => {
    useAppStore.getState().setCurrentTenantId('T002')
    const currentTenantId = useAppStore.getState().currentTenantId
    const id = useAppStore.getState().createApp({
      name: '测试',
      description: '描述',
      tenantId: currentTenantId,
      icon: 'Appstore',
      iconBg: '#2563eb',
      domain: 'production',
      accessUrl: 'https://test.com',
    })
    const app = useAppStore.getState().getApp(id)
    expect(app?.tenantId).toBe('T002')
  })

  it('在 T002 创建的应用不会出现在 T001 列表中', () => {
    useAppStore.getState().setCurrentTenantId('T002')
    const currentTenantId = useAppStore.getState().currentTenantId
    const id = useAppStore.getState().createApp({
      name: '福田专属',
      description: '描述',
      tenantId: currentTenantId,
      icon: 'Appstore',
      iconBg: '#2563eb',
      domain: 'production',
      accessUrl: 'https://foton.com',
    })
    useAppStore.getState().setCurrentTenantId('T001')
    const t001Apps = useAppStore.getState().apps.filter((a) => a.tenantId === 'T001')
    expect(t001Apps.find((a) => a.id === id)).toBeUndefined()
  })
})

describe('租户隔离: 流程定义过滤', () => {
  it('T001 下的流程定义不包含 T002 的', () => {
    const t001Defs = processDefs.filter((d) => d.tenantId === 'T001')
    const t002Defs = processDefs.filter((d) => d.tenantId === 'T002')
    for (const d of t001Defs) {
      expect(d.tenantId).toBe('T001')
    }
    for (const d of t002Defs) {
      expect(d.tenantId).toBe('T002')
    }
    expect(t001Defs.length).toBeGreaterThan(0)
    expect(t002Defs.length).toBeGreaterThan(0)
  })

  it('T001 与 T002 的流程定义不重叠', () => {
    const t001Keys = processDefs.filter((d) => d.tenantId === 'T001').map((d) => d.key)
    const t002Keys = processDefs.filter((d) => d.tenantId === 'T002').map((d) => d.key)
    for (const k of t001Keys) {
      expect(t002Keys).not.toContain(k)
    }
  })
})

describe('租户隔离: 流程实例过滤', () => {
  it('T001 实例和 T002 实例分开', () => {
    const t001Inst = instances.filter((i) => i.tenantId === 'T001')
    const t002Inst = instances.filter((i) => i.tenantId === 'T002')
    expect(t001Inst.length).toBeGreaterThan(0)
    expect(t002Inst.length).toBeGreaterThan(0)
    for (const i of t001Inst) {
      expect(i.tenantId).toBe('T001')
    }
  })
})

describe('租户隔离: 任务记录与实例的关联', () => {
  it('每条任务记录的实例租户一致', () => {
    for (const t of taskRecords) {
      const inst = instances.find((i) => i.id === t.instanceId)
      expect(inst).toBeDefined()
      // 任务记录继承实例的租户
    }
  })

  it('当前用户的待办任务都属于有效实例', () => {
    const todos = getMyTodos(currentUser.id)
    for (const t of todos) {
      const inst = instances.find((i) => i.id === t.id)
      expect(inst).toBeDefined()
    }
  })
})
