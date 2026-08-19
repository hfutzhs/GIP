import { Card, Tabs, Breadcrumb, Button, Space, Tag, Empty, Descriptions, theme as antdTheme } from 'antd'
import { HomeOutlined, LeftOutlined } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { AppIcon } from '@/shared/components/AppIcon'
import { tenantMap } from '@/mock/tenants'
import { domainMap } from '@/mock/businessDomains'
import BasicInfoTab from './app-detail/BasicInfoTab'
import CredentialTab from './app-detail/CredentialTab'

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
    { key: 'credential', label: '凭证管理', children: <CredentialTab appId={app.id} /> },
  ]

  const domain = domainMap[app.domain]

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
                {domain && <Tag color={domain.color} style={{ margin: 0 }}>{domain.name}</Tag>}
              </div>
              <Space size={16} style={{ marginTop: 4, fontSize: 12, color: '#94a3b8' }}>
                <span style={{ fontFamily: 'monospace', color: token.colorPrimary }}>{app.accessUrl}</span>
                <span>AppKey: <code style={{ fontSize: 12 }}>{app.appKey}</code></span>
                <span>{tenantMap[app.tenantId]?.name}</span>
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
