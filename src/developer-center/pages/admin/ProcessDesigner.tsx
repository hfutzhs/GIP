import { useState, useRef, useEffect, useCallback } from 'react'
import { Layout, Card, Button, Tag, Space, Select, Input, Radio, Empty, Tooltip, App as AntdApp, Spin } from 'antd'
import {
  PlusOutlined,
  UserOutlined,
  CheckSquareOutlined,
  BranchesOutlined,
  FlagOutlined,
  DeleteOutlined,
  ArrowDownOutlined,
  RobotOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  SafetyCertificateOutlined,
  BarChartOutlined,
  SendOutlined,
  LoadingOutlined,
  BulbOutlined,
} from '@ant-design/icons'

const { Sider, Content } = Layout

type NodeType = 'start' | 'approve' | 'cc' | 'branch' | 'end' | 'agent-summary' | 'agent-predict' | 'agent-compliance' | 'agent-efficiency'

interface FlowNode {
  id: string
  type: NodeType
  name: string
  approverType?: string
  approver?: string
  approveMode?: string
  ccTo?: string
  agentConfig?: string
  agentModel?: string
}

const nodeMeta: Record<NodeType, { label: string; color: string; icon: React.ReactNode; isAgent?: boolean }> = {
  start: { label: '发起人', color: '#2563eb', icon: <UserOutlined /> },
  approve: { label: '审批节点', color: '#f59e0b', icon: <CheckSquareOutlined /> },
  cc: { label: '抄送节点', color: '#06b6d4', icon: <UserOutlined /> },
  branch: { label: '条件分支', color: '#7c3aed', icon: <BranchesOutlined /> },
  end: { label: '结束', color: '#10b981', icon: <FlagOutlined /> },
  'agent-summary': { label: '智能摘要Agent', color: '#8b5cf6', icon: <FileTextOutlined />, isAgent: true },
  'agent-predict': { label: '审批预测Agent', color: '#6366f1', icon: <ThunderboltOutlined />, isAgent: true },
  'agent-compliance': { label: '合规校验Agent', color: '#ec4899', icon: <SafetyCertificateOutlined />, isAgent: true },
  'agent-efficiency': { label: '效率分析Agent', color: '#0d9488', icon: <BarChartOutlined />, isAgent: true },
}

const agentDescriptions: Record<string, string> = {
  'agent-summary': '自动读取来文内容，生成200字结构化摘要（文号/事由/关键要素/紧急程度），并进行要件完整性预审',
  'agent-predict': '基于审批内容摘要、历史意见、可选节点、当前审批人信息，预测最可能流转方向，标注置信度与历史相似案例',
  'agent-compliance': '比对合同条款与制度模板偏差、查询签约方征信、识别风险条款并标注、校验费用是否超预算，生成风险评分报告',
  'agent-efficiency': '持续监控流程运行数据，识别瓶颈节点、异常流程、冗余环节，生成流程优化建议卡片',
}

let nid = 0
const genId = () => `n${++nid}`

const initNodes: FlowNode[] = [
  { id: genId(), type: 'start', name: '发起人', approverType: 'self', approver: '申请人' },
  { id: genId(), type: 'agent-summary', name: '智能摘要与预审', agentModel: 'GPT-4o', agentConfig: '自动生成200字摘要 + 要件完整性预审' },
  { id: genId(), type: 'approve', name: '办公室主任审批', approverType: 'role', approver: '办公室主任', approveMode: '依次审批' },
  { id: genId(), type: 'agent-predict', name: '审批方向预测', agentModel: 'GPT-4o', agentConfig: '预测流转方向 · 置信度85% · 推荐→业务部门办理' },
  { id: genId(), type: 'branch', name: '金额分级' },
  { id: genId(), type: 'approve', name: '业务部门办理', approverType: 'role', approver: '业务主管', approveMode: '依次审批' },
  { id: genId(), type: 'agent-compliance', name: '合规校验', agentModel: 'Claude-3.5', agentConfig: '条款偏差检查 + 签约方征信 + 风险评分' },
  { id: genId(), type: 'approve', name: '总经理签批', approverType: 'user', approver: '王强', approveMode: '依次审批' },
  { id: genId(), type: 'cc', name: '抄送财务部', ccTo: '财务部全体' },
  { id: genId(), type: 'end', name: '流程结束' },
]

const examplePrompts = [
  '来文批办：经办人写摘要→办公室主任审批→根据金额分级流转→业务部门办理',
  '合同审批：发起→法务审核→合规校验→总经理签批→归档',
  '采购审批：发起申请→部门审批→比价→合同签订→付款',
]

// AI生成流程的模拟数据
const aiGeneratedFlows: Record<string, FlowNode[]> = {
  default: [
    { id: genId(), type: 'start', name: '发起人', approverType: 'self', approver: '申请人' },
    { id: genId(), type: 'agent-summary', name: 'AI摘要与预审', agentModel: 'GPT-4o', agentConfig: '自动生成结构化摘要 + 要件完整性预审' },
    { id: genId(), type: 'approve', name: '办公室主任审批', approverType: 'role', approver: '办公室主任', approveMode: '依次审批' },
    { id: genId(), type: 'agent-predict', name: 'AI流转方向预测', agentModel: 'GPT-4o', agentConfig: '预测→金额分级 · 置信度85%' },
    { id: genId(), type: 'branch', name: '金额分级路由' },
    { id: genId(), type: 'approve', name: '业务部门办理', approverType: 'role', approver: '业务主管', approveMode: '依次审批' },
    { id: genId(), type: 'agent-compliance', name: 'AI合规校验', agentModel: 'Claude-3.5', agentConfig: '条款偏差 + 征信查询 + 风险评分' },
    { id: genId(), type: 'approve', name: '总经理签批', approverType: 'user', approver: '王强', approveMode: '依次审批' },
    { id: genId(), type: 'cc', name: '抄送财务部', ccTo: '财务部全体' },
    { id: genId(), type: 'end', name: '流程结束' },
  ],
}

export default function ProcessDesigner() {
  const { message } = AntdApp.useApp()
  const [nodes, setNodes] = useState<FlowNode[]>(initNodes)
  const [selectedId, setSelectedId] = useState<string>(nodes[0].id)
  const [aiInput, setAiInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiStep, setAiStep] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const selected = nodes.find((n) => n.id === selectedId)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [nodes])

  const addNode = (type: NodeType) => {
    const meta = nodeMeta[type]
    const node: FlowNode = {
      id: genId(),
      type,
      name: meta.label,
      approverType: type === 'approve' ? 'role' : type === 'cc' ? undefined : type === 'start' ? 'self' : undefined,
      approver: type === 'approve' ? '请选择审批人' : type === 'start' ? '申请人' : undefined,
      approveMode: type === 'approve' ? '依次审批' : undefined,
      ccTo: type === 'cc' ? '抄送对象' : undefined,
      agentModel: meta.isAgent ? 'GPT-4o' : undefined,
      agentConfig: meta.isAgent ? agentDescriptions[type] : undefined,
    }
    const endIdx = nodes.findIndex((n) => n.type === 'end')
    const next = [...nodes]
    if (endIdx >= 0) next.splice(endIdx, 0, node)
    else next.push(node)
    setNodes(next)
    setSelectedId(node.id)
    message.success(`已添加「${meta.label}」节点`)
  }

  const removeNode = (id: string) => {
    const node = nodes.find((n) => n.id === id)
    if (node?.type === 'start' || node?.type === 'end') {
      message.warning('发起人与结束节点不可删除')
      return
    }
    const next = nodes.filter((n) => n.id !== id)
    setNodes(next)
    if (selectedId === id) setSelectedId(next[0]?.id ?? '')
  }

  const updateNode = (id: string, patch: Partial<FlowNode>) => {
    setNodes((ns) => ns.map((n) => (n.id === id ? { ...n, ...patch } : n)))
  }

  // NL2Workflow: 自然语言生成流程
  const generateFlow = useCallback(() => {
    if (!aiInput.trim()) {
      message.warning('请输入流程描述')
      return
    }
    setIsGenerating(true)
    const steps = [
      '解析自然语言指令…',
      '匹配节点类型库与网关规则…',
      '生成BPMN 2.0流程定义…',
      '规则校验引擎验证合法性…',
      '渲染可视化流程图…',
    ]
    let stepIdx = 0
    setAiStep(steps[0])
    const timer = setInterval(() => {
      stepIdx++
      if (stepIdx < steps.length) {
        setAiStep(steps[stepIdx])
      } else {
        clearInterval(timer)
        nid = 0
        setNodes(aiGeneratedFlows.default.map((n) => ({ ...n, id: genId() })))
        setIsGenerating(false)
        setAiStep('')
        message.success('AI已根据描述生成流程编排，Agent节点已自动嵌入')
      }
    }, 600)
  }, [aiInput, message])

  const regularNodes: NodeType[] = ['start', 'approve', 'cc', 'branch', 'end']
  const agentNodes: NodeType[] = ['agent-summary', 'agent-predict', 'agent-compliance', 'agent-efficiency']

  return (
    <Layout style={{ background: 'transparent', minHeight: 560 }}>
      {/* 左侧工具栏：节点类型 */}
      <Sider width={190} theme="light" style={{ background: '#fff', borderRight: '1px solid #eef2f7', borderRadius: '12px 0 0 12px', padding: 16, overflowY: 'auto' }}>
        <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 10 }}>基础节点</div>
        <Space direction="vertical" size={8} style={{ width: '100%', marginBottom: 16 }}>
          {regularNodes.map((t) => {
            const m = nodeMeta[t]
            return (
              <Button key={t} block icon={<span style={{ color: m.color }}>{m.icon}</span>} onClick={() => addNode(t)} style={{ textAlign: 'left', height: 36, fontSize: 13 }}>
                {m.label}
              </Button>
            )
          })}
        </Space>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
          <RobotOutlined /> Agent节点
        </div>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          {agentNodes.map((t) => {
            const m = nodeMeta[t]
            return (
              <Tooltip key={t} title={agentDescriptions[t]} placement="right">
                <Button block icon={<span style={{ color: m.color }}>{m.icon}</span>} onClick={() => addNode(t)} style={{ textAlign: 'left', height: 36, fontSize: 13, borderColor: m.color + '40', background: m.color + '08' }}>
                  {m.label}
                </Button>
              </Tooltip>
            )
          })}
        </Space>
        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 16, lineHeight: 1.7, padding: '8px 0', borderTop: '1px solid #f1f5f9' }}>
          Agent节点由光粒AI平台已发布的智能体封装，可直接拖入流程，无需单独对接接口。
        </div>
      </Sider>

      {/* 中间画布 */}
      <Content style={{ background: '#f8fafc', borderRadius: 0, display: 'flex', flexDirection: 'column' }}>
        {/* AI生成栏 */}
        <div style={{ padding: '12px 16px', background: 'linear-gradient(135deg, #6366f1, #818cf8)', borderRadius: 0 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <BulbOutlined style={{ color: '#fff', fontSize: 16, flexShrink: 0 }} />
            <Input
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onPressEnter={generateFlow}
              placeholder="用自然语言描述流程，AI自动生成编排… 例如：来文批办→摘要→审批→分级流转"
              style={{ borderRadius: 8, flex: 1 }}
              disabled={isGenerating}
            />
            <Button type="primary" icon={isGenerating ? <LoadingOutlined /> : <SendOutlined />} onClick={generateFlow} disabled={isGenerating}
              style={{ background: '#fff', color: '#6366f1', borderColor: '#fff', fontWeight: 600, borderRadius: 8, flexShrink: 0 }}>
              {isGenerating ? '生成中' : 'AI生成'}
            </Button>
          </div>
          {isGenerating && (
            <div style={{ color: '#fff', fontSize: 12, marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Spin size="small" /> {aiStep}
            </div>
          )}
          {!isGenerating && (
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              {examplePrompts.map((p, i) => (
                <Tag key={i} style={{ cursor: 'pointer', fontSize: 11, background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', borderRadius: 6 }}
                  onClick={() => setAiInput(p)}>
                  {p.length > 20 ? p.substring(0, 20) + '…' : p}
                </Tag>
              ))}
            </div>
          )}
        </div>

        {/* 流程节点链 */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', maxHeight: 480 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
            {nodes.map((n, idx) => {
              const m = nodeMeta[n.type]
              const isSel = n.id === selectedId
              const isAgent = !!m.isAgent
              return (
                <div key={n.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                  <div
                    onClick={() => setSelectedId(n.id)}
                    style={{
                      width: 260,
                      border: `2px solid ${isSel ? m.color : isAgent ? m.color + '60' : '#e2e8f0'}`,
                      background: isSel ? `${m.color}0d` : isAgent ? `linear-gradient(135deg, ${m.color}0a, ${m.color}05)` : '#fff',
                      borderRadius: isAgent ? 14 : 12,
                      padding: '12px 16px',
                      cursor: 'pointer',
                      boxShadow: isSel ? `0 4px 12px ${m.color}22` : isAgent ? `0 2px 8px ${m.color}15` : '0 1px 3px rgba(15,23,42,0.04)',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <Space size={6}>
                        <span style={{ color: m.color, fontSize: 15 }}>{m.icon}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{n.name}</span>
                      </Space>
                      {isAgent ? (
                        <Tag style={{ margin: 0, background: m.color, color: '#fff', border: 'none', borderRadius: 4, fontSize: 10, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <RobotOutlined style={{ fontSize: 10 }} /> Agent
                        </Tag>
                      ) : (
                        <Tag color={m.color} style={{ margin: 0, color: m.color, borderColor: m.color }}>{m.label}</Tag>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      {n.type === 'approve' && `${n.approverType === 'role' ? '角色' : n.approverType === 'user' ? '指定人' : '发起人'}：${n.approver} · ${n.approveMode}`}
                      {n.type === 'cc' && `抄送：${n.ccTo}`}
                      {n.type === 'start' && `发起人：${n.approver}`}
                      {n.type === 'branch' && '条件分支：金额 > 10万 走总经理'}
                      {n.type === 'end' && '流程归档，记录审批结果'}
                      {isAgent && (
                        <span style={{ color: m.color }}>{n.agentConfig}</span>
                      )}
                    </div>
                    {isAgent && n.agentModel && (
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                        <Tag style={{ fontSize: 10, margin: 0, borderRadius: 3 }}>{n.agentModel}</Tag>
                      </div>
                    )}
                    {n.type !== 'start' && n.type !== 'end' && (
                      <Tooltip title="删除节点">
                        <DeleteOutlined
                          onClick={(e) => { e.stopPropagation(); removeNode(n.id) }}
                          style={{ position: 'absolute', top: 8, right: 8, color: '#cbd5e1', fontSize: 12 }}
                        />
                      </Tooltip>
                    )}
                  </div>
                  {idx < nodes.length - 1 && (
                    <div style={{ height: 28, display: 'flex', alignItems: 'center' }}>
                      <ArrowDownOutlined style={{ color: '#cbd5e1', fontSize: 16 }} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </Content>

      {/* 右侧属性面板 */}
      <Sider width={300} theme="light" style={{ background: '#fff', borderLeft: '1px solid #eef2f7', borderRadius: '0 12px 12px 0', padding: 16, overflowY: 'auto' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>节点属性</div>
        {!selected ? (
          <Empty description="点击节点编辑属性" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>节点名称</div>
              <Input value={selected.name} onChange={(e) => updateNode(selected.id, { name: e.target.value })} />
            </div>
            {nodeMeta[selected.type].isAgent && (
              <>
                <div style={{ marginBottom: 14, padding: 10, background: '#6366f10a', borderRadius: 8, border: '1px solid #6366f120' }}>
                  <div style={{ fontSize: 11, color: '#6366f1', fontWeight: 600, marginBottom: 4 }}><RobotOutlined /> Agent节点配置</div>
                  <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>{agentDescriptions[selected.type]}</div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>大模型</div>
                  <Select
                    value={selected.agentModel}
                    onChange={(v) => updateNode(selected.id, { agentModel: v })}
                    style={{ width: '100%' }}
                    options={['GPT-4o', 'Claude-3.5', 'Qwen-72B', 'DeepSeek-V3'].map((m) => ({ value: m, label: m }))}
                  />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Agent配置说明</div>
                  <Input.TextArea rows={3} value={selected.agentConfig} onChange={(e) => updateNode(selected.id, { agentConfig: e.target.value })} />
                </div>
                <div style={{ marginBottom: 14, padding: 8, background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>✓ 已关联智能体中心Agent</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>该节点由智能体中心已发布Agent驱动</div>
                </div>
              </>
            )}
            {selected.type === 'approve' && (
              <>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>审批人类型</div>
                  <Select
                    value={selected.approverType}
                    onChange={(v) => updateNode(selected.id, { approverType: v })}
                    style={{ width: '100%' }}
                    options={[
                      { value: 'role', label: '按角色' },
                      { value: 'user', label: '指定人员' },
                      { value: 'self', label: '发起人本人' },
                      { value: 'supervisor', label: '上级主管' },
                    ]}
                  />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>审批人</div>
                  <Input value={selected.approver} onChange={(e) => updateNode(selected.id, { approver: e.target.value })} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>审批方式</div>
                  <Radio.Group
                    value={selected.approveMode}
                    onChange={(e) => updateNode(selected.id, { approveMode: e.target.value })}
                    optionType="button"
                    buttonStyle="solid"
                  >
                    <Radio.Button value="依次审批">依次审批</Radio.Button>
                    <Radio.Button value="会签">会签</Radio.Button>
                    <Radio.Button value="或签">或签</Radio.Button>
                  </Radio.Group>
                </div>
              </>
            )}
            {selected.type === 'cc' && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>抄送对象</div>
                <Input value={selected.ccTo} onChange={(e) => updateNode(selected.id, { ccTo: e.target.value })} />
              </div>
            )}
            {selected.type === 'branch' && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>分支条件</div>
                <Input defaultValue="金额 > 100000" />
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>满足条件进入指定分支</div>
              </div>
            )}
            <Button type="primary" block style={{ marginTop: 8 }} onClick={() => message.success('节点配置已保存')}>
              保存节点配置
            </Button>
            <Button type="primary" ghost block style={{ marginTop: 8 }} icon={<PlusOutlined />} onClick={() => addNode('approve')}>
              在其后插入审批节点
            </Button>
          </div>
        )}
      </Sider>
    </Layout>
  )
}