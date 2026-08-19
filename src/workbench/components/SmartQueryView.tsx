import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, Input, Button, Tag, Row, Col, Avatar } from 'antd'
import { SendOutlined, BarChartOutlined, RiseOutlined, UserOutlined, ShopOutlined, TeamOutlined, HeartOutlined } from '@ant-design/icons'

// ===== useCountUp hook =====
function useCountUp(target: number, duration = 1200): number {
  const [val, setVal] = useState(0)
  const rafRef = useRef<number>(0)
  const startRef = useRef<number>(0)
  useEffect(() => {
    cancelAnimationFrame(rafRef.current)
    startRef.current = 0
    const step = (ts: number) => {
      if (!startRef.current) startRef.current = ts
      const progress = Math.min((ts - startRef.current) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setVal(Math.round(target * eased))
      if (progress < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])
  return val
}

// ===== Types =====
interface ChatMsg {
  role: 'user' | 'ai'
  content: string
  fullContent: string
  done: boolean
}

interface DashboardData {
  totalSales: number
  salesGrowth: number
  targetRate: number
  trend: { month: string; sales: number; profit: number }[]
  brands: { name: string; sales: number; growth: number; color: string }[]
  channels: { region: string; sales: number; growth: number; status: string }[]
  dealers: { total: number; active: number; top: { name: string; sales: number }[] }
  users: { total: number; newAdd: number; retention: number; tiers: { name: string; pct: number; color: string }[] }
  brandHealth: { awareness: number; reputation: number; nps: number; volume: number }
}

// ===== Default dashboard data =====
const defaultData: DashboardData = {
  totalSales: 3256,
  salesGrowth: 8.3,
  targetRate: 72.5,
  trend: [
    { month: '2024-Q1', sales: 1820, profit: 4.2 },
    { month: '2024-Q2', sales: 2150, profit: 3.8 },
    { month: '2024-Q3', sales: 2480, profit: 3.1 },
    { month: '2024-Q4', sales: 2890, profit: 2.5 },
    { month: '2025-Q1', sales: 2650, profit: 1.9 },
    { month: '2025-Q2', sales: 2980, profit: 1.2 },
    { month: '2025-Q3', sales: 3120, profit: 0.8 },
    { month: '2025-Q4', sales: 3256, profit: 0.5 },
  ],
  brands: [
    { name: '\u6781\u72d0', sales: 1120, growth: 12.5, color: '#6366f1' },
    { name: '\u5317\u4eac', sales: 1836, growth: 5.2, color: '#06b6d4' },
    { name: '\u798f\u7530', sales: 300, growth: -3.1, color: '#f59e0b' },
  ],
  channels: [
    { region: '\u534e\u4e1c\u5927\u533a', sales: 1086, growth: 12.3, status: '\u9886\u5148' },
    { region: '\u534e\u5317', sales: 892, growth: 6.8, status: '\u7a33\u5065' },
    { region: '\u534e\u5357', sales: 645, growth: -2.1, status: '\u9884\u8b66' },
    { region: '\u897f\u5357', sales: 420, growth: 8.5, status: '\u589e\u957f' },
    { region: '\u4e1c\u5317', sales: 213, growth: 3.2, status: '\u5e73\u7a33' },
  ],
  dealers: {
    total: 348,
    active: 312,
    top: [
      { name: '\u5317\u4eac\u6781\u72d0\u4e2d\u5fc3', sales: 286 },
      { name: '\u4e0a\u6d77\u6d66\u4e1c\u5317\u6c7d', sales: 245 },
      { name: '\u6df1\u5733\u5357\u5c71\u65d7\u8230\u5e97', sales: 198 },
      { name: '\u6210\u90fd\u9526\u6c5f\u5e97', sales: 165 },
      { name: '\u676d\u5dde\u6ee8\u6c5f\u5e97', sales: 142 },
    ],
  },
  users: {
    total: 128650,
    newAdd: 3420,
    retention: 68.5,
    tiers: [
      { name: '\u9ad8\u4ef7\u503c\u5ba2\u6237', pct: 18, color: '#6366f1' },
      { name: '\u6210\u957f\u5ba2\u6237', pct: 35, color: '#06b6d4' },
      { name: '\u6f5c\u529b\u5ba2\u6237', pct: 32, color: '#f59e0b' },
      { name: '\u6d41\u5931\u98ce\u9669', pct: 15, color: '#ef4444' },
    ],
  },
  brandHealth: { awareness: 76, reputation: 82, nps: 45, volume: 68 },
}

// ===== SVG Area Chart =====
function AreaChart({ data }: { data: { month: string; sales: number; profit: number }[] }) {
  const W = 520, H = 160, P = 32
  const maxSales = Math.max(...data.map((d) => d.sales))
  const maxProfit = Math.max(...data.map((d) => d.profit))
  const stepX = (W - P * 2) / (data.length - 1)
  const salesPoints = data.map((d, i) => ({ x: P + i * stepX, y: H - P - ((d.sales / maxSales) * (H - P * 2)) }))
  const profitPoints = data.map((d, i) => ({ x: P + i * stepX, y: H - P - ((d.profit / maxProfit) * (H - P * 2)) }))
  const toPath = (pts: { x: number; y: number }[]) => {
    let p = `M ${pts[0].x} ${pts[0].y}`
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1], cur = pts[i]
      const cpx = (prev.x + cur.x) / 2
      p += ` C ${cpx} ${prev.y}, ${cpx} ${cur.y}, ${cur.x} ${cur.y}`
    }
    return p
  }
  const toArea = (pts: { x: number; y: number }[]) => `${toPath(pts)} L ${pts[pts.length - 1].x} ${H - P} L ${pts[0].x} ${H - P} Z`
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((g) => (
        <line key={g} x1={P} y1={P + g * (H - P * 2)} x2={W - P} y2={P + g * (H - P * 2)} stroke="#e2e8f0" strokeWidth="0.5" />
      ))}
      <path d={toArea(profitPoints)} fill="url(#profitGrad)" />
      <path d={toPath(profitPoints)} fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 3" />
      <path d={toArea(salesPoints)} fill="url(#salesGrad)" />
      <path d={toPath(salesPoints)} fill="none" stroke="#6366f1" strokeWidth="2" />
      {salesPoints.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3" fill="#6366f1" />)}
      {data.map((d, i) => (
        <text key={i} x={P + i * stepX} y={H - 8} fontSize="9" fill="#94a3b8" textAnchor="middle">{d.month}</text>
      ))}
    </svg>
  )
}

// ===== Preset questions =====
const presetQuestions = [
  '\u6781\u72d0\u963f\u5c14\u6cd5S\u5404\u533a\u57df\u9500\u91cf\u8868\u73b0\u5982\u4f55\uff1f',
  '\u5bf9\u6bd4\u5206\u6790\u6781\u72d0\u5404\u8f66\u578b\u6bdb\u5229\u7387',
  '\u6781\u72d0\u54c1\u724c\u9ad8\u7aef\u5316\u5bf9\u5229\u6da6\u7684\u5f71\u54cd\u9884\u6d4b',
  '\u8fd1\u4e09\u5e74\u6781\u72d0\u6c7d\u8f66\u9500\u91cf\u548c\u5229\u6da6\u60c5\u51b5',
]

// ===== AI reply generator =====
function generateReply(q: string, setData: (d: DashboardData) => void): string {
  if (q.includes('\u533a\u57df') || q.includes('\u963f\u5c14\u6cd5S')) {
    setData({
      ...defaultData,
      brands: [
        { name: '\u6781\u72d0\u963f\u5c14\u6cd5S', sales: 686, growth: 15.2, color: '#6366f1' },
        { name: '\u6781\u72d0\u963f\u5c14\u6cd5T', sales: 434, growth: 8.1, color: '#06b6d4' },
      ],
      channels: [
        { region: '\u534e\u4e1c-S', sales: 218, growth: 18.5, status: '\u9886\u5148' },
        { region: '\u534e\u5317-S', sales: 176, growth: 12.3, status: '\u7a33\u5065' },
        { region: '\u534e\u5357-S', sales: 132, growth: -5.2, status: '\u9884\u8b66' },
        { region: '\u897f\u5357-S', sales: 98, growth: 22.1, status: '\u9ad8\u589e' },
        { region: '\u4e1c\u5317-S', sales: 62, growth: 4.5, status: '\u5e73\u7a33' },
      ],
    })
    return '\u6781\u72d0\u963f\u5c14\u6cd5S\u5404\u533a\u57df\u9500\u91cf\u5206\u6790\uff1a\n\n\u534e\u4e1c\u5927\u533a\u4ee2218\u53f0\u9886\u8dd1\u5168\u56fd\uff0c\u540c\u6bd4\u589e\u957f18.5%\uff0c\u4e3b\u8981\u5f97\u76ca\u4e8e\u4e0a\u6d77\u3001\u676d\u5dde\u95e8\u5e97\u9ad8\u7aef\u5ba2\u7fa4\u96c6\u4e2d\uff1b\u534e\u5317176\u53f0\u7a33\u5065\u589e\u957f12.3%\uff1b\u534e\u5357\u533a\u57df\u51fa\u73b0-5.2%\u4e0b\u6ed1\uff0c\u9700\u5173\u6ce8\u6df1\u5733\u5e02\u573a\u7ade\u4e89\u52a0\u5267\uff1b\u897f\u5357\u5927\u533a\u589e\u901f\u8fbe22.1%\uff0c\u6210\u90fd\u8868\u73b0\u7a81\u51fa\u3002\n\n\u5efa\u8bae\uff1a\u52a0\u5927\u534e\u5357\u533a\u57df\u8425\u9500\u6295\u5165\uff0c\u897f\u5357\u53ef\u590d\u5236\u6210\u90fd\u6a21\u5f0f\u6269\u5c55\u3002'
  }
  if (q.includes('\u6bdb\u5229\u7387') || q.includes('\u8f66\u578b')) {
    setData({
      ...defaultData,
      brands: [
        { name: '\u963f\u5c14\u6cd5S', sales: 686, growth: 22.5, color: '#6366f1' },
        { name: '\u963f\u5c14\u6cd5T', sales: 434, growth: 12.8, color: '#06b6d4' },
        { name: '\u8003\u62c9', sales: 320, growth: -8.5, color: '#f59e0b' },
      ],
    })
    return '\u6781\u72d0\u5404\u8f66\u578b\u6bdb\u5229\u7387\u5bf9\u6bd4\uff1a\n\n\u963f\u5c14\u6cd5S\uff1a\u6bdb\u5229\u738722.5%\uff0c\u9ad8\u7aef\u5b9a\u4f4d\u6ea2\u4ef7\u663e\u8457\uff0c\u662f\u5229\u6da6\u8d21\u732e\u4e3b\u529b\n\u963f\u5c14\u6cd5T\uff1a\u6bdb\u5229\u738712.8%\uff0c\u5904\u4e8e\u884c\u4e1a\u4e2d\u6e38\n\u8003\u62c9\uff1a\u6bdb\u5229\u7387-8.5%\uff0c\u5c1a\u5904\u5e02\u573a\u57f9\u80b2\u671f\uff0c\u89c4\u6a21\u6548\u5e94\u4e0d\u8db3\n\n\u7ed3\u8bba\uff1a\u963f\u5c14\u6cd5S\u7cfb\u5217\u662f\u5f53\u524d\u5229\u6da6\u6838\u5fc3\uff0c\u5efa\u8bae\u52a0\u5927\u4ea7\u80fd\u503e\u659c\uff1b\u8003\u62c9\u9700\u901a\u8fc7\u89c4\u6a21\u63d0\u5347\u644a\u8584\u6210\u672c\uff0c\u9884\u8ba1\u6708\u9500\u7a81\u7800800\u53f0\u540e\u53ef\u8f6c\u6b63\u3002'
  }
  if (q.includes('\u9ad8\u7aef\u5316') || q.includes('\u5229\u6da6')) {
    return '\u6781\u72d0\u54c1\u724c\u9ad8\u7aef\u5316\u5bf9\u5229\u6da6\u5f71\u54cd\u9884\u6d4b\uff1a\n\n\u57fa\u4e8e\u8fd1\u4e09\u5e74\u6570\u636e\u5efa\u6a21\u5206\u6790\uff1a\n1. \u9500\u91cf\u5c42\u9762\uff1a30\u4e07+\u5e02\u573a\u5e74\u589e\u901f35%\uff0c\u7a97\u53e3\u671f2-3\u5e74\uff0c\u9ad8\u7aef\u5316\u53ef\u5e26\u52a8\u6574\u4f53\u9500\u91cf\u63d0\u534740%+\n2. \u5229\u6da6\u5c42\u9762\uff1aS\u7cfb\u5217\u65d7\u8230(40-60\u4e07)\u9884\u8ba1\u5355\u8f66\u6bdb\u52298-12\u4e07\uff0c\u8f83\u73b0\u6709\u8f66\u578b\u63d0\u53473-5\u500d\n3. \u6295\u5165\u5c42\u9762\uff1a3\u5e74\u54c1\u724c+\u7814\u53d1\u6295\u516580-100\u4ebf\uff0c\u7b2c4\u5e74\u9884\u8ba1\u764c\u4e8f\u5e73\u8861\n4. \u98ce\u9669\u5c42\u9762\uff1a\u54c1\u724c\u8ba4\u77e5\u5c1a\u9700\u79ef\u7d2f\uff0c\u77ed\u671f\u5229\u6da6\u7387\u4ecd\u627f\u538b\n\n\u7efc\u5408\u5224\u65ad\uff1a\u9ad8\u7aef\u5316\u662f\u5229\u6da6\u7387\u9006\u8f6c\u7684\u5173\u952e\u8def\u5f84\uff0c\u5efa\u8bae\u5206\u9636\u6bb5\u63a8\u8fdb\uff0c\u9996\u671f\u805a\u7126S\u7cfb\u5217\u65d7\u8230\u4ea7\u54c1\u3002'
  }
  setData(defaultData)
  return '\u8fd1\u4e09\u5e74\u6781\u72d0\u6c7d\u8f66\u9500\u91cf\u4e0e\u5229\u6da6\u5206\u6790\uff1a\n\n\u9500\u91cf\u8d8b\u52bf\uff1a\u4ece2024\u5e74Q1\u76841,820\u53f0\u6301\u7eed\u589e\u957f\u81f32025\u5e74Q4\u76843,256\u53f0\uff0c\u7d2f\u8ba1\u589e\u957f79%\uff0c\u5e74\u590d\u5408\u589e\u957f\u7387\u7ea634%\u3002\n\n\u5229\u6da6\u8d8b\u52bf\uff1a\u51c0\u5229\u6da6\u4ece4.2\u4ebf\u6301\u7eed\u4e0b\u964d\u81f30.5\u4ebf\uff0c\u5448\u73b0\u201c\u91cf\u589e\u5229\u51cf\u201d\u6001\u52bf\u3002\u4e3b\u8981\u539f\u56e0\uff1a\n1. \u4ea7\u54c1\u7ed3\u6784\u4e2d\u4f4e\u7aef\u8f66\u578b\u5360\u6bd4\u9ad8\uff0c\u5355\u8f66\u6bdb\u5229\u4f4e\n2. \u54c1\u724c\u6ea2\u4ef7\u4e0d\u8db3\uff0c\u7ec8\u7aef\u6298\u6263\u538b\u529b\u5927\n3. \u7814\u53d1\u4e0e\u6e20\u9053\u6295\u5165\u6301\u7eed\u589e\u52a0\n\n\u6838\u5fc3\u6d1e\u5bdf\uff1a\u9500\u91cf\u589e\u957f\u5065\u5eb7\u4f46\u5229\u6da6\u4fb5\u8680\u4e25\u91cd\uff0c\u9ad8\u7aef\u5316\u8f6c\u578b\u8feb\u5728\u7709\u7770\u3002\u5efa\u8bae\u805a\u712640\u4e07+\u5e02\u573a\uff0c\u901a\u8fc7\u54c1\u724c\u4ef7\u503c\u63d0\u5347\u6539\u5584\u5229\u6da6\u7ed3\u6784\u3002'
}

// ===== Main Component =====
export default function SmartQueryView() {
  const [data, setData] = useState<DashboardData>(defaultData)
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const typeTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const totalSales = useCountUp(data.totalSales)
  const dealersActive = useCountUp(data.dealers.active)
  const usersTotal = useCountUp(data.users.total)

  const startTypewriter = useCallback((fullText: string) => {
    setIsTyping(true)
    let idx = 0
    setMessages((prev) => [...prev, { role: 'ai', content: '', fullContent: fullText, done: false }])
    typeTimer.current = setInterval(() => {
      idx += 3
      if (idx >= fullText.length) {
        idx = fullText.length
        setMessages((prev) => {
          const copy = [...prev]
          copy[copy.length - 1] = { role: 'ai', content: fullText, fullContent: fullText, done: true }
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

  const sendQuestion = useCallback((q: string) => {
    if (!q.trim() || isTyping) return
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: q, fullContent: q, done: true }])
    const reply = generateReply(q, setData)
    setTimeout(() => startTypewriter(reply), 300)
  }, [isTyping, startTypewriter])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  useEffect(() => () => { if (typeTimer.current) clearInterval(typeTimer.current) }, [])

  return (
    <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 140px)', minHeight: 600 }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <BarChartOutlined style={{ fontSize: 20, color: '#6366f1' }} />
          <span style={{ fontSize: 18, fontWeight: 700 }}>{'\u8425\u9500\u6570\u636e\u667a\u80fd\u5927\u5c4f'}</span>
          <Tag color="purple" style={{ marginLeft: 8 }}>{'\u5b9e\u65f6\u8054\u52a8'}</Tag>
        </div>
        <Row gutter={[12, 12]}>
          <Col span={6}>
            <Card style={{ borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#818cf8)', border: 'none' }}>
              <div style={{ color: '#fff' }}>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{'\u4eca\u65e5\u603b\u9500\u91cf'}</div>
                <div style={{ fontSize: 28, fontWeight: 800 }}>{totalSales.toLocaleString()}<span style={{ fontSize: 14, marginLeft: 4 }}>{'\u53f0'}</span></div>
                <div style={{ fontSize: 12 }}><RiseOutlined /> {data.salesGrowth}% {'\u540c\u6bd4'}</div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card style={{ borderRadius: 12 }}>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>{'\u76ee\u6807\u8fbe\u6210\u7387'}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>{data.targetRate}%</div>
              <div style={{ height: 4, background: '#e2e8f0', borderRadius: 2, marginTop: 6 }}>
                <div style={{ width: `${data.targetRate}%`, height: '100%', background: '#6366f1', borderRadius: 2 }} />
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card style={{ borderRadius: 12 }}>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>{'\u6d3b\u8dc3\u7ecf\u9500\u5546'}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>{dealersActive}<span style={{ fontSize: 14, color: '#94a3b8' }}>/{data.dealers.total}</span></div>
              <div style={{ fontSize: 12, color: '#10b981' }}>{'\u6d3b\u8dc3\u7387'} {Math.round((data.dealers.active / data.dealers.total) * 100)}%</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card style={{ borderRadius: 12 }}>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>{'\u7d2f\u8ba1\u7528\u6237'}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>{usersTotal.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: '#10b981' }}><RiseOutlined /> {'\u65b0\u589e'} {data.users.newAdd}</div>
            </Card>
          </Col>
        </Row>
        <Card style={{ borderRadius: 12, marginTop: 12 }} title={<span style={{ fontSize: 14 }}>{'\u9500\u91cf & \u5229\u6da6\u8d8b\u52bf'}</span>} extra={
          <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#6366f1', borderRadius: 2, marginRight: 4 }} />{'\u9500\u91cf'}</span>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#ef4444', borderRadius: 2, marginRight: 4 }} />{'\u51c0\u5229\u6da6(\u4ebf)'}</span>
          </div>
        }>
          <AreaChart data={data.trend} />
        </Card>
        <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
          <Col span={12}>
            <Card style={{ borderRadius: 12 }} title={<span style={{ fontSize: 14 }}>{'\u54c1\u724c\u9500\u91cf'}</span>}>
              {data.brands.map((b) => (
                <div key={b.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: b.color }} />
                    <span style={{ fontWeight: 600 }}>{b.name}</span>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700 }}>{b.sales.toLocaleString()} {'\u53f0'}</span>
                    <span style={{ fontSize: 12, color: b.growth >= 0 ? '#10b981' : '#ef4444' }}>{b.growth >= 0 ? '\u2191' : '\u2193'}{Math.abs(b.growth)}%</span>
                  </span>
                </div>
              ))}
            </Card>
          </Col>
          <Col span={12}>
            <Card style={{ borderRadius: 12 }} title={<span style={{ fontSize: 14 }}>{'\u533a\u57df\u6e20\u9053'}</span>}>
              {data.channels.map((c) => (
                <div key={c.region} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontWeight: 600 }}>{c.region}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700 }}>{c.sales} {'\u53f0'}</span>
                    <Tag color={c.growth >= 0 ? 'green' : 'red'} style={{ fontSize: 11 }}>{c.growth >= 0 ? '\u2191' : '\u2193'}{Math.abs(c.growth)}%</Tag>
                    <Tag style={{ fontSize: 11 }}>{c.status}</Tag>
                  </span>
                </div>
              ))}
            </Card>
          </Col>
        </Row>
        <Row gutter={[12, 12]} style={{ marginTop: 12, marginBottom: 12 }}>
          <Col span={8}>
            <Card style={{ borderRadius: 12 }} title={<span style={{ fontSize: 14 }}><ShopOutlined /> {'\u7ecf\u9500\u5546\u6392\u884c'}</span>}>
              {data.dealers.top.map((d, i) => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: i < 3 ? '#6366f1' : '#e2e8f0', color: '#fff', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{i + 1}</span>
                  <span style={{ flex: 1, fontSize: 13 }}>{d.name}</span>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{d.sales} {'\u53f0'}</span>
                </div>
              ))}
            </Card>
          </Col>
          <Col span={8}>
            <Card style={{ borderRadius: 12 }} title={<span style={{ fontSize: 14 }}><UserOutlined /> {'\u5ba2\u6237\u5206\u5c42'}</span>}>
              <div style={{ display: 'flex', height: 20, borderRadius: 6, overflow: 'hidden', marginBottom: 10 }}>
                {data.users.tiers.map((t) => (
                  <div key={t.name} style={{ width: `${t.pct}%`, background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 600 }}>{t.pct}%</div>
                ))}
              </div>
              {data.users.tiers.map((t) => (
                <div key={t.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '3px 0', fontSize: 12 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: t.color }} />
                    {t.name}
                  </span>
                  <span style={{ fontWeight: 600 }}>{t.pct}%</span>
                </div>
              ))}
              <div style={{ marginTop: 8, fontSize: 12, color: '#94a3b8' }}>{'\u7559\u5b58\u7387'} {data.users.retention}%</div>
            </Card>
          </Col>
          <Col span={8}>
            <Card style={{ borderRadius: 12 }} title={<span style={{ fontSize: 14 }}><HeartOutlined /> {'\u54c1\u724c\u5065\u5eb7'}</span>}>
              {[
                { label: '\u54c1\u724c\u77e5\u540d\u5ea6', val: data.brandHealth.awareness, color: '#6366f1' },
                { label: '\u54c1\u724c\u7f8e\u8a89\u5ea6', val: data.brandHealth.reputation, color: '#06b6d4' },
                { label: 'NPS \u51c0\u63a8\u8350\u503c', val: data.brandHealth.nps, color: '#f59e0b' },
                { label: '\u793e\u4ea4\u58f0\u91cf', val: data.brandHealth.volume, color: '#10b981' },
              ].map((m) => (
                <div key={m.label} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span>{m.label}</span>
                    <span style={{ fontWeight: 700 }}>{m.val}</span>
                  </div>
                  <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3 }}>
                    <div style={{ width: `${m.val}%`, height: '100%', background: m.color, borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </Card>
          </Col>
        </Row>
      </div>
      <div style={{ width: 380, flexShrink: 0, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(15,23,42,0.06)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', background: 'linear-gradient(135deg,#6366f1,#818cf8)', color: '#fff' }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{'\u667a\u80fd\u95ee\u6570'}</div>
          <div style={{ fontSize: 11, opacity: 0.8 }}>{'\u81ea\u7136\u8bed\u8a00\u67e5\u8be2 \u00b7 \u6570\u636e\u5b9e\u65f6\u8054\u52a8'}</div>
        </div>
        <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6, borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>{'\u5feb\u6377\u63d0\u95ee'}</div>
          {presetQuestions.map((q, i) => (
            <div key={i} onClick={() => sendQuestion(q)} style={{ padding: '7px 10px', background: '#f8fafc', borderRadius: 8, fontSize: 12, cursor: 'pointer', transition: 'all 0.2s', border: '1px solid transparent' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.borderColor = '#c7d2fe' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = 'transparent' }}>
              {q}
            </div>
          ))}
        </div>
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: '#cbd5e1', fontSize: 13, marginTop: 40 }}>
              <TeamOutlined style={{ fontSize: 32, marginBottom: 8 }} />
              <div>{'\u8f93\u5165\u95ee\u9898\u6216\u70b9\u51fb\u5feb\u6377\u63d0\u95ee'}</div>
              <div style={{ fontSize: 11, marginTop: 4 }}>{'AI \u5c06\u5206\u6790\u6570\u636e\u5e76\u8054\u52a8\u66f4\u65b0\u5927\u5c4f'}</div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
              <Avatar size={28} style={{ background: m.role === 'user' ? '#06b6d4' : '#6366f1', flexShrink: 0 }}>
                {m.role === 'user' ? '\u6211' : 'AI'}
              </Avatar>
              <div style={{
                maxWidth: '80%', padding: '8px 12px', borderRadius: 10, fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap',
                background: m.role === 'user' ? '#06b6d4' : '#f1f5f9', color: m.role === 'user' ? '#fff' : '#1e293b',
                borderTopRightRadius: m.role === 'user' ? 2 : 10, borderTopLeftRadius: m.role === 'user' ? 10 : 2,
              }}>
                {m.content}
                {m.role === 'ai' && !m.done && <span style={{ display: 'inline-block', width: 2, height: 14, background: '#6366f1', marginLeft: 1, animation: 'blink 1s infinite', verticalAlign: 'middle' }} />}
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '10px 12px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 8 }}>
          <Input value={input} onChange={(e) => setInput(e.target.value)} onPressEnter={() => sendQuestion(input)} placeholder={'\u8f93\u5165\u67e5\u8be2\u95ee\u9898...'} disabled={isTyping} style={{ borderRadius: 8 }} />
          <Button type="primary" icon={<SendOutlined />} onClick={() => sendQuestion(input)} disabled={isTyping || !input.trim()} style={{ borderRadius: 8 }} />
        </div>
      </div>
      <style>{`@keyframes blink { 0%,50% { opacity: 1 } 51%,100% { opacity: 0 } }`}</style>
    </div>
  )
}