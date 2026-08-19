import { useState, useEffect, useRef, useCallback } from 'react'
import { Button, Tag, Progress, Avatar, Input } from 'antd'
import { PlusOutlined, ReloadOutlined, PauseCircleOutlined, PlayCircleOutlined, HistoryOutlined, LogoutOutlined, SendOutlined, ThunderboltOutlined } from '@ant-design/icons'

interface DigitalHuman { id: string; name: string; perspective: string; color: string; avatar: string }

const allHumans: DigitalHuman[] = [
  { id: 'h1', name: '张建勇', perspective: '生态协作', color: '#6366f1', avatar: '张' },
  { id: 'h2', name: '雷军', perspective: '用户真相', color: '#06b6d4', avatar: '雷' },
  { id: 'h3', name: '余承东', perspective: '技术突围', color: '#10b981', avatar: '余' },
  { id: 'h4', name: '马斯克', perspective: '创新颠覆', color: '#f59e0b', avatar: '马' },
  { id: 'h5', name: '王传福', perspective: '制造效率', color: '#ef4444', avatar: '王' },
  { id: 'h6', name: '李想', perspective: '产品定义', color: '#ec4899', avatar: '李' },
]

interface Speech { speakerId: string; speakerName: string; content: string; fullContent: string; done: boolean }
interface Round { title: string; subtitle: string; speeches: Speech[] }

const defaultTopic = '极狐品牌高端化转型：独立运营还是融合升级？'

const round1Content: Record<string, string> = {
  h1: '从生态协作角度看，极狐高端化不能脱离北汽集团整体生态。独立运营虽有助于品牌差异化，但若失去集团供应链和渠道协同支撑，成本将大幅上升。建议采取"品牌独立、生态共享"的中间路线——品牌形象独立运营，但研发、制造、供应链深度协同。',
  h2: '用户不关心你是什么架构，他们只关心产品好不好、体验棒不棒。极狐现在的问题不是独立不独立，而是产品力还不够打动人心。小米做汽车，第一性原理就是"和用户交朋友"。极狐高端化，应该先问用户：你愿意花40万买极狐的什么？把这个问题回答透了，架构问题自然有答案。',
  h3: '技术是高端化的底气。华为为什么能做高端？因为我们在芯片、操作系统、智能驾驶上有核心壁垒。极狐要高端化，必须加大800V高压平台、城市NOA、鸿蒙座舱的技术投入。没有技术领先，高端化就是空中楼阁。建议三年研发投入占比不低于营收12%。',
  h4: '第一性原理思考：汽车的本质是将人从A点高效送到B点的智能终端。高端化不是堆料，是重新定义出行体验。特斯拉为什么值钱？因为我们重新定义了汽车。极狐应该思考：在40-60万价位，你能给用户什么独一无二的价值？自动驾驶？能源效率？还是全新的交互方式？颠覆性创新才能支撑高端定价。',
  h5: '制造业不讲情怀，讲效率和成本控制。比亚迪为什么能赢？垂直整合、极致效率。极狐高端化最大的挑战不是品牌，是制造端的成本竞争力。40万的车，BOM成本必须控制在22万以内才有利润空间。建议深度垂直整合三电系统，自建核心零部件产能，把制造效率做到行业前三。',
  h6: '产品定义是高端化的灵魂。理想为什么能卖40万以上？因为我们对家庭用户的需求理解到极致。极狐要做高端，先想清楚目标用户是谁。如果是科技精英，产品就要强调智能和性能；如果是商务精英，就要强调空间和质感。产品定义对了，高端化就成功了一半。建议聚焦一个核心场景，做到极致。',
}

const round2Content: Record<string, string> = {
  h1: '回应李想的观点，产品定义确实关键，但生态协同同样不可忽视。雷总说用户不关心架构，但从运营效率看，架构决定成本结构。我补充一个数据：集团生态协同可降低15%的供应链成本，这对高端车型的利润率至关重要。王总提到的制造效率，正是生态协同的直接受益点。',
  h2: '余总说的技术投入我完全同意，但12%的研发占比对极狐现阶段压力太大。我更倾向"精准投入"——把有限资源压在最影响用户体验的3个技术点上。另外回应马总，颠覆性创新很好，但极狐现在的品牌力还撑不起完全颠覆。先做到"局部领先"比"全面颠覆"更务实。',
  h3: '王总说的BOM成本控制22万以内，在40万价位确实可行，但前提是规模化。我认同张总的生态协同降本，但技术自研同样能降本——比如自研芯片量大后成本远低于外采。关于李想说的场景聚焦，我补充：智能驾驶就是最好的高端化场景，极狐应该把城市NOA做成行业标杆。',
  h4: '各位说的都有道理，但我想强调一点：高端化不是做"更好的车"，而是做"不同的车"。王总的成本控制思路适合大众市场，但高端市场用户为独特性买单。我建议极狐在40-60万价位做一款真正智能化的"轮式机器人"，而非传统豪华车。这才是颠覆。',
  h5: '马斯克的想法太理想化了。没有制造基础，再好的概念也落不了地。我回应雷总：精准投入我同意，但三电系统是底线投入，不能省。张总说的15%供应链降本数据我认可，这也是我支持生态协同的原因。高端化要"仰望星空，脚踏实地"——颠覆性愿景+极致制造能力。',
  h6: '综合各位观点，我看到了一个共识：极狐高端化需要"技术+制造+产品定义"三位一体。余总的技术领先、王总的制造效率、马总的创新思维，加上我强调的用户场景，缺一不可。具体建议：先选一个细分场景（如智能豪华SUV），集中资源打透，验证模式后再扩展。',
}

const round3Content = '【战略管理助理 · 总结收敛】\n\n经过三轮深度推演，6位数字人专家形成了以下战略共识与行动建议：\n\n一、核心共识\n1. 高端化是极狐品牌生存与发展的必选项，窗口期2-3年\n2. 应采取"品牌独立、生态共享"的中间路线，而非完全独立\n3. 技术、制造、产品定义三位一体，缺一不可\n4. 需聚焦核心场景，避免全面铺开\n\n二、关键分歧\n1. 技术投入节奏：余承东主张12%高投入 vs 雷军主张精准投入\n2. 产品方向：马斯克主张"轮式机器人"颠覆 vs 王传福主张制造驱动的渐进式\n3. 目标用户：李想主张场景聚焦 vs 其他专家倾向宽覆盖\n\n三、优先级建议\nP0：确定核心场景（建议智能豪华SUV），完成产品定义\nP1：加大智能驾驶与800V平台技术投入，目标行业前三\nP2：深化集团生态协同，供应链降本15%\nP3：品牌独立运营筹备，渠道高端化升级\n\n四、行动项\n1. 8月成立高端化专项组，由战略、产品、研发联合驱动\n2. 9月完成核心场景用户调研与产品定义\n3. Q4启动S系列旗舰车型研发，目标2027年上市\n4. 3年研发投入80-100亿，第4年盈亏平衡\n\n结论：极狐高端化路径已清晰，建议立即启动专项推进。'

function buildRounds(humans: DigitalHuman[]): Round[] {
  return [
    { title: '第一轮 · 独立判断', subtitle: '每位数字人独立发表观点', speeches: humans.map((h) => ({ speakerId: h.id, speakerName: h.name, content: '', fullContent: round1Content[h.id] || '', done: false })) },
    { title: '第二轮 · 交叉应战', subtitle: '数字人之间互相回应观点', speeches: humans.map((h) => ({ speakerId: h.id, speakerName: h.name, content: '', fullContent: round2Content[h.id] || '', done: false })) },
    { title: '第三轮 · 总结收敛', subtitle: '战略管理助理汇总并给出结论', speeches: [{ speakerId: 'assistant', speakerName: '战略管理助理', content: '', fullContent: round3Content, done: false }] },
  ]
}

const historyRecords = [
  { topic: '新能源品牌是否独立运营', date: '2026-07-30', rounds: 3, status: '已完成' },
  { topic: 'Q4渠道策略调整方案', date: '2026-07-25', rounds: 2, status: '已完成' },
  { topic: '海外市场进入策略', date: '2026-07-20', rounds: 4, status: '已完成' },
]

export default function StrategyDeductionView() {
  const [selectedHumans, setSelectedHumans] = useState<DigitalHuman[]>(allHumans.slice(0, 4))
  const [topic, setTopic] = useState(defaultTopic)
  const [topicInput, setTopicInput] = useState(defaultTopic)
  const [rounds, setRounds] = useState<Round[]>(buildRounds(allHumans.slice(0, 4)))
  const [currentRound, setCurrentRound] = useState(-1)
  const [currentSpeech, setCurrentSpeech] = useState(-1)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const typeTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const resetState = useCallback(() => {
    if (typeTimer.current) { clearInterval(typeTimer.current); typeTimer.current = null }
    setRounds(buildRounds(selectedHumans))
    setCurrentRound(-1)
    setCurrentSpeech(-1)
    setIsRunning(false)
    setIsPaused(false)
  }, [selectedHumans])

  const typeSpeech = useCallback((roundIdx: number, speechIdx: number) => {
    setRounds((prev) => {
      const fullText = prev[roundIdx].speeches[speechIdx].fullContent
      let idx = 0
      typeTimer.current = setInterval(() => {
        idx += 3
        if (idx >= fullText.length) {
          idx = fullText.length
          setRounds((p) => {
            const copy = p.map((r) => ({ ...r, speeches: r.speeches.map((s) => ({ ...s })) }))
            copy[roundIdx].speeches[speechIdx].content = fullText
            copy[roundIdx].speeches[speechIdx].done = true
            return copy
          })
          if (typeTimer.current) clearInterval(typeTimer.current)
          typeTimer.current = null
          setTimeout(() => advanceRef.current(roundIdx, speechIdx), 500)
        } else {
          setRounds((p) => {
            const copy = p.map((r) => ({ ...r, speeches: r.speeches.map((s) => ({ ...s })) }))
            copy[roundIdx].speeches[speechIdx].content = fullText.slice(0, idx)
            return copy
          })
        }
      }, 18)
      return prev
    })
  }, [])

  const advanceRef = useRef<(ri: number, si: number) => void>(() => {})
  advanceRef.current = (roundIdx: number, speechIdx: number) => {
    setRounds((prevRounds) => {
      const nextSpeech = speechIdx + 1
      if (nextSpeech < prevRounds[roundIdx].speeches.length) {
        setCurrentSpeech(nextSpeech)
        setTimeout(() => typeSpeech(roundIdx, nextSpeech), 100)
      } else {
        const nextRound = roundIdx + 1
        if (nextRound < prevRounds.length) {
          setCurrentRound(nextRound)
          setCurrentSpeech(0)
          setTimeout(() => typeSpeech(nextRound, 0), 500)
        } else {
          setIsRunning(false)
          setCurrentRound(-1)
          setCurrentSpeech(-1)
        }
      }
      return prevRounds
    })
  }

  const startDeduction = useCallback(() => {
    if (typeTimer.current) { clearInterval(typeTimer.current); typeTimer.current = null }
    const newRounds = buildRounds(selectedHumans)
    setRounds(newRounds)
    setCurrentRound(0)
    setCurrentSpeech(0)
    setIsRunning(true)
    setIsPaused(false)
    const fullText = newRounds[0].speeches[0].fullContent
    let idx = 0
    setTimeout(() => {
      typeTimer.current = setInterval(() => {
        idx += 3
        if (idx >= fullText.length) {
          idx = fullText.length
          setRounds((prev) => {
            const copy = prev.map((r) => ({ ...r, speeches: r.speeches.map((s) => ({ ...s })) }))
            copy[0].speeches[0].content = fullText
            copy[0].speeches[0].done = true
            return copy
          })
          if (typeTimer.current) clearInterval(typeTimer.current)
          typeTimer.current = null
          setTimeout(() => advanceRef.current(0, 0), 500)
        } else {
          setRounds((prev) => {
            const copy = prev.map((r) => ({ ...r, speeches: r.speeches.map((s) => ({ ...s })) }))
            copy[0].speeches[0].content = fullText.slice(0, idx)
            return copy
          })
        }
      }, 18)
    }, 300)
  }, [selectedHumans])

  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false)
      if (currentRound >= 0 && currentSpeech >= 0) {
        const speech = rounds[currentRound].speeches[currentSpeech]
        if (!speech.done) {
          const startIdx = speech.content.length
          const fullText = speech.fullContent
          let idx = startIdx
          typeTimer.current = setInterval(() => {
            idx += 3
            if (idx >= fullText.length) {
              idx = fullText.length
              setRounds((prev) => {
                const copy = prev.map((r) => ({ ...r, speeches: r.speeches.map((s) => ({ ...s })) }))
                copy[currentRound].speeches[currentSpeech].content = fullText
                copy[currentRound].speeches[currentSpeech].done = true
                return copy
              })
              if (typeTimer.current) clearInterval(typeTimer.current)
              typeTimer.current = null
              setTimeout(() => advanceRef.current(currentRound, currentSpeech), 500)
            } else {
              setRounds((prev) => {
                const copy = prev.map((r) => ({ ...r, speeches: r.speeches.map((s) => ({ ...s })) }))
                copy[currentRound].speeches[currentSpeech].content = fullText.slice(0, idx)
                return copy
              })
            }
          }, 18)
        }
      }
    } else {
      setIsPaused(true)
      if (typeTimer.current) { clearInterval(typeTimer.current); typeTimer.current = null }
    }
  }

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight }, [rounds])
  useEffect(() => () => { if (typeTimer.current) clearInterval(typeTimer.current) }, [])

  const toggleHuman = (h: DigitalHuman) => {
    setSelectedHumans((prev) => {
      const exists = prev.find((p) => p.id === h.id)
      if (exists) return prev.filter((p) => p.id !== h.id)
      if (prev.length >= 6) return prev
      return [...prev, h]
    })
  }

  const randomAssign = () => {
    const shuffled = [...allHumans].sort(() => Math.random() - 0.5)
    setSelectedHumans(shuffled.slice(0, Math.min(4 + Math.floor(Math.random() * 3), 6)))
  }

  const progress = currentRound >= 0 ? Math.round(((currentRound + (currentSpeech >= 0 ? (rounds[currentRound]?.speeches[currentSpeech]?.done ? 1 : 0.5) : 0)) / 3) * 100) : 0
  const getHuman = (id: string) => allHumans.find((h) => h.id === id)

  return (
    <div style={{ display: 'flex', gap: 0, height: 'calc(100vh - 140px)', minHeight: 600 }}>
      <div style={{ width: 300, flexShrink: 0, background: '#fff', borderRadius: '12px 0 0 12px', borderRight: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>数字人管理</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>已选 {selectedHumans.length}/6 位</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
          {allHumans.map((h) => {
            const selected = !!selectedHumans.find((p) => p.id === h.id)
            return (
              <div key={h.id} onClick={() => toggleHuman(h)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, marginBottom: 4, cursor: 'pointer', background: selected ? h.color + '10' : 'transparent', border: '1px solid ' + (selected ? h.color + '40' : 'transparent'), transition: 'all 0.2s' }}>
                <Avatar size={32} style={{ background: selected ? h.color : '#e2e8f0', color: selected ? '#fff' : '#94a3b8', fontSize: 13 }}>{h.avatar}</Avatar>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: selected ? '#1e293b' : '#94a3b8' }}>{h.name}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{h.perspective}</div>
                </div>
                {selected && <Tag color="success" style={{ fontSize: 10, margin: 0 }}>已选</Tag>}
              </div>
            )
          })}
        </div>
        <div style={{ padding: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Button size="small" icon={<PlusOutlined />} onClick={randomAssign} block>随机分配</Button>
          <Button size="small" icon={<HistoryOutlined />} onClick={() => setShowHistory(!showHistory)} block>历史记录</Button>
          <Button size="small" danger icon={<LogoutOutlined />} onClick={resetState} block>退出讨论</Button>
        </div>
      </div>
      {showHistory && (
        <div style={{ width: 240, flexShrink: 0, background: '#f8fafc', borderRight: '1px solid #f1f5f9', padding: 12, overflowY: 'auto' }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>讨论历史</div>
          {historyRecords.map((r, i) => (
            <div key={i} style={{ padding: 10, background: '#fff', borderRadius: 8, marginBottom: 8, cursor: 'pointer' }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{r.topic}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{r.date} · {r.rounds}轮</div>
              <Tag color="success" style={{ fontSize: 10, marginTop: 4 }}>{r.status}</Tag>
            </div>
          ))}
        </div>
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: '0 12px 12px 0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{topic}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {!isRunning ? (
                <Button type="primary" icon={<ThunderboltOutlined />} onClick={startDeduction} disabled={selectedHumans.length < 2}>开始推演</Button>
              ) : (
                <Button icon={isPaused ? <PlayCircleOutlined /> : <PauseCircleOutlined />} onClick={togglePause}>{isPaused ? '继续' : '暂停'}</Button>
              )}
              <Button icon={<ReloadOutlined />} onClick={resetState}>重新推演</Button>
            </div>
          </div>
          {isRunning && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Progress percent={progress} size="small" style={{ flex: 1 }} />
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{currentRound >= 0 ? rounds[currentRound].title : '准备中...'}</span>
            </div>
          )}
        </div>
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {rounds.map((round, ri) => {
            const isActiveRound = ri === currentRound
            const isPastRound = ri < currentRound
            if (!isPastRound && !isActiveRound && !(round.speeches.some((s) => s.content))) return null
            return (
              <div key={ri} style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 4, height: 16, background: isActiveRound ? '#6366f1' : '#cbd5e1', borderRadius: 2 }} />
                  <span style={{ fontSize: 15, fontWeight: 700, color: isActiveRound ? '#6366f1' : '#64748b' }}>{round.title}</span>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>{round.subtitle}</span>
                </div>
                {round.speeches.map((sp, si) => {
                  const human = getHuman(sp.speakerId)
                  const isActive = isActiveRound && si === currentSpeech
                  const color = sp.speakerId === 'assistant' ? '#7c3aed' : (human?.color || '#6366f1')
                  return (
                    <div key={si} style={{ display: 'flex', gap: 10, marginBottom: 12, opacity: isActive || sp.done ? 1 : (isPastRound ? 1 : 0.4) }}>
                      <Avatar size={36} style={{ background: color, color: '#fff', flexShrink: 0, boxShadow: isActive ? '0 0 12px ' + color + '80' : 'none' }}>{sp.speakerId === 'assistant' ? '助' : human?.avatar}</Avatar>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color }}>{sp.speakerName}</span>
                          {sp.speakerId !== 'assistant' && human && <Tag style={{ fontSize: 10, margin: 0 }}>{human.perspective}</Tag>}
                          {isActive && <Tag color="processing" style={{ fontSize: 10, margin: 0 }}>发言中</Tag>}
                        </div>
                        <div style={{ fontSize: 13, lineHeight: 1.8, color: '#334155', whiteSpace: 'pre-wrap' }}>
                          {sp.content}
                          {isActive && !sp.done && <span style={{ display: 'inline-block', width: 2, height: 14, background: color, marginLeft: 1, animation: 'blink 1s infinite', verticalAlign: 'middle' }} />}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
          {!isRunning && currentRound === -1 && !rounds[0].speeches[0].content && (
            <div style={{ textAlign: 'center', color: '#cbd5e1', marginTop: 60 }}>
              <ThunderboltOutlined style={{ fontSize: 40, marginBottom: 12 }} />
              <div style={{ fontSize: 14 }}>点击「开始推演」启动多Agent圆桌讨论</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>三轮推演：独立判断 → 交叉应战 → 总结收敛</div>
            </div>
          )}
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 8 }}>
          <Input value={topicInput} onChange={(e) => setTopicInput(e.target.value)} placeholder="修改讨论议题..." onPressEnter={() => { setTopic(topicInput); resetState() }} style={{ borderRadius: 8 }} />
          <Button icon={<SendOutlined />} onClick={() => { setTopic(topicInput); resetState() }}>设定议题</Button>
        </div>
      </div>
      <style>{`@keyframes blink { 0%,50% { opacity: 1 } 51%,100% { opacity: 0 } }`}</style>
    </div>
  )
}