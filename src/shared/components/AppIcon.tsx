import IconByName from './IconByName'

// 应用图标：带品牌色背景的圆角方块
export function AppIcon({ icon, bg, size = 40 }: { icon: string; bg: string; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 10,
        background: bg,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.5,
        flexShrink: 0,
      }}
    >
      <IconByName name={icon} />
    </div>
  )
}