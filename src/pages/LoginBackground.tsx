import { useEffect, useRef } from 'react'

/**
 * BAIC unified-login ambient background.
 * Layers: deep navy gradient + ambient cyan glow + perspective tech-grid road
 * + animated neural-network canvas (AI) + glowing car silhouette (automotive)
 * + drifting data motes + subtle light sweep + vignette + grain.
 * Motion is ambient only and honours prefers-reduced-motion.
 */
export default function LoginBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = 0
    let height = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)

    type NetNode = { x: number; y: number; vx: number; vy: number; r: number; phase: number }
    type Mote = { x: number; y: number; vy: number; r: number; a: number }
    let nodes: NetNode[] = []
    let motes: Mote[] = []

    const buildNodes = () => {
      const count = Math.max(26, Math.min(52, Math.round((width * height) / 28000)))
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        r: 1.1 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
      }))
    }
    const buildMotes = () => {
      motes = Array.from({ length: 28 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vy: -(0.1 + Math.random() * 0.26),
        r: 0.6 + Math.random() * 1.1,
        a: 0.12 + Math.random() * 0.3,
      }))
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      buildNodes()
      buildMotes()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    let raf = 0
    let t = 0
    const maxDist = 150

    const draw = () => {
      t += 1
      ctx.clearRect(0, 0, width, height)

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]
          const b = nodes[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d2 = dx * dx + dy * dy
          if (d2 < maxDist * maxDist) {
            const d = Math.sqrt(d2)
            const alpha = (1 - d / maxDist) * 0.2
            ctx.strokeStyle = 'rgba(56,189,248,' + alpha.toFixed(3) + ')'
            ctx.lineWidth = 0.6
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      for (const n of nodes) {
        if (!reduce) {
          n.x += n.vx
          n.y += n.vy
          if (n.x < 0 || n.x > width) n.vx *= -1
          if (n.y < 0 || n.y > height) n.vy *= -1
        }
        const pulse = reduce ? 0.6 : 0.42 + 0.34 * Math.sin(t * 0.02 + n.phase)
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(125,211,252,' + pulse.toFixed(3) + ')'
        ctx.shadowColor = 'rgba(56,189,248,0.55)'
        ctx.shadowBlur = 6
        ctx.fill()
        ctx.shadowBlur = 0
      }

      for (const m of motes) {
        if (!reduce) {
          m.y += m.vy
          if (m.y < -4) {
            m.y = height + 4
            m.x = Math.random() * width
          }
        }
        ctx.beginPath()
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(186,230,253,' + m.a.toFixed(3) + ')'
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }

    if (reduce) {
      draw()
      cancelAnimationFrame(raf)
    } else {
      raf = requestAnimationFrame(draw)
    }

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  const spokes = (cx: number, cy: number) => {
    return [0, 1, 2, 3, 4].map((i) => {
      const a = (i / 5) * Math.PI * 2
      return (
        <line
          key={'sp' + cx + i}
          x1={cx + Math.cos(a) * 4}
          y1={cy + Math.sin(a) * 4}
          x2={cx + Math.cos(a) * 14}
          y2={cy + Math.sin(a) * 14}
          stroke="rgba(186,230,253,0.28)"
          strokeWidth="1"
        />
      )
    })
  }

  return (
    <div className="lbg-root" aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <style>{`
        @keyframes lbgFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes lbgSweep { 0% { transform: translateX(-35%) } 58% { transform: translateX(135%) } 100% { transform: translateX(135%) } }
        .lbg-root { animation: lbgFade 1.2s ease-out both; }
        .lbg-sweep { animation: lbgSweep 12s cubic-bezier(0.4,0,0.2,1) infinite; will-change: transform; }
        @media (prefers-reduced-motion: reduce) { .lbg-root { animation: none } .lbg-sweep { animation: none } }
      `}</style>

      {/* deep navy base */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(125% 120% at 80% 112%, #0c2640 0%, #081428 48%, #050a18 100%)' }} />

      {/* ambient cyan/blue glow */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(58% 58% at 78% 90%, rgba(34,211,238,0.16) 0%, transparent 60%), radial-gradient(52% 52% at 16% 18%, rgba(59,130,246,0.13) 0%, transparent 62%)' }} />

      {/* perspective tech grid / road */}
      <svg width="100%" height="100%" preserveAspectRatio="xMidYMax slice" style={{ position: 'absolute', inset: 0, opacity: 0.55 }}>
        <defs>
          <linearGradient id="lbg-grid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(56,189,248,0)" />
            <stop offset="55%" stopColor="rgba(56,189,248,0.10)" />
            <stop offset="100%" stopColor="rgba(56,189,248,0.02)" />
          </linearGradient>
        </defs>
        {Array.from({ length: 13 }).map((_, i) => {
          const k = (i - 6) / 6
          const x2 = 50 + k * 52
          return <line key={'v' + i} x1="50%" y1="60%" x2={`${x2}%`} y2="100%" stroke="url(#lbg-grid)" strokeWidth="1" />
        })}
        {Array.from({ length: 9 }).map((_, i) => {
          const y = 60 + (i * i) * 1.05
          return <line key={'h' + i} x1="0%" y1={`${y}%`} x2="100%" y2={`${y}%`} stroke="url(#lbg-grid)" strokeWidth="1" />
        })}
      </svg>

      {/* neural network (AI) */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

      {/* car silhouette (automotive) */}
      <svg viewBox="0 0 520 210" width="64%" style={{ position: 'absolute', right: '-4%', bottom: '13%', filter: 'drop-shadow(0 18px 40px rgba(8,20,40,0.6))' }} aria-hidden>
        <defs>
          <linearGradient id="lbg-car" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
          <radialGradient id="lbg-carglow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="rgba(34,211,238,0.22)" />
            <stop offset="100%" stopColor="rgba(34,211,238,0)" />
          </radialGradient>
        </defs>
        <ellipse cx="260" cy="178" rx="208" ry="15" fill="url(#lbg-carglow)" />
        <path d="M 95,150 C 95,140 97,128 102,121 C 130,116 175,114 250,110 C 268,90 296,84 330,83 C 362,83 380,90 400,104 C 432,108 472,110 500,118 C 502,124 502,138 500,150 Z" fill="rgba(56,189,248,0.06)" stroke="url(#lbg-car)" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M 120,132 C 200,126 300,124 470,128" stroke="rgba(125,211,252,0.32)" strokeWidth="1" fill="none" />
        <path d="M 268,96 C 286,86 304,82 330,82 C 356,82 370,88 384,98 C 350,96 300,96 268,96 Z" fill="rgba(125,211,252,0.10)" stroke="rgba(186,230,253,0.4)" strokeWidth="1" />
        <circle cx="492" cy="116" r="3.2" fill="#e0f2fe" />
        <rect x="96" y="120" width="6" height="6" rx="2" fill="#67e8f9" opacity="0.8" />
        <circle cx="150" cy="150" r="29" fill="rgba(2,10,20,0.5)" stroke="url(#lbg-car)" strokeWidth="2" />
        <circle cx="150" cy="150" r="15" fill="none" stroke="rgba(186,230,253,0.5)" strokeWidth="1.4" />
        <circle cx="150" cy="150" r="4" fill="rgba(186,230,253,0.7)" />
        {spokes(150, 150)}
        <circle cx="395" cy="150" r="29" fill="rgba(2,10,20,0.5)" stroke="url(#lbg-car)" strokeWidth="2" />
        <circle cx="395" cy="150" r="15" fill="none" stroke="rgba(186,230,253,0.5)" strokeWidth="1.4" />
        <circle cx="395" cy="150" r="4" fill="rgba(186,230,253,0.7)" />
        {spokes(395, 150)}
        <g stroke="url(#lbg-car)" strokeWidth="1" opacity="0.5">
          <line x1="20" y1="110" x2="80" y2="110" strokeDasharray="2 10" />
          <line x1="0" y1="130" x2="70" y2="130" strokeDasharray="2 12" />
          <line x1="30" y1="150" x2="90" y2="150" strokeDasharray="2 14" />
        </g>
      </svg>

      {/* light sweep */}
      <div className="lbg-sweep" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, transparent 38%, rgba(125,211,252,0.09) 50%, transparent 62%)' }} />

      {/* vignette */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 90% at 50% 38%, transparent 42%, rgba(2,6,16,0.55) 100%)' }} />

      {/* fine grain */}
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.04, mixBlendMode: 'overlay' }} aria-hidden>
        <filter id="lbg-noise"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" /></filter>
        <rect width="100%" height="100%" filter="url(#lbg-noise)" />
      </svg>
    </div>
  )
}