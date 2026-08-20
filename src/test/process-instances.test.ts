import { describe, it, expect } from 'vitest'
import {
  processDefs,
  instances,
  taskRecords,
  processCategories,
  getTaskRecords,
  getMyTodos,
  getMyDone,
  getMyInitiated,
} from '@/mock/processInstances'
import { currentUser } from '@/mock/users'

describe('Mock: 流程定义数据', () => {
  it('流程定义列表不为空', () => {
    expect(processDefs.length).toBeGreaterThan(0)
  })

  it('流程定义都有 tenantId', () => {
    for (const d of processDefs) {
      expect(d.tenantId).toBeTruthy()
      expect(d.tenantId).toMatch(/^T\d{3}$/)
    }
  })

  it('流程定义都有唯一 key', () => {
    const keys = processDefs.map((d) => d.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('流程定义都有唯一 code', () => {
    const codes = processDefs.map((d) => d.code)
    expect(new Set(codes).size).toBe(codes.length)
  })

  it('流程定义都有 category 且在 processCategories 中', () => {
    for (const d of processDefs) {
      expect(processCategories).toContain(d.category)
    }
  })

  it('流程定义都有节点数 nodes > 0', () => {
    for (const d of processDefs) {
      expect(d.nodes).toBeGreaterThan(0)
    }
  })
})

describe('Mock: 流程实例数据', () => {
  it('实例列表不为空', () => {
    expect(instances.length).toBeGreaterThan(0)
  })

  it('实例都有 tenantId', () => {
    for (const i of instances) {
      expect(i.tenantId).toBeTruthy()
    }
  })

  it('实例 ID 唯一', () => {
    const ids = instances.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('实例状态均为合法值', () => {
    for (const i of instances) {
      expect(['running', 'completed', 'rejected', 'withdrawn']).toContain(i.status)
    }
  })

  it('实例优先级均为合法值', () => {
    for (const i of instances) {
      expect(['normal', 'urgent', 'critical']).toContain(i.priority)
    }
  })

  it('实例的 defKey 在 processDefs 中存在', () => {
    const defKeys = processDefs.map((d) => d.key)
    for (const i of instances) {
      expect(defKeys).toContain(i.defKey)
    }
  })
})

describe('Mock: 任务记录数据', () => {
  it('任务记录列表不为空', () => {
    expect(taskRecords.length).toBeGreaterThan(0)
  })

  it('任务记录的 instanceId 在 instances 中存在', () => {
    const instIds = instances.map((i) => i.id)
    for (const t of taskRecords) {
      expect(instIds).toContain(t.instanceId)
    }
  })

  it('任务记录状态均为合法值', () => {
    for (const t of taskRecords) {
      expect(['approved', 'rejected', 'transferred', 'pending']).toContain(t.status)
    }
  })
})

describe('Process: 查询函数 getTaskRecords', () => {
  it('返回指定实例的任务记录', () => {
    const records = getTaskRecords('PI001')
    expect(records.length).toBeGreaterThan(0)
    for (const r of records) {
      expect(r.instanceId).toBe('PI001')
    }
  })

  it('不存在的实例返回空数组', () => {
    const records = getTaskRecords('NONEXIST')
    expect(records).toEqual([])
  })
})

describe('Process: 查询函数 getMyTodos', () => {
  it('返回当前用户的待办任务', () => {
    const todos = getMyTodos(currentUser.id)
    expect(todos.length).toBeGreaterThan(0)
    for (const t of todos) {
      expect(t.status).toBe('running')
    }
  })

  it('待办任务均为 running 状态', () => {
    const todos = getMyTodos(currentUser.id)
    for (const t of todos) {
      expect(t.status).toBe('running')
    }
  })

  it('不存在的用户返回空数组', () => {
    const todos = getMyTodos('NONEXIST_USER')
    expect(todos).toEqual([])
  })
})

describe('Process: 查询函数 getMyDone', () => {
  it('返回当前用户已办任务', () => {
    const done = getMyDone(currentUser.id)
    expect(done.length).toBeGreaterThan(0)
  })

  it('已办任务的 myTask.status 不为 pending', () => {
    const done = getMyDone(currentUser.id)
    for (const item of done) {
      expect(item.myTask.status).not.toBe('pending')
    }
  })

  it('已办任务的 assigneeId 为当前用户', () => {
    const done = getMyDone(currentUser.id)
    for (const item of done) {
      expect(item.myTask.assigneeId).toBe(currentUser.id)
    }
  })

  it('不存在的用户返回空数组', () => {
    const done = getMyDone('NONEXIST_USER')
    expect(done).toEqual([])
  })
})

describe('Process: 查询函数 getMyInitiated', () => {
  it('返回当前用户发起的流程', () => {
    const initiated = getMyInitiated(currentUser.id)
    expect(initiated.length).toBeGreaterThan(0)
  })

  it('发起人均为当前用户', () => {
    const initiated = getMyInitiated(currentUser.id)
    for (const i of initiated) {
      expect(i.initiator).toBe(currentUser.name)
    }
  })

  it('其他用户发起的流程不应包含在结果中', () => {
    const initiated = getMyInitiated(currentUser.id)
    const otherUserNames = ['李娜', '王强', '孙琴']
    for (const i of initiated) {
      expect(otherUserNames).not.toContain(i.initiator)
    }
  })

  it('不存在的用户应该返回空数组', () => {
    const initiated = getMyInitiated('NONEXIST_USER')
    // 由于当前实现是硬编码名字，会返回当前用户的数据
    // 这是一个 BUG：函数忽略了 userId 参数
    expect(initiated).toEqual([])
  })
})
