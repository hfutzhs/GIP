import { Button, Space, Typography, Descriptions, Card, App as AntdApp } from 'antd'
import { CopyOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { useAppStore } from '@/store/useAppStore'

const { Text } = Typography

export default function CredentialTab({ appId }: { appId: string }) {
  const { message } = AntdApp.useApp()
  const app = useAppStore((s) => s.apps.find((a) => a.id === appId))!

  if (!app) return null

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success(`${label}已复制到剪贴板`)
    }).catch(() => {
      message.error('复制失败，请手动选择复制')
    })
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <Card style={{ borderRadius: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <SafetyCertificateOutlined style={{ fontSize: 20, color: '#2563eb' }} />
          <span style={{ fontSize: 16, fontWeight: 600 }}>应用凭证信息</span>
        </div>

        <Descriptions column={1} bordered size="middle">
          <Descriptions.Item label="AppKey">
            <Space>
              <Text code style={{ fontSize: 13 }}>{app.appKey}</Text>
              <Button
                size="small"
                type="text"
                icon={<CopyOutlined />}
                onClick={() => copyToClipboard(app.appKey, 'AppKey')}
              />
            </Space>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>应用唯一标识，创建后不可修改</div>
          </Descriptions.Item>
          <Descriptions.Item label="AppSecret">
            <Space>
              <Text code style={{ fontSize: 13 }}>{app.appSecret}</Text>
              <Button
                size="small"
                type="text"
                icon={<CopyOutlined />}
                onClick={() => copyToClipboard(app.appSecret, 'AppSecret')}
              />
            </Space>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>应用密钥，用于接口鉴权，请妥善保管</div>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  )
}
