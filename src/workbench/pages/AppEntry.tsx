import { useMemo, useState } from 'react'
import { Layout, Menu, Card, Row, Col, Table, Button, Tabs, Tag, Modal, Form, Input, InputNumber, Select, Upload, Statistic, Empty, App as AntdApp } from 'antd'
import { PlusOutlined, InboxOutlined, CheckOutlined, RocketOutlined, CheckSquareOutlined, FileDoneOutlined, FileSearchOutlined } from '@ant-design/icons'
import ProcessCenter from './ProcessCenter'
import { useParams } from 'react-router-dom'
import { useAppStore, useContracts } from '@/store/useAppStore'
import { getAppMenus, getAppCapabilities } from '@/mock/appEnrichment'
import { ContractStatusTag } from '@/shared/components/StatusTag'
import { AppIcon } from '@/shared/components/AppIcon'
import IconByName from '@/shared/components/IconByName'
import { capabilityMenuItems, isCapabilityMenu, renderCapabilityPage } from '@/workbench/components/CapabilityViews'
import { capabilityMap } from '@/mock/capabilities'
import type { MenuNode, ContractStatus } from '@/types'

const { Sider, Content } = Layout

// 菜单树转 antd Menu items
function toMenuItems(nodes: MenuNode[]): any[] {
  return nodes.map((n) => ({
    key: n.key,
    icon: n.icon ? <IconByName name={n.icon} /> : undefined,
    label: n.title,
    children: n.children ? toMenuItems(n.children) : undefined,
  }))
}

function flattenMenuKeys(nodes: MenuNode[]): string[] {
  return nodes.flatMap((n) => [n.key, ...(n.children ? flattenMenuKeys(n.children) : [])])
}

// 在菜单树中按 key 查找节点
function findMenu(nodes: MenuNode[], key: string): MenuNode | undefined {
  for (const n of nodes) {
    if (n.key === key) return n
    if (n.children) {
      const found = findMenu(n.children, key)
      if (found) return found
    }
  }
  return undefined
}

export default function AppEntry() {
  const { code } = useParams()
  const { message } = AntdApp.useApp()
  const app = useAppStore((s) => s.apps.find((a) => a.code === code))
  const contracts = useContracts()
  const addContract = useAppStore((s) => s.addContract)

  const [activeMenu, setActiveMenu] = useState<string>('')
  const [filter, setFilter] = useState<ContractStatus | 'all'>('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [form] = Form.useForm()

  const menuKeys = useMemo(() => (app ? flattenMenuKeys(getAppMenus(app.code)) : []), [app])
  const currentMenu = activeMenu || 'pc-start'

  if (!app) {
    return (
      <div style={{ padding: 40 }}>
        <Empty description="应用不存在或未发布" />
      </div>
    )
  }

  const filtered = contracts.filter((c) => filter === 'all' || c.status === filter)
  const pendingCount = contracts.filter((c) => c.status === 'pending').length
  const approvedCount = contracts.filter((c) => c.status === 'approved').length

  const openCreate = () => {
    form.resetFields()
    form.setFieldsValue({ type: '采购合同' })
    setCreateOpen(true)
  }

  const submitCreate = () => {
    form.validateFields().then((v: { name: string; party: string; amount: number; type: string }) => {
      addContract({ name: v.name, party: v.party, amount: v.amount, type: v.type })
      message.success('合同已提交，已自动发起审批流程并生成待办')
      setCreateOpen(false)
    })
  }

  const columns = [
    { title: '合同编号', dataIndex: 'code', width: 140, render: (t: string) => <code style={{ fontSize: 13 }}>{t}</code> },
    { title: '合同名称', dataIndex: 'name' },
    { title: '签约方', dataIndex: 'party' },
    { title: '金额（元）', dataIndex: 'amount', width: 130, render: (n: number) => <span style={{ fontFamily: 'monospace' }}>{n.toLocaleString()}</span> },
    { title: '签订日期', dataIndex: 'date', width: 120 },
    { title: '状态', dataIndex: 'status', width: 100, render: (s: ContractStatus) => <ContractStatusTag status={s} /> },
    { title: '操作', width: 90, render: () => <Button size="small" type="link" onClick={() => message.info('查看合同详情（演示）')}>查看</Button> },
  ]

  // 根据菜单渲染业务内容
  const renderContent = () => {
    // 流程中心
    if (currentMenu.startsWith('pc-')) {
      return <ProcessCenter view={currentMenu.replace('pc-', '')} />
    }
    // 非合同审批应用：展示通用占位
    if (app.code !== 'contract-approval') {
      const node = findMenu(getAppMenus(app.code), currentMenu)
      return (
        <Card style={{ borderRadius: 12 }}>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <AppIcon icon={app.icon} bg={app.iconBg} size={56} />
            <h2 style={{ marginTop: 16, fontSize: 20, fontWeight: 700 }}>{app.name}</h2>
            <p style={{ color: '#64748b', maxWidth: 520, margin: '8px auto 0' }}>{app.description}</p>
            <Tag color="blue" style={{ marginTop: 12 }}>{node?.title ?? '业务内容'}</Tag>
            <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 16 }}>该应用为演示样例，业务页面以占位形式展示。</p>
          </div>
        </Card>
      )
    }

    // 统计报表
    if (currentMenu.startsWith('m-report')) {
      const total = contracts.reduce((s, c) => s + c.amount, 0)
      const approved = contracts.filter((c) => c.status === 'approved')
      return (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px' }}>统计报表</h2>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col xs={12} md={6}><Card style={{ borderRadius: 12 }}><Statistic title="合同总数" value={contracts.length} suffix="份" /></Card></Col>
            <Col xs={12} md={6}><Card style={{ borderRadius: 12 }}><Statistic title="合同总额" value={total} prefix="¥" /></Card></Col>
            <Col xs={12} md={6}><Card style={{ borderRadius: 12 }}><Statistic title="已通过" value={approved.length} suffix="份" /></Card></Col>
            <Col xs={12} md={6}><Card style={{ borderRadius: 12 }}><Statistic title="待审批" value={pendingCount} suffix="份" /></Card></Col>
          </Row>
          <Card title={<span style={{ fontSize: 14 }}>已通过合同明细</span>} style={{ borderRadius: 12 }}>
            <Table rowKey="id" dataSource={approved} columns={columns.slice(0, 5)} pagination={false} size="middle" />
          </Card>
        </div>
      )
    }

    // 系统设置
    if (currentMenu === 'm-settings') {
      return (
        <Card style={{ borderRadius: 12 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 0, marginBottom: 16 }}>系统设置</h2>
          <p style={{ color: '#64748b' }}>合同审批系统的参数配置、模板管理与归档规则设置（演示占位）。</p>
        </Card>
      )
    }

    // 合同列表 / 新建合同
    return (
      <Card style={{ borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 12 }}>
          <Tabs
            activeKey={filter}
            onChange={(k) => setFilter(k as ContractStatus | 'all')}
            style={{ marginBottom: 0 }}
            items={[
              { key: 'all', label: `全部 (${contracts.length})` },
              { key: 'pending', label: `待审批 (${pendingCount})` },
              { key: 'approved', label: `已通过 (${approvedCount})` },
            ]}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新建合同</Button>
        </div>
        <Table rowKey="id" dataSource={filtered} columns={columns} pagination={{ pageSize: 8 }} size="middle" />
      </Card>
    )
  }

  return (
    <Layout style={{ minHeight: 'calc(100vh - 60px)' }}>
      <Sider width={220} style={{ background: '#fff', borderRight: '1px solid #eef2f7', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          <Menu
            mode="inline"
            selectedKeys={[currentMenu]}
            defaultOpenKeys={['pc-group']}
            onClick={({ key }) => setActiveMenu(key)}
            style={{ borderRight: 'none' }}
            items={[
              {
                key: 'pc-group',
                type: 'group' as const,
                label: '流程中心',
                children: [
                  { key: 'pc-start', icon: <RocketOutlined />, label: '发起流程' },
                  { key: 'pc-todo', icon: <CheckSquareOutlined />, label: '我的待办' },
                  { key: 'pc-done', icon: <FileDoneOutlined />, label: '我的已办' },
                  { key: 'pc-initiated', icon: <FileSearchOutlined />, label: '我发起的' },
                ],
              },
            ]}
          />
        </div>
      </Sider>
      <Content style={{ padding: '20px 24px', background: '#f5f7fa', overflowY: 'auto' }}>
        {renderContent()}
      </Content>

      <Modal title="新建合同" open={createOpen} onOk={submitCreate} onCancel={() => setCreateOpen(false)} okText="提交并发起审批" width={560} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item label="合同名称" name="name" rules={[{ required: true, message: '请输入合同名称' }]}>
            <Input placeholder="例如：发动机总成采购合同" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="签约方" name="party" rules={[{ required: true, message: '请输入签约方' }]}>
                <Input placeholder="对方公司名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="合同类型" name="type" rules={[{ required: true, message: '请选择类型' }]}>
                <Select options={[{ value: '采购合同' }, { value: '服务合同' }, { value: '租赁合同' }, { value: '技术开发' }]} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="合同金额（元）" name="amount" rules={[{ required: true, message: '请输入金额' }]}>
            <InputNumber min={0} style={{ width: '100%' }} placeholder="0.00" />
          </Form.Item>
          <Form.Item label="合同正文" name="content">
            <Input.TextArea rows={4} placeholder="粘贴或填写合同正文摘要..." />
          </Form.Item>
          <Form.Item label="附件">
            <Upload.Dragger maxCount={3} beforeUpload={() => false}>
              <p className="ant-upload-drag-icon"><InboxOutlined /></p>
              <p className="ant-upload-text" style={{ fontSize: 13 }}>点击或拖拽文件上传</p>
              <p className="ant-upload-hint" style={{ fontSize: 12 }}>支持 PDF / Word / Excel，单文件不超过 20MB</p>
            </Upload.Dragger>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  )
}