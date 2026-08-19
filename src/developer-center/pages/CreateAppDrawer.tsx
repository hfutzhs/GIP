import { useState } from 'react'
import { Drawer, Form, Input, Select, Button, Radio, Space, App as AntdApp, Divider, Modal, Typography, Alert, Descriptions } from 'antd'
import { AppstoreOutlined, CheckOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { tenants } from '@/mock/tenants'
import { AppIcon } from '@/shared/components/AppIcon'
import { businessDomains } from '@/mock/businessDomains'

const presetIcons = ['Appstore', 'FileProtect', 'Car', 'Shop', 'Team', 'Dashboard', 'Profile', 'Block']
const presetColors = ['#2563eb', '#06b6d4', '#7c3aed', '#f59e0b', '#ef4444', '#10b981', '#0ea5e9', '#64748b']
const { Text, Paragraph } = Typography

interface Props {
  open: boolean
  onClose: () => void
}

export default function CreateAppDrawer({ open, onClose }: Props) {
  const navigate = useNavigate()
  const { message } = AntdApp.useApp()
  const createApp = useAppStore((s) => s.createApp)
  const getApp = useAppStore((s) => s.getApp)
  const [form] = Form.useForm()
  const [icon, setIcon] = useState('Appstore')
  const [color, setColor] = useState('#2563eb')
  const [code, setCode] = useState('')
  const [cred, setCred] = useState<{ open: boolean; appKey: string; appSecret: string; id: string }>({ open: false, appKey: '', appSecret: '', id: '' })

  const handleOpen = () => {
    form.resetFields()
    form.setFieldsValue({ tenantId: tenants[0].id, description: '', domain: 'general' })
    setIcon('Appstore')
    setColor('#2563eb')
    setCode('')
  }

  const submit = async () => {
    try {
      const values = await form.validateFields()
      if (!/^[a-z0-9-]{2,30}$/.test(values.code)) {
        message.error('应用编码只能包含小写字母、数字和连字符，2-30 位')
        return
      }
      const id = createApp({ ...values, icon, iconBg: color, domain: values.domain || 'general' })
      const app = getApp(id)
      onClose()
      setCred({ open: true, appKey: app?.appKey ?? '', appSecret: app?.appSecret ?? '', id })
    } catch {
      // validation errors shown by form
    }
  }

  const goToDetail = () => {
    setCred({ ...cred, open: false })
    navigate(`/apps/${cred.id}`)
  }

  return (
    <>
      <Drawer
        title={<span style={{ fontSize: 16, fontWeight: 700 }}>创建应用</span>}
        open={open}
        onClose={onClose}
        afterOpenChange={(v) => v && handleOpen()}
        width={520}
        destroyOnClose
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={onClose}>取消</Button>
            <Button type="primary" icon={<AppstoreOutlined />} onClick={submit}>创建并进入配置</Button>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ tenantId: tenants[0].id, description: '', domain: 'general' }}
          requiredMark
        >
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
              onChange={(e) => setCode(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              value={code}
            />
          </Form.Item>

          <Form.Item
            label="访问地址"
            name="accessUrl"
            rules={[{ required: true, message: '请输入应用正式访问地址' }, { type: 'url', message: '请输入合法的 URL 地址' }]}
            extra={<span style={{ fontSize: 12, color: '#94a3b8' }}>应用正式访问 URL，如 https://workbench.baic.com.cn/app/{code || 'your-code'}</span>}
          >
            <Input placeholder="https://workbench.baic.com.cn/app/your-code" />
          </Form.Item>

          <Form.Item label="所属租户" name="tenantId" rules={[{ required: true, message: '请选择租户' }]}>
            <Select
              options={tenants.map((t) => ({ value: t.id, label: `${t.name}（${t.appCount} 应用 / ${t.userCount} 用户）` }))}
            />
          </Form.Item>
        </Form>
      </Drawer>

      <Modal
        title="应用创建成功"
        open={cred.open}
        closable={false}
        footer={[
          <Button key="go" type="primary" onClick={goToDetail}>已保存，进入应用详情</Button>,
        ]}
      >
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="请立即保存以下凭证信息，AppSecret 仅此一次明文展示"
        />
        <Descriptions column={1} size="small" style={{ marginBottom: 8 }}>
          <Descriptions.Item label="AppKey">
            <Text code copyable style={{ fontSize: 13 }}>{cred.appKey}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="AppSecret">
            <Paragraph style={{ margin: 0 }}>
              <Text code copyable style={{ fontSize: 13, wordBreak: 'break-all' }}>{cred.appSecret}</Text>
            </Paragraph>
          </Descriptions.Item>
        </Descriptions>
        <div style={{ fontSize: 12, color: '#94a3b8' }}>
          AppKey 创建后不可修改；AppSecret 可在凭证管理中重新生成或吊销。
        </div>
      </Modal>
    </>
  )
}
