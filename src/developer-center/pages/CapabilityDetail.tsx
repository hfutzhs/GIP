import { useState } from 'react'
import { Card, Row, Col, Button, Tag, Space, Table, Modal, Input, Select, App as AntdApp, Breadcrumb, Empty, Descriptions, Spin } from 'antd'
import { HomeOutlined, DownloadOutlined, PlayCircleOutlined, ApiOutlined, LeftOutlined, CopyOutlined } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { capabilityMap } from '@/mock/capabilities'
import type { ApiEndpoint, HttpMethod, CapabilityKey } from '@/types'
import FrontendFrameworkView from './FrontendFrameworkView'

const methodColor: Record<HttpMethod, string> = {
  GET: 'blue',
  POST: 'green',
  PUT: 'orange',
  DELETE: 'red',
}

export default function CapabilityDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { message } = AntdApp.useApp()
  const cap = id ? capabilityMap[id as CapabilityKey] : undefined

  const [playground, setPlayground] = useState(false)
  const [activeApiId, setActiveApiId] = useState<string>('')
  const [params, setParams] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<string>('')

  if (!cap) {
    return (
      <div className="page-container">
        <Empty description="能力不存在" />
      </div>
    )
  }

  const activeApi: ApiEndpoint | undefined = cap.apis.find((a) => a.id === activeApiId) ?? cap.apis[0]

  const syncParams = (api: ApiEndpoint) => {
    const init: Record<string, string> = {}
    api.mockParams?.forEach((p) => {
      init[p.name] = p.example ?? ''
    })
    setParams(init)
  }

  const openPlayground = (api?: ApiEndpoint) => {
    const target = api ?? cap.apis[0]
    setActiveApiId(target.id)
    syncParams(target)
    setResponse('')
    setPlayground(true)
  }

  const onApiChange = (apiId: string) => {
    const target = cap.apis.find((a) => a.id === apiId) ?? cap.apis[0]
    setActiveApiId(apiId)
    syncParams(target)
    setResponse('')
  }

  const callApi = () => {
    if (!activeApi) return
    setLoading(true)
    setResponse('')
    setTimeout(() => {
      setLoading(false)
      setResponse(activeApi.mockResponse ?? '{\n  "code": 0,\n  "data": {}\n}')
      message.success('调用成功')
    }, 900)
  }

  const applyCall = () => {
    message.success(`已提交「${cap.name}」调用申请，审批通过后将获得 AppKey/AppSecret`)
  }

  const downloadSdk = (label: string) => {
    message.success(`${label} 正在准备下载...（演示环境）`)
  }

  const copyText = (text: string, label: string) => {
    navigator.clipboard?.writeText(text).then(
      () => message.success(`${label}已复制`),
      () => message.error('复制失败，请手动复制'),
    )
  }

  const columns = [
    {
      title: '方法',
      dataIndex: 'method',
      width: 80,
      render: (m: HttpMethod) => <Tag color={methodColor[m]} style={{ margin: 0 }}>{m}</Tag>,
    },
    { title: '路径', dataIndex: 'path', render: (p: string) => <code style={{ fontSize: 13 }}>{p}</code> },
    { title: '说明', dataIndex: 'description' },
    {
      title: '操作',
      width: 100,
      render: (_: unknown, record: ApiEndpoint) => (
        <Button size="small" type="link" icon={<PlayCircleOutlined />} onClick={() => openPlayground(record)}>调试</Button>
      ),
    },
  ]

  return (
    <div className="page-container">
      <Breadcrumb
        style={{ marginBottom: 12 }}
        items={[
          { title: <><HomeOutlined /> 首页</>, href: '/' },
          { title: '能力中心', href: '/capabilities' },
          { title: cap.name },
        ]}
      />

      {/* 能力概览 */}
      <Card style={{ borderRadius: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: `${cap.color}14`, color: cap.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700 }}>
              {cap.icon.slice(0, 1)}
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>{cap.name}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4, maxWidth: 520 }}>{cap.description}</div>
            </div>
          </div>
          <Space>
            <Button icon={<LeftOutlined />} onClick={() => navigate('/capabilities')}>返回列表</Button>
            <Button type="primary" ghost icon={<ApiOutlined />} onClick={applyCall}>申请调用</Button>
            <Button type="primary" icon={<PlayCircleOutlined />} onClick={() => openPlayground()}>在线调试</Button>
          </Space>
        </div>
      </Card>

      {cap.key === 'frontend' ? (
        <FrontendFrameworkView cap={cap} />
      ) : (
      <Row gutter={16}>
        {/* API 端点列表 */}
        <Col xs={24} lg={16}>
          <Card title={<span style={{ fontSize: 14 }}><ApiOutlined /> API 端点（{cap.apis.length}）</span>} style={{ borderRadius: 12 }}>
            <Table rowKey="id" columns={columns} dataSource={cap.apis} pagination={false} size="middle" />
          </Card>
        </Col>

        {/* SDK 下载 + 接入说明 */}
        <Col xs={24} lg={8}>
          <Card title={<span style={{ fontSize: 14 }}><DownloadOutlined /> SDK 下载</span>} style={{ borderRadius: 12, marginBottom: 16 }}>
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              {cap.sdk.map((s) => (
                <Button key={s.lang} block icon={<DownloadOutlined />} onClick={() => downloadSdk(s.label)} style={{ textAlign: 'left', height: 44 }}>
                  <span style={{ float: 'left' }}>{s.label}</span>
                  <span style={{ float: 'right', color: '#94a3b8', fontSize: 12 }}>v1.2.0</span>
                </Button>
              ))}
            </Space>
          </Card>
          <Card title={<span style={{ fontSize: 14 }}>接入说明</span>} style={{ borderRadius: 12 }}>
            <Descriptions column={1} size="small" colon={false}>
              <Descriptions.Item label="接入方式">SDK + REST API</Descriptions.Item>
              <Descriptions.Item label="认证方式">AppKey / AppSecret 签名</Descriptions.Item>
              <Descriptions.Item label="环境">沙箱 / 生产双环境</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
      )}

      {/* API Playground */}
      <Modal
        title={<span><PlayCircleOutlined style={{ color: '#2563eb', marginRight: 8 }} />API 在线调试</span>}
        open={playground}
        onCancel={() => setPlayground(false)}
        footer={null}
        width={680}
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>选择接口</div>
          <Select
            value={activeApiId}
            onChange={onApiChange}
            style={{ width: '100%' }}
            options={cap.apis.map((a) => ({ value: a.id, label: `${a.method} ${a.path}` }))}
          />
          {activeApi && (
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, background: '#f1f5f9', padding: '8px 12px', borderRadius: 8 }}>
              <Tag color={methodColor[activeApi.method]} style={{ margin: 0 }}>{activeApi.method}</Tag>
              <code style={{ fontSize: 13, color: '#0f172a' }}>{activeApi.path}</code>
              <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 'auto' }}>{activeApi.description}</span>
            </div>
          )}
        </div>

        {/* 请求参数 */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>请求参数</div>
          {activeApi && activeApi.mockParams && activeApi.mockParams.length > 0 ? (
            activeApi.mockParams.map((p) => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ width: 130, fontSize: 13, flexShrink: 0 }}>
                  {p.name}
                  {p.required && <span style={{ color: '#ef4444' }}> *</span>}
                </span>
                <Input
                  size="small"
                  placeholder={p.description}
                  value={params[p.name] ?? ''}
                  onChange={(e) => setParams({ ...params, [p.name]: e.target.value })}
                  style={{ fontFamily: 'monospace' }}
                />
              </div>
            ))
          ) : (
            <div style={{ fontSize: 13, color: '#94a3b8' }}>该接口无需参数</div>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlayCircleOutlined />} loading={loading} onClick={callApi}>
            发起调用
          </Button>
        </div>

        {/* 响应结果 */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: '#64748b' }}>响应结果</span>
            {response && <Button size="small" type="text" icon={<CopyOutlined />} onClick={() => copyText(response, '响应结果')}>复制</Button>}
          </div>
          <div style={{ background: '#0f172a', borderRadius: 8, padding: 14, minHeight: 120 }}>
            {loading ? (
              <div style={{ textAlign: 'center', paddingTop: 30 }}><Spin /></div>
            ) : response ? (
              <pre style={{ margin: 0, color: '#34d399', fontSize: 12, fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{response}</pre>
            ) : (
              <span style={{ color: '#64748b', fontSize: 13 }}>点击「发起调用」查看 Mock 返回结果</span>
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}