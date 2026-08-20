import { describe, it, expect } from 'vitest'
import { apps, appMap, appByCode, genAppSecret } from '@/mock/apps'
import { tenants, tenantMap } from '@/mock/tenants'
import { businessDomains, domainMap } from '@/mock/businessDomains'
import { dictCategories, dictItems } from '@/mock/dictionaries'
import { currentUser, users, userMap } from '@/mock/users'
import type { App, Tenant, BusinessDomain } from '@/types'

describe('Mock: 应用数据完整性', () => {
  it('应用列表不为空', () => {
    expect(apps.length).toBeGreaterThan(0)
  })

  it('每个应用都有 tenantId', () => {
    for (const a of apps) {
      expect(a.tenantId).toBeTruthy()
      expect(a.tenantId).toMatch(/^T\d{3}$/)
    }
  })

  it('每个应用都有 domain', () => {
    for (const a of apps) {
      expect(a.domain).toBeTruthy()
    }
  })

  it('每个应用都有 appSecret', () => {
    for (const a of apps) {
      expect(a.appSecret).toMatch(/^SK_[0-9a-f]{32}$/)
    }
  })

  it('每个应用都有唯一 code', () => {
    const codes = apps.map((a) => a.code)
    const unique = new Set(codes)
    expect(unique.size).toBe(codes.length)
  })

  it('每个应用都有唯一 id', () => {
    const ids = apps.map((a) => a.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('appMap 与 apps 一致', () => {
    for (const a of apps) {
      expect(appMap[a.id]).toBeDefined()
      expect(appMap[a.id].name).toBe(a.name)
    }
  })

  it('appByCode 与 apps 一致', () => {
    for (const a of apps) {
      expect(appByCode[a.code]).toBeDefined()
      expect(appByCode[a.code].id).toBe(a.id)
    }
  })

  it('genAppSecret 生成符合规范', () => {
    const s = genAppSecret()
    expect(s).toMatch(/^SK_[0-9a-f]{32}$/)
  })

  it('genAppSecret 每次生成不同', () => {
    const s1 = genAppSecret()
    const s2 = genAppSecret()
    expect(s1).not.toBe(s2)
  })

  it('应用的 tenantId 均存在于 tenants 中', () => {
    for (const a of apps) {
      expect(tenantMap[a.tenantId]).toBeDefined()
    }
  })

  it('应用的 domain 均存在于 businessDomains 中', () => {
    for (const a of apps) {
      expect(domainMap[a.domain]).toBeDefined()
    }
  })
})

describe('Mock: 租户数据完整性', () => {
  it('租户列表不为空', () => {
    expect(tenants.length).toBeGreaterThan(0)
  })

  it('租户 ID 唯一', () => {
    const ids = tenants.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('租户 code 唯一', () => {
    const codes = tenants.map((t) => t.code)
    expect(new Set(codes).size).toBe(codes.length)
  })

  it('tenantMap 与 tenants 一致', () => {
    for (const t of tenants) {
      expect(tenantMap[t.id]).toBeDefined()
      expect(tenantMap[t.id].name).toBe(t.name)
    }
  })

  it('所有租户状态为 running 或 stopped', () => {
    for (const t of tenants) {
      expect(['running', 'stopped']).toContain(t.status)
    }
  })
})

describe('Mock: 业务领域完整性', () => {
  it('领域列表不为空', () => {
    expect(businessDomains.length).toBeGreaterThan(0)
  })

  it('领域 key 唯一', () => {
    const keys = businessDomains.map((d) => d.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('领域都有 color 和 name', () => {
    for (const d of businessDomains) {
      expect(d.name).toBeTruthy()
      expect(d.color).toMatch(/^#[0-9a-f]{6}$/)
    }
  })

  it('领域都有 sort 值', () => {
    for (const d of businessDomains) {
      expect(d.sort).toBeGreaterThan(0)
    }
  })

  it('domainMap 与 businessDomains 一致', () => {
    for (const d of businessDomains) {
      expect(domainMap[d.key]).toBeDefined()
      expect(domainMap[d.key].name).toBe(d.name)
    }
  })

  it('包含 general 通用分类', () => {
    expect(domainMap['general']).toBeDefined()
  })
})

describe('Mock: 用户数据完整性', () => {
  it('用户列表不为空', () => {
    expect(users.length).toBeGreaterThan(0)
  })

  it('用户 ID 唯一', () => {
    const ids = users.map((u) => u.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('userMap 与 users 一致', () => {
    for (const u of users) {
      expect(userMap[u.id]).toBeDefined()
      expect(userMap[u.id].name).toBe(u.name)
    }
  })

  it('currentUser 存在于 users 中', () => {
    expect(userMap[currentUser.id]).toBeDefined()
    expect(userMap[currentUser.id].name).toBe(currentUser.name)
  })

  it('currentUser 有 tenantName', () => {
    expect(currentUser.tenantName).toBeTruthy()
  })
})

describe('Mock: 字典数据完整性', () => {
  it('字典分类不为空', () => {
    expect(dictCategories.length).toBeGreaterThan(0)
  })

  it('字典条目不为空', () => {
    expect(dictItems.length).toBeGreaterThan(0)
  })

  it('字典分类 code 唯一', () => {
    const codes = dictCategories.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
  })

  it('字典条目的 categoryCode 均存在', () => {
    const validCodes = dictCategories.map((c) => c.code)
    for (const item of dictItems) {
      expect(validCodes).toContain(item.categoryCode)
    }
  })

  it('字典条目 key 唯一', () => {
    const keys = dictItems.map((i) => i.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('字典条目都有 sort 和 enabled', () => {
    for (const item of dictItems) {
      expect(typeof item.sort).toBe('number')
      expect(typeof item.enabled).toBe('boolean')
    }
  })

  it('字典中的领域分类与 businessDomains 一致', () => {
    const domainItems = dictItems.filter((i) => i.categoryCode === 'business_domain')
    expect(domainItems.length).toBe(businessDomains.length)
  })
})
