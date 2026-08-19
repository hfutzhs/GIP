import { Tag } from 'antd'
import type { AppStatus, ContractStatus, ApiApprovalStatus } from '@/types'

const appStatusMap: Record<AppStatus, { color: string; text: string }> = {
  published: { color: 'success', text: '已发布' },
  developing: { color: 'processing', text: '开发中' },
  draft: { color: 'default', text: '草稿' },
}

export function AppStatusTag({ status }: { status: AppStatus }) {
  const c = appStatusMap[status]
  return <Tag color={c.color} style={{ borderRadius: 4, margin: 0 }}>{c.text}</Tag>
}

const contractStatusMap: Record<ContractStatus, { color: string; text: string }> = {
  pending: { color: 'warning', text: '待审批' },
  approved: { color: 'success', text: '已通过' },
  rejected: { color: 'error', text: '已驳回' },
}

export function ContractStatusTag({ status }: { status: ContractStatus }) {
  const c = contractStatusMap[status]
  return <Tag color={c.color} style={{ borderRadius: 4, margin: 0 }}>{c.text}</Tag>
}

const apiStatusMap: Record<ApiApprovalStatus, { color: string; text: string }> = {
  approved: { color: 'success', text: '已批准' },
  pending: { color: 'warning', text: '待审批' },
  none: { color: 'default', text: '未申请' },
}

export function ApiStatusTag({ status }: { status: ApiApprovalStatus }) {
  const c = apiStatusMap[status]
  return <Tag color={c.color} style={{ borderRadius: 4, margin: 0 }}>{c.text}</Tag>
}