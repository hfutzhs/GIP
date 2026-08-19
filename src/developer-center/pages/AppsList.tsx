import { useState } from 'react'
import { Card, Tabs, Button, Input, Space, Tag, Menu, Empty, Select, Modal, Form, Divider, App as AntdApp, theme as antdTheme } from 'antd'
import { PlusOutlined, SearchOutlined, AppstoreOutlined, FileTextOutlined, ArrowRightOutlined, SettingOutlined, EditOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { AppStatusTag } from '@/shared/components/StatusTag'
import { CapabilityCheckedTag } from '@/shared/components/CapabilityTag'
import { AppIcon } from '@/shared/components/AppIcon'
import { tenantMap } from '@/mock/tenants'
import { businessDomains } from '@/mock/businessDomains'
import type { AppStatus, BusinessDomain } from '@/types'

export default function AppsList() {
  const navigate = useNavigate()
  const { message } = AntdApp.useApp()
  const { token } = antdTheme.useToken()
  const apps = useAppStore((s) => s.apps)
  const [filter, setFilter] = useState<AppStatus | 'all'>('all')
  const [keyword, setKeyword] = useState('')
  const [domainFilter, setDomainFilter] = useState<string>('all')
  const [domainModalOpen, setDomainModalOpen] = useState(false)
  const [editingDomain, setEditingDomain] = useState<BusinessDomain | null>(null)
  const [domainForm] = Form.useForm()
  const [localDomains, setLocalDomains] = useState<BusinessDomain[]>(businessDomains)

  const counts = {
    all: apps.length,
    published: apps.filter((a) => a.status === 'published').length,
    developing: apps.filter((a) => a.status === 'developing').length,
    draft: apps.filter((a) => a.status === 'draft').length,
  }

  const filtered = apps.filter(
    (a) =>
      (filter === 'all' || a.status === filter) &&
      a.name.toLowerCase().includes(keyword.toLowerCase()) &&
      (domainFilter === 'all' || a.domain === domainFilter),
  )

  const tabItems = [
    { key: 'all', label: `全部 (${counts.all})` },
    { key: 'published', label: `已发布 (${counts.published})` },
    { key: 'developing', label: `开发中 (${counts.developing})` },
    { key: 'draft', label: `草稿 (${counts.draft})` },
  ]

  const domainOptions = [
    { value: 'all', label: '全部领域' },
    ...localDomains.map((d) => ({ value: d.key, label: d.name })),
  ]

  const openCreateDomain = () => {
    setEditingDomain(null)
    domainForm.resetFields()
    domainForm.setFieldsValue({ color: '#64748b', sort: localDomains.length + 1 })
    setDomainModalOpen(true)
  }

  const openEditDomain = (d: BusinessDomain) => {
    setEditingDomain(d)
    domainForm.setFieldsValue(d)
    setDomainModalOpen(true)
  }

  const saveDomain = () => {
    domainForm.validateFields().then((values) => {
      if (editingDomain) {
        setLocalDomains((prev) => prev.map((d) => (d.key === editingDomain.key ? { ...d, ...values } : d)))
        message.success('领域分类已更新')
      } else {
        const key = (values.name as string).toLowerCase().replace(/\s/g, '-') + '-' + Date.now().toString(36)
        setLocalDomains((prev) => [...prev, { ...values, key }])
        message.success('领域分类已创建')
      }
      setDomainModalOpen(false)
    })
  }

  const DomainTag = ({ domain }: { domain: string }) => {
    const d = localDomains.find((x) => x.key === domain)
    if (!d) return null
    return <Tag style={{ margin: 0, borderRadius: 4, fontSize: 11, border: 'none', background: d.color + '15', color: d.color }}>{d.name}</Tag>
  }

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
          <div style={{ borderTop: '1px solid #f0f0f0', margin: '8px 4px' }} />
          <Menu
            mode="inline"
            selectedKeys={[]}
            style={{ border: 'none' }}
            items={[
              { key: 'domain', icon: <SettingOutlined />, label: '业务领域管理', onClick: () => setDomainModalOpen(true) },
            ]}
          />
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
              <Select
                value={domainFilter}
                onChange={setDomainFilter}
                options={domainOptions}
                style={{ width: 140 }}
              />
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
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>{tenantMap[a.tenantId]?.name} · {a.version}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 12, marginBottom: 8, lineHeight: 1.6, minHeight: 38 }}>
                    {a.description}
                  </div>
                  <div style={{ borderTop: '1px dashed #eef2f7', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                      <DomainTag domain={a.domain} />
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

      {/* 业务领域管理弹窗 */}
      <Modal
        title="业务领域管理"
        open={domainModalOpen}
        onCancel={() => setDomainModalOpen(false)}
        footer={null}
        width={680}
      >
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#64748b' }}>管理应用的业务领域分类，用于应用筛选与归属</span>
          <Button type="primary" size="small" icon={<PlusOutlined />} onClick={openCreateDomain}>新建分类</Button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {localDomains.sort((a, b) => a.sort - b.sort).map((d) => (
            <Card key={d.key} size="small" style={{ borderRadius: 10, borderColor: '#eef2f7' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: 1 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: d.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, display: 'block' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{d.name}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{d.description}</div>
                  </div>
                </div>
                <Button size="small" type="link" icon={<EditOutlined />} onClick={() => openEditDomain(d)} />
              </div>
            </Card>
          ))}
        </div>

        <Divider style={{ margin: '16px 0' }} />

        <Form form={domainForm} layout="vertical">
          <Form.Item label="分类名称" name="name" rules={[{ required: true, message: '请输入分类名称' }]}>
            <Input placeholder="例如：研发" maxLength={20} showCount />
          </Form.Item>
          <Form.Item label="分类描述" name="description">
            <Input.TextArea placeholder="该领域的用途与范围说明" rows={2} maxLength={80} showCount />
          </Form.Item>
          <Form.Item label="标识颜色" name="color">
            <Select
              options={[
                { value: '#2563eb', label: '蓝色' },
                { value: '#0891b2', label: '青色' },
                { value: '#7c3aed', label: '紫色' },
                { value: '#e11d48', label: '玫红' },
                { value: '#ea580c', label: '橙色' },
                { value: '#16a34a', label: '绿色' },
                { value: '#9333ea', label: '紫红' },
                { value: '#0d9488', label: '蓝绿' },
                { value: '#4f46e5', label: '靛蓝' },
                { value: '#64748b', label: '灰色' },
              ]}
              style={{ width: 120 }}
            />
          </Form.Item>
          <Form.Item label="排序" name="sort" initialValue={localDomains.length + 1}>
            <Input type="number" />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setDomainModalOpen(false)}>取消</Button>
            <Button type="primary" onClick={saveDomain}>{editingDomain ? '保存' : '创建'}</Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}