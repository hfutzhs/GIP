import { useEffect } from 'react'
import { Form, Input, Select, Button, Space, Divider, App as AntdApp, Alert } from 'antd'
import { useAppStore } from '@/store/useAppStore'
import { tenants } from '@/mock/tenants'
import { businessDomains } from '@/mock/businessDomains'

export default function BasicInfoTab({ appId }: { appId: string }) {
  const { message } = AntdApp.useApp()
  const app = useAppStore((s) => s.apps.find((a) => a.id === appId))!
  const updateApp = useAppStore((s) => s.updateApp)
  const [form] = Form.useForm()

  useEffect(() => {
    form.setFieldsValue({
      name: app.name,
      description: app.description,
      code: app.code,
      tenantId: app.tenantId,
      domain: app.domain,
    })
  }, [app.id])

  const onFinish = (values: { name: string; description: string; tenantId: string; domain: string }) => {
    updateApp(appId, { name: values.name, description: values.description, tenantId: values.tenantId, domain: values.domain })
    message.success('基本信息已保存')
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 20 }}
        message="应用编码创建后不可修改，它将作为工作台访问地址的后缀。"
      />
      <Form form={form} layout="vertical" onFinish={onFinish} requiredMark>
        <Form.Item label="应用名称" name="name" rules={[{ required: true, message: '请输入应用名称' }]}>
          <Input placeholder="例如：合同审批系统" maxLength={30} showCount />
        </Form.Item>
        <Form.Item label="应用描述" name="description">
          <Input.TextArea rows={3} maxLength={120} showCount placeholder="一句话描述应用的用途与价值" />
        </Form.Item>
        <Form.Item label="应用编码" name="code">
          <Input disabled style={{ fontFamily: 'monospace' }} />
        </Form.Item>
        <Form.Item label="所属租户" name="tenantId" rules={[{ required: true, message: '请选择租户' }]}>
          <Select options={tenants.map((t) => ({ value: t.id, label: t.name }))} />
        </Form.Item>
        <Form.Item label="业务领域" name="domain" rules={[{ required: true, message: '请选择业务领域' }]}>
          <Select
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
        <Divider style={{ margin: '8px 0 16px' }} />
        <Space>
          <Button type="primary" htmlType="submit">保存</Button>
          <Button onClick={() => form.resetFields()}>重置</Button>
        </Space>
      </Form>
    </div>
  )
}