import { useState } from 'react'
import LoginBackground from './LoginBackground'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Drawer, Typography, App as AntdApp } from 'antd'
import { UserOutlined, LockOutlined, KeyOutlined, CheckCircleFilled, MinusCircleOutlined } from '@ant-design/icons'
import { accounts } from '@/mock/accounts'
import { readSsoConfig, regexToHints, validatePassword, ruleSatisfied, getPassword, setPassword } from '@/shared/passwordRule'

const { Title, Text, Paragraph } = Typography

export default function Login() {
  const navigate = useNavigate()
  const { message } = AntdApp.useApp()
  const [form] = Form.useForm()
  const [pwdForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [newPwd, setNewPwd] = useState('')

  const cfg = readSsoConfig()
  const hints = regexToHints(cfg.passwordRegex)

  const handleLogin = () => {
    const username = (form.getFieldValue('username') || '').trim()
    const password = form.getFieldValue('password') || ''
    if (!username) { message.warning('请输入账号'); return }
    if (!password) { message.warning('请输入密码'); return }
    setLoading(true)
    const acct = accounts.find((a) => a.username === username || a.empNo === username)
    if (!acct) { message.error('账号不存在'); setLoading(false); return }
    if (!acct.enabled) { message.error('该账号已禁用，请联系管理员'); setLoading(false); return }
    if (getPassword(acct.username) !== password) { message.error('账号或密码错误'); setLoading(false); return }
    try { localStorage.setItem('gip_login_user', acct.username) } catch { /* ignore */ }
    message.success(`欢迎回来，${acct.name}`)
    setLoading(false)
    navigate('/apps')
  }

  const openChangePwd = () => {
    setNewPwd('')
    pwdForm.resetFields()
    pwdForm.setFieldsValue({ username: form.getFieldValue('username') || '' })
    setDrawerOpen(true)
  }

  const submitChangePwd = () => {
    const v = pwdForm.getFieldsValue()
    const username = (v.username || '').trim()
    const oldPwd = v.oldPassword || ''
    const np = v.newPassword || ''
    const confirm = v.confirmPassword || ''
    if (!username) { message.warning('请输入账号'); return }
    const acct = accounts.find((a) => a.username === username || a.empNo === username)
    if (!acct) { message.error('账号不存在'); return }
    if (!acct.enabled) { message.error('该账号已禁用'); return }
    if (getPassword(acct.username) !== oldPwd) { message.error('旧密码不正确'); return }
    if (!validatePassword(np, cfg.passwordRegex)) { message.error('新密码不符合规则'); return }
    if (np !== confirm) { message.error('两次输入的新密码不一致'); return }
    setPassword(acct.username, np)
    message.success('密码修改成功，请使用新密码登录')
    setDrawerOpen(false)
    form.setFieldValue('password', '')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f5f7fa' }}>
      <style>{`@media (max-width: 900px){ .login-brand{ display:none !important; } }`}</style>
      {/* 左侧品牌区 */}
      <div
        style={{
          flex: '1.1',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #0b1f4d 0%, #1d3a8a 45%, #0e7490 100%)',
        }}
        className="login-brand"
      >
        <LoginBackground />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.12, backgroundImage: 'radial-gradient(circle at 20% 30%, #38bdf8 0, transparent 40%), radial-gradient(circle at 80% 70%, #818cf8 0, transparent 45%)' }} />
        <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '56px 64px', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #38bdf8 0%, #06b6d4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 20 }}>光</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 1 }}>光粒 AI 平台</div>
              <div style={{ fontSize: 12, opacity: 0.7, letterSpacing: 2 }}>BAIC · GIP</div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 12, letterSpacing: 1 }}>北汽集团统一身份认证</div>
            <div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.3, marginBottom: 16 }}>一个账号<br />通行全集团业务</div>
            <div style={{ fontSize: 15, opacity: 0.85, lineHeight: 1.9, maxWidth: 380 }}>
              沉淀单点登录、权限、组织人员、租户、流程、待办、通知等通用能力，
              单应用节省工时 300 人天，降低成本 30%，提效 20%。
            </div>
          </div>
          <div style={{ display: 'flex', gap: 32, fontSize: 13, opacity: 0.8 }}>
            <div><div style={{ fontSize: 22, fontWeight: 800 }}>300<span style={{ fontSize: 13, fontWeight: 500, marginLeft: 2 }}>人天</span></div><div style={{ opacity: 0.6 }}>单应用节省工时</div></div>
            <div><div style={{ fontSize: 22, fontWeight: 800 }}>30<span style={{ fontSize: 13, fontWeight: 500, marginLeft: 1 }}>%</span></div><div style={{ opacity: 0.6 }}>降低成本</div></div>
            <div><div style={{ fontSize: 22, fontWeight: 800 }}>20<span style={{ fontSize: 13, fontWeight: 500, marginLeft: 1 }}>%</span></div><div style={{ opacity: 0.6 }}>研发提效</div></div>
          </div>
        </div>
      </div>

      {/* 右侧登录区 */}
      <div style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ marginBottom: 32 }}>
            <Title level={3} style={{ marginBottom: 6, fontWeight: 700 }}>账号登录</Title>
            <Text type="secondary">北汽集团统一身份认证服务</Text>
          </div>
          <Form form={form} layout="vertical" size="large" onFinish={handleLogin}>
            <Form.Item name="username" label="账号">
              <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} placeholder="请输入工号 / 账号" autoComplete="username" />
            </Form.Item>
            <Form.Item name="password" label="密码">
              <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="请输入密码" autoComplete="current-password" />
            </Form.Item>
            <Form.Item style={{ marginBottom: 16 }}>
              <Button type="primary" htmlType="submit" block loading={loading} style={{ height: 44, fontWeight: 600 }}>登录</Button>
            </Form.Item>
          </Form>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button type="link" icon={<KeyOutlined />} style={{ padding: 0, height: 'auto' }} onClick={openChangePwd}>修改密码</Button>
          </div>
          <div style={{ marginTop: 24, padding: '10px 12px', background: '#f1f5f9', borderRadius: 8, fontSize: 12, color: '#64748b' }}>
            演示账号：<b style={{ color: '#475569' }}>BAIC001</b>　默认密码：<b style={{ color: '#475569' }}>Baic1234</b>
          </div>
        </div>
      </div>

      {/* 修改密码抽屉 */}
      <Drawer
        title="修改密码"
        width={520}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button style={{ marginRight: 8 }} onClick={() => setDrawerOpen(false)}>取消</Button>
            <Button type="primary" onClick={submitChangePwd}>确认修改</Button>
          </div>
        }
      >
        <Paragraph type="secondary" style={{ fontSize: 13, marginTop: 0 }}>
          请输入旧密码进行确认，并设置符合后台规则的新密码。当前密码有效期 {cfg.passwordExpiryMonths} 个月。
        </Paragraph>
        <Form form={pwdForm} layout="vertical">
          <Form.Item name="username" label="账号">
            <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} placeholder="请输入工号 / 账号" />
          </Form.Item>
          <Form.Item name="oldPassword" label="旧密码">
            <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="请输入当前密码" />
          </Form.Item>
          <Form.Item name="newPassword" label="新密码">
            <Input.Password prefix={<KeyOutlined style={{ color: '#94a3b8' }} />} placeholder="请输入新密码" onChange={(e) => setNewPwd(e.target.value)} />
          </Form.Item>
          <div style={{ margin: '-4px 0 18px', padding: '12px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 12, color: '#475569', fontWeight: 600, marginBottom: 8 }}>密码规则</div>
            {hints.map((h) => {
              const ok = ruleSatisfied(h, cfg.passwordRegex, newPwd)
              return (
                <div key={h} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: ok ? '#16a34a' : '#94a3b8', marginBottom: 4, transition: 'color .2s' }}>
                  {ok ? <CheckCircleFilled style={{ color: '#16a34a' }} /> : <MinusCircleOutlined style={{ color: '#cbd5e1' }} />}
                  <span>{h}</span>
                </div>
              )
            })}
          </div>
          <Form.Item name="confirmPassword" label="确认新密码">
            <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="请再次输入新密码" />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  )
}
