import type { Message } from '@/types'

// 消息通知（工作台顶部消息图标展示）
export const messages: Message[] = [
  {
    id: 'M001',
    title: '发动机总成采购合同 审批通过',
    content: '你提交的「发动机总成采购合同」已通过全部审批节点，可进入签署环节。',
    appCode: 'contract-approval',
    type: 'approval',
    read: false,
    createdAt: '2026-07-31 09:05',
  },
  {
    id: 'M002',
    title: '系统维护通知',
    content: '工作台将于今晚 23:00-次日 01:00 进行例行维护，期间部分能力可能短暂不可用。',
    appCode: 'system',
    type: 'notice',
    read: false,
    createdAt: '2026-07-31 08:00',
  },
  {
    id: 'M003',
    title: '软件开发外包合同 审批通过',
    content: '「软件开发外包合同」已审批通过。',
    appCode: 'contract-approval',
    type: 'approval',
    read: true,
    createdAt: '2026-07-30 17:20',
  },
]