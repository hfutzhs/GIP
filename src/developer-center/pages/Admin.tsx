import { useState, useEffect } from 'react'
import { Layout, Menu, Card, Row, Col, Button, Tag, Progress, Drawer, Switch, Form, Input, InputNumber, Select, Table, Statistic, List, Descriptions, App as AntdApp, Empty, Space, Modal, Tree } from 'antd'
import {
  CloudServerOutlined,
  DeploymentUnitOutlined,
  ApartmentOutlined,
  FormOutlined,
  DatabaseOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  NotificationOutlined,
  DashboardOutlined,
  AuditOutlined,
  PlusOutlined,
  RobotOutlined,
  ArrowLeftOutlined,
  TeamOutlined,
  UserAddOutlined,
  SearchOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import { tenants as seedTenants } from '@/mock/tenants'
import { capabilities } from '@/mock/capabilities'
import type { Tenant, CapabilityKey } from '@/types'
import ProcessDesigner from './admin/ProcessDesigner'
import FormDesigner from './admin/FormDesigner'
import EntityDesigner from './admin/EntityDesigner'

const { Sider, Content } = Layout

const processSideItems = [
  { key: 'process-design', icon: <ApartmentOutlined />, label: '流程设计' },
  { key: 'form-design', icon: <FormOutlined />, label: '表单设计' },
  { key: 'entity-design', icon: <DatabaseOutlined />, label: '实体设计' },
  { key: 'process-agent', icon: <RobotOutlined />, label: 'Agent审批助手' },
  { key: 'process-monitor', icon: <DashboardOutlined />, label: '流程监控' },
]

const systemSideItems = [
  { key: 'tenant', icon: <CloudServerOutlined />, label: '租户管理' },
  { key: 'org-data', icon: <TeamOutlined />, label: '人员组织数据' },
  { key: 'sso', icon: <SafetyCertificateOutlined />, label: 'SSO配置' },
]

// 流程定义
const processDefs = [
  { key: 'contract_approval', name: '合同审批流程', version: 'v3', nodes: 5, status: '已启用', apps: '合同审批系统' },
  { key: 'vehicle_dispatch', name: '车辆调度确认流程', version: 'v2', nodes: 3, status: '已启用', apps: '车辆调度平台' },
  { key: 'supplier_qualify', name: '供应商资质审核流程', version: 'v1', nodes: 4, status: '草稿', apps: '供应商门户' },
  { key: 'purchase_order', name: '采购下单审批流程', version: 'v5', nodes: 6, status: '已启用', apps: '合同审批系统' },
]

// 表单定义
const formDefs = [
  { key: 'f1', name: '合同录入表单', version: 'v2', fields: 18, status: '已发布', apps: '合同审批系统' },
  { key: 'f2', name: '车辆调度单', version: 'v1', fields: 12, status: '已发布', apps: '车辆调度平台' },
  { key: 'f3', name: '供应商注册表', version: 'v3', fields: 24, status: '草稿', apps: '供应商门户' },
  { key: 'f4', name: '采购申请单', version: 'v1', fields: 9, status: '已发布', apps: '合同审批系统' },
]

// 实体定义
const entityDefs = [
  { key: 'e1', name: 'Contract 合同', table: 'biz_contract', fields: 32, status: '已同步', apps: '合同审批系统' },
  { key: 'e2', name: 'Vehicle 车辆', table: 'biz_vehicle', fields: 26, status: '已同步', apps: '车辆调度平台' },
  { key: 'e3', name: 'Supplier 供应商', table: 'biz_supplier', fields: 41, status: '已同步', apps: '供应商门户' },
  { key: 'e4', name: 'PurchaseOrder 采购单', table: 'biz_purchase_order', fields: 28, status: '待同步', apps: '合同审批系统' },
]

// 系统角色
const systemRoles = [
  { key: 'R01', name: '平台管理员', scope: '全租户', users: 3, desc: '平台级配置与租户开通' },
  { key: 'R02', name: '租户管理员', scope: '单租户', users: 6, desc: '租户内应用与人员管理' },
  { key: 'R03', name: '应用管理员', scope: '单应用', users: 12, desc: '单应用的配置与发布' },
  { key: 'R04', name: '普通用户', scope: '单租户', users: 27450, desc: '工作台应用使用' },
]

// 审计日志
const auditLogs = [
  { key: '1', time: '2026-07-31 10:24:11', operator: '张松', tenant: '北汽股份', action: '发布应用', detail: '合同审批系统 v2.1.0' },
  { key: '2', time: '2026-07-31 09:48:30', operator: '陈伟', tenant: '北汽股份', action: '更新能力', detail: '为车辆调度平台勾选「待办中心」' },
  { key: '3', time: '2026-07-31 09:12:05', operator: '李娜', tenant: '北汽福田', action: '创建应用', detail: '供应商门户' },
  { key: '4', time: '2026-07-30 17:33:22', operator: '周杰', tenant: '北汽福田', action: '调整配额', detail: '北汽福田 配额 12000 → 15000' },
  { key: '5', time: '2026-07-30 14:10:47', operator: '系统', tenant: '北京奔驰', action: 'SSO登录', detail: '用户 U001 登录工作台' },
]

// 监控能力调用统计
const monitorData = capabilities.map((c, i) => {
  const calls = [32450, 28910, 15600, 41200, 9870, 6730, 2310, 5400]
  const succ = [99.96, 99.88, 99.91, 99.73, 100, 99.98, 99.85, 99.92]
  return { key: c.key, name: c.name, calls: calls[i] ?? 5000, success: succ[i] ?? 99.9 }
})

// ===== 人员组织 mock 数据 =====
interface OrgNode {
  key: string
  title: string
  children?: OrgNode[]
}

const orgTree: OrgNode[] = [
  {
    key: 'baic', title: '北汽集团',
    children: [
      {
        key: 'baic-motor', title: '北汽股份',
        children: [
          { key: 'sales', title: '营销中心' },
          { key: 'rd', title: '研发中心' },
          { key: 'finance', title: '财务部' },
          { key: 'hr', title: '人力资源部' },
        ],
      },
      {
        key: 'foton', title: '北汽福田',
        children: [
          { key: 'foton-sales', title: '销售部' },
          { key: 'foton-service', title: '服务部' },
        ],
      },
      {
        key: 'benz', title: '北京奔驰',
        children: [
          { key: 'benz-sales', title: '销售部' },
          { key: 'benz-prod', title: '生产部' },
        ],
      },
    ],
  },
]

interface PersonItem {
  key: string
  name: string
  empNo: string
  dept: string
  position: string
  phone: string
  status: '在职' | '离职' | '休假'
}

const seedPersons: PersonItem[] = [
  { key: 'p1', name: '张松', empNo: 'BAIC001', dept: '北汽股份-营销中心', position: '营销总监', phone: '138****1001', status: '在职' },
  { key: 'p2', name: '陈伟', empNo: 'BAIC002', dept: '北汽股份-研发中心', position: '高级工程师', phone: '138****1002', status: '在职' },
  { key: 'p3', name: '李娜', empNo: 'BAIC003', dept: '北汽股份-财务部', position: '财务经理', phone: '138****1003', status: '在职' },
  { key: 'p4', name: '王芳', empNo: 'BAIC004', dept: '北汽福田-销售部', position: '销售主管', phone: '138****1004', status: '在职' },
  { key: 'p5', name: '刘洋', empNo: 'BAIC005', dept: '北汽福田-服务部', position: '服务专员', phone: '138****1005', status: '休假' },
  { key: 'p6', name: '赵强', empNo: 'BAIC006', dept: '北京奔驰-销售部', position: '区域经理', phone: '138****1006', status: '在职' },
  { key: 'p7', name: '周杰', empNo: 'BAIC007', dept: '北京奔驰-生产部', position: '生产主管', phone: '138****1007', status: '在职' },
  { key: 'p8', name: '孙丽', empNo: 'BAIC008', dept: '北汽股份-人力资源部', position: 'HRBP', phone: '138****1008', status: '在职' },
  { key: 'p9', name: '吴磊', empNo: 'BAIC009', dept: '北汽股份-营销中心', position: '市场专员', phone: '138****1009', status: '离职' },
  { key: 'p10', name: '郑敏', empNo: 'BAIC010', dept: '北汽福田-销售部', position: '销售顾问', phone: '138****1010', status: '在职' },
]

export default function Admin({ section = 'process' }: { section?: 'process' | 'system' }) {
  const { message } = AntdApp.useApp()
  const sideItems = section === 'process' ? processSideItems : systemSideItems
  const [active, setActive] = useState(section === 'process' ? 'process-design' : 'tenant')

  useEffect(() => {
    setActive(section === 'process' ? 'process-design' : 'tenant')
    setDesigningItem(null)
    setOrgSearch('')
    setSelectedDept(null)
    setPersonModalOpen(false)
  }, [section])
  const openKeys = active.startsWith('process') ? ['process'] : []
  const [tenants, setTenants] = useState<Tenant[]>(seedTenants.map((t) => ({ ...t })))
  const [detailTenant, setDetailTenant] = useState<Tenant | null>(null)
  const [detailCaps, setDetailCaps] = useState<CapabilityKey[]>([])
  const [detailQuota, setDetailQuota] = useState<number>(0)
  const [detailTheme, setDetailTheme] = useState<string>('')
  const [designingItem, setDesigningItem] = useState<{ type: string; name: string } | null>(null)
  const [orgSearch, setOrgSearch] = useState('')
  const [selectedDept, setSelectedDept] = useState<string | null>(null)
  const [personModalOpen, setPersonModalOpen] = useState(false)

  const openTenant = (t: Tenant) => {
    setDetailTenant(t)
    setDetailCaps([...t.capabilities])
    setDetailQuota(t.quota)
    setDetailTheme(t.theme)
  }

  const toggleCap = (k: CapabilityKey, on: boolean) => {
    setDetailCaps((prev) => (on ? Array.from(new Set([...prev, k])) : prev.filter((x) => x !== k)))
  }

  const saveTenant = () => {
    if (!detailTenant) return
    setTenants((prev) =>
      prev.map((t) =>
        t.id === detailTenant.id ? { ...t, capabilities: detailCaps, quota: detailQuota, theme: detailTheme } : t,
      ),
    )
    message.success(`${detailTenant.name} 配置已保存`)
    setDetailTenant(null)
  }

  const createTenant = () => {
    message.info('开通租户向导（演示环境）：将引导填写租户名称、管理员、配额与能力套餐')
  }

  const renderPanel = () => {
    switch (active) {
      case 'tenant':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>租户管理</h2>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>管理集团各租户的运行状态、配额与能力套餐</span>
              </div>
              <Button type="primary" icon={<PlusOutlined />} onClick={createTenant}>开通租户</Button>
            </div>
            <Row gutter={[16, 16]}>
              {tenants.map((t) => {
                const pct = Math.round((t.usedQuota / t.quota) * 100)
                return (
                  <Col xs={24} sm={12} lg={8} key={t.id}>
                    <Card className="hoverable" hoverable onClick={() => openTenant(t)} style={{ borderRadius: 12, cursor: 'pointer' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{t.name}</span>
                        <Tag color={t.status === 'running' ? 'success' : 'default'}>{t.status === 'running' ? '运行中' : '已停用'}</Tag>
                      </div>
                      <Row gutter={16} style={{ marginBottom: 12 }}>
                        <Col span={12}><Statistic title="应用数" value={t.appCount} /></Col>
                        <Col span={12}><Statistic title="用户数" value={t.userCount} /></Col>
                      </Row>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>
                        配额使用 {t.usedQuota.toLocaleString()} / {t.quota.toLocaleString()}
                      </div>
                      <Progress percent={pct} strokeColor={pct > 80 ? '#ef4444' : '#2563eb'} size="small" />
                      <div style={{ marginTop: 10, fontSize: 12, color: '#94a3b8' }}>
                        创建于 {t.createTime} · {t.capabilities.length} 项能力
                      </div>
                    </Card>
                  </Col>
                )
              })}
            </Row>
          </div>
        )
      case 'process':
      case 'process-design':
      case 'form-design':
      case 'entity-design': {
        if (designingItem) {
          return (
            <div>
              <Button
                type="link"
                icon={<ArrowLeftOutlined />}
                onClick={() => setDesigningItem(null)}
                style={{ marginBottom: 12, paddingLeft: 0 }}
              >
                返回列表
              </Button>
              {designingItem.type === 'process' && <ProcessDesigner />}
              {designingItem.type === 'form' && <FormDesigner />}
              {designingItem.type === 'entity' && <EntityDesigner />}
            </div>
          )
        }
        return (
          <div>
            {(active === 'process' || active === 'process-design') && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>流程设计</h2>
                  </div>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => message.info('新建流程（演示）：打开可视化流程编排画布')}>新建流程</Button>
                </div>
                <Card style={{ borderRadius: 12 }}>
                  <List
                    dataSource={processDefs}
                    renderItem={(p) => (
                      <List.Item actions={[<Button key="e" size="small" type="link" onClick={() => setDesigningItem({ type: 'process', name: p.name })}>设计</Button>]}>
                        <List.Item.Meta
                          title={<span>{p.name} <Tag color="blue" style={{ marginLeft: 8 }}>{p.version}</Tag></span>}
                          description={<span style={{ fontSize: 12, color: '#94a3b8' }}>{p.nodes} 个节点 · 关联应用：{p.apps}</span>}
                        />
                        <Tag color={p.status === '已启用' ? 'success' : 'default'}>{p.status}</Tag>
                      </List.Item>
                    )}
                  />
                </Card>
              </>
            )}
            {active === 'form-design' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>表单设计</h2>
                  </div>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => message.info('新建表单（演示）：打开表单搭建画布')}>新建表单</Button>
                </div>
                <Card style={{ borderRadius: 12 }}>
                  <Table
                    rowKey="key"
                    dataSource={formDefs}
                    pagination={false}
                    size="middle"
                    columns={[
                      { title: '表单名称', dataIndex: 'name' },
                      { title: '版本', dataIndex: 'version', width: 80, render: (v: string) => <Tag color="blue">{v}</Tag> },
                      { title: '字段数', dataIndex: 'fields', width: 80 },
                      { title: '关联应用', dataIndex: 'apps' },
                      { title: '状态', dataIndex: 'status', width: 90, render: (s: string) => <Tag color={s === '已发布' ? 'success' : 'default'}>{s}</Tag> },
                      { title: '操作', width: 80, render: () => <Button size="small" type="link" onClick={() => setDesigningItem({ type: 'form', name: '表单' })}>设计</Button> },
                    ]}
                  />
                </Card>
              </>
            )}
            {active === 'entity-design' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>实体设计</h2>
                  </div>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => message.info('新建实体（演示）：打开实体建模画布')}>新建实体</Button>
                </div>
                <Card style={{ borderRadius: 12 }}>
                  <Table
                    rowKey="key"
                    dataSource={entityDefs}
                    pagination={false}
                    size="middle"
                    columns={[
                      { title: '实体名称', dataIndex: 'name' },
                      { title: '数据表', dataIndex: 'table', render: (t: string) => <code style={{ fontSize: 13 }}>{t}</code> },
                      { title: '字段数', dataIndex: 'fields', width: 80 },
                      { title: '关联应用', dataIndex: 'apps' },
                      { title: '状态', dataIndex: 'status', width: 90, render: (s: string) => <Tag color={s === '已同步' ? 'success' : 'warning'}>{s}</Tag> },
                      { title: '操作', width: 80, render: () => <Button size="small" type="link" onClick={() => setDesigningItem({ type: 'entity', name: '实体' })}>设计</Button> },
                    ]}
                  />
                </Card>
              </>
            )}
          </div>
        )
      }
      case 'process-agent': {
        const agentFeatures = [
          { key: 'summary', title: '智能摘要Agent', desc: '自动读取来文内容，生成结构化摘要与要件完整性预审', color: '#8b5cf6', icon: <FileTextOutlined /> },
          { key: 'predict', title: '审批预测Agent', desc: '基于历史数据预测流转方向，标注置信度与相似案例', color: '#6366f1', icon: <ThunderboltOutlined /> },
          { key: 'compliance', title: '合规校验Agent', desc: '条款偏差检查、签约方征信查询、风险评分报告', color: '#ec4899', icon: <SafetyCertificateOutlined /> },
          { key: 'efficiency', title: '效率分析Agent', desc: '监控流程瓶颈、识别异常环节、生成优化建议', color: '#0d9488', icon: <BarChartOutlined /> },
        ]
        const agentApprovals = [
          { key: '1', flow: '合同审批流程', applicant: '张明', step: '部门经理审批', result: '通过', risk: 12, suggestion: '金额在常规范围内，建议通过', time: '2026-08-18 10:23' },
          { key: '2', flow: '采购下单流程', applicant: '李华', step: '财务审核', result: '需关注', risk: 65, suggestion: '供应商为新入库，建议人工复核资质', time: '2026-08-18 09:45' },
          { key: '3', flow: '车辆调度流程', applicant: '王芳', step: '自动审批', result: '通过', risk: 8, suggestion: '符合自动审批规则，已自动通过', time: '2026-08-18 08:30' },
          { key: '4', flow: '合同审批流程', applicant: '赵强', step: '法务审核', result: '驳回', risk: 88, suggestion: '合同条款存在重大风险，建议驳回', time: '2026-08-17 17:20' },
        ]
        return (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 0, marginBottom: 4 }}>Agent审批助手</h2>
            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>光粒AI Agent赋能流程审批：智能摘要、审批预测、合规校验、效率分析，全流程AI辅助</p>
            <Row gutter={16} style={{ marginBottom: 20 }}>
              {agentFeatures.map((f) => (
                <Col span={6} key={f.key}>
                  <Card style={{ borderRadius: 12, border: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: f.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: f.color, fontSize: 18 }}>{f.icon}</span>
                      </div>
                      <span style={{ fontSize: 15, fontWeight: 600 }}>{f.title}</span>
                    </div>
                    <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
                  </Card>
                </Col>
              ))}
            </Row>
            <Card style={{ borderRadius: 12 }} title="Agent辅助审批实例">
              <Table
                rowKey="key"
                dataSource={agentApprovals}
                pagination={false}
                size="middle"
                columns={[
                  { title: '流程名称', dataIndex: 'flow' },
                  { title: '申请人', dataIndex: 'applicant', width: 80 },
                  { title: '当前节点', dataIndex: 'step', width: 120 },
                  { title: 'Agent结论', dataIndex: 'result', width: 90, render: (r: string) => <Tag color={r === '通过' ? 'success' : r === '驳回' ? 'error' : 'warning'}>{r}</Tag> },
                  { title: '风险评分', dataIndex: 'risk', width: 90, render: (v: number) => <span style={{ color: v > 60 ? '#ef4444' : v > 30 ? '#f59e0b' : '#16a34a', fontWeight: 600 }}>{v}</span> },
                  { title: 'Agent建议', dataIndex: 'suggestion' },
                  { title: '时间', dataIndex: 'time', width: 150 },
                ]}
              />
            </Card>
          </div>
        )
      }
      case 'process-monitor': {
        const monitorStats = [
          { key: 'total', label: '流程实例总数', value: 1284, color: '#2563eb' },
          { key: 'running', label: '运行中', value: 37, color: '#06b6d4' },
          { key: 'completed', label: '已完成', value: 1206, color: '#16a34a' },
          { key: 'rejected', label: '已驳回', value: 41, color: '#ef4444' },
        ]
        const monitorInstances = [
          { key: '1', flow: '合同审批流程', applicant: '张明', step: '部门经理审批', status: '运行中', startTime: '2026-08-18 10:00', duration: '23分钟' },
          { key: '2', flow: '采购下单流程', applicant: '李华', step: '财务审核', status: '运行中', startTime: '2026-08-18 09:30', duration: '53分钟' },
          { key: '3', flow: '车辆调度流程', applicant: '王芳', step: '已完成', status: '已完成', startTime: '2026-08-18 08:00', duration: '15分钟' },
          { key: '4', flow: '合同审批流程', applicant: '赵强', step: '法务审核', status: '已驳回', startTime: '2026-08-17 16:00', duration: '1小时20分钟' },
          { key: '5', flow: '供应商资质审核', applicant: '刘洋', step: '资质审查', status: '运行中', startTime: '2026-08-17 14:00', duration: '2小时' },
        ]
        return (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 0, marginBottom: 20 }}>流程监控</h2>
            <Row gutter={16} style={{ marginBottom: 20 }}>
              {monitorStats.map((s) => (
                <Col span={6} key={s.key}>
                  <Card style={{ borderRadius: 12, border: '1px solid #f0f0f0' }}>
                    <Statistic title={s.label} value={s.value} valueStyle={{ color: s.color, fontSize: 28, fontWeight: 700 }} />
                  </Card>
                </Col>
              ))}
            </Row>
            <Card style={{ borderRadius: 12 }} title="最近流程实例">
              <Table
                rowKey="key"
                dataSource={monitorInstances}
                pagination={{ pageSize: 8 }}
                size="middle"
                columns={[
                  { title: '流程名称', dataIndex: 'flow' },
                  { title: '申请人', dataIndex: 'applicant', width: 80 },
                  { title: '当前节点', dataIndex: 'step', width: 120 },
                  { title: '状态', dataIndex: 'status', width: 90, render: (s: string) => <Tag color={s === '运行中' ? 'processing' : s === '已完成' ? 'success' : 'error'}>{s}</Tag> },
                  { title: '发起时间', dataIndex: 'startTime', width: 150 },
                  { title: '耗时', dataIndex: 'duration', width: 110, render: (d: string) => <span style={{ fontSize: 13, color: '#64748b' }}><ClockCircleOutlined /> {d}</span> },
                ]}
              />
            </Card>
          </div>
        )
      }
      case 'org-data': {
        const filteredPersons = seedPersons.filter((p) =>
          (!selectedDept || p.dept.includes(selectedDept)) &&
          (!orgSearch || p.name.includes(orgSearch) || p.empNo.includes(orgSearch))
        )
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>人员组织数据</h2>
              <Button type="primary" icon={<UserAddOutlined />} onClick={() => setPersonModalOpen(true)}>新增人员</Button>
            </div>
            <Row gutter={16}>
              <Col span={6}>
                <Card style={{ borderRadius: 12 }} title="组织架构" size="small">
                  <Tree
                    treeData={orgTree}
                    defaultExpandAll
                    onSelect={(keys) => setSelectedDept(keys[0] as string)}
                    style={{ fontSize: 13 }}
                  />
                </Card>
              </Col>
              <Col span={18}>
                <Card style={{ borderRadius: 12 }}>
                  <div style={{ marginBottom: 16 }}>
                    <Input.Search
                      placeholder="搜索姓名或工号"
                      allowClear
                      style={{ width: 300 }}
                      value={orgSearch}
                      onChange={(e) => setOrgSearch(e.target.value)}
                    />
                    {selectedDept && (
                      <Button type="link" onClick={() => setSelectedDept(null)} style={{ marginLeft: 8 }}>清除部门筛选</Button>
                    )}
                  </div>
                  <Table
                    rowKey="key"
                    dataSource={filteredPersons}
                    pagination={{ pageSize: 8 }}
                    size="middle"
                    columns={[
                      { title: '姓名', dataIndex: 'name', width: 100, render: (v: string) => <span style={{ fontWeight: 600 }}>{v}</span> },
                      { title: '工号', dataIndex: 'empNo', width: 100 },
                      { title: '部门', dataIndex: 'dept' },
                      { title: '职位', dataIndex: 'position', width: 120 },
                      { title: '手机', dataIndex: 'phone', width: 130 },
                      { title: '状态', dataIndex: 'status', width: 80, render: (s: string) => <Tag color={s === '在职' ? 'success' : s === '休假' ? 'warning' : 'default'}>{s}</Tag> },
                      { title: '操作', width: 120, render: () => (
                        <Space>
                          <Button size="small" type="link" onClick={() => message.info('编辑人员（演示）')}>编辑</Button>
                          <Button size="small" type="link" danger onClick={() => message.info('删除人员（演示）')}>删除</Button>
                        </Space>
                      ) },
                    ]}
                  />
                </Card>
              </Col>
            </Row>
            <Modal
              title="新增人员"
              open={personModalOpen}
              onCancel={() => setPersonModalOpen(false)}
              onOk={() => { message.success('人员已添加（演示）'); setPersonModalOpen(false) }}
            >
              <Form layout="vertical">
                <Form.Item label="姓名"><Input placeholder="请输入姓名" /></Form.Item>
                <Form.Item label="工号"><Input placeholder="自动生成" disabled /></Form.Item>
                <Form.Item label="部门"><Select placeholder="请选择部门" options={[{ value: '营销中心', label: '北汽股份-营销中心' }, { value: '研发中心', label: '北汽股份-研发中心' }, { value: '财务部', label: '北汽股份-财务部' }]} /></Form.Item>
                <Form.Item label="职位"><Input placeholder="请输入职位" /></Form.Item>
                <Form.Item label="手机"><Input placeholder="请输入手机号" /></Form.Item>
              </Form>
            </Modal>
          </div>
        )
      }
      case 'permission':
        return (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 0, marginBottom: 16 }}>权限配置</h2>
            <Card style={{ borderRadius: 12 }}>
              <Table
                rowKey="key"
                dataSource={systemRoles}
                pagination={false}
                size="middle"
                columns={[
                  { title: '角色', dataIndex: 'name' },
                  { title: '作用范围', dataIndex: 'scope' },
                  { title: '授权人数', dataIndex: 'users', render: (n: number) => n.toLocaleString() },
                  { title: '说明', dataIndex: 'desc' },
                ]}
              />
            </Card>
          </div>
        )
      case 'sso':
        return (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 0, marginBottom: 16 }}>SSO 配置</h2>
            <Card style={{ borderRadius: 12, maxWidth: 640 }}>
              <Form layout="vertical" initialValues={{ mode: 'OAuth2', expire: 7200, domain: 'baic.com.cn' }}>
                <Form.Item label="认证协议" name="mode">
                  <Select options={[{ value: 'OAuth2', label: 'OAuth 2.0' }, { value: 'SAML', label: 'SAML 2.0' }, { value: 'CAS', label: 'CAS' }]} />
                </Form.Item>
                <Form.Item label="令牌有效期（秒）" name="expire">
                  <InputNumber min={60} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="可信域名" name="domain">
                  <Input />
                </Form.Item>
                <Button type="primary" onClick={() => message.success('SSO 配置已保存')}>保存配置</Button>
              </Form>
            </Card>
          </div>
        )
      case 'notification':
        return (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 0, marginBottom: 16 }}>通知配置</h2>
            <Card style={{ borderRadius: 12, maxWidth: 640 }}>
              <List
                dataSource={[
                  { key: 'inApp', name: '站内信', on: true },
                  { key: 'email', name: '邮件', on: true },
                  { key: 'sms', name: '短信', on: false },
                  { key: 'wechat', name: '企业微信', on: true },
                ]}
                renderItem={(c) => (
                  <List.Item actions={[<Switch key="s" defaultChecked={c.on} onChange={() => message.success(`${c.name} 通道状态已更新`)} />]}>
                    <span>{c.name}</span>
                  </List.Item>
                )}
              />
              <Button type="primary" style={{ marginTop: 16 }} onClick={() => message.success('已发送测试通知')}>发送测试通知</Button>
            </Card>
          </div>
        )
      case 'monitor':
        return (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 0, marginBottom: 16 }}>监控大盘</h2>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col xs={12} md={6}><Card style={{ borderRadius: 12 }}><Statistic title="今日 API 调用" value={184320} suffix="次" /></Card></Col>
              <Col xs={12} md={6}><Card style={{ borderRadius: 12 }}><Statistic title="活跃用户" value={4218} suffix="人" /></Card></Col>
              <Col xs={12} md={6}><Card style={{ borderRadius: 12 }}><Statistic title="待办处理" value={326} suffix="条" /></Card></Col>
              <Col xs={12} md={6}><Card style={{ borderRadius: 12 }}><Statistic title="平均响应" value={86} suffix="ms" /></Card></Col>
            </Row>
            <Card title={<span style={{ fontSize: 14 }}>能力调用统计（近7日）</span>} style={{ borderRadius: 12 }}>
              <Table
                rowKey="key"
                pagination={false}
                size="middle"
                dataSource={monitorData}
                columns={[
                  { title: '能力', dataIndex: 'name' },
                  { title: '调用次数', dataIndex: 'calls', render: (n: number) => n.toLocaleString() },
                  { title: '成功率', dataIndex: 'success', render: (n: number) => <Tag color="success">{n.toFixed(2)}%</Tag> },
                ]}
              />
            </Card>
          </div>
        )
      case 'audit':
        return (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 0, marginBottom: 16 }}>审计日志</h2>
            <Card style={{ borderRadius: 12 }}>
              <Table
                rowKey="key"
                dataSource={auditLogs}
                pagination={{ pageSize: 8 }}
                size="middle"
                columns={[
                  { title: '时间', dataIndex: 'time', width: 170 },
                  { title: '操作人', dataIndex: 'operator', width: 90 },
                  { title: '租户', dataIndex: 'tenant', width: 110 },
                  { title: '操作类型', dataIndex: 'action', width: 110, render: (t: string) => <Tag color="blue">{t}</Tag> },
                  { title: '详情', dataIndex: 'detail' },
                ]}
              />
            </Card>
          </div>
        )
      default:
        return <Empty />
    }
  }

  return (
    <Layout style={{ minHeight: 'calc(100vh - 60px)' }}>
      <Sider width={220} theme="light" style={{ background: '#fff', borderRight: '1px solid #d8e2f0' }}>
        <div style={{ color: '#94a3b8', fontSize: 12, padding: '16px 20px 8px', fontWeight: 600, letterSpacing: 1 }}>{section === 'process' ? '流程中心' : '系统配置'}</div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[active]}
          defaultOpenKeys={active.startsWith('process') ? ['process'] : []}
          onClick={({ key }) => { setActive(key); setDesigningItem(null) }}
          style={{ borderRight: 0 }}
          items={sideItems}
        />
      </Sider>
      <Content style={{ padding: '20px 24px 40px', background: '#f5f7fa' }}>
        {renderPanel()}
      </Content>

      <Drawer
        title={detailTenant ? `${detailTenant.name} · 租户详情` : '租户详情'}
        open={!!detailTenant}
        onClose={() => setDetailTenant(null)}
        width={460}
        extra={<Button type="primary" onClick={saveTenant}>保存配置</Button>}
      >
        {detailTenant && (
          <div>
            <Descriptions column={1} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="租户ID">{detailTenant.id}</Descriptions.Item>
              <Descriptions.Item label="状态"><Tag color="success">运行中</Tag></Descriptions.Item>
              <Descriptions.Item label="创建时间">{detailTenant.createTime}</Descriptions.Item>
              <Descriptions.Item label="应用数">{detailTenant.appCount}</Descriptions.Item>
              <Descriptions.Item label="用户数">{detailTenant.userCount.toLocaleString()}</Descriptions.Item>
            </Descriptions>

            <Card size="small" title="配额管理" style={{ borderRadius: 10, marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
                已用 {detailTenant.usedQuota.toLocaleString()} / 配额 {(detailQuota || detailTenant.quota).toLocaleString()}
              </div>
              <Progress percent={Math.round((detailTenant.usedQuota / (detailQuota || detailTenant.quota)) * 100)} strokeColor="#2563eb" style={{ marginBottom: 12 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>调整配额：</span>
                <InputNumber min={detailTenant.usedQuota} value={detailQuota} onChange={(v) => setDetailQuota(v ?? detailTenant.quota)} style={{ width: 140 }} />
              </div>
            </Card>

            <Card size="small" title="能力开关" style={{ borderRadius: 10, marginBottom: 16 }}>
              {capabilities.map((c) => (
                <div key={c.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
                  <span style={{ fontSize: 13 }}>{c.name}</span>
                  <Switch checked={detailCaps.includes(c.key)} onChange={(on) => toggleCap(c.key, on)} />
                </div>
              ))}
            </Card>

            <Card size="small" title="主题配置" style={{ borderRadius: 10 }}>
              <Select
                value={detailTheme}
                onChange={setDetailTheme}
                style={{ width: '100%' }}
                options={[
                  { value: '品牌蓝 #2563eb', label: '品牌蓝 #2563eb' },
                  { value: '福田绿 #16a34a', label: '福田绿 #16a34a' },
                  { value: '奔驰银 #6b7280', label: '奔驰银 #6b7280' },
                  { value: '科技青 #06b6d4', label: '科技青 #06b6d4' },
                ]}
              />
            </Card>
          </div>
        )}
      </Drawer>
    </Layout>
  )
}
