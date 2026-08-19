import { useState } from 'react'
import { Card, Button, Input, Space, Alert, Modal, Typography, Descriptions, App as AntdApp } from 'antd'
import { CopyOutlined, ReloadOutlined, StopOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { useAppStore } from '@/store/useAppStore'

const { Text, Paragraph } = Typography

export default function CredentialTab({ appId }: { appId: string }) {
  const { message, modal } = AntdApp.useApp()
  const app = useAppStore((s) => s.apps.find((a) => a.id === appId))!
  const regenerateAppSecret = useAppStore((s) => s.regenerateAppSecret)
  const revokeCredentials = useAppStore((s) => s.revokeCredentials)
  const [newSecret, setNewSecret] = useState<string | null>(null)

  if (!app) return null

  const revoked = app.credentialsRevoked === true
  const maskedSecret = 'SK_' + '*'.repeat(28)

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success(`${label}已复制到剪贴板`)
    }).catch(() => {
      message.error('复制失败，请手动选择复制')
    })
  }

  const handleRegenerate = () => {
    modal.confirm({
      title: '重新生成 AppSecret',
      content: '重新生成后，原 AppSecret 将立即失效，使用旧密钥的所有请求将被拒绝。确认继续？',
      okText: '确认重新生成',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        const secret = regenerateAppSecret(appId)
        setNewSecret(secret)
      },
    })
  }

  const handleRevoke = () => {
    modal.confirm({
      title: '紧急吊销凭证',
      content: '吊销后，该应用的 AppKey 与 AppSecret 将全部失效，所有 API 调用将被拒绝。此操作不可逆，需重新生成凭证后才能恢复。确认吊销？',
      okText: '确认吊销',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        revokeCredentials(appId)
        message.warning('凭证已吊销，所有 API 调用已拒绝')
      },
    })
  }

  return (
    <div style={{ maxWidth: 720 }}>
      {revoked && (
        <Alert
          type="error"
          showIcon
          icon={<StopOutlined />}
          style={{ marginBottom: 20 }}
          message="凭证已吊销，所有 API 调用已拒绝"
          description="请重新生成 AppSecret 以恢复应用接入能力。"
        />
      )}

      <Card style={{ borderRadius: 8, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <SafetyCertificateOutlined style={{ fontSize: 20, color: '#2563eb' }} />
          <span style={{ fontSize: 16, fontWeight: 600 }}>应用凭证信息</span>
        </div>

        <Descriptions column={1} bordered size="middle">
          <Descriptions.Item label="AppKey">
            <Space>
              <Text code copyable={false} style={{ fontSize: 13 }}>{app.appKey}</Text>
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
            <Text code style={{ fontSize: 13 }}>{maskedSecret}</Text>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
              出于安全考虑，AppSecret 仅在创建时明文展示一次，此后以掩码显示
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="所属租户">
            <Text>{app.tenantId}</Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card style={{ borderRadius: 8 }} title={<span style={{ fontSize: 14, fontWeight: 600 }}>凭证操作</span>}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>重新生成 AppSecret</div>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
              生成新的 AppSecret，旧密钥立即失效。适用于密钥泄露或定期轮换场景。
            </div>
            <Button
              danger
              icon={<ReloadOutlined />}
              disabled={revoked}
              onClick={handleRegenerate}
            >
              重新生成 AppSecret
            </Button>
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: '#ef4444' }}>紧急吊销凭证</div>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
              吊销后 AppKey 与 AppSecret 全部失效，所有 API 调用被拒绝。适用于安全应急场景。
            </div>
            <Button
              danger
              type="primary"
              icon={<StopOutlined />}
              disabled={revoked}
              onClick={handleRevoke}
            >
              紧急吊销凭证
            </Button>
          </div>
        </Space>
      </Card>

      <Modal
        title="AppSecret 已重新生成"
        open={!!newSecret}
        onCancel={() => setNewSecret(null)}
        footer={[
          <Button key="ok" type="primary" onClick={() => setNewSecret(null)}>
            已保存，关闭
          </Button>,
        ]}
      >
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="请立即保存此 AppSecret，关闭后将无法再次查看"
        />
        <Paragraph>
          <Text code copyable style={{ fontSize: 13, wordBreak: 'break-all' }}>
            {newSecret}
          </Text>
        </Paragraph>
        <div style={{ fontSize: 12, color: '#94a3b8' }}>
          旧 AppSecret 已立即失效。请使用新密钥更新应用的接入配置。
        </div>
      </Modal>
    </div>
  )
}
