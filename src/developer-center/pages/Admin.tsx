import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Layout, Menu, Card, Row, Col, Button, Tag, Drawer, Switch, Form, Input, InputNumber, Select, Table, Statistic, List, Descriptions, App as AntdApp, Empty, Modal, Tree } from 'antd'
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
  EditOutlined,
  BookOutlined,
  PlusOutlined,
  RobotOutlined,
  ArrowLeftOutlined,
  TeamOutlined,
  SearchOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  UserSwitchOutlined,
  KeyOutlined,
  CopyOutlined,
} from '@ant-design/icons'
import { tenants as seedTenants } from '@/mock/tenants'
import { capabilities } from '@/mock/capabilities'
import type { Tenant } from '@/types'
import ProcessDesigner from './admin/ProcessDesigner'
import { businessDomains } from '@/mock/businessDomains'
import type { BusinessDomain } from '@/types'
import { dictCategories as seedCats, dictItems as seedItems } from '@/mock/dictionaries'
import type { DictCategory, DictItem } from '@/mock/dictionaries'
import { accounts as seedAccounts } from '@/mock/accounts'
import type { Account } from '@/mock/accounts'
import FormDesigner from './admin/FormDesigner'
import EntityDesigner from './admin/EntityDesigner'
import { useAppStore } from '@/store/useAppStore'
import { readSsoConfig, writeSsoConfig, regexToHints } from '@/shared/passwordRule'
import type { SsoConfig } from '@/shared/passwordRule'

const { Content } = Layout

const processSideItems = [
  { key: 'process-design', icon: <ApartmentOutlined />, label: '流程设计' },
  { key: 'form-design', icon: <FormOutlined />, label: '表单设计' },
  { key: 'entity-design', icon: <DatabaseOutlined />, label: '实体设计' },
  { key: 'process-agent', icon: <RobotOutlined />, label: 'Agent审批助手' },
  { key: 'process-monitor', icon: <DashboardOutlined />, label: '流程监控' },
]

const systemSideItems = [
  { key: 'tenant', icon: <CloudServerOutlined />, label: '租户管理' },
  { key: 'org-data', icon: <TeamOutlined />, label: '人员主数据' },
  { key: 'account', icon: <UserSwitchOutlined />, label: '账号管理' },
  { key: 'sso', icon: <SafetyCertificateOutlined />, label: 'SSO配置' },
  { key: 'dict', icon: <BookOutlined />, label: '字典管理' },
]

// 流程定义
const processDefs = [
  { key: 'contract_approval', name: '合同审批流程', version: 'v3', nodes: 5, status: '已启用', apps: '合同审批系统', tenantId: 'T001' },
  { key: 'vehicle_dispatch', name: '车辆调度确认流程', version: 'v2', nodes: 3, status: '已启用', apps: '车辆调度平台', tenantId: 'T001' },
  { key: 'supplier_qualify', name: '供应商资质审核流程', version: 'v1', nodes: 4, status: '草稿', apps: '供应商门户', tenantId: 'T002' },
  { key: 'purchase_order', name: '采购下单审批流程', version: 'v5', nodes: 6, status: '已启用', apps: '合同审批系统', tenantId: 'T003' },
]

// 表单定义
const formDefs = [
  { key: 'f1', name: '合同录入表单', version: 'v2', fields: 18, status: '已发布', apps: '合同审批系统', tenantId: 'T001' },
  { key: 'f2', name: '车辆调度单', version: 'v1', fields: 12, status: '已发布', apps: '车辆调度平台', tenantId: 'T001' },
  { key: 'f3', name: '供应商注册表', version: 'v3', fields: 24, status: '草稿', apps: '供应商门户', tenantId: 'T002' },
  { key: 'f4', name: '采购申请单', version: 'v1', fields: 9, status: '已发布', apps: '合同审批系统', tenantId: 'T003' },
]

// 实体定义
const entityDefs = [
  { key: 'e1', name: 'Contract 合同', table: 'biz_contract', fields: 32, status: '已同步', apps: '合同审批系统', tenantId: 'T001' },
  { key: 'e2', name: 'Vehicle 车辆', table: 'biz_vehicle', fields: 26, status: '已同步', apps: '车辆调度平台', tenantId: 'T001' },
  { key: 'e3', name: 'Supplier 供应商', table: 'biz_supplier', fields: 41, status: '已同步', apps: '供应商门户', tenantId: 'T002' },
  { key: 'e4', name: 'PurchaseOrder 采购单', table: 'biz_purchase_order', fields: 28, status: '待同步', apps: '合同审批系统', tenantId: 'T003' },
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

// org key -> title 映射（用于展示）
const orgKeyTitleMap: Record<string, string> = {}
const buildTitleMap = (nodes: OrgNode[]) => {
  for (const n of nodes) { orgKeyTitleMap[n.key] = n.title; if (n.children) buildTitleMap(n.children) }
}
buildTitleMap(orgTree)

// org key -> 完整部门路径（父标题-当前标题，用于匹配人员 dept）
const orgPathMap: Record<string, string> = {}
const buildPathMap = (nodes: OrgNode[], parent: string) => {
  for (const n of nodes) {
    const path = parent ? parent + '-' + n.title : n.title
    orgPathMap[n.key] = path
    if (n.children) buildPathMap(n.children, path)
  }
}
buildPathMap(orgTree, '')

// 根据关联组织统计用户数（去重）
const countUsersByOrgs = (orgIds: string[]): number => {
  const matched = new Set<string>()
  for (const p of seedPersons) {
    for (const oid of orgIds) {
      const path = orgPathMap[oid]
      if (path && p.dept.includes(path)) { matched.add(p.key); break }
    }
  }
  return matched.size
}

// 组织树按部门名称过滤（保留匹配节点及其祖先链与子树）
const filterOrgTree = (nodes: OrgNode[], q: string): OrgNode[] => {
  if (!q) return nodes
  const lower = q.toLowerCase()
  const walk = (list: OrgNode[]): OrgNode[] => {
    const result: OrgNode[] = []
    for (const n of list) {
      const selfMatch = n.title.toLowerCase().includes(lower)
      const children = n.children ? walk(n.children) : []
      if (selfMatch) {
        result.push({ ...n, children: n.children })
      } else if (children.length > 0) {
        result.push({ ...n, children })
      }
    }
    return result
  }
  return walk(nodes)
}

const collectOrgKeys = (nodes: OrgNode[]): string[] => {
  const keys: string[] = []
  const walk = (list: OrgNode[]) => {
    for (const n of list) {
      keys.push(n.key)
      if (n.children) walk(n.children)
    }
  }
  walk(nodes)
  return keys
}

export default function Admin({ section = 'process' }: { section?: 'process' | 'system' }) {
  const { message } = AntdApp.useApp()
  const [searchParams] = useSearchParams()
  const active = searchParams.get('tab') || (section === 'process' ? 'process-design' : 'tenant')
  const currentTenantId = useAppStore((s) => s.currentTenantId)

  useEffect(() => {
    setDesigningItem(null)
    setOrgSearch('')
    setSelectedDept(null)
  }, [section])
  const [tenants, setTenants] = useState<Tenant[]>(seedTenants.map((t) => ({ ...t })))
  const [tenantDrawer, setTenantDrawer] = useState<{ open: boolean; editing: Tenant | null }>({ open: false, editing: null })
  const [tenantForm] = Form.useForm()
  const [tenantOrgChecked, setTenantOrgChecked] = useState<string[]>([])
  const [designingItem, setDesigningItem] = useState<{ type: string; name: string } | null>(null)
  const [orgSearch, setOrgSearch] = useState('')
  const [selectedDept, setSelectedDept] = useState<string | null>(null)
  const [orgTreeSearch, setOrgTreeSearch] = useState('')
  const [orgExpandedKeys, setOrgExpandedKeys] = useState<string[] | undefined>(undefined)
  const [dictCats, setDictCats] = useState<DictCategory[]>(seedCats.map((c) => ({ ...c })))
  const [dictEntries, setDictEntries] = useState<DictItem[]>(seedItems.map((d) => ({ ...d })))
  const [activeCat, setActiveCat] = useState<string>('business_domain')
  const [catDrawer, setCatDrawer] = useState<{ open: boolean; editing: DictCategory | null }>({ open: false, editing: null })
  const [itemDrawer, setItemDrawer] = useState<{ open: boolean; editing: DictItem | null }>({ open: false, editing: null })
  const [catForm] = Form.useForm()
  const [itemForm] = Form.useForm()
  const [accounts, setAccounts] = useState<Account[]>(seedAccounts.map((a) => ({ ...a })))
  const [acctSearch, setAcctSearch] = useState('')
  const [acctStatus, setAcctStatus] = useState<'all' | 'enabled' | 'disabled'>('all')
 const [pwdModal, setPwdModal] = useState<{ open: boolean; account: Account | null; newPwd: string }>({ open: false, account: null, newPwd: '' })
  const [ssoConfig, setSsoConfig] = useState<SsoConfig>(() => readSsoConfig())

  const openTenantCreate = () => {
    setTenantDrawer({ open: true, editing: null })
    tenantForm.resetFields()
    tenantForm.setFieldsValue({ name: '', status: 'running' })
    setTenantOrgChecked([])
  }

  const openTenantEdit = (t: Tenant) => {
    setTenantDrawer({ open: true, editing: t })
    tenantForm.setFieldsValue({ name: t.name, status: t.status })
    setTenantOrgChecked(t.orgIds)
  }

  const saveTenant = () => {
    tenantForm.validateFields().then((v) => {
      const userCount = countUsersByOrgs(tenantOrgChecked)
      if (tenantDrawer.editing) {
        setTenants((prev) => prev.map((t) => t.id === tenantDrawer.editing!.id ? { ...t, name: v.name, status: v.status, orgIds: tenantOrgChecked, userCount } : t))
        message.success('租户信息已更新')
      } else {
        const seq = 'T' + String(Date.now()).slice(-6)
        setTenants((prev) => [...prev, { id: seq, name: v.name, code: seq, status: v.status, orgIds: tenantOrgChecked, userCount }])
        message.success('租户已创建')
      }
      setTenantDrawer((prev) => ({ ...prev, open: false }))
    })
  }


  const renderPanel = () => {
    switch (active) {
      case 'tenant':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>租户管理</h2>
              <Button type="primary" icon={<PlusOutlined />} onClick={openTenantCreate}>新建租户</Button>
            </div>
            <Card style={{ borderRadius: 12 }}>
              <Table
                rowKey="id"
                dataSource={tenants}
                pagination={false}
                size="middle"
                columns={[
                  { title: '名称', dataIndex: 'name', width: 140, render: (v: string) => <span style={{ fontWeight: 600 }}>{v}</span> },
                  { title: '编码', dataIndex: 'code', width: 120, render: (v: string) => <code style={{ fontSize: 13 }}>{v}</code> },
                  { title: '状态', dataIndex: 'status', width: 80, render: (s: string, t: Tenant) => <Switch size="small" checked={s === 'running'} onChange={(on) => { setTenants((prev) => prev.map((x) => x.id === t.id ? { ...x, status: on ? 'running' : 'stopped' } : x)); message.success(`${t.name} 已${on ? '启用' : '停用'}`) }} /> },
                  { title: '用户数', dataIndex: 'userCount', width: 100 },
                  { title: '关联组织', dataIndex: 'orgIds', render: (ids: string[]) => (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {ids.map((oid) => <Tag key={oid}>{orgKeyTitleMap[oid] ?? oid}</Tag>)}
                    </div>
                  ) },
                  { title: '操作', width: 80, render: (_: unknown, t: Tenant) => (
                    <Button size="small" type="link" onClick={() => openTenantEdit(t)}>编辑</Button>
                  ) },
                ]}
              />
            </Card>
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
                    dataSource={processDefs.filter((p) => p.tenantId === currentTenantId)}
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
                    dataSource={formDefs.filter((f) => f.tenantId === currentTenantId)}
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
                    dataSource={entityDefs.filter((e) => e.tenantId === currentTenantId)}
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
        const filteredOrgTree = filterOrgTree(orgTree, orgTreeSearch)
        const effectiveOrgKeys = orgTreeSearch ? collectOrgKeys(filteredOrgTree) : (orgExpandedKeys ?? collectOrgKeys(filteredOrgTree))
        return (
          <div>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>人员组织</h2>
            </div>
            <Row gutter={16}>
              <Col span={6}>
                <Card style={{ borderRadius: 12 }} title="组织架构" size="small">
                  <Input.Search
                    placeholder="搜索部门名称"
                    allowClear
                    size="small"
                    style={{ marginBottom: 12 }}
                    value={orgTreeSearch}
                    onChange={(e) => setOrgTreeSearch(e.target.value)}
                  />
                  <Tree
                    treeData={filteredOrgTree}
                    expandedKeys={effectiveOrgKeys}
                    onExpand={(keys) => setOrgExpandedKeys(keys as string[])}
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
                      { title: '岗位', dataIndex: 'position', width: 120 },
                      { title: '手机', dataIndex: 'phone', width: 130 },
                      { title: '状态', dataIndex: 'status', width: 80, render: (s: string) => <Tag color={s === '在职' ? 'success' : s === '休假' ? 'warning' : 'default'}>{s}</Tag> },
                    ]}
                  />
                </Card>
              </Col>
            </Row>
          </div>
        )
      }
      case 'account': {
        const filteredAccounts = accounts.filter((a) => {
          const kw = acctSearch.trim().toLowerCase()
          const matchKw = !kw || a.name.toLowerCase().includes(kw) || a.username.toLowerCase().includes(kw)
          const matchStatus = acctStatus === 'all' ? true : acctStatus === 'enabled' ? a.enabled : !a.enabled
          return matchKw && matchStatus
        })
        const toggleAcct = (a: Account, on: boolean) => {
          setAccounts((p) => p.map((x) => (x.id === a.id ? { ...x, enabled: on } : x)))
          message.success(`${a.name} 已${on ? '启用' : '禁用'}`)
        }
        const resetPwd = (a: Account) => {
          const pwd = 'Init@' + Math.floor(100000 + Math.random() * 900000)
          setPwdModal({ open: true, account: a, newPwd: pwd })
        }
        const copyPwd = () => {
          try { navigator.clipboard?.writeText(pwdModal.newPwd) } catch { /* demo */ }
          message.success('临时密码已复制到剪贴板')
        }

        return (
          <div>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>账号管理</h2>
            </div>
            <Card style={{ borderRadius: 12 }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <Input.Search
                  placeholder="搜索姓名或账号"
                  allowClear
                  style={{ width: 280 }}
                  value={acctSearch}
                  onChange={(e) => setAcctSearch(e.target.value)}
                />
                <Select
                  style={{ width: 140 }}
                  value={acctStatus}
                  onChange={(v) => setAcctStatus(v)}
                  options={[
                    { value: 'all', label: '全部状态' },
                    { value: 'enabled', label: '已启用' },
                    { value: 'disabled', label: '已禁用' },
                  ]}
                />
              </div>
              <Table
                rowKey="id"
                dataSource={filteredAccounts}
                pagination={{ pageSize: 8 }}
                size="middle"
                columns={[
                  { title: '姓名', dataIndex: 'name', width: 100, render: (v: string) => <span style={{ fontWeight: 600 }}>{v}</span> },
                  { title: '账号', dataIndex: 'username', width: 110 },
                  { title: '部门', dataIndex: 'dept' },
                  { title: '职位', dataIndex: 'position', width: 120 },
                  { title: '启用', dataIndex: 'enabled', width: 80, render: (e: boolean, r: Account) => <Switch size="small" checked={e} onChange={(on) => toggleAcct(r, on)} /> },
                  { title: '最后登录', dataIndex: 'lastLoginAt', width: 150, render: (v: string) => v ? <span>{v}</span> : <span style={{ color: '#cbd5e1' }}>—</span> },
                  { title: '操作', width: 100, render: (_: unknown, r: Account) => (
                    <Button size="small" type="link" icon={<KeyOutlined />} onClick={() => resetPwd(r)}>密码重置</Button>
                  ) },
                ]}
              />
            </Card>

            <Modal
              title="密码重置"
              open={pwdModal.open}
              onCancel={() => setPwdModal((p) => ({ ...p, open: false }))}
              footer={[
                <Button key="copy" icon={<CopyOutlined />} onClick={copyPwd}>复制密码</Button>,
                <Button key="ok" type="primary" onClick={() => { setPwdModal((p) => ({ ...p, open: false })); message.success('密码已重置') }}>确认</Button>,
              ]}
            >
              {pwdModal.account && (
                <div>
                  <p style={{ marginBottom: 12 }}>已为 <b>{pwdModal.account.name}（{pwdModal.account.username}）</b> 重置密码，新临时密码如下：</p>
                  <div style={{ background: '#f1f5f9', borderRadius: 8, padding: '16px', textAlign: 'center', fontFamily: 'monospace', fontSize: 20, letterSpacing: 2, fontWeight: 700, color: '#2563eb' }}>
                    {pwdModal.newPwd}
                  </div>
                  <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 12 }}>请将密码告知用户，首次登录后请尽快修改。</p>
                </div>
              )}
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
      case 'sso': {
        const hints = regexToHints(ssoConfig.passwordRegex)
        const saveSsoConfig = () => {
          writeSsoConfig(ssoConfig)
          message.success('SSO 配置已保存')
        }
        return (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 0, marginBottom: 16 }}>SSO 配置</h2>
            <Card style={{ borderRadius: 12, maxWidth: 640 }}>
              <Form layout="vertical">
                <Form.Item label="令牌有效期（秒）">
                  <InputNumber min={60} style={{ width: '100%' }} value={ssoConfig.tokenExpiry} onChange={(v) => setSsoConfig((p) => ({ ...p, tokenExpiry: Number(v) || 60 }))} />
                </Form.Item>
                <Form.Item label="密码规则（正则表达式）" extra={<span style={{ fontSize: 12, color: '#64748b' }}>规则转译：{hints.join('；')}</span>}>
                  <Input value={ssoConfig.passwordRegex} onChange={(e) => setSsoConfig((p) => ({ ...p, passwordRegex: e.target.value }))} placeholder="例如：^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,20}$" />
                </Form.Item>
                <Form.Item label="密码有效期（月）">
                  <InputNumber min={1} style={{ width: '100%' }} value={ssoConfig.passwordExpiryMonths} onChange={(v) => setSsoConfig((p) => ({ ...p, passwordExpiryMonths: Number(v) || 1 }))} />
                </Form.Item>
                <Button type="primary" onClick={saveSsoConfig}>保存配置</Button>
              </Form>
              <div style={{ marginTop: 16, padding: 12, background: '#f8fafc', borderRadius: 8, fontSize: 12, color: '#64748b', lineHeight: 1.8 }}>
                <div style={{ fontWeight: 600, color: '#475569', marginBottom: 4 }}>规则说明（用户可读）</div>
                {hints.map((h) => (
                  <div key={h}>· {h}</div>
                ))}
                <div style={{ marginTop: 4 }}>该规则将同步至登录页「修改密码」，用户改密时实时校验。</div>
              </div>
            </Card>
          </div>
        )
      }
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
      case 'dict': {
        const colorOptions = [
          { value: '#2563eb', label: '蓝色' }, { value: '#0891b2', label: '青色' }, { value: '#7c3aed', label: '紫色' },
          { value: '#e11d48', label: '玫红' }, { value: '#ea580c', label: '橙色' }, { value: '#16a34a', label: '绿色' },
          { value: '#9333ea', label: '紫红' }, { value: '#0d9488', label: '蓝绿' }, { value: '#4f46e5', label: '靛蓝' },
          { value: '#64748b', label: '灰色' },
        ]
        const currentCat = dictCats.find((c) => c.code === activeCat)
        const currentItems = dictEntries.filter((d) => d.categoryCode === activeCat).sort((a, b) => a.sort - b.sort)
        const isDomainCat = activeCat === 'business_domain'

        // 分类操作
        const openCatCreate = () => { setCatDrawer({ open: true, editing: null }); catForm.resetFields(); catForm.setFieldsValue({ code: '', name: '', description: '' }) }
        const openCatEdit = (c: DictCategory) => { setCatDrawer({ open: true, editing: c }); catForm.setFieldsValue(c) }
        const saveCat = () => {
          catForm.validateFields().then((v) => {
            if (catDrawer.editing) {
              setDictCats((p) => p.map((c) => (c.key === catDrawer.editing!.key ? { ...c, ...v } : c)))
              message.success('字典分类已更新')
            } else {
              const key = `cat-${v.code}`
              setDictCats((p) => [...p, { ...v, key }])
              message.success('字典分类已创建')
            }
            setCatDrawer((p) => ({ ...p, open: false }))
          })
        }

        // 条目操作
        const openItemCreate = () => { setItemDrawer({ open: true, editing: null }); itemForm.resetFields(); itemForm.setFieldsValue({ sort: currentItems.length + 1, enabled: true }) }
        const openItemEdit = (d: DictItem) => { setItemDrawer({ open: true, editing: d }); itemForm.setFieldsValue(d) }
        const saveItem = () => {
          itemForm.validateFields().then((v) => {
            if (itemDrawer.editing) {
              setDictEntries((p) => p.map((d) => (d.key === itemDrawer.editing!.key ? { ...d, ...v, categoryCode: activeCat } : d)))
              message.success('字典条目已更新')
            } else {
              const key = `${activeCat}-${v.value}-${Date.now().toString(36)}`
              setDictEntries((p) => [...p, { ...v, key, categoryCode: activeCat }])
              message.success('字典条目已创建')
            }
            setItemDrawer((p) => ({ ...p, open: false }))
          })
        }

        const itemColumns = isDomainCat
          ? [
              { title: '标识颜色', dataIndex: 'color', width: 100, render: (c: string) => <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: '50%', background: c, display: 'inline-block' }} />{c}</span> },
              { title: '名称', dataIndex: 'label', width: 120 },
              { title: '字典值', dataIndex: 'value', width: 100, render: (v: string) => <code style={{ fontSize: 13 }}>{v}</code> },
              { title: '描述', dataIndex: 'description' },
              { title: '排序', dataIndex: 'sort', width: 70 },
              { title: '操作', width: 80, render: (_: unknown, r: DictItem) => <Button size="small" type="link" onClick={() => openItemEdit(r)}>编辑</Button> },
            ]
          : [
              { title: '名称', dataIndex: 'label', width: 140 },
              { title: '字典值', dataIndex: 'value', width: 120, render: (v: string) => <code style={{ fontSize: 13 }}>{v}</code> },
              { title: '排序', dataIndex: 'sort', width: 70 },
              { title: '启用', dataIndex: 'enabled', width: 80, render: (e: boolean) => <Switch size="small" checked={e} onChange={() => message.info('切换状态（演示）')} /> },
              { title: '操作', width: 80, render: (_: unknown, r: DictItem) => <Button size="small" type="link" onClick={() => openItemEdit(r)}>编辑</Button> },
            ]

        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>字典管理</h2>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>分类+字典形式管理全局枚举数据，业务领域等配置统一在此维护</span>
              </div>
            </div>
            <Row gutter={16}>
              {/* 左侧：字典分类 */}
              <Col span={7}>
                <Card style={{ borderRadius: 12 }} size="small" title={<span style={{ fontSize: 14 }}>字典分类</span>} extra={<Button size="small" type="text" icon={<PlusOutlined />} onClick={openCatCreate} />}>
                  <List
                    dataSource={dictCats}
                    renderItem={(c) => (
                      <List.Item
                        style={{ cursor: 'pointer', background: activeCat === c.code ? '#eaf1ff' : 'transparent', borderRadius: 8, padding: '10px 12px', border: 'none' }}
                        onClick={() => setActiveCat(c.code)}
                        actions={[<Button key="e" size="small" type="link" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); openCatEdit(c) }} />]}
                      >
                        <div>
                          <div style={{ fontSize: 14, fontWeight: activeCat === c.code ? 600 : 500, color: activeCat === c.code ? '#2563eb' : '#0f172a' }}>{c.name}</div>
                          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{c.description}</div>
                        </div>
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
              {/* 右侧：字典条目 */}
              <Col span={17}>
                <Card style={{ borderRadius: 12 }} size="small" title={<span style={{ fontSize: 14 }}>{currentCat?.name ?? '字典'} 条目</span>} extra={<Button size="small" type="primary" icon={<PlusOutlined />} onClick={openItemCreate}>新建条目</Button>}>
                  <Table rowKey="key" dataSource={currentItems} pagination={false} size="middle" columns={itemColumns} />
                </Card>
              </Col>
            </Row>

            {/* 分类抽屉 */}
            <Drawer title={catDrawer.editing ? '编辑分类' : '新建分类'} open={catDrawer.open} onClose={() => setCatDrawer((p) => ({ ...p, open: false }))} width={420} footer={
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Button onClick={() => setCatDrawer((p) => ({ ...p, open: false }))}>取消</Button>
                <Button type="primary" onClick={saveCat}>保存</Button>
              </div>
            }>
              <Form form={catForm} layout="vertical">
                <Form.Item label="分类名称" name="name" rules={[{ required: true, message: '请输入分类名称' }]}>
                  <Input placeholder="例如：业务领域" maxLength={20} showCount />
                </Form.Item>
                <Form.Item label="分类编码" name="code" rules={[{ required: true, message: '请输入分类编码' }]} extra={<span style={{ fontSize: 12, color: '#94a3b8' }}>英文编码，如 business_domain</span>}>
                  <Input placeholder="例如：business_domain" disabled={!!catDrawer.editing} />
                </Form.Item>
                <Form.Item label="分类描述" name="description">
                  <Input.TextArea placeholder="该分类的用途说明" rows={2} maxLength={80} showCount />
                </Form.Item>
              </Form>
            </Drawer>

            {/* 条目抽屉 */}
            <Drawer title={itemDrawer.editing ? '编辑条目' : '新建条目'} open={itemDrawer.open} onClose={() => setItemDrawer((p) => ({ ...p, open: false }))} width={420} footer={
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Button onClick={() => setItemDrawer((p) => ({ ...p, open: false }))}>取消</Button>
                <Button type="primary" onClick={saveItem}>保存</Button>
              </div>
            }>
              <Form form={itemForm} layout="vertical">
                <Form.Item label="名称" name="label" rules={[{ required: true, message: '请输入名称' }]}>
                  <Input placeholder="例如：研发" maxLength={20} showCount />
                </Form.Item>
                <Form.Item label="字典值" name="value" rules={[{ required: true, message: '请输入字典值' }]} extra={<span style={{ fontSize: 12, color: '#94a3b8' }}>唯一标识，如 rd</span>}>
                  <Input placeholder="例如：rd" />
                </Form.Item>
                {isDomainCat && (
                  <>
                    <Form.Item label="标识颜色" name="color">
                      <Select options={colorOptions} style={{ width: 140 }} />
                    </Form.Item>
                    <Form.Item label="描述" name="description">
                      <Input.TextArea placeholder="用途与范围说明" rows={2} maxLength={80} showCount />
                    </Form.Item>
                  </>
                )}
                <Form.Item label="排序" name="sort">
                  <Input type="number" />
                </Form.Item>
                {!isDomainCat && (
                  <Form.Item label="启用" name="enabled" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                )}
              </Form>
            </Drawer>
          </div>
        )
      }
      default:
        return <Empty />
    }
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <Content>
        <div style={{ padding: '20px 24px 40px' }}>
          {renderPanel()}
        </div>
      </Content>

      <Drawer
        title={tenantDrawer.editing ? '编辑租户' : '新建租户'}
        open={tenantDrawer.open}
        onClose={() => setTenantDrawer((p) => ({ ...p, open: false }))}
        width={520}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setTenantDrawer((p) => ({ ...p, open: false }))}>取消</Button>
            <Button type="primary" onClick={saveTenant}>保存</Button>
          </div>
        }
      >
        <Form form={tenantForm} layout="vertical">
          <Form.Item label="租户名称" name="name" rules={[{ required: true, message: '请输入租户名称' }]}>
            <Input placeholder="请输入租户名称" maxLength={20} showCount />
          </Form.Item>
          <Form.Item label="租户编码" extra={<span style={{ fontSize: 12, color: '#94a3b8' }}>系统自动生成，唯一值</span>}>
            <Input value={tenantDrawer.editing ? tenantDrawer.editing.code : '保存后自动生成'} disabled />
          </Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true }]}>
            <Select options={[{ value: 'running', label: '运行中' }, { value: 'stopped', label: '已停用' }]} />
          </Form.Item>
          <Form.Item label="关联组织" required>
            <div style={{ border: '1px solid #d9d9d9', borderRadius: 8, padding: 12, maxHeight: 280, overflow: 'auto' }}>
              <Tree
                checkable
                treeData={orgTree}
                checkedKeys={tenantOrgChecked}
                onCheck={(keys) => setTenantOrgChecked(keys as string[])}
                style={{ fontSize: 13 }}
              />
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>
              可选范围来自人员组织数据，支持多选。用户数将自动统计为所关联组织的全部人员数。
            </div>
          </Form.Item>
          <div style={{ background: '#f1f5f9', borderRadius: 8, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#64748b' }}>关联用户数（自动统计）</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#2563eb' }}>{countUsersByOrgs(tenantOrgChecked)}</span>
          </div>
        </Form>
      </Drawer>
    </Layout>
  )
}
