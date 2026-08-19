import { Card, Button, Tag, Timeline, Space, Modal, App as AntdApp, Result, Divider, Typography, List } from 'antd'
import { RocketOutlined, CopyOutlined, LinkOutlined, CheckCircleFilled, ExclamationCircleFilled, CloudUploadOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { AppStatusTag } from '@/shared/components/StatusTag'

export default function PublishTab({ appId }: { appId: string }) {
  const { message, modal } = AntdApp.useApp()
  const navigate = useNavigate()
  const app = useAppStore((s) => s.apps.find((a) => a.id === appId))!
  const publishApp = useAppStore((s) => s.publishApp)
  const setProduct = useAppStore((s) => s.setProduct)
  const setActiveAppCode = useAppStore((s) => s.setActiveAppCode)

  const isPublished = app.status === 'published'
  const url = app.publishedUrl ?? `workbench.baic.com.cn/app/${app.code}`

  const copyUrl = () => {
    navigator.clipboard?.writeText(`https://${url}`).then(
      () => message.success('工作台地址已复制'),
      () => message.error('复制失败'),
    )
  }

  const goWorkbench = () => {
    setProduct('workbench')
    setActiveAppCode(app.code)
    navigate(`/app/${app.code}`)
  }

  const confirmPublish = () => {
    modal.confirm({
      title: '发布到工作台',
      icon: <CloudUploadOutlined />,
      content: (
        <div style={{ fontSize: 13 }}>
          确认将「{app.name}」发布到光粒工作台？发布后，集团用户可通过工作台访问该应用，并自动注入已勾选的
          <b>{app.capabilities.length}</b> 项通用能力。
        </div>
      ),
      okText: '确认发布',
      cancelText: '取消',
      onOk: () => {
        publishApp(appId)
        message.success('发布成功！应用已上架工作台')
      },
    })
  }

  const checklist = [
    { ok: !!app.name, label: '已完成基本信息' },
    { ok: app.menus.length > 0, label: `已注册菜单（${app.menus.length} 项）` },
    { ok: app.roles.length > 0, label: `已配置角色（${app.roles.length} 个）` },
    { ok: app.capabilities.length > 0, label: `已勾选能力（${app.capabilities.length} 项）` },
  ]
  const allReady = checklist.every((c) => c.ok)

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {/* 发布状态卡 */}
        <Card style={{ borderRadius: 12, flex: '1 1 380px' }}>
          {isPublished ? (
            <Result
              status="success"
              icon={<CheckCircleFilled style={{ color: '#10b981' }} />}
              title={<span style={{ fontSize: 18 }}>应用已发布到工作台</span>}
              subTitle={
                <span>
                  版本 {app.version} · <AppStatusTag status={app.status} />
                </span>
              }
              extra={
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                  <div style={{ background: '#f1f5f9', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography.Text copyable={false} style={{ fontFamily: 'monospace', fontSize: 13, color: '#2563eb' }}>
                      <LinkOutlined /> {url}
                    </Typography.Text>
                    <Button size="small" icon={<CopyOutlined />} onClick={copyUrl}>复制地址</Button>
                  </div>
                  <Button type="primary" size="large" icon={<RocketOutlined />} block onClick={goWorkbench}>
                    前往工作台
                  </Button>
                </Space>
              }
              style={{ padding: '12px 0' }}
            />
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <ExclamationCircleFilled style={{ color: '#f59e0b', fontSize: 28 }} />
                <div>
                  <div style={{ fontSize: 17, fontWeight: 600 }}>应用尚未发布</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>当前状态：<AppStatusTag status={app.status} /> · 版本 {app.version}</div>
                </div>
              </div>
              <Divider style={{ margin: '12px 0' }} />
              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>发布前检查：</div>
              <List
                size="small"
                dataSource={checklist}
                renderItem={(c) => (
                  <List.Item style={{ border: 'none', padding: '4px 0' }}>
                    <span style={{ color: c.ok ? '#10b981' : '#cbd5e1', marginRight: 8 }}>
                      {c.ok ? <CheckCircleFilled /> : <ExclamationCircleFilled />}
                    </span>
                    <span style={{ fontSize: 13, color: c.ok ? '#334155' : '#94a3b8' }}>{c.label}</span>
                  </List.Item>
                )}
              />
              <Divider style={{ margin: '12px 0' }} />
              <Button type="primary" size="large" icon={<RocketOutlined />} block disabled={!allReady} onClick={confirmPublish}>
                {allReady ? '发布到工作台' : '请先完成上述配置'}
              </Button>
            </div>
          )}
        </Card>

        {/* 版本历史 */}
        <Card title={<span style={{ fontSize: 14 }}>版本历史</span>} style={{ borderRadius: 12, flex: '1 1 320px' }}>
          <Timeline
            items={app.versions.map((v, i) => ({
              color: i === 0 ? 'green' : 'gray',
              children: (
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>
                    {v.version} {i === 0 && <Tag color="green" style={{ marginLeft: 6 }}>当前</Tag>}
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0' }}>{v.time} · {v.operator}</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>{v.note}</div>
                </div>
              ),
            }))}
          />
        </Card>
      </div>
    </div>
  )
}