import { useState } from 'react'
import { Card, Tabs, Button, Input, Space, Tag, Menu, Empty, theme as antdTheme } from 'antd'
import { PlusOutlined, SearchOutlined, AppstoreOutlined, FileTextOutlined, ArrowRightOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { AppStatusTag } from '@/shared/components/StatusTag'
import { CapabilityCheckedTag } from '@/shared/components/CapabilityTag'
import { AppIcon } from '@/shared/components/AppIcon'
import { tenantMap } from '@/mock/tenants'
import type { AppStatus } from '@/types'

export default function AppsList() {
  const navigate = useNavigate()
  const { token } = antdTheme.useToken()
  const apps = useAppStore((s) => s.apps)
  const [filter, setFilter] = useState<AppStatus | 'all'>('all')
  const [keyword, setKeyword] = useState('')

  const counts = {
    all: apps.length,
    published: apps.filter((a) => a.status === 'published').length,
    developing: apps.filter((a) => a.status === 'developing').length,
    draft: apps.filter((a) => a.status === 'draft').length,
  }

  const filtered = apps.filter(
    (a) => (filter === 'all' || a.status === filter) && a.name.toLowerCase().includes(keyword.toLowerCase()),
  )

  const tabItems = [
    { key: 'all', label: `全部 (${counts.all})` },
    { key: 'published', label: `已发布 (${counts.published})` },
    { key: 'developing', label: `开发中 (${counts.developing})` },
    { key: 'draft', label: `草稿 (${counts.draft})` },
  ]

  const sideMenu = (
    <Menu
      mode="inline"
      selectedKeys={['list']}
      style={{ border: 'none' }}
      items={[
        { key: 'list', icon: <AppstoreOutlined />, label: '应用列表' },
        { key: 'create', icon: <PlusOutlined />, label: '创建应用', onClick: () => navigate('/apps/create') },
      ]}
      onClick={({ key }) => key === 'create' && navigate('/apps/create')}
    />
  )

  return (
    <div style={{ display: 'flex', gap: 16, padding: '20px 24px 40px', maxWidth: 1400, margin: '0 auto' }}>
      {/* 左侧导航 */}
      <div style={{ width: 220, flexShrink: 0 }}>
        <Card style={{ borderRadius: 12, padding: 4 }}>
          <div style={{ fontSize: 12, color: '#94a3b8', padding: '8px 12px 4px', fontWeight: 600 }}>应用中心</div>
          {sideMenu}
        </Card>
        <Card style={{ borderRadius: 12, marginTop: 12, padding: 4 }} title={<span style={{ fontSize: 13 }}><FileTextOutlined /> 我的应用</span>}>
          {apps.map((a) => (
            <div
              key={a.id}
              onClick={() => navigate(`/apps/${a.id}`)}
              style={{ padding: '8px 10px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
              className="hoverable"
            >
              <AppIcon icon={a.icon} bg={a.iconBg} size={26} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>/{a.code}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* 右侧主区域 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Card style={{ borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
            <Tabs
              activeKey={filter}
              onChange={(k) => setFilter(k as AppStatus | 'all')}
              items={tabItems}
              style={{ marginBottom: 0 }}
            />
            <Space>
              <Input
                placeholder="搜索应用名称"
                allowClear
                prefix={<SearchOutlined />}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                style={{ width: 200 }}
              />
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/apps/create')}>
                创建应用
              </Button>
            </Space>
          </div>

          {filtered.length === 0 ? (
            <Empty description="暂无应用" style={{ padding: 40 }} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16, marginTop: 8 }}>
              {filtered.map((a) => (
                <Card
                  key={a.id}
                  className="hoverable"
                  hoverable
                  onClick={() => navigate(`/apps/${a.id}`)}
                  style={{ borderRadius: 12, cursor: 'pointer', borderColor: '#eef2f7' }}
                >
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <AppIcon icon={a.icon} bg={a.iconBg} size={44} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>{a.name}</span>
                        <AppStatusTag status={a.status} />
                      </div>
                      <div style={{ fontSize: 12, color: token.colorPrimary, marginTop: 4, fontFamily: 'monospace' }}>
                        {a.path}
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                        {tenantMap[a.tenantId]?.name} · {a.version}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 12, marginBottom: 8, lineHeight: 1.6, minHeight: 38 }}>
                    {a.description}
                  </div>
                  <div style={{ borderTop: '1px dashed #eef2f7', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      {a.capabilities.map((c) => (
                        <CapabilityCheckedTag key={c} capKey={c} />
                      ))}
                    </div>
                    <Tag style={{ margin: 0, color: token.colorPrimary, cursor: 'pointer', background: '#eaf1ff', border: 'none' }}>
                      配置 <ArrowRightOutlined />
                    </Tag>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}