import { Card, Row, Col, Table, Tag, Button, Input, Tree, Space, List, Statistic, Avatar, Form, Empty, Descriptions, App as AntdApp } from 'antd'
import {
  SafetyCertificateOutlined,
  LockOutlined,
  DeploymentUnitOutlined,
  CheckSquareOutlined,
  BellOutlined,
  UserOutlined,
  MenuOutlined,
  TeamOutlined,
  PlusOutlined,
  RocketOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ThunderboltFilled,
  GlobalOutlined,
  MobileOutlined,
  WechatOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { useAppStore, useTodos, useMessages } from '@/store/useAppStore'
import { currentUser, users as allUsers } from '@/mock/users'
import type { App, CapabilityKey } from '@/types'
import type { MenuNode } from '@/types'

type MenuItem = Required<MenuProps>['items'][number]

// ===== 能力菜单构建 =====

const capIcon: Record<string, React.ReactNode> = {
  sso: <SafetyCertificateOutlined />,
  permission: <LockOutlined />,
  process: <DeploymentUnitOutlined />,
  todo: <CheckSquareOutlined />,
  notification: <BellOutlined />,
}

// 根据应用已勾选能力，生成注入到工作台侧边栏的能力菜单
export function capabilityMenuItems(app: App): MenuItem[] {
  const items: MenuItem[] = []
  // 分组分隔
  items.push({ type: 'divider' })
  items.push({ key: 'cap-group', label: <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>注入能力</span>, disabled: true } as MenuItem)

  const caps = app.capabilities as CapabilityKey[]

  if (caps.includes('sso')) {
    items.push({ key: 'cap-sso', icon: <SafetyCertificateOutlined />, label: '单点登录' })
  }
  if (caps.includes('permission')) {
    items.push({
      key: 'cap-perm',
      icon: <LockOutlined />,
      label: '权限管理',
      children: [
        { key: 'cap-perm-user', icon: <UserOutlined />, label: '用户管理' },
        { key: 'cap-perm-menu', icon: <MenuOutlined />, label: '菜单管理' },
        { key: 'cap-perm-role', icon: <TeamOutlined />, label: '角色管理' },
      ],
    })
  }
  if (caps.includes('process')) {
    items.push({
      key: 'cap-process',
      icon: <DeploymentUnitOutlined />,
      label: '流程中心',
      children: [
        { key: 'cap-process-start', icon: <RocketOutlined />, label: '发起流程' },
        { key: 'cap-process-initiated', icon: <FileTextOutlined />, label: '我发起的' },
        { key: 'cap-process-approved', icon: <CheckCircleOutlined />, label: '我审批的' },
        { key: 'cap-process-todo', icon: <ClockCircleOutlined />, label: '我的待办' },
      ],
    })
  }
  if (caps.includes('todo')) {
    items.push({ key: 'cap-todo', icon: <CheckSquareOutlined />, label: '待办中心' })
  }
  if (caps.includes('notification')) {
    items.push({ key: 'cap-notify', icon: <BellOutlined />, label: '通知中心' })
  }

  return items
}

// 判断某菜单 key 是否为能力菜单
export function isCapabilityMenu(key: string): boolean {
  return key.startsWith('cap-') && key !== 'cap-group'
}

// ===== 能力页面渲染 =====

// 流程模板
const processTemplates = [
  { key: 'pt1', name: '合同审批流程', desc: '采购/服务合同审批，含部门初审、法务审核、领导签批', nodes: 5, icon: '📄' },
  { key: 'pt2', name: '车辆调度确认流程', desc: '车辆调拨与派车确认', nodes: 3, icon: '🚗' },
  { key: 'pt3', name: '采购下单审批流程', desc: '采购订单审批，含预算校验', nodes: 6, icon: '🛒' },
  { key: 'pt4', name: '供应商资质审核流程', desc: '新供应商准入资质审核', nodes: 4, icon: '🏢' },
]

// 我发起的流程实例
const myInitiated = [
  { key: 'pi1', name: '发动机总成采购合同审批', template: '合同审批流程', status: '审批中', node: '法务审核', date: '2026-07-30 14:20' },
  { key: 'pi2', name: 'Q3 车辆调度确认', template: '车辆调度确认流程', status: '已通过', node: '已完成', date: '2026-07-28 09:15' },
  { key: 'pi3', name: '供应商资质审核-北方配件', template: '供应商资质审核流程', status: '已驳回', node: '已驳回', date: '2026-07-25 16:40' },
]

// 我审批的流程实例
const myApproved = [
  { key: 'pa1', name: '变速箱采购合同审批', template: '合同审批流程', status: '已通过', action: '同意', date: '2026-07-29 11:30' },
  { key: 'pa2', name: '零部件采购下单', template: '采购下单审批流程', status: '已通过', action: '同意', date: '2026-07-27 15:20' },
  { key: 'pa3', name: '办公场地租赁合同', template: '合同审批流程', status: '已驳回', action: '驳回', date: '2026-07-26 10:05' },
]

function SSOView() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 20 }}>
      <Card style={{ width: 420, borderRadius: 16, boxShadow: '0 8px 32px rgba(15,23,42,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg,#2563eb,#06b6d4)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, marginBottom: 12 }}>
            <ThunderboltFilled />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>北汽集团统一登录</h2>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 6 }}>光粒 SSO · 一次登录，全平台通行</p>
        </div>
        <Form layout="vertical">
          <Form.Item label="工号 / 域账号">
            <Input prefix={<UserOutlined />} placeholder="请输入工号" defaultValue="U001" />
          </Form.Item>
          <Form.Item label="密码">
            <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" defaultValue="********" />
          </Form.Item>
          <Button type="primary" block size="large" style={{ marginBottom: 16 }}>登录</Button>
        </Form>
        <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid #eef2f7', paddingTop: 16 }}>
          <Space direction="vertical" align="center" size={4}>
            <GlobalOutlined style={{ fontSize: 20, color: '#2563eb' }} />
            <span style={{ fontSize: 11, color: '#94a3b8' }}>域账号登录</span>
          </Space>
          <Space direction="vertical" align="center" size={4}>
            <MobileOutlined style={{ fontSize: 20, color: '#06b6d4' }} />
            <span style={{ fontSize: 11, color: '#94a3b8' }}>短信验证码</span>
          </Space>
          <Space direction="vertical" align="center" size={4}>
            <WechatOutlined style={{ fontSize: 20, color: '#10b981' }} />
            <span style={{ fontSize: 11, color: '#94a3b8' }}>企业微信</span>
          </Space>
        </div>
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#cbd5e1' }}>
          当前登录用户：{currentUser.name} · {currentUser.tenantName}（SSO 登录态已继承）
        </div>
      </Card>
    </div>
  )
}

function PermissionUserView() {
  const columns = [
    { title: '工号', dataIndex: 'id', width: 80 },
    { title: '姓名', dataIndex: 'name', width: 90, render: (n: string) => <Space><Avatar size="small" style={{ background: '#2563eb' }}>{n.slice(0, 1)}</Avatar>{n}</Space> },
    { title: '部门', dataIndex: 'department' },
    { title: '职位', dataIndex: 'position' },
    { title: '手机', dataIndex: 'phone' },
    { title: '状态', dataIndex: 'status', width: 80, render: (s: string) => <Tag color={s === '在职' ? 'success' : 'default'}>{s}</Tag> },
  ]
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>用户管理</h2>
        <Input.Search placeholder="搜索姓名/工号" style={{ width: 240 }} allowClear />
      </div>
      <Card style={{ borderRadius: 12 }}>
        <Table rowKey="id" dataSource={allUsers} columns={columns} pagination={{ pageSize: 8 }} size="middle" />
      </Card>
    </div>
  )
}

function PermissionMenuView() {
  // 从应用菜单树构建展示
  const app = useAppStore((s) => s.activeAppCode ? s.apps.find((a) => a.code === s.activeAppCode) : s.apps[0])
  const treeData = (nodes: MenuNode[]): any[] => nodes.map((n) => ({ key: n.key, title: n.title, children: n.children ? treeData(n.children) : undefined }))
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px' }}>菜单管理</h2>
      <Card style={{ borderRadius: 12 }}>
        <Tree treeData={app ? treeData(app.menus) : []} defaultExpandAll checkable />
      </Card>
    </div>
  )
}

function PermissionRoleView() {
  const app = useAppStore((s) => s.activeAppCode ? s.apps.find((a) => a.code === s.activeAppCode) : s.apps[0])
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px' }}>角色管理</h2>
      <Card style={{ borderRadius: 12 }}>
        <Table
          rowKey="id"
          dataSource={app?.roles ?? []}
          pagination={false}
          size="middle"
          columns={[
            { title: '角色名称', dataIndex: 'name', width: 120 },
            { title: '说明', dataIndex: 'description' },
            { title: '菜单权限', dataIndex: 'menuKeys', render: (keys: string[]) => <Tag color="blue">{keys.length} 个菜单</Tag> },
            { title: '授权人员', dataIndex: 'userIds', render: (ids: string[]) => <Tag>{ids.length} 人</Tag> },
          ]}
        />
      </Card>
    </div>
  )
}

function ProcessStartView() {
  const { message } = AntdApp.useApp()
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px' }}>发起流程</h2>
      <Row gutter={[16, 16]}>
        {processTemplates.map((t) => (
          <Col xs={24} sm={12} lg={6} key={t.key}>
            <Card hoverable className="hoverable" style={{ borderRadius: 12, height: '100%' }} onClick={() => message.info(`发起「${t.name}」：打开流程表单填写页`)}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{t.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>{t.name}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6, lineHeight: 1.6, minHeight: 36 }}>{t.desc}</div>
              <div style={{ marginTop: 10 }}>
                <Tag color="blue">{t.nodes} 个节点</Tag>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}

function ProcessInitiatedView() {
  const columns = [
    { title: '流程名称', dataIndex: 'name' },
    { title: '流程模板', dataIndex: 'template', width: 160 },
    { title: '当前节点', dataIndex: 'node', width: 100 },
    { title: '发起时间', dataIndex: 'date', width: 150 },
    { title: '状态', dataIndex: 'status', width: 90, render: (s: string) => <Tag color={s === '审批中' ? 'processing' : s === '已通过' ? 'success' : 'error'}>{s}</Tag> },
  ]
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px' }}>我发起的</h2>
      <Card style={{ borderRadius: 12 }}>
        <Table rowKey="key" dataSource={myInitiated} columns={columns} pagination={false} size="middle" />
      </Card>
    </div>
  )
}

function ProcessApprovedView() {
  const columns = [
    { title: '流程名称', dataIndex: 'name' },
    { title: '流程模板', dataIndex: 'template', width: 160 },
    { title: '审批动作', dataIndex: 'action', width: 90, render: (a: string) => <Tag color={a === '同意' ? 'success' : 'error'}>{a}</Tag> },
    { title: '审批时间', dataIndex: 'date', width: 150 },
    { title: '状态', dataIndex: 'status', width: 90, render: (s: string) => <Tag color={s === '已通过' ? 'success' : 'error'}>{s}</Tag> },
  ]
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px' }}>我审批的</h2>
      <Card style={{ borderRadius: 12 }}>
        <Table rowKey="key" dataSource={myApproved} columns={columns} pagination={false} size="middle" />
      </Card>
    </div>
  )
}

function ProcessTodoView() {
  const todos = useTodos()
  const finishTodo = useAppStore((s) => s.finishTodo)
  const pending = todos.filter((t) => t.status === 'pending')
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px' }}>我的待办（流程中心）</h2>
      <Card style={{ borderRadius: 12 }}>
        {pending.length === 0 ? (
          <Empty description="暂无待办流程" />
        ) : (
          <List
            dataSource={pending}
            renderItem={(t) => (
              <List.Item actions={[<Button key="d" size="small" type="primary" onClick={() => finishTodo(t.id)}>处理</Button>]}>
                <List.Item.Meta title={t.title} description={<span style={{ fontSize: 12, color: '#94a3b8' }}>{t.appName} · {t.type} · {t.createdAt}</span>} />
                <Tag color="processing">待处理</Tag>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  )
}

function TodoCenterView() {
  const todos = useTodos()
  const finishTodo = useAppStore((s) => s.finishTodo)
  const pending = todos.filter((t) => t.status === 'pending')
  const done = todos.filter((t) => t.status === 'done')
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px' }}>待办中心</h2>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} md={8}><Card style={{ borderRadius: 12 }}><Statistic title="待处理" value={pending.length} suffix="条" valueStyle={{ color: '#ef4444' }} /></Card></Col>
        <Col xs={12} md={8}><Card style={{ borderRadius: 12 }}><Statistic title="已处理" value={done.length} suffix="条" valueStyle={{ color: '#10b981' }} /></Card></Col>
        <Col xs={12} md={8}><Card style={{ borderRadius: 12 }}><Statistic title="合计" value={todos.length} suffix="条" /></Card></Col>
      </Row>
      <Card style={{ borderRadius: 12 }}>
        <List
          dataSource={todos}
          renderItem={(t) => (
            <List.Item actions={t.status === 'pending' ? [<Button key="d" size="small" type="primary" onClick={() => finishTodo(t.id)}>处理</Button>] : []}>
              <List.Item.Meta title={t.title} description={<span style={{ fontSize: 12, color: '#94a3b8' }}>{t.appName} · {t.type} · {t.createdAt}</span>} />
              <Tag color={t.status === 'pending' ? 'processing' : 'default'}>{t.status === 'pending' ? '待处理' : '已处理'}</Tag>
            </List.Item>
          )}
        />
      </Card>
    </div>
  )
}

function NotifyCenterView() {
  const messages = useMessages()
  const readMessage = useAppStore((s) => s.readMessage)
  const readAllMessages = useAppStore((s) => s.readAllMessages)
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>通知中心</h2>
        <Button onClick={readAllMessages} disabled={!messages.some((m) => !m.read)}>全部已读</Button>
      </div>
      <Card style={{ borderRadius: 12 }}>
        <List
          dataSource={messages}
          renderItem={(m) => (
            <List.Item onClick={() => readMessage(m.id)} style={{ cursor: 'pointer', opacity: m.read ? 0.6 : 1 }}>
              <List.Item.Meta
                title={<span style={{ fontWeight: m.read ? 400 : 600 }}>{!m.read && <Tag color="processing" style={{ marginRight: 6 }}>未读</Tag>}{m.title}</span>}
                description={<span style={{ fontSize: 12, color: '#94a3b8' }}>{m.content} · {m.createdAt}</span>}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  )
}

export function renderCapabilityPage(key: string): React.ReactNode {
  switch (key) {
    case 'cap-sso': return <SSOView />
    case 'cap-perm-user': return <PermissionUserView />
    case 'cap-perm-menu': return <PermissionMenuView />
    case 'cap-perm-role': return <PermissionRoleView />
    case 'cap-process-start': return <ProcessStartView />
    case 'cap-process-initiated': return <ProcessInitiatedView />
    case 'cap-process-approved': return <ProcessApprovedView />
    case 'cap-process-todo': return <ProcessTodoView />
    case 'cap-todo': return <TodoCenterView />
    case 'cap-notify': return <NotifyCenterView />
    default: return <Empty description="请选择左侧菜单" />
  }
}