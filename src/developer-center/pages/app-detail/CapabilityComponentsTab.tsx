import { Row, Col, Card, Tag, Alert, App as AntdApp } from 'antd'
import { CheckCircleFilled, LockFilled } from '@ant-design/icons'
import { useAppStore } from '@/store/useAppStore'
import { capabilityCards } from '@/mock/capabilities'
import type { CapabilityKey } from '@/types'

// 应用可选的通用能力（组织人员、租户管理由平台统一管控，不在此选择）
const selectableKeys: CapabilityKey[] = ['sso', 'permission', 'process', 'todo', 'notification', 'frontend']
// 光粒AI能力
const guangliKeys: CapabilityKey[] = ['agent', 'digital-expert', 'roundtable', 'smart-query']
const guangliProcessKeys: CapabilityKey[] = ['process-agent']
// 必选能力，不可取消
const mandatoryKeys: CapabilityKey[] = ['sso', 'frontend']

export default function CapabilityComponentsTab({ appId }: { appId: string }) {
  const { message } = AntdApp.useApp()
  const app = useAppStore((s) => s.apps.find((a) => a.id === appId))!
  const setAppCapabilities = useAppStore((s) => s.setAppCapabilities)

  const generalCards = capabilityCards.filter((c) => selectableKeys.includes(c.key))
  const guangliCards = capabilityCards.filter((c) => guangliKeys.includes(c.key))

  const toggle = (key: CapabilityKey) => {
    if (mandatoryKeys.includes(key)) return
    const has = app.capabilities.includes(key)
    const next = has ? app.capabilities.filter((c) => c !== key) : [...app.capabilities, key]
    setAppCapabilities(appId, next)
    message.success(has ? '已取消该能力' : '已勾选该能力，发布时自动注入')
  }

  return (
    <div>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 20 }}
        message="勾选后，应用发布到工作台时自动注入对应能力并生成能力菜单（如流程中心、权限管理等）。单点 SSO 与前端框架为必选能力。"
      />
      <div style={{ fontSize: 14, fontWeight: 700, margin: '4px 0 12px', color: '#0f172a' }}>通用能力</div>
      <Row gutter={[16, 16]}>
        {generalCards.map((c) => {
          const checked = app.capabilities.includes(c.key)
          const mandatory = mandatoryKeys.includes(c.key)
          return (
            <Col xs={24} sm={12} lg={8} xl={6} key={c.key}>
              <Card
                hoverable
                onClick={() => !mandatory && toggle(c.key)}
                style={{
                  borderRadius: 12,
                  cursor: mandatory ? 'default' : 'pointer',
                  borderColor: checked ? c.color : 'rgba(226,232,240,0.6)',
                  background: checked ? `${c.color}08` : '#fff',
                  position: 'relative',
                  height: '100%',
                }}
              >
                <div style={{ position: 'absolute', top: 12, right: 12, color: checked ? c.color : '#cbd5e1', fontSize: 18 }}>
                  {checked ? (mandatory ? <LockFilled /> : <CheckCircleFilled />) : <CheckCircleFilled style={{ color: '#cbd5e1' }} />}
                </div>
                <div
                  style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: checked ? c.color : '#f1f5f9',
                    color: checked ? '#fff' : '#94a3b8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, fontWeight: 700, marginBottom: 12,
                  }}
                >
                  {c.icon.slice(0, 1)}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: checked ? '#0f172a' : '#64748b', marginBottom: 4 }}>
                  {c.name}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6, minHeight: 38 }}>{c.desc}</div>
                <div style={{ marginTop: 10 }}>
                  {mandatory ? (
                    <Tag color="blue" icon={<LockFilled />} style={{ borderRadius: 4 }}>必选</Tag>
                  ) : (
                    <Tag color={checked ? 'success' : 'default'} style={{ borderRadius: 4 }}>
                      {checked ? '已勾选' : '未勾选'}
                    </Tag>
                  )}
                </div>
              </Card>
            </Col>
          )
        })}
      </Row>
      <div style={{ fontSize: 14, fontWeight: 700, margin: '20px 0 12px', color: '#0f172a' }}>光粒AI能力</div>
      <Row gutter={[16, 16]}>
        {guangliCards.map((c) => {
          const checked = app.capabilities.includes(c.key)
          return (
            <Col xs={24} sm={12} lg={8} xl={6} key={c.key}>
              <Card
                hoverable
                onClick={() => toggle(c.key)}
                style={{
                  borderRadius: 12,
                  cursor: 'pointer',
                  borderColor: checked ? c.color : 'rgba(226,232,240,0.6)',
                  background: checked ? `${c.color}08` : '#fff',
                  position: 'relative',
                  height: '100%',
                }}
              >
                <div style={{ position: 'absolute', top: 12, right: 12, color: checked ? c.color : '#cbd5e1', fontSize: 18 }}>
                  {checked ? <CheckCircleFilled /> : <CheckCircleFilled style={{ color: '#cbd5e1' }} />}
                </div>
                <div
                  style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: checked ? c.color : '#f1f5f9',
                    color: checked ? '#fff' : '#94a3b8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, fontWeight: 700, marginBottom: 12,
                  }}
                >
                  {c.icon.slice(0, 1)}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: checked ? '#0f172a' : '#64748b', marginBottom: 4 }}>
                  {c.name}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6, minHeight: 38 }}>{c.desc}</div>
                <div style={{ marginTop: 10 }}>
                  <Tag color={checked ? 'success' : 'default'} style={{ borderRadius: 4 }}>
                    {checked ? '已勾选' : '未勾选'}
                  </Tag>
                </div>
              </Card>
            </Col>
          )
        })}
      </Row>
      <div style={{ marginTop: 16, color: '#64748b', fontSize: 13 }}>
        已勾选 <b style={{ color: '#2563eb' }}>{app.capabilities.length}</b> 项能力（含 {mandatoryKeys.length} 项必选）
      </div>
    </div>
  )
}