import { useState } from 'react'
import { Layout, Menu, Card, Row, Col, Button, Tag, Table, Modal, Form, Input, Select, Switch, Drawer, Upload, Tree, Space, Statistic, App as AntdApp, Empty, Descriptions, Badge, InputNumber, Tooltip, Progress } from 'antd'
import {
  RobotOutlined,
  ApiOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  InboxOutlined,
  FileTextOutlined,
  FolderOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  NodeIndexOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Sider, Content } = Layout

// ===== 智能体 mock 数据 =====
interface AgentItem {
  id: string
  name: string
  description: string
  model: string
  status: 'running' | 'stopped' | 'draft'
  tools: number
  knowledgeBase: string
  updatedAt: string
}

const seedAgents: AgentItem[] = [
  { id: 'ag-001', name: '极狐T1销售顾问', description: '面向终端客户的智能销售助手，解答车型配置、价格、优惠政策', model: 'GPT-4o', status: 'running', tools: 5, knowledgeBase: '极狐T1产品知识库', updatedAt: '2026-07-28' },
  { id: 'ag-002', name: '合同审核助手', description: '自动提取合同关键条款，校验合规性与风险点', model: 'Claude-3.5', status: 'running', tools: 3, knowledgeBase: '法务合规知识库', updatedAt: '2026-07-25' },
  { id: 'ag-003', name: '采购比价Agent', description: '多供应商自动询价比价，生成采购建议报告', model: 'GPT-4o', status: 'stopped', tools: 7, knowledgeBase: '供应商数据库', updatedAt: '2026-07-20' },
  { id: 'ag-004', name: '客服工单分流', description: '智能识别工单意图，自动路由至对应处理团队', model: 'Qwen-72B', status: 'draft', tools: 2, knowledgeBase: '客服话术库', updatedAt: '2026-07-15' },
]

// ===== MCP mock 数据 =====
interface McpItem {
  id: string
  name: string
  endpoint: string
  tools: number
  status: 'online' | 'offline'
  description: string
  updatedAt: string
}

const seedMcps: McpItem[] = [
  { id: 'mcp-001', name: '北汽OA系统', endpoint: 'https://oa.baic.com.cn/mcp/v1', tools: 8, status: 'online', description: '公文流转、审批查询、日程管理', updatedAt: '2026-07-30' },
  { id: 'mcp-002', name: 'CRM客户系统', endpoint: 'https://crm.baic.com.cn/mcp/v1', tools: 12, status: 'online', description: '客户档案、商机管理、线索分配', updatedAt: '2026-07-28' },
  { id: 'mcp-003', name: 'ERP采购系统', endpoint: 'https://erp.baic.com.cn/mcp/v1', tools: 6, status: 'offline', description: '采购订单、供应商管理、库存查询', updatedAt: '2026-07-22' },
  { id: 'mcp-004', name: '极狐车辆数据', endpoint: 'https://arc.baic.com.cn/mcp/v1', tools: 5, status: 'online', description: '车型配置、订单状态、交付进度', updatedAt: '2026-07-18' },
]

// ===== SKILL mock 数据 =====
interface SkillItem {
  id: string
  name: string
  description: string
  trigger: string
  type: 'builtin' | 'custom'
  status: 'enabled' | 'disabled'
  updatedAt: string
}

const seedSkills: SkillItem[] = [
  { id: 'sk-001', name: 'Excel数据分析', description: '解析Excel文件并生成数据洞察图表', trigger: '上传Excel文件', type: 'builtin', status: 'enabled', updatedAt: '2026-07-29' },
  { id: 'sk-002', name: '营销报告生成', description: '根据销售数据自动生成月度营销分析报告', trigger: '指令：生成营销报告', type: 'builtin', status: 'enabled', updatedAt: '2026-07-26' },
  { id: 'sk-003', name: '合同条款审查', description: '提取合同关键条款并标注风险点', trigger: '上传合同文件', type: 'custom', status: 'enabled', updatedAt: '2026-07-24' },
  { id: 'sk-004', name: '竞品价格监控', description: '定期抓取竞品官网价格并生成对比表', trigger: '定时任务（每日8:00）', type: 'custom', status: 'disabled', updatedAt: '2026-07-10' },
]

// ===== 知识库 mock 数据 =====
interface KbCategory {
  id: string
  name: string
  fileCount: number
}

interface KbFile {
  id: string
  name: string
  size: string
  categoryId: string
  vectorStatus: 'completed' | 'processing' | 'pending'
  chunkCount: number
  uploadedAt: string
}

const seedCategories: KbCategory[] = [
  { id: 'kb-001', name: '极狐T1产品知识库', fileCount: 24 },
  { id: 'kb-002', name: '法务合规知识库', fileCount: 18 },
  { id: 'kb-003', name: '供应商数据库', fileCount: 32 },
  { id: 'kb-004', name: '客服话术库', fileCount: 15 },
]

const seedFiles: KbFile[] = [
  { id: 'f-001', name: '极狐T1产品手册.pdf', size: '12.4 MB', categoryId: 'kb-001', vectorStatus: 'completed', chunkCount: 342, uploadedAt: '2026-07-28' },
  { id: 'f-002', name: 'T1配置参数表.xlsx', size: '3.2 MB', categoryId: 'kb-001', vectorStatus: 'completed', chunkCount: 86, uploadedAt: '2026-07-27' },
  { id: 'f-003', name: 'T1竞品对比分析.docx', size: '5.8 MB', categoryId: 'kb-001', vectorStatus: 'processing', chunkCount: 0, uploadedAt: '2026-07-30' },
  { id: 'f-004', name: '合同法务审查指南.pdf', size: '8.1 MB', categoryId: 'kb-002', vectorStatus: 'completed', chunkCount: 210, uploadedAt: '2026-07-25' },
  { id: 'f-005', name: '2026版劳动法要点.pdf', size: '4.5 MB', categoryId: 'kb-002', vectorStatus: 'pending', chunkCount: 0, uploadedAt: '2026-07-30' },
]

// ===== 编排节点 mock =====
const orchestrationNodes = [
  { id: 'node-1', type: 'start', name: '用户输入', config: '接收用户自然语言指令' },
  { id: 'node-2', type: 'llm', name: '意图识别', config: 'GPT-4o · 温度0.3 · 识别用户意图分类' },
  { id: 'node-3', type: 'tool', name: '知识库检索', config: '向量检索 TopK=5 · 相似度阈值0.75' },
  { id: 'node-4', type: 'tool', name: 'CRM查询', config: 'MCP: crm.baic.com.cn · 查询客户信息' },
  { id: 'node-5', type: 'llm', name: '回复生成', config: 'GPT-4o · 温度0.7 · 基于检索结果生成回复' },
  { id: 'node-6', type: 'end', name: '输出回复', config: '返回最终回复给用户' },
]

const modelOptions = ['GPT-4o', 'Claude-3.5', 'Qwen-72B', 'DeepSeek-V3', 'GLM-4-Plus']

// ============================================================
// 智能体管理视图
// ============================================================
function AgentManagementView() {
  const { message, modal } = AntdApp.useApp()
  const [agents, setAgents] = useState<AgentItem[]>(seedAgents)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [orchAgent, setOrchAgent] = useState<AgentItem | null>(null)
  const [form] = Form.useForm()

  const openCreate = () => { setEditId(null); form.resetFields(); form.setFieldsValue({ model: 'GPT-4o', status: 'draft' }); setDrawerOpen(true) }
  const openEdit = (r: AgentItem) => { setEditId(r.id); form.setFieldsValue(r); setDrawerOpen(true) }

  const handleSubmit = () => {
    form.validateFields().then((v) => {
      if (editId) {
        setAgents((prev) => prev.map((a) => a.id === editId ? { ...a, ...v, updatedAt: '2026-07-31' } : a))
        message.success('智能体已更新')
      } else {
        setAgents((prev) => [...prev, { ...v, id: 'ag-' + String(Date.now()).slice(-6), tools: 0, updatedAt: '2026-07-31' }])
        message.success('智能体已创建')
      }
      setDrawerOpen(false)
    })
  }

  const handleDelete = (r: AgentItem) => {
    modal.confirm({
      title: '确认删除',
      content: `确定要删除智能体「${r.name}」吗？`,
      okText: '删除', okType: 'danger', cancelText: '取消',
      onOk: () => { setAgents((prev) => prev.filter((a) => a.id !== r.id)); message.success('已删除') },
    })
  }

  const toggleStatus = (r: AgentItem) => {
    const next = r.status === 'running' ? 'stopped' : 'running'
    setAgents((prev) => prev.map((a) => a.id === r.id ? { ...a, status: next } : a))
    message.success(next === 'running' ? '智能体已启动' : '智能体已停止')
  }

  const columns: ColumnsType<AgentItem> = [
    { title: '智能体名称', dataIndex: 'name', width: 180, render: (t, r) => (
      <Space>
        <RobotOutlined style={{ color: '#6366f1' }} />
        <span style={{ fontWeight: 600 }}>{t}</span>
      </Space>
    ) },
    { title: '描述', dataIndex: 'description', ellipsis: true },
    { title: '模型', dataIndex: 'model', width: 120, render: (t) => <Tag>{t}</Tag> },
    { title: '工具数', dataIndex: 'tools', width: 80, align: 'center' },
    { title: '知识库', dataIndex: 'knowledgeBase', width: 160, ellipsis: true },
    { title: '状态', dataIndex: 'status', width: 100, render: (s: string) => {
      const map: Record<string, { c: string; t: string; i: React.ReactNode }> = { running: { c: 'success', t: '运行中', i: <CheckCircleOutlined /> }, stopped: { c: 'default', t: '已停止', i: <ClockCircleOutlined /> }, draft: { c: 'warning', t: '草稿', i: <EditOutlined /> } }
      const m = map[s]; return <Tag color={m.c} icon={m.i}>{m.t}</Tag>
    } },
    { title: '更新时间', dataIndex: 'updatedAt', width: 120 },
    { title: '操作', width: 220, render: (_, r) => (
      <Space size={4}>
        <Button size="small" type="link" icon={<SettingOutlined />} onClick={() => setOrchAgent(r)}>编排</Button>
        <Button size="small" type="link" icon={<EditOutlined />} onClick={() => openEdit(r)}>编辑</Button>
        <Button size="small" type="link" icon={r.status === 'running' ? <ClockCircleOutlined /> : <PlayCircleOutlined />} onClick={() => toggleStatus(r)}>{r.status === 'running' ? '停止' : '启动'}</Button>
        <Button size="small" type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r)}>删除</Button>
      </Space>
    ) },
  ]

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card style={{ borderRadius: 12 }}><Statistic title="智能体总数" value={agents.length} prefix={<RobotOutlined style={{ color: '#6366f1' }} />} /></Card></Col>
        <Col span={6}><Card style={{ borderRadius: 12 }}><Statistic title="运行中" value={agents.filter((a) => a.status === 'running').length} valueStyle={{ color: '#10b981' }} prefix={<CheckCircleOutlined />} /></Card></Col>
        <Col span={6}><Card style={{ borderRadius: 12 }}><Statistic title="已停止" value={agents.filter((a) => a.status === 'stopped').length} valueStyle={{ color: '#94a3b8' }} prefix={<ClockCircleOutlined />} /></Card></Col>
        <Col span={6}><Card style={{ borderRadius: 12 }}><Statistic title="草稿" value={agents.filter((a) => a.status === 'draft').length} valueStyle={{ color: '#f59e0b' }} prefix={<EditOutlined />} /></Card></Col>
      </Row>
      <Card style={{ borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>智能体列表</span>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新建智能体</Button>
        </div>
        <Table rowKey="id" dataSource={agents} columns={columns} pagination={{ pageSize: 8 }} size="middle" />
      </Card>

      <Drawer title={editId ? '编辑智能体' : '新建智能体'} open={drawerOpen} onClose={() => setDrawerOpen(false)} width={480}
        extra={<Space><Button onClick={() => setDrawerOpen(false)}>取消</Button><Button type="primary" onClick={handleSubmit}>保存</Button></Space>}>
        <Form form={form} layout="vertical">
          <Form.Item label="智能体名称" name="name" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="例如：极狐T1销售顾问" />
          </Form.Item>
          <Form.Item label="描述" name="description" rules={[{ required: true, message: '请输入描述' }]}>
            <Input.TextArea rows={3} placeholder="智能体的功能描述" />
          </Form.Item>
          <Form.Item label="大模型" name="model" rules={[{ required: true }]}>
            <Select options={modelOptions.map((m) => ({ value: m, label: m }))} />
          </Form.Item>
          <Form.Item label="关联知识库" name="knowledgeBase">
            <Select options={seedCategories.map((c) => ({ value: c.name, label: c.name }))} placeholder="选择知识库（可选）" allowClear />
          </Form.Item>
          <Form.Item label="初始状态" name="status">
            <Select options={[{ value: 'draft', label: '草稿' }, { value: 'running', label: '运行中' }, { value: 'stopped', label: '已停止' }]} />
          </Form.Item>
        </Form>
      </Drawer>

      <Drawer title={`编排配置 · ${orchAgent?.name ?? ''}`} open={!!orchAgent} onClose={() => setOrchAgent(null)} width={640}
        extra={<Button type="primary" icon={<SaveButton />} onClick={() => { message.success('编排配置已保存'); setOrchAgent(null) }}>保存配置</Button>}>
        {orchAgent && (
          <div>
            <Descriptions column={2} size="small" style={{ marginBottom: 20 }}>
              <Descriptions.Item label="模型">{orchAgent.model}</Descriptions.Item>
              <Descriptions.Item label="工具数">{orchAgent.tools}</Descriptions.Item>
              <Descriptions.Item label="知识库">{orchAgent.knowledgeBase || '未关联'}</Descriptions.Item>
              <Descriptions.Item label="状态"><Tag color="blue">{orchAgent.status}</Tag></Descriptions.Item>
            </Descriptions>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <NodeIndexOutlined style={{ color: '#6366f1' }} /> 编排流程节点
            </div>
            {orchestrationNodes.map((node, i) => (
              <div key={node.id} style={{ display: 'flex', gap: 12, marginBottom: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 32 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: node.type === 'start' ? '#10b981' : node.type === 'end' ? '#ef4444' : node.type === 'llm' ? '#6366f1' : '#06b6d4', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                  {i < orchestrationNodes.length - 1 && <div style={{ width: 2, flex: 1, background: '#e2e8f0', minHeight: 28 }} />}
                </div>
                <div style={{ flex: 1, padding: '10px 14px', background: '#f8fafc', borderRadius: 8, marginBottom: 8, border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{node.name}</span>
                    <Tag style={{ fontSize: 10 }}>{node.type}</Tag>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{node.config}</div>
                </div>
              </div>
            ))}
            <Button type="dashed" block icon={<PlusOutlined />} style={{ marginTop: 12 }}>添加节点</Button>
          </div>
        )}
      </Drawer>
    </div>
  )
}

// 占位组件用于保存按钮icon
function SaveButton() { return <SettingOutlined /> }

// ============================================================
// MCP管理视图
// ============================================================
function McpManagementView() {
  const { message, modal } = AntdApp.useApp()
  const [mcps, setMcps] = useState<McpItem[]>(seedMcps)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [configMcp, setConfigMcp] = useState<McpItem | null>(null)
  const [form] = Form.useForm()

  const openCreate = () => { setEditId(null); form.resetFields(); form.setFieldsValue({ status: 'offline' }); setDrawerOpen(true) }
  const openEdit = (r: McpItem) => { setEditId(r.id); form.setFieldsValue(r); setDrawerOpen(true) }

  const handleSubmit = () => {
    form.validateFields().then((v) => {
      if (editId) {
        setMcps((prev) => prev.map((m) => m.id === editId ? { ...m, ...v, updatedAt: '2026-07-31' } : m))
        message.success('MCP已更新')
      } else {
        setMcps((prev) => [...prev, { ...v, id: 'mcp-' + String(Date.now()).slice(-6), tools: 0, updatedAt: '2026-07-31' }])
        message.success('MCP已创建')
      }
      setDrawerOpen(false)
    })
  }

  const handleDelete = (r: McpItem) => {
    modal.confirm({
      title: '确认删除', content: `确定要删除MCP「${r.name}」吗？`, okText: '删除', okType: 'danger', cancelText: '取消',
      onOk: () => { setMcps((prev) => prev.filter((m) => m.id !== r.id)); message.success('已删除') },
    })
  }

  const toggleStatus = (r: McpItem) => {
    const next = r.status === 'online' ? 'offline' : 'online'
    setMcps((prev) => prev.map((m) => m.id === r.id ? { ...m, status: next } : m))
    message.success(next === 'online' ? 'MCP已上线' : 'MCP已下线')
  }

  const mcpTools = [
    { name: 'queryCustomer', desc: '查询客户信息', method: 'GET', path: '/customer/query' },
    { name: 'createOrder', desc: '创建订单', method: 'POST', path: '/order/create' },
    { name: 'getVehicleConfig', desc: '获取车辆配置', method: 'GET', path: '/vehicle/config' },
    { name: 'updateLead', desc: '更新线索状态', method: 'PUT', path: '/lead/update' },
  ]

  const columns: ColumnsType<McpItem> = [
    { title: 'MCP名称', dataIndex: 'name', width: 160, render: (t) => (
      <Space><ApiOutlined style={{ color: '#06b6d4' }} /><span style={{ fontWeight: 600 }}>{t}</span></Space>
    ) },
    { title: '端点地址', dataIndex: 'endpoint', width: 280, render: (t) => <code style={{ fontSize: 12 }}>{t}</code> },
    { title: '描述', dataIndex: 'description', ellipsis: true },
    { title: '工具数', dataIndex: 'tools', width: 80, align: 'center' },
    { title: '状态', dataIndex: 'status', width: 100, render: (s) => <Badge status={s === 'online' ? 'success' : 'default'} text={s === 'online' ? '在线' : '离线'} /> },
    { title: '更新时间', dataIndex: 'updatedAt', width: 120 },
    { title: '操作', width: 220, render: (_, r) => (
      <Space size={4}>
        <Button size="small" type="link" icon={<SettingOutlined />} onClick={() => setConfigMcp(r)}>功能配置</Button>
        <Button size="small" type="link" icon={<EditOutlined />} onClick={() => openEdit(r)}>编辑</Button>
        <Button size="small" type="link" icon={r.status === 'online' ? <ClockCircleOutlined /> : <PlayCircleOutlined />} onClick={() => toggleStatus(r)}>{r.status === 'online' ? '下线' : '上线'}</Button>
        <Button size="small" type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r)}>删除</Button>
      </Space>
    ) },
  ]

  return (
    <div>
      <Card style={{ borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>MCP服务列表</span>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新建MCP</Button>
        </div>
        <Table rowKey="id" dataSource={mcps} columns={columns} pagination={{ pageSize: 8 }} size="middle" />
      </Card>

      <Drawer title={editId ? '编辑MCP' : '新建MCP'} open={drawerOpen} onClose={() => setDrawerOpen(false)} width={480}
        extra={<Space><Button onClick={() => setDrawerOpen(false)}>取消</Button><Button type="primary" onClick={handleSubmit}>保存</Button></Space>}>
        <Form form={form} layout="vertical">
          <Form.Item label="MCP名称" name="name" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="例如：北汽OA系统" />
          </Form.Item>
          <Form.Item label="端点地址" name="endpoint" rules={[{ required: true, message: '请输入端点地址' }]}>
            <Input placeholder="https://example.com/mcp/v1" />
          </Form.Item>
          <Form.Item label="描述" name="description" rules={[{ required: true, message: '请输入描述' }]}>
            <Input.TextArea rows={2} placeholder="MCP功能描述" />
          </Form.Item>
          <Form.Item label="初始状态" name="status">
            <Select options={[{ value: 'online', label: '在线' }, { value: 'offline', label: '离线' }]} />
          </Form.Item>
        </Form>
      </Drawer>

      <Drawer title={`功能配置 · ${configMcp?.name ?? ''}`} open={!!configMcp} onClose={() => setConfigMcp(null)} width={560}
        extra={<Button type="primary" onClick={() => { message.success('功能配置已保存'); setConfigMcp(null) }}>保存配置</Button>}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>已注册工具（{mcpTools.length}）</div>
        {mcpTools.map((t) => (
          <Card key={t.name} size="small" style={{ marginBottom: 8, borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Space>
                  <Tag color={t.method === 'GET' ? 'blue' : t.method === 'POST' ? 'green' : 'orange'}>{t.method}</Tag>
                  <span style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: 13 }}>{t.name}</span>
                </Space>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{t.desc} · <code style={{ fontSize: 11 }}>{t.path}</code></div>
              </div>
              <Switch defaultChecked />
            </div>
          </Card>
        ))}
        <Button type="dashed" block icon={<PlusOutlined />} style={{ marginTop: 8 }}>注册新工具</Button>
      </Drawer>
    </div>
  )
}

// ============================================================
// SKILL管理视图
// ============================================================
function SkillManagementView() {
  const { message, modal } = AntdApp.useApp()
  const [skills, setSkills] = useState<SkillItem[]>(seedSkills)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [configSkill, setConfigSkill] = useState<SkillItem | null>(null)
  const [form] = Form.useForm()

  const openCreate = () => { setEditId(null); form.resetFields(); form.setFieldsValue({ type: 'custom', status: 'enabled' }); setDrawerOpen(true) }
  const openEdit = (r: SkillItem) => { setEditId(r.id); form.setFieldsValue(r); setDrawerOpen(true) }

  const handleSubmit = () => {
    form.validateFields().then((v) => {
      if (editId) {
        setSkills((prev) => prev.map((s) => s.id === editId ? { ...s, ...v, updatedAt: '2026-07-31' } : s))
        message.success('Skill已更新')
      } else {
        setSkills((prev) => [...prev, { ...v, id: 'sk-' + String(Date.now()).slice(-6), updatedAt: '2026-07-31' }])
        message.success('Skill已创建')
      }
      setDrawerOpen(false)
    })
  }

  const handleDelete = (r: SkillItem) => {
    modal.confirm({
      title: '确认删除', content: `确定要删除Skill「${r.name}」吗？`, okText: '删除', okType: 'danger', cancelText: '取消',
      onOk: () => { setSkills((prev) => prev.filter((s) => s.id !== r.id)); message.success('已删除') },
    })
  }

  const toggleStatus = (r: SkillItem) => {
    const next = r.status === 'enabled' ? 'disabled' : 'enabled'
    setSkills((prev) => prev.map((s) => s.id === r.id ? { ...s, status: next } : s))
    message.success(next === 'enabled' ? 'Skill已启用' : 'Skill已禁用')
  }

  const skillSteps = [
    { step: 1, name: '输入解析', desc: '解析用户输入或上传文件格式' },
    { step: 2, name: '数据预处理', desc: '清洗、分块、格式标准化' },
    { step: 3, name: '模型调用', desc: '调用LLM进行分析/生成' },
    { step: 4, name: '结果输出', desc: '格式化输出并返回给用户' },
  ]

  const columns: ColumnsType<SkillItem> = [
    { title: 'Skill名称', dataIndex: 'name', width: 180, render: (t) => (
      <Space><ThunderboltOutlined style={{ color: '#f59e0b' }} /><span style={{ fontWeight: 600 }}>{t}</span></Space>
    ) },
    { title: '描述', dataIndex: 'description', ellipsis: true },
    { title: '触发方式', dataIndex: 'trigger', width: 180, render: (t) => <Tag icon={<PlayCircleOutlined />}>{t}</Tag> },
    { title: '类型', dataIndex: 'type', width: 100, render: (t) => <Tag color={t === 'builtin' ? 'blue' : 'purple'}>{t === 'builtin' ? '内置' : '自定义'}</Tag> },
    { title: '状态', dataIndex: 'status', width: 100, render: (s) => <Switch checked={s === 'enabled'} size="small" /> },
    { title: '更新时间', dataIndex: 'updatedAt', width: 120 },
    { title: '操作', width: 200, render: (_, r) => (
      <Space size={4}>
        <Button size="small" type="link" icon={<SettingOutlined />} onClick={() => setConfigSkill(r)}>功能配置</Button>
        <Button size="small" type="link" icon={<EditOutlined />} onClick={() => openEdit(r)}>编辑</Button>
        <Button size="small" type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r)}>删除</Button>
      </Space>
    ) },
  ]

  return (
    <div>
      <Card style={{ borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>Skill列表</span>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新建Skill</Button>
        </div>
        <Table rowKey="id" dataSource={skills} columns={columns} pagination={{ pageSize: 8 }} size="middle" />
      </Card>

      <Drawer title={editId ? '编辑Skill' : '新建Skill'} open={drawerOpen} onClose={() => setDrawerOpen(false)} width={480}
        extra={<Space><Button onClick={() => setDrawerOpen(false)}>取消</Button><Button type="primary" onClick={handleSubmit}>保存</Button></Space>}>
        <Form form={form} layout="vertical">
          <Form.Item label="Skill名称" name="name" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="例如：营销报告生成" />
          </Form.Item>
          <Form.Item label="描述" name="description" rules={[{ required: true, message: '请输入描述' }]}>
            <Input.TextArea rows={2} placeholder="Skill功能描述" />
          </Form.Item>
          <Form.Item label="触发方式" name="trigger" rules={[{ required: true, message: '请输入触发方式' }]}>
            <Input placeholder="例如：上传Excel文件" />
          </Form.Item>
          <Form.Item label="类型" name="type">
            <Select options={[{ value: 'builtin', label: '内置' }, { value: 'custom', label: '自定义' }]} />
          </Form.Item>
          <Form.Item label="状态" name="status">
            <Select options={[{ value: 'enabled', label: '启用' }, { value: 'disabled', label: '禁用' }]} />
          </Form.Item>
        </Form>
      </Drawer>

      <Drawer title={`功能配置 · ${configSkill?.name ?? ''}`} open={!!configSkill} onClose={() => setConfigSkill(null)} width={560}
        extra={<Button type="primary" onClick={() => { message.success('功能配置已保存'); setConfigSkill(null) }}>保存配置</Button>}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>执行流程</div>
        {skillSteps.map((s, i) => (
          <div key={s.step} style={{ display: 'flex', gap: 12, marginBottom: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 32 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f59e0b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{s.step}</div>
              {i < skillSteps.length - 1 && <div style={{ width: 2, flex: 1, background: '#e2e8f0', minHeight: 24 }} />}
            </div>
            <div style={{ flex: 1, padding: '10px 14px', background: '#f8fafc', borderRadius: 8, marginBottom: 8, border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{s.name}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{s.desc}</div>
            </div>
          </div>
        ))}
        <Button type="dashed" block icon={<PlusOutlined />} style={{ marginTop: 12 }}>添加步骤</Button>
      </Drawer>
    </div>
  )
}

// ============================================================
// 知识库管理视图
// ============================================================
function KnowledgeBaseView() {
  const { message } = AntdApp.useApp()
  const [categories, setCategories] = useState<KbCategory[]>(seedCategories)
  const [files, setFiles] = useState<KbFile[]>(seedFiles)
  const [selectedCat, setSelectedCat] = useState<string>('kb-001')
  const [catModalOpen, setCatModalOpen] = useState(false)
  const [catForm] = Form.useForm()

  const catFiles = files.filter((f) => f.categoryId === selectedCat)
  const selectedCatName = categories.find((c) => c.id === selectedCat)?.name || ''

  const handleAddCategory = () => {
    catForm.validateFields().then((v) => {
      setCategories((prev) => [...prev, { id: 'kb-' + String(Date.now()).slice(-6), name: v.name, fileCount: 0 }])
      message.success('知识库分类已创建')
      setCatModalOpen(false)
      catForm.resetFields()
    })
  }

  const vectorStatusMap: Record<string, { c: string; t: string; i: React.ReactNode }> = {
    completed: { c: 'success', t: '已向量化', i: <CheckCircleOutlined /> },
    processing: { c: 'processing', t: '向量化中', i: <SyncOutlined spin /> },
    pending: { c: 'default', t: '待处理', i: <ClockCircleOutlined /> },
  }

  const handleUpload = (info: any) => {
    if (info.file) {
      const newFile: KbFile = {
        id: 'f-' + String(Date.now()).slice(-6),
        name: info.file.name || '新建文档.pdf',
        size: '2.1 MB',
        categoryId: selectedCat,
        vectorStatus: 'processing',
        chunkCount: 0,
        uploadedAt: '2026-07-31',
      }
      setFiles((prev) => [newFile, ...prev])
      setCategories((prev) => prev.map((c) => c.id === selectedCat ? { ...c, fileCount: c.fileCount + 1 } : c))
      message.success(`文件「${newFile.name}」已上传，正在向量化处理`)
      setTimeout(() => {
        setFiles((prev) => prev.map((f) => f.id === newFile.id ? { ...f, vectorStatus: 'completed', chunkCount: Math.floor(Math.random() * 200) + 50 } : f))
      }, 3000)
    }
  }

  const handleRevector = (f: KbFile) => {
    setFiles((prev) => prev.map((file) => file.id === f.id ? { ...file, vectorStatus: 'processing', chunkCount: 0 } : file))
    message.success(`正在重新向量化「${f.name}」`)
    setTimeout(() => {
      setFiles((prev) => prev.map((file) => file.id === f.id ? { ...file, vectorStatus: 'completed', chunkCount: Math.floor(Math.random() * 200) + 50 } : file))
    }, 2000)
  }

  const handleDeleteFile = (f: KbFile) => {
    setFiles((prev) => prev.filter((file) => file.id !== f.id))
    setCategories((prev) => prev.map((c) => c.id === f.categoryId ? { ...c, fileCount: c.fileCount - 1 } : c))
    message.success('文件已删除')
  }

  const fileColumns: ColumnsType<KbFile> = [
    { title: '文件名', dataIndex: 'name', render: (t) => (
      <Space><FileTextOutlined style={{ color: '#0ea5e9' }} /><span style={{ fontWeight: 500 }}>{t}</span></Space>
    ) },
    { title: '大小', dataIndex: 'size', width: 100 },
    { title: '分块数', dataIndex: 'chunkCount', width: 90, align: 'center', render: (n) => n > 0 ? <span style={{ fontFamily: 'monospace' }}>{n}</span> : '-' },
    { title: '向量化状态', dataIndex: 'vectorStatus', width: 120, render: (s: string) => {
      const m = vectorStatusMap[s]; return <Tag color={m.c} icon={m.i}>{m.t}</Tag>
    } },
    { title: '上传时间', dataIndex: 'uploadedAt', width: 120 },
    { title: '操作', width: 140, render: (_, r) => (
      <Space size={4}>
        <Button size="small" type="link" icon={<SyncOutlined />} onClick={() => handleRevector(r)} disabled={r.vectorStatus === 'processing'}>重新向量化</Button>
        <Button size="small" type="link" danger icon={<DeleteOutlined />} onClick={() => handleDeleteFile(r)}>删除</Button>
      </Space>
    ) },
  ]

  const completedCount = catFiles.filter((f) => f.vectorStatus === 'completed').length
  const totalChunks = catFiles.reduce((s, f) => s + f.chunkCount, 0)

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <Card style={{ width: 280, borderRadius: 12, flexShrink: 0, height: 'fit-content' }} styles={{ body: { padding: 0 } }}>
        <div style={{ padding: '16px 16px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}><DatabaseOutlined style={{ marginRight: 6, color: '#0ea5e9' }} />知识库分类</span>
          <Button size="small" type="text" icon={<PlusOutlined />} onClick={() => setCatModalOpen(true)} />
        </div>
        <div style={{ padding: '0 8px 8px' }}>
          {categories.map((c) => (
            <div key={c.id} onClick={() => setSelectedCat(c.id)} style={{
              padding: '10px 12px', borderRadius: 8, cursor: 'pointer', marginBottom: 2,
              background: selectedCat === c.id ? 'rgba(14,165,233,0.08)' : 'transparent',
              border: selectedCat === c.id ? '1px solid rgba(14,165,233,0.2)' : '1px solid transparent',
              transition: 'all 0.2s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FolderOutlined style={{ color: selectedCat === c.id ? '#0ea5e9' : '#94a3b8' }} />
                <span style={{ fontSize: 13, fontWeight: selectedCat === c.id ? 600 : 400, color: selectedCat === c.id ? '#0f172a' : '#64748b' }}>{c.name}</span>
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginLeft: 22, marginTop: 2 }}>{c.fileCount} 个文件</div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ flex: 1 }}>
        <Card style={{ borderRadius: 12, marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}><Statistic title="文件总数" value={catFiles.length} prefix={<FileTextOutlined style={{ color: '#0ea5e9' }} />} /></Col>
            <Col span={8}><Statistic title="已向量化" value={completedCount} valueStyle={{ color: '#10b981' }} prefix={<CheckCircleOutlined />} /></Col>
            <Col span={8}><Statistic title="总分块数" value={totalChunks} prefix={<DatabaseOutlined style={{ color: '#6366f1' }} />} /></Col>
          </Row>
        </Card>
        <Card style={{ borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 16, fontWeight: 700 }}>{selectedCatName} · 文件列表</span>
            <Upload showUploadList={false} beforeUpload={() => false} onChange={handleUpload} maxCount={1}>
              <Button type="primary" icon={<InboxOutlined />}>上传文件</Button>
            </Upload>
          </div>
          <Table rowKey="id" dataSource={catFiles} columns={fileColumns} pagination={{ pageSize: 8 }} size="middle" />
        </Card>
      </div>

      <Modal title="新建知识库分类" open={catModalOpen} onOk={handleAddCategory} onCancel={() => { setCatModalOpen(false); catForm.resetFields() }} okText="创建">
        <Form form={catForm} layout="vertical">
          <Form.Item label="分类名称" name="name" rules={[{ required: true, message: '请输入分类名称' }]}>
            <Input placeholder="例如：极狐T1产品知识库" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

// ============================================================
// 主页面
// ============================================================
const sideItems = [
  {
    key: 'agent-mgmt', icon: <RobotOutlined />, label: '智能体管理',
  },
  {
    key: 'mcp-mgmt', icon: <ApiOutlined />, label: 'MCP管理',
  },
  {
    key: 'skill-mgmt', icon: <ThunderboltOutlined />, label: 'SKILL管理',
  },
  {
    key: 'kb-mgmt', icon: <DatabaseOutlined />, label: '知识库管理',
  },
]

export default function AgentCenter() {
  const [activeKey, setActiveKey] = useState('agent-mgmt')

  const renderContent = () => {
    switch (activeKey) {
      case 'agent-mgmt': return <AgentManagementView />
      case 'mcp-mgmt': return <McpManagementView />
      case 'skill-mgmt': return <SkillManagementView />
      case 'kb-mgmt': return <KnowledgeBaseView />
      default: return <Empty description="请选择左侧菜单" />
    }
  }

  return (
    <Layout style={{ minHeight: 'calc(100vh - 64px)' }}>
      <Sider width={220} style={{ background: '#fff', borderRight: '1px solid rgba(226,232,240,0.6)' }}>
        <Menu mode="inline" selectedKeys={[activeKey]} items={sideItems} onClick={({ key }) => setActiveKey(key)}
          style={{ borderRight: 'none', paddingTop: 4 }} />
      </Sider>
      <Content style={{ padding: '20px 24px', background: '#eef2f9', overflowY: 'auto' }}>
        {renderContent()}
      </Content>
    </Layout>
  )
}