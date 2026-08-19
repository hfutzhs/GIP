import { Layout, Avatar, Dropdown, Badge, Space, Popover, List, Button, Tag, Empty, theme as antdTheme } from 'antd'
import {
  ThunderboltFilled,
  DownOutlined,
  SwapOutlined,
  BellOutlined,
  CheckSquareOutlined,
  AppstoreOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { currentUser } from '@/mock/users'
import type { Todo, Message } from '@/types'

const { Header, Content } = Layout

export default function WorkbenchLayout() {
  const { code } = useParams()
  const navigate = useNavigate()
  const { token } = antdTheme.useToken()

  const apps = useAppStore((s) => s.apps)
  const todos = useAppStore((s) => s.todos)
  const messages = useAppStore((s) => s.messages)
  const setProduct = useAppStore((s) => s.setProduct)
  const setActiveAppCode = useAppStore((s) => s.setActiveAppCode)
  const finishTodo = useAppStore((s) => s.finishTodo)
  const readMessage = useAppStore((s) => s.readMessage)
  const readAllMessages = useAppStore((s) => s.readAllMessages)

  const currentApp = apps.find((a) => a.code === code)
  const switchableApps = apps // v1.0: 无状态过滤，全部应用可切换
  const pendingTodos = todos.filter((t) => t.status === 'pending')
  const unreadMessages = messages.filter((m) => !m.read)

  const switchApp = (appCode: string) => {
    setActiveAppCode(appCode)
    navigate(`/app/${appCode}`)
  }

  const goDeveloper = () => {
    setProduct('developer')
    navigate('/')
  }

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

  const appSwitchMenu = {
    items: switchableApps.map((a) => ({
      key: a.code,
      label: (
        <span>
          {a.name}
          {a.code === code && <Tag color="blue" style={{ marginLeft: 8, fontSize: 11 }}>当前</Tag>}
        </span>
      ),
    })),
    onClick: ({ key }: { key: string }) => switchApp(key),
  }

  const userMenu = {
    items: [
      { key: 'dev', label: '返回开发者中心', icon: <SwapOutlined /> },
      { type: 'divider' as const },
      { key: 'logout', label: '退出登录' },
    ],
    onClick: ({ key }: { key: string }) => key === 'dev' && goDeveloper(),
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
          boxShadow: '0 1px 4px rgba(15,23,42,0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ThunderboltFilled style={{ color: token.colorPrimary, fontSize: 22 }} />
            <span style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>光粒工作台</span>
          </div>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <Dropdown menu={appSwitchMenu} placement="bottomLeft">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '4px 10px', borderRadius: 8, background: '#f1f5f9' }}>
              <AppstoreOutlined style={{ color: token.colorPrimary }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{currentApp?.name ?? '应用'}</span>
              <DownOutlined style={{ fontSize: 11, color: '#94a3b8' }} />
            </div>
          </Dropdown>
        </div>

        <Space size={16}>
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