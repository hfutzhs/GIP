import type { Department, User, CurrentUser } from '@/types'

// 组织部门树
export const departments: Department[] = [
  {
    key: 'D001',
    title: '北汽股份-总部',
    children: [
      { key: 'D002', title: '技术研发中心', children: [{ key: 'D021', title: '架构组' }, { key: 'D022', title: '前端组' }] },
      { key: 'D003', title: '采购管理部' },
      { key: 'D004', title: '财务管理部' },
      { key: 'D005', title: '法务合规部' },
    ],
  },
  { key: 'D006', title: '北汽福田', children: [{ key: 'D061', title: '生产运营部' }, { key: 'D062', title: '销售部' }] },
]

// 人员列表
export const users: User[] = [
  { id: 'U001', name: '张松', department: '技术研发中心', position: '高级工程师', avatar: '张', email: 'zhangsong@baic.com', phone: '138****1024' },
  { id: 'U002', name: '李娜', department: '采购管理部', position: '采购经理', avatar: '李', email: 'lina@baic.com', phone: '139****5566' },
  { id: 'U003', name: '王强', department: '财务管理部', position: '财务主管', avatar: '王', email: 'wangqiang@baic.com', phone: '137****7788' },
  { id: 'U004', name: '赵敏', department: '法务合规部', position: '法务专员', avatar: '赵', email: 'zhaomin@baic.com', phone: '136****3344' },
  { id: 'U005', name: '陈伟', department: '技术研发中心', position: '架构师', avatar: '陈', email: 'chenwei@baic.com', phone: '135****9988' },
  { id: 'U006', name: '刘洋', department: '技术研发中心', position: '前端工程师', avatar: '刘', email: 'liuyang@baic.com', phone: '134****1122' },
  { id: 'U007', name: '孙莉', department: '采购管理部', position: '采购专员', avatar: '孙', email: 'sunli@baic.com', phone: '133****4455' },
  { id: 'U008', name: '周杰', department: '北汽福田-生产运营部', position: '运营总监', avatar: '周', email: 'zhoujie@baic.com', phone: '132****6677' },
]

export const userMap: Record<string, User> = users.reduce(
  (acc, u) => {
    acc[u.id] = u
    return acc
  },
  {} as Record<string, User>,
)

// 当前登录用户（演示态：SSO 继承的登录身份）
export const currentUser: CurrentUser = {
  id: 'U001',
  name: '张松',
  department: '技术研发中心',
  position: '高级工程师',
  tenantName: '北汽股份',
  avatar: '张',
}