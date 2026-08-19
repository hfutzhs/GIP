import { useState, useEffect, useRef, useCallback } from 'react'
import { Button, Input, Tag, Avatar } from 'antd'
import { RobotOutlined, CloseOutlined, ThunderboltFilled, SearchOutlined, AimOutlined, SafetyCertificateOutlined, EditOutlined, SendOutlined } from '@ant-design/icons'

interface Agent {
  id: string
  name: string
  role: string
  ability: string
  color: string
  icon: React.ReactNode
}

const agents: Agent[] = [
  { id: 'nova', name: 'Nova', role: '总指挥', ability: '经营摘要、战略执行追踪、综合调度', color: '#6366f1', icon: <ThunderboltFilled /> },
  { id: 'insight', name: 'Insight', role: '数据洞察', ability: '数据下钻、区域分析、趋势解读', color: '#06b6d4', icon: <SearchOutlined /> },
  { id: 'scout', name: 'Scout', role: '线索猎手', ability: '线索转化、商机分析、漏斗诊断', color: '#10b981', icon: <AimOutlined /> },
  { id: 'guard', name: 'Guard', role: '风控合规', ability: '风险预警、账期监控、合规检查', color: '#f59e0b', icon: <SafetyCertificateOutlined /> },
  { id: 'copy', name: 'Copy', role: '内容执笔', ability: '文案生成、报告撰写、话术优化', color: '#ec4899', icon: <EditOutlined /> },
]

const quickCommands = [
  { text: '今日经营摘要', agent: 'nova', icon: '📊' },
  { text: '当前有哪些风险预警？', agent: 'guard', icon: '⚠️' },
  { text: 'Q3战略执行进度如何？', agent: 'nova', icon: '🎯' },
  { text: '华东大区下沿穿透情况', agent: 'insight', icon: '👥' },
  { text: '本月线索转化漏斗分析', agent: 'scout', icon: '📈' },
  { text: '经销商健康度Top/Bottom', agent: 'insight', icon: '🏭' },
]

interface ChatMsg {
  role: 'user' | 'assistant'
  content: string
  done: boolean
  agent?: string
}

function generateReply(q: string): { agent: string; text: string } {
  if (q.includes('风险') || q.includes('预警')) {
    return {
      agent: 'guard',
      text: '【风险预警清单 · 按优先级排序】\n\n🔴 高风险（2项）\n1. 华南区域销量连续3周下滑-5.2%，主因深圳市场竞争加剧\n   责任人：华南大区总监 李明 | 建议：追加区域营销预算200万\n2. 北方配件供应商账期超期45天，涉及金额380万\n   责任人：供应链总监 张伟 | 建议：启动账期renegotiation，备选供应商切换\n\n🟡 中风险（3项）\n3. 极狐品牌NPS降至45，低于行业均值\n4. Q4库存周转天数升至58天（警戒线45天）\n5. 3家经销商活跃度低于阈值\n\n🟢 低风险（1项）\n6. 社交声量环比下降8%，属正常波动',
    }
  }
  if (q.includes('战略') || q.includes('Q3')) {
    return {
      agent: 'nova',
      text: '【Q3战略执行追踪】\n\n整体健康度：🟢 良好（87/100）\n\n1. 品牌高端化转型 ── 进度68% | 健康🟢\n   S系列旗舰完成产品定义，渠道升级推进中\n   AI预判：按当前节奏Q4可达80%里程碑\n\n2. 渠道数字化升级 ── 进度52% | 健康🟡\n   348家经销商中210家完成系统对接\n   AI预判：存在延期风险，建议增派实施团队\n\n3. 用户运营体系 ── 进度75% | 健康🟢\n   CDP上线运行，用户分层模型已跑通\n   AI预判：超额完成概率高\n\n建议：聚焦渠道数字化，调配资源加速实施',
    }
  }
  if (q.includes('华东') || q.includes('穿透') || q.includes('区域')) {
    return {
      agent: 'insight',
      text: '【华东大区数据穿透】\n\n华东大区本月销量1,086台，同比+12.3%，全国占比33.5%\n\n省份拆解：\n• 上海：386台 (+18.5%)  ── 高端客群集中，极狐S系列贡献突出\n• 江苏：298台 (+9.2%)   ── 南京、苏州稳步增长\n• 浙江：245台 (+15.1%)  ── 杭州旗舰店单店贡献85台\n• 安徽：157台 (+3.8%)   ── 增速放缓，渠道覆盖不足\n\n关键洞察：\n1. 上海+杭州贡献华东57%销量，集中度高\n2. 安徽渗透率低，存在渠道空白\n3. 高端车型在沪杭接受度最高\n\n建议：安徽增设2家门店，复制杭州旗舰店模式',
    }
  }
  if (q.includes('线索') || q.includes('漏斗') || q.includes('转化')) {
    return {
      agent: 'scout',
      text: '【本月线索转化漏斗分析】\n\n线索总量：12,450条\n\n漏斗各阶段：\n• 线索获取 → 12,450 (100%)\n• 有效线索 → 8,920 (71.7%)\n• 意向客户 → 3,580 (28.8%)\n• 到店试驾 → 1,240 (10.0%)\n• 成交转化 → 486 (3.9%)\n\n诊断：\n1. 线索获取→有效：71.7%，低于行业75%基准\n2. 意向→到店：34.6%，转化瓶颈在此\n3. 到店→成交：39.2%，表现优秀\n\n建议：优化线索清洗规则，加强意向客户跟进SOP，预计可将整体转化率提升至5%+',
    }
  }
  if (q.includes('经销商') || q.includes('健康')) {
    return {
      agent: 'insight',
      text: '【经销商健康度Top/Bottom】\n\n🟢 Top 5 健康经销商：\n1. 北京极狐中心 ── 健康分92 | 月销286台 | 库存周转32天\n2. 上海浦东北汽 ── 健康分89 | 月销245台 | 库存周转35天\n3. 深圳南山旗舰店 ── 健康分87 | 月销198台 | 库存周转38天\n4. 成都锦江店 ── 健康分85 | 月销165台 | 库存周转40天\n5. 杭州滨江店 ── 健康分83 | 月销142台 | 库存周转42天\n\n🔴 Bottom 3 预警经销商：\n1. 沈阳铁西店 ── 健康分52 | 月销28台 | 库存周转72天\n2. 南昌青山湖店 ── 健康分48 | 月销22台 | 库存周转68天\n3. 昆明官渡店 ── 健康分45 | 月销18台 | 库存周转75天\n\n建议：对Bottom 3启动专项帮扶，考虑调整或关停',
    }
  }
  return {
    agent: 'nova',
    text: '【今日经营摘要 · 2026-08-01】\n\n整体健康度：🟢 良好（85/100）\n\n核心指标：\n• 今日销量：3,256台 ↑8.3%\n• 目标达成率：72.5%\n• 活跃经销商：312/348家\n• 累计用户：128,650（新增3,420）\n\n关键洞察：\n1. 销量持续增长，华东大区贡献突出\n2. 极狐品牌增长12.5%，高端化初见成效\n3. 华南区域出现下滑预警，需关注\n4. 利润率仍承压，量增利减趋势未扭转\n\n建议动作：\n• 本周重点跟进华南区域营销方案\n• 推动S系列产能倾斜\n• 启动经销商健康度专项复盘',
  }
}

export default function FloatingAssistant() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const typeTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const startTypewriter = useCallback((fullText: string, agent: string) => {
    setIsTyping(true)
    let idx = 0
    setMessages((prev) => [...prev, { role: 'assistant', content: '', done: false, agent }])
    typeTimer.current = setInterval(() => {
      idx += 3
      if (idx >= fullText.length) {
        idx = fullText.length
        setMessages((prev) => {
          const copy = [...prev]
          copy[copy.length - 1] = { role: 'assistant', content: fullText, done: true, agent }
          return copy
        })
        if (typeTimer.current) clearInterval(typeTimer.current)
        setIsTyping(false)
      } else {
        setMessages((prev) => {
          const copy = [...prev]
          copy[copy.length - 1] = { ...copy[copy.length - 1], content: fullText.slice(0, idx) }
          return copy
        })
      }
    }, 18)
  }, [])

  const sendCommand = useCallback((q: string) => {
    if (!q.trim() || isTyping) return
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: q, done: true }])
    const { agent, text } = generateReply(q)
    setTimeout(() => startTypewriter(text, agent), 300)
  }, [isTyping, startTypewriter])

  useEffect(() => {
    if (drawerOpen && messages.length === 0) {
      const welcome = '您好！我是Nova，AI指挥中心总指挥。\n\n我协同4位Agent为您提供全方位经营支持：\n• Insight ── 数据洞察与区域分析\n• Scout ── 线索转化与商机诊断\n• Guard ── 风险预警与合规监控\n• Copy ── 文案生成与报告撰写\n\n您可以直接输入指令或点击下方快捷问题开始。'
      setTimeout(() => startTypewriter(welcome, 'nova'), 200)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawerOpen])

  useEffect(() => {
    if (!drawerOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawerOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [drawerOpen])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  useEffect(() => () => { if (typeTimer.current) clearInterval(typeTimer.current) }, [])

  const closeDrawer = () => {
    setDrawerOpen(false)
    if (typeTimer.current) { clearInterval(typeTimer.current); typeTimer.current = null }
    setIsTyping(false)
    setMessages([])
    setInput('')
  }

  const activeAgent = isTyping ? messages[messages.length - 1]?.agent : undefined

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>AI 指挥中心</h2>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>多Agent协同 · 经营查询 · 风险预警 · 战略追踪</p>
        </div>
        <Button type="primary" size="large" icon={<ThunderboltFilled />} onClick={() => setDrawerOpen(true)}
          style={{ borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#818cf8)', border: 'none', fontWeight: 600, boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}>
          指令台
        </Button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
        {agents.map((a) => (
          <div key={a.id} style={{
            padding: 16, borderRadius: 12, background: '#fff', border: '1px solid #e2e8f0',
            transition: 'all 0.3s', cursor: 'pointer',
            opacity: activeAgent && activeAgent !== a.id ? 0.5 : 1,
            boxShadow: activeAgent === a.id ? `0 0 20px ${a.color}40` : '0 2px 8px rgba(15,23,42,0.04)',
            borderColor: activeAgent === a.id ? a.color : '#e2e8f0',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 20px ${a.color}20` }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = activeAgent === a.id ? `0 0 20px ${a.color}40` : '0 2px 8px rgba(15,23,42,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg,${a.color},${a.color}dd)`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                {a.icon}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{a.name}</div>
                <Tag color="default" style={{ fontSize: 11 }}>{a.role}</Tag>
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>{a.ability}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: 20, borderRadius: 12, background: 'linear-gradient(135deg,#f8fafc,#eef2ff)' }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>快捷指令预览</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {quickCommands.map((cmd, i) => (
            <Tag key={i} style={{ padding: '4px 12px', borderRadius: 8, fontSize: 13, cursor: 'pointer', border: '1px solid #c7d2fe' }}
              onClick={() => { setDrawerOpen(true); setTimeout(() => sendCommand(cmd.text), 500) }}>
              {cmd.icon} {cmd.text}
            </Tag>
          ))}
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: '#94a3b8' }}>点击指令或右上角「指令台」打开AI助手面板</div>
      </div>
      {drawerOpen && (
        <>
          <div onClick={closeDrawer} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15,23,42,0.4)', zIndex: 1000, animation: 'fadeIn 0.2s ease',
          }} />
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0,
            width: 'min(520px, 90vw)', background: '#fff', zIndex: 1001,
            display: 'flex', flexDirection: 'column',
            boxShadow: '-8px 0 32px rgba(15,23,42,0.12)',
            animation: 'slideInRight 0.35s cubic-bezier(0.22, 0.61, 0.36, 1)',
          }}>
            <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg,#6366f1,#818cf8)', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar size={36} style={{ background: 'rgba(255,255,255,0.2)' }} icon={<RobotOutlined />} />
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>光粒AI</div>
                  <div style={{ fontSize: 11, opacity: 0.8 }}>Nova · 多Agent协同指挥</div>
                </div>
              </div>
              <Button type="text" size="small" icon={<CloseOutlined />} onClick={closeDrawer} style={{ color: '#fff' }} />
            </div>
            <div style={{ display: 'flex', gap: 6, padding: '8px 16px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', overflowX: 'auto' }}>
              {agents.map((a) => (
                <div key={a.id} style={{
                  display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 12, fontSize: 11, whiteSpace: 'nowrap',
                  background: activeAgent === a.id ? a.color : '#fff', color: activeAgent === a.id ? '#fff' : '#64748b',
                  border: `1px solid ${activeAgent === a.id ? a.color : '#e2e8f0'}`, transition: 'all 0.3s',
                }}>
                  {a.icon} {a.name}
                </div>
              ))}
            </div>
            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.map((m, i) => {
                const agentInfo = m.agent ? agents.find((a) => a.id === m.agent) : undefined
                return (
                  <div key={i} style={{ display: 'flex', gap: 8, flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                    <Avatar size={32} style={{ background: m.role === 'user' ? '#06b6d4' : (agentInfo?.color || '#6366f1'), flexShrink: 0 }}>
                      {m.role === 'user' ? '我' : (agentInfo?.name?.[0] || 'N')}
                    </Avatar>
                    <div style={{ maxWidth: '82%' }}>
                      {m.role === 'assistant' && agentInfo && (
                        <div style={{ fontSize: 11, color: agentInfo.color, fontWeight: 600, marginBottom: 2 }}>{agentInfo.name} · {agentInfo.role}</div>
                      )}
                      <div style={{
                        padding: '10px 14px', borderRadius: 12, fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap',
                        background: m.role === 'user' ? '#06b6d4' : '#f1f5f9', color: m.role === 'user' ? '#fff' : '#1e293b',
                        borderTopRightRadius: m.role === 'user' ? 2 : 12, borderTopLeftRadius: m.role === 'user' ? 12 : 2,
                      }}>
                        {m.content}
                        {m.role === 'assistant' && !m.done && <span style={{ display: 'inline-block', width: 2, height: 14, background: '#6366f1', marginLeft: 1, animation: 'blink 1s infinite', verticalAlign: 'middle' }} />}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ padding: '8px 16px', display: 'flex', gap: 6, flexWrap: 'wrap', borderTop: '1px solid #f1f5f9' }}>
              {quickCommands.map((cmd, i) => (
                <Tag key={i} style={{ cursor: 'pointer', fontSize: 11, borderRadius: 6, border: '1px solid #e2e8f0' }}
                  onClick={() => sendCommand(cmd.text)}>
                  {cmd.icon} {cmd.text}
                </Tag>
              ))}
            </div>
            <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 8 }}>
              <Input value={input} onChange={(e) => setInput(e.target.value)} onPressEnter={() => sendCommand(input)}
                placeholder="输入指令，如：今日经营摘要" disabled={isTyping} style={{ borderRadius: 8 }} />
              <Button type="primary" icon={<SendOutlined />} onClick={() => sendCommand(input)} disabled={isTyping || !input.trim()} style={{ borderRadius: 8 }} />
            </div>
          </div>
        </>
      )}
      <style>{`
        @keyframes slideInRight { from { transform: translateX(100%) } to { transform: translateX(0) } }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes blink { 0%,50% { opacity: 1 } 51%,100% { opacity: 0 } }
        @keyframes pulse { 0%,100% { box-shadow: 0 8px 24px rgba(99,102,241,0.4) } 50% { box-shadow: 0 8px 32px rgba(99,102,241,0.6) } }
      `}</style>
    </div>
  )
}