import { useState } from 'react'
import { Card, Button, Input, Space, Tag, Empty, Select, Modal, Form, Divider, App as AntdApp } from 'antd'
import { PlusOutlined, SearchOutlined, ArrowRightOutlined, SettingOutlined, EditOutlined, LinkOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { AppIcon } from '@/shared/components/AppIcon'
import { tenantMap } from '@/mock/tenants'
import { businessDomains } from '@/mock/businessDomains'
import type { BusinessDomain } from '@/types'

export default function AppsList() {
  const navigate = useNavigate()
  const { message } = AntdApp.useApp()
  const apps = useAppStore((s) => s.apps)
  const [keyword, setKeyword] = useState('')
  const [domainFilter, setDomainFilter] = useState<string>('all')
  const [domainModalOpen, setDomainModalOpen] = useState(false)
  const [editingDomain, setEditingDomain] = useState<BusinessDomain | null>(null)
  const [domainForm] = Form.useForm()
  const [localDomains, setLocalDomains] = useState<BusinessDomain[]>(businessDomains)

  const filtered = apps.filter(
    (a) =>
      a.name.toLowerCase().includes(keyword.toLowerCase()) &&
      (domainFilter === 'all' || a.domain === domainFilter),
  )

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
            <Button icon={<SettingOutlined />} onClick={() => setDomainModalOpen(true)}>领域管理</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/apps/create')}>
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
                onClick={() => navigate(`/apps/${a.id}`)}
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
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                      {tenantMap[a.tenantId]?.name} · {a.appKey}
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
                { value: '#2563eb', label: '蓝色' }, { value: '#0891b2', label: '青色' }, { value: '#7c3aed', label: '紫色' },
                { value: '#e11d48', label: '玫红' }, { value: '#ea580c', label: '橙色' }, { value: '#16a34a', label: '绿色' },
                { value: '#9333ea', label: '紫红' }, { value: '#0d9488', label: '蓝绿' }, { value: '#4f46e5', label: '靛蓝' },
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
