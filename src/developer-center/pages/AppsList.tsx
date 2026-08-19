import { useState } from 'react'
import { Card, Button, Input, Space, Tag, Empty, Select, App as AntdApp } from 'antd'
import { PlusOutlined, SearchOutlined, ArrowRightOutlined, LinkOutlined } from '@ant-design/icons'
import { useAppStore } from '@/store/useAppStore'
import AppDrawer from './AppDrawer'
import { AppIcon } from '@/shared/components/AppIcon'
import { businessDomains } from '@/mock/businessDomains'
import type { BusinessDomain } from '@/types'

export default function AppsList() {
  const { message } = AntdApp.useApp()
  const apps = useAppStore((s) => s.apps)
  const [keyword, setKeyword] = useState('')
  const [domainFilter, setDomainFilter] = useState<string>('all')
  const [drawerState, setDrawerState] = useState<{ mode: 'create' | 'edit' | 'view'; open: boolean; appId?: string }>({ mode: 'create', open: false })
  const localDomains = businessDomains

  const filtered = apps.filter(
    (a) =>
      a.name.toLowerCase().includes(keyword.toLowerCase()) &&
      (domainFilter === 'all' || a.domain === domainFilter),
  )

  const DomainTag = ({ domain }: { domain: string }) => {
    const d = localDomains.find((x) => x.key === domain)
    if (!d) return null
    return <Tag style={{ margin: 0, borderRadius: 4, fontSize: 11, border: 'none', background: d.color + '15', color: d.color }}>{d.name}</Tag>
  }

  return (
    <div style={{ padding: '20px 24px 40px', maxWidth: 1400, margin: '0 auto' }}>
      <Card style={{ borderRadius: 12 }}>
        {/* 标题栏 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>应用列表</span>
          <Space>
            <Input
              placeholder="搜索应用名称"
              allowClear
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ width: 220 }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setDrawerState({ mode: 'create', open: true })}>
              创建应用
            </Button>
          </Space>
        </div>

        {/* 领域筛选 — 平铺 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
          <div
            onClick={() => setDomainFilter('all')}
            style={{
              padding: '4px 14px',
              borderRadius: 6,
              fontSize: 13,
              cursor: 'pointer',
              fontWeight: domainFilter === 'all' ? 600 : 400,
              color: domainFilter === 'all' ? '#2563eb' : '#64748b',
              background: domainFilter === 'all' ? '#eaf1ff' : '#f8fafc',
              border: domainFilter === 'all' ? '1px solid #2563eb33' : '1px solid #eef2f7',
              transition: 'all 0.15s',
            }}
          >
            全部领域
          </div>
          {localDomains.sort((a, b) => a.sort - b.sort).map((d) => {
            const active = domainFilter === d.key
            const count = apps.filter((a) => a.domain === d.key).length
            return (
              <div
                key={d.key}
                onClick={() => setDomainFilter(d.key)}
                style={{
                  padding: '4px 14px',
                  borderRadius: 6,
                  fontSize: 13,
                  cursor: 'pointer',
                  fontWeight: active ? 600 : 400,
                  color: active ? d.color : '#64748b',
                  background: active ? d.color + '15' : '#f8fafc',
                  border: active ? `1px solid ${d.color}55` : '1px solid #eef2f7',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: d.color, display: 'inline-block' }} />
                {d.name}
                <span style={{ fontSize: 11, opacity: 0.6 }}>{count}</span>
              </div>
            )
          })}
        </div>

        {/* 应用卡片网格 */}
        {filtered.length === 0 ? (
          <Empty description="暂无应用" style={{ padding: 40 }} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {filtered.map((a) => (
              <Card
                key={a.id}
                className="hoverable"
                hoverable
                onClick={() => setDrawerState({ mode: 'view', open: true, appId: a.id })}
                style={{ borderRadius: 12, cursor: 'pointer', borderColor: '#eef2f7' }}
              >
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <AppIcon icon={a.icon} bg={a.iconBg} size={44} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>{a.name}</span>
                      <DomainTag domain={a.domain} />
                    </div>
                    <div style={{ fontSize: 11, color: '#2563eb', marginTop: 4, fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <LinkOutlined /> {a.accessUrl}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 12, marginBottom: 8, lineHeight: 1.6, minHeight: 38 }}>
                  {a.description}
                </div>
                <div style={{ borderTop: '1px dashed #eef2f7', paddingTop: 10, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                  <Tag style={{ margin: 0, color: '#2563eb', cursor: 'pointer', background: '#eaf1ff', border: 'none' }}>
                    查看详情 <ArrowRightOutlined />
                  </Tag>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>


      {/* 创建应用抽屉 */}
      <AppDrawer
        mode={drawerState.mode}
        open={drawerState.open}
        appId={drawerState.appId}
        onClose={() => setDrawerState((p) => ({ ...p, open: false }))}
        onEdit={() => setDrawerState({ mode: 'edit', open: true, appId: drawerState.appId })}
      />
    </div>
  )
}
