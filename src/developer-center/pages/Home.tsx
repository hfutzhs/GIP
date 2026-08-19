import { Row, Col, Button, Card, Statistic, Steps, Space, Tag, theme as antdTheme } from 'antd'
import {
  RocketOutlined,
  ApiOutlined,
  ArrowRightOutlined,
  CheckCircleFilled,
  ThunderboltFilled,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { capabilityCards } from '@/mock/capabilities'
import { useAppStore } from '@/store/useAppStore'

export default function Home() {
  const navigate = useNavigate()
  const { token } = antdTheme.useToken()
  const appCount = useAppStore((s) => s.apps.length)
  const publishedCount = useAppStore((s) => s.apps.filter((a) => a.status === 'published').length)

  return (
    <div className="page-container">
      {/* Hero */}
      <div
        className="brand-gradient"
        style={{
          borderRadius: 16,
          padding: '40px 44px',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: 28,
        }}
      >
        <div style={{ maxWidth: 720, position: 'relative', zIndex: 1 }}>
          <Tag style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', border: 'none', marginBottom: 16 }}>
            <ThunderboltFilled style={{ marginRight: 6 }} />
            光粒 AI 平台 · 开发者中心
          </Tag>
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: '0 0 12px', lineHeight: 1.25 }}>
            八大通用能力，一次建设全集团复用
          </h1>
          <p style={{ fontSize: 15, opacity: 0.92, margin: '0 0 24px', lineHeight: 1.7 }}>
            统一身份、组织、权限、流程、待办、通知等通用能力，应用一次接入即可上架工作台，
            告别各业务系统重复造轮子，让集团 IT 投入产出比最大化。
          </p>
          <Space size={12}>
            <Button size="large" type="primary" icon={<RocketOutlined />} onClick={() => navigate('/apps/create')} style={{ background: '#fff', color: token.colorPrimary, border: 'none', fontWeight: 600 }}>
              立即创建应用
            </Button>
            <Button size="large" ghost icon={<ApiOutlined />} onClick={() => navigate('/capabilities')} style={{ borderColor: 'rgba(255,255,255,0.6)', color: '#fff' }}>
              浏览能力 API
            </Button>
          </Space>
        </div>
        {/* 装饰光圈 */}
        <div style={{ position: 'absolute', right: -60, top: -60, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.10)' }} />
        <div style={{ position: 'absolute', right: 60, bottom: -80, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
      </div>

      {/* 价值数据条 */}
      <Row gutter={16} style={{ marginBottom: 28 }}>
        {[
          { title: '通用能力', value: 8, suffix: '大', prefix: '' },
          { title: '三年累计降本', value: 1070, suffix: '万', prefix: '≈' },
          { title: '投资回报率', value: 1.6, suffix: '', prefix: 'ROI ' },
          { title: '首期能力就绪', value: 4, suffix: '个月', prefix: '' },
        ].map((s) => (
          <Col xs={12} md={6} key={s.title}>
            <Card style={{ borderRadius: 12 }}>
              <Statistic title={s.title} value={s.value} prefix={s.prefix} suffix={s.suffix} valueStyle={{ color: token.colorPrimary, fontWeight: 700 }} />
            </Card>
          </Col>
        ))}
      </Row>

      {/* 八大能力卡片 */}
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>八大通用能力</h2>
        <Button type="link" onClick={() => navigate('/capabilities')}>
          查看能力详情 <ArrowRightOutlined />
        </Button>
      </div>
      <Row gutter={[16, 16]} style={{ marginBottom: 28 }}>
        {capabilityCards.map((c) => (
          <Col xs={12} sm={12} md={8} lg={6} key={c.key}>
            <Card
              className="hoverable"
              hoverable
              onClick={() => navigate(`/capabilities/${c.key}`)}
              style={{ height: '100%', borderRadius: 12, cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: `${c.color}14`,
                    color: c.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {c.icon.slice(0, 1)}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>{c.desc}</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 快速接入引导 */}
      <Card style={{ borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>3 步上手，快速接入</h3>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>
              当前已接入应用 {appCount} 个，已发布 {publishedCount} 个
            </p>
          </div>
          <Button type="primary" icon={<RocketOutlined />} onClick={() => navigate('/apps/create')}>
            开始创建
          </Button>
        </div>
        <Steps
          current={-1}
          items={[
            { title: '创建应用', description: '填写应用基本信息与编码', icon: <CheckCircleFilled /> },
            { title: '选择能力', description: '勾选所需通用能力组件', icon: <CheckCircleFilled /> },
            { title: '发布上线', description: '一键发布到工作台', icon: <CheckCircleFilled /> },
          ]}
        />
      </Card>
    </div>
  )
}