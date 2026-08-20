// 密码规则与登录配置的共享工具
// 纯前端演示项目：SSO 配置写入 localStorage，登录页与改密抽屉读取同一份配置
// 后台管理员在「系统配置 > SSO配置」维护密码正则规则，本文件将其转译为用户可读规则

const SSO_KEY = 'gip_sso_config'
const PWD_MAP_KEY = 'gip_pwd_map'

// 演示账号默认密码（符合默认规则）
export const DEFAULT_PASSWORD = 'Baic1234'

export const DEFAULT_PASSWORD_REGEX = '^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d!@#$%^&*]{8,20}$'

export interface SsoConfig {
  tokenExpiry: number          // 令牌有效期（秒）
  passwordRegex: string        // 密码规则（正则表达式）
  passwordExpiryMonths: number // 密码有效期（月）
}

export function readSsoConfig(): SsoConfig {
  try {
    const raw = localStorage.getItem(SSO_KEY)
    if (raw) {
      const cfg = JSON.parse(raw)
      return {
        tokenExpiry: Number(cfg.tokenExpiry) > 0 ? Number(cfg.tokenExpiry) : 7200,
        passwordRegex: cfg.passwordRegex || DEFAULT_PASSWORD_REGEX,
        passwordExpiryMonths: Number(cfg.passwordExpiryMonths) > 0 ? Number(cfg.passwordExpiryMonths) : 3,
      }
    }
  } catch { /* ignore */ }
  return { tokenExpiry: 7200, passwordRegex: DEFAULT_PASSWORD_REGEX, passwordExpiryMonths: 3 }
}

export function writeSsoConfig(cfg: SsoConfig) {
  try { localStorage.setItem(SSO_KEY, JSON.stringify(cfg)) } catch { /* ignore */ }
}

// 将正则字符串拆解为人类可读规则列表
export function regexToHints(regex: string): string[] {
  const hints: string[] = []
  if (!regex) return ['需符合后台配置的密码规则']
  const lenRange = regex.match(/\{(\d+),\s*(\d+)?\}/)
  if (lenRange) {
    const min = lenRange[1]
    const max = lenRange[2]
    if (max) hints.push(`长度 ${min}-${max} 位`)
    else hints.push(`至少 ${min} 位`)
  }
  const hasUpper = /\.\*\[A-Z\]/.test(regex)
  const hasLower = /\.\*\[a-z\]/.test(regex)
  const hasLetter = /\.\*\[A-Za-z\]/.test(regex)
  if (hasUpper) hints.push('需包含大写字母')
  if (hasLower) hints.push('需包含小写字母')
  if (hasLetter && !hasUpper && !hasLower) hints.push('需包含字母')
  if (/\.\*\\d/.test(regex)) hints.push('需包含数字')
  if (/\.\*\[!@#\$%\^&\*\]/.test(regex)) hints.push('需包含特殊字符')
  if (!hints.length) hints.push('需符合后台配置的密码规则')
  return hints
}

// 整体校验：新密码是否满足正则
export function validatePassword(pwd: string, regex: string): boolean {
  try { return new RegExp(regex).test(pwd) } catch { return true }
}

// 逐条实时校验：某条人话规则是否已被满足（用于改密抽屉实时勾选）
export function ruleSatisfied(hint: string, regex: string, pwd: string): boolean {
  if (!pwd) return false
  if (hint.startsWith('长度') || hint.startsWith('至少')) {
    const m = regex.match(/\{(\d+),\s*(\d+)?\}/)
    if (m) {
      const min = Number(m[1])
      const max = m[2] ? Number(m[2]) : Infinity
      return pwd.length >= min && pwd.length <= max
    }
  }
  if (hint.includes('大写字母')) return /[A-Z]/.test(pwd)
  if (hint.includes('小写字母')) return /[a-z]/.test(pwd)
  if (hint.includes('特殊字符')) return /[!@#$%^&*]/.test(pwd)
  if (hint.includes('数字')) return /\d/.test(pwd)
  if (hint.includes('字母')) return /[A-Za-z]/.test(pwd)
  return validatePassword(pwd, regex)
}

// 密码存取（按账号），默认密码为 DEFAULT_PASSWORD
export function getPassword(username: string): string {
  try {
    const raw = localStorage.getItem(PWD_MAP_KEY)
    if (raw) {
      const map = JSON.parse(raw)
      if (map[username]) return map[username]
    }
  } catch { /* ignore */ }
  return DEFAULT_PASSWORD
}

export function setPassword(username: string, pwd: string) {
  try {
    const raw = localStorage.getItem(PWD_MAP_KEY)
    const map = raw ? JSON.parse(raw) : {}
    map[username] = pwd
    localStorage.setItem(PWD_MAP_KEY, JSON.stringify(map))
  } catch { /* ignore */ }
}
