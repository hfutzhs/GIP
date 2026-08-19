import { Tag, Tooltip } from 'antd'
import { CheckOutlined } from '@ant-design/icons'
import type { CapabilityKey } from '@/types'
import { capabilityMap } from '@/mock/capabilities'

// 能力勾选标签：✅ SSO 形式
export function CapabilityCheckedTag({ capKey }: { capKey: CapabilityKey }) {
  const c = capabilityMap[capKey]
  if (!c) return null
  return (
    <Tooltip title={c.description}>
      <Tag color="blue" style={{ borderRadius: 4, margin: 2 }}>
        <CheckOutlined style={{ color: '#10b981', marginRight: 2 }} />
        {c.shortName}
      </Tag>
    </Tooltip>
  )
}

// 能力名标签（不带勾，用于卡片展示）
export function CapabilityNameTag({ capKey, checked }: { capKey: CapabilityKey; checked?: boolean }) {
  const c = capabilityMap[capKey]
  if (!c) return null
  return (
    <Tag
      style={{
        borderRadius: 4,
        margin: 2,
        color: checked ? c.color : '#94a3b8',
        borderColor: checked ? c.color : '#e2e8f0',
        background: checked ? `${c.color}14` : '#f8fafc',
      }}
    >
      {checked && <CheckOutlined style={{ marginRight: 2 }} />}
      {c.shortName}
    </Tag>
  )
}