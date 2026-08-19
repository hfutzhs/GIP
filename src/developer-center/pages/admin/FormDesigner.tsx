
import { useState } from 'react'
import { Layout, Card, Button, Tag, Space, Input, Select, Switch, Empty, Tooltip, App as AntdApp, Spin } from 'antd'
import {
  FontSizeOutlined,
  AlignLeftOutlined,
  NumberOutlined,
  CalendarOutlined,
  CheckSquareOutlined,
  DownCircleOutlined,
  UnorderedListOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  BulbOutlined,
  SendOutlined,
  LoadingOutlined,
} from '@ant-design/icons'

const { Sider, Content } = Layout

interface FormField {
  id: string
  type: string
  label: string
  placeholder?: string
  required: boolean
  options?: string
}

const palette: { type: string; label: string; icon: React.ReactNode }[] = [
  { type: 'text', label: '单行文本', icon: <FontSizeOutlined /> },
  { type: 'textarea', label: '多行文本', icon: <AlignLeftOutlined /> },
  { type: 'number', label: '数字', icon: <NumberOutlined /> },
  { type: 'date', label: '日期', icon: <CalendarOutlined /> },
  { type: 'select', label: '下拉选择', icon: <DownCircleOutlined /> },
  { type: 'radio', label: '单选', icon: <CheckSquareOutlined /> },
  { type: 'checkbox', label: '多选', icon: <UnorderedListOutlined /> },
]

let fid = 0
const genId = () => `f${++fid}`

const initFields: FormField[] = [
  { id: genId(), type: 'text', label: '合同名称', placeholder: '请输入合同名称', required: true },
  { id: genId(), type: 'select', label: '合同类型', required: true, options: '采购合同,服务合同,租赁合同,技术开发' },
  { id: genId(), type: 'number', label: '合同金额（元）', placeholder: '0.00', required: true },
  { id: genId(), type: 'date', label: '签订日期', required: false },
  { id: genId(), type: 'textarea', label: '合同备注', placeholder: '补充说明...', required: false },
]

const typeLabel: Record<string, string> = {
  text: '单行文本',
  textarea: '多行文本',
  number: '数字',
  date: '日期',
  select: '下拉选择',
  radio: '单选',
  checkbox: '多选',
}

const typeColor: Record<string, string> = {
  text: '#2563eb',
  textarea: '#06b6d4',
  number: '#f59e0b',
  date: '#7c3aed',
  select: '#10b981',
  radio: '#ef4444',
  checkbox: '#0ea5e9',
}

const examplePrompts = [
  '供应商注册表：公司名称、统一社会信用代码、联系人、电话、注册地址、经营范围',
  '车辆调度单：车牌号、车辆类型、调度日期、出发地、目的地、司机、备注',
  '采购申请单：申请部门、采购物品、规格型号、数量、预计金额、用途说明、附件',
]

const aiGeneratedForms: Record<string, FormField[]> = {
  default: [
    { id: 'fg1', type: 'text', label: '公司名称', placeholder: '请输入公司全称', required: true },
    { id: 'fg2', type: 'text', label: '统一社会信用代码', placeholder: '18位信用代码', required: true },
    { id: 'fg3', type: 'text', label: '联系人', placeholder: '联系人姓名', required: true },
    { id: 'fg4', type: 'text', label: '联系电话', placeholder: '手机号码', required: true },
    { id: 'fg5', type: 'textarea', label: '注册地址', placeholder: '详细地址', required: false },
    { id: 'fg6', type: 'textarea', label: '经营范围', placeholder: '经营范围描述', required: false },
    { id: 'fg7', type: 'select', label: '企业类型', required: true, options: '有限责任公司,股份有限公司,合伙企业,个体工商户' },
    { id: 'fg8', type: 'date', label: '成立日期', required: false },
  ],
}

export default function FormDesigner() {
  const { message } = AntdApp.useApp()
  const [fields, setFields] = useState<FormField[]>(initFields)
  const [selectedId, setSelectedId] = useState<string>(fields[0].id)
  const [aiInput, setAiInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiStep, setAiStep] = useState('')

  const selected = fields.find((f) => f.id === selectedId)

  const addField = (type: string) => {
    const field: FormField = {
      id: genId(),
      type,
      label: typeLabel[type] + '字段',
      placeholder: '请输入',
      required: false,
      options: type === 'select' || type === 'radio' || type === 'checkbox' ? '选项1,选项2' : undefined,
    }
    setFields([...fields, field])
    setSelectedId(field.id)
    message.success(`已添加「${typeLabel[type]}」字段`)
  }

  const removeField = (id: string) => {
    const next = fields.filter((f) => f.id !== id)
    setFields(next)
    if (selectedId === id) setSelectedId(next[0]?.id ?? '')
  }

  const move = (id: string, dir: -1 | 1) => {
    const idx = fields.findIndex((f) => f.id === id)
    const target = idx + dir
    if (target < 0 || target >= fields.length) return
    const next = [...fields]
    ;[next[idx], next[target]] = [next[target], next[idx]]
    setFields(next)
  }

  const updateField = (id: string, patch: Partial<FormField>) => {
    setFields((fs) => fs.map((f) => (f.id === id ? { ...f, ...patch } : f)))
  }

  return (
    <Layout style={{ background: 'transparent', minHeight: 560 }}>
      {/* 左侧组件库 */}
      <Sider width={180} theme="light" style={{ background: '#fff', borderRight: '1px solid #eef2f7', borderRadius: '12px 0 0 12px', padding: 16 }}>
        <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 12 }}>表单组件（点击添加）</div>
        <Space direction="vertical" size={10} style={{ width: '100%' }}>
          {palette.map((p) => (
            <Button key={p.type} block icon={<span style={{ color: '#2563eb' }}>{p.icon}</span>} onClick={() => addField(p.type)} style={{ textAlign: 'left', height: 40 }}>
              {p.label}
            </Button>
          ))}
        </Space>
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 20, lineHeight: 1.7 }}>
          低代码搭建：拖拽组件生成表单，自动绑定校验规则。
        </div>
      </Sider>

      {/* 中间表单预览画布 */}
      <Content style={{ background: '#f8fafc', padding: '20px 24px', overflowY: 'auto', maxHeight: 560 }}>
        <Card style={{ borderRadius: 12, maxWidth: 640, margin: '0 auto' }} title={<span style={{ fontSize: 15 }}>合同录入表单 · 预览</span>}>
          {fields.length === 0 ? (
            <Empty description="点击左侧组件添加字段" style={{ padding: 40 }} />
          ) : (
            <Space direction="vertical" size={14} style={{ width: '100%' }}>
              {fields.map((f, idx) => {
                const isSel = f.id === selectedId
                return (
                  <div
                    key={f.id}
                    onClick={() => setSelectedId(f.id)}
                    style={{
                      border: `2px solid ${isSel ? '#2563eb' : '#eef2f7'}`,
                      borderRadius: 10,
                      padding: 14,
                      cursor: 'pointer',
                      background: isSel ? '#eaf1ff' : '#fff',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <Space size={6}>
                        <Tag color={typeColor[f.type]} style={{ margin: 0 }}>{typeLabel[f.type]}</Tag>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{f.label}</span>
                        {f.required && <span style={{ color: '#ef4444', fontSize: 12 }}>*必填</span>}
                      </Space>
                      <Space size={4}>
                        <Tooltip title="上移"><ArrowUpOutlined onClick={(e) => { e.stopPropagation(); move(f.id, -1) }} style={{ color: '#94a3b8', fontSize: 12 }} /></Tooltip>
                        <Tooltip title="下移"><ArrowDownOutlined onClick={(e) => { e.stopPropagation(); move(f.id, 1) }} style={{ color: '#94a3b8', fontSize: 12 }} /></Tooltip>
                        <Tooltip title="删除"><DeleteOutlined onClick={(e) => { e.stopPropagation(); removeField(f.id) }} style={{ color: '#94a3b8', fontSize: 12 }} /></Tooltip>
                      </Space>
                    </div>
                    <Input disabled placeholder={f.placeholder ?? '请输入'} style={{ background: '#fff' }} />
                  </div>
                )
              })}
            </Space>
          )}
        </Card>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button type="primary" onClick={() => message.success('表单已保存并发布')}>保存并发布表单</Button>
        </div>
      </Content>

      {/* 右侧字段属性 */}
      <Sider width={300} theme="light" style={{ background: '#fff', borderLeft: '1px solid #eef2f7', borderRadius: '0 12px 12px 0', padding: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>字段属性</div>
        {!selected ? (
          <Empty description="点击字段编辑属性" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>字段标签</div>
              <Input value={selected.label} onChange={(e) => updateField(selected.id, { label: e.target.value })} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>组件类型</div>
              <Select value={selected.type} style={{ width: '100%' }} onChange={(v) => updateField(selected.id, { type: v })}
                options={palette.map((p) => ({ value: p.type, label: p.label }))} />
            </div>
            {(selected.type === 'text' || selected.type === 'textarea' || selected.type === 'number') && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>占位提示</div>
                <Input value={selected.placeholder} onChange={(e) => updateField(selected.id, { placeholder: e.target.value })} />
              </div>
            )}
            {(selected.type === 'select' || selected.type === 'radio' || selected.type === 'checkbox') && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>选项（逗号分隔）</div>
                <Input.TextArea rows={3} value={selected.options} onChange={(e) => updateField(selected.id, { options: e.target.value })} />
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
              <span style={{ fontSize: 13, color: '#334155' }}>是否必填</span>
              <Switch checked={selected.required} onChange={(v) => updateField(selected.id, { required: v })} />
            </div>
            <Button type="primary" block style={{ marginTop: 12 }} onClick={() => message.success('字段配置已保存')}>
              保存字段配置
            </Button>
          </div>
        )}
      </Sider>
    </Layout>
  )
}