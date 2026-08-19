import { Card, Tabs, Breadcrumb, Space, Tag, Empty, Button, theme as antdTheme } from 'antd'
import { HomeOutlined, LeftOutlined } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { AppStatusTag } from '@/shared/components/StatusTag'
import { AppIcon } from '@/shared/components/AppIcon'
import { tenantMap } from '@/mock/tenants'
import BasicInfoTab from './app-detail/BasicInfoTab'
import MenuRegisterTab from './app-detail/MenuRegisterTab'
import CapabilityComponentsTab from './app-detail/CapabilityComponentsTab'
import ApiApplyTab from './app-detail/ApiApplyTab'
import PublishTab from './app-detail/PublishTab'

export default function AppDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token } = antdTheme.useToken()
  const app = useAppStore((s) => s.apps.find((a) => a.id === id))

  if (!app) {
    return (
      <div className="page-container">
        <Empty description="应用不存在" />
      </div>
    )
  }

  const tabItems = [
    { key: 'basic', label: '基本信息', children: <BasicInfoTab appId={app.id} /> },
    { key: 'menu', label: '菜单注册', children: <MenuRegisterTab appId={app.id} /> },
    { key: 'cap', label: '能力组件', children: <CapabilityComponentsTab appId={app.id} /> },
    { key: 'api', label: 'API申请', children: <ApiApplyTab appId={app.id} /> },
    { key: 'publish', label: '发布管理', children: <PublishTab appId={app.id} /> },
  ]

  return (
    <div className="page-container">
      <Breadcrumb
        style={{ marginBottom: 12 }}
        items={[
          { title: <><HomeOutlined /> 首页</>, href: '/' },
          { title: '应用中心', href: '/apps' },
          { title: app.name },
        ]}
      />

      {/* 应用头部 */}
      <Card style={{ borderRadius: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <AppIcon icon={app.icon} bg={app.iconBg} size={52} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>{app.name}</span>
                <AppStatusTag status={app.status} />
              </div>
              <Space size={12} style={{ marginTop: 4, fontSize: 12, color: '#94a3b8' }}>
                <span style={{ fontFamily: 'monospace', color: token.colorPrimary }}>{app.path}</span>
                <span>{tenantMap[app.tenantId]?.name}</span>
                <span>{app.version}</span>
                <Tag style={{ margin: 0 }}>{app.capabilities.length} 项能力</Tag>
              </Space>
            </div>
          </div>
          <Button icon={<LeftOutlined />} onClick={() => navigate('/apps')}>返回列表</Button>
        </div>
      </Card>

      {/* 配置 Tab 面板 */}
      <Card style={{ borderRadius: 12 }}>
        <Tabs
          defaultActiveKey="basic"
          items={tabItems}
        />
      </Card>
    </div>
  )
}