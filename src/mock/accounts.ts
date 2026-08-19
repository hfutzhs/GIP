// 账号管理 — 数据对接人员组织数据
export interface Account {
  id: string
  username: string       // 登录账号（工号）
  nickname: string       // 昵称（对接人员姓名）
  empNo: string          // 工号（关联人员组织数据）
  name: string           // 人员姓名
  dept: string           // 所属部门
  position: string       // 职位
  phone: string          // 手机
  tenantId: string       // 所属租户
  enabled: boolean       // 启用/禁用
  role: string           // 角色
  lastLoginAt?: string   // 最后登录时间
  createdAt: string      // 创建时间
}

export const accounts: Account[] = [
  { id: 'a1', username: 'BAIC001', nickname: '张松', empNo: 'BAIC001', name: '张松', dept: '北汽股份-营销中心', position: '营销总监', phone: '138****1001', tenantId: 'T001', enabled: true, role: '租户管理员', lastLoginAt: '2026-08-18 09:12', createdAt: '2026-01-15' },
  { id: 'a2', username: 'BAIC002', nickname: '陈伟', empNo: 'BAIC002', name: '陈伟', dept: '北汽股份-研发中心', position: '高级工程师', phone: '138****1002', tenantId: 'T001', enabled: true, role: '应用管理员', lastLoginAt: '2026-08-17 14:30', createdAt: '2026-02-01' },
  { id: 'a3', username: 'BAIC003', nickname: '李娜', empNo: 'BAIC003', name: '李娜', dept: '北汽股份-财务部', position: '财务经理', phone: '138****1003', tenantId: 'T001', enabled: true, role: '普通用户', lastLoginAt: '2026-08-18 10:05', createdAt: '2026-02-10' },
  { id: 'a4', username: 'BAIC004', nickname: '小芳', empNo: 'BAIC004', name: '王芳', dept: '北汽福田-销售部', position: '销售主管', phone: '138****1004', tenantId: 'T002', enabled: true, role: '租户管理员', lastLoginAt: '2026-08-16 16:20', createdAt: '2026-03-01' },
  { id: 'a5', username: 'BAIC005', nickname: '刘洋', empNo: 'BAIC005', name: '刘洋', dept: '北汽福田-服务部', position: '服务专员', phone: '138****1005', tenantId: 'T002', enabled: false, role: '普通用户', createdAt: '2026-03-15' },
  { id: 'a6', username: 'BAIC006', nickname: '赵强', empNo: 'BAIC006', name: '赵强', dept: '北京奔驰-销售部', position: '区域经理', phone: '138****1006', tenantId: 'T003', enabled: true, role: '应用管理员', lastLoginAt: '2026-08-18 08:40', createdAt: '2026-04-01' },
  { id: 'a7', username: 'BAIC007', nickname: '周杰', empNo: 'BAIC007', name: '周杰', dept: '北京奔驰-生产部', position: '生产主管', phone: '138****1007', tenantId: 'T003', enabled: true, role: '普通用户', lastLoginAt: '2026-08-15 11:30', createdAt: '2026-04-10' },
  { id: 'a8', username: 'BAIC008', nickname: '孙丽', empNo: 'BAIC008', name: '孙丽', dept: '北汽股份-人力资源部', position: 'HRBP', phone: '138****1008', tenantId: 'T001', enabled: true, role: '平台管理员', lastLoginAt: '2026-08-18 07:55', createdAt: '2026-01-20' },
  { id: 'a9', username: 'BAIC009', nickname: '吴磊', empNo: 'BAIC009', name: '吴磊', dept: '北汽股份-营销中心', position: '市场专员', phone: '138****1009', tenantId: 'T001', enabled: false, role: '普通用户', createdAt: '2026-05-01' },
  { id: 'a10', username: 'BAIC010', nickname: '郑敏', empNo: 'BAIC010', name: '郑敏', dept: '北汽福田-销售部', position: '销售顾问', phone: '138****1010', tenantId: 'T002', enabled: true, role: '普通用户', lastLoginAt: '2026-08-17 09:00', createdAt: '2026-05-15' },
]
