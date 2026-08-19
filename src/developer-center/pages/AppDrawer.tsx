import { useState, useEffect } from 'react'
import { Drawer, Form, Input, Select, Button, Radio, Space, App as AntdApp, Descriptions, Typography, Alert, Tag, Modal } from 'antd'
import { CheckOutlined, EditOutlined } from '@ant-design/icons'
import { useAppStore } from '@/store/useAppStore'
import { tenants } from '@/mock/tenants'
import { AppIcon } from '@/shared/components/AppIcon'
import { businessDomains, domainMap } from '@/mock/businessDomains'
import type { App } from '@/types'

const presetIcons = ['Appstore', 'FileProtect', 'Car', 'Shop', 'Team', 'Dashboard', 'Profile', 'Block']
const presetColors = ['#2563eb', '#06b6d4', '#7c3aed', '#f59e0b', '#ef4444', '#10b981', '#0ea5e9', '#64748b']
const { Text } = Typography

type Mode = 'create' | 'edit' | 'view'

interface Props {
  mode: Mode
  open: boolean
  appId?: string
  onClose: () => void
  onEdit?: () => void
  onCreated?: (id: string) => void
}

export default function AppDrawer({ mode, open, appId, onClose, onEdit, onCreated }: Props) {
  const { message } = AntdApp.useApp()
  const createApp = useAppStore((s) => s.createApp)
  const updateApp = useAppStore((s) => s.updateApp)
  const app = useAppStore((s) => (appId ? s.apps.find((a) => a.id === appId) : undefined))
  const [form] = Form.useForm()
  const [icon, setIcon] = useState('Appstore')
  const [color, setColor] = useState('#2563eb')
  const [code, setCode] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [createdSecret, setCreatedSecret] = useState('')

  useEffect(() => {
    if (open && mode === 'create') {
      form.resetFields()
      form.setFieldsValue({ tenantId: tenants[0].id, description: '', domain: 'general' })
      setIcon('Appstore')
      setColor('#2563eb')
      setCode('')
    } else if (open && app && (mode === 'edit')) {
      form.setFieldsValue({
        name: app.name,
        description: app.description,
        code: app.code,
        tenantId: app.tenantId,
        domain: app.domain,
        accessUrl: app.accessUrl,
      })
      setIcon(app.icon)
      setColor(app.iconBg)
      setCode(app.code)
    }
  }, [open, mode, app?.id])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (mode === 'create') {
        if (!/^[a-z0-9-]{2,30}$/.test(values.code)) {
          message.error('应用编码只能包含小写字母、数字和连字符，2-30 位')
          return
        }
        const id = createApp({ ...values, icon, iconBg: color, domain: values.domain || 'general' })
        const newApp = useAppStore.getState().getApp(id)
        setCreatedSecret(newApp?.appSecret ?? '')
        onClose()
        setShowSecret(true)
        onCreated?.(id)
      } else if (mode === 'edit' && app) {
        updateApp(app.id, { name: values.name, description: values.description, tenantId: values.tenantId, domain: values.domain, accessUrl: values.accessUrl, icon, iconBg: color })
        message.success('应用信息已保存')
        onClose()
      }
    } catch {
      // validation errors
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => message.success(`${label}已复制`)).catch(() => message.error('复制失败'))
  }

  const isForm = mode === 'create' || mode === 'edit'

  const titleMap = { create: '创建应用', edit: '编辑应用', view: '应用详情' }

  const formContent = (
    <Form form={form} layout="vertical" initialValues={{ tenantId: tenants[0].id, description: '', domain: 'general' }} requiredMark>
      <Form.Item label="应用名称" name="name" rules={[{ required: true, message: '请输入应用名称' }]}>
        <Input placeholder="例如：合同审批系统" maxLength={30} showCount />
      </Form.Item>

      <Form.Item label="应用描述" name="description">
        <Input.TextArea placeholder="一句话描述应用的用途与价值" rows={3} maxLength={120} showCount />
      </Form.Item>

      <Form.Item label="业务领域" name="domain" rules={[{ required: true, message: '请选择业务领域' }]}>
        <Select
          placeholder="请选择业务领域"
          options={businessDomains.map((d) => ({
            value: d.key,
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, display: 'inline-block' }} />
                {d.name}
                <span style={{ fontSize: 11, color: '#94a3b8' }}>· {d.description}</span>
              </span>
            ),
          }))}
        />
      </Form.Item>

      <Form.Item label="应用图标">
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {presetIcons.map((ic) => (
              <div
                key={ic}
                onClick={() => setIcon(ic)}
                style={{
                  width: 44, height: 44, borderRadius: 10, cursor: 'pointer',
                  border: icon === ic ? '2px solid #2563eb' : '2px solid #eef2f7',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: icon === ic ? '#eaf1ff' : '#f8fafc', color: '#475569', fontSize: 18,
                }}
              >
                <AppIcon icon={ic} bg={color} size={36} />
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>主题色</div>
            <Radio.Group value={color} onChange={(e) => setColor(e.target.value)}>
              {presetColors.map((c) => (
                <Radio.Button key={c} value={c} style={{ background: c, borderColor: c, height: 28, width: 28, padding: 0, marginRight: 6 }}>
                  {color === c && <CheckOutlined style={{ color: '#fff' }} />}
                </Radio.Button>
              ))}
            </Radio.Group>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>预览：</span>
            <AppIcon icon={icon} bg={color} size={40} />
          </div>
        </Space>
      </Form.Item>

      <Form.Item
        label="应用编码"
        name="code"
        rules={[{ required: true, message: '请输入应用编码' }]}
        extra={<span style={{ fontSize: 12, color: '#94a3b8' }}>创建后不可修改，将作为工作台访问地址的后缀：/app/<b style={{ color: '#2563eb' }}>{code || 'your-code'}</b></span>}
      >
        <Input
          placeholder="例如：contract-approval"
          disabled={mode === 'edit'}
          onChange={(e) => setCode(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
          value={code}
        />
      </Form.Item>

      <Form.Item
        label="访问地址"
        name="accessUrl"
        rules={[{ required: true, message: '请输入应用正式访问地址' }, { type: 'url', message: '请输入合法的 URL 地址' }]}
        extra={<span style={{ fontSize: 12, color: '#94a3b8' }}>应用正式访问 URL</span>}
      >
        <Input placeholder="https://workbench.baic.com.cn/app/your-code" />
      </Form.Item>

      <Form.Item label="所属租户" name="tenantId" rules={[{ required: true, message: '请选择租户' }]}>
        <Select
          options={tenants.map((t) => ({ value: t.id, label: `${t.name}（${t.appCount} 应用 / ${t.userCount} 用户）` }))}
        />
      </Form.Item>
    </Form>
  )

  const viewContent = app ? (
    <div>
      {/* 头部 */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid #f0f0f0' }}>
        <AppIcon icon={app.icon} bg={app.iconBg} size={48} />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>{app.name}</span>
            {domainMap[app.domain] && <Tag color={domainMap[app.domain].color} style={{ margin: 0 }}>{domainMap[app.domain].name}</Tag>}
          </div>
          <div style={{ fontSize: 12, color: '#2563eb', marginTop: 4, fontFamily: 'monospace' }}>{app.accessUrl}</div>
        </div>
      </div>

      {/* 基本信息 */}
      <Descriptions column={1} bordered size="middle" style={{ marginBottom: 20 }}>
        <Descriptions.Item label="应用名称">{app.name}</Descriptions.Item>
        <Descriptions.Item label="应用编码"><Text code style={{ fontSize: 13 }}>{app.code}</Text></Descriptions.Item>
        <Descriptions.Item label="应用描述">{app.description}</Descriptions.Item>
        <Descriptions.Item label="访问地址"><Text style={{ fontSize: 13, fontFamily: 'monospace' }}>{app.accessUrl}</Text></Descriptions.Item>
        <Descriptions.Item label="所属租户">{tenants.find((t) => t.id === app.tenantId)?.name ?? app.tenantId}</Descriptions.Item>
        <Descriptions.Item label="业务领域">{domainMap[app.domain]?.name ?? app.domain}</Descriptions.Item>
      </Descriptions>

      {/* 凭证信息 */}
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#0f172a' }}>应用密钥</div>
      <Descriptions column={1} bordered size="middle">
        <Descriptions.Item label="AppSecret">
          <Space>
            <Text code style={{ fontSize: 13 }}>{app.appSecret}</Text>
            <Button size="small" type="text" onClick={() => copyToClipboard(app.appSecret, 'AppSecret')}>复制</Button>
          </Space>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>用于接口鉴权，请妥善保管</div>
        </Descriptions.Item>
      </Descriptions>
    </div>
  ) : null

  const footer = isForm ? (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
      <Button onClick={onClose}>取消</Button>
      <Button type="primary" onClick={handleSubmit}>{mode === 'create' ? '创建应用' : '保存'}</Button>
    </div>
  ) : (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
      <Button onClick={onClose}>关闭</Button>
      <Button type="primary" icon={<EditOutlined />} onClick={() => { onClose(); onEdit?.() }}>编辑</Button>
    </div>
  )

  return (
    <>
      <Drawer
        title={<span style={{ fontSize: 16, fontWeight: 700 }}>{titleMap[mode]}</span>}
        open={open}
        onClose={onClose}
        width={520}
        destroyOnClose
        footer={footer}
      >
        {isForm ? formContent : viewContent}
      </Drawer>

      {/* 创建成功后展示 AppSecret */}
      <Modal
        title="应用创建成功"
        open={showSecret}
        closable={false}
        onCancel={() => setShowSecret(false)}
        footer={[
          <Button key="ok" type="primary" onClick={() => setShowSecret(false)}>已保存</Button>,
        ]}
      >
        <Alert type="warning" showIcon style={{ marginBottom: 16 }} message="请立即保存以下 AppSecret，关闭后将无法再次查看" />
        <Descriptions column={1} size="small">
          <Descriptions.Item label="AppSecret">
            <Space>
              <Text code copyable style={{ fontSize: 13, wordBreak: 'break-all' }}>
                {createdSecret}
              </Text>
            </Space>
          </Descriptions.Item>
        </Descriptions>
        <div style={{ fontSize: 12, color: '#94a3b8' }}>AppSecret 可在应用详情中查看和复制。</div>
      </Modal>
    </>
  )
}
