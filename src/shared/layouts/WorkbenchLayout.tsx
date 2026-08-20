import { Layout, Avatar, Dropdown, Badge, Space, Popover, List, Button, Tag, Empty, Tooltip, theme as antdTheme } from 'antd'
import {
  ThunderboltFilled,
  BellOutlined,
  CheckSquareOutlined,
  SwapOutlined,
  DownOutlined,
  CodeOutlined,
} from '@ant-design/icons'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { currentUser } from '@/mock/users'
import { tenants } from '@/mock/tenants'
import type { Todo, Message } from '@/types'

const { Header, Content } = Layout

export default function WorkbenchLayout() {
  const navigate = useNavigate()
  const { token } = antdTheme.useToken()

  const todos = useAppStore((s) => s.todos)
  const messages = useAppStore((s) => s.messages)
  const finishTodo = useAppStore((s) => s.finishTodo)
  const readMessage = useAppStore((s) => s.readMessage)
  const readAllMessages = useAppStore((s) => s.readAllMessages)

  const currentTenantId = useAppStore((s) => s.currentTenantId)
  const setCurrentTenantId = useAppStore((s) => s.setCurrentTenantId)
  const setProduct = useAppStore((s) => s.setProduct)
  const currentTenant = tenants.find((t) => t.id === currentTenantId)

  const goDeveloper = () => {
    setProduct('developer')
    navigate('/apps')
  }

  const pendingTodos = todos.filter((t) => t.status === 'pending')
  const unreadMessages = messages.filter((m) => !m.read)

  const todoContent = (
    <div style={{ width: 360 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontWeight: 600 }}>跨应用待办（{pendingTodos.length}）</span>
        <Tag color="blue">待办中心</Tag>
      </div>
      {pendingTodos.length === 0 ? (
        <Empty description="暂无待办" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <List
          size="small"
          dataSource={pendingTodos}
          renderItem={(t: Todo) => (
            <List.Item
              actions={[
                <a key="go" onClick={() => { finishTodo(t.id); t.link && navigate(t.link) }}>
                  去处理
                </a>,
              ]}
            >
              <List.Item.Meta
                title={<span style={{ fontSize: 13 }}>{t.title}</span>}
                description={
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>
                    {t.appName} · {t.type} · {t.createdAt}
                  </span>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  )

  const messageContent = (
    <div style={{ width: 360 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontWeight: 600 }}>消息通知（{unreadMessages.length} 条未读）</span>
        <Button type="link" size="small" onClick={readAllMessages} disabled={unreadMessages.length === 0}>
          全部已读
        </Button>
      </div>
      {messages.length === 0 ? (
        <Empty description="暂无消息" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <List
          size="small"
          dataSource={messages.slice(0, 6)}
          renderItem={(m: Message) => (
            <List.Item onClick={() => readMessage(m.id)} style={{ cursor: 'pointer', opacity: m.read ? 0.6 : 1 }}>
              <List.Item.Meta
                title={
                  <span style={{ fontSize: 13, fontWeight: m.read ? 400 : 600 }}>
                    {!m.read && <Badge status="processing" />}
                    {m.title}
                  </span>
                }
                description={<span style={{ fontSize: 12, color: '#94a3b8' }}>{m.content}</span>}
              />
            </List.Item>
          )}
        />
      )}
    </div>
  )

  const userMenu = {
    items: [{ key: 'logout', label: '退出登录' }],
    onClick: ({ key }: { key: string }) => {
      if (key === 'logout') navigate('/login')
    },
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #eef2f7',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 1px 3px rgba(15,23,42,0.05), 0 1px 2px rgba(15,23,42,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 10px rgba(37,99,235,0.25)' }}>
            <ThunderboltFilled style={{ color: '#ffffff', fontSize: 17 }} />
          </div>
          <span style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>光粒智能工作台</span>
        </div>

        <Space size={16}>
          <Dropdown
            menu={{
              items: tenants.map((t) => ({
                key: t.id,
                label: (
                  <span style={{ fontWeight: t.id === currentTenantId ? 600 : 400, color: t.id === currentTenantId ? token.colorPrimary : undefined }}>
                    {t.name}
                  </span>
                ),
              })),
              onClick: ({ key }) => setCurrentTenantId(key),
            }}
            placement="bottom"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '5px 12px', borderRadius: 8, background: '#f1f5f9', transition: 'background 0.2s ease' }}>
              <SwapOutlined style={{ fontSize: 14, color: '#475569' }} />
              <span style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>{currentTenant?.name}</span>
              <DownOutlined style={{ fontSize: 11, color: '#94a3b8' }} />
            </div>
          </Dropdown>
          <Popover content={todoContent} trigger="click" placement="bottomRight">
            <Badge count={pendingTodos.length} size="small">
              <CheckSquareOutlined style={{ fontSize: 18, color: '#475569', cursor: 'pointer' }} />
            </Badge>
          </Popover>
          <Popover content={messageContent} trigger="click" placement="bottomRight">
            <Badge count={unreadMessages.length} size="small">
              <BellOutlined style={{ fontSize: 18, color: '#475569', cursor: 'pointer' }} />
            </Badge>
          </Popover>
          <Tooltip title="切换至开发者中心">
            <Button type="text" icon={<CodeOutlined style={{ fontSize: 18, color: '#475569' }} />} onClick={goDeveloper} style={{ padding: '4px 6px' }} />
          </Tooltip>
          <Dropdown menu={userMenu} placement="bottomRight">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <Avatar style={{ background: token.colorPrimary }} size={30}>
                {currentUser.avatar}
              </Avatar>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: 13, color: '#334155' }}>{currentUser.name}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{currentUser.tenantName}</div>
              </div>
            </div>
          </Dropdown>
        </Space>
      </Header>

      <Content>
        <Outlet />
      </Content>
    </Layout>
  )
}
