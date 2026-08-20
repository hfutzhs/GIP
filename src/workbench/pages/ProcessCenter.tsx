import { useState, useMemo } from 'react'
import { Card, Table, Tag, Button, Input, Select, Row, Col, Space, Empty, Drawer, Timeline, Descriptions, Form, Radio, App as AntdApp, Statistic, DatePicker } from 'antd'
import {
  SearchOutlined,
  PlusOutlined,
  RocketOutlined,
  CheckSquareOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UndoOutlined,
  EyeOutlined,
  BellOutlined,
  ArrowRightOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import { currentUser } from '@/mock/users'
import {
  processDefs,
  instances,
  getTaskRecords,
  getMyTodos,
  getMyDone,
  getMyInitiated,
  processCategories,
  type ProcessDef,
  type ProcessInstance,
  type InstanceStatus,
  type Priority,
} from '@/mock/processInstances'
import { useAppStore } from '@/store/useAppStore'

const { RangePicker } = DatePicker

const statusConfig: Record<InstanceStatus, { label: string; color: string }> = {
  running: { label: '进行中', color: 'processing' },
  completed: { label: '已完成', color: 'success' },
  rejected: { label: '已驳回', color: 'error' },
  withdrawn: { label: '已撤回', color: 'default' },
}

const priorityConfig: Record<Priority, { label: string; color: string }> = {
  normal: { label: '普通', color: 'default' },
  urgent: { label: '紧急', color: 'orange' },
  critical: { label: '特急', color: 'red' },
}

const categoryColor: Record<string, string> = {
  '合同类': '#2563eb',
  '采购类': '#16a34a',
  '人事类': '#7c3aed',
  '财务类': '#f59e0b',
  '通用审批': '#64748b',
}

export default function ProcessCenter({ view }: { view: string }) {
  const { message, modal } = AntdApp.useApp()
  const currentTenantId = useAppStore((s) => s.currentTenantId)
  const userId = currentUser.id
  const [keyword, setKeyword] = useState('')
  const [catFilter, setCatFilter] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [detailInstance, setDetailInstance] = useState<ProcessInstance | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [startDef, setStartDef] = useState<ProcessDef | null>(null)
  const [startOpen, setStartOpen] = useState(false)
  const [handleInstance, setHandleInstance] = useState<ProcessInstance | null>(null)
  const [handleOpen, setHandleOpen] = useState(false)
  const [handleForm] = Form.useForm()
  const [withdrawInstance, setWithdrawInstance] = useState<ProcessInstance | null>(null)

  // ===== 发起流程 =====
  const availableDefs = useMemo(() => {
    return processDefs.filter((d) => {
      if (d.tenantId !== currentTenantId) return false
      const kw = keyword.trim().toLowerCase()
      const matchKw = !kw || d.name.toLowerCase().includes(kw) || d.code.toLowerCase().includes(kw)
      const matchCat = catFilter.length === 0 || catFilter.includes(d.category)
      return matchKw && matchCat
    })
  }, [currentTenantId, keyword, catFilter])

  // ===== 我的待办 =====
  const myTodos = useMemo(() => {
    let list = getMyTodos(userId).filter((i) => i.tenantId === currentTenantId)
    const kw = keyword.trim().toLowerCase()
    if (kw) list = list.filter((i) => i.name.toLowerCase().includes(kw) || i.code.toLowerCase().includes(kw))
    if (priorityFilter !== 'all') list = list.filter((i) => i.priority === priorityFilter)
    if (catFilter.length > 0) list = list.filter((i) => catFilter.includes(i.category))
    return list
  }, [currentTenantId, userId, keyword, priorityFilter, catFilter])

  // ===== 我的已办 =====
  const myDone = useMemo(() => {
    let list = getMyDone(userId).filter((item) => item.instance.tenantId === currentTenantId)
    const kw = keyword.trim().toLowerCase()
    if (kw) list = list.filter((item) => item.instance.name.toLowerCase().includes(kw) || item.instance.code.toLowerCase().includes(kw))
    if (statusFilter !== 'all') list = list.filter((item) => item.instance.status === statusFilter)
    if (catFilter.length > 0) list = list.filter((item) => catFilter.includes(item.instance.category))
    return list
  }, [currentTenantId, userId, keyword, statusFilter, catFilter])

  // ===== 我发起的 =====
  const myInitiated = useMemo(() => {
    let list = getMyInitiated(userId).filter((i) => i.tenantId === currentTenantId)
    const kw = keyword.trim().toLowerCase()
    if (kw) list = list.filter((i) => i.name.toLowerCase().includes(kw) || i.code.toLowerCase().includes(kw))
    if (statusFilter !== 'all') list = list.filter((i) => i.status === statusFilter)
    if (priorityFilter !== 'all') list = list.filter((i) => i.priority === priorityFilter)
    if (catFilter.length > 0) list = list.filter((i) => catFilter.includes(i.category))
    return list
  }, [currentTenantId, userId, keyword, statusFilter, priorityFilter, catFilter])

  // ===== 流程详情抽屉 =====
  const openDetail = (inst: ProcessInstance) => {
    setDetailInstance(inst)
    setDrawerOpen(true)
  }

  // ===== 发起流程 =====
  const openStart = (def: ProcessDef) => {
    setStartDef(def)
    setStartOpen(true)
  }
  const submitStart = () => {
    message.success(`流程「${startDef?.name}」已发起，已流转至下一节点`)
    setStartOpen(false)
    handleForm.resetFields()
  }

  // ===== 办理（待办） =====
  const openHandle = (inst: ProcessInstance) => {
    setHandleInstance(inst)
    setHandleOpen(true)
    handleForm.resetFields()
  }
  const submitHandle = (action: 'approve' | 'reject') => {
    handleForm.validateFields().then((v) => {
      if (action === 'reject' && !v.comment) {
        message.error('驳回必须填写原因')
        return
      }
      message.success(action === 'approve' ? '已通过，流程流转至下一节点' : '已驳回')
      setHandleOpen(false)
      handleForm.resetFields()
    }).catch(() => {
      message.error('请填写必要信息')
    })
  }

  // ===== 撤回 =====
  const confirmWithdraw = (inst: ProcessInstance) => {
    setWithdrawInstance(inst)
    modal.confirm({
      title: '确认撤回流程',
      content: `确定要撤回流程「${inst.name}」吗？撤回后流程将终止。`,
      okText: '确认撤回',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        message.success('流程已撤回')
      },
    })
  }

  // ===== 催办 =====
  const urge = (inst: ProcessInstance) => {
    message.success(`已向「${inst.currentAssignee}」发送催办提醒`)
  }

  const renderStatusTag = (s: InstanceStatus) => {
    const c = statusConfig[s]
    return <Tag color={c.color}>{c.label}</Tag>
  }
  const renderPriorityTag = (p: Priority) => {
    const c = priorityConfig[p]
    return <Tag color={c.color}>{c.label}</Tag>
  }
  const renderCategoryTag = (cat: string) => {
    const color = categoryColor[cat] || '#64748b'
    return <Tag style={{ margin: 0, borderRadius: 4, border: 'none', background: color + '15', color }}>{cat}</Tag>
  }

  // ===== 流程详情抽屉内容 =====
  const renderDetailContent = () => {
    if (!detailInstance) return null
    const records = getTaskRecords(detailInstance.id)
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
          <FileTextOutlined style={{ fontSize: 20, color: '#2563eb' }} />
          <span style={{ fontSize: 18, fontWeight: 700 }}>{detailInstance.name}</span>
          {renderStatusTag(detailInstance.status)}
          {renderPriorityTag(detailInstance.priority)}
        </div>
        <Descriptions column={2} size="small" bordered style={{ marginBottom: 20 }}>
          <Descriptions.Item label="流程编码">{detailInstance.code}</Descriptions.Item>
          <Descriptions.Item label="流程分类">{renderCategoryTag(detailInstance.category)}</Descriptions.Item>
          <Descriptions.Item label="发起人">{detailInstance.initiator}（{detailInstance.initiatorDept}）</Descriptions.Item>
          <Descriptions.Item label="发起时间">{detailInstance.createdAt}</Descriptions.Item>
          <Descriptions.Item label="当前节点">{detailInstance.status === 'running' ? detailInstance.currentNode : statusConfig[detailInstance.status].label}</Descriptions.Item>
          <Descriptions.Item label="当前处理人">{detailInstance.currentAssignee || '—'}</Descriptions.Item>
          <Descriptions.Item label="关联应用">{detailInstance.app || '—'}</Descriptions.Item>
          <Descriptions.Item label="耗时">{detailInstance.duration}</Descriptions.Item>
        </Descriptions>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>流转记录</div>
        <Timeline
          items={records.map((r, i) => ({
            color: r.status === 'approved' ? 'green' : r.status === 'rejected' ? 'red' : r.status === 'pending' ? (i === records.findIndex((x) => x.status === 'pending') ? 'blue' : 'gray') : 'gray',
            children: (
              <div style={{ paddingBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{r.nodeName}</span>
                  <span style={{ fontSize: 12, color: '#64748b' }}>{r.assignee}</span>
                  {r.status !== 'pending' && <Tag style={{ margin: 0, fontSize: 11 }} color={r.status === 'approved' ? 'success' : r.status === 'rejected' ? 'error' : 'default'}>{r.action}</Tag>}
                </div>
                {r.comment && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{r.comment}</div>}
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                  {r.arrivedAt ? `到达：${r.arrivedAt}` : '等待到达'}
                  {r.processedAt && ` · 处理：${r.processedAt}`}
                </div>
              </div>
            ),
          }))}
        />
      </div>
    )
  }

  // ===== 工具栏 =====
  const renderToolbar = (extraFilters?: React.ReactNode) => (
    <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
      <Input
        placeholder="搜索流程名称或编码"
        allowClear
        prefix={<SearchOutlined />}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        style={{ width: 260 }}
      />
      {extraFilters}
    </div>
  )

  // ===== 发起流程视图 =====
  if (view === 'start') {
    return (
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px' }}>发起流程</h2>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 16px' }}>选择可发起的流程，填写表单后提交启动审批</p>
        {renderToolbar(
          <Select
            mode="multiple"
            allowClear
            placeholder="流程分类"
            style={{ width: 200 }}
            value={catFilter}
            onChange={(v) => setCatFilter(v)}
            options={processCategories.map((c) => ({ value: c, label: c }))}
          />
        )}
        {availableDefs.length === 0 ? (
          <Empty description="当前租户下暂无可用流程" style={{ padding: 40 }} />
        ) : (
          <Row gutter={[16, 16]}>
            {availableDefs.map((d) => (
              <Col xs={24} sm={12} lg={8} key={d.key}>
                <Card
                  hoverable
                  style={{ borderRadius: 12, borderColor: '#eef2f7' }}
                  onClick={() => openStart(d)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: (categoryColor[d.category] || '#64748b') + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <RocketOutlined style={{ fontSize: 20, color: categoryColor[d.category] || '#64748b' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>{d.name}</span>
                        <Tag style={{ margin: 0, fontSize: 11 }}>{d.version}</Tag>
                      </div>
                      {renderCategoryTag(d.category)}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 12, marginBottom: 8, lineHeight: 1.6, minHeight: 38 }}>
                    {d.description}
                  </div>
                  <div style={{ borderTop: '1px dashed #eef2f7', paddingTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{d.nodes} 个节点 · 可用范围：{d.orgScope}</span>
                    <Button size="small" type="primary" icon={<PlusOutlined />} onClick={(e) => { e.stopPropagation(); openStart(d) }}>发起</Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* 发起抽屉 */}
        <Drawer
          title={<span style={{ fontSize: 16, fontWeight: 700 }}>发起流程 · {startDef?.name}</span>}
          open={startOpen}
          onClose={() => setStartOpen(false)}
          width={520}
          destroyOnClose
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button onClick={() => setStartOpen(false)}>取消</Button>
              <Button type="primary" onClick={submitStart}>提交发起</Button>
            </div>
          }
        >
          {startDef && (
            <div>
              <Descriptions column={1} size="small" style={{ marginBottom: 20, padding: 16, background: '#f8fafc', borderRadius: 8 }}>
                <Descriptions.Item label="流程编码">{startDef.code}</Descriptions.Item>
                <Descriptions.Item label="流程分类">{renderCategoryTag(startDef.category)}</Descriptions.Item>
                <Descriptions.Item label="关联应用">{startDef.app || '—'}</Descriptions.Item>
                <Descriptions.Item label="版本">{startDef.version}</Descriptions.Item>
                <Descriptions.Item label="节点数">{startDef.nodes} 个节点</Descriptions.Item>
                <Descriptions.Item label="可用范围">{startDef.orgScope}</Descriptions.Item>
              </Descriptions>
              <Form form={handleForm} layout="vertical">
                <Form.Item label="优先级" name="priority" initialValue="normal">
                  <Radio.Group>
                    <Radio value="normal">普通</Radio>
                    <Radio value="urgent">紧急</Radio>
                    <Radio value="critical">特急</Radio>
                  </Radio.Group>
                </Form.Item>
                <Form.Item label="申请事由" name="reason" rules={[{ required: true, message: '请输入申请事由' }]}>
                  <Input.TextArea rows={4} placeholder="请说明申请原因与具体事项..." />
                </Form.Item>
                <Form.Item label="附件">
                  <Input placeholder="支持上传附件（演示）" disabled />
                </Form.Item>
              </Form>
            </div>
          )}
        </Drawer>
      </div>
    )
  }

  // ===== 我的待办视图 =====
  if (view === 'todo') {
    const overdueCount = myTodos.filter((t) => t.overTime).length
    return (
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px' }}>我的待办</h2>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 16px' }}>等待我处理的流程任务</p>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}><Card style={{ borderRadius: 12 }}><Statistic title="待办总数" value={myTodos.length} suffix="条" /></Card></Col>
          <Col span={6}><Card style={{ borderRadius: 12 }}><Statistic title="已超时" value={overdueCount} suffix="条" valueStyle={{ color: overdueCount > 0 ? '#ef4444' : undefined }} /></Card></Col>
        </Row>
        {renderToolbar(
          <>
            <Select
              placeholder="优先级"
              style={{ width: 120 }}
              value={priorityFilter}
              onChange={(v) => setPriorityFilter(v)}
              options={[{ value: 'all', label: '全部优先级' }, { value: 'normal', label: '普通' }, { value: 'urgent', label: '紧急' }, { value: 'critical', label: '特急' }]}
            />
            <Select
              mode="multiple"
              allowClear
              placeholder="流程分类"
              style={{ width: 200 }}
              value={catFilter}
              onChange={(v) => setCatFilter(v)}
              options={processCategories.map((c) => ({ value: c, label: c }))}
            />
          </>
        )}
        <Card style={{ borderRadius: 12 }}>
          <Table
            rowKey="id"
            dataSource={myTodos}
            pagination={{ pageSize: 8 }}
            size="middle"
            locale={{ emptyText: <Empty description="暂无待办任务" /> }}
            columns={[
              { title: '流程名称', dataIndex: 'name', width: 160, render: (v: string, r: ProcessInstance) => <a onClick={() => openDetail(r)} style={{ fontWeight: 600 }}>{v}</a> },
              { title: '流程编码', dataIndex: 'code', width: 140, render: (v: string) => <code style={{ fontSize: 12 }}>{v}</code> },
              { title: '当前节点', dataIndex: 'currentNode', width: 120 },
              { title: '发起人', dataIndex: 'initiator', width: 100 },
              { title: '发起时间', dataIndex: 'createdAt', width: 150 },
              { title: '优先级', dataIndex: 'priority', width: 80, render: (p: Priority) => renderPriorityTag(p) },
              {
                title: '剩余时限', dataIndex: 'deadline', width: 130,
                render: (v: string, r: ProcessInstance) =>
                  r.overTime
                    ? <Tag color="error" icon={<ClockCircleOutlined />}>已超时</Tag>
                    : v ? <span style={{ fontSize: 12, color: '#64748b' }}>{v}</span> : <span style={{ color: '#cbd5e1' }}>—</span>
              },
              { title: '分类', dataIndex: 'category', width: 90, render: (c: string) => renderCategoryTag(c) },
              {
                title: '操作', width: 150,
                render: (_: unknown, r: ProcessInstance) => (
                  <Space>
                    <Button size="small" type="primary" onClick={() => openHandle(r)}>办理</Button>
                    <Button size="small" type="link" icon={<EyeOutlined />} onClick={() => openDetail(r)}>详情</Button>
                  </Space>
                )
              },
            ]}
          />
        </Card>

        {/* 办理抽屉 */}
        <Drawer
          title={<span style={{ fontSize: 16, fontWeight: 700 }}>办理 · {handleInstance?.name}</span>}
          open={handleOpen}
          onClose={() => setHandleOpen(false)}
          width={560}
          destroyOnClose
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button onClick={() => setHandleOpen(false)}>取消</Button>
              <Button danger onClick={() => submitHandle('reject')}>驳回</Button>
              <Button type="primary" onClick={() => submitHandle('approve')}>通过</Button>
            </div>
          }
        >
          {handleInstance && (
            <div>
              <Descriptions column={1} size="small" style={{ marginBottom: 20, padding: 16, background: '#f8fafc', borderRadius: 8 }}>
                <Descriptions.Item label="流程编码">{handleInstance.code}</Descriptions.Item>
                <Descriptions.Item label="当前节点">{handleInstance.currentNode}</Descriptions.Item>
                <Descriptions.Item label="发起人">{handleInstance.initiator}（{handleInstance.initiatorDept}）</Descriptions.Item>
                <Descriptions.Item label="发起时间">{handleInstance.createdAt}</Descriptions.Item>
              </Descriptions>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>表单内容</div>
              <Form layout="vertical">
                <Form.Item label="申请事由"><Input.TextArea rows={3} defaultValue="申请说明内容（演示数据）" readOnly /></Form.Item>
                <Form.Item label="附件"><Input defaultValue="附件列表（演示）" disabled /></Form.Item>
              </Form>
              <Form form={handleForm} layout="vertical" style={{ marginTop: 16 }}>
                <Form.Item label="处理意见" name="comment">
                  <Input.TextArea rows={3} placeholder="请填写处理意见（驳回时必填）" />
                </Form.Item>
              </Form>
            </div>
          )}
        </Drawer>
      </div>
    )
  }

  // ===== 我的已办视图 =====
  if (view === 'done') {
    return (
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px' }}>我的已办</h2>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 16px' }}>我已处理完成的任务历史</p>
        {renderToolbar(
          <>
            <Select
              placeholder="处理结果"
              style={{ width: 130 }}
              value={statusFilter}
              onChange={(v) => setStatusFilter(v)}
              options={[{ value: 'all', label: '全部结果' }, { value: 'approved', label: '通过' }, { value: 'rejected', label: '驳回' }, { value: 'transferred', label: '转办' }]}
            />
            <Select
              mode="multiple"
              allowClear
              placeholder="流程分类"
              style={{ width: 200 }}
              value={catFilter}
              onChange={(v) => setCatFilter(v)}
              options={processCategories.map((c) => ({ value: c, label: c }))}
            />
          </>
        )}
        <Card style={{ borderRadius: 12 }}>
          <Table
            rowKey={(item) => item.myTask.id}
            dataSource={myDone}
            pagination={{ pageSize: 8 }}
            size="middle"
            locale={{ emptyText: <Empty description="暂无已办记录" /> }}
            columns={[
              { title: '流程名称', dataIndex: ['instance', 'name'], width: 160, render: (v: string, item: any) => <a onClick={() => openDetail(item.instance)} style={{ fontWeight: 600 }}>{v}</a> },
              { title: '流程编码', dataIndex: ['instance', 'code'], width: 140, render: (v: string) => <code style={{ fontSize: 12 }}>{v}</code> },
              { title: '处理节点', dataIndex: ['myTask', 'nodeName'], width: 120 },
              { title: '发起人', dataIndex: ['instance', 'initiator'], width: 100 },
              { title: '处理结果', dataIndex: ['myTask', 'status'], width: 90, render: (s: string) => <Tag color={s === 'approved' ? 'success' : s === 'rejected' ? 'error' : 'blue'}>{s === 'approved' ? '通过' : s === 'rejected' ? '驳回' : '转办'}</Tag> },
              { title: '处理意见', dataIndex: ['myTask', 'comment'], ellipsis: true, render: (v: string) => v || <span style={{ color: '#cbd5e1' }}>—</span> },
              { title: '处理时间', dataIndex: ['myTask', 'processedAt'], width: 150 },
              { title: '流程状态', dataIndex: ['instance', 'status'], width: 90, render: (s: InstanceStatus) => renderStatusTag(s) },
              {
                title: '操作', width: 80,
                render: (_: unknown, item: any) => <Button size="small" type="link" icon={<EyeOutlined />} onClick={() => openDetail(item.instance)}>详情</Button>
              },
            ]}
          />
        </Card>
      </div>
    )
  }

  // ===== 我发起的视图 =====
  if (view === 'initiated') {
    const runningCount = myInitiated.filter((i) => i.status === 'running').length
    const completedCount = myInitiated.filter((i) => i.status === 'completed').length
    return (
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px' }}>我发起的</h2>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 16px' }}>我作为发起人的所有流程实例</p>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}><Card style={{ borderRadius: 12 }}><Statistic title="发起总数" value={myInitiated.length} suffix="个" /></Card></Col>
          <Col span={6}><Card style={{ borderRadius: 12 }}><Statistic title="进行中" value={runningCount} suffix="个" valueStyle={{ color: runningCount > 0 ? '#2563eb' : undefined }} /></Card></Col>
          <Col span={6}><Card style={{ borderRadius: 12 }}><Statistic title="已完成" value={completedCount} suffix="个" valueStyle={{ color: completedCount > 0 ? '#16a34a' : undefined }} /></Card></Col>
        </Row>
        {renderToolbar(
          <>
            <Select
              placeholder="流程状态"
              style={{ width: 130 }}
              value={statusFilter}
              onChange={(v) => setStatusFilter(v)}
              options={[{ value: 'all', label: '全部状态' }, { value: 'running', label: '进行中' }, { value: 'completed', label: '已完成' }, { value: 'rejected', label: '已驳回' }, { value: 'withdrawn', label: '已撤回' }]}
            />
            <Select
              placeholder="优先级"
              style={{ width: 120 }}
              value={priorityFilter}
              onChange={(v) => setPriorityFilter(v)}
              options={[{ value: 'all', label: '全部优先级' }, { value: 'normal', label: '普通' }, { value: 'urgent', label: '紧急' }, { value: 'critical', label: '特急' }]}
            />
            <Select
              mode="multiple"
              allowClear
              placeholder="流程分类"
              style={{ width: 200 }}
              value={catFilter}
              onChange={(v) => setCatFilter(v)}
              options={processCategories.map((c) => ({ value: c, label: c }))}
            />
          </>
        )}
        <Card style={{ borderRadius: 12 }}>
          <Table
            rowKey="id"
            dataSource={myInitiated}
            pagination={{ pageSize: 8 }}
            size="middle"
            locale={{ emptyText: <Empty description="暂无发起记录" /> }}
            columns={[
              { title: '流程名称', dataIndex: 'name', width: 160, render: (v: string, r: ProcessInstance) => <a onClick={() => openDetail(r)} style={{ fontWeight: 600 }}>{v}</a> },
              { title: '流程编码', dataIndex: 'code', width: 140, render: (v: string) => <code style={{ fontSize: 12 }}>{v}</code> },
              { title: '当前节点', dataIndex: 'currentNode', width: 120, render: (v: string, r: ProcessInstance) => r.status === 'running' ? v : <span style={{ color: '#94a3b8' }}>{statusConfig[r.status].label}</span> },
              { title: '当前处理人', dataIndex: 'currentAssignee', width: 100, render: (v: string) => v || <span style={{ color: '#cbd5e1' }}>—</span> },
              { title: '发起时间', dataIndex: 'createdAt', width: 150 },
              { title: '优先级', dataIndex: 'priority', width: 80, render: (p: Priority) => renderPriorityTag(p) },
              { title: '状态', dataIndex: 'status', width: 90, render: (s: InstanceStatus) => renderStatusTag(s) },
              { title: '耗时', dataIndex: 'duration', width: 100 },
              {
                title: '操作', width: 160,
                render: (_: unknown, r: ProcessInstance) => (
                  <Space>
                    <Button size="small" type="link" icon={<EyeOutlined />} onClick={() => openDetail(r)}>详情</Button>
                    {r.status === 'running' && <Button size="small" type="link" icon={<BellOutlined />} onClick={() => urge(r)}>催办</Button>}
                    {r.status === 'running' && <Button size="small" type="link" danger icon={<UndoOutlined />} onClick={() => confirmWithdraw(r)}>撤回</Button>}
                  </Space>
                )
              },
            ]}
          />
        </Card>
      </div>
    )
  }

  return <Empty />
}