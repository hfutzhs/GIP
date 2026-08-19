
import { useState } from 'react'
import { Card, Row, Col, Button, Table, Tag, Input, Select, Switch, InputNumber, Modal, Form, Empty, Space, App as AntdApp, Spin } from 'antd'
import { PlusOutlined, DeleteOutlined, DatabaseOutlined, CodeOutlined, BulbOutlined, SendOutlined, LoadingOutlined } from '@ant-design/icons'

interface EntityField {
  id: string
  name: string
  column: string
  type: string
  length: number
  nullable: boolean
  primary: boolean
  default?: string
  comment?: string
}

const dbTypes = [
  { value: 'VARCHAR', label: 'VARCHAR 字符串' },
  { value: 'INT', label: 'INT 整数' },
  { value: 'BIGINT', label: 'BIGINT 长整数' },
  { value: 'DECIMAL', label: 'DECIMAL 小数' },
  { value: 'DATETIME', label: 'DATETIME 日期时间' },
  { value: 'DATE', label: 'DATE 日期' },
  { value: 'TEXT', label: 'TEXT 长文本' },
  { value: 'BOOLEAN', label: 'BOOLEAN 布尔' },
]

let eid = 0
const genId = () => `ef${++eid}`

const initFields: EntityField[] = [
  { id: genId(), name: '合同ID', column: 'id', type: 'BIGINT', length: 20, nullable: false, primary: true, comment: '主键' },
  { id: genId(), name: '合同编号', column: 'code', type: 'VARCHAR', length: 64, nullable: false, primary: false, comment: '唯一编码' },
  { id: genId(), name: '合同名称', column: 'name', type: 'VARCHAR', length: 128, nullable: false, primary: false },
  { id: genId(), name: '签约方', column: 'party', type: 'VARCHAR', length: 128, nullable: false, primary: false },
  { id: genId(), name: '金额', column: 'amount', type: 'DECIMAL', length: 14, nullable: false, primary: false, default: '0.00' },
  { id: genId(), name: '状态', column: 'status', type: 'VARCHAR', length: 32, nullable: false, primary: false, default: 'pending', comment: 'pending|approved|rejected' },
  { id: genId(), name: '签订日期', column: 'sign_date', type: 'DATE', length: 0, nullable: true, primary: false },
  { id: genId(), name: '创建时间', column: 'created_at', type: 'DATETIME', length: 0, nullable: false, primary: false, default: 'CURRENT_TIMESTAMP' },
]

const examplePrompts = [
  '供应商实体：公司名称、统一社会信用代码、联系人、电话、注册地址、经营范围、成立日期',
  '车辆实体：车牌号、车辆类型、品牌、颜色、购买日期、车架号、发动机号、状态',
  '采购订单实体：订单编号、供应商、采购物品、数量、单价、总金额、下单日期、状态',
]

const aiGeneratedEntities: Record<string, EntityField[]> = {
  default: [
    { id: 'eg1', name: '主键ID', column: 'id', type: 'BIGINT', length: 20, nullable: false, primary: true, comment: '主键' },
    { id: 'eg2', name: '公司名称', column: 'company_name', type: 'VARCHAR', length: 128, nullable: false, primary: false },
    { id: 'eg3', name: '统一社会信用代码', column: 'credit_code', type: 'VARCHAR', length: 64, nullable: false, primary: false, comment: '18位信用代码' },
    { id: 'eg4', name: '联系人', column: 'contact_name', type: 'VARCHAR', length: 64, nullable: false, primary: false },
    { id: 'eg5', name: '联系电话', column: 'contact_phone', type: 'VARCHAR', length: 32, nullable: false, primary: false },
    { id: 'eg6', name: '注册地址', column: 'address', type: 'VARCHAR', length: 256, nullable: true, primary: false },
    { id: 'eg7', name: '经营范围', column: 'business_scope', type: 'TEXT', length: 0, nullable: true, primary: false },
    { id: 'eg8', name: '创建时间', column: 'created_at', type: 'DATETIME', length: 0, nullable: false, primary: false, default: 'CURRENT_TIMESTAMP' },
  ],
}

export default function EntityDesigner() {
  const { message } = AntdApp.useApp()
  const [fields, setFields] = useState<EntityField[]>(initFields)
  const [tableName, setTableName] = useState('biz_contract')
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()
  const [aiInput, setAiInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiStep, setAiStep] = useState('')

  const addField = (v: any) => {
    const f: EntityField = {
      id: genId(),
      name: v.name,
      column: v.column,
      type: v.type,
      length: v.length ?? 0,
      nullable: v.nullable ?? true,
      primary: v.primary ?? false,
      default: v.default,
      comment: v.comment,
    }
    setFields([...fields, f])
    setOpen(false)
    form.resetFields()
    message.success(`已添加字段「${f.name}」`)
  }

  const removeField = (id: string) => {
    const next = fields.filter((f) => f.id !== id)
    setFields(next)
    message.success('字段已删除')
  }

  const generateEntity = () => {
    if (!aiInput.trim()) { message.warning('请输入实体描述'); return }
    setIsGenerating(true)
    const steps = ['解析自然语言指令…', '推断字段类型与约束…', '生成建表结构与DDL…', '渲染实体设计…']
    let stepIdx = 0
    setAiStep(steps[0])
    const timer = setInterval(() => {
      stepIdx++
      if (stepIdx < steps.length) { setAiStep(steps[stepIdx]) }
      else {
        clearInterval(timer)
        eid = 0
        setFields(aiGeneratedEntities.default.map((f) => ({ ...f, id: genId() })))
        setTableName('biz_supplier')
        setIsGenerating(false); setAiStep('')
        message.success('AI已根据描述生成实体，共8个字段')
      }
    }, 500)
  }

  // 生成 DDL 预览
  const ddl = (() => {
    const lines: string[] = [`CREATE TABLE \`${tableName}\` (`]
    const cols = fields.map((f) => {
      const len = f.length && (f.type === 'VARCHAR' || f.type === 'DECIMAL') ? `(${f.length}${f.type === 'DECIMAL' && f.length > 10 ? ',2' : ''})` : ''
      const notNull = f.nullable ? '' : ' NOT NULL'
      const def = f.default ? ` DEFAULT ${f.type === 'DATETIME' && f.default === 'CURRENT_TIMESTAMP' ? 'CURRENT_TIMESTAMP' : `'${f.default}'`}` : ''
      const pk = f.primary ? ' PRIMARY KEY AUTO_INCREMENT' : ''
      const comment = f.comment ? ` COMMENT '${f.comment}'` : ''
      return `  \`${f.column}\` ${f.type}${len}${notNull}${def}${pk}${comment}`
    })
    lines.push(...cols)
    lines.push(');')
    return lines.join('\n')
  })()

  const columns = [
    { title: '字段名', dataIndex: 'name', width: 130, render: (t: string) => <span style={{ fontWeight: 600 }}>{t}</span> },
    { title: '列名', dataIndex: 'column', width: 140, render: (t: string) => <code style={{ fontSize: 12, color: '#2563eb' }}>{t}</code> },
    { title: '类型', dataIndex: 'type', width: 110, render: (t: string) => <Tag color="blue">{t}</Tag> },
    { title: '长度', dataIndex: 'length', width: 80, render: (n: number) => n || '-' },
    { title: '主键', dataIndex: 'primary', width: 70, render: (p: boolean) => (p ? <Tag color="gold">PK</Tag> : '-') },
    { title: '允许空', dataIndex: 'nullable', width: 80, render: (n: boolean) => <Tag color={n ? 'default' : 'red'}>{n ? '是' : '否'}</Tag> },
    { title: '默认值', dataIndex: 'default', width: 130, render: (t: string) => (t ? <code style={{ fontSize: 11 }}>{t}</code> : '-') },
    { title: '备注', dataIndex: 'comment' },
    {
      title: '操作', width: 70, render: (_: unknown, r: EntityField) => (
        <Button size="small" type="link" danger icon={<DeleteOutlined />} onClick={() => removeField(r.id)} />
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <Space>
          <DatabaseOutlined style={{ color: '#2563eb', fontSize: 18 }} />
          <span style={{ fontSize: 14, color: '#64748b' }}>数据表：</span>
          <Input value={tableName} onChange={(e) => setTableName(e.target.value)} style={{ width: 220, fontFamily: 'monospace' }} />
          <Tag color="blue">{fields.length} 个字段</Tag>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); form.setFieldsValue({ type: 'VARCHAR', length: 64, nullable: true }); setOpen(true) }}>
          新增字段
        </Button>
      </div>

      <Row gutter={16}>
        {/* AI自然语言生成栏 */}
        <Col span={24} style={{ marginBottom: 16 }}>
          <div style={{ padding: '12px 16px', background: 'linear-gradient(135deg, #6366f1, #818cf8)', borderRadius: 12 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <BulbOutlined style={{ color: '#fff', fontSize: 16, flexShrink: 0 }} />
              <Input
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onPressEnter={generateEntity}
                placeholder="用自然语言描述实体需求，AI自动生成表结构… 例如：供应商实体：公司名称、信用代码、联系人、电话"
                style={{ borderRadius: 8, flex: 1 }}
                disabled={isGenerating}
              />
              <Button type="primary" icon={isGenerating ? <LoadingOutlined /> : <SendOutlined />} onClick={generateEntity} disabled={isGenerating}
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
                    {p.length > 24 ? p.substring(0, 24) + '…' : p}
                  </Tag>
                ))}
              </div>
            )}
          </div>
        </Col>

        <Col xs={24} lg={15}>
          <Card style={{ borderRadius: 12 }}>
            <Table rowKey="id" dataSource={fields} columns={columns} pagination={false} size="middle" scroll={{ x: 900 }} />
          </Card>
        </Col>
        <Col xs={24} lg={9}>
          <Card
            title={<span style={{ fontSize: 14 }}><CodeOutlined /> 建表语句预览（DDL）</span>}
            style={{ borderRadius: 12 }}
          >
            <pre style={{ margin: 0, background: '#0f172a', color: '#34d399', fontSize: 12, fontFamily: 'monospace', padding: 14, borderRadius: 8, whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: 420, overflowY: 'auto' }}>
              {ddl}
            </pre>
            <Space style={{ marginTop: 12, width: '100%' }}>
              <Button block icon={<CodeOutlined />} onClick={() => { navigator.clipboard?.writeText(ddl); message.success('DDL 已复制') }}>复制 DDL</Button>
              <Button block type="primary" onClick={() => message.success('实体已同步至数据库')}>同步建表</Button>
            </Space>
          </Card>
        </Col>
      </Row>

      <Modal title="新增字段" open={open} onOk={() => form.validateFields().then(addField)} onCancel={() => setOpen(false)} okText="添加" width={520}>
        <Form form={form} layout="vertical">
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="字段名" name="name" rules={[{ required: true, message: '请输入字段名' }]}>
                <Input placeholder="如：合同金额" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="列名" name="column" rules={[{ required: true, message: '请输入列名' }]}>
                <Input placeholder="如：amount" style={{ fontFamily: 'monospace' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="数据类型" name="type" rules={[{ required: true }]}>
                <Select options={dbTypes} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="长度" name="length">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="是否主键" name="primary" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="默认值" name="default">
                <Input placeholder="如：0.00" style={{ fontFamily: 'monospace' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="允许为空" name="nullable" valuePropName="checked">
                <Switch defaultChecked />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="备注" name="comment">
            <Input placeholder="字段说明" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}