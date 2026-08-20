import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from '@/store/useAppStore'
import { apps as seedApps } from '@/mock/apps'

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

describe('Store: 产品切换', () => {
  beforeEach(resetStore)

  it('默认产品为 developer', () => {
    expect(useAppStore.getState().product).toBe('developer')
  })

  it('切换到 workbench', () => {
    useAppStore.getState().setProduct('workbench')
    expect(useAppStore.getState().product).toBe('workbench')
  })

  it('切换回 developer', () => {
    useAppStore.getState().setProduct('workbench')
    useAppStore.getState().setProduct('developer')
    expect(useAppStore.getState().product).toBe('developer')
  })
})

describe('Store: 租户切换', () => {
  beforeEach(resetStore)

  it('默认租户为 T001', () => {
    expect(useAppStore.getState().currentTenantId).toBe('T001')
  })

  it('切换到 T002', () => {
    useAppStore.getState().setCurrentTenantId('T002')
    expect(useAppStore.getState().currentTenantId).toBe('T002')
  })

  it('切换到 T003', () => {
    useAppStore.getState().setCurrentTenantId('T003')
    expect(useAppStore.getState().currentTenantId).toBe('T003')
  })

  it('切换回 T001', () => {
    useAppStore.getState().setCurrentTenantId('T002')
    useAppStore.getState().setCurrentTenantId('T001')
    expect(useAppStore.getState().currentTenantId).toBe('T001')
  })
})

describe('Store: 应用 CRUD', () => {
  beforeEach(resetStore)

  it('初始应用数量正确', () => {
    expect(useAppStore.getState().apps.length).toBe(5)
  })

  it('getApp 按 ID 查询', () => {
    const app = useAppStore.getState().getApp('app-contract')
    expect(app).toBeDefined()
    expect(app?.name).toBe('合同审批系统')
  })

  it('getAppByCode 按编码查询', () => {
    const app = useAppStore.getState().getAppByCode('contract-approval')
    expect(app).toBeDefined()
    expect(app?.id).toBe('app-contract')
  })

  it('getApp 不存在的 ID 返回 undefined', () => {
    expect(useAppStore.getState().getApp('nonexistent')).toBeUndefined()
  })

  it('createApp 创建应用并返回 ID', () => {
    const id = useAppStore.getState().createApp({
      name: '测试应用',
      description: '测试描述',
      tenantId: 'T001',
      icon: 'Appstore',
      iconBg: '#2563eb',
      domain: 'general',
      accessUrl: 'https://test.baic.com.cn',
    })
    expect(id).toMatch(/^app-/)
    expect(useAppStore.getState().apps.length).toBe(6)
    const created = useAppStore.getState().getApp(id)
    expect(created).toBeDefined()
    expect(created?.name).toBe('测试应用')
    expect(created?.tenantId).toBe('T001')
  })

  it('createApp 自动生成 appSecret', () => {
    const id = useAppStore.getState().createApp({
      name: '测试',
      description: '描述',
      tenantId: 'T001',
      icon: 'Appstore',
      iconBg: '#2563eb',
      domain: 'general',
      accessUrl: 'https://test.baic.com.cn',
    })
    const app = useAppStore.getState().getApp(id)
    expect(app?.appSecret).toMatch(/^SK_[0-9a-f]{32}$/)
  })

  it('createApp 自动生成 code', () => {
    const id = useAppStore.getState().createApp({
      name: '测试',
      description: '描述',
      tenantId: 'T001',
      icon: 'Appstore',
      iconBg: '#2563eb',
      domain: 'general',
      accessUrl: 'https://test.baic.com.cn',
    })
    const app = useAppStore.getState().getApp(id)
    expect(app?.code).toMatch(/^app-/)
  })

  it('updateApp 更新应用名称', () => {
    useAppStore.getState().updateApp('app-contract', { name: '新名称' })
    const app = useAppStore.getState().getApp('app-contract')
    expect(app?.name).toBe('新名称')
  })

  it('updateApp 不影响其他应用', () => {
    useAppStore.getState().updateApp('app-contract', { name: '新名称' })
    const other = useAppStore.getState().getApp('app-vehicle')
    expect(other?.name).toBe('车辆调度平台')
  })

  it('deleteApp 删除应用', () => {
    useAppStore.getState().deleteApp('app-contract')
    expect(useAppStore.getState().apps.length).toBe(4)
    expect(useAppStore.getState().getApp('app-contract')).toBeUndefined()
  })

  it('createApp 可以指定不同租户', () => {
    const id = useAppStore.getState().createApp({
      name: '福田应用',
      description: '描述',
      tenantId: 'T002',
      icon: 'Appstore',
      iconBg: '#2563eb',
      domain: 'production',
      accessUrl: 'https://foton.baic.com.cn',
    })
    const app = useAppStore.getState().getApp(id)
    expect(app?.tenantId).toBe('T002')
  })
})

describe('Store: 合同管理', () => {
  beforeEach(resetStore)

  it('添加合同后列表增加', () => {
    const before = useAppStore.getState().contracts.length
    useAppStore.getState().addContract({
      name: '测试合同',
      party: '测试方',
      amount: 10000,
      type: '采购合同',
    })
    expect(useAppStore.getState().contracts.length).toBe(before + 1)
  })

  it('新合同默认状态为 pending', () => {
    useAppStore.getState().addContract({
      name: '测试合同',
      party: '测试方',
      amount: 10000,
      type: '采购合同',
    })
    const c = useAppStore.getState().contracts[0]
    expect(c.status).toBe('pending')
  })

  it('新合同自动生成编码', () => {
    useAppStore.getState().addContract({
      name: '测试合同',
      party: '测试方',
      amount: 10000,
      type: '采购合同',
    })
    const c = useAppStore.getState().contracts[0]
    expect(c.code).toMatch(/^HT/)
    expect(c.id).toMatch(/^C-/)
  })
})

describe('Store: 待办管理', () => {
  beforeEach(resetStore)

  it('添加待办', () => {
    useAppStore.getState().addTodo({
      title: '测试待办',
      appCode: 'contract-approval',
      appName: '合同审批系统',
      type: '合同审批',
    })
    expect(useAppStore.getState().todos.length).toBe(1)
    expect(useAppStore.getState().todos[0].status).toBe('pending')
  })

  it('完成待办后状态变为 done', () => {
    useAppStore.getState().addTodo({
      title: '测试待办',
      appCode: 'contract-approval',
      appName: '合同审批系统',
      type: '合同审批',
    })
    const todoId = useAppStore.getState().todos[0].id
    useAppStore.getState().finishTodo(todoId)
    const todo = useAppStore.getState().todos.find((t) => t.id === todoId)
    expect(todo?.status).toBe('done')
  })
})

describe('Store: 消息管理', () => {
  beforeEach(resetStore)

  it('添加消息默认未读', () => {
    useAppStore.getState().addMessage({
      title: '测试消息',
      content: '测试内容',
      appCode: 'contract-approval',
      type: 'system',
    })
    expect(useAppStore.getState().messages.length).toBe(1)
    expect(useAppStore.getState().messages[0].read).toBe(false)
  })

  it('阅读单条消息', () => {
    useAppStore.getState().addMessage({
      title: '测试消息',
      content: '测试内容',
      appCode: 'contract-approval',
      type: 'system',
    })
    const msgId = useAppStore.getState().messages[0].id
    useAppStore.getState().readMessage(msgId)
    const msg = useAppStore.getState().messages.find((m) => m.id === msgId)
    expect(msg?.read).toBe(true)
  })

  it('全部已读', () => {
    useAppStore.getState().addMessage({ title: 'A', content: 'a', appCode: 'x', type: 'system' })
    useAppStore.getState().addMessage({ title: 'B', content: 'b', appCode: 'x', type: 'notice' })
    useAppStore.getState().readAllMessages()
    const unread = useAppStore.getState().messages.filter((m) => !m.read)
    expect(unread.length).toBe(0)
  })
})
