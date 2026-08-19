import { useState } from 'react'
import { Card, Row, Col, Tree, Space, Tag, Input, Empty, theme as antdTheme } from 'antd'
import { SearchOutlined, ArrowRightOutlined, ApiOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { capabilities } from '@/mock/capabilities'

export default function CapabilitiesList() {
  const navigate = useNavigate()
  const { token } = antdTheme.useToken()
  const [selected, setSelected] = useState<string | null>(null)
  const [keyword, setKeyword] = useState('')

  // 前端框架已提升为顶部导航一级页面，能力中心不再展示
  const list = capabilities.filter((c) => c.key !== 'frontend')

  const treeData = [
    {
      title: '全部能力',
      key: 'all',
      children: list.map((c) => ({ title: c.name, key: c.key })),
    },
  ]

  const filtered = list.filter(
    (c) => c.name.includes(keyword) || c.shortName.includes(keyword),
  )

  return (
    <div style={{ display: 'flex', gap: 16, padding: '20px 24px 40px', maxWidth: 1400, margin: '0 auto' }}>
      {/* 左侧能力目录树 */}
      <div style={{ width: 240, flexShrink: 0 }}>
        <Card style={{ borderRadius: 12, padding: 4 }}>
          <div style={{ fontSize: 12, color: '#94a3b8', padding: '8px 12px 4px', fontWeight: 600 }}>能力目录</div>
          <Input
            placeholder="搜索能力"
            allowClear
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ margin: '4px 8px 8px', width: 'calc(100% - 16px)' }}
          />
          <Tree
            treeData={treeData}
            defaultExpandedKeys={['all']}
            selectedKeys={selected ? [selected] : []}
            onSelect={(keys) => {
              const k = keys[0] as string | undefined
              if (k && k !== 'all') setSelected(k)
              else setSelected(null)
            }}
            style={{ padding: '0 4px 8px' }}
          />
        </Card>
        <Card style={{ borderRadius: 12, marginTop: 12 }}>
          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7 }}>
            <ApiOutlined style={{ color: token.colorPrimary, marginRight: 6 }} />
            平台统一建设 <b>{capabilities.length}</b> 大通用能力，应用按需勾选，发布到工作台后自动注入。
          </div>
        </Card>
      </div>

      {/* 右侧能力卡片网格 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Card style={{ borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>能力中心</h2>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>共 {filtered.length} 项能力</span>
          </div>
          {filtered.length === 0 ? (
            <Empty description="未找到匹配的能力" style={{ padding: 40 }} />
          ) : (
            <Row gutter={[16, 16]}>
              {filtered.map((c) => {
                const isSel = selected === c.key
                return (
                  <Col xs={24} sm={12} lg={8} key={c.key}>
                    <Card
                      className="hoverable"
                      hoverable
                      onClick={() => navigate(`/capabilities/${c.key}`)}
                      style={{
                        height: '100%',
                        borderRadius: 12,
                        cursor: 'pointer',
                        borderColor: isSel ? token.colorPrimary : '#eef2f7',
                        borderWidth: isSel ? 2 : 1,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            background: `${c.color}14`,
                            color: c.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 24,
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {c.icon.slice(0, 1)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>{c.name}</div>
                          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, lineHeight: 1.6 }}>{c.description}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, borderTop: '1px dashed #eef2f7', paddingTop: 12 }}>
                        <Space size={6}>
                          <Tag color="blue" style={{ margin: 0 }}>{c.apis.length} 个 API</Tag>
                          <Tag style={{ margin: 0 }}>{c.sdk.length} 个 SDK</Tag>
                        </Space>
                        <span style={{ fontSize: 13, color: token.colorPrimary }}>
                          查看详情 <ArrowRightOutlined />
                        </span>
                      </div>
                    </Card>
                  </Col>
                )
              })}
            </Row>
          )}
        </Card>
      </div>
    </div>
  )
}