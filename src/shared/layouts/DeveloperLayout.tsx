import { Layout, Avatar, Dropdown, Menu, Tooltip, Space } from 'antd'
import {
  ThunderboltFilled,
  DownOutlined,
  GlobalOutlined,
  DesktopOutlined,
  LogoutOutlined,
  SettingOutlined,
  AppstoreOutlined,
  ApartmentOutlined,
  FormOutlined,
  DatabaseOutlined,
  RobotOutlined,
  DashboardOutlined,
  CloudServerOutlined,
  TeamOutlined,
  UserSwitchOutlined,
  SafetyCertificateOutlined,
  BookOutlined,
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import type { MenuProps } from 'antd'
import { useAppStore } from '@/store/useAppStore'
import { currentUser } from '@/mock/users'
import { tenants } from '@/mock/tenants'

const { Header, Sider, Content } = Layout

const processChildren = [
  { key: '/process?tab=process-design', icon: <ApartmentOutlined />, label: '流程设计' },
  { key: '/process?tab=form-design', icon: <FormOutlined />, label: '表单设计' },
  { key: '/process?tab=entity-design', icon: <DatabaseOutlined />, label: '实体设计' },
  { key: '/process?tab=process-agent', icon: <RobotOutlined />, label: 'Agent审批助手' },
  { key: '/process?tab=process-monitor', icon: <DashboardOutlined />, label: '流程监控' },
]

const systemChildren = [
  { key: '/system?tab=tenant', icon: <CloudServerOutlined />, label: '租户管理' },
  { key: '/system?tab=org-data', icon: <TeamOutlined />, label: '人员主数据' },
  { key: '/system?tab=account', icon: <UserSwitchOutlined />, label: '账号管理' },
  { key: '/system?tab=sso', icon: <SafetyCertificateOutlined />, label: 'SSO配置' },
  { key: '/system?tab=dict', icon: <BookOutlined />, label: '字典管理' },
]

const navMenuItems: MenuProps['items'] = [
  { key: '/apps', icon: <AppstoreOutlined />, label: '应用中心' },
  { key: '/process', icon: <ApartmentOutlined />, label: '流程中心', children: processChildren },
  { key: '/system', icon: <SettingOutlined />, label: '系统配置', children: systemChildren },
]

export default function DeveloperLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const setProduct = useAppStore((s) => s.setProduct)
  const currentTenantId = useAppStore((s) => s.currentTenantId)
  const setCurrentTenantId = useAppStore((s) => s.setCurrentTenantId)

  const pathname = location.pathname
  const tab = searchParams.get('tab')

  const getSelectedKey = () => {
    if (pathname === '/apps') return '/apps'
    if (pathname === '/process') return '/process?tab=' + (tab || 'process-design')
    if (pathname === '/system') return '/system?tab=' + (tab || 'tenant')
    return '/apps'
  }

  const getOpenKeys = () => {
    if (pathname === '/process') return ['/process']
    if (pathname === '/system') return ['/system']
    return []
  }

  const handleNavClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key)
  }

  const goWorkbench = () => {
    setProduct('workbench')
    navigate('/app/contract-approval')
  }

  const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      setProduct('workbench')
      navigate('/login')
    }
  }

  const userMenu: MenuProps = {
    items: [
      { key: 'logout', icon: <LogoutOutlined />, label: '退出登录' },
    ],
    onClick: handleUserMenuClick,
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#ffffff', borderBottom: '1px solid #eef2f7', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60, position: 'sticky', top: 0, zIndex: 20, boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 10px rgba(37,99,235,0.25)' }}>
            <ThunderboltFilled style={{ color: '#fff', fontSize: 16 }} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em' }}>光粒开发者中心</span>
        </div>
        <Space size={16} align="center">
          <Tooltip title="切换到光粒智能工作台">
            <div onClick={goWorkbench} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '5px 12px', borderRadius: 8, background: '#f1f5f9', transition: 'all 0.2s ease' }}>
              <DesktopOutlined style={{ fontSize: 16, color: '#2563eb' }} />
              <span style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>工作台</span>
            </div>
          </Tooltip>
          <Dropdown
            menu={{
              items: tenants.map((t) => ({
                key: t.id,
                label: (
                  <span style={{ fontWeight: t.id === currentTenantId ? 600 : 400, color: t.id === currentTenantId ? '#2563eb' : '#334155' }}>
                    {t.name}
                  </span>
                ),
              })),
              onClick: ({ key }) => setCurrentTenantId(key),
              selectable: true,
              selectedKeys: [currentTenantId],
            }}
            placement="bottomRight"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '5px 12px', borderRadius: 8, background: '#f1f5f9', transition: 'background 0.2s ease' }}>
              <GlobalOutlined style={{ fontSize: 16, color: '#475569' }} />
              <span style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>
                {tenants.find((t) => t.id === currentTenantId)?.name ?? '选择租户'}
              </span>
              <DownOutlined style={{ fontSize: 11, color: '#94a3b8' }} />
            </div>
          </Dropdown>
          <Dropdown menu={userMenu} placement="bottomRight">
           <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '4px 8px', borderRadius: 8 }}>
             <Avatar style={{ background: 'linear-gradient(135deg, #2563eb, #06b6d4)', fontSize: 12, fontWeight: 600 }} size={30}>{currentUser.avatar}</Avatar>
             <span style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>{currentUser.name}</span>
             <DownOutlined style={{ fontSize: 11, color: '#94a3b8' }} />
           </div>
         </Dropdown>
        </Space>
      </Header>

      <Layout>
        <Sider width={224} theme="light" style={{ background: '#ffffff', borderRight: '1px solid #eef2f7' }}>
          <div style={{ position: 'sticky', top: 60, height: 'calc(100vh - 60px)', overflowY: 'auto' }}>
            <Menu
              mode="inline"
              theme="light"
              selectedKeys={[getSelectedKey()]}
              defaultOpenKeys={getOpenKeys()}
              items={navMenuItems}
              onClick={handleNavClick}
              style={{ borderRight: 0, paddingTop: 12, paddingBottom: 8 }}
            />
          </div>
        </Sider>
        <Content style={{ background: '#f5f7fa', minHeight: 'calc(100vh - 60px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
