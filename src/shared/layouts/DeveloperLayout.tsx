import { Layout, Avatar, Dropdown, Space, theme as antdTheme } from 'antd'
import { ThunderboltFilled, DownOutlined, SwapOutlined, UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import type { MenuProps } from 'antd'
import { useAppStore } from '@/store/useAppStore'
import { currentUser } from '@/mock/users'

const { Header, Content } = Layout

const navItems = [
  { to: '/apps', label: '应用中心' },
  { to: '/process', label: '流程中心' },
  { to: '/system', label: '系统配置' },
]

export default function DeveloperLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const setProduct = useAppStore((s) => s.setProduct)
  const { token } = antdTheme.useToken()

  const goWorkbench = () => {
    setProduct('workbench')
    navigate('/app/contract-approval')
  }

  const isActive = (to: string) => {
    return location.pathname === to || location.pathname.startsWith(to + '/')
  }

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'workbench') goWorkbench()
    if (key === 'logout') {
      setProduct('workbench')
      navigate('/login')
    }
  }

  const userMenu: MenuProps = {
    items: [
      { key: 'profile', icon: <UserOutlined />, label: '个人中心' },
      { key: 'setting', icon: <SettingOutlined />, label: '账户设置' },
      { key: 'workbench', icon: <SwapOutlined />, label: '切换到工作台' },
      { type: 'divider' as const },
      { key: 'logout', icon: <LogoutOutlined />, label: '退出登录' },
    ],
    onClick: handleMenuClick,
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e8edf3',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 1px 4px rgba(15,23,42,0.06)',
          background: '#fff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #2f6bff 0%, #06b6d4 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(47,107,255,0.25)',
            }}>
              <ThunderboltFilled style={{ color: '#fff', fontSize: 18 }} />
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em' }}>
              光粒平台 v1.0
            </span>
          </div>
          <nav style={{ display: 'flex', gap: 4 }}>
            {navItems.map((item) => {
              const active = isActive(item.to)
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  style={{
                    padding: '7px 16px',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: active ? 600 : 400,
                    color: active ? '#2563eb' : '#475569',
                    background: active ? '#eff6ff' : 'transparent',
                    transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                  }}
                >
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
        </div>

        <Dropdown menu={userMenu} placement="bottomRight">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '4px 10px', borderRadius: 8, transition: 'background 0.15s' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Avatar style={{ background: 'linear-gradient(135deg, #2f6bff, #06b6d4)', fontSize: 13, fontWeight: 600 }} size={32}>
              {currentUser.avatar}
            </Avatar>
            <span style={{ fontSize: 14, color: '#334155', fontWeight: 500 }}>{currentUser.name}</span>
            <DownOutlined style={{ fontSize: 11, color: '#94a3b8' }} />
          </div>
        </Dropdown>
      </Header>

      <Content>
        <Outlet />
      </Content>
    </Layout>
  )
}
