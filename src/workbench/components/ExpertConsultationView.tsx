import { useState, useEffect, useRef, useCallback } from 'react'
import { Button, Tag, Avatar, App as AntdApp } from 'antd'
import { PlayCircleOutlined, ReloadOutlined, FileTextOutlined, ShareAltOutlined, CheckSquareOutlined, SolutionOutlined } from '@ant-design/icons'

interface Expert {
  id: string
  name: string
  domain: string
  avatar: string
  color: string
  opinion: string
}

const topic = '极狐汽车整体利润率逐年降低，建议考虑品牌高端化的策划'

const experts: Expert[] = [
  {
    id: 'e1', name: '张明远', domain: '品牌战略', avatar: 'ZMD', color: '#6366f1',
    opinion: '极狐品牌当前的核心问题是品牌价值未随销量增长同步提升。建议从三个层面重塑品牌架构：\n\n1. 品牌价值主张升级：从"北汽新能源"背书转向"极狐=中国高端智能电动车"独立定位，建立差异化的品牌心智\n2. 品牌架构重塑：极狐应成为独立的高端品牌序列，与北京、福田形成清晰的层级区隔\n3. 圈层营销突破：聚焦科技精英和商务精英两个核心圈层，通过高端用户社群运营建立品牌忠诚度\n\n品牌溢价是高端化的前提，没有品牌力支撑的价格上移只是"涨价"而非"高端化"。',
  },
  {
    id: 'e2', name: '李思源', domain: '产品规划', avatar: 'LSY', color: '#06b6d4',
    opinion: '产品力是高端化的根基。建议极狐规划两条旗舰产品线：\n\n1. S系列旗舰轿车（40-60万）：对标蔚来ET7、极氪001，主打智能豪华轿车市场。核心卖点：800V高压平台+城市NOA+鸿蒙座舱\n2. X系列豪华SUV（50-80万）：对标理想L9、问界M9，主打家庭豪华SUV市场。核心卖点：大空间+增程/纯电双路线+零重力座椅\n\n同时制定3年技术路线图：2026年实现L3自动驾驶、2027年全栈自研芯片上车、2028年固态电池量产。产品定义必须以用户场景为出发点，而非技术堆砌。',
  },
  {
    id: 'e3', name: '赵启航', domain: '渠道运营', avatar: 'ZQH', color: '#10b981',
    opinion: '渠道是高端化落地的关键载体。当前极狐348家经销商中，具备高端销售能力的不足30%。建议：\n\n1. 建立三级渠道体系：\n   • 极狐中心（旗舰店）：一线城市核心商圈，50家，承担品牌展示+体验+交付\n   • 极狐空间（体验店）：二三线城市商圈，150家，承担体验+销售\n   • 极狐服务站：下沉市场，150家，承担售后+交付\n\n2. 2027年目标：建成350家高端触点，一线城市全覆盖，二线城市覆盖率达80%\n3. 渠道赋能：统一高端化销售SOP、数字化展厅系统、专属金融方案\n\n高端渠道不是数量堆砌，是体验升级。每个触点都应传递品牌价值。',
  },
  {
    id: 'e4', name: '陈天翔', domain: '技术研发', avatar: 'CTX', color: '#f59e0b',
    opinion: '技术领先是高端化的硬实力支撑。建议极狐在以下领域建立技术壁垒：\n\n1. 三电系统：800V碳化硅高压平台（充电15分钟续航500km）、自研高效电驱（效率>97%）\n2. 智能驾驶：2026年实现城市NOA全场景覆盖，2027年L3有条件自动驾驶量产\n3. 智能座舱：鸿蒙生态深度定制，AI大模型上车，实现多模态自然交互\n4. 安全技术：电池零热失控、车身扭转刚度>40000Nm/deg\n\n研发投入建议：未来3年研发投入占比不低于营收12%，累计投入80-100亿。技术壁垒是高端化最深的护城河。',
  },
  {
    id: 'e5', name: '刘雪峰', domain: '财务分析', avatar: 'LXF', color: '#ef4444',
    opinion: '从财务视角看，极狐高端化是一次资本密集型转型，需做好投入产出规划：\n\n1. 投入测算：\n   • 研发投入：3年80-100亿（S/X系列+三电+智驾）\n   • 品牌投入：3年30-50亿（品牌建设+高端营销）\n   • 渠道投入：3年20-30亿（旗舰店+体验店升级）\n   • 合计：130-180亿\n\n2. 收益预测：\n   • 高端车型单车毛利8-12万（vs当前2-3万）\n   • 2027年高端车型销量占比达30%，贡献利润60%+\n   • 第4年（2030年）预计盈亏平衡\n\n3. 风险提示：短期利润率将继续承压，需集团层面给予3年战略亏损期容忍度\n\n建议设立专项预算池，独立核算，避免与现有业务混同影响决策。',
  },
  {
    id: 'e6', name: '孙远航', domain: '市场洞察', avatar: 'SYH', color: '#ec4899',
    opinion: '市场窗口是高端化成功的时点因素。核心洞察：\n\n1. 30万+高端电动车市场年增速35%，远超行业均值\n2. 当前窗口期仅2-3年，2027年后新势力品牌格局基本固化\n3. 竞争格局：蔚来品牌力强但产品迭代慢，理想聚焦家庭但技术偏弱，极氪性价比高但品牌力不足\n4. 极狐机会：北汽集团制造底蕴+华为技术生态+国资背景的信任优势\n\n建议：\n• 2026年Q4必须发布S系列旗舰，抢占窗口期\n• 差异化定位"中国智造高端电动车"，避开与新势力正面价格战\n• 利用北汽集团B端资源（政府/企业采购）建立高端认知\n\n窗口期稍纵即逝，速度比完美更重要。',
  },
]

const assistantSummary = '【战略管理助理 · 汇总分析】\n\n基于6位专家的深度研讨，形成以下综合分析：\n\n━━━ 共识点 ━━━\n1. 高端化是极狐扭转利润率下滑的必由路径，市场窗口期2-3年\n2. 需要品牌、产品、渠道、技术四位一体协同推进\n3. S系列旗舰轿车（40-60万）应作为高端化首发产品\n4. 3年累计投入130-180亿，第4年盈亏平衡\n\n━━━ 分歧点 ━━━\n1. 技术自研深度：陈天翔主张全栈自研（12%研发占比） vs 刘雪峰强调财务可控\n2. 渠道节奏：赵启航主张快速扩张（2027年350家） vs 财务视角的渐进式\n3. 品牌定位：张明远主张完全独立 vs 保留北汽背书的过渡方案\n\n━━━ 优先级建议 ━━━\nP0（立即启动）：确定S系列产品定义，启动研发\nP1（1-3个月）：品牌架构重塑方案，渠道分级标准制定\nP2（3-6个月）：技术研发路线图锁定，渠道旗舰店选址\nP3（6-12个月）：品牌营销启动，渠道体系全面建设\n\n━━━ 行动项 ━━━\n☑ 8月15日前：成立极狐高端化专项委员会（战略+产品+研发+财务）\n☑ 9月30日前：完成S系列产品定义评审与立项\n☑ 10月31日前：发布品牌升级方案，启动渠道改造\n☑ Q4：S系列研发正式启动，目标2027年Q2上市\n☑ 3年财务规划报集团审批，设立战略亏损期容忍机制\n\n结论：极狐高端化路径清晰、资源可支撑、窗口期匹配。建议立即启动，以"品牌独立+产品旗舰+技术壁垒+渠道升级"四轮驱动，力争2027年实现高端化突破。'

interface Speech {
  speakerId: string
  speakerName: string
  domain: string
  avatar: string
  color: string
  content: string
  fullContent: string
  done: boolean
}

export default function ExpertConsultationView() {
  const { message } = AntdApp.useApp()
  const [speeches, setSpeeches] = useState<Speech[]>([])
  const [currentIdx, setCurrentIdx] = useState(-1)
  const [isRunning, setIsRunning] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const typeTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const allSpeeches: Speech[] = [
    ...experts.map((e) => ({ speakerId: e.id, speakerName: e.name, domain: e.domain, avatar: e.avatar, color: e.color, content: '', fullContent: e.opinion, done: false })),
    { speakerId: 'assistant', speakerName: '王思睿', domain: '战略管理助理', avatar: 'WSR', color: '#7c3aed', content: '', fullContent: assistantSummary, done: false },
  ]

  const typeOne = useCallback((idx: number, speechesArr: Speech[]) => {
    const fullText = speechesArr[idx].fullContent
    let charIdx = 0
    typeTimer.current = setInterval(() => {
      charIdx += 3
      if (charIdx >= fullText.length) {
        charIdx = fullText.length
        setSpeeches((prev) => {
          const copy = [...prev]
          copy[idx] = { ...copy[idx], content: fullText, done: true }
          return copy
        })
        if (typeTimer.current) clearInterval(typeTimer.current)
        typeTimer.current = null
        if (idx + 1 < speechesArr.length) {
          setTimeout(() => {
            setCurrentIdx(idx + 1)
            setSpeeches((prev) => {
              const copy = [...prev]
              copy[idx + 1] = { ...copy[idx + 1] }
              return copy
            })
            typeOne(idx + 1, speechesArr)
          }, 800)
        } else {
          setIsRunning(false)
          setIsComplete(true)
        }
      } else {
        setSpeeches((prev) => {
          const copy = [...prev]
          copy[idx] = { ...copy[idx], content: fullText.slice(0, charIdx) }
          return copy
        })
      }
    }, 18)
  }, [])

  const startDiscussion = useCallback(() => {
    if (typeTimer.current) { clearInterval(typeTimer.current); typeTimer.current = null }
    const fresh = allSpeeches.map((s) => ({ ...s, content: '', done: false }))
    setSpeeches(fresh)
    setCurrentIdx(0)
    setIsRunning(true)
    setIsComplete(false)
    setTimeout(() => typeOne(0, fresh), 300)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeOne])

  const reset = () => {
    if (typeTimer.current) { clearInterval(typeTimer.current); typeTimer.current = null }
    setSpeeches([])
    setCurrentIdx(-1)
    setIsRunning(false)
    setIsComplete(false)
  }

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight }, [speeches])
  useEffect(() => () => { if (typeTimer.current) clearInterval(typeTimer.current) }, [])

  return (
    <div style={{ height: 'calc(100vh - 140px)', minHeight: 600, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Topic banner */}
      <div style={{ padding: '16px 24px', borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#818cf8)', color: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
        <SolutionOutlined style={{ fontSize: 24 }} />
        <div>
          <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 2 }}>研讨议题</div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{topic}</div>
        </div>
      </div>

      {/* Expert cards */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {[...experts, { id: 'assistant', name: '王思睿', domain: '战略管理助理', avatar: 'WSR', color: '#7c3aed' }].map((e) => {
          const isSpeaking = currentIdx >= 0 && speeches[currentIdx]?.speakerId === e.id
          return (
            <div key={e.id} style={{
              minWidth: 130, padding: '12px 14px', borderRadius: 10, background: '#fff', border: '2px solid ' + (isSpeaking ? e.color : '#f1f5f9'),
              transition: 'all 0.3s', textAlign: 'center',
              boxShadow: isSpeaking ? '0 0 16px ' + e.color + '60' : '0 2px 8px rgba(15,23,42,0.04)',
            }}>
              <Avatar size={40} style={{ background: e.color, color: '#fff', fontSize: 12, marginBottom: 6 }}>{e.avatar}</Avatar>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{e.name}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{e.domain}</div>
              {isSpeaking && <Tag color="processing" style={{ fontSize: 10, marginTop: 4 }}>发言中</Tag>}
            </div>
          )
        })}
      </div>

      {/* Discussion area */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '4px 8px' }}>
        {speeches.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#cbd5e1', marginTop: 60 }}>
            <SolutionOutlined style={{ fontSize: 40, marginBottom: 12 }} />
            <div style={{ fontSize: 14 }}>点击「开始讨论」启动多专家研讨</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>6位领域专家依次发言，战略管理助理汇总分析</div>
          </div>
        ) : (
          speeches.map((sp, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <Avatar size={40} style={{ background: sp.color, color: '#fff', fontSize: 12, flexShrink: 0, boxShadow: i === currentIdx ? '0 0 12px ' + sp.color + '80' : 'none' }}>{sp.avatar}</Avatar>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: sp.color }}>{sp.speakerName}</span>
                  <Tag style={{ fontSize: 10, margin: 0, color: sp.color, borderColor: sp.color + '40' }}>{sp.domain}</Tag>
                  {sp.speakerId === 'assistant' && <Tag color="purple" style={{ fontSize: 10, margin: 0 }}>汇总</Tag>}
                </div>
                <div style={{
                  padding: '12px 16px', borderRadius: '0 12px 12px 12px', background: sp.speakerId === 'assistant' ? '#faf5ff' : '#f8fafc',
                  border: '1px solid ' + (sp.speakerId === 'assistant' ? '#e9d5ff' : '#f1f5f9'),
                  fontSize: 13, lineHeight: 1.8, color: '#334155', whiteSpace: 'pre-wrap',
                }}>
                  {sp.content}
                  {i === currentIdx && !sp.done && <span style={{ display: 'inline-block', width: 2, height: 14, background: sp.color, marginLeft: 1, animation: 'blink 1s infinite', verticalAlign: 'middle' }} />}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Action bar */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', padding: '12px 0' }}>
        <Button type="primary" size="large" icon={<PlayCircleOutlined />} onClick={startDiscussion} disabled={isRunning}
          style={{ borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#818cf8)', border: 'none', minWidth: 120 }}>
          {isComplete ? '重新讨论' : '开始讨论'}
        </Button>
        <Button size="large" icon={<CheckSquareOutlined />} disabled={!isComplete} onClick={() => message.success('已生成督办任务，已跳转至智慧督办页面')}
          style={{ borderRadius: 10, minWidth: 120 }}>生成督办任务</Button>
        <Button size="large" icon={<FileTextOutlined />} disabled={!isComplete} onClick={() => message.success('讨论报告已导出')}
          style={{ borderRadius: 10, minWidth: 100 }}>导出报告</Button>
        <Button size="large" icon={<ShareAltOutlined />} disabled={!isComplete} onClick={() => message.success('已分享至团队')}
          style={{ borderRadius: 10, minWidth: 100 }}>分享团队</Button>
        <Button size="large" icon={<ReloadOutlined />} onClick={reset} style={{ borderRadius: 10 }}>重置</Button>
      </div>
      <style>{`@keyframes blink { 0%,50% { opacity: 1 } 51%,100% { opacity: 0 } }`}</style>
    </div>
  )
}