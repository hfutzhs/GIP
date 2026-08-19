import { Card, Row, Col, Steps, Tag, Typography } from 'antd'
import {
  BulbOutlined,
  CheckCircleOutlined,
  ApartmentOutlined,
  AimOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  BranchesOutlined,
  BellOutlined,
  ApartmentOutlined as IsolationOutlined,
  BlockOutlined,
} from '@ant-design/icons'
import { capabilityDocs } from '@/mock/capabilityDocs'
import type { CapabilityKey } from '@/types'

const { Title, Paragraph, Text } = Typography

// 场景图标随能力类型轮换
const scenarioIcons: Partial<Record<CapabilityKey, React.ReactNode>> = {
  org: <ApartmentOutlined />,
  sso: <SafetyOutlined />,
  permission: <BlockOutlined />,
  process: <BranchesOutlined />,
  todo: <CheckCircleOutlined />,
  notification: <BellOutlined />,
  tenant: <IsolationOutlined />,
  frontend: <ThunderboltOutlined />,
}

export default function CapabilityFeatureView({ capKey }: { capKey: CapabilityKey }) {
  const doc = capabilityDocs[capKey]
  if (!doc) return null

  return (
    <Card style={{ borderRadius: 12, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <AimOutlined style={{ color: '#2563eb' }} />
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>功能说明</h2>
      </div>
      <Paragraph style={{ color: '#64748b', fontSize: 13, marginBottom: 20 }}>
        介绍本能力的使用场景、功能特点与接入流程，帮助开发者快速理解并完成接入。
      </Paragraph>

      {/* 使用场景 */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <BulbOutlined style={{ color: '#f59e0b' }} />
          <Text strong style={{ fontSize: 15 }}>使用场景</Text>
        </div>
        <Row gutter={[12, 12]}>
          {doc.scenarios.map((s, i) => (
            <Col xs={24} md={8} key={i}>
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: 14, height: '100%', border: '1px solid #eef2f7' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ color: '#2563eb', fontSize: 16 }}>{scenarioIcons[capKey]}</span>
                  <Text strong style={{ fontSize: 14 }}>{s.title}</Text>
                </div>
                <div style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.7 }}>{s.desc}</div>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* 功能特点 */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <ThunderboltOutlined style={{ color: '#2563eb' }} />
          <Text strong style={{ fontSize: 15 }}>功能特点</Text>
        </div>
        <Row gutter={[12, 12]}>
          {doc.features.map((f, i) => (
            <Col xs={24} sm={12} lg={6} key={i}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <CheckCircleOutlined style={{ color: '#10b981', fontSize: 16, marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a' }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.7, marginTop: 2 }}>{f.desc}</div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* 接入流程 */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
          <BranchesOutlined style={{ color: '#7c3aed' }} />
          <Text strong style={{ fontSize: 15 }}>接入流程</Text>
        </div>
        <Steps
          current={doc.steps.length - 1}
          direction="vertical"
          size="small"
          items={doc.steps.map((s, i) => ({
            title: <Text strong style={{ fontSize: 13 }}>{i + 1}. {s.title}</Text>,
            description: <span style={{ fontSize: 12.5, color: '#64748b' }}>{s.desc}</span>,
          }))}
        />
      </div>
    </Card>
  )
}
