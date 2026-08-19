import { useState } from 'react'
import { Card, Row, Col, Button, Tag, Space, Divider, App as AntdApp, Input, Select, Table, Form, DatePicker, Upload, Statistic, Tabs, Collapse, Typography } from 'antd'
import {
  AppstoreOutlined,
  BlockOutlined,
  ApartmentOutlined,
  ShareAltOutlined,
  NodeIndexOutlined,
  CodeOutlined,
  CopyOutlined,
  CheckOutlined,
  RocketOutlined,
  DeploymentUnitOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import type { Capability } from '@/types'

const { Text, Paragraph } = Typography
const { RangePicker } = DatePicker

// 微前端核心特性
const features = [
  { icon: <ApartmentOutlined />, title: '微前端基座', desc: '主应用作为基座（Shell），负责加载、隔离、路由分发子应用，统一管控应用生命周期。' },
  { icon: <DeploymentUnitOutlined />, title: '子应用独立部署', desc: '各业务系统独立开发、构建、部署，互不影响，支持 React / Vue / 原生多技术栈。' },
  { icon: <ShareAltOutlined />, title: '共享依赖', desc: '通用依赖（React、Antd、dayjs）与平台能力 SDK 由基座统一注入，减少子应用体积与重复加载。' },
  { icon: <NodeIndexOutlined />, title: '路由聚合', desc: '基座劫持路由变化，按 activeRule 激活对应子应用，对外呈现统一 URL 与聚合菜单。' },
]

// 接入步骤
const steps = [
  {
    n: 1,
    title: '安装基座 SDK',
    desc: '在子应用中安装光粒微前端 SDK，提供注册与通信能力。',
    code: `# 安装微前端 SDK
npm install @guangli/micro-shell --save

# 组件库（可选，按需引入）
npm install @guangli/ui @guangli/icons`,
  },
  {
    n: 2,
    title: '注册子应用',
    desc: '在主基座配置中心登记子应用，声明入口与激活规则。',
    code: `import { registerMicroApps } from '@guangli/micro-shell'

registerMicroApps([
  {
    name: '合同审批系统',
    entry: '//contract.baic.com.cn',
    container: '#sub-app-viewport',
    activeRule: '/app/contract-approval',
    props: { tenantId: 'T001', token: 'xxx' },
  },
  {
    name: '车辆调度平台',
    entry: '//dispatch.baic.com.cn',
    container: '#sub-app-viewport',
    activeRule: '/app/vehicle-dispatch',
  },
])

start() // 启动基座监听`,
  },
  {
    n: 3,
    title: '配置菜单与权限',
    desc: '通过开发者中心「菜单注册」与「能力组件」配置菜单树，基座自动聚合成工作台导航。',
    code: `// 子应用通过 lifecycle 暴露菜单与能力声明
export async function mount(props) {
  props.onRegisterMenus([
    { key: 'm-list', title: '合同列表', path: '/contract/list' },
    { key: 'm-create', title: '新建合同', path: '/contract/create' },
  ])
  // 注入平台能力：SSO 用户态、待办、通知
  const { user, todo, notify } = props.capabilities
}`,
  },
  {
    n: 4,
    title: '发布上架工作台',
    desc: '在「发布管理」点击发布，基座自动加载子应用，用户通过工作台统一访问。',
    code: `// 发布后自动生成访问入口
// workbench.baic.com.cn/app/contract-approval

// 基座注入的运行时能力（无需子应用重复对接）
// ✅ SSO 登录态    ✅ 组织人员    ✅ 权限校验
// ✅ 待办聚合      ✅ 消息通知    ✅ 菜单聚合`,
  },
]

// 组件库
const components = [
  {
    key: 'btn',
    name: 'GlButton',
    category: '通用',
    desc: '统一按钮样式与交互',
    code: `import { GlButton } from '@guangli/ui'

<GlButton type="primary" icon={<RocketOutlined />}>
  提交审批
</GlButton>`,
    preview: <Button type="primary" icon={<RocketOutlined />}>提交审批</Button>,
  },
  {
    key: 'input',
    name: 'GlInput',
    category: '表单',
    desc: '带统一校验的输入框',
    code: `<GlInput
  placeholder="请输入合同名称"
  allowClear
  maxLength={50}
/>`,
    preview: <Input placeholder="请输入合同名称" allowClear style={{ width: 220 }} />,
  },
  {
    key: 'select',
    name: 'GlSelect',
    category: '表单',
    desc: '远程数据下拉选择',
    code: `<GlSelect
  placeholder="选择合同类型"
  options={[
    { value: 'p', label: '采购合同' },
    { value: 's', label: '服务合同' },
  ]}
/>`,
    preview: (
      <Select
        placeholder="选择合同类型"
        style={{ width: 220 }}
        options={[{ value: 'p', label: '采购合同' }, { value: 's', label: '服务合同' }]}
      />
    ),
  },
  {
 key: 'tag',
    name: 'GlStatusTag',
    category: '展示',
    desc: '业务状态标签',
    code: `<GlStatusTag status="approved" />
<GlStatusTag status="pending" />
<GlStatusTag status="rejected" />`,
    preview: (
      <Space>
        <Tag color="success">已通过</Tag>
        <Tag color="warning">待审批</Tag>
        <Tag color="error">已驳回</Tag>
      </Space>
    ),
  },
  {
    key: 'table',
    name: 'GlTable',
    category: '数据',
    desc: '带分页与筛选的标准表格',
    code: `<GlTable
  columns={columns}
  dataSource={data}
  pagination={{ pageSize: 10 }}
/>`,
    preview: (
      <Table
        size="small"
        pagination={false}
        columns={[{ title: '编号', dataIndex: 'code', width: 80 }, { title: '名称', dataIndex: 'name' }]}
        dataSource={[{ key: '1', code: 'HT-01', name: '采购合同' }, { key: '2', code: 'HT-02', name: '服务合同' }]}
        style={{ width: '100%' }}
      />
    ),
  },
  {
    key: 'form',
    name: 'GlForm',
    category: '表单',
    desc: '统一校验的表单容器',
    code: `<GlForm layout="vertical">
  <GlForm.Item label="名称" name="name"
    rules={[{ required: true }]}>
    <GlInput />
  </GlForm.Item>
</GlForm>`,
    preview: (
      <Form layout="vertical" style={{ width: '100%' }}>
        <Form.Item label="合同名称" name="name" rules={[{ required: true }]}>
          <Input placeholder="请输入" />
        </Form.Item>
      </Form>
    ),
  },
  {
    key: 'date',
    name: 'GlDateRange',
    category: '表单',
    desc: '统一日期区间选择',
    code: `<GlDateRange
  placeholder={['签订开始', '签订结束']}
/>`,
    preview: <RangePicker style={{ width: 240 }} placeholder={['签订开始', '签订结束']} />,
  },
  {
    key: 'upload',
    name: 'GlUpload',
    category: '表单',
    desc: '对接统一文件服务',
    code: `<GlUpload
  maxCount={3}
  accept=".pdf,.docx"
/>`,
    preview: <Upload maxCount={1} beforeUpload={() => false}><Button size="small">点击上传</Button></Upload>,
  },
]

const categoryTabs = ['全部', '通用', '表单', '数据', '展示']

export default function FrontendFrameworkView({ cap }: { cap: Capability }) {
  const { message } = AntdApp.useApp()
  const [activeCat, setActiveCat] = useState('全部')
  const [activeComp, setActiveComp] = useState<string>('')

  const copyCode = (code: string) => {
    navigator.clipboard?.writeText(code).then(
      () => message.success('代码已复制'),
      () => message.error('复制失败，请手动复制'),
    )
  }

  const filteredComps = activeCat === '全部' ? components : components.filter((c) => c.category === activeCat)

  return (
    <div>
      <Tabs
        defaultActiveKey="arch"
        items={[
          {
            key: 'arch',
            label: <span style={{ fontSize: 14, fontWeight: 600 }}><ApartmentOutlined style={{ color: cap.color, marginRight: 6 }} />微前端架构</span>,
            children: (
              <div>
                <Paragraph style={{ color: '#475569', marginBottom: 20 }}>
                  光粒前端框架采用 <Text strong>微前端基座 + 子应用</Text> 架构：主应用作为基座（Shell）负责路由分发、应用加载与隔离，
                  各业务系统作为子应用独立开发部署，通过 SDK 接入平台通用能力，一次接入即可上架工作台。
                </Paragraph>
                <Row gutter={[16, 16]}>
                  {features.map((f) => (
                    <Col xs={24} sm={12} lg={6} key={f.title}>
                      <Card size="small" style={{ borderRadius: 10, height: '100%' }}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <div style={{ width: 38, height: 38, borderRadius: 8, background: `${cap.color}14`, color: cap.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                            {f.icon}
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{f.title}</div>
                            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, lineHeight: 1.6 }}>{f.desc}</div>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
                <Divider style={{ margin: '20px 0 16px' }} />
                <div style={{ background: '#f8fafc', borderRadius: 10, padding: 20 }}>
                  <div style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>运行时架构示意</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                    <div style={{ background: 'linear-gradient(135deg,#2563eb,#06b6d4)', color: '#fff', padding: '12px 28px', borderRadius: 10, fontWeight: 700, fontSize: 14, boxShadow: '0 4px 12px rgba(37,99,235,0.25)' }}>
                      ⚡ 光粒工作台 · 微前端基座 (Shell)
                    </div>
                    <div style={{ color: '#cbd5e1', fontSize: 18 }}>↓</div>
                    <Row gutter={16} style={{ width: '100%' }}>
                      {[
                        { name: '合同审批系统', tech: 'React', rule: '/app/contract-approval' },
                        { name: '车辆调度平台', tech: 'Vue', rule: '/app/vehicle-dispatch' },
                        { name: '供应商门户', tech: 'React', rule: '/app/supplier-portal' },
                      ].map((a) => (
                        <Col xs={24} sm={8} key={a.name}>
                          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{a.name}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                              <Tag style={{ margin: 0, fontSize: 10 }}>{a.tech}</Tag> <code style={{ fontSize: 11 }}>{a.rule}</code>
                            </div>
                          </div>
                        </Col>
                      ))}
                    </Row>
                    <div style={{ color: '#cbd5e1', fontSize: 18 }}>↓</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                      {['SSO 登录态', '组织人员', '权限校验', '待办聚合', '消息通知', '菜单聚合'].map((c) => (
                        <Tag key={c} icon={<CheckOutlined />} color="processing" style={{ borderRadius: 6, margin: 0 }}>{c}</Tag>
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>基座统一注入的运行时能力（子应用无需重复对接）</div>
                  </div>
                </div>
              </div>
            ),
          },
          {
            key: 'guide',
            label: <span style={{ fontSize: 14, fontWeight: 600 }}><RocketOutlined style={{ color: cap.color, marginRight: 6 }} />接入指南</span>,
            children: (
              <Collapse
                defaultActiveKey={['1']}
                items={steps.map((s) => ({
                  key: String(s.n),
                  label: (
                    <Space>
                      <span style={{ display: 'inline-flex', width: 22, height: 22, borderRadius: '50%', background: cap.color, color: '#fff', fontSize: 12, alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{s.n}</span>
                      <span style={{ fontWeight: 600 }}>{s.title}</span>
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>{s.desc}</span>
                    </Space>
                  ),
                  children: (
                    <div style={{ position: 'relative' }}>
                      <pre style={{ background: '#0f172a', color: '#e2e8f0', borderRadius: 8, padding: 14, margin: 0, fontSize: 12, fontFamily: 'monospace', overflowX: 'auto', whiteSpace: 'pre' }}>{s.code}</pre>
                      <Button size="small" type="text" icon={<CopyOutlined />} onClick={() => copyCode(s.code)} style={{ position: 'absolute', top: 8, right: 8, color: '#94a3b8' }}>复制</Button>
                    </div>
                  ),
                }))}
              />
            ),
          },
          {
            key: 'lib',
            label: <span style={{ fontSize: 14, fontWeight: 600 }}><BlockOutlined style={{ color: cap.color, marginRight: 6 }} />组件库</span>,
            children: (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <Tabs
                    activeKey={activeCat}
                    onChange={setActiveCat}
                    items={categoryTabs.map((c) => ({ key: c, label: c }))}
                    style={{ marginBottom: 0 }}
                  />
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>@guangli/ui v2.3.0 · {components.length} 个组件</span>
                </div>
                <Row gutter={[16, 16]}>
                  {filteredComps.map((comp) => {
                    const expanded = activeComp === comp.key
                    return (
                      <Col xs={24} sm={12} lg={8} key={comp.key}>
                        <Card
                          size="small"
                          className="hoverable"
                          style={{ borderRadius: 10, height: '100%', borderColor: expanded ? cap.color : '#eef2f7' }}
                          title={
                            <Space>
                              <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0f172a' }}>{comp.name}</span>
                              <Tag style={{ margin: 0, fontSize: 10 }}>{comp.category}</Tag>
                            </Space>
                          }
                          extra={<Text style={{ fontSize: 12, color: '#94a3b8' }}>{comp.desc}</Text>}
                        >
                          {/* 实时预览 */}
                          <div style={{ background: '#f8fafc', borderRadius: 8, padding: '16px 12px', minHeight: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                            {comp.preview}
                          </div>
                          <div style={{ position: 'relative' }}>
                            <pre style={{ background: '#0f172a', color: '#34d399', borderRadius: 6, padding: 10, margin: 0, fontSize: 11, fontFamily: 'monospace', overflowX: 'auto', whiteSpace: 'pre', maxHeight: expanded ? 200 : 56, transition: 'max-height 0.2s' }}>{comp.code}</pre>
                            <Space style={{ position: 'absolute', top: 6, right: 6 }}>
                              <Button size="small" type="text" icon={<CodeOutlined />} onClick={() => setActiveComp(expanded ? '' : comp.key)} style={{ color: '#94a3b8' }}>{expanded ? '收起' : '展开'}</Button>
                              <Button size="small" type="text" icon={<CopyOutlined />} onClick={() => copyCode(comp.code)} style={{ color: '#94a3b8' }} />
                            </Space>
                          </div>
                        </Card>
                      </Col>
                    )
                  })}
                </Row>
              </div>
            ),
          },
        ]}
      />

      {/* 统计 */}
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col xs={12} md={6}><Card style={{ borderRadius: 12 }}><Statistic title="已上架子应用" value={3} suffix="个" /></Card></Col>
        <Col xs={12} md={6}><Card style={{ borderRadius: 12 }}><Statistic title="组件库组件" value={components.length} suffix="个" /></Card></Col>
        <Col xs={12} md={6}><Card style={{ borderRadius: 12 }}><Statistic title="支持技术栈" value={3} suffix="种" /></Card></Col>
        <Col xs={12} md={6}><Card style={{ borderRadius: 12 }}><Statistic title="首屏加载" value={1.2} suffix="s" /></Card></Col>
      </Row>
    </div>
  )
}