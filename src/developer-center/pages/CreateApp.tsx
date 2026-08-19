import { useState } from 'react'
import { Card, Form, Input, Select, Button, Radio, Space, App as AntdApp, Divider, Breadcrumb } from 'antd'
import { HomeOutlined, AppstoreOutlined, CheckOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { tenants } from '@/mock/tenants'
import { AppIcon } from '@/shared/components/AppIcon'

const presetIcons = ['Appstore', 'FileProtect', 'Car', 'Shop', 'Team', 'Dashboard', 'Profile', 'Block']
const presetColors = ['#2563eb', '#06b6d4', '#7c3aed', '#f59e0b', '#ef4444', '#10b981', '#0ea5e9', '#64748b']

export default function CreateApp() {
  const navigate = useNavigate()
  const { message } = AntdApp.useApp()
  const createApp = useAppStore((s) => s.createApp)
  const [form] = Form.useForm()
  const [icon, setIcon] = useState('Appstore')
  const [color, setColor] = useState('#2563eb')
  const [code, setCode] = useState('')

  const onFinish = (values: { name: string; code: string; description: string; tenantId: string }) => {
    if (!/^[a-z0-9-]{2,30}$/.test(values.code)) {
      message.error('应用编码只能包含小写字母、数字和连字符，2-30 位')
      return
    }
    const id = createApp({ ...values, icon, iconBg: color })
    message.success('应用创建成功，进入配置面板')
    navigate(`/apps/${id}`)
  }

  return (
    <div className="page-container">
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <><HomeOutlined /> 首页</>, href: '/' },
          { title: '应用中心', href: '/apps' },
          { title: '创建应用' },
        ]}
      />
      <Card style={{ borderRadius: 12, maxWidth: 820 }} title={<span style={{ fontSize: 16, fontWeight: 700 }}>创建应用</span>}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ tenantId: tenants[0].id, description: '' }}
          requiredMark
        >
          <Form.Item label="应用名称" name="name" rules={[{ required: true, message: '请输入应用名称' }]}>
            <Input placeholder="例如：合同审批系统" maxLength={30} showCount />
          </Form.Item>

          <Form.Item label="应用描述" name="description">
            <Input.TextArea placeholder="一句话描述应用的用途与价值" rows={3} maxLength={120} showCount />
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
            extra={<span style={{ fontSize: 12, color: '#94a3b8' }}>自动生成 URL 后缀：/app/<b style={{ color: '#2563eb' }}>{code || 'your-code'}</b></span>}
          >
            <Input
              placeholder="例如：contract-approval"
              onChange={(e) => setCode(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              value={code}
            />
          </Form.Item>

          <Form.Item label="所属租户" name="tenantId" rules={[{ required: true, message: '请选择租户' }]}>
            <Select
              options={tenants.map((t) => ({ value: t.id, label: `${t.name}（${t.appCount} 应用 / ${t.userCount} 用户）` }))}
            />
          </Form.Item>

          <Divider style={{ margin: '8px 0 16px' }} />
          <Space>
            <Button type="primary" htmlType="submit" icon={<AppstoreOutlined />}>创建并进入配置</Button>
            <Button onClick={() => navigate('/apps')}>取消</Button>
          </Space>
        </Form>
      </Card>
    </div>
  )
}