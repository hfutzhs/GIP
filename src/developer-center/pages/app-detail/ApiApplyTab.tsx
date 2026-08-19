import { useState, useMemo } from 'react'
import { Table, Tag, Button, Card, Space, Input, App as AntdApp, Alert, Empty } from 'antd'
import { CopyOutlined, ApiOutlined, CheckOutlined, SyncOutlined } from '@ant-design/icons'
import { useAppStore } from '@/store/useAppStore'
import { capabilityMap } from '@/mock/capabilities'
import type { ApiEndpoint, HttpMethod, CapabilityKey } from '@/types'

const methodColor: Record<HttpMethod, string> = {
  GET: 'blue',
  POST: 'green',
  PUT: 'orange',
  DELETE: 'red',
}

const mask = (s: string) => {
  if (s.length <= 8) return s
  return `${s.slice(0, 6)}****${s.slice(-4)}`
}

export default function ApiApplyTab({ appId }: { appId: string }) {
  const { message } = AntdApp.useApp()
  const app = useAppStore((s) => s.apps.find((a) => a.id === appId))!
  const applyApi = useAppStore((s) => s.applyApi)
  const approveApi = useAppStore((s) => s.approveApi)
  const [pending, setPending] = useState<Set<string>>(new Set())

  // 已勾选能力对应的 API 列表
  const apis = useMemo(() => {
    const list: ApiEndpoint[] = []
    app.capabilities.forEach((cap: CapabilityKey) => {
      list.push(...capabilityMap[cap].apis)
    })
    return list
  }, [app.capabilities])

  const statusOf = (api: ApiEndpoint): 'approved' | 'pending' | 'none' => {
    if (app.appliedApiIds.includes(api.id)) return 'approved'
    if (pending.has(api.id)) return 'pending'
    return 'none'
  }

  const handleApply = (api: ApiEndpoint) => {
    setPending((prev) => new Set(prev).add(api.id))
    message.loading({ content: '正在提交调用申请...', key: api.id, duration: 1.2 })
    // 模拟审批流程
    setTimeout(() => {
      setPending((prev) => {
        const next = new Set(prev)
        next.delete(api.id)
        return next
      })
      approveApi(appId, api.id)
      message.success({ content: `${api.path} 调用申请已审批通过`, key: api.id })
    }, 1400)
  }

  const copyText = (text: string, label: string) => {
    navigator.clipboard?.writeText(text).then(
      () => message.success(`${label}已复制`),
      () => message.error('复制失败，请手动复制'),
    )
  }

  const columns = [
    {
      title: '请求方法',
      dataIndex: 'method',
      width: 90,
      render: (m: HttpMethod) => <Tag color={methodColor[m]} style={{ margin: 0 }}>{m}</Tag>,
    },
    { title: '路径', dataIndex: 'path', render: (p: string) => <code style={{ fontSize: 13 }}>{p}</code> },
    { title: '说明', dataIndex: 'description' },
    { title: '所属能力', dataIndex: 'capability', width: 110, render: (c: CapabilityKey) => capabilityMap[c].shortName },
    {
      title: '状态',
      dataIndex: 'id',
      width: 100,
      render: (id: string, record: ApiEndpoint) => {
        const st = statusOf(record)
        if (st === 'approved') return <Tag color="success" style={{ margin: 0 }}><CheckOutlined /> 已批准</Tag>
        if (st === 'pending') return <Tag color="warning" style={{ margin: 0 }}><SyncOutlined spin /> 待审批</Tag>
        return <Tag color="default" style={{ margin: 0 }}>未申请</Tag>
      },
    },
    {
      title: '操作',
      width: 110,
      render: (_: any, record: ApiEndpoint) => {
        const st = statusOf(record)
        if (st === 'approved') return <span style={{ color: '#10b981', fontSize: 13 }}>可调用</span>
        if (st === 'pending') return <Button size="small" disabled>审批中</Button>
        return (
          <Button size="small" type="primary" ghost icon={<ApiOutlined />} onClick={() => handleApply(record)}>
            申请调用
          </Button>
        )
      },
    },
  ]

  return (
    <div>
      <Alert type="info" showIcon style={{ marginBottom: 16 }} message="以下 API 来自已勾选的通用能力，申请通过后即可使用 AppKey / AppSecret 调用。" />

      <Card title={<span style={{ fontSize: 14 }}><ApiOutlined /> 凭证信息</span>} style={{ borderRadius: 12, marginBottom: 16 }}>
        <Space size="large" wrap>
          <Space>
            <span style={{ color: '#64748b', fontSize: 13 }}>AppKey：</span>
            <Input value={app.appKey} readOnly size="small" style={{ width: 200, fontFamily: 'monospace' }} />
            <Button size="small" icon={<CopyOutlined />} onClick={() => copyText(app.appKey, 'AppKey')}>复制</Button>
          </Space>
          <Space>
            <span style={{ color: '#64748b', fontSize: 13 }}>AppSecret：</span>
            <Input value={mask(app.appSecret)} readOnly size="small" style={{ width: 220, fontFamily: 'monospace' }} />
            <Button size="small" icon={<CopyOutlined />} onClick={() => copyText(app.appSecret, 'AppSecret')}>复制</Button>
          </Space>
        </Space>
      </Card>

      <Card title={<span style={{ fontSize: 14 }}>API 端点列表（{apis.length}）</span>} style={{ borderRadius: 12 }}>
        {apis.length === 0 ? (
          <Empty description="请先在「能力组件」中勾选能力" />
        ) : (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={apis}
            pagination={false}
            size="middle"
          />
        )}
      </Card>
    </div>
  )
}